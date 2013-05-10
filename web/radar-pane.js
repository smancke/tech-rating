var radius = {
    abolish: {start: 340, end: 395, label: "Vermeiden/Abschaffen", color: '#feffc6' },
    hold: {start: 265, end: 340, label: "Beibehalten", color: '#f4faf4'},
    regard: {start: 195, end: 260, label: "Bewerten/Evaliueren", color: '#f4f0f4'},
    try: {start: 130, end: 195, label: "Testweise einsetzen", color: '#e0e0ff'},
    adopt: {start: 0, end: 130, label: "Einf\u00FChren", color: '#ffd4b0'}
}

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

    var g = svg.group({stroke: 'black', strokeWidth: 2}); 
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

function hashCode(str, mod=90){
    var hash = 0;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
	hash = ((hash<<5)-hash)+char;
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

function getSVGTooltip(item, cssclass='tooltip') {
    var html = '<div class="'+cssclass+'" style="">' 
        +'<h3>'+item.name+'</h3>'+item.description
        + '<svg version="1.1" width="300" height="150">';
    
    var pos = 1;
    for (var i in radius) {
        var rad = radius[i];
        var count = item.advices[i];
        html += '<text x="130" y="'+ pos*25 +'" font-size="12" font-family="Arial" fill="black" text-anchor="end">'+rad.label+':</text>';
        html += '<rect x="150" y="'+ (pos*25-12) +'" width="'+ count*2 +'" height="15"  fill="'+rad.color+'" stroke="#000000" stroke-width="1"></rect>';
        html += '<text x="145" y="'+ pos*25 +'" font-size="12" font-family="Arial" fill="black" text-anchor="end">'+(count ?count:0)+'</text>';
        pos++;
    }
    html += '</svg></div>';
    return html;
}

function  drawRatingItem(svg, item, bubleSize) {
    var bubleSize = 1+Math.round(2*Math.log(2+item.advices[item.maxAdvice]));
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

    if (item.advices[item.maxAdvice] >= 2) {
        if (sector.x > 0) {
            svg.text(x(position.x+(2+bubleSize)), y(position.y+3), item.name, {fontSize: 10, fontFamily: 'Arial', fill: 'black'}); 
        } else {
            svg.text(x(position.x-(2+bubleSize)), y(position.y+3), item.name, {fontSize: 10, fontFamily: 'Arial', fill: 'black', 'text-anchor': 'end'}); 
        }
    }
}

function draw(svg) {
    allPositions = [];
    initSectors();
    drawRadar(svg);
    REST.get(REST.url_fullratingitem, function(itemlist) {
        for (var i in itemlist) {
            item = itemlist[i];
            if (item.maxAdvice != 'ignore') {
                drawRatingItem(svg, item);
            }
        }
        enableTooltips();        
    }, errorHandler);
}

