import { Client, TravelMode } from '@googlemaps/google-maps-services-js';

const client = new Client({});
const API_KEY = process.env.GOOGLE_MAPS_API_KEY!;

export class GoogleMapsService {
    static async geocode(address: string): Promise<{ lat: number; lng: number } | null> {
        if (!API_KEY) {
            throw new Error('GEOCODING_FAILED');
        }

        try {
            const response = await client.geocode({
                params: { address, key: API_KEY }
            });

            if (response.data.results.length === 0) return null;

            const location = response.data.results[0].geometry.location;
            return { lat: location.lat, lng: location.lng };
        } catch (error) {
            console.error('Geocoding error:', error);
            throw new Error('GEOCODING_FAILED');
        }
    }

    static async getDirections(
        origin: { lat: number; lng: number },
        destination: { lat: number; lng: number }
    ) {
        try {
            const response = await client.directions({
                params: {
                    origin: `${origin.lat},${origin.lng}`,
                    destination: `${destination.lat},${destination.lng}`,
                    mode: TravelMode.driving,
                    key: API_KEY,
                }
            });

            if (response.data.routes.length === 0) return null;

            const leg = response.data.routes[0].legs[0];
            return {
                durationText: leg.duration.text,
                distanceText: leg.distance.text,
                durationMinutes: Math.ceil(leg.duration.value / 60),
                distanceMeters: leg.distance.value,
            };
        } catch (error) {
            console.error('Directions error:', error);
            return null;
        }
    }
}
