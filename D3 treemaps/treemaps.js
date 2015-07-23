var dataSets = new Array();
var dataURIs2 = [
  "https://raw.githubusercontent.com/williehu/SBU-BMI/master/D3%20treemaps/None20.json",
  "https://raw.githubusercontent.com/williehu/SBU-BMI/master/D3%20treemaps/AVD20.json",
  "https://raw.githubusercontent.com/williehu/SBU-BMI/master/D3%20treemaps/COPD20.json",
  "https://raw.githubusercontent.com/williehu/SBU-BMI/master/D3%20treemaps/CVD20.json",
  "https://raw.githubusercontent.com/williehu/SBU-BMI/master/D3%20treemaps/Diabetes20.json",
  "https://raw.githubusercontent.com/williehu/SBU-BMI/master/D3%20treemaps/Kidney_Disease20.json",
  "https://raw.githubusercontent.com/williehu/SBU-BMI/master/D3%20treemaps/Psych20.json"
];

var dataURIs = [
  "https://raw.githubusercontent.com/williehu/SBU-BMI/master/D3%20treemaps/None100.json",
  "https://raw.githubusercontent.com/williehu/SBU-BMI/master/D3%20treemaps/AVD100.json",
  "https://raw.githubusercontent.com/williehu/SBU-BMI/master/D3%20treemaps/COPD100.json",
  "https://raw.githubusercontent.com/williehu/SBU-BMI/master/D3%20treemaps/CVD100.json",
  "https://raw.githubusercontent.com/williehu/SBU-BMI/master/D3%20treemaps/Diabetes100.json",
  "https://raw.githubusercontent.com/williehu/SBU-BMI/master/D3%20treemaps/Kidney_Disease100.json",
  "https://raw.githubusercontent.com/williehu/SBU-BMI/master/D3%20treemaps/Psych100.json"
];
dataURIs.forEach(function(d) {
  var datasetName = d.match(/[A-Za-z_]+[0-9]+.json/)[0].split("100.")[0];
  dataSets.push(datasetName);
});
var selectedDataset = dataSets[0];

/*
To-do:
test multi-level
*/

// buttons
d3.select("#body").append("div")
  .attr("class", "chart-label")
  .text("Filter by Patient Disease Category‡: ")

d3.select("#body").append("div")
  .attr("class", "selection-buttons-container")
  .selectAll("div").data(dataSets)
  .enter().append("div")
  .text(function(d) {
    return d;
  })
  .attr("class", function(d) {
    if (d == selectedDataset)
      return "selection-button selected-button";
    else
      return "selection-button";
  })
  .on("click", function(d, i) {
    d3.select(".selected-button").classed("selected-button", false);
    d3.select(this).classed("selected-button", true);
    selectedDataset = d;
    d3.json(dataURIs[i], function(error, json) {
      if (error)
        console.log(error);

      updateTreeMap(json);
      zoom(node);
    });

    //updateTreeMap(testData[dataSets.indexOf(d)]);
  });

var w = 1280 - 80,
  h = 800 - 180,
  x = d3.scale.linear().range([0, w]),
  y = d3.scale.linear().range([0, h]),
  color = d3.scale.category10(),
  root,
  node;

var treemap;

var svg = d3.select("#body").append("div")
  .attr("class", "chart")
  .style("width", w + "px")
  .style("height", h + "px")
  .append("svg:svg")
  .attr("width", w)
  .attr("height", h)
  .append("svg:g")
  .attr("id", "rootG")
  .attr("transform", "translate(.5,.5)");

d3.json(dataURIs[0], function(error, json) {
  initializeTreeMap(json);
    //preprocessTreemapData(json, 30);
});

//initializeTreeMap();

function initializeTreeMap(treeData) {
  node = root = treeData;

  treemap = d3.layout.treemap()
    .padding(2)
    .round(false)
    .size([w, h])
    .sticky(true)
    .mode("squarify")
    .value(function(d) {
      return d.count;
    });

  var data = treemap.nodes(root)
    .filter(function(d) {
      return d.depth == 0 ? null : d;
    })
    .sort(function comparator(a, b) {
      return b.depth - a.depth;
    });

  var nodeGroups = svg.selectAll("g").data(data,
    function(d) {
      return d.name
    })
    .enter().append("svg:g")
    .attr("id", function(d) {
      return d.name.replace(/\s/g, "_");
    })
    .attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    })
    .attr("width", function(d) {
      return d.dx;
    })
    .attr("height", function(d) {
      return d.dy;
    })
    .on("click", function(d) {
      return zoom(d.children ? d : root);
    });

  nodeGroups
    .append("title")
    .text(function(d) {
      if (d.icd9Code != null)
        return d.name + " (" + d.icd9Code + ")\nNumber of Readmissions: " + d.value;
      else
        return d.name + "\nNumber of Readmissions: " + d.value;
    });

  nodeGroups.filter(function(d) {
      return d.depth == 0 ? null : d;
    })
    .append("svg:rect")
    .attr("class", "cell")
    .attr("width", function(d) {
      return d.dx - 1;
    })
    .attr("height", function(d) {
      return d.dy - 1;
    })
    .style("fill-opacity", function(d) {
      return d.children ? .7 : .9;
    })
    .style("fill", function(d, i) {
      if (d.depth == 1) {
        return color(d.name);
      } else {
        var baseColor = color(d.parent.name);
        var colorScale = d3.scale.linear()
          .domain([0, d.parent.children.length - 1])
          .range([d3.hcl(baseColor).brighter().toString(),
            d3.hcl(baseColor).darker(0.3).toString()
          ])
          .interpolate(d3.interpolateHcl);

        return colorScale(d.parent.children.indexOf(d));
      }
      //return d3.rgb(color(d.parent.name)).brighter(i*0.1); }
    });

  /*
  // color code
  var colorScale = d3.scale.linear()
      .domain([0,10])
      .range([d3.rgb("red").brighter().toString(), d3.rgb("red").darker().toString()])
      .interpolate(d3.interpolateRgb);
  */
  d3.select(window).on("click", function() {
    if (node != root) {
      zoom(root);
    }
  });
  zoom(root);
}

