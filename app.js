
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  api = require('./routes/api'),
  colors = require('colors'),
  everyauth = require('everyauth');

var app = module.exports = express();

// Everyauth Configuration

everyauth.debug = true;

everyauth.password
  .loginWith('email')
  .getLoginPath('/login') // Uri path to the login page
  .postLoginPath('/api/login') // Uri path that your login form POSTs to
  .loginView('index.jade')
  .authenticate( function (login, password) {
    var promise = this.Promise();
    api.users.login(login, password, promise);
    return promise;
  })
  .loginSuccessRedirect('/') 
  .getRegisterPath('/login') // Uri path to the registration page
  .postRegisterPath('/api/users') // The Uri path that your registration form POSTs to
  .registerView(routes.index)
  .validateRegistration( function (newUserAttributes) {
  })
  .registerUser( function (newUserAttributes) {
     api.users.add(newUserAttributes);
  })
  .registerSuccessRedirect('/'); // Where to redirect to after a successful registration

everyauth.everymodule.findUserById( function (userId, callback) {
  
  api.users.findUserById(userId, callback);
  // callback has the signature, function (err, user) {...}
});

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(express.cookieParser());
  app.use(express.session({secret: 'ourkidsarespecial'}));
  app.use(everyauth.middleware());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});


//

// Routes




//app.post('/api/login', api.users.login);



// Routes

app.get('/', routes.index);
app.get('/login', routes.index);
app.get('/partials/:name', routes.partials);

/*
 *  JSON API
*/ 
app.get('/api/users', api.users.findAll);
app.get('/api/users/:id', api.users.findById);
//app.post('/api/users', api.users.add);
app.put('/api/users/:id', api.users.update);
app.delete('/api/users/:id', api.users.delete);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

// Start server

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
