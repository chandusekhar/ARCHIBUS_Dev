var abDocEditCtrl = View.createController('abDocEditCtrl',{
	
	curFolder:'',			// hierarchy_ids of record currently in edit form

	curFolderParent:'',  // hierarchy_ids of parent of record currently in edit form
	
	newFolderParent:'',   // hierarchy_ids of parent for new records
	
	abDocEdit_detailsPanel_afterRefresh:function(){
		this.abDocEdit_detailsPanel.getFieldElement("parentFolder").innerHTML = this.curFolderParent;
	},
	
	/**
	 * Set parent folder
	 */
	setParentFolder:function(ob){
		this.newFolderParent='';
		this.curFolderParent='';
		this.curFolder='';

		var clickedNode =abDocEditCtrl.abDocEdit_treePanel.lastNodeClicked.data['docfolder.doc_folder'];
		var record = this.abDocEdit_ds_1.getRecord("docfolder.doc_folder='"+clickedNode+"'");
		if(record){
			this.newFolderParent = record.getValue('docfolder.hierarchy_ids');
			this.curFolder = this.newFolderParent;
			var arr=this.curFolder.split('|');
			for(var i=0;i<arr.length-2;i++){  // use -2 because there is trailing | in string, so split yields extra empty string
				if(i>0){
					this.curFolderParent=this.curFolderParent+"|"+arr[i];
				}else{
					this.curFolderParent=arr[i];
				}
			}
			if(this.curFolderParent) this.curFolderParent=this.curFolderParent+"|";
		}
	}
})
