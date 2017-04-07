/**
 * Holds the functionality for filter and rooms highlight.
 * Contains the room selector control.
 * 
 * @author   Ying Qin
 * @version  22.1
 * @date     5/2015
*/
var FilterHighlight = Base.extend({

    //user define config for color picker's appearance
    config: {},
    
    // svg drawing control
    control: null,
    
    //room selector control
    roomSelector: null,
    
	// possible values: default, selectRooms, filterRooms
    selectRoomsMode: 'default',
	
    // row index when user click on the edit button of the additional highlight control
    editRowIndex: -1,
    
    grid: null,
	
	rows: [],
	
	highlightedRoomColors: {},
	
	pendingRoomColors: {},
	
	oldColors: {},
	
    /**
     * Constructor.
	 * @param config configObject
	 * @param control the svg drawing control object
     */
    constructor: function(config, control) {

    	this.config = config;
    	
    	this.panel = View.panels.get("filterHighlightPanel");
    	
    	this.control = control;
    	
    	if(!this.grid)
    		this.setup();
    	
    	this.addActions();
    },
    
	/**
	 * add save and upload image actions to svg panel.
	 */
	addActions: function(){
		var control = this.control;
		this.panel.addAction({
         		id: this.Z_FILTERROOMACTION_ID,
         		text: Ab.view.View.getLocalizedString(this.Z_FILTERROOMACTION_TEXT) 
	     }); 
		var controller = View.controllers.get("filterHighlightCtrl");
		var fn = controller.onLoadFilterRoomsDialog.createDelegate(controller, [controller]);
		this.panel.addActionListener(this.Z_FILTERROOMACTION_ID, fn, control);
		
		this.panel.addAction({
     		id: this.Z_SELECTROOMACTION_ID,
     		text: Ab.view.View.getLocalizedString(this.Z_SELECTROOMACTION_TEXT) 
		}); 
		var fn = this.loadRoomSelector.createDelegate(this, [this]);
		this.panel.addActionListener(this.Z_SELECTROOMACTION_ID, fn, control);
	
	},
    
	
    /**
     * show the specified action
     */
    showAction: function(actionId, show){
    	var action = this.panel.actions.get(actionId);
    	if(action) {
            action.render(show);
            action.enableButton(show);
    	}
    },
    /**
     * loop through the filters and add them into grid.
     * 
     * filter can be passed from either client config or loaded from highlight_def field.
     */
    loadFilters: function(){
    
    	if(this.config.filter && this.config.filter.length > 0){
    		
    		// clear the grid entries
    		this.clear();

	    	for(var i=0; i < this.config.filter.length; i++){
    			var filterJson = this.config.filter[i];
    			
    			if(filterJson.type == 'filterRooms'){
    				// add filter room entry
    				this.onFilterRooms(filterJson, -1);
    			} else if (filterJson.type == 'selectRooms'){
    				this.selectRoomsMode = 'selectRooms';
    				
    				var roomSelected = {"title": filterJson.title, "color": filterJson.color};
   		    		roomSelected["rooms"] = filterJson['rooms'];
   		    		roomSelected["selectRoomsMode"] = 'selectRooms';
   		    		roomSelected['filterJson'] = filterJson;
    		    		
   		    		this.addOrUpdateRow(roomSelected, -1);
   		    		
   		    		for(var j =0; j < filterJson['rooms'].length; j++){
   		    			var assetId = filterJson['rooms'][j];
   		    			var asset = this.control.getSvgControl().getAssetById(assetId);
   		    			if (asset) {
   		    				this.addHighlight(asset, "#" + filterJson.color)
   		    			}       		    		
   		    		}
   		    		
   		    		this.commitPendingHighlights();
   		    		this.control.redlineControl.getControl().setCurrentColor(filterJson.color);
    			}
    		}
	    	this.control.selectRoomsMode = 'default';
    		this.removeAllBorders();
    	}
    },
    
    /**
     * set up the grid to hold all the filters.
     */
    setup: function(){
    	
    	this.config['groupIndex'] = 0;
    	this.config['viewDef'] = '';

    	var control = this.control;
    	
    	this.config["columns"] = [
    	            new Ab.grid.Column('highlightTitle', '', 'text', null, null, 1, "60%"),
    	       	    new Ab.grid.Column('highlightColor', '', 'color', null, null, 1, "10px"),
   	                new Ab.grid.Column('editHighlight', '', 'button', this.onEdit.createDelegate(this, [control], 2), null, 1, "25px"),
    	       	    new Ab.grid.Column('deleteHighlight', '', 'button', this.onDelete.createDelegate(this, [control], 2), null, 1, "25px")];

    	this.config.columns[1].legendKey = "true";
    	this.config.columns[2].text = Ab.view.View.getLocalizedString(this.Z_EDIT_BUTTON);
    	this.config.columns[3].text = Ab.view.View.getLocalizedString(this.Z_DELETE_BUTTON);
        
    	this.config.rows = this.rows;
    	
    	this.grid = new Ab.grid.ReportGrid('filterHighlightDiv', this.config);
    },

    /**
     * clear the grid
     */
    clear: function(){
    	this.rows = [];
    },
    
    /**
     * add or update the row for the updated selected rooms list
     */
    addOrUpdateRow: function(roomSelected, rowIndex){
    	
    	var firstTimeBuild = (!this.rows || this.rows.length < 1);
    	
    	var row = {};
    	if(rowIndex >= 0)
    		row = this.rows[rowIndex];
    	
    	row['highlightTitle'] = roomSelected.title;
    	row['highlightColor'] = '0x' + roomSelected.color;
    	row["selectRoomsMode"] = roomSelected.selectRoomsMode;
    	
    	if(roomSelected['selectRoomsMode'] == 'filterRooms'){
    		row['restrictions'] = roomSelected["restrictions"];
    		row['highlightRooms'] = this.getHighlightRooms(roomSelected.restrictions);
    	} else {
    		row['restrictions'] = this.composeSelectRoomRestrictions(roomSelected.rooms);
    		row['highlightRooms'] = roomSelected.rooms;
        }
    	
    	row['filterJson'] = roomSelected['filterJson'];
    	if(rowIndex >= 0){
    		this.rows[rowIndex] = row;
    		if(this.rows.length == 1)
    			this.grid.addRows(this.rows);
	    	this.grid.build();
    	} else {
    		this.grid.removeRows(0);
    		this.rows.push(row);
	    	this.grid.addRows(this.rows);
	    	this.grid.build();
	            
	        //remove header
	    	if(firstTimeBuild)
	    		this.grid.removeRow(0);
    	}
    	
    	return row['highlightRooms'];
    },
    
    /**
     * get highlight json for all the filters.
     */
    getHighlightJSON: function(){
    	var highlightJson = [];
    	
    	for(var i = 0 ; i <this.rows.length; i++){
    		var row = this.rows[i];
    		if(row["selectRoomsMode"] == 'filterRooms' || row["selectRoomsMode"] == 'selectRooms'){
    			var filter = row['filterJson'];
    			if(filter)
    				highlightJson.push(filter);
    		}
    	}
    	
    	return highlightJson;
    },
    
    /**
     * retrieve a list of rooms from the specified restriction which is set when the filter row is created.
     */
    getHighlightRooms: function(restrictions){
    	
    	var records = this.control.svgData.getRecords('rm', restrictions);
		var rooms = new Array();
    	for (var i = 0; i < records.length; i++){
    		var record = records[i];
    		rooms.push(record.getValue("rm.bl_id") + ";" + record.getValue("rm.fl_id") + ";" + record.getValue("rm.rm_id"))
		}
    	return rooms;
    },
    
    /**
     * create SQL restriction clause based on the room list keys.
     */
    composeSelectRoomRestrictions: function(rooms){
    	var restrictions = new Ab.view.Restriction();
    	var roomsList = '';
    	for(var i = 0; i < rooms.length; i++){
    		var pkeys = rooms[i].split(";");
    		if(i==0){
    			restrictions.addClause("rm.bl_id", pkeys[0]);
    			restrictions.addClause("rm.fl_id", pkeys[1]);
    			roomsList =  "('" + pkeys[2] + "'";
    		} else if(i == rooms.length -1){
    			roomsList += ",'" + pkeys[2] + "')";
    		} else {
    			roomsList += ",'" + pkeys[2] + "'";
    		}
    	}
		restrictions.addClause("rm.rm_id", roomsList, "IN", "AND");

    	return restrictions;
    },
    
    /**
     * event when user click on delete button of the filter/select rooms.
     */
    onDelete: function(row, button, control){
    	if(control.filterHighlight.rows){
    		if (row.index > -1) {
    			
    			var rows = control.filterHighlight.rows;
    			rows.splice(row.index, 1);
    			control.filterHighlight.grid.removeRows(0);
    			control.filterHighlight.rows = rows;
    			control.filterHighlight.grid.addRows(rows);
    			control.filterHighlight.grid.build();
    			
    			var highlightColor = row.highlightColor;
    			if (highlightColor.substr(0,2) == '0x') {
    				highlightColor = "#" + highlightColor.substr(2);
			    }
    			control.filterHighlight.clearHighlightedRooms(row.highlightRooms);
    			control.hasUnsavedChanges = true;
    		}
    	}
		control.filterHighlight.unloadRoomSelector();
		control.enableActions(true, true);
    },

   
    /**
     * event when user click on edit button of the filter/select rooms.
     */
    onEdit: function(row, button, control){

    	var highlightControl = this;
    	View.confirm(Ab.view.View.getLocalizedString(this.Z_CONFIRMMSG_CLEARHIGHLIGHT), function(button) {
    		if (button == 'yes') {
    			highlightControl.clearHighlightedRooms(row["highlightRooms"]);
    			row["highlightRooms"] = [];
    			
    	    	var highlightColor = row.highlightColor;
    	    	if (highlightColor.substr(0,2) == '0x') {
    	    		highlightColor = highlightColor.substr(2);
    	        }

    	    	if(row.selectRoomsMode == 'selectRooms'){
    	    		highlightControl.loadRoomSelector(row.index);
    	    		highlightControl.roomSelector.jsColor.fromString(highlightColor);
    				document.getElementById("highlightTitle").value = row.highlightTitle;
    		    	control.enableActions(false, true);
    	    	} else {
    	    		control.enableActions(false, true);
    	    		highlightControl.unloadRoomSelector();

    				var controller = View.controllers.get("filterHighlightCtrl");
    	    		controller.editRowIndex = row.index; 
    				controller.onLoadFilterRoomsDialog(row['filterJson'], row.index);

    	    	}

    	    	control.editRowIndex = row.index;
    	   		control.selectRoomsMode = row.selectRoomsMode;
    		
    		} else {
    			return;
    		}
		});
    	
    },
    
    /**
     * Event when user click on the filter room action
     */
    onFilterRooms: function(filters, editRowIndex){
    	
    	this.unloadRoomSelector();

    	filters['type'] = "filterRooms";
		this.selectRoomsMode = 'filterRooms';
    	
    	var roomSelected = {"title": filters.title, "color": filters.color};
    	roomSelected["restrictions"] = this.composeFilterRestriction(filters);
    	roomSelected["selectRoomsMode"] = 'filterRooms';
    	roomSelected["filterJson"] = filters;
    	roomSelected["oldColors"] = [];
    	this.editRowIndex = editRowIndex;
    	var rooms = this.addOrUpdateRow(roomSelected, this.editRowIndex);
    	if(!rooms || rooms.length <1){
    		return;
    	}
    	roomSelected["rooms"] = rooms; 
    	for(var i = 0; i < rooms.length; i++){
    		var assetId = rooms[i];
        	var asset = this.control.control.getAssetById(assetId);
    		if (!asset.empty()) {
    			this.saveOldColor(this.rows.length-1, assetId, d3.select(asset.node()).style("fill"));
    			this.addHighlight(asset, "#" + roomSelected['color']);
    		}
    	}
    	
		this.commitPendingHighlights();

		this.selectRoomsMode = 'default';
		this.control.showLegend(true);
		this.control.redlineControl.getControl().setCurrentColor(filters.color);
		
		this.control.hasUnsavedChanges = true;
    },
    
    /**
     * compse the SQL restriction based on the filter criteria
     */
    composeFilterRestriction: function(filters){

    	var restrictions = new Ab.view.Restriction();
    	
    	restrictions.addClause("rm.bl_id", this.config.pkeyValues["bl_id"]);
    	restrictions.addClause("rm.fl_id", this.config.pkeyValues["fl_id"]);
		
    	if(filters.dv_id)
    		restrictions.addClause("rm.dv_id", filters.dv_id);
		
    	if(filters.dp_id)
    		restrictions.addClause("rm.dp_id", filters.dp_id);
		
    	if(filters.rm_cat)
    		restrictions.addClause("rm.rm_cat", filters.rm_cat);
		
    	if(filters.rm_type)
    		restrictions.addClause("rm.rm_type", filters.rm_type);
		
    	if(filters.rm_std)
    		restrictions.addClause("rm.rm_std", filters.rm_std);
		
    	if(filters.area)
    		restrictions.addClause("rm.area", filters.area, ">=");
		
    	if(filters.cap_em)
    		restrictions.addClause("rm.dv_id", filters.cap_em, ">=");
    	
    	return restrictions;
		
    },
    
    /**
     * loads room selector
     */
    loadRoomSelector: function(editRowIndex){
    	this.control.editRowIndex = (editRowIndex ? editRowIndex : -1);
		this.roomSelector = new RoomSelector(this.control);
 		this.control.enableActions(false, true);
		this.showAction(this.Z_SELECTROOMACTION_ID, false);

    },
    
    /**
     * remove room selector
     */
    unloadRoomSelector: function(){
    	if(this.roomSelector){
    		this.roomSelector.remove();
    		this.roomSelector = null;

        	this.selectRoomsMode = 'default';
    		this.showAction(this.Z_SELECTROOMACTION_ID, true);
    	}
    },
    
    /**
     * remove the hatch pattern borders for selected or filtered rooms
     */
    removeAllBorders: function(){
    	d3.select('#' + this.control.divId + "-svg")
    		.select("#rm-assets")
    		.selectAll('*')
    	 	.filter( function() { return (this.parentNode.id === "rm-assets" && this.id.indexOf("border-") > -1); } )
            .remove();
    },
    
    /**
     * set room highlight color and add the border.
     */
	addHighlight: function(asset, highlightRoomColor){
	    	
	    	var svg = d3.select('#' + this.control.divId + "-svg");
	    	var defs = svg.select('defs');
	    	// add hatch definition
	    	if(defs.select("#diagonalHatch").empty()){
		    	var g = defs.append('pattern')
						    .attr('id', 'diagonalHatch')
						    .attr('patternUnits', 'userSpaceOnUse')
						    .attr('width', 4)
						    .attr('height', 4)
						    .append('path')
						    .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
						    .attr('stroke', '#000000')
						    .attr('stroke-width', 1);
	    	}
	    	
	    	var assetId = asset.attr("id");
	    	var borderAsset = document.getElementById("border-" + assetId);
	    	if(borderAsset){
	    		var savedColors = this.pendingRoomColors[assetId];
				if(savedColors && savedColors.length > 1){
					//do not remove the border if the old color has border (pending highlights) 
					if(!savedColors[2])
						asset.node().parentNode.removeChild(borderAsset);
	        		d3.select(asset.node()).style("fill", savedColors[1]);
	    	    	delete this.pendingRoomColors[assetId];
	    		} else {
	    			savedColors = this.highlightedRoomColors[assetId];
	    			if(savedColors && savedColors.length > 1){
	    				if(!savedColors[2])
	    					asset.node().parentNode.removeChild(borderAsset);
	            		d3.select(asset.node()).style("fill", savedColors[1]);
	            		delete this.highlightedRoomColors[assetId];
	    			} else {
		            	var oldColor = d3.select(asset.node()).style("fill");
		            	d3.select(asset.node()).style("fill", highlightRoomColor);
		            	//true indicate old color has border
		            	this.pendingRoomColors[assetId] = [highlightRoomColor, oldColor, true];
		            	if(this.highlightedRoomColors[assetId])
		            		delete this.highlightedRoomColors[assetId];
	    			}
	    		}
	    	} else {
	
		    	var centroid = this.control.getSvgControl().getCentroid(asset);
		    	var bBox = this.control.getSvgControl().getBBox(asset);
		    	var scale = ( bBox.width > bBox.height ?  (bBox.width + 20)/bBox.width: (bBox.height + 20)/bBox.height);
		    	var clone = asset.node().cloneNode(true);
		    	var border = d3.select(asset.node().cloneNode(true))
		    				  .attr("id", "border-" + asset.attr("id"))
		    				  .attr("transform", "translate( " + (-centroid[0] * (scale-1)) + ", " + (-centroid[1]* (scale-1)) + ") scale(" + scale + ")")
				  			  .style("stroke-opacity", 0)
		    				  .style("fill", "url(#diagonalHatch)");
		    	
		    	// append to the end of the rooms to avoid line overlap.
		    	var parentNode = asset.node().parentNode;
		    	parentNode.removeChild(asset.node());
		    	parentNode.appendChild(border.node());
		    	parentNode.appendChild(asset.node());
	
		    	var oldColor = d3.select(asset.node()).style("fill");
		    	d3.select(asset.node()).style("fill", highlightRoomColor);
	        	//false indicate old color has no border
	        	this.pendingRoomColors[assetId] = [highlightRoomColor, oldColor, false];
	    	}
	    },
	    
	    /**
	     * calls when user cancels the select rooms action.
	     */
	    clearPendingHighlight: function(){
	    	for(var assetId in this.pendingRoomColors){
	    		var assetBorderNode = document.getElementById("border-" + assetId);
	    		var assetNode = document.getElementById(assetId);
	    		assetNode.parentNode.removeChild(assetBorderNode);
	        	d3.select(assetNode).style("fill", this.pendingRoomColors[assetId][1]);
	    	}
	    	
	    	 this.pendingRoomColors = {};
	    },
	    
	    /**
	     * calls when user click the highlighted room again
	     */
	    clearHighlightedRooms: function(selectedRooms){
	    
	    	for(var i = 0; i < selectedRooms.length; i++){
	    		var roomAssetId = selectedRooms[i];
	    		var assetNode = document.getElementById(roomAssetId);
		    	var assetBorderNode = document.getElementById("border-" + roomAssetId);
		    	var color;
	    		if(assetBorderNode){
	    			// clear from user action
	    			assetNode.parentNode.removeChild(assetBorderNode);
	    			color = this.highlightedRoomColors[roomAssetId][1];
			    } else {
			    	// clear from the saved filters automatically
			    	color = this.oldColors[roomAssetId];
		    	}
	    		d3.select(assetNode).style("fill", color);
	    		delete this.highlightedRoomColors[roomAssetId];
	    	}
	    },
	    
	    /**
	     * reset pending rooms and add them to the highlighted rooms list.
	     * called when user add the filter/selected rooms into the grid's row
	     */
	    commitPendingHighlights: function(){
	    	var keys = Object.keys(this.pendingRoomColors);
	    	for(var i = 0; i < keys.length; i++){
	    		var key = keys[i];
	    		if(!this.highlightedRoomColors[key])
	    			this.highlightedRoomColors[key] = {};
	    		
	    		this.highlightedRoomColors[key][0] = this.pendingRoomColors[key][0];
	    		this.highlightedRoomColors[key][1] = this.pendingRoomColors[key][1];
	    	}
	    	this.pendingRoomColors = {};
	    },
	    
	    /**
	     * save the old color before highlight so that room color can be reset back when user click again.
	     */
	    saveOldColor: function(assetId, color){
	    	if(assetId && color){
	    		this.oldColors[assetId] = color;
	    	}
	    },
	    
	    // @begin_translatable
		Z_FILTERROOMACTION_TEXT:  "Filter Rooms",
		Z_SELECTROOMACTION_TEXT: "Select Rooms",
	    Z_EDIT_BUTTON:   'Edit',
	    Z_DELETE_BUTTON:   'Delete',
	    Z_CONFIRMMSG_CLEARHIGHLIGHT: "This action will clear the existing highlighted rooms and reset the filter. Continue?",
		// @end_translatable
		
	    Z_FILTERROOMACTION_ID:  "filterRoomsAction",
		Z_SELECTROOMACTION_ID:  "selectRoomsAction"
	    
});



