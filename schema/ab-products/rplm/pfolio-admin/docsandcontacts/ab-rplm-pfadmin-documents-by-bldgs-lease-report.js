var repDocumentsByBuildingLeaseController = View.createController('repDocumentsByBuildingLease',{
	mainContainer:null,
	bldgRecords:null,
	items: new Array(),
	maxItemNo:25,
	afterInitialDataFetch: function(){
		this.dsDocumentsByLeaseByBldgLease.addParameter('lease' , getMessage('lease'));
		this.dsDocumentsByLeaseByBldgLease.addParameter('sublease' , getMessage('sublease'));
		this.dsDocumentsByLeaseByBldgLease.addParameter('landlord' , getMessage('lanlord'));
		this.dsDocumentsByLeaseByBldgLease.addParameter('tenant' , getMessage('tenant'));
		this.dsDocumentsByLeaseByBldgLease.addParameter('optYes' , getMessage('opt_yes'));
		this.dsDocumentsByLeaseByBldgLease.addParameter('optNo' , getMessage('opt_no'));
		if(this.view.parameters == null){
			this.buildReport();
		}
	},
	buildReport:function(){
		this.mainContainer = Ext.get('main_report_documents').dom;
		var restriction = ' (SELECT COUNT(*) FROM ls WHERE ls.bl_id = bl.bl_id) > 0 ';
		if (this.items.length > 0) {
			restriction += ' AND bl_id IN (\'' + this.items.join('\',\'') + '\')';
		}
		this.bldgRecords = this.dsDocumentsByLeaseByBldgBuildings.getRecords(restriction);
		var innerHTML = '<table width="100%" cellspacing="0">';
		
		//KB3032387 - when there are no records, display the message: "No Records Found"
		if(this.bldgRecords.length==0){
			innerHTML += "<span class='instruction'>"+getMessage('no_records_found')+"<span>";
		}
		
		for(var i=0;i<this.bldgRecords.length && i<this.maxItemNo;i++){
			var record = this.bldgRecords[i];
			var bldg_id = record.getValue('bl.bl_id');
			var ls_no = record.getValue('bl.ls_no');
			if(ls_no > 0){
				innerHTML += '<tr class="groupheader"><td><b><u>'+bldg_id+'</u></b></td></tr>';
				for(var j=0;j<ls_no;j++){
					innerHTML += '<tr><td><div id="divDLBLease'+i+'_'+j+'_head" class="panelToolbar"></td></tr>';
					innerHTML += '<tr><td><div id="divDLBLease'+i+'_'+j+'"></div></td></tr>';
					innerHTML += '<tr><td><div id="divDLBDoc'+i+'_'+j+'_head" class="panelToolbar"></td></tr>';
					innerHTML += '<tr><td><div id="divDLBDoc'+i+'_'+j+'"></div></td></tr>';
					innerHTML += '<tr><td>&#160;</td></tr>';
				}
			}
		}
		innerHTML += '</table>';
		this.mainContainer.innerHTML = innerHTML;
		this.fillReport();
	},
	fillReport:function(){
		var leaseColumns = this.dsDocumentsByLeaseByBldgLease.fieldDefs.items;
		setFieldColspan(leaseColumns, 'ls.comments', 3);
		var docColumns = [
			new Ab.grid.Column('view', '', 'button', 'viewDoc',null,null,null,getMessage('title_view_btn')),
			new Ab.grid.Column('docs_assigned.name', getMessage('column_docs_assigned_name'), 'text'),
			new Ab.grid.Column('docs_assigned.classification', getMessage('column_docs_assigned_classification'), 'text'),
			new Ab.grid.Column('docs_assigned.description', getMessage('column_docs_assigned_description'), 'text')
		];
		for (var i = 0; i < this.bldgRecords.length && i < this.maxItemNo; i++) {
			var record = this.bldgRecords[i];
			var bldg_id = record.getValue('bl.bl_id');
			var ls_no = record.getValue('bl.ls_no');
			if (ls_no > 0) {
				var leaseRecords = this.dsDocumentsByLeaseByBldgLease.getRecords({'ls.bl_id':bldg_id});
				for (var j=0;j<leaseRecords.length;j++){
					var leaseRecord = leaseRecords[j];
					
					var leaseConfigObject = new Ab.view.ConfigObject();
					leaseConfigObject['viewDef']= '';
					leaseConfigObject['groupIndex']= '';
					leaseConfigObject['dataSourceId']= 'dsDocumentsByLeaseByBldgLease';
					leaseConfigObject['columns']= 3;
					leaseConfigObject['fieldDefs']= leaseColumns;
					var leasePanel = new Ab.form.ColumnReport('divDLBLease'+i+'_'+j,leaseConfigObject);
					leasePanel.setTitle(getMessage('title_lease'));
					
					leaseRecord.values["ls.vf_amount_security"] = new Number(leaseRecord.values["ls.vf_amount_security"]).toFixed(this.dsDocumentsByLeaseByBldgLease.fieldDefs.get("ls.vf_amount_security").decimals);
					
					leasePanel.setRecord(leaseRecord);
					
					var docRecords = this.dsDocumentsByLeaseByBldgDocuments.getRecords({'docs_assigned.ls_id':leaseRecord.getValue('ls.ls_id')});
					var documentRecords = [];
					for(var k=0;k<docRecords.length;k++){
						documentRecords[k] = docRecords[k].values;
					}
					var docConfigObject = new Ab.view.ConfigObject();
					docConfigObject['rows'] = documentRecords;
					docConfigObject['columns'] = docColumns;
					docConfigObject['viewDef'] = '';
					docConfigObject['title'] = getMessage('title_documents');
					var docPanel = new Ab.grid.Grid('divDLBDoc'+i+'_'+j, docConfigObject);
					docPanel.build();
					/*
					 * 04/19/2010 IOAN KB 3027078
					 */
					checkViewButton('divDLBDoc'+i+'_'+j);
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
