var bimViewerController = View.createController('bimViewer', {
	myViewer: null,
	selectedFloorRow: null,
	
	afterViewLoad: function() { 
		this.myViewer = new Ab.bim.Autodesk('viewer3d');
        this.on('app:bim:example:addFloorPlan', this.addFloorPlan);
        this.on('app:bim:example:selectRoom', this.selectRoom);
    },
  
    addFloorPlan: function(row){
    	this.selectedFloorRow = row;
    	this.closeReportDialog();
    	
    	 this.trigger('app:bim:rooms:example:hideSelectRoomPanel');
    	
    	var _this = this;
    	if(row['rm.bl_id'] === 'BOSOFF'){
    		this.myViewer.setHighlighting('rm', 'ab-assign-roomstandards-drawing.axvw', 'assignRoomStandardsDrawing_highlightDs', 'rm.bl_id=\''+row['rm.bl_id']+'\' AND rm.fl_id=\''+row['rm.fl_id']+'\'', false);
    		//this.myViewer.onClick("eq", this.openEqReport, "eq.bl_id ='" +row['rm.bl_id'] + "'");
    		//this.myViewer.onClick('rm', null, 'rm.bl_id=\''+row['rm.bl_id']+'\' AND rm.fl_id=\''+row['rm.fl_id']+'\'');
    		this.myViewer.load('urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YXJjaGlidXNfdGVzdC9ib3NvZmZfM0REdWN0RXF1aXBtZW50LmR3Zng=', function(viewer){_this.openSelectRoomPanel(row, _this)}); //bosoff-3D Duct & Equipment.dwfx
    	}else if(row['rm.bl_id'] === 'BOSMED'){
    		this.myViewer.setHighlighting('rm', 'ab-assign-roomstandards-drawing.axvw', 'assignRoomStandardsDrawing_highlightDs', 'rm.bl_id=\''+row['rm.bl_id']+'\' AND rm.fl_id=\''+row['rm.fl_id']+'\'', false);
    		this.myViewer.load('urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YXJjaGlidXNfdGVzdC9ib3NtZWQwMV8wMi1BbGwtd2l0aC5kd2Z4', function(viewer){_this.openSelectRoomPanel(row, _this)}); //bosmed01_02 - All Views - with separateboundarylayer.dwfx
    	}
    	
    	// this.myViewer.onClick("eq", this.openEqReport, "eq.bl_id ='" +row['rm.bl_id'] + "'");
    	 //this.myViewer.load('urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YXJjaGlidXNfdGVzdC9ib3NvZmZfei5ydnQ='); //bosoff_z.rvt
    	 //this.myViewer.load('urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YXJjaGlidXNfdGVzdC9ib3NvZmZfM0REdWN0RXF1aXBtZW50LmlmYw=='); //bosoff_3DDuctEquipment.ifc
    	 //this.myViewer.load('urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YXJjaGlidXNfdGVzdC9ib3NvZmZfei5pZmM='); //bosoff_z.ifc
    	 //this.myViewer.onClick("eq", this.openEqReport, "eq.bl_id ='" +row['rm.bl_id'] + "'");
    	 //this.myViewer.load('urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YXJjaGlidXNfdGVzdC9ib3NvZmYyLnJ2dA=='); //bosoff.rvt
        //this.myViewer.load('urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YXJjaGlidXNfdGVzdC9ib3NtZWRfdGVzdDQuZHdmeA=='); //BOSOFF - All Views.dwfx
        //this.myViewer.load('urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YXJjaGlidXNfdGVzdC9ib3NtZWQwMV8wMl8yLnJ2dA=='); //bosmed01_02.dwfx
        //this.myViewer.load('urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YXJjaGlidXNfdGVzdC9ib3NtZWQwMV8wMi1BbGwtd2l0aC5kd2Z4'); //bosmed01_02 - All Views - with separateboundarylayer.dwfx
        //this.myViewer.load('urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YXJjaGlidXNfdGVzdC9ib3NtZWQwMV8wMi1BbGwtd2l0aG91dC5kd2Z4'); //bosmed01_02 - All Views - without separateboundarylayer.dwfx
    },
    
    selectRoom: function(row){
    	this.myViewer.select(row['rm.ehandle'], new THREE.Color("rgb(138,43,226)"));
    	this.openRoomReport(row['rm.bl_id'], row['rm.fl_id'], row['rm.rm_id']);
    	
    },
    
    closeReportDialog: function(){
    	var reportView = View.panels.get("rm_detail_report");
    	if(reportView){
    		reportView.closeWindow();
    	}
    	reportView = View.panels.get("eq_detail_report");
    	if(reportView){
    		reportView.closeWindow();
    	}
    },
    
    openRoomReport: function(bl_id, fl_id, rm_id){
    	var reportView = View.panels.get("eq_detail_report");
    	if(reportView){
    		reportView.closeWindow();
    	}
    	
       reportView = View.panels.get("rm_detail_report");
    	
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause('rm.bl_id', bl_id);
        restriction.addClause('rm.fl_id', fl_id);
        restriction.addClause('rm.rm_id', rm_id);
    	
    	reportView.refresh(restriction);
    	reportView.showInWindow({title:'Selected Room Detail', modal: false,collapsible: false, maximizable: false, width: 350, height: 250, autoScroll:false});
    },
    openEqReport: function(eq_id){
    	var reportView = View.panels.get("rm_detail_report");
    	if(reportView){
    		reportView.closeWindow();
    	}
    	reportView = View.panels.get("eq_detail_report");
        var restriction = new Ab.view.Restriction();
        restriction.addClause('eq.eq_id', eq_id);
               	
        reportView.refresh(restriction);
        reportView.showInWindow({title:'Selected Equipment Detail', modal: false,collapsible: false, maximizable: false, width: 350, height: 250, autoScroll:false});
    },
    prgForm_instructionsPanel_onClearHighlighting: function(){
    	this.myViewer.clearHighlighting();
    	this.closeReportDialog();
    },
    prgForm_instructionsPanel_onDoHighlighting: function(){
    	this.myViewer.redoHighlighting();
    },
    openSelectRoomPanel: function(row, _this){
    	_this.trigger('app:bim:rooms:example:openSelectRoomPanel', row);
    },
    prgForm_instructionsPanel_onIsolateRooms: function(){
    	var rooms = {};
    	this.myViewer.retrieveGuidPKValueMapping('rm', 'rm.bl_id=\''+this.selectedFloorRow['rm.bl_id']+'\' AND rm.fl_id=\''+this.selectedFloorRow['rm.fl_id']+'\'', false, rooms);
    	this.myViewer.isolateAssets(rooms);
    }
   
});

