/**
 * @author keven.xi
 */
var defineLocRMController = View.createController('defineCostPerBlFl', {

    //Current Selected Node 
    curTreeNode: null,
    
    //The tree panel 
    treeview: null,
    
    afterInitialDataFetch: function(){
        this.treeview = View.panels.get('bl_tree');
    },
    consolePanel_onShow: function(){
        var console = this.consolePanel;
        var restriction = new Ab.view.Restriction();
        var blid = console.getFieldValue('bl.bl_id');
        if (blid != null && blid != "") {
            restriction.addClause("bl.bl_id", blid, "=");
        }
        else {
            restriction.addClause("bl.bl_id", "", "is not null");
        }
        this.bl_tree.refresh(restriction);
    },
    bl_detail_onSave: function(){
        this.commonSave("bl_detail");
    },
    fl_detail_onSave: function(){
        this.commonSave("fl_detail");
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
    View.controllers.get('defineCostPerBlFl').curTreeNode = View.panels.get("bl_tree").lastNodeClicked;
}

