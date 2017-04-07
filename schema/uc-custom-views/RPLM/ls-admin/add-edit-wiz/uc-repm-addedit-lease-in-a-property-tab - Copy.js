var selectedProperty = "";
/*
 * This method is called by the tree control for each new tree node created from the data.
 *
 */

 //Used by screens JS when it programmatically changes the fields to editable
 //Programmatically set in the uc-repm-view-Lease-form.js
 var viewOnly;

function afterGeneratingTreeNode(treeNode){

    if (treeNode.level.levelIndex == 3) {
        var label = treeNode.data['ls.ls_parent_id'];
		label = label + '  ' + treeNode.data['ls.tn_name'];
		label = label + '  ' + treeNode.data['ls.uclass'];
        treeNode.restriction.addClause('ls.ls_parent_id', treeNode.data['ls.ls_parent_id']);
        treeNode.setUpLabel(label);
    }
	showAddButton();

}

var abRepmAddEditLeaseInAProperty_ctrl = View.createController('abRepmAddEditLeaseInAProperty_ctrl', {

    leaseId: null,

    afterViewLoad:function(){
        //this.menuParent = Ext.get('addEdit');
        //this.menuParent.on('click', this.showMenu, this, null);
	   abRepmAddEditLeaseInAProperty_ctrl.costs.show(false);
    },

    afterInitialDataFetch: function() {
       var openerView = View.getOpenerView();
       if (openerView != null && openerView.urlParameters != null) {
           var ls_id = openerView.urlParameters["ls_id"];
           var blpr = openerView.urlParameters["blpr"];
           if (blpr == "p") {
                // collapse panels
                var layoutManager = View.getLayoutManager('mainLayout');
                layoutManager.collapseRegion('north');

                var layoutManager = View.getLayoutManager('nestedLayout');
                layoutManager.collapseRegion('west');

                refreshPanels(ls_id);
           }
       }
    },



    showMenu: function(e, item){

        var menuItem = null;
        var menuItems = [];
        menuItem = new Ext.menu.Item({
            text: getMessage(getMessage('addNew_lease')),
            handler: this.addNew_lease.createDelegate(this)
        });
        menuItems.push(menuItem);
        /*menuItem = new Ext.menu.Item({
            text: getMessage(getMessage('addEdit_bldgs')),
            handler: this.open_addEditPropertys.createDelegate(this)
        });
        menuItems.push(menuItem);
        menuItem = new Ext.menu.Item({
            text: getMessage('addEdit_geographical'),
            handler: this.open_addEditGeographicalLocations.createDelegate(this)
        });
        menuItems.push(menuItem);*/

        var menu = new Ext.menu.Menu({
            items: menuItems
        });
        menu.show(this.menuParent, 'tl-bl?');
    },



abRepmAddEditLeaseInAPropertyCtryTree_onAddEdit : function(){
	this.addNew_lease();
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

        if(this.abRepmAddEditLeaseInAPropertyLeaseInfo_form.visible){
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

                        var treePanel = dialogController.tree_ctry_AbDefGeoLoc;


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
                        })(dialogController.tree_ctry_AbDefGeoLoc.treeView.getRoot());
                    }
                }
            });

    },

    /**
     * return in a JSON object the country , state , city and building selected from the tree
     */

    getTreeSelection:function(){

        var lastNodeClicked = this.abRepmAddEditLeaseInAPropertyCtryTree.lastNodeClicked;
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

        treeSelection['region'] = this.abRepmAddEditLeaseInAPropertyLeaseInfo_form.getFieldValue('bl.regn_id');
        treeSelection['site'] = this.abRepmAddEditLeaseInAPropertyLeaseInfo_form.getFieldValue('bl.site_id');

        return treeSelection;
    },

    /**
     * open 'Define Locations' view
     */
    open_addEditPropertys:function(){


    	var editMode = false;
		var property = "";



        if (this.abRepmAddEditLeaseInAPropertyLeaseInfo_form.visible) {
            editMode = true;
            var treeSelection = this.getTreeSelection();
            property = treeSelection['property'];
        }

        View.openDialog('ab-rplm-properties-define.axvw', null, true, {
            width: 1200,
            height: 600,
            closeButton: false,
            afterInitialDataFetch: function(dialogView){
                if (editMode) {
					var restriction = new Ab.view.Restriction();
					restriction.addClause("property.pr_id", property);
					dialogView.panels.get('grid_abPropertiesDefine').refresh(restriction);
				}
            }
        });
    },

    addNew_lease: function(){
        var lastNodeClicked = this.abRepmAddEditLeaseInAPropertyCtryTree.lastNodeClicked;
        if ((lastNodeClicked == null) || ((lastNodeClicked.level.levelIndex != 2) && (lastNodeClicked.level.levelIndex != 3))) {
            View.showMessage(getMessage('err_selection'));
            return;
        }
        //if a property is selected
        else{
            if (lastNodeClicked.level.levelIndex == 2) {
                this.abRepmAddEditLeaseInAPropertyAddLease_form.clear();
                this.abRepmAddEditLeaseInAPropertyAddLease_form.newRecord = true;
                this.abRepmAddEditLeaseInAPropertyAddLease_form.setFieldValue('ls.pr_id', lastNodeClicked.data['property.pr_id']);
                this.abRepmAddEditLeaseInAPropertyAddLease_form.setFieldValue('ls.lease_sublease', 'LEASE');
                this.abRepmAddEditLeaseInAPropertyAddLease_form.enableField('ls.lease_sublease', false );
                this.abRepmAddEditLeaseInAPropertyAddLease_form.enableField('ls.ls_parent_id', false);
                this.abRepmAddEditLeaseInAPropertyAddLease_form.enableField('ls.landlord_tenant', true);
            }
            //if a lease is selected
            else
                if (lastNodeClicked.level.levelIndex == 3) {
                    var landlord_tenant = this.abRepmAddEditLeaseInAPropertyLeaseInfo_form.getFieldValue('ls.landlord_tenant');
                    if (landlord_tenant == 'LANDLORD') {
                        View.showMessage(getMessage('err_ls_landlord'));
                        return;
                    }
                    this.abRepmAddEditLeaseInAPropertyAddLease_form.clear();
                    this.abRepmAddEditLeaseInAPropertyAddLease_form.newRecord = true;
                    this.abRepmAddEditLeaseInAPropertyAddLease_form.setFieldValue('ls.pr_id', lastNodeClicked.parent.data['property.pr_id']);
                    this.abRepmAddEditLeaseInAPropertyAddLease_form.setFieldValue('ls.lease_sublease', 'SUBLEASE');
                    this.abRepmAddEditLeaseInAPropertyAddLease_form.enableField('ls.lease_sublease', false);
                    this.abRepmAddEditLeaseInAPropertyAddLease_form.setFieldValue('ls.landlord_tenant', 'LANDLORD');
                    this.abRepmAddEditLeaseInAPropertyAddLease_form.enableField('ls.landlord_tenant', false);
                    this.abRepmAddEditLeaseInAPropertyAddLease_form.setFieldValue('ls.ls_parent_id', lastNodeClicked.data['ls.ls_parent_id']);
                    this.abRepmAddEditLeaseInAPropertyAddLease_form.enableField('ls.ls_parent_id', false);

                }
		}
        hidePanels();
        this.abRepmAddEditLeaseInAPropertyAddLease_form.show(true);
        //setLandlordTenant(this.abRepmAddEditLeaseInAPropertyAddLease_form.fields.items[11]);
		setLandlordTenant(this.abRepmAddEditLeaseInAPropertyAddLease_form.fields.get('ls.landlord_tenant'));

    },
    //unassign a suite
    abRepmAddEditLeaseInAPropertySuites_grid_Delete_onClick: function(row){
        var controller = this;
        View.confirm(getMessage('message_confirm_unassign'), function(button){
            if (button == 'yes') {
                try {
                    var record = row.getRecord();
                    record.setValue('su.ls_id', '');
                    controller.abRepmAddEditLeaseInAPropertySuites_ds.saveRecord(record);
                    controller.abRepmAddEditLeaseInAPropertySuites_grid.refresh();
                }
                catch (e) {
                    var message = String.format(getMessage('error_delete'));
                    View.showMessage('error', message, e.message, e.data);
                }

            }
        });
    },


    abRepmAddEditLeaseInAPropertySelectSuites_grid_onAddSuites: function(){
        var selectedRecords = this.abRepmAddEditLeaseInAPropertySelectSuites_grid.getSelectedRecords();
        for (i = 0; i < selectedRecords.length; i++) {
            var record = selectedRecords[i];
            record.setValue('su.ls_id', this.abRepmAddEditLeaseInAPropertyLeaseInfo_form.getFieldValue('ls.ls_id'));
            this.abRepmAddEditLeaseInAPropertySelectSuites_ds.saveRecord(record);
        }
        this.abRepmAddEditLeaseInAPropertySuites_grid.refresh();
        this.abRepmAddEditLeaseInAPropertySelectSuites_grid.closeWindow();
    },


    //'Delete' actions
    abRepmAddEditLeaseInAPropertyDocs_grid_onDelete: function(row){
        this.deleteRecord(this.abRepmAddEditLeaseInAPropertyDocs_ds, row.getRecord(), this.abRepmAddEditLeaseInAPropertyDocs_grid);
    },

    abRepmAddEditLeaseInAPropertyContacts_grid_onDelete: function(row){
        this.deleteRecord(this.abRepmAddEditLeaseInAPropertyContacts_ds, row.getRecord(), this.abRepmAddEditLeaseInAPropertyContacts_grid);
    },

    abRepmAddEditLeaseInAPropertyBaseRents_grid_onDelete: function(row){
        this.deleteRecord(this.abRepmAddEditLeaseInAPropertyBaseRents_ds, row.getRecord(), this.abRepmAddEditLeaseInAPropertyBaseRents_grid);
    },

    abRepmAddEditLeaseInAPropertyClauses_grid_onDelete: function(row){
        this.deleteRecord(this.abRepmAddEditLeaseInAPropertyClauses_ds, row.getRecord(), this.abRepmAddEditLeaseInAPropertyClauses_grid);
    },

    abRepmAddEditLeaseInAPropertyOptions_grid_onDelete: function(row){
        this.deleteRecord(this.abRepmAddEditLeaseInAPropertyOptions_ds, row.getRecord(), this.abRepmAddEditLeaseInAPropertyOptions_grid);
    },

    abRepmAddEditLeaseInAPropertyAmendments_grid_onDelete: function(row){
        this.deleteRecord(this.abRepmAddEditLeaseInAPropertyAmendments_ds, row.getRecord(), this.abRepmAddEditLeaseInAPropertyAmendments_grid);
    },

    abRepmAddEditLeaseInAPropertyLiens_grid_onDelete: function(row){
        this.deleteRecord(this.abRepmAddEditLeaseInAPropertyLiens_ds, row.getRecord(), this.abRepmAddEditLeaseInAPropertyLiens_grid);
    },

    abRepmAddEditLeaseInAPropertyEstoppels_grid_onDelete: function(row){
        this.deleteRecord(this.abRepmAddEditLeaseInAPropertyEstoppels_ds, row.getRecord(), this.abRepmAddEditLeaseInAPropertyEstoppels_grid);
    },

    deleteRecord: function(dataSource, record, reportPanel){
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
        });
    },

    abRepmAddEditLeaseInAPropertyLeaseInfo_form_onDelete: function(row){
        var leasePanel = this.abRepmAddEditLeaseInAPropertyLeaseInfo_form;
        var treePanel = this.abRepmAddEditLeaseInAPropertyCtryTree;
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
        });
    },

    //'View Document' actions
    abRepmAddEditLeaseInAPropertyComm_grid_onView: function(row){
        View.showDocument({
            'auto_number': row.getFieldValue('ls_comm.auto_number')
        }, 'ls_comm', 'doc', row.getFieldValue('ls_comm.doc'));
    },

    abRepmAddEditLeaseInAPropertyDocs_grid_onView: function(row){
        View.showDocument({
            'doc_id': row.getFieldValue('docs_assigned.doc_id')
        }, 'docs_assigned', 'doc', row.getFieldValue('docs_assigned.doc'));
    },

    abRepmAddEditLeaseInAPropertyClauses_grid_onDocument: function(row){
        View.showDocument({
            'resp_id': row.getFieldValue('ls_resp.resp_id'),
            'ls_id': row.getFieldValue('ls_resp.ls_id')
        }, 'ls_resp', 'doc', row.getFieldValue('ls_resp.doc'));
    },

    abRepmAddEditLeaseInAPropertyOptions_grid_onDocument: function(row){
        View.showDocument({
            'op_id': row.getFieldValue('op.op_id'),
            'ls_id': row.getFieldValue('op.ls_id')
        }, 'op', 'doc', row.getFieldValue('op.doc'));
    },

    abRepmAddEditLeaseInAPropertyAmendments_grid_onDocument: function(row){
        View.showDocument({
            'ls_amend_id': row.getFieldValue('ls_amendment.ls_amend_id')
        }, 'ls_amendment', 'doc', row.getFieldValue('ls_amendment.doc'));
    },

    abRepmAddEditLeaseInAPropertyEstoppels_grid_onDocument: function(row){
        View.showDocument({
            'lsestoppel_id': row.getFieldValue('lsestoppel.lsestoppel_id')
        }, 'lsestoppel', 'doc1', row.getFieldValue('lsestoppel.doc1'));
    },

    //event handler for 'Use Template' action
    abRepmAddEditLeaseInAPropertyAddLease_form_onUseTemplate: function(){

        //check if 'ls.ls_id' field is empty
        if (!valueExistsNotEmpty(this.abRepmAddEditLeaseInAPropertyAddLease_form.getFieldValue('ls.ls_id'))) {
            View.showMessage(getMessage('err_no_lease'));
            return;
        }

        // if 'ls.ls_id' field is not empty then show 'abRepmAddEditLeaseInAPropertyLsTmp_grid' panel in a Open Dialog
        this.abRepmAddEditLeaseInAPropertyLsTmp_grid.showInWindow({
            applyParentRestriction: false,
            newRecord: true,
            width: 600,
            height: 600
        });
        this.abRepmAddEditLeaseInAPropertyLsTmp_grid.refresh();
    },

	abRepmAddEditLeaseInAPropertyHistoryEdit_form_afterRefresh : function(){

		if(this.abRepmAddEditLeaseInAPropertyHistoryEdit_form.newRecord === false){
			this.abRepmAddEditLeaseInAPropertyHistoryEdit_form.actions.items[0].button.hide();
			 disableForm(this.abRepmAddEditLeaseInAPropertyHistoryEdit_form, true);
		}
		else{
			this.abRepmAddEditLeaseInAPropertyHistoryEdit_form.actions.items[0].button.show();
			 disableForm(this.abRepmAddEditLeaseInAPropertyHistoryEdit_form, false);
		}
	},

	abRepmAddEditLeaseInAPropertyEstoppelsEdit_form_afterRefresh : function(){
/*
		if(this.abRepmAddEditLeaseInAPropertyEstoppelsEdit_form.newRecord === false){
			this.abRepmAddEditLeaseInAPropertyEstoppelsEdit_form.actions.items[0].button.hide();
			 disableForm(this.abRepmAddEditLeaseInAPropertyEstoppelsEdit_form, true)
		}
		else{
			this.abRepmAddEditLeaseInAPropertyEstoppelsEdit_form.actions.items[0].button.show();
			 disableForm(this.abRepmAddEditLeaseInAPropertyEstoppelsEdit_form, false)
		}
*/
	},
 //   abRepmAddEditLeaseInAPropertyRm_grid_onUnassign: function(row){
 //       var bl_id = row.getFieldValue('rm.bl_id');
 //       var fl_id = row.getFieldValue('rm.fl_id');
 //       var rm_id = row.getFieldValue('rm.rm_id');
 //       var ls_id = row.getFieldValue('rm.ls_id');

