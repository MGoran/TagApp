angular.module('home.controller', []).controller('HomeCtrl', function($rootScope, $scope, $ionicModal,recorderControll, $timeout, $state, $sce, recorderControll, $interval) {
  $scope.$on("$ionicView.beforeEnter", function(event, data) {
		$rootScope.user = JSON.parse(localStorage.user);
		$rootScope.selectedCam = $rootScope.user.cameras[0];
    if (!$rootScope.isUser()) {
      $state.go('login')
    }

		$scope.recorder = {};
		var promise = recorderControll.getRecorderState($rootScope.selectedCam);
    promise.then(function(response) {
      if ($rootScope.selectedCam.recorderType === "vMix") {
        var xml = $.parseXML(response.data);
        $xml = $(xml);
        $scope.recorder.recording = $scope.stringToBool($xml.find("recording").text());
        $scope.recorder.streaming = $scope.stringToBool($xml.find("streaming").text());
        $scope.recorder.duration = $xml.find("recording").attr("duration");
        $scope.recorder.time = new Date().getTime() - ($scope.recorder.duration * 1000);
      } else if ($rootScope.selectedCam.recorderType === "Panofield") {
        console.log(response.data);
        $scope.recorder.recording = response.data.recording;
        $scope.recorder.streaming = response.data.streaming;
        $scope.recorder.duration = response.data.duration;
        $scope.recorder.time = new Date().getTime() - ($scope.recorder.duration);
        $scope.recorder.recording_id = response.data.recording_id;
        $scope.recorder.start = new Date(response.data.start);

        $rootScope.recorder = $scope.recorder;
      }
      if ($scope.recorder.recording) {
        $scope.data.currentProject = $rootScope.data.recordings[localStorage.lastRecordedVideo];
        $scope.data.currentProject.recording_id = response.data.recording_id;
      }
      console.log($scope.recorder);
    }, function(error) {
      console.log(error);
      if (error.status === -1) {
        alert("Recorder not available");
      }
    })

  });

  $scope.data = {};
  $scope.openStream = function(cam) {
    $rootScope.selectedCam = cam;
    $state.go('app.annotation_controller');
  }

  $scope.startProject = function() {
    $rootScope.selectedCam = $rootScope.user.cameras[0];
    $state.go('app.annotation_controller');
  }

  $scope.data.recorderAvailable = false;
  $scope.isRecorderAvailable = function() {
		return $scope.data.recorderAvailable;
  }

  $interval(function() {
    var promise = recorderControll.getRecorderState($rootScope.selectedCam);
    promise.then(
      function(response) {
        $scope.data.recorderAvailable = true;
      },
      function(error) {
        $scope.data.recorderAvailable = false;
      }
    );
  }, 2000);

});
