var abRepmLeaseDetails_tabAmendmentsController = View.createController('abRepmLeaseDetails_tabAmendmentsController',{
	lsId:null,

	refreshView: function(lsId){
		this.lsId = lsId;
		var restriction = new Ab.view.Restriction();
		restriction.addClause('ls_amendment.ls_id', this.lsId, '=');
		this.gridLeaseAdminAmendments.refresh(restriction);
		
	},

	gridLeaseAdminAmendments_onNew: function(){
		this.add_edit_item(this.lsId, null ,getMessage('add_new_amendment'));
	},

	add_edit_item: function(lsId, lsAmendId, title){
		var controller = this;
		View.openDialog('ab-rplm-lsadmin-add-edit-amendment.axvw',null, true, {
			width:800,
			height:700, 
			closeButton:true,
				afterInitialDataFetch:function(dialogView){
					var dialogController = dialogView.controllers.get('rplmAmendment');
					dialogController.selectedId = lsAmendId;
					dialogController.leaseId = lsId;
					dialogController.refreshControllers = new Array();
					dialogController.refreshPanels = new Array();
					dialogController.formAmendment.setTitle(title);
					if(lsAmendId == null){
						dialogController.formAmendment.refresh(null, true);
						//dialogController.formClause.setFieldValue('cost_tran_recur.cost_cat_id', 'RENT - BASE RENT');
					}
					else{
						dialogController.formAmendment.refresh({'ls_amendment.ls_amend_id':lsAmendId}, false);
					}
				}, 
				callback: function(){
					controller.gridLeaseAdminAmendments.refresh(controller.gridLeaseAdminAmendments.restriction);
				}
		});
	}
});

function onOpenAmendment(ctx){
	var record = ctx.row.record;
	View.showDocument({'ls_amend_id':record['ls_amendment.ls_amend_id']},'ls_amendment','doc',record['ls_amendment.doc']);
}

function onEditAmendment(ctx) {
	if (valueExists(ctx.row)) {
		var lsId = ctx.row.getFieldValue('ls_amendment.ls_id');
		var lsAmendId = ctx.row.getFieldValue('ls_amendment.ls_amend_id');
		var controller = View.controllers.get('abRepmLeaseDetails_tabAmendmentsController');
		controller.add_edit_item(lsId, lsAmendId, getMessage('edit_amendment'));
		
	}
}