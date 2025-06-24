import React from 'react';
import { Upload, MessageSquare, Search, MessagesSquare, FileText, Brain } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Upload,
      title: 'Upload Any PDF',
      description: 'Seamlessly upload PDFs of any size or format. Our system handles everything from research papers to business reports.'
    },
    {
      icon: MessageSquare,
      title: 'Ask Questions Instantly',
      description: 'Type your questions in natural language. No need to learn special commands or syntax.'
    },
    {
      icon: Search,
      title: 'AI-Powered Search',
      description: 'Advanced AI understands context and meaning, not just keywords. Get relevant results every time.'
    },
    {
      icon: MessagesSquare,
      title: 'Chat with Your Documents',
      description: 'Have natural conversations with your PDFs. Follow up questions, clarifications, and deep dives.'
    },
    {
      icon: FileText,
      title: 'Handles Long Documents',
      description: 'No document is too long. Process hundreds of pages and get insights from anywhere in the text.'
    },
    {
      icon: Brain,
      title: 'Context-Aware Responses',
      description: 'Get answers that understand the full context of your document, with accurate page references.'
    }
  ];

  return (
    <section id="features" className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Powerful Features for
            <span className="text-blue-600"> Smart Reading</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to extract insights from your documents faster than ever before.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="bg-blue-100 p-4 rounded-xl w-fit mb-6">
                  <IconComponent className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold text-black mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;