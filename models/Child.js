//Declaring user mongoose schema and model
var mongoose = require('mongoose');

var specialtySchema = mongoose.Schema({
  name: String
  });

var superPowerSchema = mongoose.Schema({
  name: String
  });

var updateSchema = mongoose.Schema({
  content: String,
  type: {type: String, match: /(text|photo|video)/}
  });


var childSchema = mongoose.Schema({
  name: String, 
  dob: Date,
  gender: { type: String, match: /(boy|girl)/ },
  creator: { _creatorId: {type: mongoose.Schema.Types.ObjectId, ref: 'User' }, relationship: String },
  specialties: [specialtySchema],
  superpowers: [superPowerSchema],
  updates: [updateSchema],
  permissions: [
   {
    userId: mongoose.Schema.Types.ObjectId, // _id of an individual user or of a group
    rigth: {type: String, match: /(read|write)/}, // read - write
    relationship: String
    }]
  });

 
mongoose.model('Child', childSchema);

module.exports = function (connection) {
  return (connection || mongoose).model('Child')
}
