
var controller = View.createController('calculateLeaseCostDetails', {

	regexMonth: /\d{2}/g, 
	regexYear: /\d{4}/, 
	month: null, 
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
		var monthClause = this.view.restriction.findClause('cost_tran_recur.month');
		if (monthClause != null) {
			this.year = monthClause.value.match(this.regexYear)[0];
			this.month = monthClause.value.match(this. regexMonth)[2];
		}
		
		var restriction = '';
		if(View.getOpenerView().controllers.get('calculateLeaseCosts') != undefined){
			this.openerController = View.getOpenerView().controllers.get('calculateLeaseCosts');
			this.isMcAndVatEnabled = this.openerController.isMcAndVatEnabled;
			this.displayVAT = this.openerController.displayVAT;
			this.displayCurrency = this.openerController.displayCurrency;
			
			restriction = this.openerController.getConsoleRestriction();
		}

		if (monthClause != null && lsClause != null) {
			panelTitle = getMessage("costTranRecurDetailsPanelTitle").replace("{0}",this.month+"/"+this.year);
			restriction += " AND cost_tran_recur.ls_id = '"+lsClause.value+"'";
			restriction += " AND (cost_tran_recur.date_end >= ${sql.date('"+this.year+'-'+this.month+"-01')} OR cost_tran_recur.date_end IS NULL)";
			this.incrementMonthAndYear(this.month);
			restriction += " AND cost_tran_recur.date_start < ${sql.date('"+this.year+'-'+this.month+"-01')}";
			this.costTranRecurDetailsPanel.addParameter('clientRestriction', restriction);
			setPanelParameters(this.costTranRecurDetailsPanel, "cost_tran_recur", this.isMcAndVatEnabled, this.displayCurrency);
			this.costTranRecurDetailsPanel.refresh();
			setPanelDisplay(this.costTranRecurDetailsPanel, "cost_tran_recur", this.isMcAndVatEnabled, this.displayCurrency);
		}
	    else if (monthClause == null && lsClause != null) {
	    	panelTitle = getMessage("costTranRecurDetailsPanelTitle").replace("{0}",parseInt(this.openerController.year));
	    	//this.costTranRecurDetailsPanel.actions.get('export:PDF').forceHidden();
	    	//this.costTranRecurDetailsPanel.actions.get('export:XLS').forceHidden();
	    	restriction += " AND cost_tran_recur.ls_id = '"+lsClause.value+"'";
	    	restriction += " AND (cost_tran_recur.date_end >= ${sql.date('"+this.openerController.year+"-01-01')} OR cost_tran_recur.date_end IS NULL)";
	    	this.year = parseInt(this.openerController.year) + 1;
			restriction += " AND cost_tran_recur.date_start < ${sql.date('"+this.year+"-01-01')}";
			this.costTranRecurDetailsPanel.addParameter('clientRestriction', restriction);
			setPanelParameters(this.costTranRecurDetailsPanel, "cost_tran_recur", this.isMcAndVatEnabled, this.displayCurrency);
			this.costTranRecurDetailsPanel.refresh();
			setPanelDisplay(this.costTranRecurDetailsPanel, "cost_tran_recur", this.isMcAndVatEnabled, this.displayCurrency);
	    }
	    else if (monthClause != null && lsClause == null) {
	    	panelTitle = getMessage("costTranRecurDetailsPanelTitle_month").replace("{0}",this.month+"/"+this.year);
	    	this.view.getLayoutManager('mainLayout').collapseRegion('north');
	    	restriction += " AND cost_tran_recur.ls_id IS NOT NULL";
	    	restriction += " AND (cost_tran_recur.date_end >= ${sql.date('"+this.year+'-'+this.month+"-01')} OR cost_tran_recur.date_end IS NULL)";
	    	this.incrementMonthAndYear(this.month);
			restriction += " AND cost_tran_recur.date_start < ${sql.date('"+this.year+'-'+this.month+"-01')}";
			this.costTranRecurDetailsPanel.addParameter('clientRestriction', restriction);
			setPanelParameters(this.costTranRecurDetailsPanel, "cost_tran_recur", this.isMcAndVatEnabled, this.displayCurrency);
			this.costTranRecurDetailsPanel.refresh();
			setPanelDisplay(this.costTranRecurDetailsPanel, "cost_tran_recur", this.isMcAndVatEnabled, this.displayCurrency);
	    }
		
		this.costTranRecurDetailsPanel.setTitle(panelTitle);
	},

	incrementMonthAndYear: function(month) {
		switch(month) {
			case '01': this.month = '02'; break;    
			case '02': this.month = '03'; break;   
			case '03': this.month = '04'; break;   
			case '04': this.month = '05'; break;  
			case '05': this.month = '06'; break;  
			case '06': this.month = '07'; break;  
			case '07': this.month = '08'; break;  
			case '08': this.month = '09'; break;  
			case '09': this.month = '10'; break;  
			case '10': this.month = '11'; break;  
			case '11': this.month = '12'; break;  
			case '12': this.month = '01'; this.year++; break;  
		}
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

