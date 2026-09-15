import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Compass,
  MapPin,
  MessageCircle,
  Music,
  Sparkles,
  Utensils,
  WalletCards,
} from 'lucide-react';

const EXPERIENCES = [
  { id: 'royal', label: 'Royal heritage', description: 'Palaces, craft, and slow afternoons', category: 'Historical', image: '/images/resorts/hotel-006.jpg', match: 'Taj Lake Palace' },
  { id: 'coast', label: 'Coastal reset', description: 'Sea air, spa rituals, and fresh food', category: 'Beachfront', image: '/images/resorts/hotel-001.jpg', match: 'The Leela Goa' },
  { id: 'wellness', label: 'Wellness retreat', description: 'Quiet mornings and restorative rituals', category: 'Mountain & Ski', image: '/images/resorts/hotel-012.jpg', match: 'Ananda in the Himalayas' },
  { id: 'wild', label: 'Wild India', description: 'Forest trails and unforgettable sightings', category: 'Tropical', image: '/images/resorts/hotel-018.jpg', match: 'Evolve Back Kabini' },
];

const DESTINATIONS = [
  ['Rajasthan', 'Royal routes and desert evenings', 'hotel-010.jpg', ['Dal baati churma', 'Laal maas', 'Ghewar'], 'Dress respectfully at forts and ask before photographing artisans.', ['Panna Meena ka Kund', 'Bera leopard village', 'Bagru block-printing workshop']],
  ['Goa', 'Coastal calm with a generous table', 'hotel-004.jpg', ['Goan fish curry', 'Bebinca', 'Poi bread'], 'Choose quieter beaches, carry reef-safe sunscreen, and keep the coast clean.', ['Fontainhas heritage lanes', 'Chorao mangrove island', 'Kakolem hidden beach']],
  ['Kerala', 'Backwaters, spice, and gentle days', 'hotel-014.jpg', ['Appam and stew', 'Sadya', 'Payasam'], 'Remove shoes at temples and enjoy a slower pace around waterways.', ['Kumbalangi village', 'Marari fishing hamlet', 'Paniyeli Poru rapids']],
  ['Uttarakhand', 'Forest air and Himalayan stillness', 'hotel-012.jpg', ['Kafuli', 'Bal mithai', 'Aloo ke gutke'], 'Keep mountain trails quiet and carry reusable water bottles.', ['Kanakchauri village', 'Binsar zero-point', 'Pangot birding trail']],
  ['Himachal Pradesh', 'Pines, cafés, and high valleys', 'hotel-016.jpg', ['Siddu', 'Dham', 'Tudkiya bhath'], 'Respect village customs and avoid littering on high-altitude trails.', ['Jibhi waterfall', 'Gadsa valley', 'Chitkul village walk']],
  ['Karnataka', 'Coffee country and wild forests', 'hotel-018.jpg', ['Coorg pandi curry', 'Neer dosa', 'Mysore pak'], 'Use certified guides in protected forest areas.', ['Kudremukh grasslands', 'Mandalpatti sunrise', 'Nagarhole safari gate']],
  ['Tamil Nadu', 'Temple towns and the southern coast', 'hotel-020.jpg', ['Chettinad curry', 'Pongal', 'Kothu parotta'], 'Dress modestly at temples and check photography rules.', ['Pichavaram mangroves', 'Chettinad mansion trail', 'Tharangambadi fort']],
  ['Maharashtra', 'Urban energy and monsoon forts', 'hotel-022.jpg', ['Misal pav', 'Puran poli', 'Vada pav'], 'Hire local fort guides and leave no trace in the Sahyadris.', ['Kaas plateau', 'Bhandardara lakeside', 'Korlai lighthouse']],
  ['Sikkim', 'Monasteries, clouds, and cardamom', 'hotel-024.jpg', ['Momos', 'Thukpa', 'Gundruk'], 'Carry permits and speak softly inside monasteries.', ['Zuluk old silk route', 'Temi tea garden', 'Ralong hot springs']],
  ['Assam', 'Tea gardens and river islands', 'hotel-026.jpg', ['Masor tenga', 'Pitha', 'Khar'], 'Use a naturalist for wildlife areas and support local tea estates.', ['Majuli satra villages', 'Haflong lake', 'Dibrugarh tea trails']],
  ['Odisha', 'Sacred art and lagoon mornings', 'hotel-028.jpg', ['Dalma', 'Chhena poda', 'Pakhala bhata'], 'Ask before photographing artisans and temple rituals.', ['Raghurajpur craft village', 'Mangalajodi wetlands', 'Daringbadi hills']],
  ['Andaman', 'Clear water and island time', 'hotel-003.jpg', ['Coconut curry', 'Grilled reef fish', 'Prawn koliwada'], 'Protect coral, avoid single-use plastic, and follow beach closures.', ['Kalapathar beach', 'Baratang limestone caves', 'Chidiya Tapu sunset']],
  ['Gujarat', 'Craft, salt flats, and coastal light', 'hotel-008.jpg', ['Dhokla', 'Undhiyu', 'Fafda-jalebi'], 'Support artisan cooperatives and respect village photography etiquette.', ['Nirona craft village', 'Little Rann birding', 'Lakhpat fort']],
  ['Telangana', 'Deccan history and lively kitchens', 'hotel-009.jpg', ['Hyderabadi biryani', 'Haleem', 'Qubani ka meetha'], 'Dress respectfully at historic and religious sites.', ['Bhongir fort climb', 'Ananthagiri forest', 'Bidri craft quarter']],
  ['Madhya Pradesh', 'Tiger country and ancient stone', 'hotel-011.jpg', ['Poha', 'Bhutte ka kees', 'Dal bafla'], 'Follow safari rules and never approach wildlife.', ['Orchha cenotaphs', 'Pachmarhi forest', 'Bhojpur temple']],
  ['West Bengal', 'Tea hills and colonial lanes', 'hotel-013.jpg', ['Momos', 'Kosha mangsho', 'Sandesh'], 'Keep viewpoints quiet and support small tea growers.', ['Lepchajagat forest', 'Makaibari tea estate', 'Cooch Behar palace']],
  ['Andhra Pradesh', 'Coastal temples and red earth', 'hotel-015.jpg', ['Gongura pachadi', 'Pesarattu', 'Pulihora'], 'Cover shoulders at temples and use local transport where possible.', ['Araku coffee trail', 'Gandikota canyon', 'Lambasingi sunrise']],
  ['Rishikesh', 'River rituals and mountain wellness', 'hotel-017.jpg', ['Aloo puri', 'Kumaoni thali', 'Jhangore ki kheer'], 'Keep the Ganga clean and follow rafting safety guidance.', ['Neer waterfall', 'Kunjapuri sunrise', 'Phool Chatti trail']],
  ['Jaisalmer', 'Golden stone and desert skies', 'hotel-019.jpg', ['Ker sangri', 'Murg-e-sabz', 'Makhaniya lassi'], 'Choose responsible camel operators and conserve water.', ['Kuldhara village', 'Khuri dunes', 'Longewala memorial']],
  ['Udaipur', 'Lakes, frescoes, and slow romance', 'hotel-021.jpg', ['Gatte ki sabzi', 'Mewari thali', 'Malpua'], 'Ask before entering private courtyards and dress for heritage sites.', ['Menar bird village', 'Badi lake trail', 'Ahar cenotaphs']],
  ['Jodhpur', 'Blue lanes and Marwar kitchens', 'hotel-023.jpg', ['Makhaniya lassi', 'Mirchi vada', 'Mawa kachori'], 'Walk residential lanes quietly and shop directly from craftspeople.', ['Chandelao village', 'Osian temples', 'Rao Jodha desert park']],
  ['Jaipur', 'Pink-city craft and royal design', 'hotel-025.jpg', ['Pyaaz kachori', 'Ghevar', 'Laal maas'], 'Book artisan visits through local studios and respect palace rules.', ['Abhaneri stepwell', 'Sambhar salt lake', 'Khazana Mahal craft lane']],
  ['Kashmir', 'Meadows, saffron, and lake mornings', 'hotel-027.jpg', ['Rogan josh', 'Gushtaba', 'Kahwa'], 'Dress warmly and buy verified local handicrafts.', ['Tarsar Marsar trail', 'Aru village', 'Pampore saffron fields']],
  ['Pondicherry', 'French lanes and Bay of Bengal calm', 'hotel-029.jpg', ['Crepes', 'South Indian thali', 'Puducherry fish curry'], 'Dress modestly at ashrams and keep heritage lanes peaceful.', ['Pichavaram day trip', 'Ousteri lake', 'Auroville forest paths']],
  ['Lakshadweep', 'Unhurried lagoons and coral light', 'hotel-007.jpg', ['Tuna curry', 'Coconut rice', 'Island roti'], 'Follow marine permits and never touch coral or shells.', ['Kavaratti lagoon', 'Bangaram sandbar', 'Agatti reef snorkel']],
].map(([name, subtitle, image, foods, culture, moments]) => ({ name, subtitle, image: `/images/resorts/${image}`, foods, culture, moments }));

