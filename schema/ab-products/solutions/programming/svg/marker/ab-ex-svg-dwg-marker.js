/**
 * called by ab-ex-svg-dwg-marker.axvw
 */
var exampleController = View.createController('example', {
	
	bl_id: 'HQ',
	
	fl_id: '17',
	
	dwgname: 'HQ17',
	
	layerName: 'MY_MARKER_TABLE-assets',
	
	drawingControl: null,	
	markerControl: null,
	clusterControl: null,
	 
    afterInitialDataFetch: function() {
    	this.tabs.addEventListener('beforeTabChange', this.beforeTabChange.createDelegate(this));
    	this.loadSvg(this.bl_id, this.fl_id);
    },

    beforeTabChange: function() {
		if (this.tabs.getSelectedTabName() != 'markerTab'){ 
			this.tabs.selectTab('markerTab');
			this.refreshMarkerTabPanel();
			this.tabs.enableTab('floorTab', true);
		}
    }, 
    
    refreshMarkerTabPanel: function() {
		var restriction = new Ab.view.Restriction();
    	restriction.addClause("afm_redlines.dwg_name", this.dwgname);
		this.marker_tree.refresh(restriction);
    },
    
    loadSvg: function(bl_id, fl_id) {
    	View.openProgressBar();
	    	
    	// define parameters to be used by server-side job
    	var parameters = new Ab.view.ConfigObject();
    	//parameters['plan_type'] = "1 - ALLOCATION";
    	parameters['pkeyValues'] = {'bl_id':bl_id, 'fl_id':fl_id};
        parameters['highlightParameters'] = [{
        	view_file: 'ab-sp-hl-rm-by-dp-per-fl.axvw',
        	hs_ds: 'ds_ab-sp-hl-rm-by-dp-per-fl_drawing_rmHighlight',
        	label_ds: 'ds_ab-sp-hl-rm-by-dp-per-fl_drawing_rmLabel',
        	label_ht: '0.50',
        	label_clr: 'gray'
        }];
        
    	// enable the marker and cluster add-ons
        parameters['addOnsConfig'] = {
        	'Marker':  {'divId': 'drawingDiv'},
        	'Cluster': {'divId': 'drawingDiv', 'layerName' : this.layerName, 'clickHandler' : this.onClickCluster, 'minDistance': function(scale) { return 25 * 25 / (scale * scale); } }
        };
    	
    	// load drawing   	
    	this.drawingControl = new Ab.svg.DrawingControl("drawingDiv", "drawingPanel", parameters);
    	    	
    	this.drawingControl.load("drawingDiv", parameters);	
   	
    	// show layers menu
    	this.drawingControl.showLayers();
    	
    	// resize specified DOM element whenever the panel size changes
    	this.drawingPanel.setContentPanel(Ext.get('drawingPanel'));
    	this.drawingPanel.setContentPanel(Ext.get('drawingDiv'));
    	    	
    	// disable label selection
    	this.drawingControl.disableLabelSelection();
    	
    	// marker control
    	this.markerControl = this.drawingControl.getAddOn('Marker');
    	
    	// cluster control
    	this.clusterControl = this.drawingControl.getAddOn('Cluster');
    	
    	View.closeProgressBar();
    },
        
    /**
     * When user chose 'Insert New Marker' action button, bring up a popup dialog to select the symbol.
     */
    drawingPanel_onShowAvailableSymbols: function() { 
    	var reportView = View.panels.get("symbolsPopup");
    	reportView.showInWindow({title:'Select a symbol', modal: true,collapsible: false, maximizable: false, width: 350, height: 250, autoScroll:false});    			 	
    },
    
    /** 
     * During 'Insert New Marker'.  Once a symbol has been selected, listen to when the symbol is dropped onto the floorplan.  
     * Then insert the symbol and execute callback (afterPlaceMarker).
     */
    drawingPanel_onPlaceMarker: function(obj) {
    	var self = this;

    	// close the dialog
    	var reportView = View.panels.get("symbolsPopup");
    	reportView.closeWindow();
    	    	
    	// specify properties for marker
        var marker = {
            	icon: obj.src,
            	layer: self.layerName,
            	width: 30,
            	height: 30,
            	self: self,
            	handler: self.afterPlaceMarker,
            	clickHandler: self.onClickMarker,
            	moveEndHandler: self.onMoveEnd,
            	beforeDeleteHandler: self.onBeforeDelete,
            	deleteHandler: self.onDelete
            };
        
    	// place marker and execute callback
        self.markerControl.placeMarker(marker);
    },
        
    /**
     * When user chose 'Show Existing Markers'.  Iterate through records and adds markers to the drawing.
     */
    drawingPanel_onShowExistingMarkers: function() {
    	
    	// show the marker tab.  refresh list of markers in tree panel
    	this.beforeTabChange();
		
    	// handle markers on drawing
    	var self  = this;    	
    	View.openProgressBar();
    	
		// zoom extents
		this.drawingControl.zoomExtents();
    	
    	// remove markers from drawing layer; faster than re-fetching the .svg from server
    	this.markerControl.removeMarkers(this.layerName);   	
    	
		var rest = new Ab.view.Restriction();
		rest.addClause("afm_redlines.origin", 'HTML5-based Floor Plan', "=");
		rest.addClause("afm_redlines.redline_type", 'Marker', "=");
		rest.addClause("afm_redlines.dwg_name", this.dwgname, "=");
		rest.addClause("afm_redlines.layer_name", this.layerName, "=");
		var records = this.ds_redlines.getRecords(rest);
		if(records == null || records.length == 0){
			alert(getMessage("noRecords"));
		} else {
			var total = records.length + 4;
			View.updateProgressBar(0.5*total/total);
			//View.updateProgressBar(1/total);
			for(var i=0;i<records.length;i++){
				var record = records[i];
				var marker = {
					id: record.getValue('afm_redlines.auto_number'),		// you can explicitly set the id, if you know it
					origin: record.getValue('afm_redlines.origin'),
					redline_type: record.getValue('afm_redlines.redline_type'),
					icon: record.getValue('afm_redlines.redlines'),
					dwgname: record.getValue('afm_redlines.dwg_name'),
					x: record.getValue('afm_redlines.position_lux'),
					y: record.getValue('afm_redlines.position_luy'),
					rotate: record.getValue('afm_redlines.rotation'),
					width: record.getValue('afm_redlines.position_rlx'),
					height: record.getValue('afm_redlines.position_rly'),
					layer: record.getValue('afm_redlines.layer_name'),
					clickHandler: self.onClickMarker,
					moveEndHandler: self.onMoveEnd,
					deleteHandler: self.onDelete,
					beforeDeleteHandler: self.onBeforeDelete,
					label: {text: [record.getValue('afm_redlines.auto_number')]}
				};
		    	//View.updateProgressBar(i/total);
		    	
		    	// add markers
				var img = this.markerControl.addMarker(marker);
			}			

			// re-cluster after clicking on 'Show Existing Markers'
			if (this.clusterControl) {
				this.clusterControl.recluster();			
			}			
			
			// update the list of layers
			this.drawingControl.showLayers();
		}
				
		// close progress bar
		View.closeProgressBar();
    },
    
    drawingPanel_onToggleClustering: function() {
    	exampleController.clusterControl.setEnabled(!exampleController.clusterControl.getEnabled()); 			 	
    },
    

    //----------------------------- Event listeners/handlers -----------------------------------------------------
    /**
     * Handler for clicking cluster.
     */
    onClickCluster: function(c) {
    	alert("This cluster represents the identifiers: " + c.children.map(function(d) {
    		return d.node.firstChild.id;
    	}).join(", ") + ".");
    },
    
    /**
     * Handler for click/edit.
     */
    onClickMarker: function(image, marker) {
    	alert(image.id);
    },
            
    /**
     * Callback for after symbol has been dropped.
     */
    afterPlaceMarker: function(marker) {
    	marker.event.stopPropagation();
    	marker.event.preventDefault();

        // force new record mode, so that the form does not load existing record
    	var self = marker.self;
    	self.redlineForm.newRecord = true;
 
    	// create a new record in the afm_redlines table
		var record = new Ab.data.Record({
			'afm_redlines.origin': 'HTML5-based Floor Plan',
			'afm_redlines.redline_type': 'Marker',
			'afm_redlines.redlines': marker.icon,
			'afm_redlines.dwg_name': self.dwgname,
			'afm_redlines.position_lux': marker.x,
			'afm_redlines.position_luy': marker.y,
			'afm_redlines.position_rlx': marker.width,
			'afm_redlines.position_rly': marker.height,
			'afm_redlines.rotation': marker.rotate,
			'afm_redlines.layer_name': marker.layer
		}, true);
		var savedRecord = self.ds_redlines.saveRecord(record);
		
		// here, we do not know the id until after the record is saved
		// so we are forced to set the afterwards
		var id = savedRecord.getValue('afm_redlines.auto_number');
		marker.image.id = id;
		marker.image.parentNode.id = marker.layer + '_' + id;
		
		// add label
		var label = {
				text: [id]
		};
		marker.id = id;
		marker.label = label;
		
		// set label
		self.markerControl.setLabel(marker);
		
		// if a marker symbol is placed on top of an existing cluster, add to the existing cluster
		if (self.clusterControl) {
			self.clusterControl.recluster();			
		}
		
		// refresh layers list
		self.drawingControl.showLayers();
		
		// refresh list of markers
		if (self.tabs.getSelectedTabName() == 'markerTab'){
	        var markerTab = self.tabs.findTab('markerTab'); 
	        markerTab.refresh();			
		}
    },    

    /**
     * Handler for after moving an marker. In this case, update the location/position for the record in the database.
     */
    onMoveEnd: function(marker) {
    	var update = confirm(getMessage('update'));
    	if (update) {
    		
    		// if ok
    		try {
    			// recluster
            	exampleController.clusterControl.recluster();
            	
    			// update the record in the database with the new location
            	var rest = new Ab.view.Restriction();
        		rest.addClause('afm_redlines.auto_number', marker.image.id);
            	var records = exampleController.ds_redlines.getRecords(rest);
            	var record = records[0];
            	record.isNew = false;
            	record.setValue('afm_redlines.position_lux', marker.x);
            	record.setValue('afm_redlines.position_luy', marker.y);
            	var rotate = (marker.rotate) ? marker.rotate : 0;
            	record.setValue('afm_redlines.rotation', rotate);
            	exampleController.ds_redlines.saveRecord(record); 
    		} catch (e) {
    			alert(e);
    		}      	
    	} else {
    		
    		// if cancel
    		try {				
        		var imageNode = marker.image,
        			node = imageNode.parentNode;
		            	
        		// fly back to original position
        		var toX = marker.originalX;
        		var toY = marker.originalY;
        		var toRotate = (marker.originalRotate) ? marker.originalRotate : 0;      		                	
        		exampleController.markerControl.returnToOriginalPosition(node, toX, toY, toRotate);	
            	
            	// update current position
            	marker.x = toX;
            	marker.y = toY;
            	marker.rotate = toRotate;            	
    		} catch (e) {    			
    		}
    	}
    },
    
    /**
     * (Optional) Use this handler if you need to do something before bringing up the delete confirmation and subsequent delete handler.
     * Return true if you want to indicate that the symbol can be deleted and want to proceed with the deleteHandler.
     * Return false if you want to indicate the symbol should not be deleted.
     */
    onBeforeDelete: function() {
    	return true;
    },
   
    /**
     * Handler for deleting an item.  In this case, delete the record in the database.  Notice the return.  If the update failed, do not delete the icon.
     */
    onDelete: function(id, marker) {
    	var success = false;   	
    	var rest = new Ab.view.Restriction();
		rest.addClause('afm_redlines.auto_number', id);
    	var records = exampleController.ds_redlines.getRecords(rest);
		if(records == null || records.length == 0){
			alert(getMessage('deleteFailed'));
		} else {			
			success = (exampleController.ds_redlines.deleteRecord(records[0]) == null) ? true : false;
		}
		
		// refresh panel
		exampleController.refreshMarkerTabPanel();

    	return success;			// if return false, the icon will not be deleted
    }
});


