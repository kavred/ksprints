// KNR Prints - Global Logic

/* -------------------------------------------------------------------------- */
/*                            CLOUDINARY CONFIG                               */
/* -------------------------------------------------------------------------- */
const CLOUDINARY_CLOUD_NAME = 'dllc7sh8m'; // Replace with your actual Cloud Name

function buildImageUrl(imageId) {
    if (!imageId) return '';
    if (imageId.startsWith('http')) return imageId; // Allow absolute URLs as fallback
    // q_auto and f_auto optimize quality and format automatically
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/q_auto,f_auto/${imageId}`;
}

/* -------------------------------------------------------------------------- */
/*                                PRODUCT DATA                                */
/* -------------------------------------------------------------------------- */
const products = []; // DEPRECATED: Using productDatabase for all source of truth now.

/* -------------------------------------------------------------------------- */
/*                               INITIALIZATION                               */
/* -------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Check for 3D World (Homepage)
    const world = document.getElementById('world');
    if (world) {
        init3DScroll();
    }

    // 2. Check for Product Grid (Sub-pages)
    const productGrid = document.getElementById('productGrid');
    if (productGrid) {
        // Determine page context via URL or simple body check
        const path = window.location.pathname;
        if (path.includes('collections.html')) {
            renderProducts('signature');
        } else if (path.includes('essentials.html')) {
            renderProducts('essentials');
        } else {
            // Fallback
            renderProducts('all');
        }
    }
});

// 3. Mobile Menu Logic
const hamburger = document.querySelector('.hamburger');
const mobileOverlay = document.querySelector('.mobile-nav-overlay');
const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-cta');

if (hamburger && mobileOverlay) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        document.body.style.overflow = mobileOverlay.classList.contains('active') ? 'hidden' : 'auto';
    });

    // Close when link clicked
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // Close if clicked outside (on overlay)
    mobileOverlay.addEventListener('click', (e) => {
        if (e.target === mobileOverlay) {
            hamburger.classList.remove('active');
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

/* -------------------------------------------------------------------------- */
/*                              3D SCROLL LOGIC                               */
/* -------------------------------------------------------------------------- */

function init3DScroll() {
    const layers = document.querySelectorAll('.layer');
    const scrollTrack = document.querySelector('.scroll-track');
    const world = document.getElementById('world');
    const viewport = document.querySelector('.viewport');
    const depth = 1000; // Distance between layers

    let currentActiveIndex = 0;

    // Position layers initially at their z-depths
    layers.forEach((layer, index) => {
        const initialZ = -index * depth;
        layer.style.transform = `translateZ(${initialZ}px)`;
        layer.dataset.index = index;
    });

    // Set scroll track height for the scroll range
    const totalDepth = (layers.length - 1) * depth;
    scrollTrack.style.height = `${totalDepth + window.innerHeight}px`;

    // =========================================================================
    // CLICK INTERCEPTION SYSTEM
    // Since CSS 3D transforms cause hit-area misalignment, we intercept clicks
    // on the viewport and manually check if they land on visible buttons
    // =========================================================================

    viewport.addEventListener('click', (e) => {
        const clickX = e.clientX;
        const clickY = e.clientY;

        // Check ALL visible layers, not just the active one
        // This allows clicking buttons that are visible but not yet "active"
        for (const layer of layers) {
            // Skip passed layers (they're faded out)
            if (layer.classList.contains('layer-passed')) continue;

            // Check if layer is visible (opacity > 0.3)
            const layerOpacity = parseFloat(window.getComputedStyle(layer).opacity);
            if (layerOpacity < 0.3) continue;

            // Find all clickable links in this layer
            const links = layer.querySelectorAll('a.btn, .btn-primary, .btn-outline');

            for (const link of links) {
                // Get the visual bounding box (this accounts for 3D transforms)
                const rect = link.getBoundingClientRect();

                // Skip if button has no visible size
                if (rect.width === 0 || rect.height === 0) continue;

                // Check if click is within the visual bounds
                if (clickX >= rect.left && clickX <= rect.right &&
                    clickY >= rect.top && clickY <= rect.bottom) {
                    // Found a matching link - navigate to it
                    e.preventDefault();
                    e.stopPropagation();

                    // Get the href and navigate
                    const href = link.getAttribute('href');
                    if (href) {
                        window.location.href = href;
                    }
                    return;
                }
            }
        }
    }, true); // Use capture phase to intercept before other handlers

    function updateScroll() {
        const scrollTop = window.scrollY;

        // Move the world forward based on scroll
        if (world) {
            world.style.transform = `translateZ(${scrollTop}px)`;
        }

        // Determine which layer has "focus" based on which layer content is most visible
        // A layer becomes active when its content is prominently visible
        // The key insight: layer N content is at z = -N * depth
        // It becomes most visible when scrollTop brings it close to z=0
        // Active threshold: when the layer is within viewing range (before it passes)

        // Find the layer that is currently in the "sweet spot" for viewing/interaction
        let activeIndex = 0;
        layers.forEach((layer, index) => {
            const layerZ = -index * depth;
            const currentZ = layerZ + scrollTop; // Position relative to camera

            // Layer is in "active zone" when it's between -200 and +300 from camera
            // This gives users time to click before and as content approaches
            if (currentZ >= -200 && currentZ < 300) {
                activeIndex = index;
            }
        });

        // Update the tracked active index for click handling
        currentActiveIndex = activeIndex;

        layers.forEach((layer, index) => {
            const layerZ = -index * depth;
            const currentZ = layerZ + scrollTop;

            // Calculate visual effects (fade and blur as layer passes)
            let opacity = 1;
            let blur = 0;
            const fadeStart = 100;
            const fadeEnd = 600;

            if (currentZ > fadeStart) {
                const progress = (currentZ - fadeStart) / (fadeEnd - fadeStart);
                opacity = 1 - Math.min(1, Math.max(0, progress));
                blur = Math.min(1, Math.max(0, progress)) * 20;
            }

            layer.style.opacity = opacity;
            layer.style.filter = `blur(${blur}px)`;

            // Apply layer states
            const isPassed = currentZ > fadeEnd;
            const isActive = index === activeIndex && !isPassed;

            // Remove all state classes first
            layer.classList.remove('layer-active', 'layer-inactive', 'layer-passed');

            if (isPassed) {
                layer.classList.add('layer-passed');
            } else if (isActive) {
                layer.classList.add('layer-active');
            } else {
                layer.classList.add('layer-inactive');
            }
        });

        requestAnimationFrame(updateScroll);
    }

    updateScroll();
}


/* -------------------------------------------------------------------------- */
/*                            PRODUCT RENDER LOGIC                            */
/* -------------------------------------------------------------------------- */

function renderProducts(filterMode = 'all') {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;

    productGrid.innerHTML = '';

    // Convert object to array for easier filtering/mapping
    const allProducts = Object.keys(productDatabase).map(key => {
        return {
            id: key,
            ...productDatabase[key]
        };
    });

    let filteredProducts = allProducts;
    if (filterMode === 'signature') {
        filteredProducts = allProducts.filter(p => p.tier === 'signature');
    } else if (filterMode === 'essentials') {
        filteredProducts = allProducts.filter(p => p.tier === 'essentials');
    }

    filteredProducts.forEach(product => {
        const card = document.createElement('article');
        card.className = `product-card ${product.tier || ''}`;

        // Build card HTML
        let specsHtml = '';
        if (product.tier === 'signature' && product.specs) {
            specsHtml = `
                <ul class="specs-list">
                    ${product.specs.map(spec => `<li>${spec}</li>`).join('')}
                </ul>
            `;
        }

        let commentHtml = '';
        if (product.tier === 'signature' && product.engComment) {
            commentHtml = `<div class="eng-comment">// ENG: ${product.engComment}</div>`;
        }

        const tierLabel = product.tier === 'signature' ? 'Signature Series' : 'Essentials';
        const tierClass = product.tier === 'signature' ? 'tier-signature' : 'tier-essentials';

        // Description truncated for grid
        const shortDesc = product.desc ? (product.desc.substring(0, 80) + '...') : '';

        // Routing Logic
        let viewLink = `product.html?id=${product.id}`;
        if (product.tier === 'essentials') {
            viewLink = `product-essentials.html?id=${product.id}`;
        }

        // SIMPLIFIED CARD FOR ESSENTIALS
        if (product.tier === 'essentials') {
            card.innerHTML = `
                <a href="${viewLink}" class="card-link-wrapper">
                    <div class="card-image-wrapper">
                        <!-- Placeholder with dark background -->
                        <div class="card-image-placeholder essentials-placeholder" style="background: radial-gradient(circle, #222, #050505);">
                            <span style="opacity:0.5; font-size:0.8rem; letter-spacing:0.1em;">IMAGE PLACEHOLDER</span>
                        </div>
                    </div>
                    <div class="card-content essentials-content">
                        <!-- Minimal Header -->
                        <h3 class="card-title" style="margin-top: 1rem; margin-bottom: 0.5rem; font-weight: 500;">${product.title}</h3>
                        <div class="card-price" style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">$${product.price}</div>
                        
                        <p class="card-desc-short" style="font-size: 0.85rem; color: #666;">${shortDesc}</p>
                    </div>
                </a>
            `;
        } else {
            // SIGNATURE CARD
            let colorsHtml = '';
            if (product.tier === 'essentials' && product.colors) {
                colorsHtml = `<div class="card-colors">
                    ${product.colors.map(c => `<span class="color-dot-small" style="background-color: ${c}"></span>`).join('')}
                </div>`;
            }

            let imgSrc = buildImageUrl(product.imageId);
            let imageContent = imgSrc 
                ? `<img src="${imgSrc}" alt="${product.title}" class="card-image-full" style="width:100%; height:100%; object-fit:cover;">`
                : `<div class="card-image-placeholder"><span>${product.title}</span></div>`;

            card.innerHTML = `
                <a href="${viewLink}" class="card-link-wrapper">
                    <div class="card-image-wrapper">
                        ${imageContent}
                    </div>
                    <div class="card-content">
                        <div class="card-header">
                            <span class="card-category">${product.series}</span>
                            <span class="card-tier ${tierClass}">${tierLabel}</span>
                        </div>
                        <h3 class="card-title">${product.title}</h3>
                        <div class="card-price">$${product.price}</div>
                        
                        ${specsHtml}
                        ${commentHtml}
                        
                        <div class="card-meta">
                            <span class="btn-text">View Details →</span>
                        </div>
                    </div>
                </a>
            `;
        }

        productGrid.appendChild(card);
    });
}

