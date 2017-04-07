/*
 * View object classes for the View Definition wizard.   These hold thelistViewTitleAsXML
 * essential view definition features that are then inserted into the
 * template for the selected view type and pattern.
 *
 * The view for the wizard only needs to hold the basic datasource
 * information: tables, roles, fields, sort, restriction.
 *
 * The view doesn't need to specify formatting, which all comes from
 * the template.
 *
 * This ViewDef class is designed to store and manipulate view
 * definitions.
 *
 * Contrast this with schema\ab-system\component\ab-view.js
 * Ab.view.View class, which is designed to manage the client-side
 * aspects of views at runtime; that is, the target frame, pop up dialogs,
 * tabs and active restriction.
 *
 * Also contrast the ViewDef.Restriction, which has different
 * conjunctions for different clauses and the Ab.view.Restriction,
 * which has one conjunction governing all clauses.
 *
 *
 * ViewDef.view consists of:
 *  A title
 *  A TableGroups array
 *      Each element of which has:
 *          A Tables array
 *              with one and only one main Table
 *              Each which may be followed by one or more standards Tables
 *          An array visible Fields (which can refer to any main or standard table field)
 *          An optional array of SortFields (which also can refer to any main or standard table field)
 *          An optional array of ParsedRestrictionClauses
 *          An optional SqlRestriction (one and only one)
 */
Ab.namespace('ViewDef');


/**
 * Double-quote a literal value
 *
 * @param	val 	String original input
 * @return 			String with double-quotes
 *
 */
function dqte(val){
    return "\"" + val + "\"";
}


/**
 * ViewDefField.  A/FM Field Object.
 *
 */
Ab.ViewDef.Field = Base.extend({

    // pkey
    table_name: "",
    field_name: "",
    
    // view information
    isReadOnly: false,
    isRequired: false,
    
    // useful memo-ized information to display for selecting fields if it can be looked up.
    ml_heading: "",
    ml_heading_english: "",
    primary_key: "",
    data_type: "",
    afm_type: "",
    is_virtual: false,
    sql: '', 
    rowspan: null,
    colspan: null,
    ml_heading_english_original: '',
       
    
    constructor: function(table_name, field_name, isReadOnly, isRequired, afm_type, restriction_parameter, ml_heading, ml_heading_english, primary_key, data_type, showSelectValueAction, is_virtual, sql, rowspan, colspan, ml_heading_english_original){
        this.table_name = table_name;
        this.field_name = field_name;
        this.isReadOnly = isReadOnly;
        this.isRequired = isRequired;
        this.ml_heading = ml_heading;
        this.ml_heading_english = ml_heading_english;
        this.primary_key = primary_key;
        this.data_type = data_type;
        this.afm_type = afm_type;
        this.restriction_parameter = restriction_parameter;
        this.showSelectValueAction = showSelectValueAction;
        if(is_virtual){
        	this.is_virtual = is_virtual;
        }
        this.sql = sql;
        this.rowspan = rowspan;
        this.colspan = colspan;
        this.ml_heading_english_original = ml_heading_english_original;        
    }
}); // end ViewDefField

/** 
 * ViewDefIndexField.  Field to use for index.
 *
 */
Ab.ViewDef.IndexField = Base.extend({

    table_name: "",
    field_name: "",

    
    constructor: function(table_name, field_name){
        this.table_name = table_name;
        this.field_name = field_name;
    }
});

/** 
 * ViewDefSortField.  Field used within a sort order.
 *
 */
Ab.ViewDef.SortField = Base.extend({

    // sort fields only need the table and field name they aren't a sub-type of view field, they are really an index reference to a field.
    table_name: "",
    field_name: "",
    
    // ml_heading
    heading: "",
    ml_heading_english: "",
    
    // sort order for each sort in a view is either ascending or descending
    isAscending: true,
    
    constructor: function(table_name, field_name, ml_heading, ml_heading_english, isAscending, groupByDate){
        this.table_name = table_name;
        this.field_name = field_name;
        this.ml_heading = ml_heading;
        this.ml_heading_english = ml_heading_english;
        if (valueExists(isAscending)) {
            this.isAscending = isAscending;
        }
        if (valueExists(groupByDate)) {
            this.groupByDate = groupByDate;
        }
    }
});


/** 
 * ViewDefMeasure.  Measures
 *
 */
 Ab.ViewDef.Measure = Base.extend({
 	table_name: "",
 	field_name: "",
 	stats: [],
 	name: "",
 	ml_headings: [],
 	ml_headings_english: [],
 
 constructor: function(table_name, field_name, formula, name, ml_heading, ml_heading_english){
 	this.table_name = table_name;
 	this.field_name = field_name; 
 	this.stats = [formula];
 	this.name = name;
 	this.ml_headings= [this.processTitle(ml_heading)];
 	this.ml_headings_english = [this.processTitle(ml_heading_english)];
 },
 
 addStat: function(formula, ml_heading, ml_heading_english){
 	this.stats.push(formula);
 	this.ml_headings.push(this.processTitle(ml_heading));
 	this.ml_headings_english.push(this.processTitle(ml_heading_english));
 },
 
 /**
 * Trim off -Count, -Sum, etc, if it exists in ml_heading (during load of existing view)
 *	@param title
 * @param title
 */
 processTitle: function(title){
 	var str = getMessage('sumPercent') + '|' + getMessage('countPercent') + '|' + getMessage('sum') + '|' + getMessage('avg') + '|' + getMessage('count');
 	str = str.replace(/\*/g, '');
 	var mhRegExp = new RegExp(str, '');
 	title = trim(title.replace(mhRegExp, ''));
 	return title; 	
 }  
 
 });

/**
 * ViewDefTable.  A/FM Table Object.
 *
 */
Ab.ViewDef.Table = Base.extend({ // Per-instance members and methods
    // pkey
    table_name: "",
    
    // a table's role in a view is 'main' or 'standard' in a view.
    role: "",
    
    // if we can look it up, the title is good to display.
    title: "",
    
    constructor: function(table_name, role, title){
        this.table_name = table_name;
        this.role = role;
        if (valueExists(title)) {
            this.title = title;
        }
    }
}, // end per-instance members and methods
{
    // per-class constance
    MAIN_TABLE: "main",
    STANDARD_TABLE: "standard"
}); // end ViewDefTable

