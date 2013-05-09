
GLOBAL = new Object();
GLOBAL.categories = undefined;
GLOBAL.ratingitems = undefined;

// initial load 
// of the login pane
$(function() {
    buildCategoryMenu();

    REST.get(REST.url_secure, 
             function() { 
                 showRadarPane();
                 showMenuElements()
             },
             function() { 
                 showRadarPane();
                 $("#link-logout").text("Login");
             }
            );    
});

function errorHandler(message) {
    alert("Fehler beim laden der Anwendung ("+message+")");
}

function buildCategoryMenu() {
    REST.get(REST.url_category, function(categories) {
        GLOBAL.categories = categories;
        for (var i in categories) {
            $('<div id="menu-'+ categories[i].id +'"  class="tab-inactive" style="visibility: hidden">'
              + '    <a href="javascript:showRatingPane(\''+ categories[i].id +'\')">' + categories[i].name +'</a>'
              + '</div>').insertBefore($("#category-menu-location"));
        }
    }, errorHandler);
}

function createItem(name, description, category) {
    var item = {"name": name, "description": description, "category": category}
    
    REST.createItem(item, 
                    function(locationURI) {
                        $("#message-box").css('visibility', 'visible');
                        $("#message-box").removeClass("error-message").addClass("success-message");
                        $("#message-box").text("'"+ name + "' gespeichert.");
                        $("#name").val("");
                        $("#description").val("");
                    },
                    function(message) {
                        $("#message-box").css('visibility', 'visible');
                        $("#message-box").removeClass("success-message").addClass("error-message");
                        $("#message-box").text("Fehler beim speichern ("+ message+")");
                    }
                   );

}

/// -------------- Pane Management ----------------------

function activatePaneTab(paneName) {
    $(".tab-active").each(function(element){
        $(this).removeClass("tab-active").addClass("tab-inactive");
    });
    $("#menu-"+paneName).removeClass("tab-inactive").addClass("tab-active");
    enableTooltips();
}

function showRadarPane() {
    $.get("radar-pane.html", function(data) {
        $("#content-root").replaceWith(data);
        activatePaneTab('radar');
        $('#radar').svg({onLoad: draw});
    }, "html");
}

function showItemPane(paneName) {
    $.get("createItem-pane.html", function(data) {
        $("#content-root").replaceWith(data);
        for (var i in GLOBAL.categories) {
            $('<option value="'+ GLOBAL.categories[i].id +'">' + GLOBAL.categories[i].name +'</option>')
                .appendTo($("#category"));
        }
        activatePaneTab("createItem");        
    }, "html");
}

function showRatingPane(paneName) {
    $.get("rating-pane.html", function(data) {
        $("#content-root").replaceWith(data);
        connectSortables();
        initRatingPane(paneName);
        activatePaneTab(paneName);
    }, "html");
}

function initRatingPane(paneName) {
    REST.get('/rest/ratingitem', function(ratingitems) {
        REST.getUserAdvicesDict(function(adviceDict) {

            GLOBAL.ratingitems = ratingitems;
            $("#rating-ignore").empty();
            
            for (i in ratingitems) {
                item = ratingitems[i];
                if (item['category'] == paneName) {
                    
                    var adviceBoxId = "#rating-" + (adviceDict[item.id] ? adviceDict[item.id].advice : 'ignore');

                    var newItem = $('<li id="item-'+item.id+'" class="item-box">'+item['name']
                                    +'<div class="tooltip">'+item.description+'</div>'
                                    +'</li>');
                    newItem.appendTo($(adviceBoxId));
                }
            }
            enableTooltips();
        },errorHandler);
    },errorHandler);
}

function showPane(paneName) {
    $.get(paneName + "-pane.html", function(data) {
        $("#content-root").replaceWith(data);
        $("#username").focus();
        activatePaneTab(paneName);
    }, "html");
}

/// -------------- Login Handling ----------------------
function doLogout() {
    REST.logut();
    showPane("login");

    // hide menu
    $(".tab-inactive").each(function(element){
        if ($(this).attr('id') != 'menu-radar') {
            $(this).css('visibility', 'hidden');
        }
    });
    $("#link-logout").replaceWith('<a id="link-login" href="javascript:doLogout()">Login</a>')
    $("#menu-login").css('visibility', 'visible');
}

function showMenuElements() {
    // activate menu
    $(".tab-inactive").each(function(element){
        $(this).css('visibility', 'visible');
    });
}

function doLogin(username, password) {
    REST.login(username, password, function() {
        showMenuElements();
        $("#link-login").replaceWith('<a id="link-logout" href="javascript:doLogout()">Logout</>')

        showRadarPane();
    }, function() {
        $("#login-error-message").css('visibility', 'visible');
    });
}

function connectSortables() {
    $("#rating-ignore, #rating-adopt, #rating-try, #rating-regard, #rating-hold, #rating-abolish").droppable({
        drop: function(event, ui) {
            var idDraggable = ui.draggable.attr('id').substring(5);
            var advice = $(this).attr('id').substring(7);

            // workarround to ensure that all tooltips are closed
            $tooltipChild = $(ui.draggable).children(".active-tooltip");
            hideTooltip($tooltipChild);

            REST.saveAdvice(idDraggable, advice, function(locationURI) {
            },errorHandler);
        }
    });
    $( "#rating-ignore, #rating-adopt, #rating-try, #rating-regard, #rating-hold, #rating-abolish" ).sortable({
        connectWith: ".connectedSortable"
    }).disableSelection();
}

/// -------------- Tooltips ----------------------
function moveTooltip(event, parent, tipelement) {
    tipelement.css('top', event.pageY+10);
    tipelement.css('left', event.pageX+5);
}
function showTooltip(event, parent, tipelement) {
    tipelement.css('visibility', 'visible');
    moveTooltip(event, parent, tipelement);
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
        parent.on('mousedown', function(event) {hideTooltip($(element))});
        $(element).removeClass('tooltip').addClass('active-tooltip');
    });
}