/* -------------------------------------------------------------------------- */
/*                             DYNAMIC PRODUCT LOGIC                           */
/* -------------------------------------------------------------------------- */

const productDatabase = {
    // VASE SERIES (Signature)
    'v_vase1': {
        title: 'The Modernist Vase',
        price: '240.00',
        desc: 'Elegant, minimalist structure. A placeholder for your first vase.',
        series: 'Vase',
        tier: 'signature',
        colors: ['#D4AF37', '#C0C0C0', '#cd7f32', '#333333'],
        imageId: '' // Add your Cloudinary image Public ID here later (e.g., 'my-first-vase')
    },

    // STRUCTURAL SERIES (Signature)
    's_bridge': {
        title: 'Suspension Bridge Node',
        price: '320.00',
        desc: 'Analysis of main cable connection points and tension limits on a mega-structure bridge.',
        series: 'Structural',
        tier: 'signature',
        colors: ['#8c8c8c', '#4682B4', '#8B4513', '#1a1a1a']
    },
    's_beam': {
        title: 'I-Beam Stress Map',
        price: '190.00',
        desc: 'Load path visualization under maximum localized stress on a standard universal beam.',
        series: 'Structural',
        tier: 'signature',
        colors: ['#8c8c8c', '#4682B4', '#8B4513', '#1a1a1a']
    },
    's_dome': {
        title: 'Geodesic Dome Joint',
        price: '210.00',
        desc: "Vertex connection detail for spherical structures. Buckminster Fuller's vision in print.",
        series: 'Structural',
        tier: 'signature',
        colors: ['#8c8c8c', '#4682B4', '#8B4513', '#1a1a1a']
    },
    's_sky': {
        title: 'The Skyscraper Core',
        price: '280.00',
        desc: 'Cross-section of elevator shaft and wind bracing systems in a supertall building.',
        series: 'Structural',
        tier: 'signature',
        colors: ['#8c8c8c', '#4682B4', '#8B4513', '#1a1a1a']
    },
    's_cant': {
        title: 'Cantilever Reinforcement',
        price: '175.00',
        desc: 'Rebar placement layout for extended concrete spans. The hidden strength within.',
        series: 'Structural',
        tier: 'signature',
        colors: ['#8c8c8c', '#4682B4', '#8B4513', '#1a1a1a']
    },
    's_truss': {
        title: 'Steel Truss Geometry',
        price: '165.00',
        desc: 'Warren truss triangulation efficiency study. Classic structural engineering.',
        series: 'Structural',
        tier: 'signature',
        colors: ['#8c8c8c', '#4682B4', '#8B4513', '#1a1a1a']
    },
    's_dam': {
        title: 'Buttress Dam Section',
        price: '240.00',
        desc: 'Hydrostatic pressure resistance engineering for massive water containment.',
        series: 'Structural',
        tier: 'signature',
        colors: ['#8c8c8c', '#4682B4', '#8B4513', '#1a1a1a']
    },
    's_isolator': {
        title: 'Seismic Isolator',
        price: '295.00',
        desc: 'Base isolation bearing for earthquake resistance. Engineering for safety and motion.',
        series: 'Structural',
        tier: 'signature',
        colors: ['#8c8c8c', '#4682B4', '#8B4513', '#1a1a1a']
    },

    // AEROSPACE SERIES (Signature)
    'a_falcon': {
        title: 'Falcon Trajectory',
        price: '260.00',
        desc: 'Orbital insertion path mathematics and velocity charts for heavy lift vehicles.',
        series: 'Aerospace',
        tier: 'signature',
        colors: ['#ffffff', '#000080', '#FF4500', '#222222']
    },
    'a_naca': {
        title: 'NACA 2412 Airfoil',
        price: '185.00',
        desc: 'Classic camber profiles emphasizing lift coefficients. The shape of flight.',
        series: 'Aerospace',
        tier: 'signature',
        colors: ['#ffffff', '#000080', '#FF4500', '#222222']
    },
    'a_nozzle': {
        title: 'Rocket Nozzle Bell',
        price: '230.00',
        desc: 'De Laval nozzle expansion ratio blueprint. Optimizing thrust in vacuum.',
        series: 'Aerospace',
        tier: 'signature',
        colors: ['#ffffff', '#000080', '#FF4500', '#222222']
    },
    'a_inlet': {
        title: 'SR-71 Inlet Spike',
        price: '310.00',
        desc: 'Supersonic shockwave management geometry. Mastering air at Mach 3.',
        series: 'Aerospace',
        tier: 'signature',
        colors: ['#ffffff', '#000080', '#FF4500', '#222222']
    },
    'a_heli': {
        title: 'Helicopter Rotor Head',
        price: '275.00',
        desc: 'Cyclic and collective pitch mechanism details. Complexity in rotation.',
        series: 'Aerospace',
        tier: 'signature',
        colors: ['#ffffff', '#000080', '#FF4500', '#222222']
    },
    'a_station': {
        title: 'Space Station Module',
        price: '350.00',
        desc: 'Pressure vessel and docking port schematic. Living in the void.',
        series: 'Aerospace',
        tier: 'signature',
        colors: ['#ffffff', '#000080', '#FF4500', '#222222']
    },
    'a_solar': {
        title: 'Satellite Solar Array',
        price: '210.00',
        desc: 'Deployment hinge and photovoltaic cell layout. Harvesting stellar energy.',
        series: 'Aerospace',
        tier: 'signature',
        colors: ['#ffffff', '#000080', '#FF4500', '#222222']
    },
    'a_lander': {
        title: 'Landing Hexapod',
        price: '295.00',
        desc: 'Lunar lander shock absorption leg design. Touching down on alien worlds.',
        series: 'Aerospace',
        tier: 'signature',
        colors: ['#ffffff', '#000080', '#FF4500', '#222222']
    },

    // ESSENTIALS COLLECTION
    // Everyday products for a reasonable price. 8 colors.
    'e_grid': {
        title: 'The Grid System',
        price: '45.00',
        desc: 'A minimal, versatile grid pattern ensuring perfect alignment in any modern space.',
        series: 'Essentials',
        tier: 'essentials',
        colors: ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF']
    },
    'e_wave': {
        title: 'Sine Wave Basic',
        price: '40.00',
        desc: 'Pure mathematical oscillation. A standard reference for audio and physics enthusiasts.',
        series: 'Essentials',
        tier: 'essentials',
        colors: ['#1a1a1a', '#e5e5e5', '#3357ff', '#ff3357', '#33ff57', '#ffda33', '#33ffff', '#ff33ff']
    },
    'e_topo': {
        title: 'Topographic Lines',
        price: '50.00',
        desc: 'Elevation contours map. Simple, organic lines representing terrain.',
        series: 'Essentials',
        tier: 'essentials',
        colors: ['#2e2e2e', '#f0f0f0', '#4a90e2', '#e24a4a', '#50c878', '#f2c94c', '#9b51e0', '#f5a623']
    },
    'e_circuit': {
        title: 'Basic PCB Trace',
        price: '55.00',
        desc: 'Fundamental electronic pathways. The copper roads of modern technology.',
        series: 'Essentials',
        tier: 'essentials',
        colors: ['#1c2e1c', '#e6ffe6', '#008000', '#800000', '#000080', '#808000', '#800080', '#008080']
    },
    'e_bauhaus': {
        title: 'Bauhaus Shapes',
        price: '60.00',
        desc: 'Primary geometric forms: Triangle, Square, Circle. The basics of design theory.',
        series: 'Essentials',
        tier: 'essentials',
        colors: ['#111111', '#eeeeee', '#d43535', '#356dd4', '#d4a835', '#35d49a', '#9a35d4', '#d46d35']
    },
    'e_spectrum': {
        title: 'Visible Spectrum',
        price: '48.00',
        desc: 'Linear gradient of visible light. Simple physics for your wall.',
        series: 'Essentials',
        tier: 'essentials',
        colors: ['#000000', '#FFFFFF', '#666666', '#999999', '#CCCCCC', '#333333', '#555555', '#777777']
    },
    'e_iso': {
        title: 'Isometric Cube',
        price: '42.00',
        desc: 'A perfect cube in 30-degree isometric projection. Depth on a flat plane.',
        series: 'Essentials',
        tier: 'essentials',
        colors: ['#222222', '#dddddd', '#ff5722', '#2196f3', '#4caf50', '#ffeb3b', '#673ab7', '#e91e63']
    },
    'e_golden': {
        title: 'Golden Spiral',
        price: '65.00',
        desc: 'Fibonacci sequence visualization. Nature\'s perfect proportion.',
        series: 'Essentials',
        tier: 'essentials',
        colors: ['#0a0a0a', '#fdfdfd', '#d4af37', '#c0c0c0', '#cd7f32', '#b87333', '#50c878', '#0047ab']
    }
};

