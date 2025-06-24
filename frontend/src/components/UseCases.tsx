import React from 'react';

const UseCases = () => {
  const useCases = [
    {
      image: 'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Doctors',
      subtitle: 'Medical Research Made Simple',
      description: 'Quickly extract key findings from medical papers, drug research, and clinical studies. Stay updated with the latest medical knowledge without spending hours reading.',
      benefits: ['Quick research insights', 'Evidence-based answers', 'Time-saving analysis']
    },
    {
      image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Researchers',
      subtitle: 'Academic Excellence Accelerated',
      description: 'Digest complex academic papers, literature reviews, and research reports efficiently. Focus on analysis rather than information gathering.',
      benefits: ['Literature review assistance', 'Citation finding', 'Research synthesis']
    },
    {
      image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Business Analysts',
      subtitle: 'Strategic Insights Unlocked',
      description: 'Process lengthy business reports, market analyses, and strategic documents. Extract actionable insights for better decision-making.',
      benefits: ['Report summarization', 'Trend identification', 'Decision support']
    }
  ];

  return (
    <section id="use-cases" className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Who Uses
            <span className="text-blue-600"> ChatDoc</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Whether you're saving lives, advancing knowledge, or driving business growth, 
            ChatDoc helps you work smarter, not harder.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 cursor-pointer border border-gray-100"
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={useCase.image}
                  alt={useCase.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                
                {/* Title Overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-3xl font-bold text-white mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    {useCase.title}
                  </h3>
                  <p className="text-blue-200 font-semibold text-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100">
                    {useCase.subtitle}
                  </p>
                </div>
              </div>

              {/* Content Container */}
              <div className="p-8">
                <p className="text-gray-600 leading-relaxed mb-6">
                  {useCase.description}
                </p>

                <div className="space-y-3 mb-6">
                  {useCase.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center space-x-3">
                      <div className="bg-green-100 p-1 rounded-full">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <span className="text-gray-700 font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors duration-200 font-semibold group-hover:shadow-lg">
                  Get Started
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;