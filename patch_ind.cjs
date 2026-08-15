const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const css = `
<!-- Independence Day Experience -->
<style>
/* Independence Day Styles */
.ind-day-hero {
    background: linear-gradient(135deg, rgba(255, 153, 51, 0.08) 0%, rgba(255, 255, 255, 0) 50%, rgba(19, 136, 8, 0.08) 100%);
    position: relative;
    overflow: hidden;
}
.dark .ind-day-hero {
    background: linear-gradient(135deg, rgba(255, 153, 51, 0.04) 0%, rgba(15, 23, 42, 0) 50%, rgba(19, 136, 8, 0.04) 100%);
}
.ashoka-chakra {
    width: 140px;
    height: 140px;
    border: 5px solid rgba(0, 0, 128, 0.15);
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: rotate-slow 24s linear infinite;
    pointer-events: auto;
    cursor: pointer;
    z-index: 0;
    transition: all 0.3s ease;
}
.dark .ashoka-chakra {
    border-color: rgba(100, 149, 237, 0.1);
}
.ashoka-chakra:hover {
    border-color: rgba(0, 0, 128, 0.3);
    box-shadow: 0 0 30px rgba(0, 0, 128, 0.1);
}
.dark .ashoka-chakra:hover {
    border-color: rgba(100, 149, 237, 0.3);
    box-shadow: 0 0 30px rgba(100, 149, 237, 0.1);
}
.ashoka-chakra::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    transform: translate(-50%, -50%);
    background: repeating-conic-gradient(from 0deg, rgba(0, 0, 128, 0.1) 0deg 1deg, transparent 1deg 15deg);
    border-radius: 50%;
}
.dark .ashoka-chakra::before {
    background: repeating-conic-gradient(from 0deg, rgba(100, 149, 237, 0.1) 0deg 1deg, transparent 1deg 15deg);
}
.ashoka-chakra-center {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 16px;
    height: 16px;
    background: rgba(0, 0, 128, 0.15);
    border-radius: 50%;
    transform: translate(-50%, -50%);
}
.dark .ashoka-chakra-center {
    background: rgba(100, 149, 237, 0.1);
}
@keyframes rotate-slow {
    100% { transform: translate(-50%, -50%) rotate(360deg); }
}
@media (prefers-reduced-motion: reduce) {
    .ashoka-chakra { animation: none; }
    .confetti-particle { animation: none !important; }
}

.ind-day-glow {
    position: absolute;
    inset: 0;
    box-shadow: inset 0 0 80px rgba(255, 153, 51, 0.1), inset 0 0 80px rgba(19, 136, 8, 0.1);
    pointer-events: none;
    z-index: 1;
}

.ind-day-popup {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.4s ease;
}
.ind-day-popup.active {
    opacity: 1;
    pointer-events: auto;
}
.ind-day-popup-content {
    background: white;
    border-radius: 1.5rem;
    padding: 2rem;
    max-width: 24rem;
    width: 90%;
    text-align: center;
    transform: scale(0.95) translateY(20px);
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    border-top: 5px solid #FF9933;
    border-bottom: 5px solid #138808;
    position: relative;
    overflow: hidden;
}
.dark .ind-day-popup-content {
    background: #1e293b;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
}
.ind-day-popup.active .ind-day-popup-content {
    transform: scale(1) translateY(0);
}
.confetti-container {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9998;
    overflow: hidden;
}
.confetti-particle {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    animation: fall linear forwards;
    opacity: 0.8;
}
@keyframes fall {
    0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
    10% { opacity: 1; }
    100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
}

.easter-egg-toast {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    padding: 1rem 1.5rem;
    border-radius: 9999px;
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
    border: 1px solid rgba(255, 153, 51, 0.3);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    opacity: 0;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.dark .easter-egg-toast {
    background: rgba(30, 41, 59, 0.95);
    border-color: rgba(255, 153, 51, 0.2);
}
.easter-egg-toast.show {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
}

#ind-day-hero, #ind-day-special {
    display: none;
}
</style>
`;

if (!html.includes('<!-- Independence Day Experience -->')) {
    html = html.replace('</head>', css + '\n</head>');
}

