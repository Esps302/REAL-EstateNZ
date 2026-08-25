const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/seed/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const allAmenities = [
  "Air Conditioning", "Swimming Pool", "Balcony / Deck", "Gym / Fitness Center", 
  "Built-in Wardrobes", "Dishwasher", "Fenced Yard", "Furnished", 
  "Garage", "Heating", "Broadband / WiFi", "Pet Friendly", 
  "Security System", "Spa / Hot Tub", "Tennis Court", "Walk-in Closet", 
  "Ocean View", "Mountain View", "City Skyline View", "Solar Panels", 
  "Double Glazed Windows", "Elevator / Lift Access", "Fireplace", "Secure Parking", "Wheelchair Accessible"
];

function getRandomAmenities() {
  const shuffled = allAmenities.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * 8) + 6); // 6 to 13 amenities
}

// Simple regex to find each object in the array and inject fields
const objectRegex = /description:\s*"([^"]+)",/g;

content = content.replace(objectRegex, (match, desc) => {
    const amenitiesStr = JSON.stringify(getRandomAmenities());
    const parking = Math.floor(Math.random() * 3) + 1;
    const year = 1990 + Math.floor(Math.random() * 34);
    
    // Make description longer
    const expandedDesc = desc + " This property is a rare find on the market, offering unparalleled luxury and convenience. The expansive open-plan living areas flow seamlessly into the outdoor entertainment spaces, creating the perfect environment for hosting guests or relaxing with family. Premium finishes and fixtures have been used throughout, ensuring a sophisticated and modern aesthetic. Don't miss this opportunity to secure your dream lifestyle in one of the most sought-after locations.";
    
    return `description: "${expandedDesc}",\n    amenities: ${amenitiesStr},\n    parkingSpaces: ${parking},\n    yearBuilt: ${year},`;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated seed file!");
