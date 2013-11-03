<?php $cfg = json_decode(<<<EOT
{
                
    "db_host":  "localhost",
    "db_user":  "root",
    "db_password": "secret",
    "db_name": "techratingdb",
    "db_logfile": "",

    "demo_login_enabled": true,
    "demo_login_password": "secret",

    "google": {
        "client_id": "your-client-id.apps.googleusercontent.com",
        "client_secret": "your-client-secret-sdccerferfg",
        "redirect_uri": "http://127.0.0.1/gui/login.php"
    }

}
EOT
); ?>
