tech-rating
===========

tech-rating is a technology rating web platform. The idea was taken from the Thoughtworks Technology Radar [1]. But the tech-rating approach helps to manage this is a more democratic way.

You can find a live installation at http://techrating.org


Installation 
=============
Installation is very easy.

Prerequirements:
- A web server (e.g. tested with apache v2.4.6)
- apache mod_rewrite enabled
- PHP5 (tested with v5.5.3)
- Python (configured as CGI, see below) (tested with v2.7.5 and v2.6.6)
- mySQL (tested with v5.5.32)
Older versions of the software should work as well


1. Enable your web server to serve python cgi scripts.
e.g. for apache add the following directives at the right place
```
Options +ExecCGI
AddHandler cgi-script .cgi .pl .py
```
On my ubuntu this is: /etc/apache2/sites-enabled/000-default.conf
```
<Directory /var/www/>
  Options +Indexes +ExecCGI +FollowSymLinks +MultiViews
  AddHandler cgi-script .cgi .pl .py 
  ...
</Directory>
```

2. Checkout all the files in the root directory of your apache


3. create a mysql database and execute the sql scripts:
```
mysql_schema.sql
mysql_base_data.sql
```

4. copy config.template.php to config.php
and fill out the configuration.
(Retain the format of the configuration, 
because the parsing from python is currently not very robust.)
