//Declaring user mongoose schema and model
var mongoose = require('mongoose');

var specialtySchema = mongoose.Schema({
  name: String
  });

var superPowerSchema = mongoose.Schema({
  name: String
  });

var albumSchema = mongoose.Schema({
  content: String,
  type: {type: String, match: /(text|photo|video)/}
  });


var childSchema = mongoose.Schema({
  name: {type: String, required: true},
  pageTitle: {type: String, unique: true, sparse: true, trim: true},
  dob: Date,
  gender: { type: String, match: /(boy|girl)/ },
  picture: {_creatorId:  {type: mongoose.Schema.Types.ObjectId, ref: 'User' } , picture: String},
  creator: { _user: {type: mongoose.Schema.Types.ObjectId, ref: 'User' }, relationship: String },
  specialties: [String],
  superpowers: [String],
  albums: [albumSchema],
  lastUpdate: {type: mongoose.Schema.Types.ObjectId, ref: 'Discussion' },
  permissions: [
   {
    _user: {type: mongoose.Schema.Types.ObjectId, ref: 'User' },// _id of an individual user or of a group
    rigths: {type: String, match: /(read|write)/}, // read - write
    relationship: String
    }]
  });

 
mongoose.model('Child', childSchema);

module.exports = function (connection) {
  return (connection || mongoose).model('Child')
}
