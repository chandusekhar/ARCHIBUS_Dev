////////////////////////////////////////////////////////////////////////////////
// Saves the selected information in the radio button grid using the supplied
// datasource
// 
// Parameters:
// panelName				The name of the panel holding the grid and the pms_id.
// radioGridName		The name of the grid of the radio buttons.
// dataSourceName		The name of the datasource used for saving the information.
////////////////////////////////////////////////////////////////////////////////
function saveUcPmsCal(panelName, radioGridName, dataSourceName)
{
	var panel = View.panels.get(panelName);
	var radioGrid = document.getElementById(radioGridName);
	var dataSource = View.dataSources.get(dataSourceName);
	
	var pms_id = panel.getFieldValue('pms.pms_id');
	
	var record = dataSource.getRecord('pms_id='+pms_id);

	var categoryIds = ['jan_status', 'feb_status', 'mar_status', 'apr_status', 'may_status', 'jun_status', 
										 'jul_status', 'aug_status', 'sep_status', 'oct_status', 'nov_status', 'dec_status' ];
	var rGrid = new UC.UI.RadioGrid('radioGrid', { 
		categoryIds : categoryIds,
		optionValues : ['approved', 'rejected', 'noCreate']}
	);

	var checkedValues = rGrid.getSelectedOptions();

	for (var i in checkedValues)
	{
		var intValue = 0;
		switch(checkedValues[i]) {
		case 'approved':
			intValue = 1;
			break;
		case 'rejected':
			intValue = 2;
			break;
		default:
			intValue = 0;
		}
		record.setValue('uc_pms_cal.'+i, intValue);
	}
	
	if (record.isNew) {
		record.setValue('uc_pms_cal.pms_id', pms_id);
	}
	
	dataSource.saveRecord(record);
}

////////////////////////////////////////////////////////////////////////////////
// Saves the selected information in the radio button grid using the supplied
// datasource
// 
// Parameters:
// panelName				The name of the panel holding the grid and the pms_id.
// radioGridName		The name of the grid of the radio buttons.
// dataSourceName		The name of the datasource used for saving the information.
////////////////////////////////////////////////////////////////////////////////
function loadUcPmsCal(panelName, radioGridName, dataSourceName)
{
	var panel = View.panels.get(panelName);
	var radioGrid = document.getElementById(radioGridName);
	var dataSource = View.dataSources.get(dataSourceName);
	
	var pms_id = panel.getFieldValue('pms.pms_id');
	
	var record = dataSource.getRecord('pms_id='+pms_id);

	var categoryIds = ['jan_status', 'feb_status', 'mar_status', 'apr_status', 'may_status', 'jun_status', 
										 'jul_status', 'aug_status', 'sep_status', 'oct_status', 'nov_status', 'dec_status' ];
	var rGrid = new UC.UI.RadioGrid('radioGrid', { 
		categoryIds : categoryIds,
		optionValues : ['approved', 'rejected', 'noCreate']}
	);
	
	var checkedValues = new Object();
	// create the selected array
	for (var i=0; i < categoryIds.length; i++) {
		var optionValue = null;
		switch(record.getValue('uc_pms_cal.'+categoryIds[i])) {
		case '1':
			optionValue = 'approved';
			break;
		case '2':
			optionValue = 'rejected';
			break;
		default:
			optionValue = 'noCreate';
		}
		checkedValues[categoryIds[i]] = optionValue;
	}
	
	rGrid.setSelectedOptions(checkedValues, 'noCreate');
}