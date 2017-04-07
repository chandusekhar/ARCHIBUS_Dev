// CHANGE LOG
// 2010/04/19 - JJYCHAN - ISSUE 116 - Added code to remove top buttons

var cfEditController = View.createController('cfEditController', {

	afterViewLoad: function() {

		//turn off print icon and mail icon.
		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);

	},

	cf_details_beforeSave: function() {
		var continueSave = true;

		// verify rates are filled and > 0
        /*
		var rate_hourly = this.cf_details.getFieldValue("cf.rate_hourly");
		var rate_over = this.cf_details.getFieldValue("cf.rate_over");
		var rate_double = this.cf_details.getFieldValue("cf.rate_double");

		if (parseFloat(rate_hourly) <= 0) {
			this.cf_details.addInvalidField('cf.rate_hourly',getMessage('invalid_rate'));
			this.cf_details.validationResult.valid = false;
			continueSave = false;
		}

		if (parseFloat(rate_over) <= 0) {
			this.cf_details.addInvalidField('cf.rate_over',getMessage('invalid_rate'));
			this.cf_details.validationResult.valid = false;
			continueSave = false;
		}

		if (parseFloat(rate_double) <= 0) {
			this.cf_details.addInvalidField('cf.rate_double',getMessage('invalid_rate'));
			this.cf_details.validationResult.valid = false;
			continueSave = false;
		}
		*/

		return continueSave;
	}
});