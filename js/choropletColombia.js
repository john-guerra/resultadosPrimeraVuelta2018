/* global d3, topojson, $ */

function choropletColombia (selection, mapData, data, result, dictCities, color, zoom) {

  var svg = d3.select(selection),
    width = $(selection.node()).width(),
    height = width>400 ? $(document).height()-200 : width*1.2,
    margin = { top: 20, bottom: width>767 ? 20 : 100, right: 20, left: 0},
    centered,
    fmt = d3.format(" >5.2%");

  svg;

  var land = topojson.feature(mapData, {
    type: "GeometryCollection",
    geometries: mapData.objects.mpios.geometries.filter(function(d) {
      return (d.id / 10000 | 0) % 100 !== 99;
    })
  });
  var landState = topojson.feature(mapData, {
    type: "GeometryCollection",
    geometries: mapData.objects.depts.geometries.filter(function(d) {
      return (d.id / 10000 | 0) % 100 !== 99;
    })
  });

  // Add background
  svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height);
    // .on("click", clicked);
  // To allow the zoom back
  // svg.on("click", clicked);

  svg.style("pointer-events", "all")
    .call(zoom);
  var g = svg.append("g");



  // EPSG:32111
  var path = d3.geoPath()
    .projection(d3.geoTransverseMercator()
      .rotate([74 + 30 / 60, -38 - 50 / 60])
      .fitExtent([[margin.left, margin.top], [width-margin.right, height-margin.bottom]], land));
  var pathState = d3.geoPath()
    .projection(d3.geoTransverseMercator()
      .rotate([74 + 30 / 60, -38 - 50 / 60])
      .fitExtent([[margin.left, margin.top], [width-margin.right, height-margin.bottom]], landState));

  g.selectAll("path")
    .data(land.features)
    .enter().append("path")
    .attr("class", "tract")
    .on("click", clicked)
    // .on("mouseover", updateDetails)
    .style("fill", function (d) {
      var city = dictCities[d.properties.name];
      if (city)
        return color(city[result]);
      else {
        console.log(d.properties.name + "," + d.properties.dpt);
        return color(0);
      }
    })
    .attr("d", path)
    .append("title")
    .text(function(d) {
      var city = dictCities[d.properties.name];
      var msg = d.properties.name + ", " + d.properties.dpt;
      if (city)
        msg += fmt(city[result]);
      return msg;
    });
  g.append("path")
    .datum(topojson.mesh(mapData, mapData.objects.mpios, function(a, b) { return a !== b; }))
    .attr("class", "tract-border")
    .attr("d", path);

  g.append("path")
    .datum(topojson.mesh(mapData, mapData.objects.depts, function(a, b) { return a !== b; }))
    .attr("class", "tract-border-state")
    .attr("d", pathState);




  // The legend
  svg.append("g")
    .attr("class", "legend")
    .attr("transform",
      width>767 ?
        "translate("+(width - margin.right - 150)+",100)" :
        "translate("+(width/2 - 100)+"," + (height - 120) + ")"
    );

  var legendLinear = d3.legendColor()
    // .shapeWidth(30)
    // .cells(7)
    .orient(width>767 ? "vertical" : "horizontal")
    .title("% Votación")
    // .labels([
    // " 100.00% por el Si",
    // "  66.67%",
    // "  33.33%",
    // "   0.00%",
    // " -33.33%",
    // " -66.67%",
    // "-100.00% por el No",
    // ].reverse())
    // .labelFormat(fmt)
    .ascending(true)
    .labelAlign("end")
    .scale(color);

  svg.select(".legend")
    .call(legendLinear);

  // When clicked, zoom in
  function clicked(d) {
    // updateDetails(d);
    var x, y, k;

    // Compute centroid of the selected path
    if (d && centered !== d) {
    // if (d) {
      var centroid = path.centroid(d);
      x = centroid[0];
      y = centroid[1];
      // k = zoom.scaleExtent()[1];
      k = 10;
      centered = d;
    } else {
      x = width / 2;
      y = height / 2;
      k = 1;
      centered = null;
    }

    // Manually Zoom
    svg.transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity
        .translate(width/2, height/2)
        .scale(k )
        .translate(-x, -y));
  }







}

