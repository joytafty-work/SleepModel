var sleeppieChart = dc.pieChart("#sleep-pie", "sleepchart");
var sleepbarChart = dc.barChart("#sleep-qual-bar", "sleepchart");

var g;

// set dc.js version in title
d3.selectAll("#version").text(dc.version);

d3.csv("../static/data/UP/UPSleepHeader_noempty.csv", function(error, data) {

 	var dateFormat = d3.time.format("%m/%d/%Y");
  	var numberFormat = d3.format(".2f");
  
  	// Parse date
  	data.forEach(function (d) {
    	d.month = parseInt((d.date).substring(4,6));
    	d.wkday = moment(d.date, 'YYYYMMDD').weekday();
    	d.monthName = moment(d.date, 'YYYYMMDD').month(d.date).format("MMM");
  	});

	// Load data
	var ups = crossfilter(data);

	// Monthly dimension
  var monthlyDimension = ups.dimension(function (d) {
      return +d.month; 
  });
  // Weekly dimension
	var weekdayDimension = ups.dimension(function (d) {
   		return +d.wkday+1; 
      // var name=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
      // return day+"."+name[day];
  	});

  // Counts of data types by weekdays
  var weekdayGroup = weekdayDimension.group();
  var counts = weekdayGroup.reduceCount().all()
  var countByWeekday = {};
  Array.prototype.slice.call(counts).forEach(function(d) {
    countByWeekday[d.key] = d.value;
  })

  // Counts of data types by Months

  var avgByDayOfWeekGroup = weekdayDimension.group().reduce(
    function (p, v) {
      ++p.days; 
      p.asleep += v.s_duration; 
      p.avg_asleep = Math.round(p.asleep / p.days);
      return p; 
    }, 
    function (p, v) {
      --p.days; 
      p.asleep -= v.s_duration; 
      p.avg_asleep = p.days ? Math.round(p.asleep / p.days) : 0;
      return p; 
    }, 
    function (p, v) {
      return {days: 0, asleep:0, avg_asleep: 0};
    });

	// Define group
	var upSleepQualWeek = weekdayDimension.group().reduceSum(function (d, i) {
    // console.log(d.s_quality, countByWeekday[d.wkday+1]);
		return +d.s_quality/countByWeekday[d.wkday+1];
		});

  var upSleepQualCount = weekdayDimension.group().reduceCount(function (d) {
    return +d.s_quality;
  })

  var upSleepQualMonth = monthlyDimension.group().reduceSum(function (d) {
    return +d.s_quality;
  })

  var sleepColors = colorbrewer.BuPu[9]

  // Sleep quality Chart
  sleepbarChart
    .width(320)
    .height(240)
    .margins({top: 10, right: 50, bottom: 30, left: 50})
    .x(d3.scale.linear().domain([0, 7.5]))
    .brushOn(false)
    .dimension(weekdayDimension, "Weekday dimension")
    .group(upSleepQualWeek , "Sleep quality over weekdays")
    .yAxisLabel('Sleep Quality (%)')
    .xAxisLabel('Day of week')
    .renderHorizontalGridLines(true)
    .renderLabel(true)
    .elasticY(true)
    .centerBar(true)
    .gap(5)

	sleeppieChart
		.width(280)
		.height(280)
		.radius(80)
		.renderLabel(false)
    	.dimension(monthlyDimension)
    	.group(upSleepQualMonth)
    	.innerRadius(30)
    	.transitionDuration(500)
    	.colors(sleepColors);

  // 6. Data-Count
  dc.dataCount("#sleep-data-count", "sleepchart")
    .dimension(ups)
    .group(ups.groupAll());

// Render!!!
dc.renderAll("sleepchart");
d3.selectAll("g.x text")
	.attr("class", "campusLabel")
    .style("text-anchor", "end") 
    .attr("transform", "translate(-10,0)rotate(315)");

});

