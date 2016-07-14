// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('TagApp', [
  'ionic',
  'angularCharts',
  'main.controller',
  'login.controller',
  'home.controller',
  'panofield.controller',
  'dahua.controller',
  'axis.controller',
  'settings.controller',
  'recorder.service',
  'timer',
	'ngCordova',
  "ngSanitize",
  "com.2fdevs.videogular",
	"com.2fdevs.videogular.plugins.controls",
	"com.2fdevs.videogular.plugins.buffering",
	"com.2fdevs.videogular.plugins.overlayplay"
])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'MainCtrl'
    })
    .state('login', {
      url: '/login',
      controller: 'LoginCtrl',
      templateUrl: 'templates/login.html'
    })
    .state('app.home', {
      url: '/home',
      views: {
        'menuContent': {
          templateUrl: 'templates/home.html',
          controller: 'HomeCtrl'
        }
      }

    })
    .state('app.panofield', {
      url: '/panofield',
      views: {
        'menuContent': {
          templateUrl: 'templates/panofield.html',
          controller: 'PanofieldCtrl'
        }
      }

    })
    .state('app.dahua', {
      url: '/dahua',
      views: {
        'menuContent': {
          templateUrl: 'templates/dahua.html',
          controller: 'DahuaCtrl'
        }
      }

    })
    .state('app.axis', {
      url: '/axis',
      views: {
        'menuContent': {
          templateUrl: 'templates/axis.html',
          controller: 'AxisCtrl'
        }
      }

    })
    .state('app.settings', {
      url: '/settings',
      views: {
        'menuContent': {
          templateUrl: 'templates/settings.html',
          controller: 'SettingsCtrl'
        }
      }

    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
});
