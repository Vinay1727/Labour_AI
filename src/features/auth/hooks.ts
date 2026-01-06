import { useState } from 'react';

export const useAuth = () => {
    const [user, setUser] = useState(null);

    const login = async (phone: string) => {
        // Logic
    };

    return { user, login };
};
