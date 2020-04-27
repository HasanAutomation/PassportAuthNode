const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require('express-session');
const passport =require('passport');


const app = express();

//passport config
require('./config/passport')(passport);

//DB config
const db = require('./config/keys').mongoURI;

//connect Mongo
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Mongo connected')).catch(err => console.log(err))

//EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

//Body-parser
app.use(express.urlencoded({ extended: false }));

// Express session
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//connect flash
app.use(flash());

//Global vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

const port = process.env.PORT || 2000;

//Routes
app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))

app.listen(port, () => {
    console.log(`Server running on ${port}`);
})