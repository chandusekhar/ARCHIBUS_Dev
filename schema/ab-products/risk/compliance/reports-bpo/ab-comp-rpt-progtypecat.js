/**
 * @author lei
 */
var programTypeCatController = View.createController('programTypeCat', {
	afterViewLoad: function(){
    	this.cate_tree.setTreeNodeConfigForLevel(1,           	
            [{fieldName: 'regprogtype.regprog_type'},                   
             {fieldName: 'regprogtype.summary', length: 40}]);      
    }
})




