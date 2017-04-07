var mngRPIFindMngController = View.createController('mngRPIFindMng',{
	afterViewLoad: function(){
		this.buildLabels();
	},
	afterInitialDataFetch:function(){
		var tabs = View.getView('parent').panels.get('tabsMngRPI');
		tabs.setTabEnabled('page0', true);
		tabs.setTabEnabled('page1', false);
		this.buildLabels();
	},
	consoleSearch_onFilter:function(){
		var restriction = new Ab.view.Restriction();
		value = this.consoleSearch.getFieldValue('grp_trans.unique_identifier');
		if(valueExistsNotEmpty(value)){
			restriction.addClause('grp.unique_identifier', value, '=');
		}
		value = this.consoleSearch.getFieldValue('grp_trans.real_property_name');
		if(valueExistsNotEmpty(value)){
			restriction.addClause('grp.real_property_name', value, '=');
		}
		value = this.consoleSearch.getFieldValue('grp_trans.grp_type_id');
		if(valueExistsNotEmpty(value)){
			restriction.addClause('grp.grp_type_id', value, '=');
		}
		value = this.consoleSearch.getFieldValue('grp_trans.grp_use_id');
		if(valueExistsNotEmpty(value)){
			restriction.addClause('grp.grp_use_id', value, '=');
		}
		value = this.consoleSearch.getFieldValue('grp_trans.legal_interest_ind');
		if(valueExistsNotEmpty(value)){
			restriction.addClause('grp.legal_interest_ind', value, '=');
		}
		value = this.consoleSearch.getFieldValue('grp_trans.status_indicator');
		if(valueExistsNotEmpty(value)){
			restriction.addClause('grp.status_indicator', value, '=');
		}
		value = this.consoleSearch.getFieldValue('grp_trans.reporting_grp_agency_id');
		if(valueExistsNotEmpty(value)){
			restriction.addClause('grp.reporting_grp_agency_id', value, '=');
		}
		value = this.consoleSearch.getFieldValue('grp_trans.using_grp_agency_id');
		if(valueExistsNotEmpty(value)){
			restriction.addClause('grp.using_grp_agency_id', value, '=');
		}
		value = this.consoleSearch.getFieldValue('grp_trans.country');
		if(valueExistsNotEmpty(value)){
			restriction.addClause('grp.country', value, '=');
		}
		value = this.consoleSearch.getFieldValue('grp_trans.county');
		if(valueExistsNotEmpty(value)){
			restriction.addClause('grp.county', value, '=');
		}
		value = this.consoleSearch.getFieldValue('grp_trans.state');
		if(valueExistsNotEmpty(value)){
			restriction.addClause('grp.state', value, '=');
		}
		value = this.consoleSearch.getFieldValue('grp_trans.city');
		if(valueExistsNotEmpty(value)){
			restriction.addClause('grp.city', value, '=');
		}
		value = this.consoleSearch.getFieldValue('date_trans_posted_start');
		if(valueExistsNotEmpty(value)){
			this.gridPropertyList.addParameter('start_date',' AND grp.date_last_update >= ${sql.date(\''+value+'\')} ');
		}else{
			this.gridPropertyList.addParameter('start_date','');
		}
		value = this.consoleSearch.getFieldValue('date_trans_posted_end');
		if(valueExistsNotEmpty(value)){
			this.gridPropertyList.addParameter('end_date',' AND grp.date_last_update <= ${sql.date(\''+value+'\')} ');
		}else{
			this.gridPropertyList.addParameter('end_date','');
		}
		this.gridPropertyList.refresh(restriction);
	},
	consoleSearch_onClear: function(){
		this.consoleSearch.refresh({}, true);
		this.consoleSearch.setFieldValue('grp_trans.legal_interest_ind','');
		this.consoleSearch.setFieldValue('grp_trans.status_indicator','');
	},
	gridPropertyList_onNew:function(){
		View.openDialog('ab-rplm-gvmnt-rp-add-new-prop.axvw', {}, true, { 
		     width: 800, 
		    height: 600, 
		    closeButton: true,
			isDialog:true
		});
		
	},
	gridPropertyList_manage_onClick:function(row){
		var ctrlTabs = View.getView('parent').controllers.get('mngRPIWizard');
		ctrlTabs.selectedItem = row.getFieldValue('grp.unique_identifier');
		ctrlTabs.mngRPIFindMngController = this;
		View.getView('parent').panels.get('tabsMngRPI').selectTab('page1');
	},
	gridPropertyList_afterRefresh:function(){
		for(var i=0;i<this.gridPropertyList.gridRows.items.length;i++){
			var row = this.gridPropertyList.gridRows.items[i];
			if(row.getFieldValue('grp.num_unposted_trans') == 1 && 
				!valueExistsNotEmpty(row.getFieldValue('grp.date_last_update'))){
				row.dom.style.backgroundColor = '#ADD8E6';
			}else if(row.getFieldValue('grp.num_unposted_trans') > 0){
				row.dom.style.backgroundColor = '#C0C0C0';
			}
		}
	},
	buildLabels: function(){
		$('trans_date_label').innerHTML = getMessage('label_trans_date');
	}
})
