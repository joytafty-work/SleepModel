var sleeppieChart = dc.pieChart("#sleep-pie", "sleepchart");
var sleepqualChart = dc.barChart("#sleep-qual-bar", "sleepchart");
var sleepdurChart = dc.barChart("#sleep-dur-bar", "sleepchart");
var lightDeepChart = dc.bubbleChart("#sleep-light-deep-chart", "sleepchart");
var asleepAwakeChart = dc.bubbleChart("#sleep-asleep-awake-chart", "sleepchart");

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

  var awakenDimension = ups.dimension(function (d) {
    return +d.s_awakenings;
  })

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
      // Sleep duration in hr
      p.s_duration += Number(v.s_duration/3600); 
      p.avg_duration = Math.round(p.s_duration / p.days);
      p.s_quality += Number(v.s_quality);
      p.avg_quality = Math.round(p.s_quality / p.days);
      return p; 
    }, 
    function (p, v) {
      --p.days; 
      // Sleep duration in hr
      p.s_duration -= Number(v.s_duration/3600); 
      p.avg_duration = p.days ? Math.round(p.s_duration / p.days) : 0;
      p.s_quality -= Number(v.s_quality);
      p.avg_quality = p.days ? Math.round(p.s_quality / p.days) : 0;
      return p; 
    }, 
    function () {
      return {
        days: 0, s_duration:0, avg_duration:0, 
        s_quality:0, avg_quality:0
        };
    });

  var sleepDetailBubbleGroup = monthlyDimension.group().reduce(
      function (p, v) {
        ++p.nights; 
        // Duration in mins
        p.s_deep += Number(v.s_deep/60);
        p.avg_deep = Math.round(p.s_deep / p.nights);
        p.s_light += Number(v.s_light/60);
        p.avg_light = Math.round(p.s_light / p.nights);        
        p.s_asleep_time += Number(v.s_asleep_time/60);
        p.avg_asleep_time = Math.round(p.s_asleep_time / p.nights);
        p.s_awake_time += Number(v.s_awake_time/60);
        p.avg_awake_time = Math.round(p.s_awake_time / p.nights);
        p.s_duration += Number(v.s_duration/60); 
        p.avg_duration = Math.round(p.s_duration / p.nights);
        p.s_quality += Number(v.s_quality);
        p.avg_quality = Math.round(p.s_quality / p.nights);
        return p;
      }, 
      function (p, v) {
        --p.nights; 
        // Duration in mins
        p.s_deep -= Number(v.s_deep/60);
        p.avg_deep = p.nights ? Math.round(p.s_deep / p.nights) : 0;
        p.s_light -= Number(v.s_light/60);
        p.avg_light = p.nights ? Math.round(p.s_light / p.nights) : 0;        
        p.s_asleep_time -= Number(v.s_asleep_time/60);
        p.avg_asleep_time = p.nights ? Math.round(p.s_asleep_time / p.nights) : 0;
        p.s_awake_time -= Number(v.s_awake_time/60);
        p.avg_awake_time = p.nights ? Math.round(p.s_awake_time / p.nights) : 0;
        p.s_duration -= Number(v.s_duration/60); 
        p.avg_duration = p.nights ? Math.round(p.s_duration / p.nights) : 0;        
        p.s_quality -= Number(v.s_quality);
        p.avg_quality = p.nights ? Math.round(p.s_quality / p.nights) : 0; 
        return p;
      }, 
      function () {
        return {nights:0, 
          s_deep:0, avg_deep:0, s_light:0, avg_light:0, 
          s_asleep_time:0, avg_asleep_time:0, 
          s_awake_time:0, avg_awake_time:0, 
          s_duration:0, avg_duration:0,
          s_quality:0, avg_quality:0
        };
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

  var sleepQualAwakening = awakenDimension.group().reduceCount(function (d, i){
    return +i;
  })

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

  // Define plot color
  var sleepColors2 = colorbrewer.RdPu[9];
  var sleepColors = ["#fde0dd","#fa9fb5","#e7e1ef","#d4b9da","#c994c7","#fcc5c0","#df65b0","#e7298a","#ce1256", "#f768a1","#dd3497","#e78ac3","#f1b6da","#c51b7d"];

  sleeppieChart
    .width(280)
    .height(280)
    .radius(80)
    .renderLabel(false)
      .dimension(awakenDimension)
      .group(sleepQualAwakening)
      .innerRadius(20)
      .transitionDuration(500)
      .colors(sleepColors);

  // Sleep quality Chart
  sleepqualChart
    .width(280)
    .height(240)
    .margins({top: 10, right: 50, bottom: 30, left: 50})
    .x(d3.scale.linear().domain([0, 7.5]))
    .brushOn(false)
    .dimension(weekdayDimension, "Weekday dimension")
    .group(avgByDayOfWeekGroup, "Sleep quality over weekdays")
    .valueAccessor(function (p) {
      return p.value.avg_quality;
    })
    .yAxisLabel('Sleep Quality (%)')
    .xAxisLabel('Day of week')
    .renderHorizontalGridLines(true)
    .renderLabel(true)
    .elasticY(true)
    .centerBar(true)
    .gap(5)

sleepdurChart
    .width(280)
    .height(240)
    .margins({top: 10, right: 50, bottom: 30, left: 50})
    .x(d3.scale.linear().domain([0, 7.5]))
    .brushOn(false)
    .dimension(weekdayDimension, "Weekday dimension")
    .group(avgByDayOfWeekGroup , "Sleep quality over weekdays")
    .valueAccessor(function (p) {
      return p.value.avg_duration;
    })
    .yAxisLabel('Sleep Duration (hr)')
    .xAxisLabel('Day of week')
    .renderHorizontalGridLines(true)
    .renderLabel(true)
    .elasticY(true)
    .centerBar(true)
    .gap(5)    

lightDeepChart
    .width(420)
    .height(270)
    .transitionDuration(800)
    .margins({top: 50, right: 50, bottom: 30, left: 50})
    .mouseZoomable(true)
    .dimension(monthlyDimension)
    .group(sleepDetailBubbleGroup)
    .colors(sleepColors) // (optional) define color function or array for bubbles
    // .colorDomain([0, 50]) 
    .xAxisLabel("Average Deep Sleep (mins)")
    .yAxisLabel("Average Light Sleep (mins)")
    .keyAccessor(function (p) {
      return p.value.avg_deep;
    })
    .valueAccessor(function (p) {
        return p.value.avg_light;
    })
    .radiusValueAccessor(function (p) {
        return p.value.avg_duration;
    })
    .maxBubbleRelativeSize(0.4)
    .x(d3.scale.linear().domain([0, 500]))
    .y(d3.scale.linear().domain([0, 1000]))
    .r(d3.scale.linear().domain([0, 7000]))  
    .renderHorizontalGridLines(true)
    .renderVerticalGridLines(true)
    .elasticX(true)
    .elasticY(true);

asleepAwakeChart
    .width(420)
    .height(270)
    .transitionDuration(800)
    .margins({top: 50, right: 50, bottom: 30, left: 50})
    .mouseZoomable(true)
    .dimension(monthlyDimension)
    .group(sleepDetailBubbleGroup)
    .colors(sleepColors2) // (optional) define color function or array for bubbles
    // .colorDomain([0, 50]) 
    .xAxisLabel("Average total asleep time (mins)")
    .yAxisLabel("Average total awake time (mins)")
    .keyAccessor(function (p) {
      return p.value.avg_asleep_time;
    })
    .valueAccessor(function (p) {
        return p.value.avg_awake_time;
    })
    .radiusValueAccessor(function (p) {
        return p.value.avg_quality;
    })
    .maxBubbleRelativeSize(0.85)
    .x(d3.scale.linear().domain([0, 500]))
    .y(d3.scale.linear().domain([0, 1000]))
    .r(d3.scale.linear().domain([0, 5000]))  
    .renderHorizontalGridLines(true)
    .renderVerticalGridLines(true)
    .elasticX(true)
    .elasticY(true);

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

// Add tooltips
// d3.selectAll("g.row").call(tip);
// d3.selectAll("g.row")
//   .on('mouseover', tip.show)
//   .on('mouseout', tip.hide);

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

