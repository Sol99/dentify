const mongoose = require ('mongoose');
const {Schema} = mongoose;
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
    nombre: {type: String, required: true},
    apellido: {type: String, required: true},
    numeroAfiliado: {type: Number, required: false, default:0},
    email: {type: String, required: true},
    telefono: {type: Number, required: false, default:0},
    fechaCumpleanios: {type:Date, required:false, default:0},
    password: {type: String, required: true},
    rol:{type:String, required: true},
    esOdontologo: {type: Boolean, required: true, default: false},
    obraSocial: {type: String, required:false, default:0},
    matricula: {type:Number, required:false, default:0},
    date: {type: Date, default: Date.now},
    calle: {type: String, required:false, default:0},
    numeroCalle: {type:Number, required:false, default:0},
    piso:{type: Number, required:false, default:0},
    departamento: {type: String, required:false, default:0},
    localidad: {type: String, required:false, default:0}, 
    dni:{type:Number, default:42312208}
});

UserSchema.methods.encryptPassword = async (password) =>{ 
    const salt = await bcrypt.genSalt(10);
    const hash = bcrypt.hash(password, salt);
    return hash;
};

UserSchema.methods.matchPassword = async function(password){
    return await bcrypt.compare(password, this.password);
};


module.exports = mongoose.model('User', UserSchema);

