var abPropertiesDefineForm_tabOwnerController = View.createController('abPropertiesDefineForm_tabOwnerController', {
	afterInitialDataFetch: function () {
		var restriction = new Ab.view.Restriction();
		var tabs = View.getOpenerView().panels.get("abPropertiesDefineForm_tabs");
		var newRecord = tabs.parameters.newRecord;
		var tabsRestriction = tabs.parameters.restriction;
		
		if(newRecord){
			this.abPropertiesDefineForm_owner.show(false);
		}else{
			if(tabsRestriction){
				if(tabsRestriction["property.pr_id"]) {
					restriction.addClause('property.pr_id', tabsRestriction["property.pr_id"]);
				} else if(tabsRestriction.clauses && tabsRestriction.clauses[0]){
					restriction.addClause('property.pr_id', tabsRestriction.clauses[0].value);
				}
			}
			this.abPropertiesDefineForm_owner.refresh(restriction);
		}
	},
	
	abPropertiesDefineForm_owner_beforeRefresh: function(){
		var tabs = View.getOpenerView().panels.get("abPropertiesDefineForm_tabs");
		var newRecord = tabs.parameters.newRecord;
		var tabsRestriction = tabs.parameters.restriction;
		
		var noPropertyRestriction = new Ab.view.Restriction();
		noPropertyRestriction.addClause('property.pr_id', '_');
		
		// if no property selected hide the grid and the edit owner form
		if(newRecord == true){
			this.abPropertiesDefineForm_owner.restriction = noPropertyRestriction;
			this.abPropertiesDefineForm_owner.show(false);
		} else{
			if(tabsRestriction){
				this.abPropertiesDefineForm_owner.restriction = tabsRestriction;
			}
		}
	}
});

function refreshOwnerGrid (){
	abPropertiesDefineForm_tabOwnerController.abPropertiesDefineForm_owner.refresh();
}

function openOwnershipTransactionDialog(ctx, newRecord){
	var prRestriction = abPropertiesDefineForm_tabOwnerController.abPropertiesDefineForm_owner.restriction;
	if (valueExists(prRestriction) && valueExists(prRestriction["property.pr_id"])) {
		var prId = prRestriction["property.pr_id"];
	} else if (valueExists(prRestriction) && valueExists(prRestriction.clauses) && prRestriction.clauses.length > 0) {
		var prId = prRestriction.clauses[0].value;
	}
	
	var restriction = null;
	if (!newRecord) {
		restriction = new Ab.view.Restriction();
		restriction.addClause('ot.pr_id', prId);
		
		if (valueExists(ctx.restriction) && valueExists(ctx.restriction["ot.ot_id"])) {
			restriction.addClause('ot.ot_id', ctx.restriction["ot.ot_id"]);
		}
	}
	
	View.openDialog('ab-rplm-properties-define-form-ownership-transaction.axvw', restriction, newRecord, {
		afterViewLoad: function(dialogView){
			if (newRecord) {
				var dialogController = dialogView.controllers.get('abPropertiesDefineForm_ownershipTransactionController');
			    dialogController.abPropertiesDefineForm_ownershipTransaction.setFieldValue('ot.pr_id', prId);
			}
		},
		callbackMethod: function(dialogView) {
			refreshOwnerGrid();
		}
	});
}