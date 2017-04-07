/**
 * Define name space.
 */
Ab.namespace('recurring');

// Constant
var CONTROL_TYPE_RECURRING = "recurring";


/**
 * Recurring pattern JS object. 
 * Used to encode recurring attributes to XML pattern  or to decode XML pattern. 
 */
Ab.recurring.RecurringPattern = Base.extend({
	//recurring pattern type, possible values none|once|day|week|month|year
	type: '',
	
	value1: '',
	value2: '',
	value3: '',
	value4: '',
	total: '',
	xmlPattern: null,
	startDate: null,
	
	/**
	 * Constructor.
	 * When JS object is used to decode from xml pattern config object must specify xml pattern.
	 * 	configObject = {
	 * 		xmlPattern: '<recurring type="month" value1="last" value2="day" value3="1" total="12"/>'	
	 * 	};
	 * 
	 * When JS object is used to encode to xml pattern config object must contain recurring pattern attributes.
	 * configObject = {
	 * 		type: 'month',
	 * 		value1: 'last',
	 * 		value2: 'day',
	 * 		value3: '1',
	 * 		value4: '',
	 * 		total: 12
	 * };
	 * 
	 * 
	 * @param configObject - map with object properties (xmlPattern, type, value1 to value4, total)
	 * 
	 */
	constructor: function(configObject){
		this.config = configObject;
		Ext.apply(this, configObject);
		if (valueExistsNotEmpty(this.xmlPattern)) {
			// was initialized with xml pattern and must be decoded
			this.decode();
		} else {
			// was initialized with detailed attributes and must be encoded
			this.encode();
		}
	},
	
	/**
	 * Decode xml pattern. Read all recurring attributes 
	 */
	decode: function(){
		var xmlDoc = parseXml(this.xmlPattern, null, true);
		var nodes = selectNodes(xmlDoc, null, '//recurring');
		if (nodes.length > 0) {
			var recurringNode = nodes[0];
			this.type = recurringNode.getAttribute("type"); 
			this.value1 = recurringNode.getAttribute("value1"); 
			this.value2 = recurringNode.getAttribute("value2"); 
			this.value3 = recurringNode.getAttribute("value3"); 
			this.value4 = recurringNode.getAttribute("value4"); 
			this.startDate = recurringNode.getAttribute("startDate"); 
		}
	},
	
	// encode recurring pattern to xml format
	encode: function(){
    	if(this.type == 'none'){
    		this.xmlPattern = '';
    	}else{
    		this.xmlPattern = '<recurring type="' + this.type + '"'
    		+ ' value1="' + this.value1 + '"'
            + ' value2="' + this.value2 + '"'
            + ' value3="' + this.value3 + '"'
            + ' value4="' + this.value4 + '"'
            + ' total="' + this.total + '"'
            + '/>';
    		// if this feature will be added to recurring pattern
//          + ' startDate="' + this.startDate + '"'
    	}
	},
	
	// return xml representation of recurring pattern.
	getXmlPattern: function(){
		return this.xmlPattern;
	},
	
	// get readable description for recurring pattern.
	getDescription: function(){
		try {
			var result = Workflow.callMethod('AbCommonResources-RecurringScheduleService-getRecurringPatternDescription', this.xmlPattern);
			return result.message;
		} catch (e) {
			Workflow.handleError(e);
		}
	} 
});

/**
 * Recurring control object.
 */
