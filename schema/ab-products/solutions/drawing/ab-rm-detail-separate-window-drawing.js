
var controller = View.createController('rmDetailController', {
	afterViewLoad: function() {	
	
    	// overrides Grid.onChangeMultipleSelection to load a drawing
    	this.rmDetailSeparateWindow_floors.addEventListener('onMultipleSelectionChange', function(row) {
			controller.rmDetailSeparateWindow_cadPanel.addDrawing(row, null);
	    });
	    
    	// specify a handler for when an onclick event occurs in the Drawing component
    	this.rmDetailSeparateWindow_cadPanel.addEventListener('onclick', onClickHandler);
	}
});

function onClickHandler(pk, selected)
{
	if (selected) {
		var args = new Object ();
		args.target = 'opener';
		args.type ='openDialog';
		args.parentPanelId = this.id;
		args.viewName = 'ab-rm-detail-separate-window-drawing-popup.axvw';
		args.width = 550;
		args.height = 300;
		
	    var myDlgCmd = new Ab.command.openDialog(args);
	    var r = new Ab.view.Restriction();
	    r.addClause("rm.bl_id", pk[0], "=", true);
	 	r.addClause("rm.fl_id", pk[1], "=", true);
	    r.addClause("rm.rm_id", pk[2], "=", true);
	    myDlgCmd.restriction = r;
	    myDlgCmd.handle();
	}
}



