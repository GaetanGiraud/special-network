
/**
 * Module dependencies.
 */

var express = require('express'),
  http = require('http')
  routes = require('./routes'),
  api = require('./routes/api'),
  colors = require('colors'),
  RedisStore = require('connect-redis')(express),
  SessionSockets = require('session.socket.io'),
  upload = require('jquery-file-upload-middleware');


var app = express();
var sessionStore = new RedisStore({host:'127.0.0.1', port:6379});
var cookieParser =  express.cookieParser('ourkidsarespecial');


var server = http.createServer(app);
var io = require("socket.io").listen(server);

/* 
 * Express server configuration
 */
upload.configure({
  /*uploadDir: __dirname + '/public/uploads',
    uploadUrl: '/uploads',*/
    imageTypes: /\.(gif|jpe?g|png)$/i,
    imageVersions: {
       thumbnail: {
            width: 100,
            height: 100
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
  app.use(cookieParser);
  app.use(express.session({ store: sessionStore }));
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
 


/* 
 * Routes
 */

var restrict = routes.sessions.restrict;

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
app.get('/api/users/contacts', restrict, api.users.findContacts)
app.get('/api/users/:id',restrict, api.users.findById);
app.put('/api/users/:id', restrict, api.users.update);
app.delete('/api/users/:id', restrict, api.users.delete);


// children API.
app.get('/api/children', restrict, api.children.findAll);
app.get('/api/children/:id',routes.sessions.restrictChildren, api.children.findById);
app.post('/api/children', restrict, api.children.add);
app.put('/api/children/:id', restrict, api.children.update);
app.delete('/api/children/:id', restrict, api.children.delete);

// discussion API.
app.get('/api/discussions', restrict, api.discussions.findAll);
app.get('/api/discussions/search', restrict, api.discussions.search)
app.get('/api/discussions/:id',restrict, api.discussions.findById);
app.post('/api/discussions', restrict, api.discussions.add);
app.post('/api/discussions/:id/comments', restrict, api.discussions.addComment);


// location API
app.get('/api/homelocation', restrict, api.locations.homeLocation);
app.get('/api/locations', restrict, api.locations.findAll);
app.get('/api/locations/:id',restrict, api.locations.findById);
app.post('/api/locations', restrict, api.locations.add);
app.put('/api/locations/:id', restrict, api.locations.update);
app.delete('/api/locations/:id', restrict, api.locations.delete);

// messages API
app.get('/api/messages', restrict, api.messages.findAll);
app.put('/api/messages/:id', restrict, api.messages.update);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

/*
 * 
 * Socket.io events
 * 
 * 
 */
 
 
//io.set('authorization', function (handshakeData, accept) {

 // if (handshakeData.headers.cookie) {
 //   console.log('cookie found!');

  //  handshakeData.cookie = cookieParser.parse(handshakeData.headers.cookie);

    //handshakeData.sessionID = connect.utils.parseSignedCookie(handshakeData.cookie['express.sid'], 'secret');

  //  if (handshakeData.cookie['express.sid'] == handshakeData.sessionID) {
   //   return accept('Cookie is invalid.', false);
   // }

  //} else {
   // return accept('No cookie transmitted.', false);
 // } 

 // return accept(null, true);
//});

io.set('log level', 1);

var SessionSockets = require('session.socket.io')
  , sessionSockets = new SessionSockets(io, sessionStore, cookieParser);



sessionSockets.on('connection', function(err, socket, session){
    
   // sessionSockets.getSession(socket, function (err, session) {
   //   if (err || !session.user) { 
  //      console.log('no sessions');
 //       socket.disconnect();
         //  console.log(session);
 //      console.log("Connection " + socket.id + " refused.");
 //       }
     
   // });
   
   socket.on('subscribe', function(data) { 
     socket.join(data.room);
     console.log('user joined room: ' + data.room);   
  })
   socket.on('unsubscribe', function(data) { 
     socket.leave(data.room); 
     console.log('user left room: ' + data.room);      
  })
   
   /* socket.on('commentAdded', function(data) {
      // storing only the comment creator id into the database.
      data.comment._creator = data.comment._creator._id;
      
      api.discussions.addComment(data.discussionId, data.comment, function(err, comment) {
        if (err) socket.emit('error', err);
        socket.broadcast.emit('newComment', comment);
      });
    });*/
   
   
    socket.on('commentAdded', function(data) {
      // storing only the comment creator id into the database.
      data.comment._creator = data.comment._creator._id;
      
      api.discussions.addComment(data.discussionId, data.comment, function(err, discussion, comment) {
        if (err) socket.emit('error', err);
        if (discussion.type == 'update') {
            discussion.children.forEach(function(element, index, array) {
              console.log('brodcasting to child_' + element._id);
              socket.broadcast.to('child_' + element._id).emit('newComment', {'discussionId': discussion._id, 'comment': comment});
            });
          }
        if (discussion.type == 'question') { 
          socket.broadcast.to('question_' + discussion._id).emit('newComment', {'discussionId': discussion._id, 'comment': comment});
        }
        socket.broadcast.to('discussions').emit('newComment', {'discussionId': discussion._id, 'comment': comment});
      });
    });
    
    socket.on('discussionCreated', function(data) {
      api.discussions.add(data, function(err, discussion) {        
        if (err) return socket.emit('error', err);
        socket.emit('discussionSavedSuccess', discussion);
        
        if (discussion.type == 'update') {
          
            discussion.children.forEach(function(element, index, array) {
              console.log('brodcasting to child_' + element._id);
              socket.broadcast.to('child_' + element._id).emit('newDiscussion', discussion);
            });
        }
        socket.broadcast.to('discussions').emit('newDiscussion', discussion);
        console.log((discussion._id + ' created').green);
        return;
      });
    });
    
    socket.on('replyAdded', function(data) {
      api.messages.addReply(data.messageId, data.reply, function(err, message) {
        if (err) socket.emit('error', err);
         message.receivers.forEach(function(element, index, array) {
              console.log('brodcasting to messages_' + element._user);
              socket.broadcast.to('messages_' + element._user._id).emit('newReply', message);
          });
         socket.broadcast.to('messages_' + message._creator._id).emit('newReply', message);
         console.log('brodcasting to messages_' + message._creator);
      });
    });
    
    socket.on('messageCreated', function(data) {
      console.log(data);
      api.messages.add(data, function(err, message) {    
        if (err) return socket.emit('error', err);
          socket.emit('messageSavedSuccess', message);
          
          message.receivers.forEach(function(element, index, array) {
              console.log('brodcasting to user_' + element._user._id);
              socket.broadcast.to('messages_' + element._user._id).emit('newMessage', message);
            });
          //socket.broadcast.to('messages_' + ).emit('newMessage', message);
          console.log((message._id + ' created').green);
        return;
      });
   
      
    });

});


// Start server

server.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

