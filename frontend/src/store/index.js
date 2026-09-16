import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import authReducer from './reducers/authReducer'
import equipmentReducer from './reducers/equipmentReducer'
import bookingReducer from './reducers/bookingReducer'

const rootReducer = combineReducers({
  auth: authReducer,
  equipment: equipmentReducer,
  booking: bookingReducer,
})

const store = createStore(rootReducer, applyMiddleware(thunk))

export default store
