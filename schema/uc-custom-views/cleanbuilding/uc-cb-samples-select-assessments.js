var abCbAssessSampleCtrl = View.createController('abCbAssessSampleCtrl', {
    selectAssessmentList_grid_onCopyToItems: function(){
        var assessmentItems = [];
        var selectedRows = this.selectAssessmentList_grid.getSelectedRows();
        for(var i = 0; i < selectedRows.length; i++) {
            assessmentItems.push(selectedRows[i]['activity_log.activity_log_id']);
        }
        
        if(assessmentItems.length > 0) {
            var parentForm = View.getOpenerView().panels.get('abCbAssessSampleForm');
            var sampleId = parentForm.record.values['cb_samples.sample_id'];
            
            try{
                Workflow.callMethod('AbRiskCleanBuilding-CleanBuildingService-copySampleAndLabResultsToAssessmentItems', 
                        sampleId, assessmentItems);
            }catch(e){
                Workflow.handleError(e);
                return false;
            }
            
            parentForm.displayTemporaryMessage('Record(s) copied.', 4000);
            View.closeThisDialog();
			return true;
        }
    }
});