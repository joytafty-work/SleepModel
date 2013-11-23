var sleeppieChart = dc.pieChart("#sleep-pie", "sleepchart");
var sleepqualChart = dc.barChart("#sleep-qual-bar", "sleepchart");
var sleepdurChart = dc.barChart("#sleep-dur-bar", "sleepchart");
var lightDeepChart = dc.bubbleChart("#sleep-light-deep-chart", "sleepchart");
var asleepAwakeChart = dc.bubbleChart("#sleep-asleep-awake-chart", "sleepchart");
var sleepDOWstackChart = dc.barChart("#sleep-stack-chart", "sleepchart");

var g;

// set dc.js version in title
d3.selectAll("#version").text(dc.version);

d3.csv("../static/data/UP/UPSleepHeader_noempty.csv", function(error, data) {

 	var dateFormat = d3.time.format("%m/%d/%Y");
  	var numberFormat = d3.format(".2f");

// ===============================================  
  	// Parse date
  	data.forEach(function (d) {
    	d.month = parseInt((d.date).substring(4,6));
    	d.wkday = moment(d.date, 'YYYYMMDD').weekday();
    	d.monthName = moment(d.date, 'YYYYMMDD').month(d.date).format("MMM");
      var wokname=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
      // d.dowmonth = wokname[d.wkday] + "-" + d.monthName;
      // console.log(d.dowmonth);
  	});

// ===============================================
	// Load data
	var ups = crossfilter(data);

// ===============================================
// Define dimension
	// Monthly dimension
  var monthlyDimension = ups.dimension(function (d) {
      return +d.month; 
  });
  // Weekly dimension
	var weekdayDimension = ups.dimension(function (d) {
   		return +d.wkday+1; 
      // return day+"."+name[day];
  	});
  // Dimension based on number of sleep interruption
  var awakenDimension = ups.dimension(function (d) {
    return +d.s_awakenings;
  });
  // // Day of week in month dimension
  // var dowmonthDimension = ups.dimension(function (d) {
  //   return +d.dowmonth;
  // });

// ===============================================
  // Define group
  // Counts of data types by weekdays
  var weekdayGroup = weekdayDimension.group();
  var counts = weekdayGroup.reduceCount().all()
  var countByWeekday = {};
  Array.prototype.slice.call(counts).forEach(function(d) {
    countByWeekday[d.key] = d.value;
  })

  // Sleep Awaking (pie chart)
  var sleepQualAwakening = awakenDimension.group().reduceCount(function (d, i){
    return +i;
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

var dowmonthGroup = monthlyDimension.group().reduce(
    function (p, v) {
        p.n0 += Number(v.wkday == 0);
        p.squal0 += v.s_quality*Number(v.wkday == 0);
        p.sdur0 += v.s_duration*Number(v.wkday == 0)/3600;

        p.n1 += Number(v.wkday == 1);
        p.squal1 += v.s_quality*Number(v.wkday == 1);
        p.sdur1 += v.s_duration*Number(v.wkday == 1)/3600;

        p.n2 += Number(v.wkday == 2);
        p.squal2 += v.s_quality*Number(v.wkday == 2);
        p.sdur2 += v.s_duration*Number(v.wkday == 2)/3600;

        p.n3 += Number(v.wkday == 3);
        p.squal3 += v.s_quality*Number(v.wkday == 3);
        p.sdur3 += v.s_duration*Number(v.wkday == 3)/3600;

        p.n4 += Number(v.wkday == 4);
        p.squal4 += v.s_quality*Number(v.wkday == 4);
        p.sdur4 += v.s_duration*Number(v.wkday == 4)/3600;

        p.n5 += Number(v.wkday == 5);
        p.squal5 += v.s_quality*Number(v.wkday == 5);
        p.sdur5 += v.s_duration*Number(v.wkday == 5)/3600;

        p.n6 += Number(v.wkday == 6);
        p.squal6 += v.s_quality*Number(v.wkday == 6);
        p.sdur6 += v.s_duration*Number(v.wkday == 6)/3600;
        return p; 
      }, 
    function (p, v) {
      p.n0 -= Number(v.wkday == 0);
      p.squal0 -= v.s_quality*Number(v.wkday == 0);
      p.sdur0 -= v.s_duration*Number(v.wkday == 0)/3600;

      p.n1 -= Number(v.wkday == 1);
      p.squal1 -= v.s_quality*Number(v.wkday == 1);
      p.sdur1 -= v.s_duration*Number(v.wkday == 1)/3600;

      p.n2 -= Number(v.wkday == 2);
      p.squal2 -= v.s_quality*Number(v.wkday == 2);
      p.sdur2 -= v.s_duration*Number(v.wkday == 2)/3600;

      p.n3 -= Number(v.wkday == 3);
      p.squal3 -= v.s_quality*Number(v.wkday == 3);
      p.sdur3 -= v.s_duration*Number(v.wkday == 3)/3600;

      p.n4 -= Number(v.wkday == 4);
      p.squal4 -= v.s_quality*Number(v.wkday == 4);
      p.sdur4 -= v.s_duration*Number(v.wkday == 4)/3600;

      p.n5 -= Number(v.wkday == 5);
      p.squal5 -= v.s_quality*Number(v.wkday == 5);
      p.sdur5 -= v.s_duration*Number(v.wkday == 5)/3600;

      p.n6 -= Number(v.wkday == 6);
      p.squal6 -= v.s_quality*Number(v.wkday == 6);
      p.sdur6 -= v.s_duration*Number(v.wkday == 6)/3600;
        return p; 
      },

    function () {
      return {
          n0:0, squal0:0, sdur0:0, 
          n1:0, squal1:0, sdur1:0,
          n2:0, squal2:0, sdur2:0, 
          n3:0, squal3:0, sdur3:0,
          n4:0, squal4:0, sdur4:0, 
          n5:0, squal5:0, sdur5:0, 
          n6:0, squal6:0, sdur6:0
      };
    });

monCount = monthlyDimension.group().reduceSum(
  function (d) {return +d.wkday==1;
  });
monSum = monthlyDimension.group().reduceSum(
  function (d) {return +d.s_quality*Number(d.wkday==1);
  });
tueCount = monthlyDimension.group().reduceSum(
  function (d) {return +d.wkday==2;
  });
tueSum = monthlyDimension.group().reduceSum(
  function (d) {return +d.s_quality*Number(d.wkday==2);
  });
wedCount = monthlyDimension.group().reduceSum(
  function (d) {return +d.wkday==3;
  });
wedSum = monthlyDimension.group().reduceSum(
  function (d) {return +d.s_quality*Number(d.wkday==3);
  });
thuCount = monthlyDimension.group().reduceSum(
  function (d) {return +d.wkday==4; 
  });
thuSum = monthlyDimension.group().reduceSum(
  function (d) {return +d.s_quality*Number(d.wkday==4);
  });
friCount = monthlyDimension.group().reduceSum(
  function (d) {return +d.wkday==5; 
  });
friSum = monthlyDimension.group().reduceSum(
  function (d) {return +d.s_quality*Number(d.wkday==5);
  });
satCount = monthlyDimension.group().reduceSum(
  function (d) {return +d.wkday==6;
  });
satSum = monthlyDimension.group().reduceSum(
  function (d) {return +d.s_quality*Number(d.wkday==6);
  });
sunCount = monthlyDimension.group().reduceSum(
  function (d) {return +d.wkday==0; 
  });
sunSum = monthlyDimension.group().reduceSum(
  function (d) {return +d.s_quality*Number(d.wkday==0);
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

sleepDOWstackChart
    .width(400)
    .height(240)
    .margins({top: 10, right: 50, bottom: 30, left: 50})
    .x(d3.scale.linear().domain([0, 12]))
    .brushOn(false)
    .colors(sleepColors)
    .dimension(monthlyDimension, "Weekday dimension")
    .group(dowmonthGroup, "Su").valueAccessor(function (p) {return p.value.sdur0/p.value.n0;})
    .stack(dowmonthGroup, "Mo").valueAccessor(function (p) {return p.value.sdur1/p.value.n1;})
    .stack(dowmonthGroup, "Tu").valueAccessor(function (p) {return p.value.sdur2/p.value.n2;})
    .stack(dowmonthGroup, "We").valueAccessor(function (p) {return p.value.sdur3/p.value.n3;})
    .stack(dowmonthGroup, "Th").valueAccessor(function (p) {return p.value.sdur4/p.value.n4;})
    .stack(dowmonthGroup, "Fr").valueAccessor(function (p) {return p.value.sdur5/p.value.n5;})
    .stack(dowmonthGroup, "Sa").valueAccessor(function (p) {return p.value.sdur6/p.value.n6;})
    .yAxisLabel('Total Day Recorded (hr)')
    .xAxisLabel('Months')
    .renderHorizontalGridLines(true)
    .renderLabel(true)
    .legend(dc.legend().x(350).y(10))
    .elasticY(true)
    .centerBar(true)
    .gap(7);     

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

