FROM keymetrics/pm2:latest-alpine

LABEL version="1.0"
LABEL maintainer = "Daniel Föhr (daniel.foehr@sap.com)"

RUN mkdir -p /usr/src/githubBot
WORKDIR /usr/src/githubBot

COPY ["package.json", "./"]
COPY ["pm2.json", "./"]

ENV NPM_CONFIG_LOGLEVEL warn

RUN cd /usr/src/githubBot && npm install --production

COPY . .

EXPOSE 8080

CMD [ "pm2-runtime", "start", "pm2.json" ]