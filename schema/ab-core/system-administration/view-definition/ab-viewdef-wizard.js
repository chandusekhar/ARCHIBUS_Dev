var viewDefWizardController = View.createController('viewDefWizard', {
    /**
     * Called when wizard first loads
     *
     * @param	None
     * @return	None
     *
     */
    afterViewLoad: function(){
        this.inherit();
        
        // add event listener for tab change
        this.tabsFrame.addEventListener('afterTabChange', afterTabChange);
        this.tabsFrame.isMini = false;
        //var listOfRestrictedTables = getTablesToLimit(); 
        this.tabsFrame.listOfRestrictionTables = getTablesToLimit(); 
        //var listOfRestrictedFieldsToLimit = getFieldsToLimit(); 
        this.tabsFrame.listOfRestrictionFields = getFieldsToLimit();         
    }
});

/**
 * Called after tab changes
 *
 * @param  	None
 * @return 	None
 *
 */
function afterTabChange(tabPanel, selectedTabName){

    // Detect whether the characteristics tab was selected.  If so, set variable, so that
    // the first child tab (the summary characteristics tab) will be displayed first
    if (selectedTabName == 'page4') {
        tabPanel.showDefaultCharTab = true;
        tabPanel.refresh();
    }
    else {
        tabPanel.showDefaultCharTab = false;
    }
}

function getTablesToLimit(){
	var tables = -1;
	var params = {
		tableName: 'afm_activity_params',
		fieldNames: toJSON(['afm_activity_params.activity_id', 'afm_activity_params.param_id', 'afm_activity_params.param_value']),
		restriction: toJSON({
			'afm_activity_params.activity_id': 'AbSystemAdministration',
			'afm_activity_params.param_id': 'ViewDefinitionWizardTablesToIncl'
		})
	}

	var result = Workflow.call('AbCommonResources-getDataRecords', params);
	if(result.code == 'executed'){
		if(result.data.records.length > 0){
			tables = result.data.records[0]['afm_activity_params.param_value'];
			return tables;
		}else{
			return ';';
		}
	}else{
		Workflow.handleError(result);
	}
}

function getFieldsToLimit(){
	var fields = -1;
	var params = {
		tableName: 'afm_activity_params',
		fieldNames: toJSON(['afm_activity_params.activity_id', 'afm_activity_params.param_id', 'afm_activity_params.param_value']),
		restriction: toJSON({
			'afm_activity_params.activity_id': 'AbSystemAdministration',
			'afm_activity_params.param_id': 'ViewDefinitionWizardFieldsToIncl'
		})
	}
	var result = Workflow.call('AbCommonResources-getDataRecords', params);
	if(result.code == 'executed'){
		if(result.data.records.length > 0){
			fields = result.data.records[0]['afm_activity_params.param_value'];
			return fields;
		}else{
			return ';';
		}
	}else{
		Workflow.handleError(result);
	}
}