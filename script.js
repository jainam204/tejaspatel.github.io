document.addEventListener('DOMContentLoaded', () => {

    /* ═══════════════════════════════════════════════════
       1. THEME TOGGLE
    ═══════════════════════════════════════════════════ */
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }


    /* ═══════════════════════════════════════════════════
       2. HEADER SCROLL EFFECT
    ═══════════════════════════════════════════════════ */
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 40);
        }, { passive: true });
    }


    /* ═══════════════════════════════════════════════════
       3. MOBILE MENU
    ═══════════════════════════════════════════════════ */
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.toggle('open');
            const bars = menuToggle.querySelectorAll('.bar');
            if (bars.length >= 2) {
                if (isOpen) {
                    bars[0].style.transform = 'rotate(45deg) translate(4px, 4px)';
                    bars[1].style.transform = 'rotate(-45deg) translate(4px, -4px)';
                } else {
                    bars[0].style.transform = '';
                    bars[1].style.transform = '';
                }
            }
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                const bars = menuToggle.querySelectorAll('.bar');
                if (bars.length >= 2) {
                    bars[0].style.transform = '';
                    bars[1].style.transform = '';
                }
            });
        });
    }


    /* ═══════════════════════════════════════════════════
       4. PARTICLE CANVAS BACKGROUND
    ═══════════════════════════════════════════════════ */
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let W, H, particles = [], mouse = { x: null, y: null, radius: 200 };
        const PARTICLE_COUNT = 90;

        function resize() {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
        }

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * W;
                this.y = Math.random() * H;
                this.vx = (Math.random() - 0.5) * 0.45;
                this.vy = (Math.random() - 0.5) * 0.45;
                this.size = Math.random() * 2 + 0.5;
                this.color = `rgba(139, 92, 246, ${Math.random() * 0.5 + 0.2})`;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;

                // mouse interact (avoidance/push)
                if (mouse.x != null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (mouse.radius - distance) / mouse.radius;
                        const pushX = forceDirectionX * force * -2;
                        const pushY = forceDirectionY * force * -2;
                        this.x += pushX;
                        this.y += pushY;
                    }
                }

                if (this.x < -50 || this.x > W + 50 || this.y < -50 || this.y > H + 50) {
                    this.reset();
                }
            }
            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            resize();
            particles = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push(new Particle());
            }
        }

        function drawLines() {
            for (let a = 0; a < particles.length; a++) {
                for (let b = a + 1; b < particles.length; b++) {
                    const dx = particles[a].x - particles[b].x;
                    const dy = particles[a].y - particles[b].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 110) {
                        ctx.strokeStyle = `rgba(139, 92, 246, ${0.15 * (1 - dist / 110)})`;
                        ctx.lineWidth = 0.6;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, W, H);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            drawLines();
            requestAnimationFrame(animate);
        }

        initParticles();
        animate();

        window.addEventListener('resize', debounce(resize, 150));

        window.addEventListener('mousemove', e => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        }, { passive: true });

        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });
    }

    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }


    /* ═══════════════════════════════════════════════════
       5. HACKER / SCRAMBLE TEXT EFFECT
    ═══════════════════════════════════════════════════ */
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    const hackerElement = document.querySelector('.hacker-text');

    if (hackerElement) {
        hackerElement.addEventListener('mouseenter', event => {
            let iteration = 0;
            const originalText = event.target.dataset.value || event.target.innerText;
            clearInterval(event.target.interval);

            event.target.interval = setInterval(() => {
                event.target.innerText = originalText
                    .split("")
                    .map((letter, index) => {
                        if (index < iteration) return originalText[index];
                        return letters[Math.floor(Math.random() * letters.length)];
                    })
                    .join("");

                if (iteration >= originalText.length) {
                    clearInterval(event.target.interval);
                }
                iteration += 1 / 3;
            }, 30);
        });
    }


    /* ═══════════════════════════════════════════════════
       6. SCROLL REVEAL OBSERVER
    ═══════════════════════════════════════════════════ */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


    /* ═══════════════════════════════════════════════════
       7. CAD GALLERY DATA (39 TECHNICAL IMAGES)
    ═══════════════════════════════════════════════════ */
    const DEFAULT_GALLERY_DATA = [
        {
            id: 1,
            src: "images/1-Isometric.jpg",
            title: "Air Cooled Heat Exchanger (ACHE) — Full Bay Isometric",
            category: "ache",
            categoryLabel: "ACHE & Equipment",
            software: "SolidWorks",
            desc: "Complete 3D bay assembly with multi-pass tube bundles, plenum hoods, motor suspension bridge, perimeter walkways, and caged ladders."
        },
        {
            id: 2,
            src: "images/2-Front.jpg",
            title: "ACHE Bay Structure — Front Elevation View",
            category: "ache",
            categoryLabel: "ACHE & Equipment",
            software: "SolidWorks",
            desc: "Front orthographic view displaying column spans, bundle elevations, ground clearance, and piping nozzle interface points."
        },
        {
            id: 3,
            src: "images/3-Side.jpg",
            title: "ACHE Bay Structure — Side Elevation View",
            category: "ache",
            categoryLabel: "ACHE & Equipment",
            software: "SolidWorks",
            desc: "Side elevation showing plenum chamber slope, transverse sway bracing, access ladder cage, and bundle layout."
        },
        {
            id: 4,
            src: "images/4-grating Top.jpg",
            title: "ACHE Bay Top View — Serrated Grating Deck",
            category: "platform",
            categoryLabel: "Platforms & Steel",
            software: "SolidWorks",
            desc: "Top deck plan view illustrating anti-slip serrated grating walkway perimeter, bundle boundary channels, and ladder landings."
        },
        {
            id: 5,
            src: "images/5.jpg",
            title: "Corner Maintenance Platform & Caged Ladder",
            category: "platform",
            categoryLabel: "Platforms & Steel",
            software: "SolidWorks",
            desc: "Detailed junction of safety caged ladder, column gussets, bundle header nozzles, and safety kickplates."
        },
        {
            id: 6,
            src: "images/6.jpg",
            title: "Platform Handrail & Kickplate Connection",
            category: "platform",
            categoryLabel: "Platforms & Steel",
            software: "SolidWorks",
            desc: "Detailing of industrial handrail stanchions, toe-board kickplates, and bolted framing joints."
        },
        {
            id: 7,
            src: "images/7.jpg",
            title: "Walkway Corner Landing & Handrail Detail",
            category: "platform",
            categoryLabel: "Platforms & Steel",
            software: "SolidWorks",
            desc: "Isometric view of the maintenance platform corner with safety gates, knee-rails, and non-slip floor panels."
        },
        {
            id: 8,
            src: "images/8.jpg",
            title: "Cantilever Platform Support & Knee Bracing",
            category: "platform",
            categoryLabel: "Platforms & Steel",
            software: "SolidWorks",
            desc: "Under-platform structural cantilever bracket assembly with bolted diagonal knee bracing and ladder mounts."
        },
        {
            id: 9,
            src: "images/9.jpg",
            title: "Safety Ladder Hoops & Structural Mounts",
            category: "platform",
            categoryLabel: "Platforms & Steel",
            software: "SolidWorks",
            desc: "Precision modeling of OSHA-compliant safety cage hoops, ladder stringers, and column mounting tabs."
        },
        {
            id: 10,
            src: "images/10.jpg",
            title: "ACHE Primary Structural Steel Bay Framework",
            category: "ache",
            categoryLabel: "ACHE & Equipment",
            software: "SolidWorks Weldments",
            desc: "Complete primary structural steel framework with universal columns, longitudinal girders, and transverse cross-ties."
        },
        {
            id: 11,
            src: "images/11.jpg",
            title: "Fan Drive Suspension & Motor Bridge Structure",
            category: "ache",
            categoryLabel: "ACHE & Equipment",
            software: "SolidWorks",
            desc: "Dual fan motor support framing featuring cross-channel beams, motor baseplates, and vibration sway struts."
        },
        {
            id: 12,
            src: "images/12.jpg",
            title: "Intermediate Transverse Bay Cross-Beam",
            category: "ache",
            categoryLabel: "ACHE & Equipment",
            software: "SolidWorks",
            desc: "Intermediate structural cross-beam weldments and bolted shear connection tabs."
        },
        {
            id: 13,
            src: "images/13.jpg",
            title: "Fan Motor Slide Base Frame",
            category: "ache",
            categoryLabel: "ACHE & Equipment",
            software: "SolidWorks",
            desc: "Adjustable motor mounting rails designed for belt tensioning and drive alignment."
        },
        {
            id: 14,
            src: "images/14.jpg",
            title: "Fan Motor Drive Base & Shaft Hub Beam",
            category: "ache",
            categoryLabel: "ACHE & Equipment",
            software: "SolidWorks",
            desc: "Heavy-duty channel beams with machined central motor drive shaft aperture and bolt circle."
        },
        {
            id: 15,
            src: "images/15.jpg",
            title: "Column Top Connection & Bundle Girder Splice",
            category: "platform",
            categoryLabel: "Platforms & Steel",
            software: "SolidWorks",
            desc: "High-strength bolted moment and shear connection between vertical column and bay longitudinal girder."
        },
        {
            id: 16,
            src: "images/16.jpg",
            title: "Finned Tube Bundle Complete Assembly",
            category: "bundle",
            categoryLabel: "Tube Bundles & Headers",
            software: "SolidWorks",
            desc: "Finished bundle assembly featuring side frame channels, tube spacers, lifting trunnions, and header box."
        },
        {
            id: 17,
            src: "images/17.jpg",
            title: "ACHE Header Box 3D Cutaway & Pass Partitions",
            category: "bundle",
            categoryLabel: "Tube Bundles & Headers",
            software: "SolidWorks",
            desc: "Cutaway perspective exposing internal welded pass partition plates, plug holes, nozzles, and tube joints."
        },
        {
            id: 18,
            src: "images/18.jpg",
            title: "Finned Tube Bundle Cross Section & Pitch Layout",
            category: "bundle",
            categoryLabel: "Tube Bundles & Headers",
            software: "SolidWorks",
            desc: "Triangular pitch tube layout with finned aluminum tubes, top/bottom retainer bars, and side seals."
        },
        {
            id: 19,
            src: "images/19.jpg",
            title: "Tube Bundle Side Channel & Tube Support Comb",
            category: "bundle",
            categoryLabel: "Tube Bundles & Headers",
            software: "SolidWorks",
            desc: "Structural side channel detailing with intermediate tube support comb slots and guide pins."
        },
        {
            id: 20,
            src: "images/20.jpg",
            title: "Plenum Chamber Aerodynamic Transition Duct",
            category: "ache",
            categoryLabel: "ACHE & Equipment",
            software: "SolidWorks Sheet Metal",
            desc: "Sheet metal lofted transition hood converting rectangular bay plan into circular fan ring shroud."
        },
        {
            id: 21,
            src: "images/21.jpg",
            title: "Plenum Corner Flange & Joint Stiffener",
            category: "ache",
            categoryLabel: "ACHE & Equipment",
            software: "SolidWorks",
            desc: "Segmented plenum panel joint with bolted sealing lips and corner stiffeners."
        },
        {
            id: 22,
            src: "images/22.jpg",
            title: "Aerodynamic Fan Ring Cowl Shroud",
            category: "ache",
            categoryLabel: "ACHE & Equipment",
            software: "SolidWorks",
            desc: "Smooth bellmouth fan inlet ring engineered to maximize airflow efficiency and minimize tip vortex loss."
        },
        {
            id: 23,
            src: "images/23.jpg",
            title: "Horizontal Pressure Vessel (Isometric 3D CAD)",
            category: "vessel",
            categoryLabel: "Pressure Vessels",
            software: "SolidWorks / ASME Sec VIII",
            desc: "Isometric view of ASME Section VIII horizontal pressure vessel with saddle supports, stiffeners, manway, and nozzles."
        },
        {
            id: 24,
            src: "images/24.jpg",
            title: "Horizontal Pressure Vessel — Elevation GA View",
            category: "vessel",
            categoryLabel: "Pressure Vessels",
            software: "SolidWorks / PV Elite",
            desc: "General arrangement elevation showing fixed & sliding saddles, shell courses, and process nozzles."
        },
        {
            id: 25,
            src: "images/25.jpg",
            title: "Horizontal Pressure Vessel — Top Plan View",
            category: "vessel",
            categoryLabel: "Pressure Vessels",
            software: "SolidWorks",
            desc: "Top nozzle layout, central flanged inspection manway, and circumferential stiffener ring placements."
        },
        {
            id: 26,
            src: "images/26.jpg",
            title: "Parametric Vessel Support Saddle 3D CAD Model",
            category: "vessel",
            categoryLabel: "Pressure Vessels",
            software: "Autodesk Inventor",
            desc: "Engineered saddle support with curved wear plate, web stiffeners, gusset ribs, and anchor bolt slots."
        },
        {
            id: 27,
            src: "images/27.jpg",
            title: "iLogic Saddle Detail Parametric Form UI",
            category: "ilogic",
            categoryLabel: "CAD Automation",
            software: "Inventor iLogic",
            desc: "Interactive iLogic rule form automating saddle angle, wear plate geometry, rib count, and bolt slot spacing."
        },
        {
            id: 28,
            src: "images/28.jpg",
            title: "Vertical Process Column with Skirt Support",
            category: "vessel",
            categoryLabel: "Pressure Vessels",
            software: "Autodesk Inventor",
            desc: "3D CAD model of vertical process column showing skirt support, nozzles, lifting lugs, and shell manhole."
        },
        {
            id: 29,
            src: "images/29.jpg",
            title: "Vertical Vessel Skirt Base Ring & Anchor Slots",
            category: "vessel",
            categoryLabel: "Pressure Vessels",
            software: "Autodesk Inventor",
            desc: "Detailing of cylindrical skirt base ring with slotted anchor bolt holes, pipe sleeve cutout, and nameplate bracket."
        },
        {
            id: 30,
            src: "images/30.jpg",
            title: "Vertical Vessel Top Head & Lifting Trunnions",
            category: "vessel",
            categoryLabel: "Pressure Vessels",
            software: "Autodesk Inventor",
            desc: "Top ellipsoidal dish end with flanged vapor nozzle, reinforcing pad, and dual heavy-duty lifting lugs."
        },
        {
            id: 31,
            src: "images/31.jpg",
            title: "Full Vertical Column in Inventor iLogic Environment",
            category: "ilogic",
            categoryLabel: "CAD Automation",
            software: "Autodesk Inventor",
            desc: "Complete parametric vertical vessel assembly driven dynamically by automated rule modules."
        },
        {
            id: 32,
            src: "images/32.jpg",
            title: "iLogic 'Shell & Dish' Parametric Configuration UI",
            category: "ilogic",
            categoryLabel: "CAD Automation",
            software: "Inventor iLogic",
            desc: "Parametric form for Shell & Dish selection (Elliptical, Torispherical, Hemispherical, ID, Crown & Knuckle radii)."
        },
        {
            id: 33,
            src: "images/33.jpg",
            title: "iLogic 'Cone & Reducer' Configuration Dialog",
            category: "ilogic",
            categoryLabel: "CAD Automation",
            software: "Inventor iLogic",
            desc: "Automated concentric and eccentric cone transitions with knuckle radius calculation."
        },
        {
            id: 34,
            src: "images/34.jpg",
            title: "iLogic 'Elbow & Piping' Parametric Dialog",
            category: "ilogic",
            categoryLabel: "CAD Automation",
            software: "Inventor iLogic",
            desc: "Parametric generation of pipe elbows, orientations, elevations, and nozzle attachments."
        },
        {
            id: 35,
            src: "images/35.jpg",
            title: "iLogic 'Body Flange' Automated Sizing UI",
            category: "ilogic",
            categoryLabel: "CAD Automation",
            software: "Inventor iLogic",
            desc: "Automated body flange design interface with ASME flange ratings, bolt circles, and gasket dimensions."
        },
        {
            id: 36,
            src: "images/36.jpg",
            title: "iLogic 'Expansion Bellow' Parametric Dialog",
            category: "ilogic",
            categoryLabel: "CAD Automation",
            software: "Inventor iLogic",
            desc: "Design automation module for metallic expansion joints and bellows integration."
        },
        {
            id: 37,
            src: "images/37.jpg",
            title: "iLogic 'Nozzle & Flange' Dynamic Placement UI",
            category: "ilogic",
            categoryLabel: "CAD Automation",
            software: "Inventor iLogic",
            desc: "Interactive nozzle placement specifying elevation, radial orientation, flange rating (WN/RF), and repad."
        },
        {
            id: 38,
            src: "images/38.jpg",
            title: "iLogic 'Lifting Lugs & Rigging' Parametric UI",
            category: "ilogic",
            categoryLabel: "CAD Automation",
            software: "Inventor iLogic",
            desc: "Rigging attachment configuration for vessel tailing and lifting lugs with stress-checked hole diameters."
        },
        {
            id: 39,
            src: "images/39.jpg",
            title: "Integrated iLogic Pressure Vessel Automation Suite",
            category: "ilogic",
            categoryLabel: "CAD Automation",
            software: "Inventor iLogic",
            desc: "Comprehensive multi-dialogue CAD automation suite dynamically generating complete vessels in real time."
        }
    ];

    let allGalleryItems = DEFAULT_GALLERY_DATA;
    let activeFilter = 'all';
    let currentLightboxList = DEFAULT_GALLERY_DATA;
    let currentLightboxIndex = 0;


    /* ═══════════════════════════════════════════════════
       8. LIGHTBOX MODAL CONTROLLER
    ═══════════════════════════════════════════════════ */
    const lightboxModal = document.getElementById('cad-lightbox');
    const lightboxBackdrop = document.getElementById('lightbox-backdrop');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxImgFrame = document.getElementById('lightbox-img-frame');
    const lightboxZoomBtn = document.getElementById('lightbox-zoom');
    const lightboxSoftware = document.getElementById('lightbox-software');
    const lightboxCat = document.getElementById('lightbox-cat');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDesc = document.getElementById('lightbox-desc');
    const lightboxThumbs = document.getElementById('lightbox-thumbs');

    function openLightbox(index, customList) {
        if (!lightboxModal) return;
        currentLightboxList = customList || allGalleryItems;
        currentLightboxIndex = Math.max(0, Math.min(index, currentLightboxList.length - 1));
        
        renderLightboxImage();
        populateLightboxThumbs();

        lightboxModal.classList.add('active');
        lightboxModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightboxModal) return;
        lightboxModal.classList.remove('active');
        lightboxModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lightboxImgFrame) lightboxImgFrame.classList.remove('zoomed');
    }

    function renderLightboxImage() {
        const item = currentLightboxList[currentLightboxIndex];
        if (!item) return;

        if (lightboxImg) {
            lightboxImg.style.opacity = '0';
            lightboxImg.src = item.src;
            lightboxImg.alt = item.title;
            lightboxImg.onload = () => {
                lightboxImg.style.transition = 'opacity 0.25s ease';
                lightboxImg.style.opacity = '1';
            };
        }

        if (lightboxSoftware) lightboxSoftware.textContent = item.software || 'CAD Model';
        if (lightboxCat) lightboxCat.textContent = item.categoryLabel || item.category || 'Mechanical';
        if (lightboxCounter) lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${currentLightboxList.length}`;
        if (lightboxTitle) lightboxTitle.textContent = item.title;
        if (lightboxDesc) lightboxDesc.textContent = item.desc;

        if (lightboxImgFrame) lightboxImgFrame.classList.remove('zoomed');

        // Update active state in thumbnail reel
        if (lightboxThumbs) {
            const thumbs = lightboxThumbs.querySelectorAll('.lightbox-thumb');
            thumbs.forEach((th, i) => {
                th.classList.toggle('active', i === currentLightboxIndex);
                if (i === currentLightboxIndex) {
                    th.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            });
        }
    }

    function populateLightboxThumbs() {
        if (!lightboxThumbs) return;
        lightboxThumbs.innerHTML = '';
        currentLightboxList.forEach((item, i) => {
            const thumb = document.createElement('div');
            thumb.className = 'lightbox-thumb' + (i === currentLightboxIndex ? ' active' : '');
            thumb.title = item.title;
            thumb.innerHTML = `<img src="${item.src}" alt="${item.title}" loading="lazy">`;
            thumb.addEventListener('click', () => {
                currentLightboxIndex = i;
                renderLightboxImage();
            });
            lightboxThumbs.appendChild(thumb);
        });
    }

    function nextLightbox() {
        if (currentLightboxList.length === 0) return;
        currentLightboxIndex = (currentLightboxIndex + 1) % currentLightboxList.length;
        renderLightboxImage();
    }

    function prevLightbox() {
        if (currentLightboxList.length === 0) return;
        currentLightboxIndex = (currentLightboxIndex - 1 + currentLightboxList.length) % currentLightboxList.length;
        renderLightboxImage();
    }

    function toggleZoom() {
        if (lightboxImgFrame) {
            lightboxImgFrame.classList.toggle('zoomed');
        }
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
    if (lightboxNext) lightboxNext.addEventListener('click', nextLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', prevLightbox);
    if (lightboxZoomBtn) lightboxZoomBtn.addEventListener('click', toggleZoom);
    if (lightboxImg) lightboxImg.addEventListener('click', toggleZoom);

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
        if (!lightboxModal || !lightboxModal.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextLightbox();
        if (e.key === 'ArrowLeft') prevLightbox();
        if (e.key === 'f' || e.key === 'F') toggleZoom();
    });

    // Hero CAD Preview click triggers lightbox
    const heroPreview = document.getElementById('hero-cad-preview');
    if (heroPreview) {
        heroPreview.addEventListener('click', () => {
            openLightbox(0, allGalleryItems);
        });
    }


    /* ═══════════════════════════════════════════════════
       9. RENDER CAD GALLERY WITH FILTERS
    ═══════════════════════════════════════════════════ */
    const galleryGrid = document.getElementById('gallery-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');

    function renderGallery() {
        if (!galleryGrid) return;
        galleryGrid.innerHTML = '';

        const filtered = activeFilter === 'all' 
            ? allGalleryItems 
            : allGalleryItems.filter(item => item.category === activeFilter);

        filtered.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'gallery-item reveal reveal-delay-' + Math.min(index % 4 + 1, 5);
            card.innerHTML = `
                <div class="gallery-thumb-wrap">
                    <img src="${item.src}" alt="${item.title}" loading="lazy">
                    <div class="gallery-zoom-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            <line x1="11" y1="8" x2="11" y2="14"></line>
                            <line x1="8" y1="11" x2="14" y2="11"></line>
                        </svg>
                    </div>
                </div>
                <div class="gallery-info">
                    <div class="gallery-info-header">
                        <span class="gallery-badge">${item.categoryLabel}</span>
                        <span class="gallery-soft-badge">${item.software}</span>
                    </div>
                    <h4 class="gallery-title">${item.title}</h4>
                </div>
            `;

            card.addEventListener('click', () => {
                // Find global index in allGalleryItems
                const globalIdx = allGalleryItems.findIndex(g => g.id === item.id);
                openLightbox(globalIdx >= 0 ? globalIdx : 0, allGalleryItems);
            });

            galleryGrid.appendChild(card);
            revealObserver.observe(card);
        });
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.dataset.filter || 'all';
            renderGallery();
        });
    });

    renderGallery();


    /* ═══════════════════════════════════════════════════
       10. LOAD PROJECTS WITH HIGH-RES HERO IMAGES
    ═══════════════════════════════════════════════════ */
    const projectsContainer = document.getElementById('projects-container');

    const defaultProjects = [
        {
            title: "Air Cooled Heat Exchanger (ACHE) Bay Assembly",
            type: "Featured",
            category: "Heat Exchangers",
            badge: "Featured Project",
            heroImage: "images/1-Isometric.jpg",
            images: [
                "images/1-Isometric.jpg",
                "images/2-Front.jpg",
                "images/3-Side.jpg",
                "images/4-grating Top.jpg",
                "images/10.jpg",
                "images/16.jpg",
                "images/17.jpg",
                "images/20.jpg"
            ],
            tags: ["SolidWorks", "API 661", "Equipment Design", "Weldments"],
            metrics: "Multi-Bundle Bay • API 661",
            description: "Comprehensive 3D mechanical design and assembly of a heavy-duty Air Cooled Heat Exchanger (Fin-Fan Cooler) bay. Integrated high-pressure finned tube bundles, aerodynamic plenum hoods, fan drive support framing, perimeter maintenance platforms, and safety cage access ladders."
        },
        {
            title: "Automated Pressure Vessel Design System (iLogic)",
            type: "CAD Automation",
            category: "CAD Automation",
            badge: "Design Automation",
            heroImage: "images/39.jpg",
            images: [
                "images/39.jpg",
                "images/31.jpg",
                "images/27.jpg",
                "images/32.jpg",
                "images/37.jpg"
            ],
            tags: ["Autodesk Inventor", "iLogic", "ASME Sec VIII", "Parametric CAD"],
            metrics: "90% Faster Modeling • ASME VIII",
            description: "Architected an intelligent parametric design automation suite in Autodesk Inventor using iLogic rules and custom UI forms. Dynamically generates ASME-compliant pressure vessels, nozzles, body flanges, skirt/saddle supports, and shell/dish configurations from engineering spreadsheets."
        },
        {
            title: "Horizontal Pressure Vessel with Stiffener Rings",
            type: "Pressure Vessel",
            category: "Pressure Vessels",
            badge: "ASME Sec VIII",
            heroImage: "images/23.jpg",
            images: [
                "images/23.jpg",
                "images/24.jpg",
                "images/25.jpg",
                "images/26.jpg"
            ],
            tags: ["PV Elite", "SolidWorks", "ASME Sec VIII Div 1", "Saddle Design"],
            metrics: "Heavy Industrial • Stiffeners",
            description: "Detailed mechanical design and 3D modeling of an ASME Section VIII Div 1 horizontal pressure vessel. Engineered with fixed and sliding saddle supports, wear plates, circumferential stiffener rings for vacuum/external pressure, top manway, and process nozzles."
        },
        {
            title: "ACHE Header Box & Multi-Pass Tube Bundle",
            type: "Thermal Design",
            category: "Heat Exchangers",
            badge: "High Pressure",
            heroImage: "images/17.jpg",
            images: [
                "images/17.jpg",
                "images/16.jpg",
                "images/18.jpg",
                "images/19.jpg"
            ],
            tags: ["SolidWorks", "Plug Header", "API 661", "Multi-Pass"],
            metrics: "Plug Sheet • Staggered Pitch",
            description: "Precision 3D modeling of high-pressure plug-type header boxes with internal welded pass partition plates and tube sheet hole pattern. Includes complete finned tube bundle assembly with intermediate anti-vibration tube supports and side channels."
        },
        {
            title: "Industrial Bay Structural Steel & Access Platforms",
            type: "Structural",
            category: "Structural Design",
            badge: "Steel Structure",
            heroImage: "images/10.jpg",
            images: [
                "images/10.jpg",
                "images/5.jpg",
                "images/7.jpg",
                "images/8.jpg",
                "images/11.jpg"
            ],
            tags: ["SolidWorks Weldments", "Structural Steel", "IS 800 / AISC", "BOM"],
            metrics: "Full Bay Steel • Caged Ladders",
            description: "Complete structural steel framework for heat exchanger bays, engineered with universal column sections, cross-bracing, fan drive motor bridges, serrated grating platforms, kick plates, and safety cage access ladders adhering to industrial safety standards."
        },
        {
            title: "Vertical Process Column with Skirt Support",
            type: "Process Equipment",
            category: "Pressure Vessels",
            badge: "Process Column",
            heroImage: "images/31.jpg",
            images: [
                "images/31.jpg",
                "images/28.jpg",
                "images/29.jpg",
                "images/30.jpg"
            ],
            tags: ["Autodesk Inventor", "Skirt Support", "ASME Sec VIII", "Anchor Ring"],
            metrics: "Base Ring Detailing • Skirt Cutouts",
            description: "Engineered vertical process vessel column featuring slotted anchor bolt base ring, skirt pipe sleeves, lifting lugs with reinforcement backing, shell manways, and flanged vapor outlets modeled with precision manufacturing tolerances."
        }
    ];

    async function loadProjects() {
        if (!projectsContainer) return;

        let projects = defaultProjects;
        try {
            const res = await fetch('projects.json?v=' + new Date().getTime());
            if (res.ok) {
                projects = await res.json();
            }
        } catch (e) {
            console.log('Using default projects data', e);
        }

        projectsContainer.innerHTML = '';

        projects.forEach((project, index) => {
            const tags = project.tags || [project.type || 'Engineering'];
            const isFeatured = project.type === 'Featured';
            const heroImg = project.heroImage || 'images/1-Isometric.jpg';
            const imgCount = project.images ? project.images.length : 1;

            const card = document.createElement('article');
            card.className = 'project-card reveal reveal-delay-' + Math.min(index % 3 + 1, 5);
            if (isFeatured) card.classList.add('featured');

            card.innerHTML = `
                <div class="card-border"></div>
                
                <div class="card-media">
                    <img src="${heroImg}" alt="${project.title}" class="card-media-img" loading="lazy">
                    <div class="card-media-overlay"></div>
                    <span class="card-spec-tag">${project.metrics || project.category || 'Mechanical'}</span>
                    <span class="card-gallery-count">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        ${imgCount} CAD Views
                    </span>
                    <div class="card-quick-zoom">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            <line x1="11" y1="8" x2="11" y2="14"></line>
                            <line x1="8" y1="11" x2="14" y2="11"></line>
                        </svg>
                    </div>
                </div>

                <div class="card-content">
                    <span class="badge-type">${project.category || project.type || 'Project'}</span>
                    <div class="card-header">
                        <h3>${project.title}</h3>
                        ${isFeatured ? '<span class="badge">Featured</span>' : ''}
                    </div>
                    <p>${project.description}</p>
                    <div class="card-footer">
                        <div class="card-tags">
                            ${tags.slice(0, 4).map(t => `<span>${t}</span>`).join('')}
                        </div>
                        <div class="card-arrow-btn">
                            <span>Inspect</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <line x1="5" y1="12" x2="19" y2="12"/>
                                <polyline points="12 5 19 12 12 19"/>
                            </svg>
                        </div>
                    </div>
                </div>
            `;

            // Card spotlight tracking
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
            });

            // 3D Tilt
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const rx = ((e.clientY - cy) / (rect.height / 2)) * 3;
                const ry = ((e.clientX - cx) / (rect.width / 2)) * -3;
                card.style.transform = `translateY(-8px) rotateX(${rx}deg) rotateY(${ry}deg)`;
                card.style.transformStyle = 'preserve-3d';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.transformStyle = '';
            });

            // Clicking media or inspect button opens project images in lightbox
            const mediaElem = card.querySelector('.card-media');
            const inspectBtn = card.querySelector('.card-arrow-btn');

            const handleCardClick = () => {
                if (project.images && project.images.length > 0) {
                    // Create a sub-list of gallery items corresponding to this project's images
                    const projectGalleryItems = project.images.map(imgSrc => {
                        const match = allGalleryItems.find(g => g.src === imgSrc);
                        return match || {
                            src: imgSrc,
                            title: project.title,
                            categoryLabel: project.category || 'Mechanical',
                            software: tags[0] || 'CAD',
                            desc: project.description
                        };
                    });
                    openLightbox(0, projectGalleryItems);
                } else {
                    const globalIdx = allGalleryItems.findIndex(g => g.src === project.heroImage);
                    openLightbox(globalIdx >= 0 ? globalIdx : 0, allGalleryItems);
                }
            };

            if (mediaElem) mediaElem.addEventListener('click', handleCardClick);
            if (inspectBtn) inspectBtn.addEventListener('click', handleCardClick);

            projectsContainer.appendChild(card);
            revealObserver.observe(card);
        });
    }

    loadProjects();


    /* ═══════════════════════════════════════════════════
       11. SMOOTH ACTIVE NAV LINK ON SCROLL
    ═══════════════════════════════════════════════════ */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.style.color = '';
                    if (link.getAttribute('href') === `#${entry.target.id}`) {
                        link.style.color = 'var(--text-primary)';
                    }
                });
            }
        });
    }, { threshold: 0.35 });

    sections.forEach(s => navObserver.observe(s));


    /* ═══════════════════════════════════════════════════
       12. CUSTOM CURSOR
    ═══════════════════════════════════════════════════ */
    if (window.matchMedia('(pointer: fine)').matches) {
        const dot = document.querySelector('.cursor-dot');
        const outline = document.querySelector('.cursor-outline');
        let ox = 0, oy = 0;

        window.addEventListener('mousemove', e => {
            if (dot) {
                dot.style.left = `${e.clientX}px`;
                dot.style.top = `${e.clientY}px`;
            }
            if (outline) {
                ox += (e.clientX - ox) * 0.14;
                oy += (e.clientY - oy) * 0.14;
            }
        }, { passive: true });

        if (outline) {
            (function animateOutline() {
                outline.style.left = `${ox}px`;
                outline.style.top = `${oy}px`;
                requestAnimationFrame(animateOutline);
            })();
        }

        document.querySelectorAll('a, button, .feature-card, .project-card, .gallery-item, .bento-item, .card-media, .hero-cad-card').forEach(el => {
            el.addEventListener('mouseenter', () => {
                if (dot) dot.classList.add('hover');
                if (outline) outline.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                if (dot) dot.classList.remove('hover');
                if (outline) outline.classList.remove('hover');
            });
        });
    }


    /* ═══════════════════════════════════════════════════
       13. ANIMATED STAT COUNTER
    ═══════════════════════════════════════════════════ */
    const statNumbers = document.querySelectorAll('.stat-number');

    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const raw = el.textContent.trim();
            const num = parseInt(raw);
            if (isNaN(num)) return;
            const suffix = raw.replace(/[0-9]/g, '');
            let start = 0;
            const dur = 1400;
            const step = (ts) => {
                if (!start) start = ts;
                const prog = Math.min((ts - start) / dur, 1);
                const eased = 1 - Math.pow(1 - prog, 3);
                el.textContent = Math.floor(eased * num) + suffix;
                if (prog < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
            countObserver.unobserve(el);
        });
    }, { threshold: 0.7 });

    statNumbers.forEach(el => countObserver.observe(el));


    /* ═══════════════════════════════════════════════════
       14. SCROLL READING PROGRESS
    ═══════════════════════════════════════════════════ */
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            const scrollPercent = (docHeight > 0) ? (scrollTop / docHeight) * 100 : 0;
            progressBar.style.width = scrollPercent + '%';
        }, { passive: true });
    }


    /* ═══════════════════════════════════════════════════
       15. BENTO GRID 3D TILT
    ═══════════════════════════════════════════════════ */
    const bentoItems = document.querySelectorAll('.bento-item');
    bentoItems.forEach(item => {
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const rx = ((e.clientY - cy) / (rect.height / 2)) * 4;
            const ry = ((e.clientX - cx) / (rect.width / 2)) * -4;
            item.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
        });

        item.addEventListener('mouseleave', () => {
            item.style.transform = '';
        });
    });


    /* ═══════════════════════════════════════════════════
       16. MAGNETIC BUTTONS
    ═══════════════════════════════════════════════════ */
    const magneticElements = document.querySelectorAll('.btn, .social-links a, .contact-link');
    magneticElements.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const h = rect.width / 2;
            const x = e.clientX - rect.left - h;
            const y = e.clientY - rect.top - (rect.height / 2);
            btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = ``;
        });
    });

});
