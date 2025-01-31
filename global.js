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
    
    select.style.backgroundColor = '#FFE6F3';
    select.style.border = '2px solid #FF69B4';
    select.style.borderRadius = '20px';
    select.style.padding = '8px 15px';
    select.style.color = '#FF69B4';  // Changed to match resume pink
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

  // Create header container
  const header = document.createElement('header');
  header.style.padding = '1rem';
  header.style.display = 'flex';
  header.style.flexWrap = 'wrap';
  header.style.alignItems = 'center';
  header.style.justifyContent = 'space-between';
  header.style.gap = '1rem';
  document.body.prepend(header);

  // Create navigation
  const nav = document.createElement('nav');
  nav.style.display = 'flex';
  nav.style.flexWrap = 'wrap';
  nav.style.gap = '1rem';
  nav.style.alignItems = 'center';
  
  pages.forEach(p => {
    let a = document.createElement('a');
    const baseURL = getBaseURL();
    a.href = p.external || p.url.startsWith('http') ? p.url : `${baseURL}${p.url}`;
    a.textContent = p.title;
    a.target = p.external ? '_blank' : '';
    a.style.color = '#FF69B4';  // Added to match resume pink
    a.style.textDecoration = 'none';  // Added to match resume style
    nav.appendChild(a);
  });

  // Create theme switcher container
  const themeSwitcherHTML = `
    <label class="color-scheme" style="font-family: Arial, sans-serif; margin-left: auto;">
      <select id='theme-selector' style="min-width: 100px;">
        <option value='auto'>Automatic</option>
        <option value='light'>Light</option>
        <option value='dark'>Dark</option>
      </select>
    </label>
  `;

  // Add nav and theme switcher to header
  header.appendChild(nav);
  header.insertAdjacentHTML('beforeend', themeSwitcherHTML);

  // Add responsive styles
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 768px) {
      header {
        flex-direction: column;
        align-items: stretch;
      }
      
      nav {
        order: 2;
        justify-content: center;
      }
      
      .color-scheme {
        order: 1;
        text-align: center;
      }
    }

    /* Add styles for consistent pink colors */
    a {
      color: #FF69B4 !important;
    }
    
    h1, h2, h3, h4, h5, h6 {
      color: #FF69B4;
    }
  `;
  document.head.appendChild(style);

  const selector = document.getElementById('theme-selector');
  selector.addEventListener('change', () => setColorScheme(selector.value));
  const savedScheme = localStorage.getItem('colorScheme') || 'auto';
  setColorScheme(savedScheme);
});