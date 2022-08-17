const express = require('express')
const router = express.Router();
const Treatment = require('../models/Treatment');
const {isAuthenticated} = require('../helpers/auth')

router.get('/treatments/add', isAuthenticated, (req,res) =>{
    res.render('treatments/new-treatment');
});

router.post('/treatments/new-treatment', isAuthenticated, async (req,res) =>{
    const { codigo,fecha,caraDiente,importe,matriculaOdontologo,paciente,observaciones}= req.body;
    const errors = [];
    if (!codigo) {
        errors.push({text: 'Por favor ingrese un codigo'});
    }
    if (!fecha) {
        errors.push({text: 'Por favor ingrese una fecha'});
    }
    if(!caraDiente){
        errors.push({text: 'Por favor ingrese el CARADIENTE de un paciente'});
    }

    if (errors.length > 0) {
        res.render('treatments/new-treatment', {
            errors,
            codigo,
            fecha,
            caraDiente
        });
    } else {
        const newTreatment = new Treatment({ codigo,fecha,caraDiente,importe,matriculaOdontologo,paciente,observaciones});
        newTreatment.user = req.user.id;
        await newTreatment.save();
        req.flash('success_msg', 'Tratamiento agregada correctamente!');
        res.redirect('/treatments');
    }

});


router.get('/treatments', isAuthenticated, async (req,res)=>{
    const treatments = await Treatment.find({user: req.user.id}).lean().sort({date: 'desc' });
    res.render('treatments/all-treatments', { treatments });
});

router.get('/treatments/edit/:id',isAuthenticated, async (req,res) =>{
    const treatment = await Treatment.findById(req.params.id).lean();
    res.render('treatments/edit-treatment', { treatment });
});

router.put('/treatments/edit-treatment/:id',isAuthenticated, async (req,res) =>{
    const {codigo,fecha,caraDiente,importe,matriculaOdontologo,paciente,observaciones} = req.body;
    await Treatment.findByIdAndUpdate(req.params.id, {codigo,fecha,caraDiente,importe,matriculaOdontologo,paciente,observaciones}).lean();
    req.flash('success_msg', 'Tratamiento actualizada correctamente!');
    res.redirect('/treatments');
});

router.delete('/treatments/delete/:id',isAuthenticated, async (req,res) =>{
    await Treatment.findByIdAndDelete(req.params.id).lean();
    req.flash('success_msg', 'Tratamiento eliminada correctamente!');
    res.redirect('/treatments')
});

module.exports = router;