// set the dimensions and margins of the graph
var margin = {top: 250, right: 200, bottom: 200, left: 100},
    height = 1000 - margin.top - margin.bottom
    width = 1800 - margin.left - margin.right

// append the svg object to the body of the page
var svg = d3.select("#holidays_viz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")")

 // Add title to graph
svg.append("text")
        .attr("x", 0)
        .attr("y", -150)
        .attr("text-anchor", "left")
        .style("font-size", "36px")
        .attr("font-family", "Verdana")
        .text("Brits Abroad | 1986 - 2020");

// Add subtitle to graph
svg.append("text")
        .attr("x", 0)
        .attr("y", -120)
        .attr("text-anchor", "left")
        .style("font-size", "18px")
        .style("fill", "grey")
        .attr("font-family", "Verdana")
        .style("max-width", 400)
        .text("The number of trips abroad made by UK residents");

// signature
svg.append("text")
        .attr("x", width)
        .attr("y", height + 130)
        .attr("text-anchor", "end")
        .style("font-size", "15px")
        .style("fill", "grey")
        .attr("font-family", "Verdana")
        .text("Viz by @annacxrter | Aug 2020");
svg.append("text")
        .attr("x", width)
        .attr("y", height + 150)
        .attr("text-anchor", "end")
        .style("font-size", "15px")
        .style("fill", "grey")
        .attr("font-family", "Verdana")
        .text("Data : ONS | UK Visits Abroad - NSA");


