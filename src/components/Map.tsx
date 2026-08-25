"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from '@/context/AuthContext';
import { MapMarker } from './MapMarker';
import { Property } from "@/types";
import Link from "next/link";
import Image from "next/image";

// Icons will be created on the client side

// A component to automatically fit the map bounds to all markers
function MapBounds({ properties }: { properties: Property[] }) {
 const map = useMap();

 useEffect(() => {
    const validProps = properties.map(p => ({
      lat: p.lat || -36.8485, // Default to Auckland if missing
      lng: p.lng || 174.7633
    }));
    if (validProps.length === 0) return;

 if (typeof window !== 'undefined') {
 import('leaflet').then((LModule) => {
 const L = LModule.default || LModule;
 const bounds = L.latLngBounds(validProps.map(p => [p.lat!, p.lng!]));
 map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
 }).catch(console.error);
 }
 }, [properties, map]);

 return null;
}

export default function Map({ properties, hoveredPropertyId }: { properties: Property[], hoveredPropertyId?: string | null }) {
 // New Zealand center roughly
 const defaultCenter: [number, number] = [-40.9006, 174.8860];

  const [leafletLib, setLeafletLib] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet').then((LModule) => {
        setLeafletLib(LModule.default || LModule);
      }).catch(console.error);
    }

    // Cleanup function to fix Next.js HMR "Map container is already initialized" error
    return () => {
      if (typeof window !== 'undefined') {
        const containers = document.querySelectorAll('.leaflet-container');
        containers.forEach(container => {
          // @ts-ignore
          container._leaflet_id = null;
        });
      }
    };
  }, []);

  const createPriceIcon = (isHovered: boolean) => {
    if (!leafletLib) return null;
    
    // Using a nice house icon from Lucide, or a simple premium dot
    return leafletLib.divIcon({
      className: isHovered ? 'custom-marker-hovered' : 'custom-marker',
      html: `<div class="marker-dot ${isHovered ? 'hovered' : ''}">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-home"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
             </div>`,
      iconSize: [0, 0], 
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  };

  if (!leafletLib) {
    return <div className="w-full h-full bg-zinc-200 animate-pulse rounded-2xl border border-zinc-200 shadow-inner"></div>;
  }

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={5} 
        scrollWheelZoom={true} 
        className="w-full h-full rounded-2xl border border-zinc-200 shadow-inner z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBounds properties={properties} />

        {properties.map(property => {
          const lat = property.lat || -36.8485; // Default to Auckland
          const lng = property.lng || 174.7633;
          
          const isHovered = hoveredPropertyId === property.id;
          const icon = createPriceIcon(isHovered);

          if (!icon) return null;
          
          return (
            <MapMarker 
              key={property.id} 
              property={property} 
              icon={icon} 
              isHovered={isHovered} 
            />
          );
        })}
      </MapContainer>
      
      {/* CSS to fix popup styling override from leaflet default */}
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          padding: 0;
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .leaflet-popup-content {
          margin: 0;
          padding: 12px;
        }
        .property-popup a {
          color: inherit;
          text-decoration: none;
        }
        .property-popup a:hover {
          color: inherit;
        }
        .marker-dot {
          background-color: #0073e6;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translate(-50%, -50%);
        }
        .marker-dot.hovered {
          background-color: #09090b;
          transform: translate(-50%, -50%) scale(1.2);
          box-shadow: 0 6px 16px rgba(9, 9, 11, 0.4);
          z-index: 1000;
        }
      `}</style>
 </div>
 );
}
