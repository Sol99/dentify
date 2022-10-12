const mongoose = require('mongoose');
const { Schema } = mongoose;

const PresupuestoSchema = new Schema ({
    codigo: {type: Number},
    fecha: { type: String},
    fechaVencimiento: { type: String},
    idTratamientos: {type: Array},
    importeTotal: { type: String},
    paciente: {type: String},
    observaciones: {type:String},
    idOdontologo: {type:String}
});

module.exports = mongoose.model('Presupuesto', PresupuestoSchema);