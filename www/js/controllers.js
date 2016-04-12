angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $rootScope) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('PlaylistsCtrl', function($scope,$rootScope) {

})
.controller('EventsCtrl', function($scope, $http, $ionicPopup, $rootScope){
	$rootScope.team = [];
	$scope.checkCurrentEvents = function(){
		if($rootScope.recording_id != undefined){
			console.log($rootScope.recording_id);
			var settings = {
				"async": true,
				"crossDomain": true,
				"url": "http://84.104.56.233:9090/api/event?recording_id="+$rootScope.recording_id,
				"method": "GET",
			}
			$http(settings).then(function(response) {
				console.log(response);
				$rootScope.team[1] = response.data.team[0].name;
				$rootScope.team[2] = response.data.team[1].name;
				$scope.eventList = response.data.list;
				
				for(i=0;i<$scope.eventList.length;i++){
					$scope.eventList[i].event = $rootScope.events[$scope.eventList[i].event_type_id - 1];
					$scope.eventList[i].team = $rootScope.team[$scope.eventList[i].team_id];
					
					var dateStr = $scope.eventList[i].begin.split("-");
					var date = new Date(dateStr[0],dateStr[1],dateStr[2],dateStr[3],dateStr[4],dateStr[5]);
					$scope.eventList[i].start = date;
					var dateStr = $scope.eventList[i].end.split("-");
					var date = new Date(dateStr[0],dateStr[1],dateStr[2],dateStr[3],dateStr[4],dateStr[5]);
					$scope.eventList[i].stop = date;
					$scope.eventList[i].length = ($scope.eventList[i].stop - $scope.eventList[i].start) / 1000;
					
					
				}
				console.log($scope.eventList);
			}, function(err) {
				console.log(err);
			});
		}else{
			var settings = {
			"async": true,
			"crossDomain": true,
			"url": "http://84.104.56.233:9090/api/recorder",
			"method": "GET",
		}
		$http(settings).then(function(response) {
			console.log(response);
			$rootScope.recording_id = response.data.recording_id;
			$scope.checkCurrentEvents();
		}, function(err) {
			console.log(err);
		});
		}
	}
	$scope.checkCurrentEvents();
	if($rootScope.events === undefined){
		var settings = {
			"async": true,
			"crossDomain": true,
			"url": "http://84.104.56.233:9090/api/event_type",
			"method": "GET",
		}
		$http(settings).then(function(response) {
			console.log(response);
			$rootScope.events = response.data.list;
		}, function(err) {
			console.log(err);
		});
	}
	$scope.setEvent = function(event, team_id){
		var settings = {
		   "async": true,
		   "crossDomain": true,
		   "url": "http://84.104.56.233:9090/api/event",
		   "method": "POST",
		   "data": { 'event_type_id':event.id, team_id: team_id}
		}
		$http(settings).then(function(response) {
			console.log(response);
			$scope.checkCurrentEvents();
			var alertPopup = $ionicPopup.alert({
				title: 'New event added!',
				template: 'Event added succesfully'
			});

			//alertPopup.then(function(res) {
			//	console.log('Ok');
			//});
		}, function(err) {
			console.log(err);
			var alertPopup = $ionicPopup.alert({
				 title: 'Problem',
				 template: err.data.error
			   });

			   alertPopup.then(function(res) {
				 console.log('Ok');
			   });
		});
	}
})

