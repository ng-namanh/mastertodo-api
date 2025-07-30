import swaggerJSDoc from 'swagger-jsdoc';

const getServers = () => {
  const servers = [];

  if (process.env.SERVER_URL) {
    servers.push({
      url: process.env.SERVER_URL,
      description: 'Production server'
    });
  }

  servers.push({
    url: 'http://localhost:3000',
    description: 'Development server'
  });

  return servers;
};

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
    servers: getServers(),
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
            dueDate: {
              type: 'string',
              format: 'date-time',
              description: 'Due date for the todo'
            },
            reminderDate: {
              type: 'string',
              format: 'date-time',
              description: 'Reminder date for the todo'
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
              description: 'Todo status'
            },
            priority: {
              type: 'string',
              enum: ['HIGH', 'MEDIUM', 'LOW'],
              description: 'Todo priority'
            },
            starred: {
              type: 'boolean',
              description: 'Whether the todo is starred'
            },
            creatorId: {
              type: 'integer',
              description: 'User ID who created this todo'
            },
            creator: {
              $ref: '#/components/schemas/User'
            },
            assignedTo: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/User'
              },
              description: 'Users assigned to this todo'
            },
            subtasks: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Subtask'
              },
              description: 'Subtasks for this todo'
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
            }
          }
        },
        Subtask: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Subtask ID'
            },
            title: {
              type: 'string',
              description: 'Subtask title'
            },
            completed: {
              type: 'boolean',
              description: 'Subtask completion status'
            },
            todoId: {
              type: 'integer',
              description: 'Todo ID this subtask belongs to'
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
          required: ['title', 'dueDate'],
          properties: {
            title: {
              type: 'string',
              description: 'Todo title'
            },
            description: {
              type: 'string',
              description: 'Todo description'
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              description: 'Due date for the todo'
            },
            reminderDate: {
              type: 'string',
              format: 'date-time',
              description: 'Reminder date for the todo'
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
              description: 'Todo status',
              default: 'PENDING'
            },
            priority: {
              type: 'string',
              enum: ['HIGH', 'MEDIUM', 'LOW'],
              description: 'Todo priority',
              default: 'MEDIUM'
            },
            starred: {
              type: 'boolean',
              description: 'Whether the todo is starred',
              default: false
            },
            assignedTo: {
              type: 'array',
              items: {
                type: 'integer'
              },
              description: 'Array of user IDs to assign this todo to'
            },
            subtasks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: {
                    type: 'string',
                    description: 'Subtask title'
                  },
                  completed: {
                    type: 'boolean',
                    description: 'Subtask completion status',
                    default: false
                  }
                },
                required: ['title']
              },
              description: 'Subtasks for this todo'
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
            dueDate: {
              type: 'string',
              format: 'date-time',
              description: 'Due date for the todo'
            },
            reminderDate: {
              type: 'string',
              format: 'date-time',
              description: 'Reminder date for the todo'
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
              description: 'Todo status'
            },
            priority: {
              type: 'string',
              enum: ['HIGH', 'MEDIUM', 'LOW'],
              description: 'Todo priority'
            },
            starred: {
              type: 'boolean',
              description: 'Whether the todo is starred'
            },
            assignedTo: {
              type: 'array',
              items: {
                type: 'integer'
              },
              description: 'Array of user IDs to assign this todo to'
            },
            subtasks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'integer',
                    description: 'Subtask ID (for updating existing subtasks)'
                  },
                  title: {
                    type: 'string',
                    description: 'Subtask title'
                  },
                  completed: {
                    type: 'boolean',
                    description: 'Subtask completion status'
                  }
                },
                required: ['title']
              },
              description: 'Subtasks for this todo'
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
            },
            filters: {
              type: 'object',
              description: 'Applied filters (for debugging)',
              properties: {
                status: {
                  type: 'array',
                  items: {
                    type: 'string'
                  }
                },
                assignedTo: {
                  type: 'array',
                  items: {
                    type: 'integer'
                  }
                },
                starred: {
                  type: 'boolean'
                },
                priority: {
                  type: 'array',
                  items: {
                    type: 'string'
                  }
                }
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