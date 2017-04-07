/**
 * Controller for step dialog.
 */
View.createController('stepDialog', {

	step : null,

	/**
	 * Maps DOM events to event listeners. Each event is defined using the following format:
	 */
	events : {
		/**
		 * Event handler for save step.
		 * 
		 * @param event
		 */
		'click #saveButton' : 'saveStep',

		/**
		 * Event handler for close step dialog.
		 * 
		 * @param event
		 */
		'click #closeStepDialogButton' : function(event) {
			this.trigger('app:operation:express:sla:updateOptionalSteps');
			this.close();
		},

		/**
		 * Event handler for select condition field.
		 * 
		 * @param event
		 */
		'click .selectConditionButton' : function(event) {
			this.selectConditionValues(event.target.id.replace('selectConditionButton', ''));
		},

		/**
		 * Event handler for select employee .
		 * 
		 * @param event
		 */
		'click #stepDialog\\.helpdesk_sla_steps\\.em_id_selectValue' : 'selectEmployee',

		/**
		 * Event handler for select Vendor .
		 * 
		 * @param event
		 */
		'click #stepDialog\\.helpdesk_sla_steps\\.vn_id_selectValue' : 'selectVendor',

		/**
		 * Event handler for select Craftsperson .
		 * 
		 * @param event
		 */
		'click #stepDialog\\.helpdesk_sla_steps\\.cf_id_selectValue' : 'selectCraftsperson',

		/**
		 * Event handler for select afm role .
		 * 
		 * @param event
		 */
		'click #stepDialog\\.helpdesk_sla_steps\\.role_name_selectValue' : 'selectAfmRole',

		/**
		 * Event handler for select service desk role .
		 * 
		 * @param event
		 */
		'change .helpdesk_sla_steps_role' : 'selectRole',
		
		/**
		 * Event handler for change employee.
		 * 
		 * @param event
		 */
		'change #stepDialog_helpdesk_sla_steps\\.em_id' : function(event) {
			this.enableField("helpdesk_sla_steps.em_id");
		},
		
		/**
		 * Event handler for change cf_id.
		 * 
		 * @param event
		 */
		'change #stepDialog_helpdesk_sla_steps\\.cf_id' : function(event) {
			this.enableField("helpdesk_sla_steps.cf_id");
		},
		
		/**
		 * Event handler for change vn_id.
		 * 
		 * @param event
		 */
		'change #stepDialog_helpdesk_sla_steps\\.vn_id' : function(event) {
			this.enableField("helpdesk_sla_steps.vn_id");
		},
		
		/**
		 * Event handler for change afm role .
		 * 
		 * @param event
		 */
		'change #stepDialog_helpdesk_sla_steps\\.role_name' : function(event) {
			this.enableField("helpdesk_sla_steps.role_name");
		}
	},

	/**
	 * After controller created.
	 */
	afterCreate : function() {
		this.on('app:operation:express:sla:addStep', this.addStep);
		this.on('app:operation:express:sla:editStep', this.editStep);
		
		//Update UI to make it support smart search
		this.updateUI();
	},

	/**
	 * After view loaded, load condition fields
	 */
	afterViewLoad : function() {
		this.loadConditions();
		
		jQuery('#saveButton').parent().parent().css('height',100);
	},
	
	/**
	 * Clear the default select value dialog command
	 */
	afterInitialDataFetch : function() {
		View.panels.get('stepDialog').fields.get("helpdesk_sla_steps.em_id").actions.get(0).command.commands[0].showDialog = false;
		View.panels.get('stepDialog').fields.get("helpdesk_sla_steps.cf_id").actions.get(0).command.commands[0].showDialog = false;
		View.panels.get('stepDialog').fields.get("helpdesk_sla_steps.vn_id").actions.get(0).command.commands[0].showDialog = false;
		View.panels.get('stepDialog').fields.get("helpdesk_sla_steps.role_name").actions.get(0).command.commands[0].showDialog = false;
	},
	
	/**
	 * Update UI to make it support smart search
	 */
	updateUI : function() {
		Ext.fly('stepDialog').setDisplayed(false);
		Ext.fly('stepDialog_stepDialogHTMLField_labelCell').setDisplayed(false);
		jQuery('#stepDialog_body').attr("class",'html');
		
		jQuery('#stepDialog_helpdesk_sla_steps\\.vn_id_fieldCell').attr("width",'');
		jQuery('#stepDialog_helpdesk_sla_steps\\.cf_id_fieldCell').attr("width",'');
		jQuery('#stepDialog_helpdesk_sla_steps\\.em_id_fieldCell').attr("width",'');
		jQuery('#stepDialog_helpdesk_sla_steps\\.role_name_fieldCell').attr("width",'');
		
		jQuery('#stepDialog_helpdesk_sla_steps\\.vn_id_labelCell').parent().hide();
		jQuery('#stepDialog_helpdesk_sla_steps\\.cf_id_labelCell').parent().hide();
		jQuery('#stepDialog_helpdesk_sla_steps\\.em_id_labelCell').parent().hide();
		jQuery('#stepDialog_helpdesk_sla_steps\\.role_name_labelCell').parent().hide();
		
		SLA_moveFormField('stepDialog', 'helpdesk_sla_steps.vn_id', 'dialogRowVendor');
		SLA_moveFormField('stepDialog', 'helpdesk_sla_steps.cf_id', 'dialogRowCraftsperson');
		SLA_moveFormField('stepDialog', 'helpdesk_sla_steps.em_id', 'dialogRowEmployee');
		SLA_moveFormField('stepDialog', 'helpdesk_sla_steps.role_name', 'dialogRowAfmRole');
	},

	/**
	 * Add new step.
	 */
	addStep : function(basicStatus, type) {
		// create new step object
		this.step = new Ab.operation.express.sla.WorkflowStep();
		this.step.basicStatus = basicStatus;
		this.step.stepType = type;

		// set values to interface
		this.setValues();

		// open as dialog
		this.open();
	},

	/**
	 * Edit step.
	 */
	editStep : function(step) {
		this.step = step;

		// set values to interface
		this.setValues();

		// open as dialog
		this.open();
	},

	/**
	 * Set values to interface.
	 */
	setValues : function() {
		// load steps by basic status and type
		this.loadSteps(this.step.basicStatus, this.step.stepType);

		// load service desk role
		this.loadServiceDeskRole(this.step.stepType);

		// set condition field values
		this.setConditonFieldValue(this.step);

		// set step values
		this.setStepFieldValue("helpdesk_sla_steps.em_id", this.step.emId);
		this.setStepFieldValue("helpdesk_sla_steps.vn_id", this.step.vnId);
		this.setStepFieldValue("helpdesk_sla_steps.cf_id", this.step.cfId);
		this.setStepFieldValue("helpdesk_sla_steps.role", this.step.roleId);
		this.setStepFieldValue("helpdesk_sla_steps.role_name", this.step.afmRole);
		
		if(this.step.stepName){
			$("helpdesk_sla_steps.step").value = this.step.stepName;
		}
		
		$("multiple_required_true").checked = this.step.multipleRequired;
		$("multiple_required_false").checked = !this.step.multipleRequired;
		$("notify_responsible_true").checked = this.step.notifyResponse;
		
		//hide notify response option for notification step
		if(this.step.stepType == 'notification'){
			Ext.get('dialogRowNotify').setDisplayed(false);
			$("notify_responsible_true").checked = true;
		}else{
			Ext.get('dialogRowNotify').setDisplayed(true);
		}
		
		//hide vendor and craftsperson for dispatch , estimation, scheduling
		if(this.step.stepType == 'dispatch' || this.step.stepType == 'estimation' || this.step.stepType == 'scheduling'){
			Ext.get('dialogRowVendor').setDisplayed(false);
			Ext.get('dialogRowCraftsperson').setDisplayed(false);
		}else{
			Ext.get('dialogRowVendor').setDisplayed(true);
			Ext.get('dialogRowCraftsperson').setDisplayed(true);
		}
		
		//only show multiple required option for approval step
		if(this.step.stepType == 'approval'){
			Ext.get('dialogRowMultiple1').setDisplayed(true);
			Ext.get('dialogRowMultiple2').setDisplayed(true);
		}else{
			Ext.get('dialogRowMultiple1').setDisplayed(false);
			Ext.get('dialogRowMultiple2').setDisplayed(false);
			$("multiple_required_true").checked = false;
			$("multiple_required_false").checked = true;
		}
	},

	/**
	 * Set step field value.
	 */
	setStepFieldValue : function(fieldName, value) {
		$(fieldName).value = value;
		if (value) {
			this.enableField(fieldName);
		}
	},

	/**
	 * Set condition field value.
	 */
	setConditonFieldValue : function(step) {
		// set default value
		$("conditionField1").value = '';
		$("conditionOperator1").value = '=';
		$("conditionValue1").value = '';
		$("conditionOperand").value = 'AND';
		$("conditionField2").value = '';
		$("conditionOperator2").value = '=';
		$("conditionValue2").value = '';

		// get condition values from step
		if (step.sqlCondition) {
			var terms = step.sqlCondition.split(" ");

			// set condition 1
			if (terms.length >= 3) {
				$("conditionField1").value = terms[0];
				$("conditionOperator1").value = terms[1];
				$("conditionValue1").value = terms[2];
			}
			// set conditon 2
			if (terms.length >= 7) {
				$("conditionOperand").value = terms[3];
				$("conditionField2").value = terms[4];
				$("conditionOperator2").value = terms[5];
				$("conditionValue2").value = terms[6];
			}
		}
	},

	/**
	 * Save step.
	 */
	saveStep : function() {
		var stepName = $("helpdesk_sla_steps.step").value;
		var emId = $("helpdesk_sla_steps.em_id").value;
		var vnId = $("helpdesk_sla_steps.vn_id").value;
		var cfId = $("helpdesk_sla_steps.cf_id").value;
		var roleId = $("helpdesk_sla_steps.role").value;
		var afmRole = $("helpdesk_sla_steps.role_name").value;
		var condition = '';
		var multipleRequired = false;
		var notifyResponse = true;

		if ($("conditionField1").value != "" && $("conditionValue1").value != "") {
			// first condition
			condition = $("conditionField1").value + " " + $("conditionOperator1").value + " " + this.literal($("conditionValue1").value);

			// second condition
			if ($("conditionField2").value != "" && $("conditionValue2").value != "") {
				var condition2 = $("conditionField2").value + " " + $("conditionOperator2").value + " " + this.literal($("conditionValue2").value);

				condition += " " + $("conditionOperand").value + " " + condition2;
			}

		}

		if ((roleId || afmRole) && $("multiple_required_true").checked) {
			multipleRequired = true;
		}

		if (this.step.stepType != 'notification') {
			if (!$("notify_responsible_true").checked) {
				notifyResponse = false;
			}
		}

		this.step.stepName = stepName;
		this.step.emId = emId;
		this.step.vnId = vnId;
		this.step.cfId = cfId;
		this.step.roleId = roleId;
		this.step.afmRole = afmRole;
		this.step.sqlCondition = condition;
		this.step.multipleRequired = multipleRequired;
		this.step.notifyResponse = notifyResponse;

		if (this.validateForm()) {
			this.trigger('app:operation:express:sla:updateOptionalSteps', this.step);

			// close this dialog
			this.close();
		}

	},

	/**
	 * Validate step form.
	 */
	validateForm : function() {
		var validate = true;
		
		if (this.step.stepName == "") {
			validate = false;
			View.showMessage(getMessage("stepRequired"));
		}else if(!this.step.emId && !this.step.vnId && !this.step.cfId && !this.step.roleId && !this.step.afmRole && this.step.stepType !='verification' && this.step.stepType !='survey'){
			validate = false;
			View.showMessage(getMessage('noResponder'));
		}else{
			try {
				// check valid foreign keys for request parameters
				var result = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-checkValidForeignKeysForStep', this.step);

			}catch (e) {
				validate = false;
				View.showMessage(e.message);
			}
		}
		
		return validate;
	},

	/**
	 * load steps.
	 */
	loadSteps : function(basicStatus, type) {
		var selectElement = $("helpdesk_sla_steps.step");
		selectElement.length = 0;
		if (valueExists(SLA_ALL_STEPS)) {
			for (i = 0; i < SLA_ALL_STEPS.length; i++) {
				if (SLA_ALL_STEPS[i].state == basicStatus) {
					var types = SLA_ALL_STEPS[i].types;
					for (j = 0; j < types.length; j++) {
						if (types[j].type.value == type) {
							var mySteps = types[j].steps;
							if (mySteps.length > 1) {
								var selectTitle = '';
								if (getMessage('selectTitle') != "")
									selectTitle = getMessage('selectTitle');

								var option = new Option(selectTitle, "");
								selectElement.options[0] = option;
								selectElement.length = 1;
								for (k = 0; k < mySteps.length; k++) {
									selectElement.length = selectElement.length + 1;
									var option = new Option(mySteps[k].text, mySteps[k].step);
									selectElement.options[k + 1] = option;
								}
							} else if (mySteps.length == 1) {
								var option = new Option(mySteps[0].text, mySteps[0].step);
								selectElement.options[0] = option;
							}

						}
					}
				}
			}
		}
	},

	/**
	 * load conditions.
	 */
	loadConditions : function() {
		var conditions = [];
		var result = {};

		try {
			result = Workflow.callMethod("AbBldgOpsHelpDesk-StepService-getStepConditionFieldsForActivity", "AbBldgOpsOnDemandWork");
		} catch (e) {
			Workflow.handleError(e);
		}

		if (result.code == 'executed') {
			conditions = eval('(' + result.jsonExpression + ')');

			var addConditionOptions = function(id) {
				var selectElement = $(id);
				var option = new Option(getMessage('selectTitle'), "");
				selectElement.options[0] = option;
				for (i = 0; i < conditions.length; i++) {
					var option = new Option(conditions[i].text, conditions[i].value);
					selectElement.options[i + 1] = option;
				}
			};

			addConditionOptions('conditionField1');
			addConditionOptions('conditionField2');
		}
	},

	/**
	 * Select condition values.
	 */
	selectConditionValues : function(index) {
		var afterSelectConditionValue = function(fieldName, newValue, oldValue) {
			$(fieldName).value = newValue;
		};

		var fieldName = $('conditionField' + index).value;
		if (fieldName != "") {
			var result = {};
			try {
				result = Workflow.callMethod("AbBldgOpsHelpDesk-StepService-getSelectValueForConditionField", 'AbBldgOpsOnDemandWork', fieldName);
			} catch (e) {
				Workflow.handleError(e);
			}

			if (result.code == 'executed') {
				var res = eval('(' + result.jsonExpression + ')');
				if (res.table != undefined && res.field != undefined) {
					View.selectValue('', '', [ 'conditionValue' + index ], res.table, [ res.table + "." + res.field ], [ res.table + "." + res.field ], null, afterSelectConditionValue);
				} else {
					return;
				}
			}
		} else {
			View.showMessage(getMessage("selectConditionField"));
		}
	},

	/**
	 * Load service desk roles.
	 */
	loadServiceDeskRole : function(stepType) {
		$("helpdesk_sla_steps.role").options.length = 0;
		SLA_populateSelectList("helpdesk_roles", "role", "role", "helpdesk_sla_steps.role", "step_type='" + stepType + "'");
		if ($("helpdesk_sla_steps.role").options.length == 0) {
			$("dialogRowRole").style.display = 'none';
			$("dialogRowMultiple1").style.display = 'none';
			$("dialogRowMultiple2").style.display = 'none';
		}
	},

	/**
	 * Select Employee.
	 */
	selectEmployee : function(stepType) {
		var controller = this;
		var afterSelectEmployee = function(fieldName, newValue, oldValue) {
			$(fieldName).value = newValue;
			$("helpdesk_sla_steps.role").value = "";

			controller.enableField("helpdesk_sla_steps.em_id");
		};
		
		var restriction = null;
		
		if (this.step.stepType == 'scheduling') {
            var form = View.panels.get('A_StepForm');
            
            //get work team and supervisor
            var workTeamId = form.getFieldValue("helpdesk_sla_response.work_team_id");
            var supervisor = form.getFieldValue("helpdesk_sla_response.supervisor").replace(/\'/g, "''");
            
            //select planner for schedule step
            restriction = "email IN (SELECT email FROM cf WHERE is_planner = 1)"
            	
            if (workTeamId) {
            	
            	if(Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-checkSchemaExisting','cf_work_team', 'cf_id').value){
            		restriction = "email IN (SELECT cf.email FROM cf_work_team,cf WHERE  cf_work_team.cf_id  = cf.cf_id and cf.is_planner = 1 AND cf_work_team.work_team_id = '" + workTeamId + "')";
    		    }else{
    		    	restriction = "email IN (SELECT email FROM cf WHERE is_planner = 1 AND work_team_id = '" + workTeamId + "')";
    		    }
            	
            } else  if (supervisor) {
            	if(Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-checkSchemaExisting','cf_work_team', 'cf_id').value){
            		restriction = "email IN (SELECT cf.email FROM cf_work_team,cf WHERE  cf_work_team.cf_id  = cf.cf_id and cf.is_planner = 1 AND " 
            			+ "cf_work_team.work_team_id IN (SELECT cf_work_team.work_team_id from cf_work_team,cf WHERE cf_work_team.cf_id  = cf.cf_id and cf.email = " 
            			+ "(SELECT em.email FROM em WHERE em.em_id = '" + supervisor + "')))";
            	}else{
    		    	restriction = "email IN (SELECT email FROM cf WHERE is_planner = 1 AND " + "work_team_id = (SELECT work_team_id FROM cf WHERE email = " +
                    "(SELECT email FROM em WHERE em_id = '" + supervisor + "')))";
    		    }
            }
	            
        } else if (this.step.stepType== 'estimation') {
            //select estimator for estimation step
        	restriction = "email IN (SELECT email FROM cf WHERE is_estimator = 1)";
        }

		View.selectValue('', getMessage('employee'), [ 'helpdesk_sla_steps.em_id' ], 'em', [ 'em.em_id' ], [ 'em.em_id', 'em.em_std', 'em.email' ], restriction, afterSelectEmployee, false, true, '', 700, 600, 'grid', null, toJSON([{
	        fieldName: 'em.em_id',
	        sortOrder: 1
	    }]));
		
	},

	/**
	 * Select vendor.
	 */
	selectVendor : function(stepType) {
		var controller = this;
		var afterSelectVendor = function(fieldName, newValue, oldValue) {
			$(fieldName).value = newValue;
			$("helpdesk_sla_steps.role").value = "";

			controller.enableField("helpdesk_sla_steps.vn_id");
		};

		View.selectValue('', getMessage('vendor'), [ 'helpdesk_sla_steps.vn_id' ], 'vn', [ 'vn.vn_id' ], [ 'vn.vn_id', 'vn.company', 'vn.city', 'vn.description' ], null, afterSelectVendor,false, true, '', 700, 600, 'grid', null, toJSON([{
	        fieldName: 'vn.vn_id',
	        sortOrder: 1
	    }]));
	},

	/**
	 * Select craftperson.
	 */
	selectCraftsperson : function(stepType) {
		var controller = this;
		var afterSelectCraftsperson = function(fieldName, newValue, oldValue) {
			$(fieldName).value = newValue;
			$("helpdesk_sla_steps.role").value = "";

			controller.enableField("helpdesk_sla_steps.cf_id");
		}
		
		//KB3016857 -Allow craftspersons to be members of more than one team, so remove the work_team_id from select value dialog, now the work team of cf is defined in table cf_work_team
		View.selectValue('', getMessage('craftsperson'), [ 'helpdesk_sla_steps.cf_id' ], 'cf', [ 'cf.cf_id' ], [ 'cf.cf_id', 'cf.name', 'cf.tr_id' ], null, afterSelectCraftsperson,false, true, '', 700, 600, 'grid', null, toJSON([{
	        fieldName: 'cf.cf_id',
	        sortOrder: 1
	    }]));
	},

	/**
	 * Select AFM role.
	 */
	selectAfmRole : function(stepType) {
		var controller = this;
		var afterSelectAfmRole = function(fieldName, newValue, oldValue) {
			$(fieldName).value = newValue;
			$("helpdesk_sla_steps.role").value = "";
			controller.enableField("helpdesk_sla_steps.role_name");
		}
		View.selectValue('', getMessage('afmRole'), [ 'helpdesk_sla_steps.role_name' ], 'afm_roles', [ 'afm_roles.role_name' ], [ 'afm_roles.role_name' ], null, afterSelectAfmRole,false, true, '', 700, 600, 'grid', null, toJSON([{
	        fieldName: 'afm_roles.role_name',
	        sortOrder: 1
	    }]));
	},

	/**
	 * Select service desk role.
	 */
	selectRole : function(stepType) {
		if ($("helpdesk_sla_steps.role").value != "") {
			this.enableField("helpdesk_sla_steps.role");
		} else {
			this.enableField("helpdesk_sla_steps.em_id");
		}
	},

	/**
	 * Open this window as dialog.
	 */
	open : function() {
		// open as dialog
		this.stepDialog.showInWindow({
			x : 10,
			y : 100,
			modal : true,
			height : 700,
			width : 1000,
			title: getMessage(this.step.stepType+'StepTitle')
		});

		// show the content
		Ext.fly('stepDialog').setDisplayed(true);
		Ext.fly('stepDialog_body').setDisplayed(true);
	},

	/**
	 * Close this dialog.
	 */
	close : function() {
		// close this dialog
		this.stepDialog.closeWindow();
	},

	/**
	 * Enable fields base on the selection.
	 */
	enableField : function(fieldName) {
		SLA_enableField("helpdesk_sla_steps.em_id", fieldName == "helpdesk_sla_steps.em_id");
		SLA_enableField("helpdesk_sla_steps.vn_id", fieldName == "helpdesk_sla_steps.vn_id");
		SLA_enableField("helpdesk_sla_steps.cf_id", fieldName == "helpdesk_sla_steps.cf_id");
		SLA_enableField("helpdesk_sla_steps.role_name", fieldName == "helpdesk_sla_steps.role_name");
		SLA_enableRadioButtons("multiple_required", fieldName == "helpdesk_sla_steps.role");
	},

	/**
	 * esacape and set quotes.
	 */
	literal : function(value) {
		if (value.indexOf("'") == 0 && value.lastIndexOf("'") + 1 == value.length) {
			// value already between quotes?
			return value;
		} else {
			return "'" + value + "'";
		}
	}
});
