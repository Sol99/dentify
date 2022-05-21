const express = require('express')
const router = express.Router();
const User = require('../models/User');
const passport = require('passport');
const {isAuthenticated} = require('../helpers/auth');

router.get('/users/signin', (req,res) =>{
    res.render('users/signin');
});

router.post('/users/signin', passport.authenticate('local', {
    successRedirect: '/notes',
    failureRedirect: '/users/signin',
    failureFlash: true
}));

router.get('/users/signup', (req,res) =>{
    res.render('users/signup');
});

router.post('/users/signup', async (req,res) =>{
    const {name, lastname, email, phone, password, confirm_password, role } = req.body
    const errors = [];
    if (name.length <= 0) {
        errors.push({text: 'Por favor ingrese su nombre'});
    }
    if (lastname.length <= 0) {
        errors.push({text: 'Por favor ingrese su apellido'});
    }
    if (email.length <= 0) {
        errors.push({text: 'Por favor ingrese su correo'});
    }
    if (password != confirm_password){
        errors.push({text: 'Las contraseñas no coinciden!'});
    }
    if (password.length < 5){
        errors.push({text: 'La contraseña debe ser de al menos 4 caracteres'});
    }
    if (errors.length > 0) {
        res.render('users/signup', {errors, name, lastname, email, phone, password, confirm_password, role});
    } else {
        const emailUser = await User.findOne({email: email}).lean();
        if(emailUser){
            req.flash('error_msg', 'El email se encuentra en uso');
            res.redirect('/users/signup');
        }
        const newUser = new User({name, lastname, email, phone, password, role});
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


module.exports = router;