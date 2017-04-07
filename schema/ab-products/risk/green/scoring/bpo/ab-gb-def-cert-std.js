/**
 * @author LEI
 */
var abGbDefCertStdController = View.createController('abGbDefCertStdController', {
	oldCertStd:null,
    /**
     * Delete a certification standard
     */
	abGbDefCertStdDetailsPanel_onDelete: function(){
		//If new record, do nothing
		if(this.abGbDefCertStdDetailsPanel.newRecord){
			return;
		}
		//Else retrieve pk value and pop confirm window 
		var certStdDS = this.abGbDefCertStdDS;
		var record = this.abGbDefCertStdDetailsPanel.getRecord();
		var primaryField = record.getValue('gb_cert_std.cert_std');
	    var confirmMessage = getMessage("messageConfirmDelete").replace('{0}', primaryField);
	    View.confirm(confirmMessage, function(button){
	        if (button == 'yes') {
	            try {
					//confirm to delete: delete record and refresh panels
	                certStdDS.deleteRecord(record);
					abGbDefCertStdController.abGbDefCertStdDetailsPanel.show(false);
					abGbDefCertStdController.abGbDefCertStdListPanel.refresh();
	            } 
	            catch (e) {
	                var errMessage = getMessage("errorDelete").replace('{0}', primaryField);
	                View.showMessage('error', errMessage, e.message, e.data);
	                return;
	            }
	        }
	    })
    },
       	    
    /**
     * Added for kb#3030793, use custom code to perform 'Save' operation for changed certification standard. 
     */
	abGbDefCertStdDetailsPanel_onSave: function(){
		//If save new record 
		if(this.abGbDefCertStdDetailsPanel.newRecord){
			//check if could save
			if(!this.abGbDefCertStdDetailsPanel.canSave()){
				return;
			}
			//Use default API to save record, refresh list panel
			this.abGbDefCertStdDetailsPanel.save();
			this.abGbDefCertStdListPanel.refresh();
			//Keep saved certification standard as old value
			this.oldCertStd = this.abGbDefCertStdDetailsPanel.getFieldValue("gb_cert_std.cert_std");
		}
		//Else if update an existed certification standard
		else{
			//check if could save
			if(!this.abGbDefCertStdDetailsPanel.canSave()){
				return;
			}
			//Use default API to save record, refresh list panel
			//this.abGbDefCertStdDetailsPanel.save();
			
			//fix KB3031099-costomized the save method to support showing result message(Guo 2011/4/28)
			var result = this.updateStandard();
			//Refresh details panel restrict by saved certification standard
			this.abGbDefCertStdDetailsPanel.refresh( " gb_cert_std.cert_std='"+  this.abGbDefCertStdDetailsPanel.getFieldValue("gb_cert_std.cert_std") +"'");
			if(result!=null){
				this.abGbDefCertStdDetailsPanel.displayValidationResult(result);
			}
			
			//Get old certification standard value and new certification standard value 
			//If a row is selected in the grid, then it will be the oldCertStd
			// Cannot trust this, if user sorts in the grid, the selected index will be wrong and wrong certstd gets deleted!
			//var row = this.abGbDefCertStdListPanel.rows[this.abGbDefCertStdListPanel.selectedRowIndex];
			//if(row){
			//	this.oldCertStd = row['gb_cert_std.cert_std'];
			//}
			var newCertStd = this.abGbDefCertStdDetailsPanel.getFieldValue("gb_cert_std.cert_std");
			//check if old certification standard equals to  new certification standard value
			//If 'No' then perform custom delete operation by calling a WFR 
			//to delete related records associating with old certification standard value from association tables
			if(this.oldCertStd!=newCertStd && this.oldCertStd!=null) {
				try {
					var result = Workflow.callMethod("AbRiskGreenBuilding-ScoringService-deleteOldCertStdValues",newCertStd,this.oldCertStd );
				} 
				catch (e) {
					Workflow.handleError(e);
				}
			}
			//Use default API to refresh list panel
			this.abGbDefCertStdListPanel.refresh();			
			//Keep saved certification standard as old value (in case you do two or more followed updates, the grid is refreshed and you loose the selected index
			// so old certification standard value is the previous saved one)
			this.oldCertStd = newCertStd;			
		}
    },
    
    updateStandard: function(){
    	var form = this.abGbDefCertStdDetailsPanel;
    	var result = null;
    	try {
            result = Workflow.call(form.saveWorkflowRuleId, form.getParameters(true));
            form.updateOldFieldValues();
            form.newRecord = false;
		} catch (e) {
			form.validationResult.valid = false;
			form.displayValidationResult(e);
			result = null;
		}
		
		return result;
    }
})

/**
 * This event handler is called when user click any row link of the standards grid panel
 * Save the certstd clicked on, in case we rename
 */
function onClickCertStdRow() {
	
	var idx = abGbDefCertStdController.abGbDefCertStdListPanel.selectedRowIndex;
	var row = abGbDefCertStdController.abGbDefCertStdListPanel.rows[idx];
	if(row){
		abGbDefCertStdController.oldCertStd = row['gb_cert_std.cert_std'];
	}
}
