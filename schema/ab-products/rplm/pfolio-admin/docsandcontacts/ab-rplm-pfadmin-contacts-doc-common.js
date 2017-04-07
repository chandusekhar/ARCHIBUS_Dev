var abRplmPfadminContactsDocCommonController = View.createController('abRplmPfadminContactsDocCommonController', {
	items: new Array(),
	afterInitialDataFetch: function(){
		this.initReport();
	},
	initReport: function(){
		var restriction = new Ab.view.Restriction();
		if(this.grid_DocByBldg_bldgs){
			if(this.items.length > 0){
				restriction.addClause('bl.bl_id', this.items, 'IN');
			}
			this.grid_DocByBldg_bldgs.refresh(restriction);
		}else if(this.grid_ContactByBldg_bldgs){
			if(this.items.length > 0){
				restriction.addClause('bl.bl_id', this.items, 'IN');
			}
			this.grid_ContactByBldg_bldgs.refresh(restriction);
		}else if(this.grid_DocByLand_lands){
			if(this.items.length > 0){
				restriction.addClause('property.pr_id', this.items, 'IN');
			}
			this.grid_DocByLand_lands.refresh(restriction);
		}else if(this.grid_ContactByLand_lands){
			if(this.items.length > 0){
				restriction.addClause('property.pr_id', this.items, 'IN');
			}
			this.grid_ContactByLand_lands.refresh(restriction);
		}else if(this.grid_DocByStruc_strucs){
			if(this.items.length > 0){
				restriction.addClause('property.pr_id', this.items, 'IN');
			}
			this.grid_DocByStruc_strucs.refresh(restriction);
		}else  if(this.grid_ContactByStruc_strucs){
			if(this.items.length > 0){
				restriction.addClause('property.pr_id', this.items, 'IN');
			}
			this.grid_ContactByStruc_strucs.refresh(restriction);
		}
	},
	grid_DocByBldg_docs_onView: function(row) {
		View.showDocument({'doc_id':row.getRecord().getValue('docs_assigned.doc_id')}, 'docs_assigned', 'doc', row.getRecord().getValue('docs_assigned.doc'));
	},
	grid_DocByLand_docs_onView: function(row) {
		View.showDocument({'doc_id':row.getRecord().getValue('docs_assigned.doc_id')}, 'docs_assigned', 'doc', row.getRecord().getValue('docs_assigned.doc'));
	},
	grid_DocByStruc_docs_onView: function(row) {
		View.showDocument({'doc_id':row.getRecord().getValue('docs_assigned.doc_id')}, 'docs_assigned', 'doc', row.getRecord().getValue('docs_assigned.doc'));
	}
})


function showDocDetails(type, pkPanel, frmPanel, listPanel){
	showDetails(type, pkPanel, frmPanel, listPanel, 'doc');
}

function showContactDetails(type, pkPanel, frmPanel, listPanel){
	showDetails(type, pkPanel, frmPanel, listPanel, 'contact');
}

/**
 * 
 * @param {Object} type Values in "bldg","land"
 * @param {Object} pkPanel
 * @param {Object} frmPanel
 * @param {Object} listPanel
 * @param {Object} showWhat Values in "contact","doc"
 */
function showDetails(type, pkPanel, frmPanel, listPanel, showWhat){
	var objPkPanel = View.panels.get(pkPanel);
	var objFrmPanel = View.panels.get(frmPanel);
	var objListPanel = View.panels.get(listPanel);
	var selectedIndex = objPkPanel.selectedRowIndex;
	var row = objPkPanel.gridRows.get(selectedIndex);
	var pkField = '';
	var photoKey = '';
	var formRestr = null;
	var contactsRestr = null;
	var docsRestr = null;
	
	if(type == 'bldg'){
		pkField = 'bl.bl_id';
		var selectedId = row.getFieldValue(pkField);
		formRestr = new Ab.view.Restriction({'bl.bl_id': selectedId});
		photoKey = 'bl.bldg_photo';
		contactsRestr = new Ab.view.Restriction({'contact.bl_id': selectedId});
		docsRestr = new Ab.view.Restriction({'docs_assigned.bl_id': selectedId});
	}else if(type == 'land'){
		pkField = 'property.pr_id';
		var selectedId = row.getFieldValue(pkField);
		formRestr = new Ab.view.Restriction({'property.pr_id': selectedId});
		photoKey = 'property.prop_photo';
		contactsRestr = new Ab.view.Restriction({'contact.pr_id': selectedId});
		docsRestr = new Ab.view.Restriction({'docs_assigned.pr_id': selectedId});
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
	
	// show bldg/land's contacts or documents
	if(showWhat == 'contact') {
		objListPanel.refresh(contactsRestr);
	}
	else if(showWhat == 'doc') {
		objListPanel.refresh(docsRestr);
	}
}

