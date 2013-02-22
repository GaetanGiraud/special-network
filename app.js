
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  api = require('./routes/api'),
  colors = require('colors');

var app = module.exports = express();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

// JSON API
app.post('/api/login', api.login);

app.get('/api/users', api.findAllUsers);
app.get('/api/users/:id', api.findUserById);
app.post('/api/users', api.addUser);
app.put('/api/users/:id', api.updateUser);
app.delete('/api/users/:id', api.deleteUser);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

// Start server

app.listen(8000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
