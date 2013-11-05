var sleeppieChart = dc.pieChart("#sleep-pie", "sleepchart");

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
  	});
	// Load data
	var ups = crossfilter(data);

	// Define dimension
	var weekdayDimension = ups.dimension(function (d) {
   		return +d.wkday+1; 
  	});

	// Define group
	var upSleepWeek = weekdayDimension.group().reduceSum(function (d) {
		return +d.s_quality;
		});
	var weekdayValueGroup = weekdayDimension.group().reduce(
    	// add
    	function (p, v) {
      		++p.count;
      		p.slint += v.s_asleep_time;
      		p.slint_avg = p.slint / p.count;
      		p.awakeInt += v.s_awake_time;
      		p.deepInt += v.s_deep;
      		p.lightInt += v.s_light; 
      		p.slDuration += v.s_duration;
      		p.s_quality += v.s_quality; 
      		return p;
    	},
    	// remove
    	function (p, v) {
      		--p.count;
      		p.slint -= v.s_asleep_time;
      		p.slint_avg = p.slint / p.count;
      		p.awakeInt -= v.s_awake_time;
      		p.deepInt -= v.s_deep;
      		p.lightInt -= v.s_light; 
      		p.slDuration -= v.s_duration;
      		p.slQuality -= v.s_quality; 
      		return p;
    	},
    	// initialize
    	function () {
      		return {count: 0, slint:0, slint_avg: 0,
        		awakeInt: 0, deepInt: 0, lightInt: 0, slDuration: 0, slQuality:0};
    	})

	var sleepColors = ["#d9ef8b","#a6d96a","#66bd63","#D9EDF7","#ccece6", "#e6f5d0","#b8e186","#7fbc41","#99d8c9","#41ae76","#238b45","#ccebc5","#e0f3db","#78c679","#41ab5d"];

	sleeppieChart
		.width(280)
		.height(280)
		.radius(80)
		.renderLabel(false)
    	.dimension(weekdayDimension)
    	.group(upSleepWeek)
    	.innerRadius(30)
    	.transitionDuration(500)
    	.colors(sleepColors);

// Render!!!
dc.renderAll("sleepchart");
d3.selectAll("g.x text")
	.attr("class", "campusLabel")
    .style("text-anchor", "end") 
    .attr("transform", "translate(-10,0)rotate(315)");

});

