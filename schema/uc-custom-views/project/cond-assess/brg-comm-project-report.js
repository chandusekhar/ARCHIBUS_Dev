var repCtrl = View.createController('repCtrl', {
	maxQuestions: 70,

	console_onShow: function() {
		var std = this.console.getFieldValue("eq.eq_std");

		if (!valueExistsNotEmpty(std)) {
			View.showMessage(getMessage("noStd"));
			return;
		}
		var restriction = this.getRestriction(std);
		View.panels.get("grid0").refresh(restriction);
	},

	grid0_onXmlGrid2xls: function() {
		var std = this.console.getFieldValue("eq.eq_std");
		if (!valueExistsNotEmpty(std)) {
			View.showMessage(getMessage("noStd"));
			return;
		}
		var restriction = this.getRestriction(std);
		var maxq = this.getMaxQ(std);

		try {
			var result = Workflow.callMethod('AbCapitalPlanningCA-BRGCapitalPM-getXMLQReport', restriction, parseInt(maxq));
			if (result.code == 'executed') {
				window.open(result.message);
			}
		} catch (e) {
			Workflow.handleError(e);
		}
	},

	grid0_onXmlGrid2xls2: function() {
		var std = this.console.getFieldValue("eq.eq_std");
		if (!valueExistsNotEmpty(std)) {
			View.showMessage(getMessage("noStd"));
			return;
		}
		var restriction = this.getRestriction(std);
		var maxq = this.getMaxQ(std);
		try {
			var result = Workflow.callMethod('AbCapitalPlanningCA-BRGCapitalPM-getQXLS', restriction, parseInt(maxq));
			if (result.code == 'executed') {
				window.open(result.message);
			}
		} catch (e) {
			Workflow.handleError(e);
		}
	},

	grid0_onPagReport: function() {
		var std = this.console.getFieldValue("eq.eq_std");
		if (!valueExistsNotEmpty(std)) {
			View.showMessage(getMessage("noStd"));
			return;
		}
		var restriction = this.getRestriction(std);
		var maxq = this.getMaxQ(std);

		try {
			var result = Workflow.callMethod('AbCapitalPlanningCA-BRGCapitalPM-getPagReport', restriction, parseInt(maxq));
			if (result.code == 'executed') {
				window.open(result.message);
			}
		} catch (e) {
			Workflow.handleError(e);
		}
	},

	getMaxQ: function(std) {
		this.countQDS.addParameter("std", std, "=");
		var maxq = this.countQDS.getRecord().getValue("questions.countq");
		maxq = parseInt(maxq);
		maxq = maxq > this.maxQuestions ? this.maxQuestions : maxq;
		return maxq;

	},

	getRestriction: function(std) {
		var restriction = this.console.getFieldRestriction();
		restriction.removeClause("eq.eq_std");
		restriction.addClause("activity_log.cost_cat_id", std, "=");
		return restriction;
	}
});