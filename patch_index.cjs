const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const bookSection = `
    <!-- Aura Learning Official Guide Section -->
    <section class="py-16 sm:py-24 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800/50 relative z-20 transition-colors duration-300">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="bg-slate-50 dark:bg-slate-900/60 rounded-[2.5rem] p-8 sm:p-12 border border-slate-200/50 dark:border-slate-800 shadow-xl dark:shadow-2xl flex flex-col md:flex-row items-center gap-10 md:gap-16 transition-colors duration-300">
                
                <!-- Book Cover (Left on Desktop, Top on Mobile) -->
                <div class="w-full md:w-2/5 max-w-sm flex-shrink-0">
                    <div class="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-900/5 dark:ring-white/10 group">
                        <img 
                            src="https://qxoqflrqpwlythgqmjtq.supabase.co/storage/v1/object/public/covers/Picsart_26-08-13_22-35-51-541.jpg" 
                            alt="Aura Learning Official Guide Version 1.0 book cover" 
                            loading="lazy"
                            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        >
                        <!-- Subtle overlay -->
                        <div class="absolute inset-0 border border-black/5 dark:border-white/5 rounded-2xl pointer-events-none"></div>
                    </div>
                </div>

                <!-- Book Information (Right on Desktop, Bottom on Mobile) -->
                <div class="w-full md:w-3/5 flex flex-col items-center md:items-start text-center md:text-left">
                    <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold tracking-wide uppercase mb-4">
                        <i data-lucide="book-open" class="w-4 h-4"></i> Official Guide
                    </div>
                    
                    <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
                        Aura Learning Official Guide
                    </h2>
                    
                    <div class="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-400 mb-6">
                        <span class="flex items-center gap-1.5"><i data-lucide="user" class="w-4 h-4"></i> Shaan Mohammad</span>
                        <span class="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                        <span class="flex items-center gap-1.5"><i data-lucide="tag" class="w-4 h-4"></i> Version 1.0</span>
                    </div>

                    <p class="text-slate-600 dark:text-slate-400 text-base sm:text-lg mb-8 max-w-2xl leading-relaxed">
                        The official guide to the Aura Learning App, covering its learning experience, books, videos, search, profile, security, announcements, support, privacy, and useful information.
                    </p>

                    <!-- Buttons -->
                    <div class="flex flex-col sm:flex-row w-full sm:w-auto items-center gap-4">
                        <a 
                            href="https://qxoqflrqpwlythgqmjtq.supabase.co/storage/v1/object/public/books/Aura-Learning-Guide.pdf" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            class="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-xl shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 dark:hover:shadow-none hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                            aria-label="Read Book: Aura Learning Official Guide"
                        >
                            <i data-lucide="book-open" class="w-5 h-5"></i>
                            <span>Read Book</span>
                        </a>
                        
                        <a 
                            href="https://qxoqflrqpwlythgqmjtq.supabase.co/storage/v1/object/public/books/Aura-Learning-Guide.pdf" 
                            download="Aura-Learning-Guide.pdf" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            class="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold text-base rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                            aria-label="Download PDF: Aura Learning Official Guide"
                        >
                            <i data-lucide="download" class="w-5 h-5"></i>
                            <span>Download PDF</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>
`;

const insertMarker = "<!-- Features & Showcase Section -->";
if (html.includes(insertMarker)) {
    const newHtml = html.replace(insertMarker, bookSection + "\n    " + insertMarker);
    
    // Also we need to add the proper meta tags for SEO.
    // The request mentions:
    // Title: "Aura Learning Official Guide – Version 1.0 | Aura Learning"
    // Meta description: "Read and download the Aura Learning Official Guide Version 1.0 by Shaan Mohammad. Learn about the Aura Learning App, books, videos, search, profile, security, support, privacy, and more."
    // However, this is the main index.html. If we change the global title, the whole app landing page title changes.
    // Is that what the user wants?
    // "Make the new book page/indexable by search engines. Use: Title: ... Meta description: ... Use a proper H1: 'Aura Learning Official Guide'"
    
    fs.writeFileSync('index.html', newHtml, 'utf8');
    console.log("Success patch");
} else {
    console.log("Marker not found");
}