const sections = `
    <!-- Independence Day Hero -->
    <section id="ind-day-hero" class="ind-day-hero py-16 sm:py-24 border-b border-slate-100 dark:border-slate-800/50">
        <div class="ind-day-glow"></div>
        <div class="ashoka-chakra" id="ashoka-chakra-btn" title="Click for a surprise!" role="button" tabindex="0" aria-label="Ashoka Chakra Easter Egg">
            <div class="ashoka-chakra-center"></div>
        </div>
        
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-orange-200/50 dark:border-orange-900/30 text-orange-700 dark:text-orange-300 text-xs sm:text-sm font-bold tracking-wide mb-6 shadow-sm">
                <span class="w-2 h-2 rounded-full bg-[#FF9933]"></span>
                <span class="w-2 h-2 rounded-full bg-white border border-slate-300 dark:border-slate-600"></span>
                <span class="w-2 h-2 rounded-full bg-[#138808]"></span>
                <span class="ml-1">Jai Hind • Learn • Grow • Inspire</span>
            </div>
            
            <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
                Happy Independence Day <span class="inline-block animate-bounce" style="animation-duration: 2s;">🇮🇳</span>
            </h1>
            
            <p class="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto font-medium">
                Celebrating the spirit of freedom, knowledge and a brighter India.
            </p>
            
            <div id="ind-countdown-container" class="mb-10 flex justify-center gap-2 sm:gap-4 text-center">
                <!-- Countdown -->
            </div>
            
            <button onclick="document.getElementById('ind-day-special').scrollIntoView({behavior: 'smooth'})" class="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#FF9933] via-[#000080] to-[#138808] text-white font-bold text-base sm:text-lg rounded-xl shadow-[0_10px_20px_-10px_rgba(0,0,128,0.5)] hover:shadow-[0_15px_25px_-10px_rgba(0,0,128,0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#000080] dark:focus:ring-offset-slate-900">
                Explore Independence Day Special
            </button>
        </div>
    </section>

    <!-- Independence Day Special Section -->
    <section id="ind-day-special" class="py-20 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
                    Independence Day Special 🇮🇳
                </h2>
                <p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    Explore knowledge about India's freedom, history and journey as a nation.
                </p>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                <!-- Category Cards -->
                <div class="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                    <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">
                        🇮🇳
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Freedom Movement</h3>
                    <p class="text-slate-600 dark:text-slate-400 text-sm mb-4">Books and videos about India's independence movement and important events.</p>
                </div>
                
                <div class="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                    <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">
                        🕊️
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Freedom Fighters</h3>
                    <p class="text-slate-600 dark:text-slate-400 text-sm mb-4">Educational content about important personalities who contributed to freedom.</p>
                </div>
                
                <div class="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                    <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">
                        📜
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Indian Constitution</h3>
                    <p class="text-slate-600 dark:text-slate-400 text-sm mb-4">Learn about the Constitution of India, democracy and citizens' rights.</p>
                </div>
                
                <div class="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                    <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">
                        🏛️
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Indian History</h3>
                    <p class="text-slate-600 dark:text-slate-400 text-sm mb-4">Educational books and videos about India's history and cultural journey.</p>
                </div>
            </div>
            
            <div id="ind-content-container" class="mt-8 text-center min-h-[200px] flex items-center justify-center">
                <div class="w-8 h-8 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
            </div>
        </div>
    </section>
`;

if (!html.includes('id="ind-day-hero"')) {
    html = html.replace('<div id="homepage-content">', '<div id="homepage-content">\n' + sections);
}

