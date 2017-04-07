/**
 * @author Lei
 */
/**
 * if Default=1, then all other records in 'bill_unit' must be set to Default=0
 */
function reSetDefaultVal() {
	var editPanel = View.panels.get("abWasteDefUnitsUnitEditForm");
	var oldValueIsDefault = editPanel.getOldFieldValues()[("bill_unit.is_dflt")];
	editPanel.save();
	var isDefault = editPanel.getFieldValue('bill_unit.is_dflt');
	var bill_unit_id = editPanel.getFieldValue('bill_unit.bill_unit_id');
	if (isDefault && isDefault == "1") {
		var grid = View.panels.get("abWasteDefUnitsUnitGrid");
		var records = [];
		grid.gridRows.each(function(row){
			var record = row.getRecord();
			if (record.getValue("bill_unit.bill_unit_id")!= bill_unit_id&&oldValueIsDefault!="1") {
				record.setValue("bill_unit.is_dflt","0");
				records.push(record);
			}
		});
 		View.dataSources.get("abWasteDefUnitsUnitDS").saveRecords(records);
	}
}
/**
 *  to verify conversion factor input
 */
function abWasteDefUnitsUnitEditForm_beforeSave(){
	var editPanel = View.panels.get("abWasteDefUnitsUnitEditForm");
	var conversion_factor = editPanel.getFieldValue('bill_unit.conversion_factor');
	if (conversion_factor<=0) {
		View.alert(getMessage('verifyFactor'));
		return false;
	}else {
		return true;
	}
}