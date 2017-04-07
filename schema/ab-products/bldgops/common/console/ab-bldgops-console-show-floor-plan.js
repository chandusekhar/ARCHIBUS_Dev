/**
 * Controller of showing work request floor plan
 */
View.createController('ShowFloorPlanController', {

	afterViewLoad : function() {
		var openerView = View.getOpenerView();
		// specify a handler for when user selects a room in the drawing
		this.drwingPanel.addEventListener('onclick', this.onClickHandler);

		var dwgRestriction = View.getOpenerView().dialogRestriction;
		if (dwgRestriction != null) {
			var blId = dwgRestriction.findClause('rm.bl_id').value;
			var flId = dwgRestriction.findClause('rm.fl_id').value;
			var rmId = dwgRestriction.findClause('rm.rm_id').value;
			var dwgName = dwgRestriction.findClause('rm.dwgname').value;

			var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, rmId, dwgName);
			this.drwingPanel.addDrawing(dcl);
		}
	},

	onClickHandler : function(pk, selected) {
		// call callback method
		if (View.parameters.callback) {
			View.parameters.callback(pk[2]);
			// The .defer method used here is required for proper functionality with Firefox 2
			View.closeThisDialog.defer(100, View);
		}
	}

});
