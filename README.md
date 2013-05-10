tech-rating
===========

tech-rating is a technology rating web platform. The idea was taken from the Thoughtworks Technology Radar [1]. But the tech-rating approach helps to manage this is a more democratic way.

[1] http://www.thoughtworks.com/insights


Installation using wsgi and apache2
====================================

WSGI is the python standard interface for web applications. You should use this for a production environment

1) Install the apache module:
> sudo apt-get install libapache2-mod-wsgi

2) checkout techrating e.g.:
> cd /var/www
> git clone https://github.com/smancke/tech-rating.git

3a) Copy the config
> cp ./tech-rating/server/democonfig_mysql.json to /etc/techrating.conf

3b) Edit the config values
> vi /etc/techrating.conf

4) Create a mysql database and execute
> python ./tech-rating/server/create_schema.py

5) Edit the apache site configuration
> vi /etc/apache2/sites-enabled/000-default

6) Insert the following at the end:
WSGIDaemonProcess wsgi user=www-data group=www-data processes=1 threads=10 python-path=/var/www/tech-rating/server
WSGIScriptAlias / /var/www/tech-rating/server/tech-rating.py

7) Reload the apache config:
> sudo service apache2 reload
