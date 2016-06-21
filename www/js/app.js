// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
		'ionic',
		'starter.controllers',
		"ngSanitize",
		"com.2fdevs.videogular",
		"com.2fdevs.videogular.plugins.controls",
		"com.2fdevs.videogular.plugins.overlayplay",
		"com.2fdevs.videogular.plugins.poster"
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
    controller: 'AppCtrl'
  })

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html'
      }
    }
  })

  .state('app.events', {
      url: '/events',
      views: {
        'menuContent': {
          templateUrl: 'templates/events.html',
		  controller: 'EventsCtrl'
        }
      }
    })
	.state('app.exportevents', {
      url: '/exportevents',
      views: {
        'menuContent': {
          templateUrl: 'templates/export-events.html',
		  controller: 'EventsCtrl'
        }
      }
    })
    .state('app.start', {
      url: '/start',
      views: {
        'menuContent': {
          templateUrl: 'templates/start.html',
          controller: 'StartCtrl'
        }
      }
    })
	.state('app.recorder', {
      url: '/recorder',
      views: {
        'menuContent': {
          templateUrl: 'templates/recorder.html',
          controller: 'RecorderCtrl'
        }
      }
    })
	.state('app.recordings',{
		url: '/recordings',
		views:{
			'menuContent':{
				templateUrl:'templates/recordings.html',
				controller: 'RecordingsCtrl'
			}
		}
	})
	.state('app.recording', {
		url: '/recording/:recordingId',
		views:{
			'menuContent':{
				templateUrl:'templates/recordingEvents.html',
				controller: 'RecordingEventsCtrl'
			}
		}
	})
	.state('app.settings', {
		url: '/settings',
		views:{
			'menuContent':{
				templateUrl:'templates/settings.html',
				controller: 'SettingsCtrl'
			}
		}
	})
	.state('app.videoserver', {
		url: '/videoserver',
		views:{
			'menuContent':{
				templateUrl:'templates/videoserver.html'
			}
		}
	})
	.state('app.streamcontrol', {
		url: '/streamcontrol',
		views:{
			'menuContent':{
				templateUrl:'templates/streamcontrol.html'
			}
		}
	})
	.state('app.axisstreamcontrol', {
		url: '/axisstreamcontrol',
		views:{
			'menuContent':{
				templateUrl:'templates/axisstreamcontrol.html'
			}
		}
	})
	.state('app.mjpeg', {
		url: '/mjpeg',
		views:{
			'menuContent':{
				templateUrl:'templates/mjpegtest.html'
			}
		}
	})
	.state('app.rtsp', {
		url: '/rtsp',
		views:{
			'menuContent':{
				templateUrl:'templates/rtsp.html'
			}
		}
	})
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/start');
})
