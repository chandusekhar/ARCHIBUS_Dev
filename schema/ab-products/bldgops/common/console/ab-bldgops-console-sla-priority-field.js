Ab.namespace('operation.express.console');

/**
 * Priority Field.
 */
Ab.operation.express.console.PriorityField = Base.extend({
	/**
	 * Form.
	 */
	form : null,
	
	/**
	 * Role.
	 */
	role : 'client',

	/**
	 * Constructor.
	 */
	constructor : function(formId,role) {
		this.form = View.panels.get(formId);
		
		if(valueExists(role)){
			this.role = role;
		}
		
		this.initializePriorityField();
	},

	/**
	 * Initialize priorities field.
	 */
	initializePriorityField : function() {
		// clear default priorities
		ABHDC_clearPriorities(this.form.id, "priorities");

		// default hide priority field, only show when the associated SLA contains more than one priority and no default priority defined
		var priorityFieldRowEl = this.form.getFieldLabelElement('priorityRadio').parentElement;
		priorityFieldRowEl.style.display = 'none';
	},

	/**
	 * Show priority field.
	 */
	showPriority : function() {
		// set default values for priority before showing for new record
		if (this.form.newRecord) {

			this.setDefaultValueForPriority();

		}

		// get record for priority WFR
		var record = this.getRecordForPriorityWFR();

		// call WFR to get priorities from database
		var priorities = this.getPriorities(record);

		if (priorities) {
			// load priorities to user interface
			this.loadPrioritiesToInterface(priorities);
		}
	},

	/**
	 * Set default values for priority before showing.
	 */
	setDefaultValueForPriority : function() {
		// default hide priority field, only show when the associated SLA contains more than one priority and no default priority defined
		var priorityFieldRowEl = this.form.getFieldLabelElement('priorityRadio').parentElement;
		priorityFieldRowEl.style.display = 'none';

		this.form.setFieldValue("activity_log.priority", 1);
	},

	/**
	 * Get record for priority WFR.
	 */
	getRecordForPriorityWFR : function() {
		var recordValues = ABHDC_getDataRecordValues("requestDS");
		return ABHDC_handleDataRecordValues2(recordValues);
	},

	/**
	 * Get priorities from database.
	 */
	getPriorities : function(record) {
		var priorities = null;
		try {
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-getSLAConditionParameters', null, null, record);
			var priorities = eval("(" + result.jsonExpression + ")");
		} catch (e) {
			Workflow.handleError(e);
		}

		return priorities;
	},

	/**
	 * load priorities to user interface.
	 */
	loadPrioritiesToInterface : function(priorities) {
		// set ordering_seq
		this.setOderingSeq(priorities);
		
		if(this.role == 'client'){
			if (priorities.default_priority != undefined && priorities.default_priority != '0') {
				// only show default priority if exist
				this.showDefaultPriority(priorities);
			} else if (priorities.priority_level_1 == undefined) {
				// no sla found
				alert(getMessage("noSlaFound") + ' ' + this.form.getFieldValue("activity_log.activity_type"));
			} else if (priorities.priority_level_1 != "" && priorities.priority_level_2 == undefined && priorities.priority_level_3 == undefined && priorities.priority_level_4 == undefined && priorities.priority_level_5 == undefined) {
				// only one priority, show as default
				this.showDefaultPriority(priorities, '1');
			} else {
				// show all priority levels
				this.showPriorityLevels(priorities);
			}
		}else{
			// show all priority levels
			this.showPriorityLevels(priorities);
		}
		
	},

	/**
	 * Set ordering_seq.
	 */
	setOderingSeq : function(priorities) {
		if (priorities.ordering_seq != $("afm_sla_config.ordering_seq").value) {
			if ($("afm_sla_config.ordering_seq").value != "") {
				ABHDC_clearPriorities(this.form.id, "priorities");
			}
			$("afm_sla_config.ordering_seq").value = priorities.ordering_seq;
		}
	},

	/**
	 * Show default priority.
	 */
	showDefaultPriority : function(priorities, defaultLevel) {
		var level = priorities.default_priority;
		if (valueExists(defaultLevel)) {
			level = defaultLevel;
		}
		SLA_setPriority(this.form.id, this.form.id, level, "priorities");
		$("default").innerHTML = priorities['priority_level_' + level];
		$("default").style.display = 'inline';
	},

	/**
	 * Show priority levels.
	 */
	showPriorityLevels : function(priorities) {
		// show priority information when the associated SLA contains more than one priority and no default priority defined
		var priorityFieldRowEl = this.form.getFieldLabelElement('priorityRadio').parentElement;
		priorityFieldRowEl.style.display = '';
		var radioButtons = document.getElementsByName('priorities');
		for ( var i = 0; i < 5; i++) {
			if (priorities['priority_level_' + (i + 1)] != undefined) {
				radioButtons[i].style.visibility = 'visible';
				radioButtons[i].style.display = 'inline';
				document.getElementById("priority_value" + (i + 1)).innerHTML = priorities['priority_level_' + (i + 1)] + '<br/>';
				document.getElementById("priority_value" + (i + 1)).style.display = 'inline';
			}
		}

		// select first priority
		SLA_setPriority(this.form.id, this.form.id, 1, "priorities");
	}
});
