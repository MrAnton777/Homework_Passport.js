FROM node:20.16

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY *.js ./
COPY middleware/ ./middleware
COPY routes/ ./routes
COPY view/ ./view
COPY models/ ./models

CMD ["npm","run","start"]