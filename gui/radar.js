GLOBAL = new Object();
GLOBAL.categories = undefined;


$(function() {
    REST.get(REST.url_category, function(categories) {
        GLOBAL.categories = categories;        
        $('#radar').svg({onLoad: draw});
    });
});


// list with all positions of items [{x:int, y:int}]
var allPositions = [];

// category id -> {x: -/+1, y: -/+,1}
var sectors = {};
function initSectors() {
    sectors = {};
    sectors[GLOBAL.categories[0].id] = {x: -1, y: -1}
    sectors[GLOBAL.categories[1].id] = {x: 1, y: -1}
    sectors[GLOBAL.categories[2].id] = {x: -1, y: 1}
    sectors[GLOBAL.categories[3].id] = {x: 1, y: 1}
}

function x(coord) {
    return 400+coord;
}
function y(coord) {
    return 400+coord;
}
function errorHandler(message) {
    alert("Fehler beim laden der Anwendung ("+message+")");
}

function drawRadarCircle(svg, desc, color) {
    svg.circle(x(0), y(0), desc.end, 
                   {fill: color, stroke: '#cccccc', strokeWidth: 1}); 
}

function drawRadarCircleLabel(svg, desc, color) {
    var rectWidth = desc.label.length * 7;
    svg.rect(x(-1*rectWidth/2), y(-1*desc.end ), rectWidth, 15, 10, 10, {fill: color, stroke: '#aaaaaa', strokeWidth: 1});
    svg.text(x(0), y(-1*desc.end + 12), desc.label, {fontSize: 12, fontFamily: 'Arial', fill: 'black', 'text-anchor': 'middle'}); 
}

function drawRadar(svg, nextFunction) {       
    drawRadarCircle(svg, radius.hold, radius.hold.color);
    drawRadarCircle(svg, radius.regard, radius.regard.color);
    drawRadarCircle(svg, radius.try, radius.try.color);
    drawRadarCircle(svg, radius.adopt, radius.adopt.color);

    var g = svg.group({stroke: '#cccccc', strokeWidth: 2}); 
    svg.line(g, x(-400), y(0), x(400), y(0)); 
    svg.line(g, x(0), y(-400), x(0), y(+400)); 

    drawRadarCircleLabel(svg, radius.hold, radius.hold.color);
    drawRadarCircleLabel(svg, radius.regard, radius.regard.color);
    drawRadarCircleLabel(svg, radius.try, radius.try.color);
    drawRadarCircleLabel(svg, radius.adopt, radius.adopt.color);
    drawRadarCircleLabel(svg, radius.abolish, radius.abolish.color);

    var categories = GLOBAL.categories;
    svg.text(x(-400), y(-380), categories[0].name, {fontSize: 16, fontFamily: 'Arial', fill: 'black'}); 
    svg.text(x(400), y(-380), categories[1].name, {fontSize: 16, fontFamily: 'Arial', fill: 'black',  'text-anchor': 'end'}); 
    svg.text(x(-400), y(395), categories[2].name, {fontSize: 16, fontFamily: 'Arial', fill: 'black'}); 
    svg.text(x(400), y(395), categories[3].name, {fontSize: 16, fontFamily: 'Arial', fill: 'black',  'text-anchor': 'end'}); 
}

function hashCode(str, mod){
    var hash = 0, ch;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
        ch = str.charCodeAt(i);
	hash = ((hash<<5)-hash)+ch;
	hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash % mod);
}

function isPositionFree(position) {
    for (var i in allPositions) {
        if (Math.abs(allPositions[i].x - position.x) < 50 && Math.abs(allPositions[i].y - position.y) < 6) { 
            return false;
        }
    }
    return true;
}

function getFreePosition(position, minRadius, maxRadius) {
    var yDeltas = [0, -5, +5, +10, +10, -15, +15, -20, +20, -25, +25, -30, +30, -35, +35, +40, +40, -45, +45, -50, +50];
    for (i in yDeltas) {
        var newPosition = { x: position.x, y: position.y + yDeltas[i]};
        var radius = Math.sqrt(newPosition.x*newPosition.x + newPosition.y*newPosition.y);
        if (newPosition.x*position.x > 0 // positives vorzeichen == selber quadranth
            && newPosition.y*position.y > 0 
            && radius > minRadius 
            && radius < maxRadius 
            && isPositionFree(newPosition)) {
            return newPosition;
        }
    }
    return position;
}

