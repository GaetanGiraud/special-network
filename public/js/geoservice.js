/*
 * 
 * This module provides a Geo Service.
 * It encapsulates the google API services and provide them to the controllers.
 * 
 * 
 */
 
 
angular.module('geoService', []).
  /*
   * Geocoder using the geocoder api from @Google Maps.
   * It incorporates an undo function
   * 
   */
   
  factory('GeoCoder', ['Location', function(Location){
    var geocoder = new google.maps.Geocoder();
    
    return { 
      getBrowserLocation: function(callback) {
        if (navigator.geolocation){
          navigator.geolocation.getCurrentPosition(function(position){
          
            var LatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);  
            console.log(LatLng);
            
            geocoder.geocode({'location': LatLng}, 
              function(results, status) {
                if(status == google.maps.GeocoderStatus.OK) { 
                  console.log(results);
                  return callback(results, null);
                } else {
                  return callback(null, status);
                } 
            });  
          },
          function(error) { return callback(null, error); }
          );
        } else {
          return callback(null, "Geolocation is not supported by this browser.");
        }
      },
      
      getLocation: function(address, callback){

      // fetch location based on address from google map and store in array for presentation
  
         geocoder.geocode({
           'address': address.formattedAddress
         }, 
         function(results, status) {
           if(status == google.maps.GeocoderStatus.OK) { 
             return callback(results);
           }
           if(status == google.maps.GeocoderStatus.ZERO_RESULTS) {
              return callback([{ 'formatted_address': 'No match found, type some more!'}]);
           }
         });
      },
      parseAddress: function(address, callback) {  
        var parsedAddress = {};
        // parsing the google api address object
        
        address['address_components'].forEach(function(component) {
          //if ( component['types'].indexOf('street_number') != -1 ) { parsedAddress.streetNumber = component['short_name']; }
          //if ( component['types'].indexOf('route') != -1 ) { parsedAddress.route = component['short_name']; }
          
          if ( component['types'].indexOf('locality') != -1 ) { parsedAddress.locality = component['short_name']; } 
          if ( component['types'].indexOf('administrative_area_level_1') != -1 ) { parsedAddress.state = component['short_name']; }
          if ( component['types'].indexOf('country') != -1 ) { parsedAddress.country = component['short_name']; }
        });
        parsedAddress.lat = address["geometry"]['location']['lat']();
        parsedAddress.lng = address["geometry"]['location']['lng']();   
        
        
        // Setting some of the values to null when not present to allow for flexibility in the address format.
        //if (angular.isUndefined(parsedAddress.streetNumber)) parsedAddress.streetNumber = null;
        //if (angular.isUndefined(parsedAddress.route)) parsedAddress.route = null;
        
        if (angular.isUndefined(parsedAddress.state)) parsedAddress.state = null;
        if (angular.isUndefined(parsedAddress.locality)) parsedAddress.locality = null;     
        
        // Creating a custom formattedAddress based on present information
        if(parsedAddress.locality) { parsedAddress.formattedAddress = parsedAddress.locality + ', '};
        if(parsedAddress.state) { parsedAddress.formattedAddress = parsedAddress.formattedAddress + parsedAddress.state + ', '};
        parsedAddress.formattedAddress =  parsedAddress.formattedAddress + parsedAddress.country;
        

        return callback(parsedAddress);
      }
   }
  }]).
  /*
   * 
   * Factory for handling google maps. 
   *  Requires the google js api to be loaded before angular.
   */
  factory('Map', ['User', 'Location', function(User, Location){
    
    // Setting dummy overlay to allow drag and drop from outside the map.
    var dummy;
    
    function Dummy(map) {
      this.setMap(map);
    }
    Dummy.prototype = new google.maps.OverlayView();
    Dummy.prototype.draw = function() {};
    
   
   return {
     setMapOptions: function(homeLatLng) { 
       if(angular.isUndefined(customZoom)) { var customZoom = 12; }
      
       return {
         center: homeLatLng,
         zoom: customZoom,
         mapTypeId: google.maps.MapTypeId.ROADMAP,
       };
     },
     initialize: function(myMap) {
       dummy = new Dummy(myMap);
         
       var locations = Location.query(function() {
         angular.forEach(locations, function(location) {
           var coordinates = new google.maps.LatLng(location.lat, location.lng);
           var newMarker = new google.maps.Marker({
             map: myMap,
             position: coordinates
           });
           location.marker = newMarker;
          });
         });
       return locations;
     },
    dropEvent: function(e, myMap, callback){
      var element= e.target;
    
      var mapDiv = myMap.getDiv(),
          mapDivLeft = mapDiv.offsetLeft,
          mapDivTop = mapDiv.offsetTop,
          mapDivWidth = mapDiv.offsetWidth,
          mapDivHeight = mapDiv.offsetHeight;
      
      var dropPosLeft = e.clientX;
      var dropPosTop = e.clientY;
       
      var eleWidth = element.offsetWidth,
          eleHeight = element.offsetHeight;
  
      if (dropPosLeft > mapDivLeft && dropPosLeft < (mapDivLeft + mapDivWidth) && dropPosTop > mapDivTop && dropPosTop < (mapDivTop + mapDivHeight)) {
        
        var mapPosition = new  google.maps.Point(dropPosLeft -  mapDivLeft, dropPosTop + eleHeight/2- mapDivTop);
        var LatLng = dummy.getProjection().fromContainerPixelToLatLng(mapPosition);
        
        var newMarker = new  google.maps.Marker({
          map: myMap,
          position: LatLng
        });
        return callback(newMarker);
      } else {
       return callback(null); 
      }
     }
   }
  }]);
