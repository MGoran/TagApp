angular.module('cameraMovement.service', []).service('cameraMovement', function($http, $rootScope) {
  var service = {};

  service.move = function(direction, command, camera) {
    switch (camera.cameraType) {
      case "Axis":
        {
          direction = direction.toLowerCase();
          if (command == "stop")
            direction = "stop"
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://" + camera.cameraIP + "/axis-cgi/com/ptz.cgi?move=" + direction,
            "method": "get",
            "headers": {
              'Authorization': 'Basic ' + btoa(camera.username + ':' + camera.password)
            }
          }
        }
        break;
      case "Dahua":
        {
          //command = command.capitalizeFirstLetter();
          direction = direction.capitalizeFirstLetter();
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://" + camera.cameraIP + "/cgi-bin/ptz.cgi?action=" + command + "&channel=0&code=" + direction + "&arg1=0&arg2=" + $rootScope.data.dahua_speed + "&arg3=0",
            "method": "get",
            "headers": {
              'Authorization': 'Basic ' + btoa(camera.username + ':' + camera.password)
            }
          }
        }
        break;
    }
    return $http(settings);
  }
  service.zoom = function(direction, command, camera) {
    switch (camera.cameraType) {
      case "Axis":
        {

        }
        break;
      case "Dahua":
        {
          //command = command.capitalizeFirstLetter();
          if (direction === "+") direction = "ZoomTele";
          else if (direction === "-") direction = "ZoomWide";
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://" + camera.cameraIP + "/cgi-bin/ptz.cgi?action=" + command + "&channel=0&code=" + direction + "&arg1=0&arg2=multiple&arg3=0",
            "method": "get",
            "headers": {
              'Authorization': 'Basic ' + btoa(camera.username + ':' + camera.password)
            }
          }
        }
        break;
    }
    return $http(settings);
  }
  service.preset = function(index, camera) {
    switch (camera.cameraType) {
      case "Axis":
        {

        }
        break;
      case "Dahua":
        {
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://" + camera.cameraIP + "/cgi-bin/ptz.cgi?action=start&channel=0&code=GotoPreset&arg1=0&arg2=" + index + "&arg3=0",
            "method": "get",
            "headers": {
              'Authorization': 'Basic ' + btoa(camera.username + ':' + camera.password)
            }
          }
        }
        break;
    }
    return $http(settings);
  }
  return service;
});
