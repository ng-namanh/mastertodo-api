# Sử dụng image Node.js chính thức
FROM node:22

# Thư mục làm việc
WORKDIR /app

# Copy file package và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

# Build TypeScript
RUN npm run build

# Tạo Prisma client
RUN npx prisma generate

# Mở cổng ứng dụng
EXPOSE 3000

# Chạy ứng dụng
CMD ["npm", "start"]