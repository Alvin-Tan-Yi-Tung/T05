// 1. Create grid and chart containers with D3
d3.select("body")
  .append("div")
  .attr("class", "grid-container")
  .selectAll(".chart-box")
  .data([1, 2, 3, 4])
  .enter()
  .append("div")
  .attr("class", "chart-box")
  .attr("id", d => `chart${d}`);

// 2. Add styles with D3 (or keep in CSS file)
d3.select("head")
  .append("style")
  .text(`
    .grid-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 20px;
      width: 98vw;
      max-width: 1300px;
      margin: 30px auto;
    }
    .chart-box {
      background: #fafafa;
      border: 1px solid #ccc;
      padding: 0;
      width: 95%;
      height: 340px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      overflow: hidden;
    }
    .chart-title {
      font-size: 15px;
      font-weight: bold;
      text-align: center;
      margin: 0 0 2px 0;
      font-family: 'Segoe UI', Arial, sans-serif;
    }
  `);

const width = 480, height = 260, margin = {top: 50, right: 20, bottom: 40, left: 55};
const legendFontSize = 9; // general legend font size
const legendFontSizeSmall = 8; // smaller for donut and bar
const axisFontSize = 12;

// 1. Scatter Plot (chart1)
const svg1 = d3.select("#chart1")
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("viewBox", `0 0 ${width} ${height}`);

svg1.append("text")
  .attr("x", width / 2)
  .attr("y", margin.top / 2)
  .attr("text-anchor", "middle")
  .attr("font-size", "15px")
  .attr("font-weight", "bold")
  .attr("class", "chart-title")
  .text("Scatter plot: Energy consumption vs star rating");

d3.csv("/T05/Ex5_TV_energy.csv", d3.autoType).then(data => {
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.star2)).nice()
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain(d3.extent(data, d => d.energy_consumpt)).nice()
    .range([height - margin.bottom, margin.top]);

  svg1.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("font-size", axisFontSize);

  svg1.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .selectAll("text")
    .attr("font-size", axisFontSize);

  svg1.append("text")
    .attr("class", "axis-label")
    .attr("x", width / 2)
    .attr("y", height - 8)
    .attr("text-anchor", "middle")
    .attr("font-size", axisFontSize)
    .text("Star Rating");

  svg1.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .attr("font-size", axisFontSize)
    .text("Energy Consumption (kWh)");

  svg1.append("g")
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => x(d.star2))
    .attr("cy", d => y(d.energy_consumpt))
    .attr("r", 3)
    .attr("fill", "steelblue")
    .attr("opacity", 0.7);

  // Legend below plot, left-aligned
  const legend = svg1.append("g")
    .attr("transform", `translate(${margin.left},${height - margin.bottom + 28})`);
  legend.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 6)
    .attr("fill", "steelblue");
  legend.append("text")
    .attr("x", 12)
    .attr("y", 4)
    .attr("font-size", legendFontSize)
    .attr("text-anchor", "start")
    .text("TV Data Point");
});

// 2. Donut Chart (chart2)
const svg2 = d3.select("#chart2")
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("viewBox", `0 0 ${width} ${height}`);

svg2.append("text")
  .attr("x", width / 2)
  .attr("y", margin.top / 2)
  .attr("text-anchor", "middle")
  .attr("font-size", "15px")
  .attr("font-weight", "bold")
  .attr("class", "chart-title")
  .text("Donut: Energy consumption for different screen technologies across all TVs");

const donutRadius = Math.min(width, height) / 2 - 50;
const donutGroup = svg2.append("g")
  .attr("transform", `translate(${width / 2},${height / 2 + 10})`);

d3.csv("/T05/Ex5_TV_energy_Allsizes_byScreenType.csv", d3.autoType).then(data => {
  const color = d3.scaleOrdinal()
    .domain(data.map(d => d.Screen_Tech))
    .range(d3.schemeCategory10);

  const pie = d3.pie()
    .value(d => d['Mean(Labelled energy consumption (kWh/year))']);

  const arc = d3.arc()
    .innerRadius(donutRadius * 0.5)
    .outerRadius(donutRadius);

  donutGroup.selectAll('path')
    .data(pie(data))
    .join('path')
    .attr('d', arc)
    .attr('fill', d => color(d.data.Screen_Tech))
    .attr('stroke', '#fff')
    .attr('stroke-width', 2);

  // Labels
  donutGroup.selectAll('text')
    .data(pie(data))
    .join('text')
    .attr('transform', d => `translate(${arc.centroid(d)})`)
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .attr("font-size", legendFontSize)
    .text(d => d.data.Screen_Tech);

  // Legend below plot, left-aligned
  const legend = svg2.append("g")
    .attr("transform", `translate(${margin.left},${height - margin.bottom + 28})`);
  data.forEach((d, i) => {
    legend.append("rect")
      .attr("x", 0)
      .attr("y", i * 14)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", color(d.Screen_Tech));
    legend.append("text")
      .attr("x", 14)
      .attr("y", i * 14 + 8)
      .attr("font-size", legendFontSizeSmall) // smaller font
      .attr("text-anchor", "start")
      .text(d.Screen_Tech);
  });
});

