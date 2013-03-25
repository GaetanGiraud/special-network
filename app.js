
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  api = require('./routes/api'),
  colors = require('colors'),
  RedisStore = require('connect-redis')(express),
  upload = require('jquery-file-upload-middleware');


var app = module.exports = express();

/* 
 * Express server configuration
 */
upload.configure({
  /*uploadDir: __dirname + '/public/uploads',
    uploadUrl: '/uploads',*/
    imageTypes: /\.(gif|jpe?g|png)$/i,
    imageVersions: {
       thumbnail: {
            width: 64,
            height: 64
            },
       icon: {
            width: 24,
            height: 24
            }
    }
});
    
app.configure(function(){
  // views
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
 
  //session logic
  app.use(express.cookieParser());
  app.use(express.session({ store: new RedisStore({host:'127.0.0.1', port:6379}), secret: 'ourkidsarespecial' }));
  //app.use(express.session({secret: 'ourkidsarespecial'}));
  app.use(express.methodOverride());
  
  // file upload middleware
  app.use('/upload', function (req, res, next) { 
    upload.fileHandler({
      uploadDir: function () {
        console.log(req.session);
        return __dirname + '/public/uploads/' + req.session.user
      },
      uploadUrl: function () {
        return '/uploads/' + req.session.user
      }
    
    })(req, res, next);
    
  });
  
  // some standard settings
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/public'));
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
 * Function for Restricting access to logged in users
 */
 
restrict = function (req, res, next) {
  var exeptions = ['login', 'logout', 'index']; // define exceptions to the restriction
  var name = req.params.name;
  
  if (exeptions.indexOf(name) != -1) { // check for exception to the restriction
    next(); 
  } else {
    if (req.session.user) {
    //  console.log(('User with id ' + req.session.user+ ' authorized to view this page').green);
      next();
    } else {
       req.session.error = 'Access denied!';
       console.log(('Unauthorized access from ip adress: ' + req.ip).red);
       res.send(401);          
    }
  }
}


/* 
 * Routes
 */

// Angular Templates routes
app.get('/', routes.index);
app.get('/partials/:name', restrict, routes.partials);
app.get('/templates/:name', restrict, routes.templates);

// Session management Routes

app.get('/sessions', routes.sessions.current);
app.get('/sessions/ping', routes.sessions.ping);
app.post('/sessions/new', routes.sessions.new);
app.delete('/sessions/destroy', routes.sessions.destroy);

// Current User
app.get('/api/currentuser', api.users.currentUser);

// User registration
app.post('/api/users', api.users.add);


/*
 *  JSON API - From there on only opened for logged in users
*/ 

// user API
app.get('/api/users', restrict, api.users.findAll);
app.get('/api/users/search', restrict, api.users.search)
app.get('/api/users/:id',restrict, api.users.findById);
app.put('/api/users/:id', restrict, api.users.update);
app.delete('/api/users/:id', restrict, api.users.delete);


// children API.
app.get('/api/children', restrict, api.children.findAll);
app.get('/api/children/:id',restrict, api.children.findById);
app.post('/api/children', restrict, api.children.add);
app.put('/api/children/:id', restrict, api.children.update);
app.delete('/api/children/:id', restrict, api.children.delete);

// discussion API.
app.get('/api/discussions', restrict, api.discussions.findAll);
app.get('/api/discussions/:id',restrict, api.discussions.findById);
app.post('/api/discussions', restrict, api.discussions.add);
app.post('/api/discussions/:id/comments', restrict, api.discussions.addComment);

//app.put('/api/discussions/:id', restrict, api.discussions.update);
//app.delete('/api/discussions/:id', restrict, api.discussions.delete);

// location API
app.get('/api/homelocation', restrict, api.locations.homeLocation);
app.get('/api/locations', restrict, api.locations.findAll);
app.get('/api/locations/:id',restrict, api.locations.findById);
app.post('/api/locations', restrict, api.locations.add);
app.put('/api/locations/:id', restrict, api.locations.update);
app.delete('/api/locations/:id', restrict, api.locations.delete);

//app.put('/api/users/:id', restrict, api.users.update);
//app.delete('/api/users/:id', restrict, api.users.delete);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

// Start server

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

