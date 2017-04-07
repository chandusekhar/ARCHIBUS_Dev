var bldgConsoleController = View.createController('bldgConsole', {

	dataSourceName : 'dsBuilding',
	
	afterInitialDataFetch: function(){
		if(this.wasteConsole.actions.get('wasteConsole_showAsDialog')){
			this.wasteConsole.actions.get('wasteConsole_showAsDialog').show(false);
		}
	},

	/**
	 * on click event show action in console panel.
	 */
	wasteConsole_onShow : function() {
		View.panels.get('panel_row1col1').contentView.controllers.get('bldgTree').worldTree_onShowSelected();
	},

	getConsoleRestriction : function() {
		var wasteType = this.wasteConsole.getFieldValue('waste_profiles.waste_type');
		var status = this.wasteConsole.getFieldValue('waste_out.status');
		var disposition = this.wasteConsole.getFieldValue('waste_out.waste_disposition');
		var dateFrom = this.wasteConsole.getFieldValue('date_end.from');
		var dateTo = this.wasteConsole.getFieldValue('date_end.to');

		var restriction = " 1=1 ";
		if (wasteType) {
			restriction += " and waste_profiles.waste_type IN " + stringToSqlArray(wasteType);
		}

		if (status) {
			restriction += " and waste_out.status IN " + stringToSqlArray(status);
		}

		if (disposition) {
			restriction += " and waste_out.waste_disposition IN " + stringToSqlArray(disposition);
		}

		if (dateFrom) {
			restriction += " and waste_out.date_start >= ${sql.date('" + dateFrom + "')}";
		}

		if (dateTo) {
			restriction += " and waste_out.date_start <= ${sql.date('" + dateTo + "')}";
		}

		return restriction;
	}
});

function stringToSqlArray(string) {
	var values = string.split(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
	var resultedString = "('" + values[0] + "'";

	for (i = 1; i < values.length; i++) {
		resultedString += " ,'" + values[i] + "'";
	}

	resultedString += ")"

	return resultedString;
}

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