function updateTreeMap(newData) {
  node = root = newData;

  treemap = d3.layout.treemap()
    .padding(2)
    .round(false)
    .size([w, h])
    .sticky(true)
    .mode("squarify")
    .value(function(d) {
      return d.count;
    });

  var data = treemap.nodes(newData)
    .filter(function(d) {
      return d.depth == 0 ? null : d;
    })
    .sort(function comparator(a, b) {
      return b.depth - a.depth;
    });

  var dataJoin = svg.selectAll("g").data(data,
    function(d) {
      if (d.icd9Code != null) { return d.name + d.icd9Code; }
      else { return d.name; }
    });

  // remove exit
  dataJoin.exit().selectAll("*").remove();
  dataJoin.exit().remove();

  // append enter
  var enterGroups = dataJoin
    .enter().append("svg:g")
    .attr("id", function(d) {
      return d.name.replace(/\s/g, "_");
    })
    .attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    })
    .attr("width", function(d) {
      return d.dx;
    })
    .attr("height", function(d) {
      return d.dy;
    })
    .on("click", function(d) {
      return zoom(d.children ? d : root);
    });

  //console.log(enterGroups);
  enterGroups.filter(function(d) {
      return d.depth == 0 ? null : d;
    })
    .append("svg:rect")
    .attr("class", "cell")
    .attr("width", function(d) {
      return 1;
    })
    .attr("height", function(d) {
      return 1;
    })
    .style("fill-opacity", function(d) {
      return d.children ? .7 : .9;
    })
    .style("fill", function(d, i) {
      if (d.depth == 1) {
        return color(d.name);
      } else {
        var baseColor = color(d.parent.name);
        var colorScale = d3.scale.linear()
          .domain([0, d.parent.children.length - 1])
          .range([d3.hcl(baseColor).brighter().toString(),
            d3.hcl(baseColor).darker(0.3).toString()
          ])
          .interpolate(d3.interpolateHcl);

        return colorScale(d.parent.children.indexOf(d));
      }
      //return d3.rgb(color(d.parent.name)).brighter(i*0.1); }
    });

  // update
  // reset cell color?

  // title
  svg.selectAll("title").remove();
  svg.selectAll("#rootG g")
    .append("title")
    .text(function(d) {
      if (d.icd9Code != null)
        return d.name + " (" + d.icd9Code + ")\nNumber of Readmissions: " + d.value;
      else
        return d.name + "\nNumber of Readmissions: " + d.value;
    });

  // redraw in correct order
  svg.selectAll("#rootG g").sort(function comparator(a, b) {
    return b.depth - a.depth;
  });

  zoom(root);
}

function accumulate(d) {
  return d.children ? d.count = d.children.reduce(function(d) {
    return accumulate(d);
  }, 0) : d.count;
}

function size(d) {
  return d.size;
}

function count(d) {
  return 1;
}

