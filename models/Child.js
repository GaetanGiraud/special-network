//Declaring user mongoose schema and model
var mongoose = require('mongoose');

var specialtySchema = mongoose.Schema({
  name: String
  });

var superPowerSchema = mongoose.Schema({
  name: String
  });

var albumSchema = mongoose.Schema({
  title: String,
  content: [{ 
           type: {type: String, match: /(picture|video)/},
           _creatorId:  {type: mongoose.Schema.Types.ObjectId, ref: 'User' },
           name: String,
           title: String
           }]
  });


var childSchema = mongoose.Schema({
  name: {type: String, required: true},
  pageTitle: {type: String, unique: true, sparse: true, trim: true},
  dob: Date,
  gender: { type: String, match: /(boy|girl)/ },
  picture: String,
  creator: { _user: {type: mongoose.Schema.Types.ObjectId, ref: 'User' }, relationship: String },
  superpowers: [ {type: mongoose.Schema.Types.ObjectId, ref: 'Tag'} ],
  albums: [albumSchema],
  lastUpdate: {type: mongoose.Schema.Types.ObjectId, ref: 'Discussion' },
  permissions: [
   {
    _user: {type: mongoose.Schema.Types.ObjectId, ref: 'User' },// _id of an individual user or of a group
    rights: {type: String, match: /(read|write)/, default: 'read'}, // read - write
    relationship: String
    }]
  });

 
mongoose.model('Child', childSchema);

module.exports = function (connection) {
  return (connection || mongoose).model('Child')
}
