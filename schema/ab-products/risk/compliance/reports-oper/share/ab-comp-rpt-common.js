/**
 * @author song
 * contains tab change refresh child view logic, set title etc.
 */ 
var commonRptController = View.createController('commonRptController', {
	/**
	 * object store restrictions filter all tab panel grid.
	 */
	objRestrictions: {"regulation": null,"reg_program": null,"reg_requirement": null},
	/**
	 * object store titles for all panel grid.
	 */
	objPanelTitles: null,
	/**
	 * object store [key:tabname, value:gridPanelId] for all tabs.
	 */
	objTabAndGridPanelId: null,

	/**
	 * Track need refresh.  object store [key:tabname, value:1/0] for all tabs.
	 */
	tabNameRefresh: null,

	// Track first tab
	firstTabTable: null,
	
	//----------------event handle--------------------
    afterViewLoad: function(){
    	
    },
    
    afterInitialDataFetch: function(){
		
    },
    
	
	/**
     * update select tab to refresh status.
     */
    setTabRefreshObj: function(selectedTabName, status){
    	this.tabNameRefresh[selectedTabName] = status;
    },
    
    /**
     * update other select tab to refresh status.
     */
    setOthersTabRefreshObj: function(selectedTabName, status){
    	var tabNameRefresh = this.tabNameRefresh;
    	for(var prop in tabNameRefresh){
    		if(prop!=selectedTabName){
    			tabNameRefresh[prop] = status;
    		}
    	}
    },
    
    /**
     * when tab changed.
     * The afterSelect listener is also used, but only so that a proper refresh will happen the first time a tab is selected,
     * because beforeTabChange doesn’t work for that first refresh.  After the first time, 
     * beforeTabChange takes care of all the refreshes, and afterSelect does nothing, 
     * since beforeTabChange has already done the refresh and set the flag to not need refresh.
     */
    afterTabChange: function(tabPanel,selectedTabName){
    	
    	var currentTab = tabPanel.findTab(selectedTabName);
    	if(commonRptController.tabNameRefresh[selectedTabName]==1){
    		if(!currentTab.isContentLoaded){
    			doAfterTabChange(currentTab, commonRptController, selectedTabName);
    		}
    	}
    	commonRptController.setTabRefreshObj(selectedTabName, 0);
    },
    
    beforeTabChange: function(tabPanel,currentTabName,selectedTabName){

    	//close open Dialog before change to another tab.
    	if(currentTabName!=commonRptController.sbfDetailTabs.tabs[0].name){
    		var childView = getChildView(commonRptController, currentTabName);
    		if(childView){
    			childView.closeDialog();
    		}
    	}
    	
    	var currentTab = tabPanel.findTab(selectedTabName);
    	if(commonRptController.tabNameRefresh[selectedTabName]==1){
    		if(currentTab.isContentLoaded){
    			doTabChange(commonRptController, selectedTabName);
    		}
    		return true;
		}

    },

    /**
     * get dataSource main table name for refresh restriction.
     */
    getTableName: function(selectedTabName){
    	var tableName = "";
    	if(selectedTabName=="regulation"){
    		tableName = "regulation";
    	}else if(selectedTabName=="comprogram"){
    		tableName = "regprogram";
    	}else if(selectedTabName=="requirement"){
    			tableName = "regrequirement";
    	}else if(selectedTabName=="events"){
    			tableName = "activity_log";
    	}else if(selectedTabName=="locations"){
    		tableName = "regloc";
    	}else if(selectedTabName=="docs"){
    		tableName = "docs_assigned";
    	}else if(selectedTabName=="commLog"){
    		tableName = "ls_comm";
    	}else if(selectedTabName=="violations"){
    		tableName = "regviolation";
    	}else if(selectedTabName=="workHistory"){
    		tableName = "wr";
    	}
    	return tableName;
    },
    
    /**
     * call after method 'beforeTableChange' or afterTabChange. refresh selected tab grid panel and reset title name. 
     * you can overwrite this method in child controller 'afterInitialDataFetch' method, e.g. :
     * this.doTabRefreshAndSetTitle = function(){ do things... }
     */
    doTabRefreshAndSetTitle: function(gridPanel, selectedTabName, selectedTabCtrl){
    	
		var tableName = this.getTableName(selectedTabName);
		var regulation = this.objRestrictions["regulation"];
		var reg_program = this.objRestrictions["reg_program"];
		var reg_requirement = this.objRestrictions["reg_requirement"];
		
		if((regulation!=null&&reg_program==null&&reg_requirement==null) || tableName == "regprogram"){
			//kb 3035790 for 'location/document and comm-log tab, add program is null condition if regulation selected.
			if(selectedTabName=="locations"||selectedTabName=="docs"||selectedTabName=="commLog"){
				gridPanel.refresh(tableName+".regulation  = '"+regulation+"' and "+tableName+".reg_program IS NULL");
			}else{
				gridPanel.refresh(tableName+".regulation  = '"+regulation+"'");
			}
			gridPanel.setTitle(getMessage("title_"+selectedTabName)+": "+regulation);
		
		}else if((regulation!=null&&reg_program!=null&&reg_requirement==null) || tableName == "regrequirement"){
			
			if(selectedTabName=="notifications"){
				gridPanel.refresh("exists ( select 1 from regnotify,regprogram where  notify_templates.template_id=regnotify.template_id " +
				"  and regnotify.reg_program = regprogram.reg_program and regprogram.reg_program  = '"+reg_program+"')");
				//kb 3035790 for 'location/document and comm-log tab, add requirement is null condition if program selected.	
			}else if(selectedTabName=="locations"||selectedTabName=="docs"||selectedTabName=="commLog"){
				gridPanel.refresh(tableName+".regulation  = '"+regulation+"' and "+tableName+".reg_program = '"+reg_program+"' and "+tableName+".reg_requirement IS NULL");
			}else{
				gridPanel.refresh(tableName+".regulation  = '"+regulation+"' and "+tableName+".reg_program = '"+reg_program+"'");
			}
			gridPanel.setTitle((getMessage("title1_"+selectedTabName).replace("<{0}>", reg_program)).replace("<{1}>", regulation));
		
		}else if(regulation!=null&&reg_program!=null&&reg_requirement!=null){
			
			if(selectedTabName=="notifications"){
				gridPanel.refresh("exists ( select 1 from regnotify,regprogram,regrequirement where notify_templates.template_id=regnotify.template_id " +
				" and regnotify.reg_program = regprogram.reg_program and regprogram.reg_program  = '"+reg_program+"' " +
				" and regnotify.reg_requirement = regrequirement.reg_requirement and regrequirement.reg_requirement  = '"+reg_requirement+"' )");
			} 
			else if (selectedTabName=="workHistory") {
				gridPanel.regulation = regulation;
 				gridPanel.reg_program = reg_program;
				gridPanel.reg_requirement = reg_requirement;
				if (selectedTabCtrl && selectedTabCtrl.refreshSubTabs){
					selectedTabCtrl.refreshSubTabs();
				}
			}
			else{
				gridPanel.refresh(tableName+".regulation  = '"+regulation+"' and "+tableName+".reg_program = '"+reg_program+"' and "+tableName+".reg_requirement = '"+reg_requirement+"'");
			}
			gridPanel.setTitle( ((getMessage("title2_"+selectedTabName).replace("<{0}>", reg_requirement)).replace("<{1}>", reg_program)).replace("<{2}>", regulation));
		}
    }
});





