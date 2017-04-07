var drawingController = View.createController('drawingController', {


	afterInitialDataFetch: function() {
	
		// specify a handler for when an onclick event occurs in the Drawing component
    	this.cadPanel.addEventListener('onclick', onClickHandler);
	}
});



function onTreeClick(ob) {
	View.getControl('', 'cadPanel').addDrawing(ob.restriction);
}

function onClickHandler(pk, selected)
{
	if (selected) {
		var args = new Object ();
		//args.target = 'opener';
		//args.type ='openDialog';
		//args.parentPanelId = this.id;
		//args.viewName = 'uc-sc-rm-inventory-popup.axvw';
		args.width = 900;
		args.height = 600;
		args.closeButton = false;
		
	    //var myDlgCmd = new Ab.command.openDialog(args);
		var r = new Ab.view.Restriction();
	    r.addClause("rm.bl_id", pk[0], "=", true);
	 	r.addClause("rm.fl_id", pk[1], "=", true);
	    r.addClause("rm.rm_id", pk[2], "=", true);
	    
		
		View.openDialog('uc-sc-rm-inventory-popup.axvw', r, false, args);
	    
		//myDlgCmd.restriction = r;
	    //myDlgCmd.handle();
	}
}


