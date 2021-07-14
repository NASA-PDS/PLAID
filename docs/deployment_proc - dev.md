## PLAID dev - Docker Deployment

Procedure shows step-by-step directions to deploy PLAID to https://miplvm-docker1.jpl.nasa.gov/plaid 

####  Build and Push PLAID Image to: atifactory.jpl.nasa.gov
1. Build Docker Image
- Move into root of the `/PLAID` directory that holds 'Dockerfile', run command:
Commands:
```
$ docker build --no-cache -t artifactory.jpl.nasa.gov:16001/gov/nasa/jpl/ids/plaid/plaidimage:V1 .
```
```
$ docker run -p 81:8080 plaidimage
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
