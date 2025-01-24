console.log('IT\'S ALIVE!');
document.addEventListener('DOMContentLoaded', () => {
  function setColorScheme(scheme) {
    const actualScheme = scheme === 'auto' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : scheme;
    document.documentElement.style.colorScheme = actualScheme;
    const selector = document.getElementById('theme-selector');
    selector.value = scheme;
    localStorage.setItem('colorScheme', scheme);
    
    const label = document.querySelector('.color-scheme');
    const select = document.getElementById('theme-selector');
    
    if (scheme === 'dark') {
      label.style.color = '#ffffff';
    } else {
      label.style.color = '#000000';
    }

    // Pretty styling maintained in both modes
    select.style.backgroundColor = '#FFE6F3';
    select.style.border = '2px solid #FF69B4';
    select.style.borderRadius = '20px';
    select.style.padding = '8px 15px';
    select.style.color = '#FF1493';
    select.style.fontFamily = 'Arial, sans-serif';
    select.style.cursor = 'pointer';
    select.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  }

  const pages = [
    { url: 'index.html', title: 'Home' },
    { url: 'contact/index.html', title: 'Contact' },
    { url: 'projects/index.html', title: 'Projects' },
    { url: 'https://github.com/nadineorriss', title: 'Profile', external: true },
    { url: 'resume/index.html', title: 'Resume' }
  ];

  let nav = document.createElement('nav');
  document.body.prepend(nav);
  pages.forEach(p => {
    let url = p.url;
    let a = document.createElement('a');
    a.href = p.external || url.startsWith('http') ? p.url : `../${p.url}`;
    a.textContent = p.title;
    a.target = p.external ? '_blank' : '';
    const currentUrl = new URL(a.href, window.location.href).pathname;
    const currentPath = window.location.pathname;
    a.classList.toggle('current', currentUrl === currentPath);
    nav.appendChild(a);
  });

  const themeSwitcherHTML = `
    <label class="color-scheme" style="font-family: Arial, sans-serif;">
      <select id="theme-selector">
        <option value="auto">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  `;
  
  document.body.insertAdjacentHTML('afterbegin', themeSwitcherHTML);
  const selector = document.getElementById('theme-selector');
  selector.addEventListener('change', () => {
    setColorScheme(selector.value);
  });

  const savedScheme = localStorage.getItem('colorScheme') || 'light';
  setColorScheme(savedScheme);

  // Add hover effect
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    #theme-selector:hover {
      background-color: #FFD1E8 !important;
      transform: translateY(-1px);
      transition: all 0.2s ease;
    }
  `;
  document.head.appendChild(styleSheet);
});