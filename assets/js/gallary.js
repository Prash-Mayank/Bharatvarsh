// gallary.js - Photo Gallery Filtering System

/**
 * Initialize gallery filter functionality
 */
function initializeGallery() {
  const filterButtons = document.querySelectorAll('.gallery-filter');
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  if (filterButtons.length === 0 || galleryItems.length === 0) {
    console.log('Gallery elements not found on this page');
    return;
  }
  
  // Add click handlers to filter buttons
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      const category = this.dataset.category;
      
      // Update active button state
      updateActiveButton(this, filterButtons);
      
      // Filter gallery items
      filterGalleryItems(category, galleryItems);
    });
  });
  
  // Add hover effects to gallery items
  addGalleryItemEffects(galleryItems);
  
  console.log('Gallery initialized with', galleryItems.length, 'items');
}

/**
 * Update active state of filter buttons
 */
function updateActiveButton(activeBtn, allButtons) {
  allButtons.forEach(btn => {
    // Remove active classes
    btn.classList.remove('active', 'bg-saffron', 'text-white');
    
    // Add inactive classes
    btn.classList.add('bg-gray-200', 'dark:bg-gray-800', 'text-gray-700', 'dark:text-gray-300');
  });
  
  // Add active classes to clicked button
  activeBtn.classList.remove('bg-gray-200', 'dark:bg-gray-800', 'text-gray-700', 'dark:text-gray-300');
  activeBtn.classList.add('active', 'bg-saffron', 'text-white');
}

/**
 * Filter gallery items based on category
 */
function filterGalleryItems(category, items) {
  let visibleCount = 0;
  
  items.forEach(item => {
    const itemCategories = item.dataset.category.split(' ');
    
    // Show if 'all' or category matches
    const shouldShow = category === 'all' || itemCategories.includes(category);
    
    if (shouldShow) {
      // Show item with animation
      item.style.display = 'block';
      
      // Trigger reflow for animation
      void item.offsetWidth;
      
      item.style.opacity = '0';
      item.style.transform = 'scale(0.9)';
      
      setTimeout(() => {
        item.style.transition = 'all 0.3s ease';
        item.style.opacity = '1';
        item.style.transform = 'scale(1)';
      }, visibleCount * 50); // Stagger animation
      
      visibleCount++;
    } else {
      // Hide item with animation
      item.style.transition = 'all 0.2s ease';
      item.style.opacity = '0';
      item.style.transform = 'scale(0.9)';
      
      setTimeout(() => {
        item.style.display = 'none';
      }, 200);
    }
  });
  
  // Update visible count display if exists
  updateGalleryCount(visibleCount, items.length);
}

/**
 * Add interactive effects to gallery items
 */
function addGalleryItemEffects(items) {
  items.forEach(item => {
    // Add click handler for full view
    item.addEventListener('click', function() {
      const img = this.querySelector('img');
      const title = this.querySelector('h3')?.textContent || 'Image';
      
      openLightbox(img.src, img.alt || title, title);
    });
    
    // Add keyboard accessibility
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', 'View image details');
    
    item.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });
}

/**
 * Open lightbox for full image view
 */
function openLightbox(imageSrc, imageAlt, imageTitle) {
  // Create lightbox overlay
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox-overlay fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in';
  lightbox.style.cursor = 'zoom-out';
  
  lightbox.innerHTML = `
    <div class="lightbox-content max-w-7xl w-full relative" onclick="event.stopPropagation()">
      <!-- Close Button -->
      <button class="lightbox-close absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white transition-all" 
              aria-label="Close lightbox">
        <i class="fas fa-times text-xl"></i>
      </button>
      
      <!-- Image Container -->
      <div class="relative bg-white/5 backdrop-blur rounded-xl overflow-hidden shadow-2xl">
        <img src="${imageSrc}" 
             alt="${imageAlt}" 
             class="w-full h-auto max-h-[80vh] object-contain"
             loading="lazy">
        
        <!-- Image Caption -->
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <h3 class="text-white font-bold text-xl mb-1">${imageTitle}</h3>
          <p class="text-gray-200 text-sm">${imageAlt}</p>
        </div>
      </div>
      
      <!-- Navigation Hint -->
      <div class="text-center mt-4 text-white/60 text-sm">
        <span>Click anywhere or press ESC to close</span>
      </div>
    </div>
  `;
  
  // Add to document
  document.body.appendChild(lightbox);
  document.body.style.overflow = 'hidden';
  
  // Close handlers
  const closeLightbox = () => {
    lightbox.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(lightbox);
      document.body.style.overflow = '';
    }, 200);
  };
  
  lightbox.addEventListener('click', closeLightbox);
  
  const closeBtn = lightbox.querySelector('.lightbox-close');
  closeBtn.addEventListener('click', closeLightbox);
  
  // Keyboard close
  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
      document.removeEventListener('keydown', handleKeyPress);
    }
  };
  document.addEventListener('keydown', handleKeyPress);
}

/**
 * Update gallery count display
 */
function updateGalleryCount(visible, total) {
  const countDisplay = document.getElementById('gallery-count');
  if (countDisplay) {
    countDisplay.textContent = `Showing ${visible} of ${total} photos`;
  }
}

/**
 * Add CSS for animations if not present
 */
function addGalleryStyles() {
  if (!document.getElementById('gallery-styles')) {
    const style = document.createElement('style');
    style.id = 'gallery-styles';
    style.textContent = `
      .animate-fade-in {
        animation: fadeIn 0.3s ease-in;
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      
      .gallery-item {
        transition: all 0.3s ease;
        cursor: pointer;
      }
      
      .gallery-item:hover {
        transform: translateY(-4px);
      }
      
      .gallery-item:focus {
        outline: 2px solid #FF8C00;
        outline-offset: 4px;
      }
      
      .lightbox-overlay {
        animation: fadeIn 0.2s ease-in;
      }
      
      .lightbox-content {
        animation: scaleIn 0.3s ease-out;
      }
      
      @keyframes scaleIn {
        from {
          transform: scale(0.9);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    addGalleryStyles();
    initializeGallery();
  });
} else {
  addGalleryStyles();
  initializeGallery();
}

// Export functions for global access
window.initializeGallery = initializeGallery;
window.openLightbox = openLightbox;

function showLoadingState() {
  const gallery = document.querySelector('.gallery-grid');
  if (gallery) {
    gallery.style.opacity = '0.5';
    gallery.style.pointerEvents = 'none';
  }
}

function hideLoadingState() {
  const gallery = document.querySelector('.gallery-grid');
  if (gallery) {
    setTimeout(() => {
      gallery.style.opacity = '1';
      gallery.style.pointerEvents = 'auto';
    }, 300);
  }
}