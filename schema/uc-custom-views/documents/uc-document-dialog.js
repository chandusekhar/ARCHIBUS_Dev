var docsViewController = View.createController('docsViewController', {

	
	afterInitialDataFetch:function(){
		if (View.parameters.docPkeyLabel.length < 1){
			this.doc_form.showField("uc_docs_extension.pkey",false);
		}
		
		setInterval(function() {docsViewController.formFocus(); }, 500);
	
	},
	
	formFocus :function() {
		me=this;

		var el =Ext.get('doc_form_uc_docs_extension.doc_name_showDocument')
		if(this.doc_form.getFieldValue("uc_docs_extension.doc_name") !="" && el.isDisplayed() && this.doc_form.actions.get('save').button.hidden ) {
			el =Ext.get('doc_form_uc_docs_extension.doc_name_lockDocument')
			el.setDisplayed(false)	
			el.dom.style.visibility = 'hidden'
			me.doc_form.actions.get("load").setTitle( Ab.view.Action.CHEVRON +  "New Version")
			me.doc_form.actions.get('load').show(View.parameters.docEdit)
			me.doc_form.actions.get('save').show(View.parameters.docEdit)
			me.doc_form.actions.get('show').show(true)
			me.doc_form.actions.get('save').hidden = false
		}
		else if(this.doc_form.getFieldValue("uc_docs_extension.doc_name") =="" && !el.isDisplayed() && ! this.doc_form.actions.get('save').button.hidden ) {
			me.doc_form.actions.get("load").setTitle( Ab.view.Action.CHEVRON +  "Add Doc")
			me.doc_form.actions.get('load').show(View.parameters.docEdit)
			me.doc_form.actions.get('save').show(false)
			me.doc_form.actions.get('show').show(false)
			me.doc_form.actions.get('save').hidden = true
		}	
	},
	doc_form_afterRefresh: function() {
		if (View.parameters.docTitle) {this.doc_form.setTitle(View.parameters.docTitle);}
		if (!View.parameters.docShowTable) {
			this.doc_form.showField("afm_tbls.title",false);
		}
		else {
			var t = UC.Data.getDataRecord('afm_tbls', ['afm_tbls.title'], "table_name='"+View.parameters.docTable+"'");
			if (t != null) {
				this.doc_form.setFieldValue("afm_tbls.title",t['afm_tbls.title'].l);
			}
		}
	
		if (this.doc_form.getFieldValue("uc_docs_extension.doc_name") =="" || this.doc_form.newRecord){
			if (this.doc_form.newRecord){
				this.doc_form.setFieldValue("uc_docs_extension.table_name",View.parameters.docTable);
				this.doc_form.setFieldValue("uc_docs_extension.pkey",View.parameters.docPkey);
			}
			else if(this.doc_form.getFieldValue("uc_docs_extension.doc_name") =="") {
				this.doc_form.actions.get('load').show(View.parameters.docEdit)
			}
			this.doc_form.actions.get('save').show(false)
			this.doc_form.actions.get('show').show(false)
			this.doc_form.actions.get('save').button.hidden = true
			this.doc_form.actions.get("load").setTitle( Ab.view.Action.CHEVRON +  "Add Doc")
		}			
		else {
			this.doc_form.actions.get("load").setTitle( Ab.view.Action.CHEVRON +  "New Version")
			this.doc_form.actions.get('load').show(View.parameters.docEdit)
			this.doc_form.actions.get('save').show(View.parameters.docEdit)
			this.doc_form.actions.get('show').show(true)
			 this.doc_form.actions.get('save').button.hidden = !View.parameters.docEdit
		}
		//if (View.parameters.docPkeyLabel) {
		//if (View.parameters.docPkeyLabel.length > 0){
			for (var j = 0; j < View.parameters.docPkeyLabel.length; j=j+2) { 
				if (View.parameters.docPkeyLabel[j] == this.doc_form.getFieldValue("uc_docs_extension.table_name")) {
					
					this.doc_form.setFieldLabel("uc_docs_extension.pkey",View.parameters.docPkeyLabel[j+1]);
					j= View.parameters.docPkeyLabel.length;
				}
			}
		//}
		//else {
		//	this.doc_form.showField("uc_docs_extension.pkey",false);
		//}
		
		if (this.doc_form.fields.get('uc_docs_extension.doc_name').actions.get('doc_form_uc_docs_extension.doc_name_lockDocument')) { 
			//this.doc_form.fields.get('uc_docs_extension.doc_name').actions.get('doc_form_uc_docs_extension.doc_name_lockDocument').button.hide()
			var el =Ext.get('doc_form_uc_docs_extension.doc_name_lockDocument')
			el.setDisplayed(false)
			el.dom.style.visibility = 'hidden'
			//this.doc_form.fields.get('uc_docs_extension.doc_name').actions.get('doc_form_uc_docs_extension.doc_name_lockDocument').show(false)

		}
	},
	doc_form_onDoctype: function(){
		View.selectValue("doc_form", 'Document Type',['uc_docs_extension.doc_type_code'], 
	                  'uc_doc_type', [ 'uc_doc_type.doc_type_code'], 
					  ['uc_doc_type.doc_type_code', 'uc_doc_type.description'],
					  "uc_doc_type.status='A' and uc_doc_type.table_name='" + View.parameters.docTable + "'", null, false);
	},
	doc_form_onClose: function(){
		if(this.doc_form.getFieldValue("uc_docs_extension.doc_name") =="" && View.parameters.docEdit && !this.doc_form.isNew) {
			if (!confirm("No Document has been uploaded, do you want to continue Closing this dialog?")){
				return;
			}
			var record = this.doc_form.getRecord();
			var ds = this.doc_form.getDataSource()
			ds.deleteRecord(record); 
			
		}
		if (View.parameters != null) {View.parameters.callback();}
		View.closeThisDialog()
		
	},
	doc_form_onLoad: function(){
		var isnew = this.doc_form.newRecord
		if (this.doc_form.save()){
			if (View.parameters != null) {View.parameters.callback();}
			if (isnew || this.doc_form.getFieldValue("uc_docs_extension.doc_name") == "") {
				this.doc_form.fields.get('uc_docs_extension.doc_name').actions.get('doc_form_uc_docs_extension.doc_name_checkInNewDocument').button.dom.onclick()
			}
			else {
				this.doc_form.fields.get('uc_docs_extension.doc_name').actions.get('doc_form_uc_docs_extension.doc_name_checkInNewDocumentVersion').button.dom.onclick()
			}
			
		//	this.doc_form.actions.get('save').show(true)
		//	this.doc_form.actions.get('show').show(this.doc_form.getFieldValue("uc_docs_extension.doc_name") != "")
			
		}
	},
	doc_form_onSave: function(){
		if (View.parameters != null) {View.parameters.callback();}
		if (this.doc_form.save()) {
			this.doc_form_onClose()
		}
	},
	doc_form_onShow: function(){
		this.doc_form.fields.get('uc_docs_extension.doc_name').actions.get('doc_form_uc_docs_extension.doc_name_showDocument').button.dom.onclick()
	}
	//doc_form_uc_docs_extension.doc_name_checkOutDocument
	//doc_form_uc_docs_extension.doc_name_deleteDocument
	//doc_form_uc_docs_extension.doc_name_lockDocument
});


