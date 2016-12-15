angular.module('projects.controller', []).controller('ProjectsCtrl', function($scope, $rootScope, $ionicPopup, $state, $stateParams, $filter, $cordovaEmailComposer) {
  $scope.projects = JSON.parse(localStorage.recordings);
  if ($stateParams.id) {
    $scope.projectName = Object.keys($scope.projects)[$stateParams.id];
    $scope.project = $scope.projects[$scope.projectName];
    $scope.title = "Recording: " + $scope.project.recording_id;
    $scope.project.score1 = $filter('filter')($scope.project.annotations, function(value) {
      if (value.team !== undefined) {
        return value.team.id === 1 && value.event.name === 'Goal';
      } else {
        return false
      }
    }).length;
    $scope.project.score2 = $filter('filter')($scope.project.annotations, function(value) {
      if (value.team !== undefined) {
        return value.team.id === 2 && value.event.name === 'Goal';
      } else {
        return false;
      }
    }).length;
  }
  $scope.sendXml = function(project) {
    console.log("Send XML");
    var annotations = project.annotations;
    if (annotations.length === 0) return false;
    var camera = annotations[0].camera;
    var xml = '<?xml version="1.0"?>';
    xml += '<recording>';
    xml += "	<id>" + project.recording_id + "</id>";
    xml += "	<camera type='" + camera.cameraType + "' ip='" + camera.cameraIP + "'></camera>";
    xml += "	<recorder type='" + camera.recorderType + "' ip='" + camera.recorderIP + "'></recorder>";
    xml += "	<annotations>";
    angular.forEach(annotations, function(a, index) {
      xml += "<annotation>";
      xml += "	<id>" + a.id + "</id>"
      xml += "	<name>" + a.event.name + "</name>";
      if (a.team !== undefined)
        xml += "	<team>" + a.team.name + "</team>";
      if (isNaN(parseInt(a.event.duration_before / 1000))) {
        console.log("timer time: " + a.timer_time);
        xml += "	<start>" + parseInt(a.timer_time / 1000) + "</start>";
        xml += "	<end>" + parseInt(a.timer_time / 1000) + "</end>"
      } else {
        xml += "	<start>" + parseInt(a.event.duration_before / 1000) + "</start>";
        xml += "	<end>" + parseInt(a.event.duration_after / 1000) + "</end>";
      }
      if (a.player !== null && a.player !== undefined) {
        xml += "  <player number='" + a.player.number + "'>" + a.player.name + "</player>";
      }
      xml += "</annotation>";
    });
    xml += "	</annotations>";
    xml += '</recording>';
    console.log(xml);
    var filename = localStorage.lastRecordedVideo.replace(/\s+/g, '') + ".xml";
    $cordovaEmailComposer.isAvailable().then(function() {
      var email = {
        to: $rootScope.data.email_to,
        cc: '',
        bcc: [],
        attachments: "base64:" + filename + "//" + btoa(xml),
        subject: $rootScope.data.email_subject,
        body: xml,
        isHtml: false
      };
      console.log(email)
      $cordovaEmailComposer.open(email).then(null, function() {
        console.log("email client closed");
      });
    }, function() {
      alert("Email service not available")
    });
  }


});
