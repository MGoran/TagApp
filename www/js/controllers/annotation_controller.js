angular.module('annotationController.controller', []).controller('AnnotationControllerCtrl', function($rootScope, $scope, $ionicPopup, $timeout, $state, cameraMovement, recorderControll, $interval, $cordovaEmailComposer) {
  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    if (!$rootScope.isUser()) {
      $state.go('login')
    }
  });
  $scope.$on("$ionicView.enter", function(event, data) {
    console.log($rootScope.selectedCam);
    if ($rootScope.selectedCam.cameraType === "Dahua") {
      $scope.videoSource = "http://" + $rootScope.selectedCam.cameraIP + "/axis-cgi/mjpg/video.cgi?camera=1";
    } else if ($rootScope.selectedCam.cameraType === "Axis") {
      $scope.videoSource = "http://" + $rootScope.selectedCam.cameraIP + "/axis-cgi/mjpg/video.cgi?camera=5&subtype=1";
    }
    $scope.recorder = {};
    $scope.getRecorderState();
    $scope.blinkingColor = "white";
    $interval(function() {
      if ($scope.blinkingColor === "red")
        $scope.blinkingColor = "white";
      else
        $scope.blinkingColor = "red";
    }, 600);
  });

  $scope.ptzMove = function(direction, command) {
    var promise = cameraMovement.move(direction, command, $rootScope.selectedCam);
    promise.then(function(response) {
      console.log(response);
    }, function(error) {
      console.log(error);
    })
  }

  $scope.ptzZoom = function(direction, command) {
    var promise = cameraMovement.zoom(direction, command, $rootScope.selectedCam);
    promise.then(function(response) {
      console.log(response);
    }, function(error) {
      console.log(error);
    })
  }

  $scope.gotoPreset = function(index, command) {
    var promise = cameraMovement.preset(index, $rootScope.selectedCam);
    promise.then(function(response) {
      console.log(response);
    }, function(error) {
      console.log(error);
    })
  }


  $scope.getRecorderState = function() {
    var promise = recorderControll.getRecorderState($rootScope.selectedCam);
    promise.then(function(response) {
      var xml = $.parseXML(response.data);
      $xml = $(xml);
      $scope.recorder.recording = $scope.stringToBool($xml.find("recording").text());
      $scope.recorder.external = $scope.stringToBool($xml.find("external").text());
      $scope.recorder.streaming = $scope.stringToBool($xml.find("streaming").text());
      $scope.recorder.duration = $xml.find("recording").attr("duration");
      $scope.recorder.time = new Date().getTime() - ($scope.recorder.duration * 1000);
      console.log($scope.recorder);
      $xml = $(xml);
    }, function(error) {
      console.log(error);
    })
  }

  $scope.startRecorder = function() {
    var promise = recorderControll.startRecorder($rootScope.selectedCam);
    promise.then(function(response) {
      console.log(response);
      $timeout(function() {
        $scope.getRecorderState();
      }, 1000);
    }, function(error) {
      console.log(error);
    })
  }

  $scope.stopRecorder = function() {
    var promise = recorderControll.stopRecorder($rootScope.selectedCam);
    promise.then(function(response) {
      console.log(response);
      $timeout(function() {
        $scope.getRecorderState();
      }, 1000);
    }, function(error) {
      console.log(error);
    })
  }

  $scope.addEvent = function(event, team) {
    if (!$scope.recorder.recording) return false;
    var start = (parseInt($scope.recorder.duration) - parseInt($rootScope.data.event_before));
    var end = parseInt($scope.recorder.duration) + parseInt($rootScope.data.event_after);
    var xml = '<?xml version="1.0"?>';
    xml += "	<annotation>";
    xml += "	<team>" + team + "</team>";
    xml += "	<event start='" + start + "' end='" + end + "'>" + event.name + "</event>";
    xml += "	<camera type='" + $rootScope.selectedCam.cameraType + "' ip='" + $rootScope.selectedCam.cameraIP + "'></camera>";
    xml += "	<recorder type='" + $rootScope.selectedCam.recorderType + "' ip='" + $rootScope.selectedCam.recorderIP + "'></recorder>";
    xml += "</annotation>";
    var deviceInformation = ionic.Platform.device();
    console.log(deviceInformation)
    console.log(xml)
    return false;
    $cordovaEmailComposer.isAvailable().then(function() {
      var email = {
        to: $rootScope.data.email_to,
        cc: '',
        bcc: [],
        attachments: [],
        subject: $rootScope.data.email_subject,
        body: xml,
        isHtml: false
      };

      $cordovaEmailComposer.open(email).then(null, function() {
        console.log("email client closed");
      });
    }, function() {
      alert("Email service not available")
    });
  }

  $scope.stringToBool = function(value) {
    if (value.toLowerCase() === "true") return true;
    return false
  }
});
