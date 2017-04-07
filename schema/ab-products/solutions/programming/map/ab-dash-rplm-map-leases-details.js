var selectedBuilding = "";

var abRepmAddEditLeaseInABuilding_ctrl = View.createController('abRepmAddEditLeaseInABuilding_ctrl' , {
	
	restriction:null,
	
	parentGridObj: null,
	
	afterInitialDataFetch: function(){
		this.restriction = this.view.restriction;
		// this is not correct - must check why don't function in normal way
		this.parentGridObj = this.view.getOpenerView().dialogParameters.parentGridObj;
		this.abRepmAddEditLeaseInABuildingLeaseInfo_form.refresh(this.restriction);
		this.abRepmAddEditLeaseInABuildingDocs_grid.refresh(this.restriction);
		this.abRepmAddEditLeaseInABuildingBaseRents_grid.refresh(this.restriction);
	},
	//'Delete' actions
	abRepmAddEditLeaseInABuildingDocs_grid_onDelete: function(row){
		this.deleteRecord(this.abRepmAddEditLeaseInABuildingDocs_ds,row.getRecord(),this.abRepmAddEditLeaseInABuildingDocs_grid);        
    },
	
	abRepmAddEditLeaseInABuildingBaseRents_grid_onDelete: function(row){
		this.deleteRecord(this.abRepmAddEditLeaseInABuildingBaseRents_ds,row.getRecord(),this.abRepmAddEditLeaseInABuildingBaseRents_grid);        
    },
	
	deleteRecord: function(dataSource , record, reportPanel){
		View.confirm(getMessage('message_confirm_delete'), function(button){
            if (button == 'yes') {
                try {
                    dataSource.deleteRecord(record);
                    reportPanel.refresh(reportPanel.restriction);
                } 
                catch (e) {
                    var message = String.format(getMessage('error_delete'));
                    View.showMessage('error', message, e.message, e.data);
                }
                
            }
        })
	},
	
	abRepmAddEditLeaseInABuildingLeaseInfo_form_onDelete: function(row){
		var leasePanel = this.abRepmAddEditLeaseInABuildingLeaseInfo_form;
		// refresh parent grid
		var controller = View.controllers.get('abRepmAddEditLeaseInABuilding_ctrl');
		var parentGrid = controller.parentGridObj;
		
		View.confirm(getMessage('message_confirm_delete'), function(button){
            if (button == 'yes') {
                try {
					leasePanel.deleteRecord();
					parentGrid.refresh(parentGrid.restriction);
                    hidePanels();
                    View.closeThisDialog();
                } 
                catch (e) {
                    var message = String.format(getMessage('error_delete'));
                    View.showMessage('error', message, e.message, e.data);
                }
                
            }
        })        
    },
	
	//'View Document' action
    abRepmAddEditLeaseInABuildingDocs_grid_onView: function(row){
		View.showDocument({'doc_id':row.getFieldValue('docs_assigned.doc_id')}, 'docs_assigned', 'doc', row.getFieldValue('docs_assigned.doc'));
    }
});


//refresh lease associated panels
function refreshPanels(ls_id){
	var restriction = new Ab.view.Restriction();
	restriction.addClause("ls.ls_id" , ls_id);
	
	var controller = abRepmAddEditLeaseInABuilding_ctrl;
	
	controller.abRepmAddEditLeaseInABuildingLeaseInfo_form.refresh(restriction);
	
	
	if(controller.abRepmAddEditLeaseInABuildingCtryTree.lastNodeClicked.level.levelIndex == 3){
		controller.abRepmAddEditLeaseInABuildingLeaseInfo_form.enableField('ls.landlord_tenant', true);
	}else{
		controller.abRepmAddEditLeaseInABuildingLeaseInfo_form.enableField('ls.landlord_tenant', false);
	}
	controller.abRepmAddEditLeaseInABuildingDocs_grid.refresh(restriction);
	controller.abRepmAddEditLeaseInABuildingBaseRents_grid.refresh(restriction);
	
}


//hide lease associated panels
function hidePanels(){
	var controller = abRepmAddEditLeaseInABuilding_ctrl;	
	controller.abRepmAddEditLeaseInABuildingLeaseInfo_form.show(false);
	controller.abRepmAddEditLeaseInABuildingDocs_grid.show(false);
	controller.abRepmAddEditLeaseInABuildingBaseRents_grid.show(false);
}

