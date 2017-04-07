
var abWasteRptSummaryController = View.createController('abWasteRptSummaryController', {
	/**
	 *  console restriction
	 */
	originalRes: null,
	/**
	 * console and group restriction
	 */
	res: null,
	/**
	 * afterInitialDataFetch
	 */
	afterInitialDataFetch: function(){
		resetStatusOption('abWasteRptSummaryConsole');
		this.initializeView();
	},
	/**
	 * after Refresh console 
	 */
	abWasteRptSummaryConsole_afterRefresh: function(){
		this.abWasteRptSummaryConsole.clear();
		this.initializeView();
	},
	/**
	 * on_click event handler for 'Show' action
	 */
	fieldsArraysForRestriction: new Array(
			['waste_out.site_id',,'waste_out.site_id'], 
			['waste_out.bl_id',,'waste_out.bl_id'], 
			['waste_out.waste_profile',,'waste_out.waste_profile'], 
			['waste_profiles.waste_type',,'waste_profiles.waste_type'], 
			['waste_out.waste_disposition',,'waste_out.waste_disposition'],
			['waste_out.storage_location',,'waste_out.storage_location'],
			['waste_out.status',,'waste_out.status']
	),
	/**
	 * Show grid by console restriction
	 */
	abWasteRptSummaryConsole_onShow: function(){
		var consoleRestriction = this.getConsoleRestriction();
		this.abWasteRptSummaryForm.addParameter("consoleRes", consoleRestriction);
		this.abWasteRptSummaryForm.refresh();
		//if field total_container is null than set it to 0
		var total_container = this.abWasteRptSummaryForm.getFieldValue("waste_out.total_container");
		if (total_container=null||total_container=="") {
			this.abWasteRptSummaryForm.setFieldValue("waste_out.total_container",0);
		}
		
		$('summaryTop').innerHTML = getMessage("summaryTop");
		$('massTop').innerHTML = getMessage("massTop");
		$('liquidTop').innerHTML = getMessage("liquidTop");
		$('gasTop').innerHTML = getMessage("gasTop");

		this.abWasteRptSummaryFormGroupDS.addParameter("consoleRes", consoleRestriction);
		var dataRecords = this.abWasteRptSummaryFormGroupDS.getRecords();
		this.abWasteRptSummaryForm.setFieldValue("total_mass_quantity",this.getSumQuantityByGroup('MASS', null, null, null, dataRecords) );
		this.abWasteRptSummaryForm.setFieldValue("total_mass_recyclable",this.getSumQuantityByGroup('MASS', 1, null,null, dataRecords ) );
		this.abWasteRptSummaryForm.setFieldValue("total_mass_shipped",this.getSumQuantityByGroup('MASS', null, 'D', 'S', dataRecords ) );

		this.abWasteRptSummaryForm.setFieldValue("total_liquid_quantity",this.getSumQuantityByGroup('VOLUME-LIQUID', null, null, null, dataRecords) );
		this.abWasteRptSummaryForm.setFieldValue("total_liquid_recyclable",this.getSumQuantityByGroup('VOLUME-LIQUID', 1, null,null, dataRecords ) );
		this.abWasteRptSummaryForm.setFieldValue("total_liquid_shipped",this.getSumQuantityByGroup('VOLUME-LIQUID', null, 'D', 'S', dataRecords ) );
		this.abWasteRptSummaryForm.setFieldValue("total_liquid_discharged",this.getSumQuantityByGroup('VOLUME-LIQUID', null, 'D', 'D', dataRecords ) );

		this.abWasteRptSummaryForm.setFieldValue("total_gas_quantity",this.getSumQuantityByGroup('VOLUME-GAS', null, null, null, dataRecords) );
		this.abWasteRptSummaryForm.setFieldValue("total_gas_recyclable",this.getSumQuantityByGroup('VOLUME-GAS', 1, null,null, dataRecords ) );
		this.abWasteRptSummaryForm.setFieldValue("total_gas_shipped",this.getSumQuantityByGroup('VOLUME-GAS', null, 'D', 'S', dataRecords ) );
		this.abWasteRptSummaryForm.setFieldValue("total_gas_discharged",this.getSumQuantityByGroup('VOLUME-GAS', null, 'D', 'D', dataRecords ) );
	},

	/**
	 * Clear console 
	 */
	abWasteRptSummaryConsole_onClear: function(){
		this.abWasteRptSummaryConsole.clear();
		resetStatusOption('abWasteRptSummaryConsole');
	},
	initializeView:function(){
		var storeageLocation=View.getOpenerView().controllers.get('blDetail').storage_location;
		var siteId=View.getOpenerView().controllers.get('blDetail').site_id;
		this.abWasteRptSummaryConsole.setFieldValue("waste_out.storage_location",storeageLocation);
		this.abWasteRptSummaryConsole.setFieldValue("waste_out.site_id",siteId);
		this.abWasteRptSummaryConsole_onShow();
	},
	/**
	 * Sum quantities of sub groups according to specified condition 
	 */
	getSumQuantityByGroup: function(unitType, isRecyclable, status, dispositionType, records){
		var total=0;
		var units='';
		for(var i=0; i<records.length; i++){
			var record = records[i];
			var value = record.getValue("waste_out.total_quantity");
			var recyValue = record.getValue("waste_out.is_recyclable");
			var utValue = record.getValue("waste_out.units_type");
			var statusValue = record.getValue("waste_out.status");
			var dtValue = record.getValue("waste_out.disposition_type");

			if ( (unitType==utValue)  
					&& (!isRecyclable || isRecyclable==recyValue)  
					&& (!status || status==statusValue)  
					&& (!dispositionType || dispositionType==dtValue) ){
				total = parseFloat(total) +parseFloat(value);
				units =  record.getValue("waste_out.units");
			}
		}
        // kb#3031550 - localize total values
        total = insertGroupingSeparator(parseFloat(total).toFixed(4)+"",true);
		return total + " "+ units;
	},
	/**
	 * Get restriction from Group By
	 */
	getConsoleRestriction: function() {
		var disType=this.abWasteRptSummaryConsole.getFieldValue('waste_dispositions.disposition_type');
		var disRes="";
		if(""==disType){
			disRes=" ";
		}else{
			disRes=" and exists(select 1 from waste_dispositions where waste_out.waste_disposition=waste_dispositions.waste_disposition and waste_dispositions.disposition_type='"+disType+"')";
		}
		var restriction = this.getOriginalConsoleRestriction();
		restriction = restriction+ disRes;
		return restriction;
	},
	getOriginalConsoleRestriction: function(){
		var console = this.abWasteRptSummaryConsole;
		var restriction = getRestrictionStrFromConsole(console, this.fieldsArraysForRestriction);		
		var dateEndFrom=console.getFieldValue("date_end.from");
		var dateEndTo=console.getFieldValue("date_end.to");

		if(valueExistsNotEmpty(dateEndFrom)){
			restriction+=" AND waste_out.date_end >=${sql.date(\'" + dateEndFrom + "\')}";
		}
		if(valueExistsNotEmpty(dateEndTo)){
			restriction+=" AND waste_out.date_end <=${sql.date(\'" + dateEndTo + "\')}";
		}
		var dateStartFrom=console.getFieldValue("date_start.from");
		var dateStartTo=console.getFieldValue("date_start.to");
		
		if(valueExistsNotEmpty(dateStartFrom)){
			restriction+=" AND waste_out.date_start >=${sql.date(\'" + dateStartFrom + "\')}";
		}
		if(valueExistsNotEmpty(dateStartTo)){
			restriction+=" AND waste_out.date_start <=${sql.date(\'" + dateStartTo + "\')}";
		}
		
		return restriction;
	},

	/**
	 * Listener for 'generateReport' action from 'abWasteRptSummaryForm' panel - generate a paginated report
	 */
	abWasteRptSummaryForm_onGenerateReport:function(){
		
		
		//prepare a custom printable restrictions - paired title and value (localized)
		var printableRestrictions = [];

		var console = this.abWasteRptSummaryConsole;

		if(console.getFieldValue('waste_out.site_id')){
			printableRestrictions.push({'title': getMessage('siteId'), 'value': console.getFieldValue('waste_out.site_id')});
		}
		
		if(console.getFieldValue('waste_out.bl_id')){
			printableRestrictions.push({'title': getMessage('blId'), 'value': console.getFieldValue('waste_out.bl_id')});
		}

		if(console.getFieldValue('waste_out.waste_profile')){
			printableRestrictions.push({'title': getMessage('profileId'), 'value': console.getFieldValue('waste_out.waste_profile')});
		}

		if(console.getFieldValue('waste_out.waste_type')){
			printableRestrictions.push({'title': getMessage('typeId'), 'value': console.getFieldValue('waste_out.waste_type')});
		}

		if(console.getFieldValue('waste_out.waste_disposition')){
			printableRestrictions.push({'title': getMessage('dispositionId'), 'value': console.getFieldValue('waste_out.waste_disposition')});
		}

		if(console.getFieldValue('waste_dispositions.disposition_type')){
			printableRestrictions.push({'title': getMessage('dispTypeId'), 'value': console.getFieldValue('waste_dispositions.disposition_type')});
		}

		if(console.getFieldValue('waste_out.status')){
			printableRestrictions.push({'title': getMessage('status'), 'value': console.getFieldValue('waste_out.status')});
		}

		if(console.getFieldValue('waste_out.date_start.from')){
			printableRestrictions.push({'title': getMessage('startFrom'), 'value': console.getFieldValue('waste_out.date_start.from')});
		}

		if(console.getFieldValue('waste_out.date_start.to')){
			printableRestrictions.push({'title': getMessage('startTo'), 'value': console.getFieldValue('waste_out.date_start.to')});
		}

		if(console.getFieldValue('waste_out.date_end.from')){
			printableRestrictions.push({'title': getMessage('endFrom'), 'value': console.getFieldValue('waste_out.date_end.from')});
		}

		if(console.getFieldValue('waste_out.date_end.to')){
			printableRestrictions.push({'title': getMessage('endTo'), 'value': console.getFieldValue('waste_out.date_end.to')});
		}		
		//alert(this.abWasteRptSummaryForm.fields.length);
		//alert(this.abWasteRptSummaryForm.fields[3]);
		//alert(this.abWasteRptSummaryForm.getFieldValue('total_mass_quantity'));
		// set parameters for paginated report datasouce
		var prefix = "ShowabWasteRptSummaryForm_";
		var parameters = {
				 'vf_summary_label':getMessage('summaryTop'), 
				 'vf_container_quantity':this.abWasteRptSummaryForm.getFieldValue('waste_out.total_container'), 

 				 'vf_mass_label':getMessage('massTop'), 
				 'vf_mass_quantity':$(prefix+"total_mass_quantity").innerHTML, 
				 'vf_mass_recyclable':$(prefix+"total_mass_recyclable").innerHTML, 
				 'vf_mass_shipped':$(prefix+"total_mass_shipped").innerHTML, 

 				 'vf_liquid_label':getMessage('liquidTop'), 
				 'vf_liquid_quantity':$(prefix+"total_liquid_quantity").innerHTML, 
				 'vf_liquid_recyclable':$(prefix+"total_liquid_recyclable").innerHTML, 
				 'vf_liquid_shipped':$(prefix+"total_liquid_shipped").innerHTML, 
				 'vf_liquid_discharged':$(prefix+"total_liquid_discharged").innerHTML, 

 				 'vf_gas_label':getMessage('gasTop'), 
				 'vf_gas_quantity':$(prefix+"total_gas_quantity").innerHTML, 
				 'vf_gas_recyclable':$(prefix+"total_gas_recyclable").innerHTML, 
				 'vf_gas_shipped':$(prefix+"total_gas_shipped").innerHTML, 
				 'vf_gas_discharged':$(prefix+"total_gas_discharged").innerHTML, 

				 'printRestriction':true, 
				 'printableRestriction':printableRestrictions
		};
		
		
		//generate paginated report
		View.openPaginatedReportDialog('ab-waste-rpt-summary-paginate.axvw',null, parameters);
	}


});