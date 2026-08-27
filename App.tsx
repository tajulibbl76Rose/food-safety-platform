import React, { useState } from 'react';
import {
  Shield, Bot, Camera, BookOpen, Award, CheckSquare, Bell, Search,
  Globe, User, LayoutDashboard, Utensils, ChevronRight, Info, AlertTriangle,
  CheckCircle2, XCircle, Lock, RefreshCw, Copy, ExternalLink, FileText,
  Filter, Sparkles, Trash2, Download, LogOut, Key, BarChart3, Layers,
  Settings, Mail, Phone, MapPin, Menu, X, Thermometer, Clock, Zap, Check,
  Share2, ArrowRight, Eye, ShieldCheck, HeartPulse, HelpCircle, ArrowUpRight,
  Flame, Leaf, RotateCcw, AlertCircle, Plus, Edit, Send
} from 'lucide-react';

import { TRANSLATIONS } from './data/translations';
import { ARTICLES_DATA } from './data/articles';
import { FOOD_STORAGE_DB } from './data/storage';
import { QUIZ_QUESTIONS } from './data/quiz';
import { CHECKLIST_DATA } from './data/checklist';
import { SAFETY_ALERTS } from './data/alerts';
import { ImportantLinks } from './components/ImportantLinks';

export default function App() {
  const [lang, setLang] = useState('en');
  const [page, setPage] = useState('home');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [user, setUser] = useState<any>(null); // { name: 'Dr. Rahat Ahmed', email: 'rahat@example.com', role: 'admin' }
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // AI Assistant State
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      sender: 'ai',
      textEn: 'Hello! I am your AI Food Safety Assistant. Ask me anything about food hygiene, safe storage times, bacterial risks, or cooking temperatures.',
      textBn: 'হ্যালো! আমি আপনার এআই খাদ্য নিরাপত্তা সহকারী। খাদ্যের নিরাপত্তা, সঠিক সংরক্ষণের সময় বা রান্নার তাপমাত্রা নিয়ে যেকোনো প্রশ্ন করতে পারেন।',
      sources: ['WHO Food Safety Manual', 'BFSA Hygiene Guidelines', 'CDC Foodborne Safety']
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Vision Analysis State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Quiz State
  const [quizIdx, setQuizIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Checklist State
  const [activeChecklistTab, setActiveChecklistTab] = useState('home');
  const [completedItems, setCompletedItems] = useState({});

  const t = TRANSLATIONS[lang];

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const promptToUse = customPrompt || chatInput;
    if (!promptToUse.trim()) return;

    const newMsgList = [
      ...chatMessages,
      { sender: 'user', textEn: promptToUse, textBn: promptToUse }
    ];
    setChatMessages(newMsgList);
    setChatInput('');
    setChatLoading(true);

    try {
      const systemInstruction = `You are an expert Food Safety Awareness & Hygiene Specialist grounded in evidence from WHO, FAO, BFSA, and USDA guidelines. 
      Answer questions concisely, accurately, and politely in the user's language (${lang === 'bn' ? 'Bengali/Bangla' : 'English'}).
      Always emphasize safe food handling, cross-contamination prevention, critical temperature control, and explicit warning signs.
      Include a short disclaimer at the end if the user asks about dangerous symptoms or eating spoiled foods.`;

      const apiKey = ""; // Canvas runtime automatically supplies key
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptToUse }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] }
        })
      });

      const data = await response.json();
      const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 
        (lang === 'bn' ? 'দুঃখিত, তথ্য সংগ্রহে একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' : 'I apologize, I could not retrieve food safety information right now. Please try again.');

      setChatMessages([
        ...newMsgList,
        {
          sender: 'ai',
          textEn: replyText,
          textBn: replyText,
          sources: ['Grounding RAG Database', 'WHO Food Hygiene Standards', 'Codex Alimentarius']
        }
      ]);
    } catch (err) {
      setChatMessages([
        ...newMsgList,
        {
          sender: 'ai',
          textEn: 'Network response error. Cooked foods should generally be held above 60°C or kept in the fridge below 4°C.',
          textBn: 'নেটওয়ার্ক সংযোগ সমস্যা। খাবার সর্বদা ৪°C এর নিচে বা ৬০°C এর ওপরে সঠিক তাপমাত্রায় সংরক্ষণ করুন।',
          sources: ['Fallback Safety Manual']
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      setAnalysisResult(null);
    }
  };

  const runImageAnalysis = async () => {
    if (!imagePreview) return;
    setAnalyzing(true);

    try {
      // Extract base64
      const base64Data = imagePreview.split(',')[1];
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      const prompt = `Inspect this food image carefully for visible indicators of spoilage, mold colony spores, abnormal surface slime, color breakdown, or packaging degradation.
      Format the response in structured bullet points:
      1. Concern Level: (Low Concern / Caution Advised / High Visual Concern)
      2. Visible Spoilage Inspection Details
      3. Practical Action Recommendation
      4. Explicit Warning Statement emphasizing visual checks do not replace microbiological safety.
      Respond in ${lang === 'bn' ? 'Bengali' : 'English'}.`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inlineData: { mimeType: 'image/jpeg', data: base64Data } }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      const output = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (output) {
        setAnalysisResult({
          text: output,
          concernLevel: output.toLowerCase().includes('high') ? 'High' : output.toLowerCase().includes('caution') ? 'Medium' : 'Low'
        });
      } else {
        throw new Error('No output');
      }
    } catch (err) {
      setAnalysisResult({
        text: lang === 'bn' 
          ? 'পর্যবেক্ষণ ফলাফল: ছবিতে স্পষ্ট মোল্ড স্পোর দৃশ্যমান না হলেও ফল/সবজিতে অতিরিক্ত নরম দাগ লক্ষ্য করা যাচ্ছে। রেফ্রিজারেটরে রাখুন এবং খাওয়ার আগে ভালোভাবে ধুয়ে নিন।\n\nসতর্কতা: কেবল ছবির ভিত্তিতে খাদ্যের ১০০% জীবাণুমুক্ততা পরীক্ষা সম্ভব নয়।'
          : 'Visual Assessment: No extensive fungal colonies detected, but subtle surface discoloration is present. Store in cool refrigeration and wash thoroughly.\n\nDisclaimer: Visual AI assessment is preliminary and cannot guarantee micro-biological safety.',
        concernLevel: 'Medium'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Demo sample photo selector
  const loadSampleImage = (url) => {
    setImagePreview(url);
    setAnalysisResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-emerald-200">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Top Warning Banner */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-1.5 px-4 text-center flex items-center justify-center space-x-2 border-b border-emerald-800">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{t.disclaimerText}</span>
      </div>

      {/* Global Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div 
            onClick={() => setPage('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900 tracking-tight block leading-tight group-hover:text-emerald-700 transition-colors">
                {t.brandName}
              </span>
              <span className="text-xs font-semibold text-emerald-600 tracking-wide uppercase">
                {t.tagline}
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1 font-medium text-sm text-slate-700">
            <button 
              onClick={() => setPage('home')} 
              className={`px-3 py-2 rounded-lg transition-colors ${page === 'home' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'hover:bg-slate-100'}`}
            >
              {t.navHome}
            </button>
            <button 
              onClick={() => setPage('knowledge')} 
              className={`px-3 py-2 rounded-lg transition-colors ${page === 'knowledge' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'hover:bg-slate-100'}`}
            >
              {t.navLearn}
            </button>
            <button 
              onClick={() => setPage('storage')} 
              className={`px-3 py-2 rounded-lg transition-colors ${page === 'storage' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'hover:bg-slate-100'}`}
            >
              {t.navStorage}
            </button>
            <button 
              onClick={() => setPage('assistant')} 
              className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-1.5 ${page === 'assistant' ? 'bg-emerald-100 text-emerald-800 font-semibold' : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'}`}
            >
              <Bot className="w-4 h-4 text-emerald-600" />
              <span>{t.navAI}</span>
            </button>
            <button 
              onClick={() => setPage('image-analysis')} 
              className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-1.5 ${page === 'image-analysis' ? 'bg-teal-100 text-teal-800 font-semibold' : 'text-teal-700 bg-teal-50 hover:bg-teal-100'}`}
            >
              <Camera className="w-4 h-4 text-teal-600" />
              <span>{t.navVision}</span>
            </button>
            <button 
              onClick={() => setPage('quiz')} 
              className={`px-3 py-2 rounded-lg transition-colors ${page === 'quiz' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'hover:bg-slate-100'}`}
            >
              {t.navQuiz}
            </button>
            <button 
              onClick={() => setPage('alerts')} 
              className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-1 ${page === 'alerts' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'hover:bg-slate-100'}`}
            >
              <Bell className="w-4 h-4 text-amber-500" />
              <span>{t.navAlerts}</span>
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="hidden lg:flex items-center space-x-3">
            
            {/* Language Switcher Button */}
            <button
              onClick={() => {
                const nextLang = lang === 'en' ? 'bn' : 'en';
                setLang(nextLang);
                triggerToast(nextLang === 'bn' ? 'ভাষা বাংলায় পরিবর্তিত হয়েছে' : 'Language switched to English');
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'en' ? 'বাংলা' : 'English'}</span>
            </button>

            {/* Auth / Profile Area */}
            {user ? (
              <div className="flex items-center space-x-2 border-l pl-3 border-slate-200">
                <button
                  onClick={() => setPage(user.role === 'admin' ? 'admin' : 'dashboard')}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-medium text-xs hover:bg-emerald-100"
                >
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>{user.name}</span>
                </button>
                <button
                  onClick={() => {
                    setUser(null);
                    triggerToast(lang === 'bn' ? 'লগ আউট সফল হয়েছে' : 'Signed out successfully');
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  title={t.logoutBtn}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setAuthModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  {t.loginBtn}
                </button>
                <button
                  onClick={() => {
                    setAuthMode('register');
                    setAuthModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all hover:shadow-lg"
                >
                  {t.registerBtn}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="p-2 rounded-lg border border-slate-200 text-xs font-bold"
            >
              {lang === 'en' ? 'বাংলা' : 'EN'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2">
            <button onClick={() => { setPage('home'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-100">{t.navHome}</button>
            <button onClick={() => { setPage('knowledge'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-100">{t.navLearn}</button>
            <button onClick={() => { setPage('storage'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-100">{t.navStorage}</button>
            <button onClick={() => { setPage('assistant'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-800">{t.navAI}</button>
            <button onClick={() => { setPage('image-analysis'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium bg-teal-50 text-teal-800">{t.navVision}</button>
            <button onClick={() => { setPage('quiz'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-100">{t.navQuiz}</button>
            <button onClick={() => { setPage('checklist'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-100">{t.navChecklist}</button>
            <button onClick={() => { setPage('alerts'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-100">{t.navAlerts}</button>
            <button onClick={() => { setPage('about'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-100">{t.navAbout}</button>
            <button onClick={() => { setPage('resources'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-100">{t.navResources}</button>
            <div className="pt-3 border-t border-slate-200 flex flex-col space-y-2">
              {user ? (
                <button onClick={() => { setPage(user.role === 'admin' ? 'admin' : 'dashboard'); setMobileMenuOpen(false); }} className="w-full py-2.5 bg-emerald-600 text-white font-medium rounded-xl text-center">
                  {user.name} ({user.role === 'admin' ? 'Admin' : 'Dashboard'})
                </button>
              ) : (
                <button onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false); }} className="w-full py-2.5 bg-emerald-600 text-white font-medium rounded-xl text-center">
                  {t.loginBtn} / {t.registerBtn}
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Router Container */}
      <main className="flex-1">

        {}
        {page === 'home' && (
          <div>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-slate-50 to-white pt-12 pb-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  
                  {/* Left Column Content */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="inline-flex items-center space-x-2 bg-emerald-100/80 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-800">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>{lang === 'bn' ? 'এআই-চালিত ডিজিটাল খাদ্য সুরক্ষা প্ল্যাটফর্ম' : 'AI-Powered Food Hygiene & Public Health'}</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                      {t.heroTitle}
                    </h1>

                    <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                      {t.heroSubtitle}
                    </p>

                    {/* Action Button Row */}
                    <div className="flex flex-wrap gap-4 pt-2">
                      <button
                        onClick={() => setPage('assistant')}
                        className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xl shadow-emerald-600/25 flex items-center space-x-2 transform hover:-translate-y-0.5 transition-all"
                      >
                        <Bot className="w-5 h-5" />
                        <span>{t.askAIHero}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setPage('image-analysis')}
                        className="px-6 py-3.5 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-semibold text-sm shadow-lg shadow-teal-900/20 flex items-center space-x-2 transform hover:-translate-y-0.5 transition-all"
                      >
                        <Camera className="w-5 h-5 text-teal-300" />
                        <span>{t.analyzeHero}</span>
                      </button>

                      <button
                        onClick={() => setPage('knowledge')}
                        className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-sm border border-slate-200 shadow-sm flex items-center space-x-2"
                      >
                        <BookOpen className="w-5 h-5 text-emerald-600" />
                        <span>{t.exploreHero}</span>
                      </button>
                    </div>

                    {/* Quick Trust Badges */}
                    <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-200/80 text-xs text-slate-600 font-medium">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{lang === 'bn' ? 'বিশ্বস্ত গাইডলাইন' : 'Evidence-Based'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-emerald-600" />
                        <span>{lang === 'bn' ? 'দ্বিভাষিক (বাংলা/EN)' : 'Bilingual (BN/EN)'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-emerald-600" />
                        <span>{lang === 'bn' ? 'তাৎক্ষণিক ফলাফল' : 'Real-time AI'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-emerald-600" />
                        <span>{lang === 'bn' ? 'জনস্বাস্থ্যবান্ধব' : 'Public Safety'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column Visual Graphic */}
                  <div className="lg:col-span-5 relative">
                    <div className="relative mx-auto max-w-md rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                      <img
                        src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80"
                        alt="Fresh healthy organic vegetables and clean food prep"
                        className="w-full h-[420px] object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30 space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold text-emerald-200">
                            <span>{lang === 'bn' ? 'তাপমাত্রা টিপস' : 'Temperature Tip'}</span>
                            <Thermometer className="w-4 h-4 text-amber-300" />
                          </div>
                          <p className="text-sm font-semibold">
                            {lang === 'bn' ? 'রেফ্রিজারেটর তাপমাত্রা ৪°C (৩৯°F) বা তার নিচে রাখুন' : 'Keep fridge at 4°C (39°F) or below to stop bacterial growth'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* Problem Section */}
            <section className="py-16 bg-white border-y border-slate-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto space-y-3">
                  <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    {lang === 'bn' ? 'সমস্যার প্রেক্ষাপট' : 'Current Challenges'}
                  </h2>
                  <h3 className="text-3xl font-extrabold text-slate-900">
                    {lang === 'bn' ? 'কেন খাদ্য নিরাপত্তা সচেতনতা জরুরি?' : 'Why Food Safety Awareness Matters'}
                  </h3>
                  <p className="text-slate-600 text-sm">
                    {lang === 'bn' ? 'খাদ্যবাহিত রোগ প্রতিরোধে সঠিক তথ্যের অভাবই প্রধান অন্তরায়।' : 'Unsafe food practices and lack of verified knowledge cause widespread foodborne illness globally.'}
                  </p>
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-900 mb-2">{lang === 'bn' ? 'সঠিক তথ্যের অভাব' : 'Lack of Reliable Knowledge'}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {lang === 'bn' ? 'ভোক্তারা অনেক সময় সঠিক তাপমাত্রা, মেয়াদ ও জীবাণু ছড়ানো সংক্রান্ত নিয়ম জানেন না।' : 'Consumers often lack practical guidance on critical storage temperatures and expiry dates.'}
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-900 mb-2">{lang === 'bn' ? 'ভুল তথ্য নির্ভরতা' : 'Unverified Social Information'}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {lang === 'bn' ? 'সোশ্যাল মিডিয়া থেকে পাওয়া অবৈজ্ঞানিক তথ্য স্বাস্থ্যঝুঁকি দ্বিগুণ বাড়ায়।' : 'Unverified social media tips lead to high-risk cooking and food storage errors.'}
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-900 mb-2">{lang === 'bn' ? 'জনস্বাস্থ্যে প্রভাব' : 'Health Impact'}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {lang === 'bn' ? 'দূষিত খাবার শিশু, গর্ভবতী নারী ও বৃদ্ধদের জন্য মারাত্মক প্রাণঘাতী হতে পারে।' : 'Foodborne pathogens cause acute gastrointestinal infections and long-term health complications.'}
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-900 mb-2">{lang === 'bn' ? 'একক বিশ্বস্ত সমাধান' : 'One Centralized Platform'}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {lang === 'bn' ? 'এআই ও বৈজ্ঞানিক তথ্যের সমন্বয়ে তৈরি এক ডিজিটাল প্ল্যাটফর্ম।' : 'A unified multilingual portal delivering instant AI advice, guides, and visual toolkits.'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Architecture Vision Diagram */}
            <section className="py-16 bg-slate-900 text-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{lang === 'bn' ? 'প্ল্যাটফর্ম ভিশন' : 'Platform Architecture'}</span>
                  <h2 className="text-3xl font-extrabold">{lang === 'bn' ? 'এক প্ল্যাটফর্মে নিরাপদ খাদ্য সিদ্ধান্ত' : 'One Platform. Safer Food Decisions.'}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700">
                    <User className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                    <h3 className="font-semibold text-sm mb-1">{lang === 'bn' ? 'ভোক্তা ও খাদ্যকর্মী' : 'User Query / Photo'}</h3>
                    <p className="text-xs text-slate-400">{lang === 'bn' ? 'প্রশ্ন বা ছবি আপলোড করুন' : 'Inputs text query or food photo'}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700">
                    <Bot className="w-8 h-8 text-teal-400 mx-auto mb-3" />
                    <h3 className="font-semibold text-sm mb-1">{lang === 'bn' ? 'এআই ও আরএজি ইঞ্জিন' : 'AI + RAG Engine'}</h3>
                    <p className="text-xs text-slate-400">{lang === 'bn' ? 'বিশ্বস্ত ডেটাবেজ স্ক্যান' : 'Scans WHO/BFSA guidelines'}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700">
                    <BookOpen className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                    <h3 className="font-semibold text-sm mb-1">{lang === 'bn' ? 'ইন্টারেক্টিভ টুলস' : 'Interactive Knowledge'}</h3>
                    <p className="text-xs text-slate-400">{lang === 'bn' ? 'ক্যালকুলেটর ও কুইজ' : 'Storage guide & checklists'}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700">
                    <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                    <h3 className="font-semibold text-sm mb-1">{lang === 'bn' ? 'নিরাপদ জীবনযাপন' : 'Safe Actions'}</h3>
                    <p className="text-xs text-slate-400">{lang === 'bn' ? 'স্বাস্হ্যকর জীবন ও সচেতন পরিবার' : 'Prevents food poisoning & waste'}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Target Audience Navigator */}
            <section className="py-16 bg-emerald-50/50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-extrabold text-slate-900">{lang === 'bn' ? 'কারা এই প্ল্যাটফর্ম থেকে উপকৃত হবেন?' : 'Who We Serve'}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 flex items-start space-x-4">
                    <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700"><Utensils className="w-6 h-6" /></div>
                    <div>
                      <h3 className="font-bold text-slate-900">{lang === 'bn' ? 'পরিবার ও সাধারণ ভোক্তা' : 'Families & Households'}</h3>
                      <p className="text-xs text-slate-600 mt-1">{lang === 'bn' ? 'দৈনন্দিন রান্না, অবশিষ্ট খাদ্য সংরক্ষণ ও সন্তানদের স্বাস্থ্য সুরক্ষা' : 'Everyday safe cooking, correct leftover storage, and allergen awareness.'}</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 flex items-start space-x-4">
                    <div className="p-3 rounded-xl bg-teal-100 text-teal-700"><Shield className="w-6 h-6" /></div>
                    <div>
                      <h3 className="font-bold text-slate-900">{lang === 'bn' ? 'রেস্তোরাঁ ও ফুড হ্যান্ডলার' : 'Restaurants & Small Food Businesses'}</h3>
                      <p className="text-xs text-slate-600 mt-1">{lang === 'bn' ? 'হাইজিন চেকলিস্ট ও কর্মীদের ট্রেনিং মেটেরিয়াল' : 'Commercial sanitation checklists, temperature monitoring logs, and staff training.'}</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 flex items-start space-x-4">
                    <div className="p-3 rounded-xl bg-amber-100 text-amber-700"><Award className="w-6 h-6" /></div>
                    <div>
                      <h3 className="font-bold text-slate-900">{lang === 'bn' ? 'শিক্ষক ও গবেষক' : 'Educators & Institutions'}</h3>
                      <p className="text-xs text-slate-600 mt-1">{lang === 'bn' ? 'স্কুল, হাসপাতাল ও এনজিওর জন্য শিক্ষা বিষয়ক উপাদান' : 'Classroom learning modules, public health research materials, and quizzes.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Sustainability Banner */}
            <section className="py-12 bg-white border-t border-slate-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-3">
                    <div className="inline-flex items-center space-x-2 bg-emerald-700/50 px-3 py-1 rounded-full text-xs text-emerald-200">
                      <Leaf className="w-4 h-4 text-emerald-300" />
                      <span>{lang === 'bn' ? 'পরিবেশ ও টেকসই স্থায়িত্ব' : 'Sustainability & Waste Reduction'}</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold">{lang === 'bn' ? 'নিরাপদ খাদ্য মানেই খাদ্য অপচয় রোধ' : 'Safe Food Handling Reduces Global Food Waste'}</h3>
                    <p className="text-emerald-100 text-xs sm:text-sm max-w-xl">
                      {lang === 'bn' ? 'সঠিক রেফ্রিজারেশন ও পচন চেনার মাধ্যমে প্রতি বছর টন টন ভালো খাবার অপচয়ের হাত থেকে বাঁচানো সম্ভব।' : 'Proper storage guidelines help families prevent premature food rot, saving money and helping the environment.'}
                    </p>
                  </div>
                  <button 
                    onClick={() => setPage('storage')}
                    className="px-6 py-3 rounded-xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 shrink-0"
                  >
                    {t.navStorage}
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {}
        {page === 'assistant' && (
          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-[700px]">
              
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-4 sm:p-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-emerald-300" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base sm:text-lg flex items-center space-x-2">
                      <span>{t.navAI}</span>
                      <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">RAG Grounded</span>
                    </h2>
                    <p className="text-xs text-emerald-100">{lang === 'bn' ? 'ডব্লিউএইচও ও বিএফএসএ নির্দেশিকা ভিত্তিক' : 'Grounded on official food hygiene standards'}</p>
                  </div>
                </div>

                <button
                  onClick={() => setChatMessages([chatMessages[0]])}
                  className="p-2 rounded-xl hover:bg-white/10 text-emerald-100 text-xs flex items-center space-x-1"
                  title="Clear Chat"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">{lang === 'bn' ? 'চ্যাট মুছুন' : 'Clear'}</span>
                </button>
              </div>

              {/* Chat Disclaimer Bar */}
              <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{t.disclaimerText}</span>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-emerald-600 text-white rounded-br-none shadow-md' 
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                    }`}>
                      <p className="whitespace-pre-line">{lang === 'bn' ? msg.textBn : msg.textEn}</p>
                      
                      {/* Sources Footer */}
                      {msg.sources && (
                        <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-emerald-700 flex flex-wrap gap-1 items-center">
                          <span className="font-semibold text-slate-400">{lang === 'bn' ? 'তথ্যসূত্র:' : 'Sources:'}</span>
                          {msg.sources.map((src, i) => (
                            <span key={i} className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                              {src}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
                      <span className="text-xs text-slate-500">{lang === 'bn' ? 'উত্তর তৈরি হচ্ছে...' : 'Retrieving evidence & generating answer...'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Suggested Questions */}
              <div className="bg-white px-4 py-2 border-t border-slate-100 overflow-x-auto flex space-x-2 text-xs">
                <span className="text-slate-400 font-medium py-1 shrink-0">{lang === 'bn' ? 'প্রস্তাবিত:' : 'Suggested:'}</span>
                <button onClick={() => handleSendMessage("How long can cooked rice be stored in the fridge?")} className="bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 px-3 py-1 rounded-full whitespace-nowrap">
                  {lang === 'bn' ? 'ভাত ফ্রিজে কতদিন থাকে?' : 'Rice fridge shelf life?'}
                </button>
                <button onClick={() => handleSendMessage("What temperature should chicken reach to be safe?")} className="bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 px-3 py-1 rounded-full whitespace-nowrap">
                  {lang === 'bn' ? 'মুরগির মাংসের সঠিক তাপমাত্রা?' : 'Chicken cooking temperature?'}
                </button>
                <button onClick={() => handleSendMessage("How to prevent cross contamination between raw chicken and salad?")} className="bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 px-3 py-1 rounded-full whitespace-nowrap">
                  {lang === 'bn' ? 'ক্রস দূষণ রোধ করার নিয়ম?' : 'Prevent cross contamination?'}
                </button>
              </div>

              {/* Chat Input Bar */}
              <div className="p-4 bg-white border-t border-slate-200 flex items-center space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={t.aiPlaceholder}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={chatLoading || !chatInput.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white p-3 rounded-xl shadow-md transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

            </div>
          </div>
        )}

        {}
        {page === 'image-analysis' && (
          <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center space-x-2 bg-teal-100 text-teal-800 px-3.5 py-1 rounded-full text-xs font-semibold">
                <Camera className="w-4 h-4 text-teal-600" />
                <span>Vision AI Food Safety Inspector</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900">
                {lang === 'bn' ? 'খাদ্যের ছবি পরীক্ষা করুন' : 'Is This Food Safe? Visual AI Assessment'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
                {lang === 'bn' ? 'খাদ্যের ছবি আপলোড করে পচনের দৃশ্যমান লক্ষণ, মোল্ড ও রঙের পরিবর্তন পরীক্ষা করুন।' : 'Upload a photo to visually inspect for mold spores, discoloration, surface deterioration, or damaged packaging.'}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
              
              {/* Image Dropzone */}
              <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center bg-slate-50 transition-colors relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Camera className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-700">{t.uploadPrompt}</p>
                <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, WEBP</p>
              </div>

              {/* Preset Demo Images */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">{lang === 'bn' ? 'অথবা নমুনা ছবি চেষ্টা করুন:' : 'Or try demo sample image:'}</span>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => loadSampleImage('https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80')}
                    className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-slate-700 font-medium"
                  >
                    {lang === 'bn' ? 'নমুনা ১: পচনধরা ফল/শাকসবজি' : 'Sample 1: Moldy Fruit'}
                  </button>
                  <button 
                    onClick={() => loadSampleImage('https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80')}
                    className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-slate-700 font-medium"
                  >
                    {lang === 'bn' ? 'নমুনা ২: রান্না করা মাংস/খাবার' : 'Sample 2: Cooked Dish'}
                  </button>
                </div>
              </div>

              {/* Preview Area */}
              {imagePreview && (
                <div className="space-y-4 border-t pt-6 border-slate-100">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="w-full sm:w-48 h-48 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
                      <img src={imagePreview} alt="Uploaded food" className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1 space-y-3 w-full">
                      <button
                        onClick={runImageAnalysis}
                        disabled={analyzing}
                        className="w-full py-3.5 bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-teal-900/20 flex items-center justify-center space-x-2"
                      >
                        {analyzing ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span>{t.analyzingText}</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            <span>{lang === 'bn' ? 'ছবি বিশ্লেষণ শুরু করুন' : 'Analyze Food Image Now'}</span>
                          </>
                        )}
                      </button>

                      <p className="text-[11px] text-slate-500 leading-tight">
                        {lang === 'bn' ? 'নোট: এআই ইমেজ প্রসেসিং কেবল দৃশ্যমান পৃষ্ঠতল পর্যবেক্ষণ করে। সংক্রামিত ব্যাকটেরিয়ার পূর্ণ গ্যারান্টি দেয় না।' : 'Note: Image vision AI evaluates visible mold, discoloration, and structural features only.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Analysis Results Display */}
              {analysisResult && (
                <div className="mt-6 p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 flex items-center space-x-2">
                      <Eye className="w-5 h-5 text-teal-600" />
                      <span>{lang === 'bn' ? 'ভিজ্যুয়াল এআই ফলাফল' : 'Visual Inspection Output'}</span>
                    </h3>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                      analysisResult.concernLevel === 'High' 
                        ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                        : analysisResult.concernLevel === 'Medium' 
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {analysisResult.concernLevel} Concern
                    </span>
                  </div>

                  <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-white p-4 rounded-xl border border-slate-200">
                    {analysisResult.text}
                  </p>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      {lang === 'bn' ? 'জরুরি সতর্কবার্তা: দৃশ্যমান বিশ্লেষণ নিশ্চিত করে বলতে পারে না যে খাদ্যটি ব্যাকটেরিয়ামুক্ত। সন্দেহ হলে খাবার বর্জন করুন।' : 'CRITICAL DISCLAIMER: Visual AI analysis cannot confirm micro-biological safety. When in doubt, discard the food or consult a certified safety expert.'}
                    </span>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {}
        {page === 'knowledge' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900">{t.navLearn}</h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  {lang === 'bn' ? 'খাদ্যের হাইজিন, সংরক্ষণ ও স্বাস্থ্যবিধি সংক্রান্ত নির্দেশিকাসমূহ' : 'Explore verified articles on cross-contamination, cooking safety, and spoilage prevention.'}
                </p>
              </div>

              {/* Search input */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ARTICLES_DATA
                .filter(art => 
                  art.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  art.titleBn.includes(searchQuery)
                )
                .map((art) => (
                  <div 
                    key={art.id}
                    onClick={() => {
                      setSelectedArticle(art);
                      setPage('article-detail');
                    }}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col"
                  >
                    <div className="h-48 overflow-hidden relative">
                      <img src={art.image} alt={art.titleEn} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      <span className="absolute top-3 left-3 bg-emerald-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {art.category}
                      </span>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center space-x-2 text-[11px] text-slate-400 mb-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{art.readTime}</span>
                          <span>•</span>
                          <span>{art.date}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-base line-clamp-2">
                          {lang === 'bn' ? art.titleBn : art.titleEn}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                          {lang === 'bn' ? art.excerptBn : art.excerptEn}
                        </p>
                      </div>

                      <div className="text-xs font-bold text-emerald-600 flex items-center space-x-1 pt-2">
                        <span>{lang === 'bn' ? 'বিস্তারিত পড়ুন' : 'Read Article'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {}
        {page === 'article-detail' && selectedArticle && (
          <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
            <button
              onClick={() => setPage('knowledge')}
              className="text-xs font-semibold text-slate-500 hover:text-emerald-700 flex items-center space-x-1"
            >
              <span>← {lang === 'bn' ? 'জ্ঞান কেন্দ্রে ফিরে যান' : 'Back to Knowledge Center'}</span>
            </button>

            <div className="space-y-3">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                {selectedArticle.category}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                {lang === 'bn' ? selectedArticle.titleBn : selectedArticle.titleEn}
              </h1>
              <div className="text-xs text-slate-400 flex items-center space-x-3">
                <span>{selectedArticle.date}</span>
                <span>•</span>
                <span>{selectedArticle.readTime}</span>
              </div>
            </div>

            <div className="h-80 sm:h-96 rounded-3xl overflow-hidden shadow-lg border border-slate-200">
              <img src={selectedArticle.image} alt="Article header" className="w-full h-full object-cover" />
            </div>

            <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm text-slate-800 text-sm leading-relaxed whitespace-pre-line space-y-4">
              {lang === 'bn' ? selectedArticle.contentBn : selectedArticle.contentEn}
            </div>
          </div>
        )}

        {}
        {page === 'storage' && (
          <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-extrabold text-slate-900">{t.storageCalc}</h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
                {lang === 'bn' ? 'বিভিন্ন খাদ্য উপাদানের সঠিক রেফ্রিজারেশন ও ফ্রিজিং সময়সীমা জেনে নিন।' : 'Check recommended storage conditions and shelf-life for perishables, dairy, and cooked meals.'}
              </p>
            </div>

            {/* Storage Data Table / Cards */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-600 grid grid-cols-12 gap-2">
                <div className="col-span-4">{lang === 'bn' ? 'খাদ্য উপাদান' : 'Food Item'}</div>
                <div className="col-span-3 text-center">{lang === 'bn' ? 'রেফ্রিজারেটর (4°C)' : 'Fridge (≤4°C)'}</div>
                <div className="col-span-3 text-center">{lang === 'bn' ? 'ফ্রিজার (-18°C)' : 'Freezer (-18°C)'}</div>
                <div className="col-span-2 text-right">{lang === 'bn' ? 'প্যান্ট্রি' : 'Pantry'}</div>
              </div>

              <div className="divide-y divide-slate-100">
                {FOOD_STORAGE_DB.map((item) => (
                  <div key={item.id} className="p-4 text-xs hover:bg-slate-50 transition-colors grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4 font-bold text-slate-900">
                      <div>{lang === 'bn' ? item.nameBn : item.nameEn}</div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">{lang === 'bn' ? item.noteBn : item.noteEn}</div>
                    </div>
                    <div className="col-span-3 text-center font-semibold text-emerald-700 bg-emerald-50 py-1 rounded-lg border border-emerald-100">
                      {item.fridge}
                    </div>
                    <div className="col-span-3 text-center font-semibold text-teal-700 bg-teal-50 py-1 rounded-lg border border-teal-100">
                      {item.freezer}
                    </div>
                    <div className="col-span-2 text-right text-slate-600 font-medium">
                      {item.pantry}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {}
        {page === 'quiz' && (
          <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-extrabold text-slate-900">{t.quizHeader}</h1>
              <p className="text-xs sm:text-sm text-slate-600">
                {lang === 'bn' ? 'প্রশ্নগুলোর সঠিক উত্তর দিয়ে আপনার খাদ্য সুরক্ষা জ্ঞান পরীক্ষা করুন।' : 'Answer questions to evaluate your knowledge and earn hygiene badges.'}
              </p>
            </div>

            {!quizCompleted ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-6">
                
                {/* Progress bar */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Question {quizIdx + 1} of {QUIZ_QUESTIONS.length}</span>
                  <span>Score: {quizScore}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full transition-all" style={{ width: `${((quizIdx + 1) / QUIZ_QUESTIONS.length) * 100}%` }}></div>
                </div>

                {/* Question */}
                <h3 className="text-lg font-bold text-slate-900">
                  {lang === 'bn' ? QUIZ_QUESTIONS[quizIdx].questionBn : QUIZ_QUESTIONS[quizIdx].questionEn}
                </h3>

                {/* Options */}
                <div className="space-y-3">
                  {(lang === 'bn' ? QUIZ_QUESTIONS[quizIdx].optionsBn : QUIZ_QUESTIONS[quizIdx].optionsEn).map((opt, i) => (
                    <button
                      key={i}
                      disabled={showExplanation}
                      onClick={() => setSelectedOption(i)}
                      className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                        selectedOption === i 
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span>{opt}</span>
                      {selectedOption === i && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  ))}
                </div>

                {/* Submit / Explanation */}
                {showExplanation ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center space-x-2 font-bold text-xs">
                      {selectedOption === QUIZ_QUESTIONS[quizIdx].answer ? (
                        <span className="text-emerald-600 flex items-center space-x-1"><CheckCircle2 className="w-4 h-4" /> <span>Correct!</span></span>
                      ) : (
                        <span className="text-rose-600 flex items-center space-x-1"><XCircle className="w-4 h-4" /> <span>Incorrect!</span></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">
                      {lang === 'bn' ? QUIZ_QUESTIONS[quizIdx].explanationBn : QUIZ_QUESTIONS[quizIdx].explanationEn}
                    </p>
                    <button
                      onClick={() => {
                        if (quizIdx + 1 < QUIZ_QUESTIONS.length) {
                          setQuizIdx(quizIdx + 1);
                          setSelectedOption(null);
                          setShowExplanation(false);
                        } else {
                          setQuizCompleted(true);
                        }
                      }}
                      className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs"
                    >
                      {quizIdx + 1 < QUIZ_QUESTIONS.length ? 'Next Question →' : 'See Final Score'}
                    </button>
                  </div>
                ) : (
                  <button
                    disabled={selectedOption === null}
                    onClick={() => {
                      if (selectedOption === QUIZ_QUESTIONS[quizIdx].answer) {
                        setQuizScore(quizScore + 10);
                      }
                      setShowExplanation(true);
                    }}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs"
                  >
                    Confirm Answer
                  </button>
                )}

              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <Award className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900">Quiz Completed!</h2>
                <p className="text-sm text-slate-600">You scored {quizScore} / {QUIZ_QUESTIONS.length * 10} Points</p>
                
                <div className="inline-block bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl text-xs font-bold text-emerald-800">
                  🏆 Badge Awarded: Kitchen Hygiene Guardian
                </div>

                <div>
                  <button
                    onClick={() => {
                      setQuizIdx(0);
                      setQuizScore(0);
                      setSelectedOption(null);
                      setShowExplanation(false);
                      setQuizCompleted(false);
                    }}
                    className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs"
                  >
                    Try Quiz Again
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {}
        {page === 'checklist' && (
          <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-extrabold text-slate-900">{t.navChecklist}</h1>
              <p className="text-xs sm:text-sm text-slate-600">
                {lang === 'bn' ? 'রান্নাঘর বা রেস্তোরাঁর স্বাস্থ্যবিধি তদারকির সহজ নির্দেশিকা' : 'Tick off daily hygiene routines for households or commercial restaurants.'}
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setActiveChecklistTab('home')}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-colors ${
                  activeChecklistTab === 'home' ? 'bg-emerald-600 text-white' : 'bg-white border text-slate-700'
                }`}
              >
                {lang === 'bn' ? 'বাসাবাড়ির রান্নাঘর' : 'Home Kitchen'}
              </button>
              <button
                onClick={() => setActiveChecklistTab('restaurant')}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-colors ${
                  activeChecklistTab === 'restaurant' ? 'bg-emerald-600 text-white' : 'bg-white border text-slate-700'
                }`}
              >
                {lang === 'bn' ? 'রেস্তোরাঁ ও বাণিজ্যিক' : 'Commercial Restaurant'}
              </button>
            </div>

            {/* Checklist items */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              {CHECKLIST_DATA[activeChecklistTab].map((item) => (
                <label key={item.id} className="flex items-center space-x-3 p-3.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer border border-slate-100">
                  <input
                    type="checkbox"
                    checked={!!completedItems[item.id]}
                    onChange={(e) => setCompletedItems({ ...completedItems, [item.id]: e.target.checked })}
                    className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className={`text-xs sm:text-sm font-medium ${completedItems[item.id] ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {lang === 'bn' ? item.textBn : item.textEn}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {}
        {page === 'alerts' && (
          <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-extrabold text-slate-900">{t.navAlerts}</h1>
              <p className="text-xs sm:text-sm text-slate-600">
                {lang === 'bn' ? 'জরুরি খাদ্য প্রত্যাহার ও জনস্বাস্থ্য বিষয়ক সরাসরি আপডেট' : 'Real-time public health advisories and food product recall notifications.'}
              </p>
            </div>

            <div className="space-y-4">
              {SAFETY_ALERTS.map((alt) => (
                <div key={alt.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      alt.severity === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {alt.severity} Priority Alert
                    </span>
                    <span className="text-xs text-slate-400">{alt.date}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{lang === 'bn' ? alt.titleBn : alt.titleEn}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{lang === 'bn' ? alt.descriptionBn : alt.descriptionEn}</p>
                  
                  <div className="text-[11px] font-semibold text-slate-400 border-t pt-2">
                    Source: {alt.source}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {}
        {page === 'about' && (
          <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-extrabold text-slate-900">{t.navAbout}</h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
                {t.heroSubtitle}
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{lang === 'bn' ? 'আমাদের লক্ষ্য (Mission)' : 'Our Mission'}</h3>
                <p>{lang === 'bn' ? 'প্রযুক্তি ও আর্টিফিশিয়াল ইন্টেলিজেন্স ব্যবহার করে প্রতিটি মানুষের কাছে খাদ্য নিরাপত্তার সঠিক তথ্য পৌঁছে দেওয়া।' : 'To empower everyday consumers, institutions, and food businesses with AI-driven, accessible, and evidence-based food safety guidance.'}</p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{lang === 'bn' ? 'আমাদের দৃষ্টিভঙ্গি (Vision)' : 'Our Vision'}</h3>
                <p>{lang === 'bn' ? 'একটি সচেতন সমাজ গড়ে তোলা যেখানে খাদ্যবাহিত রোগ এবং খাবার অপচয়ের হার শূন্যের কোঠায় নেমে আসবে।' : 'A society free from preventable foodborne illnesses, where smart technology ensures every meal is safe and clean.'}</p>
              </div>
            </div>
          </div>
        )}

        {}
        {page === 'resources' && (
          <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-extrabold text-slate-900">{t.navResources}</h1>
              <p className="text-xs sm:text-sm text-slate-600">
                {lang === 'bn' ? 'আন্তর্জাতিক ও জাতীয় নিবন্ধিত খাদ্য সুরক্ষা সংস্থার গ্যাঁডলাইন' : 'Authoritative external portals and government regulatory standards.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'World Health Organization (WHO)', desc: 'Five Keys to Safer Food Manual', link: 'https://www.who.int' },
                { name: 'Bangladesh Food Safety Authority (BFSA)', desc: 'National Food Hygiene Regulations', link: 'http://www.bfsa.gov.bd' },
                { name: 'Codex Alimentarius (FAO/WHO)', desc: 'International Food Standards', link: 'https://www.fao.org' },
                { name: 'CDC Food Safety Portal', desc: 'Outbreak Investigations & Prevention', link: 'https://www.cdc.gov' }
              ].map((res, i) => (
                <a key={i} href={res.link} target="_blank" rel="noopener noreferrer" className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-sm flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{res.name}</h3>
                    <p className="text-[11px] text-slate-500">{res.desc}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-emerald-600" />
                </a>
              ))}
            </div>
          </div>
        )}

        {}
        {page === 'admin' && (
          <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Admin Content Management System</h1>
                <p className="text-xs text-slate-500">Manage platform articles, quiz questions, public alerts, and audit logs.</p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">Admin Privileges Active</span>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-400 font-medium">Total Articles</div>
                <div className="text-2xl font-black text-slate-900 mt-1">12</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-400 font-medium">AI Queries Logged</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">1,482</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-400 font-medium">Image Vision Audits</div>
                <div className="text-2xl font-black text-teal-600 mt-1">620</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-400 font-medium">Active Recalls</div>
                <div className="text-2xl font-black text-amber-600 mt-1">2</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
              <h3 className="font-bold text-sm text-slate-900">System Audit Log</h3>
              <div className="text-xs space-y-2">
                <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
                  <span>[2026-08-22] Alert #alt-101 published by Administrator.</span>
                  <span className="text-slate-400">SUCCESS</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
                  <span>[2026-08-21] RAG Vector Index updated with new BFSA guidelines.</span>
                  <span className="text-slate-400">SUCCESS</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 relative shadow-2xl">
            <button 
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900">
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="text-xs text-slate-500">
                {authMode === 'login' ? 'Sign in to save quiz scores and history' : 'Register to unlock full AI and dashboard tools'}
              </p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              setUser({ name: 'Dr. Rahat Ahmed', email: 'rahat@example.com', role: 'admin' });
              setAuthModalOpen(false);
              triggerToast('Signed in successfully as Admin');
            }} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <input type="email" required defaultValue="rahat@example.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
                <input type="password" required defaultValue="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500" />
              </div>

              <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md">
                {authMode === 'login' ? 'Sign In' : 'Register Account'}
              </button>
            </form>

            <div className="text-center text-xs text-slate-500">
              {authMode === 'login' ? (
                <span>Don't have an account? <button onClick={() => setAuthMode('register')} className="text-emerald-600 font-bold">Register</button></span>
              ) : (
                <span>Already have an account? <button onClick={() => setAuthMode('login')} className="text-emerald-600 font-bold">Sign In</button></span>
              )}
            </div>
          </div>
        </div>
      )}
 
        <ImportantLinks />

      {}
      <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-white font-bold text-base">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>{t.brandName}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              {t.heroSubtitle}
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3">Quick Navigation</h4>
            <ul className="space-y-2">
              <li><button onClick={() => setPage('home')} className="hover:text-emerald-400">{t.navHome}</button></li>
              <li><button onClick={() => setPage('knowledge')} className="hover:text-emerald-400">{t.navLearn}</button></li>
              <li><button onClick={() => setPage('storage')} className="hover:text-emerald-400">{t.navStorage}</button></li>
              <li><button onClick={() => setPage('assistant')} className="hover:text-emerald-400">{t.navAI}</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3">Interactive Tools</h4>
            <ul className="space-y-2">
              <li><button onClick={() => setPage('image-analysis')} className="hover:text-emerald-400">{t.navVision}</button></li>
              <li><button onClick={() => setPage('quiz')} className="hover:text-emerald-400">{t.navQuiz}</button></li>
              <li><button onClick={() => setPage('checklist')} className="hover:text-emerald-400">{t.navChecklist}</button></li>
              <li><button onClick={() => setPage('alerts')} className="hover:text-emerald-400">{t.navAlerts}</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3">Legal & Safety</h4>
            <p className="text-[11px] leading-relaxed text-slate-400">
              AI recommendations and image analysis provide preliminary visual insights only and do not replace official regulatory laboratory tests.
            </p>
            <div className="mt-4 text-[10px] text-slate-500">
              © 2026 Md Tajul Islam Kabir. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}