//show lease associated panels
function showDetails(row){
	abRepmAddEditLeaseInABuilding_ctrl.abRepmAddEditLeaseInABuildingAddLease_form.show(false);
	
	var ls_id = row.restriction.clauses[0].value;
	
	refreshPanels(ls_id);
}

function setCustomPeriodForBaseRentsEditPanel(panel){
	if(panel.getFieldValue('cost_tran_recur.period')=='CUSTOM'){
		panel.enableField('cost_tran_recur.period_custom' ,true);
	}else {
		panel.enableField('cost_tran_recur.period_custom' ,false);
	}
}


function filter(){
	var controller = abRepmAddEditLeaseInABuilding_ctrl;
	var consolePanel = controller.abRepmAddEditLeaseInABuildingConsole;
	var restriction = '';
	if(consolePanel.getFieldValue('bl.ctry_id')){
		restriction += " bl.ctry_id = '"+consolePanel.getFieldValue('bl.ctry_id')+"'";
	}
	if(consolePanel.getFieldValue('bl.city_id')){
		restriction += (restriction != '')?' and ':'';
		restriction += " bl.city_id = '"+consolePanel.getFieldValue('bl.city_id')+"'";
	}
	if(consolePanel.getFieldValue('bl.bl_id')){
		restriction += (restriction != '')?' and ':'';
		restriction += " bl.bl_id = '"+consolePanel.getFieldValue('bl.bl_id')+"'";
	}
	
	if(restriction){
		controller.abRepmAddEditLeaseInABuildingCtryTree.addParameter('console' , restriction);
	}else{
		controller.abRepmAddEditLeaseInABuildingCtryTree.addParameter('console' , ' 1=1 ');
	}
	hidePanels();
	controller.abRepmAddEditLeaseInABuildingAddLease_form.show(false);
	controller.abRepmAddEditLeaseInABuildingCtryTree.refresh();
	
	controller.abRepmAddEditLeaseInABuildingCtryTree.setTitle(getMessage('tree_panel_title'));
    controller.abRepmAddEditLeaseInABuildingCtryTree.lastNodeClicked = null;
}



function createNewLease(row){
	
	var controller = abRepmAddEditLeaseInABuilding_ctrl;
    var newLsId = controller.abRepmAddEditLeaseInABuildingAddLease_form.getFieldValue('ls.ls_id');
    var lsParentId = "'"+controller.abRepmAddEditLeaseInABuildingAddLease_form.getFieldValue('ls.ls_parent_id')+"'";
	var blId = (selectedBuilding != "")?selectedBuilding:controller.abRepmAddEditLeaseInABuildingAddLease_form.getFieldValue('ls.bl_id'); 
	var lease_sublease = "'"+controller.abRepmAddEditLeaseInABuildingAddLease_form.getFieldValue('ls.lease_sublease')+"'";
	
    try {
        Workflow.callMethod("AbRPLMLeaseAdministration-LeaseAdministrationService-duplicateLease", newLsId, row['ls.ls_id'], '0', 'building' , blId,'LANDLORD_TENANT',lsParentId,lease_sublease);
		controller.abRepmAddEditLeaseInABuildingLsTmp_grid.closeWindow();
		controller.abRepmAddEditLeaseInABuildingAddLease_form.show(false);
        refreshPanels(newLsId);
		refreshTreePanelAfterUpdate(controller.abRepmAddEditLeaseInABuildingCtryTree.lastNodeClicked);
		selectNewAddedTreeNode(controller.abRepmAddEditLeaseInABuildingCtryTree.lastNodeClicked, newLsId);
    } 
    catch (e) {
        if (e.message == "Another record already exists with the same identifying value as this record -- the primary key for this record is not unique within the [{0}] table.") {
				View.showMessage(getMessage('err_lsId'));
			}
			else {
				Workflow.handleError(e);
			}
    }	
}

function setSelectedBuilding(node){
	selectedBuilding = abRepmAddEditLeaseInABuilding_ctrl.abRepmAddEditLeaseInABuildingCtryTree.lastNodeClicked.data['bl.bl_id'];
}


