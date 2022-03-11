 //jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const _ = require("lodash");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app =express();
var listOfItems = ["Something in this list"];

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const studentSchema = new mongoose.Schema ({
  name:String,
  email: String,
  password: String,
  prn:String,
  year:String
});
const teacherSchema = new mongoose.Schema ({
  name:String,
  email: String,
  password: String,
  teacher_id:Number
});

studentSchema.plugin(passportLocalMongoose);
teacherSchema.plugin(passportLocalMongoose);

const Student = new mongoose.model("Student", studentSchema);

passport.use(Student.createStrategy());

passport.serializeUser(Student.serializeUser());
passport.deserializeUser(Student.deserializeUser());

const Teacher = new mongoose.model("Teacher", teacherSchema);

passport.use(Teacher.createStrategy());

passport.serializeUser(Teacher.serializeUser());
passport.deserializeUser(Teacher.deserializeUser());

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/loginT", function(req, res){
  res.render("loginT");
});

app.get("/loginS", function(req, res){
  res.render("loginS");
});

app.get("/sign_upT", function(req, res){
  res.render("sign_upT");
});

app.get("/sign_upS", function(req, res){
  res.render("sign_upS");
});

app.get("/homePage", function(req, res){
  res.render(`homePage`, { newListItems: listOfItems});
});


// app.get("/homePage", function(req, res){
//   if (req.isAuthenticated()){
//     res.render("homePage");
//   } else {
//     res.redirect("/login");
//   }
// });

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.post('/homePage', function(req, res){
  //save 'item' form data
  var item = req.body.newItem;
  //push 'item' data to 'items' array
  listOfItems.push(item);
  //reload to root
  res.redirect("/homePage");
});

app.post("/sign_upT", function(req, res){

  Teacher.register({name: req.body.fname}, req.body.email,req.body.password,req.body.tid, function(err, teacher){
    if (err) {
      console.log(err);
      res.redirect("/sign_upT");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/homePage");
      });
    }
  });

});

app.post("/loginT", function(req, res){

  const teacher = new Teacher({
   email:req.body.email,
   password:req.body.password,
   teacher_id:req.body.tid
  });

  req.login(teacher, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/homePage");
      });
    }
  });

});

app.post("/sign_upS", function(req, res){

  Student.register({name: req.body.fname}, req.body.email,req.body.password,req.body.prn,req.body.year, function(err, student){
    if (err) {
      console.log(err);
      res.redirect("/sign_upS");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/homePage");
      });
    }
  });

});

app.post("/loginS", function(req, res){

  const student = new Student({
   prn:req.body.prn,
   email:req.body.email,
   password:req.body.password,
  });

  req.login(student, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/homePage");
      });
    }
  });

});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
