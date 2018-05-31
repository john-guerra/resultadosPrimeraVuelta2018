/* global d3, topojson, $ , choropletColombia */

// var svg = d3.select("svg"),
//   width = $(document).width()*10/12,
//   height = $(document).height()-200,
//   margin = { top: 20, bottom: width>767 ? 20 : 100, right: 20, left: 0},
//   centered,
//   fmt = d3.format(" >5.2%");

// svg.attr("width", width)
//   .attr("height", height);
function ready(error, mapData, data) {
  if (error) throw error;


  var candidates =  ["iván duque",
    "gustavo petro",
    "sergio fajardo",
    "germán vargas lleras",
    "humberto de la calle",
    "votos_en_blanco"
  ];
  var fmt = d3.format(" >5.2%");
  var dictCities = {};
  data.forEach(function (d) {
    //Parse the percentages
    candidates.forEach(function (c) {
      d[c+" result"] = +d[c]/+d["votantes"];
    });

    // var res = {};
    dictCities[d.municipio.toUpperCase()+d.departamento.toUpperCase()]=d;
  });

  var color = d3.scaleOrdinal()
    .domain(candidates)
    .range([d3.interpolateBlues, d3.interpolateOranges, d3.interpolateGreens, d3.interpolatePurples,  d3.interpolateReds, d3.interpolateGreys  ]
      .map(function (int) {
        return d3.scaleSequential(int)
          .domain([0, d3.select("#inThreshold").property("value")]);
        // .domain(d3.extent(data, function (d) { return d[result]; }));

      })
    );

  var names = d3.scaleOrdinal()
    .domain(candidates)
    .range(["Duque", "Petro", "Fajardo", "Vargas Lleras", "De la Calle", "Voto en Blanco"]);

  var zoom = d3.zoom()
    .scaleExtent([1, 15])
    .on("zoom", zoomed);

  function zoomed() {
    console.log(d3.event.transform);
    d3.selectAll(".map").select("g").attr("transform", d3.event.transform);
  }

  var maps = d3.select("#target")
    .selectAll(".map")
    .data(candidates);

  var mapsEnter = maps
    .enter()
    .append("div")
    .attr("class", "map col-xs-12 col-sm-4"  );

  mapsEnter.append("h3")
    .text(function (d) { return names(d); });


  var dMaps = {};
  mapsEnter.append("svg")
    .style("width", "100%")
    .style("height", "100%")
    .each(function (d) {
      dMaps[d]=choropletColombia(this, mapData, data, d + " result", dictCities, color(d), zoom);
    });


  d3.select("#inThreshold")
    .on("change", function () {
      var threshold = +d3.select("#inThreshold").property("value");
      console.log("Change threshold", threshold);
      color.range([d3.interpolateBlues, d3.interpolateOranges, d3.interpolateGreens, d3.interpolatePurples,  d3.interpolateReds, d3.interpolateGreys  ]
        .map(function (int) {
          return d3.scaleSequential(int)
            .domain([0, threshold]);
          // .domain(d3.extent(data, function (d) { return d[result]; }));
        })
      );

      maps.merge(mapsEnter).each(function (c) {
        dMaps[c].updateColor(color(c));
      });


      d3.select("#spanThreshold").text(fmt(threshold));
    });
}



d3.queue()
  .defer(d3.json, "./data/colombia-municipios.json" )
  .defer(d3.csv, "./data/primera_vuelta_presidencial.csv" )
  .await(ready);
