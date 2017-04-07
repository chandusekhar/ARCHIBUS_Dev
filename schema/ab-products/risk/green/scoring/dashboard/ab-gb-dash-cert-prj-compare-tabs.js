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
  periodChartRefresh: false,
  scoreChartRefresh: false,
  levelChartRefresh: false,
       
   afterViewLoad: function(){
    this.abGbRptCertPrjCompareTabs.addEventListener('afterTabChange', afterTabChange);
   },
 
     /**
	 * This event handler is called when user click Show button in title bar of Top console
	 * Construct a string format sql restriction from consoles fields, store it to property consoleRes;
	 * Select first tab, Set consoleRes to sql parameter 'consoleRes' of panel Left Bottom Certification Standard grid and show this grid.
	 * Hide grid panels in second tab and third tab.
	 */
	 
    abGbRptCertProjCompConsole_onFilter: function() {
   
		this.consoleRes=this.getConsoleRestriction();
		this.abGbRptCertProjCompPeriodChartPanel.addParameter('consoleRes', this.consoleRes);
		//this.abGbRptCertProjCompPeriodChartPanel.refresh();
		this.abGbRptCertProjCompScoreChartPanel.addParameter('consoleRes', this.consoleRes);
		// this.abGbRptCertProjCompScoreChartPanel.show(false);
		this.abGbRptCertProjCompLevelChartPanel.addParameter('consoleRes', this.consoleRes);
		// this.abGbRptCertProjCompLevelChartPanel.show(false);
	
    var tabPanel = View.panels.get('abGbRptCertPrjCompareTabs');
    var tabName = tabPanel.getSelectedTabName();
    tabPanel.refreshTab(tabName);	
    if (tabName=='abGbRptCertPaybackByBlIdTab') { this.periodChartRefresh = false; this.scoreChartRefresh = true; this.levelChartRefresh=true; }
    else if (tabName=='abGbRptCertProjCompScoreTab') { this.periodChartRefresh = true; this.scoreChartRefresh = false; this.levelChartRefresh=true; }
    else if (tabName=='abGbRptCertProjCompLevelTab') { this.periodChartRefresh = true; this.scoreChartRefresh = true; this.levelChartRefresh=false; }   
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
  setTimeout("afterTabChangeRefresh()",50);	
}

function afterTabChangeRefresh(){
  var tabPanel = View.panels.get('abGbRptCertPrjCompareTabs');  
  var tabName = tabPanel.getSelectedTabName();
  
  var periodChartRefresh = abGbRptCertProjCompController.periodChartRefresh;
  var scoreChartRefresh = abGbRptCertProjCompController.scoreChartRefresh;
  var levelChartRefresh = abGbRptCertProjCompController.levelChartRefresh;
  
  if (tabName=='abGbRptCertPaybackByBlIdTab' && !periodChartRefresh) { return; }
  else if (tabName=='abGbRptCertProjCompScoreTab' && !scoreChartRefresh) { return; }
  else if (tabName=='abGbRptCertProjCompLevelTab' && !levelChartRefresh) { return; }
  
  tabPanel.refreshTab(tabName);	

  if (tabName=='abGbRptCertPaybackByBlIdTab') { abGbRptCertProjCompController.periodChartRefresh = false; }
  else if (tabName=='abGbRptCertProjCompScoreTab') { abGbRptCertProjCompController.scoreChartRefresh = false; }
  else if (tabName=='abGbRptCertProjCompLevelTab') { abGbRptCertProjCompController.levelChartRefresh = false; }
}





