# Equipment Rental Backend

This is the Node.js/Express backend for the Equipment Rental Platform (Quipli Clone).

## Features

- User authentication with JWT
- Equipment management (CRUD operations)
- Booking system with status management
- Review and rating system
- User profile management
- Search and filtering capabilities
- Deposit handling

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Uploads**: Multer

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Setup Steps

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the backend directory:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/equipment-rental
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   JWT_EXPIRES_IN=7d
   NODE_ENV=development
   STRIPE_SECRET_KEY=sk_test_your_stripe_key_here
   ```

4. **Start MongoDB**
   ```bash
   mongod
   ```

5. **Run the server**
   ```bash
   # Development with auto-reload
   npm run dev

   # Production
   npm start
   ```

The server will run at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)

### Equipment
- `GET /api/equipment` - Get all equipment (with filters)
- `GET /api/equipment/:id` - Get equipment details
- `POST /api/equipment` - Create new equipment (requires auth)
- `PUT /api/equipment/:id` - Update equipment (requires auth)
- `DELETE /api/equipment/:id` - Delete equipment (requires auth)

### Bookings
- `POST /api/bookings` - Create booking (requires auth)
- `GET /api/bookings` - Get user's bookings (requires auth)
- `PUT /api/bookings/:id/status` - Update booking status (requires auth)
- `PUT /api/bookings/:id/cancel` - Cancel booking (requires auth)

### Reviews
- `POST /api/reviews` - Create review (requires auth)
- `GET /api/reviews/equipment/:equipmentId` - Get equipment reviews
- `GET /api/reviews/user/:userId` - Get user reviews

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile/update` - Update profile (requires auth)
- `POST /api/users/save-equipment` - Save equipment (requires auth)
- `GET /api/users/saved-equipment/list` - Get saved equipment (requires auth)

## Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  profileImage: String,
  address: Object,
  role: 'user' | 'owner' | 'admin',
  rating: Number,
  totalReviews: Number,
  savedEquipment: [ObjectId]
}
```

### Equipment
```javascript
{
  title: String,
  description: String,
  category: String,
  pricePerDay: Number,
  pricePerWeek: Number,
  pricePerMonth: Number,
  images: [String],
  owner: ObjectId (User),
  location: Object,
  rating: Number,
  totalReviews: Number,
  views: Number
}
```

### Booking
```javascript
{
  equipment: ObjectId,
  renter: ObjectId (User),
  owner: ObjectId (User),
  startDate: Date,
  endDate: Date,
  totalDays: Number,
  totalPrice: Number,
  status: 'pending' | 'approved' | 'ongoing' | 'completed' | 'cancelled'
}
```

### Review
```javascript
{
  equipment: ObjectId,
  renter: ObjectId,
  owner: ObjectId,
  rating: Number (1-5),
  comment: String,
  type: 'equipment' | 'owner' | 'renter'
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_token_here>
```

## Error Handling

All API errors follow this format:
```json
{
  "error": "Error message describing what went wrong"
}
```

## Development

### Project Structure
```
backend/
├── models/          # MongoDB schemas
├── routes/          # API routes
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── server.js        # Entry point
├── .env            # Environment variables
└── package.json    # Dependencies
```

### Key Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment variable management

## Security Considerations

1. Change JWT_SECRET in production
2. Use HTTPS in production
3. Implement rate limiting
4. Validate all inputs
5. Use environment variables for sensitive data
6. Implement proper CORS settings

## Future Enhancements

- Payment integration (Stripe)
- Email notifications
- Real-time messaging
- Advanced search with Elasticsearch
- Image upload to cloud storage
- Analytics dashboard
- Admin panel for moderation

## Support

For issues or questions, please refer to the main README.md in the project root.
