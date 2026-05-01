const express = require('express');
const router = express.Router();
const Paciente = require('../models/Paciente');

// 1. ROTA PARA LISTAR TODOS OS PACIENTES (Faltava esta!)
router.get('/lista', async (req, res) => {
    try {
        // Buscamos todos e ordenamos pela data de criação (mais recentes primeiro)
        const pacientes = await Paciente.find().sort({ createdAt: -1 });
        res.json(pacientes);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// 2. ROTA PARA BUSCAR UM PACIENTE PELO BI (Para consulta no site)
router.get('/consultar/:bi', async (req, res) => {
    try {
        // O .sort({ createdAt: -1 }) faz com que o sistema pegue o último agendamento feito
        const paciente = await Paciente.findOne({ bi: req.params.bi }).sort({ createdAt: -1 });
        
        if (!paciente) {
            return res.status(404).json({ mensagem: "Agendamento não encontrado para este B.I." });
        }
        res.json(paciente);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// 3. ROTA PARA CADASTRAR PACIENTE (POST)
router.post('/cadastrar', async (req, res) => {
    try {
        const { especialidade, dataDesejada } = req.body;

        // 1. Procuramos quantos pacientes já existem para a MESMA especialidade e MESMA data
        // Importante: Certifique-se que o campo no banco é exatamente 'dataDesejada'
        const contagem = await Paciente.countDocuments({ 
            especialidade: especialidade,
            dataDesejada: dataDesejada 
        });

        const novoNumeroOrdem = contagem + 1;

        const novoPaciente = new Paciente({
            ...req.body,
            numeroOrdem: novoNumeroOrdem,
            status: 'Pendente',
            horaConsulta: 'A definir'
        });

        await novoPaciente.save();

        res.status(201).json({ 
            mensagem: "Sucesso!", 
            dados: novoPaciente 
        });
    } catch (err) {
        res.status(400).json({ erro: err.message });
    }
});

// 4. ROTA PARA ATUALIZAR/GERIR (PUT)
router.put('/editar/:bi', async (req, res) => {
    try {
        const resultado = await Paciente.findOneAndUpdate(
            { bi: req.params.bi }, 
            req.body, 
            { new: true } // 'new: true' é o padrão moderno para retornar o dado atualizado
        );

        if (!resultado) {
            return res.status(404).json({ mensagem: "Paciente não encontrada." });
        }
        res.status(200).json({ mensagem: "Sucesso", dados: resultado });
    } catch (err) {
        res.status(400).json({ erro: err.message });
    }
});

// 5. ROTA PARA ELIMINAR (DELETE)
router.delete('/eliminar/:bi', async (req, res) => {
    try {
        const resultado = await Paciente.findOneAndDelete({ bi: req.params.bi });
        if (!resultado) {
            return res.status(404).json({ mensagem: "Paciente não encontrada." });
        }
        res.json({ mensagem: "Eliminada com sucesso!" });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

module.exports = router;