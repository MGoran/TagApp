angular.module('oldFiles.controller', []).controller('OldFilesCtrl', function($rootScope, $scope, $ionicPopup, $timeout, $state, recorderControll, $interval, $cordovaEmailComposer, $filter, $cordovaFileTransfer, $ionicSideMenuDelegate, $ionicNavBarDelegate, $interval, $cordovaFile) {

  $scope.$on("$ionicView.beforeEnter", function(event, data) {


    $scope.showPlaybackVideoModal = false;
  });

  $scope.readDirectoryContent = function() {
    $scope.files = [];
    var files = [];
    if (ionic.Platform.isIOS()) {
      $scope.directory = cordova.file.documentsDirectory;
    } else {
      $scope.directory = cordova.file.dataDirectory;
    }
    console.log($scope.directory);
    window.resolveLocalFileSystemURL(
      $scope.directory,
      function(dirEntry) {
        var dirReader = dirEntry.createReader();

        dirReader.readEntries(
          function(entries) {
            console.log(entries); // directory entries
            for (i = 0; i < entries.length; i++) {
              if (entries[i].name.indexOf(".mp4") != -1) {
                console.log(entries[i]);
                files.push(entries[i]);
              }
            }
            $timeout(function() {
              $scope.files = files;
            })
          },
          function(err) {
            console.log(err);
          }
        );

      },
      function(err) {
        console.log(err);
      }
    );
  }
  $scope.readDirectoryContent();


  $scope.deleteFile = function(entry) {
    if (ionic.Platform.isIOS()) {
      $scope.directory = cordova.file.documentsDirectory;
    } else {
      $scope.directory = cordova.file.dataDirectory;
    }
    $cordovaFile.removeFile($scope.directory, entry.name)
      .then(function(result) {
        alert("File deleted");
        $scope.readDirectoryContent();
      }, function(err) {
        console.log(error);
        // Error
      });
  }

  $scope.startPlayback = function(entry) {
    $scope.showPlaybackVideoModal = true;
    var targetPath = entry.nativeURL
    console.log(targetPath);
    $scope.targetPath = targetPath;
		var video_block = document.getElementById('oldPlaybackVideoPlayer');

    video_block.innerHTML = "<video id='oldPlaybackPlay' width='100%' height='auto' controls autoplay src=" + targetPath + ">Your browser does not support video</video>";
		document.getElementById('oldPlaybackPlay').load();
    $timeout(function() {
      document.getElementById('oldPlaybackPlay').play();
    }, 2000)

  }
  $scope.hidePlaybackVideo = function() {
    $scope.showPlaybackVideoModal = false;
  }
});
