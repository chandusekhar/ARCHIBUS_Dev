Ab.form.Form.prototype.validateField = function(fieldName, bCheckRequiredFields){
	return true;
}

var transactionDetailsCtr = View.createController('transactionDetails',{
	selectedTrans:null,
	selectedProperty:null,
	transType:null,
	afterInitialDataFetch: function(){
		this.selectedTrans = this.view.parameters['selectedTrans'];
		this.selectedProperty = this.view.parameters['selectedProperty'];
		this.panelTransactionGeneralInfo.refresh({'grp_trans.grp_trans_id':this.selectedTrans}, false);
		this.transType = this.panelTransactionGeneralInfo.getFieldValue('grp_trans.trans_type');
		if(this.transType == 'INSERT'){
			this.panelTransactionDetailInfo.refresh({'grp_trans.grp_trans_id':this.selectedTrans}, false);
			this.displayFormValues();
		}else{
			var recGrpTrans = this.dsGrpTransDetailInfo.getRecord({'grp_trans.grp_trans_id':this.selectedTrans});
			var recGrp = this.dsGrpDetailInfo.getRecord({'grp.unique_identifier':this.selectedProperty});
			this.setFormValues(recGrp, recGrpTrans);
		}
		if(this.panelTransactionGeneralInfo.getFieldValue('grp_trans.status') != 'CREATED'){
			this.panelTransactionGeneralInfo.actions.items[this.panelTransactionGeneralInfo.actions.indexOfKey('approve')].enable(false);
			this.panelTransactionGeneralInfo.actions.items[this.panelTransactionGeneralInfo.actions.indexOfKey('reject')].enable(false);
		}
		this.view.setTitle(this.view.title + ' '+this.selectedProperty);
    },
	setFormValues: function(recGrp, recGrpTrans){
		for(var i=0;i<this.panelTransactionDetailInfo.fields.length;i++){
			var key = this.panelTransactionDetailInfo.fields.keys[i];
			key = key.substring(key.indexOf('.')+1);
			var valGrp = recGrp.getValue('grp.'+key);
			var valGrpTrans = recGrpTrans.getValue('grp_trans.'+key);
			var valField = '';
			//if(valueExistsNotEmpty(valGrp) && valueExistsNotEmpty(valGrpTrans)){
			if(valueExistsNotEmpty(valGrpTrans)){
				if((key == 'disposition_date' || key == 'date_lease_expiration') && (( valGrp == '' && valGrpTrans == '' ) ||
					 (valGrp != '' && valGrpTrans != '' && valGrp.getTime() == valGrpTrans.getTime()))){
					valField = '';
				}else{
					valField = this.dsGrpTransDetailInfo.formatValue('grp_trans.' + key, this.getEnumValue(key, recGrp.getValue('grp.' + key)), true);
					valField += ' -> ';
					valField += this.dsGrpTransDetailInfo.formatValue('grp_trans.'+key, this.getEnumValue(key, recGrpTrans.getValue('grp_trans.'+key)), true);
					//valField = recGrp.getLocalizedValue('grp.'+key) + ' -> '+ recGrpTrans.getLocalizedValue('grp_trans.'+key);
				}
				this.panelTransactionDetailInfo.setFieldValue('grp_trans.'+key, valField);
			}else{
				this.panelTransactionDetailInfo.setFieldValue('grp_trans.'+key, this.getEnumValue(key, valField));
			}
		}
	},
	displayFormValues: function(){
		for(var i=0;i<this.panelTransactionDetailInfo.fields.length;i++){
			var key = this.panelTransactionDetailInfo.fields.keys[i];
			key = key.substring(key.indexOf('.')+1);
			var recGrpTrans = this.dsGrpTransDetailInfo.getRecord({'grp_trans.grp_trans_id':this.selectedTrans});
			var shortValue = recGrpTrans.getValue('grp_trans.'+key);
			if(shortValue.constructor == Date){
				shortValue = recGrpTrans.getLocalizedValue('grp_trans.'+key);
			}
			this.panelTransactionDetailInfo.setFieldValue('grp_trans.'+key, this.getEnumValue(key, shortValue));
		}
	},
	getEnumValue: function(key, value){
		switch(key)
		{
		case 'legal_interest_ind':
			switch(value){
				case 'Z':
					return getMessage('notApplicable');
					break;
				case 'G':
					return getMessage('owned');
					break;
				case 'L':
					return getMessage('leased');
					break;
				case 'S':
					return getMessage('stateGovernmentOwned');
					break;	
				case 'F':
					return getMessage('foreignGovernmentOwned');
					break;	
				case 'M':
					return getMessage('museumTrust');
					break;
				default: 
					return value;
			}
		  break;
		case 'lease_maintenance_ind':
			switch(value){
				case 'Z':
					return getMessage('notApplicable');
					break;
				case 'Y':
					return getMessage('yes');
					break;
				case 'N':
					return getMessage('no');
					break;
				default: 
					return value;
			}
		  break;
		case 'lease_authority_id':
			switch(value){
				case 'NA':
					return getMessage('notApplicable');
					break;
				case 'IS':
					return getMessage('independentStatus');
					break;
				case 'CS':
					return getMessage('categoricalSpace');
					break;
				case 'SP':
					return getMessage('specialPurpose');
					break;
				case 'PC':
					return getMessage('providerOfChoice');
					break;
				default: 
					return value;
			}
		  break;
		case 'status_indicator':
			switch(value){
				case 'Z':
					return getMessage('notApplicable');
					break;
				case 'A':
					return getMessage('active');
					break;
				case 'I':
					return getMessage('inactive');
					break;
				case 'E':
					return getMessage('excess');
					break;
				case 'D':
					return getMessage('disposed');
					break;
				default: 
					return value;
			}
		  break;
		case 'outgrant_indicator':
			switch(value){
				case 'Z':
					return getMessage('notApplicable');
					break;
				case 'Y':
					return getMessage('yes');
					break;
				case 'N':
					return getMessage('no');
					break;
				default: 
					return value;
			}
		  break;
		case 'historical_status':
			switch(value){
				case '0':
					return getMessage('notApplicable');
					break;
				case '1':
					return getMessage('nationalHistoric');
					break;
				case '2':
					return getMessage('nationalRegisterListed');
					break;
				case '3':
					return getMessage('nationalRegisterEligible');
					break;
				case '4':
					return getMessage('nonContributing');
					break;
				case '5':
					return getMessage('nonEvaluated');
					break;
				case '6':
					return getMessage('evaluated');
					break;
				default: 
					return value;
			}
		  break;
		case 'size_unit_of_measure':
			switch(value){
				case '0':
					return getMessage('notApplicable');
					break;
				case '1':
					return getMessage('each');
					break;
				case '2':
					return getMessage('laneMiles');
					break;
				case '3':
					return getMessage('linearFeet');
					break;
				case '4':
					return getMessage('miles');
					break;
				case '5':
					return getMessage('squareYards');
					break;
				default: 
					return value;
			}
		  break;
		case 'utilization':
			switch(value){
				case '0':
					return getMessage('notApplicable');
					break;
				case '1':
					return getMessage('overUtilized');
					break;
				case '2':
					return getMessage('utilized');
					break;
				case '3':
					return getMessage('underUtilized');
					break;
				case '4':
					return getMessage('notUtilized');
					break;
				default: 
					return value;
			}
		  break;
		case 'mission_dependency':
			switch(value){
				case '0':
					return getMessage('notApplicable');
					break;
				case '1':
					return getMessage('missionCritical');
					break;
				case '2':
					return getMessage('missionDependent');
					break;
				case '3':
					return getMessage('notMission');
					break;
				case '9':
					return getMessage('notRated');
					break;
				default: 
					return value;
			}
		  break;
		case 'disposition_method_id':
			switch(value){
				case 'NA':
					return getMessage('notApplicable');
					break;
				case 'PB':
					return getMessage('publicBenefitConveyance');
					break;
				case 'HA':
					return getMessage('homelessAssistance');
					break;
				case 'HE':
					return getMessage('healthEducational');
					break;
				case 'PR':
					return getMessage('publicParks');
					break;
				case 'HM':
					return getMessage('historicMonuments');
					break;
				case 'CF':
					return getMessage('correctionalFacility');
					break;
				case 'PF':
					return getMessage('portFacilities');
					break;
				case 'PA':
					return getMessage('publicAirports');
					break;
				case 'WC':
					return getMessage('wildlifeConservation');
					break;
				case 'NS':
					return getMessage('negotiatedSales');
					break;
				case 'SH':
					return getMessage('selfHelp');
					break;
				case 'LE':
					return getMessage('lawEnforcement');
					break;
				case 'FT':
					return getMessage('federalTransfer');
					break;
				case 'SL':
					return getMessage('sale');
					break;
				case 'SN':
					return getMessage('negotiatedSale');
					break;
				case 'SP':
					return getMessage('publicSale');
					break;
				case 'DM':
					return getMessage('demolition');
					break;
				case 'LX':
					return getMessage('leaseTermination');
					break;
				case 'OT':
					return getMessage('other');
					break;
				default: 
					return value;
			}
		  break;
		  
		default:
		  return value;
		}
	}
})

