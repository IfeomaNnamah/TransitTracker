import { createSlice } from '@reduxjs/toolkit';

export const roles = createSlice({
  name: 'roles',
  initialState: {
    value: null,
  },
  reducers: {
    setRoles: (state, action) => {
      state.value = action.payload
    },
  },
})

export const { setRoles } = roles.actions;
export default roles.reducer;