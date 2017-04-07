var commEqDetailsPlansController = View.createController('commEqDetailsPlansCtrl',{
	
	commEqDetailsPlans_eqDetails_afterRefresh: function() {
		this.commEqDetailsPlans_eqDetails_onShowDrawing.defer(800, this);
		
	},
	
	commEqDetailsPlans_eqDetails_onShowDrawing: function() {
		if (valueExists(FABridge.abDrawing))
	    {
			this.commEqDetailsPlans_cadPanel.clear();
	   	}
		var record = View.getOpenerView().panels.get('commEqDetailsForm').getRecord(); 
		if (!valueExists(record)) return;
	    var bl_id = record.getValue('eq.bl_id');
	    var fl_id = record.getValue('eq.fl_id'); 
	    var eq_id = record.getValue('eq.eq_id');
	    
	    this.commEqDetailsPlans_eqHighlight.addParameter("eqId", eq_id);

	    var restriction = new Ab.view.Restriction();
	    restriction.addClause('rm.bl_id', bl_id);
	    restriction.addClause('rm.fl_id', fl_id);
	    var dwgRecord = this.commEqDetailsPlans_drawingDs.getRecord(restriction);
		var selectedDwgName = dwgRecord.getValue('rm.dwgname');
		
		if (bl_id == "" || fl_id == "" || selectedDwgName == "") {
	    	View.showMessage(getMessage('noDrawing'));
	    	return;
	    }

	    var dcl = new Ab.drawing.DwgCtrlLoc(bl_id, fl_id, null, selectedDwgName);
	    this.commEqDetailsPlans_cadPanel.addDrawing(dcl);
	}
});
