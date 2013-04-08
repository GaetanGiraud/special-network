//Declaring user mongoose schema and model
var mongoose = require('mongoose');

var messageSchema = mongoose.Schema({
  content: String, 
  action: {type: String, target: { type: mongoose.Schema.Types.ObjectId, ref: 'Child' },
  createdAt: { type: Date, default: Date.now},
  updatedAt: { type: Date, default: Date.now},
  _creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receivers: [ {type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  replies : [{
    _creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now}
    }]
 });

 
mongoose.model('Message', messageSchema);

module.exports = function (connection) {
  return (connection || mongoose).model('Message')
}
