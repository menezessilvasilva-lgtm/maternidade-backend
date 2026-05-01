// Variável global para manter os dados carregados
let pacientesAtuais = [];

// 1. FUNÇÃO PRINCIPAL: CARREGAR DADOS DO MONGODB
async function carregarPacientes() {
    const corpo = document.getElementById('tabelaPacientes');
    // Ajustado para 9 colunas para não desalinharem as bordas
    corpo.innerHTML = "<tr><td colspan='9' style='text-align:center;'>A sincronizar dados da Maternidade...</td></tr>";

    try {
        const res = await fetch('/api/pacientes/lista');
        const pacientesServidor = await res.json();

        localStorage.removeItem('agendamentos');
        
        // Guardamos na variável global para podermos filtrar depois sem ir ao servidor
        pacientesAtuais = pacientesServidor;
        
        // Resetar o seletor de filtro para "todos" ao carregar novos dados
        if(document.getElementById('filtroEspecialidade')) {
            document.getElementById('filtroEspecialidade').value = "todos";
        }

        renderizarTabela(pacientesAtuais);
        
    } catch (err) {
        console.error("Erro ao carregar:", err);
        corpo.innerHTML = "<tr><td colspan='9' style='text-align:center; color:red;'>Erro de ligação ao servidor.</td></tr>";
    }
}

// 2. FUNÇÃO PARA DESENHAR A TABELA (Com as novas colunas)
function renderizarTabela(lista) {
    const corpo = document.getElementById('tabelaPacientes');
    corpo.innerHTML = "";

    // Ajustamos para 9 colunas (ORD + BI + Nome + Data + Hora + Estado + Especialidade + Telefone + Acções)
    if (lista.length === 0) {
        corpo.innerHTML = "<tr><td colspan='9' style='text-align:center;'>Nenhum agendamento registado no sistema.</td></tr>";
        return;
    }

    lista.forEach((p, index) => {
        const tr = document.createElement('tr');
        
        // Lógica de Cores para o Estado (Status)
        let corStatus = "#f39c12"; // Pendente (Laranja)
        if (p.status === 'Confirmado') corStatus = "#27ae60"; // Verde
        if (p.status === 'Cancelado') corStatus = "#e74c3c"; // Vermelho
        if (p.status === 'Concluído') corStatus = "#2980b9"; // Azul

        const dataC = p.dataDesejada || p.dataConsulta || "---";
        const horaC = p.horaConsulta || "A definir";

        tr.innerHTML = `
            <td style="font-weight: bold; color: #2c3e50;">#${p.numeroOrdem || '--'}</td>
            <td>${p.bi || "---"}</td>
            <td><b>${p.nome || "---"}</b></td>
            <td style="color:#2980b9; font-weight:bold;">${dataC}</td>
            <td><strong><i class="far fa-clock"></i> ${horaC}</strong></td>
            <td>
                <span style="background:${corStatus}; color:white; padding:4px 10px; border-radius:12px; font-size:0.85em; font-weight:bold;">
                    ${p.status || 'Pendente'}
                </span>
            </td>
            <td>${p.especialidade || "---"}</td>
            <td>${p.telefone || "---"}</td>
            <td class="acoes-col">
                <div class="acoes-grid">
                    <button class="btn-acao edit" onclick="abrirEdicao(${index})" title="Gerir Agendamento">
                        <i class="fas fa-user-check"></i>
                    </button>
                    <button class="btn-acao delete" onclick="eliminarAgendamento(${index}, '${p.nome}')" title="Apagar">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-ficha" onclick="imprimirFicha('${p.nome}', '${p.especialidade}', '${dataC}', '${p.bi}', '${horaC}')">
                        Ficha
                    </button>
                </div>
            </td>
        `;
        corpo.appendChild(tr);
    });
}

// 3. ABRIR MODAL DE GESTÃO
function abrirEdicao(index) {
    const p = pacientesAtuais[index];
    if (p) {
        document.getElementById('editId').value = index;
        document.getElementById('editNome').value = p.nome;
        
        // --- AJUSTE DA DATA ---
        let dataValor = p.dataDesejada || p.dataConsulta || "";
        
        // Se a data vier do MongoDB como ISO (Ex: 2026-04-18T...), limpamos para caber no input
        if (dataValor.includes('T')) {
            dataValor = dataValor.split('T')[0];
        }
        
        document.getElementById('editData').value = dataValor;
        // ----------------------

        document.getElementById('editHora').value = p.horaConsulta || "";
        document.getElementById('editEspecialidade').value = p.especialidade;
        document.getElementById('editStatus').value = p.status || "Pendente";

        document.getElementById('modalEdicao').style.display = 'flex';
    }
}

