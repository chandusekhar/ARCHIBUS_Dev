// Zoomable clustering.
// Created by Jason Davies, http://www.jasondavies.com/
// Copyright 2015 ARCHIBUS, Inc.
// License: BSD; see LICENSE for further details.
//
// Usage:
//   var cluster = zoomCluster()
//       .radius(…) // cluster circle radius (function or number)
//       .distance(function(a, b) { … }) // similarity metric
//       .minDistance(function(scale) { … });
//
//   var zoom = viewBoxZoom()
//       .on("zoomstart", function() {
//         zoom.on("zoom", cluster(selection));
//       });
//
// cluster(selection) computes the positions of the elements in the given
// selection, and computes a hierarchy of cluster based on the similarity
// metric.  It returns a single-argument event handler function, which redraws
// the cluster circles for a given scale (the single argument).

function zoomCluster() {

var distance,
    minDistance,
    radius,
    fontSize,
    layerName;

function cluster(positions, minDistance) {
  var clusters = [],
      m = 0;

  nextPosition: for (var i = 0, n = positions.length; i < n; ++i) {
    var position = positions[i];
    for (var j = 0; j < m; ++j) {
      var cluster = clusters[j];
      if (distance(position, cluster) < minDistance) {
        cluster.children.push(position);
        continue nextPosition;
      }
    }
    clusters.push(new Cluster(position));
    ++m;
  }

  return clusters;
}

function Cluster(position) {
  this.children = [position];
  this.x = position.x;
  this.y = position.y;
}

function zoomCluster(selection) {
  var positions = [];
  selection.each(function() {
    var matrix = this.transform.baseVal.getItem(0).matrix;
    positions.push({x: matrix.e, y: matrix.f, node: this});
  });
  var node = selection.node(),
      container = d3.select(node ? node.ownerSVGElement : null);

  return update;

  function update(scale) {
    var clusters = cluster(positions, minDistance(scale));

    selection.style("display", "none");
    container.selectAll(".cluster").remove();

    for (var i = 0, n = clusters.length; i < n; ++i) {
      var c = clusters[i];
      if (c.children.length === 1) d3.select(c.children[0].node).style("display", null);
      else {
        var clusterG = container.append("g")
            .datum(c)
            .attr("class", "cluster " + layerName)
            .attr("transform", "translate(" + c.x + "," + c.y + ")scale(" + 1 / scale + ")");

        clusterG.append("circle").classed({'cluster-circle': true}).attr("r", radius(c.children.length));
  
        clusterG.append("text")
        	.classed({'cluster-text': true})
            .style("font-size", fontSize(c.children.length))
            .attr("text-anchor", "middle")
            .attr("dy", ".3em")
            .text(c.children.length);
      }
    }
  };
}

zoomCluster.distance = function(_) {
  return arguments.length ? (distance = _, zoomCluster) : distance;
};

zoomCluster.minDistance = function(_) {
  return arguments.length ? (minDistance = _, zoomCluster) : minDistance;
};

zoomCluster.radius = function(_) {
  return arguments.length ? (radius = d3.functor(_), zoomCluster) : radius;
};

zoomCluster.fontSize = function(_) {
  return arguments.length ? (fontSize = d3.functor(_), zoomCluster) : fontSize;
};

zoomCluster.layerName = function(_) {
  return arguments.length ? (layerName = _, zoomCluster) : layerName;
};
	
return zoomCluster.radius(50.5);

}
