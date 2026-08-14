        // --- URL Link Preview Logic ---
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const linkPreviewCache = new Map();

        async function fetchUrlPreview(url) {
            if (linkPreviewCache.has(url)) return linkPreviewCache.get(url);
            try {
                const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
                if (!res.ok) throw new Error('Preview fetch failed');
                const data = await res.json();
                linkPreviewCache.set(url, data);
                return data;
            } catch (err) {
                console.warn('Could not fetch link preview for', url, err);
                return null;
            }
        }

        const escapeHtml = (unsafe) => (unsafe || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

        function createPreviewCardHTML(previewData) {
            if (!previewData) return '';
            const { title, description, image, favicon, domain, url } = previewData;
            
            const safeTitle = escapeHtml(title || domain || 'Link');
            const safeDescription = escapeHtml(description);
            const safeImage = escapeHtml(image);
            const safeFavicon = escapeHtml(favicon);
            const safeDomain = escapeHtml(domain || url);
            const safeUrl = escapeHtml(url);

            const imageHtml = safeImage 
                ? `<div class="w-full sm:w-1/3 h-40 sm:h-auto bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0"><img src="${safeImage}" alt="Preview" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"></div>` 
                : '';
            const faviconHtml = safeFavicon
                ? `<img src="${safeFavicon}" class="w-4 h-4 rounded-sm shrink-0" alt="favicon">`
                : `<i data-lucide="link" class="w-4 h-4 shrink-0"></i>`;

            return `
                <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="block mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow bg-slate-50 dark:bg-slate-900/50 group no-underline">
                    <div class="flex flex-col sm:flex-row h-full">
                        ${imageHtml}
                        <div class="p-4 flex flex-col justify-center w-full min-w-0">
                            <div class="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                ${faviconHtml}
                                <span class="uppercase tracking-wide truncate">${safeDomain}</span>
                            </div>
                            <h4 class="text-slate-900 dark:text-white font-bold line-clamp-2 leading-snug mb-1 text-sm sm:text-base">${safeTitle}</h4>
                            ${safeDescription ? `<p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2">${safeDescription}</p>` : ''}
                        </div>
                    </div>
                </a>
            `;
        }

        async function renderTextWithLinkPreviews(text, containerElement) {
            const safeText = escapeHtml(text);
            const urls = Array.from(new Set((text || "").match(urlRegex) || [])).slice(0, 3); // Max 3 unique previews

            const htmlWithLinks = safeText.replace(urlRegex, (url) => 
                `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 dark:text-indigo-400 hover:underline break-all">${url}</a>`
            );
            
            containerElement.innerHTML = htmlWithLinks;

            for (const url of urls) {
                const previewData = await fetchUrlPreview(url);
                if (previewData && (previewData.title || previewData.image)) {
                    containerElement.insertAdjacentHTML('beforeend', createPreviewCardHTML(previewData));
                    lucide.createIcons({ root: containerElement });
                }
