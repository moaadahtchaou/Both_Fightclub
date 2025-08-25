import React, { useState } from 'react';
import YouTubeDownloader from '../components/tools/YouTubeDownloader';
import MP3Uploader from '../components/tools/MP3Uploader';
import AllinoneDownloadUpload from '../components/tools/AllinoneDownloadUpload';

const Tools = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);




  const tools = [
    {
      name: "All-in-One: Download & Upload",
      description: "Download from YouTube and upload directly to Catbox in one step",
      icon: "🔄",
      category: "Media",
      status: "Active",
      component: "allinone"
    },
    {
      name: "YouTube MP3 Downloader",
      description: "Convert YouTube videos to high-quality MP3 files instantly",
      icon: "🎵",
      category: "Media",
      status: "Active",
      component: "downloader"
    },
    {
      name: "MP3 File Uploader",
      description: "Upload MP3 files to Catbox for easy sharing and storage",
      icon: "📤",
      category: "Media",
      status: "Active",
      component: "uploader"
    },
    {
      name: "Map Code Generator",
      description: "Generate custom map codes for Transformice",
      icon: "🗺️",
      category: "Gaming",
      status: "Coming Soon",
      component: null
    },
    {
      name: "Event Scheduler",
      description: "Schedule and manage tribe events efficiently",
      icon: "📅",
      category: "Management",
      status: "Coming Soon",
      component: null
    },
    {
      name: "Member Stats Tracker",
      description: "Track and analyze member performance statistics",
      icon: "📊",
      category: "Analytics",
      status: "Coming Soon",
      component: null
    },
    {
      name: "Discord Bot Commands",
      description: "Comprehensive list of available bot commands",
      icon: "🤖",
      category: "Discord",
      status: "Coming Soon",
      component: null
    },
    {
      name: "Tribe Logo Generator",
      description: "Create custom logos and banners for your tribe",
      icon: "🎨",
      category: "Design",
      status: "Coming Soon",
      component: null
    }
  ];

  const categories = [...new Set(tools.map(tool => tool.category))];





  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="section-title">Tribe Tools</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Exclusive tools and utilities designed to enhance your Fight Club 01 experience. 
            From media conversion to gaming utilities, we've got you covered.
          </p>
        </div>

        {/* Selected Tool Section */}
        {selectedTool && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white flex items-center">
                <span className="text-primary-400 mr-3">🎯</span>
                Selected Tool
              </h2>
              <button
                onClick={() => setSelectedTool(null)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                ✕ Close
              </button>
            </div>
            
            <div className="max-w-4xl mx-auto">
              {selectedTool === 'allinone' && <AllinoneDownloadUpload />}
              {selectedTool === 'downloader' && <YouTubeDownloader />}
              {selectedTool === 'uploader' && <MP3Uploader />}
            </div>
          </section>
        )}
        
        {/* All Tools Overview */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
            <span className="text-primary-400 mr-3">🔧</span>
            All Tools
          </h2>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium">
              All Categories
            </button>
            {categories.map(category => (
              <button key={category} className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
                {category}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, index) => (
              <div 
                key={tool.name}
                className="card group hover:scale-105 transition-all duration-300 cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => {
                  if (tool.status === 'Active') {
                    setSelectedTool(tool.component);
                    // Scroll to top smoothly
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-xl">{tool.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-primary-300 transition-colors">
                        {tool.name}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-primary-900/30 text-primary-300 rounded-full border border-primary-700/30">
                        {tool.category}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    tool.status === 'Active' 
                      ? 'bg-green-900/30 text-green-400 border border-green-700/30'
                      : 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/30'
                  }`}>
                    {tool.status}
                  </span>
                </div>
                
                <p className="text-gray-300 text-sm mb-4">{tool.description}</p>
                
                <div className="flex gap-2">
                  {tool.status === 'Active' ? (
                    <button className="btn-primary flex-1 text-sm py-2">
                      Use Tool
                    </button>
                  ) : (
                    <button className="btn-secondary flex-1 text-sm py-2" disabled>
                      Coming Soon
                    </button>
                  )}
                  <button className="btn-secondary px-4 text-sm py-2">
                    Info
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        
        {/* Tool Requests */}
        <section className="mb-16">
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-primary-400 mr-3">💡</span>
              Request a Tool
            </h2>
            <p className="text-gray-400 mb-6">
              Have an idea for a tool that would benefit the tribe? Let us know and we'll consider adding it to our toolkit.
            </p>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tool Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter tool name"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                    <option value="" disabled hidden>Select category</option>
                    <option value="media">Media</option>
                    <option value="gaming">Gaming</option>
                    <option value="management">Management</option>
                    <option value="analytics">Analytics</option>
                    <option value="discord">Discord</option>
                    <option value="design">Design</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe what this tool should do and how it would help the tribe..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                ></textarea>
              </div>
              
              <button type="submit" className="btn-primary">
                Submit Request
              </button>
            </form>
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
      </div>
    </div>
  );
};

export default Tools;
