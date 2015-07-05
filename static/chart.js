var addons = [];
var numberOfAddonsToFetch;
var chart;
var width = 800;
var height = 600;

nv.addGraph(function () {
  chart = nv.models.lineChart()
    .margin({left: 100, bottom: 100, right: 50})
    .useInteractiveGuideline(true)
    .showLegend(true)
    .showYAxis(true)
    .showXAxis(true);

  chart.xAxis
    .axisLabel('Time')
    .tickFormat(function (d) {
      return d3.time.format('%m-%d-%y %I:%M:%S')(new Date(d));
    });

  chart.yAxis
    .axisLabel('Downloads')
    .tickFormat(d3.format(',f'));
  chart.forceY([0, 1000]);

  d3.json('/addons', function (error, data) {
    if (error) {
      console.error('Error loading addons:', error);
      return;
    } else if (!data || data.length === 0) {
      return;
    }

    numberOfAddonsToFetch = data.length;

    for (var i in data) {
      fetchDataForAddon(data[i]);
    }
  });

  return chart;
});

function fetchDataForAddon(addonName) {
  d3.json('/addons/' + addonName + '/downloads', function (error, data) {
    if (error) {
      console.error('Error loading downloads for addon: ' + addonName, error);
      return;
    } else if (!data || data.length === 0) {
      return;
    }

    var transformedAddonData = data.downloads.map(function (currentValue, index, array) {
      return {
        x: moment(currentValue.timestamp).toDate(),
        y: currentValue.count
      };
    });
    addons.push({values: transformedAddonData, key: data.addonName});
    updateChart();
  });
}

function updateChart() {
  if (addons.length === numberOfAddonsToFetch) {
    setChartViewBox();
    resizeChart();
    nv.utils.windowResize(resizeChart);
  }
}

function setChartViewBox() {
  var w = width, h = height;
  chart.width(w)
    .height(h);
  d3.select('#chart svg')
    .datum(addons)
    .attr('viewBox', '0 0 ' + w + ' ' + h)
    .transition().duration(500)
    .call(chart);
}

// This resize simply sets the SVG's dimensions, without a need to recall the chart code
// Resizing because of the viewbox and perserveAspectRatio settings
// This scales the interior of the chart unlike the above
function resizeChart() {
  var container = d3.select('#chart1');
  var svg = container.select('svg');
  // resize based on container's width AND HEIGHT
  var windowSize = nv.utils.windowSize();
  svg.attr("width", windowSize.width);
  svg.attr("height", windowSize.height - 100);
}
