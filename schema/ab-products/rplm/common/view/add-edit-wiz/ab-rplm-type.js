var rplmTypeController = View.createController('rplmType', {
    openerPanel: null,
    openerController: null,
    type: null,
    action: null,
    actionType: null,
    itemId: null,
    itemType: null,
    itemIsOwned: null,
    leaseId: null,
    leaseType: null,
    wizard: null,
    contentDisabled: null,
	afterViewLoad: function(){
		this.buildLabels();
	},
    afterInitialDataFetch: function(){
        if (View.getOpenerView().controllers.get('portfAdminWizard') != undefined) {
            this.openerController = View.getOpenerView().controllers.get('portfAdminWizard');
            this.openerPanel = View.getOpenerView().panels.get('wizardTabs');
        }
        if (View.getOpenerView().controllers.get('leaseAdminWizard') != undefined) {
            this.openerController = View.getOpenerView().controllers.get('leaseAdminWizard');
            this.openerPanel = View.getOpenerView().panels.get('leaseAdminTabs');
        }
        if (this.openerPanel.wizard.getAction() == null) {
            // clean wizard object
            this.openerPanel.wizard.reset()
        }
        this.initVariables(this.openerPanel, this.openerController);
        this.restoreSettings();
		setAction();
        setItems();
    },
    
    
    rplmTypeForm_onContinue: function(){
        if (this.action == null || this.actionType == null) {
            View.showMessage(getMessage('error_noitemselected'));
            return;
        }
        if (this.actionType != this.wizard.getActionType() ||
        (this.actionType == 'this.actionType' && this.itemType != this.wizard.getItemType())) {
            this.wizard.reset();
            for (var i = 1; i < this.openerPanel.tabs.length; i++) {
                this.openerPanel.tabsStatus[this.openerPanel.tabs[i].name] = false;
                this.openerController.setTab(this.openerPanel.tabs[i].name, true, false);
            }
        }
        if (this.action == 'EDIT') {
            if (this.actionType == 'BUILDING' && this.itemId == null) {
                View.showMessage(getMessage('error_edit_nobldgselected'));
                return;
            }
            if (this.actionType == 'LAND' && this.itemId == null) {
                View.showMessage(getMessage('error_edit_nolandselected'));
                return;
            }
            if (this.actionType == 'STRUCTURE' && this.itemId == null) {
                View.showMessage(getMessage('error_edit_nostructureselected'));
                return;
            }
            if (this.actionType == 'LEASE' && this.itemId == null) {
                View.showMessage(getMessage('error_editlease_noitemselected'));
                return;
            }
        }
        if (this.action == 'ADD' && this.actionType == 'LEASE' && this.itemId == null) {
            if (this.itemType == 'LEASE') {
                View.showMessage(getMessage('error_nobldgpropertyselected'));
                return;
            }
            if (this.itemType == 'BUILDING') {
                View.showMessage(getMessage('error_nobldgselected'));
                return;
            }
            if (this.itemType == 'PROPERTY') {
                View.showMessage(getMessage('error_nopropertyselected'));
                return;
            }
        }
        if (this.itemId != null) {
        	this.itemIsOwned = getOwnership(this.itemId, this.itemType);
        }
        this.wizard.setAction(this.action);
        this.wizard.setActionType(this.actionType);
        this.wizard.setItemId(this.itemId);
        this.wizard.setItemType(this.itemType);
        this.wizard.setItemIsOwned(this.itemIsOwned);
        this.wizard.setLeaseId(this.leaseId);
        this.wizard.setLeaseType(this.leaseType);
        this.openerPanel.tabsStatus[this.openerPanel.selectedTabName] = true;
        this.openerController.checkTabs();
        if (this.actionType == 'LEASE') {
            this.openerPanel.tabsStatus['wizardTabs_1'] = true;
            this.openerPanel.tabsStatus['wizardTabs_2'] = true;
            this.openerPanel.tabsStatus['wizardTabs_3'] = true;
            this.openerController.navigateToTab(4);
        }
        else 
            if (this.actionType == 'BUILDING' && this.action == 'EDIT') {
                this.openerController.navigateToTab(2);
            }
            else 
                if ((this.actionType == 'STRUCTURE' || this.actionType == 'LAND') && this.action == 'EDIT') {
                    this.openerController.navigateToTab(3);
                }
                else {
                    this.openerController.navigate('forward');
                }
        
        
    },
    
    initVariables: function(openerPanel, openerController){
        this.openerController = openerController;
        this.openerPanel = openerPanel;
        this.wizard = this.openerPanel.wizard;
        this.type = this.wizard.getType();
        this.action = this.wizard.getAction();
        this.actionType = this.wizard.getActionType();
        this.itemId = this.wizard.getItemId();
        this.itemType = this.wizard.getItemType();
        this.itemIsOwned = this.wizard.getItemIsOwned();
        this.leaseId = this.wizard.getLeaseId();
        this.leaseType = this.wizard.getLeaseType();
        this.contentDisabled = false;//this.openerPanel.tabsStatus[this.openerPanel.selectedTabName];
    },
    
    buildLabels: function(){
        $('radioActionLabel').innerHTML = getMessage('radio_action_label');
        $('radioItemLabel').innerHTML = getMessage('radio_item_label');
		$('actions').options[0].innerHTML = getMessage('actions_opt0_label');
		$('actions').options[1].innerHTML = getMessage('actions_opt1_label');
		$('items').options[0].innerHTML = getMessage('items_opt0_label');
		$('items').options[1].innerHTML = getMessage('items_opt1_label');
		$('items').options[2].innerHTML = getMessage('items_opt2_label');
		$('items').options[3].innerHTML = getMessage('items_opt3_label');
        $('items').options[4].innerHTML = getMessage('items_opt4_label');
    },
    
    restoreSettings: function(){
        /*
         * initialize view and
         * restore saved data in case that user change something without save
         */
        this.removeButtons();
        
        var itemsObj = document.getElementsByName("items");
        var currActionValue = $('currActionValue');
        var currActionItemValue = $('currActionItemValue');
        var currActionItemSelectValue = $('currActionItemSelectValue');
        var currActionItemSelectValueContinueLabel = $('currActionItemSelectValueContinueLabel');
        var selectValueActionLabel = $('selectValueActionLabel');
        
        var btnObject = document.getElementById("btnItem" + itemsObj[0].selectedIndex);
        
        if (this.action == 'ADD') {
            if (this.actionType == 'BUILDING' || this.actionType == 'STRUCTURE' || this.actionType == 'LAND') {
                currActionItemValue.innerHTML = getMessage('continue_label');
            }
            else 
                if (this.actionType == 'LEASE') {
                    currActionItemValue.innerHTML = '&#160;';
                }
            selectValueActionLabel.innerHTML = '&#160;';
            currActionItemSelectValue.innerHTML = '&#160;';
            currActionItemSelectValueContinueLabel.innerHTML = '&#160;';
        }
        
        if (btnObject != undefined) {
            if (this.action == 'EDIT' && this.actionType == 'BUILDING' && btnObject.id == 'btnItem0') {
                selectValueActionLabel.innerHTML = getMessage('select_value_action_label');
                btnObject.style.display = '';
                btnObject.value = getMessage('title_building') + '...';
                currActionItemSelectValue.innerHTML = '&#160;';
                currActionItemSelectValueContinueLabel.innerHTML = '&#160;';
            }
            else 
                if (this.action == 'EDIT' && this.actionType == 'STRUCTURE' && btnObject.id == 'btnItem1') {
                    selectValueActionLabel.innerHTML = getMessage('select_value_action_label');
                    btnObject.style.display = '';
                    btnObject.value = getMessage('title_structure') + '...';
                    currActionItemSelectValue.innerHTML = '&#160;';
                    currActionItemSelectValueContinueLabel.innerHTML = '&#160;';
                }
                else 
                    if (this.action == 'EDIT' && this.actionType == 'LAND' && btnObject.id == 'btnItem2') {
                        selectValueActionLabel.innerHTML = getMessage('select_value_action_label');
                        btnObject.style.display = '';
                        btnObject.value = getMessage('title_land') + '...';
                        currActionItemSelectValue.innerHTML = '&#160;';
                        currActionItemSelectValueContinueLabel.innerHTML = '&#160;';
                    }
                    else 
                        if ( this.actionType == 'LEASE' && this.itemType == 'BUILDING' && btnObject.id == 'btnItem3') {
                            selectValueActionLabel.innerHTML = getMessage('select_value_action_label');
                            btnObject.style.display = '';
                            btnObject.value = getMessage('title_building') + '...';
                            currActionItemSelectValue.innerHTML = '&#160;';
                            currActionItemSelectValueContinueLabel.innerHTML = '&#160;';
                        }
                        else 
                            if (this.actionType == 'LEASE' &&  this.itemType != 'BUILDING' && btnObject.id == 'btnItem4') {
                                selectValueActionLabel.innerHTML = getMessage('select_value_action_label');
                                btnObject.style.display = '';
                                btnObject.value = getMessage('title_lease_on_property') + '...';
                                currActionItemSelectValue.innerHTML = '&#160;';
                                currActionItemSelectValueContinueLabel.innerHTML = '&#160;';
                            }
                            else {
                                btnObject.style.display = 'none';
                            }
            
        }
        
        
        this.showSelection();
    },
    showSelection: function(){
        var currActionItemSelectValue = $('currActionItemSelectValue');
        var currActionItemSelectValueContinueLabel = $('currActionItemSelectValueContinueLabel');
        if ((this.itemId != undefined && this.itemId != null) && (this.itemType != undefined && this.itemType != null)) {
            if (this.itemType == 'BUILDING') {
                currActionItemSelectValue.innerHTML = getMessage('title_building_selected') + ': ' + this.itemId;
                currActionItemSelectValueContinueLabel.innerHTML = getMessage('continue_label');
            }
            else 
                if (this.itemType == 'STRUCTURE') {
                    currActionItemSelectValue.innerHTML = getMessage('title_structure_selected') + ': ' + this.itemId;
                    currActionItemSelectValueContinueLabel.innerHTML = getMessage('continue_label');
                }
                else 
                    if (this.itemType == 'LAND') {
                        currActionItemSelectValue.innerHTML = getMessage('title_land_selected') + ': ' + this.itemId;
                        currActionItemSelectValueContinueLabel.innerHTML = getMessage('continue_label');
                    }
            
        }
        this.openerController.showSelection({
            'action': this.action,
            'type': this.actionType,
            'item': this.itemId,
            'itemType': this.itemType,
            'lease': this.leaseId
        });
    },
    // hide buttons
    removeButtons: function(){
        document.getElementById("btnItem0").style.display = 'none';
        document.getElementById("btnItem1").style.display = 'none';
        document.getElementById("btnItem2").style.display = 'none';
        document.getElementById("btnItem3").style.display = 'none';
        document.getElementById("btnItem4").style.display = 'none';
    }
});

