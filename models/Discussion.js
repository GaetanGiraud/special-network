//Declaring user mongoose schema and model
var mongoose = require('mongoose');

var discussionSchema = mongoose.Schema({
  content: String, 
  type: String, // []update, people, info]
  createdAt: { type: Date, default: Date.now},
  updatedAt: { type: Date, default: Date.now},
  _creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  children: [ {type: mongoose.Schema.Types.ObjectId, ref: 'Child'}],
  groups: [ String ],
  tags: [ String ],
  video: {
    _creatorId:  {type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: String,
    name: String
  },
  pictures: [ { 
    _creatorId:  {type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    title: String
     } ],
  comments : [{
    _creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now}
    }]
 });

 
mongoose.model('Discussion', discussionSchema);

module.exports = function (connection) {
  return (connection || mongoose).model('Discussion')
}
