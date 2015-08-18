var controllerId = 'radarController';

angular.module('app', []).controller(controllerId, ['$scope', '$timeout', radarController]);

function radarController($scope, $timeout) {

    //setting the location of the toaster notifications 
    toastr.options = {
        "positionClass": "toast-bottom-right",
    }

    var radarMiddle = { 'x': $("#radar").position().left + ($("#radar").width() / 2), 'y': $("#radar").position().top + ($("#radar").height() / 2) };

    var circleDiameter = 15;
    $scope.clickedCircle = 'poop';

    $scope.circles = [{ 'Name': 'Bootstrap', 'x': 50, 'y': 50 }, { 'Name': 'Bootstrap2', 'x': 10, 'y': 10 }]
    toastr["success"]("This happened", "PAGE LOADED")
    makeCirclesDraggable()

    $('[data-toggle="tooltip"]').tooltip({
        placement: 'top'
    });

    //FUNCTIONS -------------------------------------------------------------------------------------------------------------------------------------

    $scope.createCircle = function () {
        $scope.circles.push({ 'Name': $scope.circleName, 'x': 0, 'y': 0, 'Website': $scope.website });
        makeCirclesDraggable()
    }

    $scope.editCircle = function () {
        $scope.nameEdit = $scope.clickedCircle.Name; 
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

            calculateCirclePositions(circle)

            $timeout(function () { //Move code up the callstack to tell Angular to watch this 
                //makes the circle draggable as well logging the position it is lifted from and where it is dropped to the console
                $("#" + circle.Name).draggable({
                    // Find original position of dragged circle.
                    start: function (event, ui) {
                        // Show start dragged position of circle.
                        var Startpos = $(this).position();
                    },
                    // Find position where circle is dropped.
                    stop: function (event, ui) {

                        // Show dropped position.
                        var Stoppos = $(this).position();

                        //updating it's location
                        var radarTopLeft = { 'x': $("#radar").position().left, 'y': $("#radar").position().top };

                        circle.x = ((Stoppos.left - radarTopLeft.x) / $("#radar").width()) * 100;
                        circle.y = ((Stoppos.top - radarTopLeft.y) / $("#radar").height()) * 100;

                        //working out distance of the circle from the centre and then assigning the state of the circle depending where it is dropped
                        findCircleRealPosition(circle);

                        var distanceFromCentre = Math.sqrt(Math.pow((circle.realX - radarMiddle.x), 2) + Math.pow((circle.realY - radarMiddle.y), 2));
                        var percentOfRadius = (distanceFromCentre / ($("#radar").width() / 2)) * 100;

                        var stateBefore = circle.State;

                        if (percentOfRadius <= 27.6) {
                            circle.State = 'Adopt';
                        }
                        else if (percentOfRadius > 27.6 && percentOfRadius <= 49.7) {
                            circle.State = 'Trial';
                        }
                        else if (percentOfRadius > 49.7 && percentOfRadius <= 72.9) {
                            circle.State = 'Assess';
                        }
                        else if (percentOfRadius > 72.9 && percentOfRadius <= 95.3) {
                            circle.State = 'Hold';
                        }

                        //if there is a change in state, display it on the screen using TOASTR
                        if (circle.State != stateBefore) {
                            toastr["success"]("State changed to: " + circle.State, circle.Name);
                        }

                        //When you drop the circle will know what type it has been dropped into and store that type
                        if (circle.realX < radarMiddle.x && circle.realY < radarMiddle.y)
                            circle.CircleType = 'Techniques';
                        else if (circle.realX > radarMiddle.x && circle.realY < radarMiddle.y)
                            circle.CircleType = 'Tools';
                        else if (circle.realX > radarMiddle.x && circle.realY > radarMiddle.y)
                            circle.CircleType = 'Languages & Frameworks';
                        else if (circle.realX > radarMiddle.x && circle.realY > radarMiddle.y)
                            circle.CircleType = 'Platforms';
                    }
                });

                //creating a tooltip for each circle with it's name
                Tipped.create("#" + circle.Name, circle.Name, { position: 'topleft' });
            });

        });
    }

    function calculateCirclePositions(circle) {
        $timeout(function () { //Move code up the callstack to tell Angular to watch this  

            //using the size and location of the radar image as a reference to position the circles. 
            findCircleRealPosition(circle);

            $("#" + circle.Name).css({ top: circle.realY, left: circle.realX });

            //Giving the circles a size depending on how big the window is
            var circleSize = ($("#radar").width() / 722) * circleDiameter;

            $("#" + circle.Name).css("width", circleSize);
            $("#" + circle.Name).css("height", circleSize);
        });
    }

    function findCircleRealPosition(circle) {
        //using the size and location of the radar image as a reference to position the circles. 
        var radarTopLeft = { 'x': $("#radar").position().left, 'y': $("#radar").position().top };
        radarMiddle = { 'x': $("#radar").position().left + ($("#radar").width() / 2), 'y': $("#radar").position().top + ($("#radar").height() / 2) };

        var circleX = radarTopLeft.x + (($("#radar").width() / 100) * circle.x);
        var circleY = radarTopLeft.y + (($("#radar").height() / 100) * circle.y);

        circle.realX = circleX;
        circle.realY = circleY; 
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
                makeCirclesDraggable();
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