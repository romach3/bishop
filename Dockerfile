FROM node:18

WORKDIR /app

# Задание команды по умолчанию
CMD ["yarn", "start"]

VOLUME ["/app"]

# Открытие порта приложения
EXPOSE 3000
