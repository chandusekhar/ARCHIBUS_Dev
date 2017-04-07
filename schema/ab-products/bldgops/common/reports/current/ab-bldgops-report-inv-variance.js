/**
 * Run when we click adjustQuantityAvailableFromPhysicalCount button 
 */
function adjustQuantityAvailableFromPhysicalCount(){

    var panel = View.panels.get('abBldgopsReportInvVarianceGrid');
    var records = panel.getSelectedRecords();
    
    if (records.length < 1) {
        View.alert(getMessage("noItems"));
        return;
    }
    
    var ptRecords = [];
    
    
    for (var i = 0; i < records.length; i++) {
        ptRecords[i] = new Object();
        ptRecords[i]['pt.qty_on_reserve'] = records[i].values["pt.qty_on_reserve"];
        ptRecords[i]['pt.qty_physical_count'] = records[i].values["pt.qty_physical_count"];
        ptRecords[i]['pt.part_id'] = records[i].values["pt.part_id"];
        ptRecords[i]['pt.qty_on_hand'] = records[i].values["pt.qty_on_hand"];
        ptRecords[i]['pt.cost_unit_last'] = records[i].values["pt.cost_unit_last"];
        ptRecords[i]['pt.acc_prop_type'] = records[i].values["pt.acc_prop_type"];
    }
    
    var result = {};
    try {
        result = Workflow.callMethod('AbBldgOpsBackgroundData-calculateWorkResourceValues-updateQuantityAvailableFromPhysicalCount', ptRecords);
    } 
    catch (e) {
		if (e.code == 'ruleFailed'){
			View.showMessage(e.message);
		}else{
            Workflow.handleError(e); 
        }
        return;
    }
    if (result.code == 'executed') {
        panel.refresh();
		View.alert(getMessage('calculateAlertMessage'));
    }
    else {
        Workflow.handleError(result);
    }
}

