[![Coverage Status](https://coveralls.io/repos/github/Sage-Bionetworks/Agora/badge.svg?branch=develop)](https://coveralls.io/github/Sage-Bionetworks/Agora?branch=develop)
[![Build Status](https://travis-ci.org/Sage-Bionetworks/Agora.svg?branch=develop)](https://travis-ci.org/Sage-Bionetworks/Agora)
[![GitHub version](https://badge.fury.io/gh/Sage-Bionetworks%2FAgora.svg)](https://badge.fury.io/gh/Sage-Bionetworks%2FAgora)

# Agora

## Prerequisites

What you need to run this app:

- `node` and `npm` (`brew install node`)

  - Ensure you're running the latest versions Node `v16.x.x`+ and NPM `8.x.x`+
- A version 6.0+ [MongoDB](https://www.mongodb.com/docs/manual/administration/install-community/) instance running on your local machine

- You can optionally use a GUI like [Compass](https://www.mongodb.com/docs/compass/current/) or [Studio3T](https://studio3t.com/knowledge-base/articles/installation/) with your local database

  - Note that only Studio3T is compatible with the [AWS DocumentDB](https://docs.aws.amazon.com/documentdb/latest/developerguide/what-is.html) instances in Agora's dev, stage and prod environments. Either GUI tool will work with your local Mongo instance.


> If you have `nvm` installed, which is highly recommended (`brew install nvm`) you can do a `nvm install --lts && nvm use` in `$` to run with the latest Node LTS. You can also have this `zsh` done for you [automatically](https://github.com/creationix/nvm#calling-nvm-use-automatically-in-a-directory-with-a-nvmrc-file)

## Getting Started

### 1 - Install

```bash
# Clone the repo
git clone https://github.com/Sage-Bionetworks/Agora.git

# Go to repo folder
cd Agora

# Install dependencies
npm install
```

### 2 - Create database

You will need to create a MongoDB database and name it `agora`. 

- [Using the MongoDB Shell](https://www.mongodb.com/basics/create-database#option-2)
- [Using MongoDB Compass](https://www.mongodb.com/basics/create-database#option-3)
- [Using Studio3T](https://studio3t.com/knowledge-base/articles/common-mongodb-commands/#1-mongodb-create-database)

Note: You can use the following scripts to start the database:

```
# Linux and MacOS
npm run mongo:start

# Windows
npm run mongo:start:windows
```

### 3 - Populate database

Agora's data is stored in json files in the [Agora Syanpse project](https://www.synapse.org/#!Synapse:syn11850457/files/), in the following subfolders:
* [Agora Live Data](https://www.synapse.org/#!Synapse:syn12177492) - This folder contains all production data releases, as well as data releases that were never released to production
* [Agora Testing Data](https://www.synapse.org/#!Synapse:syn17015333) - This folder contains test data releases that may not be fully validated
* [Exploratory Data](https://www.synapse.org/#!Synapse:syn50612175) - This folder contains exploratory data files, and subfolders for data releases generated locally via the [agora-data-tools](https://github.com/Sage-Bionetworks/agora-data-tools) ETL tool
* [Mock Data](https://www.synapse.org/#!Synapse:syn30602404) - This folder is reserved for future testing efforts

The image files surfaced on Agora's Teams page are stored in Synapse [here](https://www.synapse.org/#!Synapse:syn12861877); there is only one set of image files, and the most recent version is always used. The image files aren't considered part of a data release.

The contents of a given data release are defined by a specific version of a `data_manifest.json` file. The manifest file lists the synID and version of each data file in the release. The manifest files generated by the ETL framework are uploaded to the same Synapse folder as the data files they reference.

To populate your local database, you need to download the appropriate file(s), import them into Mongo, and then index the collections. Each of these steps can be achieved manually, or by using the scripts defined in this project.

If you want to load a set of data files that span multiple Synapse folders, you can do one of the following:
* Load some or all of the data manually
* Create a custom manifest file that defines the contents of the custom data release; custom manifest files should be uploaded only to the [Exploratory Data](https://www.synapse.org/#!Synapse:syn50612175) folder

#### Manual data population

It may make sense to populate your database manually when there is no manifest available for the specific set of files you want to load, and/or if you want to load only a small number of new, modified, or exploratory data files.

Each of the required steps can be achieved manually:
* Downloading specific files from Synapse using either the Web interface or using one of the [programmatic options supported by synapse](https://help.synapse.org/docs/Downloading-Data-Programmatically.2003796248.html)
* Ingesting specific json files from your local file system into the database using [MongoDB Compass](https://www.mongodb.com/docs/compass/current/import-export/), [Studio3T](https://studio3t.com/knowledge-base/articles/mongodb-import-json-csv-bson/#import-json-to-mongodb), or using the [mongoimport](https://www.mongodb.com/docs/database-tools/mongoimport/) command line utility
* Ingesting specific image files from your local file system into the database using [MongoDB Compass](https://www.mongodb.com/docs/compass/current/import-export/), [Studio3T](https://studio3t.com/knowledge-base/articles/mongodb-gridfs/#add-a-new-file), or using the [mongofiles](https://www.mongodb.com/docs/database-tools/mongofiles/) command line utility
* Indexing collections using a GUI tool like [MongoDB Compass](https://www.mongodb.com/docs/compass/current/indexes/), [Studio3T](https://studio3t.com/knowledge-base/articles/create-mongodb-index/#add-a-mongodb-index), or using the [mongsh](https://www.mongodb.com/docs/manual/indexes/) command line utility

You can also combine any of the manual steps with the scripts that perform the other steps. 

#### Using the data population scripts

You can use the data population scripts defined in this repository to download, ingest, and index data. These steps can be performed individually by invoking the commands described in the following sections, or you can use a single command to perform all three steps.

##### Prerequisites
To populate data into your local database using the scripts defined in this project, you must:
 
1. Install the [Mongo Database Tools](https://www.mongodb.com/docs/database-tools/installation/installation/)
2. Install the package manager `pip` [here](https://bootstrap.pypa.io/get-pip.py), if necessary (python 3.4+ ships with `pip`).
3. Use `pip` to install the `synapseclient` using the following command:
```bash
python3 -m pip install synapseclient
```
3. Create a Synapse PAT as described [here](https://help.synapse.org/docs/Managing-Your-Account.2055405596.html#ManagingYourAccount-PersonalAccessTokens)
4. Add your PAT to .synapseConfig as described [here](https://python-docs.synapse.org/build/html/Credentials.html#use-synapseconfig)
5. If necessary, install `wget`, which is a dependency of the data population scripts.
6. If necessary, add python3 to your path, as described [here](https://stackoverflow.com/a/62151306)

```bash
SHELL_SETTINGS_FILE=~/".bash_profile"
echo "export PATH=\"`python3 -m site --user-base`/bin:\$PATH\"" >> "${SHELL_SETTINGS_FILE}"
source "${SHELL_SETTINGS_FILE}"
```

7. Confirm that `synapse` package and credentials are properly configured:

```bash
synapse login
```

##### Provisioning a local database with a single command

Use this command to sequentially download data and image files, ingest those files, and index the collections in your local db; you will be prompted to provide information about the manifest file that you want to use:

```bash
npm run data:local:mongo
```

###### Downloading data and image files

Use this command to download data and image files from synapse to the ./local/data folder in this project; you will be prompted to provide information about the manifest file that you want to use:

```bash
npm run data:local
```

###### Importing data and image files
Use this command to import the data and image files in your ./local/data folder:

```bash
# Imports all data files and team images
npm run mongo:import
```
###### Indexing Mongo collections
Use this command to add indexes: 

````bash
# Creates indexes
npm run mongo:create:indexes
````

You'll need `Linux` to run the previous scripts. If you need to do this in `Windows`, you can get any `Linux` distribution at the `Windows Store` (e.g. `Ubuntu`).

### 4 - Build

```bash
# Build the server and app
npm run dev
```

### 5 - Start

```bash
# Start the server and app
npm run start
```

Go to [http://localhost:8080](http://localhost:8080)

# Development

```bash
# Build the server and app and watch for changes
npm run dev
```

Go to [http://localhost:8080](http://localhost:8080)

# Testing

```bash
# Run unit tests
npm run test

# Run unit tests and watch for changes
npm run test:watch

# Run end-to-end tests (requires build)
npm run test:e2e
```

# Deployment

## Commit changes

Before pushing code to the dev branch, we should follow these steps to make sure everything is running without errors.

```bash
# Clean everything
npm run clean

# Re-install dependencies
npm install

# Run unit tests
npm run test

# Build app and server
npm run build

# Run end-to-end tests
npm run test:e2e

# Go to localhost:8080 and verify the app is running without errors
npm run start
```

## Continuous Deployment

We have set up Travis to deploy Agora to our [AWS infrastructure](https://github.com/Sage-Bionetworks/agora2-infra).
We continuously deploy to three environments:

- Development -> https://agora-develop.adknowledgeportal.org/
- Staging -> https://agora-staging.adknowledgeportal.org/
- Production -> https://agora.adknowledgeportal.org/

## Deployment Workflow

To deploy Agora updates to one of the environments just merge code to the branch you would like
to deploy to then Travis will take care of building, testing and deploying the Agora
application.

## Deployment configurations

Elastic beanstalk uses files in the
[.ebextensions folder](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/customize-containers-ec2.html)
to configure the environment that the Agora application runs in.
The .ebextensions files are packaged up with Agora and deployed to beanstalk
by the CI system.

## Deployment Builds

- https://app.travis-ci.com/github/Sage-Bionetworks/Agora

## Deployment for New Data (Updated 1/31/23)

1. Ensure the new data files are available in the [Synapse Agora Live Data folder](https://www.synapse.org/#!Synapse:syn12177492).
2. Determine the version number of the `data_manifest.csv` file to use for the data release:
   1. The manifest must specify the appropriate version of each json file for the data release 
   2. If a suitable `data_manifest.csv` does not exist, you can manually generate one and upload it to [Synapse](https://www.synapse.org/#!Synapse:syn13363290)
3. Update data version in `data-manifest.json` in [Agora Data Manager](https://github.com/Sage-Bionetworks/agora-data-manager/). ([example](https://github.com/Sage-Bionetworks/agora-data-manager/commit/d9006f01ae01b6c896bdc075e02ae1b683ecfd65)):
   1. The version should match the version of the desired `data_manifest.csv` file in [Synapse](https://www.synapse.org/#!Synapse:syn13363290). Note that the manifest references itself internally, but the version in that internal reference is always off by one. Use the manifest version surfaced via the Synapse UI, not the one in the manifest.
4. If there is a new json file (i.e. not updating existing data):
   1. add an entry for the new file to agora-data-manager's `import-data.sh` script. ([example](https://github.com/Sage-Bionetworks/agora-data-manager/pull/66/files))
   2. add an entry for the new collection to agora-data-manager's `create-indexes.sh` script ([example](https://github.com/Sage-Bionetworks/agora-data-manager/pull/60/files))
   3. add an entry for the new file to `./scripts/mongo-import.sh` in Agora (this repository)
   4. add an entry for the new collection to `./scripts/mongo-create-indexes.js` (this repository)
5. Merge your changes to [Agora Data Manager](https://github.com/Sage-Bionetworks/agora-data-manager/) to the develop branch.
6. Verify new data is in the database in the develop environment; see [Agora environments](https://sagebionetworks.jira.com/wiki/spaces/AGORA/pages/2632745039/Agora+environments) for information about connecting to our AWS DocumentDB instances
7. Update `data-version` in `package.json` in Agora (this repository). ([example](https://github.com/Sage-Bionetworks/Agora/pull/847/files)) The version should match the `data_manifest.csv` file in [Synapse](https://www.synapse.org/#!Synapse:syn13363290). Then merge the change to [Agora's develoc branch](https://agora-develop.adknowledgeportal.org/genes).
8. Check new data shows up on [Agora's dev branch](https://agora-develop.adknowledgeportal.org).
9. Check new data version shows up in the footer  on [Agora's dev branch](https://agora-develop.adknowledgeportal.org).
10. Once verified in the develop environment, you can promote the data release to staging by:
    1. Merging the [Agora Data Manager](https://github.com/Sage-Bionetworks/agora-data-manager/) develop branch to the staging branch
    2. Verifying the new data is in the staging environment's database
    3. Merging the Agora develop branch to staging
    4. Verifying the new data and data version in the staging environment
11. To promote to production, repeat step 10 but merge the staging branches to the prod branches

## New Data Testing

1. New or updated data is usually in `json` format. Make sure you have MongoDB installed locally as described in "**Running the app**" section. Then you can import your json file to your local MongoDB database by running:

```
mongoimport --db agora --collection [add collection name here] --jsonArray --drop --file [path to the json file name]
```

More examples can be found [here](https://github.com/Sage-Bionetworks/Agora/blob/develop/mongo-import.sh).

2. Verified the data is successfully imported to the database. You may do that by using a GUI for MongoDB. The connection address to MongoDB in your local machine is `localhost` and the port number is `27017`.

# Style Guide and Project Structure

This project follows the directions provided by the official [angular style guide](https://angular.io/guide/styleguide). Things that the guide state to keep in mind:

- Define components or services that do one thing only, per file. Try to use small sized functions where possible, making it reusable.

- Keep the consistency in file and folder names. Use dashes to separate words in the descriptive prefix name and dots to separate the suffix words. Use the type and extension names in the file name, e.g. `a.component.ts`, `a.service.ts` or `a.module.ts`. The style guide has references about naming the other types of files in an Angular project.

- Use camel case for variable names, even for constants as they are easy to read. If the values don't change, use a const declaration. For Interfaces use an upper camel case, e.g. `MyInterface`.

- The guide advises separating application from third party imports. This projects goes one step further separating imports by source and purpose also, grouping Angular framework, project components and services, third party typescript/javascript libraries separately.

- The folder structure in not restrictive in the style guide, but it should be structured in a way so it is to maintain and expand the project, and identify files in a glance. This project uses a root folder called `src` and one main folder for each module. When a spacific folder reaches seven or more files it is split into sub-folders. Another reason to split is to keep a view smart component with container dumb components as children.

- For the file structure this project uses the component approach. This is the new standard for developing Angular apps and a great way to ensure maintainable code by encapsulation of our behavior logic. A component is basically a self contained app usually in a single file or a folder with each concern as a file: style, template, specs, e2e, and component class.

# External Stylesheets

Any stylesheets (Sass or CSS) placed in the `src/styles` directory and imported into your project will automatically be compiled into an external `.css` and embedded in your production builds.

For example to use Bootstrap as an external stylesheet:

1. Create a `styles.scss` file (name doesn't matter) in the `src/styles` directory.
2. `npm install` the version of Boostrap you want.
3. In `styles.scss` add `@import 'bootstrap/scss/bootstrap.scss';`
4. In `src/app/core/core.module.ts` add underneath the other import statements: `import '../styles/styles.scss';`

Since we are using PrimeNG, style rules might not be applied to nested Angular children components. There are two ways to solve this issue enforce style scoping:

- Special Selectors

You can keep the Shadow DOM (emulated browser encapsulation) and still apply rules from third party libraries to nested children with this approach. This is the recommended way, but it is harder to implement in certain scenarios.

```bash
:host /deep/ .ui-paginator-bottom {
    display: none;
}
```

- Disable View Encapsulation

This is the easiest way to apply nested style rules, just go to the component and turn off the encapsulation. This way the rules are passed from parent to children without problems, but any rule created in one component affects the other components. This project uses this approach, so be aware to create style classes with using names related to the current component only.

```bash
...
import { ..., ViewEncapsulation } from '@angular/core';

@Component {
...
encapsulation: ViewEncapsulation.None,
}
```

# AoT Don'ts

The following are some things that will make AoT compile fail.

- Don’t use require statements for your templates or styles, use styleUrls and templateUrls, the angular2-template-loader plugin will change it to require at build time.
- Don’t use default exports.
- Don’t use `form.controls.controlName`, use `form.get(‘controlName’)`
- Don’t use `control.errors?.someError`, use `control.hasError(‘someError’)`
- Don’t use functions in your providers, routes or declarations, export a function and then reference that function name
- @Inputs, @Outputs, View or Content Child(ren), Hostbindings, and any field you use from the template or annotate for Angular should be public

# Configuration

Configuration files live in `config/` we are currently using webpack, karma, for different stages of your application

# License

[MIT](/LICENSE)
