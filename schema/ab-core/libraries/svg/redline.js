// Copyright 2014 ARCHIBUS, Inc.
// Created by Jason Davies, http://www.jasondavies.com/
// Modifed by ED
// License: BSD; see LICENSE for further details.

(function(redline) {

var id = -1,
    click = "click.redline-edit",
    touchstart = "touchstart.redline-edit",
    //touchstart = "touchstart",
    radians = Math.PI / 180,
    gripRadius = ('ontouchstart' in document.documentElement) ? 13.5 : 6.5;

var isIE = (window.navigator.userAgent.indexOf("MSIE ") > 0 ? true : false);

redline.z_MESSAGE_ENTER_TEXT = 'Please enter the text box content:';
redline.z_MESSAGE_DELETE = 'Are you sure you want to delete this object?';
redline.z_TITLE = "Redline";

var scaleFactor = 2;
var fontSize = 10;
var onChange = null;

redline.cloud = function(g) {
  var path = g.selectAll("path").data([0]);
  path.enter().append("path")
      .classed({'redline-path': true})
      .attr("d", cloudRect(75*scaleFactor, 50*scaleFactor));
};

redline.cloud.edit = function(g, params) {

    //set current font size
    if(params[1])
    	fontSize = params[1];
    
    onChange = params[2];
    
    removeLabel(g);

	var path = g.selectAll("path")
				.style("stroke-width", 0.15*(fontSize/10)*scaleFactor + "em");
	
    var o = cloudRectParse(path.attr("d")),
    width = o.width,
    height = o.height;
	
  g.on(click, edit).on(touchstart, edit);
  edit();

  function edit() {
    //stopPropagation();
    g.on(click, null);
    
    if (!g.select(".edit").empty()) {
        return;
    }
	var shadow = g.select("rect");
	var o = cloudRectParse(path.attr("d")),
		    width = o.width,
		    height = o.height;
	
	var grips = g.append("g").attr("class", "edit");
    var deleteTR = grips.append("g")
        .attr("transform", "translate(" + width + ")scale(" + scaleFactor*1.5 + ")")
        .call(deleteGrip, function() {
          d3.select(g.node().parentNode).remove();
          editCancel();
          if(onChange)
        	  onChange();

        });
    var resizeTL = grips.append("g")
        .attr("transform", "scale(" + scaleFactor*1.5 + ")")
        .on("mousedown", eventCancel)
        .on("touchstart", eventCancel)
        .on("click", eventCancel)
        .call(resizeGrip, g.node().parentNode, function(x, y) {
        	var shadow = g.select("rect");
        	var o = cloudRectParse(path.attr("d")),
        		    width = o.width,
        		    height = o.height;
        	var t = g.node().transform.baseVal.getItem(0),
              x1 = t.matrix.e + width,
              y1 = t.matrix.f + height;
        	
        	var zoomFactor = getZoomFactor(g);
        	var offsetX = (isIE? g.node().style.left.replace(/px$/, ""): 0);
        	var gripOffset = (isIE? 20 : 0);
            width = Math.max(0, x1 - x - offsetX/zoomFactor) + gripOffset ;
            height = Math.max(0, y1 - y) - gripOffset;
            path.attr("d", cloudRect(width, height));
            t.setTranslate(x1 - width, y1 - height);
            deleteTR.attr("transform", "translate(" + (width+offsetX) + ")scale(" + scaleFactor*1.5 + ")");
            resizeBR.attr("transform", "translate(" + (width+offsetX) + "," + height + ")scale(" + scaleFactor*1.5 + ")");
            shadow.attr("width", width).attr("height", height);
            if(onChange)
          	  onChange();
        });
    var resizeBR = grips.append("g")
        .attr("transform", "translate(" + width + "," + height + ")scale(" + scaleFactor*1.5 + ")")
        .on("mousedown", eventCancel)
        .on("touchstart", eventCancel)
        .on("click", eventCancel)
        .call(resizeGrip, g.node().parentNode, function(x, y) {
        	var shadow = g.select("rect");
        	var o = cloudRectParse(path.attr("d")),
        		    width = o.width,
        		    height = o.height;
          var t = g.node().transform.baseVal.getItem(0);
          var zoomFactor = getZoomFactor(g);
      	  var offsetX = (isIE? Number(g.node().style.left.replace(/px$/, "")): 0);
          var gripOffset = (isIE? 20 : 0);
          width = Math.max(0, (x+offsetX/zoomFactor-gripOffset-t.matrix.e));
          height = Math.max(0, y - t.matrix.f) + gripOffset;
          path.attr("d", cloudRect(width, height));
          deleteTR.attr("transform", "translate(" + width + ")scale(" + scaleFactor*1.5 + ")");
          resizeBR.attr("transform", "translate(" + width + "," + height + ")scale(" + scaleFactor*1.5 + ")");
          shadow.attr("width", width).attr("height", height);
          if(onChange)
        	  onChange();
        });

    var editClick = "click.redline-edit-" + (++id),
        editTouchstart = "touchstart.redline-edit-" + id,
        w = d3.select(window).on(editClick, editCancel).on(editTouchstart, editCancel);

    //var grips = g.append("g").attr("class", "edit");
    
    function editCancel() {
      grips.remove();
      g.on(click, edit);
      w.on(editClick, null).on(editTouchstart, null);
    }
  }
};


redline.attachEvent = function(g, params){
	
	var type = params[0];

	// show textbox edit dialog?
	var showDialog = (params[1] ? params[1] : false);
	
	if(params[2])
    	fontSize = params[2];
    
    onChange = params[3];

	g.on(click, redline[type].edit.createDelegate(g, [g, showDialog, fontSize, onChange]))
	  .on(touchstart, redline[type].edit.createDelegate(g, [g, showDialog, fontSize, onChange]));
};

function cloudRect(width, height) {
  var sx = Math.abs(width) / 75, sy = Math.abs(height) / 50;
  return "M" + [52 * sx, 45 * sy] + " a" + [4 * sx, 4 * sy] + " 0 0 0 0," + -20 * sy + " a" + [4 * sx, 4 * sy] + " 0 0 0 " + [-30 * sx, -10 * sy] + " a" + [4 * sx, 4 * sy] + " 0 0 0 " + [-10 * sx, 30 * sy] + "z";
}

function cloudRectParse(s) {
  s = s.replace("M ", "M");
  //include space for IE
  var parts = s.split(/[M, \s]/g);
  return {width: +parts[1] / 52 * 75, height: +parts[2] / 45 * 50};
}

redline.line = editableLine(line, true);
redline.arrow = editableLine(arrow, false);

function line(x0, y0, x1, y1, ratio) {
  return "M" + x0 + "," + y0 + "L" + x1 + "," + y1;
}

function arrow(x0, y0, x1, y1, ratio) {
  var a = Math.atan2(y1 - y0, x1 - x0),
      s = Math.sin(a),
      c = Math.cos(a);
  return "M" + x0 + "," + y0 + "L" + x1 + "," + y1 + "M" + x1 + "," + y1 +
         "l" + (3 * ratio * s - 5 * ratio * c) + "," + (-3 * ratio * c - 5 * ratio* s) + "l" + -6 * ratio * s + "," + 6 * ratio * c + "z";
}

function editableLine(draw, line_) {
  function line(g) {
    var path = g.selectAll("path")
    .data([0]);
    
    if(draw === 'line')
	    path.enter().append("path")
	        .classed({'redline-path': true})
	        .attr("d", draw(0, 40*scaleFactor, 50*scaleFactor, 10*scaleFactor, 1*scaleFactor));
    else
	    path.enter().append("path")
        .classed({'arrow-path': true})
	        .attr("d", draw(0, 40*scaleFactor, 50*scaleFactor, 10*scaleFactor, 1*scaleFactor));
  }

  line.edit = function(g, params) {
	
	//set current font size
	if(params[1])
	  	fontSize = params[1];
	
	onChange = params[2];
	
	removeLabel(g);
  
    var path = g.selectAll("path").style("stroke-width", 0.15*(fontSize/10)*scaleFactor + "em"),
        d = lineParse(path.attr("d")),
        x0 = d[0], y0 = d[1], x1 = d[2], y1 = d[3];

    g.on(click, edit).on(touchstart, edit);
    edit();

    function edit() {
      //stopPropagation();
      g.on(click, null);
      

      if (!g.select(".edit").empty()) {
          return;
      }

      var path = g.selectAll("path"),
      		 d = lineParse(path.attr("d")),
      	    x0 = d[0], y0 = d[1], x1 = d[2], y1 = d[3];
      
      shadow = g.select("line")
          .attr("x1", x0)
          .attr("y1", y0)
          .attr("x2", x1)
          .attr("y2", y1);

      var ratio = (line_ ? 1 : Math.sqrt((x1-x0)*(x1-x0) + (y1-y0)*(y1-y0)) / Math.sqrt(100*100 + 60*60));

      var deleteM = g.append("g")
          .attr("class", "edit")
          .call(deleteGrip, function() {
              d3.select(g.node().parentNode).remove();
              editCancel();
              if(onChange)
            	  onChange();
          });
      if (!d3.select(g.node().parentNode).selectAll(".arrow").empty()) {
          deleteM.attr("transform", "translate(" + path.node().getPointAtLength((path.node().getTotalLength()/2) - 8).x + "," + path.node().getPointAtLength((path.node().getTotalLength()/2) - 8).y + ")scale(" + scaleFactor*1.5 + ")");
      } else {
          deleteM.attr("transform", "translate(" + path.node().getPointAtLength(path.node().getTotalLength()/2).x + "," + path.node().getPointAtLength(path.node().getTotalLength()/2).y + ")scale(" + scaleFactor*1.5 + ")");
      }
      var circle0 = g.append("g")
          .attr("class", "edit")
          .attr("transform", "translate(" + x0 + "," + y0 + ")scale(" + scaleFactor*1.5 + ")")
          .on("mousedown", eventCancel)
          .on("touchstart", eventCancel)
          .on("click", eventCancel)
          .call(d3.behavior.drag()
            .on("drag", function() {
              var zoomFactor = getZoomFactor(g);
              var offsetX = (isIE? Number(g.node().style.left.replace(/px$/, "")): 0);
              var gripOffset = (isIE? 20 : 0);
              x0 = d3.event.x + offsetX/zoomFactor - gripOffset;
              y0 = d3.event.y + gripOffset;
              var ratio = (line_ ? 1 : Math.sqrt((x1-x0)*(x1-x0) + (y1-y0)*(y1-y0)) / Math.sqrt(100*100 + 60*60));
              circle0.attr("r", gripRadius ).attr("transform", "translate(" + (x0 + scaleFactor*1.5)  + "," + (y0 + scaleFactor*1.5)  + ")scale(" + scaleFactor*1.5 + ")");
              if(line_)
                  path.attr("d", draw(x0, y0, x1, y1, 1));
              else
                  path.attr("d", draw(x0, y0, x1, y1, ratio));
              if (!d3.select(g.node().parentNode).selectAll(".arrow").empty()) {
                  deleteM.attr("transform", "translate(" + path.node().getPointAtLength((path.node().getTotalLength()/2) - 8).x  + "," + path.node().getPointAtLength((path.node().getTotalLength()/2) - 8).y  + ")scale(" + scaleFactor*1.5 + ")");
              } else {
                  deleteM.attr("transform", "translate(" + path.node().getPointAtLength(path.node().getTotalLength()/2).x  + "," + path.node().getPointAtLength(path.node().getTotalLength()/2).y  + ")scale(" + scaleFactor*1.5 + ")");
              }

              shadow.attr("x1", x0)
                  .attr("y1", y0)
                  .attr("x2", x1)
                  .attr("y2", y1);

              if(onChange)
  	            onChange();
              }
            ));
      circle0.append("circle").attr("r", gripRadius );
      circle0.append("path").attr("d", movePath);
      var circle1 = g.append("g")
          .attr("class", "edit")
          .attr("transform", "translate(" + x1 + "," + y1 + ")scale(" + scaleFactor*1.5 + ")")
          .on("mousedown", eventCancel)
          .on("touchstart", eventCancel)
          .on("click", eventCancel)
          .call(d3.behavior.drag()
            .on("drag", function() {
              var zoomFactor = getZoomFactor(g);
              var offsetX = (isIE? Number(g.node().style.left.replace(/px$/, "")): 0);
              var gripOffset = (isIE? 20 : 0);
              x1 = d3.event.x+offsetX/zoomFactor - gripOffset;
              y1 = d3.event.y + gripOffset;
              var ratio = (line_ ? 1 : Math.sqrt((x1-x0)*(x1-x0) + (y1-y0)*(y1-y0)) / Math.sqrt(100*100 + 60*60));
              circle0.attr("r", gripRadius ).attr("transform", "translate(" + (x0 + scaleFactor*1.5)  + "," + (y0 + scaleFactor*1.5)  + ")scale(" + scaleFactor*1.5 + ")");
              circle1.attr("r", gripRadius ).attr("transform", "translate(" + (x1 + scaleFactor*1.5)  + "," + (y1 + scaleFactor*1.5)  + ")scale(" + scaleFactor*1.5 + ")");
              if(line_)
                  path.attr("d", draw(x0, y0, x1, y1, 1));
              else
            	  path.attr("d", draw(x0, y0, x1, y1, ratio));
              if (!d3.select(g.node().parentNode).selectAll(".arrow").empty()) {
                  deleteM.attr("transform", "translate(" + path.node().getPointAtLength((path.node().getTotalLength()/2) - 8).x + "," + path.node().getPointAtLength((path.node().getTotalLength()/2) - 8).y + ")scale(" + scaleFactor*1.5 + ")");
              } else {
                  deleteM.attr("transform", "translate(" + path.node().getPointAtLength(path.node().getTotalLength()/2).x + "," + path.node().getPointAtLength(path.node().getTotalLength()/2).y + ")scale(" + scaleFactor*1.5 + ")");
              }
              shadow.attr("x1", x0)
                  .attr("y1", y0)
                  .attr("x2", x1)
                  .attr("y2", y1);
              if(onChange)
  	            onChange();
              }
            ));
      circle1.append("circle").attr("r", gripRadius );
      circle1.append("path").attr("d", movePath);

      var editClick = "click.redline-edit-" + (++id),
          editTouchstart = "touchstart.redline-edit-" + id,
          w = d3.select(window).on(editClick, editCancel).on(editTouchstart, editCancel);

      function editCancel() {
        deleteM.remove();
        circle0.remove();
        circle1.remove();
        g.on("click", edit);
        w.on(editClick, null).on(editTouchstart, null);
      }
    }
  };

  return line;
}

function lineParse(s) {
  s = s.replace("M ", "M");
  s = s.replace(" L ", "L");

  //for ie, replace all space with ,
  s = s.replace(/ /g, ",");

  return s.split(/[ML,\s]/g).slice(1, 5).map(Number);
}

redline.arrowTextbox = editableTextbox(true, false, false, false);
redline.textbox = editableTextbox(false, false, false, false);
redline.area = editableTextbox(false, true, false, false);
redline.swatch = editableTextbox(false, false, true, false);
redline.textOnly = editableTextbox(false, false, false, true);

function editableTextbox(arrow_, area_, swatch_, textOnly_) {
  var R = (arrow_) ? 28*scaleFactor : 50*scaleFactor,
      R0 = R * Math.SQRT1_2,
      Toffset = (arrow_) ? 15*scaleFactor: 0;
  
  function textbox(g) {
    var arrow = g.selectAll(".textbox-arrow")
        .data(arrow_ ? [0] : []);
    var arrowEnter = arrow.enter().append("g")
        .attr("class", "textbox-arrow")
        //.attr("transform", "translate(" + R / 2 + "," + R / 2 + ")rotate(0)");
        .attr("transform", "translate(" + (R / 2 + Toffset) + "," + (R / 2 + Toffset) + ")rotate(0)");
    arrowEnter.append("path")
        .attr("d", "M" + -R + ",0L0," + R + "L0," + R0 + "A" + [R0, R0] + " " + [0, 0, 1] + " 0," + -R0 + "L0," + -R + "Z");
    arrowEnter.append("circle")
        .attr("r", R0)
        .style("fill", "none")					// workaround for image capture
        .style("stroke", "#000");				// workaround for image capture
    arrow.exit().remove();

    var text = g.text();
    var box = g.selectAll(".box");
    
    // for textbox or tex only, will show pop up box
   	if (!area_ && !swatch_ && !box.empty() && !text) {
        Ext.Msg.prompt(redline.z_TITLE, redline.z_MESSAGE_ENTER_TEXT, function(btnText, sInput) {
      	  if(btnText === 'ok'){
      	    var textContent = g.select('.redline-text');
   	        textContent.text(sInput);
   	        textContent.call(wrap, sInput, g, width, arrow_, 0);
      	  } 
        });
    }

   	var className = (area_) ? "box area-path" : "box redline-path";
    if(swatch_)
    	className = "box swatch-path";
    
    box = box.data([0]);
    var boxPath = box.enter().append("path")
    				.attr("class", className)
   					.attr("d", textRect(Toffset, Toffset, R, R, area_));
    
    var o = textRectParse(box.attr("d"), area_),
   			width = o.width,
   			height = o.height,
   			radius = o.radius;

   	
	var shadow = g.select("rect");
	
	if (arrow_ || textOnly_) {
       boxPath.style("stroke-opacity", 0);   			// functional: only display in edit mode 	
	}
  }

  textbox.edit = function(g, params) {
	  
    var showDialog = (params[0] ? params[0] : false);
    
    //set current font size
    if(params[1])
    	fontSize = params[1];
    
    onChange = params[2];
        
    removeLabel(g);
	
	var text = g.text();
    var shadow = g.select("rect");
	var box = g.selectAll(".box");
	
	if(!arrow_)
		box.style("stroke-width", 0.15*(fontSize/10)*scaleFactor + "em");
	
	var o = textRectParse(box.attr("d"), area_),
		width = o.width,
		height = o.height,
		radius = o.radius;
	
	if (arrow_ && textOnly_) {
        box.style("stroke-opacity", 1);    	
    }

	var color = box.style("stroke");
	if (!area_ && !swatch_){
		if(showDialog && !box.empty() && !text) {
	        Ext.Msg.prompt(redline.z_TITLE, redline.z_MESSAGE_ENTER_TEXT, function(btnText, sInput) {
	          if(btnText === 'ok'){
	        	    var textContent = g.select('.redline-text');
	          	    textContent.attr("fill", color);
	          	    if (textContent.empty()) {
	      	        	if(!width || width < 80*scaleFactor){
	      	        		width =  80*scaleFactor;
	      	        		height = 80*scaleFactor;
	      	        	}
	      	            shadow.attr({width: width, height: height});
	      	            box.attr("d", textRect(Toffset, Toffset, width, height, area_));
	      	            textContent = g.append("text").attr({width: width-o.radius-2*fontSize, height: height-o.radius- 2*fontSize, x: width+o.radius+fontSize, y: height+o.radius+fontSize, "class": 'redline-text'}).text(text);
	      	            textContent.call(wrap, sInput, g, width, arrow_, radius);
		      	    } else if (textContent.text() === ''){
		      	        textContent.text(sInput);
		      	        textContent.call(wrap, sInput, g, width, arrow_, radius);
		      	    }
	          } 
	        });
		}
	
	
	    var textContent = g.select('.redline-text');
	    if (textContent.empty()) {
	        //if (!(arrow_)) {
	        	if(!width || width < 80*scaleFactor){
	        		width =  80*scaleFactor;
	        		height = 80*scaleFactor;
	        	}
	            shadow.attr({width: width, height: height});
	            box.attr("d", textRect(Toffset, Toffset, width, height, area_));
	        //}
	        textContent = g.append("text").attr({width: width-o.radius-2*fontSize, height: height-o.radius- 2*fontSize, x: width+o.radius+fontSize, y: height+o.radius+fontSize, "class": 'redline-text'}).text(text);
	        textContent.call(wrap, text, g, width, arrow_, radius);
	
	    } else if (textContent.text() === ''){
	        textContent.text(text);
	        textContent.call(wrap, text, g, width, arrow_, radius);
	    }

	    textContent.style("stroke", color)
	    		   .style("fill", color)
	    		   .style("font-size", (fontSize)+"px")
	               .style("font-family", "Arial")
	               .attr("transform", "translate(" + (Toffset + radius) + "," + (Toffset) + ")");
	}
	
    var drag = d3.behavior.drag()
        .on("dragstart", function() {
          var m = d3.mouse(this.parentNode),
              d = this.transform.baseVal.getItem(1).angle,
              a = Math.atan2(R / 2 - m[1], R / 2 - m[0]) / radians - d,
              //start = [-R * Math.cos(d * radians), -R * Math.sin(d * radians)];
              start = [(-R + Toffset) * Math.cos(d * radians), (-R + Toffset) * Math.sin(d * radians)];
          drag.on("drag", function() {
            var m = [-R / 2 + d3.event.x, -R / 2 + d3.event.y],
                delta = Math.atan2(cross(start, m), dot(start, m)) / radians - a;
            d3.select(this).attr("transform", "translate(" + (R / 2 + Toffset) + "," + (R / 2 + Toffset) + ") rotate(" + (d + delta) + ")");
          });
        });

    g.selectAll(".textbox-arrow")
        .on("mousedown", stopPropagation)
        .on("touchstart", stopPropagation)
        .call(drag);


     var o = textRectParse(box.attr("d"), area_),
         width = o.width,
         height = o.height,
         radius = o.radius;

    g.on(click, edit).on(touchstart, edit);
    edit();

    function edit() {
      //stopPropagation();
      g.on(click, null);
      
      if (!g.select(".edit").empty()) {
          return;
      }
      
      if (arrow_ || textOnly_) {
          box.style("stroke-opacity", 1);    	
      }
      
      var o = textRectParse(box.attr("d"), area_),
			      width = o.width,
			      height = o.height
			      radius = o.radius;
      
	  var grips = g.append("g").attr("class", "edit")
          .attr("transform", "translate(" + Toffset + "," + Toffset + ")");
      var textContent = g.select('.redline-text');
      var deleteTR = grips.append("g")
          .attr("transform", "translate(" + (width-radius+radius*Math.cos(45)) + "," + (radius-radius*Math.sin(45)) + ")scale(" + scaleFactor*1.5 + ")")
          .call(deleteGrip, function() {
            d3.select(g.node().parentNode).remove();
            editCancel();
            if(onChange)
            	onChange();

          });
      
      if(!arrow_){
	      var resizeTL = grips.append("g")
	          .attr("transform", "translate(" + (radius-radius*Math.cos(45)) + "," + (radius-radius*Math.sin(45)) + ")scale(" + scaleFactor*1.5 + ")")
	      	  .on("mousedown", eventCancel)
	          .on("touchstart", eventCancel)
	          .on("click", eventCancel)
	          .call(resizeGrip, g.node().parentNode, function(x, y) {
	            var text = g.text();
	            var t = g.node().transform.baseVal.getItem(0),
	                x1 = t.matrix.e + width,
	                y1 = t.matrix.f + height;
	            var zoomFactor = getZoomFactor(g);
	        	var offsetX = (isIE? g.node().style.left.replace(/px$/, ""): 0);
	            var gripOffset = (isIE? 20 : 0);
	            width = Math.max(0, x1 - x)-offsetX/zoomFactor+gripOffset;
	            height = Math.max(0, y1 - y)-gripOffset;
	            radius= (area_) ? Math.min(width, height)/5 : 0;
	            
	            //box.attr("d", textRect(width, height));
	            box.attr("d", textRect(Toffset, Toffset, width, height, area_));
	            t.setTranslate(x1 - width, y1 - height);
	            resizeTL.attr("transform", "translate(" + (radius-radius*Math.cos(45)) + "," + (radius-radius*Math.sin(45)) + ")scale(" + scaleFactor*1.5 + ")");
	            deleteTR.attr("transform", "translate(" + (width-radius+radius*Math.cos(45)) + "," + (radius-radius*Math.sin(45)) + ")scale(" + scaleFactor*1.5 + ")");
	            resizeBR.attr("transform", "translate(" + (width-radius+radius*Math.cos(45)) + "," + (height-radius+radius*Math.sin(45)) + ")scale(" + scaleFactor*1.5 + ")");
	            //foreignObject.attr({width: width, height: height});
	            editBL.attr("transform", "translate(" + (radius-radius*Math.cos(45)) + "," + (height-radius+radius*Math.sin(45))  + ")scale(" + scaleFactor*1.5 + ")");
	            shadow.attr({width: width, height: height});
	            if (!swatch_ && textContent){
	            	textContent.style("stroke", color)
	            			   .style("fill", color)
	            			   .attr("transform", "translate(" + (Toffset + radius) + "," + (Toffset) + ")");
	            	textContent.call(wrap, text, g, width, arrow_, radius);
	            }
	            if(onChange)
	 	            onChange();
	          });
	      var resizeBR = grips.append("g")
	          .attr("transform", "translate(" + (width-radius+radius*Math.cos(45)) + "," + (height-radius+radius*Math.sin(45)) + ")scale(" + scaleFactor*1.5 + ")")
	          .on("mousedown", eventCancel)
	          .on("touchstart", eventCancel)
	          .on("click", eventCancel)
	          .call(resizeGrip, g.node().parentNode, function(x, y) {
	            var text = g.text();
	            var t = g.node().transform.baseVal.getItem(0);
	            var zoomFactor = getZoomFactor(g);
	        	var offsetX = (isIE? Number(g.node().style.left.replace(/px$/, "")): 0);
	            var gripOffset = (isIE? 20 : 0);
	            width = Math.max(0, (x+offsetX/zoomFactor-gripOffset-t.matrix.e) );
	            height = Math.max(0, y - t.matrix.f)+gripOffset;
	            radius= (area_) ? Math.min(width, height)/5 : 0;
	            
	            //box.attr("d", textRect(width, height));
	            box.attr("d", textRect(Toffset, Toffset, width, height, area_));
	            resizeTL.attr("transform", "translate(" + (radius-radius*Math.cos(45)) + "," + (radius-radius*Math.sin(45)) + ")scale(" + scaleFactor*1.5 + ")");
	            deleteTR.attr("transform", "translate(" + (width-radius+radius*Math.cos(45)) + "," + (radius-radius*Math.sin(45)) + ")scale(" + scaleFactor*1.5 + ")");
	            resizeBR.attr("transform", "translate(" + (width-radius+radius*Math.cos(45)) + "," + (height-radius+radius*Math.sin(45)) + ")scale(" + scaleFactor*1.5 + ")");
	            //foreignObject.attr({width: width, height: height});
	            editBL.attr("transform", "translate(" + (radius-radius*Math.cos(45)) + "," + (height-radius+radius*Math.sin(45))  + ")scale(" + scaleFactor*1.5 + ")");
	            shadow.attr({width: width, height: height});
	            if (!swatch_ && textContent){
	            	textContent.style("stroke", color)
	            			   .style("fill", color)
	            			   .attr("transform", "translate(" + (Toffset + radius) + "," + (Toffset) + ")");
	            	textContent.call(wrap, text, g, width, arrow_, radius);
	            }
                if(onChange)
	 	            onChange();
	          });
      }
     
      if(swatch_){
    	var editBL = grips.append("g")
	      .attr("transform", "translate(0, " + height + ")scale(" + scaleFactor*1.5 + ")")
      	  .on("mousedown", eventCancel)
	      .on("touchstart", eventCancel)
	      .on("click", eventCancel)
	      .call(resizeGripBL, g.node().parentNode, function(x, y){
	    	 
	    	  var t = g.node().transform.baseVal.getItem(0),
	    	  x1 = t.matrix.e + width,
	          y1 = t.matrix.f;
	
	    	  var zoomFactor = getZoomFactor(g);
	          var offsetX = (isIE? g.node().style.left.replace(/px$/, ""): 0);
	    	  var gripOffset = (isIE? 20 : 0);
	          width = Math.max(0, x1 - x)  - offsetX/zoomFactor + gripOffset;
	          height = Math.max(0, y - t.matrix.f) + gripOffset;
	      	  	
	          box.attr("d", textRect(Toffset, Toffset, width, height, false));
	          t.setTranslate(x1 - width, y1);
	          
	          resizeTL.attr("transform", "translate(" + (radius-radius*Math.cos(45)) + "," + (radius-radius*Math.sin(45)) + ")scale(" + scaleFactor*1.5 + ")");
	          deleteTR.attr("transform", "translate(" + (width-radius+radius*Math.cos(45)) + "," + (radius-radius*Math.sin(45)) + ")scale(" + scaleFactor*1.5 + ")");
	          resizeBR.attr("transform", "translate(" + (width-radius+radius*Math.cos(45)) + "," + (height-radius+radius*Math.sin(45)) + ")scale(" + scaleFactor*1.5 + ")");
	          editBL.attr("transform", "translate(" + (radius-radius*Math.cos(45)) + "," + (height-radius+radius*Math.sin(45))  + ")scale(" + scaleFactor*1.5 + ")");
	                
	          shadow.attr({width: width, height: height});
	          text = g.text();
	          textContent.call(wrap, text, g, width, arrow_, radius);
	          
              if(onChange)
 	            onChange();
	      });
      } else {
    	  var editBL = grips.append("g")
          	.attr("transform", "translate(" + (radius-radius*Math.cos(45)) + "," + (height-radius+radius*Math.sin(45))  + ")scale(" + scaleFactor*1.5 + ")")
          	.call(editGrip, function() {
              editText();
              if(onChange)
  	            onChange();

          	});
      }
      
      var editClick = "click.redline-edit-" + (++id),
          editTouchstart = "touchstart.redline-edit-" + id,
          w = d3.select(window).on(editClick, editCancel).on(editTouchstart, editCancel);
      function editCancel() {
        grips.remove();
        if (arrow_ || textOnly_) {
            box.style("stroke-opacity", 0);    	
        }
        g.on(click, edit);
        w.on(editClick, null).on(editTouchstart, null);
      }
      
      function editText() {
          if (arrow_ || textOnly_) {
              box.style("stroke-opacity", 1);    	
          }
          var text = g.text();
          var o = textRectParse(box.attr("d"), area_),
          	  	width = o.width,
		  		height = o.height,
		  		radius = o.radius;
		          
   	      var textContent = g.select('.redline-text');
          Ext.Msg.prompt(redline.z_TITLE, redline.z_MESSAGE_ENTER_TEXT, function(btnText, sInput) {
        	  if(btnText === 'ok'){
	           	if (textContent.empty()) {
           			if(!width || width < 80*scaleFactor){
     	        		width =  80*scaleFactor;
     	        		height =  80*scaleFactor;
     	        	}
     	            shadow.attr({width: width, height: height});
     	            box.attr("d", textRect(Toffset, Toffset, width, height, area_));
     	            textContent = g.append("text").attr({width: width-o.radius-2*fontSize, height: height-o.radius- 2*fontSize, x: width+o.radius+fontSize, y: height+o.radius+fontSize, "class": 'redline-text'}).text(sInput);
	           	} else {
	           		textContent.text(sInput); 
	           	}
	           	var color = box.style("stroke");
	          	textContent.style("stroke", color)
	          			   .style("fill", color)
            			   .style("font-size", (fontSize)+"px")
	                       .style("font-family", "Arial")
	                       .call(wrap, sInput, g, width, arrow_, radius);
        	  } 		   
          });
          text = g.text();
          editCancel();
       	  textContent.call(wrap, text, g, width, arrow_, radius);
       }
      }
  };

  return textbox;
}

/*
function textRect(width, height) {
  width = Math.abs(width), height = Math.abs(height);
  return "M0,0h" + width + "v" + height + "h" + -width + "z";
}
*/

function textRect(x, y, width, height, area_) {
	  width = Math.abs(width);
	  height = Math.abs(height);
	  
	  if(area_)
		  radius = Math.min(width, height)/5;
	  else
		  radius = 0;
	  
	  if(radius < 1)
		  return "M" + (x+5) + "," + (y+5) + "h" + width + "v" + height + "h" + -width + "z";
	  else
		  return "M" + (x+5) + "," + (y+5 +radius)
		    + "a" + radius + "," + radius + " 0 0 1 " + radius + "," + -radius
		    + "h" + (width - 2 * radius)
		    + "a" + radius + "," + radius + " 0 0 1 " + radius + "," + radius
		    + "v" + (height - 2 * radius)
		    + "a" + radius + "," + radius + " 0 0 1 " + -radius + "," + radius
		    + "h" + -(width - 2 * radius)
		    + "a" + radius + "," + radius + " 0 0 1 " + -radius + "," + -radius
		    + "v" + -(height - 2 * radius)
		    + "z";
	}

	function textRectParse(s, area_) {
	  s = s.replace(/M /g, "M");
	  s = s.replace(/ h /g, "h");
	  s = s.replace(/ v /g, "v");
	  s = s.replace(/ a /g, "a");
	  s = s.replace(/ Z/g, "");

	  //replace all space with , except for area
	  if(!area_)
	  	s = s.replace(/ /g, ",");

	  var parts = s.split(/[Mahvz,]/g);
	  
	  if(area_){
		  // 3050038 - support Windows 10 Edge browser
	     var isMSEdge = (window.navigator.userAgent.indexOf("Edge/") > 0 ? true : false);
		 if(isIE || isMSEdge){
			 var parts2 = (parts[2]).split(/[ ]/g);
			 return {width: (+parts[3])+2*(+parts2[0]), height: (+parts[5])+ 2*(+parts2[0]), radius: +parts2[0]};
		 } else 
			 return {width: (+parts[6])+2*(+parts[3]), height: (+parts[10])+ 2*(+parts[3]), radius: +parts[3]};
	  }else
		  return {width: +parts[3], height: Math.abs(+parts[4]), radius:0};
	}


function deleteGrip(selection, callback) {
    var g = selection.append("g")
        .attr("class", "delete")
        .on("touchstart", function() {
            d3.event.stopPropagation();
            if (confirm(redline.z_MESSAGE_DELETE)) {
                callback();
            }
        })
        .on("click", function() {
            d3.event.stopPropagation();
            if (confirm(redline.z_MESSAGE_DELETE)) {
                callback();
            }
        });
    g.append("circle").attr("r", gripRadius);
    g.append("path")
        .attr("d", deletePath)
        .attr("transform", "translate(-6,-6)scale(.4)");
}

function editGrip(selection, callback) {
    var g = selection.append("g")
        .attr("class", "edit")
        .on("touchstart", function() {
            callback();
        })
        .on("click", function() {
            callback();
        });
    g.append("circle").attr("r", gripRadius);
    g.append("path")
        .attr("d", editPath)
        .attr("transform", "translate(-5,-5)scale(.34)");
}

	
function resizeGrip(selection, relative, callback) {
  var drag = d3.behavior.drag()
      .on("dragstart", function() {
        stopPropagation();
        drag.on("drag", function() {
          var m = d3.mouse(relative);
          callback(m[0], m[1]);
        })
        .on("dragend", function() {
          drag.on("drag", null).on("dragend", null);
        });
      });
  var g = selection.append("g")
      .attr("class", "resize")
      .call(drag);
  g.append("circle").attr("r", gripRadius);
  g.append("path").attr("d", resizePath);
}

function resizeGripBL(selection, relative, callback) {
	  var drag = d3.behavior.drag()
	      .on("dragstart", function() {
	        stopPropagation();
	        drag.on("drag", function() {
	          var m = d3.mouse(relative);
	          callback(m[0], m[1]);
	        })
	        .on("dragend", function() {
	          drag.on("drag", null).on("dragend", null);
	        });
	      });
	  var g = selection.append("g")
	      .attr("class", "resize")
	      .call(drag);
	  g.append("circle").attr("r", gripRadius);
	  g.append("path").attr("d", resizePathBL);
}

var deletePath = "M20.826,5.75l0.396,1.188c1.54,0.575,2.589,1.44,2.589,2.626c0,2.405-4.308,3.498-8.312,3.498c-4.003,0-8.311-1.093-8.311-3.498c0-1.272,1.21-2.174,2.938-2.746l0.388-1.165c-2.443,0.648-4.327,1.876-4.327,3.91v2.264c0,1.224,0.685,2.155,1.759,2.845l0.396,9.265c0,1.381,3.274,2.5,7.312,2.5c4.038,0,7.313-1.119,7.313-2.5l0.405-9.493c0.885-0.664,1.438-1.521,1.438-2.617V9.562C24.812,7.625,23.101,6.42,20.826,5.75zM11.093,24.127c-0.476-0.286-1.022-0.846-1.166-1.237c-1.007-2.76-0.73-4.921-0.529-7.509c0.747,0.28,1.58,0.491,2.45,0.642c-0.216,2.658-0.43,4.923,0.003,7.828C11.916,24.278,11.567,24.411,11.093,24.127zM17.219,24.329c-0.019,0.445-0.691,0.856-1.517,0.856c-0.828,0-1.498-0.413-1.517-0.858c-0.126-2.996-0.032-5.322,0.068-8.039c0.418,0.022,0.835,0.037,1.246,0.037c0.543,0,1.097-0.02,1.651-0.059C17.251,18.994,17.346,21.325,17.219,24.329zM21.476,22.892c-0.143,0.392-0.69,0.95-1.165,1.235c-0.474,0.284-0.817,0.151-0.754-0.276c0.437-2.93,0.214-5.209-0.005-7.897c0.881-0.174,1.708-0.417,2.44-0.731C22.194,17.883,22.503,20.076,21.476,22.892zM11.338,9.512c0.525,0.173,1.092-0.109,1.268-0.633h-0.002l0.771-2.316h4.56l0.771,2.316c0.14,0.419,0.53,0.685,0.949,0.685c0.104,0,0.211-0.017,0.316-0.052c0.524-0.175,0.808-0.742,0.633-1.265l-1.002-3.001c-0.136-0.407-0.518-0.683-0.945-0.683h-6.002c-0.428,0-0.812,0.275-0.948,0.683l-1,2.999C10.532,8.77,10.815,9.337,11.338,9.512z";

var resizePath = "M-4,-2v-2h2 M-4,-4l8,8 M4,2v2h-2";

var resizePathBL = "M-4,2v2h2 M-4,4l8,-8 M4,-2v-2h-2";

var editPath = "M25.31,2.872l-3.384-2.127c-0.854-0.536-1.979-0.278-2.517,0.576l-1.334,2.123l6.474,4.066l1.335-2.122C26.42,4.533,26.164,3.407,25.31,2.872zM6.555,21.786l6.474,4.066L23.581,9.054l-6.477-4.067L6.555,21.786zM5.566,26.952l-0.143,3.819l3.379-1.787l3.14-1.658l-6.246-3.925L5.566,26.952z";

var movePath = "M-5,0H5 M0,-5V5 M-5,0l1,1 M-4,-1l-1,1l1,1 M4,-1l1,1l-1,1 M-1,-4l1,-1l1,1 M-1,4l1,1l1,-1";

function sourceEvent() {
  var e = d3.event, s;
  while (s = e.sourceEvent) {
      e = s;
  }
  return e;
}

function stopPropagation() {
  sourceEvent().stopPropagation();
}

function eventCancel() {
  var e = sourceEvent();
  e.stopPropagation();
  e.preventDefault();
}

function cross(a, b) { return a[0] * b[1] - a[1] * b[0]; }
function dot(a, b) { return a[0] * b[0] + a[1] * b[1]; }

//Based on https://github.com/mbostock/d3/issues/1642
function wrap(text, textString, g, width, arrow_, radius) {
    var numLeadingSpaces = (textString) ? textString.length - textString.replace(/^\s+/,"").length : 0;
    var leadingStr = "";
    var replacementStr = "";

    if (numLeadingSpaces > 0) {
        leadingStr =  textString.substring(0, numLeadingSpaces);
        for (var i=0; i<numLeadingSpaces; i++) {
            replacementStr += "#";
        }
        textString = textString.replace(textString.substring(0, numLeadingSpaces), replacementStr);
    }
    
    // do not wrap for arrowTextbox
    if(arrow_ && textString.length > 0){
		text.text(null).append("tspan")
    				   .attr("width", 160)
    				   .attr("height", 40)
    				   .attr("x", 0)
    				   .attr("dy", -140-fontSize/2)
    				   .text(textString);
    	return;
    }
    
    text.each(function() {
        var text = d3.select(this),
            words = (textString === null) ? [""]: textString.split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = 10 + fontSize,
			dy = g.node().transform.baseVal.getItem(0).matrix.f;
        
		var tspan = text.text(null).append("tspan").attr("x", 15 + radius).attr("y", y); 
      
        var firstWord = words[words.length-1];
        if (firstWord.substring(0, numLeadingSpaces) == replacementStr) {
            firstWord = firstWord.replace(replacementStr, leadingStr);
            words[words.length-1] = firstWord;
        }

        while (word = words.pop()) {
            line.push(word + " ");
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width - 15 - 2 * radius) {
            	//if only one word, do not wrap otherwise it will leave a empty line
            	if(line.length < 2){
            		line = [];
	                ++ lineNumber;
	                y += fontSize;
	                tspan = text.append("tspan")
			                    .attr("x", 15 + radius)
			                    .attr("y", y);
            	} else {
	                line.pop();
	                tspan.text(line.join(" "));
	                line = [word + " "];
	                ++ lineNumber;
	
	                y += fontSize;
	                tspan = text.append("tspan")
	                        .attr("x", 15 + radius)
	                        .attr("y", y)
	                        .text(word);
            	}
            }
        }
    });
}

function removeLabel(g){
	var label = g.select("text")[0][0];
	if(label)
		label.parentNode.removeChild(label);
}

function getZoomFactor(g){
	var zoomFactor = 1;
	if(isIE){
		try{
		    var defaultViewBox = d3.select("#defaultView").attr("viewBox").split(" ");
		    if (defaultViewBox.length === 1) {
		    	defaultViewBox = d3.select("#defaultView").attr("viewBox").split(",");
		    }
		    // find out the drawing's physical width, in inches
		    var physicalExtents = (Number(defaultViewBox[2]) - Number(defaultViewBox[0]));
		    zoomFactor = physicalExtents/g.node().ownerSVGElement.viewBox.baseVal.width;
		} catch(e){
			//do nothing
		}
	}
	
    return zoomFactor;
}

})(redline = {});
