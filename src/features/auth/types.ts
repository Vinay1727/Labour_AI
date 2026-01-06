export interface User {
    id: string;
    phoneNumber: string;
    role: 'contractor' | 'labour' | 'guest';
    name?: string;
    profileImage?: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}
