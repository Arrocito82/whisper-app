//jshint esversion:6

//for encrypting passwords
require('dotenv').config();


//for hashing passwords with salting
const bcrypt = require('bcrypt');
const saltRounds = 10;


const bodyParser = require('body-parser');
const ejs = require('ejs');
const express = require('express');
const mongoose = require('mongoose');
var encrypt = require('mongoose-encryption');
//server
const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

//connecting to database
const uri = "mongodb+srv://admin:"+process.env.MONGO_KEY+"@cluster0.b8koz.mongodb.net/userDB?retryWrites=true&w=majority";
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

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


const User=mongoose.model('User',userSchema);


// route handlers
app.get('/', function (request, response) {
    response.render('home');
});


app.route('/login')
.get( function (request, response) {
    response.render('login');
})
.post(function (req,res) {
    //retrieve provided password
    const password=req.body.password;

    User.findOne({
        email: req.body.username
    },
    function (err,foundUser) {
        if(err){
            console.log(err);
        }else if(foundUser){
            //retrieve hashed password from DB
            const hash=foundUser.password;

            bcrypt.compare(password, hash, function(err, result) {
           
                if(result){
                    
                    res.render('secrets');  
                }
            });
        }

    });
});



app.route('/register')
.get( function (request, response) {
    response.render('register');
})
.post(function (req,res) {

    const password=req.body.password;

    bcrypt.hash(password, saltRounds, function(err, hash) {
        // Store user in DB.
        if(!err){
        const newUser=new User({
            email: req.body.username,
            password:hash
        });
        newUser.save(function (error) {
            if(error){
                console.log(error);
            }else{
                res.render('secrets');
    
            }
        });
    }
    });
});




app.listen(3000, function () {
    console.log('Server started on port 3000');
});