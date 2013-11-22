var numberFormat = d3.format(",f");

// tooltips for row chart
var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function (d) { return "<span style='color: yellow'>" +  d.key + "</span> : "  + numberFormat(d.value); });

// tooltips for pie chart
var pieTip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function (d) { return "<span style='color: yellow'>" +  d.data.key + "</span> : "  + numberFormat(d.value); });

// tooltips for bar chart
var barTip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function (d) { return "<span style='color: yellow'>" + d.data.key + "</span> : " + numberFormat(d.y);});

var bubTip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function (d) { 
    return "<span style='color: yellow'> (" + numberFormat(d.value.tact) + "</span>, " + numberFormat(d.value.lcat) + ") mins";
  });

var slpietip = d3.tip()
  .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function (d) { return "<span style='color: yellow'>" +  d.key + " interruptions </span> : "  + numberFormat(d.value) + " nights"; });

d3.select("#btnPhysical")
  .on("click", function() {  
    d3.select("#physical-container").style("display", "block");
    d3.select("#sleep-container").style("display", "none");
    d3.select("#nutrition-container").style("display", "none");
    d3.select("#explore-container").style("display", "none");
          
      // how do I get the charts to reset all of their filters and transition during the redraw?
      if ((physpieChart.filters().length | 
        physweekRow.filters().length | 
        physbarChart.filters().length | 
        physmoveChart.filters().length) > 0) {
          dc.redrawAll("physchart");
        }
        else {
          dc.renderAll("physchart");
        }

    formatXAxis();      
    setUpToolTips();
});

d3.select("#btnSleep")
  .on("click", function() {  
    d3.select("#physical-container").style("display", "none");
    d3.select("#sleep-container").style("display", "block");
    d3.select("#nutrition-container").style("display", "none");
    d3.select("#explore-container").style("display", "none");

      if ((sleeppieChart.filters().length | 
        sleepqualChart.filters().length | 
        sleepdurChart.filters().length | 
        lightDeepChart.filters().length | 
        asleepAwakeChart.filters().length) > 0) {
          dc.redrawAll("sleepchart");
        }
        else {
          dc.renderAll("sleepchart");
        }

    formatXAxis();
    setUpToolTips();
});

d3.select("#btnNutrition")
  .on("click", function() {  
    d3.select("#physical-container").style("display", "none");
    d3.select("#sleep-container").style("display", "none");
    d3.select("#nutrition-container").style("display", "block");
    d3.select("#explore-container").style("display", "none");          
        
    formatXAxis();
    setUpToolTips();
});

d3.select("#btnExplore")
  .on("click", function() {  
    d3.select("#physical-container").style("display", "none");
    d3.select("#sleep-container").style("display", "none");
    d3.select("#nutrition-container").style("display", "none");
    d3.select("#explore-container").style("display", "block");          

    formatXAxis();
    setUpToolTips();
 });

function formatXAxis() {
  // rotate the x Axis labels
  d3.selectAll("g.x text")
    .attr("class", "campusLabel")
    .style("text-anchor", "end") 
    .attr("transform", "translate(-10,0)rotate(315)");
}

function setUpToolTips() {
  d3.selectAll("g.row").call(tip);
  d3.selectAll("g.row").on('mouseover', tip.show)
  .on('mouseout', tip.hide);

  d3.selectAll(".pie-slice").call(pieTip);
  d3.selectAll(".pie-slice").on('mouseover', pieTip.show)
  .on('mouseout', pieTip.hide);

  d3.selectAll(".bar").call(barTip);
  d3.selectAll(".bar").on('mouseover', barTip.show)
  .on('mouseout', barTip.hide);

  d3.selectAll(".node").call(bubTip);
  d3.selectAll(".node").on('mouseover', bubTip.show)
  .on('mouseout', bubTip.hide);  
}