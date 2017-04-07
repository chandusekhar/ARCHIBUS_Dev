
var abPmGenerateEqOrderCtrl = View.createController('abPmGenerateEqOrderCtrl', {

    ////////////////////////////Event Handler////////////////////////////////////////
    
    afterInitialDataFetch: function(){
		this.generate_eq_wo.addEventListener('beforeTabChange', beforeTabChange);
    }
});

/**
 * Event listener for 'beforeTabChange'
 * @param tabPanel
 * @param currentTabName
 */
function beforeTabChange(tabPanel,newTab, currentTab){

	var destTab = tabPanel.findTab(currentTab);

	if(destTab.isContentLoaded){
		if(currentTab=="result_tab"){
			var selectControl = destTab.getContentFrame().View.controllers.get('viewPMWorkOrderController');
			if(selectControl)
				selectControl.afterInitialDataFetch();
		 } 
	} else {
		destTab.loadView();	
	}
}
