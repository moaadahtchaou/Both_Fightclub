import { useState } from 'react';

const Join = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    discordTag: '',
    timezone: '',
    experience: '',
    favoriteMode: '',
    playStyle: '',
    availability: [] as string[],
    motivation: '',
    foundUs: '',
    agreeRules: false,
    agreeActivity: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAvailabilityChange = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter(d => d !== day)
        : [...prev.availability, day]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('Processing your application...');

    try {
      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('Application submitted successfully! We\'ll review it and get back to you within 24-48 hours.');
      // Reset form
      setFormData({
        username: '',
        email: '',
        discordTag: '',
        timezone: '',
        experience: '',
        favoriteMode: '',
        playStyle: '',
        availability: [] as string[],
        motivation: '',
        foundUs: '',
        agreeRules: false,
        agreeActivity: false
      });
    } catch (error) {
      setSubmitStatus('Error: Unable to submit application. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const timezones = [
    'UTC-12', 'UTC-11', 'UTC-10', 'UTC-9', 'UTC-8', 'UTC-7', 'UTC-6',
    'UTC-5', 'UTC-4', 'UTC-3', 'UTC-2', 'UTC-1', 'UTC+0', 'UTC+1',
    'UTC+2', 'UTC+3', 'UTC+4', 'UTC+5', 'UTC+6', 'UTC+7', 'UTC+8',
    'UTC+9', 'UTC+10', 'UTC+11', 'UTC+12'
  ];

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const requirements = [
    {
      icon: '🎮',
      title: 'Active Player',
      description: 'Regular Transformice activity with at least 500 completed maps'
    },
    {
      icon: '💬',
      title: 'Discord Required',
      description: 'Must have Discord for communication and event coordination'
    },
    {
      icon: '🤝',
      title: 'Team Player',
      description: 'Respectful attitude and willingness to help other members'
    },
    {
      icon: '⏰',
      title: 'Time Commitment',
      description: 'Participate in at least one tribe event per week'
    }
  ];

  const benefits = [
    {
      icon: '🏆',
      title: 'Exclusive Events',
      description: 'Access to member-only tournaments and competitions'
    },
    {
      icon: '📚',
      title: 'Skill Development',
      description: 'Training sessions and mentorship from experienced players'
    },
    {
      icon: '🎁',
      title: 'Rewards & Recognition',
      description: 'Earn badges, titles, and special privileges'
    },
    {
      icon: '👥',
      title: 'Community',
      description: 'Join a tight-knit group of dedicated Transformice players'
    }
  ];

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="section-title">Join Fight Club 01</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Ready to become part of the underground? Fill out this application to join 
            the most elite Transformice tribe. Only serious fighters need apply.
          </p>
        </div>
        
        {/* Requirements */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Membership Requirements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requirements.map((req, index) => (
              <div key={index} className="card flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">{req.icon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{req.title}</h3>
                  <p className="text-gray-400 text-sm">{req.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Application Form */}
        <section className="mb-16">
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
              <span className="text-primary-400 mr-3">📝</span>
              Application Form
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Transformice Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Your in-game username"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Discord Tag *
                  </label>
                  <input
                    type="text"
                    name="discordTag"
                    value={formData.discordTag}
                    onChange={handleInputChange}
                    placeholder="Username#1234"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Timezone *
                  </label>
                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="" disabled hidden>Select your timezone</option>
                    {timezones.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Gaming Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Experience Level *
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="" disabled hidden>Select experience level</option>
                    <option value="beginner">Beginner (0-1000 maps)</option>
                    <option value="intermediate">Intermediate (1000-5000 maps)</option>
                    <option value="advanced">Advanced (5000-15000 maps)</option>
                    <option value="expert">Expert (15000+ maps)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Favorite Game Mode *
                  </label>
                  <select
                    name="favoriteMode"
                    value={formData.favoriteMode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="" disabled hidden>Select favorite mode</option>
                    <option value="vanilla">Vanilla</option>
                    <option value="bootcamp">Bootcamp</option>
                    <option value="racing">Racing</option>
                    <option value="survivor">Survivor</option>
                    <option value="divine">Divine</option>
                    <option value="defilante">Defilante</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Play Style *
                </label>
                <select
                  name="playStyle"
                  value={formData.playStyle}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="" disabled hidden>Select your play style</option>
                  <option value="competitive">Competitive - I love tournaments and challenges</option>
                  <option value="casual">Casual - I play for fun and relaxation</option>
                  <option value="social">Social - I enjoy the community aspect most</option>
                  <option value="improver">Improver - I want to get better at the game</option>
                  <option value="helper">Helper - I like helping other players</option>
                </select>
              </div>
              
              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Weekly Availability *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {weekDays.map(day => (
                    <label key={day} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.availability.includes(day)}
                        onChange={() => handleAvailabilityChange(day)}
                        className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
                      />
                      <span className="text-gray-300 text-sm">{day.slice(0, 3)}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Motivation */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Why do you want to join Fight Club 01? *
                </label>
                <textarea
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Tell us about your motivation, goals, and what you can bring to the tribe..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                  required
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  How did you find us?
                </label>
                <select
                  name="foundUs"
                  value={formData.foundUs}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  <option value="" disabled hidden>Select how you found us</option>
                  <option value="ingame">In-game recruitment</option>
                  <option value="discord">Discord server</option>
                  <option value="friend">Friend recommendation</option>
                  <option value="forum">Transformice forums</option>
                  <option value="social">Social media</option>
                  <option value="search">Web search</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              {/* Agreements */}
              <div className="space-y-4 p-6 bg-gray-700/30 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Terms and Agreements</h3>
                
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeRules"
                    checked={formData.agreeRules}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500 focus:ring-2 mt-0.5"
                    required
                  />
                  <span className="text-gray-300 text-sm">
                    I have read and agree to follow the <a href="/rules" className="text-primary-400 hover:text-primary-300 underline">Fight Club 01 rules</a> and understand that violations may result in removal from the tribe.
                  </span>
                </label>
                
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeActivity"
                    checked={formData.agreeActivity}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500 focus:ring-2 mt-0.5"
                    required
                  />
                  <span className="text-gray-300 text-sm">
                    I commit to being an active member and participating in at least one tribe event per week.
                  </span>
                </label>
              </div>
              
              {/* Submit */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.agreeRules || !formData.agreeActivity}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting Application...
                    </>
                  ) : (
                    <>Submit Application</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      username: '',
                      email: '',
                      discordTag: '',
                      timezone: '',
                      experience: '',
                      favoriteMode: '',
                      playStyle: '',
                      availability: [] as string[],
                      motivation: '',
                      foundUs: '',
                      agreeRules: false,
                      agreeActivity: false
                    });
                    setSubmitStatus('');
                  }}
                  className="btn-secondary px-8"
                >
                  Clear Form
                </button>
              </div>
              
              {submitStatus && (
                <div className={`p-4 rounded-lg ${
                  submitStatus.includes('Error') 
                    ? 'bg-red-900/20 border border-red-700/30 text-red-400'
                    : submitStatus.includes('successfully')
                    ? 'bg-green-900/20 border border-green-700/30 text-green-400'
                    : 'bg-blue-900/20 border border-blue-700/30 text-blue-400'
                }`}>
                  {submitStatus}
                </div>
              )}
            </form>
          </div>
        </section>
        
        {/* Benefits */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Member Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="card flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">{benefit.icon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-400 text-sm">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Process */}
        <section className="mb-16">
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Application Process</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Submit Application</h3>
                <p className="text-gray-400 text-sm">Fill out the form above with accurate information</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Review Process</h3>
                <p className="text-gray-400 text-sm">Leadership reviews your application within 24-48 hours</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Welcome Aboard</h3>
                <p className="text-gray-400 text-sm">If accepted, you'll receive Discord invite and tribe invitation</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Alternative Contact */}
        <section className="text-center py-12 border-t border-gray-700">
          <h2 className="text-3xl font-bold text-white mb-4">Questions?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            If you have any questions about the application process or tribe membership, 
            feel free to reach out to us directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://discord.gg/fightclub01" className="btn-primary">
              Join Discord
            </a>
            <a href="/contact" className="btn-secondary">
              Contact Us
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Join;
