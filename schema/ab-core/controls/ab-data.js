
Ab.namespace('data');

/**
 * ARCHIBUS schema field definition class. 
 * Can be used to convert JavaScript objects to localized strings and back.
 */
Ab.data.FieldDef = Base.extend({
    // original config object    
    config: null,

    // field properties    
    id: '',
    fullName: '',
    title: '',
    afmType: '',
    type: '',
    format: '',
    size: 0,
    decimals: 0,
    numericFormat: '',
    hidden: false,
    readOnly: false,
    required: false,
    isEnum: false,
    isDate: false,
    isTime: false,
    isNumeric: false,
    isDocument: false,
    primaryKey: false,
    foreignKey: false,
    isEnum: false,
    enumValues: null,
    value: '',
    op: '=',
    colspan: 1,
    rowspan: 1,
    controlType: '',
    groupBy: false,
    defaultValue: '',
    lookupName: null,
    lookupDisplayType: '',
    lookupDisplayFormat: '',

    //axvw field's manual properties to validate user's max and min inputs
    maxValue: '',
    minValue: '',
    
    /**
     * Constructor.
     */
    constructor: function(config) {
        this.config = config;
        Ext.apply(this, config);
    },
    /**
     * Field is upper case?
     */
    isUpperCase: function(){
    	var format = this.format.toUpperCase();
    	return (format === "UPPERALPHANUM" || format === "UPPERALPHA" || format === "UPPER");
    },
    
    /**
     * Formats JavaScript object value into localized string, for presentation.
     * @param {value} The field value to format.
     * @param {useLocalizedFormat} Whether to use localized format or ARCHIBUS neutral format, default = true.
     * @param {convertEnumValues} Whether to convert stored enum values to displayed enum values, default = true.
     * @param {values} Other field values in the same record.
     * @throws exception if the value cannot be formatted.
     */
    formatValue: function(value, useLocalizedFormat, convertEnumValues, values) {
        if (!valueExists(value)) {
            return '';
        }

        if (!valueExists(useLocalizedFormat)) {
            useLocalizedFormat = true;
        }
        if (!valueExists(convertEnumValues)) {
            convertEnumValues = true;
        }
        if (!valueExists(values)) {
            values = {};
        }
        
        var formattedValue = value;
        if (this.isDate && value.constructor == Date) {
            formattedValue = value.format(this.getDateFormat(useLocalizedFormat));
        } else if (this.isTime && value.constructor == Date) {
            formattedValue = value.format(this.getTimeFormat(useLocalizedFormat));
        } else if (this.isEnum && useLocalizedFormat && convertEnumValues) {
            formattedValue = this.enumValues[value];
        } else if (this.isNumber()) {
        	if (useLocalizedFormat) {
        		// format numeric value using localized format, for display
	        	if (value.constructor == Number) {
	        		formattedValue = value.toFixed(this.decimals);
	        	} else if(valueExistsNotEmpty(value)){
	        		formattedValue = parseFloat(value).toFixed(this.decimals);
	        	}
	        	if(this.format.toUpperCase() === 'NOSEPARATOR'){
	        		//with decimal separator but no thousands separator
	        		formattedValue = localizeDecimalSeparator(formattedValue);
	        	}else{
	        		//with both decimal and thousands separators
	        		formattedValue = insertGroupingSeparator(formattedValue, true, useLocalizedFormat);
	        	}
	            formattedValue = this.formatCurrency(formattedValue, values);
        	}
        } 
        return formattedValue;
    },
    
    /**
     * Formats specified ID field value according to lookup metadata.
     * @param idValue The ID field value.
     * @param recordValues All record values.
     */
    formatLookupValue: function(idValue, recordValues) {
        var formattedValue = idValue;
        var lookupValue = recordValues[this.lookupName];

        if (this.lookupName) {
            if (this.lookupDisplayType === 'lookup') {
                formattedValue = lookupValue;

            } else if (this.lookupDisplayType === 'concatenate') {
                var formatString = this.lookupDisplayFormat;
                formatString = formatString.replace(/\{0\}/g, '{{idValue}}');
                formatString = formatString.replace(/\{1\}/g, '{{lookupValue}}');

                var template = Handlebars.compile(formatString);
                var context = {
                    'idValue': idValue,
                    'lookupValue': lookupValue
                };
                formattedValue = template(context);
            }
        }

        return formattedValue;
    },
    
    /**
     * Adds a currency symbol to the field value if this is a currency field.
     * @param {value} The field value to format.
     * @param {values} Other field values in the same record.
     */
    formatCurrency: function(value, values) {
    	var currencySymbol = this.getCurrencySymbol(values);
        var formattedValue = value;
        if(currencySymbol.length > 1){
    		formattedValue = currencySymbol + " " +  formattedValue;
    	}else{
    		formattedValue = currencySymbol  +  formattedValue;
    	}	
        return formattedValue;
    },
    
    /**
     * Get currency symbol if possible.
     * @param {values} with other field values in the same record.
     */
    getCurrencySymbol: function(values){
    	var currencySymbol = "";
        if (valueExists(this.currency)) {
        	currencySymbol = View.currencySymbolFor(this.currency);
        } else if (valueExists(this.currencyField) && valueExists(values)) {
        	var currencyFieldValue = values[this.currencyField];
        	if (valueExists(currencyFieldValue)) {
        		currencySymbol = View.currencySymbolFor(currencyFieldValue);
        	}
        } 
        
        if (valueExists(values) && valueExists(values['totalsCurrency'])){
        	// kb 3039220  Totals with user selected currency 
        	currencySymbol = View.currencySymbolFor(values['totalsCurrency']);
        }
        return currencySymbol;
    },
    
    /**
     * Parses localized string value into JavaScript object.
     * @param {useLocalizedFormat} Whether to use localized format or ARCHIBUS neutral format.
     * @param {recordValues} one record values which could contain currencyField value.
     * @throws exception if the value cannot be parsed.
     */
    parseValue: function(value, useLocalizedFormat, recordValues) {
        var parsedValue = value;
        if (!valueExists(useLocalizedFormat)) {
            useLocalizedFormat = true;
        }
        if (this.isDate && value.constructor == String) {
			if (trim(value) != '') {
				parsedValue = Date.parseDate(value, this.getDateFormat(useLocalizedFormat));
				if (!valueExists(parsedValue)) {
					// hack for grid values, which use raw DB values and not ARCHIBUS neutral format
					// TODO: fix the grid data format and ViewHandlers.getDataRecords()!
					parsedValue = Date.parseDate(value + '00', 'Y-m-d H:i:s.u');
				}
                if (!valueExists(parsedValue)) {
                    // KB 3042368
                    parsedValue = Date.parseDate(value, 'Y-m-d H:i:s');
                }
			}
        } else if (this.isTime && value.constructor == String) {
  			if (trim(value) != '') {
                parsedValue = Date.parseDate(value, this.getTimeFormat(useLocalizedFormat));
                if (!valueExists(parsedValue)) {
                    // hack for grid values, which use raw DB values and not ARCHIBUS neutral format
                    // TODO: fix the grid data format and ViewHandlers.getDataRecords()!
                    parsedValue = Date.parseDate(value, 'H:i:s');
                }
                if (!valueExists(parsedValue)) {
                    // KB 3042368
                    parsedValue = Date.parseDate(value, 'Y-m-d H:i:s');
                }
				if (!valueExists(parsedValue)) {
                    // hack for Oracle and MS SQL
                    parsedValue = Date.parseDate(value + '00', 'Y-m-d H:i:s.u');
                }
                if (!valueExists(parsedValue)) {
                    // hack for Sybase 10.0.1.3415
   	                parsedValue = Date.parseDate(value, 'H:i:s.u');
   	            }
                if (!valueExists(parsedValue)) {
                    // hack for Sybase 10.0.1.4293
                    parsedValue = Date.parseDate(value + '00', 'H:i:s.u');
                }
			}
        } else if (this.isNumber()) {
        	parsedValue = this.parseNumericValue(parsedValue, useLocalizedFormat, recordValues);
        }
        return parsedValue;
    },
    
    /**
     * Parse localized Numeric Value into Neutral format.
     * @param {value} The field value to parse.
     * @param {useLocalizedFormat} Whether to use localized format or ARCHIBUS neutral format.
     * @param {values} Other field values in the same record.
     */
    parseNumericValue: function(value, useLocalizedFormat, values){
    	var parsedValue = value + '';
        // remove group separator
        if (this.format.toUpperCase() != 'NOSEPARATOR') {
            parsedValue = removeGroupingSeparator(parsedValue, useLocalizedFormat);
        }
    	 
        // XXX:a high risk change
        // replace localized decimal separator by default separator "."
        // parsedValue = parsedValue.replace(strDecimalSeparator, ".");
    	 
        // remove currency symbol if possible
        var currencySymbol = this.getCurrencySymbol(values);
        if(valueExistsNotEmpty(currencySymbol)){
            parsedValue = trim(parsedValue.replace(currencySymbol, ''));
        }
         
        return parsedValue;
    },
    
    /**
     * Returns date format string.
     * @param {useLocalizedFormat} Whether to use localized format or ARCHIBUS neutral format.
     */
    getDateFormat: function(useLocalizedFormat) {
        return useLocalizedFormat ? View.dateFormat : 'Y-m-d';
    },

    /**
     * Returns time format string.
     * @param {useLocalizedFormat} Whether to use localized format or ARCHIBUS neutral format.
     */
    getTimeFormat: function(useLocalizedFormat) {
        return useLocalizedFormat ? View.timeFormat : 'H:i.s.u';
    },
    
    isNumber: function() {
        return (this.type === 'java.lang.Double' || this.type === 'java.lang.Integer' || (this.type == 'java.lang.Float' && this.format == 'Float'));
    },
    
    /**
     * Evaluates expressions in property values.
     */
    evaluateExpressions: function(ctx) {
    	if (valueExists(this.currency)) {
            this.currency = View.evaluateString(this.currency, ctx);
    	}
    	if (valueExists(this.title)) {
    		this.title = View.evaluateString(this.title, ctx, false);
    	}
    }
});


