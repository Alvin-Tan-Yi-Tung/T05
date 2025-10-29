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
      overflow: visible;
    }
    .chart-title {
      font-size: 14px;
      font-weight: bold;
      text-align: center;
      margin: 0 0 2px 0;
      font-family: 'Segoe UI', Arial, sans-serif;
    }
  `);

// Sizes and fonts
const width = 480, height = 260, margin = {top: 60, right: 25, bottom: 55, left: 65};
const legendFontSize = 9; // general legend font size
const legendFontSizeSmall = 8; // smaller for donut and bar
const axisFontSize = 12;

// Reserve a safe top-right lane for all legends
const legendTopY = margin.top - 18;            // under title, above plot
const legendRightX = width - margin.right - 120; // adjust 120 if legend is wider

// Helper: wrap long SVG text into multiple tspans
function wrapText(textSelection, wrapWidth, lineHeight = 1.2) {
  textSelection.each(function () {
    const text = d3.select(this);
    const words = text.text().split(/\s+/).reverse();
    let word;
    let line = [];
    let lineNumber = 0;
    const y = text.attr("y");
    const x = text.attr("x");
    let tspan = text.text(null)
      .append("tspan")
      .attr("x", x)
      .attr("y", y)
      .attr("dy", "0em");
    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > wrapWidth) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", `${++lineNumber * lineHeight}em`)
          .text(word);
      }
    }
  });
}

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
  .attr("font-size", "14px")
  .attr("font-weight", "bold")
  .attr("class", "chart-title")
  .text("Scatter plot: Energy consumption vs star rating")
  .call(wrapText, width - margin.left - margin.right);

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

  // Move legend to top-right under the title
  const legend = svg1.append("g")
    .attr("transform", `translate(${legendRightX},${legendTopY + 10})`);
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
  .attr("font-size", "14px")
  .attr("font-weight", "bold")
  .attr("class", "chart-title")
  .text("Donut: Energy consumption for different screen technologies across all TVs")
  .call(wrapText, width - margin.left - margin.right);

const donutRadius = Math.min(width, height) / 2 - 60; // slightly smaller to keep labels in bounds
const donutGroup = svg2.append("g")
  .attr("transform", `translate(${width / 2 - 12},${height / 2})`); // nudge left

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

  // Replace inner labels with outside labels + leader lines
  const outerArc = d3.arc()
    .innerRadius(donutRadius * 0.95)
    .outerRadius(donutRadius * 1.15);

  const pieData = pie(data);
  function midAngle(d) {
    return d.startAngle + (d.endAngle - d.startAngle) / 2;
  }

  // Bounds for clamping label X within the SVG viewport
  const labelPad = 4;
  const clampRight = (width / 2) - margin.right - labelPad;
  const clampLeft = -(width / 2 - margin.left - labelPad);

  donutGroup.selectAll("polyline")
    .data(pieData)
    .join("polyline")
    .attr("points", d => {
      const p0 = arc.centroid(d);
      const p1 = outerArc.centroid(d);
      const p2 = outerArc.centroid(d);
      p2[0] = donutRadius * 1.30 * (midAngle(d) < Math.PI ? 1 : -1);
      // clamp to viewport
      p2[0] = Math.max(Math.min(p2[0], clampRight), clampLeft);
      return [p0, p1, p2];
    })
    .attr("fill", "none")
    .attr("stroke", "#555")
    .attr("stroke-width", 1);

  donutGroup.selectAll("text.label")
    .data(pieData)
    .join("text")
    .attr("class", "label")
    .attr("transform", d => {
      const pos = outerArc.centroid(d);
      pos[0] = donutRadius * 1.33 * (midAngle(d) < Math.PI ? 1 : -1);
      // clamp to viewport
      pos[0] = Math.max(Math.min(pos[0], clampRight), clampLeft);
      return `translate(${pos})`;
    })
    .attr("text-anchor", d => (midAngle(d) < Math.PI ? "start" : "end"))
    .attr("font-size", legendFontSizeSmall)
    .text(d => d.data.Screen_Tech);

  // Legend moved to top-right inside chart
  const legend = svg2.append("g")
    .attr("transform", `translate(${width - margin.right - 90},${legendTopY})`);
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
      .attr("font-size", legendFontSizeSmall)
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

const title3 = svg3.append("text")
  .attr("x", width / 2)
  .attr("y", margin.top / 2)
  .attr("text-anchor", "middle")
  .attr("font-size", "14px")
  .attr("font-weight", "bold")
  .attr("class", "chart-title")
  .text("Bar: Energy consumption for different screen technologies for 55inch TVs")
  .call(wrapText, width - margin.left - margin.right);

d3.csv("/T05/Ex5_TV_energy_55inchtv_byScreenType.csv", d3.autoType).then(data => {
  // Compute legend position under the title
  const legendItemH = 14;
  const titleBox = title3.node().getBBox();
  const legendRightX = width - margin.right - 120; // move left by increasing 120 if needed
  const legendTopY = titleBox.y + titleBox.height + 6;

  // Local margin for bar chart: push plot below legend
  const marginBar = {
    top: Math.max(margin.top, legendTopY + (data.length * legendItemH) + 8),
    right: margin.right,
    bottom: margin.bottom,
    left: margin.left
  };

  const x = d3.scaleBand()
    .domain(data.map(d => d.Screen_Tech))
    .range([marginBar.left, width - marginBar.right - 20])  // keep last tick inside
    .padding(0.3);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d['Mean(Labelled energy consumption (kWh/year))'])]).nice()
    .range([height - marginBar.bottom, marginBar.top]);

  svg3.append("g")
    .attr("transform", `translate(0,${height - marginBar.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("font-size", axisFontSize);

  svg3.append("g")
    .attr("transform", `translate(${marginBar.left},0)`)
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

  // Legend: fixed at top-right below title
  const legend = svg3.append("g").attr("class", "legend")
    .attr("transform", `translate(${legendRightX},${legendTopY})`);

  data.forEach((d, i) => {
    legend.append("rect")
      .attr("x", 0)
      .attr("y", i * legendItemH)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", color(d.Screen_Tech));
    legend.append("text")
      .attr("x", 14)
      .attr("y", i * legendItemH + 8)
      .attr("font-size", legendFontSizeSmall)
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
  .attr("font-size", "14px")
  .attr("font-weight", "bold")
  .attr("class", "chart-title")
  .text("Line: Are spot Power Prices (Average, 1998-2024)")
  .call(wrapText, width - margin.left - margin.right);

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
  // Scatter legend: move to top-left under title
  const legend = svg4.append("g")
    .attr("transform", `translate(${legendRightX},${legendTopY})`);
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