/**
 * ViewDef ParsedRestriction clause.
 *
 */
Ab.ViewDef.ParameterRestrictionClause = Base.extend({

    // operator relating this clause to previous clause: "", "AND" "OR" ")AND(" ")OR("
    relop: "",
    
    // field being restricted (again use tbl/fld as index, not a full Ab.ViewDef.Field object).
    table_name: "",
    field_name: "",
    
    // operator relating the field to the value:
    // =, &gt; &lt; &lt;&gt; LIKE,  NOT LIKE, NULL, NOT NULL
    op: "",
    
    // value, e.g. "HQ%", "2".
    value: "",
    
    constructor: function(relop, op, table_name, field_name, value){
        this.table_name = table_name;
        this.field_name = field_name;
        // Strip leading and trailing whitespace, e.g. " )AND( " becomes ")AND(" 
        this.relop = relop.replace(/^\s+|\s+$/g, '');
        this.op = op;
        this.value = value;
    }
    
}); // end ViewDef Parsed Restriction

/**
 * ViewDef ParsedRestriction clause.
 *
 */
Ab.ViewDef.ParsedRestrictionClause = Base.extend({

    // operator relating this clause to previous clause: "", "AND" "OR" ")AND(" ")OR("
    relop: "",
    
    // field being restricted (again use tbl/fld as index, not a full Ab.ViewDef.Field object).
    table_name: "",
    field_name: "",
    
    // operator relating the field to the value:
    // =, &gt; &lt; &lt;&gt; LIKE,  NOT LIKE, NULL, NOT NULL
    op: "",
    
    // value, e.g. "HQ%", "2".
    value: "",
    
    constructor: function(relop, op, table_name, field_name, value){
        this.table_name = table_name;
        this.field_name = field_name;
        // Strip leading and trailing whitespace, e.g. " )AND( " becomes ")AND(" 
        this.relop = relop.replace(/^\s+|\s+$/g, '');
        this.op = op;
        this.value = value;
    }
    
}); // end ViewDef Parsed Restriction

/**
 * ViewDef Parameter
 *
 */
Ab.ViewDef.Parameter = Base.extend({

    // name of parameter
    name: "",
	value: "",
	dataType: "",
  
    constructor: function(name, value, dataType){
        this.name = name;
		this.value = value;
		this.dataType = dataType;
    }
    
}); // end ViewDef Parameter

/**
 * ViewDef SqlRestriction
 *
 */
Ab.ViewDef.SqlRestriction = Base.extend({

    // the sql restriction applies to the main table of the table group.
    table_name: "",
    
    // the sql restriction itself, e.g. "rm.fl_id='18'"
    sql: "",
    
    constructor: function(table_name, sql){
        this.table_name = table_name;
        this.sql = sql;
    }
    
}); // End ViewDef SQL Restriction
/** 
 * ViewDefTableGroup.  A/FM TableGroup Object.
 *
 */
Ab.ViewDef.TableGroup = Base.extend({

    title: "",
    
    // array of table objects: one main table (always first) followed by one or more standard tables. order of tables matters (standards follow the main table).
    tables: [],
    
    // array of visible field objects: can be mixed between main and standard. Fields order matters.    
    fields: [],
    
    // sort order fields.  Order matters.
    sortFields: [],
    
    // measures.
    measures: [],
    
    // parsed Restriction Clauses.  Order also matters.
    parsedRestrictionClauses: [],
    
    // parameter Restriction Clauses.  Order also matters.
    parameterRestrictionClauses: [],
	
    // SQL Restriction (there is only one per tgrp).
    sqlRestriction: "",
	
	// parameters
    parameters: [],
	
	// paginatedPanelProperties: new Object(),
    
    /**
     * TableGroup constructor.
     *
     * @param	table_name	String	Name of the main table
     * @return	None
     *
     */
    constructor: function(table_name){
        //  Initialize arrays
        this.tables = new Array();
        this.fields = new Array();
        this.sortFields = new Array();
        this.measures = new Array();
        this.parsedRestrictionClauses = new Array();
        this.parameterRestrictionClauses = new Array();
		this.parameters = new Array();
        //  Add the main table title    
        var title = getValue('afm_tbls', 'afm_tbls.title', '{"afm_tbls.table_name":' + table_name + '}');
        this.title = title;
        var tbl = new Ab.ViewDef.Table(table_name, Ab.ViewDef.Table.MAIN_TABLE);
        this.tables.push(tbl);
		// this.paginatedPanelProperties = new Object();
    },
    
    /**
     * Creates a new table object with role of standard and pushes into array of table objects.
     *
     * @param	standard_table_name		String 	Name for standard table
     * @return	None
     *
     */
    addStandardTableToTgrp: function(standard_table_name){
        var tbl = new Ab.ViewDef.Table(standard_table_name, Ab.ViewDef.Table.STANDARD_TABLE);
        this.tables.push(tbl);
    },
    
    /**
     *  Add the first title only.  This is typically the view title and not the tgrp title or a restriction title.
     *
     * @param	title		String 	Title for standard table
     * @return	None
     *
     */
    addTitle: function(title){
        if ("" != this.title) 
            this.title = title;
    }
    
}); // end ViewDefTableGroup
/** 
 * ViewDef View.  A/FM View
 *
 */