/**
 * Sort field definition.
 */
Ab.data.SortFieldDef = Base.extend({
    table: '',
    name: '',
    ascending: true,
    
    /**
     * Constructor.
     */
    constructor: function(config) {
        Ext.apply(this, config);
    }
});


/**
 * Data record.
 */
Ab.data.Record = Base.extend({
    
    // hash of record values; each value is a JavaScript object
    values: null,
    
    // hash of old record values; each value is an ARCHIBUS neutral string
    oldValues: null,
    
    // hash of localized values; used in grid and cross-table controls 
    // to avoid on-the-fly localization of large data volumes (too slow in IE6)
    localizedValues: null, 
    
    // true if this record does not exist in the database 
    isNew: true, 

    /**
     * Constructor.
     * @param {values} Initial record values. 
     * @param {isNew}  true if the record does not exist in the database.
     */
    constructor: function(values, isNew) {
        this.values = {};
        this.oldValues = {};
        this.localizedValues = {};
        if (valueExists(values)) {
            this.fromJSON(values);
        }
        
        if (valueExists(isNew)) {
            this.isNew = isNew;
        }
    },
    
    /**
     * Set properties from JSON payload.
     * @param {record} JSON record received from the WFR.
     */
    fromJSON: function(record) {
        for (var name in record) {
            var value = record[name];
            if (!valueExists(value)) {
                value = '';
            }
          
            // TODO: the grid and its WFR still use old JSON format
            if (!endsWith(name, '.key') && !endsWith(name, '.raw')) {
                var rawValue = record[name + '.raw'];
                if (valueExists(rawValue)) {
                    this.values[name] = rawValue;
                } else if (valueExists(value.n)) {
                    this.values[name] = value.n;
                    this.localizedValues[name] = value.l;
                } else {
                    this.values[name] = value;
                }
            }
        }
        if (valueExists(this.values['isNew'])) {
            this.isNew = this.values['isNew'];
        }
    },

    /**
     * Returns Ab.view.Restriction object containing clauses for all record values.
     */
    toRestriction: function() {
        return new Ab.view.Restriction(this.values);
    },
    
    /**
     * Return value of specified field.
     */
    getValue: function(fieldName) {
        return this.values[fieldName];
    },
    
    /**
     * Return localized value of specified field.
     */
    getLocalizedValue: function(fieldName) {
        return this.localizedValues[fieldName];
    },
    
    /**
     * Set value of specified field.
     */
    setValue: function(fieldName, value) {
        this.values[fieldName] = value;
    },
    
    /**
     * Set value of specified field.
     */
    setOldValue: function(fieldName, value) {
        this.oldValues[fieldName] = value;
    },
    
    /**
     * Removes value of specified field from the record.
     */
    removeValue: function(fieldName) {
        delete this.values[fieldName];
    },
    
    /**
     * Gets record's values.
     */
    getValues: function(){
    	return this.values;
    },
    
    /**
     * Returns a string containing record values.
     */
    toString: function() {
        var s = '';
        for (var name in this.values) {
            var value = this.values[name];
            s = s + name + ': \'' + value + '\', ';
        }
        return s;
    }
});

