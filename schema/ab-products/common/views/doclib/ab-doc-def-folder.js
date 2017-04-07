var abDocEditCtrl = View.createController('abDocEditCtrl',{
	
	curFolder:'',			// hierarchy_ids of record currently in edit form

	curFolderParent:'',  // hierarchy_ids of parent of record currently in edit form
	
	newFolderParent:'',   // hierarchy_ids of parent for new records
	
	oldFolderName: null,  // Name of folder before user rename

	oldFolder: null,  // hierarchy_ids of folder before user changed it
	
	abDocEdit_detailsPanel_beforeSave: function(){
		this.curFolder = document.getElementById('parentFolder').value+this.abDocEdit_detailsPanel.getFieldValue("docfolder.doc_folder") + '|';
		this.abDocEdit_detailsPanel.setFieldValue("docfolder.hierarchy_ids", this.curFolder);
        this.newFolderParent = 	this.curFolder;	
	},
	
	abDocEdit_detailsPanel_afterRefresh:function(){
		if(this.abDocEdit_detailsPanel.newRecord==true){
			document.getElementById('parentFolder').value=this.newFolderParent;
			this.curFolderParent = this.newFolderParent;
            this.curFolder = '';
            this.oldFolderName = null;
            this.oldFolder = null;
		}else{
			document.getElementById('parentFolder').value=this.curFolderParent;
		}
	},
	
	/**
	 * Set parent folder
	 */
	setParentFolder:function(ob){
		this.newFolderParent='';
		this.curFolderParent='';
		this.oldFolder='';
		this.curFolder='';

		var clickedNode =abDocEditCtrl.abDocEdit_treePanel.lastNodeClicked.data['docfolder.doc_folder'];
		var record = this.abDocEdit_ds_1.getRecord("docfolder.doc_folder='"+clickedNode+"'");
		if(record){
			this.newFolderParent = record.getValue('docfolder.hierarchy_ids');
			this.curFolder = this.oldFolder = this.newFolderParent;
			var arr=this.curFolder.split('|');
			for(var i=0;i<arr.length-2;i++){  // use -2 because there is trailing | in string, so split yields extra empty string
				if(i>0){
					this.curFolderParent = this.curFolderParent + "|" + arr[i];
				}else{
					this.curFolderParent = arr[i];
				}
			}
			if (this.curFolderParent) this.curFolderParent = this.curFolderParent + "|";
		}
		this.oldFolderName = clickedNode;        
	},
	
	dialogClicked:function(){
		var clickedValue=abDocEditCtrl.abDocEdit_treePanelForDialog.lastNodeClicked.data['docfolder.hierarchy_ids'];
		document.getElementById('parentFolder').value=clickedValue;
		abDocEditCtrl.newFolderParent = abDocEditCtrl.curFolderParent = clickedValue;
		abDocEditCtrl.abDocEdit_treePanelForDialog.closeWindow.defer(500, abDocEditCtrl.abDocEdit_treePanelForDialog);
	}
});

function updateChildRecords(){
	var controller = View.controllers.get('abDocEditCtrl');
	var currentFolderName = controller.abDocEdit_detailsPanel.getFieldValue("docfolder.doc_folder");
	var oldFolderName = controller.oldFolderName;
	var currentFolder = controller.abDocEdit_detailsPanel.getFieldValue("docfolder.hierarchy_ids");
	var oldFolder = controller.oldFolder;
    // If folder name and/or folder parent changed, update hierarchy for all child records
	if ((currentFolderName != oldFolderName && oldFolderName) || (currentFolder != oldFolder && oldFolder)) {
		var objDataSource = View.dataSources.get('abDocEdit_ds_1'); 
		var records =  objDataSource.getRecords("docfolder.hierarchy_ids LIKE '" + convert2SafeSqlString(oldFolder) + "%'");
		try{
			for (var i=0; i < records.length; i++) {
				var record = records[i];
				var hierarchyId = record.getValue("docfolder.hierarchy_ids");
				hierarchyId = hierarchyId.replace(oldFolder, currentFolder);
				record.isNew = false;
				record.setValue("docfolder.hierarchy_ids", hierarchyId);
				objDataSource.saveRecord(record);
			}
		}catch(e){
			Workflow.handleError(e);
			return false;
		}
        controller.oldFolderName = currentFolderName;
	    controller.oldFolder = currentFolder;
	}
	return true;
}

function deleteChildRecords(){
	var controller = View.controllers.get('abDocEditCtrl');
	var currentFolder = controller.curFolder;
	var objDataSource = View.dataSources.get('abDocEdit_ds_1'); 
	var records =  objDataSource.getRecords("docfolder.hierarchy_ids LIKE '" + convert2SafeSqlString(currentFolder) + "%'");
	try{
		for (var i=0; i < records.length; i++) {
			var record = records[i];
			objDataSource.deleteRecord(record);
		}
	}catch(e){
		Workflow.handleError(e);
		return false;
	}
	return true;
}


function selectParentFolder(){
	 var panel =abDocEditCtrl.abDocEdit_treePanelForDialog;
	 if(abDocEditCtrl.abDocEdit_detailsPanel.newRecord==false) {
	   panel.addParameter('param', "docfolder.hierarchy_ids !='"+abDocEditCtrl.curFolder+"'");
	 }
	 else panel.addParameter('param', "1=1");
	 panel.refresh();
	 panel.show(true);
	 panel.showInWindow({
	        width: 600,
	        height: 400
	    });
}

function clearLastNodeClicked(){
	abDocEditCtrl.curFolder = '';
	abDocEditCtrl.curFolderParent = '';
	abDocEditCtrl.newFolderParent = '';
	abDocEditCtrl.oldFolderName = null;
	abDocEditCtrl.oldFolder = null;
}
