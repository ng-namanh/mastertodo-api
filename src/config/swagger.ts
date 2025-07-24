import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Todo API with Authentication',
      version: '1.0.0',
      description: 'A Koa.js TypeScript backend application for a collaborative todo list with user authentication using PostgreSQL and Prisma ORM.',
      contact: {
        name: 'API Support',
        email: 'support@todoapi.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID'
            },
            username: {
              type: 'string',
              description: 'Username'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation date'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'User last update date'
            }
          }
        },
        Todo: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Todo ID'
            },
            title: {
              type: 'string',
              description: 'Todo title'
            },
            description: {
              type: 'string',
              description: 'Todo description'
            },
            completed: {
              type: 'boolean',
              description: 'Todo completion status'
            },
            userId: {
              type: 'integer',
              description: 'User ID who owns this todo'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Todo creation date'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Todo last update date'
            },
            user: {
              type: 'object',
              properties: {
                username: {
                  type: 'string',
                  description: 'Username of the todo owner'
                }
              }
            }
          }
        },
        CreateUserRequest: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            username: {
              type: 'string',
              description: 'Username'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Password (minimum 6 characters)'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            password: {
              type: 'string',
              description: 'User password'
            }
          }
        },
        CreateTodoRequest: {
          type: 'object',
          required: ['title'],
          properties: {
            title: {
              type: 'string',
              description: 'Todo title'
            },
            description: {
              type: 'string',
              description: 'Todo description'
            }
          }
        },
        UpdateTodoRequest: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Todo title'
            },
            description: {
              type: 'string',
              description: 'Todo description'
            },
            completed: {
              type: 'boolean',
              description: 'Todo completion status'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Response message'
            },
            user: {
              $ref: '#/components/schemas/User'
            },
            token: {
              type: 'string',
              description: 'JWT token'
            }
          }
        },
        TodoResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Response message'
            },
            todo: {
              $ref: '#/components/schemas/Todo'
            }
          }
        },
        TodosResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Response message'
            },
            todos: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Todo'
              }
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/index.ts']
};

export const swaggerSpec = swaggerJSDoc(options); 