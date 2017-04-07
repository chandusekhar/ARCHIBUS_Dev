var cpCreateSchedule = View.createController('cpCreateSchedule', {
	recordIsNew: true,
	recordOldValues: null,

	afterViewLoad: function() {
	   //turn off print icon and mail icon.
		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);
	},

	pmsDetails_beforeSave: function() {
		this.recordIsNew = this.pmsDetails.record.isNew;
		this.recordOldValues = this.pmsDetails.getOldFieldValues();
	},

	rerunPMDD: function() {
		var bolPMDD = this.recordIsNew;

		//If the interval_type or interval_1 changes then rerun the PMDD for this pmp
		if (this.recordOldValues['pms.interval_1'] != this.pmsDetails.getFieldValue('pms.interval_1')) {
			bolPMDD = true;
		};

		if (this.recordOldValues['pms.interval_type'] != this.pmsDetails.getFieldValue('pms.interval_type')) {
			bolPMDD = true;
		};

		if (this.recordOldValues['pms.date_first_todo'] != this.pmsDetails.getFieldValue('pms.date_first_todo')) {
			bolPMDD = true;
		};

		if (bolPMDD) {
			PMSRest = "pms.pms_id =" + this.pmsDetails.getFieldValue('pms.pms_id');

			var parameters = {
				"pmsidRestriction": PMSRest
			}
			try {
				var result = Workflow.call('AbBldgOpsOnDemandWork-pmddScheduledDates-BRGPmScheduleGenerator', parameters);
			}
			catch (e) {
				Workflow.handleError(e);
			}
		}

		return false;
	}
});