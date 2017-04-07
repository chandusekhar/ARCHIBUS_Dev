/**
 * Called by ab-ex-assetpanel-drawing.axvw 
 * Handle asset panel tool bar and row actions;
 * Handle asset drag and drop events;
 * Handle selected room's context menu;
 * Enable room's border diagonal selection pattern.
 * 
 * No database update with those actions. 
 */

/**
 * if asset panel is loaded
 */
var assetPanelLoaded = false;

var assetEmployeeDrawingCtrl = View.createController('assetEmployeeDrawing', {
	afterViewLoad: function() {	
		//add selected drawing when selecting a record from grid panel
		this.withLegendFloorSelector_floors.addEventListener('onMultipleSelectionChange', function(row) {
			View.getControl('', 'withLegendFloorSelector_cadPanel').addDrawing(row, null);
	    });
		
		//make asset be drag-able 
		this.withLegendFloorSelector_cadPanel.setDraggableAssets(['em']);
		
		//context menu when a room is clicked
		this.withLegendFloorSelector_cadPanel.addEventListener('onclick', this.onContextMenu.createDelegate(this));
		
		//add asset panel
		this.withLegendFloorSelector_cadPanel.addEventListener('ondwgload', this.onAssetPanel.createDelegate(this));
	},
	
	//add asset panel to the drawing control
	onAssetPanel: function(){
		//always show labels
		this.withLegendFloorSelector_cadPanel.setShrinkLabelTextToFit(false);
		
		//display selected room with diagonal pattern
		this.withLegendFloorSelector_cadPanel.setDiagonalSelectionPattern(true);
		
		//enable asset panel with configurable parameters by calling enableAssetPanel()
		this.withLegendFloorSelector_cadPanel.enableAssetPanel('em', "Employees", "employeeDS", {actions:[{title:'Refresh', icon: Ab.view.View.contextPath + "/schema/ab-core/graphics/refresh.gif", handler: this.refreshAssetPanel.createDelegate(this)}, {title:'Add New', icon: Ab.view.View.contextPath + "/schema/ab-core/graphics/add.gif", handler:this.addNewAsset.createDelegate(this)}], filter:true, closable:false, collapsible: true, size:{width:450, height:300}, font:{fontFamily:'Arial', fontSize:'11'}, selectionColor:'#FFEAC6'});
		
		//make sure that the asset panel would be loaded once
		if(!assetPanelLoaded){
			//add row actions to asset panel
			this.withLegendFloorSelector_cadPanel.addAssetPanelRowActions([{type:'em', title:"Edit", icon: Ab.view.View.contextPath + "/schema/ab-core/graphics/edit.gif",   handler: this.editAsset.createDelegate(this)}, {type:'em', title:"Delete", icon: Ab.view.View.contextPath + "/schema/ab-core/graphics/delete.gif", handler: this.editAsset.createDelegate(this)}]);
		
			//bind event handler to the asset panel when drop event is fired
			this.withLegendFloorSelector_cadPanel.addEventListener('onAssetLocationChange', this.assetDropEventHandler.createDelegate(this));
		}else{
			//the asset panel is already loaded, just show it up by calling showAssetPanel(assetType)
			this.withLegendFloorSelector_cadPanel.showAssetPanel('em');
		}
		
		assetPanelLoaded = true;
	},
	
	/**
	 * Shows context menu to edit the selected room when mouse right-click over a selected room
	 * @param {Object} projects
	 */
	onContextMenu: function(){
		this.withLegendFloorSelector_cadPanel.addContextMenuAction("Edit Room", this.editRoom.createDelegate(this));
	},
	/**
	 * Edits the selected room when the context menu action is selected 
	 * @param {Object} record containing selected asset's primary keys
	 */
	editRoom: function(record){
		var data = "";
		for(var i=0; i<record.length; i++){
			data = data + record[i]["name"] + "=" + record[i]["value"];
			data = data + "||";
		}
		View.alert(data);
	},

	/**
	 * Refreshes asset panel to reflect latest records from database
	 */
	refreshAssetPanel:function(){
		//apps could pass Ab.view.Restriction to refresh the asset panel by calling refreshAssetPanel(assetType, restriction)
		var restriction = new Ab.view.Restriction();
		//restriction.addClause('em.em_id', ['Joe', 'John', 'Joel'], 'IN');
		this.withLegendFloorSelector_cadPanel.refreshAssetPanel('em', restriction);
	},
	
	/**
	 * Closes asset panel
	 */
	closeAssetPanel: function(){
		this.withLegendFloorSelector_cadPanel.closeAssetPanel('em');
	},
	
	
	/**
	 * Re-shows the asset panel after closing it.
	 */
	withLegendFloorSelector_cadPanel_onShowAssetPanel: function(){
		//after the asset panel is closed, apps could re-show it by calling showAssetPanel()
		this.withLegendFloorSelector_cadPanel.showAssetPanel('em');
	},

	/**
	 * Adds a new asset record when the panel tool bar action is selected.
	 * @param {String} dataSourceName data source name
	 */
	addNewAsset: function (dataSourceName){
		View.alert("Datasource name: "+dataSourceName);
		//apps could use passed dataSource name to get dataSource object and create a new record
	},
	
	/**
	 * Handles asset panel drop event
	 * @param {Object} record 
	 * @param {String} assetType 
	 */
	assetDropEventHandler: function(record, assetType){
		//get dragged asset record
		var fromRecord = record.from;
		var fromRecordValues = "";
		for(var i=0; i<fromRecord.length; i++){
			if(i != 0){
				fromRecordValues = fromRecordValues + ";";
			}
			fromRecordValues = fromRecordValues + fromRecord[i]["name"] + "=" + fromRecord[i]["value"];
		}
		
		//get dropped asset record
		var toRecord = record.to;
		var toRecordValues = "";
		for(var i=0; i<toRecord.length; i++){
			if(i != 0){
				toRecordValues = toRecordValues + ";";
			}
			toRecordValues = toRecordValues + toRecord[i]["name"] + "=" + toRecord[i]["value"];
			
		}
		
		View.alert("Asset Type: "+assetType + ";  FROM: " + fromRecordValues + "; TO: " + toRecordValues);
		
		//returning true  would enable the panel to display the dropped record, otherwise, the panel would ignore the drop event.
		return true;
	},

	/**
	 * Edits asset record when the asset panel row edit action is selected
	 * 
	 * @param {Object} rowRecord 
	  * @param {String} dataSourceName 
	 */
	editAsset: function(rowRecord, dataSourceName){
		var data = "";
		for(var i=0; i<rowRecord.length; i++){
			data = data + rowRecord[i]["name"] + "=" + rowRecord[i]["value"];
			data = data + "||";
		}
		View.alert(data +"|| datasouce name: "+dataSourceName);
	},
	/**
	 * Deletes asset record when the asset panel row delete action is selected
	 * 
	 * @param {Object} rowRecord 
	  * @param {String} dataSourceName 
	 */
	deletAsset: function (rowRecord, dataSourceName){
		var data = "";
		for(var i=0; i<rowRecord.length; i++){
			data = data + rowRecord[i]["name"] + "=" + rowRecord[i]["value"];
			data = data + "||";
		}
		View.alert(data +"|| datasouce name: "+dataSourceName);
	},
	
	withLegendFloorSelector_cadPanel_onPpt: function(){
		var slides = [];
    	if(this.withLegendFloorSelector_cadPanel && this.withLegendFloorSelector_cadPanel.getImageBytes){
    		var drawingImage = this.withLegendFloorSelector_cadPanel.getImageBytes();
    		slides.push({'title': Ab.view.View.title, 'images':[drawingImage], 'type':'flash'});  
       	 	var jobId = Workflow.startJob('AbSystemAdministration-generatePaginatedReport-generatePpt', slides, {});
       	 	View.openJobProgressBar("Please wait...", jobId, null, function(status) {
    	   		var url  = status.jobFile.url;
       			window.location = url;
    	   	 }); 
    	}
	}
});
