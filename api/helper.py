from bottle import request, response, abort
from json import load, loads, dumps, JSONEncoder
from datetime import datetime
from sys import argv
import __main__ as main
from os import path
import random
import string
import cgi
import MySQLdb

cfg = None

# reads the given file and parses the data as json
def readconfig(filename):
    #print "read config from " + filename
    json_data=open(filename)
    data = load(json_data)
    json_data.close()
    return data

if len(argv) > 1:
    cfg = readconfig(argv[1])
else:
    cfg = readconfig('/etc/techrating.conf')

#cookie_secret = ''.join(random.choice(string.ascii_uppercase + string.digits) for x in range(30))
cookie_secret = cfg['cookie_secret'];

# escapes html special characters
def escape(string):
    return cgi.escape(string).encode('ascii', 'xmlcharrefreplace')

# special JSON encoder to handle dates
class ComplexEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return str(obj)
        return JSONEncoder.default(self, obj)

def jdump(data):
    response.content_type = 'application/json'
    return dumps(data, cls=ComplexEncoder)

def dbcon():
    return DB().open_mysql(cfg['db_host'], cfg['db_user'], cfg['db_password'], cfg['db_name'])

def set_login_cookie(username):
    response.set_cookie("radar_login", jdump([username, datetime.now()]), secret=cookie_secret, path="/");

class context:
    db = None
    access = None
    project = None
    pid = None #projectid
    userid = None

    def __init__(self, project, access):
        self.access = access
        self.project = project

    def __enter__(self):
        self.db = dbcon()
        cookie = request.get_cookie("s");
        if cookie:
            self.userid = self.pickupSession(cookie)
            if not self.userid:
                abort(401, "session invalid.")
            self.pid = self.db.projectid(self.project)
            projectRights = self.db.fetchdict("""SELECT * FROM user_project WHERE project_id = %s AND user_id = %s""", [self.pid, self.userid]); 
            if self.access == 'read' and projectRights == None:
                abort(401, "no read access for project.")
            if self.access == 'write' and not projectRights['can_write']:
                abort(401, "no write access for project.")
        else:
            abort(401, "no session found.")
        return self

    def pickupSession(self, sessionid):
        # todo: check expiration date
        session = self.db.fetchdict("""SELECT * FROM session WHERE sessionid = %s""", [sessionid]); 
        return session['user_id']

    def __exit__(self, type, value, traceback):
        self.db.close()

class DB:
    database = None
    is_mysql = True

    def __init__(self):
        pass

    def open_mysql(self, host, user, password, dbname):
        self.database = MySQLdb.connect(host, user, password, dbname) 
        self.is_mysql = True
        return self
        
    def concat(self, string1, string2):
        if not self.is_mysql:
            return string1+" || "+string2
        return "concat("+string1+", "+string2+")"

    def clean_sql(self, string):
        if not self.is_mysql:
            string = string.replace('%s', '?')
        return string

    def time_now(self):
        if not self.is_mysql:
            return "datetime('now')"
        else:
            return "now()"

    def insert(self, cmd, values=[]):
        cur = self.database.cursor()
        if values:
            cur.execute(self.clean_sql(cmd), values);
        self.database.commit();
        cur.close();
        return cur.lastrowid

    def execute(self, cmd, values=[]):
        cur = self.database.cursor()
        cur.execute(self.clean_sql(cmd), values);
        self.database.commit();
        cur.close();

    def fetchdicts(self, cmd, values=[]):
        cur = self.database.cursor()
        cur.execute(self.clean_sql(cmd), values);
        result = []
        columns = tuple( [d[0].decode('utf8') for d in cur.description] )
        for row in cur:
            result.append(dict(zip(columns, row)))
        cur.close();
        return result

    def fetchdict(self, cmd, values=[]):
        cur = self.database.cursor()
        cur.execute(self.clean_sql(cmd), values);
        columns = tuple( [d[0].decode('utf8') for d in cur.description] )
        row = cur.fetchone();
        result = None;
        if row:
            result = dict(zip(columns, row))
        cur.close();
        return result

    def fetchcolumn(self, cmd, values=[]):
        cur = self.database.cursor()
        cur.execute(self.clean_sql(cmd), values);
        result = []
        for row in cur:
            result.append(row[0])
        cur.close();
        return result

    def testit(self):
        c = self.database.cursor()
        c.execute("""SELECT 'connected to database'""")
        result = c.fetchone()
        if (result == None):
            raise Exception("error reading from database");
        c.close()

    def projectid(self, projectName):
        project = self.fetchdict("""SELECT * FROM project WHERE name = %s""", [projectName]);
        if not project:
            raise Exception("project name not found: "+ projectName)
        return project['id']

    def close(self):
        self.database.commit()
        self.database.close()        
