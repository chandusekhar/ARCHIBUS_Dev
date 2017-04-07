var mngRPIPropTransController = View.createController('mngRPIPropTrans',{
	selectedItem:null,
	posted:0,
	mngRPIFindMngController:null,
	afterInitialDataFetch:function(){
		this.selectedItem = View.getView('parent').controllers.get('mngRPIWizard').selectedItem;
		this.mngRPIFindMngController = View.getView('parent').controllers.get('mngRPIWizard').mngRPIFindMngController;
		formMakeCustom(this.formPropertyInfo, this.selectedItem);
		
		gridMakeCustom(this.gridTransactions, this.selectedItem);
	},
	formPropertyInfo_onDetails:function(){
		var selected = this.selectedItem;
		View.openDialog('ab-rplm-gvmnt-rp-property-details.axvw', {}, true, { 
		    width: 800, 
		    height: 600, 
		    closeButton: true,
			selectedItem:selected
		});
	},
	gridTransactions_onNew:function(){
		/*
		 * 04/09/2010 IOAN KB 3026958
		 */
		if(this.posted == 0 && this.gridTransactions.gridRows.length > 0){
			View.showMessage(getMessage('no_posted_trans'));
			return;
		}else{
			var selected = this.selectedItem;
			View.openDialog('ab-rplm-gvmnt-rp-add-new-trans.axvw', {}, true, { 
			    width: 800, 
			    height: 600, 
			    closeButton: true,
				selectedItem:selected,
				isDialog:true
			});
		}
	},
	gridTransactions_details_onClick:function(row){
		var selected = row.getFieldValue('grp_trans.grp_trans_id');
		var selectedProperty = this.selectedItem;
		View.openDialog('ab-rplm-gvmnt-rp-trans-details.axvw', {}, true, { 
		    width: 800, 
		    height: 600, 
		    closeButton: true,
			selectedTrans:selected,
			selectedProperty:selectedProperty
		});
	},
	gridTransactions_approve_onClick:function(row){
		var property = this.selectedItem;
		var transaction = row.getFieldValue('grp_trans.grp_trans_id').toString();
		var user = View.user.name;
		var type = row.getFieldValue('grp_trans.trans_type');
		var panel = this.gridTransactions;
		var form = this.formPropertyInfo;
		var mngRPIFindMngController = this.mngRPIFindMngController;
		View.confirm(getMessage('msg_approve_transaction'),function(button){
			if(button == 'yes'){
				try{
					var result = Workflow.callMethod('AbRPLMGovPropertyRegistry-GovPropertyRegistryService-approveGovPropRegDataTransaction', property, transaction, user);
					formMakeCustom(form, property);
					gridMakeCustom(panel, property);
					mngRPIFindMngController.gridPropertyList.refresh();
				}catch(e){
					Workflow.handleError(e);
				}
			}
		});
	},
	gridTransactions_reject_onClick:function(row){
		var property = this.selectedItem;
		var transaction = row.getFieldValue('grp_trans.grp_trans_id').toString();
		var user = View.user.name;
		var panel = this.gridTransactions;
		var form = this.formPropertyInfo;
		var tran_posted = this.posted;
		var mngRPIFindMngController = this.mngRPIFindMngController;
		var tabs = View.getView('parent').panels.get('tabsMngRPI');
		View.confirm(getMessage('msg_reject_transaction'),function(button){
			if(button == 'yes'){
				try{
					var result = Workflow.callMethod('AbRPLMGovPropertyRegistry-GovPropertyRegistryService-rejectGovPropRegDataTransaction', property, transaction, user);
					// kb 3027022 IOAN 09/29/2010 move to first tab when transactions is not posted
					if (tran_posted == 0) {
						mngRPIFindMngController.consoleSearch_onFilter();
						tabs.selectTab('page0');
					}
					else {
						formMakeCustom(form, property);
						gridMakeCustom(panel, property);
						mngRPIFindMngController.gridPropertyList.refresh();
					}
				}catch(e){
					Workflow.handleError(e);
				}
			}
		});
	},
	doRefresh: function(){
		var form = this.formPropertyInfo;
		var panel = this.gridTransactions;
		var property = this.selectedItem;
		var mngRPIFindMngController = this.mngRPIFindMngController;
		formMakeCustom(form, property);
		gridMakeCustom(panel, property);
		mngRPIFindMngController.gridPropertyList.refresh();
	}
})

function formMakeCustom(form, property){
	// refresh and make custom changes on form
	form.addParameter('selected', property);
	form.refresh();
	mngRPIPropTransController.posted = form.getFieldValue('grp.posted');
	if(form.getFieldValue('grp.posted') == 0 ){
		form.setFieldValue('grp.date_last_update','');
		form.setFieldValue('grp.time_last_update','');
		form.setFieldValue('grp.last_updated_by','');
	}
	form.setFieldValue('grp.posted', getMessage('posted_'+form.getFieldValue('grp.posted')));
	var value = form.getFieldValue('grp.status_indicator');
	switch(value){
		case 'Z':
			value = getMessage('notApplicable');
			break;
		case 'A':
			value = getMessage('active');
			break;
		case 'I':
			value = getMessage('inactive');
			break;
		case 'E':
			value = getMessage('excess');
			break;
		case 'D':
			value = getMessage('disposed');
			break;
	}
	form.setFieldValue('grp.status_indicator', value);
}

function gridMakeCustom(grid, property){
	// refresh and make custom changes on grid
	grid.addParameter('selected', property);
	grid.refresh();
	grid.removeSorting();
	for(var i=0;i<grid.gridRows.length;i++){
		var row = grid.gridRows.get(i);
		row.setFieldValue('grp_trans.date_time_of_transaction', row.record['grp_trans.date_of_transaction']+' '+row.record['grp_trans.time_of_transaction']);
	}
}
