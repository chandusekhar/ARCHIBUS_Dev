function selectForwardTo() {
	View.selectValue('forwardForm', getMessage('forwardTo'), [ 'em.em_id' ],
			'em', [ 'em.em_id' ], [ 'em.em_id', 'em.em_std' ], null, null,
			true, true);
}

function forwardStep() {

	var forwardForm = View.panels.get('forwardForm');
	var forwardTo = forwardForm.getFieldValue("em.em_id");
	var comments = $("forward_comments").value;
	if (forwardTo == '') {
		alert(getMessage('forwardToMissing'))
		return;
	}

	var forwardRecords = View.forwardRecords;
	for (var i = 0; i < forwardRecords.length; i++) {
		try {
			var result = Workflow.callMethod(
					'AbBldgOpsOnDemandWork-WorkRequestService-forwardApproval',
					forwardRecords[i], comments, forwardTo);
		} catch (e) {
			Workflow.handleError(e);
		}
	}

	var wrFilter = View.controllers.get('wrFilter');
	if (!wrFilter) {
		wrFilter = View.getOpenerView().controllers.get('wrFilter');
	}

	if (wrFilter) {
		wrFilter.wrFilter_onFilter();
	}

	forwardForm.closeWindow();

	var approvalPanel = View.panels.get('approvePanel');
	if (approvalPanel) {
		approvalPanel.closeWindow();
	}
	View.closeThisDialog();
}