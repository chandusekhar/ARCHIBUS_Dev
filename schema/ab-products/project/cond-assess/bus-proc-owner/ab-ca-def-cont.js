/**
 * @author Cristina Moldovan
 * 07/15/2009
 * @Author Valentina Sandu
 * 11/02/2016
 */

/*
 * This method is called by the tree control for each new tree node created from the data.
 *
 */
function afterGeneratingTreeNode(treeNode){
	//set restriction for level 0 nodes of the tree
    if (treeNode.level.levelIndex == 0) {
    	var record = new Ab.data.Record(treeNode.data);
    	var rawValue = record.getValue('contact.contact_type');
    	treeNode.restriction.addClause('contact.contact_type', rawValue);
    }
}


var defContCtrl = View.createController('defContCtrl',{
	/**
	 *  insert /update contact
	 */
	contactDetailsPanel_onSave: function(){
		var newContactType = this.contactDetailsPanel.getFieldValue("contact.contact_type");
		if (this.contactDetailsPanel.save()) {
			this.expandNode(newContactType);
		}
	},
	
	/**
	 * Filter records based on selected filter
	 */
	abContactsFilterConsole_onFilter: function(){
		var restriction = new Ab.view.Restriction();
		var filterConsole = this.abContactsFilterConsole;
		
		var contactId = [];
		if(filterConsole.hasFieldMultipleValues('contact.contact_id')){
			contactId = filterConsole.getFieldMultipleValues('contact.contact_id');
			restriction.addClause('contact.contact_id', contactId, 'IN');
		}else if(valueExistsNotEmpty(filterConsole.getFieldValue('contact.contact_id'))){
			contactId = filterConsole.getFieldValue('contact.contact_id');
			restriction.addClause('contact.contact_id', contactId, '=');
		}
		
		var contactType;
		if(valueExistsNotEmpty(filterConsole.getFieldValue('contact.contact_type'))){
			contactType = filterConsole.getFieldValue('contact.contact_type');
			restriction.addClause('contact.contact_type', contactType, ' = ');
		}
		
		var company = [];
		if(filterConsole.hasFieldMultipleValues('contact.company')){
			company = filterConsole.getFieldMultipleValues('contact.company');
			restriction.addClause('contact.company', company, ' IN ');
				
		}else if(valueExistsNotEmpty(filterConsole.getFieldValue('contact.company'))){
			company = filterConsole.getFieldValue('contact.company');
			restriction.addClause('contact.company', company, ' = ');
		}
		
		var ctryId = [];
		if(filterConsole.hasFieldMultipleValues('contact.ctry_id')){
			ctryId = filterConsole.getFieldMultipleValues('contact.ctry_id');
			restriction.addClause('contact.ctry_id', ctryId, ' IN ');
			
		}else if(valueExistsNotEmpty(filterConsole.getFieldValue('contact.ctry_id'))){
			ctryId = filterConsole.getFieldValue('contact.ctry_id');
			restriction.addClause('contact.ctry_id', ctryId, ' = ');
		}
		
		var regnId = [];
		if(filterConsole.hasFieldMultipleValues('contact.regn_id')){
			regnId = filterConsole.getFieldMultipleValues('contact.regn_id');
			restriction.addClause('contact.regn_id', regnId, ' IN ');
			
		}else if(valueExistsNotEmpty(filterConsole.getFieldValue('contact.regn_id'))){
			regnId = filterConsole.getFieldValue('contact.regn_id');
			restriction.addClause('contact.regn_id', regnId, ' = ');
		}
		
		
		var stateId = [];
		if(filterConsole.hasFieldMultipleValues('contact.state_id')){
			stateId = filterConsole.getFieldMultipleValues('contact.state_id');
			restriction.addClause('contact.state_id', stateId, ' IN ');
			
		}else if(valueExistsNotEmpty(filterConsole.getFieldValue('contact.state_id'))){
			stateId = filterConsole.getFieldValue('contact.state_id');
			restriction.addClause('contact.state_id', stateId, ' = ');
		}
		
		var cityId = [];
		if(filterConsole.hasFieldMultipleValues('contact.city_id')){
			cityId = filterConsole.getFieldMultipleValues('contact.city_id');
			restriction.addClause('contact.city_id', cityId.join("','"), ' IN ');
			
		}else if(valueExistsNotEmpty(filterConsole.getFieldValue('contact.city_id'))){
			cityId = filterConsole.getFieldValue('contact.city_id');
			restriction.addClause('contact.city_id', cityId, ' = ');
		}
		
		this.contactsTreeLevel1.refresh(restriction);
		this.contactDetailsPanel.show(false);
		
	},
	
	expandNode: function(newContactType){
		var expandedContactTypes = this.getExpadedContactTypes();
		this.contactsTreeLevel1_onRefresh();
		this.expandNodesByContactType(expandedContactTypes);
		var newNode = this.getNodeByContactType(newContactType);
		if(newNode!=null){
			this.contactsTreeLevel1.expandNode(newNode);
		}
	},
	
	getNodeByContactType: function(contactType){
		var node = null;
		for (var i=0; i<this.contactsTreeLevel1._nodes.length; i++){
			var nodeContactType = this.contactsTreeLevel1._nodes[i].data["contact.contact_type"];
			if(contactType == nodeContactType){
				node = this.contactsTreeLevel1._nodes[i];
				break;
			}
		}
		return node;
	},

	getExpadedContactTypes: function(){
		var expandedContactTypes = new Array();
		for (var i=0; i<this.contactsTreeLevel1._nodes.length; i++){
			if(this.contactsTreeLevel1._nodes[i].expanded){
				expandedContactTypes[i] = this.contactsTreeLevel1._nodes[i].data["contact.contact_type"];
			}
		}
		return expandedContactTypes;
	},
	
	expandNodesByContactType: function(expandedContactTypes){
		for (var i=0; i<expandedContactTypes.length; i++){
			var node = this.getNodeByContactType(expandedContactTypes[i]);
			if(valueExistsNotEmpty(node)){
				this.contactsTreeLevel1.expandNode(node);
			}
		}
	},

	contactDetailsPanel_onDelete: function() {
        var controller = this;
		var dataSource = this.dsContactDetails;
		var record = this.contactDetailsPanel.getRecord();
        var primaryFieldValue = record.getValue("contact.contact_id");
        if (!primaryFieldValue) {
            return;
        }
		var objTree = controller.contactsTreeLevel1;
		
        var confirmMessage = getMessage("messageConfirmDelete").replace('{0}', primaryFieldValue);
        View.confirm(confirmMessage, function(button){
            if (button == 'yes') {
                try {
                	dataSource.deleteRecord(record);
					controller.contactDetailsPanel.show(false);
					controller.contactsTreeLevel1.lastNodeClicked = objTree.lastNodeClicked.parent;
					controller.contactsTreeLevel1.expandNode(objTree.lastNodeClicked);
                } 
                catch (e) {
                    var errMessage = getMessage("errorDelete").replace('{0}', primaryFieldValue);
                    View.showMessage('error', errMessage, e.message, e.data);
                    return;
                }
            }
        })
	},
	contactsTreeLevel1_onRefresh: function(){
		this.contactDetailsPanel.show(false);
        this.contactsTreeLevel1.refresh();
	}
})
