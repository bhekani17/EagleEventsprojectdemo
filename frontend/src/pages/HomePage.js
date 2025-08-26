
import { Hero } from '../components/Hero';
import { Services } from '../components/Services';
import { About } from '../components/About';
import { Contact } from '../components/Contact';
import { Star, Facebook, Instagram, Globe } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { publicAPI } from '../services/api';

// Inlined Reviews component to reduce component count
function Rating({ value = 5 }) {
  const stars = Array.from({ length: 5 }, (_, i) => i < value);
  return (
    <div className="flex items-center gap-0.5">
      {stars.map((filled, idx) => (
        <Star
          key={idx}
          className={`${filled ? 'text-gold-500 fill-gold-500' : 'text-gray-300'} w-4 h-4`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ name, source, rating = 5, text, date }) {
  const sourceIcon = {
    facebook: <Facebook className="w-4 h-4" />,
    instagram: <Instagram className="w-4 h-4" />,
    website: <Globe className="w-4 h-4" />,
  }[source] || <Globe className="w-4 h-4" />;

  const sourceLabel = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    website: 'Website',
  }[source] || 'Website';

  return (
    <div className="bg-white/5 border border-gray-800 rounded-lg p-4 sm:p-5 hover:border-gold-600/40 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-gray-200 font-semibold">
          <span>{name}</span>
        </div>
        <Rating value={rating} />
      </div>
      <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-3">{text}</p>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-800/60 border border-gray-700">
            {sourceIcon}
            <span>{sourceLabel}</span>
          </span>
        </div>
        {date && <span>{date}</span>}
      </div>
    </div>
  );
}

function Reviews({ onOpenFeedback }) {
  const [isPaused, setIsPaused] = useState(false);
  const scrollerRef = useRef(null);
  const [fetched, setFetched] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await publicAPI.getReviews({ approved: 'true', limit: 20 });
        const payload = res?.data;
        const data = Array.isArray(payload)
          ? payload
          : (Array.isArray(payload?.data) ? payload.data : (Array.isArray(res) ? res : []));
        if (!mounted) return;
        const mapped = data.map((r) => ({
          name: r.name || 'Anonymous',
          source: r.source || 'website',
          rating: Number(r.rating) || 5,
          text: r.comment || '',
          date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : undefined,
        }));
        setFetched(mapped);
      } catch (e) {
        setFetched([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Auto-slide behavior
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const step = 320; // px per slide (approx card width incl. gap)
    const intervalMs = 3000;

    const id = setInterval(() => {
      if (isPaused) return;

      const maxScroll = el.scrollWidth - el.clientWidth;
      const next = el.scrollLeft + step;

      if (next >= maxScroll - 1) {
        el.scrollTo({ left: 0, behavior: 'auto' });
      } else {
        el.scrollTo({ left: next, behavior: 'smooth' });
      }
    }, intervalMs);

    return () => clearInterval(id);
  }, [isPaused]);

  return (
    <section className="bg-gradient-to-b from-black to-gray-900 border-t border-gold-500 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">What Our Clients Say</h2>
        </div>

        {loading ? (
          <div className="text-center text-gray-400">Loading reviews...</div>
        ) : fetched.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-300 mb-4">No reviews yet. Be the first to share your experience!</p>
            <button
              type="button"
              onClick={() => onOpenFeedback && onOpenFeedback()}
              className="px-5 py-2.5 rounded-lg bg-gold-600 hover:bg-gold-500 text-black font-semibold shadow-md transition-colors"
            >
              Leave a Review
            </button>
          </div>
        ) : (
          <div className="relative">
            <div
              ref={scrollerRef}
              className="overflow-x-auto no-scrollbar"
              style={{ WebkitOverflowScrolling: 'touch' }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
            >
              <div className="flex gap-4 sm:gap-5 lg:gap-6 snap-x snap-mandatory px-1">
                {fetched.map((r, i) => (
                  <div key={i} className="flex-none w-72 sm:w-80 lg:w-96 snap-start">
                    <ReviewCard {...r} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CTA under reviews when there are some */}
        {fetched.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => onOpenFeedback && onOpenFeedback()}
              className="px-5 py-2.5 rounded-lg bg-gold-600 hover:bg-gold-500 text-black font-semibold shadow-md transition-colors"
            >
              Leave a Review
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export function HomePage({ onQuoteClick, onOpenFeedback }) {

  return (
    <div>
      <Hero onQuoteClick={onQuoteClick} />
      <Reviews onOpenFeedback={onOpenFeedback} />
      <Services onQuoteClick={onQuoteClick} />
      <About onQuoteClick={onQuoteClick} />
      <Contact onQuoteClick={onQuoteClick} />
    </div>
  );
}
