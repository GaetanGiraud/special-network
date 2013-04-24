//Declaring user mongoose schema and model
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    	name: String,
			email: String,
      createdAt: { type: Date, default: Date.now},
      hash: String,
      picture: String,
      gender: String,
      tokens: { 
        access_token : String,
        refresh_token : String
      },
      location: {      
        country: {short: String, long: String},
        state: {short: String, long: String},
        formattedAddress: String,
        locality: String,
        loc: { type: [Number], index: '2dsphere' }
      },
      settings: {
        createChildOptOut: {type: Boolean, default: false}
        }
		});
  
mongoose.model('User', userSchema);

module.exports = function (connection) {
  return (connection || mongoose).model('User')
}
