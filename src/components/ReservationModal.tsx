import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, CheckCircle2 } from 'lucide-react';
import { ReservationDetails } from '../types';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState<ReservationDetails>({
    fullName: '',
    phone: '',
    email: '',
    guests: 2,
    date: new Date().toISOString().split('T')[0],
    timeSlot: '19:30',
    seatingZone: 'Velvet Lounge',
    specialOccasion: '',
    notes: '',
  });

  const [submitted, setSubmitted] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const resetForm = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#1C120F] border border-[#2B1B15] rounded-2xl p-6 sm:p-8 text-[#F4EBDD] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#2B1B15] text-[#F4EBDD]/70 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="font-serif text-2xl text-[#F4EBDD]">Table Reserved</h3>

            <p className="text-xs sm:text-sm text-[#F4EBDD]/70 max-w-sm mx-auto font-light leading-relaxed">
              We look forward to hosting you, <span className="text-[#C6A36B] font-medium">{formData.fullName}</span>. Your reservation for{' '}
              <span className="text-white font-medium">{formData.guests} guests</span> on{' '}
              <span className="text-white font-medium">{formData.date}</span> at{' '}
              <span className="text-white font-medium">{formData.timeSlot}</span> is recorded.
            </p>

            <button
              onClick={resetForm}
              className="mt-4 px-6 py-2 rounded-full text-xs font-sans tracking-wider uppercase bg-[#C76A27] hover:bg-[#E07D34] text-white transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#C6A36B] font-mono block mb-1">
                  Namaste Kalyan • Khadakpada
                </span>
                <span className="text-[10px] text-[#C6A36B] font-mono">
                  +91 93715 19999
                </span>
              </div>
              <h3 className="font-serif text-2xl text-[#F4EBDD]">Reserve a Table</h3>
              <p className="text-xs text-[#F4EBDD]/70 font-light mt-0.5">
                RockMount Residency, Khadakpada Circle, Kalyan (West) · Open till 12:00 AM
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#F4EBDD]/70 uppercase tracking-wider mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Your name"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#2B1B15] border border-transparent focus:border-[#C76A27] text-[#F4EBDD] placeholder-[#F4EBDD]/30 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#F4EBDD]/70 uppercase tracking-wider mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#2B1B15] border border-transparent focus:border-[#C76A27] text-[#F4EBDD] placeholder-[#F4EBDD]/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-[#F4EBDD]/70 uppercase tracking-wider mb-1">
                    Guests *
                  </label>
                  <select
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#2B1B15] border border-transparent focus:border-[#C76A27] text-[#F4EBDD] focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
                      <option key={n} value={n} className="bg-[#1C120F]">
                        {n} {n === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-[#F4EBDD]/70 uppercase tracking-wider mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-[#2B1B15] border border-transparent focus:border-[#C76A27] text-[#F4EBDD] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#F4EBDD]/70 uppercase tracking-wider mb-1">
                    Time *
                  </label>
                  <select
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#2B1B15] border border-transparent focus:border-[#C76A27] text-[#F4EBDD] focus:outline-none"
                  >
                    <option value="12:30">12:30 PM</option>
                    <option value="13:30">01:30 PM</option>
                    <option value="19:30">07:30 PM</option>
                    <option value="20:30">08:30 PM</option>
                    <option value="21:30">09:30 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#F4EBDD]/70 uppercase tracking-wider mb-1">
                  Seating Zone
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      'Velvet Lounge',
                      'Botanical Banquette',
                      'Intimate Arch Booth',
                      'Bar & Cocktail Counter',
                    ] as const
                  ).map((zone) => (
                    <button
                      type="button"
                      key={zone}
                      onClick={() => setFormData({ ...formData, seatingZone: zone })}
                      className={`p-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        formData.seatingZone === zone
                          ? 'bg-[#C76A27] text-white font-medium'
                          : 'bg-[#2B1B15] text-[#F4EBDD]/60 hover:text-white'
                      }`}
                    >
                      {zone}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 border border-[#C6A36B] hover:border-[#F4EBDD] bg-[#18100D] hover:bg-[#F4EBDD] hover:text-[#18100D] text-[#F4EBDD] text-xs font-sans font-medium uppercase tracking-[0.25em] transition-all cursor-pointer"
                >
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
