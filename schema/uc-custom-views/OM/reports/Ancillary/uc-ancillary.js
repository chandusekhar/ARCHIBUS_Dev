var printMultiInvoiceController = View.createController('printMultiInvoiceController', {

	afterViewLoad: function() {
		this.inherit();
	},

	afterInitialDataFetch: function() {
		this.inherit();
	},

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//console filter
	consolePanel_onShow: function() {
		var date_completed_from = this.consolePanel.getFieldValue('wrhwr.date_completed.from');
		var date_completed_to = this.consolePanel.getFieldValue('wrhwr.date_completed.to');
		var date_closed_from = this.consolePanel.getFieldValue('wrhwr.date_closed.from');
		var date_closed_to = this.consolePanel.getFieldValue('wrhwr.date_closed.to');
		var date_requested_from = this.consolePanel.getFieldValue('wrhwr.date_requested.from');
		var date_requested_to = this.consolePanel.getFieldValue('wrhwr.date_requested.to');

		var restriction = "1=1";
		
		if(date_completed_from != ""){	restriction = restriction + " AND wrhwr.date_completed >= "+this.literalOrNull(date_completed_from);	}
		if(date_completed_to != ""){	restriction = restriction + " AND wrhwr.date_completed <= "+this.literalOrNull(date_completed_to);	}
		if(date_closed_from != ""){	restriction = restriction + " AND wrhwr.date_closed >= "+this.literalOrNull(date_closed_from);	}
		if(date_closed_to != ""){	restriction = restriction + " AND wrhwr.date_closed <= "+this.literalOrNull(date_closed_to);	}
		if(date_requested_from != ""){	restriction = restriction + " AND wrhwr.date_requested >= "+this.literalOrNull(date_requested_from);	}
		if(date_requested_to != ""){	restriction = restriction + " AND wrhwr.date_requested <= "+this.literalOrNull(date_requested_to);	}

		this.abViewdefReport_detailsPanel.refresh(restriction);
	},

	//reset consolePanel
	consolePanel_onClear: function(){
		this.consolePanel.clear();
		
	},
	
	

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//utility functions
	literalOrNull: function(val, emptyString) {
		if(val == undefined || val == null)
			return "NULL";
		else if (!emptyString && val == "")
			return "NULL";
		else
			return "'" + val.replace(/'/g, "''") + "'";
	}

});