function approveTransactionDetails(){
	var property = transactionDetailsCtr.selectedProperty;
	var transaction = transactionDetailsCtr.selectedTrans;
	var user = View.user.name;
	var type = transactionDetailsCtr.panelTransactionGeneralInfo.getFieldValue('grp_trans.trans_type');
	View.confirm(getMessage('msg_approve_transaction'),function(button){
		if(button == 'yes'){
			transactionDetailsCtr.panelTransactionGeneralInfo.save();
			try{
				var result = Workflow.callMethod('AbRPLMGovPropertyRegistry-GovPropertyRegistryService-approveGovPropRegDataTransaction', property, transaction, user);
				transactionDetailsCtr.panelTransactionGeneralInfo.refresh({'grp_trans.grp_trans_id':transactionDetailsCtr.selectedTrans}, false);
				transactionDetailsCtr.panelTransactionDetailInfo.addParameter('selectedTrans',transactionDetailsCtr.selectedTrans);
				transactionDetailsCtr.panelTransactionDetailInfo.refresh();
				var openerController;
				if(transactionDetailsCtr.view.getOpenerView().controllers.get('mngRPIPropTrans')!= undefined){
					openerController = transactionDetailsCtr.view.getOpenerView().controllers.get('mngRPIPropTrans');
				}else if(transactionDetailsCtr.view.getOpenerView().controllers.get('transByUniqueId')!= undefined){
					openerController = transactionDetailsCtr.view.getOpenerView().controllers.get('transByUniqueId');
				}else if(transactionDetailsCtr.view.getOpenerView().controllers.get('transByRequestor')!= undefined){
					openerController = transactionDetailsCtr.view.getOpenerView().controllers.get('transByRequestor');
				}
				if(openerController != undefined){
					openerController.doRefresh();
				}
				transactionDetailsCtr.view.closeThisDialog();
			}catch(e){
				Workflow.handleError(e);
			}
		}
	});
}

