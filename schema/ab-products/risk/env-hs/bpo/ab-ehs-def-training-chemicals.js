var abEhsDefTrainingChemicalsController = View.createController('abEhsDefTrainingChemicalsController',{
	afterInitialDataFetch: function(){
		// hide MSDS field if the user has no license for MSDS application
		var hasMsdsLicense = (this.abEhsDefTrainingChemicals_viewMsdsDs.getRecords().length > 0) ? true : false;
		if(!hasMsdsLicense){
			this.abEhsDefTrainingChemicals_form.showField("ehs_chemicals.msds_id", false);
		}
	}
});


/**
 * After select value event handler - if the user didn’t entered a chemical_name in this form view, 
 * this would be filled with the product_name value of the msds_id record selected from the msds_data table.

 * @param fieldName
 * @param newValue
 * @param oldValue
 */
function afterSelectValue(fieldName, newValue, oldValue) {
	var formPanel = View.panels.get('abEhsDefTrainingChemicals_form');
	var ds = View.dataSources.get('abEhsDefTrainingChemicals_msdsDataDs');
	var restriction = new Ab.view.Restriction();
	restriction.addClause(fieldName, newValue, '=');
	var selectedRecord = ds.getRecord(restriction);
	if (!formPanel.getFieldValue('ehs_chemicals.chemical_name')) {
		formPanel.setFieldValue('ehs_chemicals.chemical_name', selectedRecord.getValue('msds_data.product_name'));
	}
}