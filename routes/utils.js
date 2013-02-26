/*
 * 
 * Utils to clean up routes definitions
 * 
 */

// shorthand for handling mongoose errors. Obj can be a single object or an array of objects.
exports.errorHandler = function (res, err, obj) {
  if (!err) {
      return res.json(obj);
    } else {
      console.log(err.red);
      return res.send({'error':'An error has occurred'});
    }
};
