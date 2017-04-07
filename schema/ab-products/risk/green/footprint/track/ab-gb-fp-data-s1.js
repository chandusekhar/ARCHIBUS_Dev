var abGbFpDataS1Controller = View.createController('abGbFpDataS1Ctrl', {
	//reference to dataConttroller which offers access to 'onDeleteSource' function
	dataController: View.getOpenerView().controllers.get("abGbFpDataCtrl"),
	
	

	afterViewLoad: function(){
		this.abGbFpDataS1_fpTabs.addEventListener('afterTabChange', afterTabChange);
		this.dataController.addRestrToSubTabs(this.abGbFpDataS1_fpTabs, View.getOpenerView().panels.get('abGbFpData_fpTabs').tabs[1].restriction);
	}
	
	
})

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
		tabContentFrame.View.closeDialog();
    }
}
