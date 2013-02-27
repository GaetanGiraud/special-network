
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  //passport = require('passport'),
  //LocalStrategy = require('./config/passport-strategies/local-auth'),
  api = require('./routes/api'),
  colors = require('colors');



/**
 *  Passport Configuration
 */
/*
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  api.users.findUserById(id, function (err, user) {
    delete user.hash; // don't send hash
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  {usernameField: 'email'}, 
  function(email, password, done) {
    process.nextTick(function () {
      console.log('Checking user credentials'.green);
      api.users.login(email, password, done);
    });
  }
));
*/

var app = module.exports = express();

/* 
 * Express server configuration
 */
 
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(express.cookieParser());
  app.use(express.session({secret: 'ourkidsarespecial'}));
  //app.use(passport.initialize());
  //app.use(passport.session());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});


//app.post('/api/login', api.users.login);



/* 
 * Routes
 */

 
/*function(req, res) { 
  console.log('Catched request');
  res.render('login.jade');
  });*/
/*app.get('/api/logout',  function(req, res){
  req.logout();
  res.redirect('/');
});*/



/*
app.post('/api/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      req.flash('error', info.message);
      return res.redirect('/login')
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/users/' + user.username);
    });
  })(req, res, next);
});
*/

/*app.post('/api/login', function(req,res,next) {
  passport.authenticate('local',  function(err, user, info){ 
      console.log('User auth'.green);
//      res.send(user);
  });
  
  });
*/

//app.all('*', requireAuthentication, loadUser);

app.get('/', routes.index);
//app.get('/login', routes.login);
app.get('/logout', routes.logout);
app.get('/partials/:name', routes.partials);

// user log in
//app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }),
//  function(req, res) {
//    res.send('ok');
//  });

/*
 *  JSON API
*/ 




// user API
app.get('/api/users', api.users.findAll);
app.get('/api/users/:id', api.users.findById);
app.post('/api/users', api.users.add);
app.put('/api/users/:id', api.users.update);
app.delete('/api/users/:id', api.users.delete);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);




// Start server

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});




/**
* Simple route middleware to ensure user is authenticated.
*
*
*/

/*function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  console.log('Unenthauticated request'.red);
  res.redirect('/login')
}

// To handle all angularjs templates in one go
function templateAuthentification(req, res, next) {
  var pName = req.params.name;
  if (!(pName == 'login' || pName == 'bye' )){
     ensureAuthenticated(req, res, next);
  }
  return next();
}*/
