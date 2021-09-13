## Docker Dev Deployment

### Build and Push PLAID Docker Image to JFrog Artifactory

#### Build Docker Image locally
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

#### Deploy and Run PLAID Container in VM
##### Launch mariaDB Container in VM



##### Pull PLAID Image from Repository into Dev Environment

SSH into dev deployment environment:

```
$ ssh miplvm-docker1
```
Password is needed to gain access to VM.
* Enter password for JPL LDAP authentication:
```
<USERNAME@miplvm-docker1's password:> $ ********
```

Run login command to access CAE-Artifactory:

```
$ sudo docker login cae-artifactory.jpl.nasa.gov:16001
```   

Pull Docker image from CAE-Artifactory:

```
$ sudo docker pull cae-artifactory.jpl.nasa.gov:16001/gov/nasa/jpl/ammos/ids/plaid/plaidimage:latest
```

Rename the Docker image to: _plaid:latest_

```
sudo docker tag cae-artifactory.jpl.nasa.gov:16001/gov/nasa/jpl/ammos/ids/plaid/plaidimage:latest plaid:latest
```

Delete old image:

```
sudo docker rmi cae-artifactory.jpl.nasa.gov:16001/gov/nasa/jpl/ammos/ids/plaid/plaidimage:latest
```


##### Configure docker YAML file for development deployment

Create a directory for the YAML file.

* Make folder for **/plaid** and `cd` into directory:
```
$ mkdir plaid
```
```
$ cd plaid
```

Copy local **_docker-compose.dev.yaml_** file to the VM:

```
$ scp docker-compose.dev.yaml USERNAME@miplvm-docker1:/home/USERNAME/plaid
```

Copy the local PLAID **/resources** directory to the VM
* Make `/resources` directory in /plaid
* `cd` into `/resources` 
* Copy contents of `/resources` to `@miplvm-docker1:/home/USERNAME/plaid/resources`
```
$ scp -r /path/to/folder/resources/* USERNAME@miplvm-docker1:/home/USERNAME/plaid

```

While in directory `/home/USERNAME/plaid`, run docker-compose to deploy PLAID:

```
$ docker-compose -f docker-compose.dev.yaml up
```