export default function IndiaJourneys({ onSelectListing }) {
  const [activeTab, setActiveTab] = useState('matcher');
  const [selectedExperience, setSelectedExperience] = useState('royal');
  const [days, setDays] = useState(4);
  const [budget, setBudget] = useState(80000);
  const [guests, setGuests] = useState(2);
  const [destination, setDestination] = useState('Rajasthan');

  const selected = EXPERIENCES.find((item) => item.id === selectedExperience) || EXPERIENCES[0];
  const nightlyEstimate = Math.round(budget / Math.max(days - 1, 1));
  const stayEstimate = nightlyEstimate * Math.max(days - 1, 1);
  const extrasEstimate = Math.max(6500, Math.round(budget * 0.18));
  const perGuest = Math.round((stayEstimate + extrasEstimate) / guests);
  const destinationData = DESTINATIONS.find((item) => item.name === destination) || DESTINATIONS[0];

  const itinerary = useMemo(() => Array.from({ length: days }, (_, index) => {
    const dayPlans = [
      [`Arrive in ${destinationData.name}`, `Check in, unpack, enjoy a welcome drink, and take a gentle sunset walk around your resort.`],
      ['Taste the local morning', `Start with ${destinationData.foods[0]}, then visit a neighbourhood market and meet a local maker.`],
      [`Discover ${destinationData.moments[0]}`, `Leave after breakfast for ${destinationData.moments[0]}. Keep the afternoon slow for photographs and chai.`],
      [`Explore ${destinationData.moments[1]}`, `Take a local guide to ${destinationData.moments[1]}, then return for a regional dinner featuring ${destinationData.foods[1]}.`],
      [`A hidden day in ${destinationData.name}`, `Follow a quieter route to ${destinationData.moments[2]}; this is the day for the place most visitors miss.`],
      ['A restorative morning', `Sleep in, book a wellness ritual, and enjoy ${destinationData.foods[2]} before one last neighbourhood walk.`],
      ['Leave room for wonder', 'Keep the final day flexible: revisit your favourite corner, shop thoughtfully, and depart without rushing.'],
    ];
    const plan = dayPlans[index] || [`A deeper day in ${destinationData.name}`, `Take an unhurried second look at ${destinationData.moments[index % destinationData.moments.length]}, with time for a long lunch and a local recommendation.`];
    return { day: index + 1, title: plan[0], detail: plan[1] };
  }), [days, destinationData]);

  return (
    <main className="page-wash min-h-[calc(100vh-80px)] px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-7xl space-y-8 animate-fade-in">
        <section className="relative overflow-hidden rounded-[2rem] bg-[#24332f] px-6 py-10 text-white shadow-floating sm:px-12 sm:py-14">
          <img src="/images/resorts/hotel-010.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#182824] via-[#24332f]/90 to-transparent" />
          <div className="relative max-w-2xl space-y-5">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[#f8c8ae]"><Sparkles className="h-4 w-4" /> India, considered</p>
            <h1 className="font-display text-4xl leading-tight sm:text-6xl">Plan a stay that feels like yours.</h1>
            <p className="max-w-xl text-sm leading-6 text-white/75 sm:text-base">Find your travel rhythm, shape a thoughtful itinerary, and discover the culture waiting just outside your resort.</p>
          </div>
        </section>

        <div className="flex flex-wrap gap-2 rounded-2xl border border-airbnb-border bg-white p-2 shadow-card dark:bg-[#182321]">
          {[
            ['matcher', <Sparkles className="h-4 w-4" />, 'Experience matcher'],
            ['planner', <CalendarDays className="h-4 w-4" />, 'Escape planner'],
            ['culture', <Compass className="h-4 w-4" />, 'Local concierge'],
          ].map(([id, icon, label]) => (
            <button key={id} onClick={() => setActiveTab(id)} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition sm:text-sm ${activeTab === id ? 'bg-brand text-white shadow-sm' : 'text-airbnb-gray hover:bg-airbnb-bgSubtle hover:text-airbnb-black'}`}>
              {icon}{label}
            </button>
          ))}
        </div>

        {activeTab === 'matcher' && (
          <section className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
            <div className="rounded-3xl border border-airbnb-border bg-white p-6 shadow-card dark:bg-[#182321] sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">01 / Find your feeling</p>
              <h2 className="mt-3 font-display text-3xl text-airbnb-black">What kind of India are you craving?</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {EXPERIENCES.map((experience) => (
                  <button key={experience.id} onClick={() => setSelectedExperience(experience.id)} className={`group overflow-hidden rounded-2xl border text-left transition hover:-translate-y-1 hover:shadow-floating ${selectedExperience === experience.id ? 'border-brand ring-2 ring-brand/20' : 'border-airbnb-border'}`}>
                    <div className="relative h-32"><img src={experience.image} alt={experience.label} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><span className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5 text-brand">{selectedExperience === experience.id ? <CheckCircle2 className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}</span></div>
                    <div className="p-4"><h3 className="text-sm font-bold text-airbnb-black">{experience.label}</h3><p className="mt-1 text-xs leading-5 text-airbnb-gray">{experience.description}</p></div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-between rounded-3xl bg-[#f8eee8] p-6 shadow-card dark:bg-[#2a3935] sm:p-8">
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Your match</p><h2 className="mt-3 font-display text-3xl text-airbnb-black">{selected.match}</h2><p className="mt-3 text-sm leading-6 text-airbnb-gray">A {selected.label.toLowerCase()} shaped around your pace, with thoughtful details from check-in to the final cup of chai.</p></div>
              <button onClick={() => setActiveTab('planner')} className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-hover">Build this escape <ArrowRight className="h-4 w-4" /></button>
            </div>
          </section>
        )}

        {activeTab === 'planner' && (
          <section className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
            <div className="rounded-3xl border border-airbnb-border bg-white p-6 shadow-card dark:bg-[#182321] sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">02 / Shape your escape</p>
              <h2 className="mt-3 font-display text-3xl text-airbnb-black">A beautiful plan, without the spreadsheet.</h2>
              <div className="mt-7 space-y-5">
                <label className="block text-xs font-bold text-airbnb-black">Where would you like to go?<select value={destination} onChange={(event) => setDestination(event.target.value)} className="journey-select mt-2 w-full rounded-xl border border-airbnb-border bg-transparent p-3 text-sm">{DESTINATIONS.map((place) => <option key={place.name} value={place.name}>{place.name}</option>)}</select></label>
                <label className="block text-xs font-bold text-airbnb-black">Days <input type="range" min="2" max="10" value={days} onChange={(event) => setDays(Number(event.target.value))} className="mt-3 w-full accent-[#e87458]" /><span className="mt-1 block text-sm font-normal text-airbnb-gray">{days} days / {Math.max(days - 1, 1)} nights</span></label>
                <label className="block text-xs font-bold text-airbnb-black">Total budget <input type="range" min="30000" max="250000" step="5000" value={budget} onChange={(event) => setBudget(Number(event.target.value))} className="mt-3 w-full accent-[#e87458]" /><span className="mt-1 block text-sm font-normal text-airbnb-gray">₹{budget.toLocaleString('en-IN')} for {guests} guests</span></label>
                <label className="block text-xs font-bold text-airbnb-black">Guests <input type="number" min="1" max="12" value={guests} onChange={(event) => setGuests(Math.max(1, Number(event.target.value)))} className="mt-2 w-full rounded-xl border border-airbnb-border bg-transparent p-3 text-sm" /></label>
              </div>
            </div>
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-[#24332f] p-4 text-white"><WalletCards className="h-5 w-5 text-[#f8c8ae]" /><p className="mt-4 text-xs text-white/60">Estimated per guest</p><p className="mt-1 text-xl font-bold">₹{perGuest.toLocaleString('en-IN')}</p></div>
                <div className="rounded-2xl border border-airbnb-border bg-white p-4 dark:bg-[#182321]"><CalendarDays className="h-5 w-5 text-brand" /><p className="mt-4 text-xs text-airbnb-gray">Trip length</p><p className="mt-1 text-xl font-bold text-airbnb-black">{days} days</p></div>
                <div className="rounded-2xl border border-airbnb-border bg-white p-4 dark:bg-[#182321]"><MapPin className="h-5 w-5 text-brand" /><p className="mt-4 text-xs text-airbnb-gray">Base</p><p className="mt-1 text-xl font-bold text-airbnb-black">{destination}</p></div>
              </div>
              <div className="rounded-3xl border border-airbnb-border bg-white p-6 shadow-card dark:bg-[#182321] sm:p-8"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Your personalized route</p><h2 className="mt-2 font-display text-3xl text-airbnb-black">{destination} rhythm</h2></div><span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">{days} days · {Math.max(days - 1, 1)} nights</span></div><div className="mt-6 space-y-5">{itinerary.map((item) => <div key={item.day} className="flex gap-4"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">{item.day}</div><div><h3 className="text-sm font-bold text-airbnb-black">Day {item.day}: {item.title}</h3><p className="mt-1 text-sm leading-6 text-airbnb-gray">{item.detail}</p></div></div>)}</div></div>
            </div>
          </section>
        )}

        {activeTab === 'culture' && (
          <section>
            <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">03 / Your local concierge</p><h2 className="mt-3 font-display text-4xl text-airbnb-black">Go beyond the resort gates.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-airbnb-gray">Small cultural cues and local favourites to help every destination feel personal.</p></div>
            <div className="grid gap-6 lg:grid-cols-3">{DESTINATIONS.map((place) => <article key={place.name} className="group overflow-hidden rounded-3xl border border-airbnb-border bg-white shadow-card dark:bg-[#182321]"><div className="relative h-48 overflow-hidden"><img src={place.image} alt={place.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-x-4 bottom-4 text-white"><p className="text-2xl font-bold">{place.name}</p><p className="text-xs text-white/80">{place.subtitle}</p></div><div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" /></div><div className="space-y-5 p-5"><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand"><Utensils className="h-4 w-4" /> Taste this</p><p className="mt-2 text-sm text-airbnb-gray">{place.foods.join(' · ')}</p></div><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand"><MessageCircle className="h-4 w-4" /> Local cue</p><p className="mt-2 text-sm leading-6 text-airbnb-gray">{place.culture}</p></div><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand"><Music className="h-4 w-4" /> Do this</p><p className="mt-2 text-sm text-airbnb-gray">{place.moments.join(' · ')}</p></div></div></article>)}</div>
          </section>
        )}
      </div>
    </main>
  );
}
