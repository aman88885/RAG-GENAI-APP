import React from 'react';
import { FileText } from 'lucide-react';

const Footer = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId.toLowerCase().replace(' ', '-'));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-white border-t border-gray-200 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          {/* Left Side - Brand */}
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="bg-blue-600 p-3 rounded-xl">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-bold">ChatDoc</span>
          </div>

          {/* Right Side - Navigation Links */}
          <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-600">
            <span onClick={() => scrollToSection('features')} className="hover:text-blue-600 transition-colors cursor-pointer">Features</span>
            <span>•</span>
            <span onClick={() => scrollToSection('workflow')} className="cursor-pointer hover:text-blue-600 transition-colors">How It Works</span>
            <span>•</span>
            <span onClick={() => scrollToSection('faq')} className="cursor-pointer hover:text-blue-600 transition-colors">FAQs</span>
            <span>•</span>
            <span onClick={() => scrollToSection('contact')} className="cursor-pointer hover:text-blue-600 transition-colors">Contact</span>
          </div>
        </div>

        {/* Bottom Center - Copyright */}
        <div className="text-center border-t border-gray-200 pt-6">
          <p className="text-gray-500 text-sm">© 2025 ChatDoc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;