#!/usr/bin/python

import os, sys
sys.path.append(os.path.dirname(__file__))

from bottle import route, run, debug, request, response, redirect, static_file, abort, default_app
from helper import jdump, context, seccontext, set_login_cookie, cfg, escape


@route('/', method='GET')
def get_indexpage():
    return redirect("/web/index.html");

# test url to check, if the session is valid
@route('/secure', method='GET')
def secure_test_uri():
    with seccontext() as cntx:
        return '{"status": "ok"}'

# Enable static file delivery for /web
@route('/web/<name>', method='GET')
def get_weblient(name):
    return static_file(name, os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + "/web");

# Enable static file delivery for /tests
# This is only enabled, if we are in testmode
@route('/tests/<name>', method='GET')
def get_testpage(name):
    return static_file(name, os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + "/tests");

@route('/rest/category', method='GET')
def get_categories():
    with context() as cntx:
        return jdump(cntx.db.fetchdicts("SELECT * FROM category ORDER BY orderindex"))

@route('/rest/login', method='POST')
def login():
    login_data = request.json
    if 'password' in login_data and login_data['password'] == 'debug':
        set_login_cookie(login_data['username'])
        return '{"status": "ok"}';
    else:
        response.status = 401
        return '{"status": "login not valid"}'

@route('/rest/logout', method='GET')
def logut():
    response.delete_cookie("radar_login", path="/");
    return '{"status": "ok"}'
    
@route('/rest/ratingitem', method='GET')
def get_ratingitems():
    with context() as cntx:
        item_self_link = cntx.db.concat("'" + cfg['server_external_url'] + "/rest/ratingitem/'", "id");
        return jdump(cntx.db.fetchdicts("SELECT *, "+item_self_link+" as self FROM ratingitem"))

@route('/rest/ratingitem/<no>', method='GET')
def get_ratingitem(no):
    with context() as cntx:
        ratingitem = cntx.db.fetchdict("SELECT * FROM ratingitem WHERE id = %s", [no]);        
        advices = cntx.db.fetchdicts("SELECT ratingitem_id, advice, count(*) as count FROM `advice` WHERE ratingitem_id = %s GROUP BY ratingitem_id, advice", [no]);
        ratingitem['advices'] = dict();
        maxAdviceCount = 0;
        maxAdvice = 'ignore'
        for advice in advices:
            ratingitem['advices'][advice['advice']] = advice['count'];
            if advice['count'] > maxAdviceCount:
                maxAdviceCount = advice['count'];
                maxAdvice = advice['advice'];
        ratingitem['maxAdvice'] = maxAdvice;
        return jdump(ratingitem);

@route('/rest/ratingitem', method='POST')
def create_ratingitem():
    with seccontext() as cntx:
        item = request.json
        dbid = cntx.db.insert("""INSERT INTO ratingitem (id, name, description, category, creation_author, creation_time) 
                                 VALUES (NULL, %s, %s, %s, %s, """+cntx.db.time_now()+""")""",
                              [escape(item['name']), escape(item['description']), escape(item['category']), cntx.username])
        return redirect("/rest/ratingitem/" + str(dbid), 201);

@route('/rest/advice', method='POST')
def create_ratingitem():
    with seccontext() as cntx:
        advice = request.json
        #if advice['user'] != cntx.username:
        #    abort(401, "Sorry, access denied (wrong user).")
            
        dbid = cntx.db.execute("""DELETE FROM advice WHERE user = %s and ratingitem_id = %s""",
                               [cntx.username, advice['ratingitem_id']]);

        dbid = cntx.db.execute("""INSERT INTO advice (user, ratingitem_id, advice, creation_time)
                               VALUES (%s, %s, %s, """+cntx.db.time_now()+""")""",
                               [cntx.username, escape(str(advice['ratingitem_id'])), escape(advice['advice'])]);
        return redirect("/rest/advice/" + cntx.username + "/"+ str(advice['ratingitem_id']), 201);

@route('/rest/advice/<user>/<ratingitem_id>', method='GET')
def get_advice(user, ratingitem_id):
    with seccontext() as cntx:
        return jdump(cntx.db.fetchdict("SELECT * FROM advice WHERE user = %s and ratingitem_id = %s""",
                                       [user, ratingitem_id]));
    
@route('/rest/user_advices', method='GET')
def get_advices_bv_user():
    with seccontext() as cntx:
        return jdump(cntx.db.fetchdicts("SELECT * FROM advice WHERE user = %s""",
                                        [cntx.username]));

    
debug(cfg['debug'])

if __name__ =='__main__':
    run(host=cfg['server_bind_host'], port=cfg['server_bind_port'], reloader=cfg['server_reloader'])
else:
    application = default_app()
