const express = require('express');
const bcrypt = require('bcryptjs');
const passport=require('passport');
const router = express.Router();

//User model
const User = require('../models/User');
//login
router.get('/login', (req, res) => {
    res.render('login');
})

//registration
router.get('/register', (req, res) => {
    res.render('register');
})

//Register Handle
router.post('/register', (req, res) => {
    console.log(req.body);
    const { name, email, password, password2 } = req.body;
    let errors = [];

    //check required fields
    if (!name || !email || !password || !password2) {
        errors.push({ msg: "Please fill in all fileds.." })
    }

    //password matching
    if (password !== password2) {
        errors.push({ msg: "Passwords do not match!" })
    }

    //check password length
    if (password.length < 8) {
        errors.push({ msg: "Password should be at least 8 charcters " });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    }
    else {
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    //user exists
                    errors.push({ msg: "Email is already registered" });
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2

                    });
                }
                else {
                    //new user
                    const newUser = new User({
                        name,
                        email,
                        password
                    });
                    console.log(newUser);
                    //Hash the password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            //set password to hash
                            newUser.password = hash;

                            //save user
                            newUser.save()
                            .then(user=>{
                                req.flash('success_msg','You are now registered and can log in')
                                res.redirect('login');
                            })
                            .catch(err=> console.log(err));
                        })
                    })
                }
            })
    }
});

//Handle login

router.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
        successRedirect:'/dashboard',
        failureRedirect:'/users/login',
        failureFlash:true
    })(req,res,next);
})

//handle logout
router.get('/logout',(req,res)=>{
    req.logOut();
    req.flash('success_msg','You are successfully logged out');
    res.redirect('/users/login');
})

module.exports = router;