function rejectTransactionDetails(){
	var property = transactionDetailsCtr.selectedProperty;
	var transaction = transactionDetailsCtr.selectedTrans;
	var user = View.user.name;
	View.confirm(getMessage('msg_reject_transaction'),function(button){
		if(button == 'yes'){
			transactionDetailsCtr.panelTransactionGeneralInfo.save();
			try{
				var result = Workflow.callMethod('AbRPLMGovPropertyRegistry-GovPropertyRegistryService-rejectGovPropRegDataTransaction', property, transaction, user);
				transactionDetailsCtr.panelTransactionGeneralInfo.refresh({'grp_trans.grp_trans_id':transactionDetailsCtr.selectedTrans}, false);
				transactionDetailsCtr.panelTransactionDetailInfo.addParameter('selectedTrans',transactionDetailsCtr.selectedTrans);
				transactionDetailsCtr.panelTransactionDetailInfo.refresh();
				var openerController;
				if(transactionDetailsCtr.view.getOpenerView().controllers.get('mngRPIPropTrans')!= undefined){
					openerController = transactionDetailsCtr.view.getOpenerView().controllers.get('mngRPIPropTrans');
				}else if(transactionDetailsCtr.view.getOpenerView().controllers.get('transByUniqueId')!= undefined){
					openerController = transactionDetailsCtr.view.getOpenerView().controllers.get('transByUniqueId');
				}else if(transactionDetailsCtr.view.getOpenerView().controllers.get('transByRequestor')!= undefined){
					openerController = transactionDetailsCtr.view.getOpenerView().controllers.get('transByRequestor');
				}
				if(openerController != undefined){
					openerController.doRefresh();
				}
				transactionDetailsCtr.view.closeThisDialog();
			}catch(e){
				Workflow.handleError(e);
			}
		}
	});
}
