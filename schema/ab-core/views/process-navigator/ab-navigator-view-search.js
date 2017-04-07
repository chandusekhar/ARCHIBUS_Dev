// ab-navigator-view-search.js

var viewSearchController = View.createController('viewSearchController', {

	/**
	 * Initialize the view's grid with the search parameters.
	 */
	afterLayout: function () {
		this.setSearchParameters(View.parameters.searchParameters);
	},

	/**
	 * Refresh the existing grid with new search parameters.
	 */
	refreshSearchResults: function(searchParams) {
		this.setSearchParameters(searchParams);
		this.taskSearchReportGrid.refresh();
	},
	
	/**
	 * Helper for initialization and refresh.
	 */
	setSearchParameters: function(searchParams) {
		var parameterText = searchParams.split(';');
		var searchPanel = this.taskSearchReportGrid || View.getControl('','taskSearchReportGrid');
		
		searchPanel.addParameter('taskTitleColumn', parameterText[0]);
		searchPanel.addParameter('processesTitleColumn', parameterText[1]);
		searchPanel.addParameter('activitiesTitleColumn', parameterText[2]);
		searchPanel.addParameter('productsTitleColumn', parameterText[3]);
		searchPanel.addParameter('searchString', parameterText[4]);
	}
});

/**
 * Open the dialog's selected task in the opener window's viewContent panel
 * Close the dialog
 */
function openTaskInViewContent() {
	var searchPanel = View.getControl('','taskSearchReportGrid');
	var row = searchPanel.rows[searchPanel.selectedRowIndex];
	var viewFile = row['afm_ptasks.task_file'];
	var openerView = View.getOpenerWindow().View;
	if (openerView != null) {
		var targetPanel = openerView.panels.get('viewContent');
		targetPanel.taskInfo ={
			activityId:  row['afm_ptasks.activity_id'],
			processId:  row['afm_ptasks.process_id'],
			taskId:  row['afm_ptasks.task_identifier']
		};
		targetPanel.loadView(viewFile);
		
		openerView.closeDialog();
	}
}
