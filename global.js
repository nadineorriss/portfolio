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
    // When in projects page, construct the path correctly for both environments
    fullURL = `${baseURL}/${url}`; // This will work for both local and GitHub Pages
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
    
    // Update colors based on theme and page
    const isResumePage = window.location.pathname.includes('resume');
    
    if (scheme === 'dark') {
      label.style.color = '#ffffff';
      if (!isResumePage) {
        document.body.style.backgroundColor = '#1a1a1a';
      }
    } else {
      label.style.color = '#000000';
      if (!isResumePage) {
        document.body.style.backgroundColor = '#fff0f5'; // Light pink background
      }
    }
    
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

  // Add CSS styles
  const style = document.createElement('style');
  style.textContent = `
    :root {
      color-scheme: light dark;
      --border-color: oklch(80% 3% 200);
      --border-color-dark: oklch(50% 10% 200 / 40%);
      --color-accent: #FF69B4;
      --hover-background-light: #f2e2f2;
      --hover-background-dark: #b482b4;
      --background-light: #fff0f5;
      --background-dark: #1a1a1a;
    }

    body:not(.resume-page) {
      margin: 0;
      min-height: 100vh;
      background-color: var(--background-light);
      transition: background-color 0.3s ease;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --border-color: var(--border-color-dark);
      }
      body:not(.resume-page) {
        background-color: var(--background-dark);
      }
    }

    nav {
      border-bottom: 1px solid var(--border-color);
      display: flex;
    }

    nav a {
      flex: 1;
      text-decoration: none;
      color: inherit;
      text-align: center;
      padding: 0.5em;
      transition: all 0.3s ease;
      background-color: transparent;
    }

    nav a:hover {
      background-color: var(--hover-background-light);
    }

    @media (prefers-color-scheme: dark) {
      nav a:hover {
        background-color: var(--hover-background-dark);
      }
    }

    .color-scheme {
      margin-left: auto;
      margin-right: 20px;
      margin-top: 20px;
    }

    @media (max-width: 768px) {
      .color-scheme {
        margin: 10px auto;
        text-align: center;
        display: block;
      }

      nav {
        margin-top: 10px;
      }
    }
  `;
  document.head.appendChild(style);

  // Create theme switcher first
  const themeSwitcherHTML = `
    <label class="color-scheme" style="font-family: Arial, sans-serif;">
      <select id='theme-selector'>
        <option value='auto'>Automatic</option>
        <option value='light'>Light</option>
        <option value='dark'>Dark</option>
      </select>
    </label>
  `;
  document.body.insertAdjacentHTML('afterbegin', themeSwitcherHTML);

  // Create navigation
  const nav = document.createElement('nav');
  pages.forEach(p => {
    let a = document.createElement('a');
    const baseURL = getBaseURL();
    a.href = p.external || p.url.startsWith('http') ? p.url : `${baseURL}${p.url}`;
    a.textContent = p.title;
    a.target = p.external ? '_blank' : '';
    nav.appendChild(a);
  });
  document.body.insertBefore(nav, document.body.firstChild.nextSibling);

  // Set initial background color only if not on resume page
  const isResumePage = window.location.pathname.includes('resume');
  if (!isResumePage) {
    document.body.style.backgroundColor = '#fff0f5'; // Light pink background
  }

  const selector = document.getElementById('theme-selector');
  selector.addEventListener('change', () => setColorScheme(selector.value));
  const savedScheme = localStorage.getItem('colorScheme') || 'auto';
  setColorScheme(savedScheme);
});