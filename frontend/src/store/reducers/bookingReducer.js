const initialState = {
  bookings: [],
  loading: false,
  error: null,
}

const bookingReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_BOOKINGS_START':
      return { ...state, loading: true, error: null }
    case 'FETCH_BOOKINGS_SUCCESS':
      return { ...state, bookings: action.payload, loading: false }
    case 'FETCH_BOOKINGS_FAIL':
      return { ...state, error: action.payload, loading: false }
    case 'CREATE_BOOKING_SUCCESS':
      return { ...state, bookings: [...state.bookings, action.payload] }
    default:
      return state
  }
}

export default bookingReducer
