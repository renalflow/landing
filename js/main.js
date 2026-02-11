/**
 * RenalFlow Landing Page - Main JavaScript
 * Core functionality and interactions
 */

// ===== Configuration =====
const CONFIG = {
    scrollThreshold: 100,
    animationDelay: 100,
    carouselAutoplayDelay: 5000,
    statsAnimationDuration: 2000
};

// ===== DOM Elements =====
const DOM = {
    navbar: null,
    mobileMenuToggle: null,
    navMenu: null,
    langToggle: null,
    scrollTopBtn: null,
    progressBar: null,
    accordionItems: null,
    carouselTrack: null,
    carouselDots: null
};

// ===== State =====
const STATE = {
    currentLanguage: 'ar',
    isMenuOpen: false,
    currentSlide: 0,
    isAnimating: false
};

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    initializeDOM();
    initializeEventListeners();
    initializeAnimations();
    initializeLanguage();
    initializeStats();
    initializeVisibilityTracker(); // New: Smart Page Titles
    startCarouselAutoplay();
});

// ===== DOM Initialization =====
function initializeDOM() {
    DOM.navbar = document.querySelector('.navbar');
    DOM.mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    DOM.navMenu = document.querySelector('.nav-menu');
    DOM.langToggle = document.querySelector('.lang-toggle');
    DOM.scrollTopBtn = document.querySelector('.scroll-top');
    DOM.progressBar = document.querySelector('.progress-bar');
    DOM.accordionItems = document.querySelectorAll('.accordion-item');
    DOM.carouselTrack = document.querySelector('.carousel-track');
    DOM.carouselDots = document.querySelectorAll('.carousel-dot');
}

// ===== Event Listeners =====
function initializeEventListeners() {
    // Scroll Events - Optimized with passive: true and throttling
    window.addEventListener('scroll', throttle(handleScroll, 50), { passive: true });
    window.addEventListener('scroll', throttle(updateProgressBar, 10), { passive: true });

    // Handle Resize - Fixed: Reposition carousel on window resize
    window.addEventListener('resize', debounce(() => {
        goToSlide(STATE.currentSlide);
    }, 250));

    // Mobile Menu
    if (DOM.mobileMenuToggle) {
        DOM.mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }

    // Language Toggle
    if (DOM.langToggle) {
        DOM.langToggle.addEventListener('click', toggleLanguage);
    }

    // Scroll to Top
    if (DOM.scrollTopBtn) {
        DOM.scrollTopBtn.addEventListener('click', scrollToTop);
    }

    // Smooth Scroll for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', handleSmoothScroll);
    });

    // Accordion
    DOM.accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        if (header) {
            header.addEventListener('click', () => toggleAccordion(item));
        }
    });

    // Carousel
    if (DOM.carouselDots) {
        DOM.carouselDots.forEach((dot, index) => {
            dot.addEventListener('click', () => goToSlide(index));
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (STATE.isMenuOpen &&
            !DOM.navMenu.contains(e.target) &&
            !DOM.mobileMenuToggle.contains(e.target)) {
            closeMobileMenu();
        }
    });
}

// ===== Scroll Handling =====
function handleScroll() {
    const scrollY = window.scrollY;

    // Navbar background
    if (scrollY > CONFIG.scrollThreshold) {
        DOM.navbar?.classList.add('scrolled');
    } else {
        DOM.navbar?.classList.remove('scrolled');
    }

    // Scroll to top button
    if (scrollY > 500) {
        DOM.scrollTopBtn?.classList.add('visible');
    } else {
        DOM.scrollTopBtn?.classList.remove('visible');
    }
}

function updateProgressBar() {
    if (!DOM.progressBar) return;

    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;

    DOM.progressBar.style.transform = `scaleX(${scrollPercent / 100})`;
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function handleSmoothScroll(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');

    if (targetId === '#') return;

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
        const navbarHeight = DOM.navbar?.offsetHeight || 0;
        const targetPosition = targetElement.offsetTop - navbarHeight;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        // Close mobile menu if open
        if (STATE.isMenuOpen) {
            closeMobileMenu();
        }
    }
}

// ===== Mobile Menu =====
function toggleMobileMenu() {
    STATE.isMenuOpen = !STATE.isMenuOpen;

    DOM.mobileMenuToggle?.classList.toggle('active');
    DOM.navMenu?.classList.toggle('active');
    document.body.style.overflow = STATE.isMenuOpen ? 'hidden' : '';
}