function initProductPage() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    const product = productDatabase[productId];

    if (!product) {
        // Handle invalid ID (could redirect or show error)
        document.getElementById('product-title').innerText = 'Product Not Found';
        document.getElementById('product-desc').innerText = 'The item you are looking for does not exist.';
        return;
    }

    // Populate Data
    document.getElementById('product-title').innerText = product.title;
    document.getElementById('product-price').innerText = '$' + product.price;
    document.getElementById('product-desc').innerText = product.desc;

    // Breadcrumb Category - HIDDEN AS PER FEEDBACK (Both Essentials and Signature)
    const breadcrumbContainer = document.getElementById('product-breadcrumb');
    if (breadcrumbContainer) {
        breadcrumbContainer.style.display = 'none';
    }

    // -----------------------------------------------------
    // TIER BADGE INSERTION REMOVED AS PER FEEDBACK
    // -----------------------------------------------------
    const existingBadge = document.getElementById('product-tier-badge');
    if (existingBadge) existingBadge.remove();


    // Image Handling
    const mainImg = document.getElementById('product-main-image');
    let imgSrc = buildImageUrl(product.imageId);
    if (imgSrc) {
        mainImg.innerHTML = `<img src="${imgSrc}" alt="${product.title}" style="width:100%; height:100%; object-fit:cover; border-radius:4px;">`;
        mainImg.style.background = 'none';
    } else {
        mainImg.innerText = product.title; // Placeholder text
        if (product.series === 'Vase') mainImg.style.background = 'radial-gradient(circle, #333, #000)';
        if (product.series === 'Structural') mainImg.style.background = 'radial-gradient(circle, #2a2a2a, #111)';
        if (product.series === 'Aerospace') mainImg.style.background = 'radial-gradient(circle, #1f1f1f, #050505)';
        if (product.series === 'Essentials') mainImg.style.background = 'radial-gradient(circle, #444, #111)'; // Generic background for Essentials
    }

    // Colors
    const colorSelector = document.getElementById('color-selector');
    colorSelector.innerHTML = ''; // Clear existing
    product.colors.forEach((color, index) => {
        const div = document.createElement('div');
        div.className = 'color-option';
        div.style.backgroundColor = color;
        if (index === 0) div.classList.add('active'); // Select first by default

        div.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(el => el.classList.remove('active'));
            div.classList.add('active');
        });
        colorSelector.appendChild(div);
    });

    // Quantity Logic
    const qtyInput = document.getElementById('qty-input');
    const btnMinus = document.getElementById('qty-minus');
    const btnPlus = document.getElementById('qty-plus');

    btnMinus.addEventListener('click', () => {
        let val = parseInt(qtyInput.value);
        if (val > 1) qtyInput.value = val - 1;
    });

    btnPlus.addEventListener('click', () => {
        let val = parseInt(qtyInput.value);
        if (val < 10) qtyInput.value = val + 1;
    });
}

