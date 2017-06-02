var margin = {
    top: 5,
    right: 700,
    bottom: 20,
    left: 10
  },
  width = 2560 - margin.left - margin.right,
  height = 1600 - margin.top - margin.bottom;

var formatNumber = d3.format(",.0f"),
  format = function(d) {
    return formatNumber(d) + " Distinct Companies";
  },
  color = d3.scale.category20();

var svg = d3.select("#chart").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var sankey = d3.sankey()
  .nodeWidth(30)
  .nodePadding(8)
  .size([width, height]);

var path = sankey.link();

var jdata =

  {
    "nodes": datasets[2].content,
    "links": datasets[1].content
  }

console.log(jdata);

var company = jdata;

sankey
  .nodes(company.nodes)
  .links(company.links)
  .layout(32);

var link = svg.append("g").selectAll(".link")
  .data(company.links)
  .enter().append("path")
  .attr("class", "link")
  .attr("d", path)
  .attr("id", function(d, i) {
    d.id = i;
    return "link-" + i;
  })
  .style("stroke-width", function(d) {
    return Math.max(1, d.dy);
  })
  .sort(function(a, b) {
    return b.dy - a.dy;
  });

link.append("title")
  .text(function(d) {
    return d.source.name + " → " + d.target.name + "\n" + format(d.value);
  });

var node = svg.append("g").selectAll(".node")
  .data(company.nodes)
  .enter().append("g")
  .attr("class", "node")
  .attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";
  })
  .on("click", highlight_node_links)
  .call(d3.behavior.drag()
    .origin(function(d) {
      return d;
    })
    .on("drag", dragmove));

node.append("rect")
  .attr("height", function(d) {
    return d.dy;
  })
  .attr("width", sankey.nodeWidth())
  .style("fill", function(d) {
    return d.color = color(d.name.replace(/ .*/, ""));
  })
  .style("stroke", function(d) {
    return d3.rgb(d.color).darker(2);
  })
  .append("title")
  .text(function(d) {
    var titleText = d.name + " - " +
      format(d.value) + " total" + "\n" + "\n";
    var sourcesText = "";
    d.targetLinks.forEach(function(dstLnk) {
      sourcesText += "from " + dstLnk.source.name + " - " +
        format(dstLnk.value) + "\n";
    });
    return titleText + sourcesText;
  });

node.append("text")
  .attr("x", 400)
  .attr("y", function(d) {
    return d.dy / 2;
  })
  .attr("dy", ".35em")
  .attr("text-anchor", "end")
  .attr("transform", null)
  .text(function(d) {
    return d.name;
  })
  .filter(function(d) {
    return d.x < width / 1;
  })
  .attr("x", 6 + sankey.nodeWidth())
  .attr("text-anchor", "start");

svg.selectAll(".link")
  .style('stroke', function(d) {
    return d.source.color;
  })

function dragmove(d) {
  d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
  sankey.relayout();
  link.attr("d", path);
}

function highlight_node_links(node, i) {

  var remainingNodes = [],
    nextNodes = [];

  var stroke_opacity = 0;

  if (d3.select(this).attr("data-clicked") == "1") {
    d3.select(this).attr("data-clicked", "0");
    stroke_opacity = 0.1;
  } else {
    d3.select(this).attr("data-clicked", "1");
    stroke_opacity = 0.8;
  }

  var traverse = [{
    linkType: "sourceLinks",
    nodeType: "target"
  }, {
    linkType: "targetLinks",
    nodeType: "source"
  }];

  traverse.forEach(function(step) {
    node[step.linkType].forEach(function(link) {
      remainingNodes.push(link[step.nodeType]);
      highlight_link(link.id, stroke_opacity);
    });

    while (remainingNodes.length) {
      nextNodes = [];
      remainingNodes.forEach(function(node) {
        node[step.linkType].forEach(function(link) {
          nextNodes.push(link[step.nodeType]);
          highlight_link(link.id, stroke_opacity);
        });
      });
      remainingNodes = nextNodes;
    }
  });

  svg.selectAll(".link")
    .style('stroke', function(d) {
      return d.source.color;
    })
}

function highlight_link(id, opacity) {
  d3.select("#link-" + id).style("stroke-opacity", opacity);
}

// Copyright 2015, Mike Bostock
// All rights reserved.
