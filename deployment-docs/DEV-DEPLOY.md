## Docker Dev Deployment

### _** Prerequisites before proceeding with deployment instructions_

1. Required: Access to JPL MIPL Account and `sudo` user privileges for the virtual machine: _`miplvm-docker1`_
    * For access, put in a request to the MIPL helpdesk by emailing: _**miplhelp@mipl.jpl.nasa.gov**_


2. Install Docker on your machine using these steps: https://flaviocopes.com/docker-installation-macos/


 ** _**Once these prerequisites are satisfied, you can move forward with the procedure**_
   

### Build and Push PLAID Docker Image to DockerHub
#### Build Docker Image locally

Locate the local `/PLAID` project and `cd` into the root directory that has _'Dockerfile'_  file.

* Execute Docker build command to create image:

```
$ docker build -t devplaid/plaid .
```
* Verify that image is successfully built with command:
```
$ docker images -a
```
* Run login command:
```
$ docker login
```   

* Push image to `docker.io/devplaid/plaid`:
```
$ docker push devplaid/plaid
```
  

* If, docker push is successful, terminal output will show `Latest:digest:sha256:<key>`

**Warning**: 
* If docker push command fails or denied, then access to artifactory repository directory may not have been given
* _Common Problem:_ If docker push command is hanging, connection to _DockerHub_ may have timed-out. Run login command, again.
***

### Deploy and Run PLAID Container in VM
#### Pull PLAID Image from Repository into Dev Environment
**_Open a new terminal window to execute the following steps_**


SSH into dev deployment environment:

```
$ ssh miplvm-docker1
```

* Enter JPL password upon request to complete authentication

Once inside `miplvm-docker1`, run login command to access _DockerHub_:

```
$ sudo docker login
```   


* Username: plaid-dev
* Password: Cbrdev3959!!


Pull Docker image:

```
$ sudo docker pull devplaid/plaid
```
* When docker has completed the image pull,
 
    - Terminal will show: `Status: Downloaded newer image for devplaid/plaid`
    - If image pull is run more than once: `Status: Image is up to date for devplaid/plaid`
    
    
Rename the Docker image to: _plaid:latest_

```
sudo docker tag devplaid/plaid:latest plaid:latest
```

Delete old image:

```
sudo docker rmi devplaid/plaid:latest
```


##### Configure docker YAML file for development deployment

Create a directory for the YAML file **(while in VM terminal window)**.

* Make folder for **/plaid** and `cd` into directory **(from VM terminal)**:
```
$ mkdir plaid
$ cd plaid
```


Copy local **_docker-compose.dev.yaml_** file and `resources` folder to the VM **(run commands from the original terminal window, in local plaid project directory)** :

```
$ scp docker-compose.dev.yaml <username>@miplvm-docker1:/home/<username>/plaid
$ scp -r resources <username>@miplvm-docker1:/home/<username>/plaid
```

Return to **VM terminal window**. While in directory `/home/USERNAME/plaid`, run docker-compose to deploy PLAID:

```
$ sudo docker-compose -f docker-compose.dev.yaml up
```

While in VM, verify that docker containers _NAMES_: `plaid_plaid_1` and `plaid_mariadb_1` are created and running, with command:
```
$ sudo docker ps -a
```

Finally, check if develop PLAID is live by searching on a browser window:

**LINK**: https://miplvm-docker1.jpl.nasa.gov/plaid/