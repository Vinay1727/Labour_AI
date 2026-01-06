import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/slice';
import contractorReducer from '../features/contractor/slice';
import labourReducer from '../features/labour/slice';
import dealsReducer from '../features/deals/slice';

export const rootReducer = combineReducers({
    auth: authReducer,
    contractor: contractorReducer,
    labour: labourReducer,
    deals: dealsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