function zoom(d) {
  // make [zoomed] root (+ancestors) container transparent
  svg.selectAll("g").selectAll("rect")
    .attr("display", function(d2) {
      return d2.depth <= d.depth ? "none" : "inline";
    });

  var kx = w / d.dx,
    ky = h / d.dy;
  x.domain([d.x, d.x + d.dx]);
  y.domain([d.y, d.y + d.dy]);

  // destroy old text, create new
  svg.selectAll("text.treemapLabel").remove();

  var newText = svg.selectAll("g")
    .filter(function(d2) {
      return (d2.depth == d.depth + 1) && (d2.parent == d) ? d2 : null;
    })
    .append("svg:text")
    .attr("x", function(d) {
      return kx * d.dx / 2;
    })
    .attr("y", function(d) {
      return ky * d.dy / 2;
    })
    .attr("dy", "-.35em")
    .attr("class", "treemapLabel")
    .attr("text-anchor", "middle")
    .style("font-size", 30)
    .style("opacity", 0)
    .style("pointer-events", "none")
    .text(function(d) {
      return d.name;
    });

  newText.transition().duration(1000)
    .ease("cubic")
    .style("opacity", 1);

  // rotate text where appropriate
  svg.selectAll("g")
    .filter(function(d) {
      return ((ky * d.dy) > 1.3 * (kx * d.dx)) ? d : null;
    })
    .selectAll("text")
    .attr("transform", function(d) {
      return "rotate(90 " + kx * d.dx / 2 + " " + ky * d.dy / 2 + ")";
    });

  // add line breaks and scale appropriately
  var selectGroup = svg.selectAll("g")
    .filter(function(d2) {
      return (d2.depth == d.depth + 1) && (d2.parent == d) ? d2 : null;
    });
  selectGroup.call(fitText, kx, ky);

  // add count
  selectGroup.selectAll("text.treemapLabel").each(function(d) {
    var x = d3.select(this).attr("x");
    d3.select(this).select(".count")
      //.append("tspan")
      .text(function(d) {
        return d.value;
      })
      .attr("x", x)
      .attr("dy", "1.1em");
  });
  
  // remove text from small cells
  
    svg.selectAll("text.treemapLabel")
      .filter(function(d2) {
      console.log(d2.value + " " + d2.parent.value);
      return d2.value < 0.006*d2.parent.value ? d2 : null;})
      .remove();
  

  // apply transform to g
  var t = svg.selectAll("g").transition().duration(1000)
    .attr("transform", function(d) {
      return "translate(" + x(d.x) + "," + y(d.y) + ")";
    });

  t.select("rect")
    .attr("width", function(d) {
      return kx * d.dx - 1;
    })
    .attr("height", function(d) {
      return ky * d.dy - 1;
    });

  node = d;

  if (d3.event)
    d3.event.stopPropagation();
}

function fitText(d, kx, ky) {
  d.each(function() {
    // check rect bounds vs text
    var g = d3.select(this);
    var text = g.select("text");
    var rect = g.select("rect");
    var textBBox = text[0][0].getBBox();

    var rectWidthLimit = rect.datum().dx * kx;
    var rectHeightLimit = rect.datum().dy * ky;
    if (text.attr("transform") != null) {
      rectWidthLimit = rect.datum().dy * ky;
      rectHeightLimit = rect.datum().dx * kx;
    }

    // check for overlap, if so, wrap
    if (textBBox.width > rectWidthLimit - 50) {
      var lineHeight = 1.2; // ems
      var x = text.attr("x");
      var y = text.attr("y");
      var dy = parseFloat(text.attr("dy"));
      var width = Math.round(text.text().length / 2);

      // find first space after mid-point of text
      var breakIndex = width + text.text().substring(width, text.text().length).indexOf(" ");
      if (text.text().substring(width, text.text().length).indexOf(" ") == -1) {
        breakIndex = text.text().substring(width, text.text().length).indexOf(" ");
      }

      // then split text in two at found space
      var wrapText = text.text().substring(breakIndex + 1, text.text().length);
      if (breakIndex > 0) {
        var nextText = text.text().substring(0, breakIndex + 1);
        text.text(nextText).attr("dy", "-0.5em")
        text.append("tspan").text(wrapText).attr("x", text.attr("x")).attr("dy", "1.1em");
      }
    }
    
    // add placeholder for count
    text
      .append("tspan")
      .text("0")
      .attr("class", "count")
      .attr("x", x)
      .attr("dy", "1.1em");
    
    // if text is still overlaps, decrease textSize
    textBBox = text[0][0].getBBox();
    while ((textBBox.width > rectWidthLimit - 20) || ((textBBox.height > rectHeightLimit - 10))) {
      /*
      console.log(text.text());
      console.log("text width: " + Math.round(textBBox.width));
      console.log("rect limit: " + Math.round(rectLimit));
      console.log("rect x: " + rect.attr("width"));
      console.log("rect kx: " + kx);
      console.log("text size: " + text.style("font-size"));
      */
      text.style("font-size", parseInt(text.style("font-size")) - 2);
      if (parseInt(text.style("font-size")) <= 12) {
        return;
      }

      textBBox = text[0][0].getBBox();
    }

  });
}

function preprocessTreemapData(jsonTreemap, countThreshold)
{  
  jsonTreemap.children.forEach(function(d) {
    
    for (i = 0; i < d.children.length; i++) { 
        if (d.children[i].count <= countThreshold)
        {
          console.log(d.children[i].name + " " + d.children[i].count);
        }
    }
    /*
      if(!dataByPrimaryDx.hasOwnProperty(d.diagnosisGroup))
      {
          dataByPrimaryDx[d.diagnosisGroup].children.push(
            {
              "name": d.name,
              "icd9Code": d.icd9Code,
              "count": d.count
            });
      }
    }*/
  });
               
  //return treemapData;
}