
GLOBAL = new Object();
GLOBAL.categories = undefined;

// initial load 
// of the login pane
$(function() {
    buildCategoryMenu(function(){

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
});

function htmlDecode(string) {
    return  $("<div/>").html(string).text();
}

function errorHandler(message) {
    alert("Fehler beim laden der Anwendung ("+message+")");
}

function buildCategoryMenu(nextFunction) {
    REST.get(REST.url_category, function(categories) {
        GLOBAL.categories = categories;
        for (var i in categories) {
            $('<div id="menu-'+ categories[i].id +'"  class="tab-inactive" style="visibility: hidden">'
              + '    <a href="javascript:showRatingPane(\''+ categories[i].id +'\')">' + categories[i].name +'</a>'
              + '    <div class="tooltip">'+categories[i].description+'</div>'
              + '</div>').insertBefore($("#category-menu-location"));
        }
        nextFunction();
    }, errorHandler);
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
        $('#radar').svg({onLoad: draw});
        activatePaneTab('radar');
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
    REST.get(REST.url_ratingitem, function(ratingitems) {
        REST.getUserAdvicesDict(function(adviceDict) {

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
itemPane = {
    show: function(paneName) {
        $.get("createItem-pane.html", function(data) {
            $("#content-root").replaceWith(data);
            for (var i in GLOBAL.categories) {
                $('<option value="'+ GLOBAL.categories[i].id +'">' + GLOBAL.categories[i].name +'</option>')
                    .appendTo($("#category"));
            }
            activatePaneTab("createItem");
            itemPane.refreshItemList();
        }, "html");
    },
    
    refreshItemList: function() {
        REST.get(REST.url_ratingitem, function(ratingitems) {
            $("#ratingitem-list").empty();
            
            for (var c in GLOBAL.categories) {
                var cat = GLOBAL.categories[c];
                $('<li>'+ cat.name +' <ul id="category-list-'+cat.id+'"/></li>').appendTo($("#ratingitem-list"));
            }
            
            for (i in ratingitems) {
                item = ratingitems[i];
                
                var catListId = "#category-list-" + item.category;
                
                var newItem = $('<li id="item-'+item.id+'" class="">'
                                +'<span>'+ item['name']
                                +'  <div class="tooltip">'+item.description+'</div>'
                                +'</span>'
                                +'<a href="javascript:itemPane.selectItemForEdit(\''+item.id+'\')"><img src="edit.png" alt="Löschen"><div class="tooltip">Bearbeiten</div></a>'
                                +'<a href="javascript:itemPane.selectItemForDelete(\''+item.id+'\', \''+item.name+'\')"><img src="delete.png" alt="Löschen"><div class="tooltip">L&ouml;schen</div></a>'
                                +'</li>');
                newItem.appendTo($(catListId));
                
            }
            enableTooltips();
        },errorHandler);
    },


    resetForm: function() {
        $('input[name=itemid]').val('');
        $('input[name=name]').val('');
        $('textarea[name=description]').val('');
        $('select[name=category]').val(GLOBAL.categories[0].id);
        $('#itemPaneHeader').text('Neuer Vorschlag ...');
        $("#message-box").css('display', 'none');
    },

    selectItemForEdit: function(itemId) {
        REST.get(REST.url_ratingitem + '/' + itemId, function(item) {
            $('input[name=itemid]').val(item.id);
            $('input[name=name]').val(htmlDecode(item.name));
            $('textarea[name=description]').val(htmlDecode(item.description));
            $('select[name=category]').val(item.category);
            $('#itemPaneHeader').text('Eintrag Editieren: '+item.name +' (id: '+item.id+')');
            $("#message-box").css('display', 'none');
        },errorHandler);
    },

    selectItemForDelete: function(itemId, title) {
        conf = confirm("Eintrag L\xF6schen: "+title+"?");
        if (conf) {
            REST.delete(REST.url_ratingitem + '/' + itemId, function(item) {
                itemPane.refreshItemList();
            },errorHandler);
        }
    },

    createOrUpdateItem: function(id, name, description, category) {

        var ok = function(locationURI) {
            $("#message-box").css('display', 'block');
            $("#message-box").removeClass("error-message").addClass("success-message");
            $("#message-box").text("'"+ name + "' gespeichert.");
            itemPane.refreshItemList();
            itemPane.resetForm();
        };

        var error = function(message) {
            $("#message-box").css('display', 'block');
            $("#message-box").removeClass("success-message").addClass("error-message");
            $("#message-box").text("Fehler beim speichern ("+ message+")");
        }

        var item = {"name": name, "description": description, "category": category}
        if (id != '') {
            item['id'] = id;
            REST.updateItem(item, ok, error);
        } else {
            REST.createItem(item, ok, error);
        }
    }
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
    $('body').css('cursor', 'wait');
    REST.login(username, password, function() {
        $('body').css('cursor', 'auto');
        showMenuElements();
        $("#link-login").replaceWith('<a id="link-logout" href="javascript:doLogout()">Logout</>')

        showRadarPane();
    }, function() {
        $('body').css('cursor', 'auto');
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

function toggleDisplay(elementId) {   
    var display = $('#'+elementId).css('display');
    $('#'+elementId).css('display', (display  == 'none' ? 'block' : 'none'));
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
