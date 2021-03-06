﻿var controllerId = 'radarController';

angular.module('app', []).controller(controllerId, ['$scope', '$timeout', radarController]);

function radarController($scope, $timeout) {
    $scope.radarPos = $("#radar").position();
    $("#ping").css({ top: $scope.radarPos.top, left: $scope.radarPos.left, position: 'absolute' });
    $("#ping").css({ width: 0, height: 0 });
    $scope.circleNames = [];

    $scope.backToRadar = false;

    //used for listing the different technologies
    $scope.tools = { 'Hold': [], 'Assess': [], 'Trial': [], 'Adopt': [] };
    $scope.techniques = { 'Hold': [], 'Assess': [], 'Trial': [], 'Adopt': [] };
    $scope.laf = { 'Hold': [], 'Assess': [], 'Trial': [], 'Adopt': [] };
    $scope.platforms = { 'Hold': [], 'Assess': [], 'Trial': [], 'Adopt': [] };

    var currentImage = "radar";

    var quadrantOpen = false;

    $scope.radarVisible = true;

    //setting the location of the toaster notifications 
    toastr.options = {
        "positionClass": "toast-bottom-right",
    }

    //bug where first circle isnt processed, small fix by storing it and running it last to be positioned
    var storedCircle;
    var storedIndex;
    var stored = false;

    var timeOutPing;
    timeOutPing = setInterval(pingRadar, 15);
    clearInterval(timeOutPing);
    var idleInterval;

    var radarTopLeft = { 'x': $("#radar").position().left, 'y': $("#radar").position().top };
    var radarMiddle = { 'x': $("#radar").position().left + ($("#radar").width() / 2), 'y': $("#radar").position().top + ($("#radar").height() / 2) };

    var circleDiameter = 15;
    $scope.clickedCircle = 'poop';

    //loading the circles from the XML file on startup
    loadCircleXML();

    $('[data-toggle="tooltip"]').tooltip({
        placement: 'top'
    });

    //below is code related to making a ping affect of the screen. This is not necessary but I thought it was cool so feck off Pat XD 
    /*
    var idleTime = 0;
    $(document).ready(function () {
        //Increment the idle time counter every minute.
        idleInterval = setInterval(timerIncrement, 3000); // 10 seconds

        //Zero the idle timer on mouse movement.
        $(this).mousemove(function (e) { 
            clearInterval(timeOutPing);
            idleInterval = setInterval(timerIncrement, 3000);
            idleTime = 0;
        }); 
    });

    function timerIncrement() {
        idleTime = idleTime + 1;
        console.log(idleTime);
        if (idleTime > 1) {
            clearInterval(idleInterval);
            timeOutPing = setInterval(pingRadar, 15);
        }
    }*/

    //pingRadar();

    //FUNCTIONS -------------------------------------------------------------------------------------------------------------------------------------
    //ping effect
    function pingRadar() {
        $("#ping").css({ opacity: 0.5 });

        var pingWidth = $("#ping").width() + 5;
        var pingHeight = $("#ping").height() + 5;

        var pingX = radarMiddle.x - pingWidth / 2;
        var pingY = radarMiddle.y - pingHeight / 2;

        var pingOpacity = 1 - (pingWidth / $("#radar").width());
        console.log(pingOpacity);
        if (pingWidth > $("#radar").width()) {
            pingWidth = 0;
            pingHeight = 0;
            pingOpacity = 1;
        }
        $("#ping").css({ width: pingWidth, height: pingHeight, opacity: pingOpacity, left: pingX, top: pingY });
    }

    $scope.createCircle = function () {
        $scope.circles.push({ 'Name': $scope.circleName.replace(/ /g, "_"), 'x': 0, 'y': 0, 'Website': $scope.website, 'Description': $scope.description });
        makeCirclesDraggable();
    }

    $scope.editCircle = function () {
        $scope.nameEdit = $scope.clickedCircle.Name;
        $scope.websiteEdit = $scope.clickedCircle.Website;
        $scope.descriptionEdit = $scope.clickedCircle.Description;
    }

    $scope.saveEdit = function () {
        $scope.clickedCircle.Name = $scope.clickedCircle.Name.replace(/ /g, "_");
        $scope.clickedCircle.CircleType = $scope.typeEdit;
        $scope.clickedCircle.Website = $scope.websiteEdit;
        $scope.clickedCircle.Description = $scope.descriptionEdit;

        makeCirclesDraggable();
        $scope.saveCirclesXML();
    }

    function makeCirclesDraggable() {
        $.each($scope.circles, function (index, circle) {
            calculateCirclePositions(index, circle);

            $timeout(function () { //Move code up the callstack to tell Angular to watch this 
                //makes the circle draggable as well logging the position it is lifted from and where it is dropped to the console
                $("#" + circle.Name).draggable({
                    // Find original position of dragged circle.
                    start: function (event, ui) {
                        // Show start dragged position of circle.
                        var Startpos = $(this).position();

                        $("#bin").fadeIn();

                        circle.startX = Startpos.left;
                        circle.startY = Startpos.top;
                    },
                    // Find position where circle is dropped.
                    stop: function (event, ui) {

                        $timeout(function () {
                            $("#bin").fadeOut();
                        }, 1000);

                        // Show dropped position
                        var Stoppos = $(this).position();

                        //updating it's location
                        circle.x = ((Stoppos.left - radarMiddle.x) / ($("#radar").width() / 2)) * 100;
                        circle.y = ((Stoppos.top - radarMiddle.y) / ($("#radar").height() / 2)) * 100;

                        //working out distance of the circle from the centre and then assigning the state of the circle depending where it is dropped
                        radarMiddle = { 'x': $("#radar").position().left + ($("#radar").width() / 2), 'y': $("#radar").position().top + ($("#radar").height() / 2) };
                        findCircleRealPosition(circle, radarMiddle, false);
                        catagorize(index, circle, true);

                        //saving the change made to the circle
                        $scope.saveCirclesXML();
                    }
                });
                Tipped.remove("#" + circle.Name, circle.Name, { position: 'topleft' })
                //creating a tooltip for each circle with it's name
                Tipped.create("#" + circle.Name, circle.Name, { position: 'topleft' });
            });
        });
        calculateCirclePositions(storedIndex, storedCircle);
    }

    function catagorize(index, circle, notifications) {
        var distanceFromCentre = Math.sqrt(Math.pow((circle.realX - radarMiddle.x), 2) + Math.pow((circle.realY - radarMiddle.y), 2));
        var percentOfRadius = (distanceFromCentre / ($("#radar").width() / 2)) * 100;

        var binLeft = $("#bin").position().left;
        var binWidth = binLeft + $("#bin").width();
        var binTop = $("#bin").position().top;
        var binHeight = binTop + $("#bin").height();

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
        else if (circle.realX > binLeft && circle.realX < binWidth
         && circle.realY > binTop && circle.realY < binHeight) {
            deleteCircle(index);

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

    //if dropped on the bin, remove the circle from the array
    function deleteCircle(index) {
        $scope.circles.splice(index, 1);
    }

    function calculateCirclePositions(index, circle) {
        $timeout(function () { //Move code up the callstack to tell Angular to watch this  

            if (!stored) {
                storedCircle = circle;
                storedIndex = index;
                stored = true;
            }
            //using the size and location of the radar image as a reference to position the circles. 
            findCircleRealPosition(circle, radarMiddle, false);

            $("#" + circle.Name).css({ top: circle.realY, left: circle.realX });

            //Giving the circles a size depending on how big the window is
            var circleSize = ($("#radar").width() / 722) * circleDiameter;

            $("#" + circle.Name).css("width", circleSize);
            $("#" + circle.Name).css("height", circleSize);

            catagorize(index, circle, false);
        });
    }

    function findCircleRealPosition(circle, referencePoint, quadrant) {
        //using the size and location of the radar image as a reference to position the circles. 

        if (!quadrant) {
            var circleX = referencePoint.x + (($("#" + currentImage).width() / 100 / 2) * circle.x);
            var circleY = referencePoint.y + (($("#" + currentImage).height() / 100 / 2) * circle.y);
        }
        else {
            var circleX = referencePoint.x + (($("#" + currentImage).width() / 100) * circle.x);
            var circleY = referencePoint.y + (($("#" + currentImage).height() / 100) * circle.y);
        }

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
            if (!quadrantOpen) {
                $scope.radarPos = $("#radar").position();
                //$("#ping").css({ top: $scope.radarPos.top, left: $scope.radarPos.left, position: 'absolute' });
                radarTopLeft = { 'x': $("#radar").position().left, 'y': $("#radar").position().top };
                radarMiddle = { 'x': $("#radar").position().left + ($("#radar").width() / 2), 'y': $("#radar").position().top + ($("#radar").height() / 2) };
                makeCirclesDraggable();
            }

            else {
                var middleRefence;
                switch (currentImage) {
                    case ('techniques'):
                        middleReference = {
                            'x': $("#" + currentImage).position().left + $("#" + currentImage).width(),
                            'y': $("#" + currentImage).position().top + $("#" + currentImage).height()
                        };
                        $scope.quadrantCircles = $scope.techniques;
                        $scope.quadrantList = $scope.techniques;
                        break;

                    case ('tools'):
                        middleReference = {
                            'x': $("#" + currentImage).position().left,
                            'y': $("#" + currentImage).position().top + $("#" + currentImage).height()
                        };
                        $scope.quadrantCircles = $scope.tools;
                        $scope.quadrantList = $scope.tools;
                        break;

                    case ('platforms'):
                        middleReference = {
                            'x': $("#" + currentImage).position().left + $("#" + currentImage).width(),
                            'y': $("#" + currentImage).position().top
                        };
                        $scope.quadrantCircles = $scope.platforms;
                        $scope.quadrantList = $scope.platforms;
                        break;

                    case ('frameworks'):
                        middleReference = {
                            'x': $("#" + currentImage).position().left,
                            'y': $("#" + currentImage).position().top
                        };
                        $scope.quadrantCircles = $scope.laf;
                        $scope.quadrantList = $scope.laf;
                        break;
                }

                $.each($scope.circles, function (index, circle) {
                    findCircleRealPosition(circle, middleReference, true);
                    $("#" + circle.Name).css({ top: circle.realY, left: circle.realX });
                });
            }
        });
    });

    $scope.saveCirclesXML = function () {
        $.ajax({
            type: "POST",
            url: "Home/WriteXML",
            data: { circles: JSON.stringify($scope.circles) },
            dataType: 'json',
            success: function (data) {
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
                makeCirclesDraggable();
            }
        });
    }

    function sortCircles(circle, array, type) {
        if (circle.CircleType == type) {
            if (circle.State == 'Adopt')
                array.Adopt.push(circle);
            else if (circle.State == 'Trial')
                array.Trial.push(circle);
            else if (circle.State == 'Assess')
                array.Assess.push(circle);
            else if (circle.State == 'Hold')
                array.Hold.push(circle);
        }
    }

    $scope.orderForList = function (switchScreen) {
        //emptying the lists to refill them
        $scope.tools = { 'Hold': [], 'Assess': [], 'Trial': [], 'Adopt': [] };
        $scope.techniques = { 'Hold': [], 'Assess': [], 'Trial': [], 'Adopt': [] };
        $scope.laf = { 'Hold': [], 'Assess': [], 'Trial': [], 'Adopt': [] };
        $scope.platforms = { 'Hold': [], 'Assess': [], 'Trial': [], 'Adopt': [] };

        $.each($scope.circles, function (index, circle) {
            sortCircles(circle, $scope.techniques, 'Techniques');
            sortCircles(circle, $scope.tools, 'Tools');
            sortCircles(circle, $scope.laf, 'Languages & Frameworks');
            sortCircles(circle, $scope.platforms, 'Platforms');
        });

        //makes sure not to switch to the list screen when sorting the circles
        if (switchScreen) {
            if ($scope.radarVisible) {
                $("#radarContent").fadeOut(function () {
                    $("#circleList").fadeIn();
                });
                $scope.radarVisible = false;
            }
            else {
                $("#circleList").fadeOut(function () {
                    $("#radarContent").fadeIn();
                });
                $scope.radarVisible = true;
            }
        }
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

    //functions for quadrants --------------------------------------------------------------------------------
    //--------------------------------------------------------------------------------------------------------

    $scope.closeQuadrant = function () {
        quadrantOpen = false;
        $scope.backToRadar = false;
        $("#circles").fadeOut();
        $("#quadrantList").fadeOut();
        $("#closeQuadrantButton").fadeOut();
        $("#selectQuadrant").fadeIn();

        //making the circles draggable again, wont work otherwise
        $.each($scope.circles, function (index, circle) {
            $("#" + circle.Name).draggable('enable');
        });

        $scope.circles = $scope.allCircles;
        $("#" + currentImage).fadeOut(function () {
            currentImage = "radar";
            $scope.circles = $scope.allCircles;
            $("#" + currentImage).fadeIn();
            $("#circles").fadeIn();
            $("#mainButtons").fadeIn();
            makeCirclesDraggable();
        }); 
    }

    //used for opening the quadrant view of the circle
    $scope.openQuadrant = function (imageTag) {
        //if this was techniques that was clicked 
        $scope.backToRadar = true; 
        quadrantOpen = true;
        $scope.orderForList(false);
        $("#selectQuadrant").fadeOut();
        $("#mainButtons").fadeOut();
        $("#circles").fadeOut();
        $("#radar").fadeOut(function () {
            $("#" + imageTag).fadeIn();
            $("#circles").fadeIn(); 
            $("#quadrantList").fadeIn();
            $("#closeQuadrantButton").fadeIn();
            positionCirclesInQuadrant(imageTag);
        });
    }

    function positionCirclesInQuadrant(imageTag) {
        currentImage = imageTag; 
        //getting position of the 'middle' of the circle, so bottom right corner for techniques image
        var middleReference;
        $scope.quadrantCircles = [];
        switch (currentImage) {
            case ('techniques'):
                middleReference = {
                    'x': $("#" + currentImage).position().left + $("#" + currentImage).width(),
                    'y': $("#" + currentImage).position().top + $("#" + currentImage).height()
                };
                $scope.quadrantCircles = $scope.techniques;
                $scope.quadrantList = $scope.techniques;
                break;

            case ('tools'):
                middleReference = {
                    'x': $("#" + currentImage).position().left,
                    'y': $("#" + currentImage).position().top + $("#" + currentImage).height()
                };
                $scope.quadrantCircles = $scope.tools;
                $scope.quadrantList = $scope.tools;
                break;

            case ('platforms'):
                middleReference = {
                    'x': $("#" + currentImage).position().left + $("#" + currentImage).width(),
                    'y': $("#" + currentImage).position().top
                };
                $scope.quadrantCircles = $scope.platforms;
                $scope.quadrantList = $scope.platforms;
                break;

            case ('frameworks'):
                middleReference = {
                    'x': $("#" + currentImage).position().left,
                    'y': $("#" + currentImage).position().top
                };
                $scope.quadrantCircles = $scope.laf;
                $scope.quadrantList = $scope.laf;
                break;
        } 

        //keeping all the circles before using the variable
        $scope.allCircles = $scope.circles;
        $scope.circles = [];

        $.each($scope.quadrantCircles, function (key, value) {
            $.each(value, function (index, circle) {
                findCircleRealPosition(circle, middleReference, true);
                makeCirclesUndraggable(circle);
                $("#" + circle.Name).css({ top: circle.realY, left: circle.realX });
                $scope.circles.push(circle);
            });
        });
        $scope.$apply();
    }

    //making the circles undraggable, also resizes them to fit the new image
    function makeCirclesUndraggable(circle) {
        $("#" + circle.Name).draggable('disable');

        var circleSize = $("#" + circle.Name).width() * 3;

        $("#" + circle.Name).css("width", circleSize);
        $("#" + circle.Name).css("height", circleSize);
    }
};