/**
 * Performance Optimization Script for Bharatvarsh
 * Implements lazy loading, intersection observer, and other performance enhancements
 */

// Lazy loading for images
document.addEventListener('DOMContentLoaded', function() {
    // Add lazy loading to images that don't already have it
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
        img.setAttribute('loading', 'lazy');
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements with fade-in class
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));

    // Preload critical resources
    const criticalResources = [
        './assets/css/styles.css',
        './assets/js/main.js'
    ];

    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.endsWith('.css') ? 'style' : 'script';
        document.head.appendChild(link);
    });

    // Service Worker registration removed to avoid serving stale cached content.
    // If you need offline caching again, re-add registration and `sw.js`.
});

// Optimize font loading
document.addEventListener('DOMContentLoaded', function() {
    // Add font-display: swap to Google Fonts
    const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
    fontLinks.forEach(link => {
        if (!link.href.includes('display=swap')) {
            link.href += link.href.includes('?') ? '&display=swap' : '?display=swap';
        }
    });
});

// Critical CSS inlining helper
function inlineCriticalCSS() {
    const criticalCSS = `
        /* Critical above-the-fold styles */
        .hero { min-height: 60vh; }
        .nav { position: fixed; top: 0; width: 100%; z-index: 50; }
        .btn-primary { background: var(--saffron); color: white; padding: 0.75rem 1.5rem; }
    `;
    
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.insertBefore(style, document.head.firstChild);
}

// Performance monitoring
function measurePerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                const metrics = {
                    'DNS Lookup': perfData.domainLookupEnd - perfData.domainLookupStart,
                    'TCP Connection': perfData.connectEnd - perfData.connectStart,
                    'Request': perfData.responseStart - perfData.requestStart,
                    'Response': perfData.responseEnd - perfData.responseStart,
                    'DOM Processing': perfData.domComplete - perfData.domLoading,
                    'Total Load Time': perfData.loadEventEnd - perfData.navigationStart
                };
                
                console.log('Performance Metrics:', metrics);
            }, 0);
        });
    }
}

// Initialize performance monitoring
measurePerformance();

// Global image fallback: replace broken images with local logo
function installImageFallbacks() {
    document.addEventListener('DOMContentLoaded', () => {
        const imgs = document.querySelectorAll('img');
        imgs.forEach(img => {
            img.addEventListener('error', () => {
                try {
                    if (img.dataset._fallbacked) return;
                    img.dataset._fallbacked = '1';
                    img.src = './assets/img/logo/logo.png';
                    img.classList.add('img-fallback');
                } catch (e) {
                    // ignore
                }
            });
        });
    });
}

installImageFallbacks();