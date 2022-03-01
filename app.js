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
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

//server
const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//connecting to database
const uri = "mongodb+srv://"+process.env.MONGO_USER+":" + process.env.MONGO_KEY + "@"+process.env.MONGO_CLUSTER_URL+"/"+process.env.MONGO_DATABASE+"?retryWrites=true&w=majority";
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).catch(error => console.log(`Database Connection Failed! ${error}`));

mongoose.set("useCreateIndex", true);


//database schemas
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    googleId:String

});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model('User', userSchema);

passport.use(User.createStrategy());
passport.serializeUser(function (user,done) {
    done(null,user.id);
});
passport.deserializeUser(function (id,done) {
    User.findById(id,function(err,user){
        done(err,user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

// route handlers
app.get('/', function(request, response) {
    response.render('home');
});

app.route('/secrets').get(function(req, res) {
        if (req.isAuthenticated()) {
            res.render('secrets');

        } else {
            res.redirect("/login");
        }
    }

);

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets', 
passport.authenticate('google', { failureRedirect: '/login' }),
function(req, res) {
// Successful authentication, redirect home.
res.redirect('/secrets');
});

app.route('/login')
    .get(function(request, response) {
        response.render('login');
    })
    .post(passport.authenticate('local', {
        successRedirect: '/secrets',
        failureRedirect: '/login'
    }));


app.route('/logout').get(function(req, res) {
    req.logout();
    res.redirect('/');
});
app.route('/register')
    .get(function(request, response) {
        response.render('register');
    })
    .post(function(req, res) {
        User.register({ username: req.body.username, active: false }, req.body.password, function(err, user) {
            if (err) {
                console.log(err);
                res.redirect('/register');
            } else {
                //using passport
                passport.authenticate("local")(req, res, function() {
                    res.redirect("/secrets");
                });
            }

            //using passport-local-mongoose
            // var authenticate = User.authenticate();
            // authenticate('username', 'password', function(err, result) {
            //     if (err) {

            //     }
            // });
        });

    });




app.listen(3000, function() {
    console.log('Server started on port 3000');
});