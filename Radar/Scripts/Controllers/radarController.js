var controllerId = 'radarController';

angular.module('app', []).controller(controllerId, ['$scope', '$timeout', radarController]);

function radarController($scope, $timeout) {
    $scope.circles = [{ 'Name': 'Bootstrap', 'x': 50, 'y': 50 }, { 'Name': 'Bootstrap2', 'x': 10, 'y': 10 }]

    makeCirclesDraggable()

    $('[data-toggle="tooltip"]').tooltip({
        placement: 'top'
    });

    //FUNCTIONS -------------------------------------------------------------------------------------------------------------------------------------

    $scope.createCircle = function () {
        $scope.circles.push({ 'Name': $scope.circleName, 'x': 1000, 'y': 50 });
        makeCirclesDraggable()
    }

    function makeCirclesDraggable() {
        $.each($scope.circles, function (index, circle) {

            $timeout(function () { //Move code up the callstack to tell Angular to watch this 
                //makes the circle draggable as well logging the position it is lifted from and where it is dropped to the console
                $("#" + circle.Name).draggable({
                    // Find original position of dragged image.
                    start: function (event, ui) {
                        // Show start dragged position of image.
                        var Startpos = $(this).position();
                    },
                    // Find position where image is dropped.
                    stop: function (event, ui) {

                        // Show dropped position.
                        var Stoppos = $(this).position();

                        //updating it's location
                        circle.x = (Stoppos.left / $(window).width()) * 100;
                        circle.y = (Stoppos.top / $(window).height()) * 100;
                    }
                });
                $("#" + circle.Name).css({ top: ($(window).height() / 100) * circle.y, left: ($(window).width() / 100) * circle.x });

                //creating a tooltip for each circle with it's name
                Tipped.create("#" + circle.Name, circle.Name, { position: 'topleft' });
                console.log(circle);
            });

        });
    }

    //when the window resizes the circles will stay in the position they are meant to on the radar
    $(window).resize(function () {
        $.each($scope.circles, function (index, circle) {
            $timeout(function () {
                $("#" + circle.Name).css({ top: ($(window).height() / 100) * circle.y, left: ($(window).width() / 100) * circle.x });
            });
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