var controllerId = 'radarController';

angular.module('app', []).controller(controllerId, ['$scope', '$timeout', radarController]);

function radarController($scope, $timeout) {
    $scope.circleNames = [];

    //used for listing the different technologies
    $scope.tools = { 'Hold': [], 'Assess': [], 'Trial': [], 'Adopt': [] };
    $scope.techniques = { 'Hold': [], 'Assess': [], 'Trial': [], 'Adopt': [] };
    $scope.laf = { 'Hold': [], 'Assess': [], 'Trial': [], 'Adopt': [] };
    $scope.platforms = { 'Hold': [], 'Assess': [], 'Trial': [], 'Adopt': [] };

    //setting the location of the toaster notifications 
    toastr.options = {
        "positionClass": "toast-bottom-right",
    }

    var radarTopLeft = { 'x': $("#radar").position().left, 'y': $("#radar").position().top };
    var radarMiddle = { 'x': $("#radar").position().left + ($("#radar").width() / 2), 'y': $("#radar").position().top + ($("#radar").height() / 2) };

    var circleDiameter = 15;
    $scope.clickedCircle = 'poop';


    /*
    var testIndex = 0;

    $scope.circles = [
         { 'Name': 'Test' + (testIndex++).toString(), 'x': Math.floor((Math.random() * 95) + 1), 'y': Math.floor((Math.random() * 95) + 1), 'Website': 'www.google.com' },
    ] */


    //loading the circles from the XML file on startup
    loadCircleXML();

    $('[data-toggle="tooltip"]').tooltip({
        placement: 'top'
    });

    //FUNCTIONS -------------------------------------------------------------------------------------------------------------------------------------

    $scope.createCircle = function () {
        $scope.circles.push({ 'Name': $scope.circleName.replace(/ /g, "_"), 'x': 0, 'y': 0, 'Website': $scope.website });
        makeCirclesDraggable()
        listAllNames();
    }

    $scope.editCircle = function () {
        $scope.nameEdit = $scope.clickedCircle.Name;
        $scope.websiteEdit = $scope.clickedCircle.Website;
    }

    $scope.saveEdit = function () {
        $scope.clickedCircle.Name = $scope.clickedCircle.Name.replace(/ /g, "_");
        $scope.clickedCircle.CircleType = $scope.typeEdit;
        $scope.clickedCircle.Website = $scope.websiteEdit;

        makeCirclesDraggable();
        $scope.saveCirclesXML();
        listAllNames();
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

                        circle.startX = Startpos.left;
                        circle.startY = Startpos.top;
                    },
                    // Find position where circle is dropped.
                    stop: function (event, ui) {

                        // Show dropped position.
                        var Stoppos = $(this).position();

                        //updating it's location
                        circle.x = ((Stoppos.left - radarTopLeft.x) / $("#radar").width()) * 100;
                        circle.y = ((Stoppos.top - radarTopLeft.y) / $("#radar").height()) * 100;

                        //working out distance of the circle from the centre and then assigning the state of the circle depending where it is dropped
                        findCircleRealPosition(circle);
                        catagorize(circle, true);

                        //saving the change made to the circle
                        $scope.saveCirclesXML();
                    }
                });
                Tipped.remove("#" + circle.Name, circle.Name, { position: 'topleft' })
                //creating a tooltip for each circle with it's name
                Tipped.create("#" + circle.Name, circle.Name, { position: 'topleft' });
            });
        });
    }

    function catagorize(circle, notifications) {
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
        else if (percentOfRadius > 72.9 && percentOfRadius <= 96) {
            circle.State = 'Hold';
        }
        else if (percentOfRadius > 96 && circle.startX != null && circle.startY != null) {
            $("#" + circle.Name).css('left', circle.startX);
            $("#" + circle.Name).css('top', circle.startY);
            circle.realX = circle.startX;
            circle.realY = circle.startY;
            circle.x = ((circle.realX - radarTopLeft.x) / $("#radar").width()) * 100;
            circle.y = ((circle.realY - radarTopLeft.y) / $("#radar").height()) * 100;
            toastr["error"]("Cannot move the circle outside the radar");
        }

        //if there is a change in state, display it on the screen using TOASTR
        if (circle.State != stateBefore) {
            if (notifications)
                toastr["success"]("State changed to: " + circle.State, circle.Name);
        }

        //When you drop the circle will know what type it has been dropped into and store that type
        if (circle.x != 0 && circle.y != 0) {

            if (circle.realX < radarMiddle.x && circle.realY < radarMiddle.y) {
                circle.CircleType = 'Techniques';
                $("#" + circle.Name).css('background-color', '#00A7D4');
            }
            else if (circle.realX > radarMiddle.x && circle.realY < radarMiddle.y) {
                circle.CircleType = 'Tools';
                $("#" + circle.Name).css('background-color', '#D04F4F');
            }
            else if (circle.realX > radarMiddle.x && circle.realY > radarMiddle.y) {
                circle.CircleType = 'Languages & Frameworks';
                $("#" + circle.Name).css('background-color', '#81B245');
            }
            else if (circle.realX < radarMiddle.x && circle.realY > radarMiddle.y) {
                circle.CircleType = 'Platforms';
                $("#" + circle.Name).css('background-color', '#FF7F50');
            }
        }
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

            catagorize(circle, false);
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
        $timeout(function () {
            radarTopLeft = { 'x': $("#radar").position().left, 'y': $("#radar").position().top };
            makeCirclesDraggable();
        });
    });

    $scope.saveCirclesXML = function () {
        $.ajax({
            type: "POST",
            url: "Home/WriteXML",
            data: { circles: JSON.stringify($scope.circles) },
            dataType: 'json',
            success: function (data) {
                //do stuff
            }
        });
    }

    function loadCircleXML() {
        $.ajax({
            type: "POST",
            url: "Home/LoadXML",
            data: {},
            dataType: 'json',
            success: function (data) {
                $scope.circles = data;
                listAllNames();
                makeCirclesDraggable();
            }
        });
    }

    function sortCircleNames(circle, array, type) {
        if (circle.CircleType == type) {
            if (circle.State == 'Adopt')
                array.Adopt.push(circle.Name);
            else if (circle.State == 'Trial')
                array.Trial.push(circle.Name);
            else if (circle.State == 'Assess')
                array.Assess.push(circle.Name);
            else if (circle.State == 'Hold')
                array.Hold.push(circle.Name);
        }
    }

    $scope.orderForList = function () {

        console.log('test');
        $.each($scope.circles, function (index, circle) {
            sortCircleNames(circle, $scope.techniques, 'Techniques');
            sortCircleNames(circle, $scope.tools, 'Tools');
            sortCircleNames(circle, $scope.laf, 'Languages & Frameworks');
            sortCircleNames(circle, $scope.platforms, 'Platforms');
        });
    }

    //used for search bar at top of page
    function listAllNames() {
        $.each($scope.circles, function (index, circle) {
            $scope.circleNames.push(circle.Name);
        });
        console.log($scope.circleNames);
    }

    //will highlight the circle for a time before return to normal
    $scope.highlightCircle = function (name) {
        $("#searchBar").css('display', 'none');
        var circleSize = ($("#radar").width() / 722) * circleDiameter;

        var storedColor = $("#" + name).css('background-color');
        var storedSize = circleSize;

        startHighlight(name, circleSize);

        $timeout(function () {
            $("#" + name).css('background-color', storedColor);
            $("#" + name).css("width", storedSize);
            $("#" + name).css("height", storedSize);
        }, 5000);
    }

    function startHighlight(name, circleSize) {
        $("#" + name).css('background-color', 'yellow');
        $("#" + name).css("width", circleSize + 5);
        $("#" + name).css("height", circleSize + 5);
    }

    $scope.showResults = function () {
        $("#searchBar").css('display', 'block');
    }

    $('#radarContent').click(function () {
        $("#searchBar").css('display', 'none');
    });

};