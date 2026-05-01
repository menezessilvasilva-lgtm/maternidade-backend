const mongoose = require('mongoose');

const DicaSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    categoria: { type: String, required: true }, // Ex: Obstetrícia ou Pediatria
    conteudo: { type: String, required: true },
    dataCriacao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Dica', DicaSchema);