function closeMobileMenu() {
    STATE.isMenuOpen = false;
    DOM.mobileMenuToggle?.classList.remove('active');
    DOM.navMenu?.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== Language Toggle =====
function toggleLanguage() {
    STATE.currentLanguage = STATE.currentLanguage === 'ar' ? 'en' : 'ar';
    updateLanguage();
}

function initializeLanguage() {
    // Check for saved language preference
    const savedLang = localStorage.getItem('renalflow-lang');
    if (savedLang) {
        STATE.currentLanguage = savedLang;
    }
    updateLanguage();
}

function updateLanguage() {
    const lang = STATE.currentLanguage;

    // Update HTML attributes
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';

    // Update all translatable elements
    document.querySelectorAll('[data-ar][data-en]').forEach(element => {
        element.textContent = element.getAttribute(`data-${lang}`);
    });

    // Update language toggle button
    const langText = DOM.langToggle?.querySelector('#langText');
    if (langText) {
        langText.textContent = lang === 'ar' ? 'EN' : 'ع';
    }

    // Save preference
    localStorage.setItem('renalflow-lang', lang);

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
}

// ===== Accordion =====
function toggleAccordion(item) {
    const isActive = item.classList.contains('active');

    // Close all accordions
    DOM.accordionItems.forEach(accordionItem => {
        accordionItem.classList.remove('active');
    });

    // Open clicked accordion if it wasn't active
    if (!isActive) {
        item.classList.add('active');
    }
}

// ===== Carousel =====
function goToSlide(index) {
    if (!DOM.carouselTrack || STATE.isAnimating) return;

    STATE.isAnimating = true;
    STATE.currentSlide = index;

    const slides = DOM.carouselTrack.querySelectorAll('.carousel-slide');
    const slideWidth = slides[0]?.offsetWidth || 0;
    const gap = 24; // var(--spacing-xl)
    const offset = index * (slideWidth + gap);

    DOM.carouselTrack.scrollTo({
        left: offset,
        behavior: 'smooth'
    });

    // Update dots
    DOM.carouselDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });

    setTimeout(() => {
        STATE.isAnimating = false;
    }, 500);
}

// Auto-advance carousel
function startCarouselAutoplay() {
    if (!DOM.carouselTrack) return;

    setInterval(() => {
        const slides = DOM.carouselTrack.querySelectorAll('.carousel-slide');
        const nextSlide = (STATE.currentSlide + 1) % slides.length;
        goToSlide(nextSlide);
    }, CONFIG.carouselAutoplayDelay);
}

// ===== Animations =====
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all animatable elements
    document.querySelectorAll('.feature-card, .problem-card, .solution-card, .testimonial-card, .timeline-item').forEach(el => {
        observer.observe(el);
    });
}

// ===== Stats Counter Animation =====
function initializeStats() {
    const stats = document.querySelectorAll('.stat-number');

    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                animateNumber(entry.target);
                entry.target.dataset.animated = 'true';
            }
        });
    }, observerOptions);

    stats.forEach(stat => observer.observe(stat));
}

function animateNumber(element) {
    const text = element.textContent;
    const hasPlus = text.includes('+');
    const hasPercent = text.includes('%');
    const targetNumber = parseInt(text.replace(/[^0-9]/g, ''));

    if (isNaN(targetNumber)) return;

    const duration = CONFIG.statsAnimationDuration;
    const steps = 60;
    const stepDuration = duration / steps;
    const increment = targetNumber / steps;

    let current = 0;

    const timer = setInterval(() => {
        current += increment;

        if (current >= targetNumber) {
            current = targetNumber;
            clearInterval(timer);
        }

        let displayValue = Math.floor(current).toString();
        if (hasPlus) displayValue += '+';
        if (hasPercent) displayValue += '%';

        element.textContent = displayValue;
    }, stepDuration);
}

// ===== Utility Functions =====
// ===== Utility Functions =====
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

function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===== Visibility Tracker (Smart Titles) =====
function initializeVisibilityTracker() {
    const originalTitle = document.title;
    const farewellMessage = 'نفتقدك! عد لـ RenalFlow 🏥';

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            document.title = farewellMessage;
        } else {
            document.title = originalTitle;
        }
    });
}

// ===== Form Handling (if needed) =====
function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    console.log('Form submitted:', Object.fromEntries(formData));
}

// ===== Analytics (Google Analytics) =====
function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
}

// Track download button clicks
document.querySelectorAll('.btn-download, .btn-primary[href*="apk"]').forEach(btn => {
    btn.addEventListener('click', () => {
        trackEvent('engagement', 'download_click', 'APK Download');
    });
});

// ===== Download Consent Modal =====
function initializeDownloadModal() {
    const modal = document.getElementById('downloadModal');
    const closeBtn = document.getElementById('closeModal');
    const consentCheckbox = document.getElementById('consentCheck');
    const modalDownloadBtn = document.getElementById('modalDownloadBtn');
    const downloadButtons = document.querySelectorAll('a[href*="app-release.apk"]');

    if (!modal || !consentCheckbox || !modalDownloadBtn) return;

    // Intercept all download button clicks
    downloadButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });

    // Close modal
    const closeModal = () => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        consentCheckbox.checked = false;
        updateDownloadButton();
    };

    closeBtn?.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Handle checkbox state
    const updateDownloadButton = () => {
        if (consentCheckbox.checked) {
            modalDownloadBtn.style.opacity = '1';
            modalDownloadBtn.style.pointerEvents = 'auto';
            modalDownloadBtn.removeAttribute('disabled');
        } else {
            modalDownloadBtn.style.opacity = '0.5';
            modalDownloadBtn.style.pointerEvents = 'none';
            modalDownloadBtn.setAttribute('disabled', 'true');
        }
    };

    consentCheckbox.addEventListener('change', updateDownloadButton);

    // Allow download and close modal
    modalDownloadBtn.addEventListener('click', () => {
        if (consentCheckbox.checked) {
            setTimeout(closeModal, 500);
        }
    });
}

// Initialize modal after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDownloadModal);
} else {
    initializeDownloadModal();
}

// ===== Export for use in other scripts =====
window.RenalFlow = {
    STATE,
    toggleLanguage,
    goToSlide,
    trackEvent
};

// ===== Console Message =====
console.log('%c🩺 RenalFlow Landing Page', 'color: #00A8FF; font-size: 20px; font-weight: bold;');
console.log('%cDeveloped by Feras Swed', 'color: #00FBAD; font-size: 14px;');