/**
 * Select the new added tree node 
 * @param {Object} parentNode
 * @param {Object} lsId
 * 
 */
function selectNewAddedTreeNode(parentNode, lsId){
	
	var newAddedTreeNode = null;
	var childrenNodes = parentNode.children;
	var childDataIndex = (parentNode.level.levelIndex == 2)?'ls.ls_parent_id':'ls.ls_id';
	
	// find the node
	for(i = 0; i<childrenNodes.length; i++){
		if(childrenNodes[i].data[childDataIndex] == lsId){
			newAddedTreeNode = childrenNodes[i];
			break;
		}
	}
	
	//select the node
	parentNode.onLabelClick(newAddedTreeNode);
}


/**
 * afterRefresh event for  'abRepmAddEditLeaseInABuildingLeaseInfo_form' panel
 * @param {Object} panel
 **/
function abRepmAddEditLeaseInABuildingLeaseInfo_form_afterRefresh(panel){
	
	setLandlordTenant(panel.fields.items[5]);
}

/**
 * Remove from 'landlord_tenant' combobox , 'N\A' and 'BOTH' values 
 * @param {Object} field
 **/
function setLandlordTenant(field){
	
	if (field.dom.options.length > 2) {
		field.dom.remove(0);
		field.dom.remove(2);
	}
}

/**
 * 'Save' action when adding or editing a Lease
 * @param {Object} form
 * @param {Object} isNewLease
 **/

function saveLease(form , isNewLease){
	
	if(!datesValidated(form ,'ls.date_start', 'ls.date_end', getMessage('error_date_end_before_date_start'))){
		return;
	}	
	
	if (form.save() && isNewLease){
		var treePanel = abRepmAddEditLeaseInABuilding_ctrl.abRepmAddEditLeaseInABuildingCtryTree;
		
		refreshTreePanelAfterUpdate(treePanel.lastNodeClicked);
		selectNewAddedTreeNode(treePanel.lastNodeClicked, form.getFieldValue('ls.ls_id'));
		showDetails(treePanel.lastNodeClicked);
		treePanel.setTitle(getMessage('tree_panel_title')+' '+form.getFieldValue('ls.ls_id'));
		
	}else if(form.save()){
		// refresh parent grid
		var controller = View.controllers.get('abRepmAddEditLeaseInABuilding_ctrl');
		var parentGrid = controller.parentGridObj;
		parentGrid.refresh(parentGrid.restriction);
		
	}
	
}
/**
 * if dateEnd < dateStart it shows an error message
 * @param {Object} form
 * @param {Object} startDateField
 * @param {Object} endDateField
 * @param {Object} errMessage
 **/

function datesValidated(form ,startDateField, endDateField, errMessage){
	// get the string value from field start date
	var date_start = form.getFieldValue(startDateField).split("-");
	//create Date object
	var dateStart = new Date(date_start[0],date_start[1],date_start[2]);
	
	// get the string value from field end date
	var date_end = form.getFieldValue(endDateField).split("-");
	//create Date object
	var dateEnd = new Date(date_end[0],date_end[1],date_end[2]);
	
	if (dateEnd < dateStart) {
			View.showMessage(errMessage);
			return false;
	}
	return true;	
}

/**
 * 'Save' action when adding or editing: assigned documents , base rents
 * @param {Object} editFormPanel
 * @param {Object} detailsGridPanel
 * @param {Object} datesJSON
 * @param {Object} closeWindowIfIsNewRec
 **/

function saveRecord(editFormPanel, detailsGridPanel, datesJSON , closeWindowIfIsNewRec){
	
	if (datesJSON) {
	
		for (i = 0; i < datesJSON.dates.length; i++) {
		
			var startDateField = datesJSON.dates[i].startDateField;
			var endDateField = datesJSON.dates[i].endDateField;
			var errMessage = datesJSON.dates[i].errMessage;
			
			if (!datesValidated(editFormPanel, startDateField, endDateField, errMessage)) {
				return;
			}
		}
	}
	
	var isNewRecord = editFormPanel.newRecord;
	
    editFormPanel.save(); 
    detailsGridPanel.refresh();
    
	if ((closeWindowIfIsNewRec && isNewRecord) || !isNewRecord) {
		editFormPanel.closeWindow();
	}
}