var repDocumentsByLeaseByLandController = View.createController('repDocumentsByLeaseByLand',{
	mainContainer:null,
	landRecords:null,
	items: new Array(),
	maxItemNo:25,
	afterInitialDataFetch: function(){
		this.dsDocumentsByLeaseByLandLease.addParameter('lease' , getMessage('lease'));
		this.dsDocumentsByLeaseByLandLease.addParameter('sublease' , getMessage('sublease'));
		this.dsDocumentsByLeaseByLandLease.addParameter('landlord' , getMessage('lanlord'));
		this.dsDocumentsByLeaseByLandLease.addParameter('tenant' , getMessage('tenant'));
		this.dsDocumentsByLeaseByLandLease.addParameter('optYes' , getMessage('opt_yes'));
		this.dsDocumentsByLeaseByLandLease.addParameter('optNo' , getMessage('opt_no'));
		if(this.view.parameters == null){
			this.buildReport();
		}
	},
	buildReport:function(){
		this.mainContainer = Ext.get('main_report_documents').dom;
		var restriction = ' (SELECT COUNT(*) FROM ls WHERE ls.pr_id = property.pr_id) > 0 ';
		if (this.items.length > 0) {
			restriction += ' AND pr_id IN (\'' + this.items.join('\',\'') + '\')';
		}
		this.landRecords = this.dsDocumentsByLeaseByLandLands.getRecords(restriction);
		var innerHTML = '<table width="100%" cellspacing="0">';

		//KB3032387 - when there are no records, display the message: "No Records Found"
		if(this.landRecords.length==0){
			innerHTML += "<span class='instruction'>"+getMessage('no_records_found')+"<span>";
		}
		
		for(var i=0;i<this.landRecords.length && i<this.maxItemNo;i++){
			var record = this.landRecords[i];
			var pr_id = record.getValue('property.pr_id');
			var ls_no = record.getValue('property.ls_no');
			if(ls_no > 0){
				innerHTML += '<tr class="groupheader"><td><b><u>'+pr_id+'</u></b></td></tr>';
				for(var j=0;j<ls_no;j++){
					innerHTML += '<tr><td><div id="divDLLLease'+i+'_'+j+'_head" class="panelToolbar"></td></tr>';
					innerHTML += '<tr><td><div id="divDLLLease'+i+'_'+j+'"></div></td></tr>';
					innerHTML += '<tr><td><div id="divDLLDoc'+i+'_'+j+'_head" class="panelToolbar"></td></tr>';
					innerHTML += '<tr><td><div id="divDLLDoc'+i+'_'+j+'"></div></td></tr>';
					innerHTML += '<tr><td>&#160;</td></tr>';
				}
			}
		}
		innerHTML += '</table>';
		this.mainContainer.innerHTML = innerHTML;
		this.fillReport();
	},
	fillReport:function(){
		var leaseColumns = this.dsDocumentsByLeaseByLandLease.fieldDefs.items;
		setFieldColspan(leaseColumns, 'ls.comments', 3);
		var docColumns = [
			new Ab.grid.Column('view', '', 'button', 'viewDoc',null,null,null,getMessage('title_view_btn')),
			new Ab.grid.Column('docs_assigned.name', getMessage('column_docs_assigned_name'), 'text'),
			new Ab.grid.Column('docs_assigned.classification', getMessage('column_docs_assigned_classification'), 'text'),
			new Ab.grid.Column('docs_assigned.description', getMessage('column_docs_assigned_description'), 'text')
		];
		for (var i = 0; i < this.landRecords.length && i < this.maxItemNo; i++) {
			var record = this.landRecords[i];
			var pr_id = record.getValue('property.pr_id');
			var ls_no = record.getValue('property.ls_no');
			if (ls_no > 0) {
				var leaseRecords = this.dsDocumentsByLeaseByLandLease.getRecords({'ls.pr_id':pr_id});
				for (var j=0;j<leaseRecords.length;j++){
					var leaseRecord = leaseRecords[j];
					
					var leaseConfigObject = new Ab.view.ConfigObject();
					leaseConfigObject['viewDef']= '';
					leaseConfigObject['groupIndex']= '';
					leaseConfigObject['dataSourceId']= 'dsDocumentsByLeaseByLandLease';
					leaseConfigObject['columns']= 3;
					leaseConfigObject['fieldDefs']= leaseColumns;
					var leasePanel = new Ab.form.ColumnReport('divDLLLease'+i+'_'+j,leaseConfigObject);
					leasePanel.setTitle(getMessage('title_lease'));
					
					leaseRecord.values["ls.vf_amount_security"] = new Number(leaseRecord.values["ls.vf_amount_security"]).toFixed(this.dsDocumentsByLeaseByLandLease.fieldDefs.get("ls.vf_amount_security").decimals);
					
					leasePanel.setRecord(leaseRecord);
					
					var docRecords = this.dsDocumentsByLeaseByLandDocuments.getRecords({'docs_assigned.ls_id':leaseRecord.getValue('ls.ls_id')});
					var documentRecords = [];
					for(var k=0;k<docRecords.length;k++){
						documentRecords[k] = docRecords[k].values;
					}
					var docConfigObject = new Ab.view.ConfigObject();
					docConfigObject['rows'] = documentRecords;
					docConfigObject['columns'] = docColumns;
					docConfigObject['viewDef'] = '';
					docConfigObject['title'] = getMessage('title_documents');
					var docPanel = new Ab.grid.Grid('divDLLDoc'+i+'_'+j, docConfigObject);
					docPanel.build();
					/*
					 * 04/19/2010 IOAN KB 3027078
					 */
					checkViewButton('divDLLDoc'+i+'_'+j);
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