/**
 * Data set base class.
 */
Ab.data.DataSet = Base.extend({
    
    // data set type
    type: '',
    
    /**
     * Constructor.
     */
    constructor: function(data) {
        if (valueExists(data)) {
            this.fromJSON(data);
        }
    },
    
    /**
     * Set properties from JSON payload.
     * @param {data} JSON record recieved from the WFR.
     */
    fromJSON: function(data) {}
});

/**
 * Data set containing a list of records.
 */
Ab.data.DataSetList = Ab.data.DataSet.extend({
    // array of Ab.data.Record
    records: null,

    // whether the server could not retrieve all requested records due to a record limit    
    hasMoreRecords: false,
    
    /**
     * Constructor.
     */
    constructor: function(data) {
        this.records = [];
        this.inherit(data);
        this.type = 'list';
    },
    
    /**
     * Add record.
     */
    addRecord: function(record) {
        this.records.push(record);
    },
    
    /**
     * Adds a list of records.
     */
    addRecords: function(records) {
    	for (var i = 0; i < records.length; i++) {
            this.records.push(records[i]);
    	}
    },
    
    /**
     * Set properties from JSON payload.
     * @param {data} JSON data received from the WFR.
     */
    fromJSON: function(data) {
        this.inherit(data);
        
        for (var i = 0; i < data.records.length; i++) {
            var dataRecord = new Ab.data.Record();
            dataRecord.fromJSON(data.records[i]);
            this.records.push(dataRecord);
        }

        if (valueExists(data.hasMoreRecords)) {
            this.hasMoreRecords = data.hasMoreRecords;
        }
    }
});

