angular.module('dahua.controller', []).controller('DahuaCtrl', function($rootScope, $scope, $ionicModal, $timeout, $state, $interval, $http, $ionicPopup, recorder) {
  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    if (!$rootScope.isUser()) {
      $state.go('login')
    }
  });
  var authdata = btoa("admin" + ':' + "admin");
  $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata;
  $scope.pan = function(direction, action) {
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": $rootScope.selectedCam.ip + "/cgi-bin/ptz.cgi?action="+action+"&channel=0&code=" + direction + "&arg1=0&arg2="+$rootScope.data.dahua_speed+"&arg3=0",
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
  $scope.zoom = function(direction, action) {
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": $rootScope.selectedCam.ip + "/cgi-bin/ptz.cgi?action="+action+"&channel=0&code=" + direction + "&arg1=0&arg2=multiple&arg3=0",
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
      "url": $rootScope.selectedCam.ip + "/cgi-bin/ptz.cgi?action=start&channel=0&code=GotoPreset&arg1=0&arg2=" + index + "&arg3=0",
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
  var data = recorder.getStateOfRecorder($rootScope.selectedCam.recorder_ip);
  console.log(data);
});
