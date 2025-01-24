console.log('IT’S ALIVE!');

document.addEventListener('DOMContentLoaded', () => {
    const pages = [
        { url: 'index.html', title: 'Home' },
        { url: 'contact/index.html', title: 'Contact' },
        { url: 'projects/index.html', title: 'Projects' },
        { url: 'https://github.com/nadineorriss', title: 'Profile', external: true },
        { url: 'resume/index.html', title: 'Resume' }
    ];

    let nav = document.createElement('nav');
    document.body.prepend(nav);

    const ARE_WE_HOME = document.documentElement.classList.contains('home');

    pages.forEach(p => {
        let url = p.url;
        if (!ARE_WE_HOME && !p.external && !url.startsWith('http')) {
            url = '../' + url;
        }
        let a = document.createElement('a');
        a.href = url;
        a.textContent = p.title;
        if (p.external || url.startsWith('http')) {
            a.target = '_blank';
        }
        if (window.location.pathname.endsWith(url)) {
            a.classList.add('current');
        }
        nav.appendChild(a);
    });
});
