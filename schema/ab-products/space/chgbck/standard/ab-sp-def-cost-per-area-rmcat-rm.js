/**
 * @author keven.xi
 */
var defineLocRMController = View.createController('defineCostPerCatRm', {

    //Current Selected Node 
    curTreeNode: null,
    
    //The tree panel 
    treeview: null,
    
    afterInitialDataFetch: function(){
        this.treeview = View.panels.get('cat_tree');
    },
    
    consolePanel_onShow: function(){
        var console = this.consolePanel;
        var restriction = new Ab.view.Restriction();
        var rmcat = console.getFieldValue('rmcat.rm_cat');
        if (rmcat != null && rmcat != "") {
            restriction.addClause("rmcat.rm_cat", rmcat, "=");
        }
        else {
            restriction.addClause("rmcat.rm_cat", "", "is not null");
        }
        this.cat_tree.refresh(restriction);
    },
    cat_detail_onSave: function(){
        this.commonSave("cat_detail");
    },
    rm_detail_onSave: function(){
        this.commonSave("rm_detail");
    },
    commonSave: function(formPanelID){
        var formPanel = View.panels.get(formPanelID);
        if (formPanel.save()) {
			//get message from view file			 
			var message = getMessage('formSaved');
			//show text message in the form				
			formPanel.displayTemporaryMessage(message);
		}
    }
})


/*
 * set the global variable 'curTreeNode' in controller 'defineLocationRM'
 */
function onClickTreeNode(){
    View.controllers.get('defineCostPerCatRm').curTreeNode = View.panels.get("cat_tree").lastNodeClicked;
}

function afterGeneratingTreeNode(treeNode){
    var labelText1 = "";
    if (treeNode.level.levelIndex == 1) {
        var bl = treeNode.data['rm.bl_id'];
        var fl = treeNode.data['rm.fl_id'];
        var rm = treeNode.data['rm.rm_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssPkClassName + "'>" + bl + "-" + fl + "-" + rm + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
}