//event listener for clicking on selection buttons
function setItemValue(pTypeL, index, pActionTypeL, restrictByLease){
    var selectedId = rplmTypeController.itemId;
    var action = rplmTypeController.action;
	
    View.openDialog('ab-rplm-bldgproplist.axvw', null, true, {
        width: 800,
        height: 600,
        closeButton: false,
        afterInitialDataFetch: function(dialogView){
            var dialogController = dialogView.controllers.get('abRplmBldgPropList');
            dialogController.selectedType = pTypeL;
            dialogController.selectedId = selectedId;
            dialogController.openerController = rplmTypeController;
            if (pTypeL == 'BUILDING') {
                dialogController.gridBuildingList.show(true, false);
                if(restrictByLease && action == 'EDIT'){
					dialogController.gridBuildingList.addParameter('restricByLease', ' bl.bl_id in (select distinct ls.bl_id from ls)');
				}
				dialogController.gridBuildingList.refresh();
                dialogController.gridBuildingList.setTitle(getMessage('title_building'));
                dialogController.gridPropertyList.show(false, true);
            }
            if (pTypeL == 'LAND' || pTypeL == 'STRUCTURE' || pTypeL == 'PROPERTY') {
                dialogController.gridBuildingList.show(false, true);
                dialogController.gridPropertyList.show(true, false);
				if(restrictByLease && action == 'EDIT'){
					dialogController.gridPropertyList.addParameter('restricByLease', ' property.pr_id in (select distinct ls.pr_id from ls)');
				}
				dialogController.gridPropertyList.refresh();
                if (pTypeL == 'LAND') {
                    dialogController.gridPropertyList.refresh('property.property_type = \'Land\'');
                    dialogController.gridPropertyList.setTitle(getMessage('title_land'));
                }
                if (pTypeL == 'STRUCTURE') {
                    dialogController.gridPropertyList.refresh('property.property_type = \'Structure\'');
                    dialogController.gridPropertyList.setTitle(getMessage('title_structure'));
                }
                if (pTypeL == 'PROPERTY') {
                    dialogController.gridPropertyList.setTitle(getMessage('title_property'));
                }
            }
            dialogController.restoreSelection();
        }
    });
}

