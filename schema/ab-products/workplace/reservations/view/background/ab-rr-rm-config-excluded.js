
/**
 * This controller is just use for ab-rr-rm-config-excluded.axvw.
 *  
 */
var abRrRmConfigExcludedController = View.createController("abRrRmConfigExcludedController",{
	

	afterInitialDataFetch: function() {
		var parentForm = View.getOpenerView().panels.get('rm_config_form');
		var parentConfig = parentForm.getFieldValue('rm_config.config_id');
		
		var excludedConfig = parentForm.getFieldValue('rm_config.excluded_config');
		var arrExcludedCfg = [];
		
		if (!valueExists(excludedConfig)) {
			excludedConfig = "";		
		}
		arrExcludedCfg = excludedConfig.split(",");
		
		// Move throught the grid rows to disable the configuration of the parent window
	   	var grid = View.panels.get('excluded_config');   
	   	var gridRows = grid.gridRows;
		
		for (var i = 0; i < gridRows.length; i++) {
			var row = gridRows.items[i];
			var gridConfigId = row.getFieldValue('rm_config.config_id');
			
			var selectionCheckbox = row.dom.firstChild.firstChild;
			if (parentConfig == gridConfigId) {
		       	// var selectionCheckbox = dataRow.firstChild.firstChild;
				selectionCheckbox.disabled = true;
			}
			
			for (var j=0; j < arrExcludedCfg.length; j++) {
				if (arrExcludedCfg[j] == "'"+gridConfigId+"'") {
					row.select(true);
				}				
			}
	   	} 
	},
	 
	excluded_config_afterRefresh: function(){
		var parentForm = View.getOpenerView().panels.get('rm_config_form');
		var parentConfig = parentForm.getFieldValue('rm_config.config_id');
		
		//Move throught the grid rows to disable the configuration of the parent window
	   	var grid = View.panels.get('excluded_config');   
	   	var gridRows = grid.gridRows;
		
		for (var i = 0; i < gridRows.length; i++) {
			var row = gridRows.items[i];
			var gridConfigId = row.getFieldValue('rm_config.config_id');
			
			if (parentConfig == gridConfigId) {
		       	// var selectionCheckbox = dataRow.firstChild.firstChild;
				var selectionCheckbox = row.dom.firstChild.firstChild;
	    	   	selectionCheckbox.disabled = true;
			}
	   	} 
	}
});

/**
 * This function is called when the button Save is clicked.
 */
function onSave() {
    var grid = View.getControl('','excluded_config');
	var dataRows = grid.getSelectedGridRows();
	var selectedExcludedConf = '';
	
	//Move throught the grid rows to get selected configurations and put them between ' ' and separate then with commas
	for (var i = 0; i < dataRows.length; i++) {
        var dataRow = dataRows[i];
		var selectionCheckbox = dataRow.dom.firstChild.firstChild;
	    
		if (selectionCheckbox.disabled) {
			continue;
		}
		
		if (selectedExcludedConf != '') {
			selectedExcludedConf = selectedExcludedConf + ',';
		}
		
		selectedExcludedConf = selectedExcludedConf + "'" + dataRow.getFieldValue('rm_config.config_id') + "'";
    }
	//Assign the selected excluded configurations to the parent window
	var parentForm = View.getOpenerView().panels.get('rm_config_form');
	parentForm.setFieldValue('rm_config.excluded_config', selectedExcludedConf);
	//Close the window
	View.getOpenerView().closeDialog();
}

/**
 * close this dialog.
 */
function onCancel() {
	//Close the window
	View.getOpenerView().closeDialog();
}