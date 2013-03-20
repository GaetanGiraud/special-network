//Declaring user mongoose schema and model
var mongoose = require('mongoose');

var locationSchema = mongoose.Schema({
      name: String,
      locationType: String, // user, PoI
      _creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	    country: {short: String, long: String},
      state: {short: String, long: String},
      formattedAddress: String,
      locality: String,
    //  route: String,
    //  streetNumber: Number,
      lat: Number,
      lng: Number
		});
  
mongoose.model('Location', locationSchema);

module.exports = function (connection) {
  return (connection || mongoose).model('Location')
}
