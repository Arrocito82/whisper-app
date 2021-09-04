//jshint esversion:6

//for encrypting passwords
require('dotenv').config();

const bodyParser = require('body-parser');
const ejs = require('ejs');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');


//server
const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret:'thatisn;ttrue.',
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

//connecting to database
const uri = "mongodb+srv://admin:"+process.env.MONGO_KEY+"@cluster0.b8koz.mongodb.net/userDB?retryWrites=true&w=majority";
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).catch(error=> console.log(`Database Connection Failed! ${error}`));

mongoose.set("useCreateIndex",true);


//database schemas
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        require: true
    },
    password:{
        type:String,
        require:true
    }

});

userSchema.plugin(passportLocalMongoose);

const User=mongoose.model('User',userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// route handlers
app.get('/', function (request, response) {
    response.render('home');
});


app.route('/login')
.get( function (request, response) {
    response.render('login');
})
.post(function (req,res) {
   
});



app.route('/register')
.get( function (request, response) {
    response.render('register');
})
.post(function (req,res) {

});




app.listen(3000, function () {
    console.log('Server started on port 3000');
});