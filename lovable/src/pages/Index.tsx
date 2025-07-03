
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, FileText, MessageSquare, Search, Users, BookOpen, Target, Upload, MessageCircle, CheckCircle, Stethoscope, GraduationCap, BarChart3, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    {
      icon: Upload,
      title: "Upload Any PDF",
      description: "Support for all PDF formats and sizes. Drag, drop, and done."
    },
    {
      icon: MessageSquare,
      title: "Ask Questions Instantly",
      description: "Natural language queries get instant, accurate responses."
    },
    {
      icon: Search,
      title: "AI-Powered Search",
      description: "Smart semantic search finds exactly what you need."
    },
    {
      icon: MessageCircle,
      title: "Chat with Your Documents",
      description: "Have conversations with your PDFs like talking to an expert."
    },
    {
      icon: FileText,
      title: "Handles Long Documents",
      description: "Process hundreds of pages without breaking a sweat."
    },
    {
      icon: Target,
      title: "Context-Aware Responses",
      description: "Answers include page references and relevant context."
    }
  ];

  const workflowSteps = [
    {
      icon: Upload,
      title: "Upload Your PDF",
      description: "Drop any PDF document into our secure platform"
    },
    {
      icon: MessageSquare,
      title: "Ask Questions in Natural Language",
      description: "Type your questions just like you'd ask a colleague"
    },
    {
      icon: CheckCircle,
      title: "Get Smart, Source-Based Answers",
      description: "Receive accurate answers with page references and context"
    }
  ];

  const useCases = [
    {
      title: "Doctors",
      description: "Quick access to medical papers and research findings",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Researchers",
      description: "Digest academic papers and extract key insights rapidly",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Business Analysts",
      description: "Process long reports and strategic documents efficiently",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];

  const faqs = [
    {
      question: "What types of PDFs can I upload?",
      answer: "You can upload any PDF document including research papers, reports, manuals, books, and more. We support both text-based and scanned PDFs."
    },
    {
      question: "How accurate are the AI responses?",
      answer: "Our AI provides highly accurate responses by analyzing the entire document context. All answers include source references so you can verify the information."
    },
    {
      question: "Is my data secure and private?",
      answer: "Yes, we take data security seriously. Your documents are encrypted in transit and at rest, and we never use your data to train our models."
    },
    {
      question: "What's the maximum file size I can upload?",
      answer: "You can upload PDFs up to 100MB in size. For larger documents, please contact our support team for assistance."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="text-xl font-bold text-blue-600">ChatDoc</div>
              <div className="hidden md:flex space-x-6">
                <a href="#home" className="text-gray-600 hover:text-blue-600 transition-colors">Home</a>
                <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
                <a href="#workflow" className="text-gray-600 hover:text-blue-600 transition-colors">Workflow</a>
                <a href="#use-cases" className="text-gray-600 hover:text-blue-600 transition-colors">Use Cases</a>
                <a href="#faqs" className="text-gray-600 hover:text-blue-600 transition-colors">FAQs</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-gray-600 hover:text-blue-600" asChild>
                <Link to="/signin">Sign In</Link>
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-black to-blue-600 bg-clip-text text-transparent">
              Read Less. Know More.
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
              Skip the boring stuff. Drop a PDF, ask a question, and get straight to the good part — no page-flipping required.
            </p>
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-lg transition-all duration-200 hover:scale-105"
            >
              <Upload className="mr-2 h-5 w-5" />
              Drop PDF
            </Button>
          </div>
          
          {/* Hero Illustration with 3D Animation */}
          <div className="mt-16 relative">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-12 border border-gray-200 animate-[breath_6s_ease-in-out_infinite] hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center justify-center space-x-8">
                <div className="bg-white rounded-lg p-6 border border-gray-300 shadow-sm">
                  <FileText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <p className="text-sm text-gray-600">Your PDF</p>
                </div>
                <div className="hidden md:block">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-6 border border-gray-300 shadow-sm">
                  <MessageCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <p className="text-sm text-gray-600">AI Chat</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to transform how you interact with PDF documents
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white border-gray-200 hover:border-blue-500 transition-all duration-300 hover:scale-105 shadow-sm">
                <CardContent className="p-6">
                  <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-3 text-black">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">How It <span className="text-blue-600">Works</span></h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get answers from your PDFs in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {workflowSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="bg-blue-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-white border-2 border-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold text-blue-600">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-black">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">Who Uses ChatDoc</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Trusted by professionals across industries
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <div 
                key={index} 
                className="group relative bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={useCase.image} 
                    alt={useCase.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 transition-opacity duration-300 group-hover:bg-opacity-60"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-3xl font-bold text-white opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                      {useCase.title}
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3 text-black group-hover:text-blue-600 transition-colors duration-300">
                    {useCase.title}
                  </h3>
                  <p className="text-gray-600">{useCase.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faqs" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about ChatDoc
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden cursor-pointer transition-all duration-300 ease-in-out ${
                  openFaq === index ? 'shadow-xl border-blue-500' : 'hover:shadow-md hover:border-gray-300'
                } ${
                  index >= 2 && openFaq !== null && openFaq < 2 ? 'transform translate-y-4' : ''
                }`}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-black pr-4">{faq.question}</h3>
                    <div className={`transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}>
                      <ChevronDown className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    </div>
                  </div>
                  
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaq === index ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'
                  }`}>
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Content */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            {/* Left Side - Brand */}
            <div className="mb-6 md:mb-0">
              <div className="text-2xl font-bold text-blue-600 mb-2">ChatDoc</div>
              <p className="text-gray-600 text-sm">Built for smart document conversations.</p>
            </div>
            
            {/* Right Side - Navigation Links */}
            <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-600">
              <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
              <span>•</span>
              <a href="#workflow" className="hover:text-blue-600 transition-colors">How It Works</a>
              <span>•</span>
              <a href="#faqs" className="hover:text-blue-600 transition-colors">FAQs</a>
              <span>•</span>
              <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
            </div>
          </div>
          
          {/* Bottom Center - Copyright */}
          <div className="text-center border-t border-gray-200 pt-6">
            <p className="text-gray-500 text-sm">© 2025 ChatDoc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
