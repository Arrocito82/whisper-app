//jshint esversion:6
const bodyParser = require('body-parser');
const ejs = require('ejs');
const express = require('express');
const mongoose = require('mongoose');

//server
const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

//connecting to database
const uri = "mongodb+srv://admin:AECa6Br9n683rst@cluster0.b8koz.mongodb.net/userDB?retryWrites=true&w=majority";
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

//database schemas
const userSchema = {
    email: {
        type: String,
        require: true
    },
    password:{
        type:String,
        require:true
    }

}

const User=mongoose.model('User',userSchema);
let juan=new User({email:'example@gmail.com',password:'password'});
// juan.save();



// route handlers
app.get('/', function (request, response) {
    response.render('home');
});


app.route('/login')
.get( function (request, response) {
    response.render('login');
})
.post(function (req,res) {
    const password=req.body.password;
    User.findOne({
        email: req.body.username
    },
    function (err,foundUser) {
        if(err){
            console.log(err);
        }else if(foundUser){
            if(foundUser.password===password){
                
                res.render('secrets');  
            }
        }

    });
});



app.route('/register')
.get( function (request, response) {
    response.render('register');
})
.post(function (req,res) {

    const newUser=new User({
        email: req.body.username,
        password:req.body.password
    });
    newUser.save(function (err) {
        if(err){
            console.log(err);
        }else{
            res.render('secrets');

        }
    });
});




app.listen(3000, function () {
    console.log('Server started on port 3000');
});