var controllerId = 'radarController';

angular.module('app', []).controller(controllerId, ['$scope', radarController]);

function radarController($scope) {
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