import { fetchJSON, renderProjects } from '../global.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const projects = await fetchJSON('../lib/projects.json');
        const projectsContainer = document.querySelector('.projects');
        const projectsTitle = document.querySelector('.projects-title');

        if (projects && projects.length > 0) {
            projectsTitle.textContent = `Projects (${projects.length})`;
            projectsContainer.innerHTML = ''; // Clear once
            projects.forEach(project => {
                renderProjects(project, projectsContainer, 'h2');
            });
        } else {
            projectsContainer.innerHTML = '<p>No projects to display.</p>';
            projectsTitle.textContent = 'Projects (0)';
        }
    } catch (error) {
        console.error('Failed to load projects:', error);
        projectsContainer.innerHTML = '<p>Error loading projects.</p>';
    }
});