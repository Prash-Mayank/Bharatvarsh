// Contact Page JavaScript
// Bharatvarsha - Contact Form and Map Functionality

// Form progress tracking
function updateFormProgress() {
    const requiredFields = ['name', 'email', 'subject', 'message'];
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    let completedFields = 0;
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && field.value.trim() !== '') {
            completedFields++;
        }
    });

    const progress = (completedFields / requiredFields.length) * 100;
    progressBar.style.width = progress + '%';
    progressText.textContent = completedFields + '/' + requiredFields.length + ' fields completed';

    // Update progress bar color based on completion
    if (progress === 100) {
        progressBar.classList.remove('bg-saffron');
        progressBar.classList.add('bg-green-500');
    } else {
        progressBar.classList.remove('bg-green-500');
        progressBar.classList.add('bg-saffron');
    }
}

// Real-time validation
function validateField(field) {
    const errorElement = document.getElementById(field.id + 'Error');
    let isValid = true;
    let errorMessage = '';

    switch (field.id) {
        case 'name':
            if (field.value.trim() === '') {
                isValid = false;
                errorMessage = 'Please enter your full name';
            }
            break;
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (field.value.trim() === '') {
                isValid = false;
                errorMessage = 'Please enter your email address';
            } else if (!emailRegex.test(field.value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
            break;
        case 'subject':
            if (field.value === '') {
                isValid = false;
                errorMessage = 'Please select a subject';
            }
            break;
        case 'message':
            if (field.value.trim() === '') {
                isValid = false;
                errorMessage = 'Please enter your message';
            } else if (field.value.trim().length < 10) {
                isValid = false;
                errorMessage = 'Please enter at least 10 characters';
            }
            break;
    }

    if (!isValid) {
        errorElement.textContent = errorMessage;
        errorElement.classList.remove('hidden');
        field.classList.add('border-red-500');
        field.classList.remove('border-gray-300', 'dark:border-gray-600');
    } else {
        errorElement.classList.add('hidden');
        field.classList.remove('border-red-500');
        field.classList.add('border-gray-300', 'dark:border-gray-600');
    }

    return isValid;
}

// Contact form handler with Netlify support
document.getElementById('contactForm').addEventListener('submit', function (e) {
    // Validate all fields before submission
    const requiredFields = ['name', 'email', 'subject', 'message'];
    let allValid = true;

    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!validateField(field)) {
            allValid = false;
        }
    });

    if (!allValid) {
        e.preventDefault();
        return false;
    }

    // Let Netlify handle the form submission
    const formMessage = document.getElementById('formMessage');
    const submitButton = document.getElementById('submitBtn');
    const buttonText = submitButton.querySelector('span');

    // Show loading state
    submitButton.disabled = true;
    buttonText.textContent = 'Sending...';

    // Note: Netlify will handle the actual form submission
    // This is just for user feedback during the process
    setTimeout(() => {
        formMessage.classList.remove('hidden');
        formMessage.className = 'mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800 rounded-lg';
        formMessage.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Thank you for your message! We will get back to you within 24 hours.';

        // Reset button
        submitButton.disabled = false;
        buttonText.textContent = 'Send Message';

        // Reset form and progress
        this.reset();
        updateFormProgress();

        // Reset all field styling
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const errorElement = document.getElementById(fieldId + 'Error');
            field.classList.remove('border-red-500');
            field.classList.add('border-gray-300', 'dark:border-gray-600');
            errorElement.classList.add('hidden');
        });

        // Hide message after 5 seconds
        setTimeout(() => {
            formMessage.classList.add('hidden');
        }, 5000);
    }, 1000);
});

// Form validation and progress tracking enhancement
const form = document.getElementById('contactForm');
const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');

// Add event listeners for real-time updates
inputs.forEach(input => {
    // Update progress on input
    input.addEventListener('input', function() {
        updateFormProgress();
    });

    // Real-time validation on blur
    input.addEventListener('blur', function() {
        validateField(this);
    });

    // Clear validation errors on focus
    input.addEventListener('focus', function() {
        const errorElement = document.getElementById(this.id + 'Error');
        errorElement.classList.add('hidden');
        this.classList.remove('border-red-500');
        this.classList.add('border-gray-300', 'dark:border-gray-600');
    });
});

// Initialize progress on page load
document.addEventListener('DOMContentLoaded', function() {
    updateFormProgress();
});

// Dynamic Map Implementation with OpenLayers
// OpenLayers provides more advanced mapping capabilities with better performance

let map; // Global map variable for access

