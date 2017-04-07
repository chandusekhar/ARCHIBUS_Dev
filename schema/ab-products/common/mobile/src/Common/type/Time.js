/**
 * Custom data type that represents time only.
 * <p>
 * Uses JavaScript Date object to store the value.
 * <p>
 * The date part of the Date object is 1970-0-1.
 * <p>
 * The constructor accepts Date object or string in the formats of 'HH:mm', 'HH:mm:ss' or 'YYYY-mm-dd HH:mm:ss.nnn'.
 * 
 * @author Valery Tydykov
 * @author Jeff Martin
 * @since 21.1
 *
 */

Ext.define('Common.type.Time', {
	extend : 'Common.type.CustomType',

    dashesRegEx: /-/g,

    formatted: null,

	/**
	 * Called when the value property is set or modified.
	 * 
	 * @param newValue
	 * @param oldValue
	 * @return {Date}
	 * @throws {Error} Throws an exception if the input value cannot be converted to a Common.type.Time type.
	 */

	applyValue : function(newValue) {

		var timeValue = null;

		// If this is a Date object set the Date portion to 1/1/1970 and return.
		if (Ext.isDate(newValue)) {
			timeValue = this.removeDateFromDate(newValue);
		} else if (Ext.isString(newValue)) {
			timeValue = this.processTimeString(newValue);
		}

		if (timeValue === null) {
			// Can't parse the input, throw exception.
			throw new Error(LocaleManager.getLocalizedString(
                    'The input value cannot be converted to a Common.type.Time type.',
                    'Common.type.Time'));
		}

        this.formatted = Ext.DateExtras.format(timeValue, "H:i:s.u");
		return this.removeDateFromDate(timeValue);
	},

	/**
	 * Returns a Date object with the time part set to the value of the processed input time string.
	 * <p>
	 * 
	 * @private
	 * @param {String} timeString A string in the formats of HH:mm, HH:mm:ss or YYYY-MM-dd HH:mm:ss.nnn
	 * @return {Date}
	 * @throws {Error} Throws an exception if the input value cannot be converted to a Common.type.Time type.
	 */
	processTimeString : function(timeString) {
		var dateParseResult,
            parsedDate,
            formatStrings = [ 'Y-m-d h:i:s.u', 'h:i', 'h:i:s' ],
            dashIndex = timeString.indexOf('-'), i;

		for (i = 0; i < formatStrings.length; i++) {
			dateParseResult = Ext.Date.parse(timeString, formatStrings[i]);
			if (Ext.isDefined(dateParseResult)) {
				return dateParseResult;
			}
		}

		// Some browsers do not correctly parse date formats with dashes. If
		// we have one of those dates we replace the dashes with slashes
		if (dashIndex !== -1 && dashIndex < 5) {
			timeString = timeString.replace(this.dashesRegEx, '/');
		}

		parsedDate = Date.parse(timeString);
		if (!isNaN(parsedDate)) {
			return new Date(parsedDate);
		}

		// If we got here it is an error. Returning null will cause an exception to be thrown
		return null;
	},

	/**
	 * Returns a Date object with the Date portion set to 1970-01-01
	 * <p>
	 * 
	 * @private
	 * @param {Date} dateValue
	 * @return {Date}
	 */
	removeDateFromDate : function(dateValue) {
		return new Date(1970, 0, 1, dateValue.getHours(), dateValue.getMinutes(), dateValue.getSeconds(), dateValue
				.getMilliseconds());
	}
});