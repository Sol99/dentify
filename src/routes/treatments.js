const express = require('express')
const router = express.Router();
const Treatment = require('../models/Treatment');
const User = require('../models/User');
const {isAuthenticated} = require('../helpers/auth');
const treatmentsJson = require('../views/treatments/treatments.json');


router.get('/treatments/add', isAuthenticated, (req,res) =>{
    res.render('treatments/new-treatment');
});

router.post('/treatments/new-treatment', isAuthenticated, async (req,res) =>{
    var { nombre,fecha,caraDiente,nroDiente,matriculaOdontologo,paciente,observaciones}= req.body;
    //console.log("DESDE EL BACK EL NRODIENTE ES: " + nroDiente);
    const errors = [];
    if (!nombre) {
        errors.push({text: 'Por favor ingrese un nombre'});
    }
    if (!fecha) {
        errors.push({text: 'Por favor ingrese una fecha'});
    }
    if(!caraDiente){
        errors.push({text: 'Por favor ingrese el CARADIENTE de un paciente'});
    }

    if (errors.length > 0) {
        data = treatmentsJson;
        const datosJson = JSON.parse(JSON.stringify(treatmentsJson));//devuelve los tratamientos en colleccion de objetos para renderizarlos en el front
        const treatments = await Treatment.find({user: req.user.id}).lean().sort({date: 'desc' });
        const pacientes = await User.find({esOdontologo: false}).lean();
        
        res.render('treatments/all-treatments', {
            errors,
            fecha,
            caraDiente,
            treatments, 
            datosJson, 
            pacientes
        });
    } else {

        var resul = paciente.split(',').at(0);
        paciente = resul;
        const datosJson = JSON.parse(JSON.stringify(treatmentsJson));
        let obtenerCodigo = datosJson.find( (item) => (item.Nombre == nombre ));
        codigo = obtenerCodigo.Code;
        importe = obtenerCodigo.Valor;
        const newTreatment = new Treatment({ codigo,nombre,fecha,caraDiente,nroDiente,importe,matriculaOdontologo,paciente,observaciones});
        newTreatment.user = req.user.id;
        await newTreatment.save();
        req.flash('success_msg', 'Tratamiento agregada correctamente!');
        res.redirect('/treatments');
    }

});


router.get('/treatments', isAuthenticated, async (req,res)=>{
    data = treatmentsJson;
    const datosJson = JSON.parse(JSON.stringify(treatmentsJson));//devuelve los tratamientos en colleccion de objetos para renderizarlos en el front
    var esOdontologo;

    if (req.user.esOdontologo){
        //INGRESA ODONTOLOGO
        var treatments = await Treatment.find({user: req.user.id}).lean().sort({date: 'desc' });
        var pacientes = await User.find({esOdontologo: false}).lean();
        var esOdontologo = true;
    }
    else{
        //INGRESA PACIENTE
        var dnipaciente = req.user.dni;
        var arreglo = new Array;
        arreglo.push(dnipaciente.toString());
        var treatments = await Treatment.find({paciente: arreglo}).lean().sort({date: 'desc' });
        var pacientes = await User.find({esOdontologo: false}).lean();
        var esOdontologo = false;
    }
    //console.log(pacientes);
    res.render('treatments/all-treatments', { treatments, datosJson, pacientes, esOdontologo} );
});

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
});

router.get('/treatments/edit/:id',isAuthenticated, async (req,res) =>{
    const treatment = await Treatment.findById(req.params.id).lean();
    data = treatmentsJson;
    const pacientes = await User.find({esOdontologo: false}).lean();
    const datosJson = JSON.parse(JSON.stringify(treatmentsJson));
    res.render('treatments/edit-treatment', { treatment, datosJson, pacientes});
});

router.put('/treatments/edit-treatment/:id',isAuthenticated, async (req,res) =>{
    var {nombre,fecha,caraDiente,importe,matriculaOdontologo,paciente,observaciones} = req.body;
    const datosJson = JSON.parse(JSON.stringify(treatmentsJson));
    let obtenerCodigo = datosJson.find( (item) => (item.Nombre == nombre ));
    codigo = obtenerCodigo.Code;
    var resul = paciente.split(',').at(0);
    paciente = resul;
    await Treatment.findByIdAndUpdate(req.params.id, {codigo,nombre,fecha,caraDiente,importe,matriculaOdontologo,paciente,observaciones}).lean();
    req.flash('success_msg', 'Tratamiento actualizada correctamente!');
    res.redirect('/treatments');
});

router.delete('/treatments/delete/:id',isAuthenticated, async (req,res) =>{
    await Treatment.findByIdAndDelete(req.params.id).lean();
    req.flash('success_msg', 'Tratamiento eliminada correctamente!');
    res.redirect('/treatments');
}); 

module.exports = router;