/**
 * Specialized data set for report grid/mini-console controls.
 */
Ab.data.DataSetGrid = Ab.data.DataSetList.extend({
    
    // array of index records, each containing {value, count} properties.
    indexRecords: null,
    
    /**
     * Constructor.
     */
    constructor: function(data) {
        this.indexRecords = [];
        this.inherit(data);
        this.type = 'grid';
    },
    
    /**
     * Set properties from JSON payload.
     * @param {data} JSON data received from the WFR.
     */
    fromJSON: function(data) {
        this.inherit(data);
        
        for (var i = 0; i < data.indexRecords.length; i++) {
            this.indexRecords.push(data.indexRecords[i]);
        }
    },
    
    /**
     * Return array of index records.
     */
    getIndexRecord: function() {
        return this.indexRecords;
    }
});


/**
 * Data set containing a list of records grouped by one dimension.
 * In addition to the records, holds a separate list of dimension values, for convenience.
 */
Ab.data.DataSet1D = Ab.data.DataSetList.extend({
    // array of row dimension values
    rowValues: null,
    
    // array of row dimension records (optional)
    rowRecords: null,
    
    // array of total records
    totals: null,
    
    /**
     * Constructor.
     */
    constructor: function(data) {
        this.rowValues = [];
        this.rowRecords = [];
        this.totals = [];
        this.nullValueTitle = '';
        this.inherit(data);
        this.type = '1d';

    },
    
    /**
     * Set properties from JSON payload.
     * @param {data} JSON data received from the WFR.
     */
    fromJSON: function(data) {
        this.inherit(data);
        
        for (var i = 0; i < data.rowValues.length; i++) {
            this.rowValues.push(data.rowValues[i]);
        }

        for (var i = 0; i < data.rowRecords.length; i++) {
            var dataRecord = new Ab.data.Record();
            dataRecord.fromJSON(data.rowRecords[i]);
            this.rowRecords.push(dataRecord);
        }

        for (var i = 0; i < data.totals.length; i++) {
            var dataRecord = new Ab.data.Record();
            dataRecord.fromJSON(data.totals[i]);
            this.totals.push(dataRecord);
        }
        
        this.nullValueTitle = data.nullValueTitle;
    },
    
    /**
     * Return array of localized row values.
     */
    getRowValues: function() {
        return this.rowValues;
    }
});

/**
 * Data set containing a list of records grouped by one dimension.
 * In addition to the records, holds separate lists of row and column dimension values.
 */
Ab.data.DataSet2D = Ab.data.DataSet1D.extend({
    // array of column dimension values
    columnValues: null,
    
    // Record index. The key is a string that combines row and column values ("row.column"), and the
    // value is an index of the record in the records list.
    recordIndex: null,
    
    // array of row subtotals records
    rowSubtotals: null,
    
    nullValueTitle: null, 
    
    /**
     * Constructor.
     */
    constructor: function(data) {
        this.columnValues = [];
        this.recordIndex = {};
        this.rowSubtotals = [];
        this.columnSubtotals = [];
        this.nullValueTitle = '';
        
        this.inherit(data);
        
        this.type = '2d';
    },
    
    /**
     * Set properties from JSON payload.
     * @param {data} JSON data received from the WFR.
     */
    fromJSON: function(data) {
        this.inherit(data);
        
        for (var i = 0; i < data.columnValues.length; i++) {
            this.columnValues.push(data.columnValues[i]);
        }
        
        this.recordIndex = data.recordIndex; 
        
        for (var i = 0; i < data.rowSubtotals.length; i++) {
            var dataRecord = new Ab.data.Record();
            dataRecord.fromJSON(data.rowSubtotals[i]);
            this.rowSubtotals.push(dataRecord);
        }

        for (var i = 0; i < data.columnSubtotals.length; i++) {
            var dataRecord = new Ab.data.Record();
            dataRecord.fromJSON(data.columnSubtotals[i]);
            this.columnSubtotals.push(dataRecord);
        }

        this.nullValueTitle = data.nullValueTitle;
    },
    
    /**
     * Returns array of localized column values.
     */
    getColumnValues: function() {
        return this.columnValues;
    },

    /**
     * Returns 0-based index of the record for specific row and column values.
     * @param {Object} rowValue
     * @param {Object} columnValue
     */    
    getRecordIndex: function(rowValue, columnValue) {
        var key = rowValue + "." + columnValue;
        return this.recordIndex[key];
    },
    
    /**
     * Returns record for specific row and column values.
     * @param {Object} rowValue
     * @param {Object} columnValue
     */    
    getRecordForRowAndColumn: function(rowValue, columnValue) {
        var index = this.getRecordIndex(rowValue, columnValue);
        return this.records[index];
    }
});


