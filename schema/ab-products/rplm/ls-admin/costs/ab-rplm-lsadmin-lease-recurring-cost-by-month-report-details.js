
var controller = View.createController('recurCostByMonReportDetails', {

	regexMonth: /\d{2}/g, 
	regexYear: /\d{4}/, 
	month: null, 
	year: null, 

	afterViewLoad: function() {
	    this.inherit();

	    var lsClause = this.view.restriction.findClause('cost_tran_recur.ls_id');
		var monthClause = this.view.restriction.findClause('cost_tran_recur.month');
		if (monthClause != null) {
			this.year = monthClause.value.match(this.regexYear)[0];
			this.month = monthClause.value.match(this. regexMonth)[2];
		}
		
		var restriction = new Ab.view.Restriction();
		if (monthClause != null && lsClause != null) {
			restriction.addClause('cost_tran_recur.ls_id', lsClause.value, '=');
			restriction.addClause('cost_tran_recur.date_end', this.year+'-'+this.month+'-01', '&gt;=');
			restriction.addClause('cost_tran_recur.status_active', '1', '=');
			this.incrementMonthAndYear(this.month);
			restriction.addClause('cost_tran_recur.date_start', this.year+'-'+this.month+'-01', '&lt;');
			this.costTranRecurDetailsPanel.refresh(restriction);
		}
	    else if (monthClause == null && lsClause != null) {
	    	//this.costTranRecurDetailsPanel.actions.get('export:PDF').forceHidden();
	    	//this.costTranRecurDetailsPanel.actions.get('export:XLS').forceHidden();
	    	restriction.addClause('cost_tran_recur.ls_id', lsClause.value, '=');
	    	this.year = this.getSystemYear();
			restriction.addClause('cost_tran_recur.date_end', this.year+'-01-01', '&gt;=');
			restriction.addClause('cost_tran_recur.status_active', '1', '=');
			this.year++;
			restriction.addClause('cost_tran_recur.date_start', this.year+'-01-01', '&lt;');
	    	this.costTranRecurDetailsPanel.refresh(restriction);
	    }
	    else if (monthClause != null && lsClause == null) {
	    	this.view.getLayoutManager('mainLayout').collapseRegion('north');
	    	
	    	restriction.addClause('cost_tran_recur.ls_id', '', 'IS NOT NULL');
			restriction.addClause('cost_tran_recur.date_end', this.year+'-'+this.month+'-01', '&gt;=');
			restriction.addClause('cost_tran_recur.status_active', '1', '=');
			this.incrementMonthAndYear(this.month);
			restriction.addClause('cost_tran_recur.date_start', this.year+'-'+this.month+'-01', '&lt;');
	    	this.costTranRecurDetailsPanel.refresh(restriction);
	    }
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
	}
});

