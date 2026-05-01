const express = require('express');
const router = express.Router();
const Config = require('../models/Config');

// Rota para salvar ou atualizar (AGORA PROTEGIDA 🔒)
router.post('/atualizar', async (req, res) => {
    try {
        // Recebemos a 'senha' vinda do corpo da requisição (req.body)
        const { chave, valor, senha } = req.body;

        // VALIDAÇÃO: Compara a senha enviada com a definida no seu ficheiro .env
        if (!senha || senha !== process.env.ADMIN_PASSWORD) {
            console.log(`⚠️ Alerta: Tentativa de alteração não autorizada na chave [${chave}]`);
            return res.status(401).json({ erro: "Acesso negado: Chave de segurança inválida!" });
        }

        // Se a senha estiver correta, o código abaixo é executado normalmente
        const config = await Config.findOneAndUpdate(
            { chave }, 
            { valor, ultimaAtualizacao: Date.now() }, 
            { upsert: true, new: true }
        );

        res.status(200).json({ mensagem: "Informação atualizada com sucesso!", config });
    } catch (err) {
        res.status(400).json({ erro: err.message });
    }
});

// Rota para buscar (Continua pública para o site poder exibir os dados)
router.get('/:chave', async (req, res) => {
    try {
        const config = await Config.findOne({ chave: req.params.chave });
        res.json(config);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

module.exports = router;