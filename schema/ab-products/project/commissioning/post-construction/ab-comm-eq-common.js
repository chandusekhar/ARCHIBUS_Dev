function refreshParentView(){
	if(View.parameters){
		if(View.parameters.callback){
			View.parameters.callback.call();
		}
	}else{
		var openerView = View.getOpenerView();
		if(openerView.parameters && openerView.parameters.callback){
			openerView.parameters.callback.call();
		}
	}
}

function openEquipmentDetails(ctx){
	var eqId = ctx.restriction['eq.eq_id'];
	var parentGrid = View.panels.get(ctx.parentPanelId);
	View.openDialog('ab-comm-eq-details.axvw', null, false, {
	    afterInitialDataFetch: function(dialogView) {
	        var console = dialogView.panels.get('commEqDetailsConsole');
	        console.setFieldValue('eq.eq_id', eqId);
	        dialogView.controllers.get('commEqDetails').commEqDetailsConsole_onShow();
	    },
	    callback: function() {
	    	parentGrid.refresh(parentGrid.restriction);
	    } 
	});
}