function setItem(pTypeL, value){
    var selected = value;
    switch (pTypeL) {
        case 'ACTION':{
        
            var currActionItemValue = $('currActionItemValue');
            var currActionItemSelectValue = $('currActionItemSelectValue');
            var selectValueActionLabel = $('selectValueActionLabel');
            var currActionItemSelectValueContinueLabel = $('currActionItemSelectValueContinueLabel');
            currActionItemValue.innerHTML = '&#160;';
            currActionItemSelectValue.innerHTML = '&#160;';
            selectValueActionLabel.innerHTML = '&#160;';
            currActionItemSelectValueContinueLabel.innerHTML = '&#160;';
            rplmTypeController.action = selected;
            rplmTypeController.itemId = null;
            rplmTypeController.itemIsOwned = null;
            rplmTypeController.leaseId = null;
            rplmTypeController.leaseType = null;
			break;
        }
        case 'ITEM':{
            if (rplmTypeController.actionType != selected) {
                rplmTypeController.actionType = selected;
                rplmTypeController.itemType = selected;
                rplmTypeController.itemId = null;
                rplmTypeController.itemIsOwned = null;
                rplmTypeController.leaseId = null;
                rplmTypeController.leaseType = null;
            }
            break;
        }
        case 'LEASE':{
            rplmTypeController.actionType = 'LEASE';
            if ((selected == 'BUILDING' && rplmTypeController.itemType != 'BUILDING') ||
            (selected == 'PROPERTY' && rplmTypeController.itemType != 'PROPERTY')) {
                rplmTypeController.itemType = selected;
                rplmTypeController.itemId = null;
                rplmTypeController.itemIsOwned = null;
                rplmTypeController.leaseId = null;
                rplmTypeController.leaseType = null;
            }
            break;
        }
    }
    rplmTypeController.restoreSettings();
}

