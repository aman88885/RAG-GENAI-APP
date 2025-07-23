
import { MessageCircle, FileText, Sparkles, MousePointerClick } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {

  const navigate = useNavigate();

  const handleTryClick = () => {
    navigate('/dashboard');
  };

  return (
    <section id="home" className="bg-white pt-40 pb-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-6 leading-tight">
            Read Less.
            <span className="animate-text bg-gradient-to-r from-[#1e3a8a] via-[#a5f3fc] to-[#1e3a8a] bg-[length:200%_200%] bg-clip-text text-transparent font-semibold">
              Know More.</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed">
            Upload your PDF, ask a question, and get meaningful, AI-powered responses — no scrolling, no searching, just insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button onClick={handleTryClick}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all duration-200 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2">
              <MousePointerClick className="h-5 w-5" />
              <span>Try ChatDoc</span>
            </button>
          </div>

          {/* Visual Illustration */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 md:p-12 shadow-xl">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Document Representation */}
                <div className="relative">
                  <div className="bg-white rounded-lg shadow-lg p-6 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                    <div className="flex items-center space-x-2 mb-4">
                      <FileText className="h-6 w-6 text-blue-600" />
                      <span className="text-sm font-medium text-gray-600">research-paper.pdf</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-200 rounded w-full"></div>
                      <div className="h-2 bg-gray-200 rounded w-4/5"></div>
                      <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-2 bg-blue-200 rounded w-full"></div>
                      <div className="h-2 bg-blue-200 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <div className="bg-blue-600 p-2 rounded-full">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Chat Representation */}
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-2xl p-4 ml-8">
                    <p className="text-gray-700 text-sm">What are the main findings about climate change?</p>
                  </div>
                  <div className="bg-blue-600 text-white rounded-2xl p-4 mr-8">
                    <div className="flex items-start space-x-2">
                      <MessageCircle className="h-4 w-4 mt-1 flex-shrink-0" />
                      <p className="text-sm">Based on page 23-25, the study found three key impacts: rising sea levels, increased temperatures, and changing precipitation patterns...</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Source: Page 23-25</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;