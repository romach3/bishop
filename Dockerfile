FROM node:18
WORKDIR /app
CMD ["yarn", "start"]
VOLUME ["/app"]
