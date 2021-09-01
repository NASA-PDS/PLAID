## Docker Dev Deployment

#### Setup an Apache server with PHP

Login to VM ssh
    ```
    >> ssh ssh haile@miplvm-docker1 
    ```
Pull image:
    `````>> sudo docker pull karthequian/helloworld:latest
    2. >> sudo docker tag karthequian/helloworld helloworld
3. Start container:
    1. >> sudo docker-compose up


Locate httpd.conf in local machine Apache Server folder

Add the following or uncomment this line if it is already in httpd.conf file:
```
LoadModule php7_module libexec/apache2/libphp7.so
```
####  Setup a MySql database using the attached database dump files (```resources/plaid_dump.sql```).
Move into the `PLAID/resources` directory and run these mysql commands:

```
$ mysql -u -p -e 'create database plaid'
$ mysql -u -p plaid < plaid_dump.sql
```
####  Build Docker Image
Return to parent directory

While in the `/PLAID` directory that holds 'Dockerfile', run command:

```
$ docker build -t plaidimage .
```

####  Start PLAID Docker Container

Stay in the same directory and run command:

```
$ docker run -p 81:8080 plaidimage
```

####  Run Docker Compose to Launch PLAID application

Stay in the same directory and run command:

```
$ docker-compose up
```

#### Open application using browser

Open browser and try localhost with port 81
```
http://localhost:81
```