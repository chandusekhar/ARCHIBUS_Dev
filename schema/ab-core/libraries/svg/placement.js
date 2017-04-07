// Copyright 2014 ARCHIBUS, Inc.
// Created by Jason Davies, http://www.jasondavies.com/
// Modified by ED
// License: BSD; see LICENSE for further details.

(function(placement) {

// The placement drag behavior wraps d3.behavior.drag in order to provide a
// drag-and-drop facility for SVG elements.  When the drag gesture starts, the
// SVG object is cloned using a <use> element in a new, temporary SVG
// container.  This container then moves as it is dragged, to a target location.
//
// * drag.target([target])
//   Allowable drop targets can be configured using drag.target.  If a function
//   is specified, the function is called with the topmost element that the
//   gesture finished over.  The function should return the element to which
//   the <use> element should be appended.  Alternatively, a DOM element can be
//   specified instead of a function.  If no arguments are specified, the
//   current drop target function is returned.  The default is the identity
//   function.
// * drag.on(type, [listener])
//   If listener is specified, adds an event listener for the specified event
//   type.  The only supported event type is "drop".  If the listener is not
//   specified, returns the event listener for the given type.
placement.drag = function() {
  var dropTarget = function(d) { return d; },
      event = d3.dispatch("drop"),
      dragging;

  var drag = d3.behavior.drag()
      .origin(function() {
        var svg = this.ownerSVGElement || this;
        //return {x: svg.parentNode.offsetLeft + container.offsetLeft + 4, y: svg.parentNode.offsetTop + container.offsetTop + 4};
        var bMultiSvgs = ((svg.previousSibling && svg.previousSibling.nodeName === "svg") || ( svg.nextSibling && svg.nextSibling.nodeName === "svg"));
        var panelNode = (bMultiSvgs) ? svg : svg.parentNode;
        //var top = (!bMultiSvgs) ? svg.parentNode.getBoundingClientRect().top : svg.parentNode.getBoundingClientRect().top - panelNode.scrollTop;
        //var top = (!bMultiSvgs) ? panelNode.getBoundingClientRect().top - panelNode.scrollTop : panelNode.getBoundingClientRect().top - panelNode.scrollTop;
        var top = (bMultiSvgs) ? panelNode.getBoundingClientRect().top - panelNode.scrollTop : panelNode.getBoundingClientRect().top - panelNode.scrollTop;
        var left = svg.parentNode.getBoundingClientRect().left + Number(svg.style.marginLeft.replace("px", ""));

        return {x: left, y: top};
      })
      .on("dragstart", function() {
        stopPropagation();
        preventDefault();
        this.__offset__ = d3.mouse(this);
        // TODO cancel previous drag, e.g. prevent multitouch?
        var svg = this.ownerSVGElement || this,
        rect = svg.getBoundingClientRect();
        var bMultiSvgs = ((svg.previousSibling && svg.previousSibling.nodeName === "svg") || ( svg.nextSibling && svg.nextSibling.nodeName === "svg"));
        var panelNode = (bMultiSvgs) ? svg : svg.parentNode;
        var mozFactor = (navigator.userAgent.match('Firefox')) ? 5 : 0;
        var left = (bMultiSvgs) ? panelNode.getBoundingClientRect().left + mozFactor + 1 : panelNode.getBoundingClientRect().left;
        //var top = (!bMultiSvgs) ? panelNode.getBoundingClientRect().top - panelNode.scrollTop : panelNode.getBoundingClientRect().top - panelNode.scrollTop;
        var top = panelNode.getBoundingClientRect().top - panelNode.scrollTop;

        dragging = d3.select("body").append("svg")
            .attr("width", rect.width + 'px')
            .attr("height", rect.height + 'px')
            .style("position", "absolute")
            .style("pointer-events", "none")
            .style("left", left + 'px')
            .style("top", top + 'px');
        dragging.node().appendChild(this.cloneNode(true));
      })
      .on("drag", function() {    	  
          var o = this.__offset__;          
          var svg = this.ownerSVGElement || this;
          var bMultiSvgs = (d3.select(svg.parentNode).selectAll("svg")[0].length > 1) ? true: false;   
    	  var svgPosition = (d3.touch(svg)) ? d3.touch(svg) : d3.mouse(svg);

          if (bMultiSvgs) {
              var position = (d3.touch(document.body)) ? d3.touch(document.body) : d3.mouse(document.body);
        	  position[0] -= d3.select(svg).attr("width") / 2;
        	  position[1] -= d3.select(svg).attr("height") / 2;

              dragging
              	.style("left", (position[0]) + "px")
              	.style("top", (position[1])+ "px");
          } else {
              dragging
              	.style("left", d3.event.x + "px")
              	.style("top", d3.event.y + "px");
          }
      })
      .on("dragend", function(d) {
        var o = this.__offset__,
            left = +dragging.style("left").replace(/px$/, ""),
            top = +dragging.style("top").replace(/px$/, "");
        delete this.__offset__;
        dragging.remove();

        var rect = document.body.getBoundingClientRect(),
            point = d3.mouse(document.body),
            targetNode = dropTarget(document.elementFromPoint(point[0] + rect.left, point[1] + rect.top));
        if (!targetNode) return;
        var target = d3.select(targetNode);
            g = target.append("g"),
            node = dragging.node().firstChild,
            container = targetNode.ownerSVGElement || targetNode;
            point = container.createSVGPoint();
        //var panelNode = (container.parentNode.className.indexOf("redline") == -1) ? container.parentNode : container.parentNode;
        var bMultiSvgs = ((container.previousSibling && container.previousSibling.nodeName === "svg") || ( container.nextSibling && container.nextSibling.nodeName === "svg"));
        var panelNode = (bMultiSvgs) ? container : container.parentNode;
        point.x = left + o[0] - panelNode.getBoundingClientRect().left, point.y = top + o[1] - panelNode.getBoundingClientRect().top;

        //point.x = left - svg.parentNode.getBoundingClientRect().left, point.y = top + o[1] - container.parentNode.offsetTop;    
        point = point.matrixTransform(targetNode.getCTM().inverse());
   
        point.x -= o[0], point.y -= o[1];
        g.node().appendChild(node);
        d3.select(node).attr("transform", "translate(" + point.x + "," + point.y + ")rotate(0)");
        
        // for microsoft edge
        var isIEEdge = (navigator.userAgent.indexOf("Edge") != -1);
        if (isIEEdge && !d3.select(node).select("use").empty()) {
        	var useY = d3.select(node).select("use").attr("y");
        	d3.select(node).select("use").attr("y", useY);        	
        }

    	
        event.drop.call(node, d, panelNode.getBoundingClientRect().left);
      });

  drag.target = function(_) {
    if (!arguments.length) return dropTarget;
    dropTarget = typeof _ === "function"
        ? _
        : function(target) {
          var node;
          _.each(function() {
            if (!node && this.parentNode.contains(target.correspondingUseElement || target)) node = this;
          });
          return node;
        };
    return drag;
  };

  return d3.rebind(drag, event, "on");
};

// This is a simple behavior that allows multiple SVG elements to be grouped
// together by selecting them using rectangular regions.
// * group.active([active])
//   Specifies whether or not the grouping behavior is active.
// * group.select([select])
//   Specifies a function, which is called with the container selection and
//   should return a selection of groupable elements.
// * group.on(type, [listener])
//   Specifies an event listener; the only supported event type is "clone".
placement.group = function() {
  var active = false,
      select = function(selection) { return selection.selectAll(".groupable"); },
      objects = [],
      event = d3.dispatch("clone"),
      gripRadius = ('ontouchstart' in document.documentElement) ? 13.5 : 6.5;

  function group(selection) {
    var grouper = selection.append("rect").attr("class", "group"),
        grouperNode = grouper.node(),
        groupWindow = selection.append("g").attr("class", "edit group").style("display", "none"),
        groupWindowNode = groupWindow.node(),
        groupWindowRect = groupWindow.append("rect").attr("class", "group"),
        //groupHighlight = groupWindow.append("rect"),
        selected = [];

    // Grips (excluding move grip).
    var groupWindowGrips = groupWindow.append("g");

    // Move grip.
    var groupWindowDrag = groupWindow.append("g")
        .attr("transform", "translate(-30)")
        .attr("class", "move")
        .call(d3.behavior.drag()
          .on("dragstart", stopPropagation)
          .on("drag", function() {
            var dx = d3.event.dx,
                dy = d3.event.dy;
            for (var i = 0; i < selected.length; ++i) {
              var item = selected[i],
                  matrix = svg.getScreenCTM().inverse().multiply(item.getScreenCTM());
                  t = item.firstChild.transform.baseVal.getItem(0);
              t.setTranslate(t.matrix.e + dx * matrix.a, t.matrix.f + dy * matrix.d);
              //groupHighlight.attr(item.getBBox());
            }
            var t = groupWindowRect.node();
            t.x.baseVal.value += dx, t.y.baseVal.value += dy;
            var t = groupWindowGrips.node().transform.baseVal.getItem(0);
            t.setTranslate(t.matrix.e + dx, t.matrix.f + dy);
            var t = this.transform.baseVal.getItem(0);
            t.setTranslate(t.matrix.e + dx, t.matrix.f + dy);
          }));
    groupWindowDrag.append("circle").attr("r", gripRadius);
    groupWindowDrag.append("path").attr("d", movePath);

    // Clone grip.
    var groupWindowClone = groupWindowGrips.append("g")
        .attr("class", "clone")
        .attr("transform", "translate(-15)")
        .on("mousedown", stopPropagation)
        .on("touchstart", stopPropagation)
        .on("click", function() {
          for (var i = 0; i < selected.length; ++i) {
            var item = selected[i],
                parent = item.parentNode,
                clone = item.cloneNode(true),
                transform = svg.createSVGTransform(),
                matrix = svg.getScreenCTM().inverse().multiply(item.getScreenCTM());
                sx = matrix.a,
                sy = matrix.d;
            transform.setTranslate(10 * sx, 10 * sy);
            clone.transform.baseVal.appendItem(transform);
            parent.appendChild(clone);
            event.clone.call(clone);
          }
          groupCancel();
        });
    groupWindowClone.append("circle").attr("r", gripRadius);
    groupWindowClone.append("path").attr("d", "M-4,-4h7v7h-7zM-3,-3h7v7h-7z");

    // Delete grip.
    var groupWindowDelete = groupWindowGrips.append("g")
        .attr("class", "delete")
        .on("mousedown", stopPropagation)
        .on("touchstart", stopPropagation)
        .on("click", function() {
          stopPropagation();
          if (confirm("Are you sure you want to delete this group?")) {
            for (var i = 0; i < selected.length; ++i) {
              d3.select(selected[i]).remove();
            }
            groupCancel();
          }
        });
    groupWindowDelete.append("circle").attr("r", gripRadius);
    groupWindowDelete.append("path")
        .attr("d", deletePath)
        .attr("transform", "translate(-6,-6)scale(.4)");

    var svg = selection.node();

    selection
        .on("mousedown.group", mousedown)
        .on("touchstart.group", mousedown);
    
    function mousedown() {
      if (!active) return;
      var t = svg,
          o = d3.mouse(t);
      grouper.attr({x: o[0], y: o[1], width: 0, height: 0});
      
      // ED added
      groupCancel();

      var w = d3.select(window);
      if (d3.event.touches && d3.event.touches.length) {
        w.on("touchmove.group", mousemove).on("touchend.group", mouseup);
      } else {
        w.on("mousemove.group", mousemove).on("mouseup.group", mouseup);
      }

      function mousemove() {
        stopPropagation();
        d3.event.preventDefault();
        var m = d3.mouse(t);
        grouper
            .attr("x", Math.min(m[0], o[0]))
            .attr("y", Math.min(m[1], o[1]))
            .attr("width", Math.abs(m[0] - o[0]))
            .attr("height", Math.abs(m[1] - o[1]));
      }

      function mouseup() {
        var m = d3.mouse(t),
            x0 = Math.min(m[0], o[0]),
            y0 = Math.min(m[1], o[1]),
            x1 = x0 + Math.abs(m[0] - o[0]),
            y1 = y0 + Math.abs(m[1] - o[1]),
            wx0 = Infinity,
            wx1 = -Infinity,
            wy0 = Infinity,
            wy1 = -Infinity;
        selected = [];
        select(selection).each(function() {
          if (this === grouperNode || this === groupWindowNode) return;
          var rect = this.getBBox(),
              rx0 = rect.x,
              rx1 = rx0 + rect.width,
              ry0 = rect.y,
              ry1 = ry0 + rect.height,
              transform = svg.getScreenCTM().inverse().multiply(this.getScreenCTM());
          var p = svg.createSVGPoint();
          p.x = rx0, p.y = ry0;
          p = p.matrixTransform(transform);
          rx0 = p.x, ry0 = p.y;

          p.x = rx1, p.y = ry1;
          p = p.matrixTransform(transform);
          rx1 = p.x, ry1 = p.y;

          if (x0 <= rx0 && rx1 <= x1 && y0 <= ry0 && ry1 <= y1) {
            var g = d3.select(this);
            if (this.__selected__ = !this.__selected__) {
              //groupHighlight.style("display", null).attr(rect);
            } else {
              //groupHighlight.style("display", "none");
            }
          }
          if (this.__selected__) {
            selected.push(this);
            if (rx0 < wx0) wx0 = rx0;
            if (rx1 < wx0) wx0 = rx1;
            if (rx0 > wx1) wx1 = rx0;
            if (rx1 > wx1) wx1 = rx1;
            if (ry0 < wy0) wy0 = ry0;
            if (ry1 < wy0) wy0 = ry1;
            if (ry0 > wy1) wy1 = ry0;
            if (ry1 > wy1) wy1 = ry1;
          }
        });
        grouper.attr({x: null, y: null, width: null, height: null});
        if (isFinite(wx0)) {
          groupWindow.style("display", null);
          groupWindowRect.attr({x: wx0, y: wy0, width: wx1 - wx0, height: wy1 - wy0});
          groupWindowGrips.attr("transform", "translate(" + wx1 + "," + wy0 + ")");
          groupWindowDrag.attr("transform", "translate(" + (wx1 - 30) + "," + wy0 + ")");
        } else {
          groupCancel();
        }
        w.on(".group", null);
      }
    }

    function groupCancel() {
      groupWindow.style("display", "none");
      for (var i = 0; i < selected.length; ++i) {
        delete selected[i].__selected__;
      }
      selected.length = 0;
    }
  }

  group.active = function(_) {
    return arguments.length ? (active = !!_, group) : active;
  };

  group.select = function(_) {
    return arguments.length ? (select = _, group) : select;
  };

  return d3.rebind(group, event, "on");
};

// This is a wrapper for d3.behavior.drag, which adjusts the dragged elementsï¿½
// transform by setting a translate offset.  This adjusts the first transform
// in the transform list, and assumes the transform list contains at least one
// transform.
// added callback funtion to support redmarks control.
placement.move = function(callback) {
  return d3.behavior.drag()
      .origin(function() {
        var matrix = this.firstChild.transform.baseVal.getItem(0).matrix;
        return {x: matrix.e, y: matrix.f};
      })
      .on("dragstart", stopPropagation)
      .on("drag", function() {
        this.firstChild.transform.baseVal.getItem(0).setTranslate(d3.event.x, d3.event.y);
        if(callback)
        	callback();
      });
};

placement.onClickEditGrip = function() {
	alert("Edit dialog.");
};

// This behavior displays various edit grips on click or touch-and-hold.
// These edit grips allow deletion, rotation or editing.
placement.edit = function() {
  var click = "click.placement-edit",
  gripRadius = ('ontouchstart' in document.documentElement) ? 14 : 6.5;

  return function(selection) {
    selection.on(click, onclick);
    selection.on("touchend.placement-edit", onclick);
   
    function onclick() {
      if (d3.event.defaultPrevented) return;
      stopPropagation();

      var node = this,
          parent = node.parentNode,
          child = node.firstChild,
          translate = child.transform.baseVal.getItem(0).matrix,
          rotate = child.transform.baseVal.getItem(1),
          rect = node.getBBox(),
          nodeX0,
          nodeY0,
          nodeX1,
          nodeY1,
          svg = node.ownerSVGElement || node;

      var transform = svg.getScreenCTM().inverse().multiply(node.getScreenCTM());

      var p0 = svg.createSVGPoint(),
          p1 = svg.createSVGPoint(),
          t;
      nodeX1 = p1.x = (nodeX0 = p0.x = rect.x) + rect.width;
      nodeY1 = p1.y = (nodeY0 = p0.y = rect.y) + rect.height;
      p0 = p0.matrixTransform(transform);
      p1 = p1.matrixTransform(transform);
      if (p0.x > p1.x) t = p0.x, p0.x = p1.x, p1.x = t;
      if (p0.y > p1.y) t = p0.y, p0.y = p1.y, p1.y = t;

      var w0 = p1.x - p0.x,
          h0 = p1.y - p0.y;

      var halfw = rect.width / 2,
          halfh = rect.height / 2;

      d3.select(node).on(click, null);

      var g = d3.select(svg).append("g")
          .on("mousedown", stopPropagation)
          .on("touchstart", stopPropagation)
          .attr("class", "edit")
          .attr("transform", "rotate(0)translate(" + p0.x + "," + p0.y + ")");

      var grip = g.insert("g", "*") // delete
          .attr("class", "delete")
          .attr("transform", "translate(" + w0 + ")")
          .on("mousedown", stopPropagation)
          .on("touchstart", deleteItem)
          .on(click, deleteItem);
      grip.append("circle").attr("r", gripRadius);
      grip.append("path")
          .attr("d", deletePath)
          .attr("transform", "translate(-6,-6)scale(.4)");

      grip = g.insert("g", "*") // rotate
          .attr("class", "rotate")
          .attr("transform", "translate(" + [w0 / 2, h0 / 2] + ")")
          .on("mousedown", stopPropagation)
          //.on("touchstart", stopPropagation)
          .on("touchstart", function() {
            stopPropagation();
            var rotateG = g.append("g").attr("class", "rotate-angle")
                .attr("transform", "translate(" + w0 / 2 + "," + h0 / 2 + ")");
            rotateG.append("line")
                .attr("x1", 6.5)
                .attr("x2", 100);
            rotateG.append("circle")
                .attr("cx", 100)
                .attr("r", gripRadius - 1)
                .on("mousedown", mousedown)
                .on("touchstart", mousedown);
            function mousedown() {
              stopPropagation();
              var target = this,
                  o = d3.mouse(svg),
                  angle0 = rotate.angle,
                  r = 100;
              if (d3.event.touches && d3.event.touches.length) {
                d3.select(window)
                    .on("touchmove.placement-rotate", move)
                    .on("touchend.placement-rotate", end);
              } else {
                d3.select(window)
                    .on("mousemove.placement-rotate", move)
                    .on("mouseup.placement-rotate", end);
              }
              function move() {
                preventDefault();
                var m = d3.mouse(svg),
                    angle = Math.atan2(r * (m[1] - o[1]), r * (r + m[0] - o[0])) * 180 / Math.PI,
                    x = 0.5 * (nodeX0 + nodeX1),
                    y = 0.5 * (nodeY0 + nodeY1);
                g.attr("transform", "rotate(" + angle + " " + [p0.x + w0 / 2, p0.y + h0 / 2] + ")translate(" + p0.x + "," + p0.y + ")");
                rotate.setRotate(angle0 + angle, x - translate.e, y - translate.f);
              }
              function end() {
                d3.select(window).on(".placement-rotate", null);
                editCancel();
              }
            }
          })
          .on(click, function() {
            stopPropagation();
            var rotateG = g.append("g").attr("class", "rotate-angle")
                .attr("transform", "translate(" + w0 / 2 + "," + h0 / 2 + ")");
            rotateG.append("line")
                .attr("x1", 6.5)
                .attr("x2", 100);
            rotateG.append("circle")
                .attr("cx", 100)
                .attr("r", 5.5)
                .on("mousedown", mousedown)
                .on("touchstart", mousedown);
            function mousedown() {
              stopPropagation();
              var target = this,
                  o = d3.mouse(svg),
                  angle0 = rotate.angle,
                  r = 100;
              if (d3.event.touches && d3.event.touches.length) {
                d3.select(window)
                    .on("touchmove.placement-rotate", move)
                    .on("touchend.placement-rotate", end);
              } else {
                d3.select(window)
                    .on("mousemove.placement-rotate", move)
                    .on("mouseup.placement-rotate", end);
              }
              function move() {
                preventDefault();
                var m = d3.mouse(svg),
                    angle = Math.atan2(r * (m[1] - o[1]), r * (r + m[0] - o[0])) * 180 / Math.PI,
                    x = 0.5 * (nodeX0 + nodeX1),
                    y = 0.5 * (nodeY0 + nodeY1);
                g.attr("transform", "rotate(" + angle + " " + [p0.x + w0 / 2, p0.y + h0 / 2] + ")translate(" + p0.x + "," + p0.y + ")");
                rotate.setRotate(angle0 + angle, x - translate.e, y - translate.f);
              }
              function end() {
                d3.select(window).on(".placement-rotate", null);
                editCancel();
              }
            }
          });
      grip.append("circle").attr("r", gripRadius);
      grip.append("path")
          .attr("d", "M24.083,15.5c-0.009,4.739-3.844,8.574-8.583,8.583c-4.741-0.009-8.577-3.844-8.585-8.583c0.008-4.741,3.844-8.577,8.585-8.585c1.913,0,3.665,0.629,5.09,1.686l-1.782,1.783l8.429,2.256l-2.26-8.427l-1.89,1.89c-2.072-1.677-4.717-2.688-7.587-2.688C8.826,3.418,3.418,8.826,3.416,15.5C3.418,22.175,8.826,27.583,15.5,27.583S27.583,22.175,27.583,15.5H24.083z")
          .attr("transform", "translate(-6,-6)scale(.4)");

      grip = g.insert("g", "*") // edit
            .attr("class", "edit")
            .attr("transform", "translate(" + rect.width + "," + rect.height + ")")
            .on("mousedown", stopPropagation)
            //.on("touchstart", stopPropagation)
            .on("touchstart", editItem)
            .on(click, editItem);
        /*
         .on(click, function() {
         stopPropagation();
         alert("Edit dialog.");
         editCancel();
         });
         */
      grip.append("circle").attr("r", gripRadius);
      grip.append("path")
          .attr("d", "M25.31,2.872l-3.384-2.127c-0.854-0.536-1.979-0.278-2.517,0.576l-1.334,2.123l6.474,4.066l1.335-2.122C26.42,4.533,26.164,3.407,25.31,2.872zM6.555,21.786l6.474,4.066L23.581,9.054l-6.477-4.067L6.555,21.786zM5.566,26.952l-0.143,3.819l3.379-1.787l3.14-1.658l-6.246-3.925L5.566,26.952z")
          .attr("transform", "translate(-4.5,-4.5)scale(.3)");

      g.insert("rect", "*") // highlight rectangle
          .attr("width", rect.width)
          .attr("height", rect.height);

      // Add temporary listener to window to cancel editing.
      var w = d3.select(window)
      //.on("mousedown", preventDefault)
      //.on("touchstart", preventDefault)
      .on("touchstart", editCancel)
      .on(click, editCancel);

      function deleteItem() {
          stopPropagation();
          if (confirm("Are you sure you want to delete this item?")) {
            d3.select(node).remove();
            editCancel();
          }
      }

      function editItem() {
          stopPropagation();
          if (placement.onClickEditGrip) {
              placement.onClickEditGrip(node);
          }
          editCancel();
      }
     
      function editCancel() {
        g.remove();
        d3.select(node).on(click, onclick);
        w.on(click, null);
      }
    }
  };
};

function sourceEvent() {
  var e = d3.event, s;
  while (s = e.sourceEvent) e = s;
  return e;
}

function stopPropagation() { sourceEvent().stopPropagation(); }
function preventDefault() { sourceEvent().preventDefault(); }

function cross(a, b) { return a[0] * b[1] - a[1] * b[0]; }
function dot(a, b) { return a[0] * b[0] + a[1] * b[1]; }

var deletePath = "M20.826,5.75l0.396,1.188c1.54,0.575,2.589,1.44,2.589,2.626c0,2.405-4.308,3.498-8.312,3.498c-4.003,0-8.311-1.093-8.311-3.498c0-1.272,1.21-2.174,2.938-2.746l0.388-1.165c-2.443,0.648-4.327,1.876-4.327,3.91v2.264c0,1.224,0.685,2.155,1.759,2.845l0.396,9.265c0,1.381,3.274,2.5,7.312,2.5c4.038,0,7.313-1.119,7.313-2.5l0.405-9.493c0.885-0.664,1.438-1.521,1.438-2.617V9.562C24.812,7.625,23.101,6.42,20.826,5.75zM11.093,24.127c-0.476-0.286-1.022-0.846-1.166-1.237c-1.007-2.76-0.73-4.921-0.529-7.509c0.747,0.28,1.58,0.491,2.45,0.642c-0.216,2.658-0.43,4.923,0.003,7.828C11.916,24.278,11.567,24.411,11.093,24.127zM17.219,24.329c-0.019,0.445-0.691,0.856-1.517,0.856c-0.828,0-1.498-0.413-1.517-0.858c-0.126-2.996-0.032-5.322,0.068-8.039c0.418,0.022,0.835,0.037,1.246,0.037c0.543,0,1.097-0.02,1.651-0.059C17.251,18.994,17.346,21.325,17.219,24.329zM21.476,22.892c-0.143,0.392-0.69,0.95-1.165,1.235c-0.474,0.284-0.817,0.151-0.754-0.276c0.437-2.93,0.214-5.209-0.005-7.897c0.881-0.174,1.708-0.417,2.44-0.731C22.194,17.883,22.503,20.076,21.476,22.892zM11.338,9.512c0.525,0.173,1.092-0.109,1.268-0.633h-0.002l0.771-2.316h4.56l0.771,2.316c0.14,0.419,0.53,0.685,0.949,0.685c0.104,0,0.211-0.017,0.316-0.052c0.524-0.175,0.808-0.742,0.633-1.265l-1.002-3.001c-0.136-0.407-0.518-0.683-0.945-0.683h-6.002c-0.428,0-0.812,0.275-0.948,0.683l-1,2.999C10.532,8.77,10.815,9.337,11.338,9.512z";

var movePath = "M-5,0H5 M0,-5V5 M-5,0l1,1 M-4,-1l-1,1l1,1 M4,-1l1,1l-1,1 M-1,-4l1,-1l1,1 M-1,4l1,1l1,-1";

})(placement = {});
