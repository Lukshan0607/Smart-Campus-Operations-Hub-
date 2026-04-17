import React from 'react';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiLinkedin, FiGithub, FiInstagram, FiYoutube } from 'react-icons/fi';

const Footer = () => {
  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Documentation', href: '#docs' },
      { name: 'API Reference', href: '#api' }
    ],
    company: [
      { name: 'About Us', href: '#about' },
      { name: 'Contact', href: '#contact' },
      { name: 'Careers', href: '#careers' },
      { name: 'Blog', href: '#blog' }
    ],
    support: [
      { name: 'Help Center', href: '#help' },
      { name: 'Community', href: '#community' },
      { name: 'Status', href: '#status' },
      { name: 'Terms of Service', href: '#terms' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Cookie Policy', href: '#cookies' },
      { name: 'GDPR', href: '#gdpr' },
      { name: 'Security', href: '#security' }
    ]
  };

  const socialLinks = [
    { icon: FiFacebook, href: '#facebook', label: 'Facebook' },
    { icon: FiTwitter, href: '#twitter', label: 'Twitter' },
    { icon: FiLinkedin, href: '#linkedin', label: 'LinkedIn' },
    { icon: FiGithub, href: '#github', label: 'GitHub' },
    { icon: FiInstagram, href: '#instagram', label: 'Instagram' },
    { icon: FiYoutube, href: '#youtube', label: 'YouTube' }
  ];

  const contactInfo = [
    { icon: FiMail, text: 'support@smartuni.edu', href: 'mailto:support@smartuni.edu' },
    { icon: FiPhone, text: '+94 11 234 5678', href: 'tel:+94112345678' },
    { icon: FiMapPin, text: 'SLIIT, New Kandy Road, Malabe', href: '#location' }
  ];

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/20 to-purple-500/20" />
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Newsletter Section */}
      <div className="relative border-b border-white/10">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Stay Connected</h3>
            <p className="text-blue-200 mb-6 max-w-2xl mx-auto">
              Get the latest updates on SmartUni Hub features, campus resources, and system improvements
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
              <button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                SmartUni Hub
              </span>
            </div>
            
            <p className="text-blue-200 mb-8 max-w-md leading-relaxed">
              Empowering campus operations through intelligent resource management, 
              streamlined booking systems, and efficient maintenance tracking.
            </p>

            {/* Contact Information */}
            <div className="space-y-3 mb-8">
              {contactInfo.map((contact, index) => (
                <a
                  key={index}
                  href={contact.href}
                  className="flex items-center text-blue-200 hover:text-white transition-all duration-200 group"
                >
                  <div className="w-8 h-8 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-500/20 transition-colors duration-200">
                    <contact.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm">{contact.text}</span>
                </a>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-white/10 backdrop-blur hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 rounded-xl flex items-center justify-center transition-all duration-200 transform hover:scale-110 hover:shadow-lg"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </h3>
              <ul className="space-y-3">
                {links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-blue-200 hover:text-white text-sm transition-all duration-200 hover:translate-x-1 inline-block"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-blue-200 text-sm mb-4 md:mb-0">
              © 2026 SmartUni Hub. All rights reserved. Built with 
              <span className="text-red-400 mx-1">❤️</span> 
              for SLIIT.
            </div>
            
            <div className="flex space-x-6">
              {footerLinks.legal.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-blue-200 hover:text-white text-sm transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
