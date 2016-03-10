angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

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

.controller('PlaylistsCtrl', function($scope) {

})
.controller('EventsCtrl', function($scope, $http){
	 var settings = {
	   "async": true,
	   "crossDomain": true,
	   "url": "http://82.176.144.239:9090/api/event_type",
	   "method": "GET",
	   //"headers": {
		 //"content-type": "application/json",
		 //"cache-control": "no-cache"
	  //}
	 }
	 $http(settings).then(function successCallback(response) {
		 console.log(response);
		 $scope.events = response.data;
	 }, function errorCallback(err) {
		 console.log(err);
	 });
	// $scope.events = {
		// "count": 5,
		// "list": [
			// {
			  // "id": 1,
			  // "name": "Goal"
			// },
			// {
			  // "id": 2,
			  // "name": "Corner"
			// },
			// {
			  // "id": 3,
			  // "name": "Free Kick"
			// },
			// {
			  // "id": 4,
			  // "name": "Chance"
			// },
			// {
			  // "id": 5,
			  // "name": "BB-BBT"
			// }
		// ]
	// }
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});
