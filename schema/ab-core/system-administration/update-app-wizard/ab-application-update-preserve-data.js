var appUpdPreserveDataController = View.createController('appUpdPreserveData',{
	openerPanel:null,
	deployType: null,

	afterInitialDataFetch: function(){
		this.openerPanel = View.getOpenerView().panels.get('appUpdWizTabs');
		this.deployType = View.getView("parent").controllers.items[0].deployType;
		this.getFolderList();
    	
		AppUpdateWizardService.getArchibusPath({
	        callback: function(basePath) {
				setAfmBase(basePath);
	        },
	        errorHandler: function(m, e) {
	            Ab.view.View.showException(e);
	        }
	    });
	},
	appUpdPreserveData_onNext: function(){
		var deployType = View.getView("parent").controllers.items[0].deployType;
		if(deployType == "production_server"){

			var parentController = View.getView("parent").controllers.items[0];

			var dataArray = parentController.itemsData;
			var extArray = parentController.itemsExt;
			var updTypeArray = parentController.itemsToUpdate;
			var preserveTypeArray = parentController.itemsToPreserve;
		
			//creates .properties file
			AppUpdateWizardService.saveToPropertiesFile(dataArray,extArray,updTypeArray,preserveTypeArray, {
		        callback: function() {
		        	appUpdPreserveDataController.afterSaveToPropertiesFile();
		        },
		        errorHandler: function(m, e) {
		            Ab.view.View.showException(e);
		        }
		    });

		} else{
			this.openerPanel.showTab('wizardTabs_5', true);
			this.openerPanel.selectTab('wizardTabs_5');
			this.openerPanel.setTabEnabled('wizardTabs_4', false);
		}
	},
	
	afterSaveToPropertiesFile: function(){
		this.openerPanel.showTab('wizardTabs_6', true);
		this.openerPanel.selectTab('wizardTabs_6');
		this.openerPanel.setTabEnabled('wizardTabs_4', false);
		this.openerPanel.hideTab('wizardTabs_5', true);
	},
	
	appUpdPreserveData_onBack: function(){
		var deployType = View.getView("parent").controllers.items[0].deployType;
		if(deployType == "production_server"){
			this.openerPanel.showTab('wizardTabs_2', true);
			this.openerPanel.selectTab('wizardTabs_2');
			this.openerPanel.setTabEnabled('wizardTabs_4', false);
			return;
		}
		this.openerPanel.showTab('wizardTabs_3', true);
		this.openerPanel.selectTab('wizardTabs_3');
		this.openerPanel.setTabEnabled('wizardTabs_4', false);
	},
	
	getFolderList: function(){
		AppUpdateWizardService.getActiveProjectFolders({
	        callback: function(result) {
				handleActiveProjectFolders(result);
	        },
	        errorHandler: function(m, e) {
	            Ab.view.View.showException(e);
	        }
	    });
	}
});

function handleActiveProjectFolders(dataResult){
	//var data = eval('('+result.jsonExpression+')');
	var parentController = View.getView("parent").controllers.items[0];

	var j = 0;
	
	for(var i = 0; i < dataResult.length; i++ ){
		var title = dataResult[i].title;
		var gFlds = dataResult[i].graphicsFolder;
		var dFlds = dataResult[i].drawingsFolder;
		var gEFlds = dataResult[i].graphicsEFolder;
		var eGFlds = "\\" + dataResult[i].enterpriseGraphicsFolder;
		
		parentController.itemsData[j] = gFlds;
		j++;
		parentController.itemsData[j] = gEFlds;
		j++;
		parentController.itemsData[j] = dFlds;
		j++;
		parentController.itemsData[j] = eGFlds;
		j++;
		addRowsToTable(title, gFlds, gEFlds, dFlds, eGFlds)
	}
}

function addRowsToTable(title, gFlds, gEFlds, dFlds, eGFlds)
{
	var graphicText = getMessage('message_graphics');
	var graphicEnterpriseText = getMessage('message_ent_graphics');
	var drawingText = getMessage('message_drawings');
	
	var tbl = document.getElementById('tableFolders');
  	var lastRow = tbl.rows.length;
 	var row = tbl.insertRow(lastRow);
  
  	//1st Row
  	// left cell
  	var cellLeft = row.insertCell(0);
  	var textNodeEl = document.createTextNode(title + " " + drawingText);
  	cellLeft.appendChild(textNodeEl);
  
  	// right cell
  	var cellRight = row.insertCell(1);
  	var folderEl = document.createTextNode(dFlds);
  	cellRight.appendChild(folderEl);

	//2nd Row
	row = tbl.insertRow(lastRow+1);
 
  	// left cell
  	cellLeft = row.insertCell(0);
  	textNodeEl = document.createTextNode(title + " " + graphicEnterpriseText);
  	cellLeft.appendChild(textNodeEl);
  
  	// right cell
  	cellRight = row.insertCell(1);
  	folderEl = document.createTextNode(gEFlds);
  	cellRight.appendChild(folderEl);

	//3rd Row
	row = tbl.insertRow(lastRow+2);
 
  	// left cell
  	cellLeft = row.insertCell(0);
  	textNodeEl = document.createTextNode(title + " " + graphicText);
  	cellLeft.appendChild(textNodeEl);
  
  	// right cell
  	cellRight = row.insertCell(1);
  	folderEl = document.createTextNode(gFlds);
  	cellRight.appendChild(folderEl);

	//4rd Row
	row = tbl.insertRow(lastRow+3);
 
  	// left cell
  	cellLeft = row.insertCell(0);
  	textNodeEl = document.createTextNode(title + " " + graphicEnterpriseText);
  	cellLeft.appendChild(textNodeEl);
  
  	// right cell
  	cellRight = row.insertCell(1);
  	folderEl = document.createTextNode(eGFlds);
  	cellRight.appendChild(folderEl);
}

function setAfmBase(basePath){
	$('per_site_path').innerHTML = basePath + '\\schema\\per-site\\*';
	$('projects_path').innerHTML = basePath + '\\projects\\users\\*';
}

