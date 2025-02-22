let data = [];
let commits = [];
let xScale, yScale, rScale;
let brushSelection = null;

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
    return {
      id: commit,
      url: 'https://github.com/nadineorriss/portfolio/commit/' + commit,
      author,
      date,
      time,
      timezone,
      datetime,
      hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
      totalLines: lines.length,
      lines: lines
    };
  });
}

function createScatterplot() {
  processCommits();
  const sortedCommits = d3.sort(commits, (a, b) => d3.descending(a.totalLines, b.totalLines));

  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  xScale = d3.scaleTime()
    .domain(d3.extent(sortedCommits, (d) => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();

  yScale = d3.scaleLinear()
    .domain([0, 24])
    .range([usableArea.bottom, usableArea.top]);

  const [minLines, maxLines] = d3.extent(sortedCommits, (d) => d.totalLines);
  rScale = d3.scaleLog()
    .domain([Math.max(1, minLines), maxLines])
    .range([3, 60]);

  const svg = d3.select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  svg.append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`) 
    .call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

  const dots = svg.append('g').attr('class', 'dots');

  dots.selectAll('circle')
    .data(sortedCommits)
    .join('circle')
    .attr('cx', d => xScale(d.datetime))
    .attr('cy', d => yScale(d.hourFrac))
    .attr('r', d => rScale(d.totalLines))
    .attr('class', 'dot')
    .style('fill-opacity', 0.6)
    .style('pointer-events', 'all')
    .on('mouseenter', function(event, d) {
      updateTooltipContent(d);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
      d3.select(this).style('fill-opacity', 0.8);
    })
    .on('mousemove', updateTooltipPosition)
    .on('mouseleave', function() {
      updateTooltipVisibility(false);
      d3.select(this).style('fill-opacity', 0.6);
    });

  svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(d3.axisBottom(xScale));

  svg.append('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(${usableArea.left}, 0)`) 
    .call(d3.axisLeft(yScale).tickFormat(d => `${String(d).padStart(2, '0')}:00`));

  brushSelector(svg);
}

function brushSelector(svg) {
  const brush = d3.brush()
    .extent([
      [margin.left, margin.top],  
      [width - margin.right, height - margin.bottom] 
    ])
    .on("brush", brushed)
    .on("end", brushEnded);

  svg.append("g")
    .attr("class", "brush")
    .call(brush);

  svg.selectAll(".dots, .overlay ~ *").raise();
}

function brushed(event) {
  brushSelection = event.selection;
  updateSelection();
  updateSelectionCount();
  updateLanguageBreakdown();
}

function brushEnded(event) {
  if (!event.selection) {
    brushSelection = null;
    updateSelection();
    updateSelectionCount();
    updateLanguageBreakdown();
  }
}

function isCommitSelected(commit) {
  if (!brushSelection) return false;
  const [[x0, y0], [x1, y1]] = brushSelection;
  const commitX = xScale(commit.datetime);
  const commitY = yScale(commit.hourFrac);
  return x0 <= commitX && commitX <= x1 && y0 <= commitY && commitY <= y1;
}

function updateSelection() {
  d3.selectAll('.dot').classed('selected', d => isCommitSelected(d));
}

function updateSelectionCount() {
  const selectedCommits = brushSelection
    ? commits.filter(isCommitSelected)
    : [];

  document.getElementById('selection-count').textContent =
    `${selectedCommits.length || 'No'} commits selected`;
}

function updateLanguageBreakdown() {
  const selectedCommits = brushSelection
    ? commits.filter(isCommitSelected)
    : [];

  const container = document.getElementById('language-breakdown');

  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }

  const requiredCommits = selectedCommits.length ? selectedCommits : commits;
  const lines = requiredCommits.flatMap(d => d.lines);

  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type
  );

  container.innerHTML = '';

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);

    container.innerHTML += `
      <dt>${language}</dt>
      <dd>${count} lines (${formatted})</dd>
    `;
  }

  return breakdown;
}

async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    file: row.file || "unknown",
    line: Number(row.line),
    depth: Number(row.depth) || 0,
    length: Number(row.length) || 0,
    datetime: new Date(row.datetime),
    type: row.type || "unknown",
  }));

  createScatterplot();
  displayStats();
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});

function displayStats() {
  processCommits();
  const statsContainer = d3.select("#stats");
  statsContainer.html("");
  statsContainer.append("h2")
    .attr("class", "summary-title")
    .text("Summary");

  const grid = statsContainer.append("div")
    .attr("class", "stats-grid");

  const stats = [
    { label: "Commits", value: commits.length },
    { label: "Files", value: d3.group(data, d => d.file).size },
    { label: "Total LOC", value: data.length },
    { label: "Max Depth", value: d3.max(data, d => d.depth) },
    { label: "Longest Line", value: d3.max(data, d => d.length) },
    { label: "Max Lines", value: d3.max(commits, d => d.totalLines) }
  ];

  stats.forEach(stat => {
    const item = grid.append("div").attr("class", "stat-item");
    item.append("div").attr("class", "stat-value").text(stat.value);
    item.append("div").attr("class", "stat-label").text(stat.label);
  });
}