Ab.recurring.RecurringControl = new (Base.extend({
	
	CONTROL_TYPE_RECURRING: "recurring",
	// panel object
	panel: null,
	// recurring pattern fields array (field id's) 
	field: null,
	// array with action buttons id's that support custom export (XLS, DOCX)
	exportButtons: null,
	
	configObject: null,
	
	// Constructor.
	constructor: function(configObject){
		
	},
	
	/**
	 * Change panel to display customized recurring pattern field. 
	 */
	addField: function(configObject){
		if (!valueExists(configObject.panel) || !valueExists(configObject.fields)) {
			return false;
		}
		this.configObject = configObject;
		this.panel = configObject.panel;
		this.fields = configObject.fields;
		if (valueExists(configObject.exportButtons)) {
			this.exportButtons = configObject.exportButtons;
		}
		
		if (configObject.panel.type == 'grid') {
			this.customizeGridPanel();
		} else if (configObject.panel.type == 'columnReport') {
			this.customizeColumnReportPanel();
		} else {
			this.customizeFormPanel();
		}
	},
	
	/**
	 * Export grid panel to XLS.
	 */
	exportGridToXls: function(configObject){
		var panel = configObject.panel;
		var viewName = panel.viewDef.viewName + '.axvw';
		var reportTitle = panel.title;
		if(reportTitle == ''){
			reportTitle = Ab.view.View.title;
		}
		var parameters = panel.getParametersForRefresh();
		
		var jobId = Workflow.startJob('AbCommonResources-RecurringScheduleExport-generateGridXLSReport', viewName, panel.dataSourceId, reportTitle, panel.getVisibleFieldDefs(), toJSON(panel.restriction), parameters);
		View.openJobProgressBar('Export to XLS', jobId, '', function(status) {
			if (status.jobFinished) {
				var url  = status.jobFile.url;
				if (valueExistsNotEmpty(url)) {
					window.location = url;
				}
			}
		});
	},
	
	/**
	 * Export to DOCX using datasource definition.
	 */
	exportToDocX: function (configObject, title, restriction, parameters){
		var panel = configObject.panel;
		var recurringFields = configObject.fields;
		var viewName = panel.viewDef.viewName + '.axvw'; 

		var jobId = Workflow.startJob('AbCommonResources-RecurringScheduleExport-buildDocxFromDataSource', viewName, panel.dataSourceId, title, panel.getVisibleFieldDefs(), toJSON(restriction), parameters, recurringFields);
		View.openJobProgressBar('Export to DOCX', jobId, '', function(status) {
			if (status.jobFinished) {
				var url  = status.jobFile.url;
				if (valueExistsNotEmpty(url)) {
					window.location = url;
				}
			}
		});
	},
	
	// customize grid panel to display recurring pattern field
	customizeGridPanel: function() {
		this.setFieldControlType(this.panel, this.fields);
		// customize grid header
		this.panel.addEventListener('afterBuildHeader', this.updateGridHeader, this);
		// localize recurring pattern for grid rows
		this.panel.addEventListener('afterGetData', this.localizeGridDataSet);

		this.customizeExports(this.configObject);
		
	},
	
	/**
	 * Customize form panel to display recurring pattern field.
	 */
	customizeFormPanel: function(){
		this.setFieldControlType(this.panel, this.fields);
		var origEventListener = this.panel.getEventListener("afterRefresh");
		var recurringControl = this;
		this.panel.afterRefresh = function(){
			for (var i = 0; i < recurringControl.fields.length; i++) {
				var fieldId = recurringControl.fields[i];
				recurringControl.updateFormRecurringFieldDom(recurringControl.panel, fieldId);
				recurringControl.syncRecurringFieldToUI(recurringControl.panel, fieldId);
			}
			if (origEventListener) {
				origEventListener(recurringControl.panel)
			}
		}
	},
	
	/**
	 * Customize form panel to display recurring pattern field.
	 */
	customizeColumnReportPanel: function(){
		this.setFieldControlType(this.panel, this.fields);
		var origEventListener = this.panel.getEventListener("afterRefresh");
		var recurringControl = this;
		this.panel.afterRefresh = function(){
			for (var i = 0; i < recurringControl.fields.length; i++) {
				var fieldId = recurringControl.fields[i];
				var neutralValue = recurringControl.panel.getFieldValue(fieldId);
				var fieldElement = recurringControl.panel.getFieldElement(fieldId);
				if (valueExistsNotEmpty(neutralValue)) {
					var config = {
							xmlPattern: neutralValue	
						};
					var recurringPatternObj = new Ab.recurring.RecurringPattern(config);
					localizedValue = recurringPatternObj.getDescription();
					fieldElement.innerHTML = localizedValue;
				}
			}
			if (origEventListener) {
				origEventListener(recurringControl.panel)
			}
		};
		
		this.customizeExports(this.configObject);
	},
	
	customizeExports: function(configObject){
		if (valueExists(this.exportButtons) && this.exportButtons.length > 0) {
			var recurringControl = this;
			for (var i = 0; i < this.exportButtons.length; i++) {
				var action = this.exportButtons[i];
				if (action.type.toUpperCase() == 'XLS') {
					this.panel.actions.get(action.id).addListener(function(){
						recurringControl.exportGridToXls(configObject);
					});
				} else if (action.type.toUpperCase() == 'DOCX') {
					this.panel.callDOCXReportJob = function (title, restriction, parameters) {
						parameters.formatType = "column";
						recurringControl.exportToDocX(configObject, title, restriction, parameters)
					}
				}
			}
		}
	},

	/**
	 * Set field control type  on data source and panel level.
	 */
	setFieldControlType: function(){
		for ( var i = 0; i < this.fields.length; i++) {
			var recurringField = this.fields[i];
			this.panel.getDataSource().fieldDefs.get(recurringField).controlType = Ab.recurring.RecurringControl.CONTROL_TYPE_RECURRING;
			if (this.panel.type == 'grid' || this.panel.type == 'columnReport') {
				// grid fieldDefs is Array
				for ( var j = 0; j < this.panel.fieldDefs.length; j++) {
					if (this.panel.fieldDefs[j].id == recurringField) {
						this.panel.fieldDefs[j].controlType = Ab.recurring.RecurringControl.CONTROL_TYPE_RECURRING;;
					}
				}
			} else {
				this.panel.fields.get(recurringField).fieldDef.controlType = Ab.recurring.RecurringControl.CONTROL_TYPE_RECURRING;;
			}
		}
	},

	/**
	 * Update recurring columns on grid header.
	 * 
	 * @param panel grid panel
	 * @param parentElement header parent element
	 */
	updateGridHeader: function(panel, parentElement) {
		var dataSource = panel.getDataSource();
		var columnIndex = 0;
		for (var i=0, col; col = panel.columns[i]; i++) {
			if (valueExists(dataSource.fieldDefs.get(col.id)) && dataSource.fieldDefs.get(col.id).controlType.toLowerCase() == Ab.recurring.RecurringControl.CONTROL_TYPE_RECURRING) {
				var headerRows = parentElement.getElementsByTagName("tr");
				if (headerRows.length > 0) {
					// sort row is always first (index = 0)
					var sortRow = headerRows[0];
					panel.sortDirections[i] = '';
					this.removeSortFromColumn(headerRows[0], columnIndex);
				}
				// customize filter row if this exists
				if (headerRows.length > 1 && headerRows[1].id == panel.id + '_filterRow' ) {
					var filterInputId = panel.getFilterInputId(col.id);
					this.updateMiniConsole(panel, headerRows[1], columnIndex, filterInputId);
				}
			}
			if (!col.hidden) {
				columnIndex++;
			}
		}
	},
	
	/**
	 * Remove sort from specified column.
	 * 
	 * @param rowElement sort row element
	 * @param columnIndex column index
	 */
	removeSortFromColumn: function(rowElement, columnIndex) {
		var headerCells = rowElement.getElementsByTagName("th");
		var headerCell = headerCells[columnIndex];
		// remove sort listener
		Ext.fly(headerCell).removeAllListeners();
		// remove sort image
		var imgLinks = headerCell.getElementsByTagName('img');
		if (imgLinks.length > 0 && imgLinks[0].id.substr(0,8) == 'sortLink') {
				headerCell.removeChild(imgLinks[0]);
		}
	},

	/**
	 * Customize filter row for recurring pattern column.
	 * 
	 * @param panel grid panel
	 * @param rowElement filter row element
	 * @param columnIndex column index
	 * @param filterInputId filter input id
	 */
	updateMiniConsole: function(panel, rowElement, columnIndex, filterInputId) {
		var recurringTypes = {
				'type="once"': getMessage('z_RECURRING_TYPE_ONCE'),
				'type="day"': getMessage('z_RECURRING_TYPE_DAY'),
				'type="week"': getMessage('z_RECURRING_TYPE_WEEK'),
				'type="month"': getMessage('z_RECURRING_TYPE_MONTH'),
				'type="year"': getMessage('z_RECURRING_TYPE_YEAR')
			};

		var headerCells = rowElement.getElementsByTagName("th");
		var headerCell = headerCells[columnIndex];
		// remove input element if exists
		var inputElements = headerCell.getElementsByTagName("input");
		if (inputElements[filterInputId]) {
			headerCell.removeChild(inputElements[filterInputId]); 
		}
		// add select element
		var i = 0;
		var input = document.createElement("select");
		input.options[i++] = new Option("","", true);
		for(var storedValue in recurringTypes){
			input.options[i++] = new Option(recurringTypes[storedValue], storedValue);
		}	
		input.className="inputField_box";				

		// run filter when user click on one enum value
		Ext.EventManager.addListener(input, "change", panel.onFilter.createDelegate(panel));
		input.id = filterInputId;
		if (headerCell.childNodes.length > 0) {
			headerCell.insertBefore(input,headerCell.childNodes[0]);
		}else{
			headerCell.appendChild(input);
		}
	},
	
	/**
	 * Localize recurring pattern for grid rows.
	 * Called by afterGetData event.
	 * 
	 * @param panel grid panel
	 * @param data  WFR data
	 */
	localizeGridDataSet: function(panel, data){
		// if grid has records
		if (data.records && data.records.length > 0) {
			// get all recurring pattern fields
			var fldIds = [];
			for (var i = 0; i < panel.fieldDefs.length; i++) {
				if (panel.fieldDefs[i].controlType.toLowerCase() == Ab.recurring.RecurringControl.CONTROL_TYPE_RECURRING) {
					fldIds.push(panel.fieldDefs[i].id);
				}
			}
			try {
				var result = Workflow.callMethod('AbCommonResources-RecurringScheduleService-localizeRecurringPatternDestription', fldIds, data.records);
				data.records = result.data;
			} catch (e) {
				Workflow.handleError(e);
			}
		}
	}, 
	
	/**
	 * Format recurring pattern field for form control.
	 * @param panel form control
	 * @param fieldName recurring pattern field name
	 */
	updateFormRecurringFieldDom: function(panel, fieldName) {
		var visibleFieldName = 'Show' + panel.id + '_' + fieldName + '_recurring';
		var visibleFieldElement = document.getElementById(visibleFieldName);
		if (visibleFieldElement == null || visibleFieldElement == undefined) {
			var fieldDef = panel.fields.get(fieldName).fieldDef;
			var isEditable = (!fieldDef.readOnly || fieldDef.readOnly == 'false');
			var cellElem = panel.getFieldCell(fieldName);
			var fieldElem = panel.getFieldElement(fieldName);
			// set readOnly =  true on field def
			fieldDef.readOnly = "true";
			
			// change type of input field to hidden
			var hiddenField = fieldElem.cloneNode(true);
			hiddenField.type = 'hidden';
			fieldElem.parentNode.replaceChild(hiddenField, fieldElem);
			//fieldElem.type = 'hidden';
			
			
			// append visible input fields
			var inputElem = document.createElement("INPUT");
			inputElem.id = visibleFieldName;
			inputElem.name = visibleFieldName;
			inputElem.type = 'text';
			inputElem.readOnly = true;
			inputElem.className = 'inputField_cell';

			cellElem.appendChild(inputElem);
			if (isEditable) {
				var imgElem = document.createElement("IMG");
				imgElem.id = fieldName + '_SelectValue';
				imgElem.src = View.contextPath + '/schema/ab-core/graphics/icons/ellipsis.png';
				imgElem.value = '...';
				imgElem.draggable = false;
				imgElem.className = 'selectValue_Button';
				imgElem.onclick = function(){
					onEditRecurringRule(panel, fieldName);
				};
				cellElem.appendChild(imgElem);
			}
		}
	},
	
	/**
	 * Get stored value, localize and display in the UI control.
	 * @param panel panel object
	 * @param fieldName recurring field name
	 */
	syncRecurringFieldToUI: function(panel, fieldName){
		var visibleFieldName = 'Show' + panel.id + '_' + fieldName + '_recurring';
		var neutralValue = panel.getFieldValue(fieldName);
		if (valueExistsNotEmpty(neutralValue)) {
			var config = {
					xmlPattern: neutralValue	
				};
			var recurringPatternObj = new Ab.recurring.RecurringPattern(config);
			localizedValue = recurringPatternObj.getDescription();
			$(visibleFieldName).value = localizedValue;
		}
	}
		
}));
// Control reference.
RecurringControl = Ab.recurring.RecurringControl;


/**
 * On edit recurring rule event handler for forms.
 * @param panel form panel
 * @param fieldId recurring rule field id
 */
function onEditRecurringRule(panel, fieldId){
	//xmlPatternRecurrence
	var xmlPattern = null;
	if (valueExists(panel) && valueExists(fieldId)) {
		xmlPattern = panel.getFieldValue(fieldId);
	}
	
	View.openDialog('ab-common-recurring-pattern-edit.axvw', null, false , {
		width: 600,
		height: 400,
		closeButton: false,
		xmlPatternRecurrence: xmlPattern,
	    schedulingLimits:"day;-1;week;-1;month;-1;year;-1", 
	    visibleRecurrTypes:['day', 'week', 'month', 'year'],
	    afterViewLoad: function(dialogView) {
	    	dialogView.controllers.get('abRecurringPatternCtrl').showRecurringPatternPanel(true);
	    },
	    callback: function(newXmlRule, parameters) {
	    	if (valueExists(newXmlRule)) {
	    		panel.setFieldValue(fieldId, newXmlRule);
	    		RecurringControl.syncRecurringFieldToUI(panel, fieldId);
	    	}
	    } 
	});
}







