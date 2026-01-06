import { useState, useEffect } from 'react';
import { locationService } from '../services/locationService';

export const useLocation = () => {
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        locationService.getCurrentPosition()
            .then((pos: any) => {
                setLocation({ lat: pos.latitude, lng: pos.longitude });
            })
            .catch(err => setError(err.message));
    }, []);

    return { location, error };
};
