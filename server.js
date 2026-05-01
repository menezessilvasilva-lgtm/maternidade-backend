const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Importe o módulo nativo path lá no topo
require('dotenv').config();

const app = express();

// 1. MIDDLEWARES
app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

// 2. CONEXÃO COM O BANCO DE DADOS
mongoose.connect(process.env.MONGO_URI, {
    family: 4
})
.then(() => console.log("✅ SUCESSO: Conectado à base de dados da Maternidade!"))
.catch(err => console.log("❌ Erro técnico de conexão:", err.message));

// 3. LIGAÇÃO DAS ROTAS
const pacienteRoutes = require('./routes/pacienteRoutes');
const configRoutes = require('./routes/configRoutes'); 

app.use('/api/pacientes', pacienteRoutes);
app.use('/api/config', configRoutes); 

// 4. ROTA DE TESTE
app.get('*', (req, res, next) => {
    // Se a requisição for para a API, continua para as rotas abaixo
    if (req.url.startsWith('/api')) return next();
    
    // Caso contrário, entrega o index.html da pasta public
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 5. INICIALIZAÇÃO DO SERVIDOR
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 SERVIDOR: MATERNIDADE TERESA JAMBA`);
    console.log(`   Local: http://localhost:${PORT}`);
    console.log(`====================================================`);
});

// ATENÇÃO: NÃO ADICIONE MAIS NADA ABAIXO DESTA LINHA



