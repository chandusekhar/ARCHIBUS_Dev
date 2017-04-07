
var controller = View.createController('recurCostByYearReportDetails', {

	regexYear: /\d{4}/, 
	year: null, 
	openerController: null, 
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

    afterInitialDataFetch: function() {
	    this.inherit();

	    var lsClause = this.view.restriction.findClause('cost_tran_recur.ls_id');
		var yearClause = this.view.restriction.findClause('cost_tran_recur.year');
		if (yearClause != null) {
			this.year = yearClause.value.match(this.regexYear)[0];
		}
		
		var restriction = '';
		if(View.getOpenerView().controllers.get('calculateLeaseExpenses') != undefined){
			this.openerController = View.getOpenerView().controllers.get('calculateLeaseExpenses');
			this.isMcAndVatEnabled = this.openerController.isMcAndVatEnabled;
			this.displayVAT = this.openerController.displayVAT;
			this.displayCurrency = this.openerController.displayCurrency;
			restriction = this.openerController.getConsoleRestriction();
		}

		if (yearClause != null && lsClause != null) {
			restriction += " AND cost_tran_recur.ls_id = '"+lsClause.value+"'";
			restriction += " AND cost_tran_recur.date_end >= '"+this.year+"-01-01'";
			this.year++;
			restriction += " AND cost_tran_recur.date_start < '"+this.year+"-01-01'";
			this.costTranRecurDetailsPanel.addParameter('clientRestriction', restriction);
			setPanelParameters(this.costTranRecurDetailsPanel, "cost_tran_recur", this.isMcAndVatEnabled, this.displayCurrency);
			this.costTranRecurDetailsPanel.refresh();
			setPanelDisplay(this.costTranRecurDetailsPanel, "cost_tran_recur", this.isMcAndVatEnabled, this.displayCurrency);
		}
	    else if (yearClause == null && lsClause != null) {
	    	restriction += " AND cost_tran_recur.ls_id = '"+lsClause.value+"'";
	    	restriction += " AND cost_tran_recur.date_end >= '"+this.openerController.fromYear+"-01-01'";
			this.year = parseInt(this.openerController.toYear) + 1;
			restriction += " AND cost_tran_recur.date_start < '"+this.year+"-01-01'";
			this.costTranRecurDetailsPanel.addParameter('clientRestriction', restriction);
			setPanelParameters(this.costTranRecurDetailsPanel, "cost_tran_recur", this.isMcAndVatEnabled, this.displayCurrency);
			this.costTranRecurDetailsPanel.refresh();
			setPanelDisplay(this.costTranRecurDetailsPanel, "cost_tran_recur", this.isMcAndVatEnabled, this.displayCurrency);
	    }
	    else if (yearClause != null && lsClause == null) {
	    	this.view.getLayoutManager('mainLayout').collapseRegion('north');
	    	restriction += " AND cost_tran_recur.ls_id IS NOT NULL";
	    	restriction += " AND cost_tran_recur.date_end >= '"+this.year+"-01-01'";
			this.year++;
			restriction += " AND cost_tran_recur.date_start < '"+this.year+"-01-01'";
			this.costTranRecurDetailsPanel.addParameter('clientRestriction', restriction);
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

