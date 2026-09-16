export interface SuburbInfo {
  slug: string;
  name: string;
  region: string;
  district: string;
  headline: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  heroImage: string;
  medianPrice: string;
  averageRentWeekly: string;
  commute: string;
  schools: string[];
  lifestyleText: string;
  highlights: string[];
  faqs: { question: string; answer: string }[];
}

export const SUBURBS_DATA: Record<string, SuburbInfo> = {
  papakura: {
    slug: "papakura",
    name: "Papakura & Rosehill",
    region: "Auckland",
    district: "South Auckland",
    headline: "Modern Townhouses, Family Freehold Homes & Rapid Capital Growth",
    metaTitle: "Houses for Sale in Papakura & Rosehill Auckland | Heaven Bricks",
    metaDescription: "Explore houses and new townhouses for sale in Papakura and Rosehill, Auckland. Learn median prices, top school zones, transport, and free property appraisals.",
    keywords: [
      "Houses for sale Papakura",
      "Papakura real estate NZ",
      "Rosehill Auckland homes for sale",
      "Townhouses Papakura",
      "Papakura property appraisal",
      "South Auckland real estate brokers",
      "Papakura property values 2026"
    ],
    heroImage: "/auckland.png",
    medianPrice: "$875,000 NZD",
    averageRentWeekly: "$650 / wk",
    commute: "32 mins to Auckland CBD via Southern Motorway or Papakura Train Station",
    schools: ["Rosehill College", "Papakura High School", "Rosehill Intermediate", "St Mary's Catholic School"],
    lifestyleText: "Papakura and Rosehill represent one of Auckland's fastest-growing residential and investment corridors. Offering exceptional value, spacious freehold sections, and new master-planned subdivisions, it is a prime choice for first-home buyers, families, and high-yield property investors.",
    highlights: [
      "Direct rapid transit connection to Auckland CBD via Papakura Train Station",
      "Top local secondary education at Rosehill College",
      "Rapidly developing infrastructure and retail precincts",
      "High rental demand and attractive gross rental yields"
    ],
    faqs: [
      {
        question: "What is the median house price in Papakura, Auckland?",
        answer: "As of 2026, the median residential sales price in Papakura and Rosehill ranges between $820,000 and $920,000 NZD, depending on whether it is a modern standalone freehold home or a newly completed terrace townhouse."
      },
      {
        question: "Is Papakura a good suburb for property investment?",
        answer: "Yes, Papakura is widely considered one of South Auckland's top capital growth and yield corridors due to major council infrastructure upgrades, proximity to the motorway network, and strong rental yields averaging 4.5% to 5.2%."
      },
      {
        question: "What schools are in the Papakura and Rosehill zone?",
        answer: "Papakura is home to reputable schools including Rosehill College, Rosehill Intermediate, Papakura Central School, and St Mary's Catholic School, making it attractive for growing families."
      },
      {
        question: "How do I get a free property appraisal in Papakura?",
        answer: "Heaven Bricks provides complimentary, confidential market appraisals for homeowners in Papakura and Rosehill. Simply contact our Auckland office or submit an appraisal request through our website."
      }
    ]
  },
  remuera: {
    slug: "remuera",
    name: "Remuera",
    region: "Auckland",
    district: "Central Auckland",
    headline: "Prestigious Estates, Double Grammar Zone Mansions & Heritage Villas",
    metaTitle: "Luxury Homes for Sale in Remuera Auckland | Double Grammar Zone | Heaven Bricks",
    metaDescription: "Discover luxury estates, architectural masterpieces, and Double Grammar Zone homes for sale in Remuera, Auckland. Confidential sales and expert broker representation.",
    keywords: [
      "Remuera luxury homes for sale",
      "Double Grammar Zone properties Auckland",
      "Remuera real estate brokers",
      "Mansions for sale Remuera",
      "Victoria Avenue homes Auckland",
      "Off-market luxury real estate NZ"
    ],
    heroImage: "/auckland.png",
    medianPrice: "$2,650,000 NZD",
    averageRentWeekly: "$1,150 / wk",
    commute: "10 mins to Auckland CBD & Newmarket luxury shopping precinct",
    schools: ["Auckland Grammar School", "Epsom Girls Grammar School (EGGS)", "Remuera Primary School", "Kings School", "Baradene College"],
    lifestyleText: "Remuera is Auckland's most prestigious leafy residential enclave. Renowned for tree-lined avenues, private botanical grounds, and grand heritage architecture, Remuera offers discerning buyers access to world-class private and Double Grammar schooling.",
    highlights: [
      "Coveted Double Grammar Zone (Auckland Grammar & EGGS)",
      "Unrivaled proximity to Newmarket, Parnell, and Auckland CBD",
      "Consistently New Zealand's highest-performing capital growth suburb",
      "Confidential off-market luxury estates and private viewing services"
    ],
    faqs: [
      {
        question: "Why are Remuera properties in such high demand?",
        answer: "Remuera combines historic architectural distinction with the coveted Double Grammar school zone, close proximity to Auckland's best private schools, and convenient access to the CBD and Newmarket luxury retail."
      },
      {
        question: "What is the Double Grammar Zone (DGZ)?",
        answer: "The Double Grammar Zone is a prestigious school zoning area in central Auckland that grants automatic enrollment rights to Auckland Grammar School (for boys) and Epsom Girls Grammar School (EGGS). Properties within this zone command substantial premiums."
      },
      {
        question: "Can I sell my Remuera home off-market confidentially?",
        answer: "Yes, Heaven Bricks specializes in discrete, confidential off-market brokerage for high-value Remuera estates. We match pre-qualified VIP buyers without public price declarations or open home signs."
      }
    ]
  },
  ponsonby: {
    slug: "ponsonby",
    name: "Ponsonby & Grey Lynn",
    region: "Auckland",
    district: "Central Auckland",
    headline: "Restored Victorian & Edwardian Character Villas, Cosmopolitan Urban Residences",
    metaTitle: "Villas & Character Homes for Sale in Ponsonby Auckland | Heaven Bricks",
    metaDescription: "Browse restored character villas and luxury urban residences for sale in Ponsonby and Grey Lynn, Auckland. Walk to award-winning cafes, bistros, and boutiques.",
    keywords: [
      "Ponsonby villas for sale",
      "Grey Lynn character homes Auckland",
      "Ponsonby Road real estate",
      "Luxury villas Auckland",
      "Ponsonby property agents NZ"
    ],
    heroImage: "/auckland.png",
    medianPrice: "$2,150,000 NZD",
    averageRentWeekly: "$980 / wk",
    commute: "5 mins to Auckland CBD & Wynyard Quarter",
    schools: ["Ponsonby Primary School", "Ponsonby Intermediate", "Western Springs College", "St Mary's College"],
    lifestyleText: "Ponsonby is the vibrant cultural and culinary heartbeat of Auckland. Tree-lined streets lined with meticulously restored heritage villas meet chic fashion boutiques, artisanal bakeries, and fine-dining establishments along Ponsonby Road.",
    highlights: [
      "Walkable urban lifestyle with world-class dining along Ponsonby Road",
      "Timeless Victorian and Edwardian architectural character",
      "High historical capital appreciation and premium rental yields",
      "Minutes to the Waitemata Harbour, Westhaven Marina, and the CBD"
    ],
    faqs: [
      {
        question: "What makes Ponsonby character villas so popular?",
        answer: "Ponsonby villas feature heritage craftsmanship, soaring ceilings, native Kauri flooring, and ornate verandahs, frequently paired with modern architecturally designed rear extensions and swimming pools."
      },
      {
        question: "How far is Ponsonby from central Auckland?",
        answer: "Ponsonby is located immediately adjacent to Auckland CBD—less than 5 minutes by car or bus, and easily walkable for city professionals."
      }
    ]
  },
  takapuna: {
    slug: "takapuna",
    name: "Takapuna",
    region: "North Shore, Auckland",
    district: "North Shore",
    headline: "Beachfront Penthouses, Coastal Residences & North Shore Luxury",
    metaTitle: "Waterfront & Beach Homes for Sale in Takapuna Auckland | Heaven Bricks",
    metaDescription: "Find beachfront penthouses and coastal family homes for sale in Takapuna, North Shore Auckland. Enjoy white sand beaches, Lake Pupuke, and vibrant coastal dining.",
    keywords: [
      "Takapuna beachfront homes for sale",
      "North Shore real estate Auckland",
      "Takapuna penthouses",
      "Lake Pupuke properties",
      "Takapuna real estate agents"
    ],
    heroImage: "/auckland.png",
    medianPrice: "$1,550,000 NZD",
    averageRentWeekly: "$850 / wk",
    commute: "15 mins across the Auckland Harbour Bridge to CBD",
    schools: ["Takapuna Grammar School", "Westlake Girls High School", "Takapuna Normal Intermediate", "Takapuna Primary"],
    lifestyleText: "Takapuna is the premier coastal urban hub of Auckland's North Shore. Positioned between the golden sands of Takapuna Beach and the tranquil waters of freshwater Lake Pupuke, Takapuna delivers an unmatched seaside lifestyle with upscale shopping, theatres, and cafes.",
    highlights: [
      "Direct access to golden sand Takapuna Beach and coastal walks to Milford",
      "Waterfront dining, beachside markets, and boutique retail at Shore City",
      "Top academic institutions including Takapuna Grammar School",
      "Rapid commute to Auckland CBD across the Harbour Bridge"
    ],
    faqs: [
      {
        question: "What is the lifestyle like living in Takapuna?",
        answer: "Takapuna offers a relaxed seaside holiday atmosphere year-round with morning swims, stand-up paddleboarding on Lake Pupuke, and evening dinners along Hurstmere Road, all while being just 15 minutes from Auckland CBD."
      },
      {
        question: "Are there beachfront apartments in Takapuna?",
        answer: "Yes, Takapuna is home to some of Auckland's finest luxury waterfront towers and boutique penthouse developments featuring panoramic views across Rangitoto Island and the Hauraki Gulf."
      }
    ]
  },
  queenstown: {
    slug: "queenstown",
    name: "Queenstown & Arrowtown",
    region: "Otago / Southern Lakes",
    district: "Queenstown-Lakes",
    headline: "Alpine Architectural Masterpieces, Cliffside Retreats & Lake Wakatipu Views",
    metaTitle: "Luxury Alpine Estates & Homes for Sale in Queenstown NZ | Heaven Bricks",
    metaDescription: "Discover luxury alpine lodges, lakeside estates, and confidential properties for sale in Queenstown, Arrowtown, and Lake Wakatipu. New Zealand's premier resort destination.",
    keywords: [
      "Queenstown luxury real estate",
      "Lake Wakatipu estates for sale",
      "Arrowtown homes for sale",
      "Alpine lodges Queenstown NZ",
      "Jacks Point properties for sale",
      "Queenstown property investment"
    ],
    heroImage: "/queenstown.png",
    medianPrice: "$1,750,000 NZD",
    averageRentWeekly: "$950 / wk",
    commute: "10 mins to Queenstown International Airport (direct Sydney/Melbourne flights)",
    schools: ["Wakatipu High School", "Queenstown Primary", "Arrowtown School", "Remarkables Primary School"],
    lifestyleText: "Queenstown is New Zealand's crown jewel—an internationally celebrated four-season resort destination. From dramatic cantilevered cliffside mansions overlooking Lake Wakatipu to heritage stone cottages in Arrowtown, Queenstown offers extraordinary living surrounded by the Southern Alps.",
    highlights: [
      "Spectacular alpine vistas of The Remarkables and Lake Wakatipu",
      "World-class winter ski fields at Coronet Peak and The Remarkables",
      "Championship golf courses including Millbrook Resort and Jacks Point",
      "Queenstown International Airport with direct flights to Australia"
    ],
    faqs: [
      {
        question: "Can foreign or overseas buyers purchase property in Queenstown?",
        answer: "Under New Zealand's Overseas Investment Act (OIA), Australian and Singaporean citizens can purchase residential property freely. Other international buyers may qualify under specific exemptions or for qualifying new apartment developments. Heaven Bricks provides confidential advisory."
      },
      {
        question: "Is Queenstown a good investment for short-term luxury rentals?",
        answer: "Yes, Queenstown has historically delivered exceptional short-term holiday rental returns and consistent capital appreciation, bolstered by strong year-round domestic and international tourism."
      }
    ]
  },
  "wellington-central": {
    slug: "wellington-central",
    name: "Wellington Central & Oriental Bay",
    region: "Wellington",
    district: "Wellington City",
    headline: "Harbour View Penthouses, Historic City Residences & Capital Living",
    metaTitle: "Apartments & Homes for Sale in Wellington Central & Oriental Bay | Heaven Bricks",
    metaDescription: "Explore luxury apartments, Oriental Bay waterfront residences, and central city homes for sale in Wellington, New Zealand. Walk to Lambton Quay and waterfront dining.",
    keywords: [
      "Wellington apartments for sale",
      "Oriental Bay luxury real estate",
      "Wellington Central homes for sale",
      "Wellington property investment",
      "Capital real estate New Zealand"
    ],
    heroImage: "/wellington.png",
    medianPrice: "$1,050,000 NZD",
    averageRentWeekly: "$720 / wk",
    commute: "Walkable to Lambton Quay, Parliament, and Te Papa Waterfront",
    schools: ["Wellington College", "Wellington Girls' College", "Wellington High School", "Thorndon School"],
    lifestyleText: "Wellington Central and Oriental Bay represent the pinnacle of vibrant urban coastal living in New Zealand's capital. Enjoy waterfront walks, a thriving theatre and coffee culture, and panoramic views across Wellington Harbour.",
    highlights: [
      "Scenic harbourfront living along prestigious Oriental Parade",
      "Completely walkable city lifestyle with world-class coffee and culinary scene",
      "Close proximity to the government precinct, tech sector, and universities",
      "High tenant demand from professional diplomats and corporate executives"
    ],
    faqs: [
      {
        question: "What makes Oriental Bay so desirable?",
        answer: "Oriental Bay is often called Wellington's Riviera, boasting golden sand beaches, sweeping harbour views, beautiful sunshine orientation, and minutes-walk proximity to the city centre."
      },
      {
        question: "Are apartments in Wellington Central a good rental investment?",
        answer: "Yes, central Wellington offers some of New Zealand's lowest vacancy rates and strongest rental yields due to a dense concentration of government professionals, parliamentarians, and university students."
      }
    ]
  }
};