// 4. SALVAR ALTERAÇÕES (Sincroniza com o MongoDB)
document.getElementById('formEdicao').onsubmit = async function(e) {
    e.preventDefault();
    
    const index = document.getElementById('editId').value;
    const pacienteOriginal = pacientesAtuais[index];

    // CAPTURA DOS DADOS
    const dadosAtualizados = {
        nome: document.getElementById('editNome').value,
        especialidade: document.getElementById('editEspecialidade').value,
        
        // CORREÇÃO AQUI: Enviamos para os dois campos possíveis. 
        // Isso garante que o MongoDB encontre a propriedade certa para atualizar.
        dataConsulta: document.getElementById('editData').value,
        dataDesejada: document.getElementById('editData').value, 
        
        horaConsulta: document.getElementById('editHora').value,
        status: document.getElementById('editStatus').value
    };

    console.log("Tentando reagendar para:", dadosAtualizados.dataDesejada);

    try {
        const resposta = await fetch(`/api/pacientes/editar/${pacienteOriginal.bi}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosAtualizados)
        });

        if (resposta.ok) {
            fecharModal();
            
            // Importante: Aguardamos o recarregamento dos dados fresquinhos do MongoDB
            await carregarPacientes(); 
            
            alert("✅ Agendamento de " + dadosAtualizados.nome + " atualizado com sucesso!");
        } else {
            const erroDetalhado = await resposta.json();
            console.error("Erro do servidor:", erroDetalhado);
            alert("⚠️ Erro ao atualizar: " + (erroDetalhado.mensagem || "O servidor recusou a alteração."));
        }
    } catch (erro) {
        console.error("Erro de rede:", erro);
        alert("🔌 Erro de Conexão: O servidor Node.js está ligado?");
    }
};

function fecharModal() {
    document.getElementById('modalEdicao').style.display = 'none';
}

// 5. ELIMINAR AGENDAMENTO
async function eliminarAgendamento(index, nome) {
    if (confirm(`Eliminar permanentemente o agendamento de ${nome}?`)) {
        const p = pacientesAtuais[index];
        try {
            const res = await fetch(`/api/pacientes/eliminar/${p.bi}`, { method: 'DELETE' });
            if (res.ok) {
                await carregarPacientes();
                alert("Eliminado com sucesso.");
            }
        } catch (err) {
            alert("Erro ao eliminar.");
        }
    }
}

// 6. IMPRIMIR FICHA ATUALIZADA
function imprimirFicha(nome, esp, data, bi, hora) {
    var win = window.open('', '', 'width=800,height=800');
    var conteudo = `
        <html><body style="font-family:sans-serif;padding:40px;">
            <div style="border:2px solid #2c3e50;padding:20px;border-radius:10px;">
                <h2 style="text-align:center;">MATERNIDADE TERESA JAMBA</h2>
                <h3 style="text-align:center; color:#2980b9;">Ficha de Confirmação de Consulta</h3>
                <hr>
                <p><b>PACIENTE:</b> ${nome}</p>
                <p><b>BI:</b> ${bi}</p>
                <p><b>DATA:</b> ${data} | <b>HORA:</b> ${hora}</p>
                <p><b>ESPECIALIDADE:</b> ${esp}</p>
                <br><br>
                <p style="text-align:center;">________________________________<br>Carimbo e Assinatura</p>
            </div>
        </body></html>`;
    win.document.write(conteudo);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 500);
}

// Inicialização
window.onload = carregarPacientes;






function filtrarPacientes() {
    const termo = document.getElementById('filtroEspecialidade').value;
    
    // Se selecionou "todos", mostramos a lista original completa
    if (termo === "todos") {
        renderizarTabela(pacientesAtuais);
        document.getElementById('contadorFiltrados').innerText = "";
        return;
    }

    // Filtramos os pacientes cujo campo 'especialidade' coincide com o selecionado
    const listaFiltrada = pacientesAtuais.filter(p => p.especialidade === termo);
    
    // Atualizamos a tabela com apenas os resultados filtrados
    renderizarTabela(listaFiltrada);
    
    // Mostramos quantas pacientes foram encontradas
    document.getElementById('contadorFiltrados').innerText = 
        `${listaFiltrada.length} paciente(s) em ${termo}`;
}