var radius = {adopt: {start: 0, end: 120, label: "Einf\u00FChren"},
              try: {start: 120, end: 190, label: "Testweise einsetzen"},
              regard: {start: 190, end: 260, label: "Bewerten/Evaliueren"},
              hold: {start: 265, end: 340, label: "Beibehalten"},
              abolish: {start: 340, end: 395, label: "Vermeiden/Abschaffen"}
             }

// list with all positions of items [{x:int, y:int}]
var allPositions = [];

// category id -> {x: -/+1, y: -/+,1}
var sectors = {};

function x(coord) {
    return 400+coord;
}
function y(coord) {
    return 400+coord;
}
function errorHandler(message) {
    alert("Fehler beim laden der Anwendung ("+message+")");
}

function drawRadarCircle(svg, desc) {
    svg.circle(x(0), y(0), desc.end, 
                   {fill: 'none', stroke: 'blue', strokeWidth: 1}); 
    svg.rect(x(5), y(-1*desc.end ), 135, 15, 10, 10, {fill: 'white', stroke: 'blue', strokeWidth: 1});
    svg.text(x(10), y(-1*desc.end + 12), desc.label, {fontSize: 12, fontFamily: 'Arial', fill: 'black'}); 
}

function drawRadar(svg) {       
    drawRadarCircle(svg, radius.adopt);
    drawRadarCircle(svg, radius.try);
    svg.circle(x(0), y(0), radius.regard.end+4, 
                   {fill: 'none', stroke: 'red', strokeWidth: 1}); 
    drawRadarCircle(svg, radius.regard);
    drawRadarCircle(svg, radius.hold);
    svg.rect(x(5), y(-1*radius.abolish.end ), 135, 15, 10, 10, {fill: 'white', stroke: 'blue', strokeWidth: 1});
    svg.text(x(10), y(-1*radius.abolish.end + 12), radius.abolish.label, {fontSize: 12, fontFamily: 'Arial', fill: 'black'}); 


    var g = svg.group({stroke: 'black', strokeWidth: 2}); 
    svg.line(g, x(-400), y(0), x(400), y(0)); 
    svg.line(g, x(0), y(-400), x(0), y(+400)); 

    REST.get(REST.url_category, function(categories) {
        sectors[categories[0].id] = {x: -1, y: -1}
        sectors[categories[1].id] = {x: 1, y: -1}
        sectors[categories[2].id] = {x: -1, y: 1}
        sectors[categories[3].id] = {x: 1, y: 1}
        svg.text(x(-400), y(-380), categories[0].name, {fontSize: 16, fontFamily: 'Arial', fill: 'blue'}); 
        svg.text(x(400), y(-380), categories[1].name, {fontSize: 16, fontFamily: 'Arial', fill: 'blue',  'text-anchor': 'end'}); 
        svg.text(x(-400), y(395), categories[2].name, {fontSize: 16, fontFamily: 'Arial', fill: 'blue'}); 
        svg.text(x(400), y(395), categories[3].name, {fontSize: 16, fontFamily: 'Arial', fill: 'blue',  'text-anchor': 'end'}); 
    }, errorHandler);
}

function hashCode(str){
    var hash = 0;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
	hash = ((hash<<5)-hash)+char;
	hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash % 90);
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

function  drawRatingItem(svg, label, description, area, areaRating, sectorX, sectorY, bubleSize) {
    var g = svg.group({stroke: 'blue', strokeWidth: 1}); 
    var thisRadius = radius[area].start +  areaRating*(radius[area].end-radius[area].start);
    var angle = hashCode(label) * Math.PI / 180;
    position = { x: sectorX * thisRadius * Math.cos(angle),  y: sectorY * thisRadius * Math.sin(angle) };
    position = getFreePosition(position, radius[area].start, radius[area].end);
    allPositions.push(position);
    var circle = svg.circle(x(position.x), y(position.y), bubleSize, 
                   {fill: 'blue', stroke: 'none', strokeWidth: 1}); 

    //$(circle).on('mouseover', function(event) {alert(label)});

    $('<div class="svgtooltip" style=""><b>'+label+':</b>'+description+'</div>').appendTo($(circle));

    if (sectorX > 0) {
        svg.text(x(position.x+(2+bubleSize)), y(position.y+3), label, {fontSize: 10, fontFamily: 'Arial', fill: 'black'}); 
    } else {
        svg.text(x(position.x-(2+bubleSize)), y(position.y+3), label, {fontSize: 10, fontFamily: 'Arial', fill: 'black', 'text-anchor': 'end'}); 
    }
}

function draw(svg) {
    allPositions = [];
    sectors = {};

    REST.get(REST.url_ratingitem, function(itemlist) {
        for (var i in itemlist) {
            REST.get(itemlist[i].self, function(item) {
                if (item.maxAdvice != 'ignore') {
                    drawRatingItem(svg, item.name, item.description, item.maxAdvice, 0.5, sectors[item.category].x, sectors[item.category].y, item.advices[item.maxAdvice]);
                }
                enableTooltips();
            }, console.log);
        }
    }, errorHandler);
    drawRadar(svg);
}

