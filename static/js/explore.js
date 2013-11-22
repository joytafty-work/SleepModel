

// scene.append("orthoviewpoint")
//   .attr("centerOfRotation", [5, 5, 5])
//   .attr("fieldOfView", [-5, -5, 15, 15])
//   .attr("orientation", [-0.5, 1, 0.2, 1.12*Math.PI/4])
//   .attr("position", [8, 4, 15])

// var rows = initializeDataGrid();
// var axisRange = [0, 10];
// var scales = [];
// var initialDuration = 0;
// var defaultDuration = 800;
// var ease = 'linear';
// var time = 0;
// var axisKeys = ["x", "y", "z"]

// set dc.js version in title
// d3.selectAll("#version").text(dc.version);

// d3.csv("../static/data/AllUPs.csv", function(error, data) {
//   var dateFormat = d3.time.format("%m/%d/%Y");
//   var numberFormat = d3.format(".2f");
  
//   // Parse date
//   data.forEach(function (d) {
//     d.month = parseInt((d.DATE).substring(4,6));
//     d.wkday = moment(d.DATE, 'YYYYMMDD').weekday();
//   })

//   // Load data
//   var ups = crossfilter(data);
//   // Dimension for Bubble plot
//   var weekdayDimension = ups.dimension(function (d) {return +d.wkday+1; });
//   // Group for Bubble plot
//   var weekdayValueGroup = weekdayDimension.group().reduce(
//     // add
//     function (p, v) {
//       ++p.count;
//       p.slint += v.s_asleep_time;
//       p.slint_avg = p.slint / p.count;
//       p.awakeInt += v.s_awake_time;
//       p.deepInt += v.s_deep;
//       p.lightInt += v.s_light; 
//       p.slDuration += v.s_duration;
//       p.s_quality += v.s_quality; 
//       return p;
//     },
//     // remove
//     function (p, v) {
//       --p.count;
//       p.slint -= v.s_asleep_time;
//       p.slint_avg = p.slint / p.count;
//       p.awakeInt -= v.s_awake_time;
//       p.deepInt -= v.s_deep;
//       p.lightInt -= v.s_light; 
//       p.slDuration -= v.s_duration;
//       p.slQuality -= v.s_quality; 
//       return p;
//     },
//     // initialize
//     function () {
//       return {count: 0, slint:0, slint_avg: 0,
//         awakeInt: 0, deepInt: 0, lightInt: 0, slDuration: 0, slQuality:0};
//     }
//     )

// // Dimension for movement distance
// var moveDays = ups.dimension(function (d) {
//   doy = moment(d.DATE, 'YYYYMMDD');
//   return doy;
// });

// // Group for movement distance
// var moveDaysGroup = moveDays.group().reduce(
//   function (p, v) {
//     ++p.days;
//     p.total += v.m_distance/1000; 
//     p.mvavg = Math.round(p.total / p.days);
//     return p;
//   },
//   function (p, v) {
//     --p.days;
//     p.total -= v.m_distance; 
//     p.mvavg = Math.round(p.total / p.days);
//     return p;
//   },
//   function () {
//     return {days:0, total:0, mvavg:0};
//   });

  // slBubble
  //   .width(400)
  //   .height(280)
  //   .transitionDuration(1500)
  //   .margins({top: 10, right: 10, bottom: 30, left: 50})
  //   .dimension(weekdayDimension)
  //   .group(weekdayValueGroup)
  //   .colors(colorbrewer.RdYlGn[9]) // color function or array for bubbles
  //   .colorDomain([0, 500])
  //   .colorAccessor(function (p) {
  //     return Math.random()*parseInt(p.value.awakeInt);})
  //   .keyAccessor(function (p) {return 0.01*Math.random()+parseInt(p.key);})
  //   .valueAccessor(function (p) {return parseInt(p.value.slint);})
  //   .radiusValueAccessor(function (p) {return parseInt(p.value.awakeInt);})
  //   .maxBubbleRelativeSize(0.1)
  //   .x(d3.scale.linear().domain([0, 10]))
  //   .y(d3.scale.linear().domain([0, 2000]))
  //   .r(d3.scale.linear().domain([0, 1000]))
  //   .renderHorizontalGridLines(true)
  //   .renderVerticalGridLines(true)
  //   .xAxisLabel("Month")
  //   .yAxisLabel("Sleep Interval")
  //   // .elasticY(true)
  //   .elasticX(true); 

  // Render!!!
//   dc.renderAll("explores");
//   d3.selectAll("g.x text")
//     .attr("class", "campusLabel")
//       .style("text-anchor", "end") 
//     .attr("transform", "translate(-10,0)rotate(315)");
// });