////
 //       try {
 //           var rmRec = row.getRecord();
 //           rmRec.setValue('rm.ls_id', '');
 //           this.abRepmAddEditLeaseInAPropertyRm_ds.saveRecord(rmRec);

////
 //           this.abRepmAddEditLeaseInAPropertyRm_grid.refresh();
 //       }
 //       catch (e) {
 //           var message = String.format(getMessage('error_delete'));
 //           View.showMessage('error', message, e.message, e.data);
  //      }
  //  },

//
 //   abRepmAddEditLeaseInAPropertySelectRm_grid_onAddRooms: function(){
 //       var selectedRecords = this.abRepmAddEditLeaseInAPropertySelectRm_grid.getSelectedRecords();
 //       for (i = 0; i < selectedRecords.length; i++) {
 //           var record = selectedRecords[i];
 //           record.setValue('rm.ls_id', this.abRepmAddEditLeaseInAPropertyLeaseInfo_form.getFieldValue('ls.ls_id'));
 //           this.abRepmAddEditLeaseInAPropertyRm_ds.saveRecord(record);
 //       }
 //       this.abRepmAddEditLeaseInAPropertyRm_grid.refresh();
 //       this.abRepmAddEditLeaseInAPropertySelectRm_grid.closeWindow();
 //   }

	//2012/02/15 - open lease window
	openLeaseWindow:function()
	{
		var ls_id = this.abRepmAddEditLeaseInAPropertyLeaseInfo_form.getFieldValue("ls.ls_id");

		window.open('uc-repm-addedit-lease-in-a-property-print-lease.axvw?handler=com.archibus.config.ActionHandlerDrawing&ls.ls_id='+ls_id, 'newWindow', 'width=400, height=400, resizable=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, copyhistory=no');
	}


});

