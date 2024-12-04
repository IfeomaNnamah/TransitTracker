import { createSlice } from '@reduxjs/toolkit';

export const unreadCount = createSlice({
  name: 'unreadcount',
  initialState: {
    value: null,
  },
  reducers: {
    setUnreadCount: (state, action) => {
      state.value = action.payload
    },
  },
})

export const { setUnreadCount } = unreadCount.actions;
export default unreadCount.reducer;