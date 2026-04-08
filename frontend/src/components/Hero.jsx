import React, { useState, useEffect } from 'react';
import { FiBookOpen, FiCalendar, FiTool, FiBell, FiArrowRight, FiCheckCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import heroStudents from '../assets/hero-students.jpg';
import heroCampus from '../assets/hero-campus.jpg';
import heroLibrary from '../assets/hero-library.jpg';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: heroStudents,
      title: 'Smart Campus',
      subtitle: 'Operations Hub',
      description: 'Streamline your campus experience with our comprehensive platform for resource booking, maintenance management, and real-time notifications.',
      alt: 'SmartUni Campus Students'
    },
    {
      image: heroCampus,
      title: 'Modern Facilities',
      subtitle: 'Smart Management',
      description: 'Access state-of-the-art campus resources with intelligent booking systems and seamless maintenance tracking.',
      alt: 'SmartUni Campus Facilities'
    },
    {
      image: heroLibrary,
      title: 'Digital Learning',
      subtitle: 'Connected Campus',
      description: 'Experience the future of campus operations with integrated resource management and real-time collaboration tools.',
      alt: 'SmartUni Digital Library'
    }
  ];

  // Auto-rotate slides every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };
  const features = [
    {
      icon: FiBookOpen,
      title: 'Resource Booking',
      description: 'Book lecture halls, labs, and equipment with ease',
      color: 'text-blue-600'
    },
    {
      icon: FiCalendar,
      title: 'Smart Scheduling',
      description: 'Conflict-free booking system with real-time availability',
      color: 'text-green-600'
    },
    {
      icon: FiTool,
      title: 'Maintenance Tickets',
      description: 'Report and track maintenance requests efficiently',
      color: 'text-orange-600'
    },
    {
      icon: FiBell,
      title: 'Instant Notifications',
      description: 'Stay updated with booking and ticket status changes',
      color: 'text-purple-600'
    }
  ];

  const stats = [
    { number: '500+', label: 'Resources Available' },
    { number: '10,000+', label: 'Bookings Managed' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Support' }
  ];

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      {/* Hero Carousel Section */}
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-indigo-900/60" />
            
            {/* Overlay Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  <span className="block">{slide.title}</span>
                  <span className="block text-blue-300">{slide.subtitle}</span>
                </h1>
                <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                  {slide.description}
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center justify-center">
                    Get Started
                    <FiArrowRight className="ml-2" />
                  </button>
                  <button className="bg-white/20 backdrop-blur hover:bg-white/30 text-white px-8 py-3 rounded-lg font-medium border border-white/30 transition-all duration-200 flex items-center justify-center">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200"
          aria-label="Previous slide"
        >
          <FiChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200"
          aria-label="Next slide"
        >
          <FiChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Background Pattern for lower section */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className={`w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Trusted by Students & Faculty
            </h3>
            <p className="text-gray-600">
              Join thousands of users who rely on SmartUni Hub for their campus operations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <FiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Secure OAuth Authentication</span>
            </div>
            <div className="flex items-center space-x-3">
              <FiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Real-time Availability</span>
            </div>
            <div className="flex items-center space-x-3">
              <FiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Mobile Responsive Design</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
