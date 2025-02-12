function getBaseURL() {
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  return isDevelopment ? '' : '/portfolio/';
}

export async function fetchJSON(url) {
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const baseURL = isDevelopment ? '' : '/portfolio';
  const currentPath = window.location.pathname;
  const isProjectsPage = currentPath.includes('/projects/');
  
  let fullURL;
  if (isProjectsPage) {
    fullURL = `${baseURL}/${url}`; 
  } else {
    fullURL = isDevelopment ? url : `${baseURL}/${url}`; 
  }
  
  console.log('Current Path:', currentPath);
  console.log('Base URL:', baseURL);
  console.log('Attempting to fetch URL:', fullURL);
  
  try {
    const response = await fetch(fullURL);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
    return null;
  }
}

export function renderProjects(project, containerElement, headingLevel = 'h2') {
  if (!containerElement) return;
  
  const article = document.createElement('article');
  
  article.innerHTML = `
    <${headingLevel}>${project.title} (${project.year})</${headingLevel}>
    <p>${project.description}</p>
  `;
  
  containerElement.appendChild(article);
}

export async function fetchGitHubData(username) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('GitHub API fetch error:', error);
    return null;
  }
}

console.log('IT\'S ALIVE!');

document.addEventListener('DOMContentLoaded', async () => {
  function getBaseURL() {
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return isDevelopment ? '/' : '/portfolio/';
  }

  // Clear existing header if any
  const existingHeader = document.querySelector('header');
  if (existingHeader) {
    existingHeader.remove();
  }

  // Create header container
  const header = document.createElement('header');
  header.style.padding = '1rem';
  header.style.display = 'flex';
  header.style.flexDirection = 'column';
  header.style.alignItems = 'center';
  header.style.gap = '1rem';
  header.style.position = 'relative'; // Add relative positioning
  
  // Create and setup navigation
  const nav = document.createElement('nav');
  nav.style.display = 'flex';
  nav.style.flexWrap = 'wrap';
  nav.style.gap = '1rem';
  nav.style.justifyContent = 'center';
  nav.style.alignItems = 'center';
  nav.style.width = '100%';
  nav.style.marginBottom = '1rem';
  nav.style.position = 'relative'; // Ensure nav is positioned
  nav.style.zIndex = '1'; // Give nav a higher z-index

  // Define pages
  const pages = [
    { url: 'index.html', title: 'Home' },
    { url: 'contact/index.html', title: 'Contact' },
    { url: 'projects/index.html', title: 'Projects' },
    { url: 'https://github.com/nadineorriss', title: 'GitHub', external: true },
    { url: 'resume/index.html', title: 'Resume' },
    { url: 'meta/index.html', title: 'Meta' }  // Add this line
];
  
  // Create navigation links
  pages.forEach(p => {
    const a = document.createElement('a');
    const baseURL = getBaseURL();
    a.href = p.external || p.url.startsWith('http') ? p.url : `${baseURL}${p.url}`;
    a.textContent = p.title;
    a.target = p.external ? '_blank' : '';
    a.style.color = '#FF69B4';
    a.style.textDecoration = 'none';
    a.style.padding = '0.5rem'; // Add padding to make links more clickable
    nav.appendChild(a);
  });

  // Add navigation to header first
  header.appendChild(nav);

  // Create theme selector container
  const themeContainer = document.createElement('div');
  themeContainer.style.width = '100%';
  themeContainer.style.display = 'flex';
  themeContainer.style.justifyContent = 'center';
  themeContainer.style.paddingTop = '1rem'; // Add padding to separate from nav
  themeContainer.style.borderTop = '1px solid #eee'; // Add subtle separator
  themeContainer.style.position = 'relative'; // Ensure proper stacking
  themeContainer.style.zIndex = '0'; // Lower z-index than nav

  // Create theme selector
  const themeLabel = document.createElement('label');
  themeLabel.className = 'color-scheme';
  themeLabel.style.fontFamily = 'Arial, sans-serif';

  const themeSelect = document.createElement('select');
  themeSelect.id = 'theme-selector';
  themeSelect.style.minWidth = '100px';
  themeSelect.style.backgroundColor = '#FFE6F3';
  themeSelect.style.border = '2px solid #FF69B4';
  themeSelect.style.borderRadius = '20px';
  themeSelect.style.padding = '8px 15px';
  themeSelect.style.color = '#FF69B4';
  themeSelect.style.fontFamily = 'Arial, sans-serif';
  themeSelect.style.cursor = 'pointer';
  themeSelect.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';

  // Add theme options
  ['auto', 'light', 'dark'].forEach(option => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option.charAt(0).toUpperCase() + option.slice(1);
    themeSelect.appendChild(opt);
  });

  // Add theme selector to label and container
  themeLabel.appendChild(themeSelect);
  themeContainer.appendChild(themeLabel);
  header.appendChild(themeContainer);

  // Add header to document
  document.body.prepend(header);

  // Add responsive styles with improved mobile support
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 768px) {
      header {
        padding: 0.5rem;
      }
      
      nav {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.5rem;
        margin-bottom: 1rem;
        width: 100%;
      }
      
      nav a {
        display: inline-block;
        padding: 0.5rem;
        min-width: 60px;
        text-align: center;
      }
      
      .color-scheme {
        display: block;
        margin-top: 0.5rem;
        width: 100%;
        text-align: center;
      }
      
      #theme-selector {
        width: auto;
        min-width: 120px;
      }
    }

    a {
      color: #FF69B4 !important;
    }
    
    h1, h2, h3, h4, h5, h6 {
      color: #FF69B4;
    }
  `;
  document.head.appendChild(style);

  // Theme switcher functionality
  function setColorScheme(scheme) {
    const actualScheme = scheme === 'auto'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : scheme;
    
    document.documentElement.style.colorScheme = actualScheme;
    themeSelect.value = scheme;
    localStorage.setItem('colorScheme', scheme);
    
    themeLabel.style.color = actualScheme === 'dark' ? '#ffffff' : '#000000';
  }

  // Set up theme selector event listener
  themeSelect.addEventListener('change', (e) => setColorScheme(e.target.value));
  
  // Set initial theme
  const savedScheme = localStorage.getItem('colorScheme') || 'auto';
  setColorScheme(savedScheme);
});