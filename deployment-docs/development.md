# 🛠 APPS PLAID Development

Developing the APPS PLAID typically involves cloning the [repository from GitHub](https://github.com/NASA-PDS/PLAID), making updates to the source code, and trying things out. Since this is a PHP application, you will need to have a web server in order to run APPS PLAID and test it. It also requires a [MariaDB](https://mariadb.org/) database server. Because of this, it's often easier to make a [Docker](https://www.docker.com/) image out of the code which encompasses the web server and run it in a composition using [Docker Compose](https://docs.docker.com/compose/), which takes care of both the web server and the database.

This is the approach documented here.


## 📧 Sending Email

APPS PLAID must be able to send email, as registering users requires them to click an emailed link to activate their accounts. As a result, you'll need to find out the settings for your local SMTP server, perhaps by consulting your system administrator.

The following settings are needed; see the [environment variables](env.md) list for details:

-   `SMTP_HOST`; may be `localhost`, `smtp.gmail.com`, `smtp.jpl.nasa.gov`, etc.
-   `SMTP_PORT`; defaults to `25`, but some servers like `smtp.gmail.com` use `587` and still others use `465`.
-   `SMTP_DOMAIN` tells what domain to make it appear emails from APPS PLAID come from, defaults to `jpl.nasa.gov`
-   `SMTP_SECURITY` tells what encryption to use when communicating with the `SMTP_HOST`; defaults to no value, which means no encryption. The other choices are `TLS` (transport layer security) or `STARTTLS` which starts with an unencrypted connection and requests the server to begin TLS. Consult your system administrator for the correct setting; for `smtp.jpl.nasa.gov`, no encryption is used, but `smtp.gmail.com`, `STARTTLS` is needed.
-   `SMTP_USER` is used for mail servers that require a valid username and password. `jpl.nasa.gov` doesn't use one but other servers do.
-   Finally, `SMTP_PASSWORD` should be set if `SMTP_USER` is also set.

These settings are made with enviornment variables which may be set in the host environment or in a file (see below).


## 🐑 Cloning the Repository

The [repository](https://github.com/NASA-PDS/PLAID) contains the source code for APPS PLAID and also provides the `docker-compose.yaml` file for starting the services. Begin by cloning the repository using your preferred clone URL copied from the repository web page; for example:
```console
$ git clone git@github.com:NASA-PDS/PLAID.git
$ cd PLAID
```


## 🌁 Making a Local Image

Next, you'll need to build a Docker image for the first time—and whenever you make a change to the source code, such as to a `.php` file or a `.html` file. Assuming Docker is installed and the command-line tools are available, run:
```console
$ docker image build --tag plaid --file docker/Dockerfile .
```
Once this step completes, you'll have an image `plaid` with the version tag `latest` in your local Docker image repository. Repeat this whenever you make a change to the source code.


## 🌱 Set up the Environment

A composition file, `docker/docker-compose.yaml`, is provided with the source code that can be used to run APPS PLAID and its dependent services. This file is set up for production, but by setting various environment variables, it can be used in development as well.

The mail server settings (`SMTP_…`) above will need to be set. In addition, these two variables _must also be set_ for development:

-   `PLAID_VERSION` should be set to `latest`
-   `PLAID_IMAGE_OWNER` should be set to an empty string; this will override the default which is to use an official `nasapds` image from Docker Hub.

You may also wish to set this variable:

-   `PLAID_PORT`, which defaults to 7166. For example, many developers prefer `8080`.

Although setting these environment variables in the shell (with `export` for `sh`-style shells or `setenv` for `csh`-style shells) is safest, for convenience you can put the settings in a file. For example, if you're using [GMail](https://www.google.com/gmail/) as your mail server and have a Google account, you might create a file called `envvars.txt` with the following contents:
```
PLAID_IMAGE_OWNER=
PLAID_VERSION=latest
PLAID_PORT=8080
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_DOMAIN=my-corp.com
SMTP_SECURITY=STARTTLS
SMTP_USER=joanne.developer@gmail.com
SMTP_PASSWORD=s3cr3t-p455w0rd
```
**⚠️ Caution:** If you add `SMTP_PASSWORD`, protect the the file! Make sure it's readable only by you.


## 🏃‍♀️ Running APPS PLAID

With the environment variables set in your command shell, you can run APPS PLAID as follows:
```console
$ docker compose --file docker/docker-compose.yaml up
```
Or, if you created an environment file such as `envvars.txt` from above, do:
```console
$ docker compose --env-file=envvars.txt --file docker/docker-compose.yaml up
```
Alternatively, you can specify environment variables on-the-fly; for example
```console
$ env PLAID_IMAGE_OWNER= PLAID_VERSION=latest PLAID_PORT=8080 SMTP_HOST=smtp.jpl.nasa.gov docker compose --file docker/docker-compose.yaml up
```
**⚠️ Caution:** Specifying `SMTP_PASSWORD` on the command-line with `env` is unsafe as other processes may read command lines.

You can then interact with APPS PLAID by pointing your browser to `http://localhost:PLAID_PORT` (substituting your chosen value for PLAID_PORT, or use the default of 7166).

To stop APPS PLAID, simply type your interrupt key (typically <kbd>⌃C</kbd>) in the same terminal as where you started `docker compose`.

The containers that composed the application are saved between runs, meaning test users you've registered and labels you've made are preserved in the database. If you need to get back to a clean slate, simply run `docker compose` again but replace `up` with `rm --force`. This removes all containers and will make the database reinitialize itself. This is also necessary if you make and database schema changes to `resources/plaid_dump.sql`.


## 🏛 Publishing to the Docker Hub

Once you've reached a point in development where you'd like to make your APPS PLAID image available to the general public, you need just tag your `plaid:latest` image and publish it to the Docker Hub. To do so:

```console
$ docker image tag plaid:latest nasapds/plaid:VERSION
$ docker login --username nasapds
Password: PASSWORD
$ docker image push nasapds/plaid:VERSION
$ docker logout
```

Replace `VERSION` with the new version of the APPS PLAID image being published, and `PASSWORD` with the password for the `nasapds` account on `hub.docker.com` (consult the PDS Engineering Node for help).


## 📍 Non-Containerized Development

While using the Docker container and `docker compose` simplifies setup and also helps guarantee that APPS PLAID works identically on the desktop as it does in production, it's not as conducive to development because it requires remaking the `plaid` image with every change. You can't just hit <kbd>Reload</kbd> in your browser to see an update to a `.html` file, for example.

In this case, it is possible—and perhaps _preferable_—to run APPS PLAID using a local [MariaDB](https://mariadb.org) or [MySQL Communuty Edition](https://www.mysql.com/products/community/) server and a web server such as [Nginx](https://nginx.org/) or [Apache HTTPD](https://httpd.apache.org/). This is considered an advanced topic, so only guidelines are presented here, as operating system specifics, development environments, and personal choices vary widely.


### 🔢 Database Setup

After installing MariaDB or MySQL, you'll need to create the APPS PLAID database user and schema. To do so, run commands similar to the following:
```console
$ mysql --batch --user=root --password --execute "CREATE DATABASE plaid;"
$ mysql --batch --user=root --password --execute "GRANT ALL PRIVILEGES ON plaid.* TO 'plaid_admin'@'localhost' IDENTIFIED BY 'password';"
```
Enter the `root` MySQL password when prompted. You can then set up the schema:
```console
$ mysql --batch --user=plaid_admin --password plaid < resources/plaid_dump.sql
```
When prompted, enter the password `password`.


### 🕸 Web Server Setup

Next you need to install a web server, add PHP support to it, and have it use your files as the root for serving and executing files for your client browser. APPS PLAID requires PHP 5.6 as of this writing, and needs the MySQL/MariaDB PDO extension. Depending on your operating system, how you do this may be as simple as running an installer command like `apt-get install`, `apk add`, `brew install`, `yum install`, etc., or may be as complex as compiling Apache HTTPD and PHP from source code and adding a line like
```
LoadModule php5_module libexec/apache2/libphp5.so
```
to an `httpd.conf` file.

The next challenge is then convincing the web server to serve files out of the cloned repository where you do your development. You may need to adjust security settings to not just enable the web server to execute PHP but to do so outside of a traditional HTML document tree. In some cases, symbolic links may help. In others, copying all the development files to `/var/www/html` is required.

You may also need to configure the global `php.ini` file to allow email to be sent.


### ✍️ PHP Configuration

Assuming you've got a working web server with PHP that's able to execute your files, the last step is to configure your local APPS PLAID to communicate with the database server. To do so, copy `php/configuration.php.example` to `php/configuration.php` and change the `const` lines as follows:
```php
const DB_USER     = "plaid_admin";
const DB_PASSWORD = "password";
const DB_DATABASE = "plaid";
const DB_HOST     = "mariadb";
const DB_PORT     = "3306";
```

Good luck 🤞
