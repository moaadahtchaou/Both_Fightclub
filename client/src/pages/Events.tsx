const Events = () => {
  const upcomingEvents = [
    {
      id: 1,
      title: "Weekly Bootcamp Training",
      type: "Training",
      date: "2024-01-15",
      time: "20:00 GMT",
      duration: "2 hours",
      description: "Intensive bootcamp training session focusing on speed and precision. Perfect for members looking to improve their racing skills.",
      host: "Tyler Durden",
      maxParticipants: 20,
      currentParticipants: 14,
      difficulty: "Intermediate",
      rewards: ["XP Boost", "Skill Badge", "Recognition"]
    },
    {
      id: 2,
      title: "Survivor Championship",
      type: "Competition",
      date: "2024-01-18",
      time: "19:30 GMT",
      duration: "3 hours",
      description: "Monthly survivor tournament with elimination rounds. Last mouse standing wins exclusive prizes and eternal glory.",
      host: "The Narrator",
      maxParticipants: 32,
      currentParticipants: 28,
      difficulty: "Advanced",
      rewards: ["Champion Title", "Exclusive Badge", "Discord Role"]
    },
    {
      id: 3,
      title: "New Member Orientation",
      type: "Social",
      date: "2024-01-20",
      time: "18:00 GMT",
      duration: "1.5 hours",
      description: "Welcome session for new tribe members. Learn about our culture, meet the leadership, and get integrated into the community.",
      host: "Marla Singer",
      maxParticipants: 15,
      currentParticipants: 8,
      difficulty: "Beginner",
      rewards: ["Welcome Package", "Mentor Assignment", "Starter Guide"]
    },
    {
      id: 4,
      title: "Divine Map Marathon",
      type: "Challenge",
      date: "2024-01-22",
      time: "21:00 GMT",
      duration: "4 hours",
      description: "Ultimate endurance test on the hardest divine maps. Only the most dedicated fighters should attempt this challenge.",
      host: "Big Bob",
      maxParticipants: 12,
      currentParticipants: 9,
      difficulty: "Expert",
      rewards: ["Divine Master Title", "Legendary Badge", "Hall of Fame"]
    }
  ];

  const pastEvents = [
    {
      title: "Holiday Racing Tournament",
      date: "2023-12-25",
      participants: 45,
      winner: "Angel Face",
      type: "Tournament"
    },
    {
      title: "Vanilla Speed Run Challenge",
      date: "2023-12-18",
      participants: 32,
      winner: "Robert Paulson",
      type: "Challenge"
    },
    {
      title: "Team Building Social Night",
      date: "2023-12-10",
      participants: 38,
      winner: "Everyone!",
      type: "Social"
    }
  ];

  const eventTypes = {
    Training: { color: "bg-blue-500", icon: "🎯" },
    Competition: { color: "bg-red-500", icon: "🏆" },
    Social: { color: "bg-green-500", icon: "🎉" },
    Challenge: { color: "bg-purple-500", icon: "⚡" }
  };

  const difficultyColors = {
    Beginner: "text-green-400 border-green-400",
    Intermediate: "text-yellow-400 border-yellow-400",
    Advanced: "text-orange-400 border-orange-400",
    Expert: "text-red-400 border-red-400"
  };

  const EventCard = ({ event, index }: { event: any, index: number }) => {
    const eventType = eventTypes[event.type as keyof typeof eventTypes];
    const difficultyClass = difficultyColors[event.difficulty as keyof typeof difficultyColors];
    const participationRate = (event.currentParticipants / event.maxParticipants) * 100;
    
    return (
      <div 
        className="card group hover:scale-105 transition-all duration-300"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${eventType.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <span className="text-xl">{eventType.icon}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-primary-300 transition-colors">
                {event.title}
              </h3>
              <span className={`inline-block px-2 py-1 text-xs border rounded-full ${difficultyClass}`}>
                {event.difficulty}
              </span>
            </div>
          </div>
          <div className="text-right text-sm text-gray-400">
            <div>{new Date(event.date).toLocaleDateString()}</div>
            <div>{event.time}</div>
          </div>
        </div>
        
        <p className="text-gray-300 mb-4 text-sm leading-relaxed">{event.description}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="text-gray-400">Host:</span>
            <span className="text-primary-400 ml-2 font-medium">{event.host}</span>
          </div>
          <div>
            <span className="text-gray-400">Duration:</span>
            <span className="text-white ml-2">{event.duration}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Participants</span>
            <span className="text-white">{event.currentParticipants}/{event.maxParticipants}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-500 to-primary-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${participationRate}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Rewards:</div>
          <div className="flex flex-wrap gap-2">
            {event.rewards.map((reward: string, idx: number) => (
              <span key={idx} className="px-2 py-1 bg-primary-900/30 text-primary-300 text-xs rounded-full border border-primary-700/30">
                {reward}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="btn-primary flex-1 text-sm py-2">
            Join Event
          </button>
          <button className="btn-secondary px-4 text-sm py-2">
            Details
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="section-title">Fight Club Events</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Join our regular events to improve your skills, compete with fellow fighters, 
            and earn exclusive rewards. Every event is an opportunity to prove yourself.
          </p>
        </div>
        
        {/* Event Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary-400 mb-2">4</div>
            <div className="text-gray-400">Upcoming Events</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary-400 mb-2">156</div>
            <div className="text-gray-400">Events This Year</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary-400 mb-2">89%</div>
            <div className="text-gray-400">Attendance Rate</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary-400 mb-2">2.3K</div>
            <div className="text-gray-400">Total Participants</div>
          </div>
        </div>
        
        {/* Upcoming Events */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white flex items-center">
              <span className="text-primary-400 mr-3">📅</span>
              Upcoming Events
            </h2>
            <button className="btn-secondary text-sm">
              View Calendar
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {upcomingEvents.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </div>
        </section>
        
        {/* Event Types */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center">
            <span className="text-primary-400 mr-3">🎯</span>
            Event Categories
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(eventTypes).map(([type, config], index) => (
              <div key={type} className="card text-center group hover:scale-105 transition-all duration-300">
                <div className={`w-16 h-16 ${config.color} rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <span className="text-2xl">{config.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{type}</h3>
                <p className="text-gray-400 text-sm">
                  {type === 'Training' && 'Skill development and practice sessions'}
                  {type === 'Competition' && 'Competitive tournaments and championships'}
                  {type === 'Social' && 'Community building and fun activities'}
                  {type === 'Challenge' && 'Extreme tests of skill and endurance'}
                </p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Recent Events */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
            <span className="text-primary-400 mr-3">🏆</span>
            Recent Events
          </h2>
          
          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Event</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Participants</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Winner</th>
                  </tr>
                </thead>
                <tbody>
                  {pastEvents.map((event, index) => (
                    <tr key={index} className="border-b border-gray-800/50 hover:bg-gray-700/30 transition-colors">
                      <td className="py-3 px-4 text-white font-medium">{event.title}</td>
                      <td className="py-3 px-4 text-gray-300">{new Date(event.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${eventTypes[event.type as keyof typeof eventTypes].color} bg-opacity-20`}>
                          {eventTypes[event.type as keyof typeof eventTypes].icon} {event.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{event.participants}</td>
                      <td className="py-3 px-4 text-primary-400 font-medium">{event.winner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        
        {/* Event Guidelines */}
        <section className="mb-16">
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-primary-400 mr-3">📋</span>
              Event Guidelines
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-primary-400 mb-3">Before Events</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-primary-400 mr-2">•</span>
                    Register at least 24 hours in advance
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-400 mr-2">•</span>
                    Check Discord for last-minute updates
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-400 mr-2">•</span>
                    Ensure stable internet connection
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-400 mr-2">•</span>
                    Review event-specific rules
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary-400 mb-3">During Events</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-primary-400 mr-2">•</span>
                    Arrive 10 minutes early
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-400 mr-2">•</span>
                    Follow host instructions
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-400 mr-2">•</span>
                    Maintain respectful behavior
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-400 mr-2">•</span>
                    No cheating or exploiting
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="text-center py-12 border-t border-gray-700">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Compete?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join our next event and show the tribe what you're made of. Every participation 
            is a step towards becoming a legendary fighter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary">
              View Event Calendar
            </button>
            <a href="/join" className="btn-secondary">
              Join the Tribe First
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Events;
