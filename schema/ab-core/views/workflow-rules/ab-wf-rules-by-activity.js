
var wfrByActivityController = View.createController('wfrByActivityController', {
	// date format  "MM-dd-yyyy HH:mm:ss"
	startDateTime: "",
	endDateTime: "",
	runOnStartup: false,
	repeatCount: -1,
	repeatInterval: 3600,
	expression: "",
	invokeEvery: "hour",
	
	xmlString: null,
	xmlDoc: null,
	
	afterViewLoad: function(){
		this.wfrFormPanel.fields.get('afm_wf_rules.xml_sched_props').actions.get('edit').setTitle(getMessage('labelEdit'));
		this.wfrFormPanel.fields.get('afm_wf_rules.xml_sched_props').actions.get('edit').config.tooltip = getMessage('labelEdit');
		$("spanHour").innerHTML = getMessage("labelHour");
		$("spanDay").innerHTML = getMessage("labelDay");
		$("spanWeek").innerHTML = getMessage("labelWeek");
		$("spanCron").innerHTML = getMessage("labelCron");
	},
	/**
	 * After refreshing the form, set the 'Active?' & 'Rule Type' select field value
	 * and the form field value from the form record.
	 * Call the other methods to enable / disable
	 */
	wfrFormPanel_afterRefresh: function() {
		this.setRuleProps();
		this.setSchedProps();
	},

	/**
	 * Reloads workflow rules for the current project.
	 */
	wfrReportPanel_onReloadWorkflowRules: function() {
        View.confirm(getMessage('reloadConfirmation'), function(button) {
            if (button == 'yes') {
                try {				
                	View.openProgressBar(getMessage('reloadProgress'));
        			var result = Workflow.callMethod('AbSystemAdministration-ConfigHandlers-reloadWorkflowRules');
                	View.closeProgressBar();
        			View.alert(result.message);
        			//View.reload();
                }
				catch (e) {
					Workflow.handleError(e);
                }
            }
		});
	},

	/**
	 * Reloads workflow rules for the current project.
	 */
    wfrReportPanel_onShowBeans: function() {
        try {
            var result = Workflow.callMethod('AbSystemAdministration-ConfigHandlers-findWorkflowRulesDefinedAsSpringBeans');
            var template = View.templates.get('beansListTemplate');
            template.render({
                workflowRules: result.data
            }, this.beansList.parentElement);
            this.beansList.showInWindow({
                title: getMessage('beansListTitle'),
                x: 400,
                y: 200,
                width: 500,
                height: 500
            });
            this.beansList.updateHeight();
        } catch (e) {
			Workflow.handleError(e);
        }
	},

	/**
	 * After is_active field is changed enable / disable associated fields
	 *
	 */
	 setRuleProps: function() {
		var isActive = this.wfrFormPanel.getFieldValue('afm_wf_rules.is_active');
		
		if (isActive == "0") {
			this.wfrFormPanel.enableField('afm_wf_rules.eventHandlerClass', false);
			this.wfrFormPanel.enableField('afm_wf_rules.eventHandlerMethod', false);
			this.wfrFormPanel.enableField('afm_wf_rules.description', false);
		}else {
			this.wfrFormPanel.enableField('afm_wf_rules.eventHandlerClass', true);
			this.wfrFormPanel.enableField('afm_wf_rules.eventHandlerMethod', true);
			this.wfrFormPanel.enableField('afm_wf_rules.description', true);
		}
	
	},


	/**
	 * After rule_type field is changed enable / disable associated fields
	 *
	 */
	setSchedProps: function() {
		var ruleType = this.wfrFormPanel.getFieldValue('afm_wf_rules.rule_type').toUpperCase();
		
		if (ruleType != "SCHEDULED") {
			this.wfrFormPanel.enableField('afm_wf_rules.xml_sched_props', false);
			this.wfrFormPanel.fields.get('afm_wf_rules.xml_sched_props').actions.get('edit').show(false);
			this.wfrFormPanel.setFieldValue('afm_wf_rules.xml_sched_props', '');
		} else {
			this.wfrFormPanel.enableField('afm_wf_rules.xml_sched_props', false);
			this.wfrFormPanel.fields.get('afm_wf_rules.xml_sched_props').actions.get('edit').show(true);
			this.wfrFormPanel.fields.get('afm_wf_rules.xml_sched_props').actions.get('edit').enableButton(true);
		}
	},
	
	/**
	 * Open pop-up with scheduled properties.
	 */
	editScheduledProperties: function() {
		this.schedPropFormPanel.refresh();
		this.schedPropFormPanel.showInWindow
	},
	
	schedPropFormPanel_afterRefresh: function(){
		this.setScheduledPropertiesValues();
		
	},
	
	setScheduledPropertiesValues: function(){
		this.xmlString = this.wfrFormPanel.getFieldValue('afm_wf_rules.xml_sched_props');
		if (valueExistsNotEmpty(this.xmlString)) {
			this.xmlDoc = parseXml(this.xmlString, null, false);
			// get Nodes
			var scheduleNode = (this.xmlDoc.getElementsByTagName("schedule").length > 0 ? this.xmlDoc.getElementsByTagName("schedule")[0]:null);
			var simpleNode = (this.xmlDoc.getElementsByTagName("simple").length > 0 ? this.xmlDoc.getElementsByTagName("simple")[0]:null);
			var cronNode = (this.xmlDoc.getElementsByTagName("cron").length > 0 ? this.xmlDoc.getElementsByTagName("cron")[0]:null);
			// get attributes
			if (valueExistsNotEmpty(scheduleNode)) {
				this.startDateTime = scheduleNode.getAttribute("startTime");
				this.endDateTime = scheduleNode.getAttribute("endTime");
				this.runOnStartup = (scheduleNode.getAttribute("runOnStartup").toLowerCase() == "true"? true:false);
			}
			if (valueExistsNotEmpty(simpleNode)) {
				this.repeatCount = simpleNode.getAttribute("repeatCount");
				this.repeatInterval = simpleNode.getAttribute("repeatInterval");
				this.invokeEvery = this.getInvokePeriod(this.repeatInterval);
			}
			if (valueExistsNotEmpty(cronNode)) {
				this.expression = cronNode.getAttribute("expression");
				this.invokeEvery = "cron";
			}
		}
		// set current values to form
		if (this.runOnStartup) {
			$("run_at_start").checked = true;
		}
		
		var objStartDate = xmlToDate(this.startDateTime);
		var objEndDate = xmlToDate(this.endDateTime);
		
		this.schedPropFormPanel.setFieldValue('start_date', this.schedPropFormPanel.fields.get('start_date').fieldDef.formatValue(objStartDate));
		this.schedPropFormPanel.setFieldValue('start_time', this.schedPropFormPanel.fields.get('start_time').fieldDef.formatValue(objStartDate));
		
		this.schedPropFormPanel.setFieldValue('end_date', this.schedPropFormPanel.fields.get('end_date').fieldDef.formatValue(objEndDate));
		this.schedPropFormPanel.setFieldValue('end_time', this.schedPropFormPanel.fields.get('end_time').fieldDef.formatValue(objEndDate));
		
		var objRadio = document.getElementsByName('invoke_every');
		for (var i = 0; i < objRadio.length; i++) {
			var optRadio = objRadio[i];
			if (optRadio.value == this.invokeEvery) {
				optRadio.checked = true;
				break;
			}
		}
		this.schedPropFormPanel.setFieldValue('repeat_count', this.repeatCount);
		this.schedPropFormPanel.setFieldValue('cron_expression', this.expression);
		this.checkInvokeRule();
		
	},
	
	checkInvokeRule: function(){
		var objRadio = document.getElementsByName('invoke_every');
		for (var i = 0; i < objRadio.length; i++) {
			var optRadio = objRadio[i];
			if (optRadio.checked) {
				if (optRadio.value == 'cron') {
					this.schedPropFormPanel.enableField("cron_expression", true);
					this.schedPropFormPanel.enableField("repeat_count", false);
					this.schedPropFormPanel.setFieldValue("repeat_count", -1);
				} else{
					this.schedPropFormPanel.enableField("repeat_count", true);
					this.schedPropFormPanel.enableField("cron_expression", false);
					this.schedPropFormPanel.setFieldValue("cron_expression", "");
				}
			} 
		}
	},
	
	getInvokePeriod: function(interval){
		if (interval == 3600) {
			return "hour";
		} else if (interval == 86400) {
			return "day";
		} else if (interval == 604800) {
			return "week";
		} else {
			// is a different value - set to default
			this.repeatInterval = 3600;
			return "hour";
		}
	},
	
	getRepeatInterval: function(period){
		if (period == "hour") {
			return 3600;
		} else if (period == "day") {
			return 86400;
		} else if (period == "week") {
			return 604800;
		} else {
			return 3600;
		}
	},
	/**
	 * Save Scheduled properties.
	 */
	schedPropFormPanel_onSave: function(){
		if (this.validateScheduledProperties()) {
			this.xmlString = this.getScheduledPropertiesString();
			this.wfrFormPanel.setFieldValue('afm_wf_rules.xml_sched_props', this.xmlString);
			this.schedPropFormPanel.closeWindow();
		}
	},
	
	validateScheduledProperties: function(){
		var form = this.schedPropFormPanel;
		var dateFieldDef = form.fields.get('start_date').fieldDef;
		var timeFieldDef = form.fields.get('start_time').fieldDef;
		
		this.runOnStartup = $("run_at_start").checked;
		
		// start date and end date
		var startDate = dateFieldDef.parseValue(form.getFieldValue('start_date'), false);
		var startTime = timeFieldDef.parseValue(form.getFieldValue('start_time'), false);
		if(valueExistsNotEmpty(startTime)){
			startDate.setHours(startTime.getHours());
			startDate.setMinutes(startTime.getMinutes());
			startDate.setSeconds(startTime.getSeconds());
		}
		
		var endDate = dateFieldDef.parseValue(form.getFieldValue('end_date'), false);
		var endTime = timeFieldDef.parseValue(form.getFieldValue('end_time'), false);
		if(valueExistsNotEmpty(endDate) && valueExistsNotEmpty(endTime)){
			endDate.setHours(endTime.getHours());
			endDate.setMinutes(endTime.getMinutes());
			endDate.setSeconds(endTime.getSeconds());
		}
		
		if (valueExistsNotEmpty(startDate) && valueExistsNotEmpty(endDate) && startDate.getTime() >= endDate.getTime()) {
			View.showMessage(getMessage("errStartEndDateTime"));
			return false;
		}
		
		this.startDateTime = dateToXML(startDate);
		this.endDateTime = dateToXML(endDate);
		
		// invoke period is repeat count
		var objRadio = document.getElementsByName('invoke_every');
		for (var i = 0; i < objRadio.length; i++) {
			var optRadio = objRadio[i];
			if (optRadio.checked) {
				this.invokeEvery = optRadio.value;
				break;
			}
		}
		
		this.repeatInterval = this.getRepeatInterval(this.invokeEvery);
		this.repeatCount = form.getFieldValue('repeat_count');
		if (this.invokeEvery != "cron" && this.repeatCount <= 0 && this.repeatCount != -1) {
			View.showMessage(getMessage("errRepeatCount"));
			return false;
		}
		
		this.expression = form.getFieldValue('cron_expression');
		if (this.invokeEvery == "cron" &&  !valueExistsNotEmpty(this.expression)) {
			View.showMessage(getMessage("errEmptyCronExpression"));
			return false;
		}
		if (this.invokeEvery == "cron" &&  !this.validateCronExpression(this.expression)) {
			View.showMessage(getMessage("errEmptyCronExpression"));
			return false;
		}
		return true;
	},
	
	validateCronExpression: function(expression){
		return true;
	},
	
	getScheduledPropertiesString: function(){
		var xmlString = '<xml_schedule_properties>';
		xmlString += '<schedule startTime="'+this.startDateTime +'" endTime="'+this.endDateTime +'" runOnStartup="' + this.runOnStartup + '">';
		if (this.invokeEvery == "cron") {
			xmlString += '<cron expression="' + this.expression + '"/>';
		}else{
			xmlString += '<simple repeatCount="'+ this.repeatCount + '" repeatInterval="'+this.repeatInterval+'"/>';
		}
		xmlString += '</schedule>';
		xmlString += "</xml_schedule_properties>";
		return xmlString;
	}
});

