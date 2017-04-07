// CHANGE LOG
// 2013/05/21 - EWONG - Do not restrict room list if building is CWBMS (Campus Wide Building Mgmt)

var selectedBuilding = "";

//Used by screens JS when it programmatically changes the fields to editable
 //Programmatically set in the uc-repm-view-Lease-form.js
 var viewOnly;

/*
 * This method is called by the tree control for each new tree node created from the data.
 *
 */
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

var abRepmAddEditLeaseInABuilding_ctrl = View.createController('abRepmAddEditLeaseInABuilding_ctrl', {

    leaseId: null,

    afterViewLoad:function(){
        //this.menuParent = Ext.get('addEdit');
       // this.menuParent.on('click', this.showMenu, this, null);
	   abRepmAddEditLeaseInABuilding_ctrl.costs.show(false);

	   this.scheduledCostGrid.columns[2].hidden=true;
	   this.scheduledCostGrid.columns[3].hidden=true;
	   this.recurringCostGrid.columns[2].hidden=true;
    },

    afterInitialDataFetch: function() {
       var openerView = View.getOpenerView();
       if (openerView != null && openerView.urlParameters != null) {
           var ls_id = openerView.urlParameters["ls_id"];
           var blpr = openerView.urlParameters["blpr"];
           if (blpr != "p") {
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
            handler: this.open_addEditBuildings.createDelegate(this)
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

abRepmAddEditLeaseInABuildingCtryTree_afterRefresh : function(){
	//alert(1);
},

abRepmAddEditLeaseInABuildingCtryTree_onAddEdit : function(){
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
        if ((lastNodeClicked == null) || ((lastNodeClicked.level.levelIndex != 2) && (lastNodeClicked.level.levelIndex != 3))) {
            View.showMessage(getMessage('err_selection'));
            return;
        }
        //if a building is selected
        else
            if (lastNodeClicked.level.levelIndex == 2) {
                this.abRepmAddEditLeaseInABuildingAddLease_form.clear();
                this.abRepmAddEditLeaseInABuildingAddLease_form.newRecord = true;
                this.abRepmAddEditLeaseInABuildingAddLease_form.setFieldValue('ls.bl_id', lastNodeClicked.data['bl.bl_id']);
                this.abRepmAddEditLeaseInABuildingAddLease_form.setFieldValue('ls.lease_sublease', 'LEASE');
                this.abRepmAddEditLeaseInABuildingAddLease_form.enableField('ls.lease_sublease', false);
                this.abRepmAddEditLeaseInABuildingAddLease_form.enableField('ls.ls_parent_id', false);
                this.abRepmAddEditLeaseInABuildingAddLease_form.enableField('ls.landlord_tenant', true);
            }
            //if a lease is selected
            else
                if (lastNodeClicked.level.levelIndex == 3) {
                    var landlord_tenant = this.abRepmAddEditLeaseInABuildingLeaseInfo_form.getFieldValue('ls.landlord_tenant');
                    if (landlord_tenant == 'LANDLORD') {
                        View.showMessage(getMessage('err_ls_landlord'));
                        return;
                    }
                    this.abRepmAddEditLeaseInABuildingAddLease_form.clear();
                    this.abRepmAddEditLeaseInABuildingAddLease_form.newRecord = true;
                    this.abRepmAddEditLeaseInABuildingAddLease_form.setFieldValue('ls.bl_id', lastNodeClicked.parent.data['bl.bl_id']);
                    this.abRepmAddEditLeaseInABuildingAddLease_form.setFieldValue('ls.lease_sublease', 'SUBLEASE');
                    this.abRepmAddEditLeaseInABuildingAddLease_form.enableField('ls.lease_sublease', false);
                    this.abRepmAddEditLeaseInABuildingAddLease_form.setFieldValue('ls.landlord_tenant', 'LANDLORD');
                    this.abRepmAddEditLeaseInABuildingAddLease_form.enableField('ls.landlord_tenant', false);
                    this.abRepmAddEditLeaseInABuildingAddLease_form.setFieldValue('ls.ls_parent_id', lastNodeClicked.data['ls.ls_parent_id']);
                    this.abRepmAddEditLeaseInABuildingAddLease_form.enableField('ls.ls_parent_id', false);

                }

        hidePanels();
        this.abRepmAddEditLeaseInABuildingAddLease_form.show(true);
      //  setLandlordTenant(this.abRepmAddEditLeaseInABuildingAddLease_form.fields.items[11]);
		setLandlordTenant(this.abRepmAddEditLeaseInABuildingAddLease_form.fields.get('ls.landlord_tenant'));
    },
    //unassign a suite
    abRepmAddEditLeaseInABuildingSuites_grid_Delete_onClick: function(row){
        var controller = this;
        View.confirm(getMessage('message_confirm_unassign'), function(button){
            if (button == 'yes') {
                try {
                    var record = row.getRecord();
                    record.setValue('su.ls_id', '');
                    controller.abRepmAddEditLeaseInABuildingSuites_ds.saveRecord(record);
                    controller.abRepmAddEditLeaseInABuildingSuites_grid.refresh();
                }
                catch (e) {
                    var message = String.format(getMessage('error_delete'));
                    View.showMessage('error', message, e.message, e.data);
                }

            }
        });
    },


    abRepmAddEditLeaseInABuildingSelectSuites_grid_onAddSuites: function(){
        var selectedRecords = this.abRepmAddEditLeaseInABuildingSelectSuites_grid.getSelectedRecords();
        for (i = 0; i < selectedRecords.length; i++) {
            var record = selectedRecords[i];
            record.setValue('su.ls_id', this.abRepmAddEditLeaseInABuildingLeaseInfo_form.getFieldValue('ls.ls_id'));
            this.abRepmAddEditLeaseInABuildingSelectSuites_ds.saveRecord(record);
        }
        this.abRepmAddEditLeaseInABuildingSuites_grid.refresh();
        this.abRepmAddEditLeaseInABuildingSelectSuites_grid.closeWindow();
    },


    //'Delete' actions
    abRepmAddEditLeaseInABuildingDocs_grid_onDelete: function(row){
        this.deleteRecord(this.abRepmAddEditLeaseInABuildingDocs_ds, row.getRecord(), this.abRepmAddEditLeaseInABuildingDocs_grid);
    },

    abRepmAddEditLeaseInABuildingContacts_grid_onDelete: function(row){
        this.deleteRecord(this.abRepmAddEditLeaseInABuildingContacts_ds, row.getRecord(), this.abRepmAddEditLeaseInABuildingContacts_grid);
    },

    abRepmAddEditLeaseInABuildingBaseRents_grid_onDelete: function(row){
        this.deleteRecord(this.abRepmAddEditLeaseInABuildingBaseRents_ds, row.getRecord(), this.abRepmAddEditLeaseInABuildingBaseRents_grid);
    },

    abRepmAddEditLeaseInABuildingClauses_grid_onDelete: function(row){
        this.deleteRecord(this.abRepmAddEditLeaseInABuildingClauses_ds, row.getRecord(), this.abRepmAddEditLeaseInABuildingClauses_grid);
    },

    abRepmAddEditLeaseInABuildingOptions_grid_onDelete: function(row){
        this.deleteRecord(this.abRepmAddEditLeaseInABuildingOptions_ds, row.getRecord(), this.abRepmAddEditLeaseInABuildingOptions_grid);
    },

    abRepmAddEditLeaseInABuildingAmendments_grid_onDelete: function(row){
        this.deleteRecord(this.abRepmAddEditLeaseInABuildingAmendments_ds, row.getRecord(), this.abRepmAddEditLeaseInABuildingAmendments_grid);
    },

    abRepmAddEditLeaseInABuildingLiens_grid_onDelete: function(row){
        this.deleteRecord(this.abRepmAddEditLeaseInABuildingLiens_ds, row.getRecord(), this.abRepmAddEditLeaseInABuildingLiens_grid);
    },

    abRepmAddEditLeaseInABuildingEstoppels_grid_onDelete: function(row){
        this.deleteRecord(this.abRepmAddEditLeaseInABuildingEstoppels_ds, row.getRecord(), this.abRepmAddEditLeaseInABuildingEstoppels_grid);
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

    //'View Document' actions
    abRepmAddEditLeaseInABuildingComm_grid_onView: function(row){
        View.showDocument({
            'auto_number': row.getFieldValue('ls_comm.auto_number')
        }, 'ls_comm', 'doc', row.getFieldValue('ls_comm.doc'));
    },

    abRepmAddEditLeaseInABuildingDocs_grid_onView: function(row){
        View.showDocument({
            'doc_id': row.getFieldValue('docs_assigned.doc_id')
        }, 'docs_assigned', 'doc', row.getFieldValue('docs_assigned.doc'));
    },

    abRepmAddEditLeaseInABuildingClauses_grid_onDocument: function(row){
        View.showDocument({
            'resp_id': row.getFieldValue('ls_resp.resp_id'),
            'ls_id': row.getFieldValue('ls_resp.ls_id')
        }, 'ls_resp', 'doc', row.getFieldValue('ls_resp.doc'));
    },

    abRepmAddEditLeaseInABuildingOptions_grid_onDocument: function(row){
        View.showDocument({
            'op_id': row.getFieldValue('op.op_id'),
            'ls_id': row.getFieldValue('op.ls_id')
        }, 'op', 'doc', row.getFieldValue('op.doc'));
    },

    abRepmAddEditLeaseInABuildingAmendments_grid_onDocument: function(row){
        View.showDocument({
            'ls_amend_id': row.getFieldValue('ls_amendment.ls_amend_id')
        }, 'ls_amendment', 'doc', row.getFieldValue('ls_amendment.doc'));
    },

    abRepmAddEditLeaseInABuildingEstoppels_grid_onDocument: function(row){
        View.showDocument({
            'lsestoppel_id': row.getFieldValue('lsestoppel.lsestoppel_id')
        }, 'lsestoppel', 'doc1', row.getFieldValue('lsestoppel.doc1'));
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
    },

	unAssignRoom : function(row){
	    var bl_id = row.getFieldValue('rm.bl_id');
        var fl_id = row.getFieldValue('rm.fl_id');
        var rm_id = row.getFieldValue('rm.rm_id');
        var ls_id = row.getFieldValue('rm.ls_id');
		var me = this;
		try {
            var rmRec = row.getRecord();
            rmRec.setValue('rm.ls_id', '');
            me.abRepmAddEditLeaseInABuildingRm_ds.saveRecord(rmRec);

            me.abRepmAddEditLeaseInABuildingRm_grid.refresh();
        }
        catch (e) {
            var message = String.format(getMessage('error_delete'));
            View.showMessage('error', message, e.message, e.data);
        }

	},

	abRepmAddEditLeaseInABuildingRm_grid_afterRefresh : function(){
		var total = buildTotalRow(this.abRepmAddEditLeaseInABuildingRm_grid);
		this.abRepmAddEditLeaseInABuildingLeaseInfo_form.setFieldValue("ls.area_usable", total);
	},

    abRepmAddEditLeaseInABuildingRm_grid_onDelete: function(row){
		var me = this;
		Ext.MessageBox.confirm('Warning', getMessage("message_confirm_unassignRoom"), function answer(btn){
			if(btn == "yes"){
				me.unAssignRoom(row);
			}
			else{
				return;
			}
		});
    },

	abRepmAddEditLeaseInABuildingRm_grid_onAddNew : function(){

		var bl = this.abRepmAddEditLeaseInABuildingLeaseInfo_form.getFieldValue('ls.bl_id'),
			ls = this.abRepmAddEditLeaseInABuildingLeaseInfo_form.getFieldValue('ls.ls_id'),
			rest = "fl.bl_id = "+makeLiteralOrNull(bl),
			roomRest = "(rm.ls_id not in ("+makeLiteralOrNull(ls)+") or rm.ls_id is NULL)";
			addRoomClbk =  this.addRoomClbk;

		// If the building is CWBMS (Campus Wide Building Mgmt), do not restrict floor
		if (bl == "CWBMS") {
			rest = null;
		}

		View.openDialog('uc-repm-select-room.axvw', null, true, {
			width: 1200,
			height: 600,
			closeButton: false,
			afterInitialDataFetch: function(dialogView){
				var rmpanel = dialogView.panels.get("abRepmAddEditLeaseInABuildingSelectRm_grid");
				dialogView.panels.get("abRepmAddEditLeaseInABuildingSelectFl_grid").refresh(rest);
				rmpanel.addParameter('roomRest',roomRest);
				var btn = rmpanel.actions.get("addRooms").button;
				btn.el.on("click", addRoomClbk(rmpanel));
			}

		});

		this.onclickInit = true;
		//var bl = this.abRepmAddEditLeaseInABuildingLeaseInfo_form.getFieldValue('ls.bl_id'),
		//	ls = this.abRepmAddEditLeaseInABuildingLeaseInfo_form.getFieldValue('ls.ls_id'),
		//	//lsParm = "";
		//	rest = "rm.bl_id = "+makeLiteralOrNull(bl)+"  and (rm.ls_id not in ("+makeLiteralOrNull(ls)+") or rm.ls_id is NULL)";
		//	this.abRepmAddEditLeaseInABuildingSelectRm_grid.addParameter('roomRest',"1=1");

////
		//this.abRepmAddEditLeaseInABuildingSelectRm_grid.refresh(rest);
		//this.abRepmAddEditLeaseInABuildingSelectRm_grid.showInWindow({
		//	width: 800,
		//	height: 600
		//});

	},



	abRepmAddEditLeaseInABuildingHistoryEdit_form_afterRefresh : function(){
		if(this.abRepmAddEditLeaseInABuildingHistoryEdit_form.newRecord === false){
			this.abRepmAddEditLeaseInABuildingHistoryEdit_form.actions.items[0].button.hide();
			 disableForm(this.abRepmAddEditLeaseInABuildingHistoryEdit_form, true);
		}
		else{
			this.abRepmAddEditLeaseInABuildingHistoryEdit_form.actions.items[0].button.show();
			disableForm(this.abRepmAddEditLeaseInABuildingHistoryEdit_form, false);
		}

	},

	abRepmAddEditLeaseInABuildingEstoppelsEdit_form_afterRefresh : function(){
/*		if(this.abRepmAddEditLeaseInABuildingEstoppelsEdit_form.newRecord === false){
			this.abRepmAddEditLeaseInABuildingEstoppelsEdit_form.actions.items[0].button.hide();
			disableForm(this.abRepmAddEditLeaseInABuildingEstoppelsEdit_form, true);
		}
		else{
			this.abRepmAddEditLeaseInABuildingEstoppelsEdit_form.actions.items[0].button.show();
			disableForm(this.abRepmAddEditLeaseInABuildingEstoppelsEdit_form, false);
		}
*/
	},

	addRoomClbk : function(rmpanel){
		var me = abRepmAddEditLeaseInABuilding_ctrl;
		return function(){
			me.onAddRooms(rmpanel);
		};
	},

	addRooms : function(me, rmpanel){
		var selectedRecords = rmpanel.getSelectedRecords();
		for (var i = 0; i < selectedRecords.length; i++) {
            var record = selectedRecords[i];
			record.setValue('rm.ls_id', me.abRepmAddEditLeaseInABuildingLeaseInfo_form.getFieldValue('ls.ls_id'));
			me.abRepmAddEditLeaseInABuildingRm_ds.saveRecord(record);
        }
        me.abRepmAddEditLeaseInABuildingRm_grid.refresh();
		rmpanel.refresh();
		//View.closeDialog();

	},

    onAddRooms: function(rmpanel){
        var me = abRepmAddEditLeaseInABuilding_ctrl,
			selectedRecords = rmpanel.getSelectedRecords(),
			hasLs = false, cmsg = "You have selected room(s) that are already assigned to a lease,";

		cmsg += "continuing will reassign these to the current lease.  Do you want to continue?";

		for (var i = 0; i < selectedRecords.length; i++) {
			if(selectedRecords[i].values['rm.ls_id'] != ""){
				hasLs = true;
				break;
			}
        }

		if(hasLs){
			Ext.MessageBox.confirm('Warning', cmsg, function answer(btn){
				if(btn == "yes"){
					me.addRooms(me, rmpanel);
				}
				else{
					return;
				}
			});
		}
		else{
			me.addRooms(me, rmpanel);

		}
	},

	//2012/02/15 - open lease window
	openLeaseWindow:function()
	{
		var ls_id = this.abRepmAddEditLeaseInABuildingLeaseInfo_form.getFieldValue("ls.ls_id");

		window.open('uc-repm-addedit-lease-in-a-building-print-lease.axvw?handler=com.archibus.config.ActionHandlerDrawing&ls.ls_id='+ls_id, 'newWindow', 'width=400, height=400, resizable=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, copyhistory=no');
	}
});

/**
 * refersh tree panel after save or delete
 * @param {Object} treeNode
 */
function refreshTreePanelAfterUpdate(treeNode){

    abRepmAddEditLeaseInABuilding_ctrl.abRepmAddEditLeaseInABuildingCtryTree.refreshNode(treeNode);
    treeNode.expand();
}



//refresh lease's associated panels
function refreshPanels(ls_id){
    var restriction = new Ab.view.Restriction();
    restriction.addClause("ls.ls_id", ls_id);

    var controller = abRepmAddEditLeaseInABuilding_ctrl;

    controller.abRepmAddEditLeaseInABuildingLeaseInfo_form.refresh(restriction);
    controller.leaseId = ls_id;

    //enable/disable 'landlord_tenant' field if a lease/sublease is selected from the tree

    if (controller.abRepmAddEditLeaseInABuildingCtryTree.lastNodeClicked != null && controller.abRepmAddEditLeaseInABuildingCtryTree.lastNodeClicked.level.levelIndex == 3  && !viewOnly) {
        controller.abRepmAddEditLeaseInABuildingLeaseInfo_form.enableField('ls.landlord_tenant', true);
    }
    else {
        controller.abRepmAddEditLeaseInABuildingLeaseInfo_form.enableField('ls.landlord_tenant', false);
    }


    //controller.abRepmAddEditLeaseInABuildingSuites_grid.refresh(restriction);
    controller.abRepmAddEditLeaseInABuildingDocs_grid.refresh(restriction);
    controller.abRepmAddEditLeaseInABuildingContacts_grid.refresh(restriction);
 //   controller.abRepmAddEditLeaseInABuildingBaseRents_grid.refresh(restriction);
    controller.abRepmAddEditLeaseInABuildingClauses_grid.refresh(restriction);
    controller.abRepmAddEditLeaseInABuildingOptions_grid.refresh(restriction);
    controller.abRepmAddEditLeaseInABuildingAmendments_grid.refresh(restriction);

    controller.abRepmAddEditLeaseInABuildingComm_grid.refresh(restriction);
    controller.abRepmAddEditLeaseInABuildingRm_grid.refresh(restriction);
    controller.abRepmAddEditLeaseInABuildingHistory_grid.refresh(restriction);
    controller.abRepmAddEditLeaseInABuildingLiens_grid.refresh(restriction);
    controller.abRepmAddEditLeaseInABuildingEstoppels_grid.refresh(restriction);

	controller.costs.show(true);

	var div = document.getElementById('detailsTabs_layoutWrapper')
	if (div) {div.style.height = null;}
	var div = document.getElementById('detailsTabs_0').parentNode
	if (div) {div.style.height = null;}

//Restrict the tabs

	var controller_0 = View.controllers.get('mgmtRecurringCost');
	var controller_1 = View.controllers.get('mgmtScheduledCost');
	//var controller_2 = View.controllers.get('mgmtActualCost');
	controller_0.reset();
	controller_1.reset();
	//controller_2.reset();
	var restriction_0 = new Ab.view.Restriction();
	var restriction_1 = new Ab.view.Restriction();
	var restriction_2 = new Ab.view.Restriction();

	controller_0.ls_id = controller.leaseId;
	controller_0.isLease = true;
	controller_1.ls_id = controller.leaseId;
	controller_1.isLease = true;
	//controller_2.ls_id = controller.leaseId;
	//controller_2.isLease = true;
	restriction_0.addClause('cost_tran_recur.ls_id', controller.leaseId , '=');
	restriction_1.addClause('cost_tran_sched.ls_id', controller.leaseId, '=');
	restriction_2.addClause('cost_tran.ls_id', controller.leaseId, '=');

	controller.detailsTabs.showTab('detailsTabs_0',true);
	controller.detailsTabs.showTab('detailsTabs_1',true);
	controller.detailsTabs.showTab('detailsTabs_2',true);

	controller_0.recurringCostGrid.refresh(restriction_0);
	controller_1.scheduledCostGrid.refresh(restriction_1);
	//controller_2.actualCostGrid.refresh(restriction_2);



	controller_0.recurringCostGrid.actions.get("schedule").button.hide();
	controller_1.scheduledCostGrid.actions.get("approve").button.hide();

}


//hide lease's associated panels
function hidePanels(){
    var controller = abRepmAddEditLeaseInABuilding_ctrl;
    controller.abRepmAddEditLeaseInABuildingLeaseInfo_form.show(false);
    controller.abRepmAddEditLeaseInABuildingAddLease_form.show(false);
    controller.abRepmAddEditLeaseInABuildingSuites_grid.show(false);
    controller.abRepmAddEditLeaseInABuildingDocs_grid.show(false);
    controller.abRepmAddEditLeaseInABuildingContacts_grid.show(false);
    controller.abRepmAddEditLeaseInABuildingBaseRents_grid.show(false);
    controller.abRepmAddEditLeaseInABuildingClauses_grid.show(false);
    controller.abRepmAddEditLeaseInABuildingOptions_grid.show(false);
    controller.abRepmAddEditLeaseInABuildingAmendments_grid.show(false);

    controller.abRepmAddEditLeaseInABuildingComm_grid.show(false);
    controller.abRepmAddEditLeaseInABuildingRm_grid.show(false);
    controller.abRepmAddEditLeaseInABuildingHistory_grid.show(false);
    controller.abRepmAddEditLeaseInABuildingLiens_grid.show(false);
    controller.abRepmAddEditLeaseInABuildingEstoppels_grid.show(false);
	controller.costs.show(false);


	View.controllers.get('mgmtRecurringCost').recurringCostGrid.show(false);;
	View.controllers.get('mgmtScheduledCost').scheduledCostGrid.show(false);;
	//View.controllers.get('mgmtActualCost').actualCostGrid.show(false);;

	controller.detailsTabs.showTab('detailsTabs_0',false);
	controller.detailsTabs.showTab('detailsTabs_1',false);
	controller.detailsTabs.showTab('detailsTabs_2',false);
}

//show lease's associated panels
function showDetails(row){
    abRepmAddEditLeaseInABuilding_ctrl.abRepmAddEditLeaseInABuildingAddLease_form.show(false);

    var ls_id = row.restriction.clauses[0].value;

	//add restriction parameter to the contact selection grid..(restrict contacts already added to the selected lease)
	abRepmAddEditLeaseInABuilding_ctrl.abRepmAddEditLeaseInABuildingContactsSelect_grid.addParameter("leaseID", "'"+ls_id+"'")

    refreshPanels(ls_id);
}

function setCustomPeriodForBaseRentsEditPanel(panel){
    if (panel.getFieldValue('cost_tran_recur.period') == 'CUSTOM'  && !viewOnly) {
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
        if (panel.getFieldValue('ls_resp.dates_match_lease') == 0 ) {
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
    Ab.view.View.selectValue('abRepmAddEditLeaseInABuildingSuitesEdit_form', 'Floor Code', ['su.fl_id'], 'fl', ['fl.fl_id'], ['fl.bl_id', 'fl.fl_id', 'fl.name'], 'fl.bl_id = \'' + this.abRepmAddEditLeaseInABuilding_ctrl.abRepmAddEditLeaseInABuildingLeaseInfo_form.getFieldValue("ls.bl_id") + '\'', '', true, false, '', 1000, 500);
}

//leaseSrchFields : ["ls_id", "uclass", "description", "comments" , "ld_name", "ld_contact", "tn_name", "tn_contact"],
//roomSrchFields : ["rm_id", "name", "rm_type_desc"],
var srchFields = {
	leaseSrchFields : ["ls_id", "uclass", "description", "comments" , "ld_name", "ld_contact", "tn_name", "tn_contact", "bl_id", "ls_cat"],
	roomSrchFields : ["rm_id", "name", "rm_cat","rm_type"],
	contactSrchFields : ["contact_id", "name_first", "name_last", "address1" , "address2", "city_id", "state_id", "company", "email", "phone","cellular_number","fax","zip","notes"],
	commSrchFields : ["comm_id", "summary", "recorded_by", "doc"],
	docSrchFields : ["name", "description", "doc"],
	bRentSrchFields : ["description", "cost_cat_id"],
	clauseSrchFields : ["resp_id","clause_type_id", "doc", "reference_loc", "description","contact_id"],
	crchgBackSrchFields : ["comments","cost_cat_id"],
	optSrchFields : ["description","op_id", "exercised_by", "comments"],
	amndSrchFields : ["description", "comments", "exercised_by"],
	histSrchFields : ["change", "description"],
	lienSrchFields : ["description","lien_type"],
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
		for (var i=0; i<fields.length; i++){
			restriction += (restriction !== "") ? " or " : "";

			restriction += fields[i] +" like "+srchValue;
if (fields[i] == "bl_id") {
	//alert(restriction)
	}
		}
	}
	return restriction;
}




function filter(){

    var controller = abRepmAddEditLeaseInABuilding_ctrl;
    var consolePanel = controller.abRepmAddEditLeaseInABuildingConsole;
    var restriction = '';
	// BRG - Add lease subquery restriction
    var lsRestriction = '';

    if (consolePanel.getFieldValue('ls.bl_id')) {
        restriction += " bl.bl_id = '" + consolePanel.getFieldValue('ls.bl_id') + "'";
		lsRestriction += " ls.bl_id = '" + consolePanel.getFieldValue('ls.bl_id') + "'"
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
			//ROOM
			lsRestriction +=  ' or ';
			lsRestriction += "exists (select 1 from rm where rm.bl_id = ls.bl_id and (";
			lsRestriction += getGlobalSearchRest(srchFields.roomSrchFields, searchFieldVal);
			lsRestriction += "))";

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
        restriction += " exists (SELECT 1 FROM ls WHERE ls.bl_id = bl.bl_id and "+lsRestriction+")";
    }




    if (restriction) {
		controller.abRepmAddEditLeaseInABuildingCtryTree.addParameter('consolels', "(" + lsRestriction +  " or exists (select 1 from ls l where l.ls_parent_id=ls.ls_id and " + lsRestriction.replace(/ls\./g,'l.') + "))" );
		controller.abRepmAddEditLeaseInABuildingCtryTree.addParameter('console', restriction);
    }
    else {
        controller.abRepmAddEditLeaseInABuildingCtryTree.addParameter('consolels', ' 1=1 ');
        controller.abRepmAddEditLeaseInABuildingCtryTree.addParameter('console', ' 1=1 ');
    }
	var btn = Ext.getCmp("addEdit")
	btn.hide();
    hidePanels();
    controller.abRepmAddEditLeaseInABuildingAddLease_form.show(false);
    controller.abRepmAddEditLeaseInABuildingCtryTree.refresh();

    controller.abRepmAddEditLeaseInABuildingCtryTree.setTitle(getMessage('tree_panel_title'));
    controller.abRepmAddEditLeaseInABuildingCtryTree.lastNodeClicked = null;
}



function createNewLease(row){

    var controller = abRepmAddEditLeaseInABuilding_ctrl;
    var newLsId = controller.abRepmAddEditLeaseInABuildingAddLease_form.getFieldValue('ls.ls_id');
    var lsParentId = "'" + controller.abRepmAddEditLeaseInABuildingAddLease_form.getFieldValue('ls.ls_parent_id') + "'";
    var blId = (selectedBuilding != "") ? selectedBuilding : controller.abRepmAddEditLeaseInABuildingAddLease_form.getFieldValue('ls.bl_id');
    var lease_sublease = "'" + controller.abRepmAddEditLeaseInABuildingAddLease_form.getFieldValue('ls.lease_sublease') + "'";

    try {
        Workflow.callMethod("AbRPLMLeaseAdministration-LeaseAdministrationService-duplicateLease", newLsId, row['ls.ls_id'], '0', 'building', blId, 'LANDLORD_TENANT', lsParentId, lease_sublease);
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
 * Copy to Contact the location fields of the selected Company
 * @param {Object} fieldName
 * @param {Object} selectedValue
 * @param {Object} previousValue
 */
function afterSelectCompany(fieldName, selectedValue, previousValue, panelConfig){
    var panel = View.panels.get("abRepmAddEditLeaseInABuildingContactsEdit_form");
	mainTable = "contact";
	if(panelConfig){
		panel = panelConfig.panel;
		mainTable = panelConfig.mainTable;
	}

    if (!panel.newRecord)
        return;

    var dsCompany = View.dataSources.get("abRepmAddEditLeaseInABuildingTab_dsCompany");
    var companyRecord = dsCompany.getRecord(new Ab.view.Restriction({
        "company.company": selectedValue
    }));

	if (panel.getFieldValue(mainTable+".company") == "")
        panel.setFieldValue(mainTable+".company", companyRecord.getValue("company.company"));

    if (panel.getFieldValue(mainTable+".address1") == "")
        panel.setFieldValue(mainTable+".address1", companyRecord.getValue("company.address1"));

    if (panel.getFieldValue(mainTable+".address2") == "")
        panel.setFieldValue(mainTable+".address2", companyRecord.getValue("company.address2"));

    if (panel.getFieldValue(mainTable+".city_id") == "")
        panel.setFieldValue(mainTable+".city_id", companyRecord.getValue("company.city_id"));

    if (panel.getFieldValue(mainTable+".ctry_id") == "")
        panel.setFieldValue(mainTable+".ctry_id", companyRecord.getValue("company.ctry_id"));

    if (panel.getFieldValue(mainTable+".regn_id") == "")
        panel.setFieldValue(mainTable+".regn_id", companyRecord.getValue("company.regn_id"));

    if (panel.getFieldValue(mainTable+".state_id") == "")
        panel.setFieldValue(mainTable+".state_id", companyRecord.getValue("company.state_id"));

    if (panel.getFieldValue(mainTable+".zip") == "")
        panel.setFieldValue(mainTable+".zip", companyRecord.getValue("company.zip"));
}
function afterSelectCompanylsContacts (){
	afterSelectCompany({
		panel : View.panels.get("abRepmAddEditLeaseInABuildinglsContactsEdit_form"),
		mainTable : 'ls_contacts'
	});
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
 * afterRefresh event for  'abRepmAddEditLeaseInABuildingLeaseInfo_form' panel
 * @param {Object} panel
 **/
function abRepmAddEditLeaseInABuildingLeaseInfo_form_afterRefresh(panel){
    //setLandlordTenant(panel.fields.items[11]);
    setLandlordTenant(panel.fields.get('ls.landlord_tenant'));

    //loadAcctCode('abRepmAddEditLeaseInABuildingLeaseInfo_form', panel.getFieldValue('ls.ac_id'));
    var bl_risk_num = panel.getFieldValue('bl.bl_risk_num');
    $('ShowabRepmAddEditLeaseInABuildingLeaseInfo_form_ls.bl_id').innerHTML += '</br>Risk Mgmt #: '+bl_risk_num;
}

function abRepmAddEditLeaseInABuildingBaseRentsEdit_form_afterRefresh(panel){
    //loadAcctCode(panel.id, panel.getFieldValue('cost_tran_recur.ac_id'));
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
    var selectedRows = View.panels.get('abRepmAddEditLeaseInABuildingClausesAmntType').getSelectedRows();
    panel = abRepmAddEditLeaseInABuilding_ctrl.abRepmAddEditLeaseInABuildingClausesEdit_form;
    for (i = 0; i < selectedRows.length; i++) {
        var comments = (selectedRows[i]['bl_amenity.comments'])?" - Comments: "+selectedRows[i]['bl_amenity.comments']:"";
        panel.setFieldValue('ls_resp.description', panel.getFieldValue('ls_resp.description') + " Amenity Type: " + selectedRows[i]['bl_amenity.amenity_type'] + comments + ". ");
    }
    View.panels.get('abRepmAddEditLeaseInABuildingClausesAmntType').closeWindow();

}

/**
 * Enable/Disable 'Add Amenity Description' button if Clause Type is/is not 'Amenity'
 * @param {Object} fieldName
 * @param {Object} selectedValue
 * @param {Object} previousValue
 **/
function setAmenityButton(fieldName, selectedValue, previousValue){
    var panel = abRepmAddEditLeaseInABuilding_ctrl.abRepmAddEditLeaseInABuildingClausesEdit_form;
    var clauseType = (selectedValue) ? selectedValue : panel.getFieldValue('ls_resp.clause_type_id');

/*    if (clauseType == 'Amenity') {
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
        var treePanel = abRepmAddEditLeaseInABuilding_ctrl.abRepmAddEditLeaseInABuildingCtryTree;

        refreshTreePanelAfterUpdate(treePanel.lastNodeClicked);
		try {
			selectNewAddedTreeNode(treePanel.lastNodeClicked, form.getFieldValue('ls.ls_id'));
			showDetails(treePanel.lastNodeClicked);
			treePanel.setTitle(getMessage('tree_panel_title'));
		}
		catch (ex) {
			abRepmAddEditLeaseInABuilding_ctrl.abRepmAddEditLeaseInABuildingAddLease_form.show(false);
			var ls_id =form.getFieldValue('ls.ls_id');
			//add restriction parameter to the contact selection grid..(restrict contacts already added to the selected lease)
			abRepmAddEditLeaseInABuilding_ctrl.abRepmAddEditLeaseInABuildingContactsSelect_grid.addParameter("leaseID", "'"+ls_id+"'")

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

    if (!editFormPanel.save()) {
        return false;
    };
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
	var selectedContacts = View.panels.get("abRepmAddEditLeaseInABuildingContactsSelect_grid").getSelectedRecords();
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

	abRepmAddEditLeaseInABuilding_ctrl.abRepmAddEditLeaseInABuildingContacts_grid.refresh();

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
		"ls_contacts.ls_id" :abRepmAddEditLeaseInABuilding_ctrl.leaseId,
		"ls_contacts.contact_id" :contactRecord["contact.contact_id"]
	};

	return record;
}

function showAddButton(level, form){
	var btn = Ext.getCmp("addEdit"),
		lastNodeClicked = abRepmAddEditLeaseInABuilding_ctrl.abRepmAddEditLeaseInABuildingCtryTree.lastNodeClicked;

	if (viewOnly) {
		btn.hide();
		return;
	}
	if(level === "lease"){
		btn.setText("Add Lease");
		btn.show();
	}
	else if(level === "sub"){
		btn.setText("Add Sublease");
		btn.show();
	}
	else{
		btn.hide();
	}

	if(form){

		if(lastNodeClicked.data['ls.landlord_tenant'] == "LANDLORD"){
			btn.hide();
		}
		else{
			btn.show();
		}
	}
}

function addAction(panel, id, config){
	if(config == null){
		return;
	}
	if(panel.actions.get(id) != undefined){
		panel.actions.get(id).setTitle(config.text);
	}else{
		panel.actions.add(id,new Ab.view.Action(panel, config));
	}

}
function clearConsole(){
	//alert(1);
	$('searchField').value = "";

}
function disableForm(pnl, show){
	if(typeof pnl=='string'){pnl=View.panels.get(pnl);}
	for(var i=0,len=pnl.fields.getCount();i<len;i++){
		var fld=pnl.fields.get(i);
		fld.dom.disabled = show;
	}
}

function buildTotalRow (grid) {
		if(typeof grid=='string'){grid=View.panels.get(grid);}
		var totalRoomArea  = 0;
		for (var r = 0, j = grid.rows.length; r < j; r++) {
		    var row = grid.rows[r];
		    if (row['rm.area.raw']) {
			    totalRoomArea  += parseFloat(row['rm.area.raw']);
		    } else {
                totalRoomArea  += parseFloat(row['rm.area']);
		    }
		}

		var last = grid.tableFootElement.lastChild;
			if(last !== null){
				grid.tableFootElement.removeChild(last);
			}
	    // create new grid row and cells containing statistics
		var gridRow = document.createElement('tr');
		grid.tableFootElement.appendChild(gridRow);

		// column 1: 'Totals' title
		var gridCell = document.createElement('th');
		gridCell.innerHTML = 'Total';
		gridRow.appendChild(gridCell);

        // column 2: empty
		gridCell = document.createElement('th');
		gridCell.innerHTML = '&nbsp;';
		gridRow.appendChild(gridCell);

		// column 3: empty
		gridCell = document.createElement('th');
		gridCell.innerHTML = '&nbsp;';
		gridRow.appendChild(gridCell);

		// column 4: empty
		gridCell = document.createElement('th');
		gridCell.innerHTML = '&nbsp;';
		gridRow.appendChild(gridCell);

		// column 5: total room area
		gridCell = document.createElement('th');
		gridCell.innerHTML = totalRoomArea.toFixed(2);
	    gridCell.style.textAlign = 'right';
		gridRow.appendChild(gridCell);

        // column 6: empty
		gridCell = document.createElement('th');
		gridCell.innerHTML = '&nbsp;';
		gridRow.appendChild(gridCell);


		return totalRoomArea.toFixed(2);
	// force the grid panel to reload, so that our function is called
	//grid.reloadGrid();

}