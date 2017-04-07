/**
 * @author keven.xi
 */
var definePMPController = View.createController('definePMP', {

    //Current Selected Node 
    curTreeNode: null,
    
    //The tree panel 
    treeview: null,
    
    afterViewLoad: function(){
    	this.treeview = View.panels.get('pmp_tree');
    	
    	this.treeview.setTreeNodeConfigForLevel(1,           		
            [{text: getMessage("stepUpper")},                   	
             {fieldName: 'pmps.pmps_id'},   						
             {fieldName: 'pmps.instructions', length: 40}]);    	
    	
    	this.treeview.setTreeNodeConfigForLevel(2,           		
                [{fieldName: 'pmpstr.res_type', pkCssClass: 'true'},
                 {fieldName: 'pmpstr.res_id', pkCssClass: 'true'}]);
    },
    
    afterInitialDataFetch: function(){
        var titleObj = Ext.get('addNew');
        titleObj.on('click', this.showMenu, this, null);
       
        //Comment this line for kb 3021407.
        // this.procsFilterPanel_onShow();
    },
    
    showMenu: function(e, item){
        var menuItems = [];
        var menutitle_newProcedure = getMessage("procedure");
        var menutitle_newStep = getMessage("step");
        var menutitle_newTrade = getMessage("pmpstr_res_type_trade");
        var menutitle_newPart = getMessage("pmpstr_res_type_part");
        var menutitle_newToolType = getMessage("pmpstr_res_type_toolType");
        
        menuItems.push({
            text: menutitle_newProcedure,
            handler: this.onAddNewButtonPush.createDelegate(this, ['PROCEDURE'])
        });
        menuItems.push({
            text: menutitle_newStep,
            handler: this.onAddNewButtonPush.createDelegate(this, ['STEP'])
        });
        menuItems.push({
            text: menutitle_newTrade,
            handler: this.onAddNewButtonPush.createDelegate(this, ['TRADE'])
        });
        menuItems.push({
            text: menutitle_newPart,
            handler: this.onAddNewButtonPush.createDelegate(this, ['PART'])
        });
        menuItems.push({
            text: menutitle_newToolType,
            handler: this.onAddNewButtonPush.createDelegate(this, ['TOOLTYPE'])
        });
        
        var menu = new Ext.menu.Menu({
            items: menuItems
        });
        menu.showAt(e.getXY());
        
    },
    
    onAddNewButtonPush: function(menuItemId){
        var pmpId = "";
        var pmpsId = "";
        var nodeLevelIndex = "";
        if (this.curTreeNode) {
            nodeLevelIndex = "" + this.curTreeNode.level.levelIndex;
            switch (nodeLevelIndex) {
                case '0':
                    pmpId = this.curTreeNode.data["pmp.pmp_id"];
                    break;
                case '1':
                    pmpId = this.curTreeNode.data["pmp.pmp_id"];
                    pmpsId = this.curTreeNode.data["pmps.pmps_id"];
                    //Guo add 2009-09-01 to fix KB3024253
                    if (this.curTreeNode.data["pmps.pmps_id.raw"]) {
                        pmpsId = this.curTreeNode.data["pmps.pmps_id.raw"];
                    }
                    break;
                case '2':
                    pmpId = this.curTreeNode.data["pmpstr.pmp_id"];
                    pmpsId = this.curTreeNode.data["pmpstr.pmps_id"];
                    //Guo add 2009-09-01 to fix KB3024253
                    if (this.curTreeNode.data["pmpstr.pmps_id.raw"]) {
                        pmpsId = this.curTreeNode.data["pmpstr.pmps_id.raw"];
                    }
                    break;
            }
        }
        else {
            // do nothing
        }
        
        var restriction = new Ab.view.Restriction();
        switch (menuItemId) {
            case "PROCEDURE":
                this.psrDetailTabs.selectTab("procTab", null, true, false, false);
                break;
            case "STEP":
                if (nodeLevelIndex == '0') {
                    restriction.addClause("pmps.pmp_id", pmpId, '=');
                    this.psrDetailTabs.selectTab("stepTab", restriction, true, false, false);
                }
                else {
                    alert(getMessage("errorSelectPMP"));
                }
                break;
            case "TRADE":
                if (nodeLevelIndex == '1') {
                    restriction.addClause("pmpstr.pmp_id", pmpId, '=');
                    restriction.addClause("pmpstr.pmps_id", pmpsId, '=');
                    this.psrDetailTabs.selectTab("tradeTab", restriction, true, false, false);
                }
                else {
                    alert(getMessage("errorSelectPMPS"));
                }
                break;
            case "TOOLTYPE":
                if (nodeLevelIndex == '1') {
                    restriction.addClause("pmpstt.pmp_id", pmpId, '=');
                    restriction.addClause("pmpstt.pmps_id", pmpsId, '=');
                    this.psrDetailTabs.selectTab("toolTypeTab", restriction, true, false, false);
                }
                else {
                    alert(getMessage("errorSelectPMPS"));
                }
                break;
            case "PART":
                if (nodeLevelIndex == '1') {
                    restriction.addClause("pmpspt.pmp_id", pmpId, '=');
                    restriction.addClause("pmpspt.pmps_id", pmpsId, '=');
                    this.psrDetailTabs.selectTab("partTab", restriction, true, false, false);
                }
                else {
                    alert(getMessage("errorSelectPMPS"));
                }
                break;
        }
    },
    
    procsFilterPanel_onShow: function(){
        showPmpTree();
        this.pmp_detail.show(false);
        this.pmps_detail.show(false);
        this.pmpstr_detail.show(false);
        this.pmpspt_detail.show(false);
        this.pmpstt_detail.show(false);
    },
    
    pmp_detail_onDelete: function(){
        this.commonDelete("ds_ab-pm-def-procs-steps-res_edit_pmp", "pmp_detail", "pmp.pmp_id");
    },
    pmps_detail_onDelete: function(){
        this.commonDelete("ds_ab-pm-def-procs-steps-res_edit_pmps", "pmps_detail", "pmps.pmps_id");
    },
    pmpstr_detail_onDelete: function(){
        this.commonDelete("ds_ab-pm-def-procs-steps-res_edit_pmpstr", "pmpstr_detail", "pmpstr.tr_id");
    },
    pmpspt_detail_onDelete: function(){
        this.commonDelete("ds_ab-pm-def-procs-steps-res_edit_pmpspt", "pmpspt_detail", "pmpspt.part_id");
    },
    pmpstt_detail_onDelete: function(){
        this.commonDelete("ds_ab-pm-def-procs-steps-res_edit_pmpstt", "pmpstt_detail", "pmpstt.tool_type");
    },
    
    commonDelete: function(dataSourceID, formPanelID, primaryFieldFullName){
        var dataSource = View.dataSources.get(dataSourceID);
        var formPanel = View.panels.get(formPanelID);
        var record = formPanel.getRecord();
        var primaryFieldValue = record.getValue(primaryFieldFullName);
        if (!primaryFieldValue) {
            return;
        }
        var controller = this;
        var confirmMessage = getMessage("messageConfirmDelete").replace('{0}', primaryFieldValue);
        View.confirm(confirmMessage, function(button){
            if (button == 'yes') {
                try {
                	if ("pmp.pmp_id" == primaryFieldFullName){
                		controller.updateWr("ds_ab_wr", primaryFieldValue);
                		controller.deleteFromPmsd("ds_ab_pmsd", primaryFieldValue);
                		controller.deleteFromPmps("ds_ab-pm-def-procs-steps-res_edit_pmps", primaryFieldValue);
                	}
            		dataSource.deleteRecord(record);
                } 
                catch (e) {
                    var errMessage = getMessage("errorDelete").replace('{0}', primaryFieldValue);
                    View.showMessage('error', errMessage, e.message, e.data);
                    return;
                }
                controller.refreshTreePanelAfterUpdate(formPanel);
                formPanel.show(false);
                
            }
        })
    },
    
    deleteFromPmps: function(dataSourceID, primaryFieldValue){
        var dataSource = View.dataSources.get(dataSourceID);
    	//build the restriction for pmsd table
		var restriction = new Ab.view.Restriction();
    	restriction.addClause("pmps.pmp_id",primaryFieldValue,"=");
        var records = dataSource.getRecords(restriction);
        for(var i=0; i<records.length; i++){
        	dataSource.deleteRecord(records[i]);
        }
    },
    
    deleteFromPmsd: function(pmsdDataSourceID, pmpIdValue){

    	//build the restriction for pmsd table
    	var pmsdDataSource = View.dataSources.get(pmsdDataSourceID);
    	pmsdDataSource.addParameter('pmpIdRestriction', "pmp_id='" + pmpIdValue + "'");

    	//get the record from pmsd table
    	var records = pmsdDataSource.getRecords();
    	
		for(var i=0; i<records.length; i++){
			pmsdDataSource.deleteRecord(records[i]);
		}
    },
    
    updateWr: function(wrDataSourceID, pmpIdValue){

    	//build the restriction for pmsd table
    	var wrDataSource = View.dataSources.get(wrDataSourceID);
    	wrDataSource.addParameter('pmpIdRestriction', "pmp_id='" + pmpIdValue + "'");

    	//get the record from pmsd table
    	var records = wrDataSource.getRecords();
    	
		for(var i=0; i<records.length; i++){
			records[i].isNew = false;
			records[i].setValue('wr.pms_id', "");
			wrDataSource.saveRecord(records[i]);
		}
    },

    pmp_detail_onSave: function(){
        this.commonSave("ds_ab-pm-def-procs-steps-res_edit_pmp", "pmp_detail");
    },
    pmps_detail_onSave: function(){
        this.commonSave("ds_ab-pm-def-procs-steps-res_edit_pmps", "pmps_detail");
    },
    pmpstr_detail_onSave: function(){
        this.commonSave("ds_ab-pm-def-procs-steps-res_edit_pmpstr", "pmpstr_detail");
    },
    pmpspt_detail_onSave: function(){
        this.commonSave("ds_ab-pm-def-procs-steps-res_edit_pmpspt", "pmpspt_detail");
    },
    pmpstt_detail_onSave: function(){
        this.commonSave("ds_ab-pm-def-procs-steps-res_edit_pmpstt", "pmpstt_detail");
    },
    
    commonSave: function(dataSourceID, formPanelID){
        var formPanel = View.panels.get(formPanelID);
        if (!formPanel.newRecord) {
            if (!this.hasChanged(formPanel)) {
                return;
            }
        }
        if (formPanelID == "pmp_detail") {
            if (!this.pmpBeforeSave()) {
                return;
            }
        }
        var record = formPanel.getRecord();
        var dataSource = View.dataSources.get(dataSourceID);
        try {
            //Guo changed 2009-09-01 to fix KB3024252
            if (formPanel.canSave()) {
                dataSource.saveRecord(record);
            }
            else {
                return;
            }
        } 
        catch (e) {
            var message = getMessage('errorSave');
            View.showMessage('error', message, e.message, e.data);
            return;
        }
        //refresh tree panel and edit panel
        this.onRefreshPanelsAfterSave(formPanel);
        //get message from view file			 
        var message = getMessage('formSaved');
        //show text message in the form				
        formPanel.displayTemporaryMessage(message);
        
    },
    
    pmpBeforeSave: function(){
        var pmpType = this.pmp_detail.getFieldValue("pmp.pmp_type");
        var oldPmpType = this.pmp_detail.record.oldValues["pmp.pmp_type"];
        if (pmpType != oldPmpType) {
            var oldPmpCode = this.pmp_detail.record.oldValues["pmp.pmp_id"];
            if (this.isAssigned(oldPmpCode)) {
                View.showMessage(getMessage("cannotChangeProcType"));
                return false;
            }
        }
        if ("EQ" != pmpType) {
            var eqStandard = this.pmp_detail.getFieldValue("pmp.eq_std");
            if (eqStandard) {
                View.showMessage(getMessage("errorEqStandard"));
                return false;
            }
        }
        return true;
    },
    
    isAssigned: function(pmpCode){
        // call WFR to get this pmp is existed in pms table 
        try {
            var parameters = {
                tableName: 'pms',
                fieldNames: toJSON(['pms.pms_id', 'pms.pmp_id']),
                restriction: toJSON("pms.pmp_id='" + pmpCode + "'")
            };
            var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
            
            var rows = result.data.records;
            return rows.length > 0;
        } 
        catch (e) {
            Workflow.handleError(e);
        }
    },
    
    /**
     * refresh tree panel and edit panel after save
     * @param {Object} curEditPanel
     */
    onRefreshPanelsAfterSave: function(curEditPanel){
        //refresh the tree panel
        this.refreshTreePanelAfterUpdate(curEditPanel);
        
        //refresh the edit form panel
        var restriction = curEditPanel.getRecord().toRestriction();
        if (curEditPanel.newRecord) {
            restriction.removeClause("isNew");
            curEditPanel.newRecord = false;
            curEditPanel.record.values["isNew"] = false;
            curEditPanel.record.oldValues["isNew"] = false;
        }
        //Guo changed 2009-09-18 to fix KB3024039
        curEditPanel.refresh(curEditPanel.getPrimaryKeyRestriction());
    },
    
    /**
     * refersh tree panel after save or delete
     * @param {Object} curEditPanel
     */
    refreshTreePanelAfterUpdate: function(curEditPanel){
        var parentNode = this.getParentNode(curEditPanel);
        if (parentNode.isRoot()) {
            showPmpTree();
        }
        else {
            this.treeview.refreshNode(parentNode);
            if (parentNode.parent) {
                parentNode.parent.expand();
            }
            parentNode.expand();
        }
    },
    
    /**
     * prepare the parentNode parameter for calling refreshNode function
     */
    getParentNode: function(curEditFormPanel){
        if (curEditFormPanel.id == "pmp_detail") {
            return this.treeview.treeView.getRoot();
        }
        
        var isNewRecord = curEditFormPanel.newRecord;
        //Guo changed 2009-08-31 to fix kb3024229
        if (isNewRecord) {
            return this.curTreeNode;
        }
        
        if (curEditFormPanel.id == "pmps_detail" && this.curTreeNode.level.levelIndex == 0) {
            return this.curTreeNode;
        }
        
        if (curEditFormPanel.id != "pmps_detail" && this.curTreeNode.level.levelIndex == 1) {
            return this.curTreeNode;
        }
        
        if (this.curTreeNode.parent) {
            this.curTreeNode.myParent = this.curTreeNode.parent;
            return this.curTreeNode.parent;
        }
        else {
            return this.curTreeNode.myParent;
        }
    },
    
    /**
     * check the curEditFormPanel.getRecord
     * values and oldValues
     * @param {Object} curEditFormPanel
     * return -- true means the user has changed the data
     */
    hasChanged: function(curEditFormPanel){
        var record = curEditFormPanel.getRecord();
        var isEqual = objectsEqual(record.values, record.oldValues);
        return !isEqual;
    }
})

