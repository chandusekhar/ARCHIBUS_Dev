/**
 * @author Song
 */

var defClassController = View.createController('defClassController', {
	/**
	 * This event handler is called by the view after the view loading and
	 * initial data fetch for all panels is complete.
	 */
	afterInitialDataFetch : function() {
	},
	/**
	 * button add new click.
	 * msds_id : from first tab save button.
	 */
	abRiskMsdsDefMsdsClassGrid_onAddNew: function(){
		this.abRiskMsdsDefMsdsClassGridOnAddNew();
	},
	/**
	 * sub method for parent js and current 'Add New' calling.
	 */
	abRiskMsdsDefMsdsClassGridOnAddNew: function(msds_id){
		var panelGrid = abRiskMsdsDefMsdsController.abRiskMsdsDefMsdsGrid;
		var index  = 0;
		if(panelGrid.selectedRowIndex&&panelGrid.selectedRowIndex<panelGrid.rows.length){
			index = panelGrid.selectedRowIndex;
		}
		if(msds_id){
			index  = msds_id;
		}
		var row = panelGrid.rows[index];
		
		var panelForm = this.abRiskMsdsDefMsdsClassForm;
		panelForm.newRecord = true;
		panelForm.refresh();
	    if(row){
	    	var msds_id = row['msds_data.msds_id'];
	    	panelForm.setFieldValue('msds_haz_classification.msds_id',msds_id);
	    }
    	panelForm.setFieldValue('msds_haz_classification.hazard_system_id','');
    	panelForm.setFieldValue('msds_haz_classification.hazard_class_id','');
    	panelForm.setFieldValue('msds_haz_classification.hazard_category_id','');
	}
});

/**
 * After select a Hazard Classification Category fill the Hazard Category Description.
 * @param fieldName
 * @param selectedValue
 * @param previousValue
 */
function afterSelectCategory(fieldName, selectedValue, previousValue){
	if(fieldName == "msds_haz_classification.hazard_category_id"){
		// kb 3036920 we must get description from database to avoid alert message from select value
		var hazardSystemId = defClassController.abRiskMsdsDefMsdsClassForm.getFieldValue("msds_haz_classification.hazard_system_id");
		var hazardClassId = defClassController.abRiskMsdsDefMsdsClassForm.getFieldValue("msds_haz_classification.hazard_class_id");
		var hazardCategoryId = selectedValue;
		var restriction = new Ab.view.Restriction();
		restriction.addClause("msds_hazard_category.hazard_system_id", hazardSystemId);
		restriction.addClause("msds_hazard_category.hazard_class_id", hazardClassId);
		restriction.addClause("msds_hazard_category.hazard_category_id", hazardCategoryId);
		
		var categoryDs = View.dataSources.get('abRiskMsdsDefMsdsCategDS');
		var categoryRec = categoryDs.getRecord(restriction);
		var description = "";
		if (valueExists(categoryRec)) {
			description = categoryRec.getValue('msds_hazard_category.description');
		}
		
		defClassController.abRiskMsdsDefMsdsClassForm.setFieldValue('msds_hazard_category.description',description);
	}
}