import { Middleware } from '@reduxjs/toolkit';

// Example custom middleware (e.g., for logging or persisted state sync)
export const loggerMiddleware: Middleware = store => next => action => {
    console.group(action.type);
    console.info('dispatching', action);
    let result = next(action);
    console.log('next state', store.getState());
    console.groupEnd();
    return result;
};
