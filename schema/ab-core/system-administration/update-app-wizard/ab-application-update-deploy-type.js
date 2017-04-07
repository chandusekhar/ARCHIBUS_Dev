var appUpdDeployTypeController = View.createController('appUpdDeployType',{
	openerPanel:null,
	openerController:null,
	
	afterInitialDataFetch: function(){
		this.openerPanel = View.getOpenerView().panels.get('appUpdWizTabs');
	},
	appUpdDeployType_onNext: function(){
		var deployType = getDeployType();
		if(deployType == 'staging_server'){
			this.openerPanel.hideTab('wizardTabs_2', true);
			this.openerPanel.showTab('wizardTabs_3', true);
			this.openerPanel.selectTab('wizardTabs_3');
			this.openerPanel.setTabEnabled('wizardTabs_1', false);
			return;
		} 
		if (deployType == 'workgroup'){
			this.openerPanel.showTab('wizardTabs_2', true);
			this.openerPanel.selectTab('wizardTabs_2');
			this.openerPanel.setTabEnabled('wizardTabs_1', false);
			return;			
		}
		if (deployType == 'production_server'){
			AppUpdateWizardService.isFileExists('mysite-extensions.war', {
		        callback: function(fileExists) {
		        	appUpdDeployTypeController.checkExtensionsFile(fileExists);
		        },
		        errorHandler: function(m, e) {
		            Ab.view.View.showException(e);
		        }
		    });
		}
	},
	
	checkExtensionsFile:function(fileExists){
		if(!fileExists){
			View.confirm(getMessage('extensions_warning_message'), function(button){
				if(button == 'yes'){
					appUpdDeployTypeController.openerPanel.showTab('wizardTabs_2', true);
					appUpdDeployTypeController.openerPanel.selectTab('wizardTabs_2');
					appUpdDeployTypeController.openerPanel.setTabEnabled('wizardTabs_1', false);
				}
			});
		}else{
			this.openerPanel.hideTab('wizardTabs_4', true);
			this.openerPanel.showTab('wizardTabs_2', true);
			this.openerPanel.selectTab('wizardTabs_2');
			this.openerPanel.setTabEnabled('wizardTabs_1', false);
		}
	},
		
	appUpdDeployType_onBack: function(){
		this.openerPanel.showTab('wizardTabs_0', true);
		this.openerPanel.selectTab('wizardTabs_0');
		this.openerPanel.setTabEnabled('wizardTabs_1', false);
	}
});

function updateHelpLink(isWorkgroupSelected){
	var filePath = appUpdDeployTypeController.appUpdDeployType.actions.items[2].command.commands[0].file;
	if(isWorkgroupSelected){
		appUpdDeployTypeController.appUpdDeployType.actions.items[2].command.commands[0].file = filePath.replace('enterprise','workgroup');
	}else{
		appUpdDeployTypeController.appUpdDeployType.actions.items[2].command.commands[0].file = filePath.replace('workgroup','enterprise');
	}
}

function checkEnterprise(){
	resetNav();
	if(document.getElementById("radioEnterprise").checked){
		document.getElementById("stagingServer").disabled = false;
		document.getElementById("productionServer").disabled = false;
		document.getElementById("stagingServer").checked = true;
	}
	updateHelpLink(false);
}
function checkWorkgroup(){
	resetNav();
	if(document.getElementById("radioWorkgroup").checked){
		document.getElementById("stagingServer").disabled = true;
		document.getElementById("productionServer").disabled = true;
		//uncheck options
		document.getElementById("stagingServer").checked = false;
		document.getElementById("productionServer").checked = false;
	}
	updateHelpLink(true);
}
function getFileExtWarDetails(){
	AppUpdateWizardService.getExtensionsFileDetails({
        callback: function(fileTimeStamp) {
        	showExtensionsFileTimeStamp(fileTimeStamp);
        },
        errorHandler: function(m, e) {
            Ab.view.View.showException(e);
        }
    });
}

function showExtensionsFileTimeStamp(fileTimeStamp){
	var extensionFileDate = new Date(fileTimeStamp);
	if(fileTimeStamp){
		View.showMessage('File exists, created on: ' + extensionFileDate.format('Y/n/d') + ', ' +extensionFileDate.format('A g:i:s'));
	}else{
		View.showMessage('File does not exist!');
	}
}

function getDeployType(){
	var restriction = "";
	if(document.getElementById("radioWorkgroup").checked){
		restriction = document.getElementById("radioWorkgroup").value;
	}
	else if(document.getElementById("radioEnterprise").checked){
			if(document.getElementById("stagingServer").checked){
				restriction = document.getElementById("stagingServer").value;
			}else if(document.getElementById("productionServer").checked){
					restriction = document.getElementById("productionServer").value;
				}
	}
	return restriction;
}
function resetNav(){
	for(var i=2;i<appUpdDeployTypeController.openerPanel.tabs.length;i++){
		appUpdDeployTypeController.openerPanel.hideTab(appUpdDeployTypeController.openerPanel.tabs[i].name, true);
	}
}