/**
 * Click event for tree items related to the floor.
 */
function onClickFloorTreeNode(){
	var curTreeNode = View.panels.get("floor_tree").lastNodeClicked;
	
	// get selected data from tree
	var bl_id = curTreeNode.data["rm.bl_id"];
	var fl_id = curTreeNode.data["rm.fl_id"];
	var rm_id = curTreeNode.data["rm.rm_id"];
	var dwgname = curTreeNode.data["rm.dwgname"].toUpperCase();
	
	// if previously selected bl and fl are different than the current selection, load the relevant drawing, and disable the marker tab.
	if ((bl_id != exampleController.bl_id || fl_id != exampleController.fl_id) || !rm_id ) {
		exampleController.loadSvg(bl_id, fl_id);
		exampleController.tabs.enableTab('markerTab', false);
	}
	
	// search and highlight room in the drawing
	if (rm_id) {

		// you can choose how to highlight the asset  	  
    	var opts = { cssClass: 'zoomed-asset-red-bordered',		// use the cssClass property to specify a css class
    				 removeStyle: true							// use the removeStyle property to specify whether or not the fill should be removed (for example  cssClass: 'zoomed-asset-bordered'  and removeStyle: false
			   	   };
    	exampleController.drawingControl.findAssets([bl_id+';'+fl_id+';'+rm_id], opts); 
	} 
	
	// remember bl_id, fl_id, and dwgname
	exampleController.bl_id = bl_id;
	exampleController.fl_id = fl_id;
	exampleController.dwgname = dwgname;
}

/**
 * Click event for tree items related to markers.
 */
function onClickMarkerTreeNode(){
	var curTreeNode = View.panels.get("marker_tree").lastNodeClicked;	
	var auto_number = curTreeNode.data["afm_redlines.auto_number"];
	
	// search and highlight marker
	var controller = View.controllers.get('example');
	controller.drawingControl.findAssets([controller.layerName + '_' + auto_number], { zoomFactor: 10 });
}