var physbarChart = dc.barChart("#phys-bar-chart", "physbarchart");
var physweekBar = dc.barChart("#phys-week-bar", "physbarchart");
// var phystodBar = dc.barChart("#phys-tod-bar", "physbarchart");

var g;

// var calChart = dc.barChart("#calchart");
// var slBubble = dc.bubbleChart("#slbubble");
// var sleepBar = dc.barChart("#sleepbar");
// var sleepPie = dc.pieChart("#sleeppie");

// set dc.js version in title
d3.selectAll("#version").text(dc.version);

d3.csv("../static/data/AllUPs.csv", function(error, data) {

  var dateFormat = d3.time.format("%m/%d/%Y");
  var numberFormat = d3.format(".2f");
  
  // Parse date
  data.forEach(function (d) {
    d.month = parseInt((d.DATE).substring(4,6));
    d.wkday = moment(d.DATE, 'YYYYMMDD').weekday();
    // d.wkday = moment(d.DATE, 'YYYYMMDD').format("ddd");
    // console.log(d.wkday);
  })

  var ups = crossfilter(data);
  var monthlyDimension = ups.dimension(function (d) {return +d.month; });
  var weekdayDimension = ups.dimension(function (d) {return +d.wkday+1; });

  var upCalMonth = monthlyDimension.group().reduceSum(function(d) {return +d.e_calories;});
  var upStepWeekday = weekdayDimension.group().reduceSum(function (d) {return +d.m_steps;});

  var upSugarMonth = monthlyDimension.group().reduceSum(function(d) {return +d.e_sugars;});

  var upSleepDay = weekdayDimension.group().reduceSum(function(d) {return d.s_asleep_time;});

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
    }
    )

  var monthlyValueGroup = monthlyDimension.group().reduce(
    // add
    function (p, v) {
      ++p.count; 
      p.carbs += v.e_carbs;
      p.carbs_avg = p.carbs / p.count;
      p.protein += v.e_protein;
      p.protein_avg = p.protein / p.count;
      return p;
    }, 
    // remove
    function (p, v) {
      --p.count; 
      p.carbs -= v.e_carbs;
      p.carbs_avg = p.carbs / p.count;
      p.protein -= v.e_protein;
      p.protein_avg = p.protein / p.count;
      return p;
    },
    /* initialize p */
    function () {
      return {count: 0, carbs: 0, carbs_avg: 0, protein: 0, protein_avg: 0};
    }
  );

// tooltips for bar chart
// var tip = d3.tip()
// 	.attr('class', 'd3-tip')
//     .offset([-10, 0])
//     .html(function (d) { return "<span style='color: #f0027f'>" +  d.key + "</span> : "  + numberFormat(d.value); });

var barTip = d3.tip()
	.attr('class', 'd3-tip')
	.offset([-10, 0])
	.html(function (d) { 
		return "<span style='color: #f0027f'>" + d.data.key + "</span> : " + numberFormat(d.y);
	});

	// set colors to red <--> purple
    var expenseColors = ["#fde0dd","#fa9fb5","#e7e1ef","#d4b9da","#c994c7","#fcc5c0","#df65b0","#e7298a","#ce1256", "#f768a1","#dd3497","#e78ac3","#f1b6da","#c51b7d"];

// 1 Chart : physbarChart
physbarChart
    .width(400)
    .height(280)
    .margins({top: 10, right: 50, bottom: 30, left: 50})
    .x(d3.scale.linear().domain([0, 12]))
    .brushOn(false)
    .xAxisLabel("Months")
    .yAxisLabel("Total Calories Recorded")
    .dimension(monthlyDimension, "Monthly Value Group")
    .group(upCalMonth)
    .renderHorizontalGridLines(true)
    .elasticY(true)
    .centerBar(true)
    .gap(1);

// 2 Chart : physweekBar
physweekBar
	.width(400)
	.height(280)
    .margins({top: 10, right: 50, bottom: 30, left: 50})
    .x(d3.scale.linear().domain([0, 12]))
    .brushOn(false)
    .xAxisLabel("Months")
    .yAxisLabel("Total Calories Recorded")
    .dimension(weekdayDimension, "Monthly Value Group")
    .group(upStepWeekday)
    .renderHorizontalGridLines(true)
    .elasticY(true)
    .centerBar(true)
    .gap(1);

dc.renderAll("physbarchart");
// dc.renderAll();
// d3.selectAll("g.row").call(tip);
// d3.selectAll("g.row")
// 	.on('mouseover', tip.show)
// 	.on('mouseout', tip.hide);
d3.selectAll(".bar").call(barTip);
d3.selectAll(".bar")
	.on('mouseover', barTip.show)
	.on('mouseout', barTip.hide); 



  // sleepBar
  //   .width(400)
  //   .height(280)
  //   .margins({top: 10, right: 50, bottom: 30, left: 50})
  //   .x(d3.scale.linear().domain([0.5, 7.5]))
  //   .brushOn(false)
  //   .xAxisLabel("Day of Week")
  //   .yAxisLabel("Total sleep minutes")
  //   .dimension(weekdayDimension, "Monthly Value Group")
  //   .group(upSleepDay)
  //   .renderHorizontalGridLines(true)
  //   .elasticY(true)
  //   .centerBar(true)
  //   .gap(1);

  // sleepBar.render();  

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
  //     // console.log(p.value);
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

  // slBubble.render();
});