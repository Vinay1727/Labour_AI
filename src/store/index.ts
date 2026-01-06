import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './rootReducer';
import { loggerMiddleware } from './middleware';

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(loggerMiddleware),
});

export type AppDispatch = typeof store.dispatch;
