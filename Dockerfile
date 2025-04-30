FROM node:20.19.1-alpine
WORKDIR /usr/local/discordapp

# Copy the application dependencies
COPY src ./src
COPY package-lock.json ./package-lock.json
COPY package.json ./package.json
COPY tsconfig.json ./tsconfig.json

RUN apk add ffmpeg
RUN npm ci
RUN npm run build

CMD ["npm", "run", "start"]
