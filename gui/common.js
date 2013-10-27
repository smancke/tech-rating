
var radius = {
    abolish: {start: 340, end: 395, label: "Vermeiden/Abschaffen", color: '#B4B4B4' },
    hold: {start: 265, end: 340, label: "Beibehalten", color: '#f4faf4'},
    regard: {start: 195, end: 260, label: "Bewerten/Evaliueren", color: '#f4f0f4'},
    try: {start: 130, end: 195, label: "Testweise einsetzen", color: '#e0e0ff'},
    adopt: {start: 0, end: 130, label: "Einf\u00FChren", color: '#ffd4b0'},
    ignore: {start: 0, end: 0, label: "Ignorieren", color: '#cccccc'}
}


function toggleDisplay(elementId) {   
    var display = $('#'+elementId).css('display');
    $('#'+elementId).css('display', (display  == 'none' ? 'block' : 'none'));
}

/// -------------- Tooltips ----------------------
function moveTooltip(event, parent, tipelement) {
    var isVisible = 'visible' == tipelement.css('visibility');
    if (!GLOBAL.dragging && isVisible) {
        tipelement.css('top', event.pageY+10);
        tipelement.css('left', event.pageX+5);
    }
}
function showTooltip(event, parent, tipelement) {
    if (!GLOBAL.dragging) {
        tipelement.css('visibility', 'visible');
        moveTooltip(event, parent, tipelement);
    }
}
function hideTooltip(tipelement) {
    tipelement.css('visibility', 'hidden');
}

function enableTooltips() {
    $('.tooltip').each(function(index, element) {
        var parent = $(element).parent();
        parent.on('mouseover', function(event) {showTooltip(event, parent, $(element))});
        parent.on('mousemove', function(event) {moveTooltip(event, parent, $(element))});
        parent.on('mouseout', function(event) {hideTooltip($(element))});
        parent.on('mousedown', function(event) {GLOBAL.dragging = true; hideTooltip($(element))});
        parent.on('mouseup', function(event) {GLOBAL.dragging = false;});
        $(element).removeClass('tooltip').addClass('active-tooltip');
    });

    $('.svgtooltip').each(function(index, element) {
        var parent = $(element).parent();
        parent.on('mouseover', function(event) {showTooltip(event, parent, $(element))});
        parent.on('mousemove', function(event) {moveTooltip(event, parent, $(element))});
        parent.on('mouseout', function(event) {hideTooltip($(element))});
        parent.on('mousedown', function(event) {hideTooltip($(element))});
        $(element).removeClass('svgtooltip').addClass('active-tooltip');
        $(element).appendTo($('body'));
    });
}


function getSVGTooltip(item, cssclass) {
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
    html += '</svg>';
    html += '<span>Vorgeschlagen: '+item.displayname+', '+item.creation_time+'</span>';
    html += '</div>';
    return html;
}
