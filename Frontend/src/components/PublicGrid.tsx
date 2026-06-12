'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  ShieldAlert, 
  Heart, 
  Scaling, 
  BedDouble, 
  Bath, 
  X, 
  MapPin, 
  Zap, 
  AlertCircle,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { Property, mockProperties } from './propertiesData';

interface PublicGridProps {
  searchFilters?: { location: string; type: string; budget: string };
  isAuthenticated: boolean;
  onAuthRequired: (property?: Property) => void;
  activeProperty: Property | null;
  setActiveProperty: (property: Property | null) => void;
}

export default function PublicGrid({ 
  searchFilters, 
  isAuthenticated, 
  onAuthRequired, 
  activeProperty, 
  setActiveProperty 
}: PublicGridProps) {
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedBhk, setSelectedBhk] = useState<string>('All');
  const [selectedBudget, setSelectedBudget] = useState<string>('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [carouselIndex, setCarouselIndex] = useState<{ [key: string]: number }>({});

  // Filter application logic
  const filteredProperties = mockProperties.filter((prop) => {
    const cityMatch = selectedCity === 'All' 
      ? (searchFilters 
          ? prop.city.toLowerCase().includes(searchFilters.location.toLowerCase()) || 
            prop.area.toLowerCase().includes(searchFilters.location.toLowerCase())
          : true) 
      : prop.city === selectedCity;

    const bhkMatch = selectedBhk === 'All' 
      ? true 
      : selectedBhk === '3 BHK+' 
        ? prop.bhk >= 3 
        : prop.bhk === parseInt(selectedBhk);

    let budgetMatch = true;
    if (selectedBudget === 'Under ₹40k') {
      budgetMatch = prop.price < 40000;
    } else if (selectedBudget === '₹40k - ₹80k') {
      budgetMatch = prop.price >= 40000 && prop.price <= 80000;
    } else if (selectedBudget === '₹80k+') {
      budgetMatch = prop.price > 80000;
    }

    if (searchFilters && selectedBudget === 'All') {
      const budgetStr = searchFilters.budget;
      if (budgetStr.includes('-')) {
        const parts = budgetStr.split('-');
        const minVal = parseInt(parts[0].replace(/[^0-9]/g, '')) || 0;
        const maxVal = parseInt(parts[1].replace(/[^0-9]/g, '')) || Infinity;
        budgetMatch = prop.price >= minVal && prop.price <= maxVal;
      } else if (budgetStr.includes('+')) {
        const minVal = parseInt(budgetStr.replace(/[^0-9]/g, '')) || 0;
        budgetMatch = prop.price >= minVal;
      }
    }

    const typeMatch = searchFilters
      ? prop.type.toLowerCase().includes(searchFilters.type.toLowerCase())
      : true;

    return cityMatch && bhkMatch && budgetMatch && typeMatch;
  });

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const handleNextPhoto = (id: string, max: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCarouselIndex(prev => ({
      ...prev,
      [id]: prev[id] === max - 1 ? 0 : (prev[id] || 0) + 1
    }));
  };

  const handlePrevPhoto = (id: string, max: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCarouselIndex(prev => ({
      ...prev,
      [id]: prev[id] === 0 || prev[id] === undefined ? max - 1 : (prev[id] || 0) - 1
    }));
  };

  const handleCardClick = (prop: Property) => {
    if (isAuthenticated) {
      setActiveProperty(prop);
    } else {
      onAuthRequired(prop);
    }
  };

  // Stagger animation definitions
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  } as const;

  return (
    <section id="discover" className="w-full px-4 pt-4 pb-20 bg-transparent relative text-left -mt-8 z-10">
      <div className="max-w-7xl mx-auto">

        {/* Property Discover Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:overflow-visible no-scrollbar"
        >
          {filteredProperties.slice(0, 3).map((prop) => {
            const currentImgIdx = carouselIndex[prop.id] || 0;
            const isFav = favorites.includes(prop.id);

            return (
              <motion.div
                key={prop.id}
                variants={cardVariants}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 cursor-pointer flex flex-col min-w-[85vw] sm:min-w-[340px] md:min-w-0 snap-center"
                onClick={() => handleCardClick(prop)}
              >
                {/* Image Carousel Area */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 shrink-0">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImgIdx}
                      src={prop.images[currentImgIdx]}
                      alt={prop.title}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="object-cover w-full h-full"
                    />
                  </AnimatePresence>

                  {/* Glass Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/20 pointer-events-none" />

                  {/* Left / Right Carousel Hover Controls */}
                  <div className="absolute inset-0 flex items-center justify-between px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => handlePrevPhoto(prop.id, prop.images.length, e)}
                      className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-black shadow hover:bg-white hover:scale-105 transition-all cursor-pointer"
                      style={{ color: '#000000', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                    >
                      <ChevronLeft className="w-4 h-4 stroke-[2.5px]" style={{ color: '#000000', stroke: '#000000' }} />
                    </button>
                    <button
                      onClick={(e) => handleNextPhoto(prop.id, prop.images.length, e)}
                      className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-black shadow hover:bg-white hover:scale-105 transition-all cursor-pointer"
                      style={{ color: '#000000', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                    >
                      <ChevronRight className="w-4 h-4 stroke-[2.5px]" style={{ color: '#000000', stroke: '#000000' }} />
                    </button>
                  </div>

                  {/* Carousel Page dots */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {prop.images.map((_, i) => (
                      <span 
                        key={i} 
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          currentImgIdx === i ? 'bg-white scale-125' : 'bg-white/50'
                        }`} 
                      />
                    ))}
                  </div>

                  {/* Verified Badge */}
                  <div className="absolute top-4 left-4 pointer-events-none">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981] text-[10px] font-black text-white shadow-md uppercase tracking-wide">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  </div>

                  {/* Favorite Pill Button */}
                  <button
                    onClick={(e) => toggleFavorite(prop.id, e)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-600 hover:text-red-500 shadow-sm transition-all cursor-pointer hover:scale-105"
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                </div>

                {/* Info Content Block */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-5">
                  <div className="space-y-2.5">
                    {/* Location */}
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                      <MapPin className="w-3.5 h-3.5 text-brand-purple shrink-0" />
                      <span>{prop.area}, {prop.city}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-black text-slate-800 tracking-tight leading-snug group-hover:text-brand-purple transition-colors">
                      {prop.title}
                    </h3>
                  </div>

                  {/* Specs Box */}
                  <div className="grid grid-cols-3 gap-2.5 py-2.5 border-y border-slate-100 text-slate-500 text-[10.5px] font-bold">
                    <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl p-2">
                      <BedDouble className="w-4 h-4 text-slate-400 mb-1" />
                      <span>{prop.bhk} BHK</span>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl p-2">
                      <Bath className="w-4 h-4 text-slate-400 mb-1" />
                      <span>{prop.baths} Bath</span>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl p-2">
                      <Scaling className="w-4 h-4 text-slate-400 mb-1" />
                      <span>{prop.sqft} sqft</span>
                    </div>
                  </div>

                  {/* Fintech Parameters with Electric Purple Shield Icons */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-650">
                      <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                        <ShieldCheck className="w-4 h-4 text-brand-purple" />
                        Security Deposit:
                      </span>
                      <span className="text-slate-800 font-black">
                        {prop.depositMonths} Month Rent
                      </span>
                    </div>

                  </div>

                  {/* Pricing / Terms Hierarchy Dominating Bottom Left */}
                  <div className="pt-3 border-t border-slate-50 flex items-end justify-between">
                    <div className="text-left">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">Pricing Plan</span>
                      <span className="text-xl font-black text-slate-900 tracking-tight font-mono">
                        ₹{prop.price.toLocaleString('en-IN')}
                        <span className="text-[11px] font-bold text-slate-400">/mo</span>
                      </span>
                    </div>

                    <span className="text-[10px] font-black text-brand-mint bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1 uppercase tracking-wider">
                      Zero Brokerage
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Empty State */}
        {filteredProperties.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full bg-white rounded-3xl border border-slate-200/60 shadow-sm p-12 text-center flex flex-col items-center justify-center mt-8"
          >
            <AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-bold text-slate-800">No properties found</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-sm font-semibold">
              No matching listings in this city or configuration. Try adjusting filters.
            </p>
          </motion.div>
        )}

        {/* Show More Button */}
        {filteredProperties.length > 3 && (
          <div className="mt-12 flex justify-center w-full">
            <button 
              onClick={() => onAuthRequired()}
              className="px-8 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-md hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Sign In to See More Listings
            </button>
          </div>
        )}
      </div>

      {/* Property Details Drawer/Modal */}
      <AnimatePresence>
        {activeProperty && isAuthenticated && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveProperty(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl z-10 max-h-[85vh] flex flex-col border border-slate-200/60 text-slate-800"
            >
              {/* Close Button */}
              <button 
                onClick={() => setActiveProperty(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-650 hover:text-slate-900 transition-colors flex items-center justify-center z-20 shadow-sm cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="overflow-y-auto flex-1">
                {/* Visual Header */}
                <div className="relative aspect-16/9 w-full bg-slate-100">
                  <img 
                    src={activeProperty.images[0]} 
                    alt={activeProperty.title} 
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex items-end p-6">
                    <div className="text-left">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-mint text-white text-[10px] font-black uppercase tracking-wider mb-3">
                        <CheckCircle2 className="w-3.5 h-3.5" /> RentEdge Title Guarantee
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">{activeProperty.title}</h2>
                      <p className="text-slate-200 text-sm mt-1.5 flex items-center gap-1.5 font-bold">
                        <MapPin className="w-4 h-4 text-brand-purple" /> {activeProperty.area}, {activeProperty.city}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-8">
                  {/* Left Column: Details */}
                  <div className="flex-1 text-left space-y-6">
                    <div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Description</h3>
                      <p className="text-xs text-slate-500 mt-3 font-semibold leading-relaxed">{activeProperty.description}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Premium Amenities</h3>
                      <div className="grid grid-cols-2 gap-2.5 mt-3">
                        {activeProperty.amenities.map(am => (
                          <div key={am} className="flex items-center gap-2 text-xs font-bold text-slate-600 text-left">
                            <div className="w-2 h-2 rounded-full bg-brand-mint" />
                            <span>{am}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Fintech Booking Box */}
                  <div className="w-full md:w-80 flex flex-col gap-4">
                    <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-5 flex flex-col gap-4 text-left">
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Estimated Monthly Rent</span>
                        <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
                          ₹{activeProperty.price.toLocaleString('en-IN')}
                          <span className="text-xs font-semibold text-slate-400">/mo</span>
                        </div>
                      </div>

                      <div className="border-t border-slate-200/60 pt-4 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400 font-semibold">Brokerage Fee</span>
                          <span className="text-xs text-brand-mint font-extrabold uppercase">₹0 (Zero Broker)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400 font-semibold">Security Deposit</span>
                          <span className="text-xs text-slate-800 font-black">₹{(activeProperty.price * activeProperty.depositMonths).toLocaleString('en-IN')} ({activeProperty.depositMonths} mo)</span>
                        </div>

                      </div>



                      {/* Actions */}
                      <button 
                        onClick={() => {
                          alert(`Initiating smart lease for ${activeProperty.title}! Connecting to UPI automated billing node.`);
                          setActiveProperty(null);
                        }}
                        className="w-full py-3 bg-slate-900 text-white text-xs font-black rounded-xl shadow-md hover:bg-slate-850 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 text-brand-mint" />
                        Sign Smart Lease
                      </button>

                      <button 
                        onClick={() => {
                          alert(`Applying for 0% advance deposit loan scheme via RentEdge Finance.`);
                          setActiveProperty(null);
                        }}
                        className="w-full py-3 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-black rounded-xl transition-colors cursor-pointer"
                      >
                        Apply for Zero Deposit Loan
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
