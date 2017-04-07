var abDefineBuilding_tabOwnerController = View.createController('abDefineBuilding_tabOwnerController', {
	restriction: null,

	newRecord: null,
	
	afterInitialDataFetch: function () {
		this.refreshRestriction();
	},
	
	refreshRestriction: function () {
		var tabs = View.getOpenerView().panels.get("abDefineBuilding_tabs");
		if (tabs && valueExists(tabs.restriction)) {
			this.restriction = tabs.restriction;
		}
		if (tabs && valueExists(tabs.newRecord)) {
			this.newRecord = tabs.newRecord;
		}
		
		if (this.newRecord) {
			this.abDefineBuilding_owner.refresh(null, this.newRecord);
		} else {
			this.abDefineBuilding_owner.refresh(this.restriction);
		}
	}
});

function refreshOwnerGrid() {
	abDefineBuilding_tabOwnerController.abDefineBuilding_owner.refresh();
}

function openOwnershipTransactionDialog(ctx, newRecord){
	var blRestriction = abDefineBuilding_tabOwnerController.restriction;
	if(blRestriction && blRestriction.clauses.length > 0){
		var blId = blRestriction.clauses[0].value;
	}
	
	var restriction = null;
	if (!newRecord) {
		restriction = new Ab.view.Restriction();
		restriction.addClause('ot.bl_id', blId);
		
		if(valueExists(ctx.restriction) && valueExists(ctx.restriction["ot.ot_id"])) {
			restriction.addClause('ot.ot_id', ctx.restriction["ot.ot_id"]);
		}
	}
	
	View.openDialog('ab-define-building-ownership-transaction.axvw', restriction, newRecord, {
		afterViewLoad: function(dialogView){
			if (newRecord) {
				var dialogController = dialogView.controllers.get('abDefineBuilding_ownershipTransactionController');
			    dialogController.abDefineBuilding_ownershipTransaction.setFieldValue('ot.bl_id', blId);
			}
		},
		callbackMethod: function(dialogView) {
			refreshOwnerGrid();
		}
	});
}