//Read the data
d3.csv("/makeovermondayW30/data-by-date.csv", function(data) {
var new_data = data.filter(function(d){
        return d.year == 2020;
})
data = data.filter(function(d){
        return d.year > 1985;
})
data = data.filter(function(d){
        return d.year != 2020;
})


// get summary data by month
 var data_months = d3.nest()
  .key(function(d) { return d.month;})
  .rollup(function(d) {
   return d3.sum(d, function(g) {return g.visits; });
  }).entries(data);

// get summary data by year
 var data_year = d3.nest()
  .key(function(d) { return d.year;})
  .rollup(function(d) {
   return d3.sum(d, function(g) {return g.visits; });
  }).entries(data);

  // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
  var myGroups = d3.map(data, function(d){return d.month;}).keys()
  var myVars = d3.map(data, function(d){return d.year;}).keys().sort()

  // Build X scales and axis:
  var x = d3.scaleBand()
    .range([ 0, (width/4)*3])
    .domain(myVars)
    .padding(0);
  svg.append("g")
    .style("font-size", 15)
    .attr('class','axis')
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSize(0)
    .tickValues(['1986', '1990', '1995', '2000', '2005', '2010', '2015', '2019'])
    .tickFormat(function(d){return "'" + d.slice(-2)})
    .tickPadding(10))
    .select(".domain").remove()

  // Build X scale for upper bars
  var xbars = d3.scaleBand()
    .range([ 0, (width/4)*3])
    .domain(myVars)
    .padding(0);
  svg.append("g")
    .style("font-size", 15)
    .attr('class','axis')
    .attr("transform", "translate(0," + (height/6 + 20) + ")")
    .call(d3.axisBottom(xbars).tickSize(0).tickPadding(7).tickFormat(''))
    .select(".domain").remove()

  // Build X scale for right bars
  var xrbars = d3.scaleLinear()
    .range([0, width/10])
    .domain([d3.min(data_months, function(d) { return d.value; })*0.9, d3.max(data_months, function(d) { return d.value; })])
  svg.append("g")
    .style("font-size", 15)
    .attr('class','axis')
    .attr("transform", "translate("+(width/6*5)+"," + height + ")")
    .call(d3.axisBottom(xrbars).tickSize(0).tickFormat(''))
    .select(".domain").remove()


  // Build Y scales and axis:
  var y = d3.scaleBand()
    .range([ height, (height/4) - 20 ])
    .domain(myGroups)
    .padding(0);
  svg.append("g")
    .style("font-size", 16)
    .attr('class','axis')
    .call(d3.axisLeft(y).tickSize(0).tickPadding(13))
    //.tickValues(['1990', '1995', '2000', '2005', '2010', '2015'])
    .select(".domain").remove()

  // Build Y scale for upper bars
  var ybars = d3.scaleLinear()
    .range([ (height/6), 0 ])
    .domain([d3.min(data_year, function(d) { return d.value; })*0.9, d3.max(data_year, function(d) { return d.value; })])
  svg.append("g")
    .style("font-size", 15)
    .attr('class','axis')
    .call(d3.axisLeft(ybars).tickSize(0).tickValues([]).tickPadding(10))
    .select(".domain").remove()



  // Build color scale
  var myColor = d3.scaleSequential()
    .interpolator(d3.interpolateViridis)
    .domain([d3.min(data, function(d) { return d.visits; })*0.9, d3.max(data, function(d) { return d.visits; })])

  // Build color scale
  var myColorbars = d3.scaleSequential()
    .interpolator(d3.interpolateViridis)
    .domain([d3.min(data_year, function(d) { return d.value; })*0.9, d3.max(data_year, function(d) { return d.value; })])

  // Build color scale
  var myColorrbars = d3.scaleSequential()
    .interpolator(d3.interpolateViridis)
    .domain([d3.min(data_months, function(d) { return d.value; })*0.9, d3.max(data_months, function(d) { return d.value; })])

  // create a tooltip
  var tooltip = d3.select("#holidays_viz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function(d) {
    tooltip.style("opacity", 1)
  }
  var mousemove = function(d) {
    var mouse = d3.mouse(d3.select('#holidays_viz').node()).map(function(d) {return parseInt(d); });
    tooltip
        .style("top", mouse[1] + "px")
        .style("left", (mouse[0] + 30) + "px")
      .html("<b>" + ((d.visits)/1000).toFixed(1) + "M" + "</b>"  + " trips abroad in " + "<b>" + d.month + " " + d.year + "</b>")

  }
  var mouseleave = function(d) {
    tooltip.style("opacity", 0)
  }


  // add the squares
  svg.selectAll()
    .data(data)
    .enter()
    .append("rect")
      .attr("x", function(d) { return x(d.year) })
      .attr("y", function(d) { return y(d.month) })
      .attr("width", x.bandwidth() )
      .attr("height", y.bandwidth() )
      .style("fill", function(d) { return myColor(d.visits)} )
      .style("stroke-width", 4)
      .style("stroke", "none")
      .style("opacity", 0.8)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseoverbar = function(d) {
    tooltip.style("opacity", 1)
  }
  var mousemovebar = function(d) {
    var mouse = d3.mouse(d3.select('#holidays_viz').node()).map(function(d) {return parseInt(d); });
    tooltip
        .style("top", mouse[1] + "px")
        .style("left", (mouse[0] + 30) + "px")
      .html("<b>" + Math.round((d.value)/1000) + "M"  + "</b>" + " trips abroad in " + "<b>" + d.key + "</b>")

  }
  var mouseleavebar = function(d) {
    tooltip.style("opacity", 0)
  }

    // top Bars
    svg.selectAll("mybar")
      .data(data_year)
      .enter()
      .append("rect")
        .attr("x", function(d) { return xbars(d.key) + (xbars.bandwidth()/4); })
        .attr("y", function(d) { return ybars(d.value); })
        .attr("width", xbars.bandwidth()/2)
        .attr("height", function(d) { return (height/6) + 20 - ybars(d.value); })
        .attr("fill", function(d) { return myColorbars(d.value)} )
        .on("mouseover", mouseoverbar)
        .on("mousemove", mousemovebar)
        .on("mouseleave", mouseleavebar)

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseoverbarr = function(d) {
    tooltip.style("opacity", 1)
  }
  var mousemovebarr = function(d) {
    var mouse = d3.mouse(d3.select('#holidays_viz').node()).map(function(d) {return parseInt(d); });
    tooltip
        .style("top", mouse[1] + "px")
        .style("left", (mouse[0] + 30) + "px")
      .html("<b>" + Math.round((d.value)/1000) + "M" + "</b>" + " trips abroad in " + "<b>" + d.key + "</b>" + " since 1986")

  }
  var mouseleavebarr = function(d) {
    tooltip.style("opacity", 0)
  }

    // right Bars
    svg.selectAll("rbars")
      .data(data_months)
      .enter()
      .append("rect")
        .attr("x", width/4*3+10)
        .attr("y", function(d) {return y(d.key) + (y.bandwidth()/4)})
        .attr("width", function(d) { return xrbars(d.value); })
        .attr("height", y.bandwidth()/2)
        .attr("fill", function(d) { return myColorrbars(d.value)} )
        .on("mouseover", mouseoverbarr)
        .on("mousemove", mousemovebarr)
        .on("mouseleave", mouseleavebarr)

//Append a defs (for definition) element to your SVG
var defs = svg.append("defs");

//Append a linearGradient element to the defs and give it a unique id
var linearGradient = defs.append("linearGradient")
    .attr("id", "linear-gradient");

//Horizontal gradient
linearGradient
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");

//Draw the rectangle and fill with gradient
var scale = svg.append("rect")
    .attr("width", 400)
    .attr("height", 20)
    .attr('x', width/8*3 - 200)
    .attr('y', height+70)
    .attr('rx', 6).attr('ry',6)
    .style("fill", "url(#linear-gradient)");

svg.append('text')
    .attr('x', width/8*3 - 220)
    .attr('y', height+80)
    .attr('text-anchor', 'end')
    .style("fill", "grey")
    .attr("font-family", "Verdana")
    .attr('alignment-baseline', 'middle')
    .text('Less Travellers')
svg.append('text')
    .attr('x', width/8*3 + 220)
    .attr('y', height+80)
    .style("fill", "grey")
    .attr('text-anchor', 'start')
    .attr("font-family", "Verdana")
    .attr('alignment-baseline', 'middle')
    .text('More Travellers')

// financial crisis
svg.append('text')
    .attr('x', x(2009))
    .attr('y', -50)
    .style("fill", "grey")
    .attr('text-anchor', 'start')
    .style('font-weight','bold')
    .attr("font-family", "Verdana")
    .attr('alignment-baseline', 'middle')
    .text('Late-2000')
svg.append('text')
    .attr('x', x(2009))
    .attr('y', -30)
    .style("fill", "grey")
    .attr('text-anchor', 'start')
    .attr("font-family", "Verdana")
    .attr('alignment-baseline', 'middle')
    .text('financial crisis - ')
svg.append('text')
    .attr('x', x(2009))
    .attr('y', -15)
    .attr('text-anchor', 'start')
    .style("fill", "grey")
    .attr("font-family", "Verdana")
    .attr('alignment-baseline', 'middle')
    .text('first drop since the early 90s')
var topbar_center = (xbars.bandwidth()/4) + xbars.bandwidth()/4
svg.append('path')
    .attr('d', d3.line()([[xbars(2009)+ topbar_center , 30], [xbars(2009)+ topbar_center , 0]]))
    .attr('stroke', 'grey')
    .style("stroke-dasharray", ("3, 3"))
    .attr('fill', 'none');

// 1991 recession
svg.append('text')
    .attr('x', x(1991))
    .attr('y', 0)
    .style("fill", "grey")
    .attr('text-anchor', 'start')
    .style('font-weight', 'bold')
    .attr("font-family", "Verdana")
    .attr('alignment-baseline', 'middle')
    .text('1991')
svg.append('text')
    .attr('x', x(1991))
    .attr('y', 20)
    .style("fill", "grey")
    .attr('text-anchor', 'start')
    .attr('alignment-baseline', 'middle')
    .attr("font-family", "Verdana")
    .text('UK Recession')
svg.append('path')
    .attr('d', d3.line()([[xbars(1991)+ topbar_center , 40], [xbars(1991)+ topbar_center , 70]]))
    .attr('stroke', 'grey')
    .style("stroke-dasharray", ("3, 3"))
    .attr('fill', 'none');

// 2019
svg.append('text')
    .attr('x', x(2019))
    .attr('y', -100)
    .style("fill", "grey")
    .style('font-weight', 'bold')
    .attr('text-anchor', 'start')
    .attr("font-family", "Verdana")
    .attr('alignment-baseline', 'middle')
    .text('2019')
svg.append('text')
    .attr('x', x(2019))
    .attr('y', -80)
    .style("fill", "grey")
    .attr('text-anchor', 'start')
    .attr("font-family", "Verdana")
    .attr('alignment-baseline', 'middle')
    .text('A new high - 93M trips abroad')
svg.append('path')
    .attr('d', d3.line()([[xbars(2019)+ topbar_center , -10], [xbars(2019)+ topbar_center , -60]]))
    .attr('stroke', 'grey')
    .style("stroke-dasharray", ("3, 3"))
    .attr('fill', 'none');

//A color scale
var colorScale = d3.scaleLinear()

    .range(["#440154FF", "#482677FF","#453781FF","#404788FF","#39568CFF",
            "#33638DFF","#2D708EFF","#287D8EFF","#238A8DFF", '#1F968BFF', '#20A387FF', '#29AF7FFF', '#3CBB75FF',
            '#55C667FF', '#73D055FF', '#95D840FF', '#B8DE29FF', '#DCE319FF', '#FDE725FF']);

//Append multiple color stops by using D3's data/enter step
linearGradient.selectAll("stop")
    .data( colorScale.range() )
    .enter().append("stop")
    .attr("offset", function(d,i) { return i/(colorScale.range().length-1); })
    .attr("stop-color", function(d) { return d; });

svg.append('path')
    .attr('d', d3.line()([[width/8*7-10 , y("Aug") - y.bandwidth()*1.5], [width/8*7 , y("Aug") - y.bandwidth()*1.5], [width/8*7 , y("Aug") + y.bandwidth()*2.5], [width/8*7 -10 , y("Aug") + y.bandwidth()*2.5]]))
    .attr('stroke', 'grey')
    .style("stroke-dasharray", ("3, 3"))
    .attr('fill', 'none');
svg.append('text')
    .attr('x', width/8*7 + 20)
    .attr('y', y("Aug") + y.bandwidth()/2 - 10  )
    .style("fill", "grey")
    .attr('text-anchor', 'start')
    .style('font-weight', 'bold')
    .attr("font-family", "Verdana")
    .attr('alignment-baseline', 'middle')
    .text('Summer months')
svg.append('text')
    .attr('x', width/8*7 + 20)
    .attr('y', y("Aug") + y.bandwidth() -5)
    .style("fill", "grey")
    .attr('text-anchor', 'start')
    .attr("font-family", "Verdana")
    .attr('alignment-baseline', 'middle')
    .text('are the peak for travel')


})

