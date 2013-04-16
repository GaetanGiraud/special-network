//Declaring user mongoose schema and model
var mongoose = require('mongoose');

var tagSchema = mongoose.Schema({
  name: {type: String, unique: true, sparse: true, trim: true},
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
 });

 
mongoose.model('Tag', tagSchema);

module.exports = function (connection) {
  return (connection || mongoose).model('Tag')
}
