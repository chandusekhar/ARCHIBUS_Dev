
var controller = View.createController('calculateLeaseCostDetails', {

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
	    
	    var panelTitle = "";
	    var lsClause = this.view.restriction.findClause('cost_tran_recur.ls_id');
		var yearClause = this.view.restriction.findClause('cost_tran_recur.year');
		if (yearClause != null) {
			this.year = yearClause.value.match(this.regexYear)[0];
		}
		
		var restriction = '';
		if(View.getOpenerView().controllers.get('calculateLeaseCosts') != undefined){
			this.openerController = View.getOpenerView().controllers.get('calculateLeaseCosts');
			this.isMcAndVatEnabled = this.openerController.isMcAndVatEnabled;
			this.displayVAT = this.openerController.displayVAT;
			this.displayCurrency = this.openerController.displayCurrency;
			
			restriction = this.openerController.getConsoleRestriction();
		}

		if (yearClause != null && lsClause != null) {
			panelTitle = getMessage("costTranRecurDetailsPanelTitle").replace("{0}",this.year);
			restriction += " AND cost_tran_recur.ls_id = '"+lsClause.value+"'";
			restriction += " AND (cost_tran_recur.date_end >= ${sql.date('"+this.year+"-01-01')} OR cost_tran_recur.date_end IS NULL)";
			this.year++;
			restriction += " AND cost_tran_recur.date_start < ${sql.date('"+this.year+"-01-01')}";
			this.costTranRecurDetailsPanel.addParameter('clientRestriction', restriction);
			setPanelParameters(this.costTranRecurDetailsPanel, "cost_tran_recur", this.isMcAndVatEnabled, this.displayCurrency);
			this.costTranRecurDetailsPanel.refresh();
			setPanelDisplay(this.costTranRecurDetailsPanel, "cost_tran_recur", this.isMcAndVatEnabled, this.displayCurrency);
		}
	    else if (yearClause == null && lsClause != null) {
	    	panelTitle = getMessage("costTranRecurDetailsPanelTitle").replace("{0}",parseInt(this.openerController.fromYear) + ' - ' + parseInt(this.openerController.toYear));
	    	restriction += " AND cost_tran_recur.ls_id = '"+lsClause.value+"'";
	    	restriction += " AND (cost_tran_recur.date_end >= ${sql.date('"+this.openerController.fromYear+"-01-01')} OR cost_tran_recur.date_end IS NULL)";
			this.year = parseInt(this.openerController.toYear) + 1;
			restriction += " AND cost_tran_recur.date_start < ${sql.date('"+this.year+"-01-01')}";
			this.costTranRecurDetailsPanel.addParameter('clientRestriction', restriction);
			setPanelParameters(this.costTranRecurDetailsPanel, "cost_tran_recur", this.isMcAndVatEnabled, this.displayCurrency);
			this.costTranRecurDetailsPanel.refresh();
			setPanelDisplay(this.costTranRecurDetailsPanel, "cost_tran_recur", this.isMcAndVatEnabled, this.displayCurrency);
	    }
	    else if (yearClause != null && lsClause == null) {
	    	panelTitle = getMessage("costTranRecurDetailsPanelTitle_year").replace("{0}",this.year);
	    	this.view.getLayoutManager('mainLayout').collapseRegion('north');
	    	restriction += " AND cost_tran_recur.ls_id IS NOT NULL";
	    	restriction += " AND (cost_tran_recur.date_end >= ${sql.date('"+this.year+"-01-01')} OR cost_tran_recur.date_end IS NULL)";
			this.year++;
			restriction += " AND cost_tran_recur.date_start < ${sql.date('"+this.year+"-01-01')}";
			this.costTranRecurDetailsPanel.addParameter('clientRestriction', restriction);
			setPanelParameters(this.costTranRecurDetailsPanel, "cost_tran_recur", this.isMcAndVatEnabled, this.displayCurrency);
			this.costTranRecurDetailsPanel.refresh();
			setPanelDisplay(this.costTranRecurDetailsPanel, "cost_tran_recur", this.isMcAndVatEnabled, this.displayCurrency);
	    }
		this.costTranRecurDetailsPanel.setTitle(panelTitle);
	},

	getSystemYear: function() { 
		var systemDate = new Date();
		var x = systemDate.getYear();
		systemYear = x % 100;
		systemYear += (systemYear < 38) ? 2000 : 1900;
		return systemYear;	
	},
	
	costTranRecurDetailsPanel_beforeExportReport: function(panel, fieldDefs){
		return hideFieldBeforeExport(fieldDefs, "cost_tran_recur", this.isMcAndVatEnabled, this.displayCurrency.type);
	}
});