const popups = `
<!-- Independence Day Popup & Overlays -->
<div id="ind-day-popup" class="ind-day-popup" role="dialog" aria-modal="true" aria-labelledby="ind-popup-title">
    <div class="ind-day-popup-content dark:text-white">
        <div class="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]"></div>
        <button id="close-ind-popup" class="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors" aria-label="Close">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <div class="w-16 h-16 mx-auto mb-4 bg-orange-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center border border-orange-100 dark:border-slate-700 shadow-sm">
            <span class="text-3xl">🇮🇳</span>
        </div>
        <h2 id="ind-popup-title" class="text-2xl font-bold mb-3 text-slate-900 dark:text-white tracking-tight">Celebrating the Spirit of Freedom</h2>
        <p class="text-slate-600 dark:text-slate-300 mb-6 text-sm sm:text-base leading-relaxed">
            This Independence Day, let's celebrate freedom through knowledge, learning and inspiration.<br><br>
            <strong class="text-slate-900 dark:text-white text-lg font-bold">Happy Independence Day! 🇮🇳</strong>
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center w-full px-2">
            <button id="explore-ind-btn" class="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors active:scale-95">
                Explore Special
            </button>
            <button id="dismiss-ind-btn" class="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors active:scale-95">
                Close
            </button>
        </div>
    </div>
</div>

<div id="confetti-container" class="confetti-container"></div>

<div id="easter-egg-toast" class="easter-egg-toast">
    <span class="text-2xl">✨</span>
    <div class="text-left">
        <p class="font-bold text-slate-900 dark:text-white m-0 leading-tight">🇮🇳 Jai Hind!</p>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 m-0">Freedom • Knowledge • Unity</p>
    </div>
</div>
`;

if (!html.includes('id="ind-day-popup"')) {
    html = html.replace('</body>', popups + '\n</body>');
}

