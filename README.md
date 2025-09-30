# NHD API Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/atlas)

> Backend API server for North Head Digital's client portal system with authentication, user management, and project tracking.

## 🚀 Features

- **🔐 JWT Authentication** - Secure user authentication with JSON Web Tokens
- **👥 User Management** - Role-based access control (Admin/Client)
- **📊 Project Tracking** - Client project management and status updates
- **💬 Messaging System** - Internal communication between clients and team
- **🗄️ MongoDB Integration** - Cloud-based database with Mongoose ODM
- **🛡️ CORS Protection** - Multi-origin support for development and production
- **📝 RESTful API** - Clean, standardized API endpoints

## 📋 Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **MongoDB Atlas** account (or local MongoDB instance)
- **Environment variables** configured

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/North-Head-Digital/nhd-api.git
cd nhd-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://ADMIN:Password123@nhd-portal.6o9g1b7.mongodb.net/nhd-portal?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3001
```

**⚠️ Security Note:** Replace the JWT secret with a strong, unique key in production.

### 4. Seed the Database

```bash
npm run seed
```

This will create test users:
- **Admin:** `admin@northheaddigital.com` / `password123`
- **Clients:** Multiple test client accounts

### 5. Start the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/auth/register` | User registration |
| `GET` | `/api/auth/me` | Get current user |

### User Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/users` | Get all users | Admin |
| `GET` | `/api/users/:id` | Get user by ID | Admin |
| `PUT` | `/api/users/:id` | Update user | Admin |
| `DELETE` | `/api/users/:id` | Delete user | Admin |

### Project Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/projects` | Get all projects | Yes |
| `POST` | `/api/projects` | Create project | Admin |
| `PUT` | `/api/projects/:id` | Update project | Admin |
| `DELETE` | `/api/projects/:id` | Delete project | Admin |

### Messaging System

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/messages` | Get messages | Yes |
| `POST` | `/api/messages` | Send message | Yes |
| `PUT` | `/api/messages/:id` | Update message | Yes |
| `DELETE` | `/api/messages/:id` | Delete message | Yes |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | API health status |

## 🔧 Development

### Project Structure

```
nhd-api/
├── config.js              # Database configuration
├── server.js              # Main server file
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── models/
│   ├── User.js            # User model
│   ├── Project.js         # Project model
│   └── Message.js         # Message model
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── users.js           # User management routes
│   ├── projects.js        # Project routes
│   └── messages.js        # Message routes
├── seed-data.js           # Database seeding
└── package.json           # Dependencies and scripts
```

### Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run seed       # Seed database with test data
npm test           # Run tests (when implemented)
```

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `5000` | No |
| `NODE_ENV` | Environment mode | `development` | No |
| `MONGODB_URI` | MongoDB connection string | - | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | - | No |

## 🛡️ Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt password encryption
- **CORS Protection** - Configurable cross-origin requests
- **Input Validation** - Request data sanitization
- **Rate Limiting** - API request throttling (recommended)

## 🚀 Deployment

### Production Environment

1. **Set Environment Variables:**
   ```env
   NODE_ENV=production
   MONGODB_URI=your-production-mongodb-uri
   JWT_SECRET=your-production-jwt-secret
   FRONTEND_URL=https://your-domain.com
   ```

2. **Install Dependencies:**
   ```bash
   npm ci --only=production
   ```

3. **Start the Server:**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email hello@northheaddigital.com or visit our [website](https://northheaddigital.com).

---

**North Head Digital** - Transforming complex AI technology into simple, powerful business solutions.
