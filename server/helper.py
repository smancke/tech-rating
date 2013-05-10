from bottle import request, response, abort
from json import load, loads, dumps, JSONEncoder
from datetime import datetime
from sys import argv
import __main__ as main
from os import path
import random
import string
import cgi

cfg = None

# reads the given file and parses the data as json
def readconfig(filename):
    print "read config from " + filename
    json_data=open(filename)
    data = load(json_data)
    json_data.close()
    return data

if len(argv) > 1:
    cfg = readconfig(argv[1])
else:
    cfg = readconfig('/etc/techrating.conf')

if cfg['db_type'] == 'mysql':
    import MySQLdb
elif cfg['db_type'] == 'sqlite3':
    import sqlite3

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
    if cfg['db_type'] == 'mysql':
        return DB().open_mysql(cfg['db_host'], cfg['db_user'], cfg['db_password'], cfg['db_name'])
    elif cfg['db_type'] == 'sqlite3':
        return DB().open_sqlite3(cfg['db_filename'])
    raise Exception("unknown db_type '"+cfg.db_type+"' use: mysql|sqlite3")

def set_login_cookie(username):
    response.set_cookie("radar_login", jdump([username, datetime.now()]), secret=cookie_secret, path="/");

class context:
    db = None
    def __enter__(self):
        self.db = dbcon()
        return self
    def __exit__(self, type, value, traceback):
        self.db.close()

class seccontext:
    username = None    
    db = None

    def __enter__(self):
        cookie = request.get_cookie("radar_login", secret=cookie_secret);
        if cookie:
            cookie_data = loads(cookie);
            username = cookie_data[0]
            # todo: check expiration date
            if username:
                self.username = username
                self.db = dbcon()
                return self
        abort(401, "Sorry, access denied.")
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
        
    def open_sqlite3(self, filename):
        self.database = sqlite3.connect(filename)
        self.is_mysql = False
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

    def close(self):
        self.database.commit()
        self.database.close()        
