var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var xNudge = -10;
var yNudge = 8;

var globalData;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);
// console.log(svg)

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

var toolTip = d3.tip();

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";
// console.log(chosenXAxis)
// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) *.8,
      d3.max(data, d => d[chosenXAxis]) *1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis]) * .8,
        d3.max(data, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
  
    return yLinearScale;
  
}
  
  // function used for updating yAxis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.selectAll("circle")
    .transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  chartGroup.selectAll(".label").data(globalData)
    .transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]) + xNudge)
    .attr("y", d => newYScale(d[chosenYAxis]) + yNudge);

  return circlesGroup;


}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var xLabel;

  if (chosenXAxis === "poverty") {
    xLabel = "In Poverty (%)";
  }
  else if (chosenXAxis === "age") {
    xLabel = "Age (Median)";
  }
  else {
    xLabel = "Household Income (Median)";
  }

  var yLabel;

  if (chosenYAxis === "obesity") {
    yLabel = "Obese (%)";
  }
  else if (chosenYAxis === "smokes") {
    yLabel = "Smokes (%)";
  }
  else {
    yLabel = "Lacks Healthcare (%)";
  }

  // var toolTip = d3.tip()
  toolTip
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}`, `${d.state}<br>${yLabel} ${d[chosenYAxis]}`);
    });

  

  // 

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(stateData, err) {
  if (err) throw err;

  // parse data
  stateData.forEach(function(data) {
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
    data.healthcare = +data.healthcare;
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
  });

  globalData = stateData;

  console.log(stateData)
  // xLinearScale function above csv import
  var xLinearScale = xScale(stateData, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(stateData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(stateData)
    .enter()

    circlesGroup
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "green")
    .attr("opacity", ".5")
    .on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      })
      .call(toolTip);
  
    circlesGroup
    .append("text")
    .attr("class", "label")
    .text(d => d.abbr)
    .attr("x", d => xLinearScale(d[chosenXAxis]) + xNudge)
    .attr("y", d => yLinearScale(d[chosenYAxis]) + yNudge)
  

  // Create group for three x-axis labels
  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = xLabelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 60)
  .attr("value", "income") // value to grab for event listener
  .classed("inactive", true)
  .text("Household Income (Median)");

  //  Create group for three y-axis labels
  var yLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(0, ${height / 2})`);

  var obeseLabel = yLabelsGroup.append("text")
    .attr("x", 40)
    .attr("y", 0)
    .attr("transform", "rotate(-90) translate(0, -30)")
    .attr("value", "obesity") // value to grab for event listener
    .classed("active", true)
    .text("Obesity (%)");

  var smokesLabel = yLabelsGroup.append("text")
    .attr("x", 40)
    .attr("y", 0)
    .attr("transform", "rotate(-90) translate(0, -50)")
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");

  var healthcareLabel = yLabelsGroup.append("text")
  .attr("x", 60)
  .attr("y", 0)
  .attr("transform", "rotate(-90) translate(0, -70)")
  .attr("value", "healthcare") // value to grab for event listener
  .classed("inactive", true)
  .text("Lacks Healthcare (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  xLabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(stateData, chosenXAxis);
        yLinearScale = yScale(stateData, chosenYAxis);

        // updates x axis with transition
        xAxis = renderXAxis(xLinearScale, xAxis);

        // updates circles with new x values
        renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
          .classed("active", false)
          .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
          .classed("active", false)
          .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
          .classed("active", true)
          .classed("inactive", false);
        }
      }
    });
  yLabelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

      // replaces chosenXAxis with value
      chosenYAxis = value;

      // console.log(chosenXAxis)

      // functions here found above csv import
      // updates x scale for new data
      xLinearScale = xScale(stateData, chosenXAxis);
      yLinearScale = yScale(stateData, chosenYAxis);

      // updates y axis with transition
      yAxis = renderYAxis(yLinearScale, yAxis);

      // updates circles with new x values
      renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

      // updates tooltips with new info
      updateToolTip(chosenYAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenYAxis === "obesity") {
        obeseLabel
          .classed("active", true)
          .classed("inactive", false);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenYAxis === "smokes") {
        obeseLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
          .classed("active", true)
          .classed("inactive", false);
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        obeseLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        healthcareLabel
          .classed("active", true)
          .classed("inactive", false);
      }
    }
  });
}).catch(function(error) {
  console.log(error);
});
