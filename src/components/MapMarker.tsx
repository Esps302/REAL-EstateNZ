import { useEffect, useRef } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Property } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface MapMarkerProps {
  property: Property;
  icon: L.DivIcon;
  isHovered: boolean;
}

export function MapMarker({ property, icon, isHovered }: MapMarkerProps) {
  const { userData } = useAuth();
  const markerRef = useRef<L.Marker>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (markerRef.current) markerRef.current.openPopup();
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      if (!isHovered && markerRef.current) {
        markerRef.current.closePopup();
      }
    }, 400);
  };

  useEffect(() => {
    if (markerRef.current) {
      if (isHovered) {
        handleMouseEnter();
      } else {
        handleMouseLeave();
      }
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, [isHovered]);

  return (
    <Marker 
      ref={markerRef}
      position={[property.lat || -36.8485, property.lng || 174.7633]} 
      icon={icon}
      zIndexOffset={isHovered ? 1000 : 0}
      eventHandlers={{
        mouseover: handleMouseEnter,
        mouseout: handleMouseLeave,
        click: () => window.location.href = `/property/${property.id}`
      }}
    >
      <Popup className="property-popup" closeButton={false}>
        <div 
          className="block w-48 no-underline cursor-pointer"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={() => window.location.href = `/property/${property.id}`}
        >
          <div className="relative h-32 w-full mb-2 rounded-lg overflow-hidden">
            <img 
              src={property.images?.[0] || "/hero.png"} 
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-sm">
              {property.listingType}
            </div>
          </div>
          <div className="font-extrabold text-lg text-zinc-900">
            {(userData?.role === 'admin' || userData?.role === 'super_admin' || userData?.role === 'seller')
              ? (property.isSold 
                ? "Sold" 
                : (property.price === 0 ? "By Negotiation" : `$${property.price.toLocaleString()}`))
              : (property.isSold ? "Sold" : "Enquire for Price")
            }
          </div>
          <div className="text-sm font-semibold text-zinc-700 line-clamp-1">{property.title}</div>
          <div className="text-xs text-zinc-500 mt-1">{property.suburb}, {property.city}</div>
        </div>
      </Popup>
    </Marker>
  );
}