/**
 * refersh tree panel after save or delete
 * @param {Object} treeNode
 */
function refreshTreePanelAfterUpdate(treeNode){

    abRepmAddEditLeaseInAProperty_ctrl.abRepmAddEditLeaseInAPropertyCtryTree.refreshNode(treeNode);
    treeNode.expand();
}

//refresh lease's associated panels
function refreshPanels(ls_id){
    var restriction = new Ab.view.Restriction();
    restriction.addClause("ls.ls_id", ls_id);

    var controller = abRepmAddEditLeaseInAProperty_ctrl;

    controller.abRepmAddEditLeaseInAPropertyLeaseInfo_form.refresh(restriction);
    controller.leaseId = ls_id;

    //enable/disable 'landlord_tenant' field if a lease/sublease is selected from the tree

    if (controller.abRepmAddEditLeaseInAPropertyCtryTree.lastNodeClicked != null && controller.abRepmAddEditLeaseInAPropertyCtryTree.lastNodeClicked.level.levelIndex == 3 && !viewOnly) {
        controller.abRepmAddEditLeaseInAPropertyLeaseInfo_form.enableField('ls.landlord_tenant', true);
    }
    else {
        controller.abRepmAddEditLeaseInAPropertyLeaseInfo_form.enableField('ls.landlord_tenant', false);
    }


    //controller.abRepmAddEditLeaseInAPropertySuites_grid.refresh(restriction);
    controller.abRepmAddEditLeaseInAPropertyDocs_grid.refresh(restriction);
    controller.abRepmAddEditLeaseInAPropertyContacts_grid.refresh(restriction);
    //controller.abRepmAddEditLeaseInAPropertyBaseRents_grid.refresh(restriction);
    controller.abRepmAddEditLeaseInAPropertyClauses_grid.refresh(restriction);
    controller.abRepmAddEditLeaseInAPropertyOptions_grid.refresh(restriction);
    controller.abRepmAddEditLeaseInAPropertyAmendments_grid.refresh(restriction);

    controller.abRepmAddEditLeaseInAPropertyComm_grid.refresh(restriction);
   // controller.abRepmAddEditLeaseInAPropertyRm_grid.refresh(restriction);
    controller.abRepmAddEditLeaseInAPropertyHistory_grid.refresh(restriction);
    controller.abRepmAddEditLeaseInAPropertyLiens_grid.refresh(restriction);
    controller.abRepmAddEditLeaseInAPropertyEstoppels_grid.refresh(restriction);



//Restrict the tabs

	var controller_0 = View.controllers.get('mgmtRecurringCost');
	var controller_1 = View.controllers.get('mgmtScheduledCost');
	var controller_2 = View.controllers.get('mgmtActualCost');
	controller_0.reset();
	controller_1.reset();
	controller_2.reset();
	var restriction_0 = new Ab.view.Restriction();
	var restriction_1 = new Ab.view.Restriction();
	var restriction_2 = new Ab.view.Restriction();

	controller_0.ls_id = controller.leaseId;
	controller_0.isLease = true;
	controller_1.ls_id = controller.leaseId;
	controller_1.isLease = true;
	controller_2.ls_id = controller.leaseId;
	controller_2.isLease = true;
	restriction_0.addClause('cost_tran_recur.ls_id', controller.leaseId , '=');
	restriction_1.addClause('cost_tran_sched.ls_id', controller.leaseId, '=');
	restriction_2.addClause('cost_tran.ls_id', controller.leaseId, '=');

	controller.detailsTabs.showTab('detailsTabs_0',true);
	controller.detailsTabs.showTab('detailsTabs_1',true);
	//controller.detailsTabs.showTab('detailsTabs_2',true);

	controller_0.recurringCostGrid.refresh(restriction_0);
	controller_1.scheduledCostGrid.refresh(restriction_1);
	controller_2.actualCostGrid.refresh(restriction_2);



	controller_0.recurringCostGrid.actions.get("schedule").button.hide();
	controller_1.scheduledCostGrid.actions.get("approve").button.hide();

	controller.costs.show(true);
	var div = document.getElementById('detailsTabs_layoutWrapper')
	if (div) {div.style.height = null;}
	var div = document.getElementById('detailsTabs_0').parentNode
	if (div) {div.style.height = null;}

}


