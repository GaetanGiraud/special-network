
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index');
};

exports.partials = function (req, res) {
  var name = req.params.name;
  res.render('partials/' + name);
};

//exports.login = function (req, res) {
//  res.render('partials/login');
//};

exports.logout = function(req, res){
  req.logout();
  console.log('User logged out'.green);
};