// 3. Bar Chart (chart3)
const svg3 = d3.select("#chart3")
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("viewBox", `0 0 ${width} ${height}`);

svg3.append("text")
  .attr("x", width / 2)
  .attr("y", margin.top / 2)
  .attr("text-anchor", "middle")
  .attr("font-size", "15px")
  .attr("font-weight", "bold")
  .attr("class", "chart-title")
  .text("Bar: Energy consumption for different screen technologies for 55inch TVs");

d3.csv("/T05/Ex5_TV_energy_55inchtv_byScreenType.csv", d3.autoType).then(data => {
  const x = d3.scaleBand()
    .domain(data.map(d => d.Screen_Tech))
    .range([margin.left, width - margin.right])
    .padding(0.3);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d['Mean(Labelled energy consumption (kWh/year))'])]).nice()
    .range([height - margin.bottom, margin.top]);

  svg3.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("font-size", axisFontSize);

  svg3.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .selectAll("text")
    .attr("font-size", axisFontSize);

  svg3.append("text")
    .attr("class", "axis-label")
    .attr("x", width / 2)
    .attr("y", height - 8)
    .attr("text-anchor", "middle")
    .attr("font-size", axisFontSize)
    .text("Screen Technology");

  svg3.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .attr("font-size", axisFontSize)
    .text("Mean Energy Consumption (kWh/year)");

  const color = d3.scaleOrdinal()
    .domain(data.map(d => d.Screen_Tech))
    .range(d3.schemeCategory10);

  svg3.selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", d => x(d.Screen_Tech))
    .attr("y", d => y(d['Mean(Labelled energy consumption (kWh/year))']))
    .attr("width", x.bandwidth())
    .attr("height", d => y(0) - y(d['Mean(Labelled energy consumption (kWh/year))']))
    .attr("fill", d => color(d.Screen_Tech));

  // Legend below plot, left-aligned
  const legend = svg3.append("g")
    .attr("transform", `translate(${margin.left},${height - margin.bottom + 28})`);
  data.forEach((d, i) => {
    legend.append("rect")
      .attr("x", 0)
      .attr("y", i * 14)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", color(d.Screen_Tech));
    legend.append("text")
      .attr("x", 14)
      .attr("y", i * 14 + 8)
      .attr("font-size", legendFontSizeSmall) // smaller font
      .attr("text-anchor", "start")
      .text(d.Screen_Tech);
  });
});

// 4. Line Chart (chart4) - Average Only
const svg4 = d3.select("#chart4")
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("viewBox", `0 0 ${width} ${height}`);

svg4.append("text")
  .attr("x", width / 2)
  .attr("y", margin.top / 2)
  .attr("text-anchor", "middle")
  .attr("font-size", "15px")
  .attr("font-weight", "bold")
  .attr("class", "chart-title")
  .text("Line: Are spot Power Prices (Average, 1998-2024)");

d3.csv("/T05/Ex5_ARE_Spot_Prices.csv", d3.autoType).then(data => {
  const avgKey = "Average Price (notTas-Snowy)";
  const color = "steelblue";

  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.Year))
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain([
      0,
      d3.max(data, d => d[avgKey])
    ]).nice()
    .range([height - margin.bottom, margin.top]);

  svg4.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")))
    .selectAll("text")
    .attr("font-size", axisFontSize);

  svg4.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .selectAll("text")
    .attr("font-size", axisFontSize);

  svg4.append("text")
    .attr("class", "axis-label")
    .attr("x", width / 2)
    .attr("y", height - 8)
    .attr("text-anchor", "middle")
    .attr("font-size", axisFontSize)
    .text("Year");

  svg4.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .attr("font-size", axisFontSize)
    .text("Spot Price ($/MWh)");

  const line = d3.line()
    .x(d => x(d.Year))
    .y(d => y(d[avgKey]));

  svg4.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 2.5)
    .attr("d", line);

  // Legend below plot, left-aligned
  const legend = svg4.append("g")
    .attr("transform", `translate(${margin.left},${height - margin.bottom + 28})`);
  legend.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 12)
    .attr("height", 4)
    .attr("fill", color);
  legend.append("text")
    .attr("x", 16)
    .attr("y", 7)
    .attr("font-size", legendFontSize)
    .attr("text-anchor", "start")
    .text("Average Price (notTas-Snowy)");
});