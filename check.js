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
                countdownContainer.innerHTML = `<div class="text-xl sm:text-2xl font-extrabold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-8 py-4 rounded-2xl border border-green-200 dark:border-green-800/50 shadow-sm animate-pulse flex items-center justify-center gap-2">🇮🇳 Happy Independence Day — Jai Hind!</div>`;
                if(countdownInterval) clearInterval(countdownInterval);
                return;
            }

            const diff = independenceDay - now;
            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / 1000 / 60) % 60);
            const s = Math.floor((diff / 1000) % 60);

            const timeBox = (val, label, colorClass) => `
                <div class="flex flex-col items-center justify-center p-2 sm:p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 min-w-[60px] sm:min-w-[80px] shadow-sm">
                    <span class="text-2xl sm:text-3xl font-extrabold ${colorClass}">${val}</span>
                    <span class="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider">${label}</span>
                </div>
            `;

            countdownContainer.innerHTML = `
                ${timeBox(d, 'Days', 'text-[#FF9933]')}
                <div class="flex flex-col justify-center text-xl sm:text-2xl font-bold text-slate-400/50">:</div>
                ${timeBox(h.toString().padStart(2, '0'), 'Hours', 'text-slate-800 dark:text-slate-200')}
                <div class="flex flex-col justify-center text-xl sm:text-2xl font-bold text-slate-400/50">:</div>
                ${timeBox(m.toString().padStart(2, '0'), 'Mins', 'text-slate-800 dark:text-slate-200')}
                <div class="flex flex-col justify-center text-xl sm:text-2xl font-bold text-slate-400/50">:</div>
                ${timeBox(s.toString().padStart(2, '0'), 'Secs', 'text-[#138808]')}
            `;
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
                
                particle.style.animation = `fall ${animDuration}s ${delay}s linear forwards`;
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
        const inlineAshokaBtn = document.getElementById('inline-ashoka-btn');
        const triggerEasterEgg = () => {
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
        };
        
        if (inlineAshokaBtn && isIndependenceDay) {
            inlineAshokaBtn.addEventListener('click', triggerEasterEgg);
            inlineAshokaBtn.addEventListener('keydown', (e) => {
                if(e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    triggerEasterEgg();
                }
            });
        }
        const toast = document.getElementById('easter-egg-toast');
        
        if (ashokaBtn && isIndependenceDay) {
            ashokaBtn.addEventListener('click', triggerEasterEgg);
            
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
                        html += `
                        <a href="${link}" class="group block">
                            <div class="aspect-[3/4] rounded-xl overflow-hidden shadow-sm hover:shadow-lg mb-3 border border-slate-200 dark:border-slate-800 relative bg-slate-100 dark:bg-slate-800 transition-all">
                                <img src="${cover}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="${b.title.replace(/"/g, '')}" loading="lazy">
                            </div>
                            <h4 class="font-bold text-slate-900 dark:text-white line-clamp-2 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">${b.title}</h4>
                        </a>`;
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
                        if (ytId) thumb = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
                        
                        html += `
                        <a href="${link}" class="group block">
                            <div class="aspect-video rounded-xl overflow-hidden shadow-sm hover:shadow-lg mb-3 border border-slate-200 dark:border-slate-800 relative bg-slate-100 dark:bg-slate-800 transition-all">
                                <img src="${thumb}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="${v.title.replace(/"/g, '')}" loading="lazy">
                                <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                    <div class="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <svg class="w-4 h-4 text-slate-900 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    </div>
                                </div>
                            </div>
                            <h4 class="font-bold text-slate-900 dark:text-white line-clamp-2 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">${v.title}</h4>
                        </a>`;
                    });
                    html += '</div></div>';
                }
                
                if (hasContent) {
                    container.innerHTML = html;
                } else {
                    container.innerHTML = `
                        <div class="inline-block p-8 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-sm max-w-lg mx-auto w-full">
                            <div class="w-16 h-16 mx-auto bg-orange-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-5 border border-orange-100 dark:border-slate-600">
                                <span class="text-3xl">🇮🇳</span>
                            </div>
                            <h4 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Coming Soon</h4>
                            <p class="text-slate-600 dark:text-slate-400">Independence Day learning content is coming soon to our library. Check back later!</p>
                        </div>
                    `;
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
