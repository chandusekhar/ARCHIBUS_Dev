var ucEsStreamVnacEditController = View.createController('ucEsStreamVnacEditCntrl', {

});

function selectVnAcId() {
	var vnAcntGrid = View.getOpenerView().panels.get("vnAcntGrid");
	var rows = vnAcntGrid.rows;

	var vnAc_rest = '';
	
	for (var i = 0; i < rows.length; i++) {
		var row = rows[i];
		if (row['vn_ac.vn_ac_id'] && i!=(rows.length-1)) {
			vnAc_rest += "'"+row['vn_ac.vn_ac_id']+"',";
		} else if (row['vn_ac.vn_ac_id']) {
			vnAc_rest += "'"+row['vn_ac.vn_ac_id']+"'";
		}
	}
	
	if (rows.length > 0) {
		vnAc_rest = " AND bill_type.bill_type_id NOT IN (" + vnAc_rest + ")";
	}

	//vnAc_rest = " AND bill_type.bill_type_id NOT IN (" + vnAc_rest + ")";
	var rest = "bill_type.activity_id = 'abRiskES1' and not exists (select 1 from bill_type p where p.parent=bill_type.bill_type_id)";
	rest += vnAc_rest;
	View.selectValue('editVnAc_form', 'GHG Stream',
		['vn_ac.vn_ac_id'],
		'bill_type',
		['bill_type.bill_type_id'],
		['bill_type.bill_type_id','bill_type.description'],
		rest,'', true, true);
}

function custSave() {
	var editVnAcForm = View.panels.get("editVnAc_form");
	editVnAcForm.setFieldValue("vn_ac.bill_type_id", editVnAcForm.getFieldValue("vn_ac.vn_ac_id"));
	var vnAcId = editVnAcForm.getFieldValue("vn_ac.vn_ac_id");
	
	editVnAcForm.setFieldValue("vn_ac.bill_type_id", vnAcId);
	
	var rest = "bill_type.bill_type_id='"+vnAcId+"' AND bill_type.activity_id='ABRiskES1'";

	var parameters =
	{
		tableName: 'bill_type',
		fieldNames: toJSON(['bill_type.bill_type_id']),
		restriction: toJSON(rest)
	};

	var wfrResult = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecord',parameters);
	
	if (wfrResult.code == 'executed') {
		if (wfrResult.data.records[0]) {
			editVnAcForm.save();
			var vnAcntGrid = View.getOpenerView().panels.get("vnAcntGrid");
			vnAcntGrid.refresh();
		} else {
			View.showMessage('Record cannot be saved since Stream does not exist in bill_type.bill_type_id');
		}
	}
}
