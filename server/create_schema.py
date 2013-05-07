from helper import dbcon, cfg

db = dbcon()
db.testit()

def mysql_only(string):
    if cfg['db_type'] == 'mysql':
        return string
    return ''

def tables_to_drop():
    if cfg['db_type'] == 'mysql':
        return db.fetchcolumn("SHOW TABLES");
    elif cfg['db_type'] == 'sqlite3':
        return db.fetchcolumn("SELECT name FROM sqlite_master WHERE type = 'table'");
    else:
        raise Exception("unknown db-type: "+ cfg['db_type'])

for tablename in tables_to_drop():
    db.execute("DROP TABLE "+tablename)

db.execute("""CREATE TABLE IF NOT EXISTS `ratingitem` (
                `id` INTEGER PRIMARY KEY """+mysql_only('AUTO_INCREMENT')+""",
                `name` varchar(40) NOT NULL,
                `description` text,
                `category` varchar(40) NOT NULL,
                `creation_author` varchar(40) NOT NULL,
                `creation_time` datetime NOT NULL
                ) """+mysql_only('ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci')+""";""", [])

db.execute("""CREATE TABLE IF NOT EXISTS `advice` (
                `ratingitem_id` int NOT NULL,
                `user` varchar(40) NOT NULL,
                `advice` varchar(40) NOT NULL,
                `creation_time` datetime NOT NULL,
                 PRIMARY KEY (`ratingitem_id`, `user`)
                ) """+mysql_only('ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci')+""";""", [])

db.execute("""CREATE TABLE IF NOT EXISTS `category` (
                `id` varchar(40) NOT NULL,
                `name` varchar(40) NOT NULL,
                `description` text,
                `orderindex` int NOT NULL,
                 PRIMARY KEY (`id`)
                ) """+mysql_only('ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci')+""";""", [])


db.execute("""INSERT INTO ratingitem (id, name, description, category, creation_author, creation_time) VALUES 
     (NULL, "Scala", "Die Scala Sprache f&uuml;r die JVM", "prog", "smanck", """+db.time_now()+"""),
     (NULL, "JavaScript", "Die Sprache des Web", "prog", "smanck", """+db.time_now()+"""),
     (NULL, "Spring", "Das Spring Framework (Dependency Injection, Security, ...)", "prog", "smanck", """+db.time_now()+"""),
     (NULL, "Play Framework", "Play ist eine Java-Framework f&uuml;r Web-Applikationen", "prog", "smanck", """+db.time_now()+"""),
     (NULL, "Clojure", "Das Lisp-Derivat f&uuml;r die JVM", "prog", "smanck", """+db.time_now()+"""),
     (NULL, "Python", "Die Sprache Python", "prog", "smanck", """+db.time_now()+"""),
     (NULL, "ScalaX1", "Die Scala Sprache f&uuml;r die JVM", "prog", "smanck", """+db.time_now()+"""),
     (NULL, "ScalaX2", "Die Scala Sprache f&uuml;r die JVM", "prog", "smanck", """+db.time_now()+"""),
     (NULL, "ScalaX3", "Die Scala Sprache f&uuml;r die JVM", "prog", "smanck", """+db.time_now()+"""),
     (NULL, "ScalaX4", "Die Scala Sprache f&uuml;r die JVM", "prog", "smanck", """+db.time_now()+"""),
     (NULL, "ScalaX5", "Die Scala Sprache f&uuml;r die JVM", "prog", "smanck", """+db.time_now()+"""),
     (NULL, "ScalaX6", "Die Scala Sprache f&uuml;r die JVM", "prog", "smanck", """+db.time_now()+"""),
     (NULL, "ScalaX7", "Die Scala Sprache f&uuml;r die JVM", "prog", "smanck", """+db.time_now()+"""),
     (NULL, "Cucumber", "Semantisches Testen mit Cucumber", "test", "smanck", """+db.time_now()+"""),
     (NULL, "Chef", "Chef, das Tool zur Systemautomatisierung", "tooling", "smanck", """+db.time_now()+"""),
     (NULL, "Puppet", "Puppet, das Tool zur Systemautomatisierung", "tooling", "smanck", """+db.time_now()+"""),
     (NULL, "Java Portlet", "Portale nach em Java Portlet Standard (z.B. Liferay und Co)", "paradigm", "smanck", """+db.time_now()+""");""")


db.execute("""INSERT INTO category (id, name, description, orderindex) VALUES 
                ("prog", "Programmiersprachen & Frameworks", "In diese Kategorie geh&ouml;ren alle Programmiersprachen sowie die zugeh&ouml;rigen wichtigen Bibliotheken und Frameworks", 1),
                ("tooling", "Tooling", "In diese Kategorie geh&ouml;ren alle Aspekte zum Management von Infrastruktur, Automatisierung, CI/CD. Sowie Toolchain Themen z.B. maven.", 2),
                ("test", "Testing", "In diese Kategorie geh&ouml;rt alles zum Testen von Software. Dies kann sowohl Technologie, als auch Test-Tooling sein.", 3),
                ("paradigm", "Architektur, Paradigmen, Vorgehen", "In dieser Kategorie sind grunds&auml;tzliche Vorgehensmuster und Prinzipien anzusiedeln. Dies k&ouml;nnen technische, aber auch reine Prozessthemen sein.", 4);""")


db.close()
print "initialized db."
