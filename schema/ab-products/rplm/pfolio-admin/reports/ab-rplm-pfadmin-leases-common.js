var abRplmPfadminLeasesCommonController = View.createController('abRplmPfadminLeasesCommonController', {
	items:new Array(),
	afterViewLoad: function(){
		if(this.grid_LeaseByLand_leases) {
			this.grid_LeaseByLand_leases.originalCreateCellContent = this.grid_LeaseByLand_leases.createCellContent;
			this.grid_LeaseByLand_leases.createCellContent = this.grid_LeaseByLandStruc_leases_createCellContent;
		}
		if(this.grid_LeaseByStruc_leases) {
			this.grid_LeaseByStruc_leases.originalCreateCellContent = this.grid_LeaseByStruc_leases.createCellContent;
			this.grid_LeaseByStruc_leases.createCellContent = this.grid_LeaseByLandStruc_leases_createCellContent;
		}
		if(this.grid_LsSuByBldg_leases) {
			this.grid_LsSuByBldg_leases.originalCreateCellContent = this.grid_LsSuByBldg_leases.createCellContent;
			this.grid_LsSuByBldg_leases.createCellContent = this.grid_LeaseByLandStruc_leases_createCellContent;
		}
	},
	afterInitialDataFetch: function(){
		this.initReport();
	},
	initReport: function(){
		var restriction = new Ab.view.Restriction();
		if(this.grid_LeaseByLand_leases) {
			if(this.items.length > 0){
				restriction.addClause('property.pr_id', this.items, 'IN');
			}
			this.grid_LeaseByLand_lands.refresh(restriction);
		}
		if(this.grid_LeaseByStruc_leases) {
			if(this.items.length > 0){
				restriction.addClause('property.pr_id', this.items, 'IN');
			}
			this.grid_LeaseByStruc_strucs.refresh(restriction);
		}
		if(this.grid_LsSuByBldg_leases) {
			if(this.items.length > 0){
				restriction.addClause('bl.bl_id', this.items, 'IN');
			}
			this.grid_LsSuByBldg_bldgs.refresh(restriction);
		}
	},
	grid_LeaseByLandStruc_leases_createCellContent: function(row, col, cell){
	    this.originalCreateCellContent(row, col, cell);
		
		if(col.id != 'ls.status')
			return;

	    var value = row[col.id];
		switch(value){
			case getMessage('status_pipeline_landlord'):{
				cell.style.backgroundColor = '#FFFF00';
				break;
			}
			case getMessage('status_pipeline_tenant'):{
				cell.style.backgroundColor = '#FF0000';
				break;
			}
			case getMessage('status_landlord'):{
				cell.style.backgroundColor = '#00FF7F';
				break;
			}
			case getMessage('status_tenant'):{
				cell.style.backgroundColor = '#ADD8E6';
				break;
			}
		}
	}
})

function showLeaseAndSuiteDetails(){
	showLeaseDetails('bldg', 'grid_LsSuByBldg_bldgs', 'form_LsSuByBldg_bldg', 'grid_LsSuByBldg_leases');

	var objPkPanel = View.panels.get('grid_LsSuByBldg_bldgs');
	var objListPanel = View.panels.get('grid_LsSuByBldg_areaUsed');
	var selectedIndex = objPkPanel.selectedRowIndex;
	var row = objPkPanel.gridRows.get(selectedIndex);
	var pkField = '';
	var suitesRestr = null;
	
	pkField = 'bl.bl_id';
	var selectedId = row.getFieldValue(pkField);

	objListPanel.addParameter('bl_id', selectedId);
	objListPanel.addParameter('areaTypeManual', getMessage("area_type_manual"));
	objListPanel.addParameter('areaTypeUsable', getMessage("area_type_usable"));
	objListPanel.refresh();

	objListPanel = View.panels.get('grid_LsSuByBldg_areaUsedDetails');
	objListPanel.refresh(new Ab.view.Restriction({'su.bl_id': selectedId}));
	
	objListPanel = View.panels.get('grid_LsSuByBldg_areaUsedOth');
	objListPanel.addParameter('bl_id', selectedId);
	objListPanel.addParameter('areaTypeManual', getMessage("area_type_manual"));
	objListPanel.addParameter('areaTypeUsable', getMessage("area_type_usable"));
	objListPanel.refresh();
	
	objListPanel = View.panels.get('grid_LsSuByBldg_areaUsedOthDetails');
	objListPanel.refresh(new Ab.view.Restriction({'su.bl_id': selectedId}));
}

function showLeaseDetails(type, pkPanel, frmPanel, listPanel){
	showDetails(type, pkPanel, frmPanel, listPanel);
}

/**
 * 
 * @param {Object} type Values in "bldg","land"
 * @param {Object} pkPanel
 * @param {Object} frmPanel
 * @param {Object} listPanel
 */
function showDetails(type, pkPanel, frmPanel, listPanel){
	var objPkPanel = View.panels.get(pkPanel);
	var objFrmPanel = View.panels.get(frmPanel);
	var objListPanel = View.panels.get(listPanel);
	var selectedIndex = objPkPanel.selectedRowIndex;
	var row = objPkPanel.gridRows.get(selectedIndex);
	var pkField = '';
	var photoKey = '';
	var formRestr = null;
	var leasesRestr = null;
	
	if(type == 'bldg'){
		pkField = 'bl.bl_id';
		var selectedId = row.getFieldValue(pkField);
		formRestr = new Ab.view.Restriction({'bl.bl_id': selectedId});
		photoKey = 'bl.bldg_photo';
		leasesRestr = new Ab.view.Restriction({'ls.bl_id': selectedId});
	}else if(type == 'land'){
		pkField = 'property.pr_id';
		var selectedId = row.getFieldValue(pkField);
		formRestr = new Ab.view.Restriction({'property.pr_id': selectedId});
		photoKey = 'property.prop_photo';
		leasesRestr = new Ab.view.Restriction({'ls.pr_id': selectedId});
	}

	// show details of the bldg / land ...
	objFrmPanel.addParameter('statusOwned', getMessage('opt_status_owned'));
	objFrmPanel.addParameter('statusLeased', getMessage('opt_status_leased'));
	objFrmPanel.addParameter('statusNeither', getMessage('opt_status_neither'));
	objFrmPanel.refresh(formRestr, false);
	
	// show photo of the bldg / land ...
	if(valueExistsNotEmpty(objFrmPanel.getFieldValue(photoKey))){
		objFrmPanel.showImageDoc('image_field', pkField, photoKey);
	}else{
		objFrmPanel.fields.get('image_field').dom.src = null;
		objFrmPanel.fields.get('image_field').dom.alt = getMessage('text_no_image');
	}
	
	// show bldg/land's leases
	objListPanel.addParameter('statusPipelineLandlord', getMessage('status_pipeline_landlord'));
	objListPanel.addParameter('statusPipelineTenant', getMessage('status_pipeline_tenant'));
	objListPanel.addParameter('statusLandlord', getMessage('status_landlord'));
	objListPanel.addParameter('statusTenant', getMessage('status_tenant'));
	objListPanel.refresh(leasesRestr);
}
