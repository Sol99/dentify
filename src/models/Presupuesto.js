const mongoose = require('mongoose');
const { Schema } = mongoose;

const PresupuestoSchema = new Schema ({
    codigo: {type: Number},
    fecha: { type: String},
    fechaVencimiento: { type: String},
    idTratamientos: {type: Array},
    idCantidades: {type: Array},
    importeTotal: { type: String},
    paciente: {type: String},
    observaciones: {type:String},
    idOdontologo: {type:String},
    estado: {type:String, default: 'Pendiente'},
    esPendiente: {type: Boolean, default: true},
    esAprobado: {type: Boolean, default: false}
});

module.exports = mongoose.model('Presupuesto', PresupuestoSchema);