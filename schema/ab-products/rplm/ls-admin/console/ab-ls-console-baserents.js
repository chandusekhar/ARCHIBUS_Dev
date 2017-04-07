var abRepmLeaseDetails_tabRecurringController = View.createController('abRepmLeaseDetails_tabRecurringController',{

	lsId:null,
	
	refreshView: function(lsId){
		this.lsId = lsId;
		var restriction = new Ab.view.Restriction();
		restriction.addClause('cost_tran_recur.ls_id', this.lsId, '=');
		this.gridBaseRents.refresh(restriction);
		
	},
	
	gridBaseRents_onNew: function(){
		this.add_edit_item(null, getMessage('add_base_rent'));
	},
	
	gridBaseRents_onCostProfile: function(){
		var leaseId = this.lsId;
		
		View.openDialog('ab-repm-cost-ls-profile.axvw', null, false, {
			width: 1024,
			height: 800,
			lsId: leaseId
		});
	},
	
	add_edit_item: function(costTranRecurId , title){
		var leaseId = this.lsId;
		var openerController = this;
		// runtime parameters that are passed to pop-up view
		var runtimeParameters = {
				cost_tran_recur_id: costTranRecurId,
				leaseId: leaseId,
				refreshPanels: new Array('gridBaseRents'),
				title: title
		}
		
		/*
		 * 03/30/2010 IOAN 
		 * kb 3026730 increase height of pop-up
		 */
		View.openDialog('ab-rplm-lsadmin-add-edit-baserent.axvw',null, true, {
			width:800,
			height:700, 
			closeButton:true,
			runtimeParameters: runtimeParameters
		});
	}
});

/**
 * Edit cost record event handler.
 * @param ctx command context
 */
function onEditCost(ctx){
	if (valueExists(ctx.restriction)) {
		var costTranRecurId = ctx.restriction['cost_tran_recur.cost_tran_recur_id'];
		var controller = View.controllers.get('abRepmLeaseDetails_tabRecurringController'); 
		controller.add_edit_item(costTranRecurId, getMessage('edit_base_rent'));
	}
}
