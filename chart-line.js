// Line: Are spot Power Prices (Average, 1998-2024)
const width = 480, height = 260, margin = {top: 60, right: 25, bottom: 55, left: 65};
const axisFontSize = 12;
const legendFontSize = 9;
const legendTopY = margin.top - 18;
const legendRightX = width - margin.right - 120;

const svg4 = d3.select("#chart4").append("svg")
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

svg4.append("text").attr("x", width / 2).attr("y", margin.top / 2)
  .attr("text-anchor", "middle").attr("font-size", "14px").attr("font-weight", "bold")
  .attr("class", "chart-title")
  .text("Line: Are spot Power Prices (Average, 1998-2024)")
  .call(wrapText, width - margin.left - margin.right);

d3.csv("./Ex5_ARE_Spot_Prices.csv", d3.autoType).then(data => {
  const avgKey = "Average Price (notTas-Snowy)";
  const color = "steelblue";

  const x = d3.scaleLinear().domain(d3.extent(data, d => d.Year))
    .range([margin.left, width - margin.right]);
  const y = d3.scaleLinear().domain([0, d3.max(data, d => d[avgKey])]).nice()
    .range([height - margin.bottom, margin.top]);

  svg4.append("g").attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d"))).selectAll("text").attr("font-size", axisFontSize);
  svg4.append("g").attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y)).selectAll("text").attr("font-size", axisFontSize);

  svg4.append("text").attr("x", width / 2).attr("y", height - 8)
    .attr("text-anchor", "middle").attr("font-size", axisFontSize).text("Year");
  svg4.append("text").attr("transform", "rotate(-90)").attr("x", -height / 2)
    .attr("y", 15).attr("text-anchor", "middle").attr("font-size", axisFontSize)
    .text("Spot Price ($/MWh)");

  const line = d3.line().x(d => x(d.Year)).y(d => y(d[avgKey]));
  svg4.append("path").datum(data).attr("fill", "none").attr("stroke", color)
    .attr("stroke-width", 2.5).attr("d", line);

  // Legend top-right under the title
  const legend = svg4.append("g").attr("transform", `translate(${legendRightX},${legendTopY})`);
  legend.append("rect").attr("x", 0).attr("y", 0).attr("width", 12).attr("height", 4).attr("fill", color);
  legend.append("text").attr("x", 16).attr("y", 7).attr("font-size", legendFontSize)
    .attr("text-anchor", "start").text("Average Price (notTas-Snowy)");
});