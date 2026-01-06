// ================================
// Bharatvarsh - MAIN JAVASCRIPT
// ================================

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  initThemeToggle();
  initMobileMenu();
  initMobileDropdowns();
  initSearch();
  initScrollAnimations();
  initNavbarScroll();
});

// ================================
// THEME TOGGLE (Dark/Light Mode)
// ================================
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  
  // Get theme from localStorage or system preference
  const getTheme = () => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  
  // Apply theme to document
  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  // Initialize theme (always apply, even without toggle button)
  applyTheme(getTheme());
  
  // Toggle theme on button click (only if button exists)
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.contains('dark');
      const newTheme = isDark ? 'light' : 'dark';
      
      applyTheme(newTheme);
      localStorage.setItem('theme', newTheme);
      
      // Optional: Add animation
      document.body.style.transition = 'background-color 0.3s ease';
    });
  }
}

// ================================
// MOBILE MENU TOGGLE
// ================================
function initMobileMenu() {
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  
  // Only initialize if elements exist
  if (!mobileMenuToggle || !mobileMenu) {
    return; // Elements don't exist, likely component-based page
  }
  
  mobileMenuToggle.addEventListener('click', () => {
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

// ================================
// MOBILE DROPDOWN MENUS
// ================================
function initMobileDropdowns() {
  const dropdowns = document.querySelectorAll('.mobile-dropdown');
  
  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.mobile-dropdown-toggle');
    const content = dropdown.querySelector('.mobile-dropdown-content');
    const icon = toggle.querySelector('svg');
    
    if (toggle && content) {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const isHidden = content.classList.contains('hidden');
        
        // Close all other dropdowns
        dropdowns.forEach(otherDropdown => {
          if (otherDropdown !== dropdown) {
            const otherContent = otherDropdown.querySelector('.mobile-dropdown-content');
            const otherIcon = otherDropdown.querySelector('.mobile-dropdown-toggle svg');
            otherContent.classList.add('hidden');
            if (otherIcon) {
              otherIcon.style.transform = 'rotate(0deg)';
            }
          }
        });
        
        // Toggle current dropdown
        if (isHidden) {
          content.classList.remove('hidden');
          icon.style.transform = 'rotate(180deg)';
        } else {
          content.classList.add('hidden');
          icon.style.transform = 'rotate(0deg)';
        }
      });
    }
  });
}

// ================================
// SEARCH FUNCTIONALITY
// ================================
function initSearch() {
  const searchToggle = document.getElementById('searchToggle');
  const searchOverlay = document.getElementById('searchOverlay');
  const closeSearch = document.getElementById('closeSearch');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  
  // Only initialize if elements exist (for pages without components)
  if (!searchToggle || !searchOverlay) {
    return; // Elements don't exist, likely component-based page
  }
  
  // Open search overlay
  if (searchToggle && searchOverlay) {
    searchToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      searchOverlay.classList.remove('hidden');
      searchOverlay.classList.add('flex');
      if (searchInput) {
        setTimeout(() => searchInput.focus(), 100);
      }
    });
    
    // Mark that search has been initialized by main.js
    searchToggle._searchInitialized = true;
  }
  
  // Close search overlay
  if (closeSearch) {
    closeSearch.addEventListener('click', closeSearchOverlay);
  }
  
  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchOverlay && !searchOverlay.classList.contains('hidden')) {
      closeSearchOverlay();
    }
  });
  
  // Close when clicking outside
  if (searchOverlay) {
    searchOverlay.addEventListener('click', (e) => {
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
  if (searchInput && searchResults) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim();
      
      if (query.length < 2) {
        searchResults.innerHTML = '';
        return;
      }
      
      searchTimeout = setTimeout(() => {
        performSearch(query);
      }, 300);
    });
  }
}

// Perform search (enhanced with JSON data)
async function performSearch(query) {
  const searchResults = document.getElementById('searchResults');
  
  // Guard clause - return if searchResults doesn't exist
  if (!searchResults) return;
  
  try {
    // Load all JSON data for comprehensive search
    const [categoriesResponse, discoverResponse, updatesResponse] = await Promise.all([
      fetch('./data/categories.json'),
      fetch('./data/discover.json'),
      fetch('./data/updates.json')
    ]);
    
    const categories = await categoriesResponse.json();
    const discover = await discoverResponse.json();
    const updates = await updatesResponse.json();
    
    // Combine all data for search
    const searchData = [
      ...categories.map(item => ({ ...item, category: 'Category' })),
      ...discover.map(item => ({ ...item, category: 'Discover' })),
      ...updates.map(item => ({ title: item.title, url: item.link, category: item.category, description: item.excerpt }))
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
      <a href="${result.url || result.link}" class="block p-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
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
    console.error('Error loading search data:', error);
    
    // Fallback to basic search if JSON loading fails
    const sampleData = [
      { title: 'Geography & People', url: 'categories/geography.html', category: 'Category' },
      { title: 'Indian Inventions', url: 'discover/inventions.html', category: 'Discover' },
      { title: 'Constitution of India', url: 'discover/constitution.html', category: 'Discover' },
      { title: 'Indian Festivals', url: 'discover/festivals.html', category: 'Discover' },
    ];
    
    const results = sampleData.filter(item => 
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

// ================================
// SCROLL ANIMATIONS
// ================================
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);
  
  // Observe all elements with fade-in class
  document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
  });
}

// ================================
// NAVBAR SCROLL EFFECT
// ================================
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return; // Guard clause to prevent null access
  
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Add shadow when scrolled
    if (currentScroll > 10) {
      navbar.classList.add('shadow-lg');
    } else {
      navbar.classList.remove('shadow-lg');
    }
    
    lastScroll = currentScroll;
  });
}

// ================================
// LOAD DYNAMIC UPDATES (for homepage)
// ================================
async function loadUpdates() {
  try {
    const response = await fetch('./data/updates.json');
    const updates = await response.json();
    
    const container = document.getElementById('updatesContainer');
    if (!container) return;
    
    container.innerHTML = updates.slice(0, 3).map(update => `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition">
        <div class="text-sm text-gray-500 dark:text-gray-400 mb-2">${update.date}</div>
        <h3 class="font-heading text-xl font-semibold mb-2">${update.title}</h3>
        <p class="text-gray-600 dark:text-gray-300 mb-4">${update.excerpt}</p>
        <a href="${update.link}" class="text-saffron hover:text-orange-600 font-medium">Read more →</a>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading updates:', error);
  }
}

// ================================
// UTILITY FUNCTIONS
// ================================

// Smooth scroll to element
function smoothScrollTo(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Format date
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-IN', options);
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ================================
// EXPORT FUNCTIONS (for use in other scripts)
// ================================
window.Bharatvarsh = {
  smoothScrollTo,
  formatDate,
  loadUpdates
};