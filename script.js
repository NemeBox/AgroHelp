// 1. Scroll Progress Indicator
const progress = document.createElement('div');
progress.style.cssText = `position: fixed; top: 0; left: 0; height: 4px; background: #81c784; z-index: 10001; transition: width 0.1s;`;
document.body.appendChild(progress);

window.addEventListener('scroll', () => {
    const scrolled = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    progress.style.width = scrolled + '%';
});

// 2. Reveal Observer Logic
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));