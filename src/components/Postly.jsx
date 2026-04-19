import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, CheckCircle2, ChevronRight, ChevronLeft, Facebook, Twitter, Instagram, Copy, RefreshCw, X, Camera, Wand2, ArrowRight, Layers, Box, Sparkles, Send, Settings, Smartphone, Link as LinkIcon, Linkedin, Video, LogOut, Clock, Trash2 } from 'lucide-react';
import { apiCall } from '../lib/api';

const MOCK_IMAGES = {
  sneaker: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
  perfume: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80",
  headphones: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80"
};

const DEMO_POSTS = {
  facebook: "Step up your sneaker game! 👟 These vibrant crimson kicks are engineered for maximum comfort and unparalleled street style. Whether you're hitting the gym or the city streets, make a statement with every stride. Treat your feet to the ultimate upgrade. #Sneakerhead #StreetStyle",
  twitter: "Bold. Comfortable. Iconic. 🔴 Step into the new crimson runners and instantly upgrade your daily looks. Don't walk, run! 🔥 #Sneakerhead #FreshKicks",
  instagram: "Elevate your everyday aesthetic with a pop of crimson. 🩸 Unmatched comfort meets head-turning design. Your perfect journey starts here. ✨👟 #KicksOfTheDay #SneakerStyle",
  linkedin: "Thrilled to share our latest product innovation: The Crimson Velocity Runners. We engineered these specifically for maximum comfort without compromising on modern aesthetics. 🚀 Excellent for professionals navigating busy urban environments. #ProductInnovation #FootwearDesign #Performance",
  tiktok: "Wait till you see these crimson kicks! 🔥 literally the most comfortable runners ever?? Grab yours before they sell out! 👟🩸 #sneakerhead #unboxing #streetwear #fyp"
};

const STEPS = [
  { id: 1, name: "Capture Media", icon: Camera },
  { id: 2, name: "AI Studio Polish", icon: Wand2 },
  { id: 3, name: "Metadata Extraction", icon: Box },
  { id: 4, name: "Content Generation", icon: Sparkles },
  { id: 5, name: "Distribution", icon: Send }
];