//event listener for selecting an option from "Actions"	combo box
function setAction(){
    if (document.getElementsByName("action")[0].selectedIndex == 0) {
        setItem('ACTION', 'ADD');
    }
    else {
        setItem('ACTION', 'EDIT');
    }
}
//event listener for selecting an option from "Items"	combo box
function setItems(){

    if (document.getElementsByName("items")[0].selectedIndex == 0) {
        setItem('ITEM', 'BUILDING');
    }
    else 
        if (document.getElementsByName("items")[0].selectedIndex == 1) {
            setItem('ITEM', 'STRUCTURE');
        }
        else 
            if (document.getElementsByName("items")[0].selectedIndex == 2) {
                setItem('ITEM', 'LAND');
            }
            else 
                if (document.getElementsByName("items")[0].selectedIndex == 3) {
                    setItem('LEASE', 'BUILDING');
                }
                else 
                    if (document.getElementsByName("items")[0].selectedIndex == 4) {
                        setItem('LEASE', 'PROPERTY');
                    }
    
}

/**
 * check the ownership of an item
 * a datasource is needed for this
 * 	<dataSource id="ds_ownership">
*		<table name="ot" role="main"/>
*		<field table="ot" name="ot_id"/>
*		<field table="ot" name="bl_id"/>
*		<field table="ot" name="pr_id"/>
*		<field table="ot" name="status"/>
*	</dataSource>
*	
 * @param {Object} item
 * @param {Object} type
 */

function getOwnership(item, type){
	var ds = View.dataSources.get('ds_ownership');
	var restriction = new Ab.view.Restriction();
	restriction.addClause('ot.status', 'disposed', '<>');
	if(type.toUpperCase() == 'BUILDING'){
		restriction.addClause('ot.bl_id', item, '=');
	}else if(type.toUpperCase() == 'LAND' || type.toUpperCase() == 'STRUCTURE'){
		restriction.addClause('ot.pr_id', item, '=');
	}
	var records = ds.getRecords(restriction);
	if(typeof(records) ==  "object" && records.length && records.length > 0){
		return true;
	}else{
		return false;
	}
}
