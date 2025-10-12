import { useState } from 'react';
import YouTubeDownloader from '../components/tools/YouTubeDownloader';
import MP3Uploader from '../components/tools/MP3Uploader';
import AllinoneDownloadUpload from '../components/tools/AllinoneDownloadUpload';
import InstagramAudioTool from '../components/tools/InstagramAudioTool';
import CnvMp3Tool from '../components/tools/CnvMp3Tool';
import {
  WrenchScrewdriverIcon,
  SparklesIcon,
  RocketLaunchIcon,
  XMarkIcon,
  FunnelIcon,
  MapIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CommandLineIcon,
  PaintBrushIcon,
  MusicalNoteIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  InformationCircleIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

const Tools = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');




  const tools = [
        {
      name: "CnvMp3 Tool",
      description: "Download YouTube videos as MP3 using the cnvmp3.com API with direct Catbox upload",
      icon: MusicalNoteIcon,
      category: "Media",
      status: "Active",
      component: "cnvmp3",
      gradient: "from-purple-500 to-indigo-500",
      bgGradient: "from-purple-500/10 to-indigo-500/10",
      borderGradient: "from-purple-500/30 to-indigo-500/30"
    },
    {
      name: "All-in-One: Download & Upload",
      description: "Download from YouTube and upload directly to Catbox in one seamless workflow",
      icon: ArrowPathIcon,
      category: "Media",
      status: "Active",
      component: "allinone",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/10 to-cyan-500/10",
      borderGradient: "from-blue-500/30 to-cyan-500/30"
    },

    {
      name: "Instagram Audio Extractor",
      description: "Extract audio from Instagram Reels and upload directly to Catbox",
      icon: MusicalNoteIcon,
      category: "Media",
      status: "Coming Soon",
      component: "instagram",
      gradient: "from-fuchsia-500 to-rose-500",
      bgGradient: "from-fuchsia-500/10 to-rose-500/10",
      borderGradient: "from-fuchsia-500/30 to-rose-500/30"
    },
    // {
    //   name: "YouTube MP3 Downloader",
    //   description: "Convert YouTube videos to high-quality MP3 files with lightning speed",
    //   icon: MusicalNoteIcon,
    //   category: "Media",
    //   status: "Active",
    //   component: "downloader",
    //   gradient: "from-purple-500 to-pink-500",
    //   bgGradient: "from-purple-500/10 to-pink-500/10",
    //   borderGradient: "from-purple-500/30 to-pink-500/30"
    // },
    // {
    //   name: "MP3 File Uploader",
    //   description: "Upload MP3 files to Catbox for easy sharing and permanent storage",
    //   icon: ArrowUpTrayIcon,
    //   category: "Media",
    //   status: "Active",
    //   component: "uploader",
    //   gradient: "from-green-500 to-emerald-500",
    //   bgGradient: "from-green-500/10 to-emerald-500/10",
    //   borderGradient: "from-green-500/30 to-emerald-500/30"
    // },
    {
      name: "Map Code Generator",
      description: "Generate custom map codes for Transformice with advanced features",
      icon: MapIcon,
      category: "Gaming",
      status: "Coming Soon",
      component: null,
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-500/10 to-red-500/10",
      borderGradient: "from-orange-500/30 to-red-500/30"
    },
    {
      name: "Event Scheduler",
      description: "Schedule and manage tribe events with automated notifications",
      icon: CalendarDaysIcon,
      category: "Management",
      status: "Coming Soon",
      component: null,
      gradient: "from-indigo-500 to-purple-500",
      bgGradient: "from-indigo-500/10 to-purple-500/10",
      borderGradient: "from-indigo-500/30 to-purple-500/30"
    },
    {
      name: "Member Stats Tracker",
      description: "Track and analyze member performance with detailed analytics",
      icon: ChartBarIcon,
      category: "Analytics",
      status: "Coming Soon",
      component: null,
      gradient: "from-teal-500 to-blue-500",
      bgGradient: "from-teal-500/10 to-blue-500/10",
      borderGradient: "from-teal-500/30 to-blue-500/30"
    },
    {
      name: "Discord Bot Commands",
      description: "Comprehensive command reference for our Discord bot",
      icon: CommandLineIcon,
      category: "Discord",
      status: "Coming Soon",
      component: null,
      gradient: "from-violet-500 to-purple-500",
      bgGradient: "from-violet-500/10 to-purple-500/10",
      borderGradient: "from-violet-500/30 to-purple-500/30"
    },
    {
      name: "Tribe Logo Generator",
      description: "Create stunning logos and banners for your tribe",
      icon: PaintBrushIcon,
      category: "Design",
      status: "Coming Soon",
      component: null,
      gradient: "from-pink-500 to-rose-500",
      bgGradient: "from-pink-500/10 to-rose-500/10",
      borderGradient: "from-pink-500/30 to-rose-500/30"
    }
  ];

  const categories = ['All', ...new Set(tools.map(tool => tool.category))];

  const filteredTools = tools.filter(tool => {
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'Coming Soon':
        return <ClockIcon className="w-4 h-4" />;
      default:
        return <InformationCircleIcon className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Media':
        return <MusicalNoteIcon className="w-5 h-5" />;
      case 'Gaming':
        return <PlayIcon className="w-5 h-5" />;
      case 'Management':
        return <CalendarDaysIcon className="w-5 h-5" />;
      case 'Analytics':
        return <ChartBarIcon className="w-5 h-5" />;
      case 'Discord':
        return <CommandLineIcon className="w-5 h-5" />;
      case 'Design':
        return <PaintBrushIcon className="w-5 h-5" />;
      default:
        return <WrenchScrewdriverIcon className="w-5 h-5" />;
    }
  };





  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
        <div className="relative py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl backdrop-blur-sm border border-white/10">
                <WrenchScrewdriverIcon className="w-16 h-16 text-blue-400" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Tribe Tools
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed">
              Exclusive tools and utilities designed to enhance your <span className="text-blue-400 font-semibold">Fight Club 01</span> experience. 
              From media conversion to gaming utilities, we've got everything you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircleIcon className="w-5 h-5" />
                <span className="font-medium">3 Active Tools</span>
              </div>
              <div className="flex items-center space-x-2 text-yellow-400">
                <ClockIcon className="w-5 h-5" />
                <span className="font-medium">5 Coming Soon</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-400">
                <SparklesIcon className="w-5 h-5" />
                <span className="font-medium">Always Free</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* Selected Tool Section */}
        {selectedTool && (
          <section className="mb-20">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl">
                    <RocketLaunchIcon className="w-8 h-8 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">Active Tool</h2>
                    <p className="text-gray-400">Currently using selected tool</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTool(null)}
                  className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 group"
                >
                  <XMarkIcon className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
                </button>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                {selectedTool === 'allinone' && <AllinoneDownloadUpload />}
                {selectedTool === 'cnvmp3' && <CnvMp3Tool />}
                {selectedTool === 'downloader' && <YouTubeDownloader />}
                {selectedTool === 'uploader' && <MP3Uploader />}
                {selectedTool === 'instagram' && <InstagramAudioTool />}
              </div>
            </div>
          </section>
        )}
        
        {/* Search and Filter Section */}
        <section className="mb-12">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                <FunnelIcon className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Find Your Tool</h2>
                <p className="text-gray-400">Search and filter through our collection</p>
              </div>
            </div>
            

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tools by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all pl-12"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-3">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/20'
                  }`}
                >
                  {category !== 'All' && getCategoryIcon(category)}
                  <span>{category}</span>
                  {category !== 'All' && (
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                      {tools.filter(tool => tool.category === category).length}
                    </span>
                  )}
                  {category === 'All' && (
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                      {tools.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>
        
        {/* Tools Grid */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl">
                <WrenchScrewdriverIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Available Tools</h2>
                <p className="text-gray-400">
                  Showing {filteredTools.length} of {tools.length} tools
                  {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>
            </div>
          </div>
          
          {/* No Results Message */}
          {filteredTools.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/10 max-w-md mx-auto">
                <div className="p-4 bg-gradient-to-br from-gray-500/20 to-slate-500/20 rounded-xl w-fit mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Tools Found</h3>
                <p className="text-gray-400 mb-6">
                  {searchQuery ? `No tools match "${searchQuery}"` : `No tools in ${selectedCategory} category`}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
          
          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTools.map((tool, index) => (
              <div 
                key={tool.name}
                className={`group relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl overflow-hidden cursor-pointer`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => {
                  if (tool.status === 'Active') {
                    setSelectedTool(tool.component);
                    // Scroll to top smoothly
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br ${tool.bgGradient}`}></div>
                
                {/* Border Gradient */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-br ${tool.borderGradient} p-[1px]`}>
                  <div className="w-full h-full bg-gray-900 rounded-2xl"></div>
                </div>
                
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${tool.gradient}`}>
                        <tool.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                          {tool.name}
                        </h3>
                        <p className="text-sm text-gray-400">{tool.category}</p>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(tool.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        tool.status === 'Active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        tool.status === 'Coming Soon' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {tool.status === 'Active' ? 'Active' :
                         tool.status === 'Coming Soon' ? 'Soon' :
                         'Free'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-300 mb-6 leading-relaxed">{tool.description}</p>
                  
                  {/* Action Button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <ClockIcon className="w-4 h-4" />
                      <span>Updated recently</span>
                    </div>
                    
                    {tool.status === 'Active' && (
                      <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-200 group-hover:scale-105 font-medium">
                        <RocketLaunchIcon className="w-4 h-4" />
                        <span>Launch</span>
                      </button>
                    )}
                    
                    {tool.status === 'Coming Soon' && (
                      <button className="flex items-center space-x-2 px-6 py-3 bg-gray-600/50 text-gray-400 rounded-xl cursor-not-allowed font-medium">
                        <ClockIcon className="w-4 h-4" />
                        <span>Soon</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        
        
        {/* Development Roadmap */}
        <section className="mb-16">
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-primary-400 mr-3">🗺️</span>
              Development Roadmap
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-4"></div>
                <div className="flex-1">
                  <div className="text-green-400 font-semibold">Q1 2024 - Completed</div>
                  <div className="text-gray-300">YouTube MP3 Downloader</div>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                <div className="w-3 h-3 bg-blue-400 rounded-full mr-4"></div>
                <div className="flex-1">
                  <div className="text-blue-400 font-semibold">Q2 2024 - In Progress</div>
                  <div className="text-gray-300">Map Code Generator, Event Scheduler</div>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mr-4"></div>
                <div className="flex-1">
                  <div className="text-yellow-400 font-semibold">Q3 2024 - Planned</div>
                  <div className="text-gray-300">Member Stats Tracker, Discord Bot Commands</div>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gray-900/20 border border-gray-700/30 rounded-lg">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-4"></div>
                <div className="flex-1">
                  <div className="text-gray-400 font-semibold">Q4 2024 - Future</div>
                  <div className="text-gray-300">Tribe Logo Generator, Advanced Analytics</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="text-center py-12 border-t border-gray-700">
          <h2 className="text-3xl font-bold text-white mb-4">Need Help?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            If you encounter any issues with our tools or have suggestions for improvements, 
            don't hesitate to reach out to our development team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="btn-primary">
              Contact Support
            </a>
            <a href="https://discord.gg/fightclub01" className="btn-secondary">
              Join Discord
            </a>
          </div>
        </section>
        
        {/* Footer Section */}
        <section className="mt-20 mb-12">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Quick Stats */}
              <div className="text-center">
                <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl w-fit mx-auto mb-4">
                  <CubeIcon className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{tools.length}</h3>
                <p className="text-gray-400">Total Tools</p>
              </div>
              
              <div className="text-center">
                <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl w-fit mx-auto mb-4">
                  <CheckCircleIcon className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {tools.filter(tool => tool.status === 'active').length}
                </h3>
                <p className="text-gray-400">Active Tools</p>
              </div>
              
              <div className="text-center">
                <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl w-fit mx-auto mb-4">
                  <SparklesIcon className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {tools.filter(tool => tool.status === 'free').length}
                </h3>
                <p className="text-gray-400">Free Tools</p>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-4">Need Help?</h3>
                <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                  Our tools are designed to make your workflow more efficient. If you need assistance or have suggestions for new tools, we're here to help.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button className="flex items-center space-x-2 px-6 py-3 bg-white/5 text-gray-300 rounded-xl hover:bg-white/10 hover:text-white transition-all duration-200 border border-white/20">
                    <InformationCircleIcon className="w-5 h-5" />
                    <span>Documentation</span>
                  </button>
                  <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-200">
                    <SparklesIcon className="w-5 h-5" />
                    <span>Request Feature</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Tools;
