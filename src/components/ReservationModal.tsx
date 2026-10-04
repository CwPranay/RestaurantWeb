import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, CheckCircle2, MessageSquare, Phone, ArrowUpRight, Sparkles } from 'lucide-react';
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
  const [lastWhatsappUrl, setLastWhatsappUrl] = useState<string>('');

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

  const buildWhatsAppMessage = () => {
    // Format human readable date
    let formattedDate = formData.date;
    try {
      const dateObj = new Date(formData.date + 'T12:00:00');
      formattedDate = dateObj.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      formattedDate = formData.date;
    }

    // Format 12-hour time
    const [h, m] = formData.timeSlot.split(':');
    const hourNum = parseInt(h, 10);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 || 12;
    const formattedTime = `${hour12}:${m} ${ampm}`;

    const occasionLine = formData.specialOccasion
      ? `\n• *Occasion:* ${formData.specialOccasion}`
      : '';
    const notesLine = formData.notes ? `\n• *Special Notes:* ${formData.notes}` : '';

    return (
      `*TABLE RESERVATION REQUEST — NAMASTE KALYAN*\n\n` +
      `Hello Namaste Kalyan, I would like to reserve a table for *${formData.guests} ${
        formData.guests === 1 ? 'guest' : 'guests'
      }* on *${formattedDate}* at *${formattedTime}* in the *${formData.seatingZone}*.\n\n` +
      `• *Guest Name:* ${formData.fullName}\n` +
      `• *Contact Phone:* ${formData.phone}` +
      occasionLine +
      notesLine +
      `\n\nPlease confirm table availability. Thank you!`
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawMessage = buildWhatsAppMessage();
    const url = `https://wa.me/919371519999?text=${encodeURIComponent(rawMessage)}`;
    setLastWhatsappUrl(url);

    // Open WhatsApp
    window.open(url, '_blank', 'noopener,noreferrer');
    setSubmitted(true);
  };

  const resetForm = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#1C120F] border border-[#C6A36B]/30 rounded-2xl p-6 sm:p-8 text-[#F4EBDD] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Luxury Corner Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#C6A36B]/15 via-transparent to-transparent pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#2B1B15] text-[#F4EBDD]/70 hover:text-white transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-6 sm:py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-950/70 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#C6A36B] block">
                Forwarded to Host Desk
              </span>
              <h3 className="font-serif text-2xl text-[#F4EBDD]">Reservation Sent via WhatsApp</h3>
            </div>

            <p className="text-xs sm:text-sm text-[#F4EBDD]/80 max-w-sm mx-auto font-light leading-relaxed">
              We look forward to hosting you{formData.fullName ? <>, <span className="text-[#C6A36B] font-medium">{formData.fullName}</span></> : ''}. Your reservation request for{' '}
              <span className="text-white font-medium">{formData.guests} {formData.guests === 1 ? 'guest' : 'guests'}</span> in the <span className="text-[#C6A36B]">{formData.seatingZone}</span> has been forwarded directly to the Namaste Kalyan host team on WhatsApp (+91 93715 19999).
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {lastWhatsappUrl && (
                <a
                  href={lastWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-sans tracking-wider uppercase bg-[#25D366] hover:bg-[#20ba59] text-black font-semibold transition-all inline-flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Open WhatsApp Again</span>
                </a>
              )}

              <a
                href="tel:+919371519999"
                className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-sans tracking-wider uppercase bg-[#2B1B15] hover:bg-[#38241D] text-[#C6A36B] border border-[#C6A36B]/40 transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Host Desk</span>
              </a>
            </div>

            <button
              onClick={resetForm}
              className="mt-4 text-xs font-mono tracking-widest text-[#F4EBDD]/50 hover:text-white uppercase transition-colors cursor-pointer"
            >
              Close Window
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-5">
              <div className="flex items-center justify-between pr-8">
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#C6A36B] font-mono block">
                  Namaste Kalyan • Khadakpada
                </span>
                <span className="text-[10px] text-[#C6A36B] font-mono">
                  +91 93715 19999
                </span>
              </div>
              <h3 className="font-serif text-2xl text-[#F4EBDD] mt-1">Reserve a Table</h3>
              <p className="text-xs text-[#F4EBDD]/70 font-light mt-0.5">
                RockMount Residency, Khadakpada Circle, Kalyan (West) · Open till 12:00 AM
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#F4EBDD]/70 uppercase tracking-wider mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#2B1B15] border border-transparent focus:border-[#C6A36B] text-[#F4EBDD] placeholder-[#F4EBDD]/30 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#F4EBDD]/70 uppercase tracking-wider mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#2B1B15] border border-transparent focus:border-[#C6A36B] text-[#F4EBDD] placeholder-[#F4EBDD]/30 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                <div>
                  <label className="block text-[11px] text-[#F4EBDD]/70 uppercase tracking-wider mb-1">
                    Guests *
                  </label>
                  <select
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: Number(e.target.value) })}
                    className="w-full px-2.5 sm:px-3 py-2 rounded-xl bg-[#2B1B15] border border-transparent focus:border-[#C6A36B] text-[#F4EBDD] focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20].map((n) => (
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
                    className="w-full px-2 sm:px-2.5 py-2 rounded-xl bg-[#2B1B15] border border-transparent focus:border-[#C6A36B] text-[#F4EBDD] focus:outline-none text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#F4EBDD]/70 uppercase tracking-wider mb-1">
                    Time *
                  </label>
                  <select
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    className="w-full px-2 sm:px-3 py-2 rounded-xl bg-[#2B1B15] border border-transparent focus:border-[#C6A36B] text-[#F4EBDD] focus:outline-none"
                  >
                    <option value="12:30">12:30 PM (Lunch)</option>
                    <option value="13:30">01:30 PM (Lunch)</option>
                    <option value="14:30">02:30 PM (Lunch)</option>
                    <option value="19:30">07:30 PM (Dinner)</option>
                    <option value="20:00">08:00 PM (Dinner)</option>
                    <option value="20:30">08:30 PM (Dinner)</option>
                    <option value="21:30">09:30 PM (Dinner)</option>
                    <option value="22:30">10:30 PM (Late Night)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#F4EBDD]/70 uppercase tracking-wider mb-1">
                  Preferred Seating Zone
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
                          ? 'bg-[#C6A36B] text-[#120B09] font-medium shadow-sm'
                          : 'bg-[#2B1B15] text-[#F4EBDD]/70 hover:text-white'
                      }`}
                    >
                      {zone}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#F4EBDD]/70 uppercase tracking-wider mb-1">
                  Special Occasion (Optional)
                </label>
                <input
                  type="text"
                  value={formData.specialOccasion || ''}
                  onChange={(e) => setFormData({ ...formData, specialOccasion: e.target.value })}
                  placeholder="e.g. Birthday, Anniversary, Family Celebration"
                  className="w-full px-3.5 py-1.5 rounded-xl bg-[#2B1B15] border border-transparent focus:border-[#C6A36B] text-[#F4EBDD] placeholder-[#F4EBDD]/30 focus:outline-none transition-colors text-xs"
                />
              </div>

              {/* Instant WhatsApp Guarantee Badge */}
              <div className="p-2.5 rounded-xl bg-[#120B09]/90 border border-[#25D366]/30 flex items-center gap-2 text-[11px] text-[#F4EBDD]/90">
                <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse shrink-0" />
                <span>
                  Instant 1-tap confirmation with Host Desk on WhatsApp (+91 93715 19999).
                </span>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#25D366] hover:bg-[#20ba59] text-black font-sans font-semibold text-xs uppercase tracking-[0.2em] transition-all cursor-pointer shadow-[0_4px_16px_rgba(37,211,102,0.3)] hover:shadow-[0_6px_22px_rgba(37,211,102,0.45)] flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 fill-black" />
                  <span>Confirm via WhatsApp ↗</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
