var appUpdUpdTypeController = View.createController('appUpdUpdType',{
	openerPanel:null,
	openerController:null,
	updateType: ['all']	,
	
	afterInitialDataFetch: function(){
		this.openerPanel = View.getOpenerView().panels.get('appUpdWizTabs');
	},
	appUpdUpdType_onNext: function(){
		var deployType = View.getView("parent").controllers.items[0].deployType;
		if (coreAndAppsElemAreChecked() || this.updateType != 'coreandapps'){
			if(deployType == 'staging_server'){
				this.openerPanel.setTabEnabled('wizardTabs_3', false);
				this.openerPanel.showTab('wizardTabs_5', true);
				this.openerPanel.selectTab('wizardTabs_5');
			}else{
				this.openerPanel.setTabEnabled('wizardTabs_3', false);
				this.openerPanel.showTab('wizardTabs_4', true);
				this.openerPanel.selectTab('wizardTabs_4');
			}
			
			if(this.updateType == 'all'){
				View.getView("parent").controllers.items[0].itemsToUpdate = getAllAppDomain();
				View.getView("parent").controllers.items[0].itemsToPreserve = new Array();
				return;
			}
			if (this.updateType == 'coreandapps' || this.updateType == 'core'){
				var toUpdatePaths = new Array();
				var toPreservePaths = new Array();
				if (this.updateType == 'coreandapps' ){
					toUpdatePaths = getAppDomainToUpdate();
				}else{
					toUpdatePaths = ['#AbCore'];
				}
				toPreservePaths = getAppDomainToPreserve();
				View.getView("parent").controllers.items[0].itemsToUpdate = toUpdatePaths;
				View.getView("parent").controllers.items[0].itemsToPreserve = toPreservePaths;
			}else{
				View.getView("parent").controllers.items[0].itemsToUpdate = this.updateType;
				View.getView("parent").controllers.items[0].itemsToPreserve = [];
			}
		
		}else{
			View.showMessage(getMessage('coreAndAppsCheck_message'));
			return;
		}
	},
		
	appUpdUpdType_onBack: function(){
		var deployType = View.getView("parent").controllers.items[0].deployType;
		if (deployType == 'staging_server'){
			this.openerPanel.hideTab('wizardTabs_2', true);
			this.openerPanel.showTab('wizardTabs_1', true);
			this.openerPanel.selectTab('wizardTabs_1');
			this.openerPanel.setTabEnabled('wizardTabs_3', false);
		}else{
			this.openerPanel.showTab('wizardTabs_2', true);
			this.openerPanel.selectTab('wizardTabs_2');
			this.openerPanel.setTabEnabled('wizardTabs_3', false);
		}
	}
	
});

function coreAndAppsElemAreChecked(){
	if(document.getElementById("coreandapps").checked){
		var elem = document.getElementsByName("updCoreAndAppsType");
		for(var i=0; i<elem.length; i++){
			if(elem[i].checked){
				return true;
			}
		}
	}
	return false;
}

function getAppDomainToUpdate(){
	var elemArray = new Array();
	var j = 0;
		var elem = document.getElementsByName("updCoreAndAppsType");
		for(var i=0; i<elem.length; i++){
			if(elem[i].checked){
				elemArray[j] = elem[i].value;
				j++;
			}
		}
	return elemArray;
}

function getAllAppDomain(){
	return ["#AbCore","#AbRPLM","#AbProject ","#AbSpace","#AbMove", "#AbBldgOps", "#AbRisk", "#AbWorkplaceServices","#AbSystem", "#AbSolutionTemplates", "#AbCommonResources","#AbAsset","#AbMobile"];
}

function getAppDomainToPreserve(){
	var elemArray = new Array();
	var j = 0;
		var elem = document.getElementsByName("updCoreAndAppsType");
		for(var i=0; i<elem.length; i++){
			if(!elem[i].checked){
				elemArray[j] = elem[i].value;
				j++;
			}
		}
	return elemArray;
}

function checkCoreAndApps(){
	enableUpdCoreAndAppsList();
	appUpdUpdTypeController.updateType = 'coreandapps';
}
function checkCore(){
	disableUpdCoreAndAppsList();
	uncheckUpdCoreAndAppsList();
	appUpdUpdTypeController.updateType = ['core'];
}
function checkAll(){
	disableUpdCoreAndAppsList();
	uncheckUpdCoreAndAppsList();
	appUpdUpdTypeController.updateType = ['all'];
}
function disableUpdCoreAndAppsList(){
	document.getElementById("updCoreAndApps1").disabled = true;
	document.getElementById("updCoreAndApps2").disabled = true;
	document.getElementById("updCoreAndApps3").disabled = true;
	document.getElementById("updCoreAndApps4").disabled = true;
	document.getElementById("updCoreAndApps5").disabled = true;
	document.getElementById("updCoreAndApps6").disabled = true;
	document.getElementById("updCoreAndApps7").disabled = true;
	document.getElementById("updCoreAndApps8").disabled = true;
	document.getElementById("updCoreAndApps9").disabled = true;
}
function enableUpdCoreAndAppsList(){
	document.getElementById("updCoreAndApps1").disabled = false;
	document.getElementById("updCoreAndApps2").disabled = false;
	document.getElementById("updCoreAndApps3").disabled = false;
	document.getElementById("updCoreAndApps4").disabled = false;
	document.getElementById("updCoreAndApps5").disabled = false;
	document.getElementById("updCoreAndApps6").disabled = false;
	document.getElementById("updCoreAndApps7").disabled = false;
	document.getElementById("updCoreAndApps8").disabled = false;
	document.getElementById("updCoreAndApps9").disabled = false;
}
function uncheckUpdCoreAndAppsList(){
	document.getElementById("updCoreAndApps1").checked = false;
	document.getElementById("updCoreAndApps2").checked = false;
	document.getElementById("updCoreAndApps3").checked = false;
	document.getElementById("updCoreAndApps4").checked = false;
	document.getElementById("updCoreAndApps5").checked = false;
	document.getElementById("updCoreAndApps6").checked = false;
	document.getElementById("updCoreAndApps7").checked = false;
	document.getElementById("updCoreAndApps8").checked = false;
	document.getElementById("updCoreAndApps9").checked = false;
}