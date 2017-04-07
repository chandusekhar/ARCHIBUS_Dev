
View.createController('calculateCashFlowProjection', {
    
	requestParameters: null,
    
    setRequestParameters: function() {
        var record = this.consoleDs.processOutboundRecord(this.console.getRecord());
        var dateStart = record.getValue('cost_tran_recur.date_start');
        var dateEnd = record.getValue('cost_tran_recur.date_end');
        var fromCosts = $('fromCosts').checked;
        var fromScheduledCosts = $('fromScheduledCosts').checked;
        var fromRecurringCosts = $('fromRecurringCosts').checked;
        var groupByCostCategory = $('groupByCostCategory').checked;

        // KB 3045253 - Temporary stop-gap to deal with refactoring of cost service code.
        // See ab-rplm-cost-mgmt-cash-flow-rep.js, refactoring occurred from revision 52->53
        var requestParameters = {
                "ctry_id": "", "regn_id":"", "pr_id": "", "state_id": "", "bl_id": "", "city_id":"", "site_id": "", "ls_id": "",
                "multipleValueSeparator": Ab.form.Form.MULTIPLE_VALUES_SEPARATOR,
                "cost_from": "000", "cost_assoc_with": "property", "cost_type_of": "NETINCOME", 
                "date_start":"", "date_end": "", "period":"MONTH", "is_fiscal_year": "false", 
                "currency_code":"", "exchange_rate": "", "vat_cost_type":"",  "is_budget_currency": "false",
                "exclude_cost_categ":"", "include_cost_categ": "", "group_by_cost_categ": "false"
        };
        
        requestParameters["date_start"] = dateStart;
        requestParameters["date_end"] = dateEnd;
        
        var arrCostFrom = ['0', '0', '0'];
		if (fromRecurringCosts) {
			arrCostFrom[0] = '1';
		}
		if (fromScheduledCosts) {
			arrCostFrom[1] = '1';
		}
		if (fromCosts) {
			arrCostFrom[2] = '1';
		}
        requestParameters["cost_from"] = arrCostFrom.join('');
        if (groupByCostCategory) {
          requestParameters["group_by_cost_categ"] = "true";
        }
            
        requestParameters["isMcAndVatEnabled"] = "false";
        // initialize vat variables
        if (View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"] == 1) {
            requestParameters["isMcAndVatEnabled"] = "true";
            requestParameters["vat_cost_type"] = "total";
            requestParameters["currency_code"] = View.user.userCurrency.code;
            requestParameters["exchange_rate"] = "Payment";
        }
        
        this.requestParameters = requestParameters;      
    },
    
    console_onCalculate: function() {
        this.setRequestParameters();
        try {
			var result = Workflow.callMethod('AbCommonResources-CostReportingService-getCashFlowProjection', this.requestParameters);
            this.report.show();
            this.report.setDataSet(result.dataSet);
        } catch (e) {
            Workflow.handleError(e);
        }
    },
    
    console_onCalculateAsJob: function() {
        this.setRequestParameters();
        
        try {
			var jobId = Workflow.startJob('AbCommonResources-CostReportingService-getCashFlowProjection', this.requestParameters);
            
            var reportPanel = this.report;
            View.openJobProgressBar('Calculating', jobId, '', function(status) {
                reportPanel.show();
                reportPanel.setDataSet(status.dataSet);
            });
            
        } catch (e) {
            Workflow.handleError(e);
        }
    }
});
