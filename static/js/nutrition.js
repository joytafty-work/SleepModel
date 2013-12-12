var nutritionParalell = dc.pieChart("#nutrition-parallel-chart", "nutrichart");

var g;

// set dc.js version in title
d3.selectAll("#version").text(dc.version);

d3.csv("../static/data/AllUPs.csv", function(error, data) {

  	var dateFormat = d3.time.format("%m/%d/%Y");
  	var numberFormat = d3.format(".2f");

	// 1. Chart : physpieChart
	nutritionParalell
	.width(280)
	.height(280)
	.radius(80)
	.renderLabel(false)
    .dimension(monthNameDimension)
    .group(upWorkoutMonth)
    .innerRadius(0)
    .transitionDuration(500)
    .colors(physColors);

	dc.renderAll("nutrichart");
});