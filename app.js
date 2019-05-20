var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;mongoose.connect("mongodb://localhost:27017/myloginapp");
var bodyParser = require('body-parser');
const Verifier = require("email-verifier"); // email validation
let verifier = new Verifier("at_yPjOiG3xk5ImiS6QW5cczmbLh4emH");
verifier.verify("a@gmail.com", (err, data) => {
  if (err) throw err;
  console.log(data);
});


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var user=require('./routes/user')
var nouser=require('./routes/nouser')
var newuser=require('./routes/newuser')

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'hjs');

//view engine set up

var swig=require('swig');
app.engine('html', swig.renderFile);
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'html');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/user',user);
app.use('/nouser',nouser);
app.use('/newuser',newuser)
// creating a schema 

var userschema = new mongoose.Schema({
  fname: String,
  lname: String,
  email:String,
  password:String,
 reenterpassword:String
 });

 var User = mongoose.model("User", userschema);

 // saving data into database
 app.post("/savedata", (req, res) => {
  var myData = new User(req.body);
  myData.save()
  .then(item => {
  res.redirect('/newuser');
  })
  .catch(err => {
  res.status(400).send("unable to save to database");
  });
 });


 // login logic
 app.post("/signin", function(req, res){
  if(!req.body.email || !req.body.password){
     res.send("Please enter both email-id and password");
  } else {
    User.findOne({ email:req.body.email, password:req.body.password }, 
    function(err, response){
        if(response==null){
          res.render('nouser', {
            message: "Invalid user"}); 
       
       
        }
       else 
            {    res.render('user', {
              message: "Welcome "+ response.fname});           }
  });
     
  }
});

 // catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