Ab.ViewDef.View = Base.extend({

    // view's title, e.g. "Rooms by Department"
    title: "",
    
    // hashmap of table group objects indexed on the table_name of the table in the "main" role.
    tableGroups: [],
    chartProperties: new Object(),
    
    // this is the last main table added by the addTable method (e.g. "bl").   
    lastMainTableAddedToView: "",
    
    constructor: function(){
        this.tableGroups = new Array();
    },
    
    /**
     * Add table to the view.  If it is a main table, add a new table group for it.
     * If it is a standard table, add it to the last tablegroup.
     *
     * @param	table_name	String	Name of table, e.g. "bl"
     * @param 	role		optional, Ab.ViewDef.Table.MAIN_TABLE |  Ab.ViewDef.Table.STANDAD_TABLE
     *
     */
    addTable: function(table_name, role, fileExt){
        // if the table already exists in the view in any role, we're done.
        var tgrpAny = this.getTgrpForTable(table_name);
        if (fileExt == "AVW") {
            if (undefined != tgrpAny) 
                return true;
        }
        
        // if there is no role or this is the "main" role, add the tablegroup, in its own TableGroup.  Remember this as the last main table added.
        if (!valueExists(role) || Ab.ViewDef.Table.MAIN_TABLE == role) {
            var tgrp = new Ab.ViewDef.TableGroup(table_name);
            this.tableGroups.push(tgrp);
            this.lastMainTableAddedToView = table_name;
            return true;
        }
        
        // you can't add a standard table if there was no main table
        if ("" == this.lastMainTableAddedToView) 
        
            // no previous main tgrp
            return false;
        
        // find which tgrp holds this main table, and add this table to the end of its list of standards.
        var tgrpMain = this.getTgrpForTable(this.lastMainTableAddedToView);
        if (undefined != tgrpMain) 
            tgrpMain.addStandardTableToTgrp(table_name);
        return true;
    },
    
    /**
     * Add table title to tablegroup
     *
     * @param 	table_name  String	Name of the table
     * @param	title		String	Title for table
     * @return	None
     *
     */
    addTableTitle: function(table_name, title){
        this.tableGroups[this.tableGroups.length - 1].title = title;
    },
    
    
    /**
     * Add the given table to this tgrp as a standard table to the last main table added.
     *
     * @param 	standard_table_name  String	Name of the main table
     * @return	None
     *
     */
    addStandardTable: function(standard_table_name){
        var tgrp = this.getTgrpForTable(standard_table_name);
        tgrp.tables.addStandardTable(tbl);
    },
    
    
    /** 
     * Add this field to the table group with the given table as either a main or standard table.
     * Note that .avw and .axvw files are inherently different in that:
     * In .axvw files, fields of a particular table are contained within its afmtablegroups section,
     * and thus, will also appear in order.  However, in .avw files, Avw.FldOn allows
     * fields of multiple tables to be "mixed together".  Also, in the conversion
     * of .axvw files, there could be two (or more) tablegroups that all
     * pertain to one table (such as typical drilldown editforms of Define Building,
     * Define Department, etc.  Applies to addTable, addField, and addSortField
     *
     * @param	table_name	String	Name of table, e.g. "bl"
     * @param	field_name	String 	Name of field e.g. "bl_id"
     * @param	isReadOnly	Boolean	Optional, makes field read only on edit forms
     * @param	isRequired	Boolean	Optional, makes field required on edit forms
     * @return	None
     *
     */
    //addField: function(field_name, table_name, fileExt, isReadOnly, isRequired, afm_type, restriction_parameter, ml_heading, primary_key, data_type, showSelectValueAction, is_virtual, sql){
    addField: function(field_name, table_name, fileExt, isReadOnly, isRequired, afm_type, restriction_parameter, ml_heading, ml_heading_english, primary_key, data_type, showSelectValueAction, is_virtual, sql, rowspan, colspan, ml_heading_english_original){    
        // don't let incompletely specified fields throw the view build.
        if (!valueExists(table_name) || !valueExists(field_name)) 
            return;
        
        //var fld = new Ab.ViewDef.Field(table_name, field_name, isReadOnly, isRequired, afm_type, restriction_parameter, ml_heading, primary_key, data_type, showSelectValueAction, is_virtual, sql);
				var fld = new Ab.ViewDef.Field(table_name, field_name, isReadOnly, isRequired, afm_type, restriction_parameter, ml_heading, ml_heading_english, primary_key, data_type, showSelectValueAction, is_virtual, sql, rowspan, colspan, ml_heading_english_original);

        // if .AVW view, and tablegroup exists, add the field to the view.
        if (fileExt == "AVW") {
            var tgrp = this.getTgrpForTable(table_name);
            if (valueExists(tgrp)) 
                tgrp.fields.push(fld);
        }
        else 
            if (fileExt == "AXVW") {
            
                // if .AXVW view, search through tables, if name matches, then add field
                var index = 0;
                for (i = 0; i < this.tableGroups.length; i++) {
                    for (j = 0; j < this.tableGroups[i].tables.length; j++) {
                        if (this.tableGroups[i].tables[j].table_name == table_name) 
                            var tgrp = this.tableGroups[i];
                        index = i;
                    }
                }
                this.tableGroups[index].fields.push(fld);
            }
    },

    //addFieldIfNotExists: function(field_name, table_name, fileExt, isReadOnly, isRequired, afm_type, restriction_parameter, ml_heading, primary_key, data_type, showSelectValueAction, is_virtual, sql){
    addFieldIfNotExists: function(field_name, table_name, fileExt, isReadOnly, isRequired, afm_type, restriction_parameter, ml_heading, ml_heading_english, primary_key, data_type, showSelectValueAction, is_virtual, sql){
        // don't let incompletely specified fields throw the view build.
        if (!valueExists(table_name) || !valueExists(field_name)) 
            return;
        
        //var fld = new Ab.ViewDef.Field(table_name, field_name, isReadOnly, isRequired, afm_type, restriction_parameter, ml_heading, primary_key, data_type, showSelectValueAction, is_virtual, sql);
				var fld = new Ab.ViewDef.Field(table_name, field_name, isReadOnly, isRequired, afm_type, restriction_parameter, ml_heading, ml_heading_english, primary_key, data_type, showSelectValueAction, is_virtual, sql);
				
        // if .AVW view, and tablegroup exists, add the field to the view.
        if (fileExt == "AVW") {
            var tgrp = this.getTgrpForTable(table_name);
            if (valueExists(tgrp)) 
                tgrp.fields.push(fld);
        }
        else 
            if (fileExt == "AXVW") {
            
                // if .AXVW view, search through tables, if name matches, then add field
                var index = 0;
                for (i = 0; i < this.tableGroups.length; i++) {
                    for (j = 0; j < this.tableGroups[i].tables.length; j++) {
                        if (this.tableGroups[i].tables[j].table_name == table_name) 
                            var tgrp = this.tableGroups[i];
                        index = i;
                    }
                }
								
								// only add field if not exists
								var bFldFound = false;
                for (k = 0; k < this.tableGroups[index].fields.length; k++) {
                	if ((this.tableGroups[index].fields[k].table_name == table_name) && (this.tableGroups[index].fields[k].field_name == field_name)){
                		bFldFound = true;
                		return;
                	}
                }
                
                if(bFldFound == false){
                	this.tableGroups[index].fields.push(fld);
                }                              
            }
    },
        
    /**
     * For reading in *.axvw views with chart popup.  Since chart popups have their own
     * datasource, ensure that the field does not already exist.  If so, skip.  If not,
     * add the field
     *
     * @param 	field_name	String	Name of field
     * @param	table_name	String	Name of table
     * @param	fileExt		String 	File extension (.AXVW or .AVW)
     * @param	isReadOnly	Boolean	Whether field is readonly
     * @param	isRequired	Boolean	Where field is required
     * @return	None
     *
     */
    //addChartPopupField: function(field_name, table_name, fileExt, isReadOnly, isRequired, afm_type, ml_heading, primary_key, data_type){
    addChartPopupField: function(field_name, table_name, fileExt, isReadOnly, isRequired, afm_type, ml_heading, ml_heading_english, primary_key, data_type){
        	
        // don't let incompletely specified fields throw the view build.
        if (!valueExists(table_name) || !valueExists(field_name)) 
            return;

        //var fld = new Ab.ViewDef.Field(table_name, field_name, isReadOnly, isRequired, afm_type, restriction_parameter, ml_heading, primary_key, data_type, showSelectValueAction, is_virtual, sql);
        //var fld = new Ab.ViewDef.Field(table_name, field_name, isReadOnly, isRequired, afm_type, restriction_parameter, ml_heading, ml_heading_english, primary_key, data_type, showSelectValueAction, is_virtual, sql);
        var fld = new Ab.ViewDef.Field(table_name, field_name, isReadOnly, isRequired, afm_type, null, ml_heading, ml_heading_english, primary_key, data_type, null, false, null);        
        if (fileExt == "AXVW") {
        
            // find the index of the tablegroup   
            var index = 0;
            for (i = 0; i < this.tableGroups.length; i++) {
                for (j = 0; j < this.tableGroups[i].tables.length; j++) {
                    if (this.tableGroups[i].tables[j].table_name == table_name) 
                        var tgrp = this.tableGroups[i];
                    index = i;
                }
            }
   
            // check if field already exists
            var fields = this.tableGroups[index].fields;
            var bFound = false;
            for (var i = 0; i < fields.length; i++) {
                if (table_name == fields[i].table_name) {
                    if (field_name == fields[i].field_name) {
                        var bFound = true;
                    }
                }
            }
            
            // if field does not already exist, add
            if (bFound == false) {
                this.tableGroups[index].fields.push(fld);
            }
        }
    },

    /**
     * Sort is defined in order sort fields are added to the view.
     *
     * @param	table_name 	String	Name of table within view to which sort applies, e.g. "bl"
     * @param	field_name	String	Name of field to sort on
     * @param	isAscending Boolean	True if ascending sort
     * @return	None
     *
     */
    addIndexField: function(table_name, field_name){
        if (table_name == "") {
            table_name = this.lastMainTableAddedToView;
        }
        
        var indexField = new Ab.ViewDef.IndexField(table_name, field_name);
        var index = 0;
        for (i = 0; i < this.tableGroups.length; i++) {
        	for (j = 0; j < this.tableGroups[i].tables.length; j++) {
        		if (this.tableGroups[i].tables[j].table_name == table_name) 
        			var tgrp = this.tableGroups[i];
        		index = i;
        	}
        }
        this.tableGroups[index].indexField = indexField;
    },
        
    /**
     * Sort is defined in order sort fields are added to the view.
     *
     * @param	table_name 	String	Name of table within view to which sort applies, e.g. "bl"
     * @param	field_name	String	Name of field to sort on
     * @param	isAscending Boolean	True if ascending sort
     * @return	None
     *
     */
    addSortField: function(table_name, field_name, heading, ml_heading_english, fileExt, isAscending, groupByDate){
        if (table_name == "") {
            table_name = this.lastMainTableAddedToView;
        }
        var sortfld = new Ab.ViewDef.SortField(table_name, field_name, heading, ml_heading_english, isAscending, groupByDate);
        
        if (fileExt == "AVW") {
            tgrp = this.getTgrpForTable(table_name);
            if (valueExists(tgrp)) 
                tgrp.sortFields.push(sortfld);
        }
        else 
            if (fileExt == "AXVW") {
                var index = 0;
                for (i = 0; i < this.tableGroups.length; i++) {
                    for (j = 0; j < this.tableGroups[i].tables.length; j++) {
                        if (this.tableGroups[i].tables[j].table_name == table_name) 
                            var tgrp = this.tableGroups[i];
                        index = i;
                    }
                }
                this.tableGroups[index].sortFields.push(sortfld);
            }
    },
    
    /**
     * Add measure to array of measure objects
     *
     * @param	field_name	String	Name of field
     * @param	formula		String	Count, Avg, Sum, etc
     * @param	name		String	Name of measure
     * @param	ml_heading	String	ML Heading
     * @return	None
     *
     */
    //addMeasure: function(field_name, formula, name, ml_heading, table_name){
    addMeasure: function(field_name, formula, name, ml_heading, ml_heading_english, table_name){
    	// find the index of the tablegroup   
    	var index = 0;
    	for (i = 0; i < this.tableGroups.length; i++) {
    		for (j = 0; j < this.tableGroups[i].tables.length; j++) {
    			if (this.tableGroups[i].tables[j].table_name == table_name) 
    				var tgrp = this.tableGroups[i];
    			index = i;
    		}
    	}
    	
    	if (valueExists(tgrp)) {
    		var fields = tgrp.fields;
    		var table_name = tgrp.tables[0].table_name;
    		var measures = tgrp.measures;
    		var bFound = false;			
    		
    		for (var i = 0; i < measures.length; i++) {
    			if ((measures[i].table_name == table_name) && (measures[i].field_name == field_name)) {
    				measures[i].addStat(formula, ml_heading, ml_heading_english);
    				bFound = true;
    			}
    		}
    		
    		if (bFound == false) {
    			//var measure = new Ab.ViewDef.Measure(table_name, field_name, formula, name, ml_heading);
    			var measure = new Ab.ViewDef.Measure(table_name, field_name, formula, name, ml_heading, ml_heading_english);		
    			this.tableGroups[index].measures.push(measure);
    		}    	
    	}
    },
     
    /**
     * Add paginated panel properties
     *
     */
    addPaginatedPanelProperties: function(property, value){
		var tgrp = this.getTgrpForTable(this.lastMainTableAddedToView);
		if (!valueExists(tgrp.paginatedPanelProperties)) {
			tgrp.paginatedPanelProperties = new Object();
		}
		tgrp.paginatedPanelProperties[property] = value;
    },
	    
    /**
     * Add sql restriction to tablegroup
     *
     * @param	table_name		String	Name of table within view to which restriction applies
     * @param	sqlRestriction	String	Restriction clause, e.g. " ( bl.bl_id ='jfk' ) "
     * @return	None
     *
     */
    addSqlRestriction: function(table_name, sqlRestriction){
        var sqlRest = new Ab.ViewDef.SqlRestriction(table_name, sqlRestriction);
        
        tgrp = this.getTgrpForTable(table_name);
        if ((valueExists(tgrp))) 
            tgrp.sqlRestriction = sqlRest;
    },
    
    /**
     * Add pattern to tablegroup
     *
     * @param	pattern	String	Name of pattern
     * @return	NOone
     *
     */
    addPattern: function(pattern){
        this.pattern = pattern;
    },
    
    /**
     *
     * Add the given SQL restriction to the last main table group added to the view.
     * This is used Web views, which typically don't specify the table.
     *
     * @param	sqlRestriction	String	restriction clause, e.g. " ( bl.bl_id ='jfk' ) "
     * @return	Nothing.
     *
     */
    addSqlRestrictionToTgrp: function(sqlRestriction){
    
        // find the last main table group added.  
        var tgrpMain = this.getTgrpForTable(this.lastMainTableAddedToView);
        if (undefined == tgrpMain) 
            return;
        
        // Aad the restriction to't.        
        var sqlRest = new Ab.ViewDef.SqlRestriction(tgrpMain.tables[0].table_name, sqlRestriction);
        tgrpMain.sqlRestriction = sqlRest;
        
    },
    
    /** 
     * Add parsed restrictions
     *
     * @param	relOp		String	Name of conjunction (AND, OR, etc)
     * @param	table_name	String	Name of table within view to which restriction applies
     * @param	field_name	String	Name of field
     * @param	op			String	Name of operator (=, !=, NULL, etc)
     * @param	value		String	Value of restriction
     * @return	None
     *
     */
    addParsedRestrictionClause: function(relOp, table_name, field_name, op, value){
    
        // in some cases the table name is included as part of the field name.  in such cases, separate
        var temp = field_name.split(".");
        
        // use field name
        if (temp[1] == undefined) {
            field_name = temp[0];
        }
        else {
            field_name = temp[1];
        }
        
        // remove spaces from conjunction
        relOp = relOp.replace(/\s/g, '');
        
        // if no conjunction was specified, simply use 'AND'
        if (relOp == '') {
            relOp = 'AND';
        }
        
        // convert not equal operator
        if (op == '<>') {
            op = '!=';
        }
        
        // remove any spaces in operator
        op = op.replace(/^\s+|\s+$/g, '');
        
        // create restriction object
        var restClause = new Ab.ViewDef.ParsedRestrictionClause(relOp, op, table_name, field_name, value);
        
        // find tablegroup
        tgrp = this.getTgrpForTable(table_name);
		
        // if tablegroup found, add restriction
        if (valueExists(tgrp))
            tgrp.parsedRestrictionClauses.push(restClause);
    },

    /** 
     * Add parameter restrictions
     *
     * @param	relOp		String	Name of conjunction (AND, OR, etc)
     * @param	table_name	String	Name of table within view to which restriction applies
     * @param	field_name	String	Name of field
     * @param	op			String	Name of operator (=, !=, NULL, etc)
     * @param	value		String	Value of restriction
     * @return	None
     *
     */
    addParamRestrictionClause: function(relOp, table_name, field_name, op, value){
                  
        // create restriction object
        var restClause = new Ab.ViewDef.ParameterRestrictionClause(relOp, op, table_name, field_name, value);
        
        // find tablegroup
        tgrp = this.getTgrpForTable(this.lastMainTableAddedToView);
        
        // if tablegroup found, add restriction
        if (valueExists(tgrp)) 
            tgrp.parameterRestrictionClauses.push(restClause);
    },

    /** 
     * Add parameter restrictions
     *
     * @param	name		String	Name of parameter
     * @return	None
     *
     */
    addParameter: function(name, value, dataType){
                  
        // create restriction object
        var parameter = new Ab.ViewDef.Parameter(name, value, dataType);
        
        // find tablegroup
        tgrp = this.getTgrpForTable(this.lastMainTableAddedToView);
        
        // if tablegroup found, add restriction
        if (valueExists(tgrp)) 
            tgrp.parameters.push(parameter);
    },
		    
    /** 
     * Return a pointer to the table group object containing the given table in any role.
     *
     * @param	table_name			String	Name of table
     * @return	this.tableGroups[i]	Object	Tablegroup object
     *
     */
    getTgrpForTable: function(table_name){
        for (i = this.tableGroups.length - 1; i >= 0; i--) {
            for (j = 0; j < this.tableGroups[i].tables.length; j++) {
                if (this.tableGroups[i].tables[j].table_name == table_name) 
                    return this.tableGroups[i];
            }
        }
    },
    
    /**
     * Add the view title
     *
     * @param	title	String	View title
     * @return	None
     *
     */
    addTitle: function(title){
        if (this.title == '') {
            this.title = title;
        }
    },
    
    /**
     * List the view title as XML, if present.
     *
     * @param	None
     * @return	None
     *
     */
    listViewTitleAsXml: function(){
    
        if (valueExists(this.title)) 
            strDataSource += "<title translatable=\"true\">" + this.title + "</title>\n";
    },
    
    /**
     * Add chart property value
     *
     * @param	property	String 	Name of chart property
     * @param	value		String	Value for chart property
     * @return	None
     *
     */
    addChartProperty: function(property, value){
        if ((property == 'controlType') || (property == 'showLabel') || (property == 'width') || (property == 'height') || (property == 'showLegendOnLoad') || (property == 'showDataTips') || (property == 'backgroundColor') || (property == 'fillType') || (property == 'fillColor') || (property == 'percentGradientChange') || (property == 'percentTransparency') || (property == 'labelPosition')) {
            this.chartProperties[property] = value;
        }
        
        if (property == 'enableChartDrilldown') {
            this.enableChartDrilldown = value;
        }
    },

    addPaginatedReportProperty: function(property, value){
    		var paginatedProperties = (this.paginatedProperties) ? this.paginatedProperties : {};    		
    		paginatedProperties[property] = value;
    		this.paginatedProperties = paginatedProperties;
    },
    
    addPanelProperty: function(property, value){

    	if (!(this.panelProperties)) {
    		this.panelProperties = [];   		
    	}

    	var index = (this.tableGroups.length == 0) ? 0 : this.tableGroups.length-1 ;
    	var panelProperty = (this.panelProperties.length == 0) ? {} : this.panelProperties[this.tableGroups.length-1];
    	panelProperty[property] = value.toString();    	
    	this.panelProperties[index] = panelProperty;
    },
    
    addEditFormColumns: function(nthTableGroup, numberOfColumns){
    	var tgrp = this.tableGroups[nthTableGroup];
    	if (valueExists(tgrp)) 
    		tgrp['numberOfColumns'] = numberOfColumns;
    },
        
    /**
     * Return a string listing the contents of the view as an .axvw <dataSource /> tag.
     * Rather than have each object know how to render itself to xml,
     * just pound it out here: the affinity between tags is higher
     * than the affinity between the xml and the data contents of each
     * object.
     *
     * @param	nthTableGroup	Integer	Index of tablegroup	
     * @param	pattern			String	Name of pattern
     * @return	strDataSource	String	Datasource in XML
     * 
     */
    listTableGroupAsDataSourceXml: function(nthTableGroup, pattern){
    
        // string to hold datasource xml
        var strDataSource = "";
        
        // get the nth table group.
        var tgrp = this.tableGroups[nthTableGroup];
        if (!pattern.match(/summary|paginated/)) {
            strDataSource += '<dataSource id="' + convertToCamelCase(pattern) + '_ds_' + nthTableGroup + '"' + '>\n    ';
        }
		
        // list tables within the datasource.
        for (j = 0; j < tgrp.tables.length; j++) {
            strDataSource += "    <table name=" + dqte(tgrp.tables[j].table_name);
            strDataSource += " role=" + dqte(tgrp.tables[j].role);
            strDataSource += "/>\n    ";
        }

		var measuresArr = tgrp.measures;
		var hasMeasures = false;

        if ((measuresArr != undefined) && (measuresArr != '')){
			if (measuresArr.length > 0) {
				hasMeasures = true;
			}
        }
	
		var view = tabsFrame.newView;
		var hasViewMeasures = this.hasMeasures(view.tableGroups[nthTableGroup]);
		
		if ( (pattern == 'ab-viewdef-paginated-highlight-thematic' && nthTableGroup == 2) || (pattern.match(/highlight-restriction/gi)) && hasMeasures){
			strDataSource += this.getThematicFields(tgrp, nthTableGroup, hasMeasures);
		} else if (pattern.match(/paginated/gi)) {
								
				for (j = 0; j < tgrp.fields.length; j++) {
					var bIsSortField = false;
					var field = tgrp.fields[j];
					var field_name = field.field_name;
					var table_name = field.table_name;
					var bFoundStats = false; 
					
					// check if has restriction parameter
					var bHasRestrictionParameter = false;
					var restriction_parameter = String(field.restriction_parameter);
					if (valueExistsNotEmpty(restriction_parameter) && restriction_parameter != 'undefined') {
						bHasRestrictionParameter = true;
					}
									
					for (k = 0; k < tgrp.sortFields.length; k++) {
						if ((table_name == tgrp.sortFields[k].table_name) && (field_name == tgrp.sortFields[k].field_name)) {
								bIsSortField = true;
						}						
					}

					if (hasMeasures) {
						// if ((bIsSortField == false)  || (hasSummarizeBySortOrder == false)) {
						// don't print if not sortfield and is restriction parameter in sortsummary
						// || (hasMeasures && pattern.match(/highlight-restriction/gi) && bIsSortField == false ) 
						// if ((hasSummarizeBySortOrder(tgrp) == false) || ((hasSummarizeBySortOrder(tgrp) == true) && bHasRestrictionParameter && (bIsSortField == false)) ) {
						if ((hasSummarizeBySortOrder(tgrp) == true) && bHasRestrictionParameter && (bIsSortField == false) ) {
							strDataSource += "    <field table=" + dqte(table_name);
							strDataSource += " name=" + dqte(tgrp.fields[j].field_name);
							strDataSource += ' formula="max" baseField=' + dqte(table_name + '.' + field_name) + ' dataType="text">\n    ';
							strDataSource += '        <title translatable="true">' + tgrp.fields[j].ml_heading + ' ' + getMessage('max') + '</title>\n    ';
							strDataSource += '    </field>\n    ';
						} else if (hasSummarizeBySortOrder(tgrp) == false){						
							for (i = 0; i < measuresArr.length; i++) {
								var measuresTable = measuresArr[i].table_name;
								var measuresField = measuresArr[i].field_name;
								var statsStr = String(measuresArr[i].stats);								

								//if( (measuresField == field_name) && (measuresTable == table_name) && !statsStr.match(/count/gi)){	
								//if( (measuresField == field_name) && (measuresTable == table_name) && statsStr.match(/count|sum/gi)){	
								if( (measuresField == field_name) && (measuresTable == table_name)){
									bFoundStats = true;
									if( statsStr.match(/sum/gi)){																
									} else {
										strDataSource += "    <field table=" + dqte(tgrp.fields[j].table_name);
										strDataSource += " name=" + dqte(tgrp.fields[j].field_name);
										strDataSource += "/>\n    ";
									}
								}
							}	
							if(bFoundStats == false){
										strDataSource += "    <field table=" + dqte(tgrp.fields[j].table_name);
										strDataSource += " name=" + dqte(tgrp.fields[j].field_name);
										strDataSource += "/>\n    ";
							}																							
						}									
					} else {	
						if(tgrp.fields[j].is_virtual){
							strDataSource += '    <!--ViewDef-VirtualField-Begin-->\n    ';
							strDataSource += "    <field table=" + dqte(tgrp.fields[j].table_name);
							strDataSource += " name=" + dqte(tgrp.fields[j].field_name);
							strDataSource += " dataType=" + dqte(tgrp.fields[j].data_type);
							if(tgrp.fields[j].data_type == 'number'){
								strDataSource += " decimals=" + dqte('2');
							}			
							strDataSource += ">";				
							strDataSource += generateVFSQLdialects(eval('(' + tgrp.fields[j].sql + ')'));						
							strDataSource += '\n        </field>';
							strDataSource += '\n        <!--ViewDef-VirtualField-End-->\n    ';
															
						} else { 
							// else don't print max fields --- similar to summary reports
							strDataSource += "    <field table=" + dqte(tgrp.fields[j].table_name);
							strDataSource += " name=" + dqte(tgrp.fields[j].field_name);
							strDataSource += "/>\n    ";
						}						
					}					
				}								
			} else {
			
				// list fields within the datasource.
				for (j = 0; j < tgrp.fields.length; j++) {
					var bIsSort = false;
					// Don't "double-print"
					if (pattern.match(/summary/) && ((nthTableGroup + 1) == this.tableGroups.length)) {
						bIsSort = true;
						/*
						for (k = 0; k < tgrp.sortFields.length; k++) {
							if (tgrp.fields[j] != tgrp.sortFields[k]) {
								bIsSort = true;
							}
						}
						*/
					}
				
					if( pattern.match(/chart-2d/gi)){
						bIsSort = true;

						for (k = 0; k < tgrp.sortFields.length; k++) {						
							if((tgrp.fields[j].field_name == tgrp.sortFields[k].field_name) && (tgrp.fields[j].table_name == tgrp.sortFields[k].table_name)) {
								if((tgrp.sortFields[k].groupByDate == 'undefined')){
									bIsSort = false;
								} else if((tgrp.sortFields[k].groupByDate != 'undefined') && (hasViewMeasures == false)){
									strDataSource += '    <field table="' + tgrp.fields[j].table_name + '" name="' + tgrp.sortFields[k].groupByDate + '" baseField="' + tgrp.fields[j].table_name + '.' + tgrp.fields[j].field_name  + '" formula="' + tgrp.sortFields[k].groupByDate + '" dataType="text" groupBy="true"/>\n    ';
								}
							}
						}
					}
									
					if ((bIsSort == false)) {															
						if(tgrp.fields[j].is_virtual){
							strDataSource += '    <!--ViewDef-VirtualField-Begin-->\n    ';
							strDataSource += "    <field table=" + dqte(tgrp.fields[j].table_name);
							strDataSource += " name=" + dqte(tgrp.fields[j].field_name);
							strDataSource += " dataType=" + dqte(tgrp.fields[j].data_type);
							if(tgrp.fields[j].data_type == 'number'){
								strDataSource += " decimals=" + dqte('2');
							}
							strDataSource += ">";				
							// sql
							strDataSource += generateVFSQLdialects( tgrp.fields[j].sql );					
							strDataSource += '\n        </field>';
							strDataSource += '\n        <!--ViewDef-VirtualField-End-->\n    ';
						} else {
						
							strDataSource += "    <field table=" + dqte(tgrp.fields[j].table_name);
							strDataSource += " name=" + dqte(tgrp.fields[j].field_name);
						
							if(pattern.match(/chart-2d/gi)){
								strDataSource += " groupBy=" + dqte("true");
							}
							if(pattern.match(/editform|viewdef-report/) && measuresArr){
								if(hasShowTotalsForField(measuresArr, tgrp.fields[j].table_name, tgrp.fields[j].field_name)){
									strDataSource += " showTotals=" + dqte("true");
								}
							}
							/*
							if (tgrp.fields[j].showSelectValueAction.toString().match(/true|false/)){
								strDataSource += ' showSelectValueAction="' + tgrp.fields[j].showSelectValueAction + '"';
							}
							*/
							strDataSource += "/>\n    ";
						}
					} 
				}
			} 
			
			// for drawings, place sorts in datasource
			if (pattern.match(/paginated-highlight/gi) && (hasMeasures == false)) {
				for (var x = 0; x < tgrp.sortFields.length; x++) {
					var sortField = tgrp.sortFields[x];
					strDataSource += "    <sortField table=" + dqte(sortField.table_name);
					strDataSource += " name=" + dqte(sortField.field_name);
					strDataSource += " ascending=" + dqte(sortField.isAscending);
					strDataSource += "/>\n    ";
				}
			}      	


        if (pattern.match(/summary|paginated-parent/)) {
			for (k = 0; k < tgrp.parameters.length; k++) {
				var parameter = tgrp.parameters[k];
				var dataType = parameter.dataType;
				if (!dataType.match(/integer/i)) {
					dataType = 'verbatim';
				}
				strDataSource += '    <parameter name=' + dqte(parameter.name) + ' dataType=' + dqte(dataType) + ' value=""/>\n    ';
			}
		}
								       
		// write restrictons (parsed and parameter)
		var parsedRestrictions = tgrp.parsedRestrictionClauses;
		var paramRestrictions = tgrp.parameterRestrictionClauses;
		var sqlRestriction = tgrp.sqlRestriction;
		  
        // write the sql restriction.
		if (valueExists(sqlRestriction) && (dqte(sqlRestriction.table_name) != '"undefined"')) {
			var sqlRestClause = dqte(sqlRestriction.sql);
			
			// replace <> with !=
			sqlRestClause = sqlRestClause.replace(/\<\>/g, "!=");
			strDataSource += "    <restriction type=\"sql\" sql=" + sqlRestClause + ">\n    ";
			strDataSource += "        <field table=" + dqte(tgrp.sqlRestriction.table_name) + " />\n    ";
			strDataSource += "    </restriction>\n   ";
		}

		var restrictionsArr = new Array();		
		if (valueExists(parsedRestrictions) && (parsedRestrictions != '')) {
			restrictionsArr = parsedRestrictions;
		}
		
		if (pattern.match(/summary|paginated-parent/gi))  {
			if (valueExists(paramRestrictions) && (paramRestrictions != '')) {
				restrictionsArr = restrictionsArr.concat(paramRestrictions);
			}
		}
		
		// create syntax for parsed restriction
		strDataSource += '\n';
		strDataSource += createParsedRestrictionSyntax(restrictionsArr, 8);		
		strDataSource += '    ';		      
		strDataSource += "</dataSource>";
		
		return strDataSource;
    },


	getThematicFields: function(tgrp, nthTableGroup, hasMeasures){
		var str = '';
		
		for (j = 0; j < tgrp.fields.length; j++) {
		
			var field = tgrp.fields[j];
			var field_name = field.field_name;
			var table_name = field.table_name;
			var afm_type = field.afm_type;
			var bIsSortField = false;
			
			for (var k=0; k<tgrp.sortFields.length; k++){
				if ((table_name == tgrp.sortFields[k].table_name) && (field_name == tgrp.sortFields[k].field_name)) {
					bIsSortField = true;
				}	
			}

			if ( (bIsSortField == true) || (afm_type == 'HPattern Acad Ext') ){
				str += "    <field table=" + dqte(tgrp.fields[j].table_name);
				str += " name=" + dqte(tgrp.fields[j].field_name);
				str += " groupBy=" + dqte('true');
				str += " />\n    ";
			}
			else {

			
				str += "    <field table=" + dqte(table_name);
				str += " name=" + dqte(tgrp.fields[j].field_name);
				str+= ' formula="max" baseField=' + dqte(table_name + '.' + field_name) + ' dataType="text">\n    ';
				//str += '        <title translatable="true">' + tgrp.fields[j].ml_heading + ' ' + getMessage('max') + '</title>\n    ';
				str += '        <title translatable="true">' + tgrp.fields[j].ml_heading_heading + ' ' + getMessage('max') + '</title>\n    ';
				str += '    </field>\n    ';
				
			}				
		}		

		return str;
	},
	
	hasMeasures: function(tgrp){
		var hasMeasures = false;
		if((tgrp.hasOwnProperty('measures') && (tgrp.measures.length > 0))){
			hasMeasures= true;
		}
		return hasMeasures;
	},	

/**
 * Since showCounts is on the panel level, look in measures first.
 * If none found, use first field.
 *
 */	
	showCounts: function(index){

		var tgrp = this.tableGroups[index];
		if(valueExists(tgrp.fields)){
			var firstField = this.tableGroups[index].fields[0];
			var table_name = firstField.table_name;
			var field_name = firstField.field_name;

			if(valueExists(tgrp.measures) && Object.prototype.toString.call(tgrp.measures)  == '[object Array]' && ((tgrp.hasOwnProperty('measures').hasOwnProperty('0')) || valueExists(tgrp.measures[0]))   ){
					tgrp.measures[0].stats.push("count");
			} else {
					var measure = firstField;
					measure.stats = ['Count'];
					this.tableGroups[index].measures = [measure];
			}
		}
	},
	
	addURL: function(url){
		this.viewURL = url;
	}		
}); // end ViewDef View


