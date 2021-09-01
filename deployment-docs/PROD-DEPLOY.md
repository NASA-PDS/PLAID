## Docker Production Deployment

#### Setup an Apache server with PHP

Login to VM ssh


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