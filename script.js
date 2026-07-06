document.addEventListener('DOMContentLoaded', () => {

    // ── Footer year ──
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ── Loading Progress Bar ──
    const loader = document.getElementById('loader');
    const bar = document.getElementById('progress-bar');

    if (loader && bar) {
        let progress = 0;
        const tick = setInterval(() => {
            progress += Math.random() * 18 + 8;
            if (progress >= 100) {
                progress = 100;
                clearInterval(tick);
                bar.style.width = '100%';
                setTimeout(() => {
                    loader.classList.add('hidden');
                    setTimeout(() => { loader.style.display = 'none'; }, 600);
                }, 350);
            } else {
                bar.style.width = progress + '%';
            }
        }, 120);
    }

    // ── Header scroll effect ──
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });

    // ── Mobile menu toggle ──
    const mobileToggle = document.getElementById('mobileToggle');
    const nav = document.querySelector('.nav');
    if (mobileToggle && nav) {
        mobileToggle.addEventListener('click', () => {
            nav.classList.toggle('open');
        });
        // Close nav when a link is tapped
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => nav.classList.remove('open'));
        });
    }

    // ── Scroll Reveal (IntersectionObserver) ──
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

        reveals.forEach(el => observer.observe(el));
    }

    // ── Carousel ──
    const track = document.getElementById('carouselTrack');
    const viewport = document.getElementById('carouselViewport');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const dotsContainer = document.getElementById('carouselDots');

    if (track && viewport && prevBtn && nextBtn && dotsContainer) {
        const originalSlides = Array.from(track.children);
        const totalOriginal = originalSlides.length;
        let autoTimer = null;
        const AUTO_INTERVAL = 3000;

        // Determine slides visible at once
        const getSlidesVisible = () => {
            if (window.innerWidth >= 1024) return 3;
            if (window.innerWidth >= 768) return 2;
            return 1;
        };

        // Clone all slides and append for infinite effect
        originalSlides.forEach(slide => {
            const clone = slide.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            track.appendChild(clone);
        });

        const allSlides = Array.from(track.children); // originals + clones
        let currentIndex = 0;
        let isAnimating = false;

        const slideWidthPercent = () => 100 / getSlidesVisible();

        const setPosition = (animate) => {
            if (animate) {
                track.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            } else {
                track.style.transition = 'none';
            }
            track.style.transform = `translateX(-${currentIndex * slideWidthPercent()}%)`;
        };

        // Build dots (only for original slides)
        const buildDots = () => {
            dotsContainer.innerHTML = '';
            for (let i = 0; i < totalOriginal; i++) {
                const dot = document.createElement('button');
                dot.classList.add('carousel-dot');
                dot.setAttribute('aria-label', `Slide ${i + 1}`);
                if (i === currentIndex % totalOriginal) dot.classList.add('active');
                dot.addEventListener('click', () => {
                    resetAuto();
                    goTo(i, true);
                });
                dotsContainer.appendChild(dot);
            }
        };

        const updateDots = () => {
            const activeIdx = currentIndex % totalOriginal;
            dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === activeIdx);
            });
        };

        const goTo = (index, animate = true) => {
            if (isAnimating) return;
            isAnimating = true;
            currentIndex = index;
            setPosition(animate);
            updateDots();
        };

        // After transition ends, silently snap back if we're in clone territory
        track.addEventListener('transitionend', () => {
            isAnimating = false;
            if (currentIndex >= totalOriginal) {
                currentIndex = currentIndex - totalOriginal;
                setPosition(false); // instant jump, no animation
            }
        });

        const next = () => {
            if (isAnimating) return;
            goTo(currentIndex + 1, true);
        };

        const prev = () => {
            if (isAnimating) return;
            if (currentIndex <= 0) {
                // Jump to clone region instantly, then animate back
                currentIndex = totalOriginal;
                setPosition(false);
                // Force reflow before animating
                track.offsetHeight;
                goTo(totalOriginal - 1, true);
            } else {
                goTo(currentIndex - 1, true);
            }
        };

        nextBtn.addEventListener('click', () => { resetAuto(); next(); });
        prevBtn.addEventListener('click', () => { resetAuto(); prev(); });

        // Auto-play
        const startAuto = () => {
            stopAuto();
            autoTimer = setInterval(next, AUTO_INTERVAL);
        };

        const stopAuto = () => {
            if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
        };

        const resetAuto = () => { stopAuto(); startAuto(); };

        // Pause on hover/touch
        viewport.addEventListener('mouseenter', stopAuto);
        viewport.addEventListener('mouseleave', startAuto);
        viewport.addEventListener('touchstart', stopAuto, { passive: true });
        viewport.addEventListener('touchend', () => setTimeout(startAuto, 2000));

        // Touch swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        viewport.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        viewport.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                resetAuto();
                diff > 0 ? next() : prev();
            }
        });

        // Handle resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                isAnimating = false;
                if (currentIndex >= totalOriginal) currentIndex = currentIndex % totalOriginal;
                buildDots();
                setPosition(false);
                updateDots();
            }, 200);
        });

        // Init
        buildDots();
        startAuto();
    }

    // ── About Section Carousel ──
    const aboutTrack = document.getElementById('aboutTrack');
    const aboutViewport = document.getElementById('aboutViewport');
    const aboutPrev = document.getElementById('aboutPrev');
    const aboutNext = document.getElementById('aboutNext');

    if (aboutTrack && aboutViewport && aboutPrev && aboutNext) {
        const aboutOriginals = Array.from(aboutTrack.children);
        const aboutTotal = aboutOriginals.length;
        const ABOUT_INTERVAL = 3000;
        let aboutIndex = 0;
        let aboutAnimating = false;
        let aboutTimer = null;

        // Clone slides for infinite loop
        aboutOriginals.forEach(slide => {
            const clone = slide.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            aboutTrack.appendChild(clone);
        });

        const aboutSetPos = (animate) => {
            aboutTrack.style.transition = animate
                ? 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                : 'none';
            aboutTrack.style.transform = `translateX(-${aboutIndex * 100}%)`;
        };

        aboutTrack.addEventListener('transitionend', () => {
            aboutAnimating = false;
            if (aboutIndex >= aboutTotal) {
                aboutIndex = aboutIndex - aboutTotal;
                aboutSetPos(false);
            }
        });

        const aboutGoTo = (i, animate = true) => {
            if (aboutAnimating) return;
            aboutAnimating = true;
            aboutIndex = i;
            aboutSetPos(animate);
        };

        const aboutNextSlide = () => {
            if (aboutAnimating) return;
            aboutGoTo(aboutIndex + 1, true);
        };

        const aboutPrevSlide = () => {
            if (aboutAnimating) return;
            if (aboutIndex <= 0) {
                aboutIndex = aboutTotal;
                aboutSetPos(false);
                aboutTrack.offsetHeight;
                aboutGoTo(aboutTotal - 1, true);
            } else {
                aboutGoTo(aboutIndex - 1, true);
            }
        };

        const aboutStartAuto = () => {
            aboutStopAuto();
            aboutTimer = setInterval(aboutNextSlide, ABOUT_INTERVAL);
        };
        const aboutStopAuto = () => {
            if (aboutTimer) { clearInterval(aboutTimer); aboutTimer = null; }
        };
        const aboutResetAuto = () => { aboutStopAuto(); aboutStartAuto(); };

        aboutNext.addEventListener('click', () => { aboutResetAuto(); aboutNextSlide(); });
        aboutPrev.addEventListener('click', () => { aboutResetAuto(); aboutPrevSlide(); });

        aboutViewport.addEventListener('mouseenter', aboutStopAuto);
        aboutViewport.addEventListener('mouseleave', aboutStartAuto);
        aboutViewport.addEventListener('touchstart', aboutStopAuto, { passive: true });
        aboutViewport.addEventListener('touchend', () => setTimeout(aboutStartAuto, 2000));

        // Touch swipe
        let aboutTouchStart = 0;
        aboutViewport.addEventListener('touchstart', (e) => {
            aboutTouchStart = e.changedTouches[0].screenX;
        }, { passive: true });
        aboutViewport.addEventListener('touchend', (e) => {
            const diff = aboutTouchStart - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) {
                aboutResetAuto();
                diff > 0 ? aboutNextSlide() : aboutPrevSlide();
            }
        });

        aboutStartAuto();
    }

    // ── Smooth anchor scroll for nav links ──
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const id = anchor.getAttribute('href');
            if (id === '#') return;
            const target = document.querySelector(id);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});