export default function Postly({ onLogout, onBack, onCampaignSaved, user }) {
  const [step, setStep] = useState(1);
  const [showPitch, setShowPitch] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  const [rawImage, setRawImage] = useState(null);
  const [image, setImage] = useState(null);
  const [isPolishing, setIsPolishing] = useState(false);
  const [isPolishDone, setIsPolishDone] = useState(false);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const nativeCameraInputRef = useRef(null);

  const [analysis, setAnalysis] = useState(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  
  const [posts, setPosts] = useState({ facebook: '', twitter: '', instagram: '', linkedin: '', tiktok: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStates, setGeneratingStates] = useState({ facebook: false, twitter: false, instagram: false, linkedin: false, tiktok: false });
  const [humanizingStates, setHumanizingStates] = useState({ facebook: false, twitter: false, instagram: false, linkedin: false, tiktok: false });
  
  // Simulated OAuth Connections
  const [connectedApps, setConnectedApps] = useState({ facebook: false, twitter: false, instagram: false, linkedin: false, tiktok: false });
  const [connectingTo, setConnectingTo] = useState(null);
  
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(null);
  const fileInputRef = useRef(null);

  // Campaigns history
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [savingCampaign, setSavingCampaign] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [campaignSaved, setCampaignSaved] = useState(false);
  const [publicImageUrl, setPublicImageUrl] = useState(null);

  // AI Image Editor State
  const [editPrompt, setEditPrompt] = useState('');
  const [isAIEditing, setIsAIEditing] = useState(false);
  const [aiEditError, setAiEditError] = useState(null);
  const [showBefore, setShowBefore] = useState(false);
  const [adjustments, setAdjustments] = useState({ brightness: 100, contrast: 100, saturation: 100 });
  const [activeEditTab, setActiveEditTab] = useState('background');

  // Demo Mode Key Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'd') {
        setImage(MOCK_IMAGES.sneaker);
        setRawImage(MOCK_IMAGES.sneaker);
        setAnalysis({
          product_name: "Crimson Velocity Runners",
          key_attributes: ["Breathable mesh", "Responsive cushioning", "Vibrant crimson red", "Street-ready design"],
          target_audience: ["Sneakerheads", "Fitness enthusiasts", "Urban youth"],
          price_tier: "Premium",
          marketing_angle: "Stand out from the crowd with uncompromising comfort."
        });
        setPosts({ ...DEMO_POSTS });
        setIsPolishDone(true);
        setStep(4);
        showToast("Demo environment loaded");
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [stream]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // ---------------- CAMERA LOGIC ----------------
  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera access failed", err);
      setCameraError("Camera access was blocked or is unavailable over standard HTTP. Please use the 'Native Device Camera' button below.");
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    setCameraActive(false);
    setStream(null);
  };

  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setRawImage(dataUrl);
      setImage(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRawImage(reader.result);
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const loadDemoImage = (key) => {
    setRawImage(MOCK_IMAGES[key]);
    setImage(MOCK_IMAGES[key]);
  };

  // ---------------- IMAGE EDITOR ----------------

  // Convert any image src (data URL or URL) to a PNG File object for OpenAI API
  const imageToFile = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        if (blob) resolve(new File([blob], 'product.png', { type: 'image/png' }));
        else reject(new Error('Canvas toBlob failed'));
      }, 'image/png');
    };
    img.onerror = reject;
    img.src = src;
  });

  // AI Edit — proxied through Express server (key stays server-side)
  const applyAIEdit = async (prompt) => {
    const p = prompt || editPrompt;
    if (!p.trim()) return;
    setIsAIEditing(true);
    setAiEditError(null);
    try {
      const targetSize = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d', { alpha: true });
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = image; });
      
      // 1. Calculate square placement (Contain)
      const scale = Math.min(targetSize / img.width, targetSize / img.height);
      const x = (targetSize / 2) - (img.width / 2) * scale;
      const y = (targetSize / 2) - (img.height / 2) * scale;
      
      // 2. Draw image centered
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      
      // 3. Apply Smart Transparency for Background/Style edits
      // This forces DALL-E to replace the background instead of ignoring the request.
      const isBackgroundEdit = activeEditTab === 'background' || activeEditTab === 'style' || activeEditTab === 'lighting';
      if (isBackgroundEdit) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        // Create an "island" in the center for the product, erase the rest
        // We leave a generous elliptical/rectangular area for the product
        const prWidth = (img.width * scale) * 0.75;
        const prHeight = (img.height * scale) * 0.75;
        const prX = (targetSize - prWidth) / 2;
        const prY = (targetSize - prHeight) / 2;
        
        ctx.rect(0, 0, targetSize, targetSize);
        ctx.ellipse(targetSize/2, targetSize/2, prWidth/2, prHeight/2, 0, 0, Math.PI * 2);
        ctx.fill('evenodd'); 
        ctx.globalCompositeOperation = 'source-over';
      }

      const imageBase64 = canvas.toDataURL('image/png');
      console.log(`[AI Studio] Prepared 1024x1024 image mask, size: ${(imageBase64.length / 1024).toFixed(1)}KB`);

      const data = await apiCall('/api/openai/edit-image', {
        method: 'POST',
        body: JSON.stringify({ imageBase64, prompt: p })
      });
      
      if (!data.imageBase64 || data.imageBase64.length < 100) {
        throw new Error('AI returned an empty image. Try again.');
      }

      setImage(data.imageBase64);
      setIsPolishDone(true);
      showToast('AI edit applied successfully.');
    } catch (err) {
      console.error('[AI Studio Error]', err);
      setAiEditError(err.message || 'AI edit failed. Try a different prompt.');
    } finally {
      setIsAIEditing(false);
    }
  };


  // Manual canvas adjustment (brightness / contrast / saturation sliders)
  const applyManualAdjust = (newAdj) => {
    const adj = newAdj || adjustments;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = rawImage;
    img.onload = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.filter = `brightness(${adj.brightness}%) contrast(${adj.contrast}%) saturate(${adj.saturation}%)`;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setImage(canvas.toDataURL('image/jpeg', 0.95));
        setIsPolishDone(true);
      }
    };
  };

  // ---------------- AI ANALYSIS ----------------
  const performAnalysis = async () => {
    setStep(3);
    setIsAnalysing(true);
    setAnalysis(null);
    try {
      // Convert to base64 via canvas so server can pass to GPT-4o Vision
      const canvas = document.createElement('canvas');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = image; });
      canvas.width = img.width; canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      const imageBase64 = canvas.toDataURL('image/png');

      const data = await apiCall('/api/openai/analyze', {
        method: 'POST',
        body: JSON.stringify({ imageBase64 })
      });
      setAnalysis(data);
    } catch (err) {
      console.error(err);
      setAnalysis({ error: 'Analysis failed: ' + err.message });
    } finally {
      setIsAnalysing(false);
    }
  };

  const generateContent = async (platform, isolated = false) => {
    if (!analysis) return;
    if (!isolated) { setStep(4); setIsGenerating(true); }
    setGeneratingStates(prev => ({ ...prev, [platform]: true }));
    try {
      const data = await apiCall('/api/openai/generate', {
        method: 'POST',
        body: JSON.stringify({ platform, analysis })
      });
      setPosts(prev => ({ ...prev, [platform]: data.text }));
    } catch (err) {
      console.error(err);
      showToast(`Failed to generate ${platform} caption.`);
    } finally {
      setGeneratingStates(prev => ({ ...prev, [platform]: false }));
      if (!isolated) {
        setTimeout(() => {
          setGeneratingStates(current => {
            if (!current.facebook && !current.twitter && !current.instagram && !current.linkedin && !current.tiktok)
              setIsGenerating(false);
            return current;
          });
        }, 100);
      }
    }
  };

  const generateAllContent = () => {
    setStep(4);
    setIsGenerating(true);
    Object.keys(posts).forEach(p => generateContent(p));
  };

  // Humanize — proxied through server
  const humanizeCaption = async (platform) => {
    const text = posts[platform];
    if (!text?.trim()) return;
    setHumanizingStates(prev => ({ ...prev, [platform]: true }));
    try {
      const data = await apiCall('/api/openai/humanize', {
        method: 'POST',
        body: JSON.stringify({ platform, text })
      });
      if (data.text) setPosts(prev => ({ ...prev, [platform]: data.text }));
      showToast(`${platform} caption humanized.`);
    } catch (err) {
      showToast('Humanize failed: ' + err.message);
    } finally {
      setHumanizingStates(prev => ({ ...prev, [platform]: false }));
    }
  };

  // Save campaign to Supabase via server
  const saveCampaign = async () => {
    if (!image || !analysis) return;
    setSavingCampaign(true);
    try {
      // Get base64 for upload
      const canvas = document.createElement('canvas');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = image; });
      canvas.width = img.width; canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      const imageBase64 = canvas.toDataURL('image/png');

      const data = await apiCall('/api/campaigns', {
        method: 'POST',
        body: JSON.stringify({ imageBase64, metadata: analysis, posts })
      });
      setPublicImageUrl(data.image_url);
      setCampaignSaved(true);
      showToast('Campaign saved to your history!');
      // Refresh campaigns list
      loadCampaigns();
      if (onCampaignSaved) {
        setTimeout(onCampaignSaved, 1500); // Wait briefly so user sees the success toast before navigating
      }
    } catch (err) {
      showToast('Save failed: ' + err.message);
    } finally {
      setSavingCampaign(false);
    }
  };

  // Load past campaigns from server
  const loadCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
      const data = await apiCall('/api/campaigns');
      setCampaigns(data);
    } catch (err) {
      console.error('Load campaigns failed:', err.message);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  // Load campaigns on mount
  useEffect(() => { loadCampaigns(); }, []);

  const getCharLimit = (platform) => ({ twitter: 280, facebook: 300, instagram: 200, linkedin: 1300, tiktok: 150 }[platform]);

  const handleCopy = (platform, text) => {
    navigator.clipboard.writeText(text);
    setCopied(platform);
    showToast(`${platform.charAt(0).toUpperCase() + platform.slice(1)} copy cached to clipboard.`);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleConnection = async (platform) => {
    if (connectedApps[platform]) {
      setConnectedApps(prev => ({...prev, [platform]: false}));
      showToast(`${platform.charAt(0).toUpperCase() + platform.slice(1)} disconnected successfully.`);
    } else {
      setConnectingTo(platform);
      await new Promise(r => setTimeout(r, 1500)); // Simulate OAuth window
      setConnectedApps(prev => ({...prev, [platform]: true}));
      setConnectingTo(null);
      showToast(`${platform.charAt(0).toUpperCase() + platform.slice(1)} connected successfully!`);
    }
  };

  const dispatchToNetwork = async (platform) => {
    showToast(`Initializing API handshake with ${platform}...`);
    await new Promise(r => setTimeout(r, 1000));
    
    // Simulate real payload preparation
    console.group(`Postly Social Dispatch: ${platform}`);
    console.log('Payload Type:', 'Image + Metadata Content');
    console.log('Public URL:', publicImageUrl || 'Local Blob');
    console.log('Caption Length:', posts[platform]?.length);
    console.groupEnd();

    showToast(`Uploading creative and synchronizing metadata...`);
    await new Promise(r => setTimeout(r, 1200));
    
    showToast(`Successfully published to ${platform}! 🚀`);
  };

  // Download the current product image
  const downloadImage = () => {
    const a = document.createElement('a');
    a.href = image;
    a.download = 'postly-product.png';
    a.click();
  };

  // Share text + image via native OS share sheet (Web Share API)
  const shareWithImage = async (platform, text) => {
    const isMobile = window.matchMedia("(any-pointer: coarse)").matches;
    let shareText = text;
    let currentPublicUrl = publicImageUrl;

    // 2. Proactive Download & Rich Clipboard Copy (Desktop & Mobile)
    try { 
      downloadImage(); 
      
      const imgFile = await imageToFile(image);
      const isClipboardItemSupported = typeof ClipboardItem !== 'undefined';

      if (isClipboardItemSupported) {
        // Best approach: Copy both text AND actual image data
        const item = new ClipboardItem({
          'text/plain': new Blob([shareText], { type: 'text/plain' }),
          'image/png': imgFile
        });
        await navigator.clipboard.write([item]);
      } else {
        await navigator.clipboard.writeText(shareText);
      }
    } catch (e) {
      console.warn("Clipboard enhancement failed, using fallback", e);
      // Basic fallback
      try { await navigator.clipboard.writeText(shareText); } catch (e2) {}
    }

    // 3. Formulate Web Intents for Desktop users
    let intentUrl = '';
    if (platform === 'twitter') {
       intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    } else if (platform === 'facebook') {
       // Facebook sharer requires a URL and doesn't support text injection.
       // Since we have 'Rich Copy' in the clipboard, opening the feed is better for pasting image+text.
       intentUrl = `https://www.facebook.com`;
    } else if (platform === 'linkedin') {
       intentUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(shareText)}`; 
    }

    // 4. Desktop Execution: Open URL immediately
    if (intentUrl && !isMobile) {
       window.open(intentUrl, '_blank');
       showToast(`Image & Caption copied! Ready to paste in the new tab.`);
       return;
    }

    // 5. Mobile Execution: Native OS Share Sheet
    try {
      const file = await imageToFile(image);
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ text: shareText, files: [file] });
      } else if (navigator.share) {
        await navigator.share({ text: shareText });
        showToast('Caption copied. Attach the saved image manually.');
      } else {
        showToast(`Image & Caption ready! Open your ${platform} app and paste.`);
      }
    } catch (err) {
      if (err.name === 'AbortError') return; 
      showToast('Ready to paste. Open app to attach image manually.');
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden font-sans">
      <canvas ref={canvasRef} className="hidden" />

      {/* TOASTS */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-slate-50 px-5 py-3 rounded-lg shadow-2xl text-sm flex items-center animate-slide-in">
          <CheckCircle2 className="w-4 h-4 mr-3 text-emerald-400" />
          {toast}
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-slide-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900 flex items-center"><LinkIcon className="w-5 h-5 mr-2 text-slate-500" /> Integrations Hub</h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-700 transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <p className="text-sm text-slate-500 mb-4">Connect your professional networks to enable one-click API distribution from the dashboard.</p>
              
              {Object.keys(connectedApps).map(platform => (
                <div key={platform} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:shadow-sm bg-white transition">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg mr-4 ${
                      platform === 'facebook' ? 'bg-blue-100 text-blue-600' : 
                      platform === 'twitter' ? 'bg-slate-100 text-slate-800' : 
                      platform === 'linkedin' ? 'bg-indigo-100 text-indigo-700' :
                      platform === 'tiktok' ? 'bg-red-50 text-red-500' : 'bg-pink-100 text-pink-600'
                    }`}>
                      {platform === 'facebook' && <Facebook className="w-5 h-5" />}
                      {platform === 'twitter' && <Twitter className="w-5 h-5" />}
                      {platform === 'instagram' && <Instagram className="w-5 h-5" />}
                      {platform === 'linkedin' && <Linkedin className="w-5 h-5" />}
                      {platform === 'tiktok' && <Video className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 capitalize">{platform === 'twitter' ? 'X (Twitter)' : platform}</h4>
                      <p className="text-xs text-slate-500">{connectedApps[platform] ? 'Authenticated Status: Active' : 'Not Connected'}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => toggleConnection(platform)}
                    disabled={connectingTo === platform}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      connectedApps[platform] ? 'bg-red-50 text-red-600 hover:bg-red-100' : 
                      connectingTo === platform ? 'bg-slate-100 text-slate-500' : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {connectingTo === platform ? 'Connecting...' : connectedApps[platform] ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setShowSettings(false)} className="bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-slate-800">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* PITCH BANNER REMOVED FOR DASHBOARD INTEGRATION */}

      <aside className={`w-72 bg-[#0A0A0A] border-r border-[#1f1f1f] flex flex-col pt-0 transition-all z-10 relative`}>

        <nav className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="space-y-8 relative">
            <div className="absolute left-4 top-2 bottom-6 w-px bg-[#2a2a2a] -z-10"></div>
            
            {STEPS.map((s) => {
              const isActive = step === s.id;
              const isPast = step > s.id;
              const Icon = s.icon;
              return (
                <div key={s.id} className="flex flex-col relative">
                  <div className={`flex items-center group ${isActive ? '' : isPast ? 'cursor-pointer hover:opacity-80' : 'opacity-40'}`} onClick={() => isPast && setStep(s.id)}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm ${
                      isActive ? 'bg-indigo-500 border-indigo-400 text-white ring-4 ring-indigo-500/10 shadow-indigo-500/30' : 
                      isPast ? 'bg-[#1a1a1a] border-indigo-500 text-indigo-400' : 'bg-[#0A0A0A] border-[#2a2a2a] text-[#525252]'
                    }`}>
                      {isPast ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <div className="ml-4">
                      <p className={`text-sm font-semibold ${isActive ? 'text-white' : isPast ? 'text-slate-300' : 'text-[#525252]'}`}>{s.name}</p>
                      {isActive && <p className="text-xs text-indigo-300 mt-0.5">In Progress</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* MAIN WORKSPACE */}
      <main className="flex-1 overflow-y-auto relative bg-[#F8F9FB]">
        <div className="h-full flex flex-col">

          {/* STEP 1: CAPTURE MEDIA */}
          {step === 1 && (
            <div className="flex-1 flex flex-col lg:flex-row animate-slide-in">

              {/* LEFT — Upload Panel */}
              <div className="flex-1 flex flex-col justify-center p-10 lg:p-14 max-w-xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-indigo-500 mb-3">Step 1 of 5</p>
                <h2 className="text-3xl font-bold text-slate-900 leading-tight mb-2">Add your product image</h2>
                <p className="text-slate-400 text-sm mb-10">Upload a high-quality photo and our AI will handle the rest — from editing to caption generation.</p>

                {cameraError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm flex items-start">
                    <X className="w-4 h-4 mr-2 shrink-0 mt-0.5 cursor-pointer" onClick={() => setCameraError(null)} />
                    <span>{cameraError}</span>
                  </div>
                )}

                {cameraActive ? (
                  <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative aspect-video">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/80 to-transparent flex gap-3 justify-center">
                      <button onClick={stopCamera} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md px-5 py-2 rounded-lg text-sm font-medium transition">Cancel</button>
                      <button onClick={takeSnapshot} className="bg-white text-slate-900 px-6 py-2 rounded-lg text-sm font-semibold flex items-center transition hover:bg-slate-100 shadow-lg">
                        <Camera className="w-4 h-4 mr-2" /> Capture
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Primary drop zone */}
                    <div
                      onClick={() => fileInputRef.current.click()}
                      className="relative border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-slate-50/50 transition-all duration-200 group"
                    >
                      <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-200">
                        <UploadCloud className="w-8 h-8" />
                      </div>
                      <p className="text-slate-800 font-semibold text-base mb-1">Drop your image here</p>
                      <p className="text-slate-400 text-xs mb-4">or click to browse files</p>
                      <span className="text-[11px] text-slate-300 font-medium uppercase tracking-widest border border-slate-200 rounded-full px-3 py-1">JPEG · PNG · WEBP</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} ref={fileInputRef} />
                    </div>

                    {/* Secondary options */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={startCamera}
                        className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-all"
                      >
                        <Camera className="w-4 h-4 text-slate-400" /> Live Camera
                      </button>
                      <button
                        onClick={() => nativeCameraInputRef.current.click()}
                        className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-all"
                      >
                        <Smartphone className="w-4 h-4 text-slate-400" /> Mobile Camera
                        <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFileUpload} ref={nativeCameraInputRef} />
                      </button>
                    </div>

                    {/* Demo assets */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-slate-300 whitespace-nowrap">Try a demo:</span>
                      <div className="flex gap-1.5">
                        {['sneaker','perfume','headphones'].map(d => (
                          <button key={d} onClick={() => loadDemoImage(d)} className="px-3 py-1 rounded-full border border-slate-200 text-[11px] font-medium text-slate-500 hover:bg-slate-100 hover:border-slate-300 transition capitalize">{d}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT — Image Preview Panel */}
              <div className="hidden lg:flex flex-1 items-center justify-center bg-[#F0F1F3] border-l border-slate-200/60 p-12">
                {image ? (
                  <div className="w-full max-w-sm animate-slide-in">
                    <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/60 bg-white">
                      <img src={image} alt="Product preview" className="w-full object-contain max-h-72" />
                    </div>
                    <div className="mt-6 flex flex-col gap-3">
                      <p className="text-xs text-slate-400 text-center font-medium">Image loaded — ready to continue</p>
                      <button
                        onClick={() => setStep(2)}
                        className="w-full bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center transition-all shadow-lg"
                      >
                        Continue to Studio <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                      <button onClick={() => { setImage(null); setRawImage(null); }} className="text-xs text-slate-400 hover:text-slate-700 text-center transition">Change image</button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-3xl bg-white/70 border border-slate-200/60 flex items-center justify-center mx-auto mb-5 shadow-sm">
                      <UploadCloud className="w-10 h-10 text-slate-300" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Your image preview will appear here</p>
                    <p className="text-slate-300 text-xs mt-1">Upload a product photo to get started</p>
                  </div>
                )}
              </div>

              {/* Mobile continue button */}
              {image && !cameraActive && (
                <div className="lg:hidden px-10 pb-10">
                  <button onClick={() => setStep(2)} className="w-full bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center transition-all shadow-lg">
                    Continue to Studio <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: AI OPERATIONS STUDIO */}
          {step === 2 && (
            <div className="flex-1 flex flex-col lg:flex-row animate-slide-in min-h-0">

              {/* LEFT — Dark Image Canvas */}
              <div className="flex-1 bg-[#0f0f0f] flex flex-col">
                {/* Canvas Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f1f1f]">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#28ca41]"></div>
                    </div>
                    <span className="text-[#525252] text-xs font-medium ml-2">AI Studio Canvas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isPolishDone && (
                      <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Edit applied
                      </span>
                    )}
                  </div>
                </div>

                {/* Canvas Image */}
                <div className="flex-1 flex items-center justify-center p-8 relative">
                  {isAIEditing && (
                    <div className="absolute inset-0 z-10 bg-[#0f0f0f]/90 backdrop-blur-md flex flex-col items-center justify-center gap-4">
                      <div className="relative w-14 h-14">
                           <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                           <div className="absolute inset-0 border-4 border-transparent border-t-indigo-500 rounded-full animate-spin"></div>
                      </div>
                    </div>
                  )}
                  <img
                    src={showBefore ? rawImage : image}
                    className="max-w-full max-h-full object-contain rounded-xl shadow-2xl transition-all duration-500"
                    style={{maxHeight: 420}}
                    alt="Product"
                  />
                  {rawImage !== image && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                      <button
                        onMouseDown={() => setShowBefore(true)}
                        onMouseUp={() => setShowBefore(false)}
                        onMouseLeave={() => setShowBefore(false)}
                        className="bg-black/70 text-white text-xs font-medium px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm hover:bg-black/90 transition select-none"
                      >Hold: Before</button>
                      <span className={`text-xs font-semibold px-4 py-2 rounded-full border backdrop-blur-sm ${showBefore ? 'bg-white/10 text-white border-white/10' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/20'}`}>
                        {showBefore ? 'Original' : '✓ AI Edited'}
                      </span>
                    </div>
                  )}
                </div>
                {/* Canvas Footer */}
                <div className="px-6 py-4 border-t border-[#1f1f1f] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {rawImage !== image && (
                      <button onClick={() => { setImage(rawImage); setIsPolishDone(false); }} className="text-[#525252] hover:text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-[#2a2a2a] hover:border-white/20 transition">↩ Revert</button>
                    )}
                    <p className="text-[11px] text-[#525252] font-medium">Step 2 of 5 · AI Image Studio</p>
                  </div>
                  <button onClick={performAnalysis} className="bg-white hover:bg-slate-100 text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center transition-all shadow-md">
                    {isPolishDone ? <>Continue <ArrowRight className="w-4 h-4 ml-2" /></> : 'Skip & Analyse →'}
                  </button>
                </div>
              </div>

              {/* RIGHT — Operations Panel */}
              <div className="w-full lg:w-[380px] bg-white border-l border-slate-200/60 flex flex-col overflow-hidden">
                {/* Panel Header */}
                <div className="px-5 pt-5 pb-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-base">AI Operations</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Choose an operation to apply via OpenAI</p>
                </div>

                {/* Category Tabs — pill style */}
                <div className="flex gap-1.5 px-4 pt-3 pb-2 overflow-x-auto scrollbar-none shrink-0">
                  {[
                    { id: 'background', label: 'Background' },
                    { id: 'lighting', label: 'Lighting' },
                    { id: 'composite', label: 'Composite' },
                    { id: 'style', label: 'Style' },
                    { id: 'retouch', label: 'Retouch' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveEditTab(tab.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
                        activeEditTab === tab.id
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                      }`}
                    >{tab.label}</button>
                  ))}
                </div>

                {/* Operations List */}
                <div className="flex-1 overflow-y-auto px-3 py-2">
                     {({
                       background: [
                         { icon: '⬜', label: 'White studio', desc: 'Clean white studio background', prompt: 'Replace the background with a clean, seamless pure white studio photography background. Keep the product perfectly intact and correctly lit.' },
                         { icon: '🌫', label: 'Soft gradient', desc: 'Light grey gradient backdrop', prompt: 'Replace the background with a soft light grey gradient studio backdrop. Preserve the product precisely as-is.' },
                         { icon: '✂️', label: 'Remove background', desc: 'Make background transparent/clean', prompt: 'Remove the background completely and replace it with a flat white background. Keep product edges clean and precise.' },
                         { icon: '🌿', label: 'Lifestyle outdoor', desc: 'Natural outdoor environment', prompt: 'Place the product in a beautiful natural outdoor lifestyle setting with soft bokeh. The product must remain unchanged.' },
                         { icon: '🏙', label: 'Urban scene', desc: 'Modern city environment', prompt: 'Place the product in a stylish modern urban setting with city architecture and street background. Keep product quality pristine.' },
                         { icon: '🪨', label: 'Marble surface', desc: 'Luxury marble table surface', prompt: 'Place the product on a premium white marble surface with subtle reflections. Replace the background with a clean minimalist studio setting.' },
                       ],
                       lighting: [
                         { icon: '🔆', label: 'Studio perfect', desc: 'Professional 3-point lighting', prompt: 'Enhance the lighting to mimic professional product photography with a 3-point studio lighting setup: key light, fill light, and rim light. The product must remain unchanged.' },
                         { icon: '🌟', label: 'Dramatic shadows', desc: 'Cinematic hard shadows', prompt: 'Apply dramatic cinematic hard lighting with sharp, striking shadows to give the product a premium editorial feel. Keep the product shape and details intact.' },
                         { icon: '☀️', label: 'Natural daylight', desc: 'Soft natural window light', prompt: 'Apply soft, warm natural daylight illumination as if photographed near a large window. Maintain product accuracy.' },
                         { icon: '💜', label: 'Neon glow', desc: 'Vibrant neon ambient light', prompt: 'Add a cool neon purple and blue ambient glow around the product for a premium nighttime editorial feel. Keep product structure intact.' },
                         { icon: '🪩', label: 'Gradient light', desc: 'Colourful gradient overlay', prompt: 'Apply a vibrant purple-to-pink gradient lighting overlay consistent with high-fashion product photography. Preserve all product details.' },
                         { icon: '🌅', label: 'Golden hour', desc: 'Warm golden sunset tones', prompt: 'Relight the product with warm golden hour sunset tones and a soft lens flare for an aspirational feel. Do not alter the product itself.' },
                       ],
                       composite: [
                         { icon: '🔲', label: 'Drop shadow', desc: 'Realistic product shadow', prompt: 'Add a realistic natural drop shadow beneath the product as if photographed under studio lighting. Keep the product unchanged.' },
                         { icon: '🪞', label: 'Mirror reflection', desc: 'Glossy floor reflection', prompt: 'Add a realistic glossy floor reflection beneath the product on the surface it rests on. Keep the product unchanged.' },
                         { icon: '💫', label: 'Floating effect', desc: 'Levitating product in air', prompt: 'Make the product appear to float or levitate in mid-air with a clean background. Add subtle shadow beneath. Do not change the product appearance.' },
                         { icon: '🏷', label: 'Add label/tag', desc: 'Attach a price or brand tag', prompt: 'Add a small, clean white price tag or brand label attached realistically to the product. Keep the product intact.' },
                         { icon: '🌸', label: 'Add foliage', desc: 'Decorative leaf/plant props', prompt: 'Add decorative tropical leaves or floral props tastefully arranged around the product as editorial props. Keep the product unchanged.' },
                         { icon: '🎁', label: 'Gift wrapping', desc: 'Wrapped for gifting', prompt: 'Partially surround the product with premium glossy gift wrapping ribbon and tissue paper to suggest it is a gift. Keep the product fully visible.' },
                       ],
                       style: [
                         { icon: '🖤', label: 'Luxury editorial', desc: 'High-fashion magazine look', prompt: 'Transform this into a high-fashion luxury editorial product photograph suitable for Vogue or a premium fashion magazine. Maintain product accuracy.' },
                         { icon: '🎭', label: 'Flat lay', desc: 'Top-down minimalist layout', prompt: 'Recompose this as a minimalist top-down flat lay product photograph on a clean white surface with subtle shadows. Keep the product accurate.' },
                         { icon: '🎞', label: 'Film grain', desc: 'Analogue/vintage film look', prompt: 'Apply an analogue film photography aesthetic with subtle grain, slightly desaturated tones, and warm colour grading. Keep the product recognizable.' },
                         { icon: '🤍', label: 'Minimalist', desc: 'Ultra-clean minimal aesthetic', prompt: 'Apply an ultra-clean, Scandinavian minimalist aesthetic. White background, minimal shadows, maximum whitespace, premium product centering.' },
                         { icon: '🌈', label: 'Vivid pop art', desc: 'Bold pop-art color palette', prompt: 'Apply a bold, vivid pop-art aesthetic with highly saturated colours and graphic background. Keep the product shape perfectly intact.' },
                         { icon: '⚫', label: 'Premium dark', desc: 'Dark moody luxury look', prompt: 'Transform this into a dark moody luxury product photograph with a near-black background and dramatic controlled highlights. Keep product details sharp.' },
                       ],
                       retouch: [
                         { icon: '✨', label: 'Enhance detail', desc: 'Sharpen & upscale quality', prompt: 'Enhance the product image quality: sharpen fine details, improve texture clarity, reduce noise, and boost overall sharpness for professional product photography.' },
                         { icon: '🎨', label: 'Colour correct', desc: 'Fix white balance & exposure', prompt: 'Professionally colour correct this image: fix white balance, correct exposure, boost midtone contrast, and ensure the product colour is accurate and vibrant.' },
                         { icon: '💧', label: 'Skin/surface retouch', desc: 'Smooth surface imperfections', prompt: 'Smooth out any surface imperfections, blemishes, or unwanted marks on the product while preserving all texture and material details.' },
                         { icon: '📐', label: 'Straighten & crop', desc: 'Perfect framing & alignment', prompt: 'Re-compose the image so the product is perfectly centred, straight, and optimally framed within the image canvas. Adjust perspective if needed.' },
                         { icon: '🔍', label: 'Background cleanup', desc: 'Remove distracting elements', prompt: 'Remove any distracting elements, clutter, or imperfections from the background while keeping the product completely untouched.' },
                         { icon: '🌊', label: 'Denoise', desc: 'Remove noise & grain', prompt: 'Apply professional AI denoising to remove all grain and noise from the image while preserving all product detail and edge sharpness.' },
                       ],
                     })[activeEditTab].map(op => (
                       <button
                         key={op.label}
                         onClick={() => applyAIEdit(op.prompt)}
                         disabled={isAIEditing}
                         className="w-full text-left flex items-center gap-3 px-3 py-3 mb-1 rounded-xl hover:bg-slate-50 transition-all group disabled:opacity-40 disabled:cursor-not-allowed border border-transparent hover:border-slate-200"
                       >
                         <span className="text-2xl mr-3 shrink-0 mt-0.5">{op.icon}</span>
                         <div className="flex-1 min-w-0">
                           <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-700">{op.label}</p>
                           <p className="text-xs text-slate-400 truncate">{op.desc}</p>
                         </div>
                         <span className="text-slate-300 group-hover:text-indigo-500 text-lg ml-2 mt-0.5">→</span>
                       </button>
                     ))}
                   </div>

                   {/* Custom Prompt Footer */}
                   <div className="border-t border-slate-100 p-4">
                     <div className="flex gap-2">
                       <input
                         type="text"
                         value={editPrompt}
                         onChange={e => setEditPrompt(e.target.value)}
                         onKeyDown={e => e.key === 'Enter' && applyAIEdit()}
                         placeholder="Custom instruction…"
                         className="flex-1 text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-slate-50 placeholder:text-slate-300"
                         disabled={isAIEditing}
                       />
                       <button
                         onClick={() => applyAIEdit()}
                         disabled={isAIEditing || !editPrompt.trim()}
                         className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-40 shrink-0"
                       >
                         {isAIEditing ? '…' : 'Run'}
                       </button>
                     </div>
                     {aiEditError && (
                       <p className="mt-2 text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">{aiEditError}</p>
                     )}
                   </div>
                 </div>

              </div>
          )}

          {/* STEP 3: METADATA EXTRACTION */}
          {step === 3 && (
            <div className="max-w-5xl mx-auto w-full p-8 lg:p-10">
            <div className="animate-slide-in max-w-4xl">
              <header className="mb-8 flex justify-between items-end">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Step 3</p>
                  <h2 className="text-2xl font-bold text-slate-900">AI Analysis</h2>
                  <p className="text-slate-500 mt-1 text-sm">We've extracted your product metadata to power the copy.</p>
                </div>
                {analysis && (
                  <button onClick={generateAllContent} className="bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center transition-all shadow-md">
                    Generate Copy <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                )}
              </header>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2">
                  <div className="bg-white border border-slate-200 p-2 rounded-2xl shadow-sm relative">
                    {isAnalysing && <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-sm rounded-2xl"></div>}
                    <img src={image} className="w-full h-auto object-cover rounded-xl" alt="Analyzed Product" />
                  </div>
                </div>
                <div className="lg:col-span-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm h-full">
                    {isAnalysing ? (
                      <div className="space-y-6">
                        <h3 className="font-semibold text-slate-700 flex items-center">
                          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                          Extracting Arrays
                        </h3>
                        <div className="space-y-4">
                           <div className="h-6 bg-slate-100 animate-pulse rounded w-1/3"></div>
                           <div className="h-10 bg-slate-100 animate-pulse rounded w-full"></div>
                           <div className="h-20 bg-slate-100 animate-pulse rounded w-full"></div>
                        </div>
                      </div>
                    ) : analysis ? (
                      <div className="space-y-6">
                        <div className="border-b border-slate-100 pb-4">
                          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Product Title</p>
                          <h3 className="text-xl font-bold text-slate-900">{analysis.product_name}</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Target Demographics</p>
                            <div className="flex flex-col gap-2">
                              {analysis.target_audience?.map((aud, i) => <div key={i} className="text-sm font-medium text-slate-700 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">{aud}</div>)}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Key Attributes</p>
                            <div className="flex flex-wrap gap-2">
                              {analysis.key_attributes?.map((attr, i) => <span key={i} className="text-xs font-medium text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">{attr}</span>)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            </div>
          )}

          {/* STEP 4: CONTENT GENERATION */}
          {step === 4 && (
            <div className="max-w-7xl mx-auto w-full p-8 lg:p-10">
            <div className="animate-slide-in max-w-7xl">
              <header className="mb-8 flex justify-between items-end">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Step 4</p>
                  <h2 className="text-2xl font-bold text-slate-900">Content Engine</h2>
                  <p className="text-slate-500 mt-1 text-sm">Review and edit your generated platform copy.</p>
                </div>
                <button onClick={() => setStep(5)} className="bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center transition-all shadow-md">
                  Finalize & Distribute <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok'].map(platform => {
                  const len = posts[platform]?.length || 0;
                  const limit = getCharLimit(platform);
                  const isLoad = generatingStates[platform];

                  return (
                    <div key={platform} className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div className="flex items-center text-sm font-bold text-slate-800 capitalize">
                          {platform === 'facebook' && <Facebook className="w-4 h-4 mr-2 text-blue-600" />}
                          {platform === 'twitter' && <Twitter className="w-4 h-4 mr-2 text-slate-800" />}
                          {platform === 'instagram' && <Instagram className="w-4 h-4 mr-2 text-pink-600" />}
                          {platform === 'linkedin' && <Linkedin className="w-4 h-4 mr-2 text-indigo-700" />}
                          {platform === 'tiktok' && <Video className="w-4 h-4 mr-2 text-red-500" />}
                          {platform === 'twitter' ? 'X.com' : platform}
                        </div>
                        <button onClick={() => generateContent(platform, true)} className="text-indigo-600 hover:text-indigo-800 p-1" title="Regenerate">
                           <RefreshCw className={`w-3.5 h-3.5 ${isLoad ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                      
                      <div className="p-4 flex-1 flex flex-col relative h-[300px]">
                        {isLoad ? (
                           <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm p-5 flex flex-col space-y-3">
                             <div className="h-3 bg-slate-200 animate-pulse rounded w-full"></div>
                             <div className="h-3 bg-slate-200 animate-pulse rounded w-11/12"></div>
                             <div className="h-3 bg-slate-200 animate-pulse rounded w-4/5"></div>
                           </div>
                        ) : (
                          <textarea 
                            value={posts[platform]}
                            onChange={(e) => setPosts(prev => ({ ...prev, [platform]: e.target.value }))}
                            className="flex-1 w-full text-xs text-slate-700 bg-transparent border-0 focus:ring-0 p-0 resize-none leading-relaxed"
                            placeholder="Awaiting pipeline..."
                          />
                        )}
                      </div>

                      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 flex justify-between items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${len > limit ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-slate-500 border-slate-200'}`}>
                          {len} / {limit}
                        </span>
                        <button
                          onClick={() => humanizeCaption(platform)}
                          disabled={humanizingStates[platform] || !posts[platform]}
                          className="flex items-center text-[11px] font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-100 px-2.5 py-1 rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          {humanizingStates[platform] ? (
                            <><span className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mr-1.5 inline-block"></span>Humanizing…</>
                          ) : (
                            <>✦ Humanize</>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            </div>
          )}

          {/* STEP 5: DISTRIBUTION */}
          {step === 5 && (
            <div className="max-w-7xl mx-auto w-full p-8 lg:p-10">
            <div className="animate-slide-in max-w-7xl">
               <header className="mb-10 text-center flex flex-col items-center">
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Step 5</p>
                <h2 className="text-2xl font-bold text-slate-900">Campaign Ready</h2>
                <p className="text-slate-500 mt-2 text-sm">Share each post or auto-publish to your connected accounts.</p>
                <div className="flex items-center gap-3 mt-5 flex-wrap justify-center">
                  <button onClick={() => setShowSettings(true)} className="flex items-center text-sm font-medium text-slate-600 bg-white px-4 py-2 rounded-xl hover:bg-slate-50 transition border border-slate-200 shadow-sm">
                    <Settings className="w-4 h-4 mr-2" /> Connected Accounts
                  </button>
                  <button onClick={downloadImage} className="flex items-center text-sm font-medium text-slate-600 bg-white px-4 py-2 rounded-xl hover:bg-slate-50 transition border border-slate-200 shadow-sm">
                    ↓ Download Image
                  </button>
                  {campaignSaved ? (
                    <div className="flex items-center text-sm font-semibold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Saved to Library
                    </div>
                  ) : (
                    <button
                      onClick={saveCampaign}
                      disabled={savingCampaign}
                      className="flex items-center text-sm font-semibold text-white bg-[#0a0a0a] hover:bg-[#1a1a1a] px-4 py-2 rounded-xl transition border border-[#1a1a1a] shadow-md disabled:opacity-60"
                    >
                      {savingCampaign ? (
                        <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin mr-1.5 inline-block"></span>Saving…</>
                      ) : (
                        <><Send className="w-3.5 h-3.5 mr-1.5" /> Save to Library</>
                      )}
                    </button>
                  )}
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok'].map(platform => {
                  const isConnected = connectedApps[platform];
                  return (
                    <div key={platform} className={`bg-white border rounded-2xl shadow-sm flex flex-col transition relative overflow-hidden group ${isConnected ? 'border-indigo-200 hover:shadow-xl hover:-translate-y-1' : 'border-slate-200 hover:shadow-md'}`}>
                      
                      {/* Brand Top Border */}
                      <div className={`h-1.5 w-full absolute top-0 left-0 ${
                        platform === 'facebook' ? 'bg-blue-600' : 
                        platform === 'twitter' ? 'bg-slate-900' : 
                        platform === 'linkedin' ? 'bg-indigo-700' :
                        platform === 'tiktok' ? 'bg-red-500' : 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400'
                      }`}></div>

                      <div className="p-4 flex-1 flex flex-col">
                        {/* Platform Header */}
                        <div className="flex items-center justify-between mb-3 mt-1">
                          <div className="flex items-center space-x-2">
                             {platform === 'facebook' && <Facebook className="w-5 h-5 text-blue-600" />}
                             {platform === 'twitter' && <Twitter className="w-5 h-5 text-slate-800" />}
                             {platform === 'instagram' && <Instagram className="w-5 h-5 text-pink-600" />}
                             {platform === 'linkedin' && <Linkedin className="w-5 h-5 text-indigo-700" />}
                             {platform === 'tiktok' && <Video className="w-5 h-5 text-red-500" />}
                             <h3 className="font-bold text-slate-900 capitalize tracking-tight text-sm">{platform === 'twitter' ? 'X Network' : platform}</h3>
                          </div>
                          {isConnected ? (
                             <div className="flex items-center bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-200">
                               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></div> Live
                             </div>
                          ) : (
                             <div className="flex items-center text-slate-400 text-[10px] font-bold px-2 py-1 rounded-full border border-slate-200 bg-slate-50">
                               Offline
                             </div>
                          )}
                        </div>

                        {/* Product Image Thumbnail */}
                        {image && (
                          <div className="relative rounded-xl overflow-hidden mb-3 border border-slate-100 shadow-sm bg-slate-50" style={{aspectRatio: '4/3'}}>
                            <img src={image} alt="Product" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                            <div className="absolute bottom-2 left-2">
                              <span className="text-[10px] font-bold text-white bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
                                📎 Image attached
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Caption Preview */}
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-4 flex-1 shadow-inner">
                          <div className="flex items-center mb-2">
                             <div className="w-5 h-5 rounded-full bg-slate-300 mr-2 border border-white shadow-sm flex items-center justify-center overflow-hidden">
                                <span className="text-[7px] text-slate-500 font-bold">You</span>
                             </div>
                             <div className="h-1.5 w-12 bg-slate-200 rounded"></div>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium line-clamp-4">{posts[platform]}</p>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2 mt-auto">
                          {/* Copy text */}
                          <button onClick={() => handleCopy(platform, posts[platform])} className="w-full bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 py-2 rounded-lg text-xs font-semibold flex items-center justify-center transition">
                            <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Caption
                          </button>

                          {/* Share with image */}
                          <button 
                            onClick={() => shareWithImage(platform, posts[platform])} 
                            className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center transition ${
                              platform === 'facebook' ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100' :
                              platform === 'twitter' ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200' :
                              platform === 'instagram' ? 'bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-pink-700 border border-pink-100' :
                              platform === 'linkedin' ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100' :
                              'bg-red-50 hover:bg-red-100 text-red-700 border border-red-100'
                            }`}
                          >
                            <Send className="w-3.5 h-3.5 mr-1.5" /> Share with Image
                          </button>

                          {/* Auto-publish if connected */}
                          {isConnected && (
                            <button onClick={() => dispatchToNetwork(platform)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center transition shadow-md shadow-indigo-600/20 active:scale-[0.98]">
                              <Send className="w-3.5 h-3.5 mr-1.5" /> Auto-Publish (API)
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}



