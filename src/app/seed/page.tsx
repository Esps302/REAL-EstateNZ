"use client";

import React, { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

const dummyProperties = [
 {
 title: "Modern Oceanfront Villa",
 description: "Experience unparalleled luxury and breathtaking views in this exceptional property. This masterpiece offers an incredible lifestyle with premium finishes throughout. The expansive open-plan living areas flow seamlessly into the outdoor entertainment spaces, creating the perfect environment for hosting guests or relaxing with family. Don't miss this opportunity to secure your dream lifestyle in one of the most sought-after locations.",
 amenities: [
 "Dishwasher",
 "Spa / Hot Tub",
 "Pet Friendly",
 "Heating",
 "Mountain View",
 "Double Glazed Windows",
 "Swimming Pool",
 "Balcony / Deck",
 "Solar Panels",
 "Walk-in Closet"
 ],
 parkingSpaces: 2,
 yearBuilt: 2000,
 price: 6040234,
 listingType: "For Sale",
 propertyType: "House",
 city: "Queenstown",
 suburb: "Rototuna",
 bedrooms: 5,
 bathrooms: 4,
 area: 493,
 images: [
 "/images/property-7.jpg"
 ],
 status: "approved"
 },
 {
 title: "Contemporary City Apartment",
 description: "Experience unparalleled luxury and breathtaking views in this exceptional property. This masterpiece offers an incredible lifestyle with premium finishes throughout. The expansive open-plan living areas flow seamlessly into the outdoor entertainment spaces, creating the perfect environment for hosting guests or relaxing with family. Don't miss this opportunity to secure your dream lifestyle in one of the most sought-after locations.",
 amenities: [
 "Double Glazed Windows",
 "Mountain View",
 "Elevator / Lift Access",
 "Ocean View",
 "Secure Parking",
 "Fenced Yard",
 "Broadband / WiFi",
 "Gym / Fitness Center",
 "Furnished",
 "Heating"
 ],
 parkingSpaces: 4,
 yearBuilt: 2016,
 price: 9498454,
 listingType: "For Sale",
 propertyType: "Villa",
 city: "Christchurch",
 suburb: "Te Aro",
 bedrooms: 5,
 bathrooms: 4,
 area: 248,
 images: [
 "/images/property-12.jpg"
 ],
 status: "approved"
 },
 {
 title: "Family Home with Large Garden",
 description: "Experience unparalleled luxury and breathtaking views in this exceptional property. This masterpiece offers an incredible lifestyle with premium finishes throughout. The expansive open-plan living areas flow seamlessly into the outdoor entertainment spaces, creating the perfect environment for hosting guests or relaxing with family. Don't miss this opportunity to secure your dream lifestyle in one of the most sought-after locations.",
 amenities: [
 "Security System",
 "Swimming Pool",
 "Elevator / Lift Access",
 "Fenced Yard",
 "Tennis Court",
 "Dishwasher",
 "Secure Parking",
 "Broadband / WiFi",
 "Walk-in Closet",
 "Ocean View"
 ],
 parkingSpaces: 2,
 yearBuilt: 2010,
 price: 11721804,
 listingType: "For Sale",
 propertyType: "House",
 city: "Christchurch",
 suburb: "Ponsonby",
 bedrooms: 5,
 bathrooms: 2,
 area: 384,
 images: [
 "/images/property-11.jpg"
 ],
 status: "approved"
 },
 {
 title: "Luxury Mountain Retreat",
 description: "Experience unparalleled luxury and breathtaking views in this exceptional property. This masterpiece offers an incredible lifestyle with premium finishes throughout. The expansive open-plan living areas flow seamlessly into the outdoor entertainment spaces, creating the perfect environment for hosting guests or relaxing with family. Don't miss this opportunity to secure your dream lifestyle in one of the most sought-after locations.",
 amenities: [
 "Secure Parking",
 "Wheelchair Accessible",
 "Dishwasher",
 "Tennis Court",
 "Balcony / Deck",
 "City Skyline View",
 "Fenced Yard",
 "Broadband / WiFi",
 "Built-in Wardrobes",
 "Elevator / Lift Access"
 ],
 parkingSpaces: 4,
 yearBuilt: 1996,
 price: 14736966,
 listingType: "For Sale",
 propertyType: "Townhouse",
 city: "Nelson",
 suburb: "Mount Maunganui",
 bedrooms: 4,
 bathrooms: 4,
 area: 545,
 images: [
 "/images/property-19.jpg"
 ],
 status: "approved"
 },
 {
 title: "Historic Victorian Townhouse",
 description: "Experience unparalleled luxury and breathtaking views in this exceptional property. This masterpiece offers an incredible lifestyle with premium finishes throughout. The expansive open-plan living areas flow seamlessly into the outdoor entertainment spaces, creating the perfect environment for hosting guests or relaxing with family. Don't miss this opportunity to secure your dream lifestyle in one of the most sought-after locations.",
 amenities: [
 "Dishwasher",
 "Fenced Yard",
 "Furnished",
 "Built-in Wardrobes",
 "Tennis Court",
 "Wheelchair Accessible",
 "Swimming Pool",
 "Balcony / Deck",
 "Secure Parking",
 "Walk-in Closet"
 ],
 parkingSpaces: 4,
 yearBuilt: 2019,
 price: 5399935,
 listingType: "For Sale",
 propertyType: "House",
 city: "Blenheim",
 suburb: "Rototuna",
 bedrooms: 4,
 bathrooms: 4,
 area: 371,
 images: [
 "/images/property-17.jpg"
 ],
 status: "approved"
 },
 {
 title: "Eco-Friendly Farmhouse",
 description: "Experience unparalleled luxury and breathtaking views in this exceptional property. This masterpiece offers an incredible lifestyle with premium finishes throughout. The expansive open-plan living areas flow seamlessly into the outdoor entertainment spaces, creating the perfect environment for hosting guests or relaxing with family. Don't miss this opportunity to secure your dream lifestyle in one of the most sought-after locations.",
 amenities: [
 "Security System",
 "Walk-in Closet",
 "Balcony / Deck",
 "Tennis Court",
 "Spa / Hot Tub",
 "Solar Panels",
 "Mountain View",
 "Built-in Wardrobes",
 "Broadband / WiFi",
 "Furnished"
 ],
 parkingSpaces: 2,
 yearBuilt: 2007,
 price: 7830239,
 listingType: "For Sale",
 propertyType: "Apartment",
 city: "Blenheim",
 suburb: "Rototuna",
 bedrooms: 5,
 bathrooms: 3,
 area: 259,
 images: [
 "/images/property-10.jpg"
 ],
 status: "approved"
 },
 {
 title: "Premium Penthouse Suite",
 description: "Experience unparalleled luxury and breathtaking views in this exceptional property. This masterpiece offers an incredible lifestyle with premium finishes throughout. The expansive open-plan living areas flow seamlessly into the outdoor entertainment spaces, creating the perfect environment for hosting guests or relaxing with family. Don't miss this opportunity to secure your dream lifestyle in one of the most sought-after locations.",
 amenities: [
 "Ocean View",
 "Elevator / Lift Access",
 "Pet Friendly",
 "Furnished",
 "Garage",
 "Tennis Court",
 "Secure Parking",
 "Mountain View",
 "Heating",
 "Swimming Pool"
 ],
 parkingSpaces: 4,
 yearBuilt: 1999,
 price: 10140174,
 listingType: "For Sale",
 propertyType: "Villa",
 city: "Wairarapa",
 suburb: "Ponsonby",
 bedrooms: 3,
 bathrooms: 3,
 area: 413,
 images: [
 "/images/property-3.jpg"
 ],
 status: "approved"
 },
 {
 title: "Beachfront Bungalow",
 description: "Experience unparalleled luxury and breathtaking views in this exceptional property. This masterpiece offers an incredible lifestyle with premium finishes throughout. The expansive open-plan living areas flow seamlessly into the outdoor entertainment spaces, creating the perfect environment for hosting guests or relaxing with family. Don't miss this opportunity to secure your dream lifestyle in one of the most sought-after locations.",
 amenities: [
 "Built-in Wardrobes",
 "Furnished",
 "Fireplace",
 "Dishwasher",
 "Fenced Yard",
 "Secure Parking",
 "Security System",
 "Air Conditioning",
 "Double Glazed Windows",
 "Swimming Pool"
 ],
 parkingSpaces: 3,
 yearBuilt: 2001,
 price: 10296536,
 listingType: "For Sale",
 propertyType: "Villa",
 city: "Wellington",
 suburb: "CBD",
 bedrooms: 4,
 bathrooms: 4,
 area: 420,
 images: [
 "/images/property-4.jpg"
 ],
 status: "approved"
 },
 {
 title: "Modern Suburban Build",
 description: "Experience unparalleled luxury and breathtaking views in this exceptional property. This masterpiece offers an incredible lifestyle with premium finishes throughout. The expansive open-plan living areas flow seamlessly into the outdoor entertainment spaces, creating the perfect environment for hosting guests or relaxing with family. Don't miss this opportunity to secure your dream lifestyle in one of the most sought-after locations.",
 amenities: [
 "Built-in Wardrobes",
 "Furnished",
 "Security System",
 "Broadband / WiFi",
 "Double Glazed Windows",
 "Air Conditioning",
 "Secure Parking",
 "Pet Friendly",
 "Mountain View",
 "Solar Panels"
 ],
 parkingSpaces: 1,
 yearBuilt: 2017,
 price: 17480272,
 listingType: "For Sale",
 propertyType: "House",
 city: "Dunedin",
 suburb: "Mount Maunganui",
 bedrooms: 4,
 bathrooms: 4,
 area: 357,
 images: [
 "/images/property-20.jpg"
 ],
 status: "approved"
 },
 {
 title: "Vineyard Estate",
 description: "Experience unparalleled luxury and breathtaking views in this exceptional property. This masterpiece offers an incredible lifestyle with premium finishes throughout. The expansive open-plan living areas flow seamlessly into the outdoor entertainment spaces, creating the perfect environment for hosting guests or relaxing with family. Don't miss this opportunity to secure your dream lifestyle in one of the most sought-after locations.",
 amenities: [
 "Secure Parking",
 "Ocean View",
 "Fenced Yard",
 "Air Conditioning",
 "Double Glazed Windows",
 "Solar Panels",
 "Swimming Pool",
 "Garage",
 "Dishwasher",
 "Fireplace"
 ],
 parkingSpaces: 4,
 yearBuilt: 1997,
 price: 6829512,
 listingType: "For Sale",
 propertyType: "Villa",
 city: "Hamilton",
 suburb: "Mount Maunganui",
 bedrooms: 3,
 bathrooms: 3,
 area: 365,
 images: [
 "/images/property-9.jpg"
 ],
 status: "approved"
 },
 {
 title: "Ski Chalet",
 description: "Experience unparalleled luxury and breathtaking views in this exceptional property. This masterpiece offers an incredible lifestyle with premium finishes throughout. The expansive open-plan living areas flow seamlessly into the outdoor entertainment spaces, creating the perfect environment for hosting guests or relaxing with family. Don't miss this opportunity to secure your dream lifestyle in one of the most sought-after locations.",
 amenities: [
 "Walk-in Closet",
 "Heating",
 "Fenced Yard",
 "Garage",
 "Spa / Hot Tub",
 "Balcony / Deck",
 "Built-in Wardrobes",
 "Secure Parking",
 "Air Conditioning",
 "Double Glazed Windows"
 ],
 parkingSpaces: 2,
 yearBuilt: 2009,
 price: 19536516,
 listingType: "For Sale",
 propertyType: "Apartment",
 city: "Wairarapa",
 suburb: "Renwick",
 bedrooms: 5,
 bathrooms: 2,
 area: 161,
 images: [
 "/images/property-2.jpg"
 ],
 status: "approved"
 },
 {
 title: "City Fringe Warehouse Conversion",
 description: "Experience unparalleled luxury and breathtaking views in this exceptional property. This masterpiece offers an incredible lifestyle with premium finishes throughout. The expansive open-plan living areas flow seamlessly into the outdoor entertainment spaces, creating the perfect environment for hosting guests or relaxing with family. Don't miss this opportunity to secure your dream lifestyle in one of the most sought-after locations.",
 amenities: [
 "Walk-in Closet",
 "Built-in Wardrobes",
 "Tennis Court",
 "Ocean View",
 "Broadband / WiFi",
 "Heating",
 "Balcony / Deck",
 "Dishwasher",
 "Wheelchair Accessible",
 "Gym / Fitness Center"
 ],
 parkingSpaces: 4,
 yearBuilt: 2007,
 price: 15551570,
 listingType: "For Sale",
 propertyType: "House",
 city: "Auckland",
 suburb: "Te Aro",
 bedrooms: 4,
 bathrooms: 4,
 area: 492,
 images: [
 "/images/property-12.jpg"
 ],
 status: "approved"
 },
 {
 title: "Opulent Estate",
 description: "Experience unparalleled luxury and breathtaking views in this exceptional property. This masterpiece offers an incredible lifestyle with premium finishes throughout. The expansive open-plan living areas flow seamlessly into the outdoor entertainment spaces, creating the perfect environment for hosting guests or relaxing with family. Don't miss this opportunity to secure your dream lifestyle in one of the most sought-after locations.",
 amenities: [
 "Garage",
 "Pet Friendly",
 "Balcony / Deck",
 "Solar Panels",
 "City Skyline View",
 "Tennis Court",
 "Elevator / Lift Access",
 "Wheelchair Accessible",
 "Security System",
 "Fireplace"
 ],
 parkingSpaces: 4,
 yearBuilt: 2014,
 price: 10027254,
 listingType: "For Sale",
 propertyType: "Villa",
 city: "Wanaka",
 suburb: "Renwick",
 bedrooms: 4,
 bathrooms: 2,
 area: 241,
 images: [
 "/images/property-12.jpg"
 ],
 status: "approved"
 },
 {
 title: "Grand Mansion",
 description: "Experience unparalleled luxury and breathtaking views in this exceptional property. This masterpiece offers an incredible lifestyle with premium finishes throughout. The expansive open-plan living areas flow seamlessly into the outdoor entertainment spaces, creating the perfect environment for hosting guests or relaxing with family. Don't miss this opportunity to secure your dream lifestyle in one of the most sought-after locations.",
 amenities: [
 "Elevator / Lift Access",
 "Wheelchair Accessible",
 "Mountain View",
 "Dishwasher",
 "Security System",
 "Heating",
 "Tennis Court",
 "Built-in Wardrobes",
 "City Skyline View",
 "Air Conditioning"
 ],
 parkingSpaces: 1,
 yearBuilt: 2010,
 price: 11120423,
 listingType: "For Sale",
 propertyType: "Apartment",
 city: "Christchurch",
 suburb: "Te Aro",
 bedrooms: 6,
 bathrooms: 4,
 area: 191,
 images: [
 "/images/property-4.jpg"
 ],
 status: "approved"
 },
 {
 title: "High-End Waterfront Estate",
 description: "Experience unparalleled luxury and breathtaking views in this exceptional property. This masterpiece offers an incredible lifestyle with premium finishes throughout. The expansive open-plan living areas flow seamlessly into the outdoor entertainment spaces, creating the perfect environment for hosting guests or relaxing with family. Don't miss this opportunity to secure your dream lifestyle in one of the most sought-after locations.",
 amenities: [
 "Dishwasher",
 "Elevator / Lift Access",
 "Solar Panels",
 "Broadband / WiFi",
 "Tennis Court",
 "Ocean View",
 "Security System",
 "Wheelchair Accessible",
 "Furnished",
 "Garage"
 ],
 parkingSpaces: 4,
 yearBuilt: 2001,
 price: 17592953,
 listingType: "For Sale",
 propertyType: "Villa",
 city: "Dunedin",
 suburb: "Mount Maunganui",
 bedrooms: 4,
 bathrooms: 3,
 area: 292,
 images: [
 "/images/property-15.jpg"
 ],
 status: "approved"
 },
 {
 title: "Secluded Luxury Lodge",
 description: "Experience unparalleled luxury and breathtaking views in this exceptional property. This masterpiece offers an incredible lifestyle with premium finishes throughout. The expansive open-plan living areas flow seamlessly into the outdoor entertainment spaces, creating the perfect environment for hosting guests or relaxing with family. Don't miss this opportunity to secure your dream lifestyle in one of the most sought-after locations.",
 amenities: [
 "Gym / Fitness Center",
 "Broadband / WiFi",
 "Pet Friendly",
 "City Skyline View",
 "Furnished",
 "Spa / Hot Tub",
 "Solar Panels",
 "Elevator / Lift Access",
 "Tennis Court",
 "Dishwasher"
 ],
 parkingSpaces: 3,
 yearBuilt: 2008,
 price: 15391318,
 listingType: "For Sale",
 propertyType: "Villa",
 city: "Dunedin",
 suburb: "Mount Maunganui",
 bedrooms: 5,
 bathrooms: 3,
 area: 439,
 images: [
 "/images/property-12.jpg"
 ],
 status: "approved"
 },
 {
 title: "Designer Masterpiece",
 description: "Experience unparalleled luxury and breathtaking views in this exceptional property. This masterpiece offers an incredible lifestyle with premium finishes throughout. The expansive open-plan living areas flow seamlessly into the outdoor entertainment spaces, creating the perfect environment for hosting guests or relaxing with family. Don't miss this opportunity to secure your dream lifestyle in one of the most sought-after locations.",
 amenities: [
 "Elevator / Lift Access",
 "Furnished",
 "Walk-in Closet",
 "Built-in Wardrobes",
 "Ocean View",
 "Balcony / Deck",
 "Spa / Hot Tub",
 "Air Conditioning",
 "Heating",
 "Swimming Pool"
 ],
 parkingSpaces: 3,
 yearBuilt: 2006,
 price: 15591570,
 listingType: "For Sale",
 propertyType: "Townhouse",
 city: "Blenheim",
 suburb: "Tasman",
 bedrooms: 5,
 bathrooms: 4,
 area: 325,
 images: [
 "/images/property-4.jpg"
 ],
 status: "approved"
 },
 {
 title: "Executive Family Residence",
 description: "Experience unparalleled luxury and breathtaking views in this exceptional property. This masterpiece offers an incredible lifestyle with premium finishes throughout. The expansive open-plan living areas flow seamlessly into the outdoor entertainment spaces, creating the perfect environment for hosting guests or relaxing with family. Don't miss this opportunity to secure your dream lifestyle in one of the most sought-after locations.",
 amenities: [
 "Balcony / Deck",
 "Dishwasher",
 "Solar Panels",
 "Gym / Fitness Center",
 "Built-in Wardrobes",
 "Double Glazed Windows",
 "Secure Parking",
 "Garage",
 "Walk-in Closet",
 "Air Conditioning"
 ],
 parkingSpaces: 2,
 yearBuilt: 2014,
 price: 18222576,
 listingType: "For Sale",
 propertyType: "Villa",
 city: "Queenstown",
 suburb: "Ponsonby",
 bedrooms: 5,
 bathrooms: 2,
 area: 287,
 images: [
 "/images/property-2.jpg"
 ],
 status: "approved"
 },
 {
 title: "Exclusive Coastal Retreat",
 description: "Experience unparalleled luxury and breathtaking views in this exceptional property. This masterpiece offers an incredible lifestyle with premium finishes throughout. The expansive open-plan living areas flow seamlessly into the outdoor entertainment spaces, creating the perfect environment for hosting guests or relaxing with family. Don't miss this opportunity to secure your dream lifestyle in one of the most sought-after locations.",
 amenities: [
 "Secure Parking",
 "Fenced Yard",
 "Mountain View",
 "Wheelchair Accessible",
 "Broadband / WiFi",
 "Dishwasher",
 "Elevator / Lift Access",
 "Heating",
 "Garage",
 "Walk-in Closet"
 ],
 parkingSpaces: 3,
 yearBuilt: 2004,
 price: 7466219,
 listingType: "For Sale",
 propertyType: "House",
 city: "Queenstown",
 suburb: "Rototuna",
 bedrooms: 4,
 bathrooms: 4,
 area: 504,
 images: [
 "/images/property-3.jpg"
 ],
 status: "approved"
 },
 {
 title: "Stunning Architectural Home",
 description: "Experience unparalleled luxury and breathtaking views in this exceptional property. This masterpiece offers an incredible lifestyle with premium finishes throughout. The expansive open-plan living areas flow seamlessly into the outdoor entertainment spaces, creating the perfect environment for hosting guests or relaxing with family. Don't miss this opportunity to secure your dream lifestyle in one of the most sought-after locations.",
 amenities: [
 "Tennis Court",
 "Ocean View",
 "Wheelchair Accessible",
 "Walk-in Closet",
 "Fireplace",
 "Mountain View",
 "Furnished",
 "Fenced Yard",
 "Swimming Pool",
 "Air Conditioning"
 ],
 parkingSpaces: 3,
 yearBuilt: 1991,
 price: 8027072,
 listingType: "For Sale",
 propertyType: "House",
 city: "Wairarapa",
 suburb: "Fendalton",
 bedrooms: 6,
 bathrooms: 4,
 area: 274,
 images: [
 "/images/property-5.jpg"
 ],
 status: "approved"
 },
 {
 title: "Majestic Hilltop Mansion",
 description: "Experience unparalleled luxury and breathtaking views in this exceptional property. This masterpiece offers an incredible lifestyle with premium finishes throughout. The expansive open-plan living areas flow seamlessly into the outdoor entertainment spaces, creating the perfect environment for hosting guests or relaxing with family. Don't miss this opportunity to secure your dream lifestyle in one of the most sought-after locations.",
 amenities: [
 "Tennis Court",
 "Dishwasher",
 "Garage",
 "Secure Parking",
 "Ocean View",
 "Security System",
 "Elevator / Lift Access",
 "Mountain View",
 "Pet Friendly",
 "Walk-in Closet"
 ],
 parkingSpaces: 1,
 yearBuilt: 2001,
 price: 16889098,
 listingType: "For Sale",
 propertyType: "Apartment",
 city: "Christchurch",
 suburb: "Renwick",
 bedrooms: 3,
 bathrooms: 4,
 area: 490,
 images: [
 "/images/property-13.jpg"
 ],
 status: "approved"
 },
 {
 title: "Lavish City Penthouse",
 description: "Experience unparalleled luxury and breathtaking views in this exceptional property. This masterpiece offers an incredible lifestyle with premium finishes throughout. The expansive open-plan living areas flow seamlessly into the outdoor entertainment spaces, creating the perfect environment for hosting guests or relaxing with family. Don't miss this opportunity to secure your dream lifestyle in one of the most sought-after locations.",
 amenities: [
 "Double Glazed Windows",
 "Tennis Court",
 "Gym / Fitness Center",
 "Fireplace",
 "Secure Parking",
 "Mountain View",
 "Air Conditioning",
 "Spa / Hot Tub",
 "Heating",
 "Balcony / Deck"
 ],
 parkingSpaces: 4,
 yearBuilt: 1991,
 price: 8358129,
 listingType: "For Sale",
 propertyType: "House",
 city: "Queenstown",
 suburb: "Tasman",
 bedrooms: 5,
 bathrooms: 2,
 area: 434,
 images: [
 "/images/property-2.jpg"
 ],
 status: "approved"
 },
 {
 title: "Sprawling Country Estate",
 description: "Experience unparalleled luxury and breathtaking views in this exceptional property. This masterpiece offers an incredible lifestyle with premium finishes throughout. The expansive open-plan living areas flow seamlessly into the outdoor entertainment spaces, creating the perfect environment for hosting guests or relaxing with family. Don't miss this opportunity to secure your dream lifestyle in one of the most sought-after locations.",
 amenities: [
 "Air Conditioning",
 "Mountain View",
 "Elevator / Lift Access",
 "Secure Parking",
 "Broadband / WiFi",
 "Balcony / Deck",
 "Solar Panels",
 "Furnished",
 "Fireplace",
 "City Skyline View"
 ],
 parkingSpaces: 3,
 yearBuilt: 2006,
 price: 13759863,
 listingType: "For Sale",
 propertyType: "House",
 city: "Wanaka",
 suburb: "Fendalton",
 bedrooms: 3,
 bathrooms: 2,
 area: 436,
 images: [
 "/images/property-6.jpg"
 ],
 status: "approved"
 },
 {
 title: "Bespoke Modern Villa",
 description: "Experience unparalleled luxury and breathtaking views in this exceptional property. This masterpiece offers an incredible lifestyle with premium finishes throughout. The expansive open-plan living areas flow seamlessly into the outdoor entertainment spaces, creating the perfect environment for hosting guests or relaxing with family. Don't miss this opportunity to secure your dream lifestyle in one of the most sought-after locations.",
 amenities: [
 "Double Glazed Windows",
 "Fireplace",
 "Garage",
 "Gym / Fitness Center",
 "Mountain View",
 "Air Conditioning",
 "City Skyline View",
 "Broadband / WiFi",
 "Swimming Pool",
 "Security System"
 ],
 parkingSpaces: 2,
 yearBuilt: 1996,
 price: 6441148,
 listingType: "For Sale",
 propertyType: "House",
 city: "Queenstown",
 suburb: "Ponsonby",
 bedrooms: 5,
 bathrooms: 3,
 area: 339,
 images: [
 "/images/property-12.jpg"
 ],
 status: "approved"
 },
 {
 title: "Executive City Pad",
 description: "A fantastic rental opportunity offering comfort and convenience. Perfectly positioned to enjoy the best of the local area, this property features modern amenities and a great layout. Ideal for those seeking a quality home in a vibrant community. Enjoy easy access to public transport, shopping, and dining options.",
 amenities: [
 "Tennis Court",
 "Swimming Pool",
 "City Skyline View",
 "Broadband / WiFi",
 "Mountain View",
 "Dishwasher",
 "Security System",
 "Fenced Yard"
 ],
 parkingSpaces: 0,
 yearBuilt: 1990,
 price: 1828,
 listingType: "For Rent",
 propertyType: "Townhouse",
 city: "Christchurch",
 suburb: "Te Aro",
 bedrooms: 1,
 bathrooms: 1,
 area: 148,
 images: [
 "/images/property-18.jpg"
 ],
 status: "approved"
 },
 {
 title: "Spacious Student Flat",
 description: "A fantastic rental opportunity offering comfort and convenience. Perfectly positioned to enjoy the best of the local area, this property features modern amenities and a great layout. Ideal for those seeking a quality home in a vibrant community. Enjoy easy access to public transport, shopping, and dining options.",
 amenities: [
 "Solar Panels",
 "Pet Friendly",
 "Ocean View",
 "Security System",
 "Fireplace",
 "Fenced Yard",
 "Air Conditioning",
 "Dishwasher"
 ],
 parkingSpaces: 0,
 yearBuilt: 1999,
 price: 3761,
 listingType: "For Rent",
 propertyType: "Townhouse",
 city: "Blenheim",
 suburb: "Ponsonby",
 bedrooms: 1,
 bathrooms: 2,
 area: 120,
 images: [
 "/images/property-3.jpg"
 ],
 status: "approved"
 },
 {
 title: "Cozy Suburban Unit",
 description: "A fantastic rental opportunity offering comfort and convenience. Perfectly positioned to enjoy the best of the local area, this property features modern amenities and a great layout. Ideal for those seeking a quality home in a vibrant community. Enjoy easy access to public transport, shopping, and dining options.",
 amenities: [
 "Broadband / WiFi",
 "Swimming Pool",
 "Fireplace",
 "Walk-in Closet",
 "Security System",
 "Air Conditioning",
 "Spa / Hot Tub",
 "Wheelchair Accessible"
 ],
 parkingSpaces: 2,
 yearBuilt: 1993,
 price: 3217,
 listingType: "For Rent",
 propertyType: "Villa",
 city: "Christchurch",
 suburb: "CBD",
 bedrooms: 3,
 bathrooms: 1,
 area: 147,
 images: [
 "/images/property-10.jpg"
 ],
 status: "approved"
 },
 {
 title: "Luxury Waterfront Apartment",
 description: "A fantastic rental opportunity offering comfort and convenience. Perfectly positioned to enjoy the best of the local area, this property features modern amenities and a great layout. Ideal for those seeking a quality home in a vibrant community. Enjoy easy access to public transport, shopping, and dining options.",
 amenities: [
 "Dishwasher",
 "City Skyline View",
 "Balcony / Deck",
 "Gym / Fitness Center",
 "Mountain View",
 "Fenced Yard",
 "Swimming Pool",
 "Secure Parking"
 ],
 parkingSpaces: 2,
 yearBuilt: 1997,
 price: 2174,
 listingType: "For Rent",
 propertyType: "Townhouse",
 city: "Dunedin",
 suburb: "Te Aro",
 bedrooms: 1,
 bathrooms: 2,
 area: 129,
 images: [
 "/images/property-1.jpg"
 ],
 status: "approved"
 },
 {
 title: "Pet-Friendly Family Rental",
 description: "A fantastic rental opportunity offering comfort and convenience. Perfectly positioned to enjoy the best of the local area, this property features modern amenities and a great layout. Ideal for those seeking a quality home in a vibrant community. Enjoy easy access to public transport, shopping, and dining options.",
 amenities: [
 "Secure Parking",
 "Heating",
 "Balcony / Deck",
 "Tennis Court",
 "Built-in Wardrobes",
 "Elevator / Lift Access",
 "Ocean View",
 "Broadband / WiFi"
 ],
 parkingSpaces: 0,
 yearBuilt: 2005,
 price: 4378,
 listingType: "For Rent",
 propertyType: "Townhouse",
 city: "Nelson",
 suburb: "Fendalton",
 bedrooms: 1,
 bathrooms: 1,
 area: 183,
 images: [
 "/images/property-1.jpg"
 ],
 status: "approved"
 },
 {
 title: "Modern Loft Studio",
 description: "A fantastic rental opportunity offering comfort and convenience. Perfectly positioned to enjoy the best of the local area, this property features modern amenities and a great layout. Ideal for those seeking a quality home in a vibrant community. Enjoy easy access to public transport, shopping, and dining options.",
 amenities: [
 "Secure Parking",
 "Furnished",
 "City Skyline View",
 "Ocean View",
 "Spa / Hot Tub",
 "Swimming Pool",
 "Heating",
 "Double Glazed Windows"
 ],
 parkingSpaces: 0,
 yearBuilt: 2018,
 price: 4327,
 listingType: "For Rent",
 propertyType: "Apartment",
 city: "Tauranga",
 suburb: "Renwick",
 bedrooms: 1,
 bathrooms: 2,
 area: 61,
 images: [
 "/images/property-15.jpg"
 ],
 status: "approved"
 },
 {
 title: "Furnished Townhouse",
 description: "A fantastic rental opportunity offering comfort and convenience. Perfectly positioned to enjoy the best of the local area, this property features modern amenities and a great layout. Ideal for those seeking a quality home in a vibrant community. Enjoy easy access to public transport, shopping, and dining options.",
 amenities: [
 "Built-in Wardrobes",
 "Garage",
 "Mountain View",
 "Broadband / WiFi",
 "Balcony / Deck",
 "Air Conditioning",
 "Ocean View",
 "Gym / Fitness Center"
 ],
 parkingSpaces: 2,
 yearBuilt: 2011,
 price: 2991,
 listingType: "For Rent",
 propertyType: "Apartment",
 city: "Wellington",
 suburb: "Herne Bay",
 bedrooms: 3,
 bathrooms: 2,
 area: 146,
 images: [
 "/images/property-19.jpg"
 ],
 status: "approved"
 },
 {
 title: "Rural Lifestyle Rental",
 description: "A fantastic rental opportunity offering comfort and convenience. Perfectly positioned to enjoy the best of the local area, this property features modern amenities and a great layout. Ideal for those seeking a quality home in a vibrant community. Enjoy easy access to public transport, shopping, and dining options.",
 amenities: [
 "Mountain View",
 "Gym / Fitness Center",
 "Built-in Wardrobes",
 "Fireplace",
 "Swimming Pool",
 "Pet Friendly",
 "Dishwasher",
 "Elevator / Lift Access"
 ],
 parkingSpaces: 2,
 yearBuilt: 1993,
 price: 2937,
 listingType: "For Rent",
 propertyType: "Townhouse",
 city: "Wanaka",
 suburb: "Rototuna",
 bedrooms: 3,
 bathrooms: 2,
 area: 72,
 images: [
 "/images/property-10.jpg"
 ],
 status: "approved"
 },
 {
 title: "Affordable Studio Room",
 description: "A fantastic rental opportunity offering comfort and convenience. Perfectly positioned to enjoy the best of the local area, this property features modern amenities and a great layout. Ideal for those seeking a quality home in a vibrant community. Enjoy easy access to public transport, shopping, and dining options.",
 amenities: [
 "Broadband / WiFi",
 "Pet Friendly",
 "Spa / Hot Tub",
 "Heating",
 "Tennis Court",
 "Security System",
 "Fenced Yard",
 "Fireplace"
 ],
 parkingSpaces: 2,
 yearBuilt: 1995,
 price: 3622,
 listingType: "For Rent",
 propertyType: "Townhouse",
 city: "Queenstown",
 suburb: "Te Aro",
 bedrooms: 3,
 bathrooms: 2,
 area: 74,
 images: [
 "/images/property-10.jpg"
 ],
 status: "approved"
 },
 {
 title: "Beachside Unit",
 description: "A fantastic rental opportunity offering comfort and convenience. Perfectly positioned to enjoy the best of the local area, this property features modern amenities and a great layout. Ideal for those seeking a quality home in a vibrant community. Enjoy easy access to public transport, shopping, and dining options.",
 amenities: [
 "Furnished",
 "City Skyline View",
 "Garage",
 "Built-in Wardrobes",
 "Tennis Court",
 "Wheelchair Accessible",
 "Elevator / Lift Access",
 "Pet Friendly"
 ],
 parkingSpaces: 0,
 yearBuilt: 2012,
 price: 2721,
 listingType: "For Rent",
 propertyType: "Villa",
 city: "Wellington",
 suburb: "Herne Bay",
 bedrooms: 1,
 bathrooms: 1,
 area: 127,
 images: [
 "/images/property-12.jpg"
 ],
 status: "approved"
 },
 {
 title: "High-End Suburb Family Home",
 description: "A fantastic rental opportunity offering comfort and convenience. Perfectly positioned to enjoy the best of the local area, this property features modern amenities and a great layout. Ideal for those seeking a quality home in a vibrant community. Enjoy easy access to public transport, shopping, and dining options.",
 amenities: [
 "Garage",
 "Furnished",
 "Gym / Fitness Center",
 "Wheelchair Accessible",
 "Broadband / WiFi",
 "Heating",
 "Tennis Court",
 "Secure Parking"
 ],
 parkingSpaces: 2,
 yearBuilt: 2012,
 price: 2752,
 listingType: "For Rent",
 propertyType: "Townhouse",
 city: "Nelson",
 suburb: "Mount Maunganui",
 bedrooms: 2,
 bathrooms: 1,
 area: 105,
 images: [
 "/images/property-7.jpg"
 ],
 status: "approved"
 },
 {
 title: "Quiet Country Cottage",
 description: "A fantastic rental opportunity offering comfort and convenience. Perfectly positioned to enjoy the best of the local area, this property features modern amenities and a great layout. Ideal for those seeking a quality home in a vibrant community. Enjoy easy access to public transport, shopping, and dining options.",
 amenities: [
 "Air Conditioning",
 "Wheelchair Accessible",
 "Solar Panels",
 "Garage",
 "Fenced Yard",
 "Security System",
 "Spa / Hot Tub",
 "Broadband / WiFi"
 ],
 parkingSpaces: 0,
 yearBuilt: 2019,
 price: 3215,
 listingType: "For Rent",
 propertyType: "Townhouse",
 city: "Tauranga",
 suburb: "Te Aro",
 bedrooms: 1,
 bathrooms: 2,
 area: 63,
 images: [
 "/images/property-7.jpg"
 ],
 status: "approved"
 },
 {
 title: "Chic Urban Apartment",
 description: "A fantastic rental opportunity offering comfort and convenience. Perfectly positioned to enjoy the best of the local area, this property features modern amenities and a great layout. Ideal for those seeking a quality home in a vibrant community. Enjoy easy access to public transport, shopping, and dining options.",
 amenities: [
 "Balcony / Deck",
 "Spa / Hot Tub",
 "Pet Friendly",
 "Built-in Wardrobes",
 "Walk-in Closet",
 "Air Conditioning",
 "Double Glazed Windows",
 "Fireplace"
 ],
 parkingSpaces: 2,
 yearBuilt: 2000,
 price: 3220,
 listingType: "For Rent",
 propertyType: "Apartment",
 city: "Nelson",
 suburb: "Fendalton",
 bedrooms: 2,
 bathrooms: 2,
 area: 116,
 images: [
 "/images/property-15.jpg"
 ],
 status: "approved"
 },
 {
 title: "Family-Friendly Suburban Home",
 description: "A fantastic rental opportunity offering comfort and convenience. Perfectly positioned to enjoy the best of the local area, this property features modern amenities and a great layout. Ideal for those seeking a quality home in a vibrant community. Enjoy easy access to public transport, shopping, and dining options.",
 amenities: [
 "Furnished",
 "Gym / Fitness Center",
 "Garage",
 "Balcony / Deck",
 "Security System",
 "Mountain View",
 "Tennis Court",
 "Spa / Hot Tub"
 ],
 parkingSpaces: 0,
 yearBuilt: 2007,
 price: 3484,
 listingType: "For Rent",
 propertyType: "House",
 city: "Wairarapa",
 suburb: "CBD",
 bedrooms: 3,
 bathrooms: 2,
 area: 60,
 images: [
 "/images/property-14.jpg"
 ],
 status: "approved"
 },
 {
 title: "Stylish City Loft",
 description: "A fantastic rental opportunity offering comfort and convenience. Perfectly positioned to enjoy the best of the local area, this property features modern amenities and a great layout. Ideal for those seeking a quality home in a vibrant community. Enjoy easy access to public transport, shopping, and dining options.",
 amenities: [
 "Mountain View",
 "Furnished",
 "Wheelchair Accessible",
 "Air Conditioning",
 "Broadband / WiFi",
 "Elevator / Lift Access",
 "Fenced Yard",
 "Spa / Hot Tub"
 ],
 parkingSpaces: 1,
 yearBuilt: 2006,
 price: 2784,
 listingType: "For Rent",
 propertyType: "Apartment",
 city: "Queenstown",
 suburb: "Tasman",
 bedrooms: 3,
 bathrooms: 1,
 area: 167,
 images: [
 "/images/property-14.jpg"
 ],
 status: "approved"
 },
 {
 title: "Conveniently Located Flat",
 description: "A fantastic rental opportunity offering comfort and convenience. Perfectly positioned to enjoy the best of the local area, this property features modern amenities and a great layout. Ideal for those seeking a quality home in a vibrant community. Enjoy easy access to public transport, shopping, and dining options.",
 amenities: [
 "Fireplace",
 "Fenced Yard",
 "Built-in Wardrobes",
 "Gym / Fitness Center",
 "Mountain View",
 "Air Conditioning",
 "Ocean View",
 "Elevator / Lift Access"
 ],
 parkingSpaces: 2,
 yearBuilt: 1993,
 price: 3660,
 listingType: "For Rent",
 propertyType: "Villa",
 city: "Tauranga",
 suburb: "Ponsonby",
 bedrooms: 3,
 bathrooms: 2,
 area: 102,
 images: [
 "/images/property-18.jpg"
 ],
 status: "approved"
 },
 {
 title: "Sunny Beachfront Unit",
 description: "A fantastic rental opportunity offering comfort and convenience. Perfectly positioned to enjoy the best of the local area, this property features modern amenities and a great layout. Ideal for those seeking a quality home in a vibrant community. Enjoy easy access to public transport, shopping, and dining options.",
 amenities: [
 "Ocean View",
 "Walk-in Closet",
 "Swimming Pool",
 "Built-in Wardrobes",
 "Furnished",
 "Tennis Court",
 "Balcony / Deck",
 "Elevator / Lift Access"
 ],
 parkingSpaces: 2,
 yearBuilt: 1996,
 price: 3792,
 listingType: "For Rent",
 propertyType: "Villa",
 city: "Auckland",
 suburb: "Te Aro",
 bedrooms: 2,
 bathrooms: 2,
 area: 125,
 images: [
 "/images/property-12.jpg"
 ],
 status: "approved"
 },
 {
 title: "Comfortable Townhouse",
 description: "A fantastic rental opportunity offering comfort and convenience. Perfectly positioned to enjoy the best of the local area, this property features modern amenities and a great layout. Ideal for those seeking a quality home in a vibrant community. Enjoy easy access to public transport, shopping, and dining options.",
 amenities: [
 "Pet Friendly",
 "Ocean View",
 "Elevator / Lift Access",
 "Garage",
 "Balcony / Deck",
 "Secure Parking",
 "Built-in Wardrobes",
 "Spa / Hot Tub"
 ],
 parkingSpaces: 0,
 yearBuilt: 2000,
 price: 3065,
 listingType: "For Rent",
 propertyType: "House",
 city: "Wairarapa",
 suburb: "Renwick",
 bedrooms: 1,
 bathrooms: 1,
 area: 121,
 images: [
 "/images/property-12.jpg"
 ],
 status: "approved"
 },
 {
 title: "Spacious Country Retreat",
 description: "A fantastic rental opportunity offering comfort and convenience. Perfectly positioned to enjoy the best of the local area, this property features modern amenities and a great layout. Ideal for those seeking a quality home in a vibrant community. Enjoy easy access to public transport, shopping, and dining options.",
 amenities: [
 "City Skyline View",
 "Garage",
 "Broadband / WiFi",
 "Built-in Wardrobes",
 "Wheelchair Accessible",
 "Double Glazed Windows",
 "Elevator / Lift Access",
 "Furnished"
 ],
 parkingSpaces: 0,
 yearBuilt: 2017,
 price: 2283,
 listingType: "For Rent",
 propertyType: "Townhouse",
 city: "Wairarapa",
 suburb: "CBD",
 bedrooms: 2,
 bathrooms: 1,
 area: 144,
 images: [
 "/images/property-2.jpg"
 ],
 status: "approved"
 },
 {
 title: "Modern City Centre Apartment",
 description: "A fantastic rental opportunity offering comfort and convenience. Perfectly positioned to enjoy the best of the local area, this property features modern amenities and a great layout. Ideal for those seeking a quality home in a vibrant community. Enjoy easy access to public transport, shopping, and dining options.",
 amenities: [
 "Broadband / WiFi",
 "City Skyline View",
 "Pet Friendly",
 "Dishwasher",
 "Double Glazed Windows",
 "Garage",
 "Spa / Hot Tub",
 "Secure Parking"
 ],
 parkingSpaces: 2,
 yearBuilt: 2003,
 price: 925,
 listingType: "For Rent",
 propertyType: "Apartment",
 city: "Auckland",
 suburb: "Tasman",
 bedrooms: 3,
 bathrooms: 2,
 area: 155,
 images: [
 "/images/property-14.jpg"
 ],
 status: "approved"
 },
 {
 title: "Character Filled Cottage",
 description: "A fantastic rental opportunity offering comfort and convenience. Perfectly positioned to enjoy the best of the local area, this property features modern amenities and a great layout. Ideal for those seeking a quality home in a vibrant community. Enjoy easy access to public transport, shopping, and dining options.",
 amenities: [
 "Broadband / WiFi",
 "Fireplace",
 "Furnished",
 "City Skyline View",
 "Wheelchair Accessible",
 "Pet Friendly",
 "Balcony / Deck",
 "Heating"
 ],
 parkingSpaces: 0,
 yearBuilt: 2003,
 price: 1229,
 listingType: "For Rent",
 propertyType: "Apartment",
 city: "Hamilton",
 suburb: "Renwick",
 bedrooms: 2,
 bathrooms: 2,
 area: 61,
 images: [
 "/images/property-12.jpg"
 ],
 status: "approved"
 },
 {
 title: "Large Family Home",
 description: "A fantastic rental opportunity offering comfort and convenience. Perfectly positioned to enjoy the best of the local area, this property features modern amenities and a great layout. Ideal for those seeking a quality home in a vibrant community. Enjoy easy access to public transport, shopping, and dining options.",
 amenities: [
 "Elevator / Lift Access",
 "Walk-in Closet",
 "Air Conditioning",
 "Double Glazed Windows",
 "Built-in Wardrobes",
 "Broadband / WiFi",
 "Pet Friendly",
 "Furnished"
 ],
 parkingSpaces: 2,
 yearBuilt: 2013,
 price: 3627,
 listingType: "For Rent",
 propertyType: "House",
 city: "Dunedin",
 suburb: "Fendalton",
 bedrooms: 3,
 bathrooms: 1,
 area: 147,
 images: [
 "/images/property-13.jpg"
 ],
 status: "approved"
 },
 {
 title: "Contemporary Unit",
 description: "A fantastic rental opportunity offering comfort and convenience. Perfectly positioned to enjoy the best of the local area, this property features modern amenities and a great layout. Ideal for those seeking a quality home in a vibrant community. Enjoy easy access to public transport, shopping, and dining options.",
 amenities: [
 "Dishwasher",
 "Wheelchair Accessible",
 "Elevator / Lift Access",
 "Double Glazed Windows",
 "Built-in Wardrobes",
 "Garage",
 "Mountain View",
 "Air Conditioning"
 ],
 parkingSpaces: 2,
 yearBuilt: 1994,
 price: 647,
 listingType: "For Rent",
 propertyType: "Villa",
 city: "Hamilton",
 suburb: "Rototuna",
 bedrooms: 2,
 bathrooms: 1,
 area: 90,
 images: [
 "/images/property-18.jpg"
 ],
 status: "approved"
 },
 {
 title: "Premium Executive Rental",
 description: "A fantastic rental opportunity offering comfort and convenience. Perfectly positioned to enjoy the best of the local area, this property features modern amenities and a great layout. Ideal for those seeking a quality home in a vibrant community. Enjoy easy access to public transport, shopping, and dining options.",
 amenities: [
 "Air Conditioning",
 "Built-in Wardrobes",
 "Double Glazed Windows",
 "Heating",
 "Tennis Court",
 "Balcony / Deck",
 "Garage",
 "Spa / Hot Tub"
 ],
 parkingSpaces: 0,
 yearBuilt: 1992,
 price: 3240,
 listingType: "For Rent",
 propertyType: "Villa",
 city: "Hamilton",
 suburb: "Mount Maunganui",
 bedrooms: 2,
 bathrooms: 2,
 area: 148,
 images: [
 "/images/property-15.jpg"
 ],
 status: "approved"
 }
];

export default function SeedPage() {
 const [loading, setLoading] = useState(false);
 const [status, setStatus] = useState("");
 const { user } = useAuth();

 const handleSeed = async () => {
 if (!user) {
 setStatus("Error: You must be logged in to seed the database (Firebase Rules requirement).");
 return;
 }

 setLoading(true);
 setStatus("Seeding database...");
 
 // Helper to generate realistic coordinates for NZ cities
 const getCoordinatesForCity = (city: string) => {
 const baseCoords: Record<string, {lat: number, lng: number}> = {
 "Auckland": { lat: -36.8485, lng: 174.7633 },
 "Wellington": { lat: -41.2865, lng: 174.7762 },
 "Christchurch": { lat: -43.5321, lng: 172.6362 },
 "Queenstown": { lat: -45.0312, lng: 168.6626 },
 "Nelson": { lat: -41.2706, lng: 173.2840 },
 "Tauranga": { lat: -37.6878, lng: 176.1651 },
 "Hamilton": { lat: -37.7870, lng: 175.2793 },
 "Blenheim": { lat: -41.5134, lng: 173.9612 },
 "Wanaka": { lat: -44.7032, lng: 169.1321 },
 "Dunedin": { lat: -45.8788, lng: 170.5028 },
 "Wairarapa": { lat: -41.0667, lng: 175.6500 }
 };
 
 const base = baseCoords[city] || baseCoords["Auckland"];
 // Add slight randomization so markers spread out across the city
 return {
 lat: base.lat + (Math.random() - 0.5) * 0.1,
 lng: base.lng + (Math.random() - 0.5) * 0.1
 };
 };

 let count = 0;
 try {
 setStatus("Cleaning up old dummy properties...");
 const snapshot = await getDocs(collection(db, "properties"));
 const deletePromises: any[] = [];
 snapshot.forEach((document) => {
 if (document.data().isDummy === true) {
 deletePromises.push(deleteDoc(doc(db, "properties", document.id)));
 }
 });
 await Promise.all(deletePromises);

 setStatus("Seeding database with 48 fresh properties...");
 for (const property of dummyProperties) {
 const coords = getCoordinatesForCity(property.city);
 
 await addDoc(collection(db, "properties"), {
 ...property,
 lat: coords.lat,
 lng: coords.lng,
 createdAt: Date.now(),
 ownerId: user.uid,
 isDummy: true
 });
 count++;
 setStatus(`Seeding database... (${count}/24)`);
 }
 setStatus(`Success! Inserted 48 beautiful properties into the database.`);
 } catch (error: any) {
 console.error(error);
 setStatus(`Error: ${error.message}`);
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-6 text-white font-sans">
 <div className="bg-zinc-800 p-8 rounded-2xl max-w-md w-full border border-zinc-700 shadow-2xl">
 <h1 className="text-2xl font-bold mb-4">Database Seeder</h1>
 <p className="text-zinc-400 mb-8 text-sm">
 Click the button below to instantly populate your Firebase Firestore database with 24 high-quality dummy properties (12 for sale, 12 for rent).
 </p>
 
 <button 
 onClick={handleSeed}
 disabled={loading}
 className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl transition-colors mb-4"
 >
 {loading ? "Seeding..." : "Inject 48 Properties"}
 </button>

 {status && (
 <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-700 text-sm font-mono text-emerald-400">
 {status}
 </div>
 )}
 </div>
 </div>
 );
}
