'use client';

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, MapPin, Bed, Bath, Maximize2,
  ChevronDown, X, ShieldCheck, Zap, BadgeCheck, Star, ChevronRight,
  ArrowLeft, User, Phone, Home, Lock, MessageSquare, CheckCircle2, Shield
} from 'lucide-react';
import { mockProperties, Property } from './propertiesData';
import { api } from './api';

// ─── Filter Types ──────────────────────────────────────────────────────────────
type FurnishingFilter = 'Any' | 'Fully' | 'Semi' | 'None';
type BHKFilter = 'Any' | 1 | 2 | '3+';
type TypeFilter = 'All' | 'Apartments' | 'Houses' | 'Villas' | 'PG' | 'Studios';

// Map our type strings to filter
const typeMap: Record<TypeFilter, string[]> = {
  'All': [],
  'Apartments': ['Premium Apartment', 'Apartment'],
  'Houses': ['House', 'Luxury House'],
  'Villas': ['Luxury Villa', 'Villa'],
  'PG': ['PG / Hostel', 'PG', 'Hostel'],
  'Studios': ['Studio Suite', 'Studio'],
};

// Helper to check if a property is PG/Hostel type
const isPGType = (type: string) => ['PG / Hostel', 'PG', 'Hostel'].some(t => type.toLowerCase().includes(t.toLowerCase()));

interface ListingsProps {
  onEnquire?: (property: Property) => void;
}

