// Placeholder for location services (e.g., using react-native-geolocation-service or expo-location)

export const locationService = {
    getCurrentPosition: async () => {
        // return new Promise(...)
        console.log('Fetching current location...');
        return { latitude: 28.5355, longitude: 77.3910 }; // Mock coordinates (Noida)
    },

    watchPosition: (callback: (pos: any) => void) => {
        console.log('Watching position...');
        // const watchId = ...
        // return () => clearWatch(watchId);
        return () => { };
    }
};
