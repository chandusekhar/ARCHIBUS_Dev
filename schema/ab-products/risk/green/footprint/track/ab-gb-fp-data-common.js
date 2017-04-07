/**
 * show message in the top row of the panel
 * @param panel
 * @param message
 */
function showInformationInForm(panel, message){
    var messageCell = panel.getMessageCell();
    messageCell.dom.innerHTML = "";
    
    var messageElement = Ext.DomHelper.append(messageCell, '<p>' + message + '</p>', true);
    messageElement.addClass('formMessage');
    messageElement.setStyle("color","red");
    messageElement.setVisible(true);
    messageElement.setHeight(20);
};

/**
 * @param toMT true if destFieldId is in MT (metric tons); does division by 1000 of the value
 */
function setVirtualFieldValue(data, form, destFieldId, sourceFieldId, toMT, destAliasFieldId){
	var ds = form.getDataSource();
	var value = null;
	
	if(!toMT) {
		value = new Number(data[sourceFieldId]).toFixed(ds.fieldDefs.get(destFieldId).decimals);
	} else {
		value = new Number(data[sourceFieldId]/1000).toFixed(ds.fieldDefs.get(destFieldId).decimals);
	}
	var formatedValue = ds.formatValue(destFieldId, value.toString(), true);
	form.setFieldValue(valueExistsNotEmpty(destAliasFieldId) ? destAliasFieldId : destFieldId, formatedValue);
}
