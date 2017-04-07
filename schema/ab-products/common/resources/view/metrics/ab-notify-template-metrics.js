var abNotifyTemplateCtrl = View.createController('abNotifyTemplateCtrl', {
	
	triggerConditionTo:{
		'limit_high_warning': 'limit_high_warning',
		'limit_high_critical': 'limit_high_critical',
		'limit_low_warning': 'limit_low_warning',
		'limit_low_critical': 'limit_low_critical',
		'limit_low_high_warning': 'limit_low_high_warning',
		'limit_low_high_critical': 'limit_low_high_critical',
		'limit_low_target': 'limit_low_target',
		'limit_high_target': 'limit_high_target'
	},
	
	selectedTemplateId: null,
	
	selectedTemplateIds: null,
	
	afterViewLoad: function(){
		var controller = this;
		this.abNotifyTemplate_list.afterCreateCellContent = function(row, column, cellElement){
			if(column.id == 'notify_templates.trigger_condition_to'){
				cellElement.childNodes[0].textContent =  formatMessage(getMessage(cellElement.childNodes[0].textContent));
			} 
		}
	},
	
	afterInitialDataFetch: function(){
		this.abNotifyTemplateTabs.enableTab('abNotifyTemplateTabs_define', false);
		this.abNotifyTemplateTabs.enableTab('abNotifyTemplateTabs_assign', false);
		this.abNotifyTemplateFilter_console_onFilter();
	},
	
	abNotifyTemplateFilter_console_onFilter: function(){
		var restriction = new Ab.view.Restriction();
		var sqlRestriction = "notify_templates.activity_id = 'AbSystemAdministration' ";
		// template id
		var value = this.abNotifyTemplateFilter_console.getFieldValue('notify_templates.template_id');
		if(valueExistsNotEmpty(value)){
			if(this.abNotifyTemplateFilter_console.hasFieldMultipleValues('notify_templates.template_id')) {
				var values = this.abNotifyTemplateFilter_console.getFieldMultipleValues('notify_templates.template_id');
				restriction.addClause('notify_templates.template_id', values, 'IN');
			}else{
				restriction.addClause('notify_templates.template_id', value, 'LIKE');
			}
		}
		// category
		var value = this.abNotifyTemplateFilter_console.getFieldValue('notify_templates.notify_cat');
		if(valueExistsNotEmpty(value)){
			if(this.abNotifyTemplateFilter_console.hasFieldMultipleValues('notify_templates.notify_cat')) {
				var values = this.abNotifyTemplateFilter_console.getFieldMultipleValues('notify_templates.notify_cat');
				restriction.addClause('notify_templates.notify_cat', values, 'IN');
			}else{
				restriction.addClause('notify_templates.notify_cat', value, 'LIKE');
			}
		}
		// metrics
		var value = this.abNotifyTemplateFilter_console.getFieldValue('afm_metric_notify.metric_name');
		if(valueExistsNotEmpty(value)){
			if(this.abNotifyTemplateFilter_console.hasFieldMultipleValues('afm_metric_notify.metric_name')) {
				var values = this.abNotifyTemplateFilter_console.getFieldMultipleValues('afm_metric_notify.metric_name');
				
				sqlRestriction += " AND EXISTS(SELECT afm_metric_notify.metric_name FROM afm_metric_notify WHERE afm_metric_notify.template_id = notify_templates.template_id AND afm_metric_notify.metric_name  IN ('" + makeSafeSqlValue(values).join("', '") + "'))";
			}else{
				sqlRestriction += " AND EXISTS(SELECT afm_metric_notify.metric_name FROM afm_metric_notify WHERE afm_metric_notify.template_id = notify_templates.template_id AND afm_metric_notify.metric_name  LIKE  '" + makeSafeSqlValue(value) + "')";
			}
		}
		// recipients email
		var value = this.abNotifyTemplateFilter_console.getFieldValue('notify_templates.notify_recipients_email');
		if(valueExistsNotEmpty(value)){
			if(this.abNotifyTemplateFilter_console.hasFieldMultipleValues('notify_templates.notify_recipients_email')) {
				var values = this.abNotifyTemplateFilter_console.getFieldMultipleValues('notify_templates.notify_recipients_email');
				var emailSQL = "";
				for(var i = 0; i < values.length; i++){
					emailSQL += (emailSQL.length > 0? " OR ": "") + "notify_templates.notify_recipients LIKE '%" + makeSafeSqlValue(values[i]) + "%' ";
				}
				
				sqlRestriction += "AND ( " + emailSQL + ")";
			}else{
				sqlRestriction += " AND notify_templates.notify_recipients LIKE '%" + makeSafeSqlValue(value) + "%' ";
			}
		}
		
		this.abNotifyTemplate_list.addParameter('sqlRestriction', sqlRestriction);
		this.abNotifyTemplate_list.refresh(restriction);
	},
	
	abNotifyTemplate_list_onAddNew: function(){
		this.onSelectTemplate(null);
	},
	
	abNotifyTemplate_list_onAssign: function(){
		var records = this.abNotifyTemplate_list.getSelectedRecords();
		if(records.length == 0){
			View.showMessage(getMessage('errNoSelection'));
			return false;
		}
		
		var templateIds = [];
		for(var i = 0; i < records.length ; i++){
			templateIds.push(records[i].getValue('notify_templates.template_id'));
		}
		
		this.onAssignToMetric(templateIds)
	},
	
	abNotifyTemplate_form_onAssign: function(){
		var templateId = this.abNotifyTemplate_form.getFieldValue('notify_templates.template_id');
		var templateIds = [];
		templateIds.push(templateId);
		
		this.onAssignToMetric(templateIds);
	},
	
	onAssignToMetric: function(templateIds){
		this.selectedTemplateIds = templateIds;
		
		var restriction = "afm_metric_definitions.collect_formula <> 'CollectSpaceTrendingMetrics' AND calc_type = 'Tracking Metrics' " +
				"AND NOT EXISTS(SELECT afm_metric_notify.metric_name FROM afm_metric_notify WHERE afm_metric_notify.metric_name = afm_metric_definitions.metric_name AND afm_metric_notify.template_id IN ('" + templateIds.join("', '") + "'))";
		this.abMetric_list.refresh(restriction);
		this.abMetric_list.showInWindow({
			width: 800,
			height:800,
			closeButton: false
		});
	},
	
	abMetric_list_onSave: function(){
		var templateIds = this.selectedTemplateIds;
		var recMetrics = this.abMetric_list.getSelectedRecords();
		if(recMetrics.length == 0){
			View.showMessage(getMessage('errNoSelection'));
			return false;
		}
		
		var metricTemplatesDs = this.view.dataSources.get('abMetricNotify_ds');
		for(var i = 0; i < templateIds.length; i++) {
			var templateId = templateIds[i];
			for(var j = 0; j < recMetrics.length; j++) {
				var metricName = recMetrics[j].getValue('afm_metric_definitions.metric_name');
				var record = new Ab.data.Record({
					'afm_metric_notify.metric_name': metricName,
					'afm_metric_notify.template_id': templateId
				}, true);
				metricTemplatesDs.saveRecord(record);
			}
		}
		this.refreshAssignedMetrics(this.selectedTemplateId);
		this.selectedTemplateIds = null;
		this.abMetric_list.closeWindow();
	},
	
	abNotifyTemplate_form_onSave: function(){
		if(this.abNotifyTemplate_form.getFieldValue("notify_templates.notify_subject") && this.abNotifyTemplate_form.getFieldValue("notify_templates.notify_subject_id") || 
			!this.abNotifyTemplate_form.getFieldValue("notify_templates.notify_subject") && !this.abNotifyTemplate_form.getFieldValue("notify_templates.notify_subject_id")){

			View.showMessage(getMessage("onlyOneSubject"));
			return false;
		}
		
		var notifyCondition = this.abNotifyTemplate_form.getFieldValue('notify_condition');
		if(valueExistsNotEmpty(notifyCondition)){
			for(var triggerConditionToValue in this.triggerConditionTo){
				if(notifyCondition == this.triggerConditionTo[triggerConditionToValue]){
					this.abNotifyTemplate_form.setFieldValue('notify_templates.trigger_condition_to', triggerConditionToValue);
					break;
				}
			}
		}

		var metricCollectGroupBy = this.abNotifyTemplate_form.getFieldValue('notify_templates.metric_collect_group_by');
		if(valueExistsNotEmpty(metricCollectGroupBy)){
			metricCollectGroupBy = metricCollectGroupBy.split(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR).join(',');
			this.abNotifyTemplate_form.setFieldValue('notify_templates.metric_collect_group_by', metricCollectGroupBy);
		}
		
		if(this.abNotifyTemplate_form.save()){
			// we must keep this field with multiple value separator
			var metricCollectGroupBy = this.abNotifyTemplate_form.getFieldValue('notify_templates.metric_collect_group_by');
			if(valueExistsNotEmpty(metricCollectGroupBy)){
				metricCollectGroupBy = metricCollectGroupBy.split(',').join(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
				this.abNotifyTemplate_form.setFieldValue('notify_templates.metric_collect_group_by', metricCollectGroupBy);
			}
			this.abNotifyTemplateFilter_console_onFilter();
			this.selectedTemplateId = this.abNotifyTemplate_form.getFieldValue('notify_templates.template_id');
			return true;
		}else{
			// we must keep this field with multiple value separator
			var metricCollectGroupBy = this.abNotifyTemplate_form.getFieldValue('notify_templates.metric_collect_group_by');
			if(valueExistsNotEmpty(metricCollectGroupBy)){
				metricCollectGroupBy = metricCollectGroupBy.split(',').join(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
				this.abNotifyTemplate_form.setFieldValue('notify_templates.metric_collect_group_by', metricCollectGroupBy);
			}
			return false;
		}
	},
	
	abNotifyTemplate_form_afterRefresh: function(){
		// format assigned granularity field
		var metricCollectGroupBy = this.abNotifyTemplate_form.getFieldValue('notify_templates.metric_collect_group_by');
		if(valueExistsNotEmpty(metricCollectGroupBy)){
			metricCollectGroupBy = metricCollectGroupBy.split(',').join(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
			this.abNotifyTemplate_form.setFieldValue('notify_templates.metric_collect_group_by', metricCollectGroupBy);
		}
		if(!this.abNotifyTemplate_form.newRecord){
			var triggerConditionTo = this.abNotifyTemplate_form.getFieldValue('notify_templates.trigger_condition_to');
			if(valueExistsNotEmpty(triggerConditionTo)){
				this.abNotifyTemplate_form.setFieldValue('notify_condition', this.triggerConditionTo[triggerConditionTo]);
			}
		}
	},
	
	abNotifyTemplate_form_onSaveAndNew: function(){
		if(this.abNotifyTemplate_form_onSave()){
			this.abNotifyTemplate_form.refresh(null, true);
		}
	},
	
	abNotifyTemplate_form_onCopy: function(){
		this.abNotifyTemplate_form.setFieldValue('notify_templates.template_id', '');
		this.abNotifyTemplate_form.newRecord = true;
		this.abNotifyTemplate_form.evaluateExpressions();
	},
	
	onSelectTemplate: function(templateId){
		this.selectedTemplateId = templateId;
		var newRecord = true;
		var restriction = null;
		if(valueExistsNotEmpty(this.selectedTemplateId)){
			newRecord = false;
			restriction = new Ab.view.Restriction({'notify_templates.template_id': this.selectedTemplateId});
		}
		this.abNotifyTemplate_form.refresh(restriction, newRecord);
		if(newRecord){
			this.abNotifyTemplate_form.setFieldValue('notify_templates.trigger_date_field', 'metric_date');
		}
		this.refreshAssignedMetrics(this.selectedTemplateId);
		
		this.abNotifyTemplateTabs.selectTab('abNotifyTemplateTabs_define');
		this.abNotifyTemplateTabs.enableTab('abNotifyTemplateTabs_assign', true);
	},
	
	onUnassignMetric: function(metricName){
		var metricTemplatesDs = this.view.dataSources.get('abMetricNotify_ds');
		var record = new Ab.data.Record({
			'afm_metric_notify.metric_name': metricName,
			'afm_metric_notify.template_id': this.selectedTemplateId
		}, false);
		metricTemplatesDs.deleteRecord(record);
		this.refreshAssignedMetrics(this.selectedTemplateId);
	},
	
	refreshAssignedMetrics: function(templateId){
		if(!valueExistsNotEmpty(templateId)){
			templateId = 'null';
		}
		var restriction = "EXISTS(SELECT afm_metric_notify.metric_name  FROM afm_metric_notify WHERE afm_metric_notify.metric_name = afm_metric_definitions.metric_name AND afm_metric_notify.template_id = '" + templateId + "')";
		this.abAssignedMetrics_list.refresh(restriction);
	},
	
	afterModifyTemplate: function(){
		this.abNotifyTemplateFilter_console_onFilter();
		this.refreshAssignedMetrics(this.selectedTemplateId);
	}
});

/**
 * On click Select button from row.
 * @param context
 * 
 */
function onSelectTemplate(context) {
	var controller = View.controllers.get('abNotifyTemplateCtrl');
	var templateId = context.row.getFieldValue('notify_templates.template_id');
	controller.onSelectTemplate(templateId);
}

/**
 * On click Unassign button
 * 
 * @param context
 */
function onUnassignMetric(context){
	var controller = View.controllers.get('abNotifyTemplateCtrl');
	var metricName = context.row.getFieldValue('afm_metric_definitions.metric_name');
	controller.onUnassignMetric(metricName);
}

/**
 * After delete template.
 */
function afterDeleteTemplate(){
	var controller = View.controllers.get('abNotifyTemplateCtrl');
	controller.afterModifyTemplate()
	controller.abNotifyTemplateFilter_console_onFilter();
	controller.abNotifyTemplateTabs.selectTab('abNotifyTemplateTabs_select');
	controller.abNotifyTemplateTabs.enableTab('abNotifyTemplateTabs_define', false);
	controller.abNotifyTemplateTabs.enableTab('abNotifyTemplateTabs_assign', false);
}

function formatMessage(message){
	if(valueExists(message)){
		message = message.replace('&gt;', '>');
		message = message.replace('&lt;', '<');
	}
	return message;
}

