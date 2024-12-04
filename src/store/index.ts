import { configureStore } from '@reduxjs/toolkit';
import tepngUser from './tepngUser';
import accessToken from './accessToken';
import roles from './roles';
import pageContext from './pageContext';
import unreadCount from './unreadCount';
import permissions from './permissions';

export default configureStore({
  reducer: {
    tepngUser : tepngUser,
    accessToken : accessToken,
    roles: roles,
    pageContext: pageContext,
    unreadCount: unreadCount,
    permissions: permissions
  },
})