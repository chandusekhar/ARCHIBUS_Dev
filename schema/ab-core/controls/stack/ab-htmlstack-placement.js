/*
Copyright (c) 2015, ARCHIBUS Inc. All rights reserved.
Author: Emily Li
Date: April, 2015
*/
(function(stackplacement) {
	
stackplacement.drag = function(divId, dataRaw, canDrag, groupDataSourceConfig, canDrop, isValidTarget) {
  var dragging = null,
  	  body = d3.select("body"),
  	  event = d3.dispatch("drop"),
  	  original,
  	  originalPos =[0,0];
    
  var drag = d3.behavior.drag()
      .on("dragstart", function(d) {

    	  if (canDrag(d, groupDataSourceConfig) === false) {
    		  return;
    	  }
    	  
    	  var clone = this.cloneNode(true),
    	  	bbox = d3.select(this).select('.graph-rect').node().getBBox();
    	  	point = [this.getBoundingClientRect().left, this.getBoundingClientRect().top];
    	  	    	  
    	  original = this;
    	  originalPos = point;
    	     	  	
    	  //d3.select(this.ownerSVGElement).classed({'sepia': true});
    	  d3.select(this).classed({'selected': true});
    	  
    	  d3.select(clone).classed({'drag': true}).attr("transform", null);							
    	  
    	  dragging = d3.select("body").append("svg")
    	  	.classed({"dragging": "true"})
    	  	.attr("width", Math.round(bbox.width))
    	  	.attr("height", Math.round(bbox.height))
    	  	.style("position", "absolute")
    	  	.style("pointer-events", "none")
    	  	.style("left", point[0] + 'px')
    	  	.style("top", point[1] + 'px')
    	  	.style("font-family", "Arial")

    	  d3.select(clone).select(".graph-rect")
    	  	.style("stroke", "#000")
    	  	.style("stroke-width", "2")
    	  	.style("opacity", "0.8")    	  	
    	  
    	  dragging
    	    .classed({'shadow' : true})
    	  	.node()
    	  	.appendChild(clone);
      })
      .on("drag", function(d) {

    	  var stackContainer = d3.select('#' + divId);
    	  if (canDrag(d, groupDataSourceConfig) === false) {
    		  body.style("cursor", "not-allowed");
    		  return;
    	  }
    	  
    	  var bodyNode = d3.select("body").node(),
    	  	point = (d3.touch(bodyNode)) ? d3.touch(bodyNode) : d3.mouse(bodyNode),
    	  	targetEl = document.elementFromPoint(point[0], point[1]),
    	  	target = d3.select(targetEl);
    	  	
    	  var isTarget = false;
    	  
    	  if (!target.empty() && target.attr("class") != null) {
    		  if (target.attr("class").indexOf("graph-rect") > -1  && targetEl != d3.select(this).select(".graph-rect").node() && isValidTarget(target, groupDataSourceConfig) === true) {
    			  isTarget = true;
    		  }	  
    	  }
    	  
    	  dragging
    	  	.style("left", point[0] + 'px')
    	  	.style("top", point[1] + 'px');

    	  // change cursor
          if(target.empty() || target.attr("class") == null || isTarget == false) {
        	  body.style("cursor", "not-allowed");
          } else {
        	  body.style("cursor", "default");
          }
      })
      .on("dragend", function(d) {
	      	  
    	  if (dragging == null) {
        	  var stackContainer = d3.select('#' + divId);
        	  body.style("cursor", "default");
        	          	  
    		  return; 
    	  }    	  
    	  
    	  //d3.select(this.ownerSVGElement).classed({'sepia': false});
          var rect = document.body.getBoundingClientRect(),
            stackContainer = d3.select('#' + divId),
          	point = (d3.touch(document.body)) ? d3.touch(document.body) : d3.mouse(document.body),
          	draggingLeft = dragging.style("left").replace("px", ""),
          	draggingTop = dragging.style("top").replace("px", ""),      
          	targetEl = document.elementFromPoint(point[0], point[1]),
          	target = d3.select(targetEl);
          
          // change cursor back to default
          body.style("cursor", "default");
          
          // if dropped onto invalid target or dropped onto "itself", do not proceed further
          if(target.empty() || target.attr("class") == null || targetEl == d3.select(this).select(".graph-rect").node() || isValidTarget(target, groupDataSourceConfig) === false) {
        	  dragging
				.transition()
				.duration(200)
				.ease("linear")
				.each("end", function(){
					d3.select(this)
						.transition()
						.style({
							left: original.getBoundingClientRect().left + "px",
							top:  original.getBoundingClientRect().top + "px"
						})
						.each("end", function(){
							d3.select(original).classed({'selected': false});
							d3.select(this)
							.transition()
							.delay(0)
							.remove();
						})				
				})

        	  return;
          }        
          
          if (target.attr("class").indexOf("graph-rect") > -1){        	  
        	  var targetX = draggingLeft,
        	  	targetY = draggingTop,
        	  	targetRow = target.attr("row"),
        	  	targetCol = target.attr("col");
              
              var targetStackNumber = target.attr("stackNumber");
        	        	  
        	  var sourceRect = dragging.select("rect")
        	  	.attr("x", targetX)
        	  	.attr("y", targetY)
        	  	.style("opacity", null);
        	  
        	  var sourceNode = dragging.select("g").node();
        	          	  
        	  var source = d3.select(this).select(".graph-rect");
              var sourceRow = source.attr("row");
              var sourceCol = source.attr("col");
              var sourceStackNumber = source.attr("stackNumber");           
              
              var srcRecords = dataRaw[sourceStackNumber-1];
              // var srcRecords = eval("records" + (sourceStackNumber));
              var targetRecords = dataRaw[targetStackNumber-1]
              // var targetRecords = eval("records" + (targetStackNumber)); 
              
              var sourceNumber = source.attr("recordNumber");
              var sourceRecord = srcRecords[sourceNumber];

              var targetNumber = target.attr("recordNumber");
              var targetRecord = targetRecords[targetNumber];

              var previousRow = target.attr("row"),
              	previousCol = target.attr("col")-1,
              	previous = d3.select(targetEl.ownerSVGElement).selectAll(".row" + previousRow + " ").filter( '.col' + previousCol);
             
              var previousRecord = null;
              if (!previous.empty()) {
                  previousRecord = targetRecords[previous.attr("recordNumber")];            	  
              }
             
        	  dragging.remove();      	        	  
        	  
        	  event.drop.call(targetEl, {
    			  'targetEl': targetEl,
    			  'targetRecord': targetRecord,
    			  'sourceRecord': sourceRecord,
    			  'previousRecord': previousRecord,
    			  'targetStackNumber': targetStackNumber,			
    			  'targetRecordNumber': targetNumber,				
    			  'sourceRecordNumber': sourceNumber,	
    			  'sourceStackNumber': sourceStackNumber			
    	  });   	  
       } else {
    	  dragging.remove(); 
       }
      });
  return d3.rebind(drag, event, "on");

};

})(stackplacement = {});