function  drawRatingItem(svg, item, showAllLabels, biggestAdvice) {
    //var bubleSize = 1+Math.round(2*Math.log(2+item.advices[item.maxAdvice]));
    var bubleSize = 2*(1.5+4*item.advices[item.maxAdvice]/biggestAdvice);
    var sector = sectors[item.category];
    var g = svg.group({stroke: 'blue', strokeWidth: 1}); 
    var thisRadius = radius[item.maxAdvice].start +  ((hashCode(item.name, 60)+20)/100) *(radius[item.maxAdvice].end-radius[item.maxAdvice].start);
    var angle = (hashCode(item.name, 70)+10) * Math.PI / 180;
    position = { x: sector.x * thisRadius * Math.cos(angle),  y: sector.y * thisRadius * Math.sin(angle) };
    position = getFreePosition(position, radius[item.maxAdvice].start, radius[item.maxAdvice].end);
    allPositions.push(position);
    var circle = svg.circle(x(position.x), y(position.y), bubleSize, 
                            {fill: '#00aa55', stroke: '#cccccc', strokeWidth: 2}); 

    $(getSVGTooltip(item, 'svgtooltip')).appendTo($(circle));

    if (item.advices[item.maxAdvice] >= 3 || showAllLabels) {
        if (sector.x > 0) {
            svg.text(x(position.x+(2+bubleSize)), y(position.y+3), item.name, {fontSize: 10, fontFamily: 'Arial', fill: 'black'}); 
        } else {
            svg.text(x(position.x-(2+bubleSize)), y(position.y+3), item.name, {fontSize: 10, fontFamily: 'Arial', fill: 'black', 'text-anchor': 'end'}); 
        }
    }
}

function loadTimeline() {
    REST.get(REST.url_timeline, function(timeline) {
        timelineElement = $("#timeline-content");
        timelineElement.empty();

        user = undefined;
        currentElement = undefined;
        for (var i in timeline) {
            event = timeline[i];
            if (user != event.user) {
                user = event.user;
                if (currentElement)
                    currentElement.appendTo(timelineElement);
                currentElement = $('<div class="timeline-event">'
                                   +  '<div class="timeline-event-header" style="">'
                                   +   '<span style="float:left">'+event.user+'</span>'
                                   +   '<span style="float:right">'+event.time+'</span>'
                                   +  '</div>'
                                   +'</div>');                
            }
            if (event.action == 'advice') {
                $('<div class="timeline-event-entry" style="clear:both">'+radius[event.value].label +': '+event.targetLabel +'</div>')
                    .appendTo(currentElement);
            }
            else if (event.action == 'new') {
                $('<div class="timeline-event-entry" style="clear:both; font-weight: bold;">Neuer Vorschlag: '+event.targetLabel +'</div>')
                    .appendTo(currentElement);
            }
        }
        if (currentElement)
            currentElement.appendTo(timelineElement);
        window.setTimeout("loadTimeline()", 5 * 60 * 1000); // refresh every 5 minutes
    }, errorHandler);
}

function getBiggestAdvice(itemlist) {
    biggestAdvice = 0;
    for (var i in itemlist) {
        item = itemlist[i];
        if (item.advices[item.maxAdvice] > biggestAdvice)
            biggestAdvice = item.advices[item.maxAdvice];
    }
    return biggestAdvice;
}

function draw(svg) {
    allPositions = [];
    initSectors();
    drawRadar(svg);
    REST.get(REST.url_fullratingitem, function(itemlist) {
        showAllLabels = itemlist.length < 30;
        biggestAdvice = getBiggestAdvice(itemlist);
        for (var i in itemlist) {
            item = itemlist[i];
            if (item.maxAdvice != 'ignore') {
                try {
                    drawRatingItem(svg, item, showAllLabels, biggestAdvice);
                }
                catch(err)
                {
                    console.log("error while drawing item %o", err)
                }
            }
        }
        enableTooltips();        
    }, errorHandler);
    loadTimeline();
}

