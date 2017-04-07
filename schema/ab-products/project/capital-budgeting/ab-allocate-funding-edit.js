var allocateFundingEditController = View.createController('allocateFundingEdit', {
	
	project_id: '',
	
	selectProjectReport_onSelectProjectId: function(row) {
		this.project_id = row.record['project.project_id.key'];
		var restriction = new Ab.view.Restriction();
		restriction.addClause('project.project_id', this.project_id);
		this.allocateFundingGrid.refresh(restriction);
		this.allocateFundingGrid.show(true);
		this.allocateFundingGrid.appendTitle(this.project_id);
	},
	
	allocateFundingGrid_onCopyScenario: function() {
		if (this.allocateFundingGrid.rows.length > 0) {
			var deleteRecords = confirm(getMessage('fundingExists'));
			if (!deleteRecords) return;
			var ds = View.dataSources.get('allocateFundingDs1');
			this.allocateFundingGrid.gridRows.each(function (row) {
				var record = row.getRecord();
				ds.deleteRecord(record);
			});
			this.allocateFundingGrid.refresh();
		}
		var restriction = new Ab.view.Restriction();
	    restriction.addClause('projscns.project_id', this.project_id, '=');
	    View.openDialog('ab-allocate-funding-copy.axvw', restriction);
	},
	
	allocateFundingForm_onSelectFundValue: function() {
        View.openDialog('ab-allocate-funding-select-fund.axvw');
	},
	
	allocateFundingForm_onSave: function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('funding.fund_id', this.allocateFundingForm.getFieldValue('projfunds.fund_id'));
		var funding_record = this.allocateFundingDs2.getRecord(restriction);
		var fiscal_year = this.allocateFundingForm.getFieldValue('projfunds.fiscal_year');
			
		if (fiscal_year != '' && funding_record != '') {
			if (!this.checkAvailableFunds(funding_record)) return;
			if (!this.checkProgramIdMatch(funding_record)) return;
			if (!this.checkDateAvailability(funding_record, fiscal_year)) return;
		}
		/* form save() will catch invalid data */
		if (this.allocateFundingForm.save()) this.allocateFundingGrid.refresh();
	},
	
	checkAvailableFunds: function(funding_record) {	
		var restriction = new Ab.view.Restriction();
		restriction.addClause('projfunds.project_id', this.allocateFundingForm.getFieldValue('projfunds.project_id'));
		restriction.addClause('projfunds.fund_id', this.allocateFundingForm.getFieldValue('projfunds.fund_id'));
		restriction.addClause('projfunds.fiscal_year', this.allocateFundingForm.getFieldValue('projfunds.fiscal_year'));
		var record = this.allocateFundingDs1.getRecord(restriction);
		
		var old_amount_cap = 0;
		var old_amount_exp = 0;
		if (record == '') { /* record did not previously exist */
		} else {
			old_amount_cap = record.getValue('projfunds.amount_cap');
			old_amount_exp = record.getValue('projfunds.amount_exp');
		}
		var new_amount_cap = this.allocateFundingForm.getFieldValue('projfunds.amount_cap');
		var new_amount_exp = this.allocateFundingForm.getFieldValue('projfunds.amount_exp');
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('funding.fund_id', this.allocateFundingForm.getFieldValue('projfunds.fund_id'));
		var funds_remain = this.allocateFundingDs3.getRecord(restriction).getValue('funding.funds_remain');
		funds_remain = funds_remain - new_amount_cap - new_amount_exp + old_amount_cap*1 + old_amount_exp*1;
		
		if (funds_remain < 0) {
			View.alert(getMessage('insufficientFunds'));
			return false;
		}
		return true;
	},	
	
	checkProgramIdMatch: function(funding_record) {
		var project_record = this.allocateFundingDs0.getRecord(this.allocateFundingGrid.restriction);
		var fundingProgramId = funding_record.getValue('funding.program_id');
		var projectProgramId = project_record.getValue('project.program_id');
		
		/* project.program_id must either match funding.program_id or else either value must be null */
		if (fundingProgramId == '' || fundingProgramId == undefined || projectProgramId == '' || fundingProgramId == projectProgramId) {
			return true;
		}
		else {
			View.showMessage(getMessage('mismatchedProgramId'));
			return false;
		}		
	},
	
	checkDateAvailability: function(funding_record, fiscal_year) {
		var funds_available = true;
		/* fiscal_year must fall between funding date_avail and date_avail_end */
		var date_avail = funding_record.getValue('funding.date_avail');
		var date_avail_year = '';
		if (date_avail) date_avail_year = date_avail.getFullYear();
		
		var date_avail_end = funding_record.getValue('funding.date_avail_end');
		var date_avail_end_year = '';
		if (date_avail_end) date_avail_end_year = date_avail_end.getFullYear();
		
		if (date_avail_year && fiscal_year < date_avail_year) funds_available = false;
		if (date_avail_end_year && fiscal_year > date_avail_end_year) funds_available = false;
		
		if (!funds_available) {
			View.showMessage(getMessage('fundsUnavailableByDate'));
			return false;
		} else return true;		
	}
});

/****************************************************************
 * Project Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval("project.is_template = 0 AND project.status IN ('Created','Requested','Requested-Estimated','Requested-On Hold','Requested-Routed','Requested-Routed for Approval','Approved','Approved-In Design','Issued-In Process','Issued-On Hold','Completed-Pending','Completed-Actions Pending','Completed-Not Ver','Completed-Not Verified')");
}
