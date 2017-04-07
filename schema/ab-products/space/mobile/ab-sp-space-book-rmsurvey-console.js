
var abSpSpaceBookRmsurveyConsoleCtrl = View.createController('abSpSpaceBookRmsurveyConsoleController', {
	photoOrCommentFilterOn: false,
	
	afterViewLoad: function() {	
		//do not show any record since user does not select any survey yet.
		this.spaceSurveyRoomsGrid_grid.refresh("surveyrm_sync.survey_id IS NULL");
				
		this.spaceSurveyGrid_grid.addEventListener('onMultipleSelectionChange', onspaceSurveySelectionChange);
		
	},
	
	restrictItemsList: function(){
   		var filterAction = this.spaceSurveyRoomsGrid_grid.actions.get("filterAction");
   		var restriction = this.spaceSurveyRoomsGrid_grid.restriction;
   		
   		if(this.photoOrCommentFilterOn){
   			restriction = this.removePhotoOrCommentRestriction(restriction);
   			
   			filterAction.setTitle(getMessage("photoOrCommentFilterOn"));
   			this.photoOrCommentFilterOn = false;
   		}else{
   			restriction = this.addPhotoOrCommentRestriction(restriction);
   			
   			filterAction.setTitle(getMessage("photoOrCommentFilterOff"));
   			this.photoOrCommentFilterOn = true;
   		}
   		
   		this.spaceSurveyRoomsGrid_grid.refresh(restriction);
   	},
   	
   	addPhotoOrCommentRestriction: function(restriction){
   		var sqlRestrictionClause = " AND (surveyrm_sync.survey_photo IS NOT NULL OR surveyrm_sync.survey_comments_rm IS NOT NULL)";
		restriction += sqlRestrictionClause;
		return restriction;
   	},
   	
   	removePhotoOrCommentRestriction: function(restriction){
   		var sqlRestrictionClause = " AND (surveyrm_sync.survey_photo IS NOT NULL OR surveyrm_sync.survey_comments_rm IS NOT NULL)";
   		restriction = restriction.replace(sqlRestrictionClause, "");
   		return restriction;
   	}
});

function onspaceSurveySelectionChange(row) {

	var rows = View.panels.get('spaceSurveyGrid_grid').getSelectedRows();
	var restriction = ' surveyrm_sync.survey_id IN ('
	for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if(i>0)
        	restriction += ",";
        restriction = restriction + makeLiteral(row["surveymob_sync.survey_id"]);
    }

	if(rows.length >0)
		restriction += ") ";
	else
		restriction = "surveyrm_sync.survey_id IS NULL";

	var grid = View.panels.get('spaceSurveyRoomsGrid_grid');
	
	if(abSpSpaceBookRmsurveyConsoleCtrl.photoOrCommentFilterOn){
		restriction = abSpSpaceBookRmsurveyConsoleCtrl.addPhotoOrCommentRestriction(restriction);
	}else{
		restriction = abSpSpaceBookRmsurveyConsoleCtrl.removePhotoOrCommentRestriction(restriction);
	}
	
	grid.refresh(restriction);
    
}

function onCloseSurvey(row) {
	
	var record = row.row.getRecord();
	var surveyId = record.getValue('surveymob_sync.survey_id');
    View.confirm(getMessage('closeActionConfirmMessage'), function(button) {
	    if (button == 'yes') {
	    	var result = null;
	   	    try {
	   	    	result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceMobileService-closeSurveyTable', surveyId);
		    }catch (e) {
		    	if (e.code=='ruleFailed'){
		    	  View.showMessage(e.message);
		    	}else{
		    	  Workflow.handleError(e);
		    	}
		    	return;
		    }
		    
		    if (result.code == 'executed') {
				View.panels.get('spaceSurveyGrid_grid').refresh();
				View.panels.get('spaceSurveyRoomsGrid_grid').refresh();
				if(result.data.numberOfFailedRecords==-1){
					View.showMessage('error', result.data.errorMessage);
				}
			}
		}
	});
}


function refreshSurvey() {
	View.panels.get('spaceSurveyGrid_grid').refresh();
	View.panels.get('spaceSurveyRoomsGrid_grid').refresh();
}

function onPrintSurvey(row) {
	var record = row.row.getRecord();
	var surveyId = record.getValue('surveymob_sync.survey_id');
    if(!valueExistsNotEmpty(surveyId)){
		return;
	}
	var restriction = new Ab.view.Restriction();
	restriction.addClause('surveymob_sync.survey_id', makeLiteral(surveyId),'=');
	View.openPaginatedReportDialog('ab-sp-space-book-rmsurvey-pgrp.axvw',{'spaceSurvey_ds':restriction});
}

function onDeleteSurvey(row) {
	var record = row.row.getRecord();
    var surveyId = record.getValue('surveymob_sync.survey_id');
    View.confirm(getMessage('deleteActionConfirmMessage'), function(button) {
	    if (button == 'yes') {
	    	var result = null;
	   	    try {
	   	    	result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceMobileService-deleteSurvey', surveyId);
			}catch (e) {
			   	if (e.code=='ruleFailed'){
			   	  View.showMessage(e.message);
			   	}else{
			   	  Workflow.handleError(e);
			   	}
			   	return;
			}
			
			if (result.code == 'executed') {
				View.panels.get('spaceSurveyGrid_grid').refresh();
				View.panels.get('spaceSurveyRoomsGrid_grid').refresh();
			}
		}
	});

}


function makeLiteral(value){
	return "'" + value.replace(/\'/g, "''") +"'";
}
