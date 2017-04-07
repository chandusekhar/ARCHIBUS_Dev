var abGbFpDataController = View.createController('abGbFpDataCtrl', {

	// JSON object which maps tab name with table name
	tabsTables:{
		'abGbFpDataS1_tabFuelComb':'gb_fp_s1_fuel_comb',
		'abGbFpDataS1_tabCoRoad':'gb_fp_s1_s3_mobile',
		'abGbFpDataS1_tabCoAir':'gb_fp_s1_s3_mobile',
		'abGbFpDataS1_tabRefrig':'gb_fp_s1_s3_mobile',
		'abGbFpDataS2_tabPurchElectr':'gb_fp_s2_purch_e',
		'abGbFpDataS3WastesSol_tab':'gb_fp_s3_waste_sol',
		'abGbFpDataS3WastesLiq_tab':'gb_fp_s3_waste_liq',
		'abGbFpDataS3EmpTransRoad_tab':'gb_fp_s1_s3_mobile',
		'abGbFpDataS3EmpTransRail_tab':'gb_fp_s1_s3_mobile',
		'abGbFpDataS3EmpTransAir_tab':'gb_fp_s3_em_air',
		'abGbFpDataS3PurchMat_tab':'gb_fp_s3_mat',
		'abGbFpDataS3ContOwnVeh_tab':'gb_fp_s1_s3_mobile',
		'abGbFpDataS3OutAct_tab':'gb_fp_s3_outs',
		'abGbFpDataS3OffSiteSrv_tab':'gb_fp_s3_serv',
		'abGbFpData_tabFpOther':'gb_fp_s_other'
	},

	afterViewLoad: function(){
		this.abGbFpData_fpTabs.addEventListener('afterTabChange', afterTabChange);
	},

	abGbFpData_fpList_onAddNew: function(){
		this.showTabsAndSelectDetailsTab(true, new Ab.view.Restriction({}));
    },
    
    /**
     * Common delete action for all sub-tabs of Scopes 1,2,3,Other
     * @param sourcePanel
     * @param footprintsPanel
     */
    onDeleteSource: function(sourcePanel, footprintsPanel){
    	View.confirm(getMessage("confirmDeleteSource"), function(button){
            if (button == 'yes') {
            	if(sourcePanel.deleteRecord()){
    		
    	        	// hide the form panel
    	        	sourcePanel.show(false);
    				
    				// refresh the list of footprints
    	        	footprintsPanel.refresh();
            	}
            }
        })
    },
    
    /**
     * Shows the tabs, sets restriction to them, selects Details tab
     * @param {Boolean} newRecord
     * @param {Ab.view.Restriction} restriction
     */
    showTabsAndSelectDetailsTab: function(newRecord, restriction){
		var tabs = this.abGbFpData_fpTabs;
		var clearRestriction = newRecord;
		
		for (var i = 0; i < tabs.tabs.length; i++) {
			var tab = tabs.tabs[i];
			tab.show(true);
			tab.enable(!newRecord);
			
			// for the tab Other, "personalize" the restriction 
			if(tab.name == "abGbFpData_tabFpOther") {
				if(restriction &&
						((restriction.clauses && restriction.clauses.length > 0)
						|| (restriction['gb_fp_setup.bl_id']))){
					var otherRestriction = this.buildRestr(this.tabsTables[tab.name], restriction);
					tabs.setTabRestriction(tab.name, otherRestriction);
				} else {
					tabs.setTabRestriction(tab.name, restriction);
				}
			} else {
				tabs.setTabRestriction(tab.name, restriction);
			}
			
			if(i != 0 && !newRecord){
				//tabs.refreshTab(tab.name);  KB# 3039247
				
				// if the tab has sub-tabs then add tab restriction to all its sub-tabs.
				var tabContentFrame = tab.getContentFrame();
				if(tabContentFrame.View && tabContentFrame.View.panels.get(0).type == 'tabs'){
					this.addRestrToSubTabs(tabContentFrame.View.panels.get(0), tab.restriction);
				}
			}
		}
		
		tabs.selectTab("abGbFpData_tabFpDetails", restriction, newRecord, clearRestriction);
		tabs.refreshTab("abGbFpData_tabFpDetails");
    },
	
	/**
	 * Add a restriction to all sub-tabs of a tab 
	 * 
	 * @param {Object} subTabsPanel
	 * @param {Object} tabRestr 
	 */
	addRestrToSubTabs:function(subTabsPanel, tabRestr){
		
		for(var i=0; i<subTabsPanel.tabs.length; i++){
			var tabName = subTabsPanel.tabs[i].name;
			subTabsPanel.setTabRestriction(tabName, this.buildRestr(this.tabsTables[tabName], tabRestr));
		}
		
	},
	
	/**
	 * Returns an Ab.view.Restriction object which is based on 'tabRestr' clauses.
	 * 
	 * @param {Object} tableName
	 * @param {Object} tabRestr
	 */
	buildRestr: function(tableName, tabRestr){
		
		var restriction = new Ab.view.Restriction();
		
		var	bl_clause = (tabRestr['gb_fp_setup.bl_id'])?tabRestr['gb_fp_setup.bl_id']:tabRestr.clauses[0].value;
		restriction.addClause(tableName+".bl_id",bl_clause );
		
		var year_clause = (tabRestr['gb_fp_setup.calc_year'])?tabRestr['gb_fp_setup.calc_year']:tabRestr.clauses[1].value;
		restriction.addClause(tableName+".calc_year", year_clause);
		
		var scenario_clause = (tabRestr['gb_fp_setup.scenario_id'])?tabRestr['gb_fp_setup.scenario_id']:tabRestr.clauses[2].value;
		restriction.addClause(tableName+".scenario_id", scenario_clause);
		
		return restriction;		
	}
})

function selectDetailsTab(commandObject){
	abGbFpDataController.showTabsAndSelectDetailsTab(false, commandObject.getRestriction());
}

/**
 * Event listener for 'afterTabChange'
 * @param tabPanel
 * @param currentTabName
 */
function afterTabChange(tabPanel, currentTabName){
	if(currentTabName == "abGbFpData_tabFpDetails")
		return;
	
	var currentTab = tabPanel.findTab(currentTabName);
	var tabContentFrame = currentTab.getContentFrame();
	
	
	
	if (tabContentFrame.View) {
		
		//if currentTab has sub-tabs then: refresh first subTab, hide form panel from first subTab and select first subTab 
		if (tabContentFrame.View.panels.get(0).type == 'tabs') {
		
			var tabs = tabContentFrame.View.panels.items[0]
			var firstSubTab = tabs.tabs[0];
			
			//refresh first subTab
			tabs.refreshTab(firstSubTab.name);
			
			//hide form panel from first subTab 
			if (firstSubTab.getContentFrame().View) {
				firstSubTab.getContentFrame().View.panels.get(1).show(false);
			}
			
			// Hide 'Methodology' dialog view from first subTab .
			if (firstSubTab.getContentFrame().View.panels.items[2]) {
				firstSubTab.getContentFrame().View.panels.items[2].closeWindow();
			}
			else {
				firstSubTab.getContentFrame().View.closeDialog();
			}
			
			//select first subTab
			tabs.selectFirstVisibleTab();
		}
		
		// for Other tab, hide the form panel
		 else if (tabContentFrame.View.panels.get(0).id == 'abGbFpDataOther_gridFootprints') {
			tabContentFrame.View.panels.get(1).show(false);
			tabPanel.refreshTab(currentTabName);  // KB# 3039247
		}
	
	}
}