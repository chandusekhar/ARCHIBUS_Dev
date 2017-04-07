var rplmClauseController = View.createController('rplmClause',{
	selectedId:null,
	leaseId:null,
	itemId:null,
	itemType:null,
	refreshControllers:new Array(),
	refreshPanels: new Array(),
	
	afterViewLoad: function(){
		View.panels.get('formClause').addEventListener("onAutoCompleteSelect", onAutoCompleteSelect);
	},
	
	formClause_onSave: function(){
		if(!datesValidated(this.formClause)){
			return false;
		}
		
		if(this.selectedId == null){
			var record = this.formClause.getRecord();
			record.setValue('ls_resp.ls_id', this.leaseId);
			this.formClause.setRecord(record);
			if (this.formClause.save()) {
				setAmenityButton();
				this.formClause.enableField('ls_resp.resp_id', false);
				for (var i = 0; i < this.refreshControllers.length; i++) {
					View.getOpenerView().controllers.get(this.refreshControllers[i]).restoreSettings();
				}
				for(var i=0;i<this.refreshPanels.length;i++){
					View.getOpenerView().panels.get(this.refreshPanels[i]).refresh(View.getOpenerView().panels.get(this.refreshPanels[i]).restriction);
				}
			}
			this.formClause_afterRefresh();
			this.selectedId = this.formClause.getFieldValue('ls_resp.resp_id');
		}else{
			this.formClause.save();
			setAmenityButton();
			for(var i=0;i<this.refreshControllers.length;i++){
				View.getOpenerView().controllers.get(this.refreshControllers[i]).restoreSettings();
			}
			for(var i=0;i<this.refreshPanels.length;i++){
				View.getOpenerView().panels.get(this.refreshPanels[i]).refresh(View.getOpenerView().panels.get(this.refreshPanels[i]).restriction);
			}
			View.closeThisDialog();
		}
	},
	
	formClause_onCancel: function(){
		
		View.closeThisDialog();
	},	
	
	formClause_onDelete: function(){
		var form = this.formClause;
		var controller = this;
        View.confirm(getMessage("confirmDelete"), function(button){
            if (button == 'yes') {
                try {
                    form.deleteRecord();
        			for(var i=0;i<controller.refreshControllers.length;i++){
        				View.getOpenerView().controllers.get(controller.refreshControllers[i]).restoreSettings();
        			}
        			for(var i=0;i<controller.refreshPanels.length;i++){
        				View.getOpenerView().panels.get(controller.refreshPanels[i]).refresh(View.getOpenerView().panels.get(controller.refreshPanels[i]).restriction);
        			}
        			View.closeThisDialog();
                } 
                catch (e) {
                	Workflow.handleError(e);
                }
            }
        });
		
	},
	
	formClause_afterRefresh: function(){
		var clauseType = valueExistsNotEmpty(this.formClause.getFieldValue('ls_resp.clause_type_id'))?this.formClause.getFieldValue('ls_resp.clause_type_id'):'';
		this.formClause.fields.get('ls_resp.description').actions.items[0].enable(clauseType.toUpperCase() == 'AMENITY');
	}
})

function checkClauseFields(){
	if(rplmClauseController.formClause.getFieldValue('ls_resp.dates_match_lease') == 1){
		var controller = View.controllers.get('rplmClause');
		var lsRecord = getLeaseDates(controller.leaseId);
		
		rplmClauseController.formClause.enableField('ls_resp.date_start', false);
		rplmClauseController.formClause.setFieldValue('ls_resp.date_start', lsRecord.getValue('ls.date_start'));
		rplmClauseController.formClause.enableField('ls_resp.date_end', false);
		rplmClauseController.formClause.setFieldValue('ls_resp.date_end', lsRecord.getValue('ls.date_end'));
	}else if(rplmClauseController.formClause.getFieldValue('ls_resp.dates_match_lease')==0){
		rplmClauseController.formClause.enableField('ls_resp.date_start', true);
		rplmClauseController.formClause.enableField('ls_resp.date_end', true);
	}
}



