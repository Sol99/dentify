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
    var presupuestos = await Presupuesto.find({paciente: req.params.id }).lean();
    console.log("ACA SE MUESTRAN LOS DATOS DEL PACIENTE SELECCIONADO");
    console.log(JSON.stringify(pacienteSeleccionado));
    console.log("Fin de mostrado");

    esOdontologo = req.user.esOdontologo;
    res.render('budgets/presupuesto-paciente', { pacienteSeleccionado, treatments, presupuestos, esOdontologo });
});

router.get('/presupuesto/:id/new',isAuthenticated, async (req,res) =>{
    const datosJson = JSON.parse(JSON.stringify(treatmentsJson));
    var pacienteSeleccionado = await User.findById(req.params.id).lean();
    var arregloTratamientos = new Array;
    dniArray = new Array;
    dniArray.push(pacienteSeleccionado.dni.toString());
    var treatments = await Treatment.find({paciente: dniArray}).lean();
    console.log("ACA SE MUESTRAN LOS DATOS DEL PACIENTE SELECCIONADO");
    console.log(JSON.stringify(pacienteSeleccionado));
    console.log("Fin de mostrado");
    res.render('budgets/new-budget', { pacienteSeleccionado, treatments, datosJson, arregloTratamientos });
});

router.post('/presupuesto/new-budget', isAuthenticated, async (req,res) =>{
    /*
    Datos a persistir: codigo,fecha,fechaVencimiento,idTratamientos,idCantidades,importeTotal,paciente,idOdontologo
    */
    const datosJson = JSON.parse(JSON.stringify(treatmentsJson));

    console.log("LOG=====0");

    
    var { fechaVencimiento,idTratamientos,idCantidades,paciente,observaciones}= req.body;



    let idCantidadesReal = new Array;

        for (i in idCantidades){
            if (idCantidades[i] != "" && idCantidades[i] != "0"){
                console.log("ENTRA PORQUE NO ES VACIO");
                idCantidadesReal.push(idCantidades[i]);
            }
            
        }

        for (i in idCantidadesReal){
            console.log("MOSTRAMOS LA LISTA LIMPIA");
            console.log("EL VALOR ES: " + idCantidades[i] + "y el tipo es: "+typeof(idCantidades[i]));
        }
    
    const errors = [];

    if (idTratamientos != null || idTratamientos != null){
        if(idTratamientos.length != idCantidadesReal.length ){
            errors.push({text: 'Las cantidades ingresadas no coinciden con las cantidades seleccionadas'});
        }
    }

    if(idTratamientos == null ){
        errors.push({text: 'No se seleccionaron tratamientos'});
    }

    if ( idCantidades == null ){
        errors.push({text: 'No se seleccionaron cantidades'});
    }
        

    /*if (!idTratamientos) {
        errors.push({text: 'Por favor ingrese un nombre'});
    }*/
    if (!fechaVencimiento) {
        errors.push({text: 'Por favor ingrese una fecha'});
    }

    if (errors.length > 0) {
        console.log("LOG=====1");
        var pacienteSeleccionado = await User.findById(paciente).lean();
        dniArray = new Array;
        dniArray.push(pacienteSeleccionado.dni.toString());
        var treatments = await Treatment.find({paciente: dniArray}).lean();
        var presupuestos = await Presupuesto.find({paciente: paciente }).lean();
        esOdontologo = req.user.esOdontologo;

        res.render('budgets/presupuesto-paciente',{
            errors,
            pacienteSeleccionado, 
            treatments,
            presupuestos,
            esOdontologo
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
        
        var f = new Date();
        fecha =  f.getFullYear() + "-"+ (f.getMonth()+1) + "-" +f.getDate();

        var importeTotal = 0;

        console.log("EL LENGTH DE TRATAMIENTOS ES: " + idTratamientos.length);
        console.log("EL LENGTH DE TRATAMIENTOS ES: " + idTratamientos);
        console.log("EL TIPO ES: " + typeof(idTratamientos));
        
        


        if (typeof(idTratamientos) != 'string'){

            

            for (i in idTratamientos){
    
                
                console.log("Los id son: " + idTratamientos[i]);
                console.log("El numero a multiplicar es: " +idCantidadesReal[i]);
                
                let tratamientoencontrado = datosJson.find( (item) => (item.Code == idTratamientos[i] ));

                importe = tratamientoencontrado.Valor;
                

                var numero = parseInt(importe.substr(1), 10);

                numero = numero * idCantidadesReal[i];

                console.log("EL NUMERO ES: " + numero.toString());

                importeTotal = importeTotal + numero;
                
    
            }
        }
        else{


                let tratamientoencontrado = datosJson.find( (item) => (item.Code == idTratamientos ));
    
                importe = tratamientoencontrado.Valor;

                var numero = parseInt(importe.substr(1), 10);

                numero = numero * idCantidadesReal;
    
                console.log("EL NUMERO ES: " + numero.toString());
    
                importeTotal = importeTotal + numero;
        }
        

        const newPresupuesto = new Presupuesto({ codigo,fecha,fechaVencimiento,idTratamientos, idCantidades,importeTotal,paciente,observaciones});
        newPresupuesto.idOdontologo = req.user.id;
        await newPresupuesto.save();
        req.flash('success_msg', 'Presupuesto agregado correctamente!');

        var url = '/presupuesto/' + paciente.toString();
        res.redirect(url);
    }

});

router.delete('/presupuestos/delete/:id',isAuthenticated, async (req,res) =>{
    await Presupuesto.findByIdAndDelete(req.params.id).lean();
    req.flash('success_msg', 'Presupuesto eliminada correctamente!');
    res.redirect('back');
}); 

router.get('/presupuestos/edit/:id',isAuthenticated, async (req,res) =>{
    const datosJson = JSON.parse(JSON.stringify(treatmentsJson));
    const presupuesto = await Presupuesto.findById(req.params.id).lean();
    let idCantidad = new Array;
    idCantidad = presupuesto.idCantidades;
    console.log(typeof(datosJson));
    console.log(datosJson);

    

    for (var i = 0; i < datosJson.length; i++) {
        console.log("El dato es: " +  datosJson[i]);
        datosJson[i].idCantidad = presupuesto.idCantidades[i];
    }

    
    res.render('budgets/edit-budget', { presupuesto, datosJson});
});


/**router.get('/presupuesto/:id/new',isAuthenticated, async (req,res) =>{
    const datosJson = JSON.parse(JSON.stringify(treatmentsJson));
    var pacienteSeleccionado = await User.findById(req.params.id).lean();
    var arregloTratamientos = new Array;
    dniArray = new Array;
    dniArray.push(pacienteSeleccionado.dni.toString());
    var treatments = await Treatment.find({paciente: dniArray}).lean();
    console.log("ACA SE MUESTRAN LOS DATOS DEL PACIENTE SELECCIONADO");
    console.log(JSON.stringify(pacienteSeleccionado));
    console.log("Fin de mostrado");
    res.render('budgets/new-budget', { pacienteSeleccionado, treatments, datosJson, arregloTratamientos });
}); */

router.put('/presupuestos/edit-presupuesto/:id',isAuthenticated, async (req,res) =>{

    var { fechaVencimiento,idTratamientos,idCantidades,observaciones}= req.body;

    const datosJson = JSON.parse(JSON.stringify(treatmentsJson));

    let idCantidadesReal = new Array;

        for (i in idCantidades){
            if (idCantidades[i] != "" && idCantidades[i] != "0"){
                console.log("ENTRA PORQUE NO ES VACIO");
                idCantidadesReal.push(idCantidades[i]);
            }
            
        }

        for (i in idCantidadesReal){
            console.log("MOSTRAMOS LA LISTA LIMPIA");
            console.log("EL VALOR ES: " + idCantidades[i] + "y el tipo es: "+typeof(idCantidades[i]));
        }
    
    const errors = [];
    if(idTratamientos.length != idCantidadesReal.length ){
        errors.push({text: 'Las cantidades ingresadas no coinciden con las cantidades seleccionadas'});
    }
    if (!idTratamientos) {
        errors.push({text: 'Por favor ingrese un nombre'});
    }
    if (!fechaVencimiento) {
        errors.push({text: 'Por favor ingrese una fecha'});
    }

    if (errors.length > 0) {
        console.log("LOG=====1");
        var presupuestoSeleccionado = await Presupuesto.findById(req.params.id).lean();
        var paciente = presupuestoSeleccionado.paciente;
        var pacienteSeleccionado = await User.findById(paciente).lean();
        dniArray = new Array;
        dniArray.push(pacienteSeleccionado.dni.toString());
        var treatments = await Treatment.find({paciente: dniArray}).lean();
        var presupuestos = await Presupuesto.find({paciente: paciente }).lean();
        esOdontologo = req.user.esOdontologo;

        res.render('budgets/presupuesto-paciente',{
            errors,
            pacienteSeleccionado, 
            treatments,
            presupuestos,
            esOdontologo
        });

    } else {
        console.log("LOG=====2");
        //console.log("El id que se esta pasando es: " + paciente);
        
        /*presupuestoPaciente = await Presupuesto.find({paciente: paciente}).lean();
        
        if(presupuestoPaciente == null){
            codigo = 0;
        }    
        else{
            codigo = presupuestoPaciente.length + 1;
        }*/
        

        var importeTotal = 0;

        console.log("EL LENGTH DE TRATAMIENTOS ES: " + idTratamientos.length);
        console.log("EL LENGTH DE TRATAMIENTOS ES: " + idTratamientos);
        console.log("EL TIPO ES: " + typeof(idTratamientos));
        
        


        if (typeof(idTratamientos) != 'string'){

            

            for (i in idTratamientos){
    
                
                console.log("Los id son: " + idTratamientos[i]);
                console.log("El numero a multiplicar es: " +idCantidadesReal[i]);
                
                let tratamientoencontrado = datosJson.find( (item) => (item.Code == idTratamientos[i] ));

                importe = tratamientoencontrado.Valor;
                

                var numero = parseInt(importe.substr(1), 10);

                numero = numero * idCantidadesReal[i];

                console.log("EL NUMERO ES: " + numero.toString());

                importeTotal = importeTotal + numero;
                
    
            }
        }
        else{


                let tratamientoencontrado = datosJson.find( (item) => (item.Code == idTratamientos ));
    
                importe = tratamientoencontrado.Valor;

                var numero = parseInt(importe.substr(1), 10);

                numero = numero * idCantidadesReal;
    
                console.log("EL NUMERO ES: " + numero.toString());
    
                importeTotal = importeTotal + numero;
        }
        

        await Presupuesto.findByIdAndUpdate(req.params.id, {fechaVencimiento,importeTotal,observaciones,idCantidades,idTratamientos}).lean();
        req.flash('success_msg', 'Presupuesto actualizada correctamente!');
        var presupuestoSeleccionado = await Presupuesto.findById(req.params.id).lean();
        var paciente = presupuestoSeleccionado.paciente;
        var url = '/presupuesto/' + paciente.toString()
        res.redirect(url);
    }
});

router.post('/presupuestos/search', isAuthenticated, async (req,res)=>{
    var {dniPaciente} = req.body;
    var usersdatas;
    console.log("El dni buscado es.."+dniPaciente);
    //var usersdatas = await User.find({esOdontologo: false}).lean();
    if (dniPaciente != ""){   
        usersdatas = await User.find({dni: { "$regex": dniPaciente, "$options": "i" }}).lean();
    }
    else{
        usersdatas = await User.find({esOdontologo: false}).lean();
    }
    console.log(usersdatas);

    res.render('budgets/presupuestos-search', {usersdatas,dniPaciente});
});





module.exports = router;