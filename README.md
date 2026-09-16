# Equipment Rental Platform Setup Guide

Complete setup guide for the Equipment Rental Platform (Quipli Clone) - A full-stack MERN application.

## Project Overview

This is a modern equipment rental marketplace platform similar to Quipli, built with:
- **Frontend**: React 18 + Redux + Vite
- **Backend**: Node.js + Express.js + MongoDB
- **Database**: MongoDB

## Quick Start

### 1. Clone and Navigate

```bash
# Navigate to the project directory
cd dominodahsboard
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure .env file (already created with defaults)
# Edit .env with your MongoDB URI and other settings

# Start MongoDB
mongod  # Run in a separate terminal

# Start the backend server
npm run dev
```

Backend will run at: `http://localhost:5000`

### 3. Frontend Setup

In a new terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run at: `http://localhost:3000`

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
├─────────────────────────────────────────────────────────┤
│  React App (Components, Pages, Redux Store)             │
│  ├── Home Page (Browse Equipment)                       │
│  ├── Equipment Detail (Booking)                         │
│  ├── User Authentication (Login/Register)              │
│  ├── Profile Management                                │
│  ├── Booking Management                                │
│  └── Admin Dashboard                                   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST API
┌────────────────────▼────────────────────────────────────┐
│              Backend (Express.js Server)                │
├─────────────────────────────────────────────────────────┤
│  Routes:                                               │
│  ├── /api/auth (Authentication)                       │
│  ├── /api/equipment (Equipment CRUD)                  │
│  ├── /api/bookings (Booking Management)              │
│  ├── /api/reviews (Review System)                    │
│  └── /api/users (User Management)                    │
└────────────────────┬────────────────────────────────────┘
                     │ MongoDB Driver
┌────────────────────▼────────────────────────────────────┐
│              MongoDB Database                           │
├─────────────────────────────────────────────────────────┤
│  Collections:                                          │
│  ├── users (User profiles and auth)                   │
│  ├── equipment (Equipment listings)                   │
│  ├── bookings (Booking records)                       │
│  └── reviews (Review and ratings)                    │
└─────────────────────────────────────────────────────────┘
```

## Core Features

### 1. Equipment Discovery
- Browse all available equipment
- Advanced search and filtering
- Sort by price, rating, location
- View detailed equipment information
- Check equipment owner reviews

### 2. User Management
- User registration and authentication
- Two account types: Renter and Owner
- Profile management
- Rating and review system
- Saved/wishlist functionality

### 3. Booking System
- Create equipment bookings
- View booking status (pending, approved, ongoing, completed)
- Cancel bookings with reasons
- Booking history
- Price calculation

### 4. Review & Rating
- Leave reviews on equipment
- Leave reviews on users (owners/renters)
- Upload review images
- Rating system (1-5 stars)
- Helpful votes

### 5. Admin Dashboard
- View all bookings across platform
- Approve/manage bookings
- Platform statistics
- Revenue tracking

## Default Test Credentials

Create a test account:
- **Email**: test@example.com
- **Password**: password123
- **Role**: Choose Renter or Owner

## File Structure

```
dominodahsboard/
├── backend/
│   ├── models/
│   │   ├── User.js         (User schema)
│   │   ├── Equipment.js    (Equipment schema)
│   │   ├── Booking.js      (Booking schema)
│   │   └── Review.js       (Review schema)
│   ├── routes/
│   │   ├── auth.js         (Auth endpoints)
│   │   ├── equipment.js    (Equipment endpoints)
│   │   ├── bookings.js     (Booking endpoints)
│   │   ├── reviews.js      (Review endpoints)
│   │   └── users.js        (User endpoints)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── equipmentController.js
│   │   ├── bookingController.js
│   │   ├── reviewController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js         (JWT authentication)
│   ├── server.js           (Express app setup)
│   ├── .env               (Env variables)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/    (Reusable components)
│   │   │   ├── Navbar.jsx
│   │   │   ├── EquipmentCard.jsx
│   │   │   └── ReviewCard.jsx
│   │   ├── pages/         (Page components)
│   │   │   ├── Home.jsx
│   │   │   ├── Browse.jsx
│   │   │   ├── EquipmentDetail.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   ├── ListEquipment.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── store/         (Redux store)
│   │   │   ├── reducers/
│   │   │   └── index.js
│   │   ├── services/      (API calls)
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles/
│   ├── public/
│   ├── vite.config.js
│   └── package.json
│
└── .github/
    └── copilot-instructions.md
```

## API Documentation

### Authentication Endpoints

```
POST   /api/auth/register       Register new user
POST   /api/auth/login          Login user
GET    /api/auth/profile        Get current user profile
```

### Equipment Endpoints

```
GET    /api/equipment           Get all equipment (with filters)
GET    /api/equipment/:id       Get equipment by ID
POST   /api/equipment           Create new equipment
PUT    /api/equipment/:id       Update equipment
DELETE /api/equipment/:id       Delete equipment
```

### Booking Endpoints

```
POST   /api/bookings            Create new booking
GET    /api/bookings            Get user's bookings
PUT    /api/bookings/:id/status Update booking status
PUT    /api/bookings/:id/cancel Cancel booking
```

### Review Endpoints

```
POST   /api/reviews             Create review
GET    /api/reviews/equipment/:equipmentId   Get equipment reviews
GET    /api/reviews/user/:userId             Get user reviews
```

### User Endpoints

```
GET    /api/users/:id           Get user profile
PUT    /api/users/profile/update Update user profile
POST   /api/users/save-equipment Save equipment to wishlist
GET    /api/users/saved-equipment/list Get saved equipment
```

## Environment Configuration

### Backend .env
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/equipment-rental
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
STRIPE_SECRET_KEY=sk_test_your_stripe_key
```

