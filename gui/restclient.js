
var REST = new Object();
REST.async = true;
REST.prefix = '/api/' + global_project;  //the global_project is comming from php
if (typeof global_base_uri !=  'undefined') {
    REST.prefix = global_base_uri + REST.prefix;
}
REST.url_login = REST.prefix + '/login';
REST.url_logout = REST.prefix + '/logout';
REST.url_timeline = REST.prefix + '/timeline';
REST.url_createItem = REST.prefix + '/ratingitem';
REST.url_ratingitem = REST.prefix + '/ratingitem';
REST.url_fullratingitem = REST.prefix + '/fullratingitem';
REST.url_category = REST.prefix + '/category';
REST.url_advice = REST.prefix + '/advice';
REST.url_user_advices = REST.prefix + '/user_advices';

REST.logut = function() {
    REST.get(REST.url_logout, function(){}, function(){});
}

REST.login = function(username, password, sucessFunction, errorFunction) {
    $.ajax({
        url: REST.url_login,
        type: "POST",
        data: JSON.stringify({"username": username, "password": password}),
        async: this.async,
        contentType: 'application/json',
        dataType: "json"
    }).always(function(first, status, last) { 
        if (status == 'error' && last == 'Unauthorized') {
            errorFunction("Falsche Logindaten");
        }
        else if (status == 'success' && last.status == 200) {
            sucessFunction();
        } else {
            errorFunction("Fehler beim Login ("+last+")");
        }
    });
}

REST.createItem = function(newItem, sucessFunction, errorFunction) {
    $.ajax({
        url: REST.url_createItem,
        type: "POST",
        data: JSON.stringify(newItem),
        async: this.async,
        contentType: 'application/json',
        dataType: "json"
    }).always(function(jqXHR, textStatus) { 
        if (jqXHR.status == 201) {
            var location = jqXHR.getResponseHeader('Location');
            sucessFunction(location);
        } else {
            errorFunction(jqXHR.status);
        }
    });
}

REST.updateItem = function(newItem, sucessFunction, errorFunction) {
    $.ajax({
        url: REST.url_ratingitem + '/' + newItem.id,
        type: "PUT",
        data: JSON.stringify(newItem),
        async: this.async,
        contentType: 'application/json',
        dataType: "json"
    }).always(function(data_jqXHR, textStatus, jqXHR_data) { 
        if (jqXHR_data.status == 200) {
            sucessFunction();
        } else {
            errorFunction(textStatus, data_jqXHR.status);
        }
    });
}

REST.saveAdvice = function(ratingitem_id, advice, sucessFunction, errorFunction) {
    $.ajax({
        url: REST.url_advice,
        type: "POST",
        data: JSON.stringify({'ratingitem_id': ratingitem_id, 'advice':advice}),
        async: this.async,
        contentType: 'application/json',
        dataType: "json"
    }).always(function(jqXHR, textStatus) { 
        if (jqXHR.status == 201) {
            var location = jqXHR.getResponseHeader('Location');
            sucessFunction(location);
        } else {
            errorFunction(jqXHR.status);
        }
    });
}

REST.getUserAdvicesDict = function(sucessFunction, errorFunction) {
    REST.get(REST.url_user_advices, function(adviceArray) {
        var adviceDict = {};
        for (var i in adviceArray) {
            adviceDict[ adviceArray[i].ratingitem_id ] = adviceArray[i];
        }
        sucessFunction(adviceDict);
    },errorFunction);
}

// return any Ressource
REST.get = function(locationURI, sucessFunction, errorFunction) {
    $.ajax({
        url: locationURI,
        type: "GET",
        async: this.async,
        dataType: "json"
    }).always(function(data, textStatus, jqXHR) { 
        if (jqXHR.status === 200) {
            sucessFunction(data);
        } else {
            errorFunction(textStatus, data.status);
        }
    });
}

// delete any Ressource
REST.delete = function(locationURI, sucessFunction, errorFunction) {
    $.ajax({
        url: locationURI,
        type: "DELETE",
        async: this.async,
        dataType: "json"
    }).always(function(data, textStatus, jqXHR) { 
        if (jqXHR.status === 200) {
            sucessFunction(data);
        } else {
            errorFunction(textStatus, data.status);
        }
    });
}
