var consoleController = View.createController('consoleController', {
	
	   regulationFieldsArraysForRes : new Array(['regrequirement.regulation','=','regulation.regulation'], ['regulation.reg_cat'],
			['regulation.reg_type'], ['regulation.reg_rank']),
	   regprogramFieldsArraysForRes : new Array(['regrequirement.reg_program','=','regprogram.reg_program'], ['regprogram.regprog_cat'], ['regprogram.regprog_type'], ['regprogram.priority'],
			['regprogram.project_id'],['regprogram.status'],['regloc.comp_level','=','regprogram.comp_level']),

	   regcomplianceFieldsArraysForRes : new Array(['regrequirement.reg_requirement'], ['regrequirement.regreq_cat'],
					['regrequirement.regreq_type'], ['regrequirement.priority']),
	
	afterInitialDataFetch: function(){
		if(this.abCompDrilldownConsole.actions.get('abCompDrilldownConsole_showAsDialog')){
			this.abCompDrilldownConsole.actions.get('abCompDrilldownConsole_showAsDialog').show(false);
		}
	},

	/**
	 * on click event show action in console panel.
	 */
	abCompDrilldownConsole_onShow : function() {
        var treeControllers = View.panels.get('panel_row1col1').contentView.controllers.get('bldgTree');
		var tabs = View.panels.get('panel_row1col2').contentView.panels.get('tabsBldgManagement');
		tabs.regulationRes = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.regulationFieldsArraysForRes);
		tabs.regprogramRes = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.regprogramFieldsArraysForRes);
		tabs.regcomplianceRes = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.regcomplianceFieldsArraysForRes);
		treeControllers.worldTree_onShowSelected();
	}
	
});


function changeMapDataSource() {
	var radioButtons = document.getElementsByName("mapInfo");
	for ( var i = 0; i < radioButtons.length; i++) {
		if (radioButtons[i].checked == 1) {
			bldgConsoleController.dataSourceName = radioButtons[i].value;
		}
	}
}

function setTheRawValue(fieldName, selectedValue, previousValue, selectedValueRaw) {
	var form = bldgConsoleController.wasteConsole;
	if (valueExistsNotEmpty(selectedValueRaw)) {
		form.setFieldValue(fieldName,selectedValueRaw);
	} else {
		form.setFieldValue(fieldName,selectedValue);
	}
	return false;
}
