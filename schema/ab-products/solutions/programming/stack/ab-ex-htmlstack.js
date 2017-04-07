/**
 * Called by ab-ex-htmlstack.axvw.
 */
var stackController = View.createController('stack', {
	stack: null,
	
	restriction: null,

	/**
	 * After initial data fetch, initialize and show the stack.
	 */
	afterInitialDataFetch: function() {
		var control = this;
				
		var config = new Ab.view.ConfigObject({

			stackOrientation: control.getOrientation(),			  		// HORIZONTAL or VERTICAL. Whether to arrange the buildings stacked horizontally next to each other or vertically one on top of another.

			displayFloorHeight: control.getDisplayFloorHeight(),  		// 10. The floor height, in user-display units, used to draw the stack plan. 
																  		
			buildings: [],										  		// The list of buildings to display in the stack.  e.g. { "HQ", "BOSMED" }. The stack diagram starts empty for every session. 
															
			groupDatasourceView: 'ab-ex-htmlstack.axvw',				// The view (.axvw) file holding the datasource that drive this stack diagram.

			groupDatasource: 'abExHtmlStackDs_gp',						// The datasource used for drawing the floor outline, the roof outline, and each stack group (e.g. a query on the gp table).


			buildingDatasourceView: 'ab-ex-htmlstack-stats-bl.axvw', 	// The view (.axvw) file holding the datasource for the building profile

			buildingDatasource: 'abExHtmlStackStatsDs_bl',				// The datasource for the building profile

			
			floorDatasourceView: 'ab-ex-htmlstack-stats-fl.axvw',   	// The view (.axvw) file holding the datasource for the floor statistics

			floorDatasource: 'abExHtmlStackStatsDs_fl',					// The datasource for the floor statistics

			
			portfolioScenario: 'Headquarters Baseline',					// e.g. "3434 - Marlborough Expansion". This is the gp.portfolio_scenario value to restrict the query on the group table on to get just groups for the current scenario.

			asOfDate: '2020-03-04',												// The date for which to draw the stack diagram. The control passes this date to the query that returns the Group data, as groups have start and end dates for their allocation. The control also passes this date to the OnDrop and OnClick event callbacks, as the callback needs this date to update the group record according to the date the action (e.g. a move, a lease signing) happened.
				
			tooltipHandler: control.onTooltip,							// tooltip handler
			
			dropHandler: control.onDrop,								// drop handler
			
			clickHandler: control.onClickItem,							// click handler
			
			rightClickHandler: control.onRightClickItem					// right click handler
		});
   	 
    	this.stack = new Ab.stack.HtmlStack('stackContainer', config);
	
    	this.showSomeDefaultBuildingsOnLoad();
	},

	/**
	 * Show some buildings when the view first loads.
	 */
	showSomeDefaultBuildingsOnLoad: function() {
    	this.stack.config.buildings = this.getSelectedBuildings(); 	    	    	
    	this.stack.refresh(this.getRestriction());
    },   
    
    /**
     * Build the stack.  If any settings have change, apply those changes.  By default, build() does not requery the database, as these are only cosmetic settings.
     */
	build: function() { 
		var stack = this.stack; 
    	stack.config.stackOrientation = this.getOrientation();
    	stack.config.displayFloorHeight = this.getDisplayFloorHeight();
    	stack.config.showXAxis = this.getShowXAxis();
    	stack.config.showHighlightFloor = this.showHighlightFloor();
    	stack.config.horizontalScale = this.getHorizontalScale();   	
    	stack.stackControl.labelLargeTextHeight = this.getLabelLargeTextHeight();
    	stack.stackControl.labelSmallTextHeight = this.getLabelSmallTextHeight();
    	
    	stack.build();  	
    },
    
    getRestriction: function() {
    	return this.restriction;
    },
    
    /**
     * Called the user checks or unchecks a building in the console.  Demonstrates addBuilding() and removeBuilding() API.
     */
    changeNumberOfBuildings: function(checkbox) {
    	var blId = checkbox.value;
    	if (checkbox.checked) {
    		
    		// addBuilding API
    		this.stack.addBuilding(blId);
    	} else {
    		
    		// removeBuilding API
    		this.stack.removeBuilding(blId);   		
    	}    	
    }, 
        
    /**---------------------------- Event handlers ------------------------------------------------------------**/   
    /**
     * Click handler.
     */
    onClickItem: function(item) {    	
    	var msg = 'Building: ' + item['gp.bl_id'] + '\n';
    		msg +=    'Floor:    ' + item['gp.fl_id'] + '\n';
    		msg += 	  'Group:    ' + item['gp.gp_id'] + '\n';
    		msg +=    "Click" + '\n';
    	alert(msg);
    },
    
    /**
     * Right-click handler.
     */
    onRightClickItem: function(item) {   	
    	var msg = 'Building: ' + item['gp.bl_id'] + '\n';
    		msg +=    'Floor:    ' + item['gp.fl_id'] + '\n';
    		msg += 	  'Group:    ' + item['gp.gp_id'] + '\n';
    		msg +=    "Right-click" + '\n';
    	alert(msg);
    },
    
    /**
     * Tooltip handler.
     */
    onTooltip: function(item) {
    	var str = "<strong>ID:</strong> " + item['gp.gp_id'] + "</span>";
			str += "<br/><strong>Building:</strong> " + item['gp.bl_id'] + "</span>";
			str += "<br/><strong>Floor:</strong> " + item['gp.fl_id'] + "</span>";
    		str += "<br/><strong>Division:</strong> <span>" + item['gp.dv_id'] + "</span>";
    		str += "<br/><strong>Type:</strong> <span>" + item['gp.allocation_type'] + "</span>"; 
    		str += "<br/><strong>Order:</strong> " + item['gp.sort_order'] + "</span>";
    		str += "<br/><strong>Color:</strong> " + item['dv.hpattern_acad'] + "</span>";
    		str += "<br/><strong>Area:</strong> " + item['gp.area_manual'] + "</span>";
    	return str;
    },
    
    /**
     * Drop handler.  Demonstrates refresh() API, which does requery the database.
     */
    onDrop: function(obj) { 
	
    	var recordToUpdate = obj.sourceRecord,
    		targetRecord = obj.targetRecord,
    		previousRecord = obj.previousRecord;
    		
    	// get record by id
    	var rest = new Ab.view.Restriction();
    	rest.addClause('gp.gp_id', recordToUpdate['gp.gp_id']);
    	var records = View.dataSources.get('abExHtmlStackDs_gp').getRecords(rest);

    	// update record with new values
    	try {
    		if (records.length > 0) {
    			
    			// update the bl, fl, and fl sort order
    			var record = records[0];
    			record.isNew = false;			
    	    	record.setValue('gp.bl_id', targetRecord['gp.bl_id']);
    	    	record.setValue('gp.fl_id', targetRecord['gp.fl_id']);
    	    	record.setValue('fl.name', targetRecord['fl.name']);
    	    	record.setValue('fl.sort_order', targetRecord['fl.sort_order']);
    	    	
    			// if there is a group before the target, calculate and use midpoint. Otherwise, if this is first group, use same sort order - 1
    			var targetOrder = targetRecord['gp.sort_order'];
    			var midpoint = targetOrder;
    			if (obj.previousRecord != null) {
    				var previousOrder = previousRecord['gp.sort_order'];
    				midpoint = (Number(previousOrder) + Number(targetOrder)) / 2;                 		
    			} else {
    				midpoint = targetOrder- 1;
    			}	   			
    	    	record.setValue('gp.sort_order', midpoint);

    	    	// save record
    	    	View.dataSources.get('abExHtmlStackDs_gp').saveRecord(record);
    	    	
    	    	// refresh stack
    	    	stackController.stack.refresh(stackController.restriction);
    		}		
    	} catch (e) {
    		alert(e.message);		
    	}
    },
       
    /**---------------------- Configurable settings from console ---------------------------------------**/    
    getOrientation: function() {
    	var orientation = 'VERTICAL';
    	if (document.getElementById("HORIZONTAL").checked) {
    		orientation = 'HORIZONTAL';
    	} else {
    		orientation = 'VERTICAL';
    	}
    	
    	return orientation;
    },

    getSelectedBuildings: function() {
    	var layouts = document.getElementsByName('buildings');
    	var buildings = [];
    	for (var i=0; i<layouts.length; i++) {
    		if(layouts[i].checked) {
    			buildings.push(layouts[i].value);
    		}
    	}

    	return buildings;
    },
    
    getDisplayFloorHeight: function() { 
    	return Number(document.getElementById("displayFloorHeight").value);
    },

    getLabelLargeTextHeight: function() { 
    	return Number(document.getElementById("labelLargeTextHeight").value);
    },

    getLabelSmallTextHeight: function() { 
    	return Number(document.getElementById("labelSmallTextHeight").value);
    },
    
    getShowXAxis: function() { 
    	return document.getElementById("showXAxis").checked;
    },
    
    showHighlightFloor: function() { 
    	return document.getElementById("showHighlightFloor").checked;
    },
    
    zoomInV: function(){
    	// increase by 20%
    	var value = Math.round(document.getElementById("displayFloorHeight").value * 1.20);
    	
    	// round to even number
    	value = 2 * Math.round(value / 2); 
    	    	
    	document.getElementById("displayFloorHeight").value = value;
    	this.build();
    },

    zoomOutV: function(){
    	// decrease by 20%
    	var value = Math.round(document.getElementById("displayFloorHeight").value * .8);
    	
    	// place constraints on how much you can zoom out  (ie. cannot be less than the label size or the default display height, for example) 
    	value = Math.max(value, 12);
    	
    	// round to even number
    	value = 2 * Math.round(value / 2);   	
    	
    	document.getElementById("displayFloorHeight").value = value;
    	this.build();	
    },

    zoomInH: function(){
    	document.getElementById("horizontalScale").value = Math.round( (Number(document.getElementById("horizontalScale").value) + 0.10) * 100) / 100 ;
    	this.build();
    },

    zoomOutH: function(){
    	document.getElementById("horizontalScale").value = Math.max(Math.round( (Number(document.getElementById("horizontalScale").value) - 0.10) * 100) / 100, 1) ;
    	this.build();	
    },
    
    getHorizontalScale: function() { 
    	return document.getElementById("horizontalScale").value;
    },
    
    omitVertsAndServs: function() { 
    	
    	var showUnavailable = document.getElementById("omitVertsAndServs").checked;
    	if (showUnavailable) {
        	var restriction = new Ab.view.Restriction();
        	restriction.addClause('gp.allocation_type', 'Unavailable - Vertical Penetration Area', '!=', 'AND'); 
        	restriction.addClause('gp.allocation_type', 'Unavailable - Service Area', '!=', 'AND');
        	
        	this.restriction = restriction;    		
    	} else {
    		this.restriction = null;
    	} 

    	this.stack.refresh(this.restriction);
    },
    
    /**
     * Generate PPT button.
     */
    generatePPT: function() {    	    	
    	this.stack.getImageBytes(this.afterGetImageBytes.createDelegate(this));    	
    },
    
    /**
     * Callback.  After the image bytes are retrieved, feed them to the PPT wf, and restore the image contents on screen.
     */
    afterGetImageBytes: function(imageBytes, nodesToRemove, nodesToRecover) {
    	
    	var slides = [];
    	var title = $('viewToolbar_title').innerHTML;
    	slides.push({'title': title,'images':[imageBytes]});  
		
   	 	var jobId = Workflow.startJob('AbSystemAdministration-generatePaginatedReport-generatePpt', slides, {});
    	var control = this;
   	 	View.openJobProgressBar("Please wait...", jobId, null, function(status) {
	   		var url  = status.jobFile.url;
   			window.location = url;
   			
   			// restore image content on screen
   			control.stack.restoreContent(nodesToRemove, nodesToRecover);
	   	}); 
    }   
});