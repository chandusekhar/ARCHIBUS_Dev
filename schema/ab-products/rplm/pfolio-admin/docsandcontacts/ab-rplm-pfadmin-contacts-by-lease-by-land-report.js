var repContactsByLeaseController = View.createController('repContactsByLeaseByLand',{
	mainContainer:null,
	landRecords:null,
	items: new Array(),
	maxItemNo:25,
	isLsContactsDef: false,
	
	afterViewLoad: function(){
		// check if new ls_contacts table is defined
		this.isLsContactsDef = schemaHasTables(['ls_contacts']);
	},
	afterInitialDataFetch: function(){
		this.dsContactsByLeaseByLandLease.addParameter('lease' , getMessage('lease'));
		this.dsContactsByLeaseByLandLease.addParameter('sublease' , getMessage('sublease'));
		this.dsContactsByLeaseByLandLease.addParameter('landlord' , getMessage('lanlord'));
		this.dsContactsByLeaseByLandLease.addParameter('tenant' , getMessage('tenant'));
		this.dsContactsByLeaseByLandLease.addParameter('optYes' , getMessage('opt_yes'));
		this.dsContactsByLeaseByLandLease.addParameter('optNo' , getMessage('opt_no'));
		if(this.view.parameters == null){
			this.buildReport();
		}
	},
	buildReport:function(){
		this.mainContainer = Ext.get('main_report_contacts').dom;
		var restriction = ' property.ls_no > 0 and property.property_type = \'Land\' ';
		if (this.items.length > 0) {
			restriction = ' property.ls_no > 0 and property.property_type = \'Land\' AND pr_id IN (\'' + this.items.join('\',\'') + '\')';
		}
		this.landRecords = this.dsContactsByLeaseByLandLands.getRecords(restriction);
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
					innerHTML += '<tr><td><div id="divCLLLease'+i+'_'+j+'_head" class="panelToolbar"></td></tr>';
					innerHTML += '<tr><td><div id="divCLLLease'+i+'_'+j+'"></div></td></tr>';
					innerHTML += '<tr><td><div id="divCLLContact'+i+'_'+j+'_head" class="panelToolbar"></td></tr>';
					innerHTML += '<tr><td><div id="divCLLContact'+i+'_'+j+'"></div></td></tr>';
					innerHTML += '<tr><td>&#160;</td></tr>';
				}
			}
		}
		innerHTML += '</table>';
		this.mainContainer.innerHTML = innerHTML;
		this.fillReport();
	},
	fillReport:function(){
		var leaseColumns = this.dsContactsByLeaseByLandLease.fieldDefs.items;
		setFieldColspan(leaseColumns, 'ls.comments', 3);
		var contactColumns = [
			//new Ab.grid.Column('contact.ls_id', getMessage('column_contact_ls_id'), 'text'),
			new Ab.grid.Column('contact.contact_id', getMessage('column_contact_contact_id'), 'text'),
			new Ab.grid.Column('contact.honorific', getMessage('column_contact_honorific'), 'text'),
			new Ab.grid.Column('contact.name_last', getMessage('column_contact_name_last'), 'text'),
			new Ab.grid.Column('contact.name_first', getMessage('column_contact_name_first'), 'text'),
			new Ab.grid.Column('contact.company', getMessage('column_contact_company'), 'text'),
			new Ab.grid.Column('contact.contact_type', getMessage('column_contact_contact_type'), 'text'),
			new Ab.grid.Column('contact.email', getMessage('column_contact_email'), 'text'),
			new Ab.grid.Column('contact.phone', getMessage('column_contact_phone'), 'text'),
			new Ab.grid.Column('contact.cellular_number', getMessage('column_contact_cellular_number'), 'text'),
			new Ab.grid.Column('contact.fax', getMessage('column_contact_fax'), 'text'),
			new Ab.grid.Column('contact.address1', getMessage('column_contact_address1'), 'text'),
			new Ab.grid.Column('contact.address2', getMessage('column_contact_address2'), 'text'),
			new Ab.grid.Column('contact.zip', getMessage('column_contact_zip'), 'text'),
			new Ab.grid.Column('contact.city_id', getMessage('column_contact_city_id'), 'text'),
			new Ab.grid.Column('contact.state_id', getMessage('column_contact_state_id'), 'text'),
			new Ab.grid.Column('contact.regn_id', getMessage('column_contact_regn_id'), 'text'),
			new Ab.grid.Column('contact.ctry_id', getMessage('column_contact_ctry_id'), 'text')
		];
		for (var i = 0; i < this.landRecords.length && i < this.maxItemNo; i++) {
			var record = this.landRecords[i];
			var pr_id = record.getValue('property.pr_id');
			var ls_no = record.getValue('property.ls_no');
			if (ls_no > 0) {
				var leaseRecords = this.dsContactsByLeaseByLandLease.getRecords({'ls.pr_id':pr_id});
				for (var j=0;j<leaseRecords.length;j++){
					var leaseRecord = leaseRecords[j];
					
					var leaseConfigObject = new Ab.view.ConfigObject();
					leaseConfigObject['viewDef']= '';
					leaseConfigObject['groupIndex']= '';
					leaseConfigObject['dataSourceId']= 'dsContactsByLeaseByLandLease';
					leaseConfigObject['columns']= 3;
					leaseConfigObject['fieldDefs']= leaseColumns;
					var leasePanel = new Ab.form.ColumnReport('divCLLLease'+i+'_'+j,leaseConfigObject);
					leasePanel.setTitle(getMessage('title_lease'));
					
					leaseRecord.values["ls.vf_amount_security"] = new Number(leaseRecord.values["ls.vf_amount_security"]).toFixed(this.dsContactsByLeaseByLandLease.fieldDefs.get("ls.vf_amount_security").decimals);
					
					leasePanel.setRecord(leaseRecord);
					
					var contactRestriction = null;
					if (this.isLsContactsDef) {
						contactRestriction = "EXISTS(SELECT ls_contacts.contact_id FROM ls_contacts WHERE ls_contacts.contact_id = contact.contact_id AND ls_contacts.ls_id = '" + convert2SafeSqlString(leaseRecord.getValue('ls.ls_id')) + "' )";
					} else {
						contactRestriction = new Ab.view.Restriction();
						contactRestriction.addClause('contact.ls_id', leaseRecord.getValue('ls.ls_id'), '=');
					}
					var contRecords = this.dsContactsByLeaseByLandContacts.getRecords(contactRestriction);
					var contactRecords = [];
					for(var k=0;k<contRecords.length;k++){
						contactRecords[k] = contRecords[k].values;
					}
					var contactConfigObject = new Ab.view.ConfigObject();
					contactConfigObject['rows'] = contactRecords;
					contactConfigObject['columns'] = contactColumns;
					contactConfigObject['viewDef'] = '';
					contactConfigObject['title'] = getMessage('title_contacts');
					var contactPanel = new Ab.grid.Grid('divCLLContact'+i+'_'+j, contactConfigObject);
					contactPanel.build();
				}
			}
		}
	}
})

