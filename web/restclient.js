
var REST = new Object();
REST.async = true;
REST.url_login = '/rest/login';
REST.url_logout = '/rest/logout';
REST.url_createItem = '/rest/ratingitem';
REST.url_ratingitem = '/rest/ratingitem';
REST.url_fullratingitem = '/rest/fullratingitem';
REST.url_category = '/rest/category';
REST.url_advice = '/rest/advice';
REST.url_user_advices = '/rest/user_advices';
REST.url_secure = '/secure';

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
