const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace the h1 to include an interactive inline chakra
html = html.replace(
    /<h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">[\s\S]*?<\/h1>/,
    `<h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight flex items-center justify-center flex-wrap gap-2 sm:gap-4">
        <span>Happy</span>
        <div id="inline-ashoka-btn" role="button" tabindex="0" aria-label="Surprise" class="inline-block w-10 h-10 sm:w-12 sm:h-12 border-[3px] border-[#000080] dark:border-[#6495ED] rounded-full relative cursor-pointer hover:shadow-[0_0_15px_rgba(0,0,128,0.5)] transition-all animate-[rotate-slow_24s_linear_infinite]" style="background: repeating-conic-gradient(from 0deg, rgba(0, 0, 128, 0.1) 0deg 1deg, transparent 1deg 15deg);">
            <div class="absolute top-1/2 left-1/2 w-2 h-2 bg-[#000080] dark:bg-[#6495ED] rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        <span>Independence Day 🇮🇳</span>
    </h1>`
);

const newJs = `const ashokaBtn = document.getElementById('ashoka-chakra-btn');
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
        }`;

// Update JS to also listen to the inline btn
html = html.replace(
    /const ashokaBtn = document\.getElementById\('ashoka-chakra-btn'\);/,
    newJs
);

html = html.replace(
    /ashokaBtn\.addEventListener\('click', \(\) => \{[\s\S]*?\}\);/,
    `ashokaBtn.addEventListener('click', triggerEasterEgg);`
);

fs.writeFileSync('index.html', html, 'utf8');
console.log("Success chakra patch");