.controller('StartCtrl', function($scope,$rootScope, $stateParams) {
})
.controller('RecorderCtrl', function($scope, $stateParams, $http,$ionicPopup, $rootScope){
	$scope.checkStatus = function(){
		var settings = {
			"async": true,
			"crossDomain": true,
			"url": "http://84.104.56.233:9090/api/recorder",
			"method": "GET",
		}
		$http(settings).then(function(response) {
			console.log(response);
			$scope.recorderStarted = response.data.recording;
			$rootScope.recording_id = response.data.recording_id;
		}, function(err) {
			console.log(err);
		});
	}
	$scope.startRecorder = function(){
		var settings = {
			  "async": true,
			  "crossDomain": true,
			  "url": "http://84.104.56.233:9090/api/recorder",
			  "method": "PUT",
			  "data": "{\"recording\":true}",
			 // 'headers': {'Content-Type': 'text/plain'}
		}
		console.log(settings);
		$http(settings).then(function(response) {
			console.log(response);
			if (response.data.error != "") txt = response.data.error;
			else txt = 'Recorder started';
			var alertPopup = $ionicPopup.alert({
				 title: 'Recorder',
				 template: txt
			   });
				
			   alertPopup.then(function(res) {
				 console.log('Ok');
				 $scope.checkStatus();
			   });
		}, function(err) {
			console.log(err);
		});
	}
	$scope.stopRecorder = function(){
		var settings = {
			  "async": true,
			  "crossDomain": true,
			  "url": "http://84.104.56.233:9090/api/recorder",
			  "method": "PUT",
			  "data": "{\"recording\":false}",
			 // 'headers': {'Content-Type': 'text/plain'}
		}
		console.log(settings);
		$http(settings).then(function(response) {
			console.log(response);
			var alertPopup = $ionicPopup.alert({
				 title: 'Recorder',
				 template: 'Recorder stoped'
			   });

			   alertPopup.then(function(res) {
				 console.log('Ok');
				 $scope.checkStatus();
			   });
		}, function(err) {
			console.log(err);
		});
	}
	$scope.checkStatus();
})

.controller('RecordingsCtrl', function($scope, $http, $ionicPopup, $rootScope, $filter){
	var settings = {
	   "async": true,
	   "crossDomain": true,
	   "url": "http://84.104.56.233:9090/api/recording",
	   "method": "GET",
	}
	$http(settings).then(function(response) {
		console.log(response);
		for(i=0;i<response.data.list.length;i++){
			var dateStr = response.data.list[i].start.split("-");
			var date = new Date(dateStr[0],dateStr[1],dateStr[2],dateStr[3],dateStr[4],dateStr[5]);
			response.data.list[i].start = date;
			var dateStr = response.data.list[i].stop.split("-");
			var date = new Date(dateStr[0],dateStr[1],dateStr[2],dateStr[3],dateStr[4],dateStr[5]);
			response.data.list[i].stop = date;
			response.data.list[i].length = (response.data.list[i].stop - response.data.list[i].start) / 1000;
		}
		$scope.recordings = response.data;
	}, function(err) {
			console.log(err);
	});
})
.controller('RecordingEventsCtrl', function($scope, $http, $ionicPopup, $stateParams, $rootScope){
	if($rootScope.events === undefined){
		var settings = {
			"async": true,
			"crossDomain": true,
			"url": "http://84.104.56.233:9090/api/event_type",
			"method": "GET",
		}
		$http(settings).then(function(response) {
			console.log(response);
			$rootScope.events = response.data;
			$scope.events = response.data;
			getRecordingDetails()
		}, function(err) {
			console.log(err);
		});
	}else{
		getRecordingDetails()
	}
	var settings = {
	   "async": true,
	   "crossDomain": true,
	   "url": "http://84.104.56.233:9090/api/recording/"+$stateParams.recordingId,
	   "method": "GET",
	}
	$http(settings).then(function(response) {
		console.log(response);
		$scope.recordingDetails = response.data;
	}, function(err) {
		console.log(err);
	});
	$scope.showRecordingEvents = function(recording){
		console.log(recording);
	}
	
	function getRecordingDetails(){
		var settings = {
		   "async": true,
		   "crossDomain": true,
		   "url": "http://84.104.56.233:9090/api/event?recording_id="+$stateParams.recordingId,
		   "method": "GET",
		}
		$http(settings).then(function(response) {
		 //console.log(response);
		
		for(i=0;i<response.data.list.length;i++){
			if(response.data.list[i].team_id == 1){
				response.data.list[i].team_name = response.data.team[0].name;
			}else{
				response.data.list[i].team_name = response.data.team[1].name;
			}
			response.data.list[i].event_name = $rootScope.events.list[response.data.list[i].event_type_id - 1].name
		}
		$scope.recordingEvents = response.data;
		console.log( $scope.recordingEvents);
		//$scope.$apply();
		}, function(err) {
			console.log(err);
			$scope.err = err.data;
		});
	} 

})
.filter('secondsToDateTime', [function() {
    return function(seconds) {
        return new Date(1970, 0, 1).setSeconds(seconds);
    };
}])