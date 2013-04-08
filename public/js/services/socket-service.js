'use strict';

/* Services */


// Registering REST resources

angular.module('CareKids.services', []).
  factory('Socket', ['$rootScope', function($rootScope) {
    var socket;
    var firstconnect = true;
      
    var connect = function() {
          if(firstconnect) {
                socket = io.connect(null);
                firstconnect = false;
          }
          else {
            socket.socket.reconnect();
          }
    }

     // disconnect socket on page change
    $rootScope.$on('$routeChangeSuccess', function() {
       if (socket) {
         socket.disconnect();
        }
    });
    
   socket.on('error', function (reason){
      console.error('error', reason);
     });
      
    socket.on('disconnect', function (reason){
        console.error('disconnect', reason);
    });
      
    socket.on('connect', function (){
          console.info('successfully established a working and authorized connection');
    });


    return {
      connect: function() {
        connect();
        return socket;
      }
    };
  }])
  
 
  


