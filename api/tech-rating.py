#!/usr/bin/python

import os, sys
sys.path.append(os.path.dirname(__file__))

from bottle import route, run, debug, request, response, redirect, static_file, abort, default_app
from helper import jdump, context, cfg, escape
import imaplib

@route('/<project>/category', method='GET')
def get_categories(project):
    with context(project, 'read') as cntx:
        return jdump(cntx.db.fetchdicts("SELECT * FROM category ORDER BY orderindex"))
    
@route('/<project>/ratingitem', method='GET')
def get_ratingitems(project):
    with context(project, 'read') as cntx:
        item_self_link = cntx.db.concat("'" + "/api/"+ project + "/ratingitem/'", "id");
        return jdump(cntx.db.fetchdicts("SELECT *, "+item_self_link+" as self FROM ratingitem WHERE project_id = %s ORDER BY name", [cntx.pid]))

@route('/<project>/fullratingitem', method='GET')
def get_fullratingitems(project):
    with context(project, 'read') as cntx:
        category = request.query.get('category')
        if category:
            dbitems = cntx.db.fetchdicts("SELECT * FROM ratingitem WHERE category = %s AND project_id = %s ORDER BY name", [category, cntx.pid])
        else:
            dbitems = cntx.db.fetchdicts("SELECT * FROM ratingitem WHERE project_id = %s ORDER BY name", [cntx.pid])
        result = []
        for item in dbitems:
            result.append(get_ratingitem_data(cntx, project, item['id']))
        return jdump(result);

def get_ratingitem_data(cntx, project, no):
    ratingitem = cntx.db.fetchdict("SELECT user.displayname, ratingitem.* FROM ratingitem, user WHERE ratingitem.creation_author = user.id AND ratingitem.id = %s AND project_id = %s", [no, cntx.pid]);
    if not ratingitem:
        abort(404, "Element not found");
    advices = cntx.db.fetchdicts("SELECT ratingitem_id, advice, count(*) as count FROM `advice` WHERE ratingitem_id = %s AND project_id = %s GROUP BY ratingitem_id, advice", [no, cntx.pid]);
    ratingitem['advices'] = dict();
    maxAdviceCount = 0;
    maxAdvice = 'ignore'
    for advice in advices:
        ratingitem['advices'][advice['advice']] = advice['count'];
        if advice['count'] > maxAdviceCount:
            maxAdviceCount = advice['count'];
            maxAdvice = advice['advice'];
    ratingitem['maxAdvice'] = maxAdvice;
    return ratingitem;

@route('/<project>/ratingitem/<no>', method='GET')
def get_ratingitem(project, no):
    with context(project, 'read') as cntx:
        return jdump(get_ratingitem_data(cntx, project, no));

@route('/<project>/ratingitem/<no>', method='DELETE')
def delete_ratingitem(project, no):
    with context(project, 'write') as cntx:
        cntx.db.execute("DELETE FROM ratingitem WHERE id = %s AND project_id = %s", [no, cntx.pid]);
        cntx.db.execute("DELETE FROM advice WHERE ratingitem_id = %s AND project_id = %s", [no, cntx.pid]);        
        return '{"status": "ok"}'

@route('/<project>/ratingitem', method='POST')
def create_ratingitem(project):
    with context(project, 'write') as cntx:
        item = request.json
        dbid = cntx.db.insert("""INSERT INTO ratingitem (id, name, description, category, creation_author, creation_time, project_id) 
                                 VALUES (NULL, %s, %s, %s, %s, NOW(), %s)""",
                              [escape(item['name']), escape(item['description']), escape(item['category']), cntx.userid, cntx.pid])
        return redirect("/api/" +project+ "/ratingitem/" + str(dbid), 201);

@route('/<project>/ratingitem/<no>', method='PUT')
def update_ratingitem(project, no):
    with context(project, 'write') as cntx:
        item = request.json            
        dbid = cntx.db.execute("""UPDATE ratingitem SET 
                                  name=%s, description=%s, category=%s, creation_author=%s, creation_time="""+cntx.db.time_now()+"""
                                  WHERE id = %s AND project_id = %s""",
                               [escape(item['name']), escape(item['description']), escape(item['category']), cntx.userid, no, cntx.pid])
        return '{"status": "ok"}'

@route('/<project>/advice', method='POST')
def create_advice(project):
    with context(project, 'write') as cntx:
        advice = request.json
            
        dbid = cntx.db.execute("""DELETE FROM advice WHERE user_id = %s and ratingitem_id = %s AND project_id = %s""",
                               [cntx.userid, advice['ratingitem_id'], cntx.pid]);

        dbid = cntx.db.execute("""INSERT INTO advice (user_id, ratingitem_id, advice, creation_time, project_id)
                               VALUES (%s, %s, %s, NOW(), %s)""",
                               [cntx.userid, escape(str(advice['ratingitem_id'])), escape(advice['advice']), cntx.pid]);
        return redirect("/api/"+project+"/advice/" + str(cntx.userid) + "/"+ str(advice['ratingitem_id']), 201);

@route('/<project>/advice/<user>/<ratingitem_id>', method='GET')
def get_advice(project, user, ratingitem_id):
    with context(project, 'read') as cntx:
        return jdump(cntx.db.fetchdict("SELECT * FROM advice WHERE user_id = %s and ratingitem_id = %s AND project_id = %s""",
                                       [user, ratingitem_id, cntx.pid]));
    
@route('/<project>/user_advices', method='GET')
def get_advices_bv_user(project):
    with context(project, 'read') as cntx:
        return jdump(cntx.db.fetchdicts("SELECT * FROM advice WHERE user_id = %s AND project_id = %s""",
                                        [cntx.userid, cntx.pid]));

@route('/<project>/timeline', method='GET')
def get_timeline(project):
    offset = 0
    limit = 300
    with context(project, 'read') as cntx:
        return jdump(cntx.db.fetchdicts("""SELECT user.displayname as user, innerSelect.* FROM user, ((SELECT advice.user_id as user_id, name as targetLabel, 'advice' as action, advice.advice as value, advice.creation_time as time
                                               FROM ratingitem, advice WHERE advice.ratingitem_id = ratingitem.id AND advice.project_id = %s)
                                             UNION
                                             (SELECT creation_author as user_id, name as targetLabel, 'new' as action, 
                                               'created' as value, creation_time as time FROM ratingitem WHERE ratingitem.project_id = %s)) innerSelect
                                             WHERE innerSelect.user_id = user.id
                                             ORDER BY time DESC
                                             LIMIT %s, %s""",
                                        [cntx.pid, cntx.pid, offset, limit]));
    


run(server='cgi')

#debug(cfg['debug'])
#    run(host=cfg['server_bind_host'], port=cfg['server_bind_port'], reloader=cfg['server_reloader'])
