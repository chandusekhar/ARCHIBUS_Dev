/**
 *	Controller for the View Tasks by Process and Activity Edit Process view.
 *
 *	ab-tasks-by-process-and-activity-edit-process.js
 */

var tasksProcessActivityEditProcessController = View.createController('tasksProcessActivityEditProcess', {

	/**
	 * The process type WEB-PAGENAV (Web Page Navigator) is used only for relating Home page descriptors to roles.
	 * That is, when activityId === 'AbDashboardPageNavigation'.
	 *
	 * It should not be used as a type for assigning processes to activities!
	 * Remove this process type from the process_type select element's options.
	 * Page Navigation processes may be exclusively for PageNav (i.e. afm_processes.process_type == PAGES;Web Page Navigator Process)
	 * OR for both ProcessNav AND PageNav (i.e., afm_processes.process_type == WEB&PAGES;Web Pnav & Pages')
	 */
	afterLayout: function() {
		var processRestriction = View.restriction;
		if (processRestriction) {
			var activityId = processRestriction['afm_activities.activity_id'];
			if (!activityId) {
				activityId = processRestriction['afm_processes.activity_id'];		
			}
			if (activityId !== 'AbDashboardPageNavigation') {		
				var processTypeSelect = document.getElementById("editPanel_afm_processes.process_type");
				for (var i = 0, value; value = processTypeSelect.options[i].value; i++) {
					if (value == 'WEB-PAGENAV' ) {
						processTypeSelect.remove(i);
						break;
					}
				}
			}
		}
	}

});
