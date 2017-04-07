var abFltMgmtDOReport_controller = View.createController('abFltMgmtDOReport_controller', {

	afterViewLoad: function() {

		// Dispatch Order Reports
		if(View.panels.get("panel_dispatchlog") != null) {
			View.openPaginatedReportDialog('ab-fltmgmt-report-dispatch-log-pgrp.axvw');
		}

		if(View.panels.get("panel_overduedispatch") != null) {
			View.openPaginatedReportDialog('ab-fltmgmt-report-overdue-dispatch-pgrp.axvw');
		}

		if(View.panels.get("panel_dispatchrequestor") != null) {
			View.openPaginatedReportDialog('ab-fltmgmt-report-dispatch-requestor-pgrp.axvw');
		}

		if(View.panels.get("panel_histdispatchrequestor") != null) {
			View.openPaginatedReportDialog('ab-fltmgmt-report-hist-dispatch-requestor-pgrp.axvw');
		}

		if(View.panels.get("panel_histdispatchvehicle") != null) {
			View.openPaginatedReportDialog('ab-fltmgmt-report-hist-dispatch-vehicle-pgrp.axvw');
		}


		// Repair Order Reports
		if(View.panels.get("panel_repairvehicle") != null) {
			View.openPaginatedReportDialog('ab-fltmgmt-report-repair-vehicle-pgrp.axvw');
		}

		if(View.panels.get("panel_repairrequestor") != null) {
			View.openPaginatedReportDialog('ab-fltmgmt-report-repair-requestor-pgrp.axvw');
		}

		if(View.panels.get("panel_histrepairvehicle") != null) {
			View.openPaginatedReportDialog('ab-fltmgmt-report-hist-repair-vehicle-pgrp.axvw');
		}

		if(View.panels.get("panel_histrepairrequestor") != null) {
			View.openPaginatedReportDialog('ab-fltmgmt-report-hist-repair-requestor-pgrp.axvw');
		}


		// Parts
		if(View.panels.get("panel_whereused") != null) {
			View.openPaginatedReportDialog('ab-fltmgmt-report-where-used-pgrp.axvw');
		}
	}
});
