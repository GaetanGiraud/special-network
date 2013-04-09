/*
 * Handle Session logic
 * 
 * 
 */
 
var users = require('./userapi');
var children = require('./childrenapi');


// Create new session
exports.new = function(req, res){
  users.authenticate(req.body.email, req.body.password, function(err, user){
    if (user) {
      // Regenerate session when signing in to prevent fixation 
      req.session.regenerate(function(){
        // Store the user's primary key in the session store to be retrieved,
        // or in this case the entire user object
        req.session.user = user._id;
        console.log(('User ' + user.name + 'logged in').green);
        req.session.success = 'Authenticated as ' + user.name
          + ' click to <a href="/logout">logout</a>. '
          + ' You may now access <a href="/restricted">/restricted</a>.';
        res.json({"email": user.email, 
                  "name": user.name, 
                  "_id": user._id, 
                  'picture': user.picture, 
                  'location': user.location, 
                  'settings': user.settings});
      });
    } else {
      console.log('Unauthanticated access'.red);
      req.session.error = 'Authentication failed, please check your '
        + ' username and password.';
      res.send(300, 'Wrong Credentials');
    }
  });
}
// Destroy session
exports.destroy = function(req, res){
  req.session.destroy();
  console.log(('User logged out').green);
  res.send(200);
};

// Current session information

exports.ping = function(req, res){
  if (req.session.user) {
    var user = users.findById(req.session.user, function(err, user) {
      if (err) { return res.send(400); }// User does not exist.
      return ({"email": user.email, "name": user.name, "_id": user._id}); // User logged in.
    });
  } else {
    res.send(401);  // User not logged in. Client logic (Showing login page) handled by Angularjs.
  }
};

exports.restrict = function (req, res, next) {
  var exeptions = ['login', 'logout', 'index']; // define exceptions to the restriction
  var name = req.params.name;
  
  if (exeptions.indexOf(name) != -1) { // check for exception to the restriction
    next(); 
  } else {
    if (req.session.user) {
    
      next();
    } else {
       req.session.error = 'Access denied!';
       console.log(('Unauthorized access from ip adress: ' + req.ip).red);
       res.send(401);          
    }
  }
};

exports.restrictChildren = function (req, res, next) {
  var id = req.params.id;

  if (req.session.user) { 
      api.children.isAuthorized(id, req.session.user, function(err, result) {
        if (err) res.send(401, err);     
        
        if (result) {     
          next();
        } else {
         req.session.error = 'Access denied!';
         console.log(('Unauthorized access from ip adress: ' + req.ip).red);
         res.send(401);    
        }
      })
      
    } else {
       req.session.error = 'Access denied!';
       console.log(('Unauthorized access from ip adress: ' + req.ip).red);
       res.send(401);          
  
  }

}
