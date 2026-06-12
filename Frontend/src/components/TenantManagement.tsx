'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from './api';
import { 
  Users, 
  Plus, 
  Send, 
  FileText, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  X, 
  Clock, 
  TrendingUp, 
  Mail, 
  Phone,
  ArrowRight,
  Sparkles,
  QrCode
} from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  property: string;
  leaseStart: string;
  leaseEnd: string;
  rent: number;
  score: number;
  status: 'Active' | 'Pending Verification' | 'Notice Period';
}


export default function TenantManagement() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const data = await api.getPropertyTenants();
      const mappedTenants: Tenant[] = data.map((t: any) => ({
        id: t.id,
        name: t.users.full_name,
        avatar: t.users.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
        email: t.users.email,
        phone: t.users.phone || 'N/A',
        property: t.properties.property_name,
        leaseStart: new Date(t.joined_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        leaseEnd: 'TBD',
        rent: t.properties.rent_amount || 0,
        score: 750, // mock score for now
        status: t.status === 'active' ? 'Active' : 'Notice Period'
      }));
      setTenants(mappedTenants);
    } catch (err) {
      console.error('Failed to load tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Invite form state
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRent, setInviteRent] = useState('25000');
  const [selectedProperty, setSelectedProperty] = useState('Skyline Heights, BHK-2, Sector 62');
  
  // Notification Toast state
  const [notification, setNotification] = useState<string | null>(null);

  const triggerNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleSendReminder = (tenantName: string, phone: string) => {
    triggerNotification(`UPI rent payment reminder sent to ${tenantName} at ${phone}.`);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail || !invitePhone) {
      alert('Please fill out all fields.');
      return;
    }

    const newTenant: Tenant = {
      id: `ten-${Date.now()}`,
      name: inviteName,
      avatar: inviteName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      email: inviteEmail,
      phone: invitePhone,
      property: selectedProperty,
      leaseStart: 'Pending Approval',
      leaseEnd: 'TBD',
      rent: Number(inviteRent),
      score: 650, // default placeholder for pending background check
      status: 'Pending Verification'
    };

    setTenants(prev => [...prev, newTenant]);
    setShowInviteModal(false);
    
    // Clear inputs
    setInviteName('');
    setInviteEmail('');
    setInvitePhone('');
    
    triggerNotification(`Verification invitation sent to ${newTenant.name}. Background checks initiated.`);
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-lg text-left relative">
      
      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-50 pointer-events-none">
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold pointer-events-auto border border-slate-800"
            >
              <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
              <span>{notification}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5 mb-6">
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-[#7C3AED]" />
            Tenant Management Ledger
          </h3>
          <p className="text-[10px] text-slate-450 font-bold mt-1">
            Invite occupants, monitor RentEdge trust verification scores, and check active lease states.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-black rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md shadow-indigo-500/10"
        >
          <Plus className="w-4 h-4" />
          Invite Tenant
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="mb-6 relative max-w-md w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Filter by tenant name, email, or property unit..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-bold outline-none transition-colors"
        />
      </div>

      {/* Tenant List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-400">Loading tenants...</span>
          </div>
        ) : filteredTenants.length > 0 ? (
          filteredTenants.map((tenant) => (
            <motion.div
              key={tenant.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-slate-200/70 bg-slate-50/20 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-white hover:border-[#7C3AED]/40 hover:shadow-xs transition-all text-left"
            >
              {/* Left Column: Tenant Identity Profile */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#10B981] p-[1.5px] shrink-0">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-black text-slate-800 text-xs">
                    {tenant.avatar}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-slate-900 text-sm leading-none">{tenant.name}</span>
                    
                    {tenant.status === 'Active' && (
                      <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-full text-[9px] font-black text-[#10B981] uppercase tracking-wider">
                        Active Tenant
                      </span>
                    )}
                    {tenant.status === 'Pending Verification' && (
                      <span className="px-2 py-0.5 bg-amber-50 border border-amber-100 rounded-full text-[9px] font-black text-amber-600 uppercase tracking-wider inline-flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        Awaiting KYC
                      </span>
                    )}
                  </div>
                  
                  <span className="block text-[11px] text-slate-450 font-bold uppercase tracking-wider">
                    {tenant.property}
                  </span>

                  <div className="flex items-center gap-3 pt-1 text-[10.5px] text-slate-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {tenant.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {tenant.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle Column: RentEdge Trust Score & Contract Period */}
              <div className="flex items-center gap-6 self-start md:self-center">
                <div className="space-y-1">
                  <span className="block text-[9px] uppercase font-extrabold text-slate-400">RentEdge Trust Score</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-slate-900">{tenant.score}</span>
                    {tenant.score >= 700 ? (
                      <span className="text-[9px] bg-emerald-50 text-[#10B981] border border-emerald-100 px-1.5 py-0.2 rounded font-extrabold">Excellent</span>
                    ) : (
                      <span className="text-[9px] bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.2 rounded font-extrabold">Pending Check</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="block text-[9px] uppercase font-extrabold text-slate-400">Lease Agreement Timeline</span>
                  <span className="block text-xs font-bold text-slate-800">
                    {tenant.leaseStart} {tenant.leaseEnd !== 'TBD' && `to ${tenant.leaseEnd}`}
                  </span>
                </div>
              </div>

              {/* Right Column: Actions Block */}
              <div className="flex items-center gap-2 self-end md:self-center">
                {tenant.status === 'Active' ? (
                  <>
                    <button
                      onClick={() => handleSendReminder(tenant.name, tenant.phone)}
                      className="px-3 py-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5 text-indigo-500" />
                      Remind Rent
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => triggerNotification(`KYC verification link re-sent to ${tenant.email}.`)}
                      className="px-3.5 py-2 border border-dashed border-amber-300 hover:bg-amber-50/50 text-amber-700 text-xs font-extrabold rounded-xl transition-colors cursor-pointer"
                    >
                      Resend KYC Link
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-12 text-center text-slate-400 font-semibold text-xs bg-slate-50/30 border border-dashed border-slate-200 rounded-2xl">
            No tenants found
          </div>
        )}
      </div>

      {/* Invite Tenant Modal Overlay */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.96, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 15 }}
              className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-md w-full relative text-left"
            >
              <button
                onClick={() => setShowInviteModal(false)}
                className="absolute top-4 right-4 p-1 text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              <div className="flex items-center gap-2.5 mb-5">
                <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-[#7C3AED]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Invite Tenant to Verify
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    RentEdge executes autonomous KYC and Credit Mandate checks.
                  </p>
                </div>
              </div>

              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-450">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-bold outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-450">Email Address</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="aarav.sharma@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-bold outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-450">Phone Number (10 Digit)</label>
                  <input
                    type="tel"
                    required
                    value={invitePhone}
                    onChange={(e) => setInvitePhone(e.target.value)}
                    placeholder="+91 98332 99827"
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-bold outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-450">Expected Rent (INR)</label>
                    <input
                      type="number"
                      required
                      value={inviteRent}
                      onChange={(e) => setInviteRent(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-bold outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-450">Assigned Property</label>
                    <select
                      value={selectedProperty}
                      onChange={(e) => setSelectedProperty(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none transition-colors cursor-pointer"
                    >
                      <option value="Skyline Heights, BHK-2, Sector 62">Skyline Heights Unit 402</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-50 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-3.5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-black rounded-xl cursor-pointer transition-colors"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
