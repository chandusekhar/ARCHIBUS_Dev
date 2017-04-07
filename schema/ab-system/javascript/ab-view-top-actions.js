/*******************************************************
	ab-view-top-actions.js
 *******************************************************/
//currentTgrpFormat will be used by visible fields form to set up
//the variable tgrpFomat of common-sort-visiblefields.js
var currentTgrpFormat = "";

var afmActionViewName   = "";
var afmAbsoluteAppPath  = "";
var afmViewTitle	= "";
//XXX: overwritten by ab-view-top-actions.xsl
var bShowSaveAsFileName = "true";

function printOut()
{
	//XXX
	//??? print out the the content of the frame named by "viewFrame"
	var objFrame = getFrameObject(window, "viewFrame");
	if (objFrame == null){
		var objFrame = getFrameObject(top.window, "viewFrame");
	}
	if(objFrame != null){
		//target frame object must be focused at first
		objFrame.focus();
		//if objFrame has frames, leave the choice that what'll be
		//printed to users 
		objFrame.print();
	}

}

function addMyFavorite() {
    var openingView = top;
    if (openingView != null && valueExists(openingView.AFM)) {
		var navController = openingView.AFM.view.View.controllers.get('navigator');
		if (navController != null) {
			var taskRecord = navController.viewContent.taskRecord;

			// source view may be an afm_ptask (PNav view) or a afm_process (Dashboard view)
			var isPtask = true;
			if (taskRecord != null) {
				var viewName = taskRecord.getValue('afm_ptasks.task_file');
				if (viewName == null || typeof viewName == 'undefined') {
					viewName = taskRecord.getValue('afm_processes.dashboard_view');
					if (viewName != null && typeof viewName != 'undefined') {
						isPtask = false;
					}
				}
				var userName = openingView.AFM.view.View.user.name;
				var myFavoriteExists = false;

				// is the current view a myFavorite? if yes, reset confirm dialog message
				if (taskRecord.getValue('afm_ptasks.is_hotlist.raw') == '1' && taskRecord.getValue('afm_ptasks.hot_user_name') == userName) {
					myFavoriteExists = true;
					viewName = viewName.substring(0, viewName.indexOf('-' + userName)) + '.axvw';
				}
				else {  // does this user already have a myFavorite for the current view?
					var favViewName = viewName.substring(0, viewName.indexOf('.axvw')) + '-' + userName + '.axvw';
					try {
						result = openingView.AFM.workflow.Workflow.runRuleAndReturnResult('AbSystemAdministration-checkIfViewExists', { fileName: favViewName });
						if (result.data.fileFound != 'false' && result.data.filePath.indexOf('per-site') > 0) {
							myFavoriteExists = true;
						}					
					}
					catch (e) {
						openingView.AFM.workflow.Workflow.handleError(result);
						return false;
					}
				}

				// confirm add view to myFavorites
				var message = myFavoriteExists? getMessage('overwrite_myfavorite') : getMessage('add_myfavorite');
				var answer = confirm(message);
				if (answer == true) {
					var parameters = new Object();
					parameters.viewName = viewName;
					parameters.isWritePtask = !myFavoriteExists;

					parameters.taskId = isPtask ? taskRecord.getValue('afm_ptasks.task_id.key') : taskRecord.getValue('afm_processes.title');
					parameters.taskIdLocalized = isPtask ? taskRecord.getValue('afm_ptasks.task_id') : taskRecord.getValue('afm_processes.title');
					parameters.processId = isPtask ? taskRecord.getValue('afm_ptasks.process_id') : taskRecord.getValue('afm_processes.process_id');
					parameters.activityId = isPtask ? taskRecord.getValue('afm_ptasks.activity_id') : taskRecord.getValue('afm_processes.activity_id');

					try {
						result = openingView.AFM.workflow.Workflow.runRuleAndReturnResult('AbSystemAdministration-addViewToMyFavorites', parameters);
					}
					catch (e) {
						openingView.AFM.workflow.Workflow.handleError(result);
						return false;
					}			
				}
			}
		}
	}
}

function mapKeyPressToClick(e, element)
{
	if(e.keyCode == 13){
		element.click();
	}
}