
//XXX: allow caller to overwrite the leaf node display content
function afterGeneratingTreeNode(treeNode){
	//XXX: treeNode has all info about tree object such as treeNode.level being Ab.tree.TreeLevel object 
	if(treeNode.isLeafNode){
		var labelText = "<input type='checkbox' />" + treeNode.label + "<img alt='Loading...' border='0' src='/archibus/schema/ab-system/graphics/treeview/treeview-loading.gif'/>";  
		treeNode.setUpLabel(labelText);
	}  	
}
