angular.module('recorder.service', []).service('recorder', function($http) {
    this.getStateOfRecorder = function (ip) {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": ip + "/api/recorder",
        "method": "GET",
      }
      $http(settings).then(function(response) {
        //console.log(response);
        return response;
      }, function(err) {
        //console.log(err);
        return err;
      });
    }
});
