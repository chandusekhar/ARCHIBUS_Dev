var verifyReservationController = View.createController("verifyReservationController", {
	
	/** Reservation Details View */
	reservationDetailsView: "ab-rr-room-reservation-details.axvw",
	
	/** Time before start and after end to show reservations (in milliseconds). */
	timeDeltaMillis: 30*60*1000,

	afterInitialDataFetch: function() {
		var buildingId = this.consolePanel.getFieldValue("reserve_rm.bl_id");
		// only load immediately if the building code is set
		if (buildingId != "") {
			this.refreshReservePanel();
		}
	},
	
	consolePanel_onSearch: function() { 
		this.refreshReservePanel();
	},
	
	/**
	 * Refresh the list of reservations.
	 */
	refreshReservePanel: function() {
		// Get the current local time in the chosen building. If no building, use current browser time.
		var now = new Date();
		try {
			var buildingId = this.consolePanel.getFieldValue("reserve_rm.bl_id");
			if (buildingId == "") {
				View.showMessage(getMessage("buildingCodeRequired"));
				return;
			} else {
				var buildingIds = [buildingId];
				var result = Workflow.callMethod("AbWorkplaceReservations-roomReservationService-getCurrentLocalDateTime", buildingIds);
				if (result.code == "executed") {
					var localDate = result.data[buildingId].date.split("-");
					var localTime = result.data[buildingId].time.split(":");
					now.setFullYear(localDate[0], parseInt(localDate[1]) - 1, localDate[2]);
					now.setHours(localTime[0], localTime[1]);
				} else {
					Workflow.handleError(result);
				}
			}
		} catch (e) {
			Workflow.handleError(e);
		}
		
		var today = this.reserve_console_ds.formatValue("reserve.date_start", now, true);
		this.consolePanel.setFieldValue("reserve.date_start", today);

		var startTime = new Date(now.getTime() + this.timeDeltaMillis);
		var startLimit = this.reserve_console_ds.formatValue("reserve.time_start", startTime, false);
		var endTime = new Date(now.getTime() - this.timeDeltaMillis);
		var endLimit = this.reserve_console_ds.formatValue("reserve.time_end", endTime, false);
		
		var restriction = this.consolePanel.getFieldRestriction();
		
		// Only show reservations that will start within a half hour or are currently taking place.
		restriction.addClause("reserve.time_start", ABRV_formatTime(startLimit), "<=");
		restriction.addClause("reserve.time_end", ABRV_formatTime(endLimit), ">=");
		
		// start or clauses
		restriction.addClause("reserve.user_created_by", View.user.employee.id, "=", ")AND(");
		
		if (View.user.isMemberOfGroup('RESERVATION ASSISTANT')) {
			restriction.addClause("reserve.user_requested_by", View.user.employee.id, "=", "OR");
			restriction.addClause("reserve.user_requested_for", View.user.employee.id, "=", "OR");
		}
		if (View.user.isMemberOfGroup('RESERVATION HOST')) {
			restriction.addClause("reserve.user_requested_for", View.user.employee.id, "=", "OR");
		}
		if (View.user.isMemberOfGroup('RESERVATION MANAGER') || View.user.isMemberOfGroup('RESERVATION SERVICE DESK')) {
			// show all, even the ones the user didn't create
			restriction.addClause("reserve.user_created_by", View.user.employee.id, "<>", "OR");
		}
		
		this.selectPanel.refresh(restriction); 
		this.selectPanel.show(true);
	},
	
	/**
	 * Show details of a reservation.
	 */
	selectPanel_onDetails: function(row) {
		var reservationId = row.getFieldValue("reserve.res_id");
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause("reserve.res_id", reservationId);
		View.openDialog(this.reservationDetailsView, restriction, false, {title: getMessage("reservationDetails")});
	},
	
	/**
	 * Empty the comments field when reloading the verification panel.
	 */
	verifyPanel_beforeRefresh: function() {
		$("verifyComments").value = "";
	},
	
	/**
	 * Refresh the list of reservations after verifying one.
	 */
	verifyPanel_onConfirm: function() {
		this.verifyPanel.setFieldValue("reserve_rm.verified", 1);
		
		var verifyComments = $("verifyComments").value;
		if (verifyComments != "") {
			var originalComments = this.verifyPanel.getFieldValue("reserve_rm.comments");
			if (originalComments != "") {
				originalComments += " \r\n";
			}
			this.verifyPanel.setFieldValue("reserve_rm.comments", originalComments + verifyComments);
		}
		
		this.verifyPanel.save();
		this.verifyPanel.closeWindow();
		this.refreshReservePanel();
	}
	
});
