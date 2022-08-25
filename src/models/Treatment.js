const mongoose = require('mongoose');
const { Schema } = mongoose;

const TreatmentSchema = new Schema ({
    codigo: {type: Number},
    fecha: { type: Date, default: Date.now },
    caraDiente: { type: String, required: false },
    importe: { type: String, required: false },
    matriculaOdontologo: {type: String, required: false, default: 30315 },
    paciente: {type: String},
    observaciones: {type: String},
    user: {type:String}
});

module.exports = mongoose.model('Treatment', TreatmentSchema);