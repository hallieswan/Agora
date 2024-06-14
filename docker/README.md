# Agora Docker Image

Files in this directory:

- `Dockerfile`: creates the `agora-data` docker image, which contains data for a particular Agora data release (manifest synId + version) and team images and will seed a mongodb at start up using `import-data.sh`
- `docker-compose.yml`: spins up `mongo` and `agora-data` docker containers

## Workflow Setup

The following secrets and variables need to be set up in GitHub for the `e2e.yml` workflow to create the `agora/data` Docker image:

e2e Environment secrets:

| Variable           | Description                                | Example           |
| ------------------ | ------------------------------------------ | ----------------- |
| DB_USER            | The database user                          | dbuser            |
| DB_PASS            | The database password                      | supersecret       |
| SYNAPSE_AUTH_TOKEN | The Synapse service user view/download PAT | token-string-here |

e2e Environment variables:

| Variable       | Description                         | Example |
| -------------- | ----------------------------------- | ------- |
| DB_NAME        | The database name                   | agora   |
| DB_PORT        | The database port                   | 27017   |
| TEAM_IMAGES_ID | The synId of the team images folder | syn123  |
