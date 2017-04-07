// Copyright 2015 ARCHIBUS, Inc.
// Created by Jason Davies, http://www.jasondavies.com/
// Modified by ED
// License: BSD; see LICENSE for further details.

(function(markerPlacement) {

markerPlacement.z_DELETE_MESSAGE = "Are you sure you want to delete this item?";
markerPlacement.z_EDIT_MESSAGE = "Edit"

// This behavior displays various edit grips on click or touch-and-hold.
// These edit grips allow deletion, rotation or editing.
markerPlacement.edit = function(parameters) {
	  var click = "click.placement-edit",
	  gripRadius = ('ontouchstart' in document.documentElement) ? 14 : 6.5;

	  return function(selection) {
	    selection.on(click, onclick);
	    selection.on("touchend.placement-edit", onclick);
	   
	    function onclick() {
	      if (d3.event.defaultPrevented) return;
	      stopPropagation();

	      var node = this,
	          rect = node.getBBox(),
	          nodeX0,
	          nodeY0,
	          nodeX1,
	          nodeY1,
	          svg = node.ownerSVGElement || node;
	      
	      editCancelAll();
	      
	      var t = d3.transform(d3.select(node).attr("transform")),
	      	  translate = t.translate,
	      	  rotation = t.rotate,
	      	  scale = t.scale;

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

	      //gripRadius = ('ontouchstart' in document.documentElement) ? 14 : 6.5;
	      
	      // get splotch
	      halfSplotchX = -20,
	      halfSplotchY = -20;
	      splotchWidth = rect.width;
	      splotchHeight = rect.height;
	      var splotch = d3.select(node).select(".splotch");
	      if (!splotch.empty()) {
	          halfSplotchX = splotch.attr("x"),
	          halfSplotchY = splotch.attr("y");
	          splotchWidth = splotch.attr("width");
	          splotchHeight = splotch.attr("height");
	      }
	      gripImageScale = 0.7;
	      screenRatio =  1/svg.getScreenCTM().a,
	      gripRadiusAuto = 14 * screenRatio;         
	      gripRadius = gripRadiusAuto;
	      iconRatio = screenRatio * 2;
	      lineLength = 5*gripRadius + halfw;
	      
	      d3.select(node).on(click, null);
	               
	      var g = d3.select(svg).append("g")
	          .on("mousedown", stopPropagation)
	          .on("touchstart", stopPropagation)
	          .attr("class", "edit")
	          .style("stroke-width", "0.09%")
	          .attr("id", d3.select(node).attr("id") + "_grips")
	          .attr("transform", "translate(" + Math.round(translate[0]) + "," + Math.round(translate[1]) + ")" + "rotate(" + rotation + ")" );
	      
	      // delete
	      var grip = g.insert("g", "*") 
		      .attr("class", "delete")
		      //.attr("transform", "translate(" + (w0 + gripRadius) + ", " + -gripRadius/2 + ")")
		      .attr("transform", "translate(" + (rect.width*scale[0] + gripRadius) + ", " + -gripRadius/2*scale[1] + ")")
		      .on("mousedown", stopPropagation)
		      .on("touchstart", deleteItem)
		      .on(click, deleteItem);
		  //grip.append("circle").attr("r", gripRadius);
	      grip.append("circle").style("stroke-width", "0.09%").attr("r", gripRadius)
	      	   .attr("transform", "translate(" + [halfSplotchX*scale[0], halfSplotchY*scale[1]] + ")")
		  grip.append("path")
		      .attr("d", deletePath)
		      //.attr("transform", "translate(-6,-6)scale(.4)"); 
		      .attr("transform",  "translate(" + [halfSplotchX*scale[0], halfSplotchY*scale[1]] + ")translate(" + (-6*iconRatio) + "," + (-6*iconRatio)  + ")scale(" + (.4*iconRatio) + ")"); 

	      // rotate
	      grip = g.insert("g", "*")
	          .attr("class", "rotate")
	          .attr("transform",  "translate(" + [halfSplotchX*scale[0], halfSplotchY*scale[1]] + ")" + "translate(" + [rect.width / 2*scale[0], rect.height / 2*scale[1]] + ")")
	          //.attr("transform", "translate(" + [w0 / 2, h0 / 2] + ")") 
	          .on("mousedown", stopPropagation)
	          //.on("touchstart", stopPropagation)
	          .on("touchstart", function() {
	            stopPropagation();         
	            var rotateG = g.append("g").attr("class", "rotate-angle")
	                //.attr("transform",  "translate(" + [halfSplotchX, halfSplotchY] + ")" + "translate(" + halfw + "," + halfh + ")");
	            	.attr("transform",  "translate(" + [halfSplotchX*scale[0], halfSplotchY*scale[1]] + ")" + "translate(" + halfw*scale[0] + "," + halfh*scale[1] + ")");
	            rotateG.append("line")
	                .attr("x1", gripRadius)
	                .attr("x2", lineLength);
	            rotateG.append("circle")
	                .attr("cx", lineLength)
	                .attr("r", gripRadius - 1)
	                .style("stroke-width", "0.09%")
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
	                //g.attr("transform", "rotate(" + (angle + rotation) + " " + [p0.x + w0 / 2, p0.y + h0 / 2] + ")translate(" + p0.x + "," + p0.y + ")");
	                g.attr("transform", "translate(" + Math.round(translate[0]) + "," + Math.round(translate[1]) + ")" + "rotate(" + Math.round(rotation + angle) + ")" );
	                d3.select(node).attr('transform', "translate(" + translate[0] + "," +  translate[1] + ")rotate(" + Math.round(angle + rotation) + ")scale(" + scale + ")");
	              }
	              function end() {
	                d3.select(window).on(".placement-rotate", null);
	                editCancel();
	                if (parameters.moveEndHandler) {
	                	parameters.moveEndHandler(parameters);
	                }
	              }
	            }
	          })
	          .on(click, function() {
	            stopPropagation();

	            var rotateG = g.append("g").attr("class", "rotate-angle")
	                .attr("transform",  "translate(" + [halfSplotchX*scale[0], halfSplotchY*scale[1]] + ")" + "translate(" + halfw*scale[0] + "," + halfh*scale[1] + ")");
	            rotateG.append("line")
	                .attr("x1", gripRadius)
	                .attr("x2", lineLength);
	            rotateG.append("circle")
	                .attr("cx", lineLength)
	                .attr("r", gripRadius)
	                .style("stroke-width", "0.09%")
	                .on("mousedown", mousedown)
	                .on("touchstart", mousedown);
	            function mousedown() {
	              stopPropagation();
	              var target = this,
	                  o = d3.mouse(svg),
	                  //angle0 = rotate.angle,
	                  angle0 = rotation,
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
	                //g.attr("transform", "rotate(" + (angle + rotation) + " " + [p0.x + w0 / 2, p0.y + h0 / 2] + ")translate(" + p0.x + "," + p0.y + ")");
	                g.attr("transform", "translate(" + Math.round(translate[0]) + "," + Math.round(translate[1]) + ")" + "rotate(" + Math.round(rotation + angle) + ")" );
	                //rotate.setRotate(angle0 + angle, x - translate.e, y - translate.f);
	                d3.select(node).attr('transform', "translate(" + translate[0] + "," +  translate[1] + ")rotate(" + Math.round(angle + rotation) + ")scale(" + scale + ")");
	              }
	              function end() {
	                d3.select(window).on(".placement-rotate", null);
	                editCancel();
	                if (parameters.moveEndHandler) {
	                	parameters.moveEndHandler(parameters);
	                }
	              }
	            }
	          });     

	      grip.append("circle").style("stroke-width", "0.09%")
	      	  .attr("r", gripRadius);
	      grip.append("path")
	          .attr("d", "M24.083,15.5c-0.009,4.739-3.844,8.574-8.583,8.583c-4.741-0.009-8.577-3.844-8.585-8.583c0.008-4.741,3.844-8.577,8.585-8.585c1.913,0,3.665,0.629,5.09,1.686l-1.782,1.783l8.429,2.256l-2.26-8.427l-1.89,1.89c-2.072-1.677-4.717-2.688-7.587-2.688C8.826,3.418,3.418,8.826,3.416,15.5C3.418,22.175,8.826,27.583,15.5,27.583S27.583,22.175,27.583,15.5H24.083z")
	          //.attr("transform", "translate(-6,-6)scale(.4)");
	          .attr("transform", "translate(" + (-6*iconRatio) + "," + (-6*iconRatio) + ")scale(" + (.4*iconRatio) + ")");

	      // end rotate
	      
	      grip = g.insert("g", "*") // edit
	            .attr("class", "edit")
	            .attr("transform",  "translate(" + [halfSplotchX*scale[0], halfSplotchY*scale[1]] + ")" + "translate(" + (rect.width*scale[0] + gripRadius) + "," + (rect.height*scale[1] + gripRadius/2) + ")")
	            .on("mousedown", stopPropagation)
	            //.on("touchstart", stopPropagation)
	            .on("touchstart", editItem)
	            .on(click, editItem);
	      grip.append("circle").style("stroke-width", "0.09%")
	      		.attr("r", gripRadius);
	      grip.append("path")
	          .attr("d", "M25.31,2.872l-3.384-2.127c-0.854-0.536-1.979-0.278-2.517,0.576l-1.334,2.123l6.474,4.066l1.335-2.122C26.42,4.533,26.164,3.407,25.31,2.872zM6.555,21.786l6.474,4.066L23.581,9.054l-6.477-4.067L6.555,21.786zM5.566,26.952l-0.143,3.819l3.379-1.787l3.14-1.658l-6.246-3.925L5.566,26.952z")
	          //.attr("transform", "translate(-4.5,-4.5)scale(.3)");
	          .attr("transform", "translate(" + (-4.5*iconRatio) + "," + (-4.5*iconRatio) + ")scale(" + (.3*iconRatio) + ")");

	      g.insert("rect", "*") // highlight rectangle
	          .attr("x", halfSplotchX)
	      	  .attr("y", halfSplotchY)
	          .attr("width", rect.width)
	          .attr("height", rect.height)
	      	  .attr("transform", "scale(" + scale + ")");

	      // Add temporary listener to window to cancel editing.
	      var w = d3.select(window)
	      //.on("mousedown", preventDefault)
	      //.on("touchstart", preventDefault)
	      .on("touchstart", editCancel)
	      .on(click, editCancel);

	      function deleteItem() {
	          stopPropagation();

	          var proceedWithDelete = (parameters.beforeDeleteHandler) ? parameters.beforeDeleteHandler() : true;   
	          if (proceedWithDelete == false) {
	        	  return;
	          }
	          
	          if (confirm(markerPlacement.z_DELETE_MESSAGE)) {
	        	  if (parameters.deleteHandler) {
	        		  var image = d3.select(node).select("use");
	        		  if (image.empty()) {
	        			  image = d3.select(node).select("image");
	        		  }
	        		  //var success = parameters.deleteHandler(image.node().id);
	        		  var success = parameters.deleteHandler();
	        		  if (success) {
	                	  d3.select(node).remove();
	                	                  	  
	                	  var str = node.id.split('-assets_');
	                	  var label = d3.select('#l-' + str[0] + '-' + str[1]);
	                	  //alert('l-' + str[0] + '-' + str[1]);
	                	  if (!label.empty()) {
	                		  label.remove();
	                	  }
	                	  editCancel();          			  
	        		  }
	        	  } else {
	            	  d3.select(node).remove();
	            	  editCancel();        		  
	        	  }
	          }
	      }

	      function editItem() {
	          stopPropagation();
	          if (parameters.editHandler) {
	    		  var image = d3.select(node).select("use");
	    		  if (image.empty()) {
	    			  image = d3.select(node).select("image");
	    		  } 
	    		  parameters.editHandler();
	          } else {
	        	  alert(markerPlacement.z_EDIT_MESSAGE);
	          }
	          editCancel();
	      }
	     
	      function editCancel() {
	        g.remove();
	        d3.select(node).on(click, onclick);
	        w.on(click, null);
	      }
	      
	      function editCancelAll() {
		      // exit editMode for all other markers
		      d3.select(svg).selectAll(".edit").each(function(){ 
		    	  var id = this.id.replace("_grips", ""); 
		    	  if ((node.id !== this.id) && id != '') {
		        	  d3.select('#' + id).on(click, onclick);
		        	  d3.select(this).remove();
		    	  }    	  
		      	});	    	  
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
})(markerPlacement = {});
