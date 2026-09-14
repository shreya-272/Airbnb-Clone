import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Listing from '../models/Listing.js';
import Review from '../models/Review.js';
import { recalculateListingRating } from '../controllers/reviewController.js';

// Resolve current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Preserve the original canonical ID for Villa Paradiso
const VILLA_PARADISO_ID = '6aa7d647bda80dd066fe3c61';

const sampleResorts = [
  {
    _id: new mongoose.Types.ObjectId(VILLA_PARADISO_ID),
    title: 'Villa Paradiso - Cliffside Luxury Ocean Villa',
    category: 'Beachfront',
    location: {
      address: 'Via Panoramica 14',
      city: 'Amalfi',
      state: 'Campania',
      country: 'Italy',
    },
    rating: 4.98,
    reviewCount: 68,
    host: {
      name: 'Isabella',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      bio: 'Dedicated luxury property host on the Amalfi Coast providing tailored concierge experiences.',
      responseRate: '100%',
    },
    guestCapacity: 8,
    bedrooms: 4,
    beds: 5,
    bathrooms: 4.5,
    pricePerNight: 385,
    cleaningFee: 150,
    serviceFee: 273,
    description:
      'Perched high on the private cliffs of Amalfi, Villa Paradiso offers unrivaled panoramic vistas across the Mediterranean Sea. Featuring private infinity swimming pools, lush olive groves, and architectural glass walls, this villa blends timeless Italian elegance with contemporary luxury.',
    amenities: [
      'Infinity pool & hot tub',
      'Fast Wi-Fi (250 Mbps)',
      'Free parking with EV charger',
      'Chef kitchen with wood pizza oven',
      '75-inch 4K Cinema TV',
      'Central air conditioning',
      'Ocean view',
      'Dedicated workspace',
      'Washer & dryer',
      'Outdoor dining area',
      'Beach access',
    ],
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: { lat: 40.634, lng: 14.6027 },
  },
  {
    title: 'Kandolhu Island Overwater Sanctuary',
    category: 'Overwater',
    location: {
      address: 'North Ari Atoll Marina',
      city: 'North Ari Atoll',
      state: 'Alif Alif Atoll',
      country: 'Maldives',
    },
    rating: 5.0,
    reviewCount: 42,
    host: {
      name: 'Farhad & Aishath',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      bio: 'Maldivian native marine biologists hosting boutique overwater bungalows with private reef access.',
      responseRate: '100%',
    },
    guestCapacity: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    pricePerNight: 890,
    cleaningFee: 200,
    serviceFee: 310,
    description:
      'Float over crystal-clear turquoise waters in this architectural glass-floored overwater bungalow. Features direct ladder access to a vibrant coral reef, an infinity plunge pool cantilevered above the lagoon, and bespoke outdoor sunken bathtubs.',
    amenities: [
      'Overwater infinity plunge pool',
      'Direct lagoon & reef access',
      'Glass viewing floor panel',
      'Private speed boat transfers',
      'Complimentary snorkel gear',
      'Outdoor rainfall shower',
      'High-speed satellite Wi-Fi',
      'Sunset cocktail deck',
      'Espresso bar',
    ],
    images: [
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: { lat: 3.9926, lng: 72.8726 },
  },
  {
    title: 'Bambu Indah Eco Forest Treehouse',
    category: 'Tropical',
    location: {
      address: 'Jl. Baung, Sayan',
      city: 'Ubud',
      state: 'Bali',
      country: 'Indonesia',
    },
    rating: 4.96,
    reviewCount: 89,
    host: {
      name: 'Wayan & Ketut',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
      bio: 'Pioneers in regenerative bamboo architecture offering immersive jungle sanctuaries in Ubud.',
      responseRate: '99%',
    },
    guestCapacity: 6,
    bedrooms: 3,
    beds: 3,
    bathrooms: 3,
    pricePerNight: 320,
    cleaningFee: 95,
    serviceFee: 140,
    description:
      'Immerse yourself in Bali’s sacred Ayung River valley. Crafted entirely from curvaceous black bamboo, this open-air luxury treehouse offers spring-water plunge pools, private yoga decks, and breathtaking views over lush rice terraces.',
    amenities: [
      'Natural spring-water pool',
      'Open-air bamboo architecture',
      'Organic farm-to-table breakfast',
      'Private yoga shala',
      'River valley view',
      'Jungle massage pavilion',
      'Fast fiber Wi-Fi',
      'Artisanal coffee bar',
    ],
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: { lat: -8.5069, lng: 115.2625 },
  },
  {
    title: 'Chalet Zermatt Peak Luxury Alpine',
    category: 'Mountain & Ski',
    location: {
      address: 'Triftschlucht 2',
      city: 'Zermatt',
      state: 'Valais',
      country: 'Switzerland',
    },
    rating: 4.99,
    reviewCount: 35,
    host: {
      name: 'Christophe',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
      bio: 'Swiss certified ski guide and hospitality connoisseur in the heart of the Alps.',
      responseRate: '100%',
    },
    guestCapacity: 10,
    bedrooms: 5,
    beds: 6,
    bathrooms: 5.5,
    pricePerNight: 1250,
    cleaningFee: 350,
    serviceFee: 420,
    description:
      'A premier five-star private chalet with unobstructed panoramas of the iconic Matterhorn. Features floor-to-ceiling glass windows, indoor/outdoor heated jacuzzi, private Finnish sauna, walk-in wine cellar, and ski-in/ski-out accessibility.',
    amenities: [
      'Direct Matterhorn mountain views',
      'Indoor/outdoor heated Jacuzzi',
      'Finnish dry sauna & steam room',
      'Private ski boot warmer room',
      'Grand stone fireplace',
      'Private elevator',
      'Full gourmet chef kitchen',
      'Sommelier wine cellar',
    ],
    images: [
      'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519643381401-22c77e60520e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: { lat: 45.9765, lng: 7.7491 },
  },
  {
    title: 'Amangiri Desert Mirage Pavilion',
    category: 'Desert Escapes',
    location: {
      address: '1 Kayenta Road',
      city: 'Canyon Point',
      state: 'Utah',
      country: 'United States',
    },
    rating: 5.0,
    reviewCount: 54,
    host: {
      name: 'Sarah & David',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      bio: 'Architectural curators providing tranquil minimalist pavilions across the American Southwest.',
      responseRate: '100%',
    },
    guestCapacity: 6,
    bedrooms: 3,
    beds: 3,
    bathrooms: 3.5,
    pricePerNight: 1450,
    cleaningFee: 280,
    serviceFee: 490,
    description:
      'Hidden within the dramatic rock formations of Southern Utah, this modern minimalist pavilion blends seamlessly into the dramatic sandstone mesa. Enjoy private plunge pools, starlight courtyard beds, outdoor firepits, and guided canyon adventures.',
    amenities: [
      'Private sandstone plunge pool',
      'Stargazing courtyard with daybed',
      'Outdoor gas fire pit',
      'Minimalist concrete soaking tub',
      'Panoramic desert mesa vistas',
      'High-speed Starlink Wi-Fi',
      'Sub-Zero gourmet kitchen',
    ],
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: { lat: 37.0189, lng: -111.5976 },
  },
  {
    title: 'Santorini Caldera Sunset Cave Villa',
    category: 'Beachfront',
    location: {
      address: 'Oia Main Pedestrian Street',
      city: 'Oia',
      state: 'Santorini',
      country: 'Greece',
    },
    rating: 4.97,
    reviewCount: 112,
    host: {
      name: 'Nikolaos',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      bio: 'Lifelong Oia resident restoring traditional Cycladic cave homes into luxury cliffside retreats.',
      responseRate: '100%',
    },
    guestCapacity: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    pricePerNight: 540,
    cleaningFee: 120,
    serviceFee: 190,
    description:
      'Carved directly into the volcanic cliffs of Oia, this whitewashed Cycladic cave sanctuary commands world-famous views over the Aegean Sea and caldera. Features a heated outdoor cave jacuzzi and an expansive sunset cocktail terrace.',
    amenities: [
      'Heated cliffside Caldera Jacuzzi',
      'World-famous Oia sunset view',
      'Authentic Cycladic architecture',
      'Daily Greek artisan breakfast',
      'Private terrace with sun loungers',
      'Nespresso coffee station',
      'Porter service included',
    ],
    images: [
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: { lat: 36.4618, lng: 25.3753 },
  },
  {
    title: 'The Glasshouse Lake Wakatipu Estate',
    category: 'Lakefront',
    location: {
      address: 'Closeburn Beach Road',
      city: 'Queenstown',
      state: 'Otago',
      country: 'New Zealand',
    },
    rating: 4.95,
    reviewCount: 38,
    host: {
      name: 'Oliver & Mia',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      bio: 'Kiwi architects designing ultra-modern lakefront homes integrated with Southern Alps topography.',
      responseRate: '100%',
    },
    guestCapacity: 8,
    bedrooms: 4,
    beds: 4,
    bathrooms: 4,
    pricePerNight: 780,
    cleaningFee: 220,
    serviceFee: 260,
    description:
      'Perched on the serene shores of Lake Wakatipu with direct private jetty access. Floor-to-ceiling glass walls capture reflections of The Remarkables mountain range. Features a sunken hot tub, cedar sauna, and outdoor lakeside fire pit.',
    amenities: [
      'Private lake jetty & kayaks',
      'Sunken hot tub with lake views',
      'Cedar outdoor sauna',
      'Lakeside stone fire pit',
      'State-of-the-art home cinema',
      'Gourmet kitchen & wine cooler',
      'Heated timber floorboards',
    ],
    images: [
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: { lat: -45.0312, lng: 168.6626 },
  },
  {
    title: 'Kasbah Tamadot Royal Riad & Spa',
    category: 'Historical',
    location: {
      address: 'Route d’Asni, High Atlas',
      city: 'Asni',
      state: 'Marrakesh-Safi',
      country: 'Morocco',
    },
    rating: 4.98,
    reviewCount: 61,
    host: {
      name: 'Youssef',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
      bio: 'Curator of traditional Moroccan royal riads and master Berber craftsman.',
      responseRate: '100%',
    },
    guestCapacity: 6,
    bedrooms: 3,
    beds: 3,
    bathrooms: 3.5,
    pricePerNight: 620,
    cleaningFee: 160,
    serviceFee: 210,
    description:
      'Nestled high in Morocco’s High Atlas Mountains, this historic Berber palace showcases handcrafted zellij tilework, carved cedar archways, and a private heated courtyard pool. Savor tagines prepared by private chefs under ancient olive trees.',
    amenities: [
      'Private heated courtyard pool',
      'Traditional Moroccan Hammam',
      'Rooftop Atlas mountain lounge',
      'Private chef dining service',
      'Artisanal hand-woven carpets',
      'Air conditioning & central heating',
      'Scenic valley hiking trails',
    ],
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: { lat: 31.25, lng: -7.98 },
  },
  {
    title: 'Soneva Kiri Private Beach Haven',
    category: 'Tropical',
    location: {
      address: '110 Moo 4, Koh Kood',
      city: 'Koh Kood',
      state: 'Trat',
      country: 'Thailand',
    },
    rating: 5.0,
    reviewCount: 47,
    host: {
      name: 'Sonu & Eva',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      bio: 'Pioneers of slow-life luxury, sustainable barefoot opulence, and organic island living.',
      responseRate: '100%',
    },
    guestCapacity: 6,
    bedrooms: 3,
    beds: 3,
    bathrooms: 3,
    pricePerNight: 950,
    cleaningFee: 240,
    serviceFee: 320,
    description:
      'Set along a pristine stretch of white sand on the untamed island of Koh Kood. This vast timber villa features a curvaceous private pool, an outdoor open-air cinema, private electric buggy, and treepod dining experiences suspended in tropical trees.',
    amenities: [
      'Private freeform saltwater pool',
      'Direct powdery white beach access',
      'Private electric buggy provided',
      'Outdoor Cinema Paradiso',
      'Open-air tropical stone bathroom',
      'Complimentary organic chocolate parlour',
      'Starlight observatory access',
    ],
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: { lat: 11.6667, lng: 102.5667 },
  },
  {
    title: 'Hacienda De San Antonio Volcanic Estate',
    category: 'Historical',
    location: {
      address: 'Km 24 Carretera Comala',
      city: 'Comala',
      state: 'Colima',
      country: 'Mexico',
    },
    rating: 4.96,
    reviewCount: 31,
    host: {
      name: 'Don Mateo',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      bio: 'Equestrian rancher and third-generation guardian of historical colonial Mexican haciendas.',
      responseRate: '100%',
    },
    guestCapacity: 8,
    bedrooms: 4,
    beds: 4,
    bathrooms: 4.5,
    pricePerNight: 480,
    cleaningFee: 140,
    serviceFee: 165,
    description:
      'A majestic 19th-century colonial coffee plantation estate at the foot of the Colima Volcano. Boasting 110-foot outdoor swimming pools, vaulted courtyards, manicured rose gardens, and private equestrian stables for volcano trail rides.',
    amenities: [
      '110-foot historic swimming pool',
      'Active volcano panoramic view',
      'Private equestrian stable & horses',
      'Artisanal coffee tasting room',
      'Organic orchard & farm access',
      'Grand colonial fireplaces',
      'Tennis court & pickleball',
    ],
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: { lat: 19.3897, lng: -103.7667 },
  },
  {
    title: 'Kyoto Arashiyama Bamboo Machiya Sanctuary',
    category: 'Historical',
    location: {
      address: 'Sagatenryuji Susukinobabacho',
      city: 'Kyoto',
      state: 'Kyoto Prefecture',
      country: 'Japan',
    },
    rating: 4.99,
    reviewCount: 76,
    host: {
      name: 'Kenji & Kazuki',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
      bio: 'Kyoto master carpenters preserving centuries-old Sukiya-style residential culture.',
      responseRate: '100%',
    },
    guestCapacity: 4,
    bedrooms: 2,
    beds: 4,
    bathrooms: 2,
    pricePerNight: 410,
    cleaningFee: 110,
    serviceFee: 145,
    description:
      'A meticulously restored century-old Machiya steps from the Arashiyama Bamboo Forest. Features cedar hinoki soaking onsens, peaceful Japanese rock gardens, tatami dining suites, and private matcha tea ceremonies.',
    amenities: [
      'Private cedar Hinoki Onsen bath',
      'Traditional Zen moss & rock garden',
      'Tatami tea ceremony room',
      'Heated cedar flooring',
      'Quiet riverside neighbourhood',
      'Bespoke yukata robes provided',
      'Ultra-fast Wi-Fi (500 Mbps)',
    ],
    images: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: { lat: 35.0163, lng: 135.6713 },
  },
  {
    title: 'Bora Bora Horizon Lagoon Villa',
    category: 'Overwater',
    location: {
      address: 'Motu Piti Aau Beachfront',
      city: 'Bora Bora',
      state: 'Leeward Islands',
      country: 'French Polynesia',
    },
    rating: 5.0,
    reviewCount: 65,
    host: {
      name: 'Teiva & Marama',
      isSuperhost: true,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
      bio: 'Tahitian ocean navigators hosting intimate overwater villas with views of Mount Otemanu.',
      responseRate: '100%',
    },
    guestCapacity: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2.5,
    pricePerNight: 1100,
    cleaningFee: 260,
    serviceFee: 380,
    description:
      'Perched directly over the luminous turquoise lagoon with front-row vistas of Mount Otemanu. Includes catamaran net sundecks, outrigger canoe breakfast delivery directly to your dock, and an infinity plunge pool seamlessly meeting the sea.',
    amenities: [
      'Private infinity plunge pool over lagoon',
      'Mount Otemanu panoramic views',
      'Catamaran net suspended over water',
      'Canoe breakfast delivery service',
      'Private stand-up paddleboards & kayaks',
      'Outdoor glass shower with sea view',
      'Air conditioning in all suites',
    ],
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: { lat: -16.5004, lng: -151.7415 },
  },
];

const seedReviewsForResort = async (listingId, resortTitle) => {
  const reviews = [
    {
      listingId,
      author: {
        name: 'Sophia Martinez',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
        location: 'San Francisco, CA',
      },
      rating: 5,
      categoryRatings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 5 },
      comment: `Staying at ${resortTitle} was an unforgettable dream experience. The views, amenities, and hospitality were beyond five stars.`,
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
      comment: 'Impeccably maintained and architecturally stunning. Everything functioned flawlessly from booking to checkout.',
      createdAt: new Date('2026-08-01'),
    },
    {
      listingId,
      author: {
        name: 'Elena Rostova',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
        location: 'Zurich, Switzerland',
      },
      rating: 5,
      categoryRatings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 5 },
      comment: 'The location is peaceful and breathtaking. The host went above and beyond to make our stay extraordinary.',
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

    console.log(`\nSeeding ${sampleResorts.length} luxury resorts into MongoDB...`);

    const seededListings = [];
    for (const resort of sampleResorts) {
      let listing;
      if (resort._id) {
        // Upsert by ID for canonical Villa Paradiso
        listing = await Listing.findByIdAndUpdate(resort._id, resort, { upsert: true, new: true, setDefaultsOnInsert: true });
      } else {
        // Upsert by title
        listing = await Listing.findOneAndUpdate({ title: resort.title }, resort, { upsert: true, new: true, setDefaultsOnInsert: true });
      }

      await seedReviewsForResort(listing._id, listing.title);
      seededListings.push(listing);
      console.log(`  ✓ Seeded: ${listing.title} (${listing.category}) -> ID: ${listing._id}`);
    }

    console.log('\n========================================================');
    console.log(`SUCCESSFULLY SEEDED ${seededListings.length} LUXURY RESORTS & REVIEWS!`);
    console.log('========================================================');
    console.log('MongoDB Database: Airbnb');
    console.log('All resorts are visible and inspectable in MongoDB Compass.');
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
