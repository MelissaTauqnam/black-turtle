// ============================================
// MEKAVERSE - Animations & Interactivity
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    // --- Loader ---
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.classList.add('hidden');
        animateHero();
    }, 1800);

    // --- Custom Cursor ---
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.left = mouseX - 4 + 'px';
        cursor.style.top = mouseY - 4 + 'px';
    });

    function animateCursor() {
        followerX += (mouseX - followerX) * 0.12;
        followerY += (mouseY - followerY) * 0.12;
        follower.style.left = followerX - 18 + 'px';
        follower.style.top = followerY - 18 + 'px';
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Cursor hover effects
    const interactiveElements = document.querySelectorAll('a, button, .faction-card, .gallery-card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            follower.style.width = '50px';
            follower.style.height = '50px';
            follower.style.opacity = '0.2';
            follower.style.left = followerX - 25 + 'px';
            follower.style.top = followerY - 25 + 'px';
        });
        el.addEventListener('mouseleave', () => {
            follower.style.width = '36px';
            follower.style.height = '36px';
            follower.style.opacity = '0.4';
        });
    });

    // --- Hero Animation ---
    function animateHero() {
        const subtitle = document.querySelector('.hero-subtitle');
        const titleLines = document.querySelectorAll('.title-line');
        const desc = document.querySelector('.hero-desc');
        const actions = document.querySelector('.hero-actions');
        const meka = document.querySelector('.hero-meka');

        setTimeout(() => {
            subtitle.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
            subtitle.style.opacity = '1';
            subtitle.style.transform = 'translateY(0)';
        }, 100);

        titleLines.forEach((line, i) => {
            setTimeout(() => {
                line.style.transition = 'all 1s cubic-bezier(0.16, 1, 0.3, 1)';
                line.style.opacity = '1';
                line.style.transform = 'translateY(0)';
            }, 300 + i * 150);
        });

        setTimeout(() => {
            desc.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
            desc.style.opacity = '1';
            desc.style.transform = 'translateY(0)';
        }, 700);

        setTimeout(() => {
            actions.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
            actions.style.opacity = '1';
            actions.style.transform = 'translateY(0)';
        }, 900);

        setTimeout(() => {
            meka.style.transition = 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
            meka.style.opacity = '1';
        }, 500);
    }

    // --- Scroll Animations (Intersection Observer) ---
    const animateElements = document.querySelectorAll('[data-animate]');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger siblings
                const parent = entry.target.parentElement;
                const siblings = parent.querySelectorAll('[data-animate]');
                let delay = 0;
                siblings.forEach((sibling) => {
                    if (sibling === entry.target) {
                        setTimeout(() => {
                            entry.target.classList.add('visible');
                        }, delay);
                    }
                    delay += 100;
                });

                // Fallback: always show after a bit
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, 300);

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animateElements.forEach(el => observer.observe(el));

    // --- Counter Animation ---
    function animateCounters() {
        const counters = document.querySelectorAll('[data-count]');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000;
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(eased * target);

                counter.textContent = current.toLocaleString();

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target.toLocaleString();
                }
            }

            requestAnimationFrame(updateCounter);
        });
    }

    // Trigger counters when stats bar is visible
    const statsBar = document.querySelector('.stats-bar');
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                // Also animate stat elements
                document.querySelectorAll('.stat').forEach((stat, i) => {
                    setTimeout(() => {
                        stat.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
                        stat.style.opacity = '1';
                        stat.style.transform = 'translateY(0)';
                    }, i * 150);
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    statsObserver.observe(statsBar);

    // --- Faction Cards Stagger ---
    const factionCards = document.querySelectorAll('.faction-card');
    const factionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                factionCards.forEach((card, i) => {
                    setTimeout(() => {
                        card.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, i * 120);
                });
                factionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    if (factionCards.length) {
        factionObserver.observe(factionCards[0]);
    }

    // --- Gallery Items Stagger ---
    const galleryItems = document.querySelectorAll('.gallery-item');
    const galleryObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                galleryItems.forEach((item, i) => {
                    setTimeout(() => {
                        item.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, i * 120);
                });
                galleryObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    if (galleryItems.length) {
        galleryObserver.observe(galleryItems[0]);
    }

    // --- Roadmap Items Stagger ---
    const roadmapItems = document.querySelectorAll('.roadmap-item');
    const roadmapObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.3 });

    roadmapItems.forEach(item => roadmapObserver.observe(item));

    // --- Mobile Menu ---
    const burger = document.getElementById('nav-burger');
    const mobileMenu = document.getElementById('mobile-menu');

    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // --- Smooth Scroll for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // --- Parallax on Hero ---
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const hero = document.querySelector('.hero-content');
        const meka = document.querySelector('.hero-meka');

        if (scrollY < window.innerHeight) {
            hero.style.transform = `translateY(${scrollY * 0.3}px)`;
            hero.style.opacity = 1 - scrollY / (window.innerHeight * 0.8);

            if (meka) {
                meka.style.transform = `translateY(calc(-50% + ${scrollY * 0.15}px))`;
            }
        }
    });

    // --- Nav background on scroll ---
    const nav = document.querySelector('.nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            nav.style.background = 'rgba(5, 5, 7, 0.95)';
        } else {
            nav.style.background = 'linear-gradient(180deg, rgba(5,5,7,0.9) 0%, transparent 100%)';
        }
    });

});
