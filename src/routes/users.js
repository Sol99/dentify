const express = require('express')
const router = express.Router();
const User = require('../models/User');
const Treatment = require('../models/Treatment');
const passport = require('passport');
const {isAuthenticated} = require('../helpers/auth');
const treatmentsJson = require('../views/treatments/treatments.json');

router.get('/users/signin', (req,res) =>{
    res.render('users/signin');
});

router.post('/users/signin', passport.authenticate('local', {
    successRedirect: '/notes',
    failureRedirect: '/users/signin',
    failureFlash: true,
}));

router.get('/users/signup', (req,res) =>{
    res.render('users/signup');
});

router.post('/users/signup', async (req,res) =>{
    var {nombre, apellido, dni, email, telefono, password, confirm_password, rol, esOdontologo } = req.body
    const errors = [];
    if (nombre.length <= 0) {
        errors.push({text: 'Por favor ingrese su nombre'});
    }
    if(rol == "Seleccione el rol"){
        errors.push({text: 'Por favor ingrese un rol'});
    }
    if (apellido.length <= 0) {
        errors.push({text: 'Por favor ingrese su apellido'});
    }
    if (dni.length <= 0) {
        errors.push({text: 'Por favor ingrese su DNI'});
    }
    if (email.length <= 0) {
        errors.push({text: 'Por favor ingrese su correo'});
    }
    if (password != confirm_password){
        errors.push({text: 'Las contraseñas no coinciden!'});
    }
    if (password.length < 5){
        errors.push({text: 'La contraseña debe ser de al menos 5 caracteres'});
    }
    const emailUser = await User.findOne({email: email}).lean();
    if(emailUser){
        console.log("encontró");
        //req.flash('error_msg', 'El email se encuentra en uso');
        errors.push({text: 'El email se encuentra en uso'});
        //res.render('users/signup', {errors, nombre, apellido, dni, email, telefono, password, confirm_password, rol, esOdontologo});
        // res.redirect('/users/signup');
    }
    if (errors.length > 0) {
        res.render('users/signup', {errors, nombre, apellido, dni, email, telefono, password, confirm_password, rol, esOdontologo});
    } else {
        //const newUser = new User({nombre, apellido, numeroAfiliado, email, telefono, fechaCumpleanios, password, rol, obraSocial, matricula, calle, numeroCalle, piso, departamento, localidad});
        const newUser = new User({nombre, apellido, dni, email, telefono, password, rol, esOdontologo});
        if (rol == "Soy Odontólogo"){
            newUser.esOdontologo = true;
        }
        else{
            newUser.esOdontologo = false;
        }
        newUser.password = await newUser.encryptPassword(password);
        await newUser.save();
        req.flash('success_msg', 'Usuario registrado exitosamente!');
        res.redirect('/users/signin');
    }
});

router.get('/users/logout', (req,res) =>{
    req.logout();
    res.redirect('/');
});


router.get('/users/profile', isAuthenticated, async (req,res) =>{
    const userdata = await User.find({_id: req.user.id}).lean();
    res.render('users/profile',  { userdata });
    console.log(userdata)
});

router.get('/users/historias-clinicas', isAuthenticated, async (req,res) =>{
    const userdata = await User.find({_id: req.user.id}).lean();
    //console.log(userdata[0].apellido);
    if (userdata[0].esOdontologo == true){
        console.log("ACA ENTRA PORQUE ES ODONTOLOGO");
        const usersdatas = await User.find({esOdontologo: false}).lean();
       // console.log("imprimiendo");
       // console.log(usersdatas);

        res.render('users/historias-clinicas-pacientes',  { usersdatas });
    }
    else{
        res.render('users/historia-clinica',  { userdata });
    }

});

router.get('/users/historias-clinicas/:id',isAuthenticated, async (req,res) =>{
    const historia_clinica_paciente = await User.findById({_id: req.params.id}).lean();
    console.log("ACA SE MUESTRAN LOS DATOS DEL PACIENTE SELECCIONADO");
    console.log(historia_clinica_paciente);
    console.log("Fin de mostrado");
    res.render('users/historia-clinica-paciente', { historia_clinica_paciente });
});

router.get('/users/historias-clinicas/:dni/treatments',isAuthenticated, async (req,res) =>{
   
    let dniArray = [req.params.dni];
    const dniPacienteSeleccionado = await User.find({dni: req.params.dni.toString()}).lean();
    console.log("El array en la posicion cero es: " + dniArray[0]);
    console.log("El paciente es: " + typeof(dniPacienteSeleccionado));
    const treatments = await Treatment.find({paciente: dniArray}).lean();
    console.log("ACA SE MUESTRAN LOS DATOS DEL PACIENTE SELECCIONADO");
    console.log(treatments);
    console.log("Fin de mostrado");
    res.render('treatments/all-treatments-pacient', { treatments, dniPacienteSeleccionado });
    
});

router.get('/users/historias-clinicas/:dni/treatments/:number',isAuthenticated, async (req,res) =>{
    let dniArray = [req.params.dni];
    var nroDiente = req.params.number;
    const dniPacienteSeleccionado = await User.find({dni: req.params.dni.toString()}).lean();

    data = treatmentsJson;
    const datosJson = JSON.parse(JSON.stringify(treatmentsJson));//devuelve los tratamientos en colleccion de objetos para renderizarlos en el front

    if (req.user.esOdontologo){
        //INGRESA ODONTOLOGO
        var treatmentsPacienteDiente = await Treatment.find({nroDiente: nroDiente.toString(), paciente: dniArray }).lean().sort({date: 'desc' });
        console.log("estos son los resul: " + JSON.stringify(treatmentsPacienteDiente));
        var pacientes = await User.find({esOdontologo: false}).lean();
        esOdontologo = true;
    }
    else{
        //INGRESA PACIENTE
        var dnipaciente = req.user.dni;
        var arreglo = new Array;
        arreglo.push(dnipaciente.toString());
        var treatmentsPacienteDiente = await Treatment.find({nroDiente: nroDiente, paciente: dniArray}).lean().sort({date: 'desc' });
        var pacientes = await User.find({esOdontologo: false}).lean();
        esOdontologo = false;
    }
    res.render('treatments/all-treatments-tooth-pacient', { treatmentsPacienteDiente, dniPacienteSeleccionado, pacientes, nroDiente, esOdontologo, datosJson} );

});
/*
router.post('/treatments/tooth/:number', isAuthenticated, async (req,res)=>{
    var {nroDiente} = req.body;
    data = treatmentsJson;
    const datosJson = JSON.parse(JSON.stringify(treatmentsJson));//devuelve los tratamientos en colleccion de objetos para renderizarlos en el front
    var esOdontologo1;
    

    if (req.user.esOdontologo){
        //INGRESA ODONTOLOGO
        var treatments = await Treatment.find({nroDiente: nroDiente}).lean().sort({date: 'desc' });
        var pacientes = await User.find({esOdontologo: false}).lean();
        esOdontologo = true;
    }
    else{
        //INGRESA PACIENTE
        var dnipaciente = req.user.dni;
        var arreglo = new Array;
        arreglo.push(dnipaciente.toString());
        var treatments = await Treatment.find({nroDiente: nroDiente,paciente: arreglo}).lean().sort({date: 'desc' });
        var pacientes = await User.find({esOdontologo: false}).lean();
        esOdontologo = false;
    }
    res.render('treatments/all-treatments-tooth', { treatments, datosJson, pacientes, nroDiente, esOdontologo} );
});*/

module.exports = router;