//hide lease's associated panels
function hidePanels(){
    var controller = abRepmAddEditLeaseInAProperty_ctrl;
    controller.abRepmAddEditLeaseInAPropertyLeaseInfo_form.show(false);
    controller.abRepmAddEditLeaseInAPropertyAddLease_form.show(false);
    controller.abRepmAddEditLeaseInAPropertySuites_grid.show(false);
    controller.abRepmAddEditLeaseInAPropertyDocs_grid.show(false);
    controller.abRepmAddEditLeaseInAPropertyContacts_grid.show(false);
    controller.abRepmAddEditLeaseInAPropertyBaseRents_grid.show(false);
    controller.abRepmAddEditLeaseInAPropertyClauses_grid.show(false);
    controller.abRepmAddEditLeaseInAPropertyOptions_grid.show(false);
    controller.abRepmAddEditLeaseInAPropertyAmendments_grid.show(false);

    controller.abRepmAddEditLeaseInAPropertyComm_grid.show(false);
   // controller.abRepmAddEditLeaseInAPropertyRm_grid.show(false);
    controller.abRepmAddEditLeaseInAPropertyHistory_grid.show(false);
    controller.abRepmAddEditLeaseInAPropertyLiens_grid.show(false);
    controller.abRepmAddEditLeaseInAPropertyEstoppels_grid.show(false);

	controller.costs.show(false);


	View.controllers.get('mgmtRecurringCost').recurringCostGrid.show(false);
	View.controllers.get('mgmtScheduledCost').scheduledCostGrid.show(false);
	View.controllers.get('mgmtActualCost').actualCostGrid.show(false);


	controller.detailsTabs.showTab('detailsTabs_0',false);
	controller.detailsTabs.showTab('detailsTabs_1',false);
	controller.detailsTabs.showTab('detailsTabs_2',false);
}

