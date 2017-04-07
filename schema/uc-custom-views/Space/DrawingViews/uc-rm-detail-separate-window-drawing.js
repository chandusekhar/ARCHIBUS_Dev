
var controller = View.createController('rmDetailController', {
	afterViewLoad: function() {	
	
    	// overrides Grid.onChangeMultipleSelection to load a drawing
    	this.floors.addEventListener('onMultipleSelectionChange', function(row) {
			controller.cadPanel.addDrawing(row, null);
	    });
	    
    	// specify a handler for when an onclick event occurs in the Drawing component
    	this.cadPanel.addEventListener('onclick', onClickHandler);
	}
});

function onClickHandler(pk, selected)
{
	if (selected) {
		var args = new Object ();
		args.target = 'opener';
		args.type ='openDialog';
		args.parentPanelId = this.id;
		args.viewName = 'uc-rm-detail-separate-window-drawing-popup.axvw';
		args.width = 600;
		args.height = 600;
		
	    var myDlgCmd = new Ab.command.openDialog(args);
	    var r = new Ab.view.Restriction();
	    r.addClause("rm.bl_id", pk[0], "=", true);
	 	r.addClause("rm.fl_id", pk[1], "=", true);
	    r.addClause("rm.rm_id", pk[2], "=", true);
	    myDlgCmd.restriction = r;
	    myDlgCmd.handle();
	}
}



