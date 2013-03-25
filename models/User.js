//Declaring user mongoose schema and model
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    	name: String,
			email: String,
      hash: String,
      picture: String,
      gender: String,
      _location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location'},
		  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Child'}],
      settings: {
        createChildOptOut: {type: Boolean, default: false}
        }
		});
  
mongoose.model('User', userSchema);

module.exports = function (connection) {
  return (connection || mongoose).model('User')
}
