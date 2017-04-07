var energyBasEditSelectController = View.createController('energyBasEditSelect', {
	name: '',
	data_point_id: null,
    
    energyBasEdit_select_onSelect: function(row) {
    	var openerController = View.getOpenerView().controllers.get('energyBasEdit');
    	var meters_to_include = row.getRecord().getValue('bas_data_point.meters_to_include');
		if (meters_to_include) {
			openerController.isVirtual = true;
		} else {
			openerController.isVirtual = false;		
		}
    	openerController.data_point_id = row.getRecord().getValue('bas_data_point.data_point_id');
    	openerController.name = row.getRecord().getValue('bas_data_point.name');    	
    	openerController.energyBasEditTabs.selectTab('energyBasEditProcess');
    }
});