function PropertyCard({ property, onView, index }: { property: Property; onView: (p: Property) => void; index: number }) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={() => onView(property)}
      className="group w-full bg-white dark:bg-[#101420] rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-video sm:h-52 overflow-hidden bg-slate-100 dark:bg-slate-950 shrink-0">
        {!imgError ? (
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-800">
            <Maximize2 className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
        )}

        {/* Tag chip */}
        <div className="absolute top-3 left-3">
          <span 
            className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm border border-white/60 shadow-sm"
            style={{ color: '#000000' }}
          >
            <BadgeCheck className="w-3 h-3 text-emerald-500 shrink-0" />
            {property.tag}
          </span>
        </div>

        {/* Price badge */}
        <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-slate-900/85 backdrop-blur-sm rounded-xl">
          <span className="text-white text-xs font-black">₹{property.price.toLocaleString('en-IN')}</span>
          <span className="text-slate-300 text-[10px] font-medium">/mo</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col p-4 sm:p-5 gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug line-clamp-2">{property.title}</h3>
          <p className="text-[10.5px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mt-1.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            {property.area}, {property.city}
          </p>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
          <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />{isPGType(property.type) ? `${property.bhk} Sharing` : `${property.bhk} BHK`}</span>
          <span className="w-px h-3 bg-slate-200 dark:bg-slate-800" />
          <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />{property.baths} Bath</span>
          <span className="w-px h-3 bg-slate-200 dark:bg-slate-800" />
          <span className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />{property.sqft} sqft</span>
        </div>

        {/* Amenities (Desktop only) */}
        <div className="hidden sm:flex flex-wrap gap-1.5">
          {property.amenities.slice(0, 3).map((a) => (
            <span key={a} className="text-[10px] font-semibold px-2 py-0.5 bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 rounded-md border border-slate-100 dark:border-white/5">{a}</span>
          ))}
          {property.amenities.length > 3 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-50 dark:bg-slate-850 text-slate-400 dark:text-slate-550 rounded-md border border-slate-100 dark:border-white/5">+{property.amenities.length - 3} more</span>
          )}
        </div>

        {/* CTA (Larger touch target) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView(property);
          }}
          className="mt-auto w-full flex items-center justify-center gap-2 py-3 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-colors cursor-pointer shadow-sm shadow-indigo-200"
        >
          View Property
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Dropdown helper ──────────────────────────────────────────────────────────
function FilterDropdown<T extends string | number>({
  label, value, options, onChange
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find(o => o.value === value)?.label ?? label;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
          open
            ? 'border-brand-purple/45 bg-purple-55 text-brand-purple'
            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
        }`}
      >
        {current}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 z-30 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/60 p-2 min-w-[140px]"
          >
            {options.map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  value === opt.value
                    ? 'bg-brand-purple text-white'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Listings({ onEnquire }: ListingsProps) {
  const [propertiesList, setPropertiesList] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);

  useEffect(() => {
    async function loadProperties() {
      try {
        const data = await api.getProperties();
        setPropertiesList(data);
      } catch (err) {
        console.error('Failed to fetch properties:', err);
        let fallback: Property[] = [];
        if (typeof window !== 'undefined') {
          const savedAll = localStorage.getItem('rentedge_all_properties');
          if (savedAll) {
            try {
              const parsed = JSON.parse(savedAll);
              if (parsed && parsed.length > 0) fallback = parsed;
            } catch (e) {}
          }
        }
        setPropertiesList(fallback);
      } finally {
        setIsLoadingProperties(false);
      }
    }
    loadProperties();
  }, []);

  const [selectedLocation, setSelectedLocation] = useState('All');
  const [customArea, setCustomArea] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<'location' | 'type' | 'budget' | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Contact Owner unlock flow
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [displayedPhone, setDisplayedPhone] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Sync displayedPhone when property or unlock state changes
  useEffect(() => {
    if (!selectedProperty) return;
    const isUserAuthed = localStorage.getItem('rentedge_authenticated') === 'true';
    const wasUnlocked = isUserAuthed || localStorage.getItem(`rentedge_unlocked_${selectedProperty.id}`) === 'true';
    setIsUnlocked(wasUnlocked);
    setDisplayedPhone(wasUnlocked ? selectedProperty.ownerPhoneFull : selectedProperty.ownerPhoneMasked);
  }, [selectedProperty]);

  useEffect(() => {
    if (showContactModal) setTimeout(() => phoneInputRef.current?.focus(), 100);
  }, [showContactModal]);

  const triggerScramble = useCallback((target: string) => {
    const digs = target.split('').map((c,i)=>({c,i})).filter(({c})=>/\d/.test(c)).map(({i})=>i);
    let rev = 0;
    const iv = setInterval(() => {
      setDisplayedPhone(() => target.split('').map((ch, idx) => {
        if (ch==='+' || ch===' ') return ch;
        if (idx<4) return ch;
        const p = digs.indexOf(idx);
        if (p===-1) return ch;
        if (p<rev) return target[idx];
        return String(Math.floor(Math.random()*10));
      }).join(''));
      rev += 0.9;
      if (rev >= digs.length+2) { setDisplayedPhone(target); clearInterval(iv); }
    }, 45);
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactPhone.length < 10 || !selectedProperty) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowContactModal(false);
      setIsUnlocked(true);
      localStorage.setItem(`rentedge_unlocked_${selectedProperty.id}`, 'true');
      triggerScramble(selectedProperty.ownerPhoneFull);
    }, 1100);
  };
  const [furnishing, setFurnishing] = useState<FurnishingFilter>('Any');
  const [bhk, setBhk] = useState<BHKFilter>('Any');
  const [minRent, setMinRent] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [propertyType, setPropertyType] = useState<TypeFilter>('All');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const typeButtons: TypeFilter[] = ['All', 'Apartments', 'Houses', 'Villas', 'PG', 'Studios'];

  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const terminalRef = React.useRef<HTMLDivElement>(null);

  // Click outside to close terminal dropdowns
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!e.target || !document.body.contains(e.target as Node)) {
        return;
      }
      if (terminalRef.current && !terminalRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setActiveDropdown('location');
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      } else if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
          e.preventDefault();
          setActiveDropdown('location');
          setTimeout(() => {
            searchInputRef.current?.focus();
          }, 100);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (furnishing !== 'Any') count++;
    if (bhk !== 'Any') count++;
    if (minRent) count++;
    if (maxRent) count++;
    if (propertyType !== 'All') count++;
    if (selectedLocation !== 'All') count++;
    if (customArea) count++;
    return count;
  }, [furnishing, bhk, minRent, maxRent, propertyType, selectedLocation, customArea]);

  const hasActiveFilters = activeFiltersCount > 0;

  const filtered = useMemo(() => {
    let allProps = propertiesList;

    return allProps.filter((p) => {
      // Selected City
      if (selectedLocation !== 'All') {
        const city = selectedLocation.toLowerCase();
        if (p.city.toLowerCase() !== city) return false;
      }

      // Custom Area
      if (customArea) {
        const area = customArea.toLowerCase();
        if (
          !p.area.toLowerCase().includes(area) &&
          !p.title.toLowerCase().includes(area) &&
          !p.city.toLowerCase().includes(area)
        ) return false;
      }

      // Property type
      if (propertyType !== 'All') {
        const allowed = typeMap[propertyType];
        if (allowed.length > 0 && !allowed.some(t => p.type.toLowerCase().includes(t.toLowerCase()))) return false;
      }

      // BHK
      if (bhk !== 'Any') {
        if (bhk === '3+') { if (p.bhk < 3) return false; }
        else { if (p.bhk !== bhk) return false; }
      }

      // Price
      const min = parseInt(minRent) || 0;
      const max = parseInt(maxRent) || Infinity;
      if (p.price < min || p.price > max) return false;

      return true;
    });
  }, [selectedLocation, customArea, propertyType, bhk, minRent, maxRent, furnishing]);

  const clearFilters = () => {
    setFurnishing('Any');
    setBhk('Any');
    setMinRent('');
    setMaxRent('');
    setPropertyType('All');
    setSelectedLocation('All');
    setCustomArea('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* ─── Hero Header ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
          India's Modern Rental Platform
        </h1>
        <p className="text-slate-500 text-sm font-medium mt-1">
          Find your perfect rental home.
        </p>

        {/* Trust Badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { icon: ShieldCheck, label: 'Verified Listings', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
            { icon: Zap,         label: 'Direct Landlord Contact', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
            { icon: BadgeCheck,  label: 'Zero Brokerage', color: 'text-amber-600 bg-amber-50 border-amber-100' },
          ].map(({ icon: Icon, label, color }) => (
            <span key={label} className={`inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-full border ${color}`}>
              <Icon className="w-3.5 h-3.5" />
              {label}
            </span>
          ))}
        </div>
      </motion.div>

      {/* ─── Sticky Filter Bar ──────────────────────────────── */}
      <div className="sticky top-[57px] z-25 bg-[#F4F5F7]/90 dark:bg-[#07090E]/90 backdrop-blur-md pt-1 pb-4 -mx-4 sm:-mx-6 px-4 sm:px-6">
        
        {/* Mobile Compact Search & Filter trigger (visible on mobile only) */}
        <div className="lg:hidden flex gap-2.5 items-center w-full">
          <div 
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex-1 bg-white dark:bg-[#101420] border border-slate-200/80 dark:border-white/5 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] active:scale-[0.99] transition-all cursor-pointer"
          >
            <Search className="w-4.5 h-4.5 text-brand-purple shrink-0" />
            <div className="flex-1 text-left min-w-0">
              <span className="block text-[8px] uppercase font-black tracking-wider text-slate-450 dark:text-slate-500">Locality / City</span>
              <span className="block text-xs font-black text-slate-800 dark:text-slate-100 truncate">
                {customArea || (selectedLocation === 'All' ? 'All Cities' : selectedLocation)} • {propertyType === 'All' ? 'All Types' : propertyType}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className={`p-3 rounded-2xl border flex items-center justify-center relative active:scale-95 transition-all cursor-pointer h-[46px] w-[46px] shrink-0 ${
              hasActiveFilters
                ? 'bg-brand-purple border-brand-purple text-white shadow-md shadow-purple-500/25'
                : 'bg-white dark:bg-[#101420] border-slate-200/80 dark:border-white/5 text-slate-600 dark:text-slate-350'
            }`}
          >
            <SlidersHorizontal className="w-4.5 h-4.5" />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-emerald-500 border-2 border-white dark:border-[#07090E] text-white text-[8px] font-black rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Desktop Search Terminal Cockpit (hidden on mobile) */}
        <div className="hidden lg:block bg-white/85 backdrop-blur-lg rounded-3xl border border-slate-200/75 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-3.5 space-y-3.5">

          {/* Search Terminal Cockpit */}
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
            
            {/* Search Terminal Cockpit (3 columns) */}
            <div ref={terminalRef} className="flex-1 bg-slate-50 border border-slate-200/85 rounded-2xl p-1.5 grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-200/80 relative">
              
              {/* 1. Location Selection */}
              <div 
                onClick={() => setActiveDropdown(activeDropdown === 'location' ? null : 'location')}
                className={`relative px-4 py-2 cursor-pointer rounded-xl transition-all duration-200 ${
                  activeDropdown === 'location' ? 'bg-white shadow-sm border border-slate-100' : 'hover:bg-white/40 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-purple-50 text-brand-purple shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <span className="block text-[9px] uppercase font-black tracking-wider text-slate-400">Location</span>
                    <span className="block text-xs font-black text-slate-800 mt-0.5 truncate">
                      {customArea || (selectedLocation === 'All' ? 'All Cities' : selectedLocation)}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${activeDropdown === 'location' ? 'rotate-180' : ''}`} />
                </div>

                <AnimatePresence>
                  {activeDropdown === 'location' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 md:-left-1.5 right-0 md:right-auto md:w-72 top-full mt-3 bg-white border border-slate-100 rounded-2xl shadow-2xl p-3.5 z-40 text-left"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Custom Area / Locality Input */}
                      <div className="pb-2.5 mb-2.5 border-b border-slate-100">
                        <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Custom Area / Locality</label>
                        <div className="relative">
                          <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Type area (e.g. HSR, Bandra)"
                            value={customArea}
                            onChange={(e) => setCustomArea(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 focus:border-brand-purple rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors font-bold"
                          />
                          {/* Keyboard Shortcut Indicator */}
                          <div className="absolute right-2.5 top-2 hidden md:flex items-center gap-1 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-slate-400 text-[9px] font-mono select-none">
                            <span>⌘K</span>
                          </div>
                        </div>
                      </div>

                      <span className="block text-[9px] uppercase font-black tracking-wider text-slate-400 mb-2 px-1">Popular Cities</span>
                      
                      <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto pr-1 scrollbar-none">
                        {['All', 'Bengaluru', 'Mumbai', 'Delhi NCR', 'Pune'].map((city) => (
                          <div 
                            key={city}
                            onClick={() => {
                              setSelectedLocation(city);
                              if (city === 'All') setCustomArea('');
                              setActiveDropdown(null);
                            }}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <span className="text-xs font-bold text-slate-700">{city === 'All' ? 'All Cities' : city}</span>
                            {selectedLocation === city && <ShieldCheck className="w-3.5 h-3.5 text-brand-mint" />}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 2. Property Type Selection */}
              <div 
                onClick={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
                className={`relative px-4 py-2 cursor-pointer rounded-xl transition-all duration-200 ${
                  activeDropdown === 'type' ? 'bg-white shadow-sm border border-slate-100' : 'hover:bg-white/40 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-brand-mint shrink-0">
                    <Home className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <span className="block text-[9px] uppercase font-black tracking-wider text-slate-400">Property Type</span>
                    <span className="block text-xs font-black text-slate-800 mt-0.5 truncate">
                      {propertyType === 'All' ? 'All Types' : propertyType}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${activeDropdown === 'type' ? 'rotate-180' : ''}`} />
                </div>

                <AnimatePresence>
                  {activeDropdown === 'type' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 md:left-auto md:-right-1.5 right-0 md:w-64 top-full mt-3 bg-white border border-slate-100 rounded-2xl shadow-2xl p-3.5 z-40 text-left"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="block text-[9px] uppercase font-black tracking-wider text-slate-400 mb-2 px-1">Select Property Type</span>
                      <div className="flex flex-col gap-1">
                        {typeButtons.map((t) => (
                          <div 
                            key={t}
                            onClick={() => {
                              setPropertyType(t);
                              setActiveDropdown(null);
                            }}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <span className="text-xs font-bold text-slate-700">{t === 'All' ? 'All Types' : t}</span>
                            {propertyType === t && <ShieldCheck className="w-3.5 h-3.5 text-brand-mint" />}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 3. Monthly Budget Selection */}
              <div 
                onClick={() => setActiveDropdown(activeDropdown === 'budget' ? null : 'budget')}
                className={`relative px-4 py-2 cursor-pointer rounded-xl transition-all duration-200 ${
                  activeDropdown === 'budget' ? 'bg-white shadow-sm border border-slate-100' : 'hover:bg-white/40 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-50 text-amber-500 shrink-0">
                    <span className="w-4 h-4 font-black flex items-center justify-center text-xs">₹</span>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <span className="block text-[9px] uppercase font-black tracking-wider text-slate-400">Budget Limit</span>
                    <span className="block text-xs font-black text-slate-800 mt-0.5 truncate">
                      {minRent || maxRent 
                        ? `${minRent ? `₹${parseInt(minRent)/1000}k` : '₹0'} - ${maxRent ? `₹${parseInt(maxRent)/1000}k` : 'Any'}` 
                        : 'All Budgets'}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${activeDropdown === 'budget' ? 'rotate-180' : ''}`} />
                </div>

                <AnimatePresence>
                  {activeDropdown === 'budget' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 md:-right-1.5 left-0 md:left-auto md:w-72 top-full mt-3 bg-white border border-slate-100 rounded-2xl shadow-2xl p-3.5 z-40 text-left"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="block text-[9px] uppercase font-black tracking-wider text-slate-400 mb-2 px-1">Popular Budgets</span>
                      
                      <div className="flex flex-col gap-1 mb-3">
                        {[
                          { label: 'All Budgets', min: '', max: '' },
                          { label: 'Under ₹40k', min: '', max: '40000' },
                          { label: '₹40k - ₹80k', min: '40000', max: '80000' },
                          { label: '₹80k+', min: '80000', max: '' }
                        ].map((b) => (
                          <div 
                            key={b.label}
                            onClick={() => {
                              setMinRent(b.min);
                              setMaxRent(b.max);
                              setActiveDropdown(null);
                            }}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <span className="text-xs font-bold text-slate-700">{b.label}</span>
                            {minRent === b.min && maxRent === b.max && <ShieldCheck className="w-3.5 h-3.5 text-brand-mint" />}
                          </div>
                        ))}
                      </div>

                      {/* Custom Range */}
                      <div className="pt-2.5 border-t border-slate-100">
                        <label className="block text-[9px] uppercase font-black tracking-wider text-slate-400 mb-1.5">Custom Range</label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-2.5 top-1.5 text-slate-400 text-xs">₹</span>
                            <input
                              type="number"
                              placeholder="Min"
                              value={minRent}
                              onChange={(e) => setMinRent(e.target.value)}
                              className="w-full bg-slate-900 border border-white/10 focus:border-brand-purple rounded-xl py-1.5 pl-6 pr-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors font-bold"
                            />
                          </div>
                          <span className="text-slate-400 text-xs">-</span>
                          <div className="relative flex-1">
                            <span className="absolute left-2.5 top-1.5 text-slate-400 text-xs">₹</span>
                            <input
                              type="number"
                              placeholder="Max"
                              value={maxRent}
                              onChange={(e) => setMaxRent(e.target.value)}
                              className="w-full bg-slate-900 border border-white/10 focus:border-brand-purple rounded-xl py-1.5 pl-6 pr-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
            
            {/* Filters toggle + Reset */}
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border text-xs font-black transition-all cursor-pointer ${
                  hasActiveFilters
                    ? 'border-brand-purple bg-[#7C3AED] text-white shadow-lg shadow-purple-500/20 hover:bg-purple-650'
                    : 'border-slate-200 text-slate-650 hover:border-slate-350 hover:bg-slate-50 bg-white'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="w-4.5 h-4.5 bg-white/20 text-white text-[9.5px] font-black rounded-full flex items-center justify-center shrink-0">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4.5 py-3.5 rounded-2xl border border-red-150 bg-red-50 text-red-650 hover:bg-red-100 transition-colors text-xs font-black cursor-pointer uppercase tracking-wider"
                >
                  Reset
                </button>
              )}
            </div>

          </div>

          {/* Quick Property Type Selector & Clear Row */}
          <div className="flex items-center justify-between gap-4 pt-2.5 border-t border-slate-100/70">
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none flex-1">
              {typeButtons.map((t) => {
                const isSelected = propertyType === t;
                return (
                  <button
                    key={t}
                    onClick={() => { setPropertyType(t); setBhk('Any'); }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                      isSelected
                        ? 'bg-brand-purple border-brand-purple text-white shadow-sm shadow-purple-500/10'
                        : 'bg-slate-50 border-slate-200/50 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[11px] font-black text-slate-400 hover:text-red-500 transition-colors cursor-pointer whitespace-nowrap uppercase tracking-wider"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* PG Sharing / BHK Sub-filter (contextual) */}
          <AnimatePresence>
            {(propertyType === 'PG' || propertyType === 'All' || propertyType === 'Apartments' || propertyType === 'Houses' || propertyType === 'Villas' || propertyType === 'Studios') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2 overflow-x-auto pb-1 pt-1.5 -mx-2 px-2 scrollbar-none">
                  {propertyType === 'PG'
                    ? (
                      [{v: 'Any' as BHKFilter, l: 'All Sharing'}, {v: 1 as BHKFilter, l: '1 Sharing'}, {v: 2 as BHKFilter, l: '2 Sharing'}, {v: '3+' as BHKFilter, l: '3+ Sharing'}].map((opt) => (
                        <button
                          key={String(opt.v)}
                          onClick={() => setBhk(opt.v)}
                          className={`px-3.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer border ${
                            bhk === opt.v
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                              : 'bg-white border-slate-200/60 text-slate-500 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          {opt.l}
                        </button>
                      ))
                    ) : (
                      [{v: 'Any' as BHKFilter, l: 'Any BHK'}, {v: 1 as BHKFilter, l: '1 BHK'}, {v: 2 as BHKFilter, l: '2 BHK'}, {v: '3+' as BHKFilter, l: '3+ BHK'}].map((opt) => (
                        <button
                          key={String(opt.v)}
                          onClick={() => setBhk(opt.v)}
                          className={`px-3.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer border ${
                            bhk === opt.v
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                              : 'bg-white border-slate-200/60 text-slate-500 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          {opt.l}
                        </button>
                      ))
                    )
                  }
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expanded Filters */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-3 border-t border-slate-100/80">
                  <div className="flex flex-wrap gap-3 items-center">
                    <FilterDropdown<FurnishingFilter>
                      label="Furnishing"
                      value={furnishing}
                      onChange={setFurnishing}
                      options={[
                        { value: 'Any', label: 'Any Furnishing' },
                        { value: 'Fully', label: 'Fully Furnished' },
                        { value: 'Semi', label: 'Semi Furnished' },
                        { value: 'None', label: 'Unfurnished' },
                      ]}
                    />
                    <FilterDropdown<BHKFilter>
                      label={propertyType === 'PG' ? 'Sharing' : 'BHK'}
                      value={bhk}
                      onChange={setBhk}
                      options={propertyType === 'PG' ? [
                        { value: 'Any', label: 'All Sharing' },
                        { value: 1, label: '1 Sharing' },
                        { value: 2, label: '2 Sharing' },
                        { value: '3+', label: '3+ Sharing' },
                      ] : [
                        { value: 'Any', label: 'Any BHK' },
                        { value: 1, label: '1 BHK' },
                        { value: 2, label: '2 BHK' },
                        { value: '3+', label: '3+ BHK' },
                      ]}
                    />
                    {/* Price Range */}
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <span className="absolute left-2.5 top-2.5 text-slate-400 text-xs">₹</span>
                        <input
                          type="number"
                          placeholder="Min Rent"
                          value={minRent}
                          onChange={(e) => setMinRent(e.target.value)}
                          className="pl-6 pr-3 py-2 w-28 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-purple/60 transition-colors"
                        />
                      </div>
                      <span className="text-slate-400 text-xs font-bold">–</span>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2.5 text-slate-400 text-xs">₹</span>
                        <input
                          type="number"
                          placeholder="Max Rent"
                          value={maxRent}
                          onChange={(e) => setMaxRent(e.target.value)}
                          className="pl-6 pr-3 py-2 w-28 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-purple/60 transition-colors"
                        />
                      </div>
                    </div>

                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors cursor-pointer ml-auto"
                      >
                        <X className="w-3.5 h-3.5" />
                        Clear all
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* ─── Mobile Expandable Filter Drawer (Slide-up Bottom Sheet) ─── */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="lg:hidden fixed inset-0 bg-black z-50"
            />

            {/* Bottom Sheet Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white dark:bg-[#101420] border-t border-slate-200 dark:border-white/10 rounded-t-[32px] z-55 flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Header drag indicator area */}
              <div className="w-full flex flex-col items-center py-3 shrink-0 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#0B0F17]">
                <div className="w-12 h-1.5 bg-slate-350 dark:bg-slate-700 rounded-full mb-3" />
                <div className="w-full px-6 flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Filters</h3>
                  <button 
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="w-8 h-8 rounded-full bg-slate-200/70 dark:bg-slate-800/80 flex items-center justify-center text-slate-650 dark:text-slate-200 cursor-pointer active:scale-90 transition-transform"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Filter Forms Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 text-left">
                {/* 1. Custom Area / Locality */}
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-450 dark:text-slate-500">Custom Locality / Area</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type area (e.g. HSR, Bandra)"
                      value={customArea}
                      onChange={(e) => setCustomArea(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#161B2B] border border-slate-200 dark:border-white/5 focus:border-brand-purple rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none transition-colors font-bold"
                    />
                  </div>
                </div>

                {/* 2. Popular Cities */}
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-450 dark:text-slate-500">Popular Cities</label>
                  <div className="flex flex-wrap gap-2">
                    {['All', 'Bengaluru', 'Mumbai', 'Delhi NCR', 'Pune'].map((city) => {
                      const isSelected = selectedLocation === city && !customArea;
                      return (
                        <button
                          key={city}
                          onClick={() => {
                            setSelectedLocation(city);
                            setCustomArea('');
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-brand-purple border-brand-purple text-white shadow-sm'
                              : 'bg-slate-50 dark:bg-[#161B2B] border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {city === 'All' ? 'All Cities' : city}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Property Type */}
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-450 dark:text-slate-500">Property Type</label>
                  <div className="flex flex-wrap gap-2">
                    {typeButtons.map((t) => {
                      const isSelected = propertyType === t;
                      return (
                        <button
                          key={t}
                          onClick={() => {
                            setPropertyType(t);
                            setBhk('Any');
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-brand-purple border-brand-purple text-white shadow-sm'
                              : 'bg-slate-50 dark:bg-[#161B2B] border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {t === 'All' ? 'All Types' : t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. BHK / Sharing Options */}
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-450 dark:text-slate-500">
                    {propertyType === 'PG' ? 'Room Sharing' : 'BHK size'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {propertyType === 'PG'
                      ? (
                        [{v: 'Any' as BHKFilter, l: 'All Sharing'}, {v: 1 as BHKFilter, l: '1 Sharing'}, {v: 2 as BHKFilter, l: '2 Sharing'}, {v: '3+' as BHKFilter, l: '3+ Sharing'}].map((opt) => {
                          const isSelected = bhk === opt.v;
                          return (
                            <button
                              key={String(opt.v)}
                              onClick={() => setBhk(opt.v)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                                isSelected
                                  ? 'bg-brand-purple border-brand-purple text-white shadow-sm'
                                  : 'bg-slate-50 dark:bg-[#161B2B] border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {opt.l}
                            </button>
                          );
                        })
                      ) : (
                        [{v: 'Any' as BHKFilter, l: 'Any BHK'}, {v: 1 as BHKFilter, l: '1 BHK'}, {v: 2 as BHKFilter, l: '2 BHK'}, {v: '3+' as BHKFilter, l: '3+ BHK'}].map((opt) => {
                          const isSelected = bhk === opt.v;
                          return (
                            <button
                              key={String(opt.v)}
                              onClick={() => setBhk(opt.v)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                                isSelected
                                  ? 'bg-brand-purple border-brand-purple text-white shadow-sm'
                                  : 'bg-slate-50 dark:bg-[#161B2B] border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {opt.l}
                            </button>
                          );
                        })
                      )
                    }
                  </div>
                </div>

                {/* 5. Custom Price Budget */}
                <div className="space-y-2 pb-6">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-450 dark:text-slate-500">Monthly Budget (INR)</label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">₹</span>
                      <input
                        type="number"
                        placeholder="Min Rent"
                        value={minRent}
                        onChange={(e) => setMinRent(e.target.value)}
                        className="pl-7 pr-3 py-2.5 w-full rounded-xl border border-slate-250 dark:border-white/10 bg-slate-50 dark:bg-[#161B2B] text-xs font-bold text-slate-800 dark:text-white placeholder-slate-450 focus:outline-none"
                      />
                    </div>
                    <span className="text-slate-400 text-xs font-bold">–</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">₹</span>
                      <input
                        type="number"
                        placeholder="Max Rent"
                        value={maxRent}
                        onChange={(e) => setMaxRent(e.target.value)}
                        className="pl-7 pr-3 py-2.5 w-full rounded-xl border border-slate-250 dark:border-white/10 bg-slate-50 dark:bg-[#161B2B] text-xs font-bold text-slate-800 dark:text-white placeholder-slate-450 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Bottom Action CTA Area */}
              <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-4 bg-slate-50 dark:bg-[#0B0F17] shrink-0 pb-safe">
                <button
                  onClick={() => {
                    clearFilters();
                    setIsMobileFilterOpen(false);
                  }}
                  className="px-4 py-3 text-xs font-black text-slate-500 dark:text-slate-450 uppercase tracking-wider hover:text-red-500 cursor-pointer"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-3 bg-brand-purple hover:bg-purple-650 text-white text-xs font-black rounded-xl shadow-lg shadow-purple-500/15 cursor-pointer uppercase tracking-wider text-center"
                >
                  Apply ({filtered.length} Properties)
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Results Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm font-semibold text-slate-500">
          <span className="text-slate-900 font-black">{filtered.length}</span> {filtered.length === 1 ? 'property' : 'properties'} found
        </p>
      </div>

      {/* ─── Grid ──────────────────────────────────────────── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((property, i) => (
            <PropertyCard key={property.id} property={property} onView={(p) => setSelectedProperty(p)} index={i} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-slate-300 dark:text-slate-700" />
          </div>
          <h3 className="text-lg font-black text-slate-700 dark:text-slate-350">No properties found</h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-medium mt-1 max-w-xs">
            Try adjusting your filters or search terms.
          </p>
          <button
            onClick={clearFilters}
            className="mt-5 px-5 py-2.5 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </motion.div>
      )}

      {/* ─── Property Detail Overlay ──────────────────────── */}
      <AnimatePresence>
        {selectedProperty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center overflow-y-auto pt-8 pb-8 px-4"
            onClick={() => setSelectedProperty(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl bg-white dark:bg-[#101420] border dark:border-white/5 rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Hero Image */}
              <div className="relative h-64 sm:h-80 overflow-hidden bg-slate-100 dark:bg-slate-950">
                <img src={selectedProperty.images[0] || selectedProperty.image} alt={selectedProperty.title} className="w-full h-full object-cover" />
                <button 
                  onClick={() => setSelectedProperty(null)} 
                  className="absolute top-4 left-4 p-2 bg-white/95 backdrop-blur-sm rounded-xl border border-white/60 shadow-sm hover:bg-white transition cursor-pointer"
                  style={{ color: '#000000', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                >
                  <ArrowLeft className="w-4 h-4 text-black" style={{ color: '#000000', stroke: '#000000' }} />
                </button>
                <div className="absolute bottom-4 left-4 px-4 py-2 bg-slate-900/85 backdrop-blur-sm rounded-xl">
                  <span className="text-white text-lg font-black">₹{selectedProperty.price.toLocaleString('en-IN')}</span>
                  <span className="text-slate-300 text-xs font-medium">/mo</span>
                </div>
                <span 
                  className="absolute top-4 right-4 inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm border border-white/60 shadow-sm"
                  style={{ color: '#000000' }}
                >
                  <BadgeCheck className="w-3 h-3 text-emerald-500 shrink-0" />{selectedProperty.tag}
                </span>
              </div>

              {/* Thumbnail strip */}
              {selectedProperty.images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto border-b border-slate-100 dark:border-white/5">
                  {selectedProperty.images.slice(1, 5).map((img, i) => (
                    <img key={i} src={img} alt="" className="w-20 h-14 rounded-lg object-cover border-2 border-transparent hover:border-indigo-400 transition-all cursor-pointer shrink-0" />
                  ))}
                </div>
              )}

              <div className="p-6 sm:p-8 space-y-6">
                {/* Title & location */}
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">{selectedProperty.title}</h2>
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5" />{selectedProperty.area}, {selectedProperty.city}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-4 py-3 border-y border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-sm"><Bed className="w-4 h-4 text-slate-400 dark:text-slate-500" /><span className="font-bold text-slate-700 dark:text-slate-300">{isPGType(selectedProperty.type) ? `${selectedProperty.bhk} Sharing` : `${selectedProperty.bhk} BHK`}</span></div>
                  <div className="flex items-center gap-2 text-sm"><Bath className="w-4 h-4 text-slate-400 dark:text-slate-500" /><span className="font-bold text-slate-700 dark:text-slate-300">{selectedProperty.baths} Bath</span></div>
                  <div className="flex items-center gap-2 text-sm"><Maximize2 className="w-4 h-4 text-slate-400 dark:text-slate-500" /><span className="font-bold text-slate-700 dark:text-slate-300">{selectedProperty.sqft} sqft</span></div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">About this property</h3>
                  <p className="text-sm text-slate-655 dark:text-slate-400 leading-relaxed">{selectedProperty.description}</p>
                </div>

                {/* Amenities */}
                <div>
                  <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.amenities.map((a) => (
                      <span key={a} className="text-xs font-semibold px-3 py-1.5 bg-slate-50 dark:bg-slate-850 text-slate-655 dark:text-slate-300 rounded-lg border border-slate-100 dark:border-white/5">{a}</span>
                    ))}
                  </div>
                </div>

                {/* Owner Details */}
                <div className="bg-slate-50 dark:bg-slate-850/40 rounded-2xl border border-slate-100 dark:border-white/5 p-5">
                  <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Property Owner</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] dark:text-[#A78BFA] font-black text-sm shrink-0">
                      {selectedProperty.ownerName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />{selectedProperty.ownerName}</p>
                      <p className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        {displayedPhone}
                      </p>
                    </div>
                    {isUnlocked ? (
                      <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/30">Verified Owner</span>
                    )}
                  </div>
                  {isUnlocked && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 flex items-center gap-2 text-[10.5px] font-bold text-emerald-700 dark:text-emerald-455 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 rounded-xl px-3 py-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      Landlord notified of your interest.
                    </motion.div>
                  )}
                </div>

                {/* Deposit info */}
                <div className="flex items-center justify-between px-4 py-3 bg-indigo-50 dark:bg-brand-purple/10 rounded-xl border border-indigo-100 dark:border-brand-purple/20">
                  <span className="text-xs font-bold text-indigo-700 dark:text-brand-purple">Security Deposit</span>
                  <span className="text-sm font-black text-indigo-900 dark:text-white">₹{selectedProperty.deposit.toLocaleString('en-IN')} ({selectedProperty.depositMonths} months)</span>
                </div>

                {/* Info note */}
                <div className="text-center py-3 px-4 bg-amber-50 dark:bg-amber-955/20 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400">💡 To become a tenant, ask the property owner for the <span className="font-black">Join Property Code</span> and enter it in the &quot;Join Property&quot; tab.</p>
                </div>

                {/* ── STICKY CONTACT BAR ── */}
                <div className="sticky bottom-0 left-0 right-0 pt-3 pb-1 bg-white dark:bg-[#101420] border-t border-slate-100 dark:border-white/5 mt-2">
                  <AnimatePresence mode="wait">
                    {isUnlocked ? (
                      <motion.a
                        key="wa"
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        href={`https://wa.me/91${selectedProperty.ownerPhoneFull.replace(/\D/g,'').slice(-10)}`}
                        target="_blank" rel="noreferrer"
                        className="w-full py-3.5 bg-[#10B981] hover:bg-[#10B981]/90 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors"
                      >
                        <MessageSquare className="w-4 h-4 fill-white" />
                        Message on WhatsApp
                      </motion.a>
                    ) : (
                      <motion.button
                        key="contact"
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        onClick={() => setShowContactModal(true)}
                        className="relative w-full py-3.5 bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 overflow-hidden transition-colors"
                      >
                        <span className="absolute inset-0 animate-ping bg-[#7C3AED]/25 rounded-xl pointer-events-none" />
                        <Lock className="w-4 h-4 relative z-10" />
                        <span className="relative z-10">Contact Owner</span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== LEAD CAPTURE MODAL ========== */}
      <AnimatePresence>
        {showContactModal && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContactModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Card */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0.05, bottom: 0.6 }}
              onDragEnd={(_, i) => { if (i.offset.y > 140) setShowContactModal(false); }}
              className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 border dark:border-white/5 sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl z-10 text-left"
            >
              {/* Drag handle */}
              <div className="w-10 h-1 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-5 sm:hidden" />

              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#7C3AED]/10 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-[#7C3AED] dark:text-[#A78BFA]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Unlock Landlord Details</h3>
                    <p className="text-[10px] text-[#10B981] font-bold">🔒 End-to-end encrypted</p>
                  </div>
                </div>
                <button type="button" onClick={() => setShowContactModal(false)} className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:text-slate-450 dark:hover:text-white transition-all cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed mb-5 mt-2">
                Enter your 10-digit WhatsApp number to instantly view the owner's contact info and send an automated viewing request.
              </p>

              <form onSubmit={handleContactSubmit} className="space-y-3">
                {/* Phone input */}
                <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl overflow-hidden focus-within:border-[#7C3AED] focus-within:ring-1 focus-within:ring-[#7C3AED] transition-all">
                  <span className="px-3.5 text-xs font-black text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-850 py-3.5 shrink-0 bg-slate-100 dark:bg-slate-900">+91</span>
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    maxLength={10}
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="WhatsApp number"
                    className="flex-1 bg-transparent px-3 py-3.5 text-sm font-bold text-slate-850 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:outline-none"
                  />
                  {contactPhone.length === 10 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="pr-3">
                      <CheckCircle2 className="w-4.5 h-4.5 text-[#10B981]" />
                    </motion.span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={contactPhone.length < 10 || isSubmitting}
                  className="w-full py-3.5 bg-[#10B981] disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 disabled:cursor-not-allowed text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/10"
                >
                  {isSubmitting ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Verifying...</span></>
                  ) : (
                    <><MessageSquare className="w-4 h-4 fill-white" /><span>Unlock Number</span></>
                  )}
                </button>
              </form>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <Shield className="w-3 h-3 text-[#10B981]" /> Verified Escrow & Landlord credentials
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
