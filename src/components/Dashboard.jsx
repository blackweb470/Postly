import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, FolderOpen, Plug, Settings, LogOut, Plus,
  Sparkles, FileText, Zap, Calendar, Trash2, Eye, X, Send,
  Facebook, Twitter, Instagram, Linkedin, Video,
  ChevronRight, Bell, Search, MoreHorizontal, RefreshCw,
  CheckCircle2, Clock, BarChart2, Globe, ArrowRight, TrendingUp, Activity
} from 'lucide-react';
import { apiCall } from '../lib/api';
import Postly from './Postly';

const PLATFORMS = ['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok'];

const PlatformIcon = ({ platform, className = 'w-4 h-4' }) => {
  if (platform === 'facebook') return <Facebook className={className} />;
  if (platform === 'twitter') return <Twitter className={className} />;
  if (platform === 'instagram') return <Instagram className={className} />;
  if (platform === 'linkedin') return <Linkedin className={className} />;
  return <Video className={className} />;
};

const platformColor = {
  facebook: 'text-[#1877F2] bg-[#1877F2]/10',
  twitter: 'text-[#000000] bg-black/5',
  instagram: 'text-[#E4405F] bg-[#E4405F]/10',
  linkedin: 'text-[#0A66C2] bg-[#0A66C2]/10',
  tiktok: 'text-[#ff0050] bg-[#ff0050]/10'
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function Dashboard({ user, onLogout }) {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [viewCampaign, setViewCampaign] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const sharePost = async (platform, text, imageUrl) => {
    // 1. Proactively grab the text
    try { await navigator.clipboard.writeText(text); } catch(e){}
    
    // 2. Fetch and download the image locally from Supabase URL
    if (imageUrl) {
      try {
        const resp = await fetch(imageUrl);
        const blob = await resp.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `postly-campaign.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } catch(e) {
        console.warn('Auto download failed', e);
      }
    }

    // 3. Fire Web Intent for Desktop or Web Share for Native
    let intentUrl = '';
    if (platform === 'twitter') intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    else if (platform === 'facebook') intentUrl = `https://www.facebook.com/sharer/sharer.php`;
    else if (platform === 'linkedin') intentUrl = `https://www.linkedin.com/feed/?shareActive=true`;
    
    if (intentUrl && !window.matchMedia("(any-pointer: coarse)").matches) {
       window.open(intentUrl, '_blank');
    } else if (navigator.share) {
       navigator.share({ text, url: imageUrl }).catch(()=>{});
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/api/campaigns');
      setCampaigns(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async (id) => {
    setDeleting(id);
    try {
      await apiCall(`/api/campaigns/${id}`, { method: 'DELETE' });
      setCampaigns(prev => prev.filter(c => c.id !== id));
      if (viewCampaign?.id === id) setViewCampaign(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    : 'N/A';

  const totalPosts = campaigns.length * 5;

  const kpis = [
    { label: 'Total Campaigns', value: campaigns.length, icon: FolderOpen, color: 'text-violet-500 bg-violet-500/10 border-violet-500/20' },
    { label: 'Generated Assets', value: totalPosts, icon: FileText, color: 'text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500/20' },
    { label: 'Active Channels', value: 5, icon: Globe, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    { label: 'Member Since', value: memberSince, icon: Calendar, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  ];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'campaigns', label: 'Campaigns', icon: FolderOpen, badge: campaigns.length },
    { id: 'analytics', label: 'Performance', icon: BarChart2 },
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || 'U';
  const userEmail = user?.email || '';

  // ── VIEW ROUTERS ─────────────────────────────────

  const renderDashboardHome = () => (
    <div className="animate-fade-in">
      {/* Welcome Banner */}
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">
          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">{userEmail.split('@')[0]}</span>
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Here's what's happening in your digital ecosystem today.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transform group-hover:scale-110 transition-transform duration-500">
                <Icon className="w-24 h-24" />
              </div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`p-2.5 rounded-xl border ${kpi.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-display font-bold text-slate-900 mb-1 relative z-10">{kpi.value}</p>
              <p className="text-sm text-slate-500 font-medium relative z-10">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left: Campaign Library */}
        <div className="xl:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-display font-bold text-slate-900">Recent Campaigns</h2>
            <button onClick={() => setActiveNav('campaigns')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center transition-colors">
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col min-h-[400px]">
            {loading ? (
              <div className="p-6 space-y-5">
                {[1, 2].map(i => (
                   <div key={i} className="flex gap-4 animate-pulse">
                     <div className="w-16 h-16 bg-slate-100 rounded-xl shrink-0"></div>
                     <div className="flex-1 space-y-3 py-1">
                       <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                       <div className="flex gap-2"><div className="w-6 h-6 rounded bg-slate-50"></div></div>
                     </div>
                   </div>
                ))}
              </div>
            ) : campaigns.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-5 rotate-3 border border-indigo-100 shadow-sm">
                  <Sparkles className="w-10 h-10 text-indigo-500" />
                </div>
                <h3 className="text-lg font-display font-bold text-slate-900 mb-2">No campaigns yet</h3>
                <p className="text-slate-500 mb-6 max-w-sm">Tap into AI to automatically transform your raw product shots into engaging multi-channel assets.</p>
                <button
                  onClick={() => setActiveNav('create')}
                  className="bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white px-6 py-3 rounded-xl font-medium transition shadow-lg shadow-black/5"
                >
                  Start your first campaign
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-y-auto">
                {campaigns.slice(0,5).map((c) => (
                  <div key={c.id} className="p-5 flex items-center gap-5 hover:bg-slate-50/50 transition-colors group">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 shrink-0 relative">
                      {c.image_url ? <img src={c.image_url} alt="" className="w-full h-full object-cover" /> : <FolderOpen className="w-6 h-6 m-auto mt-5 text-slate-300" />}
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <h4 className="font-semibold text-slate-900 text-base truncate mb-1">{c.metadata?.product_name || 'Untitled Campaign'}</h4>
                      <div className="flex items-center text-xs text-slate-500 gap-3">
                        <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {timeAgo(c.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button onClick={() => setViewCampaign(c)} className="bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 p-2.5 rounded-lg transition shadow-sm"><Eye className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Insights & Connections */}
        <div className="flex flex-col gap-6">
          {/* Status Card */}
          <div className="bg-gradient-to-br from-[#0a0a0a] to-[#1f1f1f] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-zinc-800 rounded-full blur-[40px] opacity-50 group-hover:bg-indigo-900/50 transition-colors duration-700"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-indigo-300">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">System Status</span>
              </div>
              <p className="text-3xl font-display font-bold mt-3 mb-1">Operational</p>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">AI models and distribution systems are running at peak performance.</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-300 border-t border-white/10 pt-3">
                  <span>Database Ping</span><span className="text-emerald-400 font-mono">12ms</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span>Inference APIs</span><span className="text-emerald-400 font-mono">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCampaignsView = () => (
    <div className="animate-fade-in flex flex-col h-full">
      <div className="mb-8 mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Campaign Library</h1>
          <p className="text-slate-500 mt-2 font-medium">Browse and manage all your generated marketing assets.</p>
        </div>
        <button onClick={fetchCampaigns} className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors flex items-center shadow-sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pb-10">
        {loading ? (
           [1,2,3,4].map(i => (
             <div key={i} className="bg-white border border-slate-200/60 rounded-2xl p-4 h-64 animate-pulse">
               <div className="w-full h-32 bg-slate-100 rounded-xl mb-4"></div>
               <div className="h-4 bg-slate-100 rounded w-3/4 mb-2"></div>
               <div className="h-4 bg-slate-100 rounded w-1/2"></div>
             </div>
           ))
        ) : campaigns.length === 0 ? (
           <div className="col-span-full py-20 text-center bg-white border border-slate-200/60 rounded-3xl shadow-sm">
              <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">Your library is empty</h3>
              <p className="text-slate-500">Create your first campaign to see it here.</p>
           </div>
        ) : (
          campaigns.map(c => (
            <div key={c.id} className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group flex flex-col">
              <div className="h-48 bg-slate-100 relative overflow-hidden">
                {c.image_url ? (
                  <img src={c.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><FolderOpen className="w-8 h-8 text-slate-300" /></div>
                )}
                <div className="absolute top-3 right-3 flex gap-1">
                  {PLATFORMS.slice(0,3).map(p => (
                    <div key={p} className="p-1.5 bg-white/90 backdrop-blur-sm rounded-md shadow-sm text-slate-700">
                      <PlatformIcon platform={p} className="w-3 h-3" />
                    </div>
                  ))}
                  <div className="p-1.5 bg-white/90 backdrop-blur-sm rounded-md shadow-sm text-xs font-bold text-slate-700">+2</div>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h4 className="font-semibold text-slate-900 truncate mb-1" title={c.metadata?.product_name}>{c.metadata?.product_name || 'Untitled Campaign'}</h4>
                <p className="text-xs text-slate-500 mb-4">{timeAgo(c.created_at)}</p>
                <div className="mt-auto flex gap-2">
                  <button onClick={() => setViewCampaign(c)} className="flex-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 py-2 rounded-lg text-sm font-semibold transition-colors">View & Share</button>
                  <button onClick={() => deleteCampaign(c.id)} disabled={deleting === c.id} className="p-2 border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    {deleting === c.id ? <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderAnalyticsView = () => (
    <div className="animate-fade-in">
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">System Performance</h1>
        <p className="text-slate-500 mt-2 font-medium">Estimated engagement metrics and system output insights.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center text-indigo-600 mb-4"><Activity className="w-5 h-5 mr-no bg-indigo-50 border border-indigo-100 p-1.5 rounded-lg mr-3 w-8 h-8" /> <span className="font-bold">Total Reach (Est)</span></div>
          <p className="text-4xl font-display font-bold text-slate-900">{(totalPosts * 1240).toLocaleString()}</p>
          <p className="text-emerald-500 text-sm mt-2 flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> +14.2% this week</p>
        </div>
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center text-fuchsia-600 mb-4"><Sparkles className="w-5 h-5 mr-no bg-fuchsia-50 border border-fuchsia-100 p-1.5 rounded-lg mr-3 w-8 h-8" /> <span className="font-bold">AI Tokens Used</span></div>
          <p className="text-4xl font-display font-bold text-slate-900">{(campaigns.length * 1500).toLocaleString()}</p>
          <p className="text-slate-400 text-sm mt-2">OpenAI GPT-4 optimization</p>
        </div>
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center text-blue-600 mb-4"><Globe className="w-5 h-5 mr-no bg-blue-50 border border-blue-100 p-1.5 rounded-lg mr-3 w-8 h-8" /> <span className="font-bold">Top Platform</span></div>
          <div className="flex items-center mt-2">
            <Facebook className="w-10 h-10 text-[#1877F2] mr-4" />
            <div>
              <p className="text-2xl font-display font-bold text-slate-900">Facebook</p>
              <p className="text-slate-500 text-sm">Highest conversion rate</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center min-h-[300px]">
         <BarChart2 className="w-16 h-16 text-indigo-100 mb-4" />
         <h3 className="text-slate-900 font-bold mb-2">Live Social Metrics Not Available</h3>
         <p className="text-slate-500 text-center max-w-sm">Postly currently operates in direct-export mode. True engagement metrics require individual platform API whitelisting.</p>
      </div>
    </div>
  );

  const renderIntegrationsView = () => (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Integrations Hub</h1>
        <p className="text-slate-500 mt-2 font-medium">Connect your professional networks to enable one-click API distribution.</p>
      </div>
      <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm p-6 sm:p-8">
        <div className="space-y-4">
          {PLATFORMS.map(platform => (
            <div key={platform} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-slate-200/80 rounded-2xl hover:shadow-md transition bg-slate-50/30">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className={`p-3 rounded-xl mr-5 ${platformColor[platform]}`}>
                  <PlatformIcon platform={platform} className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 capitalize text-lg">{platform === 'twitter' ? 'X (Twitter)' : platform}</h4>
                  <p className="text-sm text-slate-400 flex items-center font-medium mt-0.5">
                     Direct OAuth 2.0 API connection
                  </p>
                </div>
              </div>
              <button disabled className="px-5 py-2.5 rounded-xl text-sm font-bold transition bg-indigo-50 text-indigo-600 border border-indigo-100 cursor-not-allowed shadow-sm">
                Coming Soon
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettingsView = () => (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Workspace Settings</h1>
        <p className="text-slate-500 mt-2 font-medium">Manage your enterprise account and billing preferences.</p>
      </div>
      
      <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden mb-8">
        <div className="p-8 border-b border-slate-100">
           <h3 className="font-bold text-lg text-slate-900 mb-6">Profile Information</h3>
           <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium">
                  {userEmail}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Member Since</label>
                <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium">
                  {memberSince}
                </div>
              </div>
           </div>
        </div>
        <div className="p-8 bg-indigo-50/50">
           <div className="flex justify-between items-center">
             <div>
               <h3 className="font-bold text-indigo-900 mb-1">Enterprise Subscription</h3>
               <p className="text-indigo-600/80 text-sm">You are on the highest tier. All features unlocked.</p>
             </div>
             <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm">Active</div>
           </div>
        </div>
      </div>

      <div className="bg-white border border-red-200 rounded-3xl shadow-sm p-8">
         <h3 className="font-bold text-lg text-red-600 mb-2">Danger Zone</h3>
         <p className="text-slate-500 text-sm mb-6">Irreversible actions for your workspace.</p>
         <button onClick={onLogout} className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white px-6 py-2.5 rounded-xl font-bold transition-colors">
            Log out of Postly
         </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeNav) {
      case 'campaigns': return renderCampaignsView();
      case 'analytics': return renderAnalyticsView();
      case 'integrations': return renderIntegrationsView();
      case 'settings': return renderSettingsView();
      case 'create': 
        return <Postly user={user} onCampaignSaved={() => { fetchCampaigns(); setActiveNav('campaigns'); }} />;
      default: return renderDashboardHome();
    }
  };

  return (
    <div className="flex h-screen bg-[#F6F8FA] font-sans antialiased overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-900">

      {/* ── PREMIUM SIDEBAR ──────────────────────── */}
      <aside className="w-64 bg-[#0A0A0A] flex flex-col shrink-0 border-r border-[#1f1f1f] shadow-2xl relative z-20">
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none"></div>

        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-[#1f1f1f] relative">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-fuchsia-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
            <span className="text-white font-display font-black text-sm">P</span>
          </div>
          <span className="text-white font-display font-bold text-xl tracking-tight leading-none">Postly</span>
          <span className="ml-2 text-[8px] tracking-widest font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded-sm uppercase">PRO</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto relative z-10 scrollbar-hide">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 px-3 mb-4">Workspace</p>
          {navItems.map(item => {
            const Icon = item.icon;
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group ${
                  active
                    ? 'bg-[#1f1f1f] text-white shadow-inner border border-white/5'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className={`mr-3 p-1 rounded-lg transition-colors ${active ? 'bg-indigo-500/20 text-indigo-400' : 'group-hover:text-indigo-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {item.label}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${active ? 'bg-indigo-500/20 text-indigo-300' : 'bg-neutral-800 text-neutral-400 group-hover:bg-neutral-700'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User / Footer */}
        <div className="p-4 border-t border-[#1f1f1f] relative z-10">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition duration-300 cursor-pointer border border-transparent hover:border-white/5" onClick={() => setShowUserMenu(!showUserMenu)}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 ring-2 ring-[#0a0a0a]">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{userEmail}</p>
              <p className="text-[11px] text-neutral-500 cursor-pointer">Enterprise Edition</p>
            </div>
            <MoreHorizontal className="w-4 h-4 text-neutral-500" />
          </div>
          
          {showUserMenu && (
            <div className="absolute bottom-20 left-4 right-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden animate-fade-in origin-bottom">
              <div className="p-2">
                <button
                  onClick={() => { setShowUserMenu(false); onLogout(); }}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-400 font-medium hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" /> Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN PANEL ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Soft background glow */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-400/10 blur-[120px] rounded-full pointer-events-none -translate-y-1/2"></div>
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-fuchsia-400/5 blur-[120px] rounded-full pointer-events-none"></div>

        {/* Top Header */}
        <header className="h-20 flex items-center px-10 gap-6 shrink-0 z-10 relative">
          <div className="flex-1">
            <div className="relative max-w-md group max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search database..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all shadow-sm placeholder:text-slate-400"
              />
            </div>
          </div>
          
          <button
            onClick={() => setActiveNav('create')}
            className="hidden lg:flex items-center bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all active:scale-95 group"
          >
            <div className="w-5 h-5 bg-white/10 rounded-md flex items-center justify-center mr-2 group-hover:bg-white/20 transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </div>
            Create Campaign
          </button>
          
          <div className="w-px h-6 bg-slate-200"></div>

          <button className="relative p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm text-slate-500 transition-all duration-300">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </header>

        {/* Dynamic Main Content Area */}
        <main className="flex-1 overflow-y-auto px-6 lg:px-10 pb-12 z-10">
          {renderContent()}
        </main>
      </div>

      {/* ── PREMIUM MODAL ───────────────────────────── */}
      {viewCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md cursor-pointer" onClick={() => setViewCampaign(null)}></div>
          
          <div className="relative bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200/50" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white z-10 relative">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200">
                   {viewCampaign.image_url && <img src={viewCampaign.image_url} className="w-full h-full object-cover" alt="" />}
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900">{viewCampaign.metadata?.product_name || 'Campaign Assets'}</h3>
                  <p className="text-sm text-slate-500 font-medium">{new Date(viewCampaign.created_at).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              <button onClick={() => setViewCampaign(null)} className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition bg-white border border-slate-200/60 shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 bg-slate-50/50 p-8">
              {viewCampaign.metadata && (
                <div className="mb-8 flex flex-wrap gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-2 self-center">AI Extraction:</span>
                  {viewCampaign.metadata.price_tier && (
                    <span className="text-xs font-semibold bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg shadow-sm">
                      {viewCampaign.metadata.price_tier}
                    </span>
                  )}
                  {viewCampaign.metadata.key_attributes?.map((attr, i) => (
                    <span key={i} className="text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-lg shadow-sm">
                      {attr}
                    </span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {viewCampaign.posts && Object.keys(viewCampaign.posts).map(p => (
                  viewCampaign.posts[p] ? (
                    <div key={p} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg ${platformColor[p] || 'bg-slate-100'}`}>
                          <PlatformIcon platform={p} className="w-3.5 h-3.5" />
                          <span className="capitalize">{p === 'twitter' ? 'X.com' : p}</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-slate-400 hover:text-indigo-600 transition p-1" title="Copy text" onClick={() => navigator.clipboard.writeText(viewCampaign.posts[p])}>
                            <FileText className="w-4 h-4" />
                          </button>
                          <button className="text-slate-400 hover:text-indigo-600 transition p-1" title="Share via Web" onClick={() => sharePost(p, viewCampaign.posts[p], viewCampaign.image_url)}>
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[15px] font-sans text-slate-700 leading-relaxed whitespace-pre-wrap">{viewCampaign.posts[p]}</p>
                    </div>
                  ) : null
                ))}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-white flex justify-end">
               <button 
                 onClick={() => setViewCampaign(null)} 
                 className="px-6 py-2.5 bg-slate-900 text-white font-medium text-sm rounded-xl hover:bg-slate-800 transition shadow-sm"
               >
                 Close Overview
               </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
