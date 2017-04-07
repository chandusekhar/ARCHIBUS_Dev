/**
 * Custom data type that represents integer.
 * Uses JavaScript number to store the value.
 * The constructor accepts a number or formatted number string.
 *
 * @author Valery Tydykov
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.type.Integer', {
	extend : 'Common.type.CustomType',

	/**
	 * Called when the value property is set or modified.
	 * 
	 * @param {Number/String} newValue
	 * @return {Number}
	 * @throws {Error} Throws an exception if the input value cannot be converted to a Common.type.Integer type.
	 */
	applyValue : function(newValue) {
		var intValue;

		if (!Ext.isEmpty(newValue)) {
			if (Ext.isNumber(newValue)) {
				intValue = parseInt(newValue, 10);
			} else {
				intValue = parseInt(String(newValue).replace(Ext.data.Types.stripRe, ''), 10);
				if (isNaN(intValue)) {
					throw new Error(LocaleManager.getLocalizedString(
                            'The input value cannot be converted to the Common.type.Integer type.',
                            'Common.type.Integer'));
				}
			}
		} else {
			// The input value is empty.
			intValue = null;
		}

		return intValue;
	}

});