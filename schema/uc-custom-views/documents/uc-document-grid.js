/*  ---These variables need to be set up in your JS file 
	docTable:""  			table name to use for adding documents i.e. 'wr'
	docPkey:"",	  			variable holding the PK values i.e.'1234'  - may have to fix date fields and multiple Pks.  note initial setting = ""
	docTitle:null,			Title of the Docuement form	'Work Request Documents'
	docShowTable:false,		Whether to show the table's title?	true/false
	docPkeyLabel:null,		What the pkey label is i.e.['wr,'Work','eq','Equipment']
	docAdd:true,			show add button true/false
	docEdit:true,			allow edit  true/false
*/
var docCntrl = View.createController('docCntrl', {
	docTable:"",
	docPkey:"",
	docTitle:"Documents",
	docShowTable:false,
	docPkeyLabel:[],
	docAdd:true,
	docPdf:false,
	docXls:false,
	docEdit:true,
	hideLabelColumn:true,
	docSaveForms:null,
	afterViewLoad: function() {
		if (this.docPkeyLabel.length > 2){docCntrl.hideLabelColumn=false}
		this.doc_grid.afterCreateCellContent = this.renderReportGrid;
	},
	renderReportGrid: function (row, col, cellElement) {
		if (col.id == "doc_edit") {
			var Edit = docCntrl.docEdit
			
			if (Edit && docCntrl.docPkeyLabel.length > 2) {
				var tbl = row['uc_docs_extension.table_name'];
				if (tbl != docCntrl.docPkeyLabel[0]) {Edit=false;}
			}
			if (!Edit) {
				cellElement.firstChild.value = "View"
				//cellElement.title = "View"
			}	
			
		}
	
	},

	afterInitialDataFetch:function(){
		if (this.docPkeyLabel.length > 2){
			var pLbl = ""
			var pSort = ""
			for (var j = 0; j < this.docPkeyLabel.length; j=j+2) { 
				pLbl += " when '" + this.docPkeyLabel[j] + "' then '" + this.docPkeyLabel[j+1].replace(/'/g, "''") + ":  ' + rtrim(uc_docs_extension.pkey)" 
				pSort += " when '" + this.docPkeyLabel[j] + "' then " + j 
			}
			pLbl = "case uc_docs_extension.table_name" + pLbl + " else null end";
			pSort = "case uc_docs_extension.table_name" + pSort + " else null end";
			this.doc_grid.addParameter("pLabel", pLbl);
			this.doc_grid.addParameter("pSort", pSort);
			
		}
		else {
			this.doc_grid.addParameter("pLabel", "null");
			//this.doc_grid.showColumn("uc_docs_extension.pklabel",false);
		}
	},
	
	doc_grid_afterRefresh: function(){
		this.doc_grid.actions.get('add').show(this.docAdd)
		this.doc_grid.actions.get('pdf').show(this.docPdf)
		this.doc_grid.actions.get('xls').show(this.docXls)
		this.doc_grid.setTitle(this.docTitle)
	},
	
	doc_grid_onDoc_edit:function(row){
		var rest = new Ab.view.Restriction(); 
		rest.addClause("uc_docs_extension.uc_docs_extension_id", +row.record['uc_docs_extension.uc_docs_extension_id'], "="); 
		//var rest = "uc_docs_extension.uc_docs_extension_id=" +row.record['uc_docs_extension.uc_docs_extension_id']
		this.openDocForm(rest,row.actions.get('doc_edit').button.getValue()=='Edit')
	},
	doc_grid_onAdd:function(){
		var openDoc = true;
		if (docCntrl.docSaveForms != null) {
			//Add this function to the 
			openDoc=docSave();
		}
		if (openDoc){this.openDocForm(null,true);}
	},
	openDocForm: function(rest,edit){
		
		View.openDialog('uc-document-dialog.axvw', rest, rest==null, {
			docTable:docCntrl.docTable,
			docPkey:docCntrl.docPkey,
			docTitle:docCntrl.docTitle,
			docShowTable:docCntrl.docShowTable,
			docPkeyLabel:docCntrl.docPkeyLabel,
			docEdit:edit,
			width: 1000, 
			height: 1200, 
			closeButton: false,
			maximize: false,
			callback: function() {
				View.panels.get("doc_grid").refresh();
			}
			
		});
	},
	doc_grid_onShowDoc: function(row){

    var keys = { 'uc_docs_extension_id':  row.record['uc_docs_extension.uc_docs_extension_id'] }; 
	var doc = row.record['uc_docs_extension.doc_name']
    View.showDocument(keys, 'uc_docs_extension', 'doc_name',doc ); 
	}

});

