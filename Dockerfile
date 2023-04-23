FROM node:16

RUN apt-get update

WORKDIR /usr/src/app

COPY . .

RUN npm install --ignore-scripts
RUN npm run build
CMD [ "npm", "run", "dev" ]