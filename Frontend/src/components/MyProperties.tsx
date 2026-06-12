'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, KeyRound, CheckCircle2, ArrowRight, RefreshCw, Lock, Sparkles, Building2, MapPin, User, ChevronLeft, ChevronRight, CreditCard, FileText, X, Printer } from 'lucide-react';
import { Property, mockProperties } from './propertiesData';
import { api } from './api';

const CODE_LENGTH = 6;

const VALID_CODES: Record<string, { title: string; owner: string; area: string; propertyId: string }> = {
  '123456': { title: 'HSR Smart Premium Suite',        owner: 'Rahul Malhotra',  area: 'HSR Layout, Bengaluru', propertyId: 'prop-4' },
  '789012': { title: 'The Edge Residences – Indiranagar', owner: 'Rajvardhan Pawar', area: 'Indiranagar, Bengaluru', propertyId: 'prop-1' },
  '654321': { title: 'Khar Oasis Smart Suite',         owner: 'Nisha Mehta',     area: 'Khar West, Mumbai', propertyId: 'prop-3' },
};

interface MyPropertiesProps {
  onPropertySelect?: (property: Property) => void;
}

type JoinState = 'idle' | 'verifying' | 'success' | 'error';

export default function MyProperties({ onPropertySelect }: MyPropertiesProps) {
  const [code, setCode] = useState<string>('');
  const [joinState, setJoinState] = useState<JoinState>('idle');
  const [matchedProperty, setMatchedProperty] = useState<typeof VALID_CODES[string] | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [viewedProperty, setViewedProperty] = useState<Property | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showAgreement, setShowAgreement] = useState(false);
  const [tenantName, setTenantName] = useState('');
  const [rentedProperties, setRentedProperties] = useState<Property[]>([]);

  useEffect(() => {
    async function loadRentedProperties() {
      try {
        const leases = await api.getMyLeases();
        const properties = await Promise.all(
          leases.filter((l: any) => l.status === 'Active').map(async (l: any) => {
            try {
              return await api.getProperty(l.propertyId);
            } catch (e) {
              return null;
            }
          })
        );
        setRentedProperties(properties.filter(p => p !== null));
      } catch (err) {
        console.error('Failed to load rented properties:', err);
        setRentedProperties([]);
      }
    }
    loadRentedProperties();
  }, [joinState]);

  useEffect(() => {
    const storedName = localStorage.getItem('rentedge_user_fullname');
    if (storedName) setTenantName(storedName);
  }, []);

  const startAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      setActiveImg(prev => {
        if (!viewedProperty) return 0;
        return (prev + 1) % viewedProperty.images.length;
      });
    }, 4000);
  }, [viewedProperty]);

  useEffect(() => {
    if (viewedProperty) {
      setActiveImg(0);
      startAutoplay();
    }
    return () => { if (autoplayRef.current) clearInterval(autoplayRef.current); };
  }, [viewedProperty, startAutoplay]);

  const [dynamicCodes, setDynamicCodes] = useState<Record<string, { title: string; owner: string; area: string; propertyId: string }>>({});

  const isFull = code.length === CODE_LENGTH;

  useEffect(() => {
    inputRef.current?.focus();
    
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rentedge_access_codes');
      if (saved) {
        try {
          setDynamicCodes(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const getPropertyById = (propertyId: string) => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rentedge_properties');
      if (saved) {
        try {
          const parsed: Property[] = JSON.parse(saved);
          const found = parsed.find(p => p.id === propertyId);
          if (found) return found;
        } catch (e) {}
      }
      
      const savedAll = localStorage.getItem('rentedge_all_properties');
      if (savedAll) {
        try {
          const parsed: Property[] = JSON.parse(savedAll);
          const found = parsed.find(p => p.id === propertyId);
          if (found) return found;
        } catch (e) {}
      }
    }
    return mockProperties.find(p => p.id === propertyId);
  };

  const handleChange = (value: string) => {
    const clean = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, CODE_LENGTH);
    setCode(clean);
    setJoinState('idle');
  };

  const handleJoin = async () => {
    if (!isFull) return;
    setJoinState('verifying');
    try {
      const response = await api.verifyAccessCode(code);
      setMatchedProperty({
        title: response.property.title,
        owner: response.property.owner,
        area: response.property.area,
        propertyId: response.property.propertyId
      });
      setJoinState('success');
    } catch (err) {
      console.error('Verify code error:', err);
      // Fallback for mock demo codes
      const found = dynamicCodes[code] || VALID_CODES[code];
      if (found) {
        setMatchedProperty(found);
        setJoinState('success');
      } else {
        setJoinState('error');
      }
    }
  };

  const handleReset = () => {
    setCode('');
    setJoinState('idle');
    setMatchedProperty(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handlePayRent = () => {
    setIsPaying(true);
    // Simulate Razorpay opening and loading
    setTimeout(() => {
      setIsPaying(false);
      window.open('https://razorpay.com/payment-gateway/', '_blank');
    }, 800);
  };

  if (viewedProperty) {
    const images = viewedProperty.images;
    const goNext = () => { setActiveImg((activeImg + 1) % images.length); startAutoplay(); };
    const goPrev = () => { setActiveImg((activeImg - 1 + images.length) % images.length); startAutoplay(); };

    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-8 md:py-12">
        <button 
          onClick={() => setViewedProperty(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm mb-6 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to My Properties
        </button>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg">
          
          {/* ─── Photo Slider ─────────────────────────────── */}
          <div className="relative group">
            {/* Main Image */}
            <div className="aspect-[21/9] bg-slate-900 relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImg}
                  src={images[activeImg]}
                  alt={`${viewedProperty.title} - Photo ${activeImg + 1}`}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full object-cover absolute inset-0"
                />
              </AnimatePresence>

              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

              {/* Badge */}
              <div className="absolute top-5 right-5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg z-10">
                Active Lease
              </div>

              {/* Counter */}
              <div className="absolute bottom-5 left-5 bg-black/50 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full z-10">
                {activeImg + 1} / {images.length}
              </div>

              {/* Prev / Next arrows */}
              <button
                onClick={goPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40 cursor-pointer z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40 cursor-pointer z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Progress dots */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setActiveImg(i); startAutoplay(); }}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      i === activeImg ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-2 p-3 bg-slate-50 border-t border-slate-100 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveImg(i); startAutoplay(); }}
                  className={`shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    i === activeImg
                      ? 'border-brand-purple shadow-md shadow-purple-200 scale-105'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
          
          {/* ─── Property Details ─────────────────────────── */}
          <div className="p-8 md:p-10">
            <div className="flex flex-col md:flex-row gap-10 justify-between items-start">
              
              <div className="space-y-6 flex-1">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{viewedProperty.title}</h1>
                  <p className="flex items-center gap-1.5 text-slate-500 font-semibold mt-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {viewedProperty.location}
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Landlord Information</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-lg">
                      {viewedProperty.ownerName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-lg">{viewedProperty.ownerName}</p>
                      <p className="text-sm font-semibold text-slate-500 flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> Verified Owner
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-80 space-y-6 shrink-0">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Monthly Rent</p>
                    <p className="text-2xl font-black text-slate-900">₹{viewedProperty.price.toLocaleString('en-IN')}</p>
                  </div>
                  <button 
                    onClick={handlePayRent}
                    disabled={isPaying}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isPaying ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Pay Rent
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center font-bold text-slate-400 mt-3 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Payments are secured by Razorpay
                  </p>
                  
                  <button 
                    onClick={() => setShowAgreement(true)}
                    className="w-full mt-3 py-3 border border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    <FileText className="w-4 h-4 text-brand-purple" />
                    View Rent Agreement
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Agreement Modal Overlay */}
        <AnimatePresence>
          {showAgreement && viewedProperty && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setShowAgreement(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col my-8 max-h-[90vh]"
              >
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-purple" />
                    <span className="font-black text-slate-800 text-sm uppercase tracking-wider">Rent Agreement Draft</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => window.print()}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-200/50 transition-all cursor-pointer"
                      title="Print Agreement"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setShowAgreement(false)}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-250/50 transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Document Scroll Pane */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-100/40">
                  <div className="bg-white border border-slate-200/80 shadow-md p-6 sm:p-10 max-w-2xl mx-auto rounded-xl space-y-8 text-left text-xs text-slate-700 leading-relaxed font-serif relative">
                    
                    {/* e-Stamp paper heading */}
                    <div className="border-4 border-double border-orange-800 p-4 rounded-lg text-center space-y-2 font-sans relative overflow-hidden bg-orange-50/20">
                      {/* Watermark symbol background */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none scale-150">
                        <ShieldCheck className="w-80 h-80" />
                      </div>

                      <div className="text-sm font-black tracking-widest text-orange-900 uppercase">
                        Government of {viewedProperty.city.toLowerCase() === 'mumbai' || viewedProperty.city.toLowerCase() === 'pune' ? 'Maharashtra' : viewedProperty.city.toLowerCase() === 'delhi ncr' ? 'NCT of Delhi' : 'Karnataka'}
                      </div>
                      <div className="text-[10px] font-bold text-orange-800 tracking-wider uppercase">
                        Certificate of Stamp Duty
                      </div>
                      
                      {/* Barcode representation */}
                      <div className="py-2.5 flex flex-col items-center justify-center gap-1 font-mono text-[9px] text-slate-500">
                        <div className="h-7 w-52 bg-[repeating-linear-gradient(90deg,currentColor,currentColor_2px,transparent_2px,transparent_6px)]" />
                        <span>IN-KA90382749281749A</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-left text-[9px] font-bold text-slate-600 border-t border-orange-200 pt-3">
                        <div>Stamp Duty Amount: <span className="font-extrabold text-slate-800">₹ 200</span></div>
                        <div>Certificate Date: <span className="font-extrabold text-slate-800">28 Dec 2025</span></div>
                        <div className="col-span-2">First Party: <span className="font-extrabold text-slate-800">{viewedProperty.ownerName}</span></div>
                        <div className="col-span-2">Second Party: <span className="font-extrabold text-slate-800">{tenantName}</span></div>
                      </div>
                    </div>

                    {/* Document Content */}
                    <div className="space-y-6 pt-4">
                      <h2 className="text-center font-bold text-sm text-slate-900 uppercase tracking-wider font-sans">
                        Rent Agreement
                      </h2>
                      
                      <p>
                        This Rent Agreement is made and executed at <span className="font-bold font-sans">{viewedProperty.city}</span> on this <span className="font-bold font-sans">28th day of December, 2025</span>, by and between:
                      </p>

                      <div>
                        <span className="font-bold font-sans block text-slate-950 uppercase text-[10px]">The Landlord (Licensor):</span>
                        <p className="mt-1">
                          <strong className="font-sans text-slate-800">{viewedProperty.ownerName}</strong>, resident of {viewedProperty.location}, hereinafter called the First Party / Owner.
                        </p>
                      </div>

                      <div>
                        <span className="font-bold font-sans block text-slate-950 uppercase text-[10px]">The Tenant (Licensee):</span>
                        <p className="mt-1">
                          <strong className="font-sans text-slate-800">{tenantName}</strong>, hereinafter called the Second Party / Tenant.
                        </p>
                      </div>

                      <p>
                        Whereas the Landlord is the absolute owner and in possession of the property: <strong className="font-sans text-slate-850">{viewedProperty.title}</strong> situated at <strong className="font-sans text-slate-850">{viewedProperty.location}</strong>.
                      </p>

                      <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1 font-sans text-[10px] uppercase tracking-wider">
                        Terms and Conditions:
                      </h3>

                      <ol className="list-decimal pl-4 space-y-3 font-serif">
                        <li>
                          <strong>Duration:</strong> This agreement is valid for a period of <span className="font-bold">11 months</span> commencing from <span className="font-bold font-sans">01-Jan-2026</span> to <span className="font-bold font-sans">30-Nov-2026</span>.
                        </li>
                        <li>
                          <strong>Monthly Rent:</strong> The Tenant agrees to pay a monthly rent of <span className="font-bold font-sans">₹ {viewedProperty.price.toLocaleString('en-IN')}</span> on or before the 5th day of every calendar month.
                        </li>
                        <li>
                          <strong>Security Deposit:</strong> The Tenant has paid a refundable interest-free security deposit of <span className="font-bold font-sans">₹ {(viewedProperty.price * viewedProperty.depositMonths).toLocaleString('en-IN')}</span> to the Landlord, which shall be refunded upon vacating the premises.
                        </li>
                        <li>
                          <strong>Usage:</strong> The leased premises shall be used only for residential purposes by the Tenant and their family members.
                        </li>
                        <li>
                          <strong>Maintenance:</strong> Minor repairs and routine electricity/water bill charges shall be borne by the Tenant. Major structural repairs shall be the responsibility of the Landlord.
                        </li>
                      </ol>

                      {/* Signature block */}
                      <div className="pt-8 grid grid-cols-2 gap-8 border-t border-slate-100 font-sans text-[10px]">
                        <div className="space-y-1">
                          <p className="text-slate-450 uppercase tracking-wider">Signed by Landlord</p>
                          <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1 font-sans">
                            <p className="font-bold text-emerald-800">{viewedProperty.ownerName}</p>
                            <p className="text-[9px] text-emerald-600 flex items-center gap-1 font-semibold">
                              <ShieldCheck className="w-3.5 h-3.5" /> Aadhaar OTP Verified eSign
                            </p>
                            <p className="text-[8px] text-slate-400 font-mono">28-Dec-2025 14:32 IST</p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-slate-450 uppercase tracking-wider">Signed by Tenant</p>
                          <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1 font-sans">
                            <p className="font-bold text-emerald-800">{tenantName}</p>
                            <p className="text-[9px] text-emerald-600 flex items-center gap-1 font-semibold">
                              <ShieldCheck className="w-3.5 h-3.5" /> Aadhaar OTP Verified eSign
                            </p>
                            <p className="text-[8px] text-slate-400 font-mono">29-Dec-2025 10:15 IST</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 shrink-0">
                  <button
                    onClick={() => setShowAgreement(false)}
                    className="px-4 py-2 border border-slate-200 hover:border-slate-350 text-slate-650 hover:text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black rounded-xl text-xs transition-all shadow-md shadow-purple-500/10 cursor-pointer flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Agreement
                  </button>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4 sm:py-8 md:py-12 space-y-6 sm:space-y-12 text-slate-800 dark:text-slate-100">
      
      {/* Join Property Section (Horizontal Format) */}
      <section className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-slate-900 dark:bg-slate-900/40 border border-white/10 shadow-[0_0_30px_rgba(124,58,237,0.1)]">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-brand-purple/10 rounded-full blur-[40px] pointer-events-none" />

        <div className="relative z-10 p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-6 md:gap-10">
          {/* Left info column */}
          <div className="flex items-center gap-3 text-left flex-row max-w-md shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner shrink-0">
              <KeyRound className="w-5 h-5 sm:w-6 sm:h-6 text-brand-purple" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg md:text-2xl font-black text-white tracking-tight">Join a Property</h2>
              <p className="hidden sm:block text-xs text-slate-400 font-medium mt-1 leading-relaxed">
                Enter the <span className="font-extrabold text-white">6-character property code</span> shared by your landlord.
              </p>
            </div>
          </div>

          {/* Right form/success column */}
          <div className="w-full sm:flex-1 max-w-md shrink-0">
            <AnimatePresence mode="wait">
              {/* SUCCESS STATE */}
              {joinState === 'success' && matchedProperty ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-3"
                >
                  <div className="bg-slate-950/60 rounded-xl border border-white/10 p-3 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-left">
                        <span className="text-[8px] font-extrabold text-slate-500 uppercase tracking-widest block">PROPERTY</span>
                        <span className="text-xs sm:text-sm font-black text-white mt-0.5 block truncate max-w-[180px]">{matchedProperty.title}</span>
                      </div>
                      <span className="shrink-0 inline-flex items-center gap-1 text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 bg-brand-mint/10 text-brand-mint rounded-md border border-brand-mint/20">
                        VERIFIED
                      </span>
                    </div>

                    <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-3 text-left">
                      <div>
                        <span className="text-[8px] font-extrabold text-slate-500 uppercase tracking-widest block">DEED OWNER</span>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-300 mt-0.5 block truncate">{matchedProperty.owner}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-extrabold text-slate-500 uppercase tracking-widest block">PREMISES AREA</span>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-300 mt-0.5 block truncate">{matchedProperty.area}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (!matchedProperty) return;
                        const prop = getPropertyById(matchedProperty.propertyId);
                        if (prop) {
                          setViewedProperty(prop);
                          if (onPropertySelect) onPropertySelect(prop);
                        }
                      }}
                      className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-[10px] font-black rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Dashboard <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleReset}
                      className="py-2.5 px-3 border border-white/10 hover:bg-white/5 text-slate-450 hover:text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* INPUT STATE */
                <motion.div
                  key="input"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  <div className="flex gap-2 items-stretch">
                    <div className="relative flex-1">
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder="ENTER CODE"
                        maxLength={CODE_LENGTH}
                        value={code}
                        onChange={(e) => handleChange(e.target.value)}
                        className={`w-full h-10 text-center text-xs font-mono font-black rounded-lg border transition-all outline-none uppercase tracking-widest ${
                          joinState === 'error'
                            ? 'border-red-500 bg-red-950/20 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.15)]'
                            : code
                            ? 'border-brand-purple bg-brand-purple/5 text-white shadow-[0_0_10px_rgba(124,58,237,0.1)]'
                            : 'border-white/10 bg-slate-950/50 text-white focus:border-brand-purple focus:bg-slate-900'
                        }`}
                      />
                      {joinState === 'error' && (
                        <p className="absolute left-1 -bottom-4 text-[8px] font-bold text-red-450 flex items-center gap-0.5 z-10">
                          <Lock className="w-2.5 h-2.5 text-red-500" />
                          Verification failed. Check with owner.
                        </p>
                      )}
                    </div>

                    <button
                      onClick={handleJoin}
                      disabled={!isFull || joinState === 'verifying'}
                      className={`h-10 px-4 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
                        isFull && joinState !== 'verifying'
                          ? 'bg-brand-purple text-white shadow-[0_0_15px_rgba(124,58,237,0.2)] hover:bg-purple-600'
                          : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                      }`}
                    >
                      {joinState === 'verifying' ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-purple" />
                          Verify...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Verify
                        </>
                      )}
                    </button>
                  </div>
                  {/* Empty spacer for error message if present */}
                  {joinState === 'error' && <div className="h-2" />}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Rented Properties Section */}
      <section>
        <div className="mb-3 sm:mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">My Rented Properties</h2>
            <p className="hidden sm:block text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Access your active leases and dashboards</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {rentedProperties.map((property, idx) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.3 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer"
              onClick={() => {
                setViewedProperty(property);
                if (onPropertySelect) onPropertySelect(property);
              }}
            >
              <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-950 relative overflow-hidden">
                <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[8px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full shadow-md">
                  Active
                </div>
              </div>
              <div className="p-2.5 sm:p-5">
                <h3 className="font-black text-slate-900 dark:text-white text-xs sm:text-lg mb-0.5 truncate">{property.title}</h3>
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 truncate">{property.location}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div>
                    <p className="text-[8px] sm:text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider">Monthly Rent</p>
                    <p className="text-xs sm:text-base font-black text-brand-purple">₹{property.price.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-brand-purple group-hover:text-white transition-colors">
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
