import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let currentSearchQuery = '';
let selectedYear = null;

function renderPieChart(allProjects) {
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  
  let rolledData = d3.rollups(
    allProjects,
    v => v.length,
    d => d.year
  );

  let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  let pinkColors = ['#FF69B4', '#FFB6C1', '#FF1493', '#FFC0CB', '#DB7093', '#FF82AB'];
  let colors = d3.scaleOrdinal(pinkColors);

  let sliceGenerator = d3.pie().value(d => d.value);
  let arcData = sliceGenerator(data);

  let svg = d3.select('#projects-pie-plot');
  svg.selectAll('path').remove();

  svg.selectAll('path')
    .data(arcData)
    .enter()
    .append('path')
    .attr('d', arcGenerator)
    .attr('fill', (d, i) => colors(i))
    .attr('class', d => d.data.label === selectedYear ? 'selected' : '')
    .style('cursor', 'pointer')
    .on('click', (event, d) => {
      selectedYear = selectedYear === d.data.label ? null : d.data.label;
      updateDisplayedProjects(allProjects);
    });

  let legend = d3.select('.legend');
  legend.selectAll('*').remove();
  
  data.forEach((d, idx) => {
    legend.append('li')
      .attr('class', `legend-item${d.label === selectedYear ? ' selected' : ''}`)
      .attr('style', `--color:${colors(idx)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value} projects)</em>`)
      .style('cursor', 'pointer')
      .on('click', () => {
        selectedYear = selectedYear === d.label ? null : d.label;
        updateDisplayedProjects(allProjects);
      });
  });
}

function updateDisplayedProjects(allProjects) {
  const projectsContainer = document.querySelector('.projects');
  const projectsTitle = document.querySelector('.projects-title');

  let filteredProjects = allProjects.filter(project => {
    const values = Object.values(project).join('\n').toLowerCase();
    return values.includes(currentSearchQuery);
  });

  if (selectedYear) {
    filteredProjects = filteredProjects.filter(project => project.year === selectedYear);
  }

  projectsContainer.innerHTML = '';
  filteredProjects.forEach(project => {
    renderProjects(project, projectsContainer, 'h2');
  });
  projectsTitle.textContent = `Projects (${filteredProjects.length})`;

  renderPieChart(allProjects);
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('Attempting to fetch projects');
    const projects = await fetchJSON('lib/projects.json');
    console.log('Projects fetched:', projects);
    const searchInput = document.querySelector('.searchBar');

    if (projects && projects.length > 0) {
      console.log(`Found ${projects.length} projects`);
      updateDisplayedProjects(projects);

      searchInput.addEventListener('input', (event) => {
        currentSearchQuery = event.target.value.toLowerCase();
        updateDisplayedProjects(projects);
      });

    } else {
      console.log('No projects found');
      document.querySelector('.projects').innerHTML = '<p>No projects to display.</p>';
      document.querySelector('.projects-title').textContent = 'Projects (0)';
    }
  } catch (error) {
    console.error('Failed to load projects:', error);
    document.querySelector('.projects').innerHTML = '<p>Error loading projects.</p>';
    document.querySelector('.projects-title').textContent = 'Projects (0)';
  }
});
