const express = require('express')
const router = express.Router();
const User = require('../models/User');
const Treatment = require('../models/Treatment');
const Presupuesto = require('../models/Presupuesto');
const Appointment = require('../models/Appointment');
const passport = require('passport');
const {isAuthenticated} = require('../helpers/auth');
const treatmentsJson = require('../views/treatments/treatments.json');

router.get('/appointments', isAuthenticated, async (req,res)=> {

    const userdata = await User.find({_id: req.user.id}).lean();
    //console.log(userdata[0].apellido);
    if (userdata[0].esOdontologo == true){
        console.log("ACA ENTRA PORQUE ES ODONTOLOGO");
        const usersdatas = await User.find({esOdontologo: false}).lean();
       // console.log("imprimiendo");
       // console.log(usersdatas);

       res.render('appointments/pacient-search',  { usersdatas });
    }
    else{

        var appointments = await Appointment.find({paciente: userdata[0]._id }).lean();
        console.log("id del paciente: " +  JSON.stringify(userdata))
        console.log("Estos son los presupuestos del paciente: " + JSON.stringify(appointments));
        res.render('appointments/appointments-paciente',  { userdata, appointments });
    }
    
});

router.get('/appointments/:id',isAuthenticated, async (req,res) =>{
    var pacienteSeleccionado = await User.findById(req.params.id).lean();
    dniArray = new Array;
    dniArray.push(pacienteSeleccionado.dni.toString());
    var presupuestos = await Presupuesto.find({paciente: req.params.id }).lean();
    console.log("ACA SE MUESTRAN LOS DATOS DEL PACIENTE SELECCIONADO");
    console.log(JSON.stringify(pacienteSeleccionado));
    console.log("Fin de mostrado");
    var appointments = await Appointment.find({paciente: req.params.id }).lean();

    esOdontologo = req.user.esOdontologo;
    res.render('appointments/appointments-paciente', { pacienteSeleccionado, appointments, esOdontologo });
});

router.post('/appointments/search', isAuthenticated, async (req,res)=>{
    var {dniPaciente} = req.body;
    var usersdatas;
    console.log("El dni buscado es.."+dniPaciente);
    //var usersdatas = await User.find({esOdontologo: false}).lean();
    if (dniPaciente != ""){   
        usersdatas = await User.find({esOdontologo: false, dni: { "$regex": dniPaciente, "$options": "i" }}).lean();
    }
    else{
        usersdatas = await User.find({esOdontologo: false}).lean();
    }
    console.log(usersdatas);

    res.render('appointments/pacient-search', {usersdatas,dniPaciente});
});

router.get('/appointments/:id/new',isAuthenticated, async (req,res) =>{
    //const datosJson = JSON.parse(JSON.stringify(treatmentsJson));
    var pacienteSeleccionado = await User.findById(req.params.id).lean();
   // var presupuestos = await Presupuesto.find({paciente: req.params.id, estado: "Aprobado"}).lean();

    var presupuestos = await Presupuesto.find({ $or: [{paciente: req.params.id, estado: "Aprobado"}, {paciente: req.params.id, estado: "Pagado"}] }).lean();

    //var arregloTratamientos = new Array;
    dniArray = new Array;
    dniArray.push(pacienteSeleccionado.dni.toString());
    //var treatments = await Treatment.find({paciente: dniArray}).lean();
    console.log("ACA SE MUESTRAN LOS DATOS DEL PACIENTE SELECCIONADO");
    console.log(JSON.stringify(pacienteSeleccionado));
    console.log("Fin de mostrado");
    res.render('appointments/new-appointment', { pacienteSeleccionado, presupuestos });
});

router.post('/appointments/new-appointment', isAuthenticated, async (req,res) =>{
    

    var { paciente,idPresupuestos,fecha,hora}= req.body;

    var codigo;
    
    citasPacientes = await Appointment.find().lean();
        
    if(citasPacientes == null){
        codigo = 0;
    }    
    else{
        codigo = citasPacientes.length + 1;
    }

    const newAppointment = new Appointment({ codigo,fecha,hora,idPresupuestos,paciente});
    newAppointment.idOdontologo = req.user.id;
    await newAppointment.save();
    req.flash('success_msg', 'Cita agendada correctamente!');

    var url = '/appointments/' + paciente.toString();
    res.redirect(url);

});

router.delete('/appointments/delete/:id',isAuthenticated, async (req,res) =>{
    await Appointment.findByIdAndDelete(req.params.id).lean();
    req.flash('success_msg', 'Cita eliminada correctamente!');
    res.redirect('back');
}); 

router.get('/appointments/edit/:id',isAuthenticated, async (req,res) =>{
    const appointment = await Appointment.findById(req.params.id).lean();
    var paciente = await User.findById(appointment.paciente).lean();
    var presupuestos = await Presupuesto.find({ $or: [{paciente: paciente._id, estado: "Aprobado"}, {paciente: paciente._id, estado: "Pagado"}] }).lean();
    
    res.render('appointments/edit-appointment', { presupuestos, appointment, paciente});
});


router.put('/appointments/edit-appointment/:id',isAuthenticated, async (req,res) =>{

    var { paciente,idPresupuestos,fecha,hora}= req.body;

    await Appointment.findByIdAndUpdate(req.params.id, {idPresupuestos,fecha,hora}).lean();

    req.flash('success_msg', 'Cita actualizada correctamente!');

    var url = '/appointments/' + paciente.toString()
    res.redirect(url);

});

module.exports = router;