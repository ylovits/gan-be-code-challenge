FROM node:18-slim

RUN apt-get update && apt-get install -y git
RUN git clone https://github.com/gandevops/backend-code-challenge.git
WORKDIR /backend-code-challenge
RUN npm i