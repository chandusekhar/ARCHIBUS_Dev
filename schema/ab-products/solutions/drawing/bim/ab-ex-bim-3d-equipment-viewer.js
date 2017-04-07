var bimViewerController = View.createController('bimViewer', {
	myViewer: null,
	selectedFloorRow: null,
	
	afterViewLoad: function() { 
		this.myViewer = new Ab.bim.Autodesk('viewer3d');
        this.on('app:bim:eq:example:loadModel', this.loadModel);
    },
  
    loadModel: function(row){
    	var reportView = View.panels.get("eq_detail_report");
    	if(reportView){
    		reportView.show(false);
    	}
    	
    	var _this = this;
    	if(row['rm.bl_id'] === 'BOSOFF'){
    		this.myViewer.onClick("eq", this.openEqReport, "eq.bl_id ='" +row['rm.bl_id'] + "'");
    		
    		this.myViewer.load('urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YXJjaGlidXNfdGVzdC9ib3NvZmZfM0REdWN0RXF1aXBtZW50LmR3Zng=', this.isolateEqs); //bosoff-3D Duct & Equipment.dwfx
    	}//else if(row['rm.bl_id'] === 'BOSMED'){
    		//this.myViewer.load('urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YXJjaGlidXNfdGVzdC9ib3NtZWQwMV8wMi1BbGwtd2l0aC5kd2Z4'); //bosmed01_02 - All Views - with separateboundarylayer.dwfx
    	//}
    	
    	 //this.myViewer.onClick("eq", this.openEqReport, "eq.bl_id ='" +row['rm.bl_id'] + "'");
    	 //this.myViewer.load('urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YXJjaGlidXNfdGVzdC9ib3NvZmZfM0REdWN0RXF1aXBtZW50LmlmYw=='); //bosoff_3DDuctEquipment.ifc
    	 //this.myViewer.onClick("eq", this.openEqReport, "eq.bl_id ='" +row['rm.bl_id'] + "'");
    	 //this.myViewer.load('urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YXJjaGlidXNfdGVzdC9ib3NvZmYyLnJ2dA=='); //bosoff.rvt
        //this.myViewer.load('urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YXJjaGlidXNfdGVzdC9ib3NtZWRfdGVzdDQuZHdmeA=='); //BOSOFF - All Views.dwfx
        //this.myViewer.load('urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YXJjaGlidXNfdGVzdC9ib3NtZWQwMV8wMl8yLnJ2dA=='); //bosmed01_02.dwfx
        //this.myViewer.load('urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YXJjaGlidXNfdGVzdC9ib3NtZWQwMV8wMi1BbGwtd2l0aC5kd2Z4'); //bosmed01_02 - All Views - with separateboundarylayer.dwfx
        //this.myViewer.load('urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YXJjaGlidXNfdGVzdC9ib3NtZWQwMV8wMi1BbGwtd2l0aG91dC5kd2Z4'); //bosmed01_02 - All Views - without separateboundarylayer.dwfx
    },
    
    /**
     * pkValue for multiple primary keys such as rm: 'HQ;18;105'.
     */
    openEqReport:  function(pkValue){
    	var reportView = View.panels.get("eq_detail_report");
        var restriction = new Ab.view.Restriction();
        restriction.addClause('eq.eq_id', pkValue);
               	
        reportView.refresh(restriction);
    },
    
    prgForm_instructionsPanel_onIsolateEqs: function(){
    	this.isolateEqs(this.myViewer);
    },
    
    isolateEqs: function(viewer){
    	viewer.isolateAssets();
    }
});
