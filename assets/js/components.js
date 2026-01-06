// Component Loader for Bharatvarsh
// This script loads navbar and footer components dynamically

// Configuration
const CONFIG = {
    debug: false, // Set to true to see detailed path fixing logs
    logSummary: true // Set to false to disable summary logs
};

// Add CSS styles for navigation
const navStyles = `
<style>
.nav-link {
    @apply text-gray-700 dark:text-gray-300 hover:text-saffron dark:hover:text-saffron transition-colors font-medium;
}
</style>
`;

// Add styles to head
document.head.insertAdjacentHTML('beforeend', navStyles);

// Function to load HTML components
async function loadComponent(elementId, componentPath) {
    try {
        const isFileProtocol = window.location.protocol === 'file:';

        // Primary: try fetch (works when served over http/https)
        try {
            const response = await fetch(componentPath);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${response.status} - ${response.statusText}`);
            }
            const html = await response.text();
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = html;
            } else {
                throw new Error(`Element with ID '${elementId}' not found in DOM`);
            }
            return;
        } catch (fetchErr) {
            // If running on file://, try a synchronous XHR fallback which works in some browsers
            if (isFileProtocol) {
                try {
                    const xhr = new XMLHttpRequest();
                    xhr.open('GET', componentPath, false); // synchronous on purpose for fallback
                    xhr.send(null);

                    // Note: status === 0 is returned by some browsers for file:// successful reads
                    if (xhr.status === 200 || xhr.status === 0) {
                        const html = xhr.responseText;
                        const element = document.getElementById(elementId);
                        if (element) {
                            element.innerHTML = html;
                            return;
                        } else {
                            throw new Error(`Element with ID '${elementId}' not found in DOM`);
                        }
                    } else {
                        throw new Error(`XHR failed with status ${xhr.status}`);
                    }
                } catch (xhrErr) {
                    throw new Error(`Failed to load component via fallback: ${xhrErr.message || xhrErr}`);
                }
            }
            // Not file protocol or fallback failed - rethrow fetch error
            throw fetchErr;
        }
    } catch (error) {
        console.error(`Error loading component ${elementId} from ${componentPath}:`, error.message);
        throw error; // Re-throw to be handled by caller
    }
}

// Function to fix relative paths based on current page location
function fixComponentPaths() {
    const currentPath = window.location.pathname;
    let basePath = './';
    
    // Determine the base path based on current location
    if (currentPath.includes('/states/') || 
        currentPath.includes('/categories/') || 
        currentPath.includes('/discover/') || 
        currentPath.includes('/regions/') || 
        currentPath.includes('/uts/') || 
        currentPath.includes('/icons/') ||
        currentPath.includes('/spirituality/') ||
        currentPath.includes('/natural/')) {
        basePath = '../';
    }
    
    if (CONFIG.debug) {
        console.log(`Navigation Fix: Current path: ${currentPath}, Base path: ${basePath}`);
    }
    
    // Fix all relative paths in navbar and footer
    const elements = document.querySelectorAll('a[href], img[src], script[src], link[href]');
    let fixedCount = 0;
    const fixedPaths = []; // Store fixed paths for debug mode
    
    elements.forEach(element => {
        const attr = element.tagName.toLowerCase() === 'img' || element.tagName.toLowerCase() === 'script' ? 'src' : 'href';
        const originalPath = element.getAttribute(attr);
        
        // Skip external links, anchors, and component paths
        if (!originalPath || 
            originalPath.startsWith('http') || 
            originalPath.startsWith('#') || 
            originalPath.startsWith('mailto:') ||
            originalPath.startsWith('tel:') ||
            originalPath.startsWith('javascript:') ||
            originalPath.startsWith('data:') ||
            originalPath.startsWith('./components/')) {
            return;
        }
        
        let newPath = null;
        
        // Fix relative paths that start with './'
        if (originalPath.startsWith('./')) {
            newPath = basePath + originalPath.substring(2);
            element.setAttribute(attr, newPath);
            fixedCount++;
            if (CONFIG.debug) {
                fixedPaths.push(`${originalPath} → ${newPath}`);
            }
        }
        // Also handle paths that don't start with './' but are relative (like 'index.html')
        else if (!originalPath.startsWith('/') && !originalPath.includes('://')) {
            newPath = basePath + originalPath;
            element.setAttribute(attr, newPath);
            fixedCount++;
            if (CONFIG.debug) {
                fixedPaths.push(`${originalPath} → ${newPath}`);
            }
        }
    });
    
    // Only log if debug mode is enabled
    if (CONFIG.debug && fixedPaths.length > 0) {
        console.group('Navigation Paths Fixed');
        fixedPaths.forEach(path => console.log(path));
        console.groupEnd();
    }
    
    // Summary log (can be disabled)
    if (CONFIG.logSummary && fixedCount > 0) {
        console.log(`✓ Navigation initialized: Fixed ${fixedCount} paths`);
    }
}

// Load components when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Use setTimeout to ensure DOM is fully ready
    setTimeout(loadComponents, 100);
});

async function loadComponents() {
    const currentPath = window.location.pathname;
    let componentBasePath = './components/';
    
    // Adjust component path based on current location
    if (currentPath.includes('/states/') || 
        currentPath.includes('/categories/') || 
        currentPath.includes('/discover/') || 
        currentPath.includes('/regions/') || 
        currentPath.includes('/uts/') || 
        currentPath.includes('/icons/') ||
        currentPath.includes('/spirituality/') ||
        currentPath.includes('/natural/')) {
        componentBasePath = '../components/';
    }
    
    // Check if placeholders exist
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');
    
    if (!navbarPlaceholder) {
        console.error('navbar-placeholder element not found. Make sure you have <div id="navbar-placeholder"></div> in your HTML.');
        return;
    }
    
    if (!footerPlaceholder) {
        console.error('footer-placeholder element not found. Make sure you have <div id="footer-placeholder"></div> in your HTML.');
        return;
    }
    
    // Check if we're running on file:// protocol
    const isFileProtocol = window.location.protocol === 'file:';
    if (isFileProtocol && CONFIG.debug) {
        console.warn('Running on file:// protocol. Attempting to load components with a fallback; some browsers may still block loading. For best results use a web server.');
    }
    
    // Load navbar and footer
    try {
        await Promise.all([
            loadComponent('navbar-placeholder', componentBasePath + 'navbar.html'),
            loadComponent('footer-placeholder', componentBasePath + 'footer.html')
        ]);
        
        // Fix relative paths after components are loaded
        setTimeout(fixComponentPaths, 100);
        
        // Initialize any JavaScript that depends on the loaded components
        setTimeout(initializeComponentScripts, 200);
        
        if (CONFIG.logSummary) {
            console.log('✓ Components loaded successfully');
        }
        
    } catch (error) {
        console.error('Failed to load components:', error);
        
        // Show error message to user
        navbarPlaceholder.innerHTML = `
            <div style="background: #f8d7da; color: #721c24; padding: 15px; text-align: center; border: 1px solid #f5c6cb;">
                <strong>Component Loading Failed</strong><br>
                Please check the console for details or use a web server.
            </div>
        `;
    }
}

// Initialize scripts that depend on loaded components
function initializeComponentScripts() {
    
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            const isHidden = mobileMenu.classList.contains('hidden');
            
            if (isHidden) {
                mobileMenu.classList.remove('hidden');
                mobileMenu.style.maxHeight = mobileMenu.scrollHeight + 'px';
                mobileMenuToggle.setAttribute('aria-expanded', 'true');
            } else {
                mobileMenu.style.maxHeight = '0px';
                setTimeout(() => {
                    mobileMenu.classList.add('hidden');
                }, 300);
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
    
    // Mobile dropdown toggles
    const mobileDropdownToggles = document.querySelectorAll('.mobile-dropdown-toggle');
    mobileDropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const dropdown = this.closest('.mobile-dropdown');
            const content = dropdown.querySelector('.mobile-dropdown-content');
            const icon = this.querySelector('svg, i');
            
            // Close all other dropdowns
            mobileDropdownToggles.forEach(otherToggle => {
                if (otherToggle !== this) {
                    const otherDropdown = otherToggle.closest('.mobile-dropdown');
                    const otherContent = otherDropdown.querySelector('.mobile-dropdown-content');
                    const otherIcon = otherToggle.querySelector('svg, i');
                    
                    otherContent.classList.add('hidden');
                    if (otherIcon) {
                        otherIcon.style.transform = 'rotate(0deg)';
                    }
                }
            });
            
            // Toggle current dropdown
            if (content.classList.contains('hidden')) {
                content.classList.remove('hidden');
                if (icon) {
                    icon.style.transform = 'rotate(180deg)';
                }
            } else {
                content.classList.add('hidden');
                if (icon) {
                    icon.style.transform = 'rotate(0deg)';
                }
            }
        });
    });
    
    // Search functionality - only initialize if main.js hasn't already done it
    // Wait a bit longer to see if main.js initializes search first
    setTimeout(() => {
        const searchToggle = document.getElementById('searchToggle');
        
        // Check if search toggle already has event listeners (from main.js)
        if (searchToggle && searchToggle._searchInitialized) {
            return; // main.js already initialized search
        }
        
        // Initialize search functionality
        const searchOverlay = document.getElementById('searchOverlay');
        const closeSearch = document.getElementById('closeSearch');
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');
        
        // Open search overlay
        if (searchToggle && searchOverlay) {
            searchToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                searchOverlay.classList.remove('hidden');
                searchOverlay.classList.add('flex');
                if (searchInput) {
                    setTimeout(() => searchInput.focus(), 100);
                }
            });
        }
        
        // Close search overlay
        if (closeSearch) {
            closeSearch.addEventListener('click', closeSearchOverlay);
        }
        
        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && searchOverlay && !searchOverlay.classList.contains('hidden')) {
                closeSearchOverlay();
            }
        });
        
        // Close when clicking outside
        if (searchOverlay) {
            searchOverlay.addEventListener('click', function(e) {
                if (e.target === searchOverlay) {
                    closeSearchOverlay();
                }
            });
        }
        
        function closeSearchOverlay() {
            if (searchOverlay) {
                searchOverlay.classList.add('hidden');
                searchOverlay.classList.remove('flex');
            }
            if (searchInput) searchInput.value = '';
            if (searchResults) searchResults.innerHTML = '';
        }
        
        // Search input handler with debounce
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', function(e) {
                clearTimeout(searchTimeout);
                const query = e.target.value.trim();
                
                if (query.length < 2) {
                    if (searchResults) searchResults.innerHTML = '';
                    return;
                }
                
                searchTimeout = setTimeout(() => {
                    performSearch(query);
                }, 300);
            });
        }
        
        // Perform search function with JSON data
        async function performSearch(query) {
            if (!searchResults) return;
            
            try {
                // Determine base path for JSON files
                const currentPath = window.location.pathname;
                const isInSubfolder = currentPath.includes('/states/') || 
                                     currentPath.includes('/categories/') || 
                                     currentPath.includes('/discover/') || 
                                     currentPath.includes('/regions/') || 
                                     currentPath.includes('/uts/') || 
                                     currentPath.includes('/icons/') ||
                                     currentPath.includes('/spirituality/') ||
                                     currentPath.includes('/natural/');
                
                const basePath = isInSubfolder ? '../' : './';
                
                // Load all JSON data for comprehensive search
                const [categoriesResponse, discoverResponse, updatesResponse] = await Promise.all([
                    fetch(`${basePath}data/categories.json`),
                    fetch(`${basePath}data/discover.json`),
                    fetch(`${basePath}data/updates.json`)
                ]);
                
                const categories = await categoriesResponse.json();
                const discover = await discoverResponse.json();
                const updates = await updatesResponse.json();
                
                // Combine all data for search with proper URL adjustment
                const searchData = [
                    ...categories.map(item => ({ 
                        ...item, 
                        category: 'Category',
                        url: isInSubfolder ? `../${item.url}` : item.url
                    })),
                    ...discover.map(item => ({ 
                        ...item, 
                        category: 'Discover',
                        url: isInSubfolder ? `../${item.url}` : item.url
                    })),
                    ...updates.map(item => ({ 
                        title: item.title, 
                        url: isInSubfolder ? `../${item.link}` : item.link, 
                        category: item.category, 
                        description: item.excerpt 
                    }))
                ];
                
                // Enhanced search with title and description matching
                const results = searchData.filter(item => 
                    item.title.toLowerCase().includes(query.toLowerCase()) ||
                    (item.description && item.description.toLowerCase().includes(query.toLowerCase()))
                );
                
                if (results.length === 0) {
                    searchResults.innerHTML = `
                        <div class="text-center py-8 text-gray-500">
                            <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <p>No results found for "${query}"</p>
                        </div>
                    `;
                    return;
                }
                
                searchResults.innerHTML = results.slice(0, 8).map(result => `
                    <a href="${result.url}" class="block p-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
                        <div class="flex items-center justify-between">
                            <div>
                                <h4 class="font-semibold text-gray-900 dark:text-white">${result.title}</h4>
                                <p class="text-sm text-gray-500 dark:text-gray-400">${result.category}</p>
                                ${result.description ? `<p class="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">${result.description.substring(0, 100)}...</p>` : ''}
                            </div>
                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </div>
                    </a>
                `).join('');
                
            } catch (error) {
                if (CONFIG.debug) {
                    console.error('Error loading search data:', error);
                }
                
                // Fallback to basic search if JSON loading fails
                const sampleData = [
                    { title: 'Geography & People', url: '../categories/geography.html', category: 'Category' },
                    { title: 'Indian Inventions', url: '../discover/inventions.html', category: 'Discover' },
                    { title: 'Constitution of India', url: '../discover/constitution.html', category: 'Discover' },
                    { title: 'Indian Festivals', url: '../discover/festivals.html', category: 'Discover' },
                    { title: 'Kerala - God\'s Own Country', url: '../states/kerala.html', category: 'State' },
                    { title: 'Tamil Nadu - Land of Temples', url: '../states/tamil_nadu.html', category: 'State' },
                    { title: 'Rajasthan - Land of Kings', url: '../states/rajasthan.html', category: 'State' },
                ];
                
                // Adjust URLs based on current path
                const isInSubfolder = window.location.pathname.includes('/states/') || 
                                     window.location.pathname.includes('/categories/') || 
                                     window.location.pathname.includes('/discover/') || 
                                     window.location.pathname.includes('/regions/');
                
                const adjustedData = sampleData.map(item => ({
                    ...item,
                    url: isInSubfolder ? item.url : item.url.replace('../', './')
                }));
                
                const results = adjustedData.filter(item => 
                    item.title.toLowerCase().includes(query.toLowerCase())
                );
                
                searchResults.innerHTML = results.map(result => `
                    <a href="${result.url}" class="block p-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
                        <div class="flex items-center justify-between">
                            <div>
                                <h4 class="font-semibold text-gray-900 dark:text-white">${result.title}</h4>
                                <p class="text-sm text-gray-500 dark:text-gray-400">${result.category}</p>
                            </div>
                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </div>
                    </a>
                `).join('');
            }
        }
    }, 100); // Wait 100ms to let main.js initialize first
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.documentElement.classList.toggle('dark');
            
            // Save theme preference
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
        
        // Load saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        }
    }
}