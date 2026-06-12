'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Users, 
  Wallet, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles,
  MapPin,
  Calendar,
  Plus,
  ArrowRight,
  ShieldCheck,
  Inbox,
  User,
  ChevronRight,
  ChevronDown,
  LogOut,
  Layers,
  Settings,
  AlertTriangle,
  FileCheck,
  XCircle,
  Copy,
  Trash2,
  KeyRound,
  ArrowLeftRight,
  Home,
  Sun,
  Moon
} from 'lucide-react';
import ProfileSettings from './ProfileSettings';
import ListingWizard from './ListingWizard';
import PropertyDetail from './PropertyDetail';
import TenantManagement from './TenantManagement';
import FinancialManagement from './FinancialManagement';
import { Property, mockProperties } from './propertiesData';
import { api } from './api';

interface LandlordOSProps {
  onListAnotherProperty?: () => void;
  onLogout?: () => void;
  expectedRent?: number;
  propertyTitle?: string;
  totalUnits?: number;
}

interface AccessCodeEntry {
  id: string;
  propertyId: string;
  property: string;
  unitIndex: number;
  code: string;
  status: string;
  created: string;
}

// ─── Owner Account Dropdown (bottom-left corner) ──────────────────────────────
function OwnerUserDropdown({ 
  onLogout, 
  onSwitchToTenant,
  onViewChange,
  align = 'top',
  compact = false
}: { 
  onLogout?: () => void; 
  onSwitchToTenant?: () => void; 
  onViewChange?: (view: 'dashboard' | 'properties' | 'tenants' | 'financials' | 'settings') => void;
  align?: 'top' | 'bottom';
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await api.getMe();
        setUserName(userData.fullName);
        setUserEmail(userData.email);
        localStorage.setItem('rentedge_user_fullname', userData.fullName);
        localStorage.setItem('rentedge_user_email', userData.email);
      } catch (err) {
        setUserName(localStorage.getItem('rentedge_user_fullname') || 'User');
        setUserEmail(localStorage.getItem('rentedge_user_email') || '');
      }
    }
    fetchUser();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const doLogout = () => {
    localStorage.removeItem('rentedge_authenticated');
    localStorage.removeItem('rentedge_user_role');
    localStorage.removeItem('rentedge_lifecycle_state');
    localStorage.removeItem('rentedge_selected_property_id');
    localStorage.removeItem('rentedge_user_fullname');
    localStorage.removeItem('rentedge_user_email');
    onLogout?.();
    setOpen(false);
  };

  const doSwitchTenant = () => {
    localStorage.setItem('rentedge_user_role', 'tenant');
    onSwitchToTenant?.();
    setOpen(false);
  };

  if (compact) {
    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shrink-0 cursor-pointer border transition-all ${
            open
              ? 'bg-purple-100 dark:bg-brand-purple/25 border-brand-purple/40 text-brand-purple shadow-sm scale-95'
              : 'bg-purple-50 dark:bg-brand-purple/10 border-purple-100 dark:border-brand-purple/20 text-brand-purple hover:bg-purple-100 dark:hover:bg-brand-purple/20'
          }`}
          title="Account Menu"
        >
          {getInitials(userName)}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: align === 'bottom' ? -6 : 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: align === 'bottom' ? -6 : 6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 z-50"
            >
              {/* User info header */}
              <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">{userName}</p>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium truncate">{userEmail}</p>
              </div>

              {/* My Profile */}
              <button
                onClick={() => {
                  onViewChange?.('settings');
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-brand-purple/10 hover:text-brand-purple dark:hover:text-brand-purple transition-colors cursor-pointer group text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-slate-850 group-hover:bg-purple-100 dark:group-hover:bg-slate-750 flex items-center justify-center transition-colors shrink-0">
                  <User className="w-3.5 h-3.5 text-brand-purple font-black" />
                </div>
                <span className="flex-1">My Profile</span>
              </button>

              {/* Switch to Tenant */}
              <button
                onClick={doSwitchTenant}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-75 dark:hover:text-violet-350 transition-colors cursor-pointer group text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-slate-850 group-hover:bg-violet-100 dark:group-hover:bg-slate-750 flex items-center justify-center transition-colors shrink-0">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                </div>
                <span className="flex-1">Switch to Tenant</span>
              </button>

              {/* Divider */}
              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

              {/* Sign Out */}
              <button
                onClick={doLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer group text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-slate-850 group-hover:bg-red-100 dark:group-hover:bg-slate-750 flex items-center justify-center transition-colors shrink-0">
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                </div>
                <span className="flex-1">Sign Out</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center text-left gap-3 px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${
          open
            ? 'bg-purple-50 dark:bg-brand-purple/10 border-purple-200 dark:border-brand-purple/30 shadow-sm'
            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-705'
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-brand-purple/20 flex items-center justify-center text-brand-purple font-black text-xs shrink-0">
          {getInitials(userName)}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{userName}</p>
          <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">Property Owner</p>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: align === 'bottom' ? -6 : 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: align === 'bottom' ? -6 : 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${
              align === 'bottom'
                ? 'right-0 top-full mt-2 w-56'
                : 'left-0 bottom-full mb-2 w-full'
            } bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 z-50`}
          >
            {/* User info header */}
            <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 mb-1">
              <p className="text-xs font-black text-slate-900 dark:text-slate-100">{userName}</p>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">{userEmail}</p>
              <span className="inline-block text-[8px] uppercase tracking-wider font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 mt-1.5">
                Verified Owner
              </span>
            </div>

            {/* My Profile */}
            <button
              onClick={() => {
                onViewChange?.('settings');
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-brand-purple/10 hover:text-brand-purple dark:hover:text-brand-purple transition-colors cursor-pointer group text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-slate-850 group-hover:bg-purple-100 dark:group-hover:bg-slate-750 flex items-center justify-center transition-colors shrink-0">
                <User className="w-3.5 h-3.5 text-brand-purple font-black" />
              </div>
              <span className="flex-1">My Profile</span>
            </button>

            {/* Switch to Tenant */}
            <button
              onClick={doSwitchTenant}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-75 dark:hover:text-violet-350 transition-colors cursor-pointer group text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-slate-850 group-hover:bg-violet-100 dark:group-hover:bg-slate-750 flex items-center justify-center transition-colors shrink-0">
                <ArrowLeftRight className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="flex-1">Switch to Tenant</span>
            </button>

            {/* Divider */}
            <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

            {/* Sign Out */}
            <button
              onClick={doLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer group text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-slate-850 group-hover:bg-red-100 dark:group-hover:bg-slate-750 flex items-center justify-center transition-colors shrink-0">
                <LogOut className="w-3.5 h-3.5 text-red-500" />
              </div>
              <span className="flex-1">Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LandlordOS({ 
  onListAnotherProperty, 
  onLogout,
  expectedRent = 25000,
  propertyTitle = 'Skyline Heights, BHK-2, Sector 62',
  totalUnits = 1
}: LandlordOSProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'properties' | 'tenants' | 'financials' | 'settings'>('dashboard');
  const [selectedProperty, setSelectedProperty] = useState<boolean>(false);
  const [showWizardInline, setShowWizardInline] = useState<boolean>(false);
  const [currentExpectedRent, setCurrentExpectedRent] = useState<number>(expectedRent);
  const [currentPropertyTitle, setCurrentPropertyTitle] = useState<string>(propertyTitle);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('rentedge_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('rentedge_theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('rentedge_theme', 'dark');
      setIsDarkMode(true);
    }
  };

  // Toast confirmation state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Properties State
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [selectedRegistryPropertyId, setSelectedRegistryPropertyId] = useState<string>('prop-1');
  const [accessCodes, setAccessCodes] = useState<AccessCodeEntry[]>([]);

  useEffect(() => {
    async function loadLandlordData() {
      try {
        const email = localStorage.getItem('rentedge_user_email') || '';
        const allProps = await api.getProperties();
        const landlordProps = allProps.filter((p: any) => p.ownerEmail === email);
        setMyProperties(landlordProps);
        if (landlordProps.length > 0) {
          setSelectedRegistryPropertyId(landlordProps[0].id);
        }

        const leasesData = await api.getMyLeases();
        const codes = leasesData.map((l: any) => ({
          id: l.id,
          propertyId: l.propertyId,
          property: l.propertyTitle,
          unitIndex: l.unitIndex,
          code: l.code,
          status: l.status,
          created: l.createdAt ? new Date(l.createdAt).toLocaleDateString() : 'Just now'
        }));
        setAccessCodes(codes);
      } catch (err) {
        console.error('Error loading landlord data:', err);
      }
    }
    loadLandlordData();
  }, []);

  // Keep selectedRegistryPropertyId updated if myProperties changes and it becomes empty or invalid
  React.useEffect(() => {
    if (myProperties.length > 0 && !myProperties.some(p => p.id === selectedRegistryPropertyId)) {
      setSelectedRegistryPropertyId(myProperties[0].id);
    }
  }, [myProperties, selectedRegistryPropertyId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleGenerateCodeForUnit = async (propertyId: string, unitIndex: number) => {
    const prop = myProperties.find(p => p.id === propertyId);
    if (!prop) return;
    
    try {
      const newCodeObj = await api.generateAccessCode(propertyId, unitIndex);
      const newEntry: AccessCodeEntry = {
        id: newCodeObj.id,
        propertyId: newCodeObj.propertyId,
        property: newCodeObj.property,
        unitIndex: newCodeObj.unitIndex,
        code: newCodeObj.code,
        status: newCodeObj.status,
        created: 'Just now'
      };
      const updatedCodes = [newEntry, ...accessCodes.filter(c => !(c.propertyId === propertyId && c.unitIndex === unitIndex))];
      setAccessCodes(updatedCodes);
      showToast(`Access code ${newCodeObj.code} generated for ${prop.title} (Unit ${unitIndex})!`);
    } catch (err: any) {
      alert(err.message || 'Failed to generate access code');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`Access code ${code} copied to clipboard! Share with tenant.`);
  };

  const handleRevokeCodeForUnit = async (id: string, code: string) => {
    try {
      await api.revokeLease(id);
      const updatedCodes = accessCodes.filter(c => c.id !== id);
      setAccessCodes(updatedCodes);
      showToast(`Access code ${code} has been revoked.`);
    } catch (err: any) {
      alert(err.message || 'Failed to revoke access code');
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Overview', icon: Building2 },
    { id: 'properties', label: 'Properties', icon: Layers },
    { id: 'tenants', label: 'Tenants', icon: Users },
    { id: 'financials', label: 'Financials', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings }
  ] as const;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring', stiffness: 120, damping: 15 } 
    }
  } as const;

  const activeRegProp = myProperties.find(p => p.id === selectedRegistryPropertyId);

  return (
    <div className="flex min-h-screen bg-[#F4F5F7] dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 border border-white/10 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold"
          >
            <Sparkles className="w-4 h-4 text-brand-mint animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Desktop Sidebar ──────────────────────────────── */}
      <aside className="hidden lg:flex w-60 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800/80 flex-col justify-between shrink-0 fixed top-0 left-0 h-full z-40">
        <div className="p-6 space-y-8">
          <div className="flex flex-col gap-2">
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Rent<span className="text-brand-purple">Edge</span>
            </span>
            <span className="inline-flex items-center w-fit gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Owner Portal
            </span>
          </div>

          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSelectedProperty(false);
                    setShowWizardInline(false);
                  }}
                  className={`w-full flex items-start text-left gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer relative border border-transparent ${
                    isActive
                      ? 'bg-brand-purple text-white shadow-md shadow-purple-500/20 dark:bg-brand-purple/20 dark:text-white dark:border-brand-purple/35 dark:shadow-[0_0_20px_rgba(124,58,237,0.15)]'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850/40 hover:text-slate-850 dark:hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActive"
                      className="absolute inset-0 bg-brand-purple dark:bg-brand-purple/15 rounded-xl -z-10"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom-left account dropdown */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <OwnerUserDropdown 
            onLogout={onLogout} 
            onSwitchToTenant={() => {
              localStorage.setItem('rentedge_user_role', 'tenant');
              onLogout?.();
            }} 
            onViewChange={(view) => setActiveTab(view)}
          />
        </div>
      </aside>

      {/* ─── Main Content Area ──────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col lg:ml-60">
        
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/50 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Brand + Portal badge */}
          <div className="flex items-center gap-2">
            <div className="lg:hidden relative flex items-center justify-center w-8 h-8 rounded-lg bg-brand-purple text-white font-bold shrink-0">
              <span className="text-xs font-extrabold tracking-tighter">RE</span>
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
            </div>
            <span className="lg:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              Owner Portal
            </span>
          </div>

          {/* Controls: Theme Switcher + Whole Accounts Button */}
          <div className="flex items-center gap-2">
            {/* Theme switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-650 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Whole Accounts Button (Mobile Only) */}
            <div className="lg:hidden shrink-0">
              <OwnerUserDropdown
                onLogout={onLogout}
                onSwitchToTenant={() => {
                  localStorage.setItem('rentedge_user_role', 'tenant');
                  onLogout?.();
                }}
                onViewChange={(view) => setActiveTab(view)}
                align="bottom"
                compact={true}
              />
            </div>
          </div>
        </header>

        {/* Dashboard Main Viewport */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 lg:pb-0 p-4 sm:p-8">
          
          <AnimatePresence mode="wait">
            
            {/* TAB 1: OVERVIEW / DASHBOARD */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard-tab"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {showWizardInline ? (
                  <ListingWizard 
                    onCancel={() => setShowWizardInline(false)}
                    onCompleteListing={async (data) => {
                      setShowWizardInline(false);
                      try {
                        const newProp = await api.createProperty({
                          title: data.address,
                          type: data.category,
                          price: data.rent,
                          depositMonths: 2,
                          totalUnits: data.totalUnits || 1,
                          images: data.images || []
                        });
                        
                        const email = localStorage.getItem('rentedge_user_email') || '';
                        const allProps = await api.getProperties();
                        const landlordProps = allProps.filter((p: any) => p.ownerEmail === email || p.ownerName === 'Rajvardhan Pawar');
                        setMyProperties(landlordProps);
                        
                        const unitsCount = data.totalUnits || 1;
                        for (let i = 1; i <= unitsCount; i++) {
                          await api.generateAccessCode(newProp.id, i);
                        }
                        
                        const leasesData = await api.getMyLeases();
                        const codes = leasesData.map((l: any) => ({
                          id: l.id,
                          propertyId: l.propertyId,
                          property: l.propertyTitle,
                          unitIndex: l.unitIndex,
                          code: l.code,
                          status: l.status,
                          created: 'Just now'
                        }));
                        setAccessCodes(codes);
                        
                        setCurrentExpectedRent(data.rent);
                        setCurrentPropertyTitle(data.address);
                        setSelectedRegistryPropertyId(newProp.id);
                        showToast(`Property "${newProp.title}" listed successfully with ${newProp.totalUnits} unit(s)!`);
                      } catch (err: any) {
                        alert(err.message || 'Failed to list property');
                      }
                    }}
                  />
                ) : (
                  <>
                    {/* Header title */}
                    <div className="flex justify-between items-center text-left">
                      <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                          Landlord OS Command
                        </h1>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                          Monitor lease access codes, verify billing parameters, and track rent inflow.
                        </p>
                      </div>
                    </div>

                    {/* Stripe-style KPI Metrics row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* KPI 1: Collection Status (Green text) */}
                      <motion.div 
                        variants={cardVariants}
                        className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs text-left flex flex-col justify-between min-h-[140px] relative overflow-hidden group hover:border-emerald-300 transition-colors"
                      >
                        {/* Sparkline background */}
                        <div className="absolute inset-x-0 bottom-0 h-12 z-0 pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity">
                          <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                            <path d="M 0 35 Q 20 25 40 30 T 80 10 T 100 5 L 100 40 L 0 40 Z" fill="#10B981" />
                            <path d="M 0 35 Q 20 25 40 30 T 80 10 T 100 5" fill="none" stroke="#10B981" strokeWidth="1.5" />
                          </svg>
                        </div>

                        <div className="space-y-3 z-10">
                          <div className="flex items-center justify-between">
                            <span className="text-[9.5px] uppercase font-black tracking-widest text-slate-400">
                              Collection Status
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black bg-emerald-50 text-brand-mint border border-emerald-100">
                              92% Collected
                            </span>
                          </div>

                          <div>
                            <span className="text-3xl font-black text-brand-mint font-mono tracking-tight">
                              ₹2,45,000
                            </span>
                            <span className="block text-[10px] text-slate-400 font-extrabold mt-1">
                              / ₹2,80,000 total expected rent
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100/70 flex items-center justify-between text-[9px] font-black text-slate-455 mt-4 z-10">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-[#10B981]" />
                            +8.2% vs last cycle
                          </span>
                          <span className="text-brand-mint font-black">Escrow Liquid</span>
                        </div>
                      </motion.div>

                      {/* KPI 2: Late Dues (Orange/Red text) */}
                      <motion.div 
                        variants={cardVariants}
                        className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs text-left flex flex-col justify-between min-h-[140px] relative overflow-hidden group hover:border-amber-300 transition-colors"
                      >
                        {/* Sparkline background */}
                        <div className="absolute inset-x-0 bottom-0 h-12 z-0 pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity">
                          <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                            <path d="M 0 15 Q 30 25 60 10 T 100 35 L 100 40 L 0 40 Z" fill="#F59E0B" />
                            <path d="M 0 15 Q 30 25 60 10 T 100 35" fill="none" stroke="#F59E0B" strokeWidth="1.5" />
                          </svg>
                        </div>

                        <div className="space-y-3 z-10">
                          <div className="flex items-center justify-between">
                            <span className="text-[9.5px] uppercase font-black tracking-widest text-slate-400">
                              Late Dues
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black bg-amber-50 text-amber-600 border border-amber-100">
                              Overdue 4 Days
                            </span>
                          </div>

                          <div>
                            <span className="text-3xl font-black text-amber-500 font-mono tracking-tight">
                              ₹35,000
                            </span>
                            <span className="block text-[10px] text-slate-455 font-extrabold mt-1">
                              1 Pending UPI e-mandate clearance
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100/70 flex items-center justify-between text-[9px] font-black text-slate-455 mt-4 z-10">
                          <span className="flex items-center gap-1 text-amber-600">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            Auto-nudge active
                          </span>
                          <span className="text-amber-600 font-black">Nudge Queued</span>
                        </div>
                      </motion.div>

                      {/* KPI 3: Vacant Units (Neutral text) */}
                      <motion.div 
                        variants={cardVariants}
                        className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs text-left flex flex-col justify-between min-h-[140px] relative overflow-hidden group hover:border-slate-350 transition-colors"
                      >
                        {/* Sparkline background */}
                        <div className="absolute inset-x-0 bottom-0 h-12 z-0 pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity">
                          <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                            <path d="M 0 35 L 50 35 L 100 35 L 100 40 L 0 40 Z" fill="#64748B" />
                            <path d="M 0 35 L 100 35" fill="none" stroke="#64748B" strokeWidth="1.5" />
                          </svg>
                        </div>

                        <div className="space-y-3 z-10">
                          <div className="flex items-center justify-between">
                            <span className="text-[9.5px] uppercase font-black tracking-widest text-slate-400">
                              Vacant Units
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black bg-slate-50 text-slate-500 border border-slate-200">
                              Occupancy 80%
                            </span>
                          </div>

                          <div>
                            <span className="text-3xl font-black text-slate-805 tracking-tight">
                              1 Unit
                            </span>
                            <span className="block text-[10px] text-slate-455 font-extrabold mt-1">
                              Out of 5 portfolio listings
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100/70 flex items-center justify-between text-[9px] font-black text-slate-455 mt-4 z-10">
                          <span className="flex items-center gap-1 text-slate-500">
                            <Building2 className="w-3.5 h-3.5" />
                            Interactive matches incoming
                          </span>
                          <span className="text-slate-550 font-black">1 Vacancy</span>
                        </div>
                      </motion.div>
                    </div>

                    {/* Middle Section: Lease Access Registry (Replaces Approval Inbox) */}
                    <div className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm text-left space-y-6">
                      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <KeyRound className="w-4.5 h-4.5 text-brand-purple" />
                            Lease Access Code Registry
                          </h3>
                          <p className="text-[10px] text-slate-455 font-bold mt-1">
                            Access codes are generated automatically. Share them with tenants.
                          </p>
                        </div>
                        
                        {myProperties.length > 0 && (
                          <div className="flex flex-col gap-1 w-full sm:w-72 shrink-0">
                            <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wide">Property Selected</label>
                            <select
                              value={selectedRegistryPropertyId}
                              onChange={(e) => setSelectedRegistryPropertyId(e.target.value)}
                              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-bold focus:outline-none focus:border-brand-purple focus:bg-white transition-colors"
                            >
                              {myProperties.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        {activeRegProp ? (
                          <div className="flex flex-col gap-2">
                            {Array.from({ length: (activeRegProp as any).totalUnits || activeRegProp.beds || 1 }).map((_, idx) => {
                              const unitNum = idx + 1;
                              const codeObj = accessCodes.find(c => c.propertyId === activeRegProp.id && c.unitIndex === unitNum);

                              return (
                                <div key={unitNum} className="px-4 py-3 border border-slate-200/70 hover:border-brand-purple/30 bg-slate-50/50 rounded-xl transition-all flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs font-black text-slate-805">Unit #{unitNum}</span>
                                    {codeObj ? (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8.5px] font-black bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wider">
                                        <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                                        Awaiting Link
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8.5px] font-black bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wider">
                                        Vacant
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2 max-w-[180px] w-full">
                                    {codeObj ? (
                                      <>
                                        <div className="bg-slate-900 border border-white/5 rounded-lg px-3 py-1.5 font-mono text-xs font-black text-brand-purple tracking-wider flex-1 text-center">
                                          {codeObj.code}
                                        </div>
                                        <button onClick={() => handleCopyCode(codeObj.code)} className="p-1.5 text-slate-400 hover:text-brand-purple transition-colors" title="Copy Code">
                                          <Copy className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => handleRevokeCodeForUnit(codeObj.id, codeObj.code)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors" title="Revoke">
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    ) : (
                                      <button onClick={() => handleGenerateCodeForUnit(activeRegProp.id, unitNum)} className="flex-1 py-1.5 bg-brand-purple hover:bg-purple-650 text-white text-[10px] font-black rounded-lg transition-all text-center">
                                        Generate
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 px-4 border border-dashed border-slate-250 rounded-2xl bg-slate-50/50">
                            <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 mb-3">
                              <KeyRound className="w-5 h-5 text-slate-400" />
                            </div>
                            <h4 className="text-xs font-black text-slate-900">No Properties Registered</h4>
                            <p className="text-[10px] text-slate-500 font-semibold text-center mt-1 max-w-sm leading-normal">
                              List a property to start generating unit access codes.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* TAB 2: PROPERTIES PORTFOLIO & DETAILS */}
            {activeTab === 'properties' && (
              <motion.div
                key="properties-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {selectedProperty ? (
                  <PropertyDetail 
                    propertyTitle={currentPropertyTitle}
                    onBack={() => setSelectedProperty(false)}
                    onDeleteSuccess={() => {
                      setSelectedProperty(false);
                      const updated = myProperties.filter(p => p.title !== currentPropertyTitle);
                      setMyProperties(updated);
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('rentedge_properties', JSON.stringify(updated));
                        
                        // Sync with all properties for tenant discovery
                        const savedAll = localStorage.getItem('rentedge_all_properties');
                        if (savedAll) {
                          try {
                            const allProps: Property[] = JSON.parse(savedAll);
                            localStorage.setItem('rentedge_all_properties', JSON.stringify(allProps.filter(p => p.title !== currentPropertyTitle)));
                          } catch (e) {}
                        }
                      }
                      if (updated.length > 0) {
                        setCurrentPropertyTitle(updated[0].title);
                        setCurrentExpectedRent(updated[0].price);
                      } else {
                        setCurrentPropertyTitle('No Properties Registered');
                        setCurrentExpectedRent(0);
                      }
                    }}
                  />
                ) : (
                  <div className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm text-left space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                          Properties Portfolio
                        </h3>
                        <p className="text-[10px] text-slate-455 font-bold mt-1">
                          Review unit specifications, active leases, and deletion guard states.
                        </p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setActiveTab('dashboard');
                          setShowWizardInline(true);
                        }}
                        className="px-3 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[10px] font-black rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add New
                      </button>
                    </div>

                    {myProperties.length > 0 ? (
                      <div className="space-y-4">
                        {myProperties.map((prop) => (
                          <div 
                            key={prop.id}
                            onClick={() => {
                              setCurrentPropertyTitle(prop.title);
                              setCurrentExpectedRent(prop.price);
                              setSelectedProperty(true);
                            }}
                            className="p-5 border border-slate-200 hover:border-[#7C3AED] bg-slate-50/50 hover:bg-white rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-4">
                              <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-650 shrink-0">
                                <Building2 className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-sm text-slate-900">{prop.title}</h4>
                                <p className="text-[10.5px] text-slate-400 font-bold mt-0.5">
                                  {prop.type} &bull; {prop.bhk || 2} BHK Config &bull; {prop.area || prop.city} &bull; ₹{prop.price.toLocaleString('en-IN')}/mo &bull; {(prop as any).totalUnits || prop.beds || 1} Unit(s)
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-slate-400 font-bold text-xs space-y-2">
                        <span>No properties registered in portfolio.</span>
                        <button
                          onClick={() => {
                            setActiveTab('dashboard');
                            setShowWizardInline(true);
                          }}
                          className="block mx-auto text-indigo-600 hover:underline text-[11px]"
                        >
                          + Create first listing
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 3: SETTINGS HUB */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ProfileSettings />
              </motion.div>
            )}

            {/* TAB 4: TENANTS HUB */}
            {activeTab === 'tenants' && (
              <motion.div
                key="tenants-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <TenantManagement />
              </motion.div>
            )}

            {/* TAB 5: FINANCIALS HUB */}
            {activeTab === 'financials' && (
              <motion.div
                key="financials-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <FinancialManagement />
              </motion.div>
            )}

          </AnimatePresence>
          
        </main>
      </div>

      {/* ─── Mobile Bottom Nav ──────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#101420]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-white/5 pt-2.5 pb-safe px-6 flex items-center justify-around shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSelectedProperty(false);
                setShowWizardInline(false);
              }}
              className="flex flex-col items-center gap-1 px-3 py-1 cursor-pointer relative"
            >
              {isActive && (
                <motion.div
                  layoutId="mobileActive"
                  className="absolute inset-0 bg-purple-50 dark:bg-brand-purple/15 rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-brand-purple' : 'text-slate-450 dark:text-slate-400'}`} />
              <span className={`text-[10px] font-black uppercase tracking-wide truncate max-w-[80px] text-center ${isActive ? 'text-brand-purple' : 'text-slate-450 dark:text-slate-400'}`}>
                {item.label === 'Overview' ? 'Overview' : item.label === 'Properties' ? 'Props' : item.label === 'Tenants' ? 'Tenants' : item.label === 'Financials' ? 'Finance' : 'Settings'}
              </span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
