angular.module('axis.controller', []).controller('AxisCtrl', function($rootScope, $scope, $ionicModal, $timeout, $state, $interval, $http, $ionicPopup) {
  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    if (!$rootScope.isUser()) {
      $state.go('login')
    }
  });
  var authdata = btoa("root" + ':' + "toor123");

  $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata;
  $scope.pan = function(direction) {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": $rootScope.selectedCam.ip + "/axis-cgi/com/ptz.cgi?move=" + direction,
        "method": "get",
        "headers": {
          'Authorization': 'Basic ' + authdata
        }
      }
      console.log(settings);
    },
    function(err) {
      console.log(err);
    }
  $scope.zoom = function(direction) {
    var settings = {
      "async": true,
      "crossDomain": true,
      "url":$rootScope.selectedCam.ip+ "/axis-cgi/com/ptz.cgi?zoom=" + direction,
      "method": "get",
      "headers": {
        'Authorization': 'Basic ' + authdata
      }
    }
    console.log(settings);
    $http(settings).then(function(response) {
      console.log(response);
    }, function(err) {
      console.log(err);
    });
  }
  $scope.gotoPreset = function(index) {
    var settings = {
      "async": true,
      "crossDomain": true,
      "url":$rootScope.selectedCam.ip+ "cgi-bin/ptz.cgi?action=start&channel=0&code=GotoPreset&arg1=0&arg2=" + index + "&arg3=0",
      "method": "get",
      "headers": {
        'Authorization': 'Basic ' + authdata
      }
    }
    console.log(settings);
    $http(settings).then(function(response) {
      console.log(response);
    }, function(err) {
      console.log(err);
    });
  }
});
