const express = require('express')
const router = express.Router();
const User = require('../models/User');
const Treatment = require('../models/Treatment');
const Presupuesto = require('../models/Presupuesto');
const passport = require('passport');
const {isAuthenticated} = require('../helpers/auth');
const treatmentsJson = require('../views/treatments/treatments.json');

router.get('/presupuesto', isAuthenticated, async (req,res)=> {

    const userdata = await User.find({_id: req.user.id}).lean();
    //console.log(userdata[0].apellido);
    if (userdata[0].esOdontologo == true){
        console.log("ACA ENTRA PORQUE ES ODONTOLOGO");
        const usersdatas = await User.find({esOdontologo: false}).lean();
       // console.log("imprimiendo");
       // console.log(usersdatas);

       res.render('budgets/presupuestos',  { usersdatas });
    }
    else{
        res.render('budgets/presupuesto-paciente',  { userdata });
    }
    
});


router.get('/presupuesto/:id',isAuthenticated, async (req,res) =>{
    var pacienteSeleccionado = await User.findById(req.params.id).lean();
    dniArray = new Array;
    dniArray.push(pacienteSeleccionado.dni.toString());
    var treatments = await Treatment.find({paciente: dniArray}).lean();
    console.log("ACA SE MUESTRAN LOS DATOS DEL PACIENTE SELECCIONADO");
    console.log(JSON.stringify(pacienteSeleccionado));
    console.log("Fin de mostrado");
    res.render('budgets/presupuesto-paciente', { pacienteSeleccionado, treatments });
});

router.get('/presupuesto/:id/new',isAuthenticated, async (req,res) =>{
    var pacienteSeleccionado = await User.findById(req.params.id).lean();
    dniArray = new Array;
    dniArray.push(pacienteSeleccionado.dni.toString());
    var treatments = await Treatment.find({paciente: dniArray}).lean();
    console.log("ACA SE MUESTRAN LOS DATOS DEL PACIENTE SELECCIONADO");
    console.log(JSON.stringify(pacienteSeleccionado));
    console.log("Fin de mostrado");
    res.render('budgets/new-budget', { pacienteSeleccionado, treatments });
});

router.post('/presupuesto/new-budget', isAuthenticated, async (req,res) =>{
    /*
    Datos a persistir: codigo,fecha,fechaVencimiento,idTratamientos,importeTotal,paciente,idOdontologo
    */
    console.log("LOG=====0");
    var { fechaVencimiento,idTratamientos,paciente,observaciones}= req.body;
    
    const errors = [];
    if (!idTratamientos) {
        errors.push({text: 'Por favor ingrese un nombre'});
    }
    if (!fechaVencimiento) {
        errors.push({text: 'Por favor ingrese una fecha'});
    }

    if (errors.length > 0) {
        console.log("LOG=====1");
        var pacienteSeleccionado = await User.findById(paciente).lean();
        var treatments = await Treatment.find({paciente: dniArray}).lean();

        res.render('budgets/presupuesto-paciente',{
            errors,
            pacienteSeleccionado, 
            treatments
        });

    } else {
        console.log("LOG=====2");
        console.log("El id que se esta pasando es: " + paciente);
        presupuestoPaciente = await Presupuesto.find({paciente: paciente}).lean();
        
        if(presupuestoPaciente == null){
            codigo = 0;
        }    
        else{
            codigo = presupuestoPaciente.length + 1;
        }
        
        fecha = Date.now().toString();

        var importeTotal = 0;

        for (i in idTratamientos){

            
            tratamientoencontrado = await Treatment.findById(idTratamientos[i]);

            var numero = parseInt(tratamientoencontrado.importe.substr(1), 10);

            console.log("EL NUMERO ES: " + numero.toString());

            importeTotal = importeTotal + numero;


        }
        

        const newPresupuesto = new Presupuesto({ codigo,fecha,fechaVencimiento,idTratamientos,importeTotal,paciente,observaciones});
        newPresupuesto.idOdontologo = req.user.id;
        await newPresupuesto.save();
        req.flash('success_msg', 'Presupuesto agregado correctamente!');

        var url = '/presupuesto/' + paciente.toString();
        res.redirect(url);
    }

});


module.exports = router;