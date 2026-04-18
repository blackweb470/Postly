import React, { useState } from 'react';
import { ArrowRight, Camera, Wand2, Box, Send, CheckCircle2, Facebook, Twitter, Instagram, Linkedin, Video, Quote } from 'lucide-react';

export default function LandingPage({ onLaunch }) {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-50 font-sans selection:bg-indigo-500/30">
      
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-[#0a0a0a] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
              <span className="text-white text-sm font-bold tracking-tighter">P</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Postly</span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition">Platform</a>
            <a href="#integration" className="hover:text-white transition">Integrations</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <a href="#testimonials" className="hover:text-white transition">Customers</a>
          </div>
          <div>
            <button 
              onClick={onLaunch}
              className="bg-white text-black px-4 py-2 rounded-md text-sm font-semibold hover:bg-slate-200 transition"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span className="text-sm font-medium text-indigo-300">Postly Enterprise v2.0 is generally available</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
            Publish products to every <br/>
            <span className="text-white">
              platform from a single photo.
            </span>
          </h1>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Upload an image. We handle the formatting, tagging, and cross-posting to your connected accounts. Stop repeating the same manual work across 5 different apps.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onLaunch}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-md text-lg font-semibold flex items-center justify-center transition"
            >
              Start Building Free
            </button>
            <button className="w-full sm:w-auto bg-transparent hover:bg-white/5 text-slate-300 border border-slate-700 px-8 py-3.5 rounded-md text-lg font-medium flex items-center justify-center transition">
              Book a Demo
            </button>
          </div>
        </div>
      </section>

      {/* Hero Graphic Simulation */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#111] border border-slate-800 rounded-lg p-1.5 shadow-2xl relative overflow-hidden group">
            <div className="bg-[#0a0a0a] rounded-md border border-slate-800/50 h-[500px] flex overflow-hidden">
               <div className="w-64 border-r border-slate-800/50 p-6 hidden md:block">
                  <div className="w-8 h-8 bg-indigo-600 rounded mb-8"></div>
                  <div className="space-y-4">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="h-8 bg-slate-800/30 rounded-md w-full mb-2"></div>
                    ))}
                  </div>
               </div>
               <div className="flex-1 p-10">
                  <div className="h-6 bg-slate-800 w-1/4 rounded mb-8"></div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="h-64 bg-slate-800/30 border border-slate-800/50 rounded-lg"></div>
                    <div className="h-64 bg-slate-800/30 border border-slate-800/50 rounded-lg col-span-2"></div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
             <h2 className="text-3xl font-bold mb-4 tracking-tight">A complete publishing workflow.</h2>
             <p className="text-lg text-slate-400">Manage image capture, edits, and distribution without leaving the dashboard.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#111] border border-white/10 rounded-lg p-8">
              <div className="w-10 h-10 bg-slate-800/50 border border-slate-700 text-slate-300 flex items-center justify-center rounded mb-6">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Direct Camera Access</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Connect directly to your device's camera for quick product shots, avoiding the need to transfer files between your phone and computer.
              </p>
            </div>

            <div className="bg-[#111] border border-white/10 rounded-lg p-8">
              <div className="w-10 h-10 bg-slate-800/50 border border-slate-700 text-slate-300 flex items-center justify-center rounded mb-6">
                <Wand2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Image Editor</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Built-in image filters let you adjust contrast and exposure quickly before publishing, ensuring your product photos look consistent.
              </p>
            </div>

            <div className="bg-[#111] border border-white/10 rounded-lg p-8">
              <div className="w-10 h-10 bg-slate-800/50 border border-slate-700 text-slate-300 flex items-center justify-center rounded mb-6">
                <Box className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Automated Tagging</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Our system scans the product image to suggest relevant hashtags and captions adapted to the platform you are publishing on.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integration" className="py-24 border-t border-white/5 relative bg-[#111]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12 tracking-tight">Post to your existing channels.</h2>
          
          <div className="flex flex-wrap justify-center gap-4 items-center">
            {[
              { icon: Facebook, color: "text-slate-400", label: "Facebook" },
              { icon: Twitter, color: "text-slate-400", label: "X Network" },
              { icon: Instagram, color: "text-slate-400", label: "Instagram" },
              { icon: Linkedin, color: "text-slate-400", label: "LinkedIn" },
              { icon: Video, color: "text-slate-400", label: "TikTok" }
            ].map((Platform, index) => (
              <div key={index} className="flex items-center space-x-3 bg-[#1a1a1a] border border-white/10 px-5 py-3 rounded-md">
                 <Platform.icon className={`w-5 h-5 ${Platform.color}`} />
                 <span className="font-medium text-sm text-slate-200">{Platform.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 text-sm text-slate-500">
             Includes a standardized OAuth settings panel to manage API connections.
          </div>
        </div>
      </section>

      {/* SaaS PRICING SECTION */}
      <section id="pricing" className="py-24 border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
             <h2 className="text-3xl font-bold mb-4 tracking-tight">Pricing options.</h2>
             <p className="text-lg text-slate-400 mb-8">Start for free, then upgrade as your agency grows.</p>
             
             {/* Billing Toggle */}
             <div className="inline-flex items-center bg-[#111] p-1 border border-white/10 rounded-md">
                <button onClick={() => setIsAnnual(false)} className={`px-4 py-1.5 rounded text-sm font-medium transition ${!isAnnual ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-white border border-transparent'}`}>Monthly</button>
                <button onClick={() => setIsAnnual(true)} className={`px-4 py-1.5 rounded text-sm font-medium transition ${isAnnual ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-white border border-transparent'}`}>
                  Annually
                </button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
             {/* Tier 1 */}
             <div className="bg-[#111] border border-white/10 rounded-lg p-8 flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-2">Hobby</h3>
                <p className="text-sm text-slate-400 mb-6">Perfect for side projects and indie developers.</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-white">$0</span><span className="text-slate-500">/mo</span>
                </div>
                <button onClick={onLaunch} className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded text-sm font-medium mb-8 transition border border-slate-700">Get Started</button>
                <div className="space-y-4 flex-1">
                  {["1 Social Network", "Standard Polish", "10 Generations/day"].map((feature, i) => (
                    <div key={i} className="flex items-center text-sm text-slate-300"><CheckCircle2 className="w-4 h-4 text-slate-500 mr-3" /> {feature}</div>
                  ))}
                </div>
             </div>

             {/* Tier 2 */}
             <div className="bg-[#1a1a2e] border border-indigo-500/30 rounded-lg p-8 flex flex-col relative relative transform scale-[1.02]">
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-indigo-600 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border border-indigo-500">Most Popular</div>
                <h3 className="text-lg font-semibold text-white mb-2">Pro</h3>
                <p className="text-sm text-slate-400 mb-6">For professional creators and small agencies.</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-white">${isAnnual ? '29' : '39'}</span><span className="text-slate-500">/mo</span>
                </div>
                <button onClick={onLaunch} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded text-sm font-medium mb-8 transition">Upgrade to Pro</button>
                <div className="space-y-4 flex-1">
                  {["All 5 Social Networks", "Automated Tagging", "Unlimited Generations", "Direct API Publishing", "Analytics Dashboard"].map((feature, i) => (
                    <div key={i} className="flex items-center text-sm text-slate-200"><CheckCircle2 className="w-4 h-4 text-indigo-400 mr-3" /> {feature}</div>
                  ))}
                </div>
             </div>

             {/* Tier 3 */}
             <div className="bg-[#111] border border-white/10 rounded-lg p-8 flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-2">Enterprise</h3>
                <p className="text-sm text-slate-400 mb-6">For large scale marketing departments.</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-white">${isAnnual ? '99' : '129'}</span><span className="text-slate-500">/mo</span>
                </div>
                <button onClick={onLaunch} className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded text-sm font-medium mb-8 transition border border-slate-700">Contact Sales</button>
                <div className="space-y-4 flex-1">
                  {["Everything in Pro", "Custom Prompts", "White-label reports", "Dedicated Account Manager", "SLA Uptime 99.9%"].map((feature, i) => (
                    <div key={i} className="flex items-center text-sm text-slate-300"><CheckCircle2 className="w-4 h-4 text-slate-500 mr-3" /> {feature}</div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-24 relative z-10 bg-[#111]">
        <div className="max-w-6xl mx-auto px-6">
           <h2 className="text-2xl md:text-3xl font-bold text-center mb-16 tracking-tight">Customer feedback</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { quote: "Postly cuts down the time we spend logging into different social accounts. The auto-formatting works well enough that we don't need to manually rewrite captions.", author: "Sarah Jenkins", role: "Marketing Coordinator" },
                { quote: "The built-in image filters are practical. We don't need to pass photos through Lightroom anymore before loading them into our scheduler.", author: "David Chen", role: "Independent Retailer" },
                { quote: "Managing our LinkedIn and Twitter updates from the same dashboard is helpful. It handles the core distribution tasks we need it to do.", author: "Maria Gonzalez", role: "Social Media Manager" }
              ].map((testimonial, i) => (
                 <div key={i} className="bg-[#0a0a0a] border border-white/10 p-6 rounded-lg relative">
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">"{testimonial.quote}"</p>
                    <div className="flex items-center">
                       <div className="w-8 h-8 bg-slate-800 rounded-full mr-3"></div>
                       <div>
                          <p className="text-sm font-medium text-white">{testimonial.author}</p>
                          <p className="text-xs text-slate-500">{testimonial.role}</p>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="border-t border-white/5 py-24 relative z-10">
         <div className="max-w-4xl mx-auto text-center px-6">
            <h2 className="text-3xl font-bold tracking-tight mb-8">Ready to get started?</h2>
            <button 
              onClick={onLaunch}
              className="bg-white hover:bg-slate-200 text-black px-8 py-3 rounded-md text-sm font-bold transition"
            >
              Sign up
            </button>
            
            <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-slate-600 text-sm">
               <div className="flex items-center space-x-2">
                 <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center">
                   <span className="text-white text-[10px] font-bold">P</span>
                 </div>
                 <p>© {new Date().getFullYear()} Postly Enterprise Inc.</p>
               </div>
               <div className="flex space-x-6 mt-4 md:mt-0">
                  <span className="hover:text-slate-300 cursor-pointer">Privacy</span>
                  <span className="hover:text-slate-300 cursor-pointer">Terms</span>
                  <span className="hover:text-slate-300 cursor-pointer">Security</span>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}
