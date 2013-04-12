/* var _ = require('underscore'),
    EventEmitter = require('events').EventEmitter;
*/
var UploadMiddleware = function () {
  //  EventEmitter.call(this);
};
// require('util').inherits(JqueryFileUploadMiddleware, EventEmitter);

UploadMiddleware.prototype.uploadHandler = function (options) {
    return require('./upload')(this, options);
};

//UploadMiddleware.prototype.fileManager = function (options) {
//    return require('./lib/filemanager')(this, this.prepareOptions(_.extend(this.options, options)));
//};

module.exports = new UploadMiddleware();

*/
