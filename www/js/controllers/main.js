angular.module('main.controller', []).controller('MainCtrl', function($rootScope, $scope, $ionicModal, $timeout, $state) {
  $rootScope.isUser = function (){
    console.log($rootScope.user)
    return $rootScope.user !==undefined && $rootScope.user.validated
  }
  $scope.logout = function() {
    $rootScope.user = {};
    $state.go('login');
  }
});
