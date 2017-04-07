var updAppWizardController = View.createController('updAppWizard', {
deployType:null,
itemsData: new Array(),
itemsExt: new Array(),
itemsToUpdate: new Array(),
itemsToPreserve: new Array(),

	afterInitialDataFetch: function(){
		this.appUpdWizTabs.addEventListener('beforeTabChange', beforeTabChange);
		for(var i=1;i<this.appUpdWizTabs.tabs.length;i++){
			this.appUpdWizTabs.hideTab(this.appUpdWizTabs.tabs[i].name, true);
		}
	}
})

function beforeTabChange(tabPanel, newTab, currTab){
	//var controller = '';
	var objTab = tabPanel.findTab(currTab);
	if (!objTab.isContentLoaded || currTab == 'wizardTabs_6') {
		objTab.loadView();
	}
	if(currTab == 'wizardTabs_2' || currTab == 'wizardTabs_3' || currTab == 'wizardTabs_5'){
		//objTab.loadView();
		//controller = 'appUpdVerifyArch';
		var tabFrame = tabPanel.findTab('wizardTabs_1').getContentFrame();
		updAppWizardController.deployType = getDeployType(tabFrame);
	}
return;
}

function getDeployType(tabFrame){
	
	var restriction = "";
	var tabDoc = tabFrame.document;
	
	if(tabDoc.getElementById("radioWorkgroup").checked){
		restriction = tabDoc.getElementById("radioWorkgroup").value;
	}
	else if(tabDoc.getElementById("radioEnterprise").checked){
			if(tabDoc.getElementById("stagingServer").checked){
				restriction = tabDoc.getElementById("stagingServer").value;
			}else if(tabDoc.getElementById("productionServer").checked){
					restriction = tabDoc.getElementById("productionServer").value;
				}
	}
	return restriction;
}

