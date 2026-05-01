const mongoose = require('mongoose');

const ConsultaSchema = new mongoose.Schema({
    pacienteNome: { type: String, required: true },
    telefone: { type: String, required: true },
    especialidade: { 
        type: String, 
        enum: ['Ginecologia', 'Obstetrícia', 'Planeamento Familiar', 'Pediatria'],
        default: 'Obstetrícia'
    },
    dataDesejada: { type: Date, required: true },
    mensagem: { type: String },
    status: { 
        type: String, 
        enum: ['Pendente', 'Confirmada', 'Cancelada'], 
        default: 'Pendente' 
    },
    criadoEm: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Consulta', ConsultaSchema);