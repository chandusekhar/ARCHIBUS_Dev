var mngRPIWizardController = View.createController('mngRPIWizard',{
	selectedItem:null,
	mngRPIFindMngController:null,
	afterViewLoad:function(){
		this.inherit();
		this.tabsMngRPI.addEventListener('afterTabChange', afterTabChange);
	}
})

function afterTabChange(tabPanel, selectedTabName){
	if(selectedTabName == 'page0'){
		tabPanel.setTabEnabled('page1', false);
	}
	if(selectedTabName == 'page1'){
		var tab = tabPanel.findTab(selectedTabName);
		if(tab.isContentLoaded){
			tab.getContentFrame().View.controllers.get('mngRPIPropTrans').afterInitialDataFetch();
		}
	}
}