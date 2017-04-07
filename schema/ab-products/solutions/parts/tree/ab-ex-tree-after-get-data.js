var abExTreeAfterGetDataCtrl = View.createController('var abExTreeAfterGetDataCtrl', {
	afterViewLoad: function(){
		this.exTreeAfterGetData_pmpTree.setTreeNodeConfigForLevel(1,           		
            [{text: getMessage("stepUpper")},                   	
             {fieldName: 'pmps.pmps_id'},   						
             {fieldName: 'pmps.instructions', length: 40}]);
	
		this.exTreeAfterGetData_pmpTree.setTreeNodeConfigForLevel(2,           		
            [{fieldName: 'pmpstr.res_type', pkCssClass: 'true'},
             {fieldName: 'pmpstr.res_id', pkCssClass: 'true'}]);

        this.exTreeAfterGetData_pmpTree.showNodesWithoutChildren = false;
	},

    exTreeAfterGetData_pmpTree_onShowAllSteps: function() {
        this.exTreeAfterGetData_pmpTree.updateRestrictionForLevel = function(parentNode, level, restriction) {
        };
        this.exTreeAfterGetData_pmpTree.refresh();
        this.exTreeAfterGetData_pmpTree.expandAll(1);
    },

    exTreeAfterGetData_pmpTree_onShowStepsWithHvac: function() {
        this.exTreeAfterGetData_pmpTree.updateRestrictionForLevel = function(parentNode, level, restriction) {
            if (level === 2) {
                restriction.addClause('pmpstr.res_id', 'HVAC', 'like');
            }
        };
        this.exTreeAfterGetData_pmpTree.refresh();
        this.exTreeAfterGetData_pmpTree.expandAll(2);
    }
});

function onClickResourceTreeNode(){
	var treeView = View.panels.get("exTreeAfterGetData_pmpTree");
	var curTreeNode = treeView.lastNodeClicked;	
    var restriction = new Ab.view.Restriction();
    var psrDetailTabs = View.getControl('', 'exTreeAfterGetData_psrDetailTabs');
    var itemType = curTreeNode.data["pmpstr.res_type"];

    var tabPageName = "";
    var pmpId = curTreeNode.data["pmpstr.pmp_id"];
    var pmpsId = curTreeNode.data["pmpstr.pmps_id"];
    var resId = curTreeNode.data["pmpstr.res_id"];
    if (itemType == getMessage('pmpstr_res_type_trade') )  { //'TRADE') {
        tabPageName = "exTreeAfterGetData_tradeTab";
        restriction.addClause('pmpstr.pmp_id', pmpId, '=');
        restriction.addClause('pmpstr.pmps_id', pmpsId, '=');
        restriction.addClause('pmpstr.tr_id', resId, '=');
    }
    else if (itemType == getMessage('pmpstr_res_type_part') )  { //'PART') {
        tabPageName = "exTreeAfterGetData_partTab";
        restriction.addClause('pmpspt.pmp_id', pmpId, '=');
        restriction.addClause('pmpspt.pmps_id', pmpsId, '=');
        restriction.addClause('pmpspt.part_id', resId, '=');
    }
    else if (itemType == getMessage('pmpstr_res_type_toolType')) { //tool type
        tabPageName = "exTreeAfterGetData_toolTypeTab";
        restriction.addClause('pmpstt.pmp_id', pmpId, '=');
        restriction.addClause('pmpstt.pmps_id', pmpsId, '=');
        restriction.addClause('pmpstt.tool_type', resId, '=');
    }
    psrDetailTabs.selectTab(tabPageName, restriction, false, false, false);
}

/**
 * TODO: This function is not used. Should it be deleted?
 */
function showPmpTree(){
    var report = View.panels.get('exTreeAfterGetData_pmpTree');
    var consolePanel = View.panels.get('consolePanel');
    var restriction = new Ab.view.Restriction();
    var pmp_id = consolePanel.getFieldValue('pmp.pmp_id');
    if (pmp_id != '') {
        restriction.addClause('pmp.pmp_id', pmp_id, '=');
    }
    
    var description = consolePanel.getFieldValue('pmp.description');
    if (description != '') {
        restriction.addClause('pmp.description', '%' + description + '%', 'LIKE');
    }
    
    var pmp_type = consolePanel.getFieldValue('pmp.pmp_type');
    if (pmp_type != '') {
        restriction.addClause('pmp.pmp_type', pmp_type, '=');
    }
    
    var tr_id = consolePanel.getFieldValue('pmp.tr_id');
    if (tr_id != '') {
        restriction.addClause('pmp.tr_id', tr_id, '=');
    }
    
    var instructions = consolePanel.getFieldValue('pmps.instructions');
    if (instructions != '') {
        var parameter = {
            tableName: 'pmps',
            fieldNames: toJSON(['pmps.pmp_id']),
            restriction: toJSON("pmps.instructions LIKE '%" + instructions + "%'")
        };
        try {
            var result = Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameter);

            if (result.data.records.length == 0) {
                report.clear();
                return;
            }

            for (var i = 0; i < result.data.records.length; i++) {
                if (i == 0) {
                    restriction.addClause('pmp.pmp_id', result.data.records[i]['pmps.pmp_id'], '=', ')AND(');
                }
                else {
                    restriction.addClause('pmp.pmp_id', result.data.records[i]['pmps.pmp_id'], '=', 'OR');
                }
            }
        } catch (e) {
            Workflow.handleError(e);
        }
    }
    
    report.createRestrictionForLevel = function(parentNode, level){
        return restriction;
    }
    
    report.refresh(restriction);
    
    report.createRestrictionForLevel = function(parentNode, level){
        return null;
    }
    
    report.restriction = null;
	
    //if (isSearch) {
		//clear the global var
		View.controllers.get('definePMP').curTreeNode = null;
	//}
}
