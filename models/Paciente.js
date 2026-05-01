const mongoose = require('mongoose');

const pacienteSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    bi: { type: String, required: true }, 
    idade: { type: Number },
    telefone: { type: String },
    bairro: { type: String },
    especialidade: { type: String },
    dum: { type: Date },
    dataDesejada: { type: String },
    
    // --- NOVOS CAMPOS PARA AGENDAMENTO COMPLETO ---
    numeroOrdem: { type: Number }, // Gerado automaticamente
    horaConsulta: { type: String, default: "A definir" }, // Definido pelo Admin
    status: { 
        type: String, 
        enum: ['Pendente', 'Confirmado', 'Cancelado', 'Concluído'], 
        default: 'Pendente' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Paciente', pacienteSchema);