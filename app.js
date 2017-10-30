var express = require("express"),
	app		= express(),
	path	= require('path'),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	config	= require('./config/config.js'),
	ConnectMongo = require('connect-mongo')(session),
	mongoose = require('mongoose');

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');

mongoose.Promise = global.Promise;
mongoose.connect(config.dbURL, {useMongoClient: true});

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

var env = process.env.NODE_ENV || 'development';
if(env == 'development'){
	app.use(session({
		secret: config.sessionSecret,
		saveUninitialized: true,
		resave: true
	}));
} else {
	app.use(session({
		secret: config.sessionSecret,
		store: new ConnectMongo({
			// url : config.dbURL,
			mongoose_connection:mongoose.connections[0],
			stringify: true
		}),
		saveUninitialized: true,
		resave: true
	}));
}

var userSchema = mongoose.Schema({
	username : String,
	password : String,
	fullname : String,
})

var Person = mongoose.model('users', userSchema);

var John = new Person({
	username : "johndoe",
	password : 'john123',
	fullname : "John Doe"
});

John.save(function(err){
	console.log('Done!');
});

require('./routes/routes.js')(express, app);

app.listen(3000, function(){
	console.log('ChatCAT started on port 3000');
	console.log('Mode: ' + env);
})