/**
 * Add Amenity Type and Comments to selected Clause's Description
 **/

function setAmenityType(row){
	var selectedRows = View.panels.get('abRplmAddEditClausesAmntType').getSelectedRows();
	panel = rplmClauseController.formClause;
	for (i = 0; i<selectedRows.length; i++){
		
		var comments = (selectedRows[i]['bl_amenity.comments'])?" - Comments: "+selectedRows[i]['bl_amenity.comments']:"";
		
		panel.setFieldValue('ls_resp.description' , panel.getFieldValue('ls_resp.description')+ " Amenity Type: "+ selectedRows[i]['bl_amenity.amenity_type']+comments +". ");	
	}
	View.panels.get('abRplmAddEditClausesAmntType').closeWindow();
}

/**
 * Enable/Disable 'Add Amenity Description' button if Clause Type is/is not 'Amenity'
 * @param {Object} fieldName
 * @param {Object} selectedValue
 * @param {Object} previousValue
 **/

function setAmenityButton(fieldName, selectedValue, previousValue){
	var panel = rplmClauseController.formClause;
	var clauseType = (selectedValue)? selectedValue:panel.getFieldValue('ls_resp.clause_type_id');
	
	if(clauseType.toUpperCase() == 'AMENITY'){
		panel.fields.get('ls_resp.description').actions.items[0].enable(true);
	}else{
		panel.fields.get('ls_resp.description').actions.items[0].enable(false);
	}
}

/**
 * set parameters to 'abRplmAddEditClausesAmntType' panel depending on the itemId is either 'BUILDING' or 'PROPERTY'
**/

function setRestrParameters(){
	var panel = rplmClauseController.abRplmAddEditClausesAmntType;
	if(rplmClauseController.itemType == 'BUILDING'){
		panel.addParameter('bl_restr', "bl_amenity.bl_id = '"+rplmClauseController.itemId+"'");
		panel.addParameter('pr_restr', "prop_amenity.pr_id IN (SELECT pr_id FROM bl WHERE bl.bl_id = '"+rplmClauseController.itemId+"')");
	}else{
		panel.addParameter('bl_restr', "bl_amenity.bl_id IN (SELECT bl_id FROM bl WHERE bl.pr_id = '"+rplmClauseController.itemId+"')");
		panel.addParameter('pr_restr', " prop_amenity.pr_id = '"+rplmClauseController.itemId+"'");
	}	
}	

/**
 * check if dateStart < dateEnd 
**/

function datesValidated(form){
	// get the string value from field stard date
	var date_start = form.getFieldValue('ls_resp.date_start').split("-");
	//create Date object
	var dateStart = new Date(date_start[0],date_start[1],date_start[2]);
	
	// get the string value from field end date
	var date_end = form.getFieldValue('ls_resp.date_end').split("-");
	//create Date object
	var dateEnd = new Date(date_end[0],date_end[1],date_end[2]);

	if (dateEnd < dateStart) {
			View.showMessage(getMessage('error_date_end_before_date_start'));
			return false;
	}
	return true;	
}

/**
 * get lease start / end dates
 * @param leaseId lease code
 * @returns record
 */
function getLeaseDates(leaseId){
	var record = null;
	var params = {
			tableName: 'ls',
			fieldNames: toJSON(['ls.ls_id', 'ls.date_start', 'ls.date_end']),
			restriction: toJSON({
				'ls.ls_id': leaseId
			})
	};
	try{
		var result = Workflow.call('AbCommonResources-getDataRecord', params);
		if(result.code == 'executed'){
			record = result.dataSet;
		}
		return record;
	}catch(e){
		Workflow.handleError(e);
		return false;
	}
}


function onAutoCompleteSelect(form, fieldName, selectedValue){
	if (fieldName == "ls_resp.clause_type_id" ) {
		setAmenityButton(fieldName, selectedValue);
	}
}