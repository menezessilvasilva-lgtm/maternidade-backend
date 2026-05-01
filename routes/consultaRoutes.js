const Consulta = require('../models/Consulta');

// Rota para o botão "Agendar Consulta Agora"
router.post('/agendar', async (req, res) => {
    try {
        const novaConsulta = new Consulta(req.body);
        await novaConsulta.save();
        res.status(201).json({ 
            mensagem: "Agendamento solicitado com sucesso! Aguarde a confirmação da Maternidade." 
        });
    } catch (err) {
        res.status(400).json({ erro: err.message });
    }
});