/**
 * Proxy object for the server-side DataSource.
 * 
 * An instance of DataSource is automatically created for each <dataSource> in AXVW.
 * All instances are managed by the View object in the dataSources collection.
 * 
 * The DataSource contains field definitions for all fields defined in AXVW.
 * The DataSource also exposes the server-side DataSource data access methods.
 */
Ab.data.DataSource = Base.extend({
    
    // data source id
    id: '',
    
    // data source type, e.q. 'grouping'
    type: '',
    
    // data source title
    title: '',
    
    // short view name without extension, such as 'ab-ex-em-grid'
    viewName: '',
    
    // main table name
    mainTableName: '',

    // array of all table names
    tableNames: null,
    
    // Ext.util.MixedCollection of Ab.data.FieldDef objects
    fieldDefs: null,
    
    // array of Ab.data.SortFieldDef objects
    sortFieldDefs: [],
    
    // DataSource query parameters
    parameters: null,
    
    // DataSource query 
    customQuery: null,
    
    // DataSource restriction 
    restriction: null,

    // record limit, 0 means no limit
    recordLimit: 0,
    
    // DataSource main table primary key field name collection
    primaryKeyFields: [],
    
    // original configuration
    config: null,
    
    /**
     * Constructor.
     */
    constructor: function(id, config) {
    	this.config = config;
        this.id = id;
        this.type = config.type;
        this.title = config.title;
        this.viewName = config.viewName;
        this.mainTableName = config.mainTableName;
        this.tableNames = config.tableNames;
        this.parameters = {};

        // create field defs
        this.fieldDefs = new Ext.util.MixedCollection();
        if (valueExists(config.fieldDefs)) {
            for (var i = 0; i < config.fieldDefs.length; i++) {
                var fieldDef = new Ab.data.FieldDef(config.fieldDefs[i]);
                this.fieldDefs.add(fieldDef.id, fieldDef);
            }
        }
        this.sortFieldDefs = [];
        if (valueExists(config.sortFieldDefs)) {
            for (var i = 0; i < config.sortFieldDefs.length; i++) {
                var sortFieldDef = new Ab.data.SortFieldDef(config.sortFieldDefs[i]);
                this.sortFieldDefs[i] = sortFieldDef;
            }
        }
        this.primaryKeyFields = [];
        if (valueExists(config.primaryKeyFields)) {
            for (var i = 0, primaryKeyName; primaryKeyName = config.primaryKeyFields[i]; i++) {
                this.primaryKeyFields[i] = primaryKeyName;
            }
        }

        if (valueExists(config.customQuery)) {
			this.customQuery = config.customQuery;
        }
        if (valueExists(config.viewRestriction)) {
			this.restriction = config.viewRestriction;
        }
        
        this.evaluateExpressions();

        // register this data source in the View
        View.dataSources.add(this.id, this);
    },
    
    /**
     * Formats an object value as a localized string using the current user locale.
     * @param {fieldName} ARCHIBUS field name, e.q. 'wr.date_requested'
     * @param {fieldValue} Field value as an object.
     * @param {useLocalizedFormat} Whether to use localized format or ARCHIBUS neutral format.
     * @param {convertEnumValues} Whether to convert enumerated values from stored to display format.
     */
    formatValue: function(fieldName, fieldValue, useLocalizedFormat, convertEnumValues, values) {
    	if (!valueExists(convertEnumValues)) {
    		convertEnumValues = true;
    	}
  	
        var formattedValue = fieldValue;
        
        var fieldDef = this.fieldDefs.get(fieldName);
        if (fieldDef) {
            formattedValue = fieldDef.formatValue(fieldValue, useLocalizedFormat, convertEnumValues, values);
        }
        
        return formattedValue;
    },
    
    /**
     * Adds a currency symbol to the field value if this is a currency field.
     * @param {fieldName} ARCHIBUS field name, e.q. 'wr.date_requested'
     * @param {fieldValue} Field value as an object.
     */
    formatCurrencyValue: function(fieldName, fieldValue, values) {
        var formattedValue = fieldValue;
        
        var fieldDef = this.fieldDefs.get(fieldName);
        if (fieldDef) {
            formattedValue = fieldDef.formatCurrency(fieldValue, values);
        } else {
        	// check for totals, min, max and average field: table_name.sum_field_name
        	fieldName = fieldName.replace('.sum_', '.');
        	fieldName = fieldName.replace('.min_', '.');
        	fieldName = fieldName.replace('.max_', '.');
        	fieldName = fieldName.replace('.avg_', '.');
            fieldDef = this.fieldDefs.get(fieldName);
            if (fieldDef) {
                formattedValue.l = fieldDef.formatCurrency(fieldValue.l, values);
            }        	
        }
        
        return formattedValue;
    },
    
    /**
     * Parses a localized string into an object value.
     * @param {fieldName} ARCHIBUS field name, e.q. 'wr.date_requested'
     * @param {fieldValue} Field value as a string.
     * @param {useLocalizedFormat} Whether to use localized format or ARCHIBUS neutral format.
     * @param {recordValues} one record values which could contain currencyField value.
     */
    parseValue: function(fieldName, fieldValue, useLocalizedFormat, recordValues) {
        var parsedValue = fieldValue;
        
        var fieldDef = this.fieldDefs.get(fieldName);
        if (fieldDef) {
            parsedValue = fieldDef.parseValue(fieldValue, useLocalizedFormat, recordValues);
        }
        
        return parsedValue;
    },
    
    /**
     * Parses all values in specified object.
     * @param {useLocalizedFormat} Whether to use localized format or ARCHIBUS neutral format.
     * @return new object containing parsed values.
     */
    parseValues: function(values, useLocalizedFormat) {
        var parsedValues = {};
        for (var name in values) {
            var parsedValue = this.parseValue(name, values[name], useLocalizedFormat, values);
            parsedValues[name] = parsedValue;
        }
        return parsedValues;
    },
    
    /**
     * Formats all values in specified object.
     * @param {useLocalizedFormat} Whether to use localized format or ARCHIBUS neutral format.
     * @param {convertEnumValues} Whether to convert enumerated values from stored to display format.
     * @return new object containing formatted values.
     */
    formatValues: function(values, useLocalizedFormat, convertEnumValues) {
    	if (!valueExists(convertEnumValues)) {
    		convertEnumValues = true;
    	}
  	
        var formattedValues = {};
        for (var name in values) {
            var value = values[name];
            if (valueExistsNotEmpty(value)) {
                var formattedValue = this.formatValue(name, value, useLocalizedFormat, convertEnumValues, values);
                formattedValues[name] = formattedValue;
            } else {
                formattedValues[name] = value;
            }
        }
        return formattedValues;
    },
    
    /**
     * Formats specified ID field value according to lookup metadata.
     * @param idValue The ID field value.
     * @param recordValues All record values.
     */
    formatLookupValue: function(idFieldName, idValue, recordValues) {
        var formattedValue = idValue;

        var idFieldDef = this.fieldDefs.get(idFieldName);
        if (idFieldDef) {
            formattedValue = idFieldDef.formatLookupValue(idValue, recordValues);
        }

        return formattedValue;
    },
   
    /**
     * Adds a currency symbol to field values that are currency fields.
     */
    formatCurrencyValues: function(values) {
        var formattedValues = {};
        for (var name in values) {
            var value = values[name];
            if (valueExistsNotEmpty(value)) {
                var formattedValue = this.formatCurrencyValue(name, value, values);
                formattedValues[name] = formattedValue;
            }
        }
        return formattedValues;
    },
    
    /**
     * Processes a record received from the server.
     * Sets record old values as ARCHIBUS neutral strings.
     * Parses record values from ARCHIBUS neutral strings into JavaScript objects.
     * @param {record} Inbound record.
     * @return Processed record.
     */
    processInboundRecord: function(record) {
        record.oldValues = this.parseValues(record.values, false);
        record.values = this.parseValues(record.values, false);
        return record;
    },
    
    /**
     * Processes a record before sending it to the server.
     * Sets record old values as ARCHIBUS neutral strings.
     * Parses record values from ARCHIBUS neutral strings into JavaScript objects.
     * Does not change the record passed as a parameter - creates new copy.
     * @param {record} Outbound record.
     * @return Processed record.
     */
    processOutboundRecord: function(record) {
        var processedRecord = new Ab.data.Record();
        processedRecord.values = this.formatValues(record.values, false);
        processedRecord.oldValues = this.formatValues(record.oldValues, false);
        processedRecord.isNew = record.isNew;
        return processedRecord;
    },
    
    // ----------------------- data access methods ------------------------------------------------

    /**
     * Sets the restriction to use if one is not specified in the getRecords() call.
     * @param restriction
     */
    setRestriction: function(restriction) {
        this.restriction = restriction;
    },

    /**
     * Add parameter.
     */
    addParameter: function(name, value) {
        this.parameters[name] = value;   
    },

    /**
     * Adds parameters.
     * @param parameters JSON object containing parameter names and values.
     */
    addParameters: function(parameters) {
        _.extend(this.parameters, parameters);
    },

    /**
     * Clears all parameters.
     */
    clearParameters: function() {
        this.parameters = {};
    },

    /**
     * Retrieves an array of records.
     * @param {restriction} Ab.view.Restriction, optional.
     * @param {config} Additional parameters for the WFR, optional.
     * @return Array of Ab.data.Record.
     */
    getRecords: function(restriction, config) {
        var parameters = this.getParameters(config);
        if (restriction) {
            if (restriction.addClauses) {
                restriction.addClauses(this.restriction, false);
            }
        } else {
            restriction = this.restriction;
        }
        parameters.restriction = toJSON(restriction || {});
        parameters.recordLimit = this.recordLimit;
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        
        // parse record values from ARCHIBUS neutral strings into JavaScript objects
        var records = [];
        for (var i = 0; i < result.dataSet.records.length; i++) {
            records.push(this.processInboundRecord(result.dataSet.records[i]));
        }
        return records;
    },
        
    /**
     * Retrieves a single record.
     * @param {restriction} Ab.view.Restriction, optional.
     * @param {config} Additional parameters for the WFR, optional.
     * @return Ab.data.Record.
     */
    getRecord: function(restriction, config) {
        var parameters = this.getParameters(config);
        parameters.restriction = toJSON(restriction || {});
        var result = Workflow.call('AbCommonResources-getDataRecord', parameters);
        
        // parse record values from ARCHIBUS neutral strings into JavaScript objects
        result.dataSet = this.processInboundRecord(result.dataSet);
        
        return result.dataSet;
    },
    
    /**
     * Retrieves a new record with default values, defined in ARCHIBUS schema and in AXVW.
     * @param {restriction} Ab.view.Restriction, optional.
     * @param {config} Additional parameters for the WFR, optional.
     * @return Ab.data.Record.
     */
    getDefaultRecord: function(restriction, config) {
        var parameters = this.getParameters(config);
        parameters.restriction = toJSON(restriction || {});
        var result = Workflow.call('AbCommonResources-getDefaultDataRecord', parameters);
        
        // parse record values from ARCHIBUS neutral strings into JavaScript objects
        result.dataSet = this.processInboundRecord(result.dataSet);
        
        return result.dataSet;
    },
    
    /**
     * Saves a single record.
     * @param {record} Ab.data.Record.
     * @param {config} Additional parameters for the WFR, optional.
     * @return Ab.data.Record with new PK values if new record was saved and PK was auto-generated.
     */
    saveRecord: function(record, config) {
        var parameters = this.getParameters(config);
        
        // format record values into ARCHIBUS neutral strings
        record = this.processOutboundRecord(record);
        
        parameters.record = toJSON(record);
        var result = Workflow.call('AbCommonResources-saveDataRecord', parameters);
        return result.dataSet;
    },
    
    /**
     * Saves a single record.
     * @param {record} Ab.data.Record.
     * @param {config} Additional parameters for the WFR, optional.
     * @return Ab.data.Record with new PK values if new record was saved and PK was auto-generated.
     */
    saveRecords: function(records, config) {
        var parameters = this.getParameters(config);
        
        // format record values into ARCHIBUS neutral strings
        var outboundRecords = [];
        for (var i = 0; i < records.length; i++) {
            outboundRecords.push(this.processOutboundRecord(records[i]));
        }
        
        parameters.records = toJSON(outboundRecords);
        var result = Workflow.call('AbCommonResources-saveDataRecord', parameters);
        return result.dataSet;
    },
    
    /**
     * Deletes a single record.
     * @param {record} Ab.data.Record.
     * @param {config} Additional parameters for the WFR, optional.
     * @return Ab.data.Record with new PK values if new record was saved and PK was auto-generated.
     */
    deleteRecord: function(record, config) {
        var parameters = this.getParameters(config);
        
        // format record values into ARCHIBUS neutral strings
        record = this.processOutboundRecord(record);
        
        parameters.record = toJSON(record);
        var result = Workflow.call('AbCommonResources-deleteDataRecords', parameters);
        return result.dataSet;
    },
    
    /**
     * Returns common WFR parameters.
     */
    getParameters: function(config) {
        var parameters = config || {};
        
        parameters.viewName = this.viewName;
        parameters.dataSourceId = this.id;
        if (!valueExistsNotEmpty(this.viewName)) {
        	parameters.tableName = this.mainTableName;
            parameters.tableNames = this.tableNames;

            if (this.tableNames) {
                parameters.tableNames = toJSON(this.tableNames);
            }

        	parameters.fieldNames = [];
            this.fieldDefs.each(function(fieldDef) {
                parameters.fieldNames.push(fieldDef.id);
            });
        	parameters.fieldNames = toJSON(parameters.fieldNames);
        }
        
        Ext.apply(parameters, this.parameters);
        
        return parameters;
    },
    
    /**
     * Evaluate expressions in data source properties.
     */
    evaluateExpressions: function(ctx) {
        if (!valueExists(ctx)) {
            ctx = View.evaluationContext;
        }
        
        this.fieldDefs.each(function(fieldDef) {
            fieldDef.evaluateExpressions(ctx);
        });
    }
});

