/**
 * Update Physical Count
 */
function updatePhysicalCount(){
	var panel = View.panels.get("abBldgopsReportPartsPhysicalInventoryGrid");
    var selectedRow = panel.rows[panel.selectedRowIndex];
	var part_id= selectedRow["pt.part_id"];
	var qty_physical_count= selectedRow["pt.qty_physical_count"];
	var date_of_last_cnt= selectedRow["pt.date_of_last_cnt"];
	var restriction = new Ab.view.Restriction();
		restriction.addClause('pt.part_id', part_id, '=');
	var panel1 = View.panels.get("abBldgopsReportPartsPhysicalInventoryForm");
    	panel1.refresh(restriction);
		panel1.showInWindow({
            width: 400, 
            height: 200,
            closeButton:true
        });
}

function saveForm(){
	var form = View.panels.get("abBldgopsReportPartsPhysicalInventoryForm");
	var date =new Date();
		date=getIsoFormatDate(date);
	form.setFieldValue('pt.date_of_last_cnt',date);
	form.save();
	var panel = View.panels.get("abBldgopsReportPartsPhysicalInventoryGrid");
		panel.refresh();
		form.closeWindow();
}
