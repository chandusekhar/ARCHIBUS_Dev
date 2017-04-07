var appUpdPreserveExtController = View.createController('appUpdPreserveExt',{
	openerPanel:null,
	openerController:null,
	itemsPath:null,
	
	afterInitialDataFetch: function(){
		this.openerPanel = View.getOpenerView().panels.get('appUpdWizTabs');
	},
	appUpdPreserveExt_onNext: function(){
		this.openerPanel.showTab('wizardTabs_6', true);
		this.openerPanel.selectTab('wizardTabs_6');
		this.openerPanel.setTabEnabled('wizardTabs_5', false);
		readPaths();

		var parentController = View.getView("parent").controllers.items[0];

		var dataArray = parentController.itemsData;
		var extArray = parentController.itemsExt;
		var updTypeArray = parentController.itemsToUpdate;
		var preserveTypeArray = parentController.itemsToPreserve;
		
		//creates .properties file
		AppUpdateWizardService.saveToPropertiesFile(dataArray, extArray, updTypeArray, preserveTypeArray, {
			errorHandler: function(m, e) {
				Ab.view.View.showException(e);
			}
		});
	},
		
	appUpdPreserveExt_onBack: function(){
		var deployType = View.getView("parent").controllers.items[0].deployType;
		if (deployType == 'staging_server'){
			this.openerPanel.showTab('wizardTabs_3', true);
			this.openerPanel.selectTab('wizardTabs_3');
			this.openerPanel.setTabEnabled('wizardTabs_5', false);
			return;
		}
		this.openerPanel.showTab('wizardTabs_4', true);
		this.openerPanel.selectTab('wizardTabs_4');
		this.openerPanel.setTabEnabled('wizardTabs_5', false);
	},
	
	appUpdPreserveExt_onAddFolder: function(){
	View.openDialog('ab-application-update-add-folder.axvw', {}, true, { 
	    width: 500, 
	    height: 600, 
	    closeButton: false,
		parentController:appUpdPreserveExtController	    
	});
	},
	
	populateHtmlGrid: function(paths){
		var tbl = document.getElementById('tablePaths');
		var rowCount = tbl.rows.length;
		while (rowCount > 0){
			tbl.deleteRow(0);
			rowCount--;
		}
		this.itemsPath = new Array();
		for (var i=0; i<paths.length; i++){
			this.itemsPath[i] = paths[i].toString();
			addRowToTable(paths[i].toString());
		}
	},
	
	getSelected: function(){
		var elements = new Array();
		var tbl = document.getElementById('tablePaths');
		if (tbl.rows.length > 0){
			for (var i=0; i<tbl.rows.length; i++){
				var path = tbl.rows[i].firstChild.innerHTML;
				path = path.replace("\\*","");
				elements[i] = path;
			}
		}
		return elements;
	}	
});

function readPaths(){
	var tbl = document.getElementById('tablePaths');
	var parentController = View.getView("parent").controllers.items[0];
	for(var i = 0; i < tbl.rows.length; i++){
		parentController.itemsExt[i] = tbl.rows[i].firstChild.innerHTML;
	}
}

function removePath(id){
	var row = document.getElementById(id);
	if (row){
		row.parentNode.removeChild(row);
	}
}

function addRowToTable(path)
{
	var linkText = '[' + getMessage('message_remove') + ']';
	var tbl = document.getElementById('tablePaths');
  	var lastRow = tbl.rows.length;
 	var row = tbl.insertRow(lastRow);
  	row.setAttribute('id',lastRow);
  
  	// left cell
  	var cellLeft = row.insertCell(0);
  	var pathNodeEl = document.createTextNode(path);
  	cellLeft.appendChild(pathNodeEl);
  
  	// right cell
  	var cellRight = row.insertCell(1);
  	var removeLinkEl = document.createElement('a');
	var removeText = document.createTextNode(linkText);
  	removeLinkEl.appendChild(removeText);
	removeLinkEl.setAttribute('href','javascript:removePath('+lastRow+')');
  	cellRight.appendChild(removeLinkEl);

}

