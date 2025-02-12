let data = [];
let commits = [];

// Define dimensions for the chart
const width = 1000;
const height = 600;
const margin = { top: 10, right: 10, bottom: 30, left: 40 };

function updateTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time');
  const author = document.getElementById('commit-author');
  const lines = document.getElementById('commit-lines');

  if (!commit || Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', {
    dateStyle: 'full',
  });
  time.textContent = commit.time;
  author.textContent = commit.author;
  lines.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  if (tooltip) {
    tooltip.hidden = !isVisible;
  }
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  if (tooltip) {
    const padding = 10;
    tooltip.style.left = `${event.clientX + padding}px`;
    tooltip.style.top = `${event.clientY + padding}px`;
  }
}

function processCommits() {
  commits = d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: 'https://github.com/nadineorriss/portfolio/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        configurable: true,
        writable: true,
        enumerable: false
      });

      return ret;
    });
}

function createScatterplot() {
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  // Create scales
  const xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();

  const yScale = d3
    .scaleLinear()
    .domain([0, 24])
    .range([usableArea.bottom, usableArea.top]);

  // Create SVG
  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  // Add gridlines
  const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

  gridlines.call(
    d3.axisLeft(yScale)
      .tickFormat('')
      .tickSize(-usableArea.width)
  );

  // Add dots
  const dots = svg.append('g').attr('class', 'dots');

  dots
    .selectAll('circle')
    .data(commits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', 5)
    .on('mouseenter', (event, commit) => {
      console.log("Hover commit:", commit); // Debug log
      updateTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mouseleave', () => {
      updateTooltipContent({});
      updateTooltipVisibility(false);
    });

  // Create and add axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

  svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

  svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);
}

function displayStats() {
  // Process commits first
  processCommits();

  // Add summary heading
  const statsContainer = d3.select('#stats');
  statsContainer.append('h2')
    .attr('class', 'summary-title')
    .text('Summary');

  // Create grid container
  const grid = statsContainer.append('div')
    .attr('class', 'stats-grid');

  // Calculate stats
  const stats = [
    { 
      label: 'Commits',
      value: commits.length
    },
    { 
      label: 'Files',
      value: d3.group(data, d => d.file).size
    },
    { 
      label: 'Total LOC',
      value: data.length
    },
    { 
      label: 'Max Depth',
      value: d3.max(data, d => d.depth)
    },
    { 
      label: 'Longest Line',
      value: d3.max(data, d => d.length)
    },
    { 
      label: 'Max Lines',
      value: d3.max(commits, d => d.totalLines)
    }
  ];

  // Create stat items
  stats.forEach(stat => {
    const item = grid.append('div')
      .attr('class', 'stat-item');
    
    item.append('div')
      .attr('class', 'stat-value')
      .text(stat.value);
    
    item.append('div')
      .attr('class', 'stat-label')
      .text(stat.label);
  });
}

async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));
  
  // Display stats after loading data
  displayStats();
  createScatterplot();
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});