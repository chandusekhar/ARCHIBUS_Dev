/**
 * Controller for the Work request craftsperson.
 */
var opsConsoleWrcfController = View.createController('opsConsoleWrcfController', {
	
	/**
	 * Record before Edit.
	 */
	recordBeforeEdit : null,
	
	isPlaner: false,
	cfSubstitues: [],
	
    statusOptionDom: null,
	
	/**
	 * After view loaded.
	 */
	afterViewLoad : function() {
		// KB3016857 -Allow craftspersons to be members of more than one team
		var cfSelectValueRestriction = this.getSelectCfRestriction();
		
		this.wrcfForm.fields.get("wrcf.cf_id").actions.get(0).command.commands[0].dialogRestriction = cfSelectValueRestriction;
		this.wrcfForm.fields.get("wrcf.cf_id").actions.get(0).config.commands[0].dataSource = 'craftspersonSelectValueDS';
		this.wrcfForm.fields.get("wrcf.cf_id").actions.get(0).config.commands[0].restriction = cfSelectValueRestriction;

		this.isPlaner = this.craftspersonSelectValueDS.getRecords("cf.is_planner = 1 and cf.email='" + View.user.email + "'").length > 0 ? true : false;
		this.cfSubstitues = this.cfSubstituesDS.getRecords();
		
		this.statusOptionDom = jQuery(this.wrcfForm.fields.get('wrcf.status').dom).clone();
		
	},
	
	 /**
     * Disable delete after issued.
     */	
	wrcfGrid_afterRefresh: function(){
		var wrIds = [];
		
		if (this.wrcfGrid.restriction.clauses[0].op == 'IN') {
			wrIds = View.getOpenerView().WRids;
		} else {
			wrIds = [ this.wrcfGrid.restriction.clauses[0].value ];
		}

		//get application parameter, if = 0, then make the resource panels read-only if estimate step is completed.
		var EditEstimationAndScheduling = View.activityParameters['AbBldgOpsOnDemandWork-EditEstAndSchedAfterStepComplete'];
		var isSchedulingCompleted = false;
		if(EditEstimationAndScheduling == '0'){
			for(var i=0;i<wrIds.length;i++){
				isSchedulingCompleted = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-isEstimateOrSchedulingCompleted',wrIds[i],'scheduling').value;
				if(isSchedulingCompleted){
					View.panels.get('wrcfGrid').actions.get('addCf').show(false);
					break;
				}
			}
		}
		
		this.wrcfGrid.gridRows.each(function(row) {
			var wrId = row.getFieldValue('wrcf.wr_id');
			var status = row.getFieldValue('wr.status');
			var actualHours = row.getFieldValue('wrcf.hours_straight');
			var doubleHours = row.getFieldValue('wrcf.hours_double');
			var overHours = row.getFieldValue('wrcf.hours_over');
			
			if(isSchedulingCompleted){
				row.removeActionListeners();
				jQuery('#wrcfGrid_row'+row.getIndex()+'_deleteWrcf').remove();
			}
			
			if(actualHours>0 || doubleHours>0 || overHours>0 ){
				jQuery('#wrcfGrid_row'+row.getIndex()+'_deleteWrcf').remove();
			}
			
			if(status!="A" && status!="AA"){
				var panel = View.panels.get('wrcfGrid');
				//KB3042844 - disable Remove action after work request issued
				disableRemoveAfterIssued(panel,'wrcf.hours_est','deleteWrcf');
				panel.gridRows.each(function(row) {
					jQuery('#wrcfGrid_row'+row.record.index+'_copyWrcf').remove();
				});
			}
		});
		
		//KB3044170 - Allow craftspersons to view, read-only, the scheduling records of other craftspersons, remove action listeners for the other cf rows
		this.updateForCf();
	},
	
	/**
     * KB3042446 - Hide add cf button for role craftsperson
     */
	updateForCf: function(){
		
		var userRoleOfTheRequet = View.getOpenerView().userRoleOfTheRequet;
		if(userRoleOfTheRequet == 'craftsperson'){
			if(this.isPlaner){
				this.wrcfGrid.actions.get('addCf').show(true);
				
			}else{
				this.wrcfGrid.actions.get('addCf').show(false);
			}
			
			var controller = this;
			
			//KB3044170 - Allow craftspersons to view, read-only, the scheduling records of other craftspersons, remove action listeners for the other cf rows
			this.wrcfGrid.gridRows.each(function(row) {
				if(row.getFieldValue('cf.email')!=View.user.email && controller.notCfSubstitue(row.getFieldValue('wrcf.cf_id'))){
					row.removeActionListeners();
				}
			});
			
			jQuery('input[id^=wrcfGrid_row][id$=_deleteWrcf]').remove();
		}
	},
	
	/**
     * check if given cf_id is current user cf substitue
     */
	notCfSubstitue: function(cfId){
		var isNotCfSubstitue = true;
		for(var i=0;i<this.cfSubstitues.length;i++){
			if(cfId == this.cfSubstitues[i].getValue('workflow_substitutes.cf_id')){
				isNotCfSubstitue = false;
				break;
			}
		}
		
		return isNotCfSubstitue;
	},

	/**
	 * Clear the form restriction before add new.
	 */
	wrcfForm_beforeRefresh : function() {
		if (this.wrcfForm.newRecord) {
			this.wrcfForm.restriction = null;
		}
		
		var newStatusOption = this.statusOptionDom.clone();
		newStatusOption.replaceAll(jQuery(this.wrcfForm.fields.get('wrcf.status').dom));
		this.wrcfForm.fields.get('wrcf.status').dom = newStatusOption.get(0);
	},
	
	/**
	 * Store the record before edit.
	 */
	wrcfForm_afterRefresh : function() {
		var wrDetailsControllers = View.controllers.get('wrDetails');
		if(wrDetailsControllers){
			wrDetailsControllers.wrcfForm_afterRefresh();
		}
		
		this.wrcfForm.enableField('wrcf.status',true);
		
		if (!this.wrcfForm.newRecord) {
			this.recordBeforeEdit = View.panels.get('wrcfForm').getFieldValues(true);
			var status = this.wrcfForm.getFieldValue('wrcf.status');
			if(status=='Returned'){
				if(this.wrcfForm.getFieldValue('wrcf.hours_straight') > 0 || this.wrcfForm.getFieldValue('wrcf.hours_double') > 0 || this.wrcfForm.getFieldValue('wrcf.hours_over') > 0 ){
					var statusField = this.wrcfForm.fields.get('wrcf.status').dom;
					for (var i = statusField.length - 1; i >= 0; i--) {
		    			if ('Active' == statusField[i].value) {
		    				statusField.remove(i);
		    				break;
		    			}
		    		}
				}
			}else{
				var statusField = this.wrcfForm.fields.get('wrcf.status').dom;
				for (var i = statusField.length - 1; i >= 0; i--) {
	    			if ('Returned' == statusField[i].value) {
	    				statusField.remove(i);
	    				break;
	    			}
	    		}
				
				if(status == 'Complete'){
					if(this.wrcfForm.getFieldValue('wrcf.hours_straight') > 0 || this.wrcfForm.getFieldValue('wrcf.hours_double') > 0 || this.wrcfForm.getFieldValue('wrcf.hours_over') > 0 ){
						this.wrcfForm.enableField('wrcf.status',false);
					}else{
						this.wrcfForm.enableField('wrcf.status',true);
					}
				}
			}
			
			var userRoleOfTheRequet = View.getOpenerView().userRoleOfTheRequet;
			if(userRoleOfTheRequet == 'supervisor'){
				if(status=='Active'){
					var statusField = this.wrcfForm.fields.get('wrcf.status').dom;
					for (var i = statusField.length - 1; i >= 0; i--) {
		    			if ('Returned' == statusField[i].value) {
		    				statusField.remove(i);
		    				break;
		    			}
		    		}
				}
			}
			
			if(this.wrcfGrid.rows[this.wrcfGrid.selectedRowIndex]){
				var wrStatus = this.wrcfGrid.rows[this.wrcfGrid.selectedRowIndex]['wr.status.raw'];
				if(wrStatus == 'Com' || wrStatus == 'S'){
					this.wrcfForm.enableField('wrcf.status',false);
				}
			}
			
		}else{
			//KB3046729 - obey timezone of work location when assign craftsperson
			var wrIds = [];
			var form = View.panels.get('wrcfForm');
			if (form.newRecord) {
				if (this.wrcfGrid.restriction.clauses[0].op == 'IN') {
					wrIds = View.getOpenerView().WRids;
				} else {
					wrIds = [ this.wrcfGrid.restriction.clauses[0].value ];
				}

				form.setFieldValue('wrcf.wr_id', wrIds[0], false);
			} else {
				wrIds = [ form.getFieldValue('wrcf.wr_id') ];
			}
			
			setCurrentLocalDateTime(form,wrIds[0],'wrcf.date_assigned','wrcf.time_assigned');
			
			var userRoleOfTheRequet = View.getOpenerView().userRoleOfTheRequet;
			if(userRoleOfTheRequet == 'craftsperson'){
				if(this.isPlaner){
					this.wrcfForm.enableField('wrcf.hours_straight', false);
					this.wrcfForm.enableField('wrcf.hours_double', false);
					this.wrcfForm.enableField('wrcf.hours_over', false);
					this.wrcfForm.enableField('wrcf.date_start', false);
					this.wrcfForm.enableField('wrcf.time_start', false);
					this.wrcfForm.enableField('wrcf.date_end', false);
					this.wrcfForm.enableField('wrcf.time_end', false);
					this.wrcfForm.enableField('wrcf.status', false);
					
				}
			}
			
			
		}
	},
	
	/**
	 * Check Primary key change before edit,  if primary key change, delete the old record and insert the new record.
	 */
	checkPrimaryKeyChange : function() {
		if (!this.wrcfForm.newRecord) {
			var newValues = View.panels.get('wrcfForm').getFieldValues(true);
			if(newValues['wrcf.cf_id']!=this.recordBeforeEdit['wrcf.cf_id']
			   ||newValues['wrcf.date_assigned']!=this.recordBeforeEdit['wrcf.date_assigned']
			     ||newValues['wrcf.time_assigned']!=this.recordBeforeEdit['wrcf.time_assigned']){
				var records = [ this.recordBeforeEdit];
				runDeleteItemsWf('wrcfGrid', 'wrcf', records);
			}
		}
	},
	
	/**
	 * Check cf validation
	 */
	checkCfValidation : function() {
		var cfId  = this.wrcfForm.getFieldValue('wrcf.cf_id');
		if(cfId){
			var restriction = this.getSelectCfRestriction();
			if(this.craftspersonSelectValueDS.getRecords(restriction + " AND (cf.cf_id = '" + cfId + "')").length > 0){
				return true;
			}else{
				View.showMessage(getMessage('cfNotValid'));
				return false;
			}
		}
		
		return true;
		
	},
	
	/**
	 * get select  cf restriction
	 */
	getSelectCfRestriction : function() {
		var cfSelectValueRestriction = '(cf.work_team_id IS NULL OR cf.work_team_id IN (select cf.work_team_id from cf where cf.email= ${sql.literal(user.email)}))';
		if (Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-checkSchemaExisting', 'cf_work_team', 'cf_id').value) {
			cfSelectValueRestriction = "(cf.work_team_id IS NULL OR cf.cf_id IN (SELECT cf_work_team.cf_id FROM cf_work_team WHERE cf_work_team.work_team_id IN (SELECT cf_work_team.work_team_id FROM cf_work_team,cf where cf_work_team.cf_id = cf.cf_id and cf.email= ${sql.literal(user.email)})))";
		}
		
		return cfSelectValueRestriction;
		
	},
	
	/**
	 * check same primary keys with existing record.
	 */
	checkSamePrimaryKeysWithExistingRecords : function() {
		var isSame = false;
		var form = View.panels.get('wrcfForm');
		var cfId = form.getFieldValue('wrcf.cf_id');
		var dateAssigned = form.getFieldValue('wrcf.date_assigned');
		var timeAssigned = form.getFieldValue('wrcf.time_assigned');
		this.wrcfGrid.gridRows.each(function(row) {
			if(row.getFieldValue('wrcf.cf_id')==cfId && row.record['wrcf.date_assigned.key'] == dateAssigned && row.record['wrcf.time_assigned.key'] == timeAssigned){
				isSame = true;
			}
		});
		
		if(isSame){
			View.showMessage(getMessage('sameWrcfPrimaryKeys'));
		}
		
		return isSame;
		
	},

	/**
	 * Save craftsperson.
	 */
	wrcfForm_onSaveWrcf : function() {
		var form = View.panels.get('wrcfForm');
		
		//For new record, check same primary keys with existing record 
		if(form.newRecord && this.checkSamePrimaryKeysWithExistingRecords()){
			return;
		}
		
		//check cf validation
		if(!this.checkCfValidation()){
			return;
		}
		
		
		var status = form.getFieldValue('wrcf.status');
		var conformComplete = true;
		var userRoleOfTheRequet = View.getOpenerView().userRoleOfTheRequet;
		if(userRoleOfTheRequet == 'craftsperson' && status  == 'Complete'){
			conformComplete = confirm(getMessage('confirmComplete'));
		}
		
		if(!conformComplete){
			return;
		}

		var wrIds = [];
		if (form.newRecord) {
			if (this.wrcfGrid.restriction.clauses[0].op == 'IN') {
				wrIds = View.getOpenerView().WRids;
			} else {
				wrIds = [ this.wrcfGrid.restriction.clauses[0].value ];
			}

			form.setFieldValue('wrcf.wr_id', wrIds[0], false);
		} else {
			wrIds = [ form.getFieldValue('wrcf.wr_id') ];
		}

		// validate form input and save form
		if (form.canSave()) {
			try {
				
				this.checkPrimaryKeyChange();
				
				var newRecord = form.getFieldValues(true);
				for ( var i = 0; i < wrIds.length; i++) {
					newRecord['wrcf.wr_id'] = wrIds[i];
					Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-saveWorkRequestCraftsperson', newRecord);
				}

				View.panels.get('wrcfGrid').refresh();
				// refresh cost panel
				if(this.wrCosts){
					this.wrCosts.refresh();
				}
				form.closeWindow();
				//View.getOpenerView().panels.get('wrList').refresh();
				//keepConsoleReqeustsSelectedAfterRefresh();
				View.getOpenerView().controllers.get('opsConsoleWrListController').resetSelectedRowIcons();
				
				if(userRoleOfTheRequet == 'craftsperson' && status  == 'Complete'){
					View.getOpenerView().panels.get('wrList').refresh();
					keepConsoleReqeustsSelectedAfterRefresh();
					View.getOpenerView().closeDialog();
				}
				
			} catch (e) {
				form.validationResult.valid = false;
				form.displayValidationResult(e);
				return false;
			}
		} else {
			return false;
		}
	},

	/**
	 * Delete craftsperson.
	 */
	wrcfGrid_onDeleteWrcf : function(row, action) {
		var records = [ row.panel.getPrimaryKeysForRow(row.record) ];
		runDeleteItemsWf('wrcfGrid', 'wrcf', records);
		// refresh cost panel
		if(this.wrCosts){
			this.wrCosts.refresh();
		}
		
		View.getOpenerView().controllers.get('opsConsoleWrListController').resetSelectedRowIcons();
	},
	
	/**
	 * Delete craftsperson.
	 */
	wrcfGrid_onCopyWrcf : function(row, action) {
		var record = row.record;
		this.wrcfForm.setFieldValue('wrcf.cf_id', record["wrcf.cf_id"]);
		this.wrcfForm.setFieldValue('wrcf.work_type', record["wrcf.work_type.raw"]);
		this.wrcfForm.setFieldValue('wrcf.hours_est', record["wrcf.hours_est"]);
		this.wrcfForm.setFieldValue('wrcf.date_assigned', record["wrcf.date_assigned.key"]);
		this.wrcfForm.setInputValue('wrcf.time_assigned', record["wrcf.time_assigned.raw"]);
	},

	/**
	 * Hide fields.
	 */
	hideFields : function(fields) {
		// hide fields from 'Fields to Hide' list
		for ( var i = 0; i < fields.length; i++) {
			this.wrcfGrid.showColumn(fields[i], false);
			this.wrcfForm.showField(fields[i], false);
		}

		// update grid
		this.wrcfGrid.update();
	}
});

/**
 * Over write core API to open Add new dialog and close select value dialog.
 */
Ab.grid.SelectValue.prototype.onAddNew = function() {
	var parameters = Ab.view.View.selectValueParameters;
	var title = parameters.title;
	View.closeDialog();
	View.openDialog(this.addNewDialog, null, false, {
		x : 100,
		y : 100,
		width : 850,
		height : 800,
		title : this.getLocalizedString(Ab.grid.SelectValue.z_TITLE_ADD_NEW) + ' ' + title,
		useAddNewSelectVDialog : false,
		closeButton : false
	});
}