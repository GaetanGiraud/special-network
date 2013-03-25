/*
 * Serve all APIS to our the application server
 */



// users api
var users = require('./userapi');
var locations = require('./locationapi');
var children = require('./childrenapi');
//var children = require('./childrenapi');

exports.users = users;
exports.locations = locations;
exports.children = children;
exports.discussions = require('./discussionsapi');
