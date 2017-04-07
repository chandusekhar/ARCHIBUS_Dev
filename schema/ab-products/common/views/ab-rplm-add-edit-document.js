var addEditDocController = View.createController('addEditDoc',{
	docId:null,
	itemId:null,
	itemType:null,
	refreshPanels:new Array(),
	addEditDoc_onSave: function(){
		if(!validateFields(this.addEditDoc)){
			return;
		}
		var record = null;
		if(this.docId == null){
			record = new Ab.data.Record({
				'docs_assigned.name': this.addEditDoc.getFieldValue('docs_assigned.name'),
				'docs_assigned.description': this.addEditDoc.getFieldValue('docs_assigned.description'),
				'docs_assigned.ls_id':(this.itemType == 'LEASE'?this.itemId:null),
				'docs_assigned.bl_id':(this.itemType == 'BUILDING'?this.itemId:null),
				'docs_assigned.pr_id':((this.itemType == 'LAND' ||this.itemType == 'STRUCTURE')?this.itemId:null),
				'docs_assigned.classification':this.addEditDoc.getFieldValue('docs_assigned.classification')
			}, true);
			this.dsAddEditDoc.saveRecord(record);
			var restriction  = new Ab.view.Restriction();
			restriction.addClause('docs_assigned.name', record.getValue('docs_assigned.name'), '=');
			restriction.addClause('docs_assigned.description', record.getValue('docs_assigned.description'), '=');
			restriction.addClause('docs_assigned.doc', '', 'IS NULL');
			
			switch(this.itemType){
				case 'LEASE':{
					restriction.addClause('docs_assigned.ls_id', record.getValue('docs_assigned.ls_id'), '=');
					break
				}
				case 'BUILDING':{
					restriction.addClause('docs_assigned.bl_id', record.getValue('docs_assigned.bl_id'), '=');
					break;
				}
				case 'LAND': {
					restriction.addClause('docs_assigned.pr_id', record.getValue('docs_assigned.pr_id'), '=');
					break;
				}
				case 'STRUCTURE': {
					restriction.addClause('docs_assigned.pr_id', record.getValue('docs_assigned.pr_id'), '=');
					break;
				}
			}
			this.docId = this.dsAddEditDoc.getRecord(restriction).getValue('docs_assigned.doc_id');
		}else{
			record = this.addEditDoc.getRecord();
			record.setValue('docs_assigned.name', this.addEditDoc.getFieldValue('docs_assigned.name'));
			record.setValue('docs_assigned.classification', this.addEditDoc.getFieldValue('docs_assigned.classification'));
			record.setValue('docs_assigned.description', this.addEditDoc.getFieldValue('docs_assigned.description'));
			this.dsAddEditDoc.saveRecord(record);
		}	
		
		if (valueExists(View.parameters.callback)) {
			View.parameters.callback.call();
		}
		
		for(var i=0;i<this.refreshPanels.length;i++){
			View.getOpenerView().panels.get(this.refreshPanels[i]).refresh(View.getOpenerView().panels.get(this.refreshPanels[i]).restriction);
		}
		this.addEditDoc.refresh({'docs_assigned.doc_id':this.docId}, false);
		//View.closeThisDialog();
	},
	addEditDoc_onCancel: function(){
		if (valueExists(View.parameters.callback)) {
			View.parameters.callback.call();
		}
		for(var i=0;i<this.refreshPanels.length;i++){
			View.getOpenerView().panels.get(this.refreshPanels[i]).refresh(View.getOpenerView().panels.get(this.refreshPanels[i]).restriction);
		}
		View.closeThisDialog();
	}
})

function validateFields(form){
	/*
	 * check document name
	 */
	if(form.getFieldValue('docs_assigned.name')== null ||
		form.getFieldValue('docs_assigned.name')==''){
		View.showMessage(getMessage('error_docname_empty'));	
		return (false);
	}
	/*
	 * check document description seems to be mandatory
	 */
	if(form.getFieldValue('docs_assigned.description')== null ||
		form.getFieldValue('docs_assigned.description')==''){
		View.showMessage(getMessage('error_docdescription_empty'));	
		return (false);
	}
	
	return (true);
}
