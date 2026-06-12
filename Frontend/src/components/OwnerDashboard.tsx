'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Wallet, 
  FileCheck, 
  Plus, 
  BellRing, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  LogOut,
  Sparkles,
  Inbox,
  ShieldCheck,
  TrendingUp,
  Copy,
  Trash2,
  KeyRound,
  Calendar,
  User,
  ChevronDown,
  ArrowLeftRight,
  Sun,
  Moon
} from 'lucide-react';

import { Property } from './propertiesData';
import { api } from './api';
import PropertyManagement from './PropertyManagement';
import OwnerMyProfile from './OwnerMyProfile';
import TenantRequests from './TenantRequests';
import TenantManagement from './TenantManagement';

interface OwnerDashboardProps {
  onLogout: () => void;
  onSwitchToTenant?: () => void;
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

function OwnerUserDropdown({ 
  onLogout, 
  onSwitchToTenant,
  onViewChange,
  align = 'top',
}: { 
  onLogout?: () => void; 
  onSwitchToTenant?: () => void; 
  onViewChange?: (view: string) => void;
  align?: 'top' | 'bottom';
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
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const doLogout = () => {
    localStorage.removeItem('rentedge_authenticated');
    localStorage.removeItem('rentedge_user_role');
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

  return (
    <div ref={ref} className="relative w-full">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all cursor-pointer ${
          open
            ? 'bg-purple-50 dark:bg-brand-purple/10 border-purple-200 dark:border-brand-purple/30 shadow-sm'
            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-705'
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-brand-purple/20 flex items-center justify-center text-brand-purple font-black text-xs shrink-0">
          {getInitials(userName)}
        </div>
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

export default function OwnerDashboard({ onLogout, onSwitchToTenant }: OwnerDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [reminderTarget, setReminderTarget] = useState<string | null>(null);
  const [reminderSentMessage, setReminderSentMessage] = useState(false);
  const [isGeneratingAgreement, setIsGeneratingAgreement] = useState(false);
  const [agreementStep, setAgreementStep] = useState<'form' | 'success'>('form');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('rentedge_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
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

  // Agreement Form State
  const [agreementTenant, setAgreementTenant] = useState('');
  const [agreementProperty, setAgreementProperty] = useState('');

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Properties State
  const [myProperties, setMyProperties] = useState<Property[]>([]);

  // Selected property in registry dropdown
  const [selectedRegistryPropertyId, setSelectedRegistryPropertyId] = useState<string>('');

  const [accessCodes, setAccessCodes] = useState<AccessCodeEntry[]>([]);

  useEffect(() => {
    async function loadProperties() {
      try {
        const data = await api.getProperties();
        setMyProperties(data);
        if (data.length > 0) {
          setSelectedRegistryPropertyId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load properties in OwnerDashboard:', err);
      }
    }
    loadProperties();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleGenerateCodeForUnit = (propertyId: string, unitIndex: number) => {
    const prop = myProperties.find(p => p.id === propertyId);
    if (!prop) return;
    
    const newRandomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newEntry: AccessCodeEntry = {
      id: `code-${Date.now()}`,
      propertyId: prop.id,
      property: prop.title,
      unitIndex: unitIndex,
      code: newRandomCode,
      status: 'Awaiting Tenant Entry',
      created: 'Just now'
    };
    
    const updatedCodes = [newEntry, ...accessCodes.filter(c => !(c.propertyId === propertyId && c.unitIndex === unitIndex))];
    setAccessCodes(updatedCodes);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('rentedge_access_codes_registry', JSON.stringify(updatedCodes));
      
      // Update tenant-facing lookup map
      const lookupSaved = localStorage.getItem('rentedge_access_codes');
      let lookupMap: Record<string, any> = {};
      if (lookupSaved) {
        try { lookupMap = JSON.parse(lookupSaved); } catch (e) {}
      }
      lookupMap[newRandomCode] = {
        title: `${prop.title} (Unit ${unitIndex})`,
        owner: localStorage.getItem('rentedge_user_fullname') || 'Property Owner',
        area: prop.location || prop.area || 'Bandra West, Mumbai',
        propertyId: prop.id
      };
      localStorage.setItem('rentedge_access_codes', JSON.stringify(lookupMap));
    }
    
    showToast(`Access code ${newRandomCode} generated for ${prop.title} (Unit ${unitIndex})!`);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`Access code ${code} copied to clipboard! Share with tenant.`);
  };

  const handleRevokeCodeForUnit = (id: string, code: string) => {
    const updatedCodes = accessCodes.filter(c => c.id !== id);
    setAccessCodes(updatedCodes);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rentedge_access_codes_registry', JSON.stringify(updatedCodes));
      
      // Remove from lookup map
      const lookupSaved = localStorage.getItem('rentedge_access_codes');
      if (lookupSaved) {
        try {
          const lookupMap = JSON.parse(lookupSaved);
          delete lookupMap[code];
          localStorage.setItem('rentedge_access_codes', JSON.stringify(lookupMap));
        } catch (e) {}
      }
    }
    showToast(`Access code ${code} has been revoked.`);
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Landlord OS', icon: LayoutDashboard },
    { id: 'properties', label: 'My Properties', icon: Building2 },
    { id: 'tenants', label: 'Tenants', icon: Users },
    { id: 'disputes', label: 'Agreement Portal', icon: FileCheck }
  ];

  const handleSendReminder = (tenantName: string) => {
    setIsSendingReminder(true);
    setReminderTarget(tenantName);
    
    setTimeout(() => {
      setIsSendingReminder(false);
      setReminderSentMessage(true);
      setTimeout(() => setReminderSentMessage(false), 3000);
    }, 1500);
  };

  const handleGenerateAgreement = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingAgreement(true);
    setAgreementStep('form');
    
    // Simulate generation
    setTimeout(() => {
      setAgreementStep('success');
    }, 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } }
  } as const;

  const activeRegProp = myProperties.find(p => p.id === selectedRegistryPropertyId);

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-slate-800 transition-colors duration-300">
      
      {/* Toast Reminder Alert */}
      <AnimatePresence>
        {reminderSentMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-6 right-6 bg-slate-900 border border-white/10 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-[100] text-xs font-bold"
          >
            <CheckCircle2 className="w-4 h-4 text-brand-mint" />
            <span>UPI Reminders sent to {reminderTarget} via Autopay gateway.</span>
          </motion.div>
        )}

        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-6 right-6 bg-slate-900 border border-white/10 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-[100] text-xs font-bold"
          >
            <Sparkles className="w-4 h-4 text-brand-mint animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
        
      {/* Sidebar Container */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200/60 flex-col justify-between shrink-0 fixed top-0 left-0 h-full z-40 p-5 shadow-sm">
          <div>
            <div className="flex flex-col gap-2 pb-6 mb-6 border-b border-slate-100">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Rent<span className="text-brand-purple">Edge</span>
              </span>
              <span className="inline-flex items-center w-fit gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-brand-purple/10 border border-purple-100 dark:border-brand-purple/20 text-[10px] font-bold uppercase tracking-wider text-brand-purple">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-pulse" />
                Owner Portal
              </span>
            </div>

            {/* Nav Links */}
            <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 pb-2 lg:pb-0 no-scrollbar">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? 'bg-slate-900 text-white shadow-xs' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand-mint' : ''}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-6 lg:mt-0 flex items-center justify-between gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-amber-400 transition-all cursor-pointer shadow-2xs shrink-0"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5 text-slate-600" />}
            </button>
            <div className="flex-1 min-w-0">
              <OwnerUserDropdown onLogout={onLogout} onSwitchToTenant={onSwitchToTenant} onViewChange={setActiveTab} />
            </div>
          </div>
      </aside>

      {/* Dashboard Content */}
      <div className="flex-1 min-w-0 flex flex-col lg:ml-64 overflow-x-hidden">
        
        {/* Top bar (Mobile Only) */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/50 px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-brand-purple text-white font-bold shrink-0">
              <span className="text-xs font-extrabold tracking-tighter">RE</span>
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              Owner Portal
            </span>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-650 dark:text-amber-400 transition-all cursor-pointer"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
            <OwnerUserDropdown
              onLogout={onLogout}
              onSwitchToTenant={onSwitchToTenant}
              onViewChange={setActiveTab}
              align="bottom"
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 lg:pb-8">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-6"
              >
                
                {/* KPI Metrics row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Card 1: Collection Status (Green text) */}
                  <motion.div 
                    variants={itemVariants}
                    className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs text-left flex flex-col justify-between min-h-[140px] relative overflow-hidden group hover:border-slate-300 transition-colors animate-fade-in"
                  >
                    <div className="space-y-3 z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] uppercase font-black tracking-widest text-slate-400">
                          Collection Status
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black bg-slate-50 text-slate-500 border border-slate-200">
                          Data unavailable
                        </span>
                      </div>

                      <div>
                        <span className="text-3xl font-black text-slate-350 font-mono tracking-tight">
                          ₹—
                        </span>
                        <span className="block text-[10px] text-slate-400 font-extrabold mt-1">
                          No active rent collection setup
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100/70 flex items-center justify-between text-[9px] font-black text-slate-450 mt-4 z-10">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-slate-400" />
                        0% change
                      </span>
                      <span className="text-slate-450 font-black">Escrow —</span>
                    </div>
                  </motion.div>

                  {/* Card 2: Late Dues (Orange/Red text) */}
                  <motion.div 
                    variants={itemVariants}
                    className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs text-left flex flex-col justify-between min-h-[140px] relative overflow-hidden group hover:border-slate-300 transition-colors animate-fade-in"
                  >
                    <div className="space-y-3 z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] uppercase font-black tracking-widest text-slate-400">
                          Late Dues
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black bg-slate-50 text-slate-500 border border-slate-200">
                          Data unavailable
                        </span>
                      </div>

                      <div>
                        <span className="text-3xl font-black text-slate-350 font-mono tracking-tight">
                          ₹—
                        </span>
                        <span className="block text-[10px] text-slate-450 font-extrabold mt-1">
                          No late dues recorded
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100/70 flex items-center justify-between text-[9px] font-black text-slate-450 mt-4 z-10">
                      <span className="flex items-center gap-1 text-slate-400">
                        <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
                        No auto-nudges
                      </span>
                      <span className="text-slate-400 font-black">0 Queued</span>
                    </div>
                  </motion.div>

                  {/* Card 3: Vacant Units (Neutral text) */}
                  <motion.div 
                    variants={itemVariants}
                    className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs text-left flex flex-col justify-between min-h-[140px] relative overflow-hidden group hover:border-slate-300 transition-colors animate-fade-in"
                  >
                    <div className="space-y-3 z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] uppercase font-black tracking-widest text-slate-400">
                          Vacant Units
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black bg-slate-50 text-slate-500 border border-slate-200">
                          Data unavailable
                        </span>
                      </div>

                      <div>
                        <span className="text-3xl font-black text-slate-350 tracking-tight">
                          — Units
                        </span>
                        <span className="block text-[10px] text-slate-450 font-extrabold mt-1">
                          No active listings
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100/70 flex items-center justify-between text-[9px] font-black text-slate-450 mt-4 z-10">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Building2 className="w-3.5 h-3.5" />
                        No vacancies
                      </span>
                      <span className="text-slate-400 font-black">—</span>
                    </div>
                  </motion.div>
                </div>

                {/* Lease Access Code Registry */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm text-left space-y-6 animate-fade-in">
                  <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <KeyRound className="w-4.5 h-4.5 text-brand-purple" />
                        Lease Access Code Registry
                      </h3>
                      <p className="text-[10px] text-slate-455 font-bold mt-1">
                        Select one of your properties to view and generate 6-digit access codes for each unit. Only your properties are accessible.
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {Array.from({ length: (activeRegProp as any).totalUnits || activeRegProp.beds || 1 }).map((_, idx) => {
                          const unitNum = idx + 1;
                          const codeObj = accessCodes.find(c => c.propertyId === activeRegProp.id && c.unitIndex === unitNum);

                          return (
                            <div key={unitNum} className="p-4 border border-slate-250/70 hover:border-brand-purple/30 bg-slate-50/50 hover:bg-white rounded-2xl transition-all flex flex-col justify-between gap-4 min-h-[125px]">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-black text-slate-850">Unit #{unitNum}</span>
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

                              {codeObj ? (
                                <div className="flex items-center gap-2">
                                  <div className="bg-slate-900 border border-white/5 rounded-xl px-3 py-2 font-mono text-sm font-black text-brand-purple tracking-wider shadow-inner flex items-center justify-between w-full">
                                    <span>{codeObj.code}</span>
                                    <button
                                      onClick={() => handleCopyCode(codeObj.code)}
                                      className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                                      title="Copy Code"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => handleRevokeCodeForUnit(codeObj.id, codeObj.code)}
                                    className="p-2 border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-400 hover:text-red-655 rounded-xl transition-colors cursor-pointer shrink-0"
                                    title="Revoke Code"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleGenerateCodeForUnit(activeRegProp.id, unitNum)}
                                  className="w-full py-2.5 bg-brand-purple hover:bg-purple-650 text-white text-[10.5px] font-black rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                                >
                                  <KeyRound className="w-3.5 h-3.5" />
                                  Generate Code
                                </button>
                              )}
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

                {/* Tenant Roster Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  
                  {/* Table Card (Takes 2 columns on large screen) */}
                  <motion.div 
                    variants={itemVariants}
                    className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs xl:col-span-2 text-left"
                  >
                    <span className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-4">
                      Tenant Roster
                    </span>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-slate-100 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                            <th className="pb-3 pl-2">Tenant</th>
                            <th className="pb-3">Property</th>
                            <th className="pb-3">Rent</th>
                            <th className="pb-3">Status</th>
                            <th className="pb-3">RentEdge Score</th>
                            <th className="pb-3 pr-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">
                              No tenants found
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </motion.div>

                  {/* Actions Column */}
                  <motion.div 
                    variants={itemVariants}
                    className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <span className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-4">
                        Quick Actions
                      </span>

                      <div className="flex flex-col gap-3">
                        <button
                          onClick={() => {
                            setIsGeneratingAgreement(true);
                            setAgreementStep('form');
                          }}
                          className="w-full p-4 rounded-xl border border-slate-200/60 hover:border-brand-purple/20 bg-slate-50 hover:bg-white text-left transition-all duration-200 group cursor-pointer"
                        >
                          <div className="flex justify-between items-start">
                            <div className="p-2 bg-purple-50 text-brand-purple rounded-lg group-hover:bg-brand-purple group-hover:text-white transition-colors">
                              <FileCheck className="w-4.5 h-4.5" />
                            </div>
                            <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-purple transition-colors" />
                          </div>
                          <h4 className="text-xs font-black text-slate-805 mt-3">Generate Lease Agreement</h4>
                          <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-relaxed">
                            Draft a verified rental agreement integrated with e-Stamping rails.
                          </p>
                        </button>

                        <button 
                          onClick={() => handleSendReminder('All Pending')}
                          className="w-full p-4 rounded-xl border border-slate-200/60 hover:border-brand-purple/20 bg-slate-50 hover:bg-white text-left transition-all duration-200 group cursor-pointer"
                        >
                          <div className="flex justify-between items-start">
                            <div className="p-2 bg-amber-50 text-amber-500 rounded-lg group-hover:bg-amber-500 group-hover:text-white transition-colors">
                              <BellRing className="w-4.5 h-4.5" />
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-purple transition-colors" />
                          </div>
                          <h4 className="text-xs font-black text-slate-805 mt-3">Send Payment Reminders</h4>
                          <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-relaxed">
                            Nudge all tenants with outstanding rent values via automated UPI intent links.
                          </p>
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 text-[9px] text-slate-400 font-extrabold flex items-center justify-between">
                      <span>Node Status: IDFC Node 02</span>
                      <span className="w-2 h-2 rounded-full bg-brand-mint animate-pulse" />
                    </div>
                  </motion.div>

                </div>

              </motion.div>
            )}

            {/* Properties Tab */}
            {activeTab === 'properties' && (
              <PropertyManagement />
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <OwnerMyProfile onViewChange={setActiveTab} />
              </motion.div>
            )}

            {/* Tenants Tab */}
            {activeTab === 'tenants' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <TenantRequests />
                <TenantManagement />
              </motion.div>
            )}

            {/* Other tabs placeholders */}
            {activeTab !== 'dashboard' && activeTab !== 'properties' && activeTab !== 'settings' && activeTab !== 'tenants' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200/60 p-8 shadow-xs text-center flex flex-col items-center min-h-[350px] justify-center"
              >
                <div className="w-12 h-12 bg-purple-50 text-brand-purple rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-800 capitalize">{activeTab.replace('-', ' ')}</h3>
                <p className="text-xs text-slate-500 mt-2 max-w-sm font-semibold">
                  Track collections, generate instant invoices, audit compliance, and retrieve background verification logs directly from Indian bureaus.
                </p>
              </motion.div>
            )}
        </AnimatePresence>
        </main>
      </div>

      {/* Generate Agreement Simulated Modal */}
      <AnimatePresence>
        {isGeneratingAgreement && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl relative overflow-hidden"
            >
              {agreementStep === 'form' ? (
                <form onSubmit={handleGenerateAgreement} className="space-y-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-brand-purple mb-2">
                    <FileCheck className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black">Generate Smart Agreement</h3>
                    <p className="text-xs text-slate-400 mt-1.5 font-medium">Draft an instant verified digital e-stamped contract.</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-[9px] uppercase font-extrabold tracking-wider text-slate-400 mb-1">Tenant Name</label>
                      <input 
                        type="text" 
                        required 
                        value={agreementTenant}
                        onChange={(e) => setAgreementTenant(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-brand-purple rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors font-bold"
                        placeholder="Tenant Name"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-extrabold tracking-wider text-slate-400 mb-1">Property Name</label>
                      <input 
                        type="text" 
                        required 
                        value={agreementProperty}
                        onChange={(e) => setAgreementProperty(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-brand-purple rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors font-bold"
                        placeholder="Property Name"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3 pt-2">
                    <button 
                      type="button"
                      onClick={() => setIsGeneratingAgreement(false)}
                      className="px-4 py-2 border border-white/10 text-white rounded-xl text-xs hover:bg-white/5 cursor-pointer font-bold"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-5 py-2 bg-brand-purple text-white rounded-xl text-xs font-black hover:bg-purple-750 transition-colors shadow-md cursor-pointer"
                    >
                      Generate Stamp Draft
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-4">
                  <motion.div 
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-brand-mint text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  >
                    <CheckCircle2 className="w-8 h-8" />
                  </motion.div>
                  <h3 className="text-lg font-black text-white">Lease Agreement Drafted!</h3>
                  <p className="text-xs text-slate-400 mt-2 px-4 leading-relaxed font-semibold">
                    The Smart Agreement for {agreementTenant} has been generated and queued for e-stamping. Autopay mandate sent.
                  </p>

                  <div className="mt-6 p-4 bg-white/5 rounded-2xl flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-300">Contract Reference ID</span>
                    <span className="text-sm font-extrabold text-brand-purple mt-1.5 font-mono">CONTRACT-BG-9831</span>
                  </div>

                  <div className="mt-8">
                    <button 
                      onClick={() => setIsGeneratingAgreement(false)}
                      className="px-6 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors shadow-md cursor-pointer"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Mobile Bottom Nav ──────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#101420]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-white/5 pt-2.5 pb-safe px-4 flex items-center justify-around shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center gap-1 px-2 py-1 cursor-pointer relative"
            >
              {isActive && (
                <motion.div
                  layoutId="mobileActiveOwner"
                  className="absolute inset-0 bg-purple-50 dark:bg-brand-purple/15 rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-brand-purple' : 'text-slate-450 dark:text-slate-400'}`} />
              <span className={`text-[9px] font-black uppercase tracking-wide truncate max-w-[60px] text-center ${isActive ? 'text-brand-purple' : 'text-slate-450 dark:text-slate-400'}`}>
                {item.id === 'dashboard' ? 'Home' : item.id === 'properties' ? 'Props' : item.id === 'tenants' ? 'Tenants' : 'Legal'}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
