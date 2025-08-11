import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Home = () => {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-primary-900/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-800/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          {/* Logo */}
          <div className="mb-8 animate-fade-in">
            <img 
              src={logo} 
              alt="Fight Club 01 Logo" 
              className="h-24 w-24 md:h-32 md:w-32 mx-auto rounded-2xl shadow-2xl shadow-primary-600/20"
            />
          </div>
          
          {/* Main Title */}
          <div className="mb-6 animate-slide-up">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-black mb-4">
              <span className="bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 bg-clip-text text-transparent">
                FIGHT
              </span>
              <br />
              <span className="text-white">
                CLUB
              </span>
              <br />
              <span className="text-primary-400 text-5xl md:text-7xl lg:text-8xl">
                01
              </span>
            </h1>
          </div>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto animate-slide-up" style={{animationDelay: '0.2s'}}>
            Welcome to the underground. Where legends are forged and tribes unite.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{animationDelay: '0.4s'}}>
            <Link to="/join" className="btn-primary text-lg px-8 py-4">
              Join the Tribe
            </Link>
            <Link to="/about" className="btn-secondary text-lg px-8 py-4">
              Learn More
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 animate-slide-up" style={{animationDelay: '0.6s'}}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-400 mb-2">50+</div>
              <div className="text-gray-400 text-sm md:text-base">Active Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-400 mb-2">100+</div>
              <div className="text-gray-400 text-sm md:text-base">Events Hosted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-400 mb-2">24/7</div>
              <div className="text-gray-400 text-sm md:text-base">Community</div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>
      
      {/* Quick Overview Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title">What We're About</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Fight Club 01 is more than just a Transformice tribe. We're a community of dedicated players 
              who believe in teamwork, skill development, and having fun together.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center group hover:scale-105 transition-transform duration-200">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">🏆</div>
              <h3 className="text-xl font-semibold text-white mb-3">Competitive Excellence</h3>
              <p className="text-gray-400">
                Regular tournaments, training sessions, and skill-building events to help you become the best player you can be.
              </p>
            </div>
            
            <div className="card text-center group hover:scale-105 transition-transform duration-200">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">🤝</div>
              <h3 className="text-xl font-semibold text-white mb-3">Strong Community</h3>
              <p className="text-gray-400">
                A welcoming environment where friendships are formed and everyone supports each other's growth.
              </p>
            </div>
            
            <div className="card text-center group hover:scale-105 transition-transform duration-200">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-3">Active Events</h3>
              <p className="text-gray-400">
                Weekly races, movie nights, and special events that keep our community engaged and entertained.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link to="/about" className="btn-primary">
              Discover More
            </Link>
          </div>
        </div>
      </section>
      
      {/* Recent Activity Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title">Latest Activity</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                <span className="text-sm text-gray-400">2 hours ago</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Weekly Race Championship</h3>
              <p className="text-gray-400 mb-4">
                Tyler dominated this week's race with an incredible time of 12.34 seconds! 
                Congratulations to all participants.
              </p>
              <Link to="/events" className="text-primary-400 hover:text-primary-300 text-sm font-medium">
                View All Events →
              </Link>
            </div>
            
            <div className="card">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-blue-400 rounded-full mr-3 animate-pulse"></div>
                <span className="text-sm text-gray-400">1 day ago</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">New Member Welcome</h3>
              <p className="text-gray-400 mb-4">
                Welcome our newest members: Angel, Robert, and Siren! 
                They've already shown great potential in training sessions.
              </p>
              <Link to="/members" className="text-primary-400 hover:text-primary-300 text-sm font-medium">
                Meet the Team →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
