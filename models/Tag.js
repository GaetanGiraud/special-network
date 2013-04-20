//Declaring user mongoose schema and model
var mongoose = require('mongoose');

var tagSchema = mongoose.Schema({
  title: {type: String, unique: true, sparse: true, trim: true},
  name: {type: String, unique: true, sparse: true, trim: true},
  description: String,
  picture: String,
  links: [ {
    url: String,
    title: String,
    description: String,
    picture: String
    }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
 });

 
mongoose.model('Tag', tagSchema);

module.exports = function (connection) {
  return (connection || mongoose).model('Tag')
}
