import React from 'react';
import { Upload, MessageCircle, CheckCircle, ArrowRight } from 'lucide-react';

const Workflow = () => {
  const steps = [
    {
      icon: Upload,
      title: 'Upload Your PDF',
      description: 'Drag and drop or select your PDF document. We support files up to 100MB.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: MessageCircle,
      title: 'Ask Questions in Natural Language',
      description: 'Type your question just like you would ask a colleague. No technical jargon needed.',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: CheckCircle,
      title: 'Get Smart, Source-Based Answers',
      description: 'Receive accurate answers with page references and relevant quotes from your document.',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  return (
    <section id="workflow" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            How It
            <span className="text-blue-600"> Works</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get insights from your documents in three simple steps. No learning curve required.
          </p>
        </div>

        <div className="relative">
          {/* Desktop Layout */}
          <div className="hidden lg:flex justify-between items-center">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <React.Fragment key={index}>
                  <div className="flex flex-col items-center text-center max-w-sm">
                    <div className={`p-6 rounded-2xl ${step.color} mb-6`}>
                      <IconComponent className="h-12 w-12" />
                    </div>
                    <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-4">
                      {index + 1}
                    </div>
                    <h3 className="text-2xl font-semibold text-black mb-4">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className="flex-shrink-0 mx-8">
                      <ArrowRight className="h-8 w-8 text-gray-300" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden space-y-12">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className={`p-6 rounded-2xl ${step.color} mb-6`}>
                    <IconComponent className="h-12 w-12" />
                  </div>
                  <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-4">
                    {index + 1}
                  </div>
                  <h3 className="text-2xl font-semibold text-black mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed max-w-md">
                    {step.description}
                  </p>
                  
                  {index < steps.length - 1 && (
                    <div className="mt-8">
                      <div className="w-px h-12 bg-gray-300"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Workflow;