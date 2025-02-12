let data = [];
let commits = [];

// Define dimensions for the chart
const width = 1000;
const height = 600;
const margin = { top: 20, right: 30, bottom: 50, left: 60 };

function updateTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time');
  const author = document.getElementById('commit-author');
  const lines = document.getElementById('commit-lines');

  if (!commit || Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', { dateStyle: 'full' });
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
  commits = d3.groups(data, (d) => d.commit).map(([commit, lines]) => {
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
  // Sort commits by total lines in DESCENDING order (smaller dots on top)
  const sortedCommits = d3.sort(commits, (a, b) => d3.descending(a.totalLines, b.totalLines));

  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  // Create scales
  const xScale = d3.scaleTime()
    .domain(d3.extent(sortedCommits, (d) => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();

  const yScale = d3.scaleLinear()
    .domain([0, 24])
    .range([usableArea.bottom, usableArea.top]);

  // Calculate size range for dots
  const [minLines, maxLines] = d3.extent(sortedCommits, (d) => d.totalLines);

  // Use Log Scale for size scaling
  const rScale = d3.scaleLog()
    .domain([Math.max(1, minLines), maxLines]) // Avoid log(0) issues
    .range([3, 60]); // Smallest dot = 3px, Largest = 60px

  // Create SVG
  const svg = d3.select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  // Add gridlines
  const gridlines = svg.append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

  gridlines.call(
    d3.axisLeft(yScale)
      .tickFormat('')
      .tickSize(-usableArea.width)
  );

  // Add dots with proper sorting for better hover
  const dots = svg.append('g').attr('class', 'dots');

  dots
    .selectAll('g')
    .data(sortedCommits)
    .join('g')
    .each(function(d) {
      const g = d3.select(this);

      // Visible dot (hoverable now)
      g.append('circle')
        .attr('cx', xScale(d.datetime))
        .attr('cy', yScale(d.hourFrac))
        .attr('r', rScale(d.totalLines))
        .style('fill-opacity', 0.6)
        .style('pointer-events', 'all') // Fix: Keeps dots hoverable
        .on('mouseenter', function(event) {
          updateTooltipContent(d);
          updateTooltipVisibility(true);
          updateTooltipPosition(event);
          d3.select(this).style('fill-opacity', 0.8); // Highlight
        })
        .on('mousemove', updateTooltipPosition)
        .on('mouseleave', function() {
          updateTooltipVisibility(false);
          d3.select(this).style('fill-opacity', 0.6);
        });

      // Invisible larger hover area (placed behind)
      g.insert('circle', ':first-child')
        .attr('cx', xScale(d.datetime))
        .attr('cy', yScale(d.hourFrac))
        .attr('r', Math.max(10, rScale(d.totalLines) * 1.3))
        .style('fill', 'transparent')
        .style('pointer-events', 'none'); // Doesn't block interaction
    });

  // Create and add axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale)
    .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

  svg.append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

  svg.append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);
}

function displayStats() {
  processCommits();

  const statsContainer = d3.select('#stats');
  statsContainer.append('h2')
    .attr('class', 'summary-title')
    .text('Summary');

  const grid = statsContainer.append('div')
    .attr('class', 'stats-grid');

  const stats = [
    { label: 'Commits', value: commits.length },
    { label: 'Files', value: d3.group(data, d => d.file).size },
    { label: 'Total LOC', value: data.length },
    { label: 'Max Depth', value: d3.max(data, d => d.depth) },
    { label: 'Longest Line', value: d3.max(data, d => d.length) },
    { label: 'Max Lines', value: d3.max(commits, d => d.totalLines) }
  ];

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
  
  displayStats();
  createScatterplot();
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});

