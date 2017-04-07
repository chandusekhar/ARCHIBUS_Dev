var appUpdAddFolderController = View.createController('appUpdAddFolder',{
	tree:null,
	afmBase:null,
	rootPath:null,
	treePath:null,
	checkedRoots: null,
	items: null,
	ii: 0,
	parentController: null,
	checkedElements: null,
	nodeToBeChecked: new Array(),
	
	afterViewLoad: function(){
		this.parentController = this.view.parameters['parentController'];
		this.checkedElements = this.parentController.getSelected();
		this.buildFirstLevelTree(this.checkedElements);
	},
	
	//build 1st level of the tree
	buildFirstLevelTree: function(checkedElements){
		// instantiate the tree
		this.tree = new YAHOO.widget.TreeView("divFolderTree");
   		var result = null;
   		
   		var root = "";
    	
		AppUpdateWizardService.getArchibusPath({
	        callback: function(basePath) {
	        	appUpdAddFolderController.handleFolderList(basePath);
	        },
	        errorHandler: function(m, e) {
	            Ab.view.View.showException(e);
	        }
	    });
		
	},
	
	handleFolderList:function(basePath){
		this.rootPath = basePath;
		AppUpdateWizardService.getFolderList({
	        callback: function(foldersTree) {
	        	appUpdAddFolderController.buildTree(foldersTree);
	        },
	        errorHandler: function(m, e) {
	            Ab.view.View.showException(e);
	        }
	    });
	},
	
	buildTree:function(foldersTree){
		// build the tree
	   	var pathTreeData = eval('('+foldersTree+')');
		var rootFolder = getRootFolder(this.rootPath);
		var rootNode = new YAHOO.widget.TextNode(rootFolder, this.tree.getRoot(), false);

		this.buildLevel(rootNode, pathTreeData, this.checkedElements);

		//check already selected nodes
		if(this.nodeToBeChecked.length > 0){
			for(var i = 0; i < this.nodeToBeChecked.length; i++){
				this.nodeToBeChecked[i].check();
			}
		}
	this.tree.draw();
	rootNode.expand();
	},
	
	// called recursively to build all levels 
	buildLevel: function(node, data, checkedElements){
	var n = null;
	for(var i = 0; i < data.length; i++ ){
		n = new YAHOO.widget.TaskNode(data[i].elementName, node, false, false, true);
		if (data[i].children.length > 0){
			this.buildChildren(data[i], n, checkedElements);
			this.verifyIfSelected(n, data[i].elementPath, checkedElements);
		}else{
			this.verifyIfSelected(n, data[i].elementPath, checkedElements);
		}
	}
	},
	
	buildChildren: function(element, pNode, checkedElements){
		for(var i = 0; i < element.children.length; i++){
			var node = new YAHOO.widget.TaskNode(element.children[i].elementName, pNode, false, false, true);
			this.verifyIfSelected(node, element.children[i].elementPath, checkedElements);
			if(element.children[i].elementType == 'dir'){
				this.buildChildren(element.children[i], node, checkedElements);
			}
		}
	},
	

	verifyIfSelected: function(node, selectedNodePath, checkedElements){
		if (checkedElements != undefined && checkedElements != null && checkedElements.length != 0){	
			for(var j = 0; j < checkedElements.length; j++){
				var fullPath = selectedNodePath;
				var path = fullPath.replace(this.rootPath,"");			
				if(path == checkedElements[j]){
					this.nodeToBeChecked[j] = node;
				}
			}
		}
	},

	buildPath: function(node){
	var path = "";
	var isJar = false;
	for (var d = node.depth; d > 0; d--){
		var s = node.data;
		if (s.substring(s.length-4, s.length) == '.jar'){
			path = node.data + path;
			isJar = true;
		}else{
			path = node.data + '\\' + path;
		}
			node = node.parent;
	}
	
	if (!isJar){
		return '\\' + path + '*';
		}
	return '\\' + path;
		
	},
	
	checkFirstLevel: function(){
	var k = 0;
	//var j = 0;	
	this.checkedRoots = new Array();	
	var node = this.tree.getRoot().children[0]; // first level childrens

	for(var i = 0; i < node.children.length; i++){
		if(	node.children[i].checked){
			if (node.children[i].checkState == 2){// the node has all childs selected
				this.items[this.ii] = "\\" + node.children[i].data + "\\*";
				this.ii ++;
			}else 
				if(node.children[i].checkState == 1){ // the node has unselected childs
					this.checkedRoots[k] = node.children[i];
					k++;
			}
		}
	}
	},
	
	//checks the checked elements and builds the path to be added in .properties file
	checkTree: function(checkedRoots){

			if (checkedRoots.checkState == 2){
				this.items[this.ii] = this.buildPath(checkedRoots);
				this.ii ++;
			}else 
				if (checkedRoots.checkState == 1){
					if (checkedRoots.hasChildren()){
						for(var ch=0; ch<checkedRoots.children.length; ch++){
							this.checkTree(checkedRoots.children[ch]);
						}	
					}
			}
	},
	
	appUpdAddFolder_onPreserveSelected: function(){
	this.items = new Array();
	
	this.checkFirstLevel();
	
	if (this.checkedRoots.length > 0){
		for(var i = 0; i<this.checkedRoots.length; i++){
			this.checkTree(this.checkedRoots[i]);
		}
	}
	
	// call function from parent to populate the Grid with selected paths values
	this.parentController.populateHtmlGrid(this.items);
		
	View.closeThisDialog();
	},
	
	//uncheck all leafs
	appUpdAddFolder_onUnselectAll: function(){
		var firstLevelTree = this.tree.root.children[0].children;
		for(var i = 0; i < firstLevelTree.length; i++){
			firstLevelTree[i].uncheck();
		}
	},
	
	checkChild: function(node){
	var path = "";
	if(node.checked && node.hasChildren()){
		for (var ch = 0; ch < node.children.length; ch++){
			if (node.children[ch].checked){
				this.checkChild(node.children[ch]);
			}
		}		
	}else{
		path = "";
		for (var d = node.depth; d > 0; d--){
			path = node.data + '\\' + path;
			node = node.parent;
		}
		this.treePath = path;
	}
	return;
	}
});


function getRootFolder(rootStr){
	return rootStr.substring(rootStr.lastIndexOf('\\'), rootStr.length);
}
function itemExists(item, items){
	for(var i = 0; i < items.length; i++){
		if(items[i] == item){
			return true;
		}
	}
	return false;
}