//show lease's associated panels
function showDetails(row){
    abRepmAddEditLeaseInAProperty_ctrl.abRepmAddEditLeaseInAPropertyAddLease_form.show(false);

    var ls_id = row.restriction.clauses[0].value;

	//add restriction parameter to the contact selection grid..(restrict contacts already added to the selected lease)
	abRepmAddEditLeaseInAProperty_ctrl.abRepmAddEditLeaseInAPropertyContactsSelect_grid.addParameter("leaseID", "'"+ls_id+"'");

    refreshPanels(ls_id);
}

function setCustomPeriodForBaseRentsEditPanel(panel){
    if (panel.getFieldValue('cost_tran_recur.period') == 'CUSTOM' && !viewOnly) {
        panel.enableField('cost_tran_recur.period_custom', true);
    }
    else {
        panel.enableField('cost_tran_recur.period_custom', false);
    }
}

function checkClauseFields(panel){
    if (panel.getFieldValue('ls_resp.dates_match_lease') == 1 || viewOnly) {
        panel.enableField('ls_resp.date_start', false);
        panel.enableField('ls_resp.date_end', false);
    }
    else
        if (panel.getFieldValue('ls_resp.dates_match_lease') == 0) {
            panel.enableField('ls_resp.date_start', true);
            panel.enableField('ls_resp.date_end', true);
        }
}

function checkOptionFields(panel){
    if (panel.getFieldValue('op.dates_match_lease') == 1 || viewOnly) {
        panel.enableField('op.date_start', false);
        panel.enableField('op.date_option', false);
    }
    else
        if (panel.getFieldValue('op.dates_match_lease') == 0) {
            panel.enableField('op.date_start', true);
            panel.enableField('op.date_option', true);
        }
}

function selectFloor(){
    Ab.view.View.selectValue('abRepmAddEditLeaseInAPropertySuitesEdit_form', 'Floor Code', ['su.fl_id'], 'fl', ['fl.fl_id'], ['fl.bl_id', 'fl.fl_id', 'fl.name'], 'fl.bl_id = \'' + this.abRepmAddEditLeaseInAProperty_ctrl.abRepmAddEditLeaseInAPropertyLeaseInfo_form.getFieldValue("ls.bl_id") + '\'', '', true, false, '', 1000, 500);
}

var srchFields = {
	leaseSrchFields : ["ls_id", "uclass", "description", "comments" , "ld_name", "ld_contact", "tn_name", "tn_contact"],
	roomSrchFields : ["rm_id", "name", "rm_type_desc"],
	contactSrchFields : ["contact_id", "name_first", "name_last", "address1" , "address2", "city_id", "state_id", "company", "email", "phone","cellular_number","fax","zip","notes"],
	commSrchFields : ["comm_id", "summary", "recorded_by", "doc"],
	docSrchFields : ["name", "description"],
	bRentSrchFields : ["description"],
	clauseSrchFields : ["resp_party", "doc", "reference_loc", "description","contact_id"],
	crchgBackSrchFields : ["comments"],
	optSrchFields : ["description","who_can_exercise", "exercised_by", "comments"],
	amndSrchFields : ["description", "comments", "exercised_by"],
	histSrchFields : ["change", "description"],
	lienSrchFields : ["description"],
	nesSrchFields : ["description", "doc1"]
};

