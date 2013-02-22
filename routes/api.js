
/*
 * Serve JSON to our AngularJS client
 */


// User Model API

var db = require('../database').connection
  , User = require('../models/User')(db);


exports.findUserById = function (req, res) {
  /*var id = req.params.id;
  if (id > 0 && id <= data.users.length) { 
		res.json({
			user: data.users[id]
			});
	} else {
    res.json(false);		
  }*/

};

exports.findUserByEmail = function (req, res) {
  /*res.json({
  	name: 'Gaetan',
  	email: 'ggiraud@gmail.com',
  	location: 'delft'
  });*/
};

exports.findAllUsers = function (req, res) {
  /*res.json(data.users);*/
};

exports.addUser = function (req, res) {
  console.log('user created'.green);
  user = new User({name: 'Gaetan Giraud', email: 'gaetangiraud@gmail.com'});
};

exports.updateUser = function (req, res) {
  console.log('user updated'.green);
};

exports.deleteUser = function (req, res) {
  console.log('user deleted'.green);
}; 
