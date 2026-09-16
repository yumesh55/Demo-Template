# Equipment Rental Frontend

This is the React frontend for the Equipment Rental Platform (Quipli Clone).

## Features

- Browse and search equipment
- User authentication and profiles
- Equipment booking system
- Review and rating system
- Wishlist management (save equipment)
- Responsive design
- Real-time notifications
- Admin dashboard

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Redux + Redux Thunk
- **HTTP Client**: Axios
- **Styling**: CSS3

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running on `http://localhost:5000`

### Setup Steps

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

The application will run at `http://localhost:3000`

4. **Build for production**
   ```bash
   npm run build
   ```

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable React components
│   ├── pages/          # Page components
│   ├── store/          # Redux store and reducers
│   │   └── reducers/
│   ├── services/       # API service calls
│   ├── App.jsx         # Main application component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── public/             # Static assets
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
└── README.md
```

## Key Pages

### Public Pages
- **Home** (`/`) - Landing page with featured equipment
- **Browse** (`/browse`) - Equipment listing with filters
- **Equipment Detail** (`/equipment/:id`) - Individual equipment details
- **Login** (`/login`) - User login
- **Register** (`/register`) - User registration

### Protected Pages (Requires Authentication)
- **Profile** (`/profile`) - User profile and settings
- **My Bookings** (`/bookings`) - View and manage bookings
- **List Equipment** (`/list-equipment`) - List new equipment
- **Admin Dashboard** (`/admin`) - Admin panel for managing bookings

## Redux Store

### Auth Slice
```javascript
{
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null
}
```

### Equipment Slice
```javascript
{
  equipment: [],
  selectedEquipment: null,
  loading: false,
  error: null,
  filters: {},
  pagination: {}
}
```

### Booking Slice
```javascript
{
  bookings: [],
  loading: false,
  error: null
}
```

## API Integration

All API calls are centralized in `src/services/api.js`:

```javascript
// Authentication
authService.register(data)
authService.login(data)
authService.getProfile(token)

// Equipment
equipmentService.getAllEquipment(filters)
equipmentService.getEquipmentById(id)
equipmentService.createEquipment(data, token)
equipmentService.updateEquipment(id, data, token)
equipmentService.deleteEquipment(id, token)

// Bookings
bookingService.createBooking(data, token)
bookingService.getBookings(token)
bookingService.updateBookingStatus(id, status, token)
bookingService.cancelBooking(id, reason, token)

// Reviews
reviewService.createReview(data, token)
reviewService.getEquipmentReviews(equipmentId)
reviewService.getUserReviews(userId)

// Users
userService.getUserProfile(id)
userService.updateProfile(data, token)
userService.saveEquipment(equipmentId, token)
userService.getSavedEquipment(token)
```

## Component Structure

### Navbar
Navigation bar with authentication state, links to main pages

### EquipmentCard
Reusable card component for displaying equipment in grid/list

### ReviewCard
Component for displaying individual reviews with ratings and images

### Pages
- **Home**: Featured equipment showcase and platform features
- **Browse**: Searchable equipment listing with filters
- **EquipmentDetail**: Full equipment details with booking form and reviews
- **Login/Register**: Authentication pages
- **Profile**: User profile management
- **MyBookings**: User booking management
- **ListEquipment**: Form to list new equipment
- **AdminDashboard**: Admin booking management and statistics

## Styling

The project uses vanilla CSS with:
- CSS Grid for layouts
- Flexbox for components
- Media queries for responsiveness
- CSS transitions for animations

### Color Scheme
- Primary: `#007bff` (Blue)
- Accent: `#ff6b6b` (Red)
- Background: `#f5f5f5` (Light Gray)
- Text: `#333` (Dark Gray)

### Breakpoints
- Desktop: `> 768px`
- Tablet: `480px - 768px`
- Mobile: `< 480px`

## Development Workflow

1. **Component Development**
   ```bash
   npm run dev
   ```

2. **Build and Preview**
   ```bash
   npm run build
   npm run preview
   ```

3. **Linting**
   ```bash
   npm run lint
   ```

## Environment Configuration

The frontend proxies API requests to the backend via Vite config:
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true
    }
  }
}
```

## Authentication Flow

1. User registers/logs in
2. Backend returns JWT token
3. Token stored in localStorage
4. Token included in all subsequent API requests
5. Redux store maintains auth state
6. Protected routes check authentication state

## Storage

- **localStorage**: JWT token for persistent sessions
- **Redux Store**: Application state management

## Performance Optimizations

- Lazy loading of pages with React Router
- Component memoization where needed
- Efficient API calls with debouncing
- CSS Grid for optimized layouts
- Image optimization (recommended)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- Real-time chat/messaging
- Advanced filtering with saved searches
- Payment integration UI
- Map integration for location-based search
- Image gallery with zoom
- Dark mode
- Offline support with Service Workers
- PWA capabilities

## Troubleshooting

### API Connection Issues
- Ensure backend is running on `http://localhost:5000`
- Check CORS settings in backend
- Verify environment configuration

### Authentication Issues
- Clear localStorage and refresh
- Check token expiration
- Verify JWT secret matches between frontend and backend

### Build Issues
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Clear Vite cache with `npm run build` after clearing

## Support

For issues or questions, please refer to the main README.md in the project root.
