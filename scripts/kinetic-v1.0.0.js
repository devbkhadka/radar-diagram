/**
 * Kinetic JS JavaScript Library v1.0.0
 * http://www.kineticjs.com/
 * Copyright 2011, Eric Rowell
 * Licensed under the MIT or GPL Version 2 licenses.
 * Date: Apr 16 2011
 *
 * Copyright (C) 2011 by Eric Rowell
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var Kinetic = {};
Kinetic.Stage = function (canvas, fps) {

    var that = this;

    // Stage vars
    var context = canvas.getContext("2d");
    var updateStage = undefined;
    var drawStage = undefined;

    // Event vars
    var mousePos = null;
    var mouseDown = false;
    var mouseUp = false;
    var mouseClicked = false;
    var touchStart = false;
    var touchEnd = false;
    var touchStartAt = 0;
    var touchEndAt = 0;
    var touchTap = false;
    var currentRegion = null;
    var regionCounter = 0;
    var lastRegion = null;
    var touchedRegionId = -1;
    var touchedCount = 0;
    var regionsWithMouseIn = new Array();

    // Animation vars
    var t = 0;
    var timeInterval = 1000 / fps;
    var intervalId = null;
    var frame = 0;

    // Stage
    this.isTouchDevice = isTouchDevice;
    this.isMousedown = function () {
        return mouseDown;
    };
    this.isMouseup = function () {
        return mouseUp;
    };
    this.setDrawStage = function (func) {
        drawStage = func;
        that.listen();
    };
    this.drawStage = function () {
        if (drawStage !== undefined) {
            that.clearCanvas();
            drawNFireEvents();
        }
    };
    this.setUpdateStage = function (func) {
        updateStage = func;
    };
    this.updateStage = function () {
        if (updateStage !== undefined) {
            updateStage();
        }
    };
    this.getContext = function () {
        return context;
    };
    this.clearCanvas = function () {
        context.clearRect(0, 0, canvas.width, canvas.height);
    };
    // Events
    this.listen = function () {
        // store current listeners
        var canvasOnmouseover = canvas.onmouseover;
        var canvasOnmouseout = canvas.onmouseout;
        var canvasOnmousemove = canvas.onmousemove;
        var canvasOnmousedown = canvas.onmousedown;
        var canvasOnmouseup = canvas.onmouseup;
        var canvasOntouchstart = canvas.ontouchstart;
        var canvasOntouchsend = canvas.ontouchend;
        var canvasOntouchmove = canvas.ontouchmove;
        var canvasOnclick = canvas.onclick;

        if (drawStage !== undefined) {
            drawNFireEvents();
        }
        canvas.onmouseover = function (e) {
            if (!e) {
                e = window.event;
            }

            setMousePosition(e);
            if (typeof (canvasOnmouseover) == typeof (Function)) {
                canvasOnmouseover();
            }
        };
        if (isTouchDevice()) {

            canvas.ontouchstart = function (e) {
                if (!e) {
                    e = window.event;
                }
                touchStartAt = (new Date()).getTime();
                touchTap = false;
                touchStart = true;
                setMousePosition(e);
                if (typeof (canvasOntouchstart) == typeof (Function)) {
                    canvasOntouchstart();
                }
            };

            canvas.ontouchmove = function (e) {
                touchStartAt = 0;
                touchStart = false;
                touchTap = false;
                touchedRegionId = -1;
                if (typeof (canvasOntouchmove) == typeof (Function)) {
                    canvasOntouchmove();
                }
            }

            canvas.ontouchend = function (e) {
                if (!e) {
                    e = window.event;
                }
                touchEndAt = (new Date()).getTime();
                if ((touchEndAt - touchStartAt) < 800) {
                    touchEnd = true;
                    touchTap = true;

                }
                setMousePosition(e);
                if (typeof (canvasOntouchend) == typeof (Function)) {
                    canvasOntouchend();
                }
            };

        }
        canvas.onmouseout = function () {
            mousePos = null;
            if (typeof (canvasOnmouseout) == typeof (Function)) {
                canvasOnmouseout();
            }
        };
        canvas.onmousemove = function (e) {
            if (!e) {
                e = window.event;
            }
            mouseClicked = false;
            reset(e);

            if (typeof (canvasOnmousemove) == typeof (Function)) {
                canvasOnmousemove();
            }
        };

        canvas.onmousedown = function (e) {
            if (!e) {
                e = window.event;
            }
            mouseDown = true;
            reset(e);

            if (typeof (canvasOnmousedown) == typeof (Function)) {
                canvasOnmousedown();
            }
        };
        canvas.onmouseup = function (e) {
            if (!e) {
                e = window.event;
            }
            mouseUp = true;
            reset(e);

            if (typeof (canvasOnmouseup) == typeof (Function)) {
                canvasOnmouseup();
            }
        };

        canvas.onclick = function (e) {
            if (!e) {
                e = window.event;
            }
            mouseClicked = true;
            //touchStart = true;
            reset(e);

            if (typeof (canvasOnclick) == typeof (Function)) {
                canvasOnclick();
            }
        };
    };

    function isTouchDevice() {
        var el = document.createElement('div');
        el.setAttribute('ongesturestart', 'return;');
        if (typeof el.ongesturestart == "function") {
            return true;
        } else {
            return false
        }
    }

    this.beginRegion = function (regionId, tag, regionCenter) {
        if (!regionId) {
            regionId = regionCounter;
        }
        currentRegion = {};
        currentRegion.id = regionId;
        currentRegion.tag = tag;
        currentRegion.center = regionCenter;
        regionCounter++;
    };
    // add region event listeners
    this.addRegionEventListener = function (type, func) {
        if (type == "onmouseover") {
            currentRegion.onmouseover = func;
        }
        else if (type == "onmouseout") {
            currentRegion.onmouseout = func;
        }
        else if (type == "onmousemove") {
            currentRegion.onmousemove = func;
        }
        else if (type == "onmousedown") {
            currentRegion.onmousedown = func;
        }
        else if (type == "onmouseup") {
            currentRegion.onmouseup = func;
        }
        else if (type == "onclick") {
            currentRegion.onclick = func;
        }
        else if (type == "ontap") {
            currentRegion.ontap = func;
        }
    };
    this.closeRegion = function () {

        if (mousePos !== null && context.isPointInPath(mousePos.x, mousePos.y)) {
            regionsWithMouseIn[currentRegion.id] = currentRegion;
        }
        //regionCounter++;
    };

    function getDistanceSq(pos1, pos2) {
        var dsq = 0;
        if (pos1 != null && pos2 != null) {
            dsq = ((pos2.x - pos1.x) * (pos2.x - pos1.x) + (pos2.y - pos1.y) * (pos2.y - pos1.y));
        }
        return dsq;
    }

    function fireEvents() {
        var regionNearestToMouse = null;
        var minDistance = -1;
        var rcount = 0;
        for (curRegionId in regionsWithMouseIn) {
            rcount++;
        }
        if (rcount > 1) {
            var a = "for break";
        }
        for (curRegionId in regionsWithMouseIn) {
            var curDistance = getDistanceSq(mousePos, regionsWithMouseIn[curRegionId].center);
            if (minDistance == -1) {
                minDistance = curDistance;
                regionNearestToMouse = curRegionId;
            } else if (minDistance >= curDistance) {
                minDistance = curDistance;
                regionNearestToMouse = curRegionId;
            }

        }

        var regionId = regionNearestToMouse;
        var lastRegionId = lastRegion != null ? lastRegion.id : null;
        var curRegion = regionId != null ? regionsWithMouseIn[regionId] : null;
        if (mousePos !== null && curRegion != null) {
            // handle onmousemove
            // do this everytime            
            setCanvasCursor(canvas, "pointer");
            if ((!isTouchDevice()) && curRegion.onmousemove !== undefined) {
                curRegion.onmousemove(curRegion.tag);
            }
            // handle onmouseover
            if ((!isTouchDevice()) && (lastRegionId != regionId)) {
                lastRegion = curRegion;
                if (curRegion.onmouseover !== undefined) {
                    curRegion.onmouseover(curRegion.tag);
                }
            }

            // handle onmousedown
            if (mouseDown && curRegion.onmousedown !== undefined) {
                curRegion.onmousedown(curRegion.tag);
                mouseDown = false;
            }

            // handle onmouseup
            if (mouseUp && curRegion.onmouseup !== undefined) {
                curRegion.onmouseup(curRegion.tag);
                mouseUp = false;
            }

            if ((!isTouchDevice()) && mouseClicked) {
                mouseClicked = false;
                if (curRegion.onclick !== undefined) {
                    curRegion.onclick(curRegion.tag);
                }

            }

            if (touchTap == true) {
                touchTap = false;
                //alert("clicked: " + regionCounter + " tap:" + touchedCount);
                if (curRegion.ontap !== undefined) {
                    curRegion.ontap(curRegion.tag);
                }
                if (touchedRegionId == regionId) {
                    touchedCount += 1;
                }
                else {
                    touchedCount = 1;
                    touchedRegionId = regionId;
                }

                touchStart = false;
                if (touchedCount >= 2) {

                    if (curRegion.onclick !== undefined) {
                        curRegion.onclick(curRegion.tag);
                    }
                    touchedCount = 1;
                    touchedRegionId = -1;
                }
                else {
                    if (curRegion.onmouseover !== undefined) {
                        curRegion.onmouseover(curRegion.tag);
                    }
                }
            }


        }
        else if (regionId != lastRegionId && lastRegion != null) {
            // handle mouseout condition
            setCanvasCursor(canvas, "auto");
            if ((!isTouchDevice()) && lastRegion.onmouseout !== undefined) {
                lastRegion.onmouseout();
            }
            lastRegion = null;
        }
    }

    function drawNFireEvents() {
        regionsWithMouseIn = new Array();
        drawStage();
        fireEvents();
        if (isTouchDevice()) {
            drawStage();
        }
    }

    this.getMousePos = function (evt) {
        return mousePos;
    };
    function setMousePosition(evt) {
        var mouseX;
        var mouseY;
        if (isTouchDevice()) {
            mouseX = evt.clientX - $jq(canvas).offset().left + window.pageXOffset //- $jq(window).scrollLeft();
            mouseY = evt.clientY - $jq(canvas).offset().top + window.pageYOffset //- $jq(window).scrollTop();
        }
        else if (isIE8OrLess()) {
            mouseX = evt.clientX + document.body.scrollLeft
            + document.documentElement.scrollLeft - $jq(canvas).offset().left;
            mouseY = evt.clientY + document.body.scrollTop
        + document.documentElement.scrollTop - $jq(canvas).offset().top;
        }
        else {
            mouseX = evt.clientX - $jq(canvas).offset().left + window.pageXOffset;
            mouseY = evt.clientY - $jq(canvas).offset().top + window.pageYOffset;
        }
        mousePos = new Kinetic.Position(mouseX, mouseY);
    }

    function reset(evt) {
        setMousePosition(evt);
        regionCounter = 0;

        if (drawStage !== undefined) {
            that.clearCanvas();
            drawNFireEvents();
        }

        mouseDown = false;
        mouseUp = false;
    }

    // Animation
    this.getFrame = function () {
        return frame;
    };
    this.start = function (idflag) {
        if (drawStage !== undefined) {
            drawNFireEvents();
        }

        intervalId = setInterval(animationLoop, timeInterval);
        if (!idflag || idflag == null)
            clearInterval(intervalId);

    };
    this.stop = function () {
        clearInterval(intervalId);
    };
    this.getTimeInterval = function () {
        return timeInterval;
    };
    this.getTime = function () {
        return t;
    };
    function animationLoop() {
        frame++;
        t += timeInterval;
        that.clearCanvas();
        if (updateStage !== undefined) {
            updateStage();
        }
        if (drawStage !== undefined) {
            drawNFireEvents();
        }
    }

};
Kinetic.Position = function(x, y){
    this.x = x;
    this.y = y;
};

function isIE8OrLess()
{
    var rv = -1; // Return value assumes failure.
    if (navigator.appName == 'Microsoft Internet Explorer') {
        var ua = navigator.userAgent;
        var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
            rv = parseFloat(RegExp.$1);
    }

    if (rv != -1 && rv <= 8.0) {
        return true;
    }
    else {
        return false;
    }
}

function setCanvasCursor(canvas, cursorType) {
    if (typeof FlashCanvas != "undefined") {  
         try{     
                if (cursorType == "auto") {
                    cursorType = "default";
                }
                FlashCanvas.setCursor(canvas, cursorType);
            }
         catch(err){
         }
    }
    else {
        $jq(canvas).css({ cursor: cursorType });
    }
}
