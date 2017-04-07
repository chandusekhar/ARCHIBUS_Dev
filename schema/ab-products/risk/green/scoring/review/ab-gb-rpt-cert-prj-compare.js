var abGbRptCertProjCompController =View.createController('abGbRptCertProjCompController', {
       
    // ----------------------- event handlers -------------------------
	/**
	 * on_click event handler for 'Show' action
	 */
	fieldsArraysForRestriction: new Array(['bl.site_id',,'bl.site_id'], ['gb_cert_proj.bl_id',,'gb_cert_proj.bl_id'], ['gb_cert_proj.project_name',,'gb_cert_proj.project_name'], ['gb_cert_proj.bl_id',,'gb_cert_proj.bl_id'] , ['gb_cert_proj.project_name',,'gb_cert_proj.project_name'], ['gb_cert_proj.cert_std',,'gb_cert_proj.cert_std'], ['gb_cert_proj.certified_level',,'gb_cert_proj.certified_level'], ['gb_cert_proj.cert_status',,'gb_cert_proj.cert_status']),
	/**
	 * Object: consoleRes is a string format sql restriction that generated from top consoles field values
	 */
	consoleRes:'1=1',
	panelsList: ['abGbRptCertPrjCompareDashTab', 'abGbRptCertPaybackByBlIdTab', 'abGbRptCertProjCompScoreTab', 'abGbRptCertProjCompLevelTab'],
  panelsRefreshList: ['', '', '', ''],
       
   afterViewLoad: function(){
    this.abGbRptCertPrjCompareTabs.addEventListener('afterTabChange', afterTabChange);
   },
 
	afterInitialDataFetch: function(){
		this.abGbRptCertProjCompScoreChartPanel.setDataAxisTitle(getMessage('scoreDataAxisTitle'));
	},
     /**
	 * This event handler is called when user click Show button in title bar of Top console
	 * Construct a string format sql restriction from consoles fields, store it to property consoleRes;
	 * Select first tab, Set consoleRes to sql parameter 'consoleRes' of panel Left Bottom Certification Standard grid and show this grid.
	 * Hide grid panels in second tab and third tab.
	 */
	 
  abGbRptCertProjCompConsole_onFilter: function() {
   
		this.consoleRes=this.getConsoleRestriction();
		// Add restriction to panels in tabs
		this.abGbRptCertProjCompPeriodChartPanel.addParameter('consoleRes', this.consoleRes);
		this.abGbRptCertProjCompScoreChartPanel.addParameter('consoleRes', this.consoleRes);
		this.abGbRptCertProjCompLevelChartPanel.addParameter('consoleRes', this.consoleRes);
	
	  // Add restriction to panels in dashboard tab
	  var abGbRptCertPrjCompareDashTab = this.abGbRptCertPrjCompareTabs.findTab('abGbRptCertPrjCompareDashTab');
	  var abGbRptCertProjCompDashController = abGbRptCertPrjCompareDashTab.getContentFrame().View.controllers.get('abGbRptCertProjCompDashController');
		abGbRptCertProjCompDashController.abGbRptCertProjCompPeriodChartPanel.addParameter('consoleRes', this.consoleRes);
		abGbRptCertProjCompDashController.abGbRptCertProjCompScoreChartPanel.addParameter('consoleRes', this.consoleRes);
		abGbRptCertProjCompDashController.abGbRptCertProjCompLevelChartPanel.addParameter('consoleRes', this.consoleRes);
	
    var tabPanel = View.panels.get('abGbRptCertPrjCompareTabs');
    var tabName = tabPanel.getSelectedTabName();
    
    // Setup all tabs to be refreshed when user clicks tab
    for (i=0; i<this.panelsList.length; i++) { this.panelsRefreshList[i] = this.panelsList[i]; }
    
    // Remove current tab from refresh list
    var idx = this.panelsRefreshList.indexOf(tabName);
    if (idx >= 0) { this.panelsRefreshList[idx] = ''; }
    
    // Refresh current tab
    if (tabName=='abGbRptCertPrjCompareDashTab') {   // Must refresh tab with multiple panels manually
		  abGbRptCertProjCompDashController.abGbRptCertProjCompPeriodChartPanel.refresh();
		  abGbRptCertProjCompDashController.abGbRptCertProjCompScoreChartPanel.refresh();
		  abGbRptCertProjCompDashController.abGbRptCertProjCompLevelChartPanel.refresh();    	
    }
    else tabPanel.refreshTab(tabName);  // Otherwise just refresh tabs with only one panel    	
	},
	
	/**
	 * Get restriction from console
	 */
	getConsoleRestriction: function() {
		var console = View.panels.get('abGbRptCertProjCompConsole');
		var restriction = getRestrictionStrFromConsole(console, this.fieldsArraysForRestriction);		
		return restriction;
	}
});

/**
 * Event listener for 'afterTabChange'
 * @param tabPanel
 * @param currentTabName
 */
function afterTabChange(tabPanel, currentTabName){
	// Do the actual refresh of selected tab after 50 milliseconds, workaround for disappearing chart control bug
  setTimeout("afterTabChangeRefresh()",50);	   
}

// Refresh current tab after the delay set above
function afterTabChangeRefresh(){
  var tabPanel = View.panels.get('abGbRptCertPrjCompareTabs');  
  var tabName = tabPanel.getSelectedTabName();

  var idx = abGbRptCertProjCompController.panelsRefreshList.indexOf(tabName);
  if (idx<0) { return; }   // this tab already refreshed previously
  
  if (tabName=='abGbRptCertPrjCompareDashTab') {   // Must refresh tab with multiple panels manually
	  var abGbRptCertPrjCompareDashTab = tabPanel.findTab(tabName);
	  var abGbRptCertProjCompDashController = abGbRptCertPrjCompareDashTab.getContentFrame().View.controllers.get('abGbRptCertProjCompDashController');
	  abGbRptCertProjCompDashController.abGbRptCertProjCompPeriodChartPanel.refresh();
	  abGbRptCertProjCompDashController.abGbRptCertProjCompScoreChartPanel.refresh();
	  abGbRptCertProjCompDashController.abGbRptCertProjCompLevelChartPanel.refresh();    	
  }
  else tabPanel.refreshTab(tabName);	

  // Remove panel from refresh list
  abGbRptCertProjCompController.panelsRefreshList[idx] = '';
}