function makeLiteralOrNull (val, operator){
	var op = (typeof operator !== "undefined") ? operator : "";
	if (typeof val == "string"){
		var rVal = "NULL";
		if (val !== "") {
			rVal = "'" + val.replace(/'/g, "''") + op + "' ";
		}
		return rVal;
	}
	else{
		return val;
	}
}
function getGlobalSearchRest (fields, srchValue){
	var restriction = "";
	if(srchValue !== ""){
		srchValue = makeLiteralOrNull(srchValue, "%");
		for (var i=0, j=fields.length; i<j; i++){
			restriction += (restriction !== "") ? " or " : "";
			restriction += fields[i] +" like "+srchValue;
		}
	}
	return restriction;
}




function filter(){

    var controller = abRepmAddEditLeaseInAProperty_ctrl;
    var consolePanel = controller.abRepmAddEditLeaseInAPropertyConsole;
    var restriction = '';
	 // BRG - Add lease subquery restriction
    var lsRestriction = '';
    if (consolePanel.getFieldValue('ls.pr_id')) {
        restriction += " property.pr_id = '" + consolePanel.getFieldValue('ls.pr_id') + "'";
		lsRestriction += " ls.pr_id = '" + consolePanel.getFieldValue('ls.pr_id') + "'";
    }





    if (consolePanel.getFieldValue('ls.tn_name')) {
		lsRestriction += (lsRestriction != '') ? ' and ' : '';
        lsRestriction += " ls.tn_name like '" + consolePanel.getFieldValue('ls.tn_name') + "%'";
    }
    if (consolePanel.getFieldValue('ls.ld_name')) {
        lsRestriction += (lsRestriction != '') ? ' and ' : '';
        lsRestriction += " ls.ld_name like '" + consolePanel.getFieldValue('ls.ld_name') + "%'";
    }
    if (consolePanel.getFieldValue('ls.status')) {
        lsRestriction += (lsRestriction != '') ? ' and ' : '';
        lsRestriction += " ls.status like '" + consolePanel.getFieldValue('ls.status') + "%'";
    }

   if (consolePanel.getFieldValue('ls.ls_cat')) {
        lsRestriction += (lsRestriction != '') ? ' and ' : '';
        lsRestriction += " ls.ls_cat = '" + consolePanel.getFieldValue('ls.ls_cat') + "'";
    }


	if ($("searchField")) {
       var searchFieldVal = $("searchField").value;
		if(searchFieldVal != ""){
			lsRestriction += (lsRestriction != '') ? ' and (' : '(';

			//LEASE
			lsRestriction += getGlobalSearchRest(srchFields.leaseSrchFields, searchFieldVal);


			//CONTACT
			lsRestriction +=  ' or ';
			lsRestriction += "exists(select 1 from ls_contacts where ls_contacts.ls_id = ls.ls_id and (";
			lsRestriction += getGlobalSearchRest(srchFields.contactSrchFields, searchFieldVal);
			lsRestriction += "))";


			//COMMUNICATIONS
			lsRestriction +=  ' or ';
			lsRestriction += "exists(select 1 from ls_comm where ls_comm.ls_id = ls.ls_id and (";
			lsRestriction += getGlobalSearchRest(srchFields.commSrchFields, searchFieldVal);
			lsRestriction += "))";

			//DOCUMENTS
			lsRestriction +=  ' or ';
			lsRestriction += "exists(select 1 from docs_assigned where docs_assigned.ls_id = ls.ls_id and (";
			lsRestriction += getGlobalSearchRest(srchFields.docSrchFields, searchFieldVal);
			lsRestriction += "))";

			//BASERENT
			lsRestriction +=  ' or ';
			lsRestriction += "exists(select 1 from cost_tran_recur where cost_tran_recur.ls_id = ls.ls_id and (";
			lsRestriction += getGlobalSearchRest(srchFields.bRentSrchFields, searchFieldVal);
			lsRestriction += "))";

			//CLAUSES
			lsRestriction +=  ' or ';
			lsRestriction += "exists(select 1 from ls_resp where ls_resp.ls_id = ls.ls_id and (";
			lsRestriction += getGlobalSearchRest(srchFields.clauseSrchFields, searchFieldVal);
			lsRestriction += "))";

			//CHARGEBACK
			lsRestriction +=  ' or ';
			lsRestriction += "exists(select 1 from ls_chrgbck_agree where ls_chrgbck_agree.ls_id = ls.ls_id and (";
			lsRestriction += getGlobalSearchRest(srchFields.crchgBackSrchFields, searchFieldVal);
			lsRestriction += "))";

			//OPTIONS
			lsRestriction +=  ' or ';
			lsRestriction += "exists(select 1 from op where op.ls_id = ls.ls_id and (";
			lsRestriction += getGlobalSearchRest(srchFields.optSrchFields, searchFieldVal);
			lsRestriction += "))";

			//AMENDMENTS
			lsRestriction +=  ' or ';
			lsRestriction += "exists(select 1 from ls_amendment where ls_amendment.ls_id = ls.ls_id and (";
			lsRestriction += getGlobalSearchRest(srchFields.amndSrchFields, searchFieldVal);
			lsRestriction += "))";

			//HISTORY
			lsRestriction +=  ' or ';
			lsRestriction += "exists(select 1 from lshistory where lshistory.ls_id = ls.ls_id and (";
			lsRestriction += getGlobalSearchRest(srchFields.histSrchFields, searchFieldVal);
			lsRestriction += "))";

			//LIENS
			lsRestriction +=  ' or ';
			lsRestriction += "exists(select 1 from lslien where lslien.ls_id = ls.ls_id and (";
			lsRestriction += getGlobalSearchRest(srchFields.lienSrchFields, searchFieldVal);
			lsRestriction += "))";


			//NOTICE/ESTOPPELS/SNDA
			lsRestriction +=  ' or ';
			lsRestriction += "exists(select 1 from lsestoppel where lsestoppel.ls_id = ls.ls_id and (";
			lsRestriction += getGlobalSearchRest(srchFields.nesSrchFields, searchFieldVal);
			lsRestriction += "))";

			lsRestriction += ")";

		}
    }


    if (lsRestriction) {
        restriction += (restriction != '') ? ' and ' : '';
        restriction += " exists (SELECT 1 FROM ls WHERE ls.pr_id = property.pr_id and "+lsRestriction+")";
    }


    if (restriction) {
		controller.abRepmAddEditLeaseInAPropertyCtryTree.addParameter('consolels', "(" + lsRestriction +  " or exists (select 1 from ls l where l.ls_parent_id=ls.ls_id and " + lsRestriction.replace(/ls\./g,'l.') + "))" );
        controller.abRepmAddEditLeaseInAPropertyCtryTree.addParameter('console', restriction);
    }
    else {
		controller.abRepmAddEditLeaseInAPropertyCtryTree.addParameter('consolels', ' 1=1 ');
        controller.abRepmAddEditLeaseInAPropertyCtryTree.addParameter('console', ' 1=1 ');
    }
	var btn = Ext.getCmp("addEdit")
	btn.hide();
    hidePanels();
    controller.abRepmAddEditLeaseInAPropertyAddLease_form.show(false);
    controller.abRepmAddEditLeaseInAPropertyCtryTree.refresh();

    controller.abRepmAddEditLeaseInAPropertyCtryTree.setTitle(getMessage('tree_panel_title'));
    controller.abRepmAddEditLeaseInAPropertyCtryTree.lastNodeClicked = null;
}



function createNewLease(row){

    var controller = abRepmAddEditLeaseInAProperty_ctrl;
    var newLsId = controller.abRepmAddEditLeaseInAPropertyAddLease_form.getFieldValue('ls.ls_id');
    var lsParentId = "'"+controller.abRepmAddEditLeaseInAPropertyAddLease_form.getFieldValue('ls.ls_parent_id')+"'";
    var propertyId = (selectedProperty != "")?selectedProperty:controller.abRepmAddEditLeaseInAPropertyAddLease_form.getFieldValue('ls.pr_id');
	var lease_sublease = "'"+controller.abRepmAddEditLeaseInAPropertyAddLease_form.getFieldValue('ls.lease_sublease')+"'";

	try {
        Workflow.callMethod("AbRPLMLeaseAdministration-LeaseAdministrationService-duplicateLease", newLsId, row['ls.ls_id'], '0', 'property' , propertyId,'LANDLORD_TENANT',lsParentId ,lease_sublease);
		controller.abRepmAddEditLeaseInAPropertyLsTmp_grid.closeWindow();
		controller.abRepmAddEditLeaseInAPropertyAddLease_form.show(false);
        refreshPanels(newLsId);
		refreshTreePanelAfterUpdate(controller.abRepmAddEditLeaseInAPropertyCtryTree.lastNodeClicked);
		selectNewAddedTreeNode(controller.abRepmAddEditLeaseInAPropertyCtryTree.lastNodeClicked, newLsId);
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

function setSelectedProperty(node){
    selectedProperty = abRepmAddEditLeaseInAProperty_ctrl.abRepmAddEditLeaseInAPropertyCtryTree.lastNodeClicked.data['property.pr_id'];
}



/**
 * Copy to Contact the location fields of the selected Company
 * @param {Object} fieldName
 * @param {Object} selectedValue
 * @param {Object} previousValue
 */
function afterSelectCompany(fieldName, selectedValue, previousValue){
    var panel = View.panels.get("abRepmAddEditLeaseInAPropertyContactsEdit_form");

    if (!panel.newRecord)
        return;

    var dsCompany = View.dataSources.get("abRepmAddEditLeaseInAPropertyTab_dsCompany");
    var companyRecord = dsCompany.getRecord(new Ab.view.Restriction({
        "company.company": selectedValue
    }));

	if (panel.getFieldValue("contact.company") == "")
        panel.setFieldValue("contact.company", companyRecord.getValue("company.company"));

    if (panel.getFieldValue("contact.address1") == "")
        panel.setFieldValue("contact.address1", companyRecord.getValue("company.address1"));

    if (panel.getFieldValue("contact.address2") == "")
        panel.setFieldValue("contact.address2", companyRecord.getValue("company.address2"));

    if (panel.getFieldValue("contact.city_id") == "")
        panel.setFieldValue("contact.city_id", companyRecord.getValue("company.city_id"));

    if (panel.getFieldValue("contact.ctry_id") == "")
        panel.setFieldValue("contact.ctry_id", companyRecord.getValue("company.ctry_id"));

    if (panel.getFieldValue("contact.regn_id") == "")
        panel.setFieldValue("contact.regn_id", companyRecord.getValue("company.regn_id"));

    if (panel.getFieldValue("contact.state_id") == "")
        panel.setFieldValue("contact.state_id", companyRecord.getValue("company.state_id"));

    if (panel.getFieldValue("contact.zip") == "")
        panel.setFieldValue("contact.zip", companyRecord.getValue("company.zip"));
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
    var childDataIndex = (parentNode.level.levelIndex == 2) ? 'ls.ls_parent_id' : 'ls.ls_id';


    // find the node
    for (i = 0; i < childrenNodes.length; i++) {
        if (childrenNodes[i].data[childDataIndex] == lsId) {
            newAddedTreeNode = childrenNodes[i];
            break;
        }
    }

    //select the node
    parentNode.onLabelClick(newAddedTreeNode);
}

/**
 * afterRefresh event for  'abRepmAddEditLeaseInAPropertyLeaseInfo_form' panel
 * @param {Object} panel
 **/
function abRepmAddEditLeaseInAPropertyLeaseInfo_form_afterRefresh(panel){

    //setLandlordTenant(panel.fields.items[11]);
    setLandlordTenant(panel.fields.get('ls.landlord_tenant'));

    //loadAcctCode('abRepmAddEditLeaseInAPropertyLeaseInfo_form', panel.getFieldValue('ls.ac_id'));
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
 * Add Amenity Type and Comments to selected Clause's Description
 **/
function setAmenityType(){
    var selectedRows = View.panels.get('abRepmAddEditLeaseInAPropertyClausesAmntType').getSelectedRows();
    panel = abRepmAddEditLeaseInAProperty_ctrl.abRepmAddEditLeaseInAPropertyClausesEdit_form;
    for (i = 0; i < selectedRows.length; i++) {
        var comments = (selectedRows[i]['bl_amenity.comments'])?" - Comments: "+selectedRows[i]['bl_amenity.comments']:"";
        panel.setFieldValue('ls_resp.description', panel.getFieldValue('ls_resp.description') + " Amenity Type: " + selectedRows[i]['bl_amenity.amenity_type'] + comments + ". ");
    }
    View.panels.get('abRepmAddEditLeaseInAPropertyClausesAmntType').closeWindow();

}

/**
 * Enable/Disable 'Add Amenity Description' button if Clause Type is/is not 'Amenity'
 * @param {Object} fieldName
 * @param {Object} selectedValue
 * @param {Object} previousValue
 **/
function setAmenityButton(fieldName, selectedValue, previousValue){
    var panel = abRepmAddEditLeaseInAProperty_ctrl.abRepmAddEditLeaseInAPropertyClausesEdit_form;
    var clauseType = (selectedValue) ? selectedValue : panel.getFieldValue('ls_resp.clause_type_id');

 /*   if (clauseType == 'Amenity') {
        panel.fields.get('ls_resp.description').actions.items[0].enable(true);
    }
    else {
        panel.fields.get('ls_resp.description').actions.items[0].enable(false);
    }
*/
}

/**
 * 'Save' action when adding or editing a Lease
 * @param {Object} form
 * @param {Object} isNewLease
 **/
function saveLease(form, isNewLease){

    if (!datesValidated(form, 'ls.date_start', 'ls.date_end', getMessage('error_date_end_before_date_start'))) {
        return;
    }

    if (!datesValidated(form, 'ls.date_start', 'ls.date_move', getMessage('error_date_move_before_date_start'))) {
        return;
    }

    if (form.save() && isNewLease) {
        var treePanel = abRepmAddEditLeaseInAProperty_ctrl.abRepmAddEditLeaseInAPropertyCtryTree;
		refreshTreePanelAfterUpdate(treePanel.lastNodeClicked);
		try {
			selectNewAddedTreeNode(treePanel.lastNodeClicked, form.getFieldValue('ls.ls_id'));
			showDetails(treePanel.lastNodeClicked);
			treePanel.setTitle(getMessage('tree_panel_title'));
		}
		catch (ex) {
			var ls_id =form.getFieldValue('ls.ls_id');
			abRepmAddEditLeaseInAProperty_ctrl.abRepmAddEditLeaseInAPropertyAddLease_form.show(false);
			//add restriction parameter to the contact selection grid..(restrict contacts already added to the selected lease)
			abRepmAddEditLeaseInAProperty_ctrl.abRepmAddEditLeaseInAPropertyContactsSelect_grid.addParameter("leaseID", "'"+ls_id+"'");
			refreshPanels(ls_id);
		}
    }

}

/**
 * if dateEnd < dateStart it shows an error message
 * @param {Object} form
 * @param {Object} startDateField
 * @param {Object} endDateField
 * @param {Object} errMessage
 **/
function datesValidated(form, startDateField, endDateField, errMessage){
    // get the string value from field start date
    var date_start = form.getFieldValue(startDateField).split("-");
    //create Date object
    var dateStart = new Date(date_start[0], date_start[1], date_start[2]);

    // get the string value from field end date
    var date_end = form.getFieldValue(endDateField).split("-");
    //create Date object
    var dateEnd = new Date(date_end[0], date_end[1], date_end[2]);

    if (dateEnd < dateStart) {
        View.showMessage(errMessage);
        return false;
    }
    return true;
}

/**
 * 'Save' action when adding or editing: assigned documents , base rents, clauses, options and amendments
 * @param {Object} editFormPanel
 * @param {Object} detailsGridPanel
 * @param {Object} datesJSON
 * @param {Object} closeWindowIfIsNewRec
 **/
function saveRecord(editFormPanel, detailsGridPanel, datesJSON, closeWindowIfIsNewRec){

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


var gCallbackForm = null;
var gCallbackIsNewLease = null;
function checkAccountSaveLease(panelName, form, isNewLease){
    gCallbackForm = form;
    gCallbackIsNewLease = isNewLease;
    checkAcctAndSave(panelName, "ls.ac_id", "saveLease(gCallbackForm, gCallbackIsNewLease)");
}

var gCallbackEditFormPanel = null;
var gCallbackDetailsGridPanel = null;
var gCallbackDatesJSON = null;
var gCallbackCloseWindowIfIsNewRec = null;
function checkAccountSaveRecord(editFormPanel, detailsGridPanel, datesJSON, closeWindowIfIsNewRec){
    gCallbackEditFormPanel = editFormPanel;
    gCallbackDetailsGridPanel = detailsGridPanel;
    gCallbackDatesJSON = datesJSON;
    gCallbackCloseWindowIfIsNewRec = false;

    checkAcctAndSave(editFormPanel.id, "cost_tran_recur.ac_id", "saveRecord(gCallbackEditFormPanel, gCallbackDetailsGridPanel, gCallbackDatesJSON, gCallbackCloseWindowIfIsNewRec)");
}


function assignContacts (){
	var selectedContacts = View.panels.get("abRepmAddEditLeaseInAPropertyContactsSelect_grid").getSelectedRecords();
	for(var i = 0, j = selectedContacts.length; i<j; i++){
		var record = createLeaseContactRec(selectedContacts[i].values);
		var params = {
			"tableName" : "ls_contacts",
			"fields" : toJSON(record),
			"newrecord" :true
		};
		try {
			AFM.workflow.Workflow.runRuleAndReturnResult("AbCommonResources-saveRecord", params);
		}
		catch(e){
			AFM.workflow.Workflow.handleError(rec);
		}
	}

	abRepmAddEditLeaseInAProperty_ctrl.abRepmAddEditLeaseInAPropertyContacts_grid.refresh();

}


function createLeaseContactRec(contactRecord){
	var record = {
        "ls_contacts.company":contactRecord["contact.company"],
        "ls_contacts.honorific":contactRecord["contact.honorific"],
        "ls_contacts.state_id":contactRecord["contact.state_id"],
        "ls_contacts.zip":contactRecord["contact.zip"],
        "ls_contacts.address1":contactRecord["contact.address1"],
        "ls_contacts.address2":contactRecord["contact.address2"],
        "ls_contacts.ctry_id":contactRecord["contact.ctry_id"],
        "ls_contacts.phone":contactRecord["contact.phone"],
        "ls_contacts.cellular_number":contactRecord["contact.cellular_number"],
        "ls_contacts.fax":contactRecord["contact.fax"],
        "ls_contacts.email":contactRecord["contact.email"],
		"ls_contacts.name_first":contactRecord["contact.name_first"],
		"ls_contacts.name_last":contactRecord["contact.name_last"],
		"ls_contacts.city_id":contactRecord["contact.city_id"],
		"ls_contacts.contact_type":contactRecord["contact.contact_type"],
		"ls_contacts.status":contactRecord["contact.status"],
		"ls_contacts.notes":contactRecord["contact.notes"],
		"ls_contacts.ls_id" :abRepmAddEditLeaseInAProperty_ctrl.leaseId,
		"ls_contacts.contact_id" :contactRecord["contact.contact_id"]
	};

	return record;
}

function showAddButton(level){
	var btn = Ext.getCmp("addEdit");
	if(level === "lease" && !viewOnly){
		btn.setText("Add Lease");
		btn.show();
	}
	else if(level === "sub" && !viewOnly){
		btn.setText("Add Sublease");
		btn.show();
	}
	else{
		btn.hide();
	}
}
function showAddButton(level, form){
	var btn = Ext.getCmp("addEdit"),
		lastNodeClicked = abRepmAddEditLeaseInAProperty_ctrl.abRepmAddEditLeaseInAPropertyCtryTree.lastNodeClicked;

	if(level === "lease"  && !viewOnly){
		btn.setText("Add Lease");
		btn.show();
	}
	else if(level === "sub"  && !viewOnly){
		btn.setText("Add Sublease");
		btn.show();
	}
	else{
		btn.hide();
	}

	if(form){

		if(lastNodeClicked.data['ls.landlord_tenant'] == "LANDLORD" || viewOnly ){
			btn.hide();
		}
		else{
			btn.show();
		}
	}
}

function clearConsole(){
	$('searchField').value = "";

}
function disableForm(pnl, show){
	if(typeof pnl=='string'){pnl=View.panels.get(pnl);}
	for(var i=0,len=pnl.fields.getCount();i<len;i++){
		var fld=pnl.fields.get(i);
		fld.dom.disabled = show;
	}
}