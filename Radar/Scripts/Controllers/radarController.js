var controllerId = 'radarController';

angular.module('app', []).controller(controllerId, ['$scope', '$timeout', radarController]);

function radarController($scope, $timeout) {
    $scope.circles = [{ 'Name': 'Bootstrap', 'x': 100, 'y': 100 }, { 'Name': 'Bootstrap2', 'x': 10, 'y': 10 }]

    $.each($scope.circles, function (index, circle) { 
        $timeout(function() { //Move code up the callstack to tell Angular to watch this
            $("#" + circle.Name).draggable();
            $("#" + circle.Name).css({ top: circle.y, left: circle.x });
        });
    }); 

    /*
    $("#radar").draggable({
        // Find original position of dragged image.
        start: function (event, ui) {
            // Show start dragged position of image.
            var Startpos = $(this).position();
            console.log(Startpos);
        },
        // Find position where image is dropped.
        stop: function (event, ui) {

            // Show dropped position.
            var Stoppos = $(this).position();
            console.log(Stoppos);
        }
    });*/ 
};