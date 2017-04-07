var defineGenRuleSelectTab_Controller = View.createController('defineGenRuleSelectTab_Controller', {

    ////////////////////////////Event Handler////////////////////////////////////////
    
    afterInitialDataFetch: function(){
        var tabs = View.parentTab.parentPanel;
        tabs.addEventListener('afterTabChange', this.tabs_afterTabChange.createDelegate(this));
    },
    
    tabs_afterTabChange: function(tabPanel, newTabName){
        var tabs = View.parentTab.parentPanel;
        if (newTabName == 'select') {
            this.rule_report.restriction = null;
            this.rule_report.refresh();
        }
    },
    
    rule_report_onAddEqPMRule: function(){
        this.onAddEQPMRule();
    },
    
    rule_report_onAddHSPMRule: function(){
        this.onAddHSPMRule();
    },
    
    /////////////////////////////Logic function///////////////////////////////////////
    
    /**
     * Navigate to the Manage Generation Rule tab Pass the parameter 'EQPM' for the pmgen.pm_type column, to be used when saving the rule
     */
    onAddEQPMRule: function(){
        var tabs = View.parentTab.parentPanel;
        var restriction = new Ab.view.Restriction();
        restriction.addClause("pmgen.pm_type", "EQPM", "=");
        tabs.selectTab("define", restriction, true);
    },
    
    /**
     * Navigate to the Manage Generation Rule tab Pass the parameter 'HSPM' for the pmgen.pm_type column, to be used when saving the rule
     */
    onAddHSPMRule: function(){
        var tabs = View.parentTab.parentPanel;
        var restriction = new Ab.view.Restriction();
        restriction.addClause("pmgen.pm_type", "HSPM", "=");
        tabs.selectTab("define", restriction, true);
    }
});