const js = `
<script>
// Independence Day Logic
document.addEventListener('DOMContentLoaded', () => {
    try {
        const getISTDate = () => {
            const now = new Date();
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            return new Date(utc + (3600000 * 5.5));
        };

        const istNow = getISTDate();
        const campaignStart = new Date('2026-08-10T00:00:00+05:30');
        const campaignEnd = new Date('2026-08-16T00:00:00+05:30');
        const independenceDay = new Date('2026-08-15T00:00:00+05:30');
        
        const isCampaignActive = istNow >= campaignStart && istNow < campaignEnd;
        const isIndependenceDay = istNow >= independenceDay && istNow < campaignEnd;

        const heroSection = document.getElementById('ind-day-hero');
        const specialSection = document.getElementById('ind-day-special');

        if (!isCampaignActive) {
            if(heroSection) heroSection.remove();
            if(specialSection) specialSection.remove();
            return;
        }

        // Show sections
        if(heroSection) heroSection.style.display = 'block';
        if(specialSection) specialSection.style.display = 'block';

        // Countdown Logic
        const countdownContainer = document.getElementById('ind-countdown-container');
        let countdownInterval;
        
        function updateCountdown() {
            if(!countdownContainer) return;
            const now = getISTDate();
            if (now >= independenceDay) {
                countdownContainer.innerHTML = \`<div class="text-xl sm:text-2xl font-extrabold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-8 py-4 rounded-2xl border border-green-200 dark:border-green-800/50 shadow-sm animate-pulse flex items-center justify-center gap-2">🇮🇳 Happy Independence Day — Jai Hind!</div>\`;
                if(countdownInterval) clearInterval(countdownInterval);
                return;
            }

            const diff = independenceDay - now;
            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / 1000 / 60) % 60);
            const s = Math.floor((diff / 1000) % 60);

            const timeBox = (val, label, colorClass) => \`
                <div class="flex flex-col items-center justify-center p-2 sm:p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 min-w-[60px] sm:min-w-[80px] shadow-sm">
                    <span class="text-2xl sm:text-3xl font-extrabold \${colorClass}">\${val}</span>
                    <span class="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider">\${label}</span>
                </div>
            \`;

            countdownContainer.innerHTML = \`
                \${timeBox(d, 'Days', 'text-[#FF9933]')}
                <div class="flex flex-col justify-center text-xl sm:text-2xl font-bold text-slate-400/50">:</div>
                \${timeBox(h.toString().padStart(2, '0'), 'Hours', 'text-slate-800 dark:text-slate-200')}
                <div class="flex flex-col justify-center text-xl sm:text-2xl font-bold text-slate-400/50">:</div>
                \${timeBox(m.toString().padStart(2, '0'), 'Mins', 'text-slate-800 dark:text-slate-200')}
                <div class="flex flex-col justify-center text-xl sm:text-2xl font-bold text-slate-400/50">:</div>
                \${timeBox(s.toString().padStart(2, '0'), 'Secs', 'text-[#138808]')}
            \`;
        }

        updateCountdown();
        if (istNow < independenceDay) {
            countdownInterval = setInterval(updateCountdown, 1000);
        }

        // Confetti Logic
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        function createConfetti(amount = 40, duration = 3000) {
            if (prefersReducedMotion) return;
            const container = document.getElementById('confetti-container');
            if(!container) return;
            
            const colors = ['#FF9933', '#FFFFFF', '#138808'];
            
            for (let i = 0; i < amount; i++) {
                const particle = document.createElement('div');
                particle.className = 'confetti-particle';
                particle.style.background = colors[Math.floor(Math.random() * colors.length)];
                particle.style.left = Math.random() * 100 + 'vw';
                particle.style.top = -20 + 'px';
                
                const size = Math.random() * 6 + 4;
                particle.style.width = size + 'px';
                particle.style.height = size + 'px';
                
                const animDuration = Math.random() * 3 + 2;
                const delay = Math.random() * 1;
                
                particle.style.animation = \`fall \${animDuration}s \${delay}s linear forwards\`;
                container.appendChild(particle);
            }
            
            setTimeout(() => { container.innerHTML = ''; }, duration + 4000);
        }

        // Initial Confetti on load
        setTimeout(() => createConfetti(60, 4000), 800);

        // Popup Logic
        const popup = document.getElementById('ind-day-popup');
        const closeBtn = document.getElementById('close-ind-popup');
        const dismissBtn = document.getElementById('dismiss-ind-btn');
        const exploreBtn = document.getElementById('explore-ind-btn');
        
        const popupKey = 'indDayPopupShown_2026';
        if (!localStorage.getItem(popupKey) && popup) {
            setTimeout(() => {
                popup.classList.add('active');
            }, 2000);
        }

        const closePopup = () => {
            if(popup) popup.classList.remove('active');
            localStorage.setItem(popupKey, 'true');
        };

        closeBtn?.addEventListener('click', closePopup);
        dismissBtn?.addEventListener('click', closePopup);
        
        exploreBtn?.addEventListener('click', () => {
            closePopup();
            setTimeout(() => {
                const specialSec = document.getElementById('ind-day-special');
                if(specialSec) specialSec.scrollIntoView({behavior: 'smooth'});
            }, 300);
        });

        // Easter Egg Logic
        const ashokaBtn = document.getElementById('ashoka-chakra-btn');
        const toast = document.getElementById('easter-egg-toast');
        
        if (ashokaBtn && isIndependenceDay) {
            ashokaBtn.addEventListener('click', () => {
                createConfetti(100, 4000);
                
                if(heroSection) {
                    const originalBg = heroSection.style.background;
                    heroSection.style.background = 'radial-gradient(circle, rgba(0,0,128,0.1) 0%, transparent 70%)';
                    setTimeout(() => { heroSection.style.background = originalBg; }, 1000);
                }
                
                if(toast) {
                    toast.classList.add('show');
                    setTimeout(() => { toast.classList.remove('show'); }, 4000);
                }
            });
            
            ashokaBtn.addEventListener('keydown', (e) => {
                if(e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    ashokaBtn.click();
                }
            });
        } else if (ashokaBtn) {
            ashokaBtn.style.cursor = 'default';
            ashokaBtn.removeAttribute('tabindex');
        }

        // Fetch Supabase Content
        async function loadContent() {
            const container = document.getElementById('ind-content-container');
            if(!container || !window.supabase) return;
            
            try {
                // We use the existing SUPABASE_URL and SUPABASE_ANON_KEY defined earlier in index.html
                // Since this runs on DOMContentLoaded, they should be available. 
                // Wait, they are inside another DOMContentLoaded block. Let's redefine them safely.
                const supabaseUrl = 'https://qxoqflrqpwlythgqmjtq.supabase.co';
                const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4b3FmbHJxcHdseXRoZ3FtanRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxODIxMTQsImV4cCI6MjA5Nzc1ODExNH0.cJ3hIsEyRtH1m_nmyzwjrdvzsbGIKIiChnmXAjgFRfo';
                const sb = window.supabase.createClient(supabaseUrl, supabaseKey);

                const { data: books } = await sb.from('books')
                    .select('id, title, thumbnail, slug')
                    .or('title.ilike.*india*,title.ilike.*freedom*,title.ilike.*history*,title.ilike.*constitution*')
                    .limit(4);
                    
                const { data: videos } = await sb.from('videos')
                    .select('id, title, videoUrl')
                    .or('title.ilike.*india*,title.ilike.*freedom*,title.ilike.*history*,title.ilike.*constitution*,title.ilike.*bharat*')
                    .limit(4);

                let html = '';
                let hasContent = false;
                
                if (books && books.length > 0) {
                    hasContent = true;
                    html += '<div class="mb-10 text-left"><h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><span class="text-indigo-600 dark:text-indigo-400">📚</span> Books Collection</h3><div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">';
                    books.forEach(b => {
                        const link = '/book/' + (b.slug || b.id);
                        const cover = b.thumbnail || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&q=80';
                        html += \`
                        <a href="\${link}" class="group block">
                            <div class="aspect-[3/4] rounded-xl overflow-hidden shadow-sm hover:shadow-lg mb-3 border border-slate-200 dark:border-slate-800 relative bg-slate-100 dark:bg-slate-800 transition-all">
                                <img src="\${cover}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="\${b.title.replace(/"/g, '')}" loading="lazy">
                            </div>
                            <h4 class="font-bold text-slate-900 dark:text-white line-clamp-2 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">\${b.title}</h4>
                        </a>\`;
                    });
                    html += '</div></div>';
                }
                
                if (videos && videos.length > 0) {
                    hasContent = true;
                    html += '<div class="text-left"><h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><span class="text-indigo-600 dark:text-indigo-400">▶️</span> Videos Collection</h3><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">';
                    videos.forEach(v => {
                        const link = '/video/' + v.id;
                        let thumb = 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&q=80';
                        const ytm = v.videoUrl ? v.videoUrl.match(/[?&]v=([^&]+)/) : null;
                        const ytId = ytm ? ytm[1] : (v.videoUrl && v.videoUrl.includes('youtu.be/') ? v.videoUrl.split('youtu.be/')[1].split('?')[0] : null);
                        if (ytId) thumb = \`https://img.youtube.com/vi/\${ytId}/maxresdefault.jpg\`;
                        
                        html += \`
                        <a href="\${link}" class="group block">
                            <div class="aspect-video rounded-xl overflow-hidden shadow-sm hover:shadow-lg mb-3 border border-slate-200 dark:border-slate-800 relative bg-slate-100 dark:bg-slate-800 transition-all">
                                <img src="\${thumb}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="\${v.title.replace(/"/g, '')}" loading="lazy">
                                <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                    <div class="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <svg class="w-4 h-4 text-slate-900 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    </div>
                                </div>
                            </div>
                            <h4 class="font-bold text-slate-900 dark:text-white line-clamp-2 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">\${v.title}</h4>
                        </a>\`;
                    });
                    html += '</div></div>';
                }
                
                if (hasContent) {
                    container.innerHTML = html;
                } else {
                    container.innerHTML = \`
                        <div class="inline-block p-8 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-sm max-w-lg mx-auto w-full">
                            <div class="w-16 h-16 mx-auto bg-orange-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-5 border border-orange-100 dark:border-slate-600">
                                <span class="text-3xl">🇮🇳</span>
                            </div>
                            <h4 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Coming Soon</h4>
                            <p class="text-slate-600 dark:text-slate-400">Independence Day learning content is coming soon to our library. Check back later!</p>
                        </div>
                    \`;
                }
            } catch(e) {
                console.error("Failed to load ind day content", e);
                container.innerHTML = '';
            }
        }
        
        loadContent();

    } catch(err) {
        console.error("Independence day script error", err);
    }
});
</script>
`;

if (!html.includes('// Independence Day Logic')) {
    html = html.replace('</body>', js + '\n</body>');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log("Success ind day patch");
