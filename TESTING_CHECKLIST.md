# Skill Swap Platform - Feature Testing Checklist

## 🚀 Getting Started
- ✅ Backend Server: http://localhost:5000
- ✅ Frontend App: http://localhost:3000
- ✅ Health Check: http://localhost:5000/api/health

## 🔐 Authentication Features

### Registration
- [ ] Navigate to http://localhost:3000/register
- [ ] Test user registration with:
  - Name: Your Name
  - Email: test@example.com
  - Password: password123
- [ ] Verify successful registration redirects to dashboard
- [ ] Test validation errors (invalid email, short password, etc.)

### Login
- [ ] Navigate to http://localhost:3000/login
- [ ] Test login with existing users:
  - Email: john@example.com, Password: password123
  - Email: jane@example.com, Password: password123  
  - Email: alice@example.com, Password: password123
- [ ] Test invalid credentials error handling
- [ ] Verify successful login redirects to dashboard

### Logout
- [ ] Test logout functionality from navbar
- [ ] Verify redirection to home page after logout

## 📊 Dashboard Features
- [ ] Navigate to http://localhost:3000/dashboard
- [ ] View user profile information (name, email, location, rating)
- [ ] Check skills offered section
- [ ] Check skills wanted section
- [ ] Test "Add Skill" buttons (should navigate to profile)
- [ ] Test quick action buttons:
  - Browse Skills
  - Update Profile
  - Manage Swaps

## 👤 Profile Management
- [ ] Navigate to http://localhost:3000/profile
- [ ] View and edit user profile information
- [ ] Add/remove skills offered
- [ ] Add/remove skills wanted
- [ ] Update bio and location
- [ ] Test profile photo upload (if implemented)

## 🔍 Browse Skills
- [ ] Navigate to http://localhost:3000/browse
- [ ] View list of available skills from other users
- [ ] Test search functionality
- [ ] Filter by skill level or category
- [ ] View other users' profiles
- [ ] Initiate skill swap requests

## 🔄 Swap Management
- [ ] Navigate to http://localhost:3000/swap-requests
- [ ] View incoming swap requests
- [ ] View outgoing swap requests
- [ ] Accept/decline swap requests
- [ ] Track swap status (pending, accepted, completed, cancelled)
- [ ] Complete swaps and leave feedback

## 🛡️ Admin Panel (for admin users)
- [ ] Login as admin (jane@example.com)
- [ ] Navigate to admin panel
- [ ] View user management
- [ ] View swap management
- [ ] Test user ban/unban functionality
- [ ] Generate reports

## 🌐 API Endpoints Testing

### Authentication Endpoints
- [ ] POST /api/auth/register
- [ ] POST /api/auth/login
- [ ] GET /api/auth/me
- [ ] POST /api/auth/refresh

### User Endpoints
- [ ] GET /api/users (browse users)
- [ ] GET /api/users/:id (view specific user)
- [ ] PUT /api/users/profile (update profile)
- [ ] GET /api/users/search/skills (search by skills)

### Skills Endpoints
- [ ] GET /api/skills/suggestions
- [ ] GET /api/skills/popular
- [ ] GET /api/skills/stats

### Swap Endpoints
- [ ] POST /api/swaps (create swap request)
- [ ] GET /api/swaps/my-swaps (get user's swaps)
- [ ] PUT /api/swaps/:id/status (update swap status)
- [ ] POST /api/swaps/:id/feedback (submit feedback)

## 📱 UI/UX Testing
- [ ] Test responsive design on different screen sizes
- [ ] Verify Material-UI components render correctly
- [ ] Test navigation between pages
- [ ] Check loading states and error messages
- [ ] Verify form validation and feedback

## 🐛 Error Handling
- [ ] Test network error scenarios
- [ ] Test invalid API responses
- [ ] Test unauthorized access attempts
- [ ] Verify proper error messages display

## 💾 Data Persistence
- [ ] Create new user and verify data saves to JSON file
- [ ] Update user profile and verify changes persist
- [ ] Create swap requests and verify they're stored
- [ ] Check that data persists after server restart

## Test Users Available:
1. **John Doe** - john@example.com (password123)
   - Skills: JavaScript (Advanced), Python (Intermediate)
   - Wants: Machine Learning (Beginner)

2. **Jane Smith** - jane@example.com (password123) - ADMIN
   - Skills: UI/UX Design (Expert), Product Management (Advanced)
   - Wants: React Native (Intermediate)

3. **Alice Johnson** - alice@example.com (password123)
   - Skills: Data Science (Expert), Statistics (Advanced)
   - Wants: Cloud Computing (Intermediate), DevOps (Beginner)

## 🔧 Development Tools
- [ ] Check browser developer console for errors
- [ ] Monitor network requests in browser DevTools
- [ ] Check backend server logs for debugging
- [ ] Verify database files update correctly

---

## 🚨 Common Issues to Watch For:
- CORS errors between frontend and backend
- Authentication token issues
- File permission errors for JSON database
- Port conflicts (make sure 3000 and 5000 are available)
- Missing dependencies or build errors

Happy testing! 🎉
