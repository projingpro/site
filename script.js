document.addEventListener('DOMContentLoaded', () => {
    // Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');

    menuToggle.addEventListener('click', () => {
        document.body.classList.toggle('nav-open');
    });

    // Hide badge in iframe or puppeteer
    const badge = document.getElementById('lovable-badge');
    if (badge && (window.self !== window.top || navigator.userAgent.includes('puppeteer'))) {
        badge.style.display = 'none';
    }

    // Badge close button
    const closeButton = document.getElementById('lovable-badge-close');
    if (closeButton) {
        closeButton.addEventListener('click', (event) => {
            event.preventDefault();
            badge.style.display = 'none';
        });
    }
});