const mongoose = require('mongoose');

const ConfigSchema = new mongoose.Schema({
    chave: { type: String, required: true, unique: true }, // Ex: "noticia_principal"
    valor: { type: String, required: true },               // O texto que vais escrever
    ultimaAtualizacao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Config', ConfigSchema);