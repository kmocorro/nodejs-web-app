var parseTime = d3.timeParse("%H:%M");

var svg = d3.select("svg");

var margin = {top: 30, right: 50, bottom: 30, left: 30},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    labelPadding = 3;

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.requestTsv("/visual.tsv", function(d) {
  d.hours = parseTime(d.hours);
  for (var k in d) if (k !== "hours") d[k] = +d[k];
  return d;
}, function(error, data) {
  if (error) throw error;

  var series = data.columns.slice(1).map(function(key) {
    return data.map(function(d) {
      return {
        key: key,
        hours: d.hours,
        value: d[key]
      };
    });
  });

  var x = d3.scaleTime()
      .domain([data[0].hours, data[data.length - 1].hours])
      .range([0, width]);

  var y = d3.scaleLinear()
      .domain([0, d3.max(series, function(s) { return d3.max(s, function(d) { return d.value; }); })])
      .range([height, 0]);

  var z = d3.scaleCategory10();

  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  var serie = g.selectAll(".serie")
      .data(series)
    .enter().append("g")
      .attr("class", "serie");

  serie.append("path")
      .attr("class", "line")
      .style("stroke", function(d) { return z(d[0].key); })
      .attr("d", d3.line()
          .x(function(d) { return x(d.hours); })
          .y(function(d) { return y(d.value); }));

  var label = serie.selectAll(".label")
      .data(function(d) { return d; })
    .enter().append("g")
      .attr("class", "label")
      .attr("transform", function(d, i) { return "translate(" + x(d.hours) + "," + y(d.value) + ")"; });

  label.append("text")
      .attr("dy", ".8em")
      .text(function(d) { return d.value; })
    .filter(function(d, i) { return i === data.length - 1; })
    .append("tspan")
      .attr("class", "label-key")
      .text(function(d) { return " " + d.key; });

  label.append("rect", "text")
      .datum(function() { return this.nextSibling.getBBox(); })
      .attr("x", function(d) { return d.x - labelPadding; })
      .attr("y", function(d) { return d.y - labelPadding; })
      .attr("width", function(d) { return d.width + 2 * labelPadding; })
      .attr("height", function(d) { return d.height + 2 * labelPadding; });
});
