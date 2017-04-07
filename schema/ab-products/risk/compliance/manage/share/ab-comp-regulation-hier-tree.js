/**
 * when click field 'hierarchy_ids' select value.
 */
function selectParentFolder(){
	
	 var panel = View.panels.get("regulation_treePanelForDialog");
	 var abCompDefineRegulation = View.panels.get("abCompDefineRegulation");
	 if(abCompDefineRegulation){
		 var regulation = abCompDefineRegulation.getFieldValue("regulation.regulation");
		 panel.addParameter('param', "regulation.regulation !='"+regulation+"'");
	 }
	 panel.refresh();
	 panel.show(true);
	 panel.showInWindow({
	        width: 600,
	        height: 400
	    });
}
/**
 * event handle when tree node click.
 */
function treeNodeClick(){
	
	var panel = View.panels.get("regulation_treePanelForDialog");
	var clickedValueHierarchy=panel.lastNodeClicked.data['regulation.hierarchy_ids'];
	var clickedValue=panel.lastNodeClicked.data['regulation.regulation'];
	var parentFolder = document.getElementById('parentFolder');
	if(parentFolder){
		parentFolder.value=clickedValue;
	}
	//use for drill-down define regulation.
	var abCompDefineRegulation = View.panels.get("abCompDefineRegulation");

	var regulation = abCompDefineRegulation.getFieldValue('regulation.regulation');
	//kb 3036442 handle field 'hierarchy_ids' by adding current key and '|' before save.
	var new_hierarchy_ids = clickedValueHierarchy + regulation + '|';
	
	 if(abCompDefineRegulation){
		 abCompDefineRegulation.setFieldValue('regulation.hierarchy_ids',new_hierarchy_ids);
	 }
	document.getElementById('hierarchyId').value=new_hierarchy_ids;
	selectParentFolderClose.defer(500, this);
}
/**
 * private method called by 'treeNodeClick'.
 */
function selectParentFolderClose(){
    View.panels.get("regulation_treePanelForDialog").closeWindow(); 

}
