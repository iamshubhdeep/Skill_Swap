# SkillSwap Platform

A full-stack web application that enables users to exchange skills with each other. Users can create profiles, list their skills, browse others' skills, and request skill swaps.

## 🎉 Current Status - WORKING DEMO! 

**✅ LIVE FEATURES:**
- ✅ User authentication (register/login) with JSON file storage
- ✅ User profiles with skills management  
- ✅ Browse and search skills functionality
- ✅ Dashboard with user overview
- ✅ Skills API (suggestions, popular skills, stats)
- ✅ File-based database (no MongoDB setup required)

**🔧 TEST CREDENTIALS:**
- Email: `john@example.com` / Password: `password123`
- Email: `jane@example.com` / Password: `password123` (Admin)
- Email: `alice@example.com` / Password: `password123`

**🚀 QUICK START:**
1. `cd backend && npm install && npm run dev` (starts on port 5001)
2. `cd frontend && npm install && npm start` (opens http://localhost:3000)
3. Login with test credentials and explore!

---

## Features

### User Features
- **User Registration & Authentication**: Secure JWT-based authentication
- **Profile Management**: Create and update profiles with skills offered/wanted
- **Skill Discovery**: Browse and search for skills offered by other users
- **Swap Requests**: Send and manage skill swap requests
- **Rating System**: Rate and provide feedback after skill exchanges
- **Availability Scheduling**: Set availability preferences
- **Privacy Controls**: Make profiles public or private

### Admin Features
- **User Management**: View, ban/unban users
- **Swap Monitoring**: Monitor all swap requests and activities
- **Platform Messages**: Send platform-wide announcements
- **Reporting**: Generate user activity and swap statistics reports
- **Content Moderation**: Review and manage inappropriate content

## Technology Stack

### Frontend
- **React.js** with TypeScript
- **Material-UI (MUI)** for UI components
- **React Router** for navigation
- **Axios** for API calls
- **React Hook Form** for form management
- **React Toastify** for notifications

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Multer** for file uploads
- **Express Validator** for input validation
- **Helmet** for security headers
- **CORS** for cross-origin requests

## Project Structure

```
skill-swap-platform/
├── frontend/                 # React.js frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript interfaces
│   └── public/
├── backend/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   └── uploads/            # File uploads directory
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd skill-swap-platform
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   
   Create `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/skill-swap
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000
   ```

   Create `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

5. **Start MongoDB**
   Make sure MongoDB is running on your system.

6. **Start the Development Servers**
   
   Backend (from backend directory):
   ```bash
   npm run dev
   ```
   
   Frontend (from frontend directory):
   ```bash
   npm start
   ```

7. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Users
- `GET /api/users` - Get all public users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/profile/photo` - Upload profile photo
- `GET /api/users/:id/swaps` - Get user's swap history

### Swaps
- `POST /api/swaps` - Create swap request
- `GET /api/swaps/my-swaps` - Get user's swaps
- `GET /api/swaps/:id` - Get swap by ID
- `PUT /api/swaps/:id/status` - Update swap status
- `PUT /api/swaps/:id/complete` - Mark swap as completed
- `DELETE /api/swaps/:id` - Cancel swap request
- `POST /api/swaps/:id/feedback` - Submit feedback

### Skills
- `GET /api/skills/suggestions` - Get skill suggestions
- `GET /api/skills/popular` - Get popular skills
- `GET /api/skills/stats` - Get skill statistics

### Admin
- `GET /api/admin/dashboard` - Get admin dashboard stats
- `GET /api/admin/users` - Get all users (admin)
- `PUT /api/admin/users/:id/ban` - Ban/unban user
- `GET /api/admin/swaps` - Get all swaps (admin)
- `POST /api/admin/messages` - Create platform message
- `GET /api/admin/reports/:type` - Generate reports

## Default Admin User

To create an admin user, you can manually update a user in the database:

```javascript
// In MongoDB shell or through a database client
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { isAdmin: true } }
)
```

## Database Schema

### User Model
- Basic info (name, email, password)
- Location and profile photo
- Skills offered and wanted
- Availability preferences
- Privacy settings
- Rating information
- Admin status

### Swap Model
- Requester and receiver references
- Skills being exchanged
- Status (pending, accepted, rejected, completed, cancelled)
- Scheduling information
- Feedback and ratings
- Admin notes

### Message Model
- Platform-wide announcements
- Message types and priorities
- Target audience settings
- Read status tracking

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Build frontend
cd frontend
npm run build

# Start backend in production mode
cd backend
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@skillswap.com or join our Slack channel.

## Roadmap

- [ ] Real-time messaging system
- [ ] Video call integration
- [ ] Mobile app development
- [ ] Payment integration for premium features
- [ ] Advanced matching algorithms
- [ ] Group sessions & workshops
- [ ] Skill certification system
