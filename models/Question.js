//Declaring user mongoose schema and model
var mongoose = require('mongoose');

var answerSchema = mongoose.Schema({
  content: String, 
  totalVotes: {type: Number, default: 0},
  votes: [{
      vote: Number,
      _creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }], 
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
  title: {type: String, unique: true, sparse: true, trim: true},
  content: String, 
  details: String,
  createdAt: { type: Date, default: Date.now},
  updatedAt: { type: Date, default: Date.now},
  _creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  answers: [ answerSchema ],
  tags: [  {type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}  ],
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
