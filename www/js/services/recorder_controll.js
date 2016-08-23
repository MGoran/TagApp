angular.module('recorderControll.service', []).service('recorderControll', function($http) {
  var service = {};
  service.getRecorderState = function(camera) {
    switch (camera.recorderType) {
      case "vMix":
        {
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://" + camera.recorderIP + "/api",
            "method": "get",
            "headers": {
              'Authorization': 'Basic ' + btoa(camera.username + ':' + camera.password)
            }
          }
        }
        break;
    }
    return $http(settings)
  }
  service.startRecorder = function(camera) {
    switch (camera.recorderType) {
      case "vMix":
        {
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://" + camera.recorderIP + "/api/?function=StartRecording",
            "method": "get",
            "headers": {
              'Authorization': 'Basic ' + btoa(camera.username + ':' + camera.password)
            }
          }
        }
        break;
    }
    return $http(settings)
  }

  service.stopRecorder = function(camera) {
    switch (camera.recorderType) {
      case "vMix":
        {
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://" + camera.recorderIP + "/api/?function=StopRecording",
            "method": "get",
            "headers": {
              'Authorization': 'Basic ' + btoa(camera.username + ':' + camera.password)
            }
          }
        }
        break;
    }
    return $http(settings)
  }
  return service;
});
