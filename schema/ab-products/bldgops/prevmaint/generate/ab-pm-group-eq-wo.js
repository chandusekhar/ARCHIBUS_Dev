var eqTabController = View.createController('eqtabcontrol', {
    
	eq_wo_group_onGenerate: function(){
        this.generateWorkOrders();
    },
    
    eq_wo_group_onBack: function(){
        View.parentTab.parentPanel.selectTab(View.parentTab.parentPanel.tabs[0].name, null, false, false, true);
    },
    
    generateWorkOrders: function(){
        var groupBy = null;
        var radio_grouping = document.getElementsByName("grouping");
        for (var i = 0; i < radio_grouping.length; i++) 
            if (radio_grouping[i].checked == 1) {
                groupBy = radio_grouping[i].value;
                break;
            }
        
        var useGroupCode = false;
        var generateNewDate = false;
        var check_grouping = document.getElementsByName("other");
        useGroupCode = check_grouping[1].checked;
        generateNewDate = check_grouping[0].checked;
        
        var tabs = View.parentTab.parentPanel;
        var gen_date_from = tabs.dataFrom;
        var gen_date_to = tabs.dataTo;

	   var pmsidRestriction;
        if (tabs.pmsIdRestirction) 
			pmsidRestriction =tabs.pmsIdRestirction; 
        else 
			pmsidRestriction = getSchedDatesRestriction(tabs.siteId, tabs.blId, tabs.flId, tabs.pmGroup, tabs.trId, 'EQ');

		//This method serve as a WFR to call a long running job generating work orders and work requests
        //for specified date range and other options,file='PreventiveMaintenanceCommonHandler.java'
         try {
            var result = Workflow.callMethod('AbBldgOpsPM-PmEventHandler-PmWorkOrderGenerator',    
				gen_date_from, gen_date_to, "EQPM", groupBy, generateNewDate, useGroupCode, pmsidRestriction);
            
            if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
                result.data = eval('(' + result.jsonExpression + ')');
                tabs.jobId = result.data.jobId;
				tabs.selectTab("eq_job_tab");
            }
        } 
        catch (e) {
            Workflow.handleError(e);
        }
    }
});
