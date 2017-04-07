/**
 * Format form field to show currency symbol when are read only.
 * @param form
 */
function formatCurrency(form){
	var dataSource = form.getDataSource();
	var fieldValues = form.record.values;
	var record = form.record;
	dataSource.fieldDefs.each(function(fieldDef){
		var fieldName = fieldDef.fullName;
		if(valueExistsNotEmpty(fieldDef.currencyField) 
				&& valueExists(form.fields.get(fieldName)) 
					&& form.fields.get(fieldName).fieldDef.readOnly){
			
			var neutralValue = record.getValue(fieldName);
			var localizedValue = record.getLocalizedValue(fieldName);
			if(localizedValue){
				var formattedValue = dataSource.formatCurrencyValue(fieldName, localizedValue, fieldValues);
				form.setFieldValue(fieldName, formattedValue, neutralValue, false);
			}
		}else if(valueExistsNotEmpty(fieldDef.currency)
				&& valueExists(form.fields.get(fieldName)) 
					&& form.fields.get(fieldName).fieldDef.readOnly ){
			var neutralValue = record.getValue(fieldName);
			var localizedValue = record.getLocalizedValue(fieldName);
			if(localizedValue){
				var formattedValue = dataSource.formatCurrencyValue(fieldName, localizedValue, fieldValues);
				form.setFieldValue(fieldName, formattedValue, neutralValue, false);
			}
		}
	});
}

/**
 * Set the field's colspan property to the spanCount number.
 * Programmatic alternative to a panel field's colspan property in the AXVW.
 *
 * @param columns collection of columns, one of whose id is = fieldName.
 * @param fieldName the id of the field whose colspan should be set.
 * @param spanCount the positive integer value to set which the fieldDef's colspan property is set.
 */
function setFieldColspan(columns, fieldName, spanCount) {
	for (var i = 0; i < columns.length; i++) {
	    if (columns[i].id === fieldName) {
		    columns[i].colspan = spanCount;
			break;
		}
	}
}