/*
 * set the global variable 'curTreeNode' in controller 'definePMP'
 */
function onClickTreeNode(){
    var pmpNode = View.panels.get("pmp_tree").lastNodeClicked;
    View.controllers.get('definePMP').curTreeNode = pmpNode;
    showSupressor(pmpNode);
}

/*
 * Show supressor message for selected procedure
 */
function showSupressor(pmpNode){
    if (pmpNode.level.levelIndex == 0) {
        var restriction = new Ab.view.Restriction();
        var currentPmpId = pmpNode.data['pmp.pmp_id'];
        restriction.addClause('pmp.pmp_ids_to_suppress', "%'" + currentPmpId + "'%", 'LIKE', true);
        var supressRecords = View.dataSources.get("ds_ab-pm-def-procs-steps-res_edit_pmp").getRecords(restriction);
        var supressorStr = "";
        for (var i = 0; i < supressRecords.length; i++) {
            if (i == 0) {
                supressorStr = supressorStr + supressRecords[i].getValue('pmp.pmp_id');
            }
            else {
                supressorStr = supressorStr + "," + supressRecords[i].getValue('pmp.pmp_id');
            }
        }
        if (supressorStr) 
            document.getElementById('supressor').innerHTML = getMessage('suppressedBy') + supressorStr;
        else 
            document.getElementById('supressor').innerHTML = " ";
    }
}


