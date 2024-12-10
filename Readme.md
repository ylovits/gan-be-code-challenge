## GAN Integrity Backend Code Challenge Solution

This is a small api tailored to the needs of the [GAN Integrity backend code challenge](https://github.com/gandevops/backend-code-challenge) script

**How to run the project**
Make sure you have [Docker](https://www.docker.com/) installed and running.

Then run `docker compose up` to start the project.

Or run `docker compose up --abort-on-container-failure` if you want the containers to be stopped after the challenge is done.

It might take a couple of minutes to populate the postgresql `addresses` table the first time. So please don't kill the process.

If there are any issues with the database being populated, try running `docker compose down -v` and then running `docker compose up` again, to delete any db data already written in postgres.

**Tests**
There are some tests that run as part of the building process

**Minimal version**
If you want to run a more minimal implementation, there is [this branch](https://github.com/ylovits/gan-be-code-challenge/tree/minimal) you can checkout to.