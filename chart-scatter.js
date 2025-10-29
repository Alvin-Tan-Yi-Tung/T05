// Scatter plot: Energy consumption vs star rating
const width = 480, height = 260, margin = {top: 60, right: 25, bottom: 55, left: 65};
const axisFontSize = 12;
const legendFontSize = 9;
const legendFontSizeSmall = 8; // define to avoid ReferenceError
const legendTopY = margin.top - 18;
const legendRightX = width - margin.right - 120;

const svg1 = d3.select("#chart1")
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("viewBox", `0 0 ${width} ${height}`);

function wrapText(sel, wrapWidth, lineHeight = 1.2) {
  sel.each(function () {
    const text = d3.select(this);
    const words = text.text().split(/\s+/).reverse();
    let word, line = [], lineNumber = 0;
    const y = text.attr("y"), x = text.attr("x");
    let tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", "0em");
    while ((word = words.pop())) {
      line.push(word); tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > wrapWidth) {
        line.pop(); tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", x).attr("y", y)
          .attr("dy", `${++lineNumber * lineHeight}em`).text(word);
      }
    }
  });
}

svg1.append("text")
  .attr("x", width / 2)
  .attr("y", margin.top / 2)
  .attr("text-anchor", "middle")
  .attr("font-size", "14px")
  .attr("font-weight", "bold")
  .attr("class", "chart-title")
  .text("Scatter plot: Energy consumption vs star rating")
  .call(wrapText, width - margin.left - margin.right);

d3.csv("./Ex5_TV_energy.csv", d3.autoType).then(data => {
  const x = d3.scaleLinear().domain(d3.extent(data, d => d.star2)).nice()
    .range([margin.left, width - margin.right]);
  const y = d3.scaleLinear().domain(d3.extent(data, d => d.energy_consumpt)).nice()
    .range([height - margin.bottom, margin.top]);

  svg1.append("g").attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x)).selectAll("text").attr("font-size", axisFontSize);
  svg1.append("g").attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y)).selectAll("text").attr("font-size", axisFontSize);

  svg1.append("text").attr("x", width / 2).attr("y", height - 8)
    .attr("text-anchor", "middle").attr("font-size", axisFontSize).text("Star Rating");
  svg1.append("text").attr("transform", "rotate(-90)").attr("x", -height / 2)
    .attr("y", 15).attr("text-anchor", "middle").attr("font-size", axisFontSize)
    .text("Energy Consumption (kWh)");

  svg1.append("g").selectAll("circle").data(data).join("circle")
    .attr("cx", d => x(d.star2)).attr("cy", d => y(d.energy_consumpt))
    .attr("r", 3).attr("fill", "steelblue").attr("opacity", 0.7);

  // Legend top-right, lowered slightly under the title
  const legend = svg1.append("g").attr("transform", `translate(${legendRightX},${legendTopY + 10})`);
  legend.append("circle").attr("cx", 0).attr("cy", 0).attr("r", 6).attr("fill", "steelblue");
  legend.append("text").attr("x", 12).attr("y", 4).attr("font-size", legendFontSize)
    .attr("text-anchor", "start").text("TV Data Point");
});

// 2. Donut Chart
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

const donutRadius = Math.min(width, height) / 2 - 60;
const donutGroup = svg2.append("g")
  .attr("transform", `translate(${width / 2 - 12},${height / 2})`);

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

  // Outside labels + leader lines, clamped to viewport
  const outerArc = d3.arc()
    .innerRadius(donutRadius * 0.95)
    .outerRadius(donutRadius * 1.15);

  const pieData = pie(data);
  function midAngle(d) {
    return d.startAngle + (d.endAngle - d.startAngle) / 2;
  }
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
      pos[0] = Math.max(Math.min(pos[0], clampRight), clampLeft);
      return `translate(${pos})`;
    })
    .attr("text-anchor", d => (midAngle(d) < Math.PI ? "start" : "end"))
    .attr("font-size", legendFontSizeSmall)
    .text(d => d.data.Screen_Tech);

  // Legend top-right: nudged further right from the title area
  const legend = svg2.append("g")
    .attr("transform", `translate(${legendRightX + 30},${legendTopY})`);
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