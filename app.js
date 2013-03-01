
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  api = require('./routes/api'),
  colors = require('colors'),
  RedisStore = require('connect-redis')(express);


var app = module.exports = express();

/* 
 * Express server configuration
 */
 
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/public'));
  app.use(express.cookieParser());
  app.use(express.session({ store: new RedisStore({host:'127.0.0.1', port:6379}), secret: 'ourkidsarespecial' }));
  //app.use(express.session({secret: 'ourkidsarespecial'}));
  app.use(express.methodOverride());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(function(req, res, next){res.send(404, 'Sorry cant find that!');}); // handling 404 errors. In prod template to be sent back.
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

/*
 * Restricting access 
 */
 
restrict = function (req, res, next) {
  if (req.session.user) {
    console.log(req.session.green);
    next();
  } else {
    req.session.error = 'Access denied!';
    console.log('Unauthorized access'.red);
    res.redirect('\login');
    //res.send(401, 'User need to log in');
  }
}


/* 
 * Routes
 */

// Angular Templates routes
app.get('/', restrict, routes.index);
app.get('/partials/:name', routes.partials);


// Session management Routes

app.get('/sessions', routes.sessions.current);
app.get('/sessions/ping', routes.sessions.ping);
app.post('/sessions/new', routes.sessions.new);
app.get('/sessions/destroy', routes.sessions.destroy);
app.get('/logout', routes.sessions.destroy); // alternative route for destroying sessions
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

//restricting view to logged in user




// Start server

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

