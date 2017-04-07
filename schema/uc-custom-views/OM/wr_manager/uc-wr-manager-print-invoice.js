// Function automatically called by axvw when the form loads.
function user_form_onload() {
	// refresh the sub-panel-grids
	var form = AFM.view.View.getControl('', 'detailsPanel');
	var wr_id = form.getFieldValue('wr.wr_id');
	
	var restriction = "wr_id = " + wr_id;
	
	var cfGrid = AFM.view.View.getControl('', 'laborPanel');
	cfGrid.refresh(restriction);
	
	var otherGrid = AFM.view.View.getControl('', 'otherPanel');
	otherGrid.refresh(restriction);
	
	var tlGrid = AFM.view.View.getControl('', 'toolsPanel');
	tlGrid.refresh(restriction);

}