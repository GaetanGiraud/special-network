//Declaring user mongoose schema and model
var mongoose = require('mongoose');

var answerSchema = mongoose.Schema({
  content: String, 
  votes: Number,
  _creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now},
  updatedAt: { type: Date, default: Date.now},
  comments: [{ 
            _creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            content: String,
            createdAt: { type: Date, default: Date.now}
           }]
  });


var questionSchema = mongoose.Schema({
  content: String, 
  createdAt: { type: Date, default: Date.now},
  updatedAt: { type: Date, default: Date.now},
  _creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  answers: [ answerSchema ],
  tags: [ String ],
  comments : [{
    _creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now}
    }]
 });

 
mongoose.model('Question', questionSchema);

module.exports = function (connection) {
  return (connection || mongoose).model('Question')
}
