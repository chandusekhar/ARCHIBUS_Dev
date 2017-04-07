// Function automatically called by axvw when the form loads.
function user_form_onload() {
	// refresh the sub-panel-grids
	var form = AFM.view.View.getControl('', 'detailsPanel');
	var wo_id = form.getFieldValue('wo.wo_id');
	
	var restriction = "wr_id IN (SELECT wr_id FROM wr WHERE wo_id=" + wo_id+")";

	var wrGrid = AFM.view.View.getControl('', 'wrPanel');
	wrGrid.refresh(restriction);

	var cfGrid = AFM.view.View.getControl('', 'laborPanel');
	cfGrid.refresh(restriction);
	
	var otherGrid = AFM.view.View.getControl('', 'otherPanel');
	otherGrid.refresh(restriction);
	
	var tlGrid = AFM.view.View.getControl('', 'toolsPanel');
	tlGrid.refresh(restriction);

}