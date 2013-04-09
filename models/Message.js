//Declaring user mongoose schema and model
var mongoose = require('mongoose');

var messageSchema = mongoose.Schema({
  content: String, 
  action: {actionType: String, target: { type: mongoose.Schema.Types.ObjectId, ref: 'Child' }, executed: {type: Boolean } }, // todo or done
  read: {type: Boolean, default: false }, // read - unread
  createdAt: { type: Date, default: Date.now},
  updatedAt: { type: Date, default: Date.now},
  _creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receivers: [ {_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}, read: {type: Boolean, default: false } } ],
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
