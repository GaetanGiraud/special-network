//Declaring user mongoose schema and model
var mongoose = require('mongoose');

var discussionSchema = mongoose.Schema({
  content: String, 
  type: String, // []update, people, info]
  createdAt: { type: Date, default: Date.now},
  updatedAt: { type: Date, default: Date.now},
  _creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  children: [ {type: mongoose.Schema.Types.ObjectId, ref: 'Child'}],
  tags: [ { tag: String }],
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
