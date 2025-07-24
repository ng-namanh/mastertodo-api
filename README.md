# Todo List API with Authentication

A Koa.js TypeScript backend application for a collaborative todo list with user authentication using PostgreSQL and Prisma ORM.

## Features

- 🔐 **User Authentication**: Register, login, and logout functionality
- 📝 **Todo Management**: Create, read, update, and delete todos
- 👥 **Collaborative**: Users can see todos from other users
- 🔒 **Secure**: JWT-based authentication with password hashing
- 🗄️ **Database**: PostgreSQL with Prisma ORM for data persistence
- 🚀 **TypeScript**: Full TypeScript support with type safety

## API Endpoints

### Authentication
- `POST /register` - Register a new user
- `POST /login` - Login user
- `POST /logout` - Logout user

### Todos
- `GET /todos` - Get all todos (with user information)
- `GET /my-todos` - Get current user's todos
- `GET /todos/:id` - Get specific todo by ID
- `POST /todos` - Create new todo
- `PUT /todos/:id` - Update todo
- `DELETE /todos/:id` - Delete todo

### Health Check
- `GET /health` - Health check endpoint
- `GET /` - API documentation

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Bun package manager
- PostgreSQL database

### Installation

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your PostgreSQL configuration:
   ```env
   PORT=3000
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   SESSION_SECRET=your-super-secret-session-key-change-this-in-production
   DATABASE_URL="postgresql://username:password@localhost:5432/todo_db?schema=public"
   ```

3. **Set up the database:**
   ```bash
   # Generate Prisma client
   bun run db:generate
   
   # Push schema to database (creates tables)
   bun run db:push
   
   # Or use migrations (recommended for production)
   bun run db:migrate
   ```

4. **Run the development server:**
   ```bash
   bun run dev
   ```

5. **Build for production:**
   ```bash
   bun run build
   bun start
   ```

## Database Setup

### Using Docker (Recommended)
```bash
# Start PostgreSQL with Docker
docker run --name todo-postgres \
  -e POSTGRES_DB=todo_db \
  -e POSTGRES_USER=todo_user \
  -e POSTGRES_PASSWORD=todo_password \
  -p 5432:5432 \
  -d postgres:15

# Update your .env file
DATABASE_URL="postgresql://todo_user:todo_password@localhost:5432/todo_db?schema=public"
```

### Using Local PostgreSQL
1. Install PostgreSQL on your system
2. Create a database: `createdb todo_db`
3. Update the `DATABASE_URL` in your `.env` file

## API Usage Examples

### Register a new user
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create a todo (with authentication)
```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, bread, eggs"
  }'
```

### Get all todos
```bash
curl -X GET http://localhost:3000/todos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update a todo
```bash
curl -X PUT http://localhost:3000/todos/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, bread, eggs, butter",
    "completed": true
  }'
```

### Delete a todo
```bash
curl -X DELETE http://localhost:3000/todos/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Database Schema

The database schema is defined in `prisma/schema.prisma`:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique
  password  String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  todos     Todo[]

  @@map("users")
}

model Todo {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  completed   Boolean  @default(false)
  userId      Int      @map("user_id")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("todos")
}
```

## Prisma Commands

- `bun run db:generate` - Generate Prisma client
- `bun run db:push` - Push schema changes to database
- `bun run db:migrate` - Create and apply migrations
- `bun run db:studio` - Open Prisma Studio (database GUI)

## Security Features

- **Password Hashing**: Passwords are hashed using bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: All inputs are validated and sanitized
- **Authorization**: Users can only modify their own todos
- **CORS**: Configured for cross-origin requests
- **Error Handling**: Comprehensive error handling and logging

## Development

### Project Structure
```
src/
├── index.ts          # Main application entry point
├── types/            # TypeScript type definitions
│   └── index.ts
├── services/         # Business logic services
│   ├── auth.ts       # Authentication service
│   └── database.ts   # Database service (Prisma)
├── middleware/       # Koa middleware
│   └── auth.ts       # Authentication middleware
└── routes/           # API routes
    ├── auth.ts       # Authentication routes
    └── todos.ts      # Todo routes
prisma/
└── schema.prisma     # Database schema
```

### Available Scripts
- `bun run dev` - Start development server with hot reload
- `bun run build` - Build TypeScript to JavaScript
- `bun run start` - Start production server
- `bun run test` - Run tests
- `bun run db:generate` - Generate Prisma client
- `bun run db:push` - Push schema to database
- `bun run db:migrate` - Run database migrations
- `bun run db:studio` - Open Prisma Studio

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `JWT_SECRET` | JWT signing secret | `default-secret-key` |
| `SESSION_SECRET` | Session secret | `default-session-key` |
| `DATABASE_URL` | PostgreSQL connection string | Required |

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License 