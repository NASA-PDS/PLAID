## Docker Dev Deployment

### _** Prerequisites before proceeding with deployment instructions_

1. Required: Access to JPL MIPL Account and `sudo` user privileges for the virtual machine: _`miplvm-docker1`_
    * For access, put in a request to the MIPL helpdesk by emailing: _**miplhelp@mipl.jpl.nasa.gov**_

2. Required: Access to JPL's repository manager, JFrog CAE-Artifactory 
    * Go to https://cae-artifactory.jpl.nasa.gov and log in using your JPL username and password
    * JFrog CAE-artifactory web interface will look like this:
        IMAGE
        
3. Need to a part of the AMMOS-IDS Directory Group in order to access and push to the PLAID JFrog repository

4. Install Docker on your machine using these steps: https://flaviocopes.com/docker-installation-macos/


 ** _**Once these prerequisites are satisfied, you can move forward with the procedure**_
   

### Build and Push PLAID Docker Image to JFrog Artifactory
#### Build Docker Image locally

Locate the local `/PLAID` project and `cd` into the root directory that has _'Dockerfile'_  file.

* Execute Docker build command to create image:

```
$ docker build --no-cache -t cae-artifactory.jpl.nasa.gov:16001/gov/nasa/jpl/ammos/ids/plaid/plaid:latest .
```
* Check if docker image, `cae-artifactory.jpl.nasa.gov:16001/gov/nasa/jpl/ammos/ids/plaid/plaid` with Tag `latest`, is built with command:
```
$ docker images -a
```

Log into CAE-Artifactory Development repository.

* Run login command:
```
$ docker login cae-artifactory.jpl.nasa.gov:16001
```   
  
* Enter JPL password upon request

Push image to JPL Artifactory with command:
```
$ docker push cae-artifactory.jpl.nasa.gov:16001/gov/nasa/jpl/ammos/ids/plaid/plaid:latest
```

* If, docker push is successful, terminal output will show `Latest:digest:sha256:<key>`
* You can verify that the image was pushed to https://cae-artifactory.jpl.nasa.gov through the web interface:
    * Under 'Quick Search', click 'Package Search'
    * In Image Textbox type: gov/nasa/jpl/ammos/ids/plaid/plaid
    * Click 'Search' button
    * The Search Results will display a list images with respective tags. You can verify your docker image push by checking the combination of image, tag, and modified date

**Warning**: 
* If docker push command fails or denied, then access to artifactory repository directory may not have been given
* _Common Problem:_ If docker push command is hanging, connection to `cae-artifactory.jpl.nasa.gov:16001` may have timed-out. Run login command, again.
***

### Deploy and Run PLAID Container in VM
#### Pull PLAID Image from Repository into Dev Environment
**_Open a new terminal window to execute the following steps_**


SSH into dev deployment environment:

```
$ ssh miplvm-docker1
```

* Enter JPL password upon request to complete authentication

Once inside `miplvm-docker1`, run login command to access CAE-Artifactory:

```
$ sudo docker login cae-artifactory.jpl.nasa.gov:16001
```   
* Enter JPL password upon request

Pull Docker image from CAE-Artifactory:

```
$ sudo docker pull cae-artifactory.jpl.nasa.gov:16001/gov/nasa/jpl/ammos/ids/plaid/plaid:latest
```
* When docker has completed the image pull,
 
    - Terminal will show: `Status: Downloaded newer image for cae-artifactory.jpl.nasa.gov:16001/gov/nasa/jpl/ammos/ids/plaid/plaid:latest` 
    - If image pull is run more than once: `Status: Image is up to date for cae-artifactory.jpl.nasa.gov:16001/gov/nasa/jpl/ammos/ids/plaid/plaid:latest`
    
    
Rename the Docker image to: _plaid:latest_

```
sudo docker tag cae-artifactory.jpl.nasa.gov:16001/gov/nasa/jpl/ammos/ids/plaid/plaid:latest plaid:latest
```

Delete old image:

```
sudo docker rmi cae-artifactory.jpl.nasa.gov:16001/gov/nasa/jpl/ammos/ids/plaid/plaid:latest
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