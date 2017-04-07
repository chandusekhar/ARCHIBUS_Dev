var repDocumentsByLeaseByStrucController = View.createController('repDocumentsByLeaseByStruc',{
	mainContainer:null,
	strucRecords:null,
	items: new Array(),
	maxItemNo:25,
	afterInitialDataFetch: function(){
		this.dsDocumentsByLeaseByStrucLease.addParameter('lease' , getMessage('lease'));
		this.dsDocumentsByLeaseByStrucLease.addParameter('sublease' , getMessage('sublease'));
		this.dsDocumentsByLeaseByStrucLease.addParameter('landlord' , getMessage('lanlord'));
		this.dsDocumentsByLeaseByStrucLease.addParameter('tenant' , getMessage('tenant'));
		this.dsDocumentsByLeaseByStrucLease.addParameter('optYes' , getMessage('opt_yes'));
		this.dsDocumentsByLeaseByStrucLease.addParameter('optNo' , getMessage('opt_no'));
		if(this.view.parameters == null){
			this.buildReport();
		}
	},
	buildReport:function(){
		this.mainContainer = Ext.get('main_report_documents').dom;
		var restriction = " (SELECT COUNT(*) FROM ls WHERE ls.pr_id = property.pr_id) > 0 ";
		if (this.items.length > 0) {
			restriction += ' AND pr_id IN (\'' + this.items.join('\',\'') + '\')';
		}
		this.strucRecords = this.dsDocumentsByLeaseByStrucStructures.getRecords(restriction);
		var innerHTML = '<table width="100%" cellspacing="0">';

		//KB3032387 - when there are no records, display the message: "No Records Found"
		if(this.strucRecords.length==0){
			innerHTML += "<span class='instruction'>"+getMessage('no_records_found')+"<span>";
		}
		
		for(var i=0;i<this.strucRecords.length && i<this.maxItemNo;i++){
			var record = this.strucRecords[i];
			var pr_id = record.getValue('property.pr_id');
			var ls_no = record.getValue('property.ls_no');
			if(ls_no > 0){
				innerHTML += '<tr class="groupheader"><td><b><u>'+pr_id+'</u></b></td></tr>';
				for(var j=0;j<ls_no;j++){
					innerHTML += '<tr><td><div id="divDLSLease'+i+'_'+j+'_head" class="panelToolbar"></td></tr>';
					innerHTML += '<tr><td><div id="divDLSLease'+i+'_'+j+'"></div></td></tr>';
					innerHTML += '<tr><td><div id="divDLSDoc'+i+'_'+j+'_head" class="panelToolbar"></td></tr>';
					innerHTML += '<tr><td><div id="divDLSDoc'+i+'_'+j+'"></div></td></tr>';
					innerHTML += '<tr><td>&#160;</td></tr>';
				}
			}
		}
		innerHTML += '</table>';
		this.mainContainer.innerHTML = innerHTML;
		this.fillReport();
	},
	fillReport:function(){
		var leaseColumns = this.dsDocumentsByLeaseByStrucLease.fieldDefs.items;
		setFieldColspan(leaseColumns, 'ls.comments', 3);
		var docColumns = [
			new Ab.grid.Column('view', '', 'button', 'viewDoc',null,null,null,getMessage('title_view_btn')),
			new Ab.grid.Column('docs_assigned.name', getMessage('column_docs_assigned_name'), 'text'),
			new Ab.grid.Column('docs_assigned.classification', getMessage('column_docs_assigned_classification'), 'text'),
			new Ab.grid.Column('docs_assigned.description', getMessage('column_docs_assigned_description'), 'text')
		];
		for (var i = 0; i < this.strucRecords.length && i < this.maxItemNo; i++) {
			var record = this.strucRecords[i];
			var pr_id = record.getValue('property.pr_id');
			var ls_no = record.getValue('property.ls_no');
			if (ls_no > 0) {
				var leaseRecords = this.dsDocumentsByLeaseByStrucLease.getRecords({'ls.pr_id':pr_id});
				for (var j=0;j<leaseRecords.length;j++){
					var leaseRecord = leaseRecords[j];
					
					var leaseConfigObject = new Ab.view.ConfigObject();
					leaseConfigObject['viewDef']= '';
					leaseConfigObject['groupIndex']= '';
					leaseConfigObject['dataSourceId']= 'dsDocumentsByLeaseByStrucLease';
					leaseConfigObject['columns']= 3;
					leaseConfigObject['fieldDefs']= leaseColumns;
					var leasePanel = new Ab.form.ColumnReport('divDLSLease'+i+'_'+j,leaseConfigObject);
					leasePanel.setTitle(getMessage('title_lease'));
					
					leaseRecord.values["ls.vf_amount_security"] = new Number(leaseRecord.values["ls.vf_amount_security"]).toFixed(this.dsDocumentsByLeaseByStrucLease.fieldDefs.get("ls.vf_amount_security").decimals);
					
					leasePanel.setRecord(leaseRecord);
					
					var docRecords = this.dsDocumentsByLeaseByStrucDocuments.getRecords({'docs_assigned.ls_id':leaseRecord.getValue('ls.ls_id')});
					var documentRecords = [];
					for(var k=0;k<docRecords.length;k++){
						documentRecords[k] = docRecords[k].values;
					}
					var docConfigObject = new Ab.view.ConfigObject();
					docConfigObject['rows'] = documentRecords;
					docConfigObject['columns'] = docColumns;
					docConfigObject['viewDef'] = '';
					docConfigObject['title'] = getMessage('title_documents');
					var docPanel = new Ab.grid.Grid('divDLSDoc'+i+'_'+j, docConfigObject);
					docPanel.build();
					/*
					 * 04/19/2010 IOAN KB 3027078
					 */
					checkViewButton('divDLSDoc'+i+'_'+j);
				}
			}
		}
	}
})

/*
 * 04/19/2010 IOAN KB 3027078
 */
function checkViewButton(gridId){
	var panel = View.panels.get(gridId);
	for(var i=0; i< panel.rows.length;i++){
		var row = panel.rows[i];
		var doc = row['docs_assigned.doc'];
		if(document.getElementById(gridId+'_row'+i+'_view')){
			document.getElementById(gridId+'_row'+i+'_view').disabled = (!valueExistsNotEmpty(doc));
		}
	}
}

function viewDoc(row){
	View.showDocument({'doc_id':row['docs_assigned.doc_id']}, 'docs_assigned', 'doc', row['docs_assigned.doc']);
}
