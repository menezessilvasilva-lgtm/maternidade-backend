// 1. INICIALIZAR ANIMAÇÕES (AOS)
AOS.init({
    duration: 1000,
    once: true
});

// 2. EFEITO NA NAVBAR (SCROLL)
function toggleMenu() {
    const menu = document.getElementById("menuList");
    menu.classList.toggle("active");
}

// Fecha o menu ao clicar em qualquer link lá dentro
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById("menuList").classList.remove("active");
    });
});

// 3. CONTADORES DE ESTATÍSTICAS
const counters = document.querySelectorAll('.stat-number');
counters.forEach(counter => {
    const updateCount = () => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const speed = 200;
        const inc = target / speed;

        if (count < target) {
            counter.innerText = Math.ceil(count + inc);
            setTimeout(updateCount, 1);
        } else {
            counter.innerText = target.toLocaleString();
        }
    };
    updateCount();
});






// Dentro da função carregarFuncionario no index.html
if (elFoto) {
    // Se existir foto no banco, usa ela. Se não, usa a padrão.
    elFoto.src = func.foto || 'assets/default-avatar.jpg';
}






async function carregarHeroSlides() {
    const slides = [
        { id: 'slide-div-1', chave: 'hero_slide_1' },
        { id: 'slide-div-2', chave: 'hero_slide_2' },
        { id: 'slide-div-3', chave: 'hero_slide_3' }
    ];

    for (const slide of slides) {
        try {
            const res = await fetch(`/api/config/${slide.chave}`);
            const dados = await res.json();

            if (res.ok && dados.valor) {
                document.getElementById(slide.id).style.backgroundImage = `url('${dados.valor}')`;
            } else {
                // Fallback: se não houver no banco, usa uma imagem padrão
                document.getElementById(slide.id).style.backgroundImage = "url('assets/MAT.jpg')";
            }
        } catch (err) {
            console.error("Erro ao carregar slide:", slide.chave);
        }
    }
}

// Executa assim que o site abrir
document.addEventListener('DOMContentLoaded', carregarHeroSlides);

