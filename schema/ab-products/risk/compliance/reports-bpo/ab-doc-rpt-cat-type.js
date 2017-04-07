/**
 * @author lei
 */

var abDocRptCatTypeController = View.createController('abDocRptCatTypeController', {
	afterViewLoad: function(){
    	this.cate_tree.setTreeNodeConfigForLevel(1,           	
            [{fieldName: 'doctype.doc_type'},                   
             {fieldName: 'doctype.summary', length: 40}]);      
    }
});

/*
 * set the global variable 'curTreeNode' in controller 'defRMTypeCat'
 */
function onClickTreeNode(){
    View.controllers.get('defRMTypeCat').curTreeNode = View.panels.get("cate_tree").lastNodeClicked;
}

