
var username = "debuguser";

var errorFunc = function(message) {
    ok(false, "error calling REST service: "+ message);
}

test("I can login with valid credentials", function() {
    REST.async = false;
    REST.login(username, "debug", function() {
        ok(true, "I got the login");
    }, errorFunc);
});

test("No login with wrong credentials", function() {
    REST.async = false;
    REST.login("debuguser", "not_valid", function() {
        ok(false, "I should not got loged in");
    }, function(message) {
        ok(true, "I should not got loged in");
        equal("Falsche Logindaten", message, "Right error message");
    });
});

test("I can request the categories", function() {
    REST.async = false;
    REST.get(REST.url_category, function(categories) {
        ok(true, "Call returned without error");
        ok($.isArray(categories), "list of categories is an array");
        equal(4, categories.length, "there are 4 elements in the result list");        
    }, errorFunc);
});

test("I can create and read an item", function() {
    var item = {"name": "neues Item", "description": "lorem ipsum ..lorem ipsum ..lorem ipsum ..lorem ipsum ..lorem ipsum ..", "category": "cat_1"}
    REST.async = false;
    REST.createItem(item, 
                 function(locationURI) {
                     ok(locationURI.length > 10, "passed call and got an location String > 10 characters: "+ locationURI);

                     REST.get(locationURI, function(resultItem) {
                         equal(item["name"], resultItem["name"], "name given");
                         equal(item["description"], resultItem["description"], "description given");
                         equal(item["category"], resultItem["category"], "category given");
                         ok(resultItem["id"] !== undefined, "id given");
                         equal(resultItem["creation_author"], "debuguser");
                         ok(resultItem["creation_time"].length > 1, "creation_time given");
                     },errorFunc);
                     
                 },errorFunc);
});

test("I can request a list of items", function() {
    REST.async = false;
    REST.get(REST.url_ratingitem, function(result) {
        ok($.isArray(result), "list of items is an array");
        ok(result.length >= 1, "there are elements in the result list: "+result.length);        
    },errorFunc);
});


test("I can create and read an advice", function() {
    REST.async = false;
    REST.get(REST.url_ratingitem, function(itemlist) {

        ok($.isArray(itemlist) && itemlist.length >= 1, "valid items exist");

        REST.saveAdvice(itemlist[0].id, 'hold', function(locationURI) {
                     ok(locationURI.length > 10, "passed call and got an location String > 10 characters: "+ locationURI);

            REST.get(locationURI, function(resultAdvice) {
                equal(itemlist[0].id, resultAdvice["ratingitem_id"], "correct id");
                equal(username, resultAdvice["user"], "correct user");
                equal('hold', resultAdvice["advice"], "correct advice string");
                ok(resultAdvice["creation_time"], "a creation time is set");
            },errorFunc);
            
            REST.getUserAdvicesDict(function(resultAdviceDict) {
                ok( (itemlist[0].id in resultAdviceDict), "advice dict contains my created advice");
                equal('hold', resultAdviceDict[itemlist[0].id].advice, "correct advice string in advice-list");
            },errorFunc);

        },errorFunc);
             
    },errorFunc);
});


test("I can request a list of advices filtered by user", function() {
    REST.async = false;
    REST.get(REST.url_user_advices, function(result) {
        ok($.isArray(result), "list of advices is an array");
        ok(result.length >= 1, "there are elements in the result list: "+result.length);        
    },errorFunc);
});
