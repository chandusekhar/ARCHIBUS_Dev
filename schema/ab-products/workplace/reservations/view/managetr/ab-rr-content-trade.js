
/**
 * The controller is used for ab-rr-content-trade.axvw,
 * and it is mainly used for initialize the parameters and
 * holding parameters as a container.
 */
var abRrContentTradeController = View.createController('abRrContentTradeController', {

    wrRestriction: null,
    
    afterInitialDataFetch: function(){
        this.initParameters();
    },
    
    /**
     * Initialize some parameters.
     */
    initParameters: function(){
        this.initRestriction();
        this.mainTradeTabs.selectTab("all-trade");
    },
    
    /**
     * When the user clicks on the Search button, we'll call the onSearch function that
     * will get all the console values and will create additional restrictions with
     * these values to apply them to the editable report.
     */
    requestPanel_onSearch: function(){
        //Check the security groups the user belongs to, in order to restrict the list of reservations 
        //that must be showed
        this.initRestriction();
        
        //Create the restrictions to apply with the values selected by the user
        this.applySearchRestrictions();
        this.mainTradeTabs.selectTab("all-trade");
    },
    
    /**
     * When clicking in the Clear button, the onClear function will be called.
     * Then the system will clear all the existing restrictions, the results list,
     * and all the console values, and will apply again the initial restrictions that are
     * saved into the wrRestriction variable.
     */
    requestPanel_onClear: function(){
        //Clear all the console value fields
        this.requestPanel.setFieldValue("bl.ctry_id", "");
        this.requestPanel.setFieldValue("wr.bl_id", "");
        this.requestPanel.setFieldValue("wr.fl_id", "");
        this.requestPanel.setFieldValue("wr.rm_id", "");
        this.requestPanel.setFieldValue("bl.site_id", "");
        this.requestPanel.setFieldValue("wr.date_assigned", "");
        this.requestPanel.setFieldValue("wr.time_assigned", "");
        
        //Added by Keven by Room Other funcs rx18
        document.getElementById('status').value = "";
        
        //Check the security groups the user belongs to, in order to restrict the list of reservations 
        //that must be showed
        this.initRestriction();
		
		this.mainTradeTabs.selectTab("all-trade");
    },
    
    /**
     * Create Group's restrictions according to current user's groups.
     */
    initRestriction: function(){
    
        this.wrRestriction = new Ab.view.Restriction();
        this.wrRestriction.addClause("wr.rmres_id", "", "IS NOT NULL", "AND(");
        this.wrRestriction.addClause("wr.rsres_id", "", "IS NOT NULL", "OR");
        this.wrRestriction.addClause("wr.tr_id", "", "IS NOT NULL", ")AND(");
        
        if (ABRV_isMemberOfGroup(View.user,'RESERVATION TRADES')) {
        	var tradeCode = this.getTradeCode(View.user.email);
            this.wrRestriction.addClause("wr.tr_id", tradeCode, "=", "AND");
        }
        
        this.mainTradeTabs.setTabRestriction("all-trade", this.wrRestriction);
        this.mainTradeTabs.setTabRestriction("setUp-trade", this.wrRestriction);
        this.mainTradeTabs.setTabRestriction("cleanUp-trade", this.wrRestriction);
    },
    
    /**
     * Create the additionals restrictions according to the workReservations restriction,
     * which are builded when user click the "Search" button.
     */
    applySearchRestrictions: function(){
        var workReservation = this.requestPanel.getFieldRestriction();
        
        //kb3025035
        var timePerform = this.requestPanel.getFieldValue("wr.time_assigned");
        if (timePerform != "") {
            workReservation.removeClause("wr.time_assigned");
            workReservation.addClause("wr.time_assigned", ABRV_formatTime(timePerform), "=");
        }
        
        //Added by Keven by Room Other funcs rx18
        var wrStatus = document.getElementById('status').value;
        if (wrStatus != "") {
            workReservation.addClause("wr.status", wrStatus, "=");
        }
		
        var restriction = this.wrRestriction;
        if (workReservation.clauses.length > 0) {
            restriction.addClauses(workReservation);
        }
        
        //Once we have the restrictions to apply to the three editable reports
        this.mainTradeTabs.setTabRestriction("all-trade", restriction);
        this.mainTradeTabs.setTabRestriction("setUp-trade", restriction);
        this.mainTradeTabs.setTabRestriction("cleanUp-trade", restriction);
    },
    
    getTradeCode: function(email){
    	var rest = new Ab.view.Restriction();
    	rest.addClause("cf.email", email, "=");
        var parameter0 = {
            tableName: 'cf',
            fieldNames: toJSON(['cf.tr_id']),
            restriction: toJSON(rest)
        };
        //get trade code from cf table by email 
        var results = Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameter0);
		var recLen = 0;
		var tradeCodes = [];
        if (results.code == 'executed') {
			recLen = results.data.records.length;
            if (recLen > 0) {
                for (var i = 0; i < recLen; i++) {
                    tradeCodes.push(results.data.records[i]['cf.tr_id']);
                }
            }
        }
        else {
            View.showMessage(results.message);
        }
		var tradeCode = tradeCodes.sort()[recLen-1];
        return tradeCode;
    }
    
});


