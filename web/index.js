
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
}

function showRadarPane() {
    $.get("radar-pane.html", function(data) {
        $("#content-root").replaceWith(data);
        activatePaneTab('radar');
        $('#radar').svg({onLoad: draw});
    }, "html");
}

function showItemPane(paneName) {
    activatePaneTab("createItem");
    $.get("createItem-pane.html", function(data) {
        $("#content-root").replaceWith(data);
        for (var i in GLOBAL.categories) {
            $('<option value="'+ GLOBAL.categories[i].id +'">' + GLOBAL.categories[i].name +'</option>')
                .appendTo($("#category"));
        }    
    }, "html");
}

function showRatingPane(paneName) {
    $.get("rating-pane.html", function(data) {
        $("#content-root").replaceWith(data);
        connectSortables();
    }, "html");
    activatePaneTab(paneName);
    initRatingPane(paneName);
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

                    var newItem = $('<li id="item-'+item.id+'" class="item-box">'+item['name']+'</li>');
                    newItem.appendTo($(adviceBoxId));
                }
            }
        },errorHandler);
    },errorHandler);
}

function showPane(paneName) {
    $.get(paneName + "-pane.html", function(data) {
        $("#content-root").replaceWith(data);
        $("#username").focus();
    }, "html");
    activatePaneTab(paneName);
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

            REST.saveAdvice(idDraggable, advice, function(locationURI) {
            },errorHandler);
        }
    });
    $( "#rating-ignore, #rating-adopt, #rating-try, #rating-regard, #rating-hold, #rating-abolish" ).sortable({
        connectWith: ".connectedSortable"
    }).disableSelection();
}