/* -------------------------------------------------------------------------- */
/*                                CART LOGIC                                  */
/* -------------------------------------------------------------------------- */

// Store: [{ id: 'k_turbine', color: '#hex', qty: 1 }]
function getCart() {
    const stored = localStorage.getItem('knr_cart');
    return stored ? JSON.parse(stored) : [];
}

function saveCart(cart) {
    localStorage.setItem('knr_cart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart(productId, color, qty) {
    const cart = getCart();

    // Check if same product + color exists
    const existingIndex = cart.findIndex(item => item.id === productId && item.color === color);

    if (existingIndex > -1) {
        cart[existingIndex].qty += qty;
    } else {
        cart.push({ id: productId, color: color, qty: qty });
    }

    saveCart(cart);
    alert('Item added to cart!'); // Simple feedback for now
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((acc, item) => acc + item.qty, 0);

    // Update all count badges on the page
    document.querySelectorAll('#cart-count, #mobile-cart-count').forEach(el => {
        el.innerText = count;
    });
}

function removeFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    initCartPage(); // Re-render
}

function updateCartItemQty(index, change) {
    const cart = getCart();
    const newQty = cart[index].qty + change;

    if (newQty > 0 && newQty <= 10) {
        cart[index].qty = newQty;
        saveCart(cart);
        initCartPage();
    }
}

