


function RadarDiagram(canvasId, sliderDivId, modpath, xmlfile) {
    this.isUpdateDrawSet = false;
    var constants = new Constants();
    var masterSegmentOpened = false;
    var CONFIGS = {};
    //fields
    this.awarenessLevel = new Array("High", "Medium", "Low");
    this.statusIds = null;
    this.status = null;
    this.statusFilter = null;
    this.drawMasterSegment = false;
    this.mastersegments = null;
    this.mastersegmentIds = null;
    this.segments = null;
    this.segmentIds = null;
    this.segmentAngles = null;
    this.segmentAnglesFinal = null;
    this.segmentAnglesPer = null;
    this.showSingleSeg = false;
    this.segIndexToShow = null;
    this.segAnimating = false;
    this.categories = null;
    this.categoryNames = null;
    this.categoryFilters = null;
    this.corporate_functions = null;
    this.corporate_function_names = null;
    this.corporate_functionFilters = null;
    this.entries = null;

    this.curPlotPositions = new Array(); // used for animation: used
    this.newPlotPositions = new Array(); // used for animation: used
    this.plotAnimating = false; //used for animation: used
    this.plotAnimatingStep = 0; //used for animation

    this.tmpCurPlotOptIndex = null; // used for animation
    this.tmpDistanceAnimationFactor = 0; //used for animation
    this.activeEntry = null;
    this.timeOutHandleForPlotOptions = null;
    this.frameCount = 0;
    this.plotOptions = null;
    this.curPlotOptIndex = null;
    this.imageCount = 0;
    this.loadedImageCount = 0;
    this.isPlotOptionHovered = false;


    this.filter_statusIds = new Array();
    this.filter_megaTrends = new Array();
    this.filter_corporate_functions = new Array();

    this.allFilters = new Array();

    var imageUrls = new Array();
    this.imageUrls = imageUrls;
    this.images = new Array();
    this.textBgImage = modpath + "images/TextBg.png";
    this.arrowOneWay = modpath + "images/arrow.png";
    this.arrowTwoWay = modpath + "images/arrow_twoway_hidden.png";
    this.imageUrls.push(this.textBgImage);
    this.dotImages = new Array();
    this.overlayImages = new Array();
    this.onDrawn = null;
    this.showHideLegend = showHideLegend;
    
    this.versions = null;
    this.sliderDivId = sliderDivId;
    this.curVersionId = -1;
    this.curVersion = null;
    this.historySlider = null;
    this.drawInterConnection = false;
    this.expandDotTitle = false;
    this.showSubSegments = false;
    this.hideToolTip = false;
    this.rotation = "auto";   //added for trend radar

    this.backgroundImage = false;

    var canvas = document.getElementById(canvasId);

    this.canvas = canvas;
    this.drawingContext = document.getElementById(canvasId).getContext("2d");
    this.stage = new Kinetic.Stage(canvas, constants.canvasRefreshRate);
    this.radius = Math.min(canvas.width / 2, canvas.height) * constants.relativeRadius;
    this.centerX = canvas.width / 2;
    this.centerY = (canvas.height + this.radius) / 2;
    this.isFullscreen = false; // used to resize font size in full screen mode



    //methods
    this.drawSegments = drawSegments;
    this.drawCircles = drawCircles;
    this.drawSegmentLine = drawSegmentLine;
    this.findEntriesToPlot = findEntriesToPlot;
    this.draw = draw;
    this.update = update;
    this.plot = plot;
    this.plotPoint = plotPoint;
    this.sortEntries = sortEntries;
    this.toggleToOneSeg = toggleToOneSeg;
    this.addFilterControl = addFilterControl;
    this.addStatusLegends = addStatusLegends;
    this.filterChanged = filterChanged;
    this.showPlotOptionsHtml = showPlotOptionsHtml;
    this.distroy = distroy;
    this.loadAnotherXml = loadAnotherXml;
    this.drawOverlayImage = drawOverlayImage;
    this.setLoadListners = setLoadListners;
    this.onXmlLoading = null;
    this.drawInterConnections = drawInterConnections;
    this.resizeCanvas = resizeCanvas;
    this.isIE8OrLess = isIE8OrLess;

    XMLParser(xmlfile, this);



    function getIndexOf(source, content) {
        if (source.indexOf) {
            return source.indexOf(content);
        }
        else {
            for (var i = 0; i < source.length; i++) {
                if (source[i] == content) {
                    return i;
                }
            }
            return -1;
        }

    }


    function draw() {

        //this.drawingContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawSegments();
        var entries = this.findEntriesToPlot();
        var sortedEntries = this.sortEntries(entries);
        this.plot(sortedEntries);
        //this.drawingContext.fillText("Frame count = " + this.frameCount, 100, 100);
        if (this.onDrawn != null) {
            var diag = this;
            //setTimeout(diag.onDrawn, 100);
            diag.onDrawn();
        }
    }

    function update() {

        if (this.plotAnimating) {
            return;
        }

        if (!this.segAnimating) {
            this.stage.stop();
            return;
        }


        // new --------------------------
        if (this.mastersegments.length > 1) {
            this.expandMasterSegment();
        }
        else {
            this.expandSubSegment();
        }



    }

    this.expandSubSegment = function () {
        var dAngle = constants.animeDAngle;
        if (this.showSingleSeg) {
            for (var i = 1; i < this.segmentAngles.length - 1; i++) {
                var tempAngle;
                if (i != this.segIndexToShow) {
                    tempAngle = this.segmentAngles[i] + dAngle * (i - this.segIndexToShow) / Math.abs(i - this.segIndexToShow);
                }
                else {
                    tempAngle = this.segmentAngles[i] - dAngle;
                }
                if (tempAngle > 2 * Math.PI) { tempAngle = 2 * Math.PI; }
                else if (tempAngle < Math.PI) {
                    tempAngle = Math.PI;
                }
                this.segmentAngles[i] = tempAngle;
            }
            if (this.segmentAngles[this.segIndexToShow] == Math.PI && this.segmentAngles[this.segIndexToShow + 1] == 2 * Math.PI) {
                //this.stage.stop();
                this.segAnimating = false;
            }
        }
        else {
            for (var i = 0; i < this.segmentAngles.length; i++) {
                this.segmentAngles[i] = this.segmentAnglesPer[i];
            }
            //this.stage.stop();
            this.segAnimating = false;
        }
    }

    this.expandMasterSegment = function () {
        masterSegmentOpened = true;
        var dAngle = constants.animeDAngle;
        var i = 0;
        if (this.showSingleSeg) {
            for (var mi = 0; mi < this.mastersegments.length; mi++) {
                var curMasterSeg = this.mastersegments[mi];
                for (var si = 0; si < curMasterSeg.segments.length; si++) {
                    if (this.segIndexToShow == mi) {
                        tempAngle = Math.PI + Math.PI * si / curMasterSeg.segments.length;
                    }
                    else {
                        tempAngle = this.segmentAngles[i] + dAngle * (mi - this.segIndexToShow) / Math.abs(mi - this.segIndexToShow);
                    }

                    if (tempAngle > 2 * Math.PI) {
                        tempAngle = 2 * Math.PI;
                    }
                    else if (tempAngle < Math.PI) {
                        tempAngle = Math.PI;
                    }
                    this.segmentAngles[i] = tempAngle;
                    i++;
                }
            }

            // left 
            var left = 0;
            for (var mi = 0; mi < this.segIndexToShow; mi++) {
                var curMasterSeg = this.mastersegments[mi];
                for (var si = 0; si < curMasterSeg.segments.length; si++) {
                    left++;
                }
            }
            var right = left + this.mastersegments[this.segIndexToShow].segments.length;

            // takes previous element because main segments move faster and are 
            // faster equal to PI.
            if (left != 0) left--;

            if (this.segmentAngles[left] == Math.PI && this.segmentAngles[right] == 2 * Math.PI) {
                this.stage.stop();
                this.segAnimating = false;
                this.showSingleSeg = !this.showSingleSeg;
                this.drawingContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
                left = 0
                right = 0;
            }
        }
    }

    function Point(x, y) {
        this.x = x;
        this.y = y;

        this.distanceSq = distanceSq;
        function distanceSq(p2) {
            return (this.x - p2.x) * (this.x - p2.x) + (this.y - p2.y) * (this.y - p2.y);
            //return Math.abs((this.y - p2.y));
        }
    }


    function plot(sortedEntries) {
        var plotedPoints = new Array();

        var statusIndexCur;
        var pointWithMaxDistanceCur;
        var pointPlotInfos = new Array();
        if (this.rotation == "auto") {
            for (var i = 0; i < this.segments.length; i++) {
                if ((this.segmentAngles[i] - this.segmentAngles[i + 1]) == 0) { continue; }
                var entries = sortedEntries[i];
                var minAngle = this.segmentAngles[i];
                var maxAngle = this.segmentAngles[i + 1];

                for (var j = 0; j < entries.length; j++) {
                    var curEntry = entries[j];
                    //var segIndex = this.segmentIds.indexOf(curEntry.segment);
                    var curPlotOpt = this.plotOptions[this.curPlotOptIndex];
                    var statusIndex = getIndexOf(this.statusIds, curEntry.status_id);
                    if (curPlotOpt.sameColorForEntries) {
                        statusIndex = 0;
                    }




                    var curValue = curEntry.getDistance(this.curPlotOptIndex);
                    var d = 100 - (((curValue - curPlotOpt.minValue) * 100) / (curPlotOpt.maxValue - curPlotOpt.minValue));

                    // adds a 5% distance from outer radar borders
                    if (d < 5) d = 5;
                    if (d > 95) d = 95;


                    //this is also for seperating the points
                    var radius = this.radius * Math.sqrt(d) / 10;
                    var dAngle = (constants.minSeperation / radius);
                    var curAngle = minAngle + constants.segmentPadding / radius;
                    var pointWithMaxDistance = new Point();

                    var pointX = Math.cos((minAngle + maxAngle) / 2) * radius + this.centerX;
                    var pointY = Math.sin((minAngle + maxAngle) / 2) * radius + this.centerY;

                    pointWithMaxDistance = new Point(pointX, pointY);

                    var maxDistanceSum = 0;
                    while ((curAngle <= maxAngle - constants.segmentPadding / radius) && j != 0) {
                        pointX = Math.cos(curAngle) * radius + this.centerX;
                        pointY = Math.sin(curAngle) * radius + this.centerY;
                        var curPoint = new Point(pointX, pointY);
                        var minDistToPoints = 0;
                        for (var k = 0; k < plotedPoints.length; k++) {
                            var dist = curPoint.distanceSq(plotedPoints[k]);
                            if (k == 0) {
                                minDistToPoints = dist;
                            }
                            minDistToPoints = (minDistToPoints > dist) ? dist : minDistToPoints;
                        }
                        if (minDistToPoints > maxDistanceSum) {
                            pointWithMaxDistance = curPoint;
                            maxDistanceSum = minDistToPoints;
                        }

                        curAngle += dAngle;
                    }

                    plotedPoints.push(pointWithMaxDistance);
                    //pointPlotInfos.push( new plotPointInfo(curEntry, statusIndex, pointWithMaxDistance));
                    pointPlotInfos[curEntry.id] = new plotPointInfo(curEntry, statusIndex, pointWithMaxDistance);

                }



            }


        } //if end

        else if (this.rotation == "self") {
            var l = 0;
            var new_entries = sortedEntries[l];
            for (var m = 0; m < new_entries.length; m++) {
                var new_curEntry = new_entries[m];

                var new_curPlotOpt = this.plotOptions[this.curPlotOptIndex];
                var new_statusIndex = getIndexOf(this.statusIds, new_curEntry.status_id);
                if (new_curPlotOpt.sameColorForEntries) {
                    new_statusIndex = 0;
                }


                var new_curValue = new_curEntry.getDistance(this.curPlotOptIndex);
                var new_d = 100 - (((new_curValue - new_curPlotOpt.minValue) * 100) / (new_curPlotOpt.maxValue - new_curPlotOpt.minValue));


                var new_radius = this.radius * Math.sqrt(new_d) / 10;

                var new_curAngle = new_curEntry.rotation_angle - 180;
                var pointWithRotationAngleDistance = new Point();

                var new_pointX = this.centerX + (Math.cos((new_curAngle * Math.PI) / 180) * new_radius);
                var new_pointY = this.centerY + (Math.sin((new_curAngle * Math.PI) / 180) * new_radius);

                pointWithRotationAngleDistance = new Point(new_pointX, new_pointY);

                plotedPoints.push(pointWithRotationAngleDistance);

                pointPlotInfos[new_curEntry.id] = new plotPointInfo(new_curEntry, new_statusIndex, pointWithRotationAngleDistance);

            }



        }//else end

        var plotAtLast = new Array();
        //for (var k = 0; k < pointPlotInfos.length; k++) 
        for (var eId in pointPlotInfos) {
            var pInfo = pointPlotInfos[eId];
            if (typeof (pInfo) == 'function') {
                continue;
            }
            if (((this.activeEntry != null) && (pInfo.entry.id == this.activeEntry.id)) || pInfo.entry.isMain) {
                if (pInfo.entry.isMain) {
                    plotAtLast.unshift(pInfo);
                }
                else {
                    plotAtLast.push(pInfo);
                }
            }
            else {
                this.plotPoint(pInfo.entry, pInfo.statusIndex, pInfo.pointWithMaxDistance);
            }
        }
        //for (var k = 0; k < pointPlotInfos.length; k++) 
        for (var eId in pointPlotInfos) {
            var pInfo = pointPlotInfos[eId];
            if (typeof (pInfo) == 'function') {
                continue;
            }
            if (pInfo.entry != this.activeEntry) {
                this.drawOverlayImage(pInfo.entry, pInfo.pointWithMaxDistance);
            }
        }

        for (var i = 0; i < plotAtLast.length; i++) {
            this.plotPoint(plotAtLast[i].entry, plotAtLast[i].statusIndex, plotAtLast[i].pointWithMaxDistance);
            this.drawOverlayImage(plotAtLast[i].entry, plotAtLast[i].pointWithMaxDistance);
            if (this.drawInterConnection) {
                this.drawInterConnections(plotAtLast[i], pointPlotInfos);
            }
        }

    }

    function plotPointInfo(entry, statusIndex, pointWithMaxDistance) {
        this.entry = entry;
        this.statusIndex = statusIndex;
        this.pointWithMaxDistance = pointWithMaxDistance;
    }



    function plotPoint(curEntry, statusIndex, pointWithMaxDistance) {
        var curPlotOpt = this.plotOptions[this.curPlotOptIndex];
        var minRadius = this.radius * constants.relativeMinPointRadius;
        var maxRadius = this.radius * constants.relativeMaxPointRadius;
        var dotImage = this.images[this.dotImages[curEntry.status_id]];
        if (curPlotOpt.sameColorForEntries) {
            dotImage = this.images[this.dotImages[this.statusIds[0]]];
        }
        CONFIGS.fonts["entryNameFont"].setFont(this.drawingContext, this.isFullscreen, constants.fontFullscreenFactor);
        var dummyStrForWidth = "aaaaaaaaaaaaaaaaaaaa";
        var availableWidth = this.drawingContext.measureText(dummyStrForWidth).width;
        var title = curEntry.name;
        if ((curEntry.name.length > dummyStrForWidth.length) && (this.expandDotTitle == false)) {
            title = curEntry.name.substr(0, dummyStrForWidth.length - 3) + "...";
        }

        var pointRadius = minRadius
        if (curEntry.avg_rating != -1) {
            pointRadius = minRadius + curEntry.avg_rating * (maxRadius - minRadius) / constants.maxRate;
        }

        var rectWidth = this.drawingContext.measureText(title).width;
        var textHeight = CONFIGS.fonts["entryNameFont"].size + 2;

        if (this.plotAnimating == false) {

            //Draw background for active entry text
            if (((this.activeEntry != null) && (this.activeEntry.id == curEntry.id)) || curEntry.isMain) {
                var realTextWidth = this.drawingContext.measureText(curEntry.name).width;
                availableWidth -= CONFIGS.fonts["entryNameFont"].size;
                var wrapedLines = getLines(this.drawingContext, curEntry.name, availableWidth);
                var heightOfALine = CONFIGS.fonts["entryNameFont"].size; //this.drawingContext.measureText(this.segments[i]).height;
                var lineSpacing = 2;
                var totalHeight = heightOfALine * wrapedLines.length + lineSpacing * (wrapedLines.length - 1);
                var pointX = pointWithMaxDistance.x;
                var pointY = pointWithMaxDistance.y + pointRadius + textHeight / 2;


                var imageWidth = Math.min(availableWidth, realTextWidth);
                //re-enabled to disable hightlight
                if (this.isIE8OrLess()) {
                    this.drawingContext.drawImage(this.images[this.textBgImage], pointWithMaxDistance.x - imageWidth / 2 - 5, pointWithMaxDistance.y + pointRadius, imageWidth + 10, totalHeight + 2);

                    this.drawingContext.moveTo(pointX, pointY);
                }
                for (var k = 0; k < wrapedLines.length; k++) {
                    this.drawingContext.fillText(wrapedLines[k], Math.ceil(pointX), Math.ceil(pointY));
                    pointY += heightOfALine + lineSpacing;
                }

            }
            else {
                this.drawingContext.fillText(title, pointWithMaxDistance.x, pointWithMaxDistance.y + pointRadius + textHeight / 2);
            }


            this.drawingContext.drawImage(dotImage, pointWithMaxDistance.x - pointRadius, pointWithMaxDistance.y - pointRadius, 2 * pointRadius, 2 * pointRadius);
            this.curPlotPositions[curEntry.id] = new Point(pointWithMaxDistance.x, pointWithMaxDistance.y);

        } else {

            if (this.plotAnimatingStep > 200) {
                this.plotAnimating = false;
                this.stage.stop();

                this.drawingContext.drawImage(dotImage, pointWithMaxDistance.x - pointRadius, pointWithMaxDistance.y - pointRadius, 2 * pointRadius, 2 * pointRadius);
                this.drawingContext.fillText(title, pointWithMaxDistance.x, pointWithMaxDistance.y + pointRadius + textHeight / 2);
                this.curPlotPositions[curEntry.id] = new Point(pointWithMaxDistance.x, pointWithMaxDistance.y);
            }


            var plotX = pointWithMaxDistance.x - this.curPlotPositions[curEntry.id].x;
            plotX = plotX / 200;
            plotX = this.curPlotPositions[curEntry.id].x + (plotX * this.plotAnimatingStep);

            var plotY = pointWithMaxDistance.y - this.curPlotPositions[curEntry.id].y;
            plotY = plotY / 200;
            plotY = this.curPlotPositions[curEntry.id].y + (plotY * this.plotAnimatingStep);

            this.drawingContext.drawImage(
                dotImage,
                plotX - pointRadius,
                plotY - pointRadius,
                2 * pointRadius,
                2 * pointRadius
            );
            this.drawingContext.fillText(title, plotX, plotY + pointRadius + textHeight / 2);

            this.plotAnimatingStep += 1;


        }


        //draw imaginary path around text and point to indicate active region for the point
        this.stage.beginRegion("entry" + curEntry.id, curEntry, { x: pointWithMaxDistance.x, y: pointWithMaxDistance.y }); //specify entry id and center of region
        this.drawingContext.beginPath();
        this.drawingContext.arc(pointWithMaxDistance.x, pointWithMaxDistance.y, 35, 0.0, 2 * Math.PI, false);
        this.drawingContext.closePath();

        //this.drawingContext.stroke();
        var me = this;
        this.stage.addRegionEventListener("onmouseover", function (entry) {
            me.activeEntry = entry;
        });

        this.stage.addRegionEventListener("onmouseout", function () {
            me.activeEntry = null;
        });
        this.stage.addRegionEventListener("onclick", function (entry) {
            me.activeEntry = null;
            var newWindow = window.open(entry.url, "_self");
        });
        this.stage.closeRegion();



    }



    function drawOverlayImage(curEntry, pointWithMaxDistance) {
        var overlayImages = curEntry.overlayImages;

        for (var i = 0; i < overlayImages.length; i++) {

            var overlayImage = overlayImages[i];
            var img = this.images[overlayImage.imageUrl];
            if (img) {
                var width = overlayImage.width > 0 ? overlayImage.width * 1 : img.width;
                var height = overlayImage.height > 0 ? overlayImage.height * 1 : img.height;

                var pointX = pointWithMaxDistance.x;
                var pointY = pointWithMaxDistance.y;
                var point = new Point(pointX, pointY);
                var dimension = new Point(width, height);
                var alignedPoint = getAlignedPoint(point, dimension, overlayImage);
                this.drawingContext.drawImage(img, alignedPoint.x, alignedPoint.y, width, height);
            }
        }


    }

    function getAlignedPoint(point, dimension, alignment) {

        var pointX = point.x;
        var pointY = point.y;
        var margin = alignment.margin ? alignment.margin : { left: 0, top: 0, right: 0, bottom: 0 };
        switch (alignment.hAlign.toLowerCase()) {
            case 'left':
                pointX += margin.left;
                break;
            case 'center':
                pointX += margin.left;
                pointX -= (dimension.x / 2);
                break;
            case 'right':
                pointX -= (dimension.x - margin.right);
                break;
            default:

        }

        switch (alignment.vAlign.toLowerCase()) {
            case 'top':
                pointY += margin.top;
                break;
            case 'middle':
                pointY += margin.top;
                pointY -= (dimension.y / 2);
                break;
            case 'bottom':
                pointY -= (dimension.y + margin.bottom);
                break;
            default:
                pointY -= (dimension.y + margin.bottom);

        }
        return new Point(pointX, pointY);
    }




    /**
    * Divide an entire phrase in an array of phrases, all with the max pixel length given.
    * The words are initially separated by the space char.
    * @param phrase
    * @param length
    * @return
    */

    function getLines(ctx, phrase, maxPxLength) {
        var wa = phrase.split(" "),
            phraseArray = [],
            lastPhrase = "",
            l = maxPxLength,
            measure = 0;
        //ctx.font = textStyle;
        for (var i = 0; i < wa.length; i++) {
            var w = wa[i];
            measure = ctx.measureText(lastPhrase + w).width;
            if (measure < l) {
                lastPhrase += lastPhrase == "" ? w : (" " + w);
            } else {
                phraseArray.push(lastPhrase);
                lastPhrase = w;
            }
            if (i === wa.length - 1) {
                phraseArray.push(lastPhrase);
                break;
            }
        }
        return phraseArray;
    }

    
    //sorts the entries by segment and then distance
    function sortEntries(entries) {
        var sortedEntries = new Array(this.segments.length);
        for (var k = 0; k < this.segments.length; k++) {
            sortedEntries[k] = new Array();
        }
        for (var i = 0; i < entries.length; i++) {
            var entriesInSeg = new Array();
            var newEntryInserted = 0;
            var curEntry = entries[i];
            var segIndex = getIndexOf(this.segmentIds, curEntry.segment_id);


            if (segIndex == -1) { continue; }
            var sortedSegEntries = sortedEntries[segIndex];
            var testStr = "";
            for (var j = 0; j < sortedSegEntries.length + 1; j++) {
                if (newEntryInserted == 1) {
                    entriesInSeg.push(sortedSegEntries[j - newEntryInserted]);
                }
                else if (sortedSegEntries.length == 0 || j == sortedSegEntries.length) {
                    entriesInSeg.push(curEntry);
                    newEntryInserted = 1;
                }
                else if (curEntry.getDistance(this.curPlotOptIndex) >= sortedSegEntries[j].getDistance(this.curPlotOptIndex)) {

                    entriesInSeg.push(curEntry);
                    newEntryInserted = 1;
                }
                else {
                    entriesInSeg.push(sortedSegEntries[j]);
                }
                testStr += entriesInSeg[j].getDistance(this.curPlotOptIndex) + ",";
            }

            sortedEntries[segIndex] = entriesInSeg;
        }
        return sortedEntries;
    }

    function setFilters(statusIds, megaTrends, businessUnits) {
        this.filter_statusIds = statusIds;
        this.filter_megaTrends = megaTrends;
        this.filter_corporate_functions = businessUnits;
    }

    function drawSegments() {
        this.drawCircles();
        this.drawSegmentLine();



        //TODO: this can be used to send the  canvas bitmap to the server
        /*
        var a = this.drawingContext.getImageData(0, 0, this.canvas.width, this.canvas.height);

        $jq.post("PostImageData.aspx", { ImageData: a }, function (data) {
        alert("Data Loaded: " + data);
        });

        */
    }

    function drawCircles() {

        var segCount = this.segments.length;
        var awarenessCount = this.plotOptions[this.curPlotOptIndex].divisions.length;


        //draw background image in canvas
        var canvasBgRadius = this.radius * constants.relativeBgRadius;
        if (this.backgroundImage) {
            this.drawingContext.drawImage(this.backgroundImage, this.centerX - canvasBgRadius - 7, this.centerY - canvasBgRadius - 5, 2 * canvasBgRadius + 14, canvasBgRadius + 22);
        }

        //Draw equal areas for need of awareness
        var prvRadius;
        var curRadius = 0;
        var nextRadius = this.radius / Math.sqrt(awarenessCount);
        this.drawingContext.lineWidth = constants.thinLineWidth;
        this.drawingContext.strokeStyle = constants.dividerLineColor; // line color
        this.drawingContext.beginPath();
        this.drawingContext.moveTo(this.centerX, this.centerY + constants.startLabelAt);
        this.drawingContext.lineTo(this.centerX, this.centerY + constants.endLabelAt);

        var multiPlotOptions = (this.plotOptions.length > 1);

        if (multiPlotOptions) { this.stage.beginRegion("plotOption"); }

        /*
        this.drawingContext.fillStyle = "gray";
        this.drawingContext.textAlign = "center";
        this.drawingContext.textBaseline = "top";
        this.drawingContext.font = "12px Arial bold"
        */
        if (this.isPlotOptionHovered) {
            CONFIGS.fonts["plotOptionNameActiveFont"].setFont(this.drawingContext, this.isFullscreen, constants.fontFullscreenFactor);
        }
        else {
            CONFIGS.fonts["plotOptionNameFont"].setFont(this.drawingContext, this.isFullscreen, constants.fontFullscreenFactor);
        }

        this.drawingContext.beginPath();
        var rectWidth = this.drawingContext.measureText(this.plotOptions[this.curPlotOptIndex].name).width;
        this.drawingContext.rect(this.centerX - rectWidth / 2 - 2, this.centerY + constants.endLabelAt, rectWidth + 4, constants.endLabelAt);
        //this.drawingContext.stroke();
        this.drawingContext.closePath();
        this.drawingContext.fillText(this.plotOptions[this.curPlotOptIndex].displayName, this.centerX, this.centerY + constants.endLabelAtforDisplayName);
        //this.drawingContext.moveTo(this.centerX, this.centerY + 5);
        if (multiPlotOptions) {
            var me = this;
            if (me.stage.isTouchDevice()) {
                this.stage.addRegionEventListener("ontap", function () {
                    me.showPlotOptionsHtml(true);
                });
            }
            else {
                this.stage.addRegionEventListener("onmouseover", function () {
                    me.isPlotOptionHovered = true;
                });
                this.stage.addRegionEventListener("onclick", function () {
                    me.showPlotOptionsHtml(true);
                });
                this.stage.addRegionEventListener("onmouseout", function () { me.isPlotOptionHovered = false; me.showPlotOptionsHtml(false); });
            }

            this.stage.closeRegion();
        }

        var circleRadius = new Array();
        {
            var prvRadius;
            var curRadius = 0;
            var nextRadius = this.radius / Math.sqrt(awarenessCount);
            for (i = 0; i < awarenessCount; i++) {
                prvRadius = curRadius;
                curRadius = nextRadius;
                circleRadius.push(curRadius);


                this.drawingContext.moveTo(this.centerX + curRadius, this.centerY + constants.startLabelAt);
                this.drawingContext.lineTo(this.centerX + curRadius, this.centerY + constants.endLabelAt);

                this.drawingContext.moveTo(this.centerX - curRadius, this.centerY + constants.startLabelAt);
                this.drawingContext.lineTo(this.centerX - curRadius, this.centerY + constants.endLabelAt);

                //draw text 
                CONFIGS.fonts["xAxisLabelFont"].setFont(this.drawingContext, this.isFullscreen, constants.fontFullscreenFactor);
                this.drawingContext.fillText(this.plotOptions[this.curPlotOptIndex].divisions[i].name, this.centerX - prvRadius - (curRadius - prvRadius) / 2, this.centerY + constants.endLabelAt);
                this.drawingContext.fillText(this.plotOptions[this.curPlotOptIndex].divisions[i].name, this.centerX + prvRadius + (curRadius - prvRadius) / 2, this.centerY + constants.endLabelAt);

                nextRadius = Math.sqrt(2 * curRadius * curRadius - prvRadius * prvRadius);
            }
        }


        this.drawingContext.beginPath();
        for (var i = awarenessCount - 1; i >= 0; i--) {
            curRadius = circleRadius[i];

            if (!this.backgroundImage || i != (awarenessCount - 1)) {

                this.drawingContext.strokeStyle = this.plotOptions[this.curPlotOptIndex].divisions[i].borderColor;
                this.drawingContext.moveTo(this.centerX + curRadius, this.centerY);
                this.drawingContext.arc(this.centerX, this.centerY, curRadius, 0.0, Math.PI, true);
                this.drawingContext.lineWidth = this.segmentLineThickness;
                this.drawingContext.stroke();
                if (!this.backgroundImage) {
                    this.drawingContext.beginPath();
                    this.drawingContext.arc(this.centerX, this.centerY, curRadius, 0.0, Math.PI, true);
                    this.drawingContext.fillStyle = this.plotOptions[this.curPlotOptIndex].divisions[i].fillColor;
                    this.drawingContext.fill();
                    this.drawingContext.closePath();
                }
                //this.drawingContext.strokeStyle = constants.dividerLineColor;


            }
            //this.drawingContext.closePath();

        }

        /*
        for (var i = awarenessCount - 1; i >= 0; i--) {
            curRadius = circleRadius[i];

            this.drawingContext.beginPath();
            this.drawingContext.strokeStyle = this.plotOptions[this.curPlotOptIndex].divisions[i].borderColor;
            this.drawingContext.moveTo(this.centerX + curRadius, this.centerY);
            this.drawingContext.arc(this.centerX, this.centerY, curRadius, 0.0, Math.PI, true);
            this.drawingContext.closePath();
            this.drawingContext.fillStyle = this.plotOptions[this.curPlotOptIndex].divisions[i].fillColor;
            if (!this.backgroundImage) {
				this.drawingContext.fill();
				//this.drawingContext.strokeStyle = constants.dividerLineColor;
				this.drawingContext.lineWidth = this.segmentLineThickness;
				this.drawingContext.stroke();		
		    }    
        }
*/
        this.drawingContext.moveTo(this.centerX + this.radius, this.centerY);
        this.drawingContext.closePath();
        this.drawingContext.stroke();

        if (this.rotation == "self") {
            var radiusToText = this.radius * constants.relativeCircularTextRadius;
            this.drawCircularText("LOW", CONFIGS.fonts["circularTextFont"], radiusToText, Math.PI, Math.PI + Math.PI / 2 - Math.PI / 8, true);
            this.drawCircularText("HIGH", CONFIGS.fonts["circularTextFont"], radiusToText, Math.PI + Math.PI / 2 + Math.PI / 8, 2 * Math.PI, true);
        }
    }


    function showPlotOptionsHtml(show) {
        if (show) {
            var count = this.plotOptions.length;
            var me = this;
            var lstOptions = $jq("<ul/>")
            for (var i = 0; i < count; i++) {
                var itemOption = $jq("<li/>");
                itemOption.data("tag", i);
                itemOption.click(function () {
                    me.plotAnimatingStep = 0;
                    me.plotAnimating = true;
                    me.stage.start(true);
                    me.curPlotOptIndex = $jq(this).data("tag") * 1;
                    me.showHideLegend(me.curPlotOptIndex)
                    me.showPlotOptionsHtml(null);
                    me.drawingContext.clearRect(0, 0, me.canvas.width, me.canvas.height);
                    // me.update();
                    me.draw();
                });
                itemOption.text(this.plotOptions[i].displayName);
                lstOptions.append(itemOption);
            }

        }
        
    }

    function showHideLegend(plotOptionIndex) {
        var curPlotOpt = this.plotOptions[plotOptionIndex];
        if (curPlotOpt.sameColorForEntries) {
            $jq("#DiagramHolder #radarLegends").hide("fast");
        }
        else {
            $jq("#DiagramHolder #radarLegends").show("fast");
        }
    }


    var hoverSegIndex = -1;
    function drawSegmentLine() {
        if (this.segmentLineColor && this.segmentLineColor != "") {
            var segmentLineColor = this.segmentLineColor;
        } else {
            var segmentLineColor = constants.segmentLineColor;
        }
        this.drawingContext.lineWidth = this.segmentLineThickness;
        this.drawingContext.strokeStyle = segmentLineColor;
        //this.drawingContext.beginPath();
        var i = 0;
        for (var mi = 0; mi < this.mastersegments.length; mi++) {
            var curMasterSeg = this.mastersegments[mi];
            if (this.drawMasterSegment) {

                this.drawingContext.lineWidth = this.masterSegmentLineThickness;
                this.drawingContext.strokeStyle = segmentLineColor;

            }
            else {
                this.drawingContext.lineWidth = this.segmentLineThickness;
                this.drawingContext.strokeStyle = segmentLineColor;
            }
            for (var si = 0; si < curMasterSeg.segments.length; si++) {
                if ((this.segmentAngles[i] - this.segmentAngles[i + 1]) == 0) { i++; continue; }
                var pointX = Math.cos(this.segmentAngles[i]) * this.radius * constants.relativeSegLineLen + this.centerX;
                var pointY = Math.sin(this.segmentAngles[i]) * this.radius * constants.relativeSegLineLen + this.centerY;
                this.drawingContext.beginPath();
                this.drawingContext.moveTo(this.centerX, this.centerY);
                this.drawingContext.lineTo(pointX, pointY);
                this.drawingContext.stroke();
                this.drawingContext.lineWidth = this.segmentLineThickness;
                this.drawingContext.strokeStyle = segmentLineColor;
                this.drawingContext.closePath();
                i++;
            }

            if (mi == this.mastersegments.length - 1) {
                if ((this.segmentAngles[i] - this.segmentAngles[i + 1]) == 0) { i++; continue; }
                var pointX = Math.cos(this.segmentAngles[i]) * this.radius * constants.relativeSegLineLen + this.centerX;
                var pointY = Math.sin(this.segmentAngles[i]) * this.radius * constants.relativeSegLineLen + this.centerY;
                this.drawingContext.beginPath();
                this.drawingContext.moveTo(this.centerX, this.centerY);
                this.drawingContext.lineTo(pointX, pointY);
                if (this.drawMasterSegment) {
                    this.drawingContext.lineWidth = this.masterSegmentLineThickness;
                    this.drawingContext.strokeStyle = segmentLineColor;
                }
                else {
                    this.drawingContext.lineWidth = this.segmentLineThickness;
                    this.drawingContext.strokeStyle = segmentLineColor;
                }
                this.drawingContext.stroke();
                this.drawingContext.lineWidth = this.segmentLineThickness;
                this.drawingContext.strokeStyle = segmentLineColor;
                this.drawingContext.closePath();
            }
        }

        //this.drawingContext.closePath();



        var clickedSegIndex = -1;

        i = 0;
        for (var mi = 0; mi < this.mastersegments.length; mi++) {
            var curMasterSeg = this.mastersegments[mi];
            var masterStartAngle = this.segmentAngles[i];
            var masterEndAngle = this.segmentAngles[i];
            for (var si = 0; si < curMasterSeg.segments.length; si++) {
                if ((this.segmentAngles[i] - this.segmentAngles[i + 1]) == 0) { i++; continue; }
                var circFont;
                if (hoverSegIndex == i) {
                    if (this.showSubSegments) {
                        circFont = CONFIGS.fonts["circularSubTextFontActive"];
                    }
                    else {
                        circFont = CONFIGS.fonts["circularTextFontActive"];
                    }
                }
                else {
                    if (this.showSubSegments) {
                        circFont = CONFIGS.fonts["circularSubTextFont"];
                    }
                    else {
                        circFont = CONFIGS.fonts["circularTextFont"];
                    }
                }


                var radiusToText = this.radius * constants.relativeCircularTextRadius;

                var curSegment = this.segments[i];
                var segName = this.segments[i].name;
                if (this.rotation == "self") {
                    CONFIGS.fonts["circularTextFont"].setFont(this.drawingContext, this.isFullscreen, constants.fontFullscreenFactor);
                    this.drawingContext.fillText(segName, this.centerX, this.centerY - radiusToText - circFont.size - 30);
                    segName = "TECHNOLOGY AFFINITY";
                }

                //"this is a very very long text that will not fit on the segment.";            
                var startAngle = this.segmentAngles[i];
                var endAngle = this.segmentAngles[i + 1]

                // draws two lines if there is a space within the segName
                var spacePosition = segName.indexOf('||');
                if (spacePosition != -1) {
                    var fontFactor = 1;
                    if (this.isFullscreen == true) fontFactor = constants.fontFullscreenFactor;
                    var textDrawn = this.drawCircularText(segName.substr(0, spacePosition), circFont, radiusToText + (circFont.size * fontFactor), startAngle, endAngle);
                    var textDrawn = this.drawCircularText(segName.substr(spacePosition + 2), circFont, radiusToText, startAngle, endAngle);
                } else {
                    var textDrawn = this.drawCircularText(segName, circFont, radiusToText, startAngle, endAngle);
                }


                if (!this.drawMasterSegment) {
                    this.addHandlerToCircText(textDrawn, "seg_" + this.segments[i].id, i, false);
                }

                i++;
            }
            var masterEndAngle = this.segmentAngles[i];
            if (this.drawMasterSegment) {
                var masterTextDrawn = this.drawCircularText(curMasterSeg.name, CONFIGS.fonts["circularTextFont"], this.radius * constants.relativeCircularMasterTextRadius, masterStartAngle, masterEndAngle);
                this.addHandlerToCircText(masterTextDrawn, "mastseg_" + curMasterSeg.id, mi, true);
            }
        }



    }

    this.addHandlerToCircText = function (textDrawn, regionId, tag, isMaster) {
        this.stage.beginRegion(regionId, tag);
        this.drawingContext.beginPath();
        var angleRangeForText = textDrawn.endAngle - textDrawn.startAngle
        this.drawingContext.arc(this.centerX, this.centerY, textDrawn.radiusToText, textDrawn.startAngle, textDrawn.endAngle, false);
        var tempPointX = Math.cos(textDrawn.startAngle + angleRangeForText) * (textDrawn.radiusToText + textDrawn.textHeight) + this.centerX;
        var tempPointY = Math.sin(textDrawn.startAngle + angleRangeForText) * (textDrawn.radiusToText + textDrawn.textHeight) + this.centerY;

        this.drawingContext.lineTo(tempPointX, tempPointY);
        this.drawingContext.arc(this.centerX, this.centerY, textDrawn.radiusToText + textDrawn.textHeight, textDrawn.endAngle, textDrawn.startAngle, true);


        this.drawingContext.closePath();
        //this.drawingContext.strokeStyle = 'black';
        //this.drawingContext.stroke();

        var me = this;
        if (isMaster) {
            if (me.stage.isTouchDevice()) {
                this.stage.addRegionEventListener("ontap", function (indx) {
                    clickedSegIndex = indx;
                });
            }
            else {
                this.stage.addRegionEventListener("onmouseover", function (indx) {
                    hoverSegIndex = indx;
                    me.activeEntry = null;
                });
                this.stage.addRegionEventListener("onmouseout", function (indx) {
                    hoverSegIndex = -1;
                });
                this.stage.addRegionEventListener("onclick", function (indx) {
                    me.toggleToOneMasterSeg(indx)

                    //alert(i);
                });
            }
        }
        else {
            if (me.stage.isTouchDevice()) {
                this.stage.addRegionEventListener("ontap", function (indx) {
                    clickedSegIndex = indx;
                });
            }
            else {
                this.stage.addRegionEventListener("onmouseover", function (indx) {
                    hoverSegIndex = indx;
                    me.activeEntry = null;
                });
                this.stage.addRegionEventListener("onmouseout", function (indx) {
                    hoverSegIndex = -1;
                });
                this.stage.addRegionEventListener("onclick", function (indx) {
                    clickedSegIndex = indx;
                    me.toggleToOneSeg(indx);
                    //alert(i);
                });
            }
        }
        this.stage.closeRegion();
    }

    this.drawCircularText = function (circText, circFont, radiusToText, minAngle, maxAngle, withArrow) {
        //***for drawing circular text
        //this.drawingContext.save();
        circFont.setFont(this.drawingContext, this.isFullscreen, constants.fontFullscreenFactor);
        var letterSpacing = 1;
        var circTextLines = 1;
        var textWidth = this.drawingContext.measureText(circText).width + letterSpacing * (circText.length - 1);
        var angleRangeForText = textWidth / radiusToText;
        angleRangeForText = 2 * Math.atan(textWidth / (2 * radiusToText)) * constants.relativeAngleMarginForSegName;
        var startAngle = minAngle + (maxAngle - minAngle - angleRangeForText) / 2;
        if (angleRangeForText > (maxAngle - minAngle)) {
            startAngle = minAngle;
        }
        var dAngle = angleRangeForText / circText.length;
        var curAngle = startAngle;

        for (var j = 0; j < circText.length; j++) {
            this.drawingContext.save();
            // dAngle = this.drawingContext.measureText(circText[j]).width / radiusToText;
            var str = "" + circText.charAt(j);
            dAngle = 2 * Math.atan((this.drawingContext.measureText(str).width + letterSpacing) / (2 * radiusToText)) * constants.relativeAngleMarginForSegName; //(this.drawingContext.measureText(str).width + letterSpacing) / radiusToText;
            //curAngle = startAngle + j * dAngle;
            if (j > 0) { curAngle += dAngle / 2; }
            if (curAngle >= maxAngle) { break; }
            var pointX = Math.cos(curAngle) * radiusToText + this.centerX;
            var pointY = Math.sin(curAngle) * radiusToText + this.centerY;

            this.drawingContext.translate(pointX, pointY);
            this.drawingContext.rotate(curAngle + Math.PI / 2);

            this.drawingContext.fillText(str, 0, 0);
            this.drawingContext.restore();
            curAngle += dAngle / 2;
        }

        if (withArrow == true) {

            this.drawingContext.strokeStyle = "#000000";
            this.drawingContext.lineWidth = 2;
            this.drawingContext.beginPath();
            this.drawingContext.arc(this.centerX, this.centerY, radiusToText + circFont.size / 2, minAngle, startAngle - Math.PI / 180, false);
            this.drawingContext.stroke();
            this.drawingContext.beginPath();
            this.drawingContext.arc(this.centerX, this.centerY, radiusToText + circFont.size / 2, startAngle + angleRangeForText, maxAngle - Math.PI / 180, false);
            this.drawingContext.stroke();

            var img = this.images[this.arrowOneWay];
            this.drawingContext.save();
            var pointX = Math.cos(maxAngle - Math.PI / 180) * (radiusToText + circFont.size / 2) + this.centerX;
            var pointY = Math.sin(maxAngle - Math.PI / 180) * (radiusToText + circFont.size / 2) + this.centerY;
            var arrowLen = 15;
            var arrowWth = 10;
            this.drawingContext.translate(pointX, pointY);
            this.drawingContext.rotate(maxAngle - Math.PI / 180 + Math.PI / 2);
            this.drawingContext.drawImage(img, -arrowLen / 2, -arrowWth / 2, arrowLen, arrowWth);
            this.drawingContext.restore();

        }
        //this.drawingContext.restore();
        var endAngle = (startAngle + angleRangeForText) > maxAngle ? maxAngle : (startAngle + angleRangeForText);

        return { startAngle: startAngle, endAngle: endAngle, radiusToText: radiusToText, textHeight: circFont.size };
    }

    function toggleToOneSeg(segIndex) {
        if (segIndex == -1) { return; }
        try {
            this.stage.start(true);
            this.showSingleSeg = !this.showSingleSeg;
            this.segIndexToShow = segIndex;
            this.segAnimating = true;
            this.drawingContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.update();
            this.draw();
        }
        catch (err) {
            alert('an error occured');
        }
    }

    this.toggleToOneMasterSeg = function (masterIndex) {
        if (masterSegmentOpened) {
            // is executed when radar is closing
            for (var i = 0; i < this.segmentAngles.length; i++) {
                this.segmentAngles[i] = this.segmentAnglesPer[i];
            }
            masterSegmentOpened = false;
            return;
        }
        masterSegmentOpened = true;
        this.stage.start(true);
        this.showSingleSeg = !this.showSingleSeg;
        this.segIndexToShow = masterIndex;
        this.segAnimating = true;
        this.drawingContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.update();
        this.draw();

    }
    function findEntriesToPlot() {
        if (!CONFIGS.showFilter) {
            return this.entries;
        }
        var me = this;
        var checkedFilters = new Array();
        var filterActive = false;
        $jq("#filter input[type=checkbox]").each(function () {
            var filterGroup = $jq(this).data("filterGroup");
            var filterValue = $jq(this).data("filterValue");
            if (!checkedFilters[filterGroup]) {
                checkedFilters[filterGroup] = new Array();
            }
            if (this.checked) {
                checkedFilters[filterGroup].push(filterValue);
            }
            else {
                filterActive = true;
            }
        });

        //if (this.statusFilters.indexOf(false) != -1
        if (filterActive) //indicates filter is active
        {
            $jq("#filterSelect").addClass("active");
        }
        else {
            $jq("#filterSelect").removeClass("active");
        }


        var filteredEntries = new Array();

        for (var i = 0; i < this.entries.length; i++) {
            var curEntry = this.entries[i];
            var skipEntry = false;
            for (var filterGroup in checkedFilters) {
                var filterValue = curEntry.filters[filterGroup];
                if (typeof (filterValue) == 'function') {
                    continue;
                }
                if (getIndexOf(checkedFilters[filterGroup], filterValue) == -1) {
                    skipEntry = true;
                    break;
                }
            }

            if (skipEntry) {
                continue;
            }

            filteredEntries.push(curEntry);
        }

        return filteredEntries;

    }



    function drawInterConnections(plotInfo, plotInfos) {
        var relations = plotInfo.entry.relations;
        var orderedRelations = new Array(); //relations ordered wrt angle of connection line
        var orderedConnectionAngles = new Array(); //original connection angles to ensure the max seperation
        var connectionsToDarw = new Array();
        this.drawingContext.beginPath();

        var minAngleBtwConns = Math.min(Math.PI / 50, Math.PI / (relations.length - 1));

        for (var i = 0; i < relations.length; i++) { //i


            var relation = relations[i];

            var relatedPlotInfo = plotInfos[relation.entryId];
            if (!relatedPlotInfo) {
                continue;
            }

            var p1 = plotInfo.pointWithMaxDistance;
            var p2 = relatedPlotInfo.pointWithMaxDistance;

            var angleBetPoints = Math.atan((p2.y - p1.y) / (p2.x - p1.x));  //finds angle between the starting and end points

            if (i == 0) {
                orderedRelations.push(relation);
                orderedConnectionAngles.push(angleBetPoints);
            }
            else {
                var j = 0;

                for (j = 0; j < orderedConnectionAngles.length; j++) {
                    if ((orderedConnectionAngles[j] > angleBetPoints)) {
                        var newOrderedConnectionAngles = new Array();
                        var newOrderedRelations = new Array();
                        //if the current angle is smaller rearrange the array
                        for (var k = 0; k < orderedConnectionAngles.length; k++) {
                            if (k == j) {
                                newOrderedConnectionAngles.push(angleBetPoints);
                                newOrderedRelations.push(relation);
                            }
                            newOrderedConnectionAngles.push(orderedConnectionAngles[k]);
                            newOrderedRelations.push(orderedRelations[k]);
                        }
                        orderedRelations = newOrderedRelations;
                        orderedConnectionAngles = newOrderedConnectionAngles;
                        break;
                    }

                } //j

                if (j == (orderedConnectionAngles.length)) {
                    orderedConnectionAngles.push(angleBetPoints);
                    orderedRelations.push(relation);
                }


            } //else

        } //i


        var calulatedConnAngles = new Array(orderedConnectionAngles.length);

        for (var j = 0; j < orderedConnectionAngles.length / 2; j++) {
            var requiredAngDiff = minAngleBtwConns * (orderedConnectionAngles.length - 1 - 2 * j);

            if (j == 0) {
                calulatedConnAngles[j] = orderedConnectionAngles[j];
                calulatedConnAngles[orderedConnectionAngles.length - 1 - j] = orderedConnectionAngles[orderedConnectionAngles.length - 1 - j];

            }

            var angDiff = calulatedConnAngles[orderedConnectionAngles.length - 1 - j] - calulatedConnAngles[j];
            var shiftBy = (requiredAngDiff - angDiff) / 2;


            if (angDiff < requiredAngDiff) {
                calulatedConnAngles[j] = calulatedConnAngles[j] - shiftBy;
                calulatedConnAngles[orderedConnectionAngles.length - 1 - j] = calulatedConnAngles[orderedConnectionAngles.length - 1 - j] + shiftBy;

                if (j != 0) {
                    if ((calulatedConnAngles[j] - calulatedConnAngles[j - 1]) < minAngleBtwConns) {
                        var offset = minAngleBtwConns - ((calulatedConnAngles[j] - calulatedConnAngles[j - 1]));
                        calulatedConnAngles[j] += offset;
                        calulatedConnAngles[orderedConnectionAngles.length - 1 - j] += offset;

                    }
                    else if ((calulatedConnAngles[orderedConnectionAngles.length - j] - calulatedConnAngles[orderedConnectionAngles.length - 1 - j]) < minAngleBtwConns) {
                        var offset = minAngleBtwConns - (calulatedConnAngles[orderedConnectionAngles.length - j] - calulatedConnAngles[orderedConnectionAngles.length - 1 - j]);
                        calulatedConnAngles[j] -= offset;
                        calulatedConnAngles[orderedConnectionAngles.length - 1 - j] -= offset;
                    }
                }


            }
            else if (requiredAngDiff == 0) {
                var diffWithLast = calulatedConnAngles[j] - calulatedConnAngles[j - 1];
                if (diffWithLast < minAngleBtwConns) {
                    calulatedConnAngles[j] = calulatedConnAngles[j - 1] + minAngleBtwConns;
                }
            }

            if (j < (orderedConnectionAngles.length / 2) - 1) {
                if ((orderedConnectionAngles[j + 1] - calulatedConnAngles[j]) >= minAngleBtwConns) {
                    calulatedConnAngles[j + 1] = orderedConnectionAngles[j + 1];
                }
                else {
                    calulatedConnAngles[j + 1] = calulatedConnAngles[j] + minAngleBtwConns;
                }

                if ((calulatedConnAngles[orderedConnectionAngles.length - 1 - j] - orderedConnectionAngles[orderedConnectionAngles.length - 1 - (j + 1)]) >= minAngleBtwConns) {
                    calulatedConnAngles[orderedConnectionAngles.length - 1 - (j + 1)] = orderedConnectionAngles[orderedConnectionAngles.length - 1 - (j + 1)];
                }
                else {
                    calulatedConnAngles[orderedConnectionAngles.length - 1 - (j + 1)] = calulatedConnAngles[orderedConnectionAngles.length - 1 - j] - minAngleBtwConns;
                }
            }
        }

        for (var k = 0; k < orderedRelations.length; k++) {
            var relation = orderedRelations[k];

            var relatedPlotInfo = plotInfos[relation.entryId];

            var p1 = plotInfo.pointWithMaxDistance;
            var p2 = relatedPlotInfo.pointWithMaxDistance;

            //find the control point for darwing curve
            var controlPoint
            if (calulatedConnAngles[k] != orderedConnectionAngles[k]) {
                var m1 = Math.tan(calulatedConnAngles[k]);
                var c1 = p1.y - m1 * p1.x;

                var m2 = -(p2.x - p1.x) / (p2.y - p1.y);
                var c2 = ((p2.y + p1.y) - m2 * (p2.x + p1.x)) / 2;

                var cpX = (c1 - c2) / (m2 - m1);
                var cpY = m1 * cpX + c1;
                controlPoint = new Point(cpX, cpY);
            }
            else {
                controlPoint = new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
            }

            //calculate the angle for arrow
            /*
            var a1 = calulatedConnAngles[k];
            var a2 = calulatedConnAngles[k] - orderedConnectionAngles[k];
            var a3 = 2 * a2 - a1;  //angle for arrow
            */

            connectionsToDarw.push(new InterConnection(p1, controlPoint, p2, relation.tofrom, relation.intensity, orderedConnectionAngles[k], this))
        }

        //find a control point at middle to make a curve betwen the points
        for (var l = 0; l < connectionsToDarw.length; l++) {
            var connection = connectionsToDarw[l];
            connection.drawConnection();
        }
        for (var l = 0; l < connectionsToDarw.length; l++) {
            var connection = connectionsToDarw[l];
            connection.drawArrow();
        }

    }



    //helper classes
    function getXML(listner) {

    }

    function mastersegment(name, id, segments) {
        this.typeName = "mastersegment";
        this.name = name;
        this.id = id;
        this.segments = segments;
    }

    function segment(name, id) {
        this.typeName = "segment";
        this.name = name;
        this.id = id;
    }

    function category(name, color) {
        this.typeName = "category";
        this.name = name;
        this.color = color;
    }

    function status(name, id) {
        this.typeName = "status";
        this.name = name;
        this.id = id;
    }

    function corporateFunction(name, id) {
        this.typeName = "corporateFunction";
        this.name = name;
        this.id = id;
    }

    function entry(
        id
        , name
        , description
        , date
        , categories
        , url
        , segmentName
        , segment_id
        , plotValues
        , rotation_angle
        , avg_rating
        , rating_votes
        , thumb_ups
        , thumb_downs
        , value_of_opportunity
        , view_count
        , corporate_functions
        , status
        , status_id
        , overlayImages
        , verticals
        , relations
        , isMain
        , filters
    ) {
        this.id = id;
        this.typeName = "entry";
        this.name = name;
        this.description = description;
        this.date = date;
        this.categories = categories;
        this.url = url;
        this.segment = segment;
        this.segment_id = segment_id;
        this.plotValues = plotValues;
        this.rotation_angle = rotation_angle;
        this.avg_rating = avg_rating;
        this.rating_votes = rating_votes;
        this.thumb_ups = thumb_ups;
        this.thumb_downs = thumb_downs;
        this.value_of_opportunity = value_of_opportunity;
        this.view_count = view_count;
        this.corporate_functions = corporate_functions;
        this.status = status;
        this.status_id = status_id;
        this.overlayImages = overlayImages;
        this.verticals = verticals;
        this.relations = relations;
        this.isMain = isMain;
        this.filters = filters;

        this.getDistance = function (plotOptionIndex) { return this.plotValues[plotOptionIndex] * 1; };
    }

    function Relation(tofrom, entryId, intensity) {
        this.tofrom = tofrom;
        this.entryId = entryId;
        this.intensity = intensity;
    }

    function InterConnection(startPoint, controlPoint, endPoint, direction, intensity, arrowAngle, sender) {
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.controlPoint = controlPoint;
        this.direction = direction;
        this.intensity = intensity;
        this.sender = sender;
        this.arrowAngle = arrowAngle;


        this.drawConnection = function () {


            if (this.intensity == "low") {
                sender.drawingContext.strokeStyle = "#505050";
                sender.drawingContext.lineWidth = 0.4;
            }
            else if (this.intensity == "medium") {
                sender.drawingContext.strokeStyle = "#202020";
                sender.drawingContext.lineWidth = 1;
            }
            else if (this.intensity == "high") {
                sender.drawingContext.strokeStyle = "#000000";
                sender.drawingContext.lineWidth = 1.4;
            }

            sender.drawingContext.beginPath();
            sender.drawingContext.moveTo(startPoint.x, startPoint.y);
            sender.drawingContext.quadraticCurveTo(controlPoint.x, controlPoint.y, endPoint.x, endPoint.y);
            /*
            sender.drawingContext.lineTo(controlPoint.x, controlPoint.y);
            sender.drawingContext.stroke();
            //this.drawingContext.beginPath();
            sender.drawingContext.strokeStyle = "red";
            sender.drawingContext.lineTo(endPoint.x, endPoint.y);
            */
            //sender.drawingContext.lineTo(endPoint.x, endPoint.y);
            sender.drawingContext.stroke();

        };


        this.drawArrow = function () {
            var arrowLen = 15;
            var arrowWth = 10;
            sender.drawingContext.save();
            var arrowX = ((this.startPoint.x + this.endPoint.x) / 2 + this.controlPoint.x) / 2;
            var arrowY = ((this.startPoint.y + this.endPoint.y) / 2 + this.controlPoint.y) / 2;
            sender.drawingContext.translate(arrowX, arrowY);
            var inverseAngle = 0;
            if (startPoint.x < endPoint.x) {
                inverseAngle += Math.PI;
            }


            var img = sender.images[sender.arrowOneWay];
            if (this.direction == "to") {
                inverseAngle += Math.PI;
            }
            else if (this.direction == "bidirection") {
                img = sender.images[sender.arrowTwoWay];
                arrowLen = 30;
            }



            sender.drawingContext.rotate(this.arrowAngle + inverseAngle);
            sender.drawingContext.drawImage(img, -arrowLen / 2, -arrowWth / 2, arrowLen, arrowWth);
            sender.drawingContext.restore();

        };
    }

    function OverlayImage(imageUrl, hAlign, vAlign, width, height, margin) {

        this.imageUrl = imageUrl;
        this.hAlign = hAlign;
        this.vAlign = vAlign;
        this.width = width;
        this.height = height;
        this.margin = margin;
    }

    function Version(id, title, timestamp) {
        this.id = id;
        this.title = title;
        this.timestamp = timestamp * 1;
        this.date = new Date(this.timestamp * 1000);
        this.xPos = 0;

    }

    function loadImages(sources, callback) {
        var loadedImages = 0;
        var numImages = 0;
        for (var src in sources) {
            numImages++;
            if (typeof (images[src] == 'function')) {
                continue;
            }
            images[src] = new Image();
            images[src].onload = function () {
                if (++loadedImages >= numImages) {
                    callback();
                }
            };
            images[src].src = sources[src];
        }
    }


    function XMLParser(url, listner) {
        //$jq.get( url,null, parseXML);
        $jq.ajax({
            type: "GET",
            url: url,
            success: parseXML,
            error: parseXMLError
        });

        function parseXMLError() {
            alert("an error occured.");
        }



        function parseXML(data) {
            listner.activeEntry = null;

            //get configs form xml
            listner.drawInterConnection = $jq("configs > drawInterConnection", data).text();
            listner.hideToolTip = $jq("configs > hideTooltip", data).text();
            listner.expandDotTitle = $jq("configs > expandDotTitle", data).text();
            listner.showSubSegments = ($jq("configs > showSubSegments", data).text() == "true");
            listner.rotation = $jq("configs > rotation", data).text();  //added for rotation
            listner.drawMasterSegment = ($jq("configs > drawMasterSegment", data).text() == "true");

            CONFIGS.showFilter = ($jq("configs > showFilter", data).text() == "true");
            if (listner.rotation == undefined || listner.rotation == null || listner.rotation == "") {
                listner.rotation = "auto";
            }

            //for segment line color and width
            listner.segmentLineColor = $jq("configs > segmentLineColor", data).text();
            var segLineThickness = $jq("configs > segmentLineThickness", data).text() * 1;
            if (segLineThickness > 0) {
                listner.segmentLineThickness = segLineThickness;
            }
            listner.masterSegmentLineThickness = $jq("configs > masterSegmentLineThickness", data).text() * 1;
            var mSegLineThickness = $jq("configs > masterSegmentLineThickness", data).text() * 1;
            if (mSegLineThickness > 0) {
                listner.masterSegmentLineThickness = mSegLineThickness;
            }
            var fontConfigs = new Array();
            //init defaults
            fontConfigs["entryNameFont"] = new font("Arial", 12, false, "#000000", "center", "middle");
            fontConfigs["plotOptionNameActiveFont"] = new font("Arial", 20, false, "#000000", "center", "top");
            fontConfigs["plotOptionNameFont"] = new font("Arial", 20, false, "#000000", "center", "top");
            fontConfigs["xAxisLabelFont"] = new font("Arial", 12, false, "#555555", "center", "top");
            fontConfigs["circularTextFont"] = new font("Arial", 13, true, "#555555", "center", "bottom");
            fontConfigs["circularTextFontActive"] = new font("Arial", 13, true, "#000000", "center", "bottom");
            fontConfigs["circularSubTextFont"] = new font("Arial", 11, true, "#555555", "center", "bottom");
            fontConfigs["circularSubTextFontActive"] = new font("Arial", 11, true, "#555555", "center", "bottom");

            $jq("configs > fonts > font", data).each(function () {
                var fontName = $jq(this).attr("name");
                var type = $jq("type", this).text();
                var size = $jq("size", this).text() * 1;
                var isBold = ($jq("isBold", this).text() == 'true');
                var color = $jq("color", this).text();
                var hAlign = $jq("hAlign", this).text();
                var vAlign = $jq("vAlign", this).text();
                fontConfigs[fontName] = new font(type, size, isBold, color, hAlign, vAlign);

            });
            CONFIGS.fonts = fontConfigs;

            // loads background image
            var background = ($jq("configs > backgroundImage", data).text());
            if (background != "") {
                listner.backgroundImage = new Image();
                listner.backgroundImage.src = background;

                // TODO: add margins for background position
            }


            //parse version only at first time
            if (listner.versions == null) {

                var prevVersions = new Array();
                $jq("versions > version", data).each(function () {
                    var id = $jq(this).attr("id");
                    var title = $jq("title", this).text();
                    var timestamp = $jq("timestamp", this).text();
                    var newVersion = new Version(id, title, timestamp);
                    var newVersionInserted = false;
                    //make sure that version are sorted by timestamp in asc order
                    var newVersions = new Array();
                    for (var i = 0; i < prevVersions.length; i++) {
                        if (!newVersionInserted && (newVersion.timestamp < prevVersions[i].timestamp)) {
                            newVersions.push(newVersion);
                            newVersionInserted = true;
                        }
                        newVersions.push(prevVersions[i]);
                    }
                    if (!newVersionInserted) {
                        newVersions.push(newVersion);
                        newVersionInserted = true;
                    }
                    prevVersions = newVersions;

                });
                listner.versions = prevVersions;
                listner.curVersion = listner.versions[listner.versions.length - 1];
                if (listner.versions.length > 0) {
                    this.historySlider = new HistorySlider(listner.sliderDivId, listner.versions);
                    this.historySlider.setChangedHandler(function (version) {
                        listner.curVersion = version;/*version.timestamp*/
                        listner.loadAnotherXml(xmlfile + "version=" + version.id);
                    });
                }
            }



            var imageUrls = new Array();
            listner.imageUrls = imageUrls;
            listner.images = new Array();
            listner.imageUrls.push(listner.textBgImage);
            listner.imageUrls.push(listner.arrowTwoWay);
            listner.imageUrls.push(listner.arrowOneWay);
            listner.dotImages = new Array();
            listner.overlayImages = new Array();

            //extract master-segments for xml  
            listner.mastersegments = new Array();
            listner.mastersegmentIds = new Array();

            //extract sub-segments for xml  
            listner.segments = new Array();
            listner.segmentIds = new Array();

            var mastersegmentNodes = $jq("mastersegments > mastersegment > attrs", data).each(function () {
                var mastersegmentName = $jq("attr[name='name']:first", this).text();
                var mastersegmentId = $jq("attr[name='id']:first", this).text();
                var curMasterSegment = new mastersegment(mastersegmentName, mastersegmentId, new Array());
                listner.mastersegments.push(curMasterSegment);
                listner.mastersegmentIds.push(curMasterSegment.id);


                var segmentName = $jq("subsegments > subsegment > attrs", this).each(function () {
                    var segmentName = $jq("attr[name='name']:first", this).text();
                    var segmentId = $jq("attr[name='id']:first", this).text();
                    var curSegment = new segment(segmentName, segmentId);
                    curMasterSegment.segments.push(curSegment);
                    listner.segments.push(curSegment);
                    listner.segmentIds.push(curSegment.id);

                });

            });

            listner.status = new Array();
            listner.statusIds = new Array();
            listner.statusFilters = new Array();
            var statusNodes = $jq("statuses > status > attrs", data).each(function () {
                var statusName = $jq("attr[name='name']:first", this).text();
                var statustId = $jq("attr[name='id']:first", this).text();
                var imageUrl = $jq("attr[name='imageUrl']:first", this).text();
                var curStatus = new status(statusName, statustId);
                listner.status.push(curStatus);
                if (imageUrl && !("" == imageUrl)) {
                    listner.imageUrls.push(imageUrl);
                    listner.dotImages[statustId] = imageUrl;
                }
                listner.statusIds.push(curStatus.id);
                listner.statusFilters.push(true);
            });



            //extract categories form xml
            listner.categories = new Array();
            listner.categoryNames = new Array();
            listner.categoryFilters = new Array();
            var categorieNodes = $jq("categories > category > attrs", data).each(function () {
                var categoryName = $jq("attr[name='name']:first", this).text();
                var categoryColor = $jq("attr[name='color']:first", this).text();
                var curCategory = new category(categoryName, categoryColor);
                listner.categories.push(curCategory);
                listner.categoryNames.push(curCategory.name);
                listner.categoryFilters.push(true);
            });

            listner.corporate_functions = new Array();
            listner.corporate_function_names = new Array();
            listner.corporate_functionFilters = new Array();
            var segmentNodes = $jq("corporate-functions > corporate-function > attrs", data).each(function () {
                var corporateFuncName = $jq("attr[name='name']:first", this).text();
                var corporateFunctId = $jq("attr[name='id']:first", this).text();
                var curcorporateFunc = new corporateFunction(corporateFuncName, corporateFunctId);
                listner.corporate_functions.push(curcorporateFunc);
                listner.corporate_function_names.push(curcorporateFunc.name);
                listner.corporate_functionFilters.push(true);
            });


            listner.plotOptions = new Array();
            var plotValuesNodes = $jq("plotOptions > plotOption", data).each(function () {
                var name = $jq("attr[name='name']:first", this).text();
                var displayName = $jq("attr[name='displayName']:first", this).text();
                var sameColorForEntries = $jq("attr[name='sameColorForEntries']:first", this).text() == "true";
                var minVal = $jq("attr[name='minValue']:first", this).text();
                var maxVal = $jq("attr[name='maxValue']:first", this).text();
                var divisions = new Array();
                $jq("division", this).each(function () {
                    var divName = $jq(this).attr("name");
                    var divFillColor = $jq("fillColor:first", this).text();
                    var divBorderColor = $jq("borderColor:first", this).text();
                    divisions.push(new PlotOptionDivision(divName, divFillColor, divBorderColor));
                });
                listner.plotOptions.push(new plotOption(name, displayName, sameColorForEntries, minVal, maxVal, divisions));
            });

            if (!listner.curPlotOptIndex || listner.plotOptions.length <= listner.curPlotOptIndex) {
                listner.curPlotOptIndex = 0;
                listner.showHideLegend(0);
            }


            //extract entries from xml
            var allBusinessUnits = new Array();
            listner.entries = new Array();
            listner.allFilters = new Array();
            //listner.segmentNames = new Array();
            //listner.segments = new Array();
            var entryNodes = $jq("entries > entry > attrs", data).each(function () {
                var id = $jq("attr[name='id']:first", this).text();
                var name = $jq("attr[name='name']:first", this).text();
                var description = $jq("attr[name='description']:first", this).text();
                var date = $jq("attr[name='date']:first", this).text();
                var categories = $jq("attr[name='categories']:first", this).text().split(",");
                var url = $jq("attr[name='url']:first", this).text();
                var segmentName = $jq("attr[name='segment']:first", this).text();
                var segment_id = $jq("attr[name='segment-id']:first", this).text();


                //parse overlay image
                var overlayImages = new Array();
                $jq("overlayImages > overlayImage", this).each(function () {
                    var imagePath = $jq("imageUrl", this).text();
                    var hAlign = $jq("hAlign", this).text();
                    var vAlign = $jq("vAlign", this).text();
                    var width = $jq("width", this).text();
                    var height = $jq("height", this).text();
                    var strMargin = $jq("margin", this).text();
                    strMargin = (strMargin && "" != strMargin) ? strMargin : "{left:0,top:0,right:0,bottom:0}"
                    var margin = eval('(' + strMargin + ')');
                    var overlayImage = new OverlayImage(imagePath, hAlign, vAlign, width, height, margin);
                    overlayImages.push(overlayImage);
                    if (imagePath && !("" == imagePath)) {
                        listner.imageUrls.push(imagePath);
                        listner.overlayImages[id + ''] = imagePath;
                    }
                });






                var isMainNode = $jq("attr[name='isMain']:first", this);
                var isMain = false;
                if (isMainNode.length > 0) {
                    isMain = true;
                }

                var relations = new Array();

                $jq("relation", this).each(function () {
                    var tofrom = $jq("attr[name='tofrom']:first", this).text();
                    var entryId = $jq("attr[name='entryId']:first", this).text();
                    var intensity = $jq("attr[name='intensity']:first", this).text();
                    relations.push(new Relation(tofrom, entryId, intensity));
                });

                var plotValues = new Array();

                for (var i = 0; i < listner.plotOptions.length; i++) {
                    var plotValue = $jq("attr[name='" + listner.plotOptions[i].name + "']:first", this).text();
                    plotValues.push(plotValue);
                }

                //added for trend radar
                var rotation_angle = $jq("attr[name='rotation-angle']:first", this).text();
                var avg_rating = $jq("attr[name='avg-rating']:first", this).text();
                var rating_votes = $jq("attr[name='rating-votes']:first", this).text();
                var thumb_ups = $jq("attr[name='thumb-ups']:first", this).text();
                var thumb_downs = $jq("attr[name='thumb-downs']:first", this).text();
                var value_of_opportunity = $jq("attr[name='value-of-opportunity']:first", this).text();
                var view_count = $jq("attr[name='view-count']:first", this).text();
                var corporate_functions = $jq("attr[name='corporate-functions']:first", this).text().split(",");
                /*for (var l = 0; l < corporate_functions.length; l++) {
                if (allBusinessUnits.indexOf(corporate_functions[l]) == -1) {
                allBusinessUnits.push(corporate_functions[l]);
                }
                }*/
                var status = $jq("attr[name='status']:first", this).text();
                var status_id = $jq("attr[name='status-id']:first", this).text();
                var verticals = $jq("attr[name='verticals']:first", this).text();

                var filters = new Array();
                $jq("filters>filter", this).each(function () {
                    var key = $jq("attr[name='filterGroup']", this).text();
                    var value = $jq("attr[name='filterValue']", this).text();
                    filters[key] = value;
                    if (!listner.allFilters[key]) {
                        listner.allFilters[key] = new Array();
                    }

                    if (getIndexOf(listner.allFilters[key], value) == -1) {
                        getIndexOf(listner.allFilters[key].push(value));
                    }

                });

                var curEntry = new entry(
                    id
                    , name
                    , description
                    , date
                    , categories
                    , url
                    , segmentName
                    , segment_id
                    , plotValues
                    , rotation_angle
                    , avg_rating
                    , rating_votes
                    , thumb_ups
                    , thumb_downs
                    , value_of_opportunity
                    , view_count
                    , corporate_functions
                    , status
                    , status_id
                    , overlayImages
                    , verticals
                    , relations
                    , isMain
                    , filters
                )

                listner.entries.push(curEntry);
                /*
                if (listner.segmentNames.indexOf(curEntry.segment) == -1) {
                listner.segmentNames.push(curEntry.segment);
                var newSeg = new segment(curEntry.segment, 0);
                listner.segments.push(newSeg);
                }
                */

            });


            //start downloading images

            for (var i = 0; i < listner.imageUrls.length; i++) {
                var img = new Image();
                listner.images[listner.imageUrls[i]] = img;
            }
            listner.imageCount = 0;
            for (imageUrl in listner.images) {
                var key = imageUrl;
                var img = listner.images[imageUrl];
                if (typeof (img) != 'object') {
                    continue;
                }
                img.onload = function (src) {
                    listner.loadedImageCount++;
                    //alert("Image loaded");
                }
                img.src = key;
                listner.imageCount++;
            }

            $jq("#msg").text(allBusinessUnits.join(","));

            var segmentAngles = new Array(listner.segments.length + 1);
            var segmentAnglesPer = new Array(listner.segments.length + 1);
            var isSegmentOpened = (listner.showSingleSeg == true && listner.segIndexToShow < listner.segments.length);
            for (var i = 0; i <= listner.segments.length; i++) {
                var ang = Math.PI + Math.PI * i / listner.segments.length;
                if (isSegmentOpened) {
                    if (i <= listner.segIndexToShow) {
                        segmentAngles[i] = Math.PI;
                    }
                    else {
                        segmentAngles[i] = 2 * Math.PI;
                    }
                }
                else {
                    segmentAngles[i] = ang;
                }
                segmentAnglesPer[i] = ang;
            }





            listner.segmentAngles = segmentAngles;
            listner.segmentAnglesFinal = segmentAngles;
            listner.segmentAnglesPer = segmentAnglesPer;
            var setStage = function () {
                if (listner.imageCount <= listner.loadedImageCount) {
                    listner.addFilterControl();
                    listner.drawingContext.clearRect(0, 0, listner.canvas.width, listner.canvas.height);
                    listner.update();
                    listner.draw();
                    if (!listner.isUpdateDrawSet) {
                        listner.stage.setDrawStage(function () { listner.draw() });
                        listner.stage.setUpdateStage(function () { listner.update() });
                        listner.isUpdateDrawSet = true;
                    }
                    // listner.stage.start();
                }
                else {
                    window.setTimeout(setStage, 1);
                }
            }
            window.setTimeout(setStage, 1);

        }


    }

    function setLoadListners(xmlLoadingListner, xmlLoadedListner) {
        this.onDrawn = xmlLoadedListner;
        this.onXmlLoading = xmlLoadingListner;
    }

    function distroy() {
        this.stage.stop();
        this.stage.setDrawStage();
        this.stage.setUpdateStage();
    }

    function loadAnotherXml(path) {
        this.stage.stop();
        if (this.onXmlLoading != null) { this.onXmlLoading(); }
        XMLParser(path, this);
    }

    //function tocheckIE8or less
    function isIE8OrLess() {
        var rv = -1; // Return value assumes failure.
        if (navigator.appName == 'Microsoft Internet Explorer') {
            var ua = navigator.userAgent;
            var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
            if (re.exec(ua) != null)
                rv = parseFloat(RegExp.$1);
        }
        else {
            return false;
        }

        if (rv != -1 && rv <= 8.0) {
            return true;
        }
        else {
            return false;
        }
    }

    //resizing canvas
    function resizeCanvas(newFullWidth, newFullHeight) {
        var canvasToResize = this.canvas;

        if (this.canvas.width <= newFullWidth) {
            this.isFullscreen = true;
        } else {
            this.isFullscreen = false;
        }

        var newWidth = newFullWidth;
        var newHeight = newFullHeight;
        canvasToResize.setAttribute("height", newHeight);
        canvasToResize.setAttribute("width", newWidth);
        this.radius = Math.min(canvasToResize.width / 2, canvasToResize.height) * constants.relativeRadius;
        this.centerX = canvasToResize.width / 2;
        this.centerY = (canvasToResize.height + this.radius) / 2;

        this.draw();
        this.update();
        $jq(this.canvas).mousemove();

        if (sliderDivId != "") {
            $jq("#" + this.sliderDivId).html("");
            this.historySlider = new HistorySlider(this.sliderDivId, this.versions);
            var versionIndx = getIndexOf(this.versions, this.curVersion);
            $jq("#" + this.sliderDivId + " > span.Anchors").eq(versionIndx).click();
            this.historySlider.setChangedHandler(function (version) {
                radDiag.curVersion = version;
                radDiag.loadAnotherXml(xmlfile + "version=" + version.id);
            });
        }

    }

    function addStatusLegends() {
        var legendList = $jq("#radarLegends ul");
        for (var i = 0; i < this.status.length; i++) {
            var status = this.status[i];
            var imgUrl = this.dotImages[status.id];
            var legendItem = $jq("<li/>").html(status.name).css("background", "url(" + imgUrl + ") right center no-repeat");
            legendList.append(legendItem);
        }
    }

    function addFilterControl() {

        if (!CONFIGS.showFilter) {
            $jq("#filter").hide();
            return;
        }

        var me = this;
        function fireChangedEvent() {
            me.stage.drawStage();
        }

        function selectAll(e) {
            var s = this;
            $jq(".chkFilter", this.parentElement.parentElement).each(function () {
                this.checked = s.checked;
            });
            fireChangedEvent();
        }

        var filterAccordion = $jq("#filter  #accordion");
        filterAccordion.remove();
        filterAccordion = $jq('<div id="accordion">' +
            '<h3 id="filterGroupTitle"><a  href="#">Status</a></h3>' +
            '<div id="filterValues">' +
            '<span class="selectAll"><input class="chkSelectAll" type="checkbox" checked="checked" /> Select All</span>' +
            '</div>' +
            '</div>');
        var tempFilterHeader = $jq("#filterGroupTitle", filterAccordion);
        var tempFilterValues = $jq("#filterValues", filterAccordion);
        filterAccordion.empty();

        for (var filterGroup in this.allFilters) {
            var filterValues = this.allFilters[filterGroup];
            if (typeof (filterValues) == 'function') {
                continue;
            }
            var newFilterHeader = tempFilterHeader.clone();
            $jq("a", newFilterHeader).text(filterGroup);
            var newFilterValues = tempFilterValues.clone();
            var listStatus = $jq("<ul/>");
            for (var i = 0; i < filterValues.length; i++) {
                var status = filterValues[i];
                var listItem = $jq("<li/>");
                var chkBox = $jq("<input/>", { change: fireChangedEvent, type: "checkbox", checked: true });
                chkBox.addClass("chkFilter");
                chkBox.data("filterGroup", filterGroup);
                chkBox.data("filterValue", filterValues[i]);
                listItem.append(chkBox);
                listItem.append(filterValues[i]);
                listStatus.append(listItem);
            }

            newFilterValues.append(listStatus);

            filterAccordion.append(newFilterHeader);
            filterAccordion.append(newFilterValues);
        }


        $jq("#filter").append(filterAccordion);
        $jq("#filter .chkSelectAll").change(selectAll);
        $jq("#filter .chkFilter").change(fireChangedEvent);
        initAccordion();
    }

    function filterChanged(sender, selectedItem) {
        //var selectedItem = $jq(this).data("tag");
        if (selectedItem.typeName == "status") {
            var indx = getIndexOf(this.statusIds, selectedItem.id);
            if (indx != -1) {
                this.statusFilters[indx] = sender.checked;
            }
        }
        else if (selectedItem.typeName == "category") {
            var indx = getIndexOf(this.categoryNames, selectedItem.name);
            if (indx != -1) {
                this.categoryFilters[indx] = sender.checked;
            }
        }
        else if (selectedItem.typeName == "corporateFunction") {
            var indx = getIndexOf(this.corporate_function_names, selectedItem.name);
            if (indx != -1) {
                this.corporate_functionFilters[indx] = sender.checked;
            }
        }

    }

    function plotOption(name, displayName, sameColorForEntries, minValue, maxValue, divisions) {
        this.name = name;
        this.displayName = displayName;
        this.sameColorForEntries = sameColorForEntries;
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.divisions = divisions;
    }

    function PlotOptionDivision(name, fillColor, borderColor) {
        this.name = name;
        this.fillColor = fillColor;
        this.borderColor = borderColor != null && borderColor != "" ? borderColor : constants.dividerLineColor;
    }

    function Constants() {
        this.relativeRadius = 0.80; //fraction of canvas size used to darw circle
        this.canvasRefreshRate = 20;
        this.animeDAngle = Math.PI / 15; //change in angle in each step of animation when showing one segment
        this.segmentPadding = 15; //space in pixel at the start and end of each segment to ensure that point from one seg doesn't go to other
        this.minSeperation = 1.5; //this is the minimum incremental seperation used to calculate point seperation
        this.minPointRadius = 5; //min size of point drawn
        this.pointRadiusChangeRate = 0.5; //rate as which point radius increase with avg rating value
        this.maxCharsInEntryName = 25; //max number of char drawn below a point
        this.segNameHeight = 10; //height in pixel of active region for segment name
        this.thinLineWidth = 0.4;
        this.thickLineWidth = 1;
        this.thickLineWidthForMaster = 3;
        this.startLabelAt = 8; //sart point draw x-axis lable below circle
        this.endLabelAt = 18;
        this.endLabelAtforDisplayName = 14; //horizontally center the radar footer
        this.relativeSegLineLen = 1 / 0.95; //length of segment line relative to the radius of circle
        this.relativeCircularTextRadius = 1 / 0.97;
        this.relativeCircularMasterTextRadius = 1 / 0.9;
        this.relativeBgRadius = 1 / 0.95;
        this.relativeMinPointRadius = 0.010;
        this.relativeMaxPointRadius = 0.026;
        this.relativeAngleMarginForSegName = 1.1; //angle range for drawing circular text is increased by this amount to ensure seperation between letters
        this.maxRate = 5;
        this.enlargedpointRadius = 32;//for extending the radar mouse area
        //colors
        this.activeEntryNameBG = "green";
        this.activeEntryFontColor = "white";
        this.dividerLineColor = "white";
        this.segmentLineColor = "white";
        this.segmentLineThickness = 1;
        this.masterSegmentLineThickness = 3;
        this.circleLineColor = "#555555";
        this.areaFillColors = new Array("#d3dbe2", "#dfe6ed", "#e9eef4");
        //animation
        this.plotAnimationSpeed = 25;

        //fonts
        this.entryNameFont = new font("Arial", 12, false, "#000000", "center", "middle");
        this.plotOptionNameActiveFont = new font("Arial", 20, false, "#000000", "center", "top");
        this.plotOptionNameFont = new font("Arial", 20, false, "#000000", "center", "top");
        this.xAxisLabelFont = new font("Arial", 12, false, "#555555", "center", "top");
        this.circularTextFont = new font("Arial", 13, true, "#555555", "center", "bottom");
        this.circularTextFontActive = new font("Arial", 13, true, "#000000", "center", "bottom");
        this.circularSubTextFont = new font("Arial", 11, true, "#555555", "center", "bottom");
        this.circularSubTextFontActive = new font("Arial", 11, true, "#555555", "center", "bottom");
        this.fontFullscreenFactor = 1.5; // how much the font will be resized in full screen mode


    }

    function font(fontName, fontSize, isBold, color, hAlign, vAlign, fontFactor) {
        this.name = fontName;
        this.size = fontSize;
        this.isBold = isBold;
        this.color = color;
        this.hAlign = hAlign;
        this.vAlign = vAlign;
        this.fontFactor = fontFactor;


        this.setFont = function (drawingContext, isFullscreen, fontFactor) {
            if (this.color) {
                drawingContext.fillStyle = color;
            }
            if (this.hAlign) {
                drawingContext.textAlign = hAlign;
            }
            var currentFontFactor = 1;
            if (isFullscreen == true) {
                currentFontFactor = fontFactor;
            }
            var fontText = (this.isBold == true ? " Bold " : "") + (this.size ? this.size * currentFontFactor : "12") + "px " + (this.name ? this.name : "");
            if (fontText && fontText != "") {
                drawingContext.font = fontText;
            }
            if (this.vAlign) {
                drawingContext.textBaseline = vAlign;
            }
        };


    }

    Date.prototype.getWeek = function () {
        var onejan = new Date(this.getFullYear(), 0, 1);
        return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    }

    function getDateForWeek(year, week, endOrStart) {
        var onejan = new Date(year, 0, 1);

        var weekvalue = onejan * 1 + ((week - 1) * 7 - onejan.getDay()) * 24 * 60 * 60 * 1000;
        if (endOrStart == "end") {
            weekvalue = onejan * 1 + ((week - 1) * 7 + (7 - onejan.getDay()) % 6) * 24 * 60 * 60 * 1000;
        }
        return new Date(weekvalue);
    }

    function HistorySlider(sliderDiv, versions) {

        var startDate = versions[0].date;
        var endDate = versions[versions.length - 1].date;

        var startWeek = startDate.getWeek();
        startWeek = startWeek - (startWeek % 5);
        startDate = getDateForWeek(startDate.getFullYear(), startWeek);
        var endWeek = endDate.getWeek();
        //endWeek = endWeek + (5 - endWeek % 5) % 5;
        //endWeek = endWeek + 2;
        //endDate = getDateForWeek(endDate.getFullYear(), endWeek, "end");

        //console.log(startDate+"/"+endDate);
        //members fields
        var changedHandler = null;
        this.startDate = startDate;
        this.endDate = endDate;
        this.sliderDiv = $jq("#" + sliderDiv);

        //member methods
        this.renderSlider = renderSlider;
        this.setChangedHandler = setChangedHandler;

        //Init codes
        this.renderSlider();

        function renderSlider() {


            var sliderWidth = this.sliderDiv.width();
            var handle = null;

            //Draw scale
            var dateRange = (this.endDate - this.startDate);
            var weeks = dateRange / (7 * 24 * 60 * 60 * 1000);
            var displayWeek = startWeek;
            var displayYear = startDate.getFullYear();
            var tempScale = $jq("<span/>");
            tempScale.addClass("Scales");
            for (var i = 0; i <= weeks; i += 5) {
                var newScale = tempScale.clone();//console.log(displayWeek);
                var curDate = getDateForWeek(displayYear, displayWeek);
                var curYear = curDate.getFullYear();
                if (i == 0) {
                    newScale.html("week&nbsp;" + displayWeek + "<strong>" + "year&nbsp;" + displayYear + "</strong>");
                }
                else if (curYear != displayYear) {
                    displayYear = curYear;
                    displayWeek = curDate.getWeek();//console.log(curYear+"/"+displayYear+"/"+displayWeek);
                    newScale.html(displayWeek + "<strong>" + displayYear + "</strong>");
                }
                else {
                    //displayWeekDisplay = displayWeek -2;
                    newScale.text(displayWeek);
                }
                displayWeek += 5;
                newScale.css({ left: ((i * sliderWidth / weeks)) });
                this.sliderDiv.append(newScale);
            }

            //Draw anchors
            var tempAnchor = $jq("<span/>");
            tempAnchor.addClass("Anchors");
            tempAnchor.css({ cursor: "pointer" });
            var timeStampRange = endDate - startDate;
            for (var i = 0; i < versions.length; i++) {
                var newAnchor = tempAnchor.clone();
                newAnchor.attr("data-original-title", versions[i].title);
                this.sliderDiv.append(newAnchor);
                //var xPos = (sliderWidth - newAnchor.width()) * (versions[i].date - this.startDate) / timeStampRange;
                var xPos = (sliderWidth) * (versions[i].date - this.startDate) / dateRange;
                versions[i].xPos = Math.floor(xPos);
                newAnchor.data("version", versions[i]);
                newAnchor.click(function (evt) {
                    var curVersion = $jq(this).data("version");
                    handle.css({ left: curVersion.xPos - $jq(this).width() / 2 });
                    if (changedHandler != null) {
                        changedHandler(curVersion);
                    }
                });
                newAnchor.css({ left: Math.floor(xPos - newAnchor.width() / 2) });
            }
            $jq(".Anchors").twipsy();

            //Draw handle
            handle = $jq("<span/>");
            handle.addClass("Handle");
            handle.css({ cursor: "pointer" });
            this.sliderDiv.append(handle);
            handle.css({ left: versions[versions.length - 1].xPos - handle.width() / 2 });
            handle.draggable({ axis: 'x', containment: 'parent', stop: dragEnd, snap: '.Anchors', snapTolerance: 10, snapMode: 'inner', disabled: true });
            function dragEnd(event, ui) {
                var handlePos = Math.ceil(ui.position.left + handle.width() / 2);
                var selectedVersion = null;
                for (var i = 0; i < versions.length - 1; i++) {
                    if ((handlePos >= versions[i].xPos && handlePos < versions[i + 1].xPos)) {
                        selectedVersion = versions[i];
                    }
                    else if ((i == versions.length - 2 && handlePos >= versions[i + 1].xPos)) {

                        selectedVersion = versions[i + 1];
                    }

                    if (selectedVersion != null) {
                        if (changedHandler != null) {
                            changedHandler(selectedVersion);
                        }
                        //alert(selectedVersion.id);
                        break;
                    }
                }
            }
        }
        function setChangedHandler(func) { changedHandler = func; }
    }
}