/*
 * set the global variable 'curTreeNode' in controller 'definePMP'
 * refresh edit form panel
 */
function onClickResourceTreeNode(){
    var curTreeNode = View.panels.get("pmp_tree").lastNodeClicked;
    View.controllers.get('definePMP').curTreeNode = curTreeNode;
    var restriction = new Ab.view.Restriction();
    var psrDetailTabs = View.getControl('', 'psrDetailTabs');
    var itemType = curTreeNode.data["pmpstr.res_type"];
    var tabPageName = "";
    var pmpId = curTreeNode.data["pmpstr.pmp_id"];
    var pmpsId = curTreeNode.data["pmpstr.pmps_id"];
    //Guo add 2009-09-01 to fix KB3024253
    if (curTreeNode.data["pmpstr.pmps_id.raw"]) {
        pmpsId = curTreeNode.data["pmpstr.pmps_id.raw"];
    }
    var resId = curTreeNode.data["pmpstr.res_id"];
    if (itemType == getMessage("pmpstr_res_type_trade")) {
        tabPageName = "tradeTab";
        restriction.addClause('pmpstr.pmp_id', pmpId, '=');
        restriction.addClause('pmpstr.pmps_id', pmpsId, '=');
        restriction.addClause('pmpstr.tr_id', resId, '=');
    }
    else 
        if (itemType == getMessage("pmpstr_res_type_part")) {
            tabPageName = "partTab";
            restriction.addClause('pmpspt.pmp_id', pmpId, '=');
            restriction.addClause('pmpspt.pmps_id', pmpsId, '=');
            restriction.addClause('pmpspt.part_id', resId, '=');
        }
        else {//tool type
            tabPageName = "toolTypeTab";
            restriction.addClause('pmpstt.pmp_id', pmpId, '=');
            restriction.addClause('pmpstt.pmps_id', pmpsId, '=');
            restriction.addClause('pmpstt.tool_type', resId, '=');
        }
    psrDetailTabs.selectTab(tabPageName, restriction, false, false, false);
}

function showPmpTree(){
    var report = View.panels.get('pmp_tree');
    var consolePanel = View.panels.get('procsFilterPanel');
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
        //kb:3024805
		var result = {};
        try {
            result = Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameter);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        if (result.code == 'executed') {
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

function selectSurpressProcs(){
    View.pmp_detail = View.panels.get('pmp_detail');
    View.supressString = View.pmp_detail.getFieldValue("pmp.pmp_ids_to_suppress");
    View.selectPmpId = View.pmp_detail.getFieldValue("pmp.pmp_id");
    View.selectEqStd = View.pmp_detail.getFieldValue("pmp.eq_std");
    View.selectPmpType = View.pmp_detail.getFieldValue("pmp.pmp_type");
    View.openDialog("ab-pm-sel-supre-procs.axvw");
}
