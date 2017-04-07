var abEqSurveyConsoleCtrl = View.createController('abEqSurveyConsoleController', {
	photoOrCommentFilterOn: false,
	selectedSurveys: [],
	
	afterViewLoad: function() {	
		//do not show any record
		this.eqSurveyTasksGrid_grid.refresh("eq_audit.survey_id IS NULL");
				
		this.eqSurveyGrid_grid.addEventListener('onMultipleSelectionChange', onEqSurveySelectionChange);
		
		Ext.get('instruction').dom.value = getMessage('surveyInstruction').replace(/<br\/>/g, '\r\n');
	      
   	},
   	
   	eqSurveyGrid_grid_afterRefresh: function(){
   		var selectedRows = View.panels.get('eqSurveyGrid_grid').getSelectedRows();
   		if(selectedRows.length === 0){
   			abEqSurveyConsoleCtrl.selectedSurveys = [];
   		}
   	},
   	
   	restrictItemsList: function(){
   		var filterAction = this.eqSurveyTasksGrid_grid.actions.get("filterAction");
   		var restriction = this.eqSurveyTasksGrid_grid.restriction;
   		
   		if(this.photoOrCommentFilterOn){
   			restriction = this.removePhotoOrCommentRestriction(restriction);
   			
   			filterAction.setTitle(getMessage("photoOrCommentFilterOn"));
   			this.photoOrCommentFilterOn = false;
   		}else{
   			restriction = this.addPhotoOrCommentRestriction(restriction);
   			
   			filterAction.setTitle(getMessage("photoOrCommentFilterOff"));
   			this.photoOrCommentFilterOn = true;
   		}
   		
   		this.eqSurveyTasksGrid_grid.refresh(restriction);
   	},
   	
   	addPhotoOrCommentRestriction: function(restriction){
   		var sqlRestrictionClause = " AND (eq_audit.survey_photo_eq IS NOT NULL OR eq_audit.survey_comments IS NOT NULL)";
		restriction += sqlRestrictionClause;
		return restriction;
   	},
   	
   	removePhotoOrCommentRestriction: function(restriction){
   		var sqlRestrictionClause = " AND (eq_audit.survey_photo_eq IS NOT NULL OR eq_audit.survey_comments IS NOT NULL)";
   		restriction = restriction.replace(sqlRestrictionClause, "");
   		return restriction;
   	}
});

function onEqSurveySelectionChange(row) {
	var panelId = View.panels.get('eqSurveyGrid_grid').id,
		checkAllEl = Ext.get(panelId + '_checkAll');
	
	if(row.row.isSelected()){
		abEqSurveyConsoleCtrl.selectedSurveys.push(row["survey.survey_id"]);
	}else{
		var index = abEqSurveyConsoleCtrl.selectedSurveys.indexOf(row["survey.survey_id"]);
		abEqSurveyConsoleCtrl.selectedSurveys.splice(index, 1);
	}
	
	//enable Change Fields button if only one survey is selected
	//abEqSurveyConsoleCtrl.eqSurveyGrid_grid.actions.get('changeFieldsAction').enableButton(rows.length == 1 ? true : false);

	if (valueExists(checkAllEl)) {
		var rowsNumber = View.panels.get('eqSurveyGrid_grid').rows.length;
		if(checkAllEl.dom.checked && row.index != rowsNumber-1 ){
			//skip the grid refresh until the function is called for the last row 
			//to refresh the tasks grid only once on check all event
		}else{
			refreshTasksGrid();
		}
	}else{
		refreshTasksGrid();
	}
}

function refreshTasksGrid(restriction){
var grid = View.panels.get('eqSurveyTasksGrid_grid'), restriction;

	if(abEqSurveyConsoleCtrl.selectedSurveys.length > 0){
		restriction = " eq_audit.survey_id IN ('" + abEqSurveyConsoleCtrl.selectedSurveys.join("','") + "')";
	}else{
		restriction = "eq_audit.survey_id IS NULL";
	}
	
	if(abEqSurveyConsoleCtrl.photoOrCommentFilterOn){
		restriction = abEqSurveyConsoleCtrl.addPhotoOrCommentRestriction(restriction);
	}else{
		restriction = abEqSurveyConsoleCtrl.removePhotoOrCommentRestriction(restriction);
	}
	// reset index
	grid.setIndexLevel(0);
	grid.setIndexValue('');
	grid.refresh(restriction);
}

