/*
 * Serve all APIS to our the application server
 */



// users api
//var users = require('./userapi');
//var locations = require('./locationapi');
//var children = require('./childrenapi');
//var messages = require('./messageapi');
//var children = require('./childrenapi');

exports.users = require('./userapi');
exports.locations = require('./locationapi');
exports.children = require('./childrenapi');
exports.discussions = require('./discussionsapi');
exports.messages = require('./messageapi');
exports.questions = require('./questionapi');
exports.tags = require('./tagapi');
