import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Listing from '../models/Listing.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { recalculateListingRating } from '../controllers/reviewController.js';

// Resolve current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Flagship canonical ID for The Oberoi Udaivilas (ensuring existing test suite & bookmarks pass seamlessly)
const OBEROI_UDAIVILAS_ID = '6aa7d647bda80dd066fe3c61';

const getUniqueResortImages = (resortIndex) => {
  const localImages = Array.from(
    { length: 29 },
    (_, index) => `/images/resorts/hotel-${String(index + 1).padStart(3, '0')}.jpg`
  );
  const imageCount = 5;
  const startIndex = (resortIndex * imageCount) % localImages.length;

  return Array.from({ length: imageCount }, (_, imageIndex) =>
    localImages[(startIndex + imageIndex) % localImages.length]
  );
};

const sampleResorts = [
  // 1. The Oberoi Udaivilas (Canonical Flagship)
  {
    _id: new mongoose.Types.ObjectId(OBEROI_UDAIVILAS_ID),
    title: 'The Oberoi Udaivilas',
    category: 'Historical',
    location: {
      address: 'Haridas Ji Ki Magri, Mulla Talai',
      city: 'Udaipur',
      state: 'Rajasthan',
      country: 'India',
    },
    rating: 4.98,
    reviewCount: 94,
    host: {
      name: 'Vikramaditya & Gayatri',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
      bio: 'Custodians of Mewari royal hospitality offering bespoke cultural journeys and luxury palace concierge services.',
      responseRate: '100%',
    },
    guestCapacity: 6,
    bedrooms: 3,
    beds: 4,
    bathrooms: 3.5,
    pricePerNight: 450,
    pricePerNightINR: 37500,
    cleaningFee: 120,
    cleaningFeeINR: 10000,
    serviceFee: 250,
    serviceFeeINR: 20750,
    description:
      'Standing majestically on the 200-year-old hunting grounds of the Maharana of Mewar, The Oberoi Udaivilas is situated on the tranquil banks of Lake Pichola. Boasting interconnecting reflection pools, intricate hand-painted fresco domes, and private boat transfers across the lake, this resort exemplifies royal Indian grandeur combined with five-star luxury.',
    amenities: [
      'Private pool with Lake Pichola view',
      'High-speed Wi-Fi (300 Mbps)',
      'Royal Mewari fine dining',
      '24/7 Personal butler service',
      'Ayurvedic spa sanctuary',
      'Private Shikara lake cruise',
      'Central air conditioning & heating',
      'Peacock courtyard gardens',
      'Valet parking with EV charging',
      'Dedicated executive workspace',
    ],
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: {
      lat: 24.5772,
      lng: 73.6741,
    },
  },

  // 2. Taj Lake Palace
  {
    title: 'Taj Lake Palace',
    category: 'Historical',
    location: {
      address: 'Lake Pichola',
      city: 'Udaipur',
      state: 'Rajasthan',
      country: 'India',
    },
    rating: 4.97,
    reviewCount: 82,
    host: {
      name: 'Rana Pratap Singh',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      bio: 'Heritage preservationist and master concierge at Udaipur’s iconic floating marble palace.',
      responseRate: '100%',
    },
    guestCapacity: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2.5,
    pricePerNight: 480,
    pricePerNightINR: 40000,
    cleaningFee: 130,
    cleaningFeeINR: 10800,
    serviceFee: 260,
    serviceFeeINR: 21500,
    description:
      'An 18th-century royal palace built of gleaming white marble floating serenely in the middle of Lake Pichola. Reached only by private ceremonial royal boat, every room showcases intricate glass inlay, royal tapestries, and unrivaled 360-degree views of the lake and City Palace.',
    amenities: [
      '360° Lake Pichola panoramic views',
      'Exclusive private boat transfer',
      'Jiva Spa boat experience',
      'Fine dining at Neel Kamal',
      'Fast Wi-Fi',
      'Marble soaking tubs',
      'Royal butler service',
      'Sunset flute melodies',
    ],
    images: [
      'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: {
      lat: 24.5753,
      lng: 73.68,
    },
  },

  // 3. Umaid Bhawan Palace
  {
    title: 'Umaid Bhawan Palace',
    category: 'Historical',
    location: {
      address: 'Circuit House Road, Cantt Area',
      city: 'Jodhpur',
      state: 'Rajasthan',
      country: 'India',
    },
    rating: 4.99,
    reviewCount: 110,
    host: {
      name: 'Maharaja Gaj Singh II',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
      bio: 'Preserving the grandeur of the Sun City with authentic royal experiences and heritage treasures.',
      responseRate: '100%',
    },
    guestCapacity: 8,
    bedrooms: 4,
    beds: 5,
    bathrooms: 4.5,
    pricePerNight: 550,
    pricePerNightINR: 45500,
    cleaningFee: 150,
    cleaningFeeINR: 12500,
    serviceFee: 300,
    serviceFeeINR: 25000,
    description:
      'Perched high above the desert capital of Jodhpur, this monumental golden Chittar sandstone palace is one of the world’s largest royal private residences. Spread over 26 acres of manicured gardens with dancing peacocks, an Art Deco subterranean Zodiac pool, and rare museum collections.',
    amenities: [
      'Subterranean Zodiac indoor pool',
      '26 acres of royal private gardens',
      'Champagne museum tour',
      'Tennis & squash courts',
      'Royal Rajasthani banquet hall',
      'High-speed Wi-Fi',
      'Vintage car airport transfers',
    ],
    images: [
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: {
      lat: 26.2808,
      lng: 73.0475,
    },
  },

  // 4. Taj Falaknuma Palace
  {
    title: 'Taj Falaknuma Palace',
    category: 'Historical',
    location: {
      address: 'Engine Bowli, Falaknuma',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
    },
    rating: 4.96,
    reviewCount: 75,
    host: {
      name: 'Nawab Mir Barkat Ali',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
      bio: 'Honoring the legendary opulence and courtly etiquette of the Nizams of Hyderabad.',
      responseRate: '99%',
    },
    guestCapacity: 6,
    bedrooms: 3,
    beds: 3,
    bathrooms: 3.5,
    pricePerNight: 420,
    pricePerNightINR: 35000,
    cleaningFee: 115,
    cleaningFeeINR: 9500,
    serviceFee: 230,
    serviceFeeINR: 19000,
    description:
      'Perched 2,000 feet above Hyderabad, this Italian marble palace was the private home of the world-richest Nizam. Arrive by ceremonial horse-drawn carriage amidst a shower of fresh rose petals to discover Venetian chandeliers, grand marble staircases, and the world’s longest 101-seat dining table.',
    amenities: [
      'Horse-drawn carriage arrival',
      'Rose petal welcome ritual',
      'World-famous 101-seat dining table',
      'Shahi Hyderabadi tasting menu',
      'Jiva Grand Spa',
      'Hookah lounge terrace',
      'Bespoke palace historian walk',
    ],
    images: [
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: {
      lat: 17.3314,
      lng: 78.4677,
    },
  },

  // 5. Alila Fort Bishangarh
  {
    title: 'Alila Fort Bishangarh',
    category: 'Historical',
    location: {
      address: 'Manoharpur, Bishangarh',
      city: 'Jaipur',
      state: 'Rajasthan',
      country: 'India',
    },
    rating: 4.95,
    reviewCount: 64,
    host: {
      name: 'Thakur Jaideep Singh',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
      bio: 'Passionate about ecological preservation and Rajput warrior fortress heritage.',
      responseRate: '100%',
    },
    guestCapacity: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    pricePerNight: 310,
    pricePerNightINR: 25500,
    cleaningFee: 90,
    cleaningFeeINR: 7500,
    serviceFee: 170,
    serviceFeeINR: 14000,
    description:
      'A 230-year-old warrior fortress transformed into a luxurious eco-conscious sanctuary atop a granite hill in the Aravallis. Features dramatic stone turret suites, open-air courtyards, subterranean dungeons converted into organic spas, and stargazing from ancient battlements.',
    amenities: [
      'Hilltop fortress infinity pool',
      'Organic farm-to-table cuisine',
      'Dungeon spa treatments',
      'Astronomy & stargazing deck',
      'Village camel safari',
      'High-speed Wi-Fi',
      'Electric buggy service',
    ],
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: {
      lat: 27.3552,
      lng: 75.9557,
    },
  },

  // 6. Samode Palace & Heritage Retreat
  {
    title: 'Samode Palace',
    category: 'Historical',
    location: {
      address: 'Samode Village, Tehsil Chomu',
      city: 'Jaipur',
      state: 'Rajasthan',
      country: 'India',
    },
    rating: 4.94,
    reviewCount: 58,
    host: {
      name: 'Rawal Raghvendra Singh',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      bio: 'Welcoming global connoisseurs to experience centuries of aristocratic Rajasthani heritage.',
      responseRate: '98%',
    },
    guestCapacity: 4,
    bedrooms: 2,
    beds: 3,
    bathrooms: 2,
    pricePerNight: 280,
    pricePerNightINR: 23000,
    cleaningFee: 80,
    cleaningFeeINR: 6600,
    serviceFee: 150,
    serviceFeeINR: 12500,
    description:
      'A 475-year-old regal mansion hidden in the rugged folds of the Aravalli Hills. Celebrated for its opulent Sheesh Mahal mirror gallery, frescoed halls, marble courtyards, and rooftop mosaic infinity pool with panoramic village views.',
    amenities: [
      'Rooftop mosaic infinity pool',
      'Historic Sheesh Mahal lounge',
      'Courtyard folk dances & music',
      'Ayurvedic wellness center',
      'Jeep desert excursions',
      'Free high-speed Wi-Fi',
    ],
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: {
      lat: 27.2046,
      lng: 75.8184,
    },
  },

  // 7. The Leela Goa
  {
    title: 'The Leela Goa',
    category: 'Beachfront',
    location: {
      address: 'Mobor Beach, Cavelossim',
      city: 'South Goa',
      state: 'Goa',
      country: 'India',
    },
    rating: 4.96,
    reviewCount: 88,
    host: {
      name: 'Sunil & Maria Fernandes',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      bio: 'Curating serene beachfront stays and authentic Goan coastal culinary journeys for 15+ years.',
      responseRate: '100%',
    },
    guestCapacity: 6,
    bedrooms: 3,
    beds: 3,
    bathrooms: 3.5,
    pricePerNight: 320,
    pricePerNightINR: 26500,
    cleaningFee: 95,
    cleaningFeeINR: 7900,
    serviceFee: 175,
    serviceFeeINR: 14500,
    description:
      'Spanning 75 acres of pristine gardens, lotus-filled lagoons, and private frontage on Mobor Beach in South Goa. Inspired by the Vijayanagara Empire with Portuguese colonial accents, offering private plunge pool villas and 12-hole golf links.',
    amenities: [
      'Direct private beach access',
      '12-hole par-3 golf course',
      'Private lagoon pool villa',
      'The Club private lounge & butler',
      'Authentic Goan seafood shack',
      'Yoga pavilion by the sea',
      'Fast Wi-Fi',
    ],
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: {
      lat: 15.158,
      lng: 73.9431,
    },
  },

  // 8. Taj Exotica Resort & Spa
  {
    title: 'Taj Exotica Resort & Spa Goa',
    category: 'Beachfront',
    location: {
      address: 'Calwaddo, Benaulim Beach',
      city: 'South Goa',
      state: 'Goa',
      country: 'India',
    },
    rating: 4.95,
    reviewCount: 76,
    host: {
      name: 'Capt. Jude D’Souza',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
      bio: 'Hospitality veteran providing bespoke beachside tranquility and water-sport adventures.',
      responseRate: '99%',
    },
    guestCapacity: 5,
    bedrooms: 2,
    beds: 3,
    bathrooms: 2.5,
    pricePerNight: 340,
    pricePerNightINR: 28000,
    cleaningFee: 100,
    cleaningFeeINR: 8300,
    serviceFee: 185,
    serviceFeeINR: 15300,
    description:
      'A Mediterranean-inspired sanctuary spread across 56 tranquil acres alongside Benaulim’s soft white sand beach. Palm-shaded pathways, private plunge pools, authentic Ayurvedic therapies, and romantic beachfront cabana dining.',
    amenities: [
      'Private plunge pool',
      'Direct white-sand beach access',
      'Jiva Ayurvedic Spa',
      'Cabana dining by the sea',
      'Tennis & archery lawns',
      'EV car charging station',
      'High-speed Wi-Fi',
    ],
    images: [
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: {
      lat: 15.2505,
      lng: 73.9177,
    },
  },

  // 9. Barefoot at Havelock
  {
    title: 'Barefoot at Havelock',
    category: 'Beachfront',
    location: {
      address: 'Radhanagar Beach No. 7, Swaraj Dweep',
      city: 'Havelock Island',
      state: 'Andaman & Nicobar Islands',
      country: 'India',
    },
    rating: 4.93,
    reviewCount: 69,
    host: {
      name: 'Arun & Samira',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
      bio: 'Pioneering ecological island living and world-class scuba diving in the Andaman archipelago.',
      responseRate: '100%',
    },
    guestCapacity: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    pricePerNight: 220,
    pricePerNightINR: 18000,
    cleaningFee: 65,
    cleaningFeeINR: 5400,
    serviceFee: 120,
    serviceFeeINR: 10000,
    description:
      'Immersed in lush tropical rainforest just steps away from Asia’s finest Radhanagar Beach. Eco-friendly indigenous timber villas with thatch roofing, private hammock verandahs, and direct jungle pathways to crystal turquoise waters.',
    amenities: [
      'Exclusive path to Radhanagar Beach',
      'PADI certified scuba diving center',
      'Snorkeling with marine naturalists',
      'Locally caught organic seafood dining',
      'Open-air jungle showers',
      'Rainforest birdwatching walk',
    ],
    images: [
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: {
      lat: 11.984,
      lng: 92.951,
    },
  },

  // 10. W Goa Beach Sanctuary
  {
    title: 'W Goa',
    category: 'Beachfront',
    location: {
      address: 'Vagator Beach, Bardez',
      city: 'North Goa',
      state: 'Goa',
      country: 'India',
    },
    rating: 4.91,
    reviewCount: 84,
    host: {
      name: 'Natasha Rodrigues',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      bio: 'W Insider curating music, arts, and vibrant coastal luxury escapes.',
      responseRate: '97%',
    },
    guestCapacity: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    pricePerNight: 360,
    pricePerNightINR: 30000,
    cleaningFee: 105,
    cleaningFeeINR: 8700,
    serviceFee: 195,
    serviceFeeINR: 16200,
    description:
      'Perched where the red cliffs of Chapora Fort meet the golden shores of Vagator Beach. Boasts private plunge pools, vibrant coastal architecture, Rockpool cliffside sundowners, and 24-hour Whatever/Whenever luxury concierge service.',
    amenities: [
      'Rockpool cliffside lounge',
      'Private villa plunge pool',
      'Direct cliff-path to Vagator Beach',
      'Away Spa vitality pools',
      'State-of-the-art sound systems',
      'High-speed Wi-Fi',
      '24/7 Concierge',
    ],
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: {
      lat: 15.6022,
      lng: 73.7347,
    },
  },

  // 11. Fisherman's Cove Resort & Spa, Taj
  {
    title: "Fisherman's Cove Resort & Spa",
    category: 'Beachfront',
    location: {
      address: 'Covelong Beach, East Coast Road',
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
    },
    rating: 4.92,
    reviewCount: 61,
    host: {
      name: 'Karthik & Meenakshi',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
      bio: 'Passionate about Coromandel coast heritage, catamaran sailing, and Tamil coastal gastronomy.',
      responseRate: '100%',
    },
    guestCapacity: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    pricePerNight: 240,
    pricePerNightINR: 20000,
    cleaningFee: 70,
    cleaningFeeINR: 5800,
    serviceFee: 130,
    serviceFeeINR: 10800,
    description:
      'Built upon the historic ramparts of an 18th-century Dutch fort overlooking the sparkling Bay of Bengal. Features sea-facing villas with open-air garden showers, private catamaran sailing excursions, and fresh coastal seafood dining under the stars.',
    amenities: [
      'Bay of Bengal sea-facing cottage',
      'Catamaran sailing with local fishermen',
      'Beachside sunken bar & pool',
      'Open-air garden showers',
      'Bicycle tour to Mahabalipuram temples',
      'Fast Wi-Fi',
    ],
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: {
      lat: 12.7937,
      lng: 80.252,
    },
  },

  // 12. Kumarakom Lake Resort
  {
    title: 'Kumarakom Lake Resort',
    category: 'Lakefront',
    location: {
      address: 'North Post, Vembanad Lake',
      city: 'Kumarakom',
      state: 'Kerala',
      country: 'India',
    },
    rating: 4.97,
    reviewCount: 91,
    host: {
      name: 'Unnikrishnan Nair',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
      bio: 'Preserving Kerala’s architectural heritage and authentic Ayurvedic healing traditions.',
      responseRate: '100%',
    },
    guestCapacity: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    pricePerNight: 260,
    pricePerNightINR: 21500,
    cleaningFee: 75,
    cleaningFeeINR: 6200,
    serviceFee: 140,
    serviceFeeINR: 11600,
    description:
      'Often heralded as perhaps the only paradise on earth, this sanctuary sprawls along Lake Vembanad. Authentic 16th-century ancestral Kerala homesteads (Illams) reconstructed timber by timber, with direct access to a 250-meter meandering swimming pool, private houseboats, and Ayurvedic rejuvenation.',
    amenities: [
      'Meandering pool villa access',
      'Private Kettuvallam houseboat cruise',
      'Ayurmana traditional wellness clinic',
      'Sunset classical flute & Kathakali show',
      'Kerala sadhya banana-leaf feasts',
      'Lakefront infinity pool',
    ],
    images: [
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: {
      lat: 9.6175,
      lng: 76.4302,
    },
  },

  // 13. Taj Bekal Resort & Spa
  {
    title: 'Taj Bekal Resort & Spa',
    category: 'Lakefront',
    location: {
      address: 'Kappil Beach, Bekal',
      city: 'Kasaragod',
      state: 'Kerala',
      country: 'India',
    },
    rating: 4.94,
    reviewCount: 52,
    host: {
      name: 'Dr. Anita Kurup',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      bio: 'Passionate promoter of North Kerala backwaters, Theyyam rituals, and wellness holidays.',
      responseRate: '98%',
    },
    guestCapacity: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    pricePerNight: 275,
    pricePerNightINR: 22800,
    cleaningFee: 80,
    cleaningFeeINR: 6600,
    serviceFee: 150,
    serviceFeeINR: 12500,
    description:
      'Inspired by the fluid contours of traditional Kettuvallam houseboats, this resort seamlessly melds into the backwaters of Kappil River before touching the Arabian Sea. Features private plunge pool villas, Chithari river kayaking, and Ayurvedic spa sessions.',
    amenities: [
      'Private courtyard plunge pool',
      'River kayaking & pedal boating',
      'Jiva Grande Spa sanctuary',
      'Seafood grill by the backwaters',
      'Historic Bekal Fort guided tour',
      'Wi-Fi & EV charging',
    ],
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: {
      lat: 12.4045,
      lng: 75.021,
    },
  },

  // 14. Ri Kynjai - Serenity by the Lake
  {
    title: 'Ri Kynjai',
    category: 'Lakefront',
    location: {
      address: 'Umiam Lake, Ri Bhoi District',
      city: 'Shillong',
      state: 'Meghalaya',
      country: 'India',
    },
    rating: 4.95,
    reviewCount: 46,
    host: {
      name: 'Baphilinia Nongkynrih',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      bio: 'Sharing the poetry, living root bridges, and matrilineal traditions of the Khasi Highlands.',
      responseRate: '100%',
    },
    guestCapacity: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    pricePerNight: 210,
    pricePerNightINR: 17500,
    cleaningFee: 60,
    cleaningFeeINR: 5000,
    serviceFee: 115,
    serviceFeeINR: 9500,
    description:
      'Paying homage to traditional Khasi thatched roof architecture, Ri Kynjai (Serenity by the Lake) overlooks the misty expanse of Umiam Lake in the pine-scented hills of Meghalaya. Features hybrid wooden stilt cottages, herbal massage rituals, and indigenous northeastern culinary delicacies.',
    amenities: [
      'Unobstructed Umiam Lake vistas',
      'Khasi herbal steam & massage therapy',
      'Traditional fireplace in bedrooms',
      'Authentic Meghalayan gastronomy',
      'Trek to living root bridges',
      'Boating on Umiam Lake',
    ],
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: {
      lat: 25.666,
      lng: 91.898,
    },
  },

  // 15. Wildflower Hall, An Oberoi Resort
  {
    title: 'Wildflower Hall, An Oberoi Resort',
    category: 'Mountain & Ski',
    location: {
      address: 'Chharabra, Mashobra',
      city: 'Shimla',
      state: 'Himachal Pradesh',
      country: 'India',
    },
    rating: 4.99,
    reviewCount: 104,
    host: {
      name: 'Deepak & Sunita Sharma',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      bio: 'Providing warm Himalayan hospitality and colonial charm at 8,250 feet above sea level.',
      responseRate: '100%',
    },
    guestCapacity: 6,
    bedrooms: 3,
    beds: 3,
    bathrooms: 3.5,
    pricePerNight: 380,
    pricePerNightINR: 31500,
    cleaningFee: 110,
    cleaningFeeINR: 9100,
    serviceFee: 205,
    serviceFeeINR: 17000,
    description:
      'Perched at 8,250 feet amidst 22 acres of fragrant cedar and pine forests, this former summer residence of Lord Kitchener captures the romance of colonial India. Features an outdoor heated whirlpool overlooking snow-capped Himalayan peaks, crackling teakwood fireplaces, and outdoor ice skating in winter.',
    amenities: [
      'Open-air heated mountain whirlpool',
      'Panoramic snow-clad Himalayan views',
      'Lord Kitchener library & snooker room',
      'Nature walks through pine sanctuaries',
      'Winter ice-skating rink',
      'Fine British high tea & bakery',
      'Central heating throughout',
    ],
    images: [
      'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: {
      lat: 31.1215,
      lng: 77.2435,
    },
  },

  // 16. The Khyber Himalayan Resort & Spa
  {
    title: 'The Khyber Himalayan Resort & Spa',
    category: 'Mountain & Ski',
    location: {
      address: 'Gulmarg, Pir Panjal Range',
      city: 'Gulmarg',
      state: 'Jammu & Kashmir',
      country: 'India',
    },
    rating: 4.97,
    reviewCount: 96,
    host: {
      name: 'Mirza Tariq Beg',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
      bio: 'Kashmiri ski expeditionist and luxury host welcoming guests to paradise on earth.',
      responseRate: '100%',
    },
    guestCapacity: 6,
    bedrooms: 3,
    beds: 4,
    bathrooms: 3,
    pricePerNight: 340,
    pricePerNightINR: 28000,
    cleaningFee: 100,
    cleaningFeeINR: 8300,
    serviceFee: 185,
    serviceFeeINR: 15300,
    description:
      'Standing at 8,825 feet in the snow-draped Pir Panjal mountain range, moments from the world’s highest ski gondola. Clad in locally sourced timber and slate with intricate Kashmiri walnut carvings, silk carpets, and an indoor heated swimming pool framed by floor-to-ceiling glass looking out at Apharwat Peak.',
    amenities: [
      'Ski-in / ski-out equipment concierge',
      'Heated indoor panoramic pool',
      'L’Occitane mountain wellness spa',
      'Traditional Kashmiri Wazwan feast',
      'Gulmarg Gondola fast-track access',
      'Underfloor bedroom heating',
    ],
    images: [
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1548777123-e216912df7d8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: {
      lat: 34.0484,
      lng: 74.3805,
    },
  },

  // 17. Ananda in the Himalayas
  {
    title: 'Ananda in the Himalayas',
    category: 'Mountain & Ski',
    location: {
      address: 'The Palace Estate, Narendra Nagar',
      city: 'Rishikesh',
      state: 'Uttarakhand',
      country: 'India',
    },
    rating: 4.99,
    reviewCount: 118,
    host: {
      name: 'Ashok & Priya Kapur',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      bio: 'Dedicated to transformative Ayurvedic journeys, yogic science, and Himalayan tranquility.',
      responseRate: '100%',
    },
    guestCapacity: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2.5,
    pricePerNight: 490,
    pricePerNightINR: 40500,
    cleaningFee: 140,
    cleaningFeeINR: 11600,
    serviceFee: 265,
    serviceFeeINR: 22000,
    description:
      'Spread across the 100-acre Maharaja’s palace estate overlooking the holy Ganges river valley and the foothills of the Himalayas. Globally acclaimed as one of the world’s foremost retreats for classical yoga, Vedanta philosophy, tailored Ayurvedic rejuvenation, and customized organic cuisine.',
    amenities: [
      '24,000 sq.ft Ayurvedic luxury spa',
      'Daily morning yoga & meditation',
      'Ganges river valley viewing decks',
      'Custom dosha-specific organic dining',
      '6-hole golf course & heated lap pool',
      'Private Ganga Aarti excursion',
    ],
    images: [
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: {
      lat: 30.1583,
      lng: 78.2934,
    },
  },

  // 18. Glenburn Tea Estate & Heritage Retreat
  {
    title: 'Glenburn Tea Estate',
    category: 'Mountain & Ski',
    location: {
      address: 'Glenburn Tea Estate, Rang Dung Valley',
      city: 'Darjeeling',
      state: 'West Bengal',
      country: 'India',
    },
    rating: 4.96,
    reviewCount: 54,
    host: {
      name: 'Husna-Tara Prakash',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
      bio: 'Continuing four generations of legendary tea planting traditions and warm colonial hospitality.',
      responseRate: '100%',
    },
    guestCapacity: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    pricePerNight: 330,
    pricePerNightINR: 27500,
    cleaningFee: 95,
    cleaningFeeINR: 7900,
    serviceFee: 180,
    serviceFeeINR: 14900,
    description:
      'A 1,600-acre working tea plantation founded by Scottish tea planters in 1859. Offers planter’s bungalow suites with dramatic vistas of Mount Kanchenjunga, tea tasting masterclasses, and private picnics on the banks of glacial mountain rivers.',
    amenities: [
      'Mount Kanchenjunga views from bed',
      'Tea factory masterclass & tasting',
      'Glacial river picnic with bonfire',
      'Colonial roll-top cast iron baths',
      'Hand-embroidered linen beds',
      'Campfire evening dinners',
    ],
    images: [
      'https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: {
      lat: 27.085,
      lng: 88.297,
    },
  },

  // 19. Moksha Himalaya Spa Resort
  {
    title: 'Moksha Himalaya Spa Resort',
    category: 'Mountain & Ski',
    location: {
      address: 'Timber Trail Heights, Parwanoo',
      city: 'Parwanoo',
      state: 'Himachal Pradesh',
      country: 'India',
    },
    rating: 4.92,
    reviewCount: 62,
    host: {
      name: 'Rohan & Sanya Garg',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
      bio: 'Providing blissful highland escapes accessible by panoramic Swiss cable cars.',
      responseRate: '99%',
    },
    guestCapacity: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    pricePerNight: 250,
    pricePerNightINR: 20500,
    cleaningFee: 75,
    cleaningFeeINR: 6200,
    serviceFee: 135,
    serviceFeeINR: 11200,
    description:
      'Accessible solely by an exhilarating cable car journey soaring 5,000 feet above the Kaushalya river valley. Features heated infinity pools cantilevered over pine-covered ravines, Turkish hammam therapies, and serene mountain sunsets.',
    amenities: [
      'Panoramic scenic cable car journey',
      'Cantilevered mountain infinity pool',
      'Ayurvedic and Turkish hammam spa',
      'Valley-view open-air Jacuzzi',
      'Multi-cuisine terrace restaurant',
      'Free Wi-Fi',
    ],
    images: [
      'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: {
      lat: 30.835,
      lng: 76.963,
    },
  },

  // 20. Evolve Back, Kabini
  {
    title: 'Evolve Back Kabini',
    category: 'Tropical',
    location: {
      address: 'Bheeramballi Village, Nagarhole Tiger Reserve',
      city: 'Kabini',
      state: 'Karnataka',
      country: 'India',
    },
    rating: 4.98,
    reviewCount: 87,
    host: {
      name: 'Dr. George & Maya Ramapuram',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
      bio: 'Leading conservation-first luxury eco-tourism bordering South India’s premier tiger reserves.',
      responseRate: '100%',
    },
    guestCapacity: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    pricePerNight: 360,
    pricePerNightINR: 30000,
    cleaningFee: 105,
    cleaningFeeINR: 8700,
    serviceFee: 195,
    serviceFeeINR: 16200,
    description:
      'Bordered on two sides by the Kabini River and enveloped by Nagarhole National Park. Inspired by the indigenous Kuruba village architecture, featuring private pool huts with thatched roofs, boat safaris to observe herds of wild Asian elephants, and twilight storytelling.',
    amenities: [
      'Private courtyard pool hut',
      'Kabini River boat & jeep safari',
      'Vaidyasala Ayurvedic wellness center',
      'Riverfront infinity pool',
      'Resident naturalist wildlife lectures',
      'Coracle boat rides at sunrise',
    ],
    images: [
      'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: {
      lat: 11.936,
      lng: 76.242,
    },
  },

  // 21. The Tamara Coorg Rainforest Retreat
  {
    title: 'The Tamara Coorg',
    category: 'Tropical',
    location: {
      address: 'Kabbinakad Estate, Yevakapadi',
      city: 'Coorg',
      state: 'Karnataka',
      country: 'India',
    },
    rating: 4.95,
    reviewCount: 71,
    host: {
      name: 'Shruti Shibulal',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      bio: 'Passionate about sustainable luxury and biodiversity in the UNESCO Western Ghats.',
      responseRate: '100%',
    },
    guestCapacity: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    pricePerNight: 260,
    pricePerNightINR: 21500,
    cleaningFee: 75,
    cleaningFeeINR: 6200,
    serviceFee: 140,
    serviceFeeINR: 11600,
    description:
      'Suspended on elevated wooden stilts high above 180 acres of organic coffee, cardamom, and pepper plantations in the Western Ghats biodiversity hotspot. Experience private waterfall trekking, custom coffee brewing, and yoga atop forest canopies.',
    amenities: [
      'Elevated wooden stilt cottage',
      'Private waterfall nature trek',
      'Custom coffee blending & roasting studio',
      'Elevation Spa on river rocks',
      'Yoga pavilion amidst cardamom blossoms',
      'High-speed Wi-Fi',
    ],
    images: [
      'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: {
      lat: 12.215,
      lng: 75.728,
    },
  },

  // 22. Spice Tree Munnar Nature Retreat
  {
    title: 'SpiceTree Munnar',
    category: 'Tropical',
    location: {
      address: 'Muttukadu, Chinnakanal',
      city: 'Munnar',
      state: 'Kerala',
      country: 'India',
    },
    rating: 4.93,
    reviewCount: 49,
    host: {
      name: 'Mathew & Reena Kurian',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
      bio: 'Sharing the secret spice valleys and tea trails of the High Ranges of Kerala.',
      responseRate: '98%',
    },
    guestCapacity: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    pricePerNight: 190,
    pricePerNightINR: 15800,
    cleaningFee: 55,
    cleaningFeeINR: 4500,
    serviceFee: 100,
    serviceFeeINR: 8300,
    description:
      'Tucked between the scenic valleys of Kannan Devan Hills and Bison Valley in Munnar. Features handcrafted stone pool suites, personal yoga retreats, plantation treks through cardamom groves, and panoramic views of cloud-swept tea slopes.',
    amenities: [
      'Private plunge pool with valley view',
      'Cardamom & pepper plantation walk',
      'Traditional solar-heated copper baths',
      'Tea tasting and artisanal baking classes',
      'Book lounge with fireplace',
      'High-speed Wi-Fi',
    ],
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: {
      lat: 10.024,
      lng: 77.165,
    },
  },

  // 23. The Machan Treehouse Sanctuary
  {
    title: 'The Machan',
    category: 'Tropical',
    location: {
      address: 'Private Road, Atvan',
      city: 'Lonavala',
      state: 'Maharashtra',
      country: 'India',
    },
    rating: 4.92,
    reviewCount: 66,
    host: {
      name: 'Varun & Sanjit Hooja',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      bio: 'Eco-pioneers providing off-grid architectural treehouse escapes in ancient forests.',
      responseRate: '100%',
    },
    guestCapacity: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    pricePerNight: 230,
    pricePerNightINR: 19000,
    cleaningFee: 65,
    cleaningFeeINR: 5400,
    serviceFee: 125,
    serviceFeeINR: 10400,
    description:
      'An exclusive eco-luxury resort with architectural treehouses rising 30 to 45 feet above the lush canopy of the Western Ghats. Featuring brass bathtubs overlooking emerald valleys, open-air stargazing decks, and 100% off-grid solar energy.',
    amenities: [
      'Elevated treehouse 45ft above forest',
      'Open-to-sky brass bathtubs',
      'Stargazing deck with telescope',
      'Campfire & acoustic music nights',
      'Guided rainforest butterfly walks',
      'Gourmet forest dining',
    ],
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: {
      lat: 18.706,
      lng: 73.376,
    },
  },

  // 24. Suryagarh Desert Citadel
  {
    title: 'Suryagarh Jaisalmer',
    category: 'Desert Escapes',
    location: {
      address: 'Kahala Phata, Sam Road',
      city: 'Jaisalmer',
      state: 'Rajasthan',
      country: 'India',
    },
    rating: 4.96,
    reviewCount: 80,
    host: {
      name: 'Manvendra Singh Shekhawat',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
      bio: 'Reviving Thar desert folklore, nomadic trails, and majestic sandstone architecture.',
      responseRate: '100%',
    },
    guestCapacity: 6,
    bedrooms: 3,
    beds: 3,
    bathrooms: 3.5,
    pricePerNight: 290,
    pricePerNightINR: 24000,
    cleaningFee: 85,
    cleaningFeeINR: 7000,
    serviceFee: 155,
    serviceFeeINR: 12800,
    description:
      'A golden sandstone citadel rising proudly out of the Great Thar Desert. Experience traditional Rajasthani sufi music under desert starscapes, sunset camel rides through golden dunes, private stepwell dinners, and royal haldi spa ceremonies.',
    amenities: [
      'Thar desert camel safaris',
      'Private stepwell musical dinners',
      'Rait salt-water indoor pool & spa',
      'Traditional Manganiyar folk performances',
      'Desert archery & falconry displays',
      'High-speed Wi-Fi',
    ],
    images: [
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: {
      lat: 26.9015,
      lng: 70.835,
    },
  },

  // 25. Aman-i-Khás Luxury Safari Camp
  {
    title: 'Aman-i-Khas',
    category: 'Desert Escapes',
    location: {
      address: 'Sherpur, Khiljipur, Near National Park Gate',
      city: 'Ranthambore',
      state: 'Rajasthan',
      country: 'India',
    },
    rating: 4.99,
    reviewCount: 92,
    host: {
      name: 'Ranthambore Naturalist Team',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      bio: 'Expert tiger trackers and conservationists offering elite wilderness luxury.',
      responseRate: '100%',
    },
    guestCapacity: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    pricePerNight: 650,
    pricePerNightINR: 54000,
    cleaningFee: 180,
    cleaningFeeINR: 15000,
    serviceFee: 350,
    serviceFeeINR: 29000,
    description:
      'An ultraluxury Mughal-style tented encampment set on the rugged threshold of Ranthambore National Park. Soaring white cotton canvas tents with draped bedrooms, sunken marble baths, central outdoor stepwell fireplace, and twice-daily Royal Bengal tiger safaris with master naturalists.',
    amenities: [
      'Twice-daily private 4x4 tiger safaris',
      'Outdoor stepwell campfire gatherings',
      'Personal batman (private butler)',
      'Organic camp garden dining',
      'Traditional Ayurvedic massage tent',
      'High-speed Wi-Fi',
    ],
    images: [
      'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: {
      lat: 26.023,
      lng: 76.452,
    },
  },
];

const seedReviewsForResort = async (listingId, resortTitle) => {
  const reviews = [
    {
      listingId,
      author: {
        name: 'Devika Sharma',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        location: 'New Delhi, India',
      },
      rating: 5,
      categoryRatings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 5 },
      comment: `Our stay at ${resortTitle} was extraordinary! The royal hospitality, authentic architecture, and tranquil surroundings made this a bucket-list stay. Highly recommended!`,
      createdAt: new Date('2026-08-15'),
    },
    {
      listingId,
      author: {
        name: 'Alexander Wright',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
        location: 'London, UK',
      },
      rating: 5,
      categoryRatings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 5 },
      comment: 'Impeccably maintained and architecturally breathtaking. The dual currency pricing and seamless reservation made planning our Indian holiday effortless.',
      createdAt: new Date('2026-08-01'),
    },
    {
      listingId,
      author: {
        name: 'Ananya & Rohan Iyer',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
        location: 'Bengaluru, India',
      },
      rating: 5,
      categoryRatings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 5 },
      comment: 'A magnificent experience from check-in to departure. The staff went above and beyond, and the authentic regional cuisine was unforgettable.',
      createdAt: new Date('2026-07-20'),
    },
  ];

  await Review.deleteMany({ listingId });
  await Review.insertMany(reviews);
  await recalculateListingRating(listingId);
};

const seedDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/Airbnb';

  try {
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    const hostEmail = process.env.HOST_EMAIL || 'admin@gmail.com';
    const hostPassword = process.env.HOST_PASSWORD || 'admin123';
    const hostHash = await bcrypt.hash(hostPassword, 10);
    await User.findOneAndUpdate(
      { email: hostEmail },
      { $set: { name: 'Havenly Host Admin', email: hostEmail, password: hostHash, role: 'host', bio: 'Host account for managing Havenly stays.' } },
      { upsert: true, new: true }
    );
    console.log(`Host login ready: ${hostEmail} / ${hostPassword}`);

    const demoEmail = process.env.DEMO_EMAIL || 'traveler.demo@havenly.local';
    const demoPassword = process.env.DEMO_PASSWORD || 'HavenlyStay2026!';
    const demoHash = await bcrypt.hash(demoPassword, 10);
    await User.findOneAndUpdate(
      { email: demoEmail },
      { $setOnInsert: { name: 'Avery Morgan', email: demoEmail, password: demoHash, role: 'guest', bio: 'Demo traveler account for local development.' } },
      { upsert: true, new: true }
    );
    console.log(`Demo login ready: ${demoEmail} / ${demoPassword}`);

    // Remove any stale non-Indian listings
    const purgeResult = await Listing.deleteMany({ 'location.country': { $ne: 'India' } });
    if (purgeResult.deletedCount > 0) {
      console.log(`  ✓ Cleaned up ${purgeResult.deletedCount} non-Indian legacy listings.`);
    }

    const canonicalTitles = sampleResorts.map((resort) => resort.title);
    const staleIndianResult = await Listing.deleteMany({
      'location.country': 'India',
      title: { $nin: canonicalTitles },
    });
    if (staleIndianResult.deletedCount > 0) {
      console.log(`  ✓ Cleaned up ${staleIndianResult.deletedCount} stale Indian listing variants.`);
    }

    console.log(`\nSeeding ${sampleResorts.length} luxury Indian resorts into MongoDB...`);

    const seededListings = [];
    for (const resort of sampleResorts) {
      const resortIndex = sampleResorts.indexOf(resort);
      resort.images = getUniqueResortImages(resortIndex);
      let listing;
      if (resort._id) {
        // Upsert by ID for canonical The Oberoi Udaivilas
        listing = await Listing.findByIdAndUpdate(resort._id, resort, { upsert: true, new: true, setDefaultsOnInsert: true });
      } else {
        // Upsert by title
        listing = await Listing.findOneAndUpdate({ title: resort.title }, resort, { upsert: true, new: true, setDefaultsOnInsert: true });
      }

      await seedReviewsForResort(listing._id, listing.title);
      seededListings.push(listing);
      console.log(`  ✓ Seeded: ${listing.title} (${listing.category}) -> $${listing.pricePerNight} / ₹${listing.pricePerNightINR} [ID: ${listing._id}]`);
    }

    console.log('\n========================================================');
    console.log(`SUCCESSFULLY SEEDED ${seededListings.length} INDIAN LUXURY RESORTS & REVIEWS!`);
    console.log('========================================================');
    console.log('Database: Airbnb');
    console.log('Canonical ID 6aa7d647bda80dd066fe3c61 -> The Oberoi Udaivilas, Udaipur');
    console.log('All 25 resorts feature dual pricing in USD ($) and INR (₹).');
    console.log('========================================================\n');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
