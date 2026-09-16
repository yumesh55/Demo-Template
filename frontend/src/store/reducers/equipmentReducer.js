const initialState = {
  equipment: [],
  selectedEquipment: null,
  loading: false,
  error: null,
  filters: {},
  pagination: {},
}

const equipmentReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_EQUIPMENT_START':
      return { ...state, loading: true, error: null }
    case 'FETCH_EQUIPMENT_SUCCESS':
      return {
        ...state,
        equipment: action.payload.equipment,
        pagination: action.payload.pagination,
        loading: false,
      }
    case 'FETCH_EQUIPMENT_FAIL':
      return { ...state, error: action.payload, loading: false }
    case 'GET_EQUIPMENT_DETAIL':
      return { ...state, selectedEquipment: action.payload }
    case 'SET_FILTERS':
      return { ...state, filters: action.payload }
    default:
      return state
  }
}

export default equipmentReducer
