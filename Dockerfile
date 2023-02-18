FROM node:18

RUN npm i -g rimraf

WORKDIR /app

# Задание команды по умолчанию
CMD ["yarn", "start"]

VOLUME ["/app"]

# Открытие порта приложения
EXPOSE 3000
