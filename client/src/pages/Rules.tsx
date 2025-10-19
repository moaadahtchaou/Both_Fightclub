const Rules = () => {
  const rules = [
    {
      number: "01",
      title: "Honor The Freeborn",
      description: "Represent The Freeborn with respect, humility, and sportsmanship.",
      explanation: "Your words and actions reflect the tribe—be kind, fair, and constructive in-game and in chat."
    },
    {
      number: "02",
      title: "Respect and Privacy",
      description: "Respect teammates’ privacy and personal boundaries.",
      explanation: "Do not share screenshots, DMs, or personal info without consent. Tribe rooms are confidential."
    },
    {
      number: "03",
      title: "Play Fair",
      description: "Compete clean—no cheating, exploiting, or griefing.",
      explanation: "Report bugs and avoid toxic gameplay. We win with skill, preparation, and teamwork."
    },
    {
      number: "04",
      title: "Communicate Clearly",
      description: "Keep comms clear, calm, and helpful during events.",
      explanation: "Use concise callouts; avoid spam and backseat-leading. Default to agreed comms language."
    },
    {
      number: "05",
      title: "Show Up",
      description: "Participate consistently in tribe activities.",
      explanation: "Join at least one tribe event per week. If inactive for 7+ days, notify leadership."
    },
    {
      number: "06",
      title: "Help Others Improve",
      description: "Mentor newer members with patience and positivity.",
      explanation: "Share tips, builds, and map strategies. Celebrate learning; don’t shame mistakes."
    },
    {
      number: "07",
      title: "Resolve Conflicts Privately",
      description: "DM first; escalate respectfully when needed.",
      explanation: "Handle disputes one-on-one before involving officers. Keep public chat drama-free."
    },
    {
      number: "08",
      title: "Growth Mindset",
      description: "Learn, practice, and repeat—own your progress.",
      explanation: "Review runs, practice mechanics, and give positive feedback. Team wins over ego."
    }
  ];

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="section-title">The Freeborn Code</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            These are the fundamental principles that guide our tribe. Every member must understand 
            and respect these rules to maintain the integrity of The Freeborn.
          </p>
        </div>
        
        {/* Rules Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {rules.map((rule, index) => (
            <div 
              key={rule.number} 
              className="card group hover:scale-105 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <span className="text-white font-bold text-lg font-display">{rule.number}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-300 transition-colors">
                    {rule.title}
                  </h3>
                  <p className="text-primary-400 font-medium mb-3 italic">
                    "{rule.description}"
                  </p>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {rule.explanation}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Additional Guidelines */}
        <section className="card mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="text-primary-400 mr-3">📋</span>
            Additional Guidelines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-primary-400 mb-3">Activity Requirements</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <span className="text-primary-400 mr-2">•</span>
                  Participate in at least one tribe event per week
                </li>
                <li className="flex items-start">
                  <span className="text-primary-400 mr-2">•</span>
                  Check Discord regularly for announcements
                </li>
                <li className="flex items-start">
                  <span className="text-primary-400 mr-2">•</span>
                  Notify leadership if you'll be inactive for more than a week
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary-400 mb-3">Behavior Standards</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <span className="text-primary-400 mr-2">•</span>
                  Treat all members with respect and kindness
                </li>
                <li className="flex items-start">
                  <span className="text-primary-400 mr-2">•</span>
                  No cheating, hacking, or exploiting game mechanics
                </li>
                <li className="flex items-start">
                  <span className="text-primary-400 mr-2">•</span>
                  Help new members learn and improve
                </li>
              </ul>
            </div>
          </div>
        </section>
        
        {/* Consequences */}
        <section className="card mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="text-primary-400 mr-3">⚖️</span>
            Rule Violations
          </h2>
          <div className="bg-gray-700/30 rounded-lg p-6">
            <p className="text-gray-300 mb-4">
              We believe in second chances, but repeated violations of our rules will result in consequences:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
                <div className="text-yellow-400 font-semibold mb-2">First Warning</div>
                <div className="text-gray-400 text-sm">Discussion with leadership and guidance</div>
              </div>
              <div className="text-center p-4 bg-orange-900/20 border border-orange-700/30 rounded-lg">
                <div className="text-orange-400 font-semibold mb-2">Second Warning</div>
                <div className="text-gray-400 text-sm">Temporary suspension from events</div>
              </div>
              <div className="text-center p-4 bg-red-900/20 border border-red-700/30 rounded-lg">
                <div className="text-red-400 font-semibold mb-2">Final Warning</div>
                <div className="text-gray-400 text-sm">Removal from the tribe</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Agreement */}
        <section className="text-center py-12 border-t border-gray-700">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Commit?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            By joining The Freeborn, you agree to uphold these rules and contribute positively 
            to our community. Are you ready to become part of the underground?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/join" className="btn-primary">
              I Accept - Join Now
            </a>
            <a href="/about" className="btn-secondary">
              Learn More About Us
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Rules;
