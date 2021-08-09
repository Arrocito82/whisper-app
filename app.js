//jshint esversion:6
const bodyParser =require('body-parser');
const ejs =require ('ejs');
const express= require('express');

//server
const app=express();

app.use(express.static('public'));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
extended:true
}));


app.listen(3000,function(){
    console.log('Server started on port 3000');
});