import { useState, useEffect, useCallback, useRef } from 'react';
import L from 'leaflet';
import { Search, Loader2, MapPin, Navigation } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Fix for default marker icons in Leaflet with Vite/Webpack
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

interface AddressData {
    street: string;
    city: string;
    state: string;
    pincode: string;
}

interface MapAddressPickerProps {
    onAddressSelect: (data: AddressData) => void;
    initialCoords?: [number, number];
}

export function MapAddressPicker({ onAddressSelect, initialCoords = [22.5726, 88.3639] }: MapAddressPickerProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

    // Function to reverse geocode and call the callback
    const fetchAddressFromCoords = useCallback(async (lat: number, lng: number) => {
        setIsReverseGeocoding(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            
            if (data && data.address) {
                const addr = data.address;
                const result: AddressData = {
                    street: data.display_name.split(',').slice(0, 2).join(', '),
                    city: addr.city || addr.town || addr.village || addr.suburb || "",
                    state: addr.state || "",
                    pincode: addr.postcode || ""
                };
                onAddressSelect(result);
            }
        } catch (error) {
            console.error("Reverse geocoding failed:", error);
        } finally {
            setIsReverseGeocoding(false);
        }
    }, [onAddressSelect]);

    // Initialize map
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        // Create the map instance
        const map = L.map(mapContainerRef.current).setView(initialCoords, 13);
        mapRef.current = map;

        // Add the tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Map click handler
        map.on('click', (e: L.LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;
            
            // Move or create marker
            if (markerRef.current) {
                markerRef.current.setLatLng(e.latlng);
            } else {
                markerRef.current = L.marker(e.latlng, { icon: DefaultIcon }).addTo(map);
            }
            
            fetchAddressFromCoords(lat, lng);
            map.flyTo(e.latlng, map.getZoom());
        });

        // Cleanup on unmount
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [initialCoords, fetchAddressFromCoords]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim() || !mapRef.current) return;

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
            );
            const data = await response.json();
            
            if (data && data.length > 0) {
                const firstResult = data[0];
                const lat = parseFloat(firstResult.lat);
                const lon = parseFloat(firstResult.lon);
                const newPos = L.latLng(lat, lon);
                
                mapRef.current.flyTo(newPos, 15);
                
                if (markerRef.current) {
                    markerRef.current.setLatLng(newPos);
                } else {
                    markerRef.current = L.marker(newPos, { icon: DefaultIcon }).addTo(mapRef.current);
                }
                
                fetchAddressFromCoords(lat, lon);
            }
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const newPos = L.latLng(latitude, longitude);

                if (mapRef.current) {
                    mapRef.current.flyTo(newPos, 16);
                    
                    if (markerRef.current) {
                        markerRef.current.setLatLng(newPos);
                    } else {
                        markerRef.current = L.marker(newPos, { icon: DefaultIcon }).addTo(mapRef.current);
                    }
                    
                    fetchAddressFromCoords(latitude, longitude);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                alert("Unable to retrieve your location. Please ensure location services are enabled.");
            }
        );
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search for a location (e.g. Park Street, Kolkata)" 
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button type="submit" disabled={isSearching} size="sm">
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                </Button>
            </form>

            <div className="h-[300px] rounded-lg overflow-hidden border border-border relative group">
                <div ref={mapContainerRef} className="h-full w-full" />
                
                {isReverseGeocoding && (
                    <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px] z-[1000] flex items-center justify-center pointer-events-none">
                        <div className="bg-background/80 px-3 py-1.5 rounded-full border shadow-sm flex items-center gap-2 animate-pulse">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span className="text-xs font-medium">Fetching address...</span>
                        </div>
                    </div>
                )}

                {/* GPS Locate Me Button */}
                <button
                    type="button"
                    onClick={handleLocateMe}
                    className="absolute top-4 right-4 z-[1000] bg-background p-2 rounded-lg border shadow-lg hover:bg-muted transition-colors group"
                    title="Locate Me"
                >
                    <Navigation className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                </button>

                <div className="absolute bottom-4 left-4 z-[1000] pointer-events-none">
                    <div className="bg-background/90 px-3 py-2 rounded-lg border shadow-lg text-[11px] text-muted-foreground max-w-[200px]">
                        <p className="flex items-center gap-1.5 font-semibold text-foreground mb-1">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            Auto-Address Tool
                        </p>
                        Click anywhere on the map to automatically fill the form above.
                    </div>
                </div>
            </div>
        </div>
    );
}
