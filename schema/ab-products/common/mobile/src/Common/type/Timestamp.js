/**
 * Custom data type that represents date and time.
 * <p>
 * Uses JavaScript Date object to store the value.
 * <p>
 * The constructor accepts a Date object or a string in the format of 'YYYY-MM-dd HH:mm:ss' or YYYY/MM/dd HH:mm:ss.
 * 
 * @author Valery Tydykov
 * @author Jeff Martin
 * @since 21.1
 */

Ext.define('Common.type.Timestamp', {
	extend : 'Common.type.CustomType',

    dashesRegEx: /-/g,

	/**
	 * Called when the value property is set or modified.
	 * 
	 * @param newValue
	 * @param oldValue
	 * @return {Date}
	 * @throws {Error}
	 *             Throws an exception if the input value cannot be converted to a Common.type.Time type.
	 */
	applyValue : function(newValue) {
		var timeStampValue = null,
            value = newValue,
            dashIndex;

		if (Ext.isDate(newValue)) {
			timeStampValue = newValue;
		} else {
			// Some browsers have problems correctly parsing date strings that
			// have dashes (-) in them.
			// Replace the dashes with slashes before trying to parse the Date string.
            dashIndex = value.indexOf('-');
			if (dashIndex !== -1 && dashIndex < 5) {
				value = value.replace(this.dashesRegEx, '/');
			}
			var parsedDate = Date.parse(value);
			if (!isNaN(parsedDate)) {
				timeStampValue = new Date(Date.parse(value));
			} else {
				throw new Error(LocaleManager.getLocalizedString(
                        'The input value cannot be converted to a Common.type.Timestamp type.',
                        'Common.type.Timestamp'));
			}
		}

		return timeStampValue;
	}
});