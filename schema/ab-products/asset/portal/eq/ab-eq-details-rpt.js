var abEqDetailsRptController = View.createController('abEqDetailsRptCtrl', {
    afterViewLoad: function(){
		if(this.gridEqDetailsRpt &&
				(!this.panel_EqxwarrantyDetails && !this.panel_EqxpolicyDetails && !this.abEqEqByLease_details)) {
			if (this.gridEqDetailsRpt.getEl('assignEq') != null) {
				this.gridEqDetailsRpt.showElement('assignEq', false);
			}
		}
	},
	
	gridEqDetailsRpt_eqSelect_onSave: function(){
		var panel = this.gridEqDetailsRpt_eqSelect;
		
		if(panel.getSelectedRows().length <= 0) {
			View.showMessage(getMessage("selectItems"));
			return;
		}

        try {
        	var assignField = (this.panel_EqxwarrantyDetails) ? "eq.warranty_id" : ((this.abEqEqByLease_details) ? "eq.ta_lease_id"  : "eq.policy_id");
			var assignValue = this.gridEqDetailsRpt.restriction.findClause(assignField).value;
			var records = panel.getSelectedRecords();
			var record = null;
		    for (var i = 0; i < records.length; i++) {
				record = records[i];
				record.setValue(assignField, assignValue); 
		        panel.getDataSource().saveRecord(record);
		    }
			this.gridEqDetailsRpt.refresh();
			panel.closeWindow();
        } 
        catch (e) {
            View.showMessage('error', getMessage("errorAssign"), e.message, e.data);
            return;
        }
	}
});

/**
 * show equipment details report for 
 * selected tree node
 * @param {Object} node
 */
function showEquipments(node){
	var report = View.panels.get('gridEqDetailsRpt');
	var nodeRestriction = node.restriction;
	var restriction = new Ab.view.Restriction();
	var clause = null;
	
	if(nodeRestriction.findClause){
		if(nodeRestriction.findClause('dp.dp_id')!= null){
			// is from equipment by department
			clause = nodeRestriction.findClause('dp.dp_id');
			restriction.addClause('eq.dp_id', clause.value, '=');
			clause = nodeRestriction.findClause('dp.dv_id');
			restriction.addClause('eq.dv_id', clause.value, '=');
		}else if(nodeRestriction.findClause('fl.fl_id')!= null){
			// is from equipment by floor
			clause = nodeRestriction.findClause('fl.fl_id');
			restriction.addClause('eq.fl_id', clause.value, '=');
			clause = nodeRestriction.findClause('fl.bl_id');
			restriction.addClause('eq.bl_id', clause.value, '=');
		}else if(nodeRestriction.findClause('warranty.warranty_id')!= null){
			// is from equipment by warranties
			clause = nodeRestriction.findClause('warranty.warranty_id');
			restriction.addClause('eq.warranty_id', clause.value, '=');
		}else if(nodeRestriction.findClause('policy.policy_id')!= null){
			// is from equipment by insurance policy
			clause = nodeRestriction.findClause('policy.policy_id');
			restriction.addClause('eq.policy_id', clause.value, '=');
		}
	} else {
		if(valueExistsNotEmpty(nodeRestriction["ta_lease.ta_lease_id"])){
			// is from equipment by leases
			restriction.addClause('eq.ta_lease_id', nodeRestriction["ta_lease.ta_lease_id"], '=');
		}
	}
	report.refresh(restriction);
}

/**
 * used from edit insurance policy
 * ab-policy-edit.axvw
 * check if end date is greater than start date
 */
function saveInsurancePolicy(){
	var form = View.panels.get('formPolicyEdit_Edit');
	var ds = form.getDataSource();
	var localizedStartDate = form.getFieldValue('policy.date_start');
	var localizedEndDate = form.getFieldValue('policy.date_end');
	if (valueExistsNotEmpty(localizedStartDate) && valueExistsNotEmpty(localizedEndDate)) {
		var startDate = ds.parseValue('policy.date_start', localizedStartDate, false);
		var endDate = ds.parseValue('policy.date_end', localizedEndDate, false);
		if(startDate >= endDate){
			View.showMessage(getMessage('dates_invalid_text'));
			return;
		}else{
			if(form.save()){
				var grid = View.panels.get('gridPolicyEdit_List');
				grid.refresh();
			}
		}
	}
}
