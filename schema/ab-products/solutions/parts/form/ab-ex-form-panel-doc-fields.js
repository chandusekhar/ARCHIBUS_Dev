var controller = View.createController('roomSelectorController', {
	 
	afterInitialDataFetch: function() {	
    	var record = View.dataSources.get('formPanelDocFields_ds_center').getRecord();
    	var res = new Ab.view.Restriction();
    	res.addClause('rm.bl_id', record.getValue('ls.bl_id'));
    	res.addClause('rm.fl_id', '17');
    	res.addClause('rm.rm_id', '103');
    	this.formPanelDocFields_cadPanel.addDrawing(res);
    }
});


	




