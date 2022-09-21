const express = require('express')
const router = express.Router();
const Treatment = require('../models/Treatment');
const User = require('../models/User');
const {isAuthenticated} = require('../helpers/auth');
const treatmentsJson = require('../views/treatments/treatments.json');

router.post('/users/historias-clinicas/search', isAuthenticated, async (req,res)=>{
    var {dniPaciente} = req.body;
    var usersdatas;
    console.log((dniPaciente));
    //var usersdatas = await User.find({esOdontologo: false}).lean();
    if (dniPaciente != ""){   
        usersdatas = await User.find({dni: { "$regex": dniPaciente, "$options": "i" }}).lean();
    }
    else{
        usersdatas = await User.find({esOdontologo: false}).lean();
    }
    console.log(usersdatas);
    /*data = treatmentsJson;
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
    }*/
    res.render('users/historias-clinicas-search', {usersdatas,dniPaciente});
});

module.exports = router;