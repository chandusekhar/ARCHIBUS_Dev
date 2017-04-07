
function selectParentFolder(){
	 var panel = View.panels.get("docfolder_treePanelForDialog");
	 var abCompDefineDocfolder = View.panels.get("abCompDefineDocfolder");
	 if(abCompDefineDocfolder){
		 var docfolder = abCompDefineDocfolder.getFieldValue("docfolder.doc_folder");
		 panel.addParameter('param', "docfolder.doc_folder !='"+docfolder+"'");
//	 	 panel.addParameter('param', "docfolder.hierarchy_ids !='"+abDocEditCtrl.curFolder+"'");
	 }
	 panel.refresh();
	 panel.show(true);
	 panel.showInWindow({
	        width: 600,
	        height: 400
	    });
}

function treeNodeClick(){
	var panel = View.panels.get("docfolder_treePanelForDialog");
	var clickedValueHierarchy=panel.lastNodeClicked.data['docfolder.hierarchy_ids'];
	var clickedValue=panel.lastNodeClicked.data['docfolder.doc_folder'];
	var parentFolder = document.getElementById('parentFolder');
	if(parentFolder){
		parentFolder.value=clickedValue;
	}
	//use for drill-down define docfolder.
	 var abCompDefineDocfolder = View.panels.get("abCompDocumentRegulationForm");
	 if(abCompDefineDocfolder){
		 abCompDefineDocfolder.setFieldValue('docfolder.hierarchy_ids',clickedValueHierarchy);
	 }
	document.getElementById('hierarchyId').value=clickedValueHierarchy;
	panel.closeWindow();
}
