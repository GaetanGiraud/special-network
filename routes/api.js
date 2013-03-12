/*
 * Serve all APIS to our the application server
 */



// users api
var users = require('./userapi');
var locations = require('./locationapi');

exports.users = users;
exports.locations = locations;