### Frontend Configuration
- API Base URL: `http://localhost:5000/api`
- Configured inProxy in vite.config.js

## Database Schema Overview

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: "user" | "owner" | "admin",
  rating: Number,
  totalReviews: Number,
  address: Object,
  savedEquipment: [ObjectId],
  createdAt: Date
}
```

### Equipment Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,
  pricePerDay: Number,
  pricePerWeek: Number,
  pricePerMonth: Number,
  images: [String],
  owner: ObjectId (ref: User),
  location: Object,
  rating: Number,
  totalReviews: Number,
  views: Number,
  isActive: Boolean,
  createdAt: Date
}
```

### Bookings Collection
```javascript
{
  _id: ObjectId,
  equipment: ObjectId (ref: Equipment),
  renter: ObjectId (ref: User),
  owner: ObjectId (ref: User),
  startDate: Date,
  endDate: Date,
  totalDays: Number,
  totalPrice: Number,
  status: "pending" | "approved" | "ongoing" | "completed" | "cancelled",
  paymentStatus: "pending" | "completed" | "failed",
  depositAmount: Number,
  createdAt: Date
}
```

### Reviews Collection
```javascript
{
  _id: ObjectId,
  equipment: ObjectId (ref: Equipment),
  renter: ObjectId (ref: User),
  owner: ObjectId (ref: User),
  rating: Number (1-5),
  comment: String,
  type: "equipment" | "owner" | "renter",
  images: [String],
  createdAt: Date
}
```

## User Roles and Permissions

### Renter
- Browse equipment
- Book equipment
- Leave reviews
- Manage own bookings
- View booking history

### Owner
- List equipment
- Manage equipment listings
- Accept/reject bookings
- View booking requests
- Leave reviews on renters

### Admin
- View all bookings
- Approve bookings
- Manage users
- View platform statistics
- Monitor reviews and ratings

## Development Tips

### 1. Testing API Endpoints
Use tools like Postman or cURL:
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass123","role":"user"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass123"}'
```

### 2. Debugging Redux
Install Redux DevTools browser extension to debug state changes

### 3. Database Inspection
Use MongoDB Compass to visually inspect your database

### 4. Hot Reload
- Frontend: Changes auto-reload with Vite HMR
- Backend: Nodemon watches for changes and restarts

## Production Deployment

### Recommended Stack
1. Deploy the frontend to Netlify
2. Deploy the backend to Render
3. Use MongoDB Atlas for the production database

### Frontend on Netlify
This repo already includes [netlify.toml](/Users/yummesh/Documents/Github/Domino-Dashboard/netlify.toml) for the frontend build.

Use these Netlify settings:
1. Base directory: `frontend`
2. Build command: `npm run build`
3. Publish directory: `dist`

Set this Netlify environment variable:
```env
VITE_API_BASE_URL=https://your-render-service.onrender.com/api
```

### Backend on Render
This repo already includes [render.yaml](/Users/yummesh/Documents/Github/Domino-Dashboard/render.yaml) for the backend service.

Set these environment variables in Render:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
ALLOWED_ORIGINS=https://your-site.netlify.app,https://your-custom-domain.com
```

Generate a secure JWT secret locally with:
```bash
openssl rand -base64 48
```

or:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Use the generated value as `JWT_SECRET` in Render. Do not commit it to Git.

### Deployment Order
1. Deploy backend to Render first
2. Copy the Render backend URL
3. Add it to Netlify as `VITE_API_BASE_URL`
4. Deploy the frontend to Netlify
5. Set `ALLOWED_ORIGINS` in Render to your Netlify site URL

### Health Check
After backend deploy, verify:
```text
https://your-render-service.onrender.com/api/health
```

You should receive a JSON response showing the API is up.

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongoid

# If not installed, install MongoDB
# macOS: brew install mongodb-community
# Windows: Download from mongodb.com

# Start MongoDB
mongod
```

### API Connection Errors
- Check backend is running on port 5000
- Verify MongoDB connection string
- Check CORS configuration
- Clear browser cache

### Authentication Issues
- Clear localStorage in browser DevTools
- Verify JWT secret matches
- Check token expiration

### Frontend Build Errors
- Delete node_modules: `rm -rf node_modules`
- Reinstall: `npm install`
- Clear cache: `npm cache clean --force`

## Performance Optimization

### Frontend
- Lazy load components
- Implement image optimization
- Use React.memo for expensive components
- Optimize CSS and minimize CSS files

### Backend
- Add database indexing
- Implement caching (Redis)
- Optimize API queries
- Add pagination to list endpoints

## Security Best Practices

1. **Password Security**
   - Use bcrypt for hashing
   - Enforce strong password requirements

2. **API Security**
   - Validate all inputs
   - Sanitize database queries
   - Implement rate limiting
   - Use HTTPS in production

3. **Authentication**
   - Use secure JWT tokens
   - Implement token refresh mechanism
   - Add logout functionality

4. **Data Protection**
   - Never expose sensitive data
   - Use environment variables
   - Implement proper CORS
   - Add request validation

## Next Steps

1. **Complete MongoDB Setup** - Start MongoDB service
2. **Install Dependencies** - Run npm install in both directories
3. **Start Backend** - Run `npm run dev` in backend folder
4. **Start Frontend** - Run `npm run dev` in frontend folder
5. **Access Application** - Open http://localhost:3000
6. **Create Test Account** - Register and start exploring

## Support and Resources

- [React Documentation](https://react.dev)
- [Node.js Documentation](https://nodejs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Express.js Guide](https://expressjs.com)
- [Redux Documentation](https://redux.js.org)

## License

MIT License - Feel free to use this project for learning and development.

## Contributing

This is an educational project. Feel free to fork, modify, and improve!
