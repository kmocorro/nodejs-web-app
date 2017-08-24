
var margin = {top: 10, right: 60, bottom: 30, left: 80},
    width = 1320 - margin.left - margin.right,
    height = 380 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y-%m-%d %H:%M").parse;

var x = d3.time.scale().range([0, width]);
var y0 = d3.scale.linear().range([height, 0]);
var y1 = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(5);

var yAxisLeft = d3.svg.axis().scale(y0)
    .orient("left").ticks(5);

var yAxisRight = d3.svg.axis().scale(y1)
    .orient("right").ticks(5); 

var valueline = d3.svg.line()
    .x(function(d) { return x(d.hours); })
    .y(function(d) { return y0(d.outs); });
    
var valueline2 = d3.svg.line()
    .x(function(d) { return x(d.hours); })
    .y(function(d) { return y1(d.dppm); });
  
var svg = d3.select("body")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("align","center")
    .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

// Get the data
d3.csv("/test.csv", function(error, data) {
    data.forEach(function(d) {
        d.hours = parseDate(d.hours);
        d.outs = +d.outs;
        d.dppm = +d.dppm;
    });

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.hours; }));
    y0.domain([0, d3.max(data, function(d) {
		return Math.max(d.outs); })]); 
    y1.domain([0, d3.max(data, function(d) { 
		return Math.max(d.dppm); })]);

    svg.append("path")        // Add the valueline path.
        .attr("d", valueline(data));

    svg.append("path")        // Add the valueline2 path.
        .style("stroke", "orange")
        .attr("d", valueline2(data));

    svg.append("g")            // Add the X Axis
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .style("fill", "steelblue")
        .call(yAxisLeft);	

    svg.append("g")				
        .attr("class", "y axis")	
        .attr("transform", "translate(" + width + " ,0)")	
        .style("fill", "orange")		
        .call(yAxisRight);

});