/**
 * Declare the namespace for the form JS classes.
 */
Ab.namespace('form');


/**
 * Column report component is similar to read-only form, with more compact presentation.
 * The HTML content is created on the fly, from the data record retrieved from the server.
 */
Ab.form.ColumnReport = Ab.view.Component.extend({
    
	// view definition to be displayed
	viewDef: null,
    
	// array of field definitions
	fieldDefs: null,
	
    // name of the default WFR used to get the record
    refreshWorkflowRuleId: '',
    
    // whether the form should display its field values on load
    showOnLoad: false,
    
    // user function to call after refresh()
    afterRefreshListener: null,
    
    //number of table columns
    columns: 1,
    
    // data record retrieved from the server
    record: null,
    
    // ----------------------- initialization ------------------------------------------------------
    
    /**
     * Constructor.
	 *
	 * @param id
	 * @param configObject
     */
	constructor: function(id, configObject) {
        this.inherit(id, 'columnReport', configObject);  

        this.viewDef = new Ab.view.ViewDef(configObject.getConfigParameter('viewDef'), configObject.getConfigParameter('groupIndex'), null, null, configObject.getConfigParameter('dataSourceId'));
                
        this.columns = configObject.getConfigParameter('columns', 1);
        this.showOnLoad = configObject.getConfigParameter('showOnLoad', false);
		this.refreshWorkflowRuleId = configObject.getConfigParameterNotEmpty('refreshWorkflowRuleId', 
            Ab.form.Form.WORKFLOW_RULE_REFRESH);
        this.fieldDefs = configObject.getConfigParameter('fieldDefs', []);

        this.visible = true;
    },

    /**
     * Determines the height available to show the scrollable element.
     */
    determineAvailableHeight: function() {
        var height = this.inherit();
        return height - 16;
    },

    // ------------------------ common control API methods -----------------------------------------
    
    /**
     * Creates evaluation context with references to the view and this panel.
     */
    createEvaluationContext: function() {
        var ctx = this.inherit();
        if (this.record != null) {
            ctx['record'] = this.record.values;
        }
        return ctx;
    },
    
    /**
     * Performs initial data fetch from the server to display the control after the view is loaded. 
     */
    initialDataFetch: function() {
        if (this.showOnLoad || this.restriction != null) {
            this.getData();
            this.show(true);
        }
        this.show(this.showOnLoad);
    },
    
    /**
     * Retrieve record data from the server.
     */    
    getData: function() {
        var dataSource = this.getDataSource();
        if (!dataSource) {
			this.setRecord(new Ab.data.Record());
			return;
		}
        try {
            var result = Ab.workflow.Workflow.call(this.refreshWorkflowRuleId, this.getParameters());
            if (valueExists(result.dataSet)) {
                var record = this.getDataSource().processInboundRecord(result.dataSet);
                this.setRecord(record);   
            }
        } catch (e) {
            this.handleError(e);
        }
    },
    
    /**
     * Clears the panel content.
     */
    clear: function() {
        var tableId = this.parentElementId + '_table';
        var table = Ext.get(tableId);
        if (table != null) {
            table.remove();
        }
    },
    
    // ----------------------- implementation ------------------------------------------------------
    
    /**
     * Returns field value.
     */
    getFieldValue: function(fieldName) {
        var value = null;
        if (this.record != null) {
            value = this.record.getValue(fieldName);
        }
        return value;  
    },
    
    /**
     * Returns record with current field values.
     * @return Ab.data.Record
     */
    getRecord: function() {
        return this.record;  
    },
    
    /**
     * Returns Ab.data.Record containing new and old values, in the ARCHIBUS locale-neutral format.
     * This record can be passed as a parameter to custom workflow rules.
     */
    getOutboundRecord: function() {
        var record = this.record;
        var dataSource = this.getDataSource();
        if (dataSource) {
        	record = dataSource.processOutboundRecord(record);
        }
        return record;
    },
    
    /**
     * Sets this form record.
     * @param {record} Ab.data.Record
     */
    setRecord: function(record) {
        this.record = record;
        this.onModelUpdate();
    },

    /**
     * Clears visible content and displays the current record values.
     */
    onModelUpdate: function() {
        // remove existing grid
        this.clear();

        var ctx = this.createEvaluationContext();
        
        // create new table with row for each field
        var tableId = this.parentElementId + '_table';
        var html = '<table id="' + tableId + '" class="columnReport">';

		// map of document field anchor element id - document parameters
		var docFieldLinkMap = {};
      
        var columnCounter = 0;
        for (var i = 0; i < this.fieldDefs.length; i++) {
            var fieldDef = this.fieldDefs[i];
            var hidden = Ab.view.View.evaluateBoolean(fieldDef.hidden, ctx, false);
            if (hidden) {
                continue;
            }
			
            var fieldValue = this.getFieldValue(fieldDef.id);
            
            if (valueExistsNotEmpty(fieldValue)) {
                // format object values into localized strings
                var dataSource = this.getDataSource();
                if (dataSource) {
                    fieldValue = dataSource.formatValue(fieldDef.id, fieldValue, true, true, this.record.values);
                }
            } else {
                fieldValue = '&nbsp;';
            }
            
            var title = '';
            if (valueExistsNotEmpty(fieldDef.title)) {
                title = Ab.view.View.evaluateString(fieldDef.title, ctx, false);
                if (title.charAt(title.length - 1) != ':' && title.charAt(title.length - 1) != '?' && title.indexOf("<div") < 0) {
                    title = title + ':';
                } 
                title = title.replace("&apos;", "'"); 
            } 
            
            if (columnCounter == 0) {
                html = html + '<tr>';
            }
            
            var id = this.id + '_' + fieldDef.id;
			
			var isNumber = (fieldDef.type === 'java.lang.Double' || fieldDef.type === 'java.lang.Integer');
			var style = isNumber ? 'text-align:right;' : '';
            
            var dataCellColSpan = fieldDef.colspan > 1 ? 5 + ((fieldDef.colspan - 2) * 4) : 1;
            
            // replace ASCII line breaks in memo value by HTML line breaks 
            var format = fieldDef.format.toUpperCase();
            if (format=='MEMO' && valueExistsNotEmpty(fieldValue)) {
                // KB 3021342: \n\r does not get replaced, use \n
                fieldValue = fieldValue.replace(/\n/g, "<br/>");
            }
			else if (fieldDef.isDocument) {
				// KB 3025081: doc field in column report as active link to show document

				// anchor element gets its own id
				var linkId = this.id + '_' + fieldDef.id + '_link';
				// parameters to be passed to the function delegate after the HTML document has been written
				var linkParam = {};
				linkParam['key'] = this.getPrimaryKey();
				linkParam['fullName'] = fieldDef.id;
				linkParam['value'] = fieldValue;
				docFieldLinkMap[linkId] = linkParam;
				// field value as an anchor element
				fieldValue = " <a href=\"javascript: //\" id=\"" + linkId + "\">" + fieldValue + "</a>";
			}
            
            html += this.getLabelValueHTML(id, title, style, dataCellColSpan, fieldDef, fieldValue);
            
            columnCounter = columnCounter + fieldDef.colspan;
            if (columnCounter == this.columns) {
                columnCounter = 0;
                html = html + '</tr>';
            }
        }
        html = html + '</table>';
        Ext.DomHelper.insertHtml('afterBegin', this.parentElement, html);

		// if the column report contains document fields, themap is not empty and onClick actions will be attached
		for (linkId in docFieldLinkMap) {
			var params = docFieldLinkMap[linkId];
			var linkElement = Ext.get(linkId);			
			var delegate = this.showDocumentLinkCommand.createDelegate(this, [linkId, params]);
            Ext.get(linkElement).addListener("click", delegate);
		}
    },
    
    /**
     * Return the specified field TD element.
     */
    getFieldElement: function(fieldName) {
        return $(this.id + '_' + fieldName, false);
    },
    
    getFieldEl: function(fieldName) {
        return Ext.get(this.id + '_' + fieldName);
    },
    
	/**
	 * Cell writing code
	 * may be overridden by a custom control subclass
	 */
	getLabelValueHTML: function(id, title, style, dataCellColSpan, fieldDef, fieldValue) {
		var html = '<td class="columnReportSpacer"> </td>'
                 + '<td class="columnReportLabel' + this.getLabelClassIfExists(fieldDef) + '">' + title + '</td>' 
                 + '<td id="' + id + '" class="columnReportValue" style="' + style + '" colspan="' + dataCellColSpan + '">' + fieldValue + '</td>'
                 + '<td class="columnReportSpacer"> </td>';

		return html;
	},

	getLabelClassIfExists: function(fieldDef)  {
		var returnString = '';
		if (fieldDef.labelClass != null) {
			returnString += ' ' + fieldDef.labelClass;
		}
		return returnString;
	},

	
    /**
     * Returns parameters for the workflow rule.
     */
    getParameters: function() {
        var parameters = {
            viewName:    this.viewDef.viewName,
			groupIndex:  this.viewDef.tableGroupIndex,
            controlId:   this.id,
            version:     Ab.view.View.version
        };
        if (this.restriction != null) {
            parameters.restriction = toJSON(this.restriction);
        }
        if (this.viewDef.dataSourceId != null) {
			parameters.dataSourceId = this.viewDef.dataSourceId;
		}

        Ext.apply(parameters, this.parameters);

        return parameters;
    },

	/**
	 * Default handler for document field wih controlType='link'
	 *
	 */
	showDocumentLinkCommand: function(linkId, parameters) {
		var tableAndName = parameters['fullName'].split('.');
		var fileName = parameters['value'];
        var keys = parameters['key'];
		// strip off the table name from each of the primary key field fullName values and add it as a separate attribute
		for (name in keys) {
			var keyName = name.split('.')[1];
			keys[keyName] = keys[name]
		}
		View.showDocument(keys, tableAndName[0], tableAndName[1], fileName, null);
	},
		
	/**
	 * Return an object containing primary key field values
	 *
	 */
	getPrimaryKey: function() {
		var primaryKeyValues = {};
		for (var i = 0, fieldDef; fieldDef = this.fieldDefs[i]; i++) {
			if (fieldDef.primaryKey) {
				primaryKeyValues[fieldDef.fullName] = this.getFieldValue(fieldDef.fullName);
			}
		}
		return primaryKeyValues;
	},
	
	// ----------------------- export report selection --------------------------------------------------
	/**
	 * Called by Ab.command.exportPanel in ab-command.js to have a report.
	 * 
	 * @param {reportProperties} Map {outputType: this.outputType, printRestriction: this.printRestriction, orientation: this.orientation}
	 */
	callReportJob: function(reportProperties){
		var outputType = reportProperties.outputType, printRestriction = reportProperties.printRestriction, orientation = reportProperties.orientation;
		var jobId = null;
		
		if(outputType === 'docx'){
			var reportTitle = this.title;
			if(reportTitle == ''){
				reportTitle = Ab.view.View.title;
			}
			var parameters = {};
			
			parameters.recordLimit = 1;
			parameters.columns = this.columns;
			
			if(valueExists(printRestriction)){
				parameters.printRestriction = printRestriction;
			}
			if(valueExistsNotEmpty(orientation)){
				parameters.orientation = orientation;
			}
			
			jobId = this.callDOCXReportJob(reportTitle, this.restriction, parameters);
		}else {
			//no translatable since it's only for viwew designers.
    		View.showMessage('error', outputType + ' action is NOT supported for a column report panel.');
		}
		
		return jobId;
	},
	/**
	 * Call Docx report job and return job id. It's could be called by applications.
	 * title: report title.
	 * restriction: parsed restriction.
	 * parameters: Map parameters.
	 */
	callDOCXReportJob: function(title, restriction, parameters){
		var viewName = this.viewDef.viewName + '.axvw'; 
		parameters.formatType = "column";
		return Workflow.startJob(Ab.grid.ReportGrid.WORKFLOW_RULE_DOCX_REPORT, viewName, this.dataSourceId, title, this.getVisibleFieldDefs(), toJSON(restriction), parameters);
	},
	
	/**
	 * Get visible field definitions as array.
	 */
	getVisibleFieldDefs: function(){
		var ctx = this.createEvaluationContext();
    	var fieldDefs = this.fieldDefs;  
    	if(fieldDefs && fieldDefs.length == 0){
    		this.getDataSource().fieldDefs.each(function (fieldDef) {
        		fieldDefs.push(fieldDef);
        	});
    	}
    
    	var visibleFieldDefs = [];
		for (var i = 0; i < this.fieldDefs.length; i++) {
		    var field = this.fieldDefs[i];
			if(field.hidden === 'true'){
				continue;
			}
		    if(valueExists(field)){
			    if(field.controlType === '' || field.controlType === 'color' || field.controlType === 'link' || field.controlType === 'recurring'){
				    //XXX: evulate field.title and field.hidden proprties
				    field.title = Ab.view.View.evaluateString(field.title, ctx, false);
				    field.hidden = Ab.view.View.evaluateString(field.hidden, ctx, false);
				    visibleFieldDefs.push(field);
			    }
		    }
		}	
		var listener = this.getEventListener('beforeExportReport');
        if (listener) {
        	visibleFieldDefs = listener(this, visibleFieldDefs);
        }
		return visibleFieldDefs;
    },
    /**
     * application could overwrite.
     */
    beforeExportReport: function(panel, visibleFieldDefs){
    	return visibleFieldDefs;
    },
   
   
    /**
     * Gets field def by its id and avoid possible duplicated field def.
     */
    getFieldDefById: function(fieldDefs, fullName, index){
    	if(index < fieldDefs.length){
	    	var field = fieldDefs[index];
	    	if(valueExists(field) && (fullName == field.fullName)){
	    		return field;
	    	}
    	}
    	//use case: manually add columns in js
    	for (var i = 0, field; field = fieldDefs[i]; i++) {
    		if(fullName === field.fullName){
    			return field;
    		}
    	}
    	
    	return null;
    }
    
}, {
    // ----------------------- constants -----------------------------------------------------------
    
    // name of the default WFR used to get the record
    WORKFLOW_RULE_REFRESH: 'AbCommonResources-getDataRecord'
});