/**
 * Controller implementation.
 */
var abRepmLsadminCommLogAddEditCtrl = View.createController('abRepmLsadminCommLogAddEditCtrl', {
	afterViewLoad: function(){
		//if the pop-up is opened from the Edit button only show the Edit tab
		if(!View.newRecord){
			this.abRepmLsadminCommLogAddEditTabs.selectTab("abRepmLsadminCommLogAddEdit_editTab");
			this.abRepmLsadminCommLogAddEditTabs.showTab("abRepmLsadminCommLogAddEdit_addTab", false);
		}
	},
	
	/**
	 * Selects the Edit tab and sets the full restriction to it, not only the auto_number value.
	 */
	selectEditTab: function(){
		var restriction = new Ab.view.Restriction();
		restriction.addClauses(this.abRepmLsadminCommLogAddEdit_editForm.restriction);
		restriction.addClauses(this.abRepmLsadminCommLogAddEdit_addForm.restriction, false, true);
		this.abRepmLsadminCommLogAddEditTabs.selectTab('abRepmLsadminCommLogAddEdit_editTab', restriction);
	},
	
	/**
	 * Test if communication log date is before today
	*/
	abRepmLsadminCommLogAddEdit_addForm_beforeSave: function(){
		return datesValidated(this.abRepmLsadminCommLogAddEdit_addForm, 'ls_comm.date_of_comm', getMessage('error_comm_date_before_today'));
	},
	
	/**
	 * Test if communication log date is before today
	*/
	abRepmLsadminCommLogAddEdit_editForm_beforeSave: function(){
		 return datesValidated(this.abRepmLsadminCommLogAddEdit_editForm, 'ls_comm.date_of_comm', getMessage('error_comm_date_before_today'));
	}
	
});

/**
 * If today < commDate it shows an error message.
 * @param {Object} form
 * @param {Object} commDateField
 * @param {Object} errMessage
 **/

function datesValidated(form ,commDateField, errMessage){
	// get the string value from field communication log date
	var comm_date = form.getFieldValue(commDateField).split("-");
	//create Date object
	var commDate = new Date(comm_date[0],comm_date[1]-1,comm_date[2]);
	
	// get the current date
	var today = new Date();
	
	if (today < commDate) {
		View.showMessage(errMessage);
		return false;
	}
	return true;	
}

/**
 * Before saving the edited Communication Log Item
 * prompts a message to confirm saving with Project but without an Action Item.
 */
function saveAfterEditing(){
	var editPanel = abRepmLsadminCommLogAddEditCtrl.abRepmLsadminCommLogAddEdit_editForm;
	
	if(editPanel.canSave()){
		var projectId = editPanel.getFieldValue("ls_comm.project_id");
		
		if(valueExistsNotEmpty(projectId)){
			var activityLogId = editPanel.getFieldValue("ls_comm.activity_log_id");
			
			if(!valueExistsNotEmpty(activityLogId)){
				
				View.confirm(getMessage("hasProjectNoActivityItem"), function(button){
		            if (button == 'no') {
		                return;
		            }else{
		            	saveEditPanel();
		            } 
		        });
			}else{
				saveEditPanel();
			}
		}else{
			saveEditPanel();
		}
	}
}


function deleteCommLog(){
	var editPanel = abRepmLsadminCommLogAddEditCtrl.abRepmLsadminCommLogAddEdit_editForm;
	View.confirm(getMessage('confirmDelete'), function(button){
		if (button == 'yes') {
			try {
				editPanel.deleteRecord();
				refreshOpener();
			} catch (e) {
				Workflow.handleError(e);
			}
		}
	});
}

function refreshOpener(){
    if(View.parameters.callback){
    	View.parameters.callback.call();
    }
    View.getOpenerView().closeDialog();
}


function saveEditPanel(){
	var editPanel = abRepmLsadminCommLogAddEditCtrl.abRepmLsadminCommLogAddEdit_editForm;
	editPanel.save();
    if(View.parameters.callback){
    	View.parameters.callback.call();
    }
    View.getOpenerView().closeDialog();
}

/**
 * Select value for Project for edit panel.
 */
function selectProject(){
	selectProjectId(abRepmLsadminCommLogAddEditCtrl.abRepmLsadminCommLogAddEdit_editForm.id);
}
