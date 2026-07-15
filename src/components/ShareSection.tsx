import { FaWhatsapp, FaFacebookF, FaTwitter, FaTelegramPlane, FaInstagram, FaYoutube, FaLink, FaShareAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react';

export function ShareSection({ onShowToast }: { onShowToast: (msg: string) => void }) {
  const [canShare, setCanShare] = useState(false);
  
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      setCanShare(true);
    }
  }, []);

  const shareUrl = "https://aura.auralearning.workers.dev";
  const shareText = "Check out Aura Learning and spread the calm! 🧘‍♂️✨";
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: 'Aura Learning',
        text: shareText,
        url: shareUrl
      });
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    onShowToast('Link copied to clipboard!');
  };

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: <FaWhatsapp size={20} />,
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      colorHover: 'hover:text-green-500 hover:border-green-100',
    },
    {
      name: 'Facebook',
      icon: <FaFacebookF size={20} />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      colorHover: 'hover:text-blue-600 hover:border-blue-100',
    },
    {
      name: 'Twitter',
      icon: <FaTwitter size={20} />,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      colorHover: 'hover:text-sky-500 hover:border-sky-100',
    },
    {
      name: 'Telegram',
      icon: <FaTelegramPlane size={20} />,
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      colorHover: 'hover:text-blue-500 hover:border-blue-100',
    }
  ];

  return (
    <div className="pt-8 flex flex-col items-center space-y-4">
      <p className="text-sm text-slate-400 font-medium tracking-wide uppercase">Spread the calm</p>
      
      <div className="flex flex-wrap justify-center gap-4">
        {canShare && (
          <button
            onClick={handleNativeShare}
            className="md:hidden w-12 h-12 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-teal-600 hover:border-teal-100 hover:shadow-md transition-all"
            aria-label="Share options"
            title="Share"
          >
            <FaShareAlt size={18} />
          </button>
        )}

        {socialLinks.map((social) => (
          <a
            key={social.name}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-12 h-12 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 ${social.colorHover} hover:shadow-md transition-all ${canShare ? 'hidden md:flex' : 'flex'}`}
            aria-label={`Share on ${social.name}`}
            title={`Share on ${social.name}`}
          >
            {social.icon}
          </a>
        ))}

        <button
          onClick={() => { handleCopyLink(); onShowToast('Instagram selected: Link copied to clipboard!'); }}
          className={`w-12 h-12 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-pink-600 hover:border-pink-100 hover:shadow-md transition-all ${canShare ? 'hidden md:flex' : 'flex'}`}
          aria-label="Share on Instagram"
          title="Copy Link for Instagram"
        >
          <FaInstagram size={20} />
        </button>
        <button
          onClick={() => { handleCopyLink(); onShowToast('YouTube selected: Link copied to clipboard!'); }}
          className={`w-12 h-12 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-100 hover:shadow-md transition-all ${canShare ? 'hidden md:flex' : 'flex'}`}
          aria-label="Share on YouTube"
          title="Copy Link for YouTube"
        >
          <FaYoutube size={20} />
        </button>

        <button
          onClick={() => handleCopyLink()}
          className={`w-12 h-12 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 hover:shadow-md transition-all ${canShare ? 'hidden md:flex' : 'flex'}`}
          aria-label="Copy Link"
          title="Copy Link"
        >
          <FaLink size={18} />
        </button>
      </div>
    </div>
  );
}
