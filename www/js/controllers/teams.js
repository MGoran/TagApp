angular.module('teams.controller', []).controller('TeamsCtrl', function($rootScope, $scope, $ionicPopup, $timeout, $state, recorderControll) {
  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    $scope.player = {};
    $rootScope.data.team1 = JSON.parse(localStorage.team1);
    $rootScope.data.team2 = JSON.parse(localStorage.team2);
    $scope.selectedIndex = 1;
    $scope.selectedTeam = $rootScope.data.team1;
    if (!$rootScope.isUser()) {
      $state.go('login')
    }
  });

  $scope.selectTeam = function(index) {
    $scope.selectedIndex = index;
    $rootScope.data.team1 = JSON.parse(localStorage.team1);
    $rootScope.data.team2 = JSON.parse(localStorage.team2);
    if (index == 1) $scope.selectedTeam = $rootScope.data.team1;
    else $scope.selectedTeam = $rootScope.data.team2;
  }

  $scope.addNewPlayer = function() {
    // An elaborate, custom popup
    var temp = '<div class="list">';
    temp += '<label class="item item-input">';
    temp += '  <input type="text" ng-model="player.name" placeholder="Player Name">';
    temp += '</label>';
    temp += '<label class="item item-input">';
    temp += '  <input type="text"  ng-model="player.number"  placeholder="Player Number">';
    temp += '</label>';
    temp += '</div>';
    var myPopup = $ionicPopup.show({
      template: temp,
      title: 'New Player',
      //subTitle: 'Please use normal things',
      scope: $scope,
      buttons: [{
        text: 'Cancel'
      }, {
        text: '<b>Save</b>',
        type: 'button-positive',
        onTap: function(e) {
          if (!$scope.player.name) {
            //don't allow the user to close unless he enters wifi password
            e.preventDefault();
          } else {
            return $scope.player;
          }
        }
      }]
    });
    myPopup.then(function(res) {
      $rootScope.data.team1 = JSON.parse(localStorage.team1);
      $rootScope.data.team2 = JSON.parse(localStorage.team2);
      console.log($rootScope.data)
      if ($scope.selectedIndex === 1) {
        $rootScope.data.team1.players.push({
          "id": $rootScope.data.team1.players.length,
          "number": res.number,
          "name": res.name
        });
        $scope.selectedTeam = $rootScope.data.team1;
      } else {
        $rootScope.data.team2.players.push({
          "id": $rootScope.data.team1.players.length,
          "number": res.number,
          "name": res.name
        });
        $scope.selectedTeam = $rootScope.data.team2;
      }
      localStorage.team1 = JSON.stringify($rootScope.data.team1);
      localStorage.team2 = JSON.stringify($rootScope.data.team2);
      $scope.player = {};
    });
  }
  $scope.remove = function(index) {
    if ($scope.selectedIndex === 1) {
      $rootScope.data.team1.players.splice(index, 1);
      $scope.selectedTeam = $rootScope.data.team1;
    } else {
      $rootScope.data.team2.players.splice(index, 1);
      $scope.selectedTeam = $rootScope.data.team2;
    }
    localStorage.team1 = JSON.stringify($rootScope.data.team1);
    localStorage.team2 = JSON.stringify($rootScope.data.team2);
  }
  $scope.editTeamName = function() {
    $scope.team = {}
    if ($scope.selectedIndex === 1) {
      $scope.team.name = $rootScope.data.team1.name;
    } else {
      $scope.team.name = $rootScope.data.team2.name;
    }
    var temp = '<div class="list">';
    temp += '<label class="item item-input">';
    temp += '  <input type="text" ng-model="team.name" placeholder="Player Name">';
    temp += '</label>';
    temp += '</div>';
    var myPopup = $ionicPopup.show({
      template: temp,
      title: 'Edit Team name',
      //subTitle: 'Please use normal things',
      scope: $scope,
      buttons: [{
        text: '<b>Save</b>',
        type: 'button-positive',
        onTap: function(e) {
          if (!$scope.team.name) {
            //don't allow the user to close unless he enters wifi password
            e.preventDefault();
          } else {
            return $scope.team.name;
          }
        }
      }]
    });
    myPopup.then(function(res) {
			
      if ($scope.selectedIndex === 1) {
        $rootScope.data.team1.name = res;
        $scope.selectedTeam = $rootScope.data.team1;
      } else {
        $rootScope.data.team2.name = res;
        $scope.selectedTeam = $rootScope.data.team2;
      }

      localStorage.team1 = JSON.stringify($rootScope.data.team1);
      localStorage.team2 = JSON.stringify($rootScope.data.team2);
    });
  }
});