/**
 * Convert XML date string into date object.
 * Pattern "MM-dd-yyyy HH:mm:ss"
 * @param xmlDateTime
 */
function xmlToDate(xmlDateTime) {
	var result = "";
	if (valueExistsNotEmpty(xmlDateTime)) {
		var xmlDate = xmlDateTime.split(" ")[0];
		var xmlTime = xmlDateTime.split(" ")[1];
		
		var month = xmlDate.split("-")[0];
		var day = xmlDate.split("-")[1];
		var year = xmlDate.split("-")[2];

		var hour = xmlTime.split(":")[0];
		var minute = xmlTime.split(":")[1];
		var second = xmlTime.split(":")[2];
		result = new Date(year, month-1, day, hour, minute, second, 0);
	}
	return result;
}

/**
 * Convert date object to XML format
 * Pattern "MM-dd-yyyy HH:mm:ss"
 * @param date
 */
function dateToXML(objDate) {
	var result = "";
	if (valueExistsNotEmpty(objDate)) {
		result = ((objDate.getMonth() + 1)<10?'0'+ (objDate.getMonth() + 1):objDate.getMonth() + 1) + "-";
		result +=  (objDate.getDate()<10?'0'+objDate.getDate():objDate.getDate()) + "-";
		result +=  objDate.getFullYear() + " ";
		result +=  (objDate.getHours()<10?'0'+objDate.getHours():objDate.getHours()) + ":";
		result +=  (objDate.getMinutes()<10?'0'+objDate.getMinutes():objDate.getMinutes()) + ":";
		result +=  (objDate.getSeconds()<10?'0'+objDate.getSeconds():objDate.getSeconds());
	}
	return result;
}