document.addEventListener('DOMContentLoaded', function() {
    // Check if OpenLayers is loaded
    if (typeof ol === 'undefined') {
        console.error('OpenLayers library not loaded!');
        // Fallback: show error message in map container
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div class="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <div class="text-center p-6">
                        <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Map Loading Error</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Unable to load the interactive map. Please refresh the page.</p>
                    </div>
                </div>
            `;
        }
        return;
    }

    console.log('OpenLayers library loaded successfully');

    // Show loading state
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.innerHTML = `
            <div class="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div class="text-center">
                    <i class="fas fa-spinner fa-spin text-3xl text-primary mb-3"></i>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Loading map...</p>
                </div>
            </div>
        `;
    }

    // Small delay to show loading state
    setTimeout(() => {
        // Initialize OpenLayers map
        initializeOpenLayersMap();
    }, 500);
});

// Initialize OpenLayers Map
function initializeOpenLayersMap() {
    try {
        console.log('Initializing OpenLayers map...');

        const universityLat = 28.9845;
        const universityLng = 77.7064;

        // Check if map container exists
        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
            console.error('Map container not found!');
            return;
        }

        console.log('Map container found, dimensions:', mapContainer.offsetWidth, 'x', mapContainer.offsetHeight);

        // Ensure container has proper dimensions
        if (mapContainer.offsetWidth === 0 || mapContainer.offsetHeight === 0) {
            console.warn('Map container has zero dimensions, setting minimum size');
            mapContainer.style.minWidth = '400px';
            mapContainer.style.minHeight = '384px';
        }

        // Hide fallback content and show loading
        const fallbackElements = mapContainer.querySelectorAll('iframe, .absolute');
        fallbackElements.forEach(el => el.style.display = 'none');

        // Add loading overlay
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg z-10';
        loadingDiv.innerHTML = `
            <div class="text-center">
                <i class="fas fa-spinner fa-spin text-3xl text-primary mb-3"></i>
                <p class="text-sm text-gray-600 dark:text-gray-400">Loading interactive map...</p>
            </div>
        `;
        mapContainer.appendChild(loadingDiv);

        console.log('Creating basic OpenLayers map...');

        // Simple OpenLayers map setup
        map = new ol.Map({
            target: 'map',
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                })
            ],
            view: new ol.View({
                center: ol.proj.fromLonLat([universityLng, universityLat]),
                zoom: 15
            })
        });

        console.log('Basic OpenLayers map created, adding marker...');

        // Add university marker and popup
        addUniversityMarker(universityLat, universityLng);

        console.log('OpenLayers map initialization complete!');

        // Remove loading overlay and show map
        loadingDiv.remove();

        // Handle map resize
        setTimeout(() => {
            map.updateSize();
            console.log('Map size updated');
        }, 1000);

    } catch (error) {
        console.error('Error initializing OpenLayers map:', error);

        // Show fallback map on error
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            // Remove loading overlay if it exists
            const loadingDiv = mapContainer.querySelector('.absolute');
            if (loadingDiv) loadingDiv.remove();

            // Show fallback elements
            const fallbackElements = mapContainer.querySelectorAll('iframe, .absolute');
            fallbackElements.forEach(el => el.style.display = 'block');

            console.log('Showing fallback static map due to OpenLayers error');
        }
    }
}

// Add university marker with popup
function addUniversityMarker(lat, lng) {
    // Create marker feature
    const marker = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([lng, lat])),
        name: 'Swami Vivekanand Subharti University'
    });

    // Create marker style
    const markerStyle = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 15,
            fill: new ol.style.Fill({
                color: '#FF8C00'
            }),
            stroke: new ol.style.Stroke({
                color: '#ffffff',
                width: 3
            })
        })
    });

    marker.setStyle(markerStyle);

    // Create vector layer for marker
    const vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [marker]
        })
    });

    // Add marker layer to map
    map.addLayer(vectorLayer);

    // Create popup overlay
    const popupElement = document.createElement('div');
    popupElement.className = 'ol-popup';
    popupElement.innerHTML = `
        <div style="text-align: center; font-family: Inter, sans-serif; min-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #0A1930;">
                Swami Vivekanand Subharti University
            </h3>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">
                Meerut, Uttar Pradesh, India
            </p>
            <p style="margin: 0; font-size: 12px; color: #FF8C00; font-weight: 500;">
                Bharatvarsha Development Team
            </p>
            <div style="margin-top: 8px;">
                <button onclick="closePopup()" style="background: #FF8C00; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">Close</button>
            </div>
        </div>
    `;

    // Add popup styles
    popupElement.style.cssText = `
        position: absolute;
        background: white;
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: none;
        z-index: 1000;
    `;

    // Create popup overlay
    const popup = new ol.Overlay({
        element: popupElement,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -15]
    });

    map.addOverlay(popup);

    // Add click handler for marker
    map.on('click', function(evt) {
        const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
            return feature;
        });

        if (feature) {
            const coordinates = feature.getGeometry().getCoordinates();
            popup.setPosition(coordinates);
            popupElement.style.display = 'block';
        } else {
            popupElement.style.display = 'none';
        }
    });

    // Close popup function
    window.closePopup = function() {
        popupElement.style.display = 'none';
    };

    // Add circle around university (500m radius)
    const circleFeature = new ol.Feature({
        geometry: new ol.geom.Circle(ol.proj.fromLonLat([lng, lat]), 500)
    });

    const circleStyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 140, 0, 0.1)'
        }),
        stroke: new ol.style.Stroke({
            color: '#FF8C00',
            width: 2
        })
    });

    circleFeature.setStyle(circleStyle);

    const circleLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [circleFeature]
        })
    });

    map.addLayer(circleLayer);

    console.log('University marker and circle added to map');
}