/**
 * Static factory method that creates a DataSet instance from data sent from the server.
 */
Ab.data.createDataSet = function(data) {
    var dataSet = null;
    if (data.type == 'record') {
        dataSet = new Ab.data.Record(data.records[0]);
    } else if (data.type == 'list') {
        dataSet = new Ab.data.DataSetList(data);
    } else if (data.type == 'grid') {
        dataSet = new Ab.data.DataSetGrid(data);
    } else if (data.type == '1d') {
        dataSet = new Ab.data.DataSet1D(data);
    } else if (data.type == '2d') {
        dataSet = new Ab.data.DataSet2D(data);
    }
    return dataSet;
};

/**
 * Static factory method that creates a client-side data source for specified table and fields.
 * @param options Supported options: id, tableNames, fieldNames.
 */
Ab.data.createDataSourceForFields = function(options) {
	var config = {
		type: '',
        tableNames: [],
        fieldNames: [],
		fieldDefs: []
	};
    Ext.apply(config, options);

    config.mainTableName = config.tableNames[0];

	for (var f = 0; f < config.fieldNames.length; f++) {
		var fieldName = config.fieldNames[f];
		if (fieldName.indexOf('.') == -1) {
			fieldName = config.mainTableName + '.' + fieldName;
		}

        if (!options.fieldDefs) {
            config.fieldDefs.push({
                id: fieldName
            });
        }
	}
	return new Ab.data.DataSource(config.id, config);
};