/**
 * Run standard wf rule with table name, field name, and restriction to obtain value.
 * So far, only used to retrieve table titles.
 *
 * @param	table_name	String holding table name
 * @param	field_name	String holding field name
 * @param	restriction	JSON object holding restriction
 * @return 	return_valuevalue returnd
 *
 */
function getValue(table_name, field_name, restriction){
    var parameters = {
        tableName: table_name,
        fieldNames: toJSON([field_name]),
        restriction: restriction
    };
    
    var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
    if (result.code == 'executed') {
        var record = result.data.records[0];
        var return_value = record[field_name];
    }
    else {
        Ab.workflow.Workflow.handleError(result);
    }
    return return_value;
}

function createParsedRestrictionSyntax(restrictionsArr, numOfSpaces){
		var spaces = createSpacesSyntax(numOfSpaces);
		var restrictionStr = "";
		
		// if have restriction, print start <restriction> tag
		if (valueExists(restrictionsArr) && (restrictionsArr != '')) {
			restrictionStr += spaces + "<restriction type=\"parsed\">\n";

			// write parsed restriction clauses
			for (j = 0; j < restrictionsArr.length; j++) {
				var restClause = restrictionsArr[j];
				restrictionStr += spaces + "    ";
				restrictionStr += "<clause relop=" + dqte(restClause.relop);
				restrictionStr += " op=" + dqte(restClause.op);
				restrictionStr += " table=" + dqte(restClause.table_name);
				restrictionStr += " name=" + dqte(restClause.field_name);
				restrictionStr += " value=" + dqte(restClause.value) + " />\n";
			}				
			restrictionStr += spaces + "</restriction>\n";
		}
		return restrictionStr;
}

function createSpacesSyntax(numOfSpaces){
		var spaces = "";
		for(i=0; i<numOfSpaces; i++){
			spaces += " ";
		}
		return spaces;
}
