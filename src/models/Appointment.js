const mongoose = require('mongoose');
const { Schema } = mongoose;

const AppointmentSchema = new Schema ({ 
    codigo: {type: Number},
    fecha: { type: String},
    hora: { type: String},
    idPresupuestos: {type: Array},
    paciente: {type: String},
    idOdontologo: {type:String}
});

module.exports = mongoose.model('Appointment', AppointmentSchema);