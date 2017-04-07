/**
 * Controller for the entire [Track Employee Work Categories] view
 */
var abEhsTrackEmWorkCategoriesCtrl = View.createController('abEhsTrackEmWorkCategoriesCtrl', {
	workCategoryRestriction: null,	

	afterInitialDataFetch: function(){
		this.hideTabs();
	},
	
	/**
	 * On filter event handler.
	 */
	abEhsTrackEmWorkCategories_panelFilter_onFilter: function(){
		var emId = this.abEhsTrackEmWorkCategories_panelFilter.getFieldValue('em.em_id');
		
		if(!validateFilter("abEhsTrackEmWorkCategories_panelFilter") || !validateEmId(emId)){
			return;
		}
		
		var restriction = new Ab.view.Restriction({"em.em_id": emId});
		
		this.abEhsTrackEmWorkCategories_panelWorkCategories.refresh(restriction);
		this.hideTabs();
		
	},
	
	hideTabs: function(){
		// hide the panels in tabs
		this.abEhsTrackEmWorkCategories_formAssignWCat.show(false);
		this.abEhsTrackEmWorkCategories_panelWCatTraining.show(false);
		this.abEhsTrackEmWorkCategories_panelWCatPpe.show(false);
		this.abEhsTrackEmWorkCategories_panelWCatMedical.show(false);
		
		// hide the tabs
		this.abEhsTrackEmWorkCategories_tabs.hideTab("abEhsTrackEmWorkCategories_tab0");
		this.abEhsTrackEmWorkCategories_tabs.hideTab("abEhsTrackEmWorkCategories_tab1");
		this.abEhsTrackEmWorkCategories_tabs.hideTab("abEhsTrackEmWorkCategories_tab2");
		this.abEhsTrackEmWorkCategories_tabs.hideTab("abEhsTrackEmWorkCategories_tab3");
	},
	
	selectGridRows: function(gridId){
		View.panels.get(gridId).selectAll(true);
		
		// check the Check All checkbox
        var checkAllEl = Ext.get(gridId + '_checkAll');
        if (valueExists(checkAllEl)) {
            checkAllEl.dom.checked = true;
        }
	},
	
	/**
	 * Opens the panel with id = [panelId] in a popup, passing the employee restriction
	 * (for "See existing ..." buttons)
	 */
	openPopupForEmployee: function(panelId){
		var panel = View.panels.get(panelId);
		panel.showInWindow({});
		panel.refresh(this.abEhsTrackEmWorkCategories_panelWorkCategories.restriction);
	},
	
	/**
	 * Opens the Assign xxx to Employee popup.
	 * panelId: panel id of the selected items
	 * keyFieldId: primary key of the selected items
	 * itemType: "training"/"ppe"/"medicalMonitoring"
	 */
	assignItemsToEmployee: function(panelId, keyFieldId, itemType){
		var panel = View.panels.get(panelId);
		var emId = this.abEhsTrackEmWorkCategories_formAssignWCat.getFieldValue("work_categories_em.em_id");
		var arrayElementsType = itemType == "medicalMonitoring" ? 'integer' : 'string';
		var selectedItemIds = getKeysForSelectedRows(panel, keyFieldId, arrayElementsType);
		if(selectedItemIds.length == 0){
			View.showMessage(getMessage('errNoItemSelected'));
			return;
		}
		
		View.openDialog('ab-ehs-track-em-work-categories-assign.axvw', null, false, { 
		    width: 600, 
		    height: 400, 
			itemIdsToAssign: selectedItemIds,
			itemType: itemType,
			emId: emId
		});
	},
	
	abEhsTrackEmWorkCategories_formAssignWCat_afterRefresh: function(){
		this.workCategoryRestriction = new Ab.view.Restriction();
		var workCategId = this.abEhsTrackEmWorkCategories_formAssignWCat.getFieldValue('work_categories_em.work_category_id');
		if(workCategId){
			this.workCategoryRestriction.addClause('work_categories_em.work_category_id', workCategId);
		}
	},
	
	abEhsTrackEmWorkCategories_formAssignWCat_beforeSave: function(){
		var dateStart = this.abEhsTrackEmWorkCategories_formAssignWCat.getFieldValue("work_categories_em.date_start");
		var dateEnd = this.abEhsTrackEmWorkCategories_formAssignWCat.getFieldValue("work_categories_em.date_end");
		if(valueExistsNotEmpty(dateEnd) && dateStart>dateEnd){
			View.showMessage(getMessage("dateError"));
			return false;
		}
		return true;
	}
});