function onChangeFields() {
	var rows = View.panels.get('eqSurveyGrid_grid').getSelectedRows();
	var surveyIds = [];
	
	if(!valueExistsNotEmpty(rows) || rows.length  == 0){
		View.showMessage(getMessage('noSurveySelected'));
		return;
	}
	
	for(var i=0; i<rows.length; i++){
		var surveyId = rows[i].row.getRecord().getValue('survey.survey_id');
		if(surveyId){
			surveyIds.push(surveyId);
		}
	}
	
	View.openDialog('ab-eq-survey-changefields.axvw', null, false, {closeButton: false, width: 300, height: 380, surveyIds: surveyIds});
}

function onUpdateSurvey() {
	var form = View.panels.get('eqSurveyDetailForm_form');
	var survey_id = form.getFieldValue('survey.survey_id');
	var survey_date = form.getFieldValue('survey.survey_date');
	var performed_by = form.getFieldValue('survey.em_id');
	var description = form.getFieldValue('survey.description');
	var status = form.getFieldValue('survey.status');
	
	if(survey_id != '') {
		var performed_by = form.fields.get('survey.em_id').dom.value;

		var emDs = View.dataSources.get('emUser_ds');
		var dsRestriction = new Ab.view.Restriction();
		dsRestriction.addClause("em.em_id", makeLiteral(performed_by), "=");
		
		var records = emDs.getRecords(dsRestriction);
		
   	    if(records==null || records.length<1){
   	    	form.validationResult.valid = false;
   	    	form.validationResult.message = getMessage('errorInvalidEmployee1') + "[" + performed_by +"]. " + getMessage('errorInvalidEmployee2');
   	    	form.validationResult.invalidFields['survey.em_id'] = "";
   	    	form.displayValidationResult();
   	    	return false;
   	    } else {
   	    	var result = null;
	   	    try {
	 			result = Workflow.callMethod('AbAssetManagement-AssetMobileService-updateSurvey', survey_id, survey_date,
						performed_by, description, status);
	       	}catch (e) {
	     		if (e.code=='ruleFailed'){
	       		  View.showMessage(e.message);
	       		}else{
	     		  Workflow.handleError(e);
	     		}
	     		return;
	       	}
   	    	if (result.code == 'executed') {
   	    		View.panels.get('eqSurveyGrid_grid').refresh();
   	    		View.panels.get('eqSurveyTasksGrid_grid').refresh();
   	    	}
   	    }
    }
}

function onCloseSurvey(row) {
	
	var record = row.row.getRecord();
    var surveyId = record.getValue('survey.survey_id');
    View.confirm(getMessage('closeActionConfirmMessage'), function(button) {
	    if (button == 'yes') {
			 var result = null;
			 try {
				 result = Workflow.callMethod('AbAssetManagement-AssetMobileService-closeSurvey', surveyId);
			 }catch (e) {
			   	if (e.code=='ruleFailed'){
			   	  View.showMessage(e.message);
			   	}else{
			   	  Workflow.handleError(e);
			   	}
			   	return;
			 }
			 
			 if (result.code == 'executed') {
				View.panels.get('eqSurveyGrid_grid').refresh();
				View.panels.get('eqSurveyTasksGrid_grid').refresh();
			 }
		}
	});
}

function onPrintSurvey(row) {
	var record = row.row.getRecord();
    var surveyId = record.getValue('survey.survey_id');
    if(!valueExistsNotEmpty(surveyId)){
		return;
	}
	var restriction = new Ab.view.Restriction();
	restriction.addClause('survey.survey_id', makeLiteral(surveyId),'=');
	View.openPaginatedReportDialog('ab-eq-survey-pgrp.axvw',{'eqSurvey_ds':restriction});
}

function onDeleteSurvey() {
	var form = View.panels.get('eqSurveyDetailForm_form');
	var surveyId = form.getFieldValue('survey.survey_id');

	View.confirm(getMessage('deleteActionConfirmMessage'), function(button) {
	    if (button == 'yes') {
	    	var result = null;
		   	try {
		   		result = Workflow.callMethod('AbAssetManagement-AssetMobileService-deleteSurvey', surveyId);
		    }catch (e) {
		    	if (e.code=='ruleFailed'){
		       	  View.showMessage(e.message);
		       	}else{
		     	  Workflow.handleError(e);
		     	}
		     	return;
		    }
			
		    if (result.code == 'executed') {
				View.panels.get('eqSurveyGrid_grid').refresh();
				View.panels.get('eqSurveyTasksGrid_grid').refresh();
			}
		    
	    	View.panels.get("eqSurveyDetailForm_form").closeWindow();
		}
	});
	
}

function makeLiteral(value){
	return "'" + value.replace(/\'/g, "''") +"'";
}