import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="section-title">About Fight Club 01</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Discover the story behind one of Transformice's most dedicated and successful tribes.
          </p>
        </div>
        
        {/* Main Content */}
        <div className="space-y-12">
          {/* Origin Story */}
          <section className="card">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-primary-400 mr-3">🏛️</span>
              Our Origins
            </h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed mb-4">
                Fight Club 01 was founded in the underground chambers of Transformice, where the most 
                dedicated players gathered to push the boundaries of what was possible. Inspired by the 
                legendary Fight Club philosophy, we believe that through challenge and community, 
                we become our strongest selves.
              </p>
              <p className="text-gray-300 leading-relaxed">
                What started as a small group of friends racing through maps has evolved into a 
                thriving community of over 50 active members, each bringing their unique skills 
                and passion to the tribe.
              </p>
            </div>
          </section>
          
          {/* Mission & Values */}
          <section className="card">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-primary-400 mr-3">🎯</span>
              Our Mission
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-primary-400 mb-3">Excellence</h3>
                <p className="text-gray-300">
                  We strive for continuous improvement in all aspects of gameplay, 
                  from racing techniques to shaman skills.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary-400 mb-3">Community</h3>
                <p className="text-gray-300">
                  Building lasting friendships and supporting each other both 
                  in-game and in life.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary-400 mb-3">Innovation</h3>
                <p className="text-gray-300">
                  Constantly exploring new strategies, techniques, and ways 
                  to enhance the Transformice experience.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary-400 mb-3">Respect</h3>
                <p className="text-gray-300">
                  Treating all players with dignity and maintaining the highest 
                  standards of sportsmanship.
                </p>
              </div>
            </div>
          </section>
          
          {/* Achievements */}
          <section className="card">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-primary-400 mr-3">🏆</span>
              Our Achievements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gray-700/50 rounded-lg">
                <div className="text-3xl font-bold text-primary-400 mb-2">100+</div>
                <div className="text-white font-medium mb-1">Events Hosted</div>
                <div className="text-gray-400 text-sm">Weekly races, tournaments, and community events</div>
              </div>
              <div className="text-center p-6 bg-gray-700/50 rounded-lg">
                <div className="text-3xl font-bold text-primary-400 mb-2">50+</div>
                <div className="text-white font-medium mb-1">Active Members</div>
                <div className="text-gray-400 text-sm">Dedicated players from around the world</div>
              </div>
              <div className="text-center p-6 bg-gray-700/50 rounded-lg">
                <div className="text-3xl font-bold text-primary-400 mb-2">24/7</div>
                <div className="text-white font-medium mb-1">Community Support</div>
                <div className="text-gray-400 text-sm">Always someone online to help and play</div>
              </div>
            </div>
          </section>
          
          {/* Leadership */}
          <section className="card">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-primary-400 mr-3">👑</span>
              Leadership Team
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-4 p-4 bg-gray-700/30 rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  T
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Tyler</h3>
                  <p className="text-primary-400 font-medium">Tribe Leader</p>
                  <p className="text-gray-400 text-sm">Founder and visionary behind Fight Club 01</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-gray-700/30 rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  M
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Marla</h3>
                  <p className="text-primary-400 font-medium">Officer</p>
                  <p className="text-gray-400 text-sm">Event coordinator and community manager</p>
                </div>
              </div>
            </div>
          </section>
          
          {/* Join CTA */}
          <section className="text-center py-12">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Join the Underground?</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Become part of something bigger. Join Fight Club 01 and discover what it means 
              to be part of a true Transformice family.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/join" className="btn-primary">
                Join Our Tribe
              </Link>
              <Link to="/rules" className="btn-secondary">
                Read Our Rules
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
