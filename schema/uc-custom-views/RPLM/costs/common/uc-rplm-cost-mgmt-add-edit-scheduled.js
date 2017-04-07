var addEditScheduledCostController = View.createController('addEditScheduledCost',{
	
	openerController:null,
	
	addScheduledCostForm_onSave: function(){
		if(this.addScheduledCostForm.save()){
			this.openerController.scheduledCostGrid.refresh();
			View.closeThisDialog();
		}
	},
	addScheduledCostForm_onCancel: function(){
		View.closeThisDialog();
	},
	editScheduledCostForm_onSave: function(){
		if (this.editScheduledCostForm.save()) {
			this.openerController.scheduledCostGrid.refresh();
			View.closeThisDialog();
		}
	},
	editScheduledCostForm_onCancel: function(){
		View.closeThisDialog();
	},
	makeCategoryType: function(isBuilding, isProperty, isLease, isAccount, isNew){
		var panel = (isNew?this.addScheduledCostForm:this.editScheduledCostForm);
		var restriction = new Ab.view.Restriction();
		if(isLease){
			restriction.addClause('cost_cat.rollup_prorate', 'ALL%', 'LIKE');
			restriction.addClause('cost_cat.rollup_prorate', 'LEASE%', 'LIKE', 'OR');
		}else if(isBuilding){
			restriction.addClause('cost_cat.rollup_prorate', 'ALL%', 'LIKE');
			restriction.addClause('cost_cat.rollup_prorate', 'BLDG%', 'LIKE', 'OR');
		}else if(isProperty){
			restriction.addClause('cost_cat.rollup_prorate', 'ALL%', 'LIKE');
			restriction.addClause('cost_cat.rollup_prorate', 'PROP%', 'LIKE', 'OR');
		}else if(isAccount){
			restriction.addClause('cost_cat.rollup_prorate', 'ALL%', 'LIKE');
		}
		var field = panel.fields.get('cost_tran_sched.cost_cat_id');
		var command = field.actions.items[0].command.commands[0];
		command.dialogRestriction = restriction;
	}
})