var physpieChart = dc.pieChart("#phys-month-pie", "physchart");
var physweekRow = dc.rowChart("#phys-week-bar", "physchart");
var physbarChart = dc.barChart("#phys-bar-chart", "physchart");
var physmoveChart = dc.lineChart("#phys-move-chart", "physchart");

var g;

// set dc.js version in title
d3.selectAll("#version").text(dc.version);

d3.csv("../static/data/AllUPs.csv", function(error, data) {

  var dateFormat = d3.time.format("%m/%d/%Y");
  var numberFormat = d3.format(".2f");
  
  // Parse date
  data.forEach(function (d) {
    d.month = parseInt((d.DATE).substring(4,6));
    d.wkday = moment(d.DATE, 'YYYYMMDD').weekday();
    d.monthName = moment(d.DATE, 'YYYYMMDD').month(d.DATE).format("MMM");
  })

  // Load data
  var ups = crossfilter(data);
  // Define dimension
  var monthlyDimension = ups.dimension(function (d) {return +d.month; });
  var weekdayDimension = ups.dimension(function (d) {
   	return +d.wkday+1; 
  });
  var dayOfWeekDimension = ups.dimension(function (d) {
  	var day = d.wkday;
  	var name=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  	return day+":"+name[day];
  });
  var monthNameDimension = ups.dimension(function (d) {
  	var month = d.month;
  	return month+":"+d.monthName; 
  });

  // Define Groups
  var upCalMonth = monthlyDimension.group().reduceSum(function(d) {
  	return +d.e_calories/30;});
  var upStepWeekday = dayOfWeekDimension.group().reduceSum(function (d) {
  	return +d.m_steps/30;
  });

  var upWorkoutMonth = monthNameDimension.group().reduceSum(function (d) {
  	var nmins_month = 30*24;
  	return (+d.m_workout_time)/nmins_month;
  })

// Dimension for movement distance
var moveDays = ups.dimension(function (d) {
  doy = moment(d.DATE, 'YYYYMMDD');
  return doy;
});

// Group for movement distance
var meter2mi = 0.000621371; 
var moveDaysGroup = moveDays.group().reduce(
  function (p, v) {
    ++p.days;
    p.total += v.m_distance*meter2mi; 
    p.mvavg = Math.round(p.total / p.days);
    return p;
  },
  function (p, v) {
    --p.days;
    p.total -= v.m_distance*meter2mi; 
    p.mvavg = Math.round(p.total / p.days);
    return p;
  },
  function () {
    return {days:0, total:0, mvavg:0};
  });

// Define tooltips
var tip = d3.tip()
	.attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function (d) { return "<span style='color: #f0027f'>" +  d.key + "</span> : "  + numberFormat(d.value) + " steps"; });

// tooltips for pie chart
var pieTip = d3.tip()
	.attr('class', 'd3-tip')
	.offset([-10, 0])
	.html(function (d) { return "<span style='color: #f0027f'>" +  d.data.key + "</span> : "  + numberFormat(d.value) + " mins"; });


var barTip = d3.tip()
	.attr('class', 'd3-tip')
	.offset([-10, 0])
	.html(function (d) { 
		return "<span style='color: #f0027f'>" + d.data.key + "</span> : " + numberFormat(d.y) + " calories";
	});

	// set colors to red <--> purple
    var physColors = ["#fde0dd","#fa9fb5","#e7e1ef","#d4b9da","#c994c7","#fcc5c0","#df65b0","#e7298a","#ce1256", "#f768a1","#dd3497","#e78ac3","#f1b6da","#c51b7d"];

// 1. Chart : physpieChart
physpieChart
	.width(280)
	.height(280)
	.radius(80)
	.renderLabel(false)
    .dimension(monthNameDimension)
    .group(upWorkoutMonth)
    .innerRadius(30)
    .transitionDuration(500)
    .colors(physColors);

// 2. Chart : physweekBar
physweekRow
	.width(280)
	.height(240)
    .margins({top: 10, right: 50, bottom: 30, left: 50})
    .transitionDuration(500)
    .x(d3.scale.linear().domain([0.5, 7.5]))
    .dimension(dayOfWeekDimension, "Day of Week Value")
    .group(upStepWeekday)
    .title(function (d) {return +d.value;})
    .elasticX(true)
    .colors(physColors)
    .renderLabel(true)
    .gap(5)
    .xAxis().ticks(5).tickFormat(d3.format("s"));

// 3. Chart : physbarChart
physbarChart
    .width(320)
    .height(240)
    .margins({top: 10, right: 50, bottom: 30, left: 50})
    .x(d3.scale.linear().domain([-.5, 12.5]))
 //    .xUnits(dc.units.ordinal)
	// .x(d3.scale.ordinal()
	// 	.domain(["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
	// 			"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]))
	.brushOn(false)
    .xAxisLabel("Months")
    .yAxisLabel("Total Calories Recorded")
    .dimension(monthlyDimension, "Monthly Value Group")
    .group(upCalMonth)	
    .renderHorizontalGridLines(true)
    .elasticX(true)
    .elasticY(true)
    .centerBar(true)
	.colors(physColors)
    .gap(5);

// 4. Chart: physmovechart
 physmoveChart
    .renderArea(true)
    .width(960)
    .height(360)
    .transitionDuration(800)
    .margins({top: 50, right: 50, bottom: 30, left: 50})
    .mouseZoomable(true)
    // .x(d3.scale.linear().domain([0, 365]))
    .x(d3.time.scale().domain([new Date(2012, 11, 31), new Date(2013, 11, 31)]))
    .round(d3.time.month.round)
    .xUnits(d3.time.months)
    .dimension(moveDays)
    .group(moveDaysGroup)
    .yAxisLabel("Distance Covered (miles)")
    .valueAccessor(function (p) {
      return p.value.total;
    })  
    .renderHorizontalGridLines(true)
    .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
    .elasticY(true);

// 5. Data Table: 

// Render!!!
dc.renderAll("physchart");
d3.selectAll("g.x text")
	.attr("class", "campusLabel")
    .style("text-anchor", "end") 
    .attr("transform", "translate(-10,0)rotate(315)");

// Add tooltips
d3.selectAll("g.row").call(tip);
d3.selectAll("g.row")
	.on('mouseover', tip.show)
	.on('mouseout', tip.hide);

d3.selectAll(".pie-slice").call(pieTip);
d3.selectAll(".pie-slice")
	.on('mouseover', pieTip.show)
	.on('mouseout', pieTip.hide);

d3.selectAll(".bar").call(barTip);
d3.selectAll(".bar")
	.on('mouseover', barTip.show)
	.on('mouseout', barTip.hide); 
});