/**
 * called when click change tab
 * if tab grid panel show showOnLoad=false, use this method to make sure 'doTabChange' method invoke after grid hidden.
 * @param selectedTabName : selected Tab Name
 */
function doAfterTabChange(currentTab, controller,selectedTabName){
	if(!currentTab.isContentLoaded){
//		tab with iframe loading two times, invoke this method after waiting 1st make sure all the changing occur after tab second loading. 
		doAfterTabChange.defer(500, this, [currentTab, controller,selectedTabName]);
	}else{
		doTabChange(controller, selectedTabName);
	}
}

/**
 * do refresh and set title.
 * @param controller
 * @param selectedTabName
 */	
function doTabChange(controller, selectedTabName){
	var childView = getChildView(controller, selectedTabName);
	var gridPanelName = controller.objTabAndGridPanelId[selectedTabName];
	if(gridPanelName){// if it's first tab, do not invoke refresh or setTitle, just change tab.
		var gridPanel = childView.panels.get(gridPanelName);
		var selectedTabCtrl = childView.controllers.get("commonRptWorkHistoryController");
		commonRptController.doTabRefreshAndSetTitle(gridPanel, selectedTabName, selectedTabCtrl);
	}
}
/**
 * recursive get child View. 
 */
function getChildView(controller, selectedTabName){
	var tab = controller.sbfDetailTabs.findTab(selectedTabName);
	var iframe = tab.getContentFrame();    
	if(!iframe) {
		getChildView.defer(500, this, [controller,selectedTabName]);
	}
	var childView = iframe.View;
	if(!childView){
		getChildView.defer(500, this, [controller,selectedTabName]);
	}else{
		return childView;
	}
}