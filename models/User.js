//Declaring user mongoose schema and model
var mongoose = require('mongoose');

var childSchema = mongoose.Schema({
  firstName: String, 
  dob: Date, 
  specialty: String}
  );

var userSchema = mongoose.Schema({
    	name: String,
			email: String,
      hash: String,
      picture: String,
      gender: String,
      _location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location'},
		  children: [childSchema]
		});
  
mongoose.model('User', userSchema);

module.exports = function (connection) {
  return (connection || mongoose).model('User')
}
