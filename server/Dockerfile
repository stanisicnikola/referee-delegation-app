FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Ensure upload directories exist for multer destinations
RUN mkdir -p uploads/teams uploads/avatars

EXPOSE 8000

CMD ["node", "index.js"]
