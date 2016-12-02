angular.module('login.controller', []).controller('LoginCtrl', function($rootScope, $scope, $ionicModal, $timeout, $state, $ionicLoading,recorderControll) {
  //console.log(JSON.parse(localStorage.user));
  if (localStorage.user === undefined || localStorage.user === "") {
    $scope.data = {
      username: "user1",
      password: "password1",
      cameraType: "disabled",
      cameraIP: "84.104.56.233:8080",
      recorderType: "Panofield",
      //recorderIP: "62.238.246.143:5050" -> vMix
      recorderIP: "84.104.56.233:9090"
    };
  } else {
    $rootScope.user = JSON.parse(localStorage.user);
    $scope.data = $rootScope.user.cameras[0];
    $state.go("app.home");
  }
  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    if (localStorage.user !== undefined && localStorage.user !== "") {
      $rootScope.user = JSON.parse(localStorage.user);
      $scope.data = $rootScope.user.cameras[0];
      console.log($scope.data);
    }
  });
  $scope.login = function() {
    console.log($scope.data);
    $rootScope.user = {
      validated: true,
      id: 1,
      cameras: [{
        name: $scope.data.cameraType + "[" + $scope.data.cameraIP + "]",
        recorderType: $scope.data.recorderType,
        cameraType: $scope.data.cameraType,
        cameraIP: $scope.data.cameraIP,
        recorderIP: $scope.data.recorderIP,
        username: $scope.data.username,
        password: $scope.data.password
      }]
    }

    localStorage.user = JSON.stringify($rootScope.user);
    $rootScope.selectedCam = $rootScope.user.cameras[0];
		if(  $rootScope.selectedCam.recorderType === "Panofield"){
				$scope.getEventTypes();
		}
    $state.go("app.home");
  }

	$scope.showLoading = function() {
		$ionicLoading.show({
			template: '<ion-spinner></ion-spinner>'
		}).then(function() {
			console.log("The loading indicator is now displayed");
		});
	};
	$scope.hideLoading = function() {
		$ionicLoading.hide().then(function() {
			console.log("The loading indicator is now hidden");
		});
	};

  $scope.getEventTypes = function() {
    localStorage.user = JSON.stringify($rootScope.user);
    $rootScope.selectedCam = $rootScope.user.cameras[0];
    $scope.showLoading();
    var promise = recorderControll.getEventTypes($rootScope.selectedCam);
    promise.then(function(response) {
      console.log(response);
      var event_types = [];
      angular.forEach(response.data.list, function(event) {
        console.log(event)
        event_types.push({
          "name": event.name,
          "time_before": 10,
          "time_after": 10,
          "icon": "ion-alert",
          "start_counter": false,
          "generate_playback_video": true
        });
      });
      $rootScope.data.event_types = event_types;
      localStorage.event_types = JSON.stringify($rootScope.data.event_types);
      console.log("GotEventTypes")
      $scope.hideLoading();
    }, function(err) {
      console.log(err);
      $scope.hideLoading();
    })
  }

});
