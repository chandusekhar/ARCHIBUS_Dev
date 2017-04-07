var selectedBuilding = "";
/*
 * This method is called by the tree control for each new tree node created from the data.
 *
 */
function afterGeneratingTreeNode(treeNode){
	
	if (treeNode.level.levelIndex == 3) {
        var label = treeNode.data['ls.ls_parent_id'];
		treeNode.restriction.addClause('ls.ls_parent_id', treeNode.data['ls.ls_parent_id']);
		treeNode.setUpLabel(label);
    }
    
}

var abRepmAddEditLeaseInABuilding_ctrl = View.createController('abRepmAddEditLeaseInABuilding_ctrl' , {
	
	leaseId:null,
	
    isLsContactsDef: false,

    afterViewLoad:function(){
		this.menuParent = Ext.get('addEdit');
		this.menuParent.on('click', this.showMenu, this, null);
		// check if new ls_contacts table is defined
		this.isLsContactsDef = schemaHasTables(['ls_contacts']);
	},
	
	afterInitialDataFetch: function(){
		//set user country to console field
		this.abRepmAddEditLeaseInABuildingConsole.setFieldValue("bl.ctry_id", this.view.user.country);
	},
	
	showMenu: function(e, item){
        
        var menuItem = null;
        var menuItems = [];
        menuItem = new Ext.menu.Item({
            text: getMessage(getMessage('addNew_lease')),
            handler: this.addNew_lease.createDelegate(this)
        });
        menuItems.push(menuItem);
		menuItem = new Ext.menu.Item({
            text: getMessage(getMessage('addEdit_bldgs')),
            handler: this.open_addEditBuildings.createDelegate(this)
        });
        menuItems.push(menuItem);
        menuItem = new Ext.menu.Item({
            text: getMessage('addEdit_geographical'),
            handler: this.open_addEditGeographicalLocations.createDelegate(this)
        });
        menuItems.push(menuItem);
		
		
		var menu = new Ext.menu.Menu({
            items: menuItems
        });
        menu.show(this.menuParent, 'tl-bl?');
	},
	
	
	
	/**
	 * open 'Define Geographical Locations' view
	 */
    open_addEditGeographicalLocations:function(){
		
		var editMode = false;
		var country = "";
		var region = "";
		var state = "";
		var city = "";
		var site = "";
		
		if(this.abRepmAddEditLeaseInABuildingLeaseInfo_form.visible){
			editMode = true;
			var treeSelection = this.getTreeSelection();
			country = treeSelection['country'];
			region = treeSelection['region'];
			state = treeSelection['state'];
			city = treeSelection['city'];
			site = treeSelection['site'];
		}
				
		View.openDialog('ab-def-geo-loc.axvw', null, true, {
				width: 1200,
				height: 600,
				closeButton: false,
				afterInitialDataFetch: function(dialogView){
					if(editMode){
						var dialogController = dialogView.controllers.get('ctrlAbDefGeoLoc');
						var consolePanel = dialogController.console_AbDefGeoLoc;
						consolePanel.setFieldValue('site.ctry_id', country);
						consolePanel.setFieldValue('site.regn_id', region);
						consolePanel.setFieldValue('site.state_id', state);
						consolePanel.setFieldValue('site.city_id', city);
						consolePanel.setFieldValue('site.site_id', site);
						dialogController.refreshTree.createDelegate(dialogController)();
						
						var treePanel = dialogController.tree_geo_AbDefGeoLoc;
						
						
						// This is an anonymous function which will expand all the tree nodes
                        (function(treeNode){
                           
							if (!treeNode.isRoot()) {
								treePanel.refreshNode(treeNode);
								treeNode.expand();
							}
                            if(treeNode.hasChildren()){
                                for(i=0; i<treeNode.children.length; i++){
                                    var node = treeNode.children[i];
                                    arguments.callee(node);
                                }
                            }
                        })(dialogController.tree_geo_AbDefGeoLoc.treeView.getRoot());
					}
				}
			});
		
	},
	
	/**
	 * return in a JSON object the country , state , city and building selected from the tree
	 */
	
	getTreeSelection:function(){
		
		var lastNodeClicked = this.abRepmAddEditLeaseInABuildingCtryTree.lastNodeClicked;
		var treeSelection = {};
		if(lastNodeClicked.level.levelIndex == 3){
			treeSelection = {
				'building':lastNodeClicked.parent.data['bl.bl_id'],
				'city':lastNodeClicked.parent.parent.data['city.city_id'],
				'state':lastNodeClicked.parent.parent.data['city.state_id.key'],
				'country':lastNodeClicked.parent.parent.parent.data['ctry.ctry_id']
			};
		}else if (lastNodeClicked.level.levelIndex == 4){
			treeSelection = {
				'building':lastNodeClicked.parent.parent.data['bl.bl_id'],
				'city':lastNodeClicked.parent.parent.parent.data['city.city_id'],
				'state':lastNodeClicked.parent.parent.parent.data['city.state_id.key'],
				'country':lastNodeClicked.parent.parent.parent.parent.data['ctry.ctry_id']
			};
		}
		
		treeSelection['region'] = this.abRepmAddEditLeaseInABuildingLeaseInfo_form.getFieldValue('bl.regn_id');
		treeSelection['site'] = this.abRepmAddEditLeaseInABuildingLeaseInfo_form.getFieldValue('bl.site_id');
		
		return treeSelection;
	},
	
	/**
	 * open 'Define Locations' view
	 */
	open_addEditBuildings:function(){
		
		var editMode = false;
		var building = "";
		var site = "";
		
        
        if (this.abRepmAddEditLeaseInABuildingLeaseInfo_form.visible) {
            editMode = true;
            var treeSelection = this.getTreeSelection();
            building = treeSelection['building'];
			site = treeSelection['site'];
        }
        
        View.openDialog('ab-sp-def-loc.axvw', null, true, {
            width: 1200,
            height: 600,
            closeButton: false,
            afterInitialDataFetch: function(dialogView){
                if (editMode) {
					var dialogController = dialogView.controllers.get('defineLocationFL');
					var consolePanel = dialogController.sbfFilterPanel;
					consolePanel.setFieldValue('fl.bl_id', building);
					consolePanel.setFieldValue('bl.site_id', site);
					dialogController.refreshTreeview.createDelegate(dialogController)();
					
					var treePanel = dialogController.site_tree;
						
						
						// This is an anonymous function which will expand all the tree nodes
                        (function(treeNode){
                           
							if (!treeNode.isRoot()) {
								treePanel.refreshNode(treeNode);
								treeNode.expand();
							}
                            if(treeNode.hasChildren()){
                                for(i=0; i<treeNode.children.length; i++){
                                    var node = treeNode.children[i];
                                    arguments.callee(node);
                                }
                            }
                        })(dialogController.site_tree.treeView.getRoot());
					
				}
            }
        });
	},
	
	addNew_lease: function(){
		var lastNodeClicked = this.abRepmAddEditLeaseInABuildingCtryTree.lastNodeClicked;
		if ((lastNodeClicked ==null) || ((lastNodeClicked.level.levelIndex != 2) && (lastNodeClicked.level.levelIndex != 3))){
			View.showMessage(getMessage('err_selection'));
			return;
		}
		//if a building is selected
		else if(lastNodeClicked.level.levelIndex == 2){
			this.abRepmAddEditLeaseInABuildingAddLease_form.clear();
			this.abRepmAddEditLeaseInABuildingAddLease_form.newRecord = true;
			this.abRepmAddEditLeaseInABuildingAddLease_form.setFieldValue('ls.bl_id' ,lastNodeClicked.data['bl.bl_id'] );
			this.abRepmAddEditLeaseInABuildingAddLease_form.setFieldValue('ls.lease_sublease' ,'LEASE' );
			this.abRepmAddEditLeaseInABuildingAddLease_form.enableField('ls.lease_sublease' ,false );
			this.abRepmAddEditLeaseInABuildingAddLease_form.enableField('ls.ls_parent_id' ,false );
			this.abRepmAddEditLeaseInABuildingAddLease_form.enableField('ls.landlord_tenant' ,true );			
		}
		//if a lease is selected
		else if(lastNodeClicked.level.levelIndex == 3){
			var landlord_tenant = this.abRepmAddEditLeaseInABuildingLeaseInfo_form.getFieldValue('ls.landlord_tenant');
			if(landlord_tenant == 'LANDLORD'){
				View.showMessage(getMessage('err_ls_landlord'));
				return;
			}
			this.abRepmAddEditLeaseInABuildingAddLease_form.clear();
			this.abRepmAddEditLeaseInABuildingAddLease_form.newRecord = true;
			this.abRepmAddEditLeaseInABuildingAddLease_form.setFieldValue('ls.bl_id' ,lastNodeClicked.parent.data['bl.bl_id'] );
			this.abRepmAddEditLeaseInABuildingAddLease_form.setFieldValue('ls.lease_sublease' ,'SUBLEASE' );
			this.abRepmAddEditLeaseInABuildingAddLease_form.enableField('ls.lease_sublease' ,false );
			this.abRepmAddEditLeaseInABuildingAddLease_form.setFieldValue('ls.landlord_tenant' ,'LANDLORD' );
			this.abRepmAddEditLeaseInABuildingAddLease_form.enableField('ls.landlord_tenant' ,false );
			this.abRepmAddEditLeaseInABuildingAddLease_form.setFieldValue('ls.ls_parent_id' ,lastNodeClicked.data['ls.ls_parent_id'] );
			this.abRepmAddEditLeaseInABuildingAddLease_form.enableField('ls.ls_parent_id' ,false );

		}
		
		hidePanels();
		this.abRepmAddEditLeaseInABuildingAddLease_form.show(true);
		setLandlordTenant(this.abRepmAddEditLeaseInABuildingAddLease_form.fields.items[5]);
	},
	
	//'Delete' actions
	abRepmAddEditLeaseInABuildingDocs_grid_onDeleteDocuments: function(row){
		this.deleteRecord(this.abRepmAddEditLeaseInABuildingDocs_ds,row.getRecord(),this.abRepmAddEditLeaseInABuildingDocs_grid);        
    },
	
	abRepmAddEditLeaseInABuildingBaseRents_grid_onDeleteBaseRents: function(row){
		this.deleteRecord(this.abRepmAddEditLeaseInABuildingBaseRents_ds,row.getRecord(["cost_tran_recur.cost_tran_recur_id"]),this.abRepmAddEditLeaseInABuildingBaseRents_grid);        
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
		var treePanel = this.abRepmAddEditLeaseInABuildingCtryTree;
		View.confirm(getMessage('message_confirm_delete'), function(button){
            if (button == 'yes') {
                try {
					leasePanel.deleteRecord();
                    hidePanels();
					refreshTreePanelAfterUpdate(treePanel.lastNodeClicked.parent);
					treePanel.lastNodeClicked = null;
					treePanel.setTitle(getMessage('tree_panel_title'));
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
    },
    
    //event handler for 'Use Template' action
    abRepmAddEditLeaseInABuildingAddLease_form_onUseTemplate: function(){
    
        //check if 'ls.ls_id' field is empty
        if (!valueExistsNotEmpty(this.abRepmAddEditLeaseInABuildingAddLease_form.getFieldValue('ls.ls_id'))) {
            View.showMessage(getMessage('err_no_lease'));
            return;
        }
        
        // if 'ls.ls_id' field is not empty then show 'abRepmAddEditLeaseInABuildingLsTmp_grid' panel in a Open Dialog
        this.abRepmAddEditLeaseInABuildingLsTmp_grid.showInWindow({
            applyParentRestriction: false,
            newRecord: true,
            width: 600,
            height: 600
        });
        this.abRepmAddEditLeaseInABuildingLsTmp_grid.refresh();
    }
});

function refreshTreePanelAfterUpdate(treeNode){

    abRepmAddEditLeaseInABuilding_ctrl.abRepmAddEditLeaseInABuildingCtryTree.refreshNode(treeNode);
    treeNode.expand();
}




//refresh lease associated panels
function refreshPanels(ls_id){
	var restriction = new Ab.view.Restriction();
	restriction.addClause("ls.ls_id" , ls_id);
	
	var controller = abRepmAddEditLeaseInABuilding_ctrl;
	
	controller.abRepmAddEditLeaseInABuildingLeaseInfo_form.refresh(restriction);
	controller.leaseId = ls_id;
	
	//enable/disable 'landlord_tenant' field if a lease/sublease is selected from the tree
	
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
	controller.abRepmAddEditLeaseInABuildingAddLease_form.show(false);
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
    var lsParentId = controller.abRepmAddEditLeaseInABuildingAddLease_form.getFieldValue('ls.ls_parent_id');
	var blId = (selectedBuilding != "")?selectedBuilding:controller.abRepmAddEditLeaseInABuildingAddLease_form.getFieldValue('ls.bl_id'); 
	var lease_sublease = controller.abRepmAddEditLeaseInABuildingAddLease_form.getFieldValue('ls.lease_sublease');
	
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
	if (!form.canSave()) {
		return false;
	}
	
	if(!datesValidated(form ,'ls.date_start', 'ls.date_end', getMessage('error_date_end_before_date_start'))){
		return false;
	}	
	
	if (form.save() && isNewLease){
		var treePanel = abRepmAddEditLeaseInABuilding_ctrl.abRepmAddEditLeaseInABuildingCtryTree;
		
		refreshTreePanelAfterUpdate(treePanel.lastNodeClicked);
		selectNewAddedTreeNode(treePanel.lastNodeClicked, form.getFieldValue('ls.ls_id'));
		showDetails(treePanel.lastNodeClicked);
		treePanel.setTitle(getMessage('tree_panel_title')+' '+form.getFieldValue('ls.ls_id'));
	}
	
	var isLsContactsDef = View.controllers.get('abRepmAddEditLeaseInABuilding_ctrl').isLsContactsDef;
	addToLeaseContacts(form.getFieldValue('ls.ls_id'), form.getFieldValue('ls.tn_contact'), isLsContactsDef);
	addToLeaseContacts(form.getFieldValue('ls.ls_id'), form.getFieldValue('ls.ld_contact'), isLsContactsDef);
	
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

/**
 * Add new base rent
 * @param ctx
 */
function addBaseRent(){
	var title = getMessage("add_base_rent");
	var controller = View.controllers.get("abRepmAddEditLeaseInABuilding_ctrl");
	var leaseId = controller.leaseId;
	addEditBaseRent(null, leaseId, title, "abRepmAddEditLeaseInABuildingBaseRents_grid");
}

/**
 * Function edit base rent
 * @param ctx
 */
function editBaseRent(ctx){
	var gridRow = ctx.row;
	var leaseId = gridRow.getFieldValue("cost_tran_recur.ls_id");
	var costTranRecurId = gridRow.getFieldValue("cost_tran_recur.cost_tran_recur_id");
	var title = getMessage("edit_base_rent");
	addEditBaseRent(costTranRecurId, leaseId, title, "abRepmAddEditLeaseInABuildingBaseRents_grid");
}

function addEditBaseRent(costTranRecurId, leaseId, title, panelId){
	// runtime parameters that are passed to pop-up view
	var runtimeParameters = {
			cost_tran_recur_id: costTranRecurId,
			leaseId: leaseId,
			refreshPanels: new Array(panelId),
			title: title
	}
	View.openDialog('ab-rplm-lsadmin-add-edit-baserent.axvw',null, true, {
		width:800,
		height:700, 
		closeButton:true,
		runtimeParameters: runtimeParameters
	});

}

function onSelectLdContact(ctx){
	var formId = ctx.command.parentPanelId;
	onSelectContact('ls.ld_contact', formId);
}

function onSelectTnContact(ctx){
	var formId = ctx.command.parentPanelId;
	onSelectContact('ls.tn_contact', formId);
}

function onSelectContact(fieldName, formId){
	var form = View.panels.get(formId);

	View.openDialog('ab-contact.axvw', null, false, {
	    width: 1024, 
	    height: 800, 
	    closeButton: true,
	    maximize: false,	
	    restriction: null, 
	    isMultipleSelection: false,
	    callback: function(res){
	    	for (var i = 0; i < res.length; i++) {
		    	form.setFieldValue(fieldName, res[i]);
	    	}
	    	View.closeDialog();
	    }
	 });
}

/**
 * Add contact to lease contacts table.
 * 
 * @param leaseId lease code
 * @param contactId contact code
 * @param isLsContactsDef if lease contacts table exists
 */
function addToLeaseContacts(leaseId, contactId, isLsContactsDef){
	if (isLsContactsDef && valueExistsNotEmpty(contactId)) {
		var dataSource = View.dataSources.get('abRepmLsContacts_ds'); 
		var restriction =  new Ab.view.Restriction();
		restriction.addClause('ls_contacts.ls_id', leaseId, '=');
		restriction.addClause('ls_contacts.contact_id', contactId, '=');
		var record = dataSource.getRecord(restriction);
		if (!valueExists(record.getValue('ls_contacts.contact_id'))) {
			record = new Ab.data.Record({
				'ls_contacts.ls_id': leaseId,
				'ls_contacts.contact_id': contactId
			}, true);
			dataSource.saveRecord(record);
		}
	}
}

