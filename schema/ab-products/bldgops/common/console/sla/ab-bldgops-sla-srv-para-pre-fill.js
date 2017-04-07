/**
 * Controller for pre-fll service parameters
 */
View.createController('servicePreFill', {

	/**
	 * Response Parameter.
	 */
	responseParameter : null,

	/**
	 * Template Name.
	 */
	templateName : null,
	
	/**
	 * Hide details form by default.
	 */
	afterInitialDataFetch : function() {
		this.serviceParametersReport.show(false);
	},

	/**
	 * Apply the selected pre-fill.
	 */
	servicePreFillList_onSave : function() {
		if (this.responseParameter) {
			var controler = this;
			var parentWindowController = View.getOpenerView().preFillParentController;
			var isSelectTemplateValue = View.getOpenerView().isSelectTemplateValue;

			if (parentWindowController && isSelectTemplateValue) {
				
				var isOverWrite = confirm(getMessage("confirmOverWrite"));
				if (isOverWrite) {
					// call callback function in parent pre-fill contoller
					parentWindowController.afterPreFillServiceTemplate(controler.responseParameter);
					
				}else{
					return;
				}
			}
			
			var slaTemplateForm = View.getOpenerView().slaTemplateForm;
			var slaTemplateFieldId = View.getOpenerView().slaTemplateFieldId;
			if (slaTemplateForm && slaTemplateFieldId) {
				slaTemplateForm.setFieldValue(slaTemplateFieldId, controler.templateName, null, false);
			}
			
			View.closeThisDialog();

		} else {
			View.alert(getMessage('noTemplateSelected'))
		}
	},

	/**
	 * Show selected template in details panel.
	 */
	servicePreFillList_onShowTemplate : function(row) {
		this.serviceParametersReport.show(true);
		
		this.templateName = row.getFieldValue('helpdesk_sla_response.service_name');
		this.responseParameter = this.getResponsParameterFromTemplate(this.templateName);

		var form = this.serviceParametersReport;
		//KB3042944 - hide empty fields
		form.showField('helpdesk_sla_response.servcont_id', false);
		form.showField('helpdesk_sla_response.manager', false);
		form.showField('serviceWindow', false);
		form.showField('timeToResponse', false);
		form.showField('timeToComplete', false);
		
		if(this.responseParameter.contractId){
			form.showField('helpdesk_sla_response.servcont_id', true);
			form.setFieldValue('helpdesk_sla_response.servcont_id', this.responseParameter.contractId);
		}
		if(this.responseParameter.manager){
			form.showField('helpdesk_sla_response.manager', true);
			form.setFieldValue('helpdesk_sla_response.manager', this.responseParameter.manager);
		}
		

		if(this.responseParameter.servWindowStart){
			form.showField('serviceWindow', true);
			Ext.fly('serviceParametersReport_serviceWindow').update(SLA_formatTimeFieldValue(this.responseParameter.servWindowStart) + '-' + SLA_formatTimeFieldValue(this.responseParameter.servWindowEnd));
		}
		
		if(this.responseParameter.timeToRespond){
			form.showField('timeToResponse', true);
			Ext.fly('serviceParametersReport_timeToResponse').update(this.responseParameter.timeToRespond + ' ' + SLA_getIntervalDisplayedValue(this.responseParameter.intervalToRespond));
		}
		
		if(this.responseParameter.timeToComplete){
			form.showField('timeToComplete', true);
			Ext.fly('serviceParametersReport_timeToComplete').update(this.responseParameter.timeToComplete + ' ' + SLA_getIntervalDisplayedValue(this.responseParameter.intervalToComplete));
		}

	},

	/**
	 * Show selected template in summary panel.
	 */
	getResponsParameterFromTemplate : function(templateName) {
		var responseParameter = new Ab.operation.express.sla.ResponseParameters();
		responseParameter.loadFromTemplate(templateName, 'service');
		return responseParameter;
	}

});
