import { createSlice } from '@reduxjs/toolkit';

export const permissions = createSlice({
  name: 'permissions',
  initialState: {
    value: null,
  },
  reducers: {
    setPermissions: (state, action) => {
      state.value = action.payload
    },
  },
})

export const { setPermissions } = permissions.actions;
export default permissions.reducer;