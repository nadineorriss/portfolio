import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

document.addEventListener('DOMContentLoaded', async () => {
   try {
       const projects = await fetchJSON('lib/projects.json');
       const latestProjects = projects.slice(0, 3);
       const projectsContainer = document.querySelector('.projects');
       
       if (latestProjects.length > 0) {
           projectsContainer.innerHTML = '';
           latestProjects.forEach(project => {
               renderProjects(project, projectsContainer, 'h3');
           });
       }

       const githubData = await fetchGitHubData('nadineorriss');
       const profileStats = document.querySelector('#profile-stats');
       
       if (profileStats) {
        profileStats.innerHTML = `
        <div style="background-color: #FFF0F5; padding: 20px; border-radius: 15px; border: 2px solid #FFB6C1; margin: 20px 0;">
            <h2 style="color: #FF1493; text-align: center; font-family: Arial, sans-serif;">✨ My GitHub Stats ✨</h2>
            <dl style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5em; margin: 15px 0;">
                <dt style="grid-row: 1; color: #FF1493; font-weight: bold; text-align: center;">💗 Repos</dt>
                <dt style="grid-row: 1; color: #FF1493; font-weight: bold; text-align: center;">📝 Gists</dt>
                <dt style="grid-row: 1; color: #FF1493; font-weight: bold; text-align: center;">👥 Followers</dt>
                <dt style="grid-row: 1; color: #FF1493; font-weight: bold; text-align: center;">💖 Following</dt>
                
                <dd style="grid-row: 2; text-align: center; color: #FF1493; font-size: 1.2em;">${githubData.public_repos}</dd>
                <dd style="grid-row: 2; text-align: center; color: #FF1493; font-size: 1.2em;">${githubData.public_gists}</dd>
                <dd style="grid-row: 2; text-align: center; color: #FF1493; font-size: 1.2em;">${githubData.followers}</dd>
                <dd style="grid-row: 2; text-align: center; color: #FF1493; font-size: 1.2em;">${githubData.following}</dd>
            </dl>
        </div>
     `;
       }
   } catch (error) {
       console.error('Error:', error);
   }
});