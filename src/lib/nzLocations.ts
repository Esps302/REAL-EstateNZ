export type LocationsType = Record<string, Record<string, string[]>>;

export const nzLocations: LocationsType = {
 "Auckland": {
 "Auckland City": ["Auckland Central", "Ponsonby", "Grey Lynn", "Parnell", "Remuera", "Mt Eden", "Epsom", "Mission Bay", "Kohimarama", "St Heliers", "Point Chevalier", "Mt Albert", "Newmarket"],
 "North Shore City": ["Takapuna", "Devonport", "Milford", "Birkenhead", "Albany", "Glenfield", "Browns Bay", "Northcote"],
 "Manukau City": ["Howick", "Pakuranga", "Botany Downs", "Manurewa", "Papatoetoe", "Mangere", "Flat Bush", "Clevedon"],
 "Waitakere City": ["Henderson", "Titirangi", "Te Atatu", "Massey", "New Lynn", "Hobsonville", "Swanson"],
 "Rodney": ["Orewa", "Silverdale", "Warkworth", "Whangaparaoa", "Kumeu", "Helensville"],
 "Franklin": ["Pukekohe", "Waiuku", "Karaka", "Tuakau"],
 "Papakura": ["Papakura", "Takanini", "Drury"]
 },
 "Wellington": {
 "Wellington City": ["Wellington Central", "Te Aro", "Mt Victoria", "Thorndon", "Kelburn", "Karori", "Newtown", "Miramar", "Island Bay", "Khandallah", "Johnsonville", "Tawa"],
 "Lower Hutt City": ["Lower Hutt Central", "Petone", "Eastbourne", "Wainuiomata", "Stokes Valley", "Avalon"],
 "Upper Hutt City": ["Upper Hutt Central", "Silverstream", "Trentham", "Wallaceville"],
 "Porirua City": ["Porirua Central", "Titahi Bay", "Whitby", "Aotea", "Plimmerton", "Pukerua Bay"],
 "Kapiti Coast": ["Paraparaumu", "Waikanae", "Raumati", "Otaki", "Paekakariki"]
 },
 "Canterbury": {
 "Christchurch City": ["Christchurch Central", "Merivale", "Fendalton", "Riccarton", "Cashmere", "St Albans", "Shirley", "Papanui", "Halswell", "Sumner", "Redcliffs", "New Brighton"],
 "Selwyn": ["Rolleston", "Lincoln", "Prebbleton", "Darfield", "Leeston"],
 "Waimakariri": ["Rangiora", "Kaiapoi", "Woodend", "Pegasus", "Oxford"],
 "Timaru": ["Timaru Central", "Washdyke", "Highfield", "Gleniti", "Temuka", "Geraldine"]
 },
 "Waikato": {
 "Hamilton City": ["Hamilton Central", "Hamilton East", "Claudelands", "Chartwell", "Rototuna", "Flagstaff", "Hillcrest", "Dinsdale", "Frankton"],
 "Waipa": ["Cambridge", "Te Awamutu", "Kihikihi", "Pirongia"],
 "Waikato District": ["Ngaruawahia", "Huntly", "Raglan", "Te Kauwhata"],
 "Thames-Coromandel": ["Thames", "Whitianga", "Whangamata", "Coromandel", "Tairua", "Pauanui"],
 "Taupo": ["Taupo Central", "Turangi", "Kinloch", "Nukuhau", "Richmond Heights"]
 },
 "Otago": {
 "Dunedin City": ["Dunedin Central", "North Dunedin", "South Dunedin", "St Clair", "Roslyn", "Maori Hill", "Mornington", "Mosgiel", "Port Chalmers"],
 "Queenstown-Lakes": ["Queenstown", "Arrowtown", "Wanaka", "Frankton", "Kelvin Heights", "Arthurs Point", "Albert Town", "Hawea"],
 "Central Otago": ["Cromwell", "Alexandra", "Clyde", "Roxburgh"]
 },
 "Bay of Plenty": {
 "Tauranga City": ["Tauranga Central", "Mt Maunganui", "Papamoa", "Welcome Bay", "Bethlehem", "Otumoetai", "Greerton"],
 "Rotorua": ["Rotorua Central", "Ngongotaha", "Lynmore", "Owhata", "Kawaha Point", "Glenholme"],
 "Western Bay of Plenty": ["Te Puke", "Katikati", "Omokoroa", "Waihi Beach"],
 "Whakatane": ["Whakatane Central", "Ohope", "Edgecumbe"]
 },
 "Hawke's Bay": {
 "Napier City": ["Napier Central", "Taradale", "Ahuriri", "Marewa", "Tamatea", "Greenmeadows"],
 "Hastings": ["Hastings Central", "Havelock North", "Flaxmere", "Clive"],
 "Central Hawke's Bay": ["Waipukurau", "Waipawa"]
 },
 "Manawatu-Wanganui": {
 "Palmerston North City": ["Palmerston North Central", "Hokowhitu", "Terrace End", "Awapuni", "Milson", "Kelvin Grove"],
 "Whanganui": ["Whanganui Central", "Springvale", "Gonville", "Castlecliff", "Durie Hill"],
 "Manawatu": ["Feilding", "Rongotea"]
 },
 "Northland": {
 "Whangarei": ["Whangarei Central", "Kamo", "Tikipunga", "Onerahi", "Kensington", "Morningside"],
 "Far North": ["Kerikeri", "Kaitaia", "Kaikohe", "Paihia", "Russell", "Mangonui"],
 "Kaipara": ["Dargaville", "Mangawhai", "Maungaturoto"]
 },
 "Taranaki": {
 "New Plymouth": ["New Plymouth Central", "Fitzroy", "Strandon", "Merrilands", "Moturoa", "Westown", "Bell Block", "Waitara"],
 "South Taranaki": ["Hawera", "Eltham", "Opunake", "Patea"],
 "Stratford": ["Stratford Central"]
 },
 "Nelson-Tasman": {
 "Nelson City": ["Nelson Central", "Stoke", "Tahunanui", "Washington Valley", "Atawhai", "The Wood"],
 "Tasman": ["Richmond", "Motueka", "Mapua", "Brightwater", "Wakefield"]
 },
 "Marlborough": {
 "Marlborough": ["Blenheim", "Picton", "Renwick", "Havelock", "Seddon"]
 },
 "Southland": {
 "Invercargill City": ["Invercargill Central", "Windsor", "Waverley", "Richmond", "Glengarry", "Grasmere", "Bluff"],
 "Southland District": ["Winton", "Riverton", "Te Anau", "Lumsden"],
 "Gore": ["Gore Central", "Mataura"]
 },
 "Gisborne": {
 "Gisborne": ["Gisborne Central", "Kaiti", "Mangapapa", "Whataupoko", "Elgin", "Wainui"]
 },
 "West Coast": {
 "Grey": ["Greymouth", "Cobden", "Blaketown", "Runanga"],
 "Buller": ["Westport", "Reefton", "Karamea"],
 "Westland": ["Hokitika", "Franz Josef", "Fox Glacier"]
 }
};

// Removed strict helper types to prevent index typing errors
