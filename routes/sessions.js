/*
 * Handle Session logic
 * 
 * 
 */
 
var users = require('./userapi');


// Create new session
exports.new = function(req, res){
  users.authenticate(req.body.email, req.body.password, function(err, user){
    if (user) {
      // Regenerate session when signing in to prevent fixation 
      console.log('User logged in'.green);
      req.session.regenerate(function(){
        // Store the user's primary key in the session store to be retrieved,
        // or in this case the entire user object
        req.session.user = user;
        req.session.success = 'Authenticated as ' + user.name
          + ' click to <a href="/logout">logout</a>. '
          + ' You may now access <a href="/restricted">/restricted</a>.';
        delete user.hash; // don't send hash
        console.log(user);
        res.json(user);
      });
    } else {
      console.log('Wrong credentials'.red);
      req.session.error = 'Authentication failed, please check your '
        + ' username and password.'
        + ' (use "tj" and "foobar")';
      res.send(401, 'Wrong Credentials');
    }
  });
}
// Destroy session
exports.destroy = function(req, res){
  req.session.destroy();
  console.log('User logged out'.green);
  res.send(200);
};

// Current session information

exports.current = function(req, res){
  res.json(req.session);
};

exports.ping = function(req, res){
  if (req.session.user) {
    res.send(true); 
  } else {
    res.send(false);  
  }
};

//exports.isLoggedIn = function(req, res){
//  req.session.destroy();
//};