/**
 * Static method to load a data source from a view file and create a client-side DataSource proxy object
 * representing the server-side data source.
 * @param viewName
 * @param dataSourceId
 */
Ab.data.loadDataSourceFromFile = function(viewName, dataSourceId) {
    var dataSourceConfig = Workflow.callMethod(
        'AbCommonResources-DataSourceService-loadDataSourceFromFile', viewName, dataSourceId).data;

    return Ab.data.createDataSourceForFields(dataSourceConfig);
};

/**
 * Encapsulates the highlight pattern string.
 */
Ab.data.HighlightPattern = Base.extend({
	
	// hpattern string
	pattern: '',
	
	// pattern parts
	patternParts: null,
	
	/**
	 * Constructor.
	 */
	constructor: function(pattern) {
	    this.pattern = pattern;
		this.patternParts = pattern.split(' ');
    },
    
    isNewFormat: function() {
    	return (this.patternParts[0] == '14');
    },
    
    isHatched: function() {
		return (this.patternParts[this.isNewFormat() ? 1 : 0] == '1');
    },
    
    getLegendBitmapName: function(tableName, primaryKeyValues) {
    	// table name
    	var name = tableName + '-';
    	
    	// primary key values
    	for (var i = 0; i < primaryKeyValues.length; i++) {
    		name = name +  primaryKeyValues[i];
    	}
    	
    	// pattern name
    	name = name  + this.patternParts[this.isNewFormat() ? 6 : 3];
    	
    	// remove spaces
    	name = name.replace(/\s/g, '');
    	
    	// convert to lower case
    	name = name.toLowerCase();
    	
    	// replace invalid file name special characters
    	name = name.replace(/\&/g, '').replace(/\#/g, '').replace(/\'/g, '').replace(/\"/g, '').replace(/\~/g, '').replace(/\*/g, '').replace(/\$/g, '').replace(/\%/g, '');
    	return name;
    }
});