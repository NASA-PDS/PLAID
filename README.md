# APPS PDS Label Assistant for Interactive Design (PLAID)

The "APPS PLAID" is a web GUI to help create PDS4-compliant metadata labels. The core of "APPS PLAID" is a wizard that walks the user through a sequential process of creating a label. Behind the scenes, "APPS PLAID" interacts with a database for storing the user's information and progress through the wizard as well as the actual XML of the label.

"APPS PLAID" consists of a [PHP](https://www.php.net)-based application front end and a [MariaDB](https://mariadb.org/) persistence layer. It also uses [SMTP](https://datatracker.ietf.org/doc/html/rfc5321) to send registration emails to new users. The [Docker](https://www.docker.com/) container and composition environment is used to run and orchestrate the services in a repeatable fashion in both development and in operational deployment.


## ✋ Prerequsites

"APPS PLAID" requires the following in order to run regardless of if it's in development or production:

-   An SMTP server. "APPS PLAID" sends email and therefore needs a Simple Mail Transport Protocol server with which it can transmit emails. We don't go into setting up SMTP here, and in general it's best to consult your system administrator. You'll need to know:
    -   Your SMTP host name and port.
    -   The security protocol the server uses.
    -   Any username and password (if required by the server) as well as the authentication method ; see the deployment instructions for full details.
-   Docker. APPS PLAID uses the Docker containerization and the Docker Compose orchestration system. Systems may come with Docker [or you can install it yourself](https://docs.docker.com/get-docker/). If you're not usre, consult your system administrator. As of this writing, Docker Engine 20.10 and Docker Compose 2.1 or later are recommended.


## 🏃‍♀️ Developing and Deploying APPS PLAID

You can develop and deploy APPS PLAID using a Docker Composition (`docker compose`). This is the preferred configuration, but requires a front-end web server such as [Nginx](https://nginx.org/) or [Apache HTTPD](https://httpd.apache.org/) to reverse-proxy to APPS PLAID.

-   See the [development notes](deployment-docs/development.md) for instructions on developing APPS PLAID.
-   Check out the [production instructions](deployment-docs/production.md) for details on making an operational instance of APPS PLAID.


## 💁‍♀️ Using APPS PLAID to make PDS4 Labels

This section describes the steps that go into making labels using APPS PLAID.


### 🎬 Preparation

Inside of APPS PLAID is the overall PDS4 JSON. This JSON is generated from the schema, which defines the structure and necessary content of a label. After the user selects the product type for their label, APPS PLAID starts creating a new JSON that is a subset of the overall PDS4 JSON. In this new JSON, objects are stored in a hierarchy relating to the structure of the label's XML. APPS PLAID uses the data stored in this new JSON to dynamically create the wizard's content and guide the user through the entire process of creating a PDS4-compliant label.


### 🧙 Wizard

After the initial set of steps has been dynamically created from the JSON for the selected product type, APPS PLAID handles a variety of tasks behind the scenes as the user progresses through the wizard. 

First, it generates any subsequent steps according to the user's decisions. This is again accomplished by referencing the JSON formed after the user selects the product type. For example, if the user chooses to include an element that has sub-elements, a new step must be created to allow the user to choose which of the sub-elements to include in the label.

Second, it updates the XML based on the user's decisions and stores that XML in the database. In order to accurately place the new XML in the label, the path for the PDS4-attribute is stored in the ID of the HTML element. The path was stored in the ID when the step's content was dynamically created from the JSON data. This path is passed to the backend and used to locate where to place the new element in the XML. Prior to running the XPath query on the backend, the path is parsed so that it maps to the XML structure.

-   HTML ID: id="0/Identification_Area/1/logical_identifier"`
-   Corresponding XML path: `Identification_Area/logical_identifier`

Third, it captures the user's progress in the wizard and saves it to the database for future loading. This information is stored in a JSON that sits in a column of the label’s table. Upon reloading the wizard, this JSON is used to restore the user’s progress for the selected label.


### 🏁 Completion

Once the user has completed the process of constructing the label, APPS PLAID presents a preview and the option to export. The preview and file export are both accomplished by getting the XML from the database and either displaying it in the webpage or sending it as a downloadable file.


#### APPS PLAID Flow Diagram

![APPS PLAID Flow](resources/plaid_flow.png "PLAID Flow Diagram")


#### Database Diagram

![DB Diagram](resources/db_diagram.png "DB Diagram")


## 👥 Contributing

Within the NASA Planetary Data System, we value the health of our community as much as the code. Towards that end, we ask that you read and practice what's described in these documents:

-   Our [contributor's guide](https://github.com/NASA-PDS/.github/blob/main/CONTRIBUTING.md) delineates the kinds of contributions we accept.
-   Our [code of conduct](https://github.com/NASA-PDS/.github/blob/main/CODE_OF_CONDUCT.md) outlines the standards of behavior we practice and expect by everyone who participates with our software.


## 📃 License

The project is licensed under the [Apache version 2](LICENSE.md) license.


