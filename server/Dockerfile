FROM node:18-alpine
RUN apk add npm
COPY . .
RUN npm install 
EXPOSE 4000
CMD ["npm", "run", "start"]