// Render Cart Page
function initCartPage() {
    updateCartCount();

    const cart = getCart();
    const listEl = document.getElementById('cart-items-list');
    const emptyEl = document.getElementById('cart-empty-state');
    const contentEl = document.getElementById('cart-content');
    const totalEl = document.getElementById('cart-total');

    if (!listEl) return; // Not on cart page

    if (cart.length === 0) {
        emptyEl.style.display = 'block';
        contentEl.style.display = 'none';
        return;
    }

    emptyEl.style.display = 'none';
    contentEl.style.display = 'block';

    listEl.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const product = productDatabase[item.id];
        if (!product) return; // Skip if invalid

        const itemTotal = parseFloat(product.price) * item.qty;
        total += itemTotal;

        const row = document.createElement('div');
        row.className = 'cart-item-row';

        row.innerHTML = `
            <div class="cart-thumb" style="background-color: #222;"></div> 
            <div class="cart-details">
                <h3>${product.title}</h3>
                <div class="meta">
                    Color: <span class="color-dot" style="background-color: ${item.color}"></span>
                </div>
            </div>
            <div class="quantity-selector">
                <button class="qty-btn" onclick="updateCartItemQty(${index}, -1)">-</button>
                <input type="text" id="qty-input" value="${item.qty}" readonly>
                <button class="qty-btn" onclick="updateCartItemQty(${index}, 1)">+</button>
            </div>
            <div class="cart-price">$${itemTotal.toFixed(2)}</div>
            <button class="btn-remove" onclick="removeFromCart(${index})">&times;</button>
        `;

        listEl.appendChild(row);
    });

    totalEl.innerText = '$' + total.toFixed(2);
}

// Initialize validation on load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
});
