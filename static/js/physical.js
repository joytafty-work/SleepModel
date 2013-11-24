var physpieChart = dc.pieChart("#phys-month-pie", "physchart");
var physweekRow = dc.rowChart("#phys-week-bar", "physchart");
var physbarChart = dc.barChart("#phys-bar-chart", "physchart");
var physmoveChart = dc.lineChart("#phys-move-chart", "physchart");
var stepVlcatChart = dc.bubbleChart("#steps-v-lcat", "physchart");

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
  // Total Active
  var TactMM = monthlyDimension.group().reduceSum(function (d) {
  	return +(d.m_active_time/60)/30;
  });
  var TictMM = monthlyDimension.group().reduceSum(function (d) {
  	return +(d.m_inactive_time/60)/30;
  })

  // Longest Active
  var upLcatMM = monthlyDimension.group().reduceSum(function(d) {
  	return +(d.m_lcat/60)/30;
  });
  // Longest Idle
  var upLcitMM = monthlyDimension.group().reduceSum(function(d) {
  	return +(d.m_lcit/60)/30;
  });
  // Steps
  var upStepWeekday = dayOfWeekDimension.group().reduceSum(function (d) {
  	return +d.m_steps/30;
  });
  // Workout by Month
  var upWorkoutMonth = monthNameDimension.group().reduceSum(function (d) {
  	var nmins_month = 30*24;
  	return (+d.m_workout_time)/nmins_month;
  })

// Longest Active. vs. Steps

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

var actGroup = monthlyDimension.group().reduce(
	function (p,v) {
	    ++p.months;
    	p.lcat += v.m_lcat/60/30;
    	p.lcit += v.m_lcit/60/30;
    	p.tact += v.m_active_time/60/30; 
    	p.tict += v.m_inactive_time/60/30; 
		return p;		
	}, 
	function (p,v) {
	    --p.months;
    	p.lcat -= v.m_lcat/60/30;
    	p.lcit -= v.m_lcit/60/30;
    	p.tact -= v.m_active_time/60/30; 
    	p.tict -= v.m_inactive_time/60/30; 
		return p;		
	}, 
  	function () {
    return {months:0,
    		lcat:0, lcit:0, tact:0, tict:0};
    });

// Define tooltips
var tip = d3.tip()
	.attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function (d) { return "<span style='color: yellow'>" +  d.key + "</span> : "  + numberFormat(d.value) + " steps"; });

// tooltips for pie chart
var pieTip = d3.tip()
	.attr('class', 'd3-tip')
	.offset([-10, 0])
	.html(function (d) { return "<span style='color: yellow'>" +  d.data.key + "</span> : "  + numberFormat(d.value) + " mins"; });


var barTip = d3.tip()
	.attr('class', 'd3-tip')
	.offset([-10, 0])
	.html(function (d) { 
		return "<span style='color: yellow'>" + d.data.key + "</span> : " + numberFormat(d.y) + " mins";
	});

var bubTip = d3.tip()
	.attr('class', 'd3-tip')
	.offset([-10, 0])
	.html(function (d) { 
		return "<span style='color: yellow'> (" + numberFormat(d.value.tact) + "</span>, " + numberFormat(d.value.lcat) + ") mins";
	});


	// set colors to green <--> blue
    var physColors = ["#d9ef8b","#a6d96a","#66bd63","#D9EDF7","#ccece6", "#e6f5d0","#b8e186","#7fbc41","#99d8c9","#41ae76","#238b45","#ccebc5","#e0f3db","#78c679","#41ab5d"];

// 1. Chart : physpieChart
physpieChart
	.width(280)
	.height(280)
	.radius(80)
	.renderLabel(false)
    .dimension(monthNameDimension)
    .group(upWorkoutMonth)
    .innerRadius(0)
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
    .x(d3.scale.linear().domain([0.5, 12.5]))
	// .x(d3.time.scale().domain([new Date(2013, 1, 1), new Date(2013, 11, 31)]))
    // .round(d3.time.month.round)
    // .xUnits(d3.time.months)
 	.brushOn(false)
    .xAxisLabel("Months")
    .yAxisLabel("Longest Activity Time (mins)")
    .dimension(monthNameDimension, "Monthly Value Group")
    .group(upLcitMM, "Longest Idle")	
    .stack(upLcatMM, "Longest Active")
    .renderHorizontalGridLines(true)
    .colors([physColors[1], physColors[9]])
    .renderLabel(true)
    .elasticY(true)
    .centerBar(true)
    .legend(dc.legend().x(235).y(10))
    .gap(5);

// 4. Chart: physmovechart
 physmoveChart
    .renderArea(true)
    .width(450)
    .height(270)
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
    .elasticX(true)
    .elasticY(true);

// 5. BubbleChart
stepVlcatChart
    .width(450)
    .height(270)
    .transitionDuration(800)
    .margins({top: 50, right: 50, bottom: 30, left: 50})
    .mouseZoomable(true)
    .dimension(monthlyDimension)
    .group(actGroup)
    .colors(physColors) // (optional) define color function or array for bubbles
    // .colorDomain([0, 50]) 
    .xAxisLabel("Total Active (mins)")
    .yAxisLabel("Longest Active (mins)")
    .keyAccessor(function (p) {
    	return p.value.tact;
    })
    .valueAccessor(function (p) {
      	return p.value.lcat;
    })
    .radiusValueAccessor(function (p) {
        return p.value.lcit;
    })
    .maxBubbleRelativeSize(0.5)
    .x(d3.scale.linear().domain([0, 250]))
    .y(d3.scale.linear().domain([0, 1000]))
    .r(d3.scale.linear().domain([0, 7000]))  
    .renderHorizontalGridLines(true)
    .renderVerticalGridLines(true)
    .elasticX(true)
    .elasticY(true);

// 6. Data-Count
dc.dataCount("#phys-data-count", "physchart")
  .dimension(ups)
  .group(ups.groupAll());

// 7. Data-Table
// dc.dataTable('#phys-data-table', "physchart")


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

d3.selectAll(".node").call(bubTip);
d3.selectAll(".node")
	.on('mouseover', bubTip.show)
	.on('mouseout', bubTip.hide);
});