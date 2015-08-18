var controllerId = 'radarController';

angular.module('app', []).controller(controllerId, ['$scope', '$timeout', radarController]);

function radarController($scope, $timeout) {

    var circleDiameter = 15;
    $scope.clickedCircle = 'poop';

    $scope.circles = [{ 'Name': 'Bootstrap', 'x': 50, 'y': 50 }, { 'Name': 'Bootstrap2', 'x': 10, 'y': 10 }]

    makeCirclesDraggable()

    $('[data-toggle="tooltip"]').tooltip({
        placement: 'top'
    });

    //FUNCTIONS -------------------------------------------------------------------------------------------------------------------------------------

    $scope.createCircle = function () { 
        $scope.circles.push({ 'Name': $scope.circleName, 'x': 0, 'y': 0, 'CircleType': $scope.circleType, 'Website': $scope.website });
        makeCirclesDraggable()
    }

    $scope.editCircle = function () {
        $scope.nameEdit = $scope.clickedCircle.Name;
        $scope.typeEdit = $scope.clickedCircle.CircleType;
        $scope.websiteEdit = $scope.clickedCircle.Website;
    }

    $scope.saveEdit = function () {
        $scope.clickedCircle.Name = $scope.nameEdit;
        $scope.clickedCircle.CircleType = $scope.typeEdit;
        $scope.clickedCircle.Website = $scope.websiteEdit;

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
                        var radarTopLeft = { 'x': $("#radar").position().left, 'y': $("#radar").position().top };

                        circle.x = ((Stoppos.left - radarTopLeft.x) / $("#radar").width()) * 100;
                        circle.y = ((Stoppos.top - radarTopLeft.y) / $("#radar").height()) * 100;
                    }
                });

                calculateCirclePositions(circle)

                //creating a tooltip for each circle with it's name
                Tipped.create("#" + circle.Name, circle.Name, { position: 'topleft' });
            });

        });
    }

    function calculateCirclePositions(circle) {
        $timeout(function () { //Move code up the callstack to tell Angular to watch this  

            //using the size and location of the radar image as a reference to position the circles. 
            var radarTopLeft = { 'x': $("#radar").position().left, 'y': $("#radar").position().top };

            var circleX = radarTopLeft.x + (($("#radar").width() / 100) * circle.x);
            var circleY = radarTopLeft.y + (($("#radar").height() / 100) * circle.y);

            $("#" + circle.Name).css({ top: circleY, left: circleX });

            //Giving the circles a size depending on how big the window is
            var circleSize = ($("#radar").width() / 722) * circleDiameter;

            $("#" + circle.Name).css("width", circleSize);
            $("#" + circle.Name).css("height", circleSize); 
        });
    }

    //opening modal on double click to display info about circle
    $scope.openInfoModal = function (circle) { 
        $scope.clickedCircle = circle;
        $('#infoModal').modal('toggle'); 
    }

    //when the window resizes the circles will stay in the position they are meant to on the radar
    $(window).resize(function () {
        $.each($scope.circles, function (index, circle) {
            $timeout(function () {
                calculateCirclePositions()
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