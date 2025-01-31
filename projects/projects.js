import { fetchJSON, renderProjects } from '../global.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
      console.log('Attempting to fetch projects');
      const projects = await fetchJSON('lib/projects.json'); // Remove the '../' from here
      console.log('Projects fetched:', projects);
      
      const projectsContainer = document.querySelector('.projects');
      const projectsTitle = document.querySelector('.projects-title');
      
      if (projects && projects.length > 0) {
        console.log(`Found ${projects.length} projects`);
        projectsTitle.textContent = `Projects (${projects.length})`;
        projectsContainer.innerHTML = '';
        projects.forEach(project => {
          renderProjects(project, projectsContainer, 'h2');
        });
      } else {
        console.log('No projects found');
        projectsContainer.innerHTML = '<p>No projects to display.</p>';
        projectsTitle.textContent = 'Projects (0)';
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      const projectsContainer = document.querySelector('.projects');
      const projectsTitle = document.querySelector('.projects-title');
      projectsContainer.innerHTML = '<p>Error loading projects.</p>';
      projectsTitle.textContent = 'Projects (0)';
    }
  });