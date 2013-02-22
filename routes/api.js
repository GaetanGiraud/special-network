
/*
 * Serve JSON to our AngularJS client
 */


// Modular Rest API

exports.findById = function (req, res) {
  res.json({
  	name: 'Gaetan',
  	email: 'ggiraud@gmail.com',
  	location: 'delft'
  });
};

exports.findByEmail = function (req, res) {
  res.json({
  	name: 'Gaetan',
  	email: 'ggiraud@gmail.com',
  	location: 'delft'
  });
};

exports.findAll = function (req, res) {
  res.json(
  	{ 
			name: 'Gaetan',
		  email: 'ggiraud@gmail.com',
	  	location: 'delft'
	  	},
	  { 
			name: 'Paula',
		  email: 'pbeekman@gmail.com',
	  	location: 'delft'
	  	}
  );
};

exports.add = function (req, res) {
  console.log('user created'.green);
  res.json({
  	name: 'Created Gaetan',
  	email: 'Created ggiraud@gmail.com',
  	location: 'Created delft'
  });
};

exports.update = function (req, res) {
  console.log('user updated'.green);
  res.json({
  	name: 'Updated Gaetan',
  	email: 'Updated ggiraud@gmail.com',
  	location: 'Updated delft'
  });
};

exports.delete = function (req, res) {
  console.log('user deleted'.green);
  res.send(req.body);
};
