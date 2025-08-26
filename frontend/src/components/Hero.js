import { Button } from './ui/button';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import { useEffect, useState, useCallback, useMemo } from 'react';

// Inlined ImageCarousel to reduce component count
function ImageCarousel({ slides, onQuoteClick, autoPlay = false, interval = 5000 }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentInnerIndex, setCurrentInnerIndex] = useState(0);
  const slidesLength = useMemo(() => slides?.length || 0, [slides]);

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % slidesLength);
  }, [slidesLength]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  // Auto-play with pause on hover
  useEffect(() => {
    if (!autoPlay || isPaused || !slidesLength) return;

    const timer = setInterval(() => {
      nextSlide();
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, isPaused, nextSlide, slidesLength]);

  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Reset inner image index when changing slides
  useEffect(() => {
    setCurrentInnerIndex(0);
  }, [currentSlide]);

  // Auto-rotate inner images for the active slide if it has multiple images
  useEffect(() => {
    if (!autoPlay || isPaused || !slidesLength) return;
    const activeSlide = slides[currentSlide];
    const innerLen = (activeSlide?.images?.length || 0);
    if (innerLen <= 1) return;

    const innerTimer = setInterval(() => {
      setCurrentInnerIndex(prev => (prev + 1) % innerLen);
    }, Math.max(2000, Math.floor(interval / 2)));

    return () => clearInterval(innerTimer);
  }, [autoPlay, isPaused, slides, slidesLength, currentSlide, interval]);

  if (!slides || slides.length === 0) {
    return (
      <div 
        className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
        role="alert"
        aria-label="No slides available"
      >
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-full overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      role="region"
      aria-label="Image carousel"
      aria-roledescription="carousel"
      aria-live={isPaused ? 'off' : 'polite'}
    >
      {/* Slides - Crossfade */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id || index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-out will-change-[opacity] ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {(() => {
              const images = (slide?.images && slide.images.length > 0)
                ? slide.images
                : (slide?.image ? [slide.image] : []);
              const imgSrc = images.length
                ? images[index === currentSlide ? (currentInnerIndex % images.length) : 0]
                : '/images/placeholder.jpg';
              return (
                <LazyLoadImage
                  src={imgSrc}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                  effect="opacity"
                  width="100%"
                  height="100%"
                  loading="lazy"
                  placeholderSrc="/images/placeholder.jpg"
                />
              );
            })()}
            {/* Dark overlay for contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
            {/* Slide content */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="text-center text-white max-w-4xl px-4">
                {slide.subtitle && (
                  <h2 className="text-xs sm:text-sm uppercase tracking-wide mb-1 sm:mb-2 opacity-90">
                    {slide.subtitle}
                  </h2>
                )}
                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-4 leading-tight">
                  {slide.title}
                </h1>
                {slide.description && (
                  <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto text-white line-clamp-2 md:line-clamp-3">
                    {slide.description}
                  </p>
                )}
                <Button
                  onClick={onQuoteClick}
                  size="lg"
                  className="bg-gold-600 hover:bg-gold-700 text-black font-semibold px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-sm sm:text-base"
                  aria-label={slide.ctaText || 'Get a quote'}
                >
                  {slide.ctaText || 'Get Started'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div 
          className="absolute bottom-2 sm:bottom-2.5 left-1/2 transform -translate-x-1/2 flex space-x-0.5 sm:space-x-1"
          role="tablist"
          aria-label="Slide navigation"
        >
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-0.1 h-0.1 sm:w-1 sm:h-1 md:w-1 md:h-1 rounded-full transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-white/0 ${
                index === currentSlide
                  ? 'bg-white'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              role="tab"
              aria-selected={index === currentSlide}
              aria-label={`Slide ${index + 1} of ${slides.length}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Hero({ onQuoteClick }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const heroSlides = [
    {
      id: 'VIP MOBILE TOILETS',
      image: '/images/t1.jpg',
      images: ['/images/t1.jpg', '/images/t4.jpg', '/images/t6.webp'],
      title: 'VIP Mobile Toilets',
      subtitle: 'Complete Event Solutions',
      description: 'Premium VIP mobile toilets with luxury amenities. Clean, hygienic, and comfortable facilities for your special events.',
      ctaText: 'Hire now'
    },
    {
      id: 'TENTS',
      image: '/images/s5.webp',
      images: ['/images/s5.webp', '/images/t4.jpg'],
      title: 'TENTS',
      subtitle: 'Perfect Hospitality Solutions',
      description: 'High-quality tents and marquees for all weather protection. Perfect for weddings, parties, and corporate events.',
      ctaText: 'Hire now'
    },
    {
      id: 'MOBILE FACILITIES',
      image: '/images/t6.webp',
      images: ['/images/t6.webp', '/images/t1.jpg'],
      title: 'Mobile Facilities',
      subtitle: 'Professional Event Services',
      description: 'Complete mobile facility solutions including generators, lighting, and power. Everything you need for successful events.',
      ctaText: 'Hire now'
    },
    {
      id: 'SLAUGHTERING SERVICES',
      image: '/images/sla.jpg',
      images: ['/images/sla.jpg', '/images/t4.jpg'],
      title: 'Slaughtering Services',
      subtitle: 'Professional & Hygienic',
      description: 'Professional mobile slaughtering services that bring expert meat processing to your location. Fully compliant with health standards.',
      ctaText: 'Hire now'
    }
  ];

  return (
    <section className="relative pt-16 sm:pt-20">
      {/* Main Hero Carousel with Info Overlay */}
      <div className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] xl:h-[800px]">
        <ImageCarousel 
          slides={heroSlides}
          onQuoteClick={onQuoteClick}
          autoPlay={true}
          interval={6000}
        />
        
        {/* Logo Overlay with Animation */}
        <div 
          className={`absolute top-4 sm:top-8 md:top-12 lg:top-16 left-1/2 transform -translate-x-1/2 z-30 transition-all duration-1000 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
          }`}
        >
          <LazyLoadImage
            src="/images/logo.png"
            alt="Eagles Events Logo"
            className="h-24 sm:h-32 md:h-40 lg:h-40 w-auto drop-shadow-2xl hover:scale-105 transition-transform duration-500 ease-in-out"
            effect="opacity"
            loading="eager"
            height="auto"
            width="auto"
          />
        </div>
      </div>

      

      {/* CTA Section with Fade-in Animation */}
      <div className="bg-black py-12 sm:py-16 border-t border-gold-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 
            className={`text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 transition-all duration-1000 ease-out delay-800 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Ready to Make Your Event Unforgettable?
          </h2>
          <p 
            className={`text-lg sm:text-xl text-gold-300 mb-6 sm:mb-8 transition-all duration-1000 ease-out delay-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Get a personalized Quotation for your event needs. Our team is ready to help you create the perfect experience.
          </p>
          <div 
            className={`transition-all duration-1000 ease-out delay-1200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <Button 
              onClick={onQuoteClick}
              size="lg"
              className="bg-gold-600 hover:bg-gold-700 text-black font-semibold px-6 sm:px-8 py-3 text-base sm:text-lg w-full sm:w-auto transform hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out"
            >
              Get Your Quotation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
