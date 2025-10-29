// Bar: Energy consumption for different screen technologies for 55inch TVs
const width = 480, height = 260, margin = {top: 60, right: 25, bottom: 55, left: 65};
const axisFontSize = 12;
const legendFontSizeSmall = 8;

const svg3 = d3.select("#chart3").append("svg")
  .attr("width", "100%").attr("height", "100%").attr("viewBox", `0 0 ${width} ${height}`);

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

const title3 = svg3.append("text").attr("x", width / 2).attr("y", margin.top / 2)
  .attr("text-anchor", "middle").attr("font-size", "14px").attr("font-weight", "bold")
  .attr("class", "chart-title")
  .text("Bar: Energy consumption for different screen technologies for 55inch TVs")
  .call(wrapText, width - margin.left - margin.right);

d3.csv("./Ex5_TV_energy_55inchtv_byScreenType.csv", d3.autoType).then(data => {
  const legendItemH = 14;
  const titleBox = title3.node().getBBox();
  const legendRightXBar = width - margin.right - 120;
  const legendTopYBar = titleBox.y + titleBox.height + 6;

  const marginBar = {
    top: Math.max(margin.top, legendTopYBar + (data.length * legendItemH) + 8),
    right: margin.right,
    bottom: margin.bottom,
    left: margin.left
  };

  const x = d3.scaleBand().domain(data.map(d => d.Screen_Tech))
    .range([marginBar.left, width - marginBar.right - 20]).padding(0.3);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d['Mean(Labelled energy consumption (kWh/year))'])]).nice()
    .range([height - marginBar.bottom, marginBar.top]);

  svg3.append("g").attr("transform", `translate(0,${height - marginBar.bottom})`)
    .call(d3.axisBottom(x)).selectAll("text").attr("font-size", axisFontSize);
  svg3.append("g").attr("transform", `translate(${marginBar.left},0)`)
    .call(d3.axisLeft(y)).selectAll("text").attr("font-size", axisFontSize);

  svg3.append("text").attr("x", width / 2).attr("y", height - 8)
    .attr("text-anchor", "middle").attr("font-size", axisFontSize).text("Screen Technology");
  svg3.append("text").attr("transform", "rotate(-90)").attr("x", -height / 2)
    .attr("y", 15).attr("text-anchor", "middle").attr("font-size", axisFontSize)
    .text("Mean Energy Consumption (kWh/year)");

  const color = d3.scaleOrdinal().domain(data.map(d => d.Screen_Tech)).range(d3.schemeCategory10);

  svg3.selectAll("rect").data(data).join("rect")
    .attr("x", d => x(d.Screen_Tech))
    .attr("y", d => y(d['Mean(Labelled energy consumption (kWh/year))']))
    .attr("width", x.bandwidth())
    .attr("height", d => y(0) - y(d['Mean(Labelled energy consumption (kWh/year))']))
    .attr("fill", d => color(d.Screen_Tech));

  // Legend below title at top-right
  const legend = svg3.append("g").attr("transform", `translate(${legendRightXBar},${legendTopYBar})`);
  data.forEach((d, i) => {
    legend.append("rect").attr("x", 0).attr("y", i * legendItemH).attr("width", 10).attr("height", 10)
      .attr("fill", color(d.Screen_Tech));
    legend.append("text").attr("x", 14).attr("y", i * legendItemH + 8)
      .attr("font-size", legendFontSizeSmall).attr("text-anchor", "start").text(d.Screen_Tech);
  });
});