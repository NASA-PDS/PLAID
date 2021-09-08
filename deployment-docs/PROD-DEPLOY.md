## Docker Production Deployment

### Build and Push PLAID Docker Image to JFrog Artifactory

####Build Docker Image locally
Log into CAE-Artifactory Development repository.

* Run login command:
```
$ docker login cae-artifactory.jpl.nasa.gov:16001
```   
Locate the local `/PLAID` project and `cd` into the root director that has _'Dockerfile'_  file.

* Execute Docker build command to create image:

```
$ docker build --no-cache -t cae-artifactory.jpl.nasa.gov:16001/gov/nasa/jpl/ammos/ids/plaid/plaidimage:latest .
```

* Push image to JPL Artifactory with command:
```
$ docker push cae-artifactory.jpl.nasa.gov:16001/gov/nasa/jpl/ammos/ids/plaid/plaidimage:latest
```