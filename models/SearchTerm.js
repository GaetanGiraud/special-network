//Declaring user mongoose schema and model
var mongoose = require('mongoose');

var SearchTermSchema = mongoose.Schema({
  term: {type: String, unique: true, sparse: true, trim: true},
  popularity: {type: Number, default: 0}
 });

 
mongoose.model('SearchTerm', SearchTermSchema);

module.exports = function (connection) {
  return (connection || mongoose).model('SearchTerm')
}
