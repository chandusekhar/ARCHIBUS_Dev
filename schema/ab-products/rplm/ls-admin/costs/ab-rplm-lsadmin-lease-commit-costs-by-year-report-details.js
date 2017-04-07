
var controller = View.createController('recurCostByYearReportDetails', {

	regexYear: /\d{4}/, 
	year: null, 
	// VAT selection
	displayVAT: {
		type: '',
		isHidden: false
	},
	
	// currency selection
	displayCurrency: {
		type: '',
		code: '',
		exchangeRateType: ''
	},
	
	isMcAndVatEnabled: false,

	afterViewLoad: function() {
	    this.inherit();

	    var lsClause = this.view.restriction.findClause('cost_tran_recur.ls_id');
		var yearClause = this.view.restriction.findClause('cost_tran_recur.year');
		
		if(View.getOpenerView().controllers.get('calculateLeaseCosts') != undefined){
			this.openerController = View.getOpenerView().controllers.get('calculateLeaseCosts');
			this.isMcAndVatEnabled = this.openerController.isMcAndVatEnabled;
			this.displayVAT = this.openerController.displayVAT;
			this.displayCurrency = this.openerController.displayCurrency;
			
		}

		if (yearClause != null) {
			this.year = yearClause.value.match(this.regexYear)[0];
		}
		
		var restriction = new Ab.view.Restriction();
		if (yearClause != null && lsClause != null) {
			restriction.addClause('cost_tran_recur.ls_id', lsClause.value, '=');
			restriction.addClause('cost_tran_recur.amount_expense', '', 'IS NOT NULL');
			restriction.addClause('cost_tran_recur.amount_expense', 0, '!=');
			restriction.addClause('cost_tran_recur.date_end', this.year+'-01-01', '&gt;=');
			restriction.addClause('cost_tran_recur.status_active', '1', '=');
			this.year++;
			restriction.addClause('cost_tran_recur.date_start', this.year+'-01-01', '&lt;');
			setPanelParameters(this.costTranRecurDetailsPanel, "cost_tran_recur", this.isMcAndVatEnabled, this.displayCurrency);
			this.costTranRecurDetailsPanel.refresh();
			setPanelDisplay(this.costTranRecurDetailsPanel, "cost_tran_recur", this.isMcAndVatEnabled, this.displayCurrency);
		}
	    else if (yearClause == null && lsClause != null) {
	    	restriction.addClause('cost_tran_recur.ls_id', lsClause.value, '=');
	    	restriction.addClause('cost_tran_recur.amount_expense', '', 'IS NOT NULL');
	    	restriction.addClause('cost_tran_recur.amount_expense', 0, '!=');
	    	var report = this.view.getOpenerView().controllers.get('calculateLeaseExpenses');
			restriction.addClause('cost_tran_recur.date_end', report.fromYear+'-01-01', '&gt;=');
			restriction.addClause('cost_tran_recur.status_active', '1', '=');
			this.year = parseInt(report.toYear) + 1;
			restriction.addClause('cost_tran_recur.date_start', this.year+'-01-01', '&lt;');
			setPanelParameters(this.costTranRecurDetailsPanel, "cost_tran_recur", this.isMcAndVatEnabled, this.displayCurrency);
			this.costTranRecurDetailsPanel.refresh();
			setPanelDisplay(this.costTranRecurDetailsPanel, "cost_tran_recur", this.isMcAndVatEnabled, this.displayCurrency);
	    }
	    else if (yearClause != null && lsClause == null) {
	    	this.view.getLayoutManager('mainLayout').collapseRegion('north');
	    	
	    	restriction.addClause('cost_tran_recur.ls_id', '', 'IS NOT NULL');
	    	restriction.addClause('cost_tran_recur.amount_expense', '', 'IS NOT NULL');
	    	restriction.addClause('cost_tran_recur.amount_expense', 0, '!=');
			restriction.addClause('cost_tran_recur.date_end', this.year+'-01-01', '&gt;=');
			restriction.addClause('cost_tran_recur.status_active', '1', '=');
			this.year++;
			restriction.addClause('cost_tran_recur.date_start', this.year+'-01-01', '&lt;');
			setPanelParameters(this.costTranRecurDetailsPanel, "cost_tran_recur", this.isMcAndVatEnabled, this.displayCurrency);
			this.costTranRecurDetailsPanel.refresh();
			setPanelDisplay(this.costTranRecurDetailsPanel, "cost_tran_recur", this.isMcAndVatEnabled, this.displayCurrency);
	    }
	},

	getSystemYear: function() { 
		var systemDate = new Date();
		var x = systemDate.getYear();
		systemYear = x % 100;
		systemYear += (systemYear < 38) ? 2000 : 1900;
		return systemYear;	
	}
});

