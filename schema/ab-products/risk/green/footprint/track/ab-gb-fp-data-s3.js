View.createController('abGbFpDataS3_ctrl', {
	
	
	//'abGbFpDataDetails_form' it is used to get access to 'gb_fp_setup' record
	abGbFpDataDetails_form:null,
	
	
	//reference to dataConttroller which offers access to 'onDeleteSource' function
	dataController: View.getOpenerView().controllers.get("abGbFpDataCtrl"),
	
	afterViewLoad: function(){
		
		this.abGbFpDataDetails_form = View.getOpenerView().controllers.get('abGbFpDataCtrl').abGbFpData_fpTabs.tabs[0].getContentFrame().View.controllers.get('abGbFpDataDetailsCtrl').abGbFpDataDetails_formFp;
		this.abGbFpDataS3_tabs.addEventListener('afterTabChange', afterTabChange);
		
		this.dataController.addRestrToSubTabs(this.abGbFpDataS3_tabs, View.getOpenerView().panels.get('abGbFpData_fpTabs').tabs[3].restriction);
	}
	
	
});


/**
 * Event listener for 'afterTabChange'
 * @param tabPanel
 * @param currentTabName
 */
function afterTabChange(tabPanel, currentTabName){

    //hide edit panel from the current tab
	var currentTab = tabPanel.findTab(currentTabName);
	var tabContentFrame = currentTab.getContentFrame();
    
    if (tabContentFrame.View) {
        tabContentFrame.View.panels.items[1].show(false);
		
		// Hide 'Methodology' dialog view from the current selected tab.
		if (currentTabName != 'abGbFpDataS3EmpTransRoad_tab' 
				&& currentTabName != 'abGbFpDataS3EmpTransRail_tab'
				&& currentTabName != 'abGbFpDataS3ContOwnVeh_tab'
				) {
			tabContentFrame.View.panels.items[2].closeWindow();
		}else{
			tabContentFrame.View.closeDialog();
		}
    }
  
}
