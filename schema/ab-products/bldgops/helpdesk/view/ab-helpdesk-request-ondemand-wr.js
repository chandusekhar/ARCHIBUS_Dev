View.createController("onDemandWrController", {

	/**
	 * Verification Step Id.
	 */

	verificationStepId : null,

	/**
	 * Show verification button after data initialize.
	 */
	afterInitialDataFetch : function() {
		this.showVerificationButton();
	},

	/**
	 * Open verification dialog to handle verification.
	 */
	workRequestPanel_onVerification : function() {
		var wrId = this.workRequestPanel.getFieldValue("wr.wr_id");
		var restriction = new Ab.view.Restriction();
		restriction.addClause("wr_step_waiting.wr_id", wrId, '=');
		restriction.addClause("wr_step_waiting.step_log_id", this.verificationStepId, '=');
		View.openDialog("ab-ondemand-workrequest-verification.axvw", restriction, false);
	},
	
	/**
	 * Hide verification button after verify, callback funtion in view ab-ondemand-workrequest-verification.axvw.
	 */
	afterVerification : function() {
		this.workRequestPanel.actions.get('verification').show(false);
	},

	/**
	 * Show verification button if pendin step is verification.
	 */
	showVerificationButton : function() {
		var panel = this.workRequestPanel;
		var steps = getStepInformation("wr", "wr_id", panel.getFieldValue("wr.wr_id"));
		var action = panel.actions.get('verification');
		var isShow = false;
		if (steps && steps.length > 0) {
			for ( var i = 0; i < steps.length; i++) {
				var lastStep = steps[i];
				if (lastStep.date_response == "" && lastStep.user_name == View.user.name && lastStep.step_type == "verification") {
					this.verificationStepId = lastStep.step_log_id;
					isShow = true;
					break;
				}
			}
			if (!isShow) {// check substitute
				var result = {};
				try {
					result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-checkVerificationSubstitute', panel.getFieldValue("wr.wr_id"));
				} catch (e) {
					Workflow.handleError(e);
				}
				if (result.code == 'executed') {
					var res = eval('(' + result.jsonExpression + ')');
					if (res.isSubstitute) {
						isShow = true;
						this.verificationStepId = res.step_log_id;
					}
				} else {
					Workflow.handleError(result);
				}

			}
		}
		action.show(isShow);
	}
});
