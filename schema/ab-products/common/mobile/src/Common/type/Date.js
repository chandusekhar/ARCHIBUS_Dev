/**
 * Custom data type that represents date only.
 * Uses JavaScript Date object to store the value.
 * The time part of the Date object is 00:00:00.
  * The constructor accepts a Date object or strings in the formats of YYYY-MM-dd, YYYY/MM/dd and YYYY-MM-dd
 * HH:mm:ss.nnn.
 * 
 * 
 * @author Valery Tydykov
 * @author Jeff Martin
 * @since 21.1
 * 
 */
Ext.define('Common.type.Date', {
	extend : 'Common.type.CustomType',

    dashesRegEx: /-/g,

    /**
     * @property {String} formatted The date value formatted as Y-m-d. Used when sending the field to the
     * server.
     */
    formatted: null,

	/**
	 * Called when the value property is set or modified.
	 * 
	 * @param newValue
	 * @return {Date}
	 * @throws {Error}
	 *             Throws an exception if the input value cannot be converted to a Common.type.Date type.
	 */
	applyValue : function(newValue) {
		var dateValue = null;

		if (Ext.isDate(newValue)) {
			dateValue = this.removeTimeFromDate(newValue);
		} else if (Ext.isString(newValue)) {
			dateValue = this.parseDateString(newValue);
		} else if (newValue === null) {
			dateValue = null;
		} else {
			// The input cannot be parsed, throw an exception.
            alert('applyValue newValue: ' + newValue);
			throw new Error(LocaleManager.getLocalizedString(
                    'The input value cannot be converted to a Common.type.Date type.',
                    'Common.type.Date'));
		}

		if (dateValue !== null) {
			dateValue = this.removeTimeFromDate(dateValue);
            this.formatted = Ext.DateExtras.format(dateValue, "Y-m-d");
		}

		return dateValue;
	},

    /**
     * Returns a Date object created from the input date string. Returns null if the input string cannot be converted to
     * a Date object.
     *
     * @private
     * @param {String} dateString A string representing the date in YYYY-MM-dd or YYYY/MM/dd format.
     *
     * @throws {Error} Throws an exception if the input value cannot be converted to a Common.type.Date type.
     */

	parseDateString : function(dateString) {
		var parsedDate,
            dateStringToParse = dateString,
            dashIndex = dateStringToParse.indexOf('-');

        // Some browsers do not correctly parse dates in the format of YYYY-MM-dd.
        // Replace the dashes with slashes before trying to parse the date string.
		// Note: this.dashesRegEx.test does not provide the correct result in Safari 5 due to
        // RegEx engine bug. Use indexOf instead to check the date format.
        if(dashIndex !== -1 && dashIndex < 5) {
			dateStringToParse = dateStringToParse.replace(this.dashesRegEx, '/');
		}

		// Date format YYYY/mm/dd HH:mm:ss.nnn is not handled in Safari using Date.parse.
		parsedDate = Ext.Date.parse(dateStringToParse, 'Y/m/d h:i:s.u');
		if (Ext.isDefined(parsedDate)) {
			return parsedDate;
		}

		// Try to parse the date
		parsedDate = Date.parse(dateStringToParse);
		if (isNaN(parsedDate)) {
			// The input cannot be parsed, throw an exception.
            throw new Error(LocaleManager.getLocalizedString(
                    'The input value cannot be converted to a Common.type.Date type.',
                    'Common.type.Date'));
		} else {
			parsedDate = new Date(parsedDate);
		}

		return parsedDate;
	},

    /**
     * Returns a Date object with the time portion of the Date set to 00:00:00
     *
     * @private
     * @param {Date} dateValue The date object to format.
     *
     */
    removeTimeFromDate: function (dateValue) {
        return new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate(), 0, 0, 0, 0);
    }
});
