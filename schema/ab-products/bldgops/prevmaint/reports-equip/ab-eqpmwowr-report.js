/**
 * ab-eqpmwowr-report.js
 *
 * Custom class for EQ PM WO WR report
 * Append an HTML table to the parent element to hold the whole report
 * Each row (i.e., <tr>) is a sub table holding either a spacer or another table detailing a wo, wr, wrtr, wrtt, wrpt, or pmp record
 * Column report HTML is used for wo, wr & pmp records
 * Custom report is used for resource (i.e., wrtr, wrtt, wrpt)
 * Custom report is a combination of a grid and a column report configured by gridColumnNames & formColumnNames arrays
 *
 */
Ab.view.EqPmWoWrReport = Ab.view.Component.extend({
	// name of the view containing the data sources for resource reports
	viewName: 'ab-eqpmwowr',
	
	// id of the currrent work order to determine when shifting to another wo - wr record wo is diffferent & thus print wo report
	woId: null,
	
	// id of the currrent work request to fetch resource records (e.g., wrtt, wrtr, wrpt records)
	wrId: null,

	// id of the currrent pmp to determine when shifting to another wr record whether pmp is different & therefore print pmp report
	pmpId: null,

	// list of work order ids to be included in the report, set externally as a 'restriction'
	woIdList: null,

    // data sources for this page. For html page these can be set from calling page's controller
    workOrderDataSrc: null,
    workRequestDataSrc: null,
    toolTypeDataSrc: null,
    toolAssignDataSrc: null,
    partDataSrc: null,
    tradeDataSrc: null,
    craftDataSrc: null,

	// configuration objects for the columnreport sections
	woReportConfig: null,
	pmpReportConfig: null,
	wrReportConfig: null,

	
	// part resource report configuration & records holder
	partRsrcReportConfig: null,
	wrPartRecords: null,
		
	// craftsman resource report configuration & records holder
	craftRsrcReportConfig: null,
	wrCraftRecords: null,

	// trade resource report configuration & records holder
	tradeRsrcReportConfig: null,
	wrTradeRecords: null,

	// tool type resource report configuration object & records holder
	toolTypeRsrcReportConfig: null,
	toolTypeRecords: null,

	// tool assignment resource report configuration object & records holder
	toolAssignRsrcReportConfig: null,
	toolAssignRecords: null,


	// HTML table containing the whole report, each column report, each resource report, each <hr>, ...
	reportTargetTable: null,
	reportTableBody: null,

	// array of field def modification parameters such as colspan, css style, etc.
	wrReportFieldDefMods: null, 

	// use work order count to create unique ids for divs to which wo report is attached
	workOrderCount: 0,

	// use work request count to create unique ids for divs to which wr report is attached
	workRequestCount: 0,
	
	/**
	 * Constructor calls base constructor 
	 * and then initializes ocntrol including its data sources
	 */
	constructor: function (parentElementId, configObject) {
        // call the base Component constructor to set the base properties
        // and register the control in the view, so that other view parts can find it
        this.inherit(parentElementId, 'eqpmwowrReport', configObject);

		var path = View.originalRequestURL;
		this.viewName = path.substring(path.lastIndexOf('/') + 1);

		this.initializeTargetTable($(parentElementId));
		this.initDataSources();
		this.initWorkRequestReportFieldDefs();
		this.initConfigs();
    },


	/**
	 *  View's API call if showOnload='true'
	 */
	initialDataFetch: function() {
        if (this.showOnLoad) {
			this.printReport();
		}
	},

	/**
	 * Remove any previous report from the table body element
	 */
	clear: function() {
		if (this.reportTableBody) {
			while (this.reportTableBody.lastChild) {
				this.reportTableBody.removeChild(this.reportTableBody.lastChild);
			}
		}		
	},

	/**
	 *  View's API call, for example from showPanel command
	 */
    refresh: function(restriction) {
		if (!restriction) {
			this.woIdList = '';
		}
		else {
			this.woIdList = this.getIdListFromRows('wo.wo_id', restriction);
		}
		// clear any previous report & counts
		this.clear();
		this.woId = null;
		this.pmpId = null;
		this.workOrderCount = 0;
		this.workRequestCount = 0;

		this.printReport();
	},

	
	/**
	 * fetch data and control the section - by - section addition to the report
	 *
	 *
	 */
	printReport: function() {
		// if list of work order IDs is not set, get it from the dataSource
		if (!this.woIdList || this.woIdList.length == 0) {
			var woRecords = this.workOrderDataSrc.getRecords(View.restriction);
			if (!woRecords) {
				return;
			}
			this.woIdList = this.getIdListFromRecords('wo.wo_id', woRecords);
		}

		// fetch all data
		//
		// fetch Work Order - Work Request - EQ - PMP records, later we'll iterate over them
		var woWrRecords = this.workRequestDataSrc.getRecords('wr.wo_id in ' + this.woIdList);
		
		// form a list of work request ids for use in 'SELECT * FROM wrtr where wr_id in (wr_id_1, wr_id_2, wr_id_3, ...)'
		var wrIdList = this.getIdListFromRecords('wr.wr_id', woWrRecords);
		
		// fetch resource records for all relevant work requests 
		if (woWrRecords) {
			this.fetchResourceRecords(wrIdList);
		}
		//
		// all data fetched

		// iterate over Work Order - Work Request - EQ - PMP records, adding wo section, pmp section, the wr section
		var wrPmpId = null;
		for (var i=0, woWrRecord; woWrRecord = woWrRecords[i]; i++) {
			var workOrderId = woWrRecord.getValue('wo.wo_id');

			// if new Work Order print WO column report
			if (!this.woId || this.woId != workOrderId) {
				this.addWorkOrderSection(workOrderId, woWrRecord);
			}

			// wr's pmp as wo subtitle if not added yet or different from existing one for this wo
			wrPmpId = woWrRecord.getValue('pmp.pmp_id');
			if (this.pmpId == null || this.pmpId != wrPmpId) {
				// 				this.appendPmpRecord(wrPmpId);
				this.createColumnReport('pmProjectReport', woWrRecord);
				this.pmpId = wrPmpId;
			}

			// HRule before each work request
			this.appendChildRow(document.createElement('hr'));
			// Work Request restriction			
			this.wrId = woWrRecord.getValue('wr.wr_id');

			// Work Request report
			this.createColumnReport('workRequestReport', woWrRecord);

			// space between work request and resources, or between work requests if no resources
			this.appendChildRow('&nbsp;');
			var rsrcCnt = 0;

			// Trades resource report
			rsrcCnt += this.appendResourceReport(this.wrId, this.tradeRsrcReportConfig, this.wrTradeRecords, 'wrtr', 'tradeReport');
			// Crafts resource report
			rsrcCnt += this.appendResourceReport(this.wrId, this.craftRsrcReportConfig, this.wrCraftRecords, 'wrcf', 'craftReport');
			// Parts resource report
			rsrcCnt += this.appendResourceReport(this.wrId, this.partRsrcReportConfig, this.wrPartRecords, 'wrpt', 'partReport');
			// Tool Types resource report
			rsrcCnt += this.appendResourceReport(this.wrId, this.toolTypeRsrcReportConfig, this.toolTypeRecords, 'wrtt', 'toolTypeReport');
			// Tool Assignments resource report
			rsrcCnt += this.appendResourceReport(this.wrId, this.toolAssignRsrcReportConfig, this.toolAssignRecords, 'wrtl', 'toolAssignReport');

			// space between work orders
			if (rsrcCnt) {
				this.appendChildRow('&nbsp;');
			}

			this.workOrderCount++;
			this.workRequestCount++;
		}
		this.adjustWorkOrderStyle();
		this.adjustPMPStyle();

		// release?
		this.wrTradeRecords = null;
		this.wrPartRecords = null;
		this.wrToolRecords = null;
		woWrRecords = null;
	},


	/**
	 * Create the DOM table element that contains every report section
	 * insert/append it as first child of body element
	 */
	initializeTargetTable: function(parentElem) {
		this.reportTargetTable = document.createElement('table');
		// for IE table must have body, can't append tr to table
		this.reportTableBody = document.createElement('tbody');
		this.reportTargetTable.appendChild(this.reportTableBody);

		if (parentElem.firstChild != null) {
			parentElem.insertBefore(this.reportTargetTable, parentElem.firstChild);
		}
		else {
			parentElem.appendChild(this.reportTargetTable);
		}
	},


    /**
     * Initialize the static config objects used (and reused) by the wo, wr pmp, and resource reports
	 *
     */
    initConfigs: function() {
		// Work Order column report config
		this.woReportConfig  = new Ab.view.ConfigObject();
		this.woReportConfig.type = "columnReport";
		this.woReportConfig.viewDef = this.viewName;
		this.woReportConfig.dataSourceId = 'workRequestDataSrc';
		this.woReportConfig.showOnLoad = true;
		var fieldDefCollection = this[this.woReportConfig.dataSourceId].fieldDefs; 
		// copy MixedCollection to Array
		this.woReportConfig.fieldDefs = [];
		var fld = this.cloneFieldDef(fieldDefCollection.get('wr.wo_id'));
		this.woReportConfig.fieldDefs.push(fld);

		// PM Project column report config
		this.pmpReportConfig  = new Ab.view.ConfigObject();
		this.pmpReportConfig.type = "columnReport";
		this.pmpReportConfig.viewDef = this.viewName;
		this.pmpReportConfig.dataSourceId = 'workRequestDataSrc';
		this.pmpReportConfig.showOnLoad = true;
		fieldDefCollection = this[this.pmpReportConfig.dataSourceId].fieldDefs; 
		// copy MixedCollection to Array
		this.pmpReportConfig.fieldDefs = [];
		var fld = this.cloneFieldDef(fieldDefCollection.get('wr.pmp_id'));
		fld.title = 'Records for ' + fld.title;
		this.pmpReportConfig.fieldDefs.push(fld);

		// Work Request column report config with field modifications
		this.wrReportConfig  = new Ab.view.ConfigObject();
		this.wrReportConfig.type = "columnReport";
		this.wrReportConfig.viewDef = this.viewName;
		this.wrReportConfig.dataSourceId = 'workRequestDataSrc';
		this.wrReportConfig.showOnLoad = true;
		this.wrReportConfig.columns = 2;
		fieldDefCollection = this[this.wrReportConfig.dataSourceId].fieldDefs; 
		// configure individual fields if needed
		for (var j=0, mod; mod = this.wrReportFieldDefMods[j]; j++) {
			var fld = fieldDefCollection.get(mod.field);
			for (param in mod) {
				if (param != 'field') {
					fld[param] = mod[param];
				}
			}
		}
		// copy MixedCollection to Array
		this.wrReportConfig.fieldDefs = [];
		for (var i=0,fld; fld = fieldDefCollection.items[i]; i++) {
			this.wrReportConfig.fieldDefs.push(fld);
		}

		// Trade Resource resource report config
		this.tradeRsrcReportConfig = new Ab.view.ConfigObject();
		this.tradeRsrcReportConfig.type = "resourceReport";
		this.tradeRsrcReportConfig.viewDef = this.viewName;
		this.tradeRsrcReportConfig.dataSourceId = 'tradeDataSrc';
		this.tradeRsrcReportConfig.gridColumnNames = ['wrtr.tr_id','wrtr.date_assigned','wrtr.hours_est','wrtr.date_end','wrtr.hours_straight'];
		this.tradeRsrcReportConfig.formColumnNames = ['wrtr.comments'];

		// Craftsmen Resource resource report config
		this.craftRsrcReportConfig = new Ab.view.ConfigObject();
		this.craftRsrcReportConfig.type = "resourceReport";
		this.craftRsrcReportConfig.viewDef = this.viewName;
		this.craftRsrcReportConfig.dataSourceId = 'craftDataSrc';
		this.craftRsrcReportConfig.gridColumnNames = ['wrcf.cf_id','wrcf.date_assigned','wrcf.hours_est','wrcf.date_end','wrcf.hours_straight'];
		this.craftRsrcReportConfig.formColumnNames = ['wrcf.comments'];

		// Part assignment resource report config
		this.partRsrcReportConfig = new Ab.view.ConfigObject();
		this.partRsrcReportConfig.type = "resourceReport";
		this.partRsrcReportConfig.viewDef = this.viewName;
		this.partRsrcReportConfig.dataSourceId = 'partDataSrc';
		this.partRsrcReportConfig.gridColumnNames = ['wrpt.part_id','wrpt.date_assigned','wrpt.qty_estimated','wrpt.status','wrpt.qty_actual'];
		this.partRsrcReportConfig.formColumnNames = ['wrpt.comments'];

		// Tool Type resource report config
		this.toolTypeRsrcReportConfig = new Ab.view.ConfigObject();
		this.toolTypeRsrcReportConfig.type = "resourceReport";
		this.toolTypeRsrcReportConfig.viewDef = this.viewName;
		this.toolTypeRsrcReportConfig.dataSourceId = 'toolTypeDataSrc';
		this.toolTypeRsrcReportConfig.gridColumnNames = ['wrtt.tool_type','wrtt.date_assigned','wrtt.hours_est','wrtt.date_end','wrtt.hours_straight'];
		this.toolTypeRsrcReportConfig.formColumnNames = ['wrtt.comments'];

		// Tool Assignment resource report config
		this.toolAssignRsrcReportConfig = new Ab.view.ConfigObject();
		this.toolAssignRsrcReportConfig.type = "resourceReport";
		this.toolAssignRsrcReportConfig.viewDef = this.viewName;
		this.toolAssignRsrcReportConfig.dataSourceId = 'toolAssignDataSrc';
		this.toolAssignRsrcReportConfig.gridColumnNames = ['wrtl.tool_id','wrtl.date_assigned','wrtl.hours_est','wrtl.date_end','wrtl.hours_straight'];
		this.toolAssignRsrcReportConfig.formColumnNames = ['wrtl.comments'];
	},


	/**
     * Initialize the field modifications for the work request reports
	 *
     */
    initWorkRequestReportFieldDefs: function() {
		this.wrReportFieldDefMods = [];
		this.wrReportFieldDefMods.push({field: "wr.status", colspan: 2});
		this.wrReportFieldDefMods.push({field: "wr.description", colspan: 2});
		this.wrReportFieldDefMods.push({field: "wr.description", style: 'white-space: pre;'});
		this.wrReportFieldDefMods.push({field: "wr.cf_notes", colspan: 2});
		this.wrReportFieldDefMods.push({field: "wr.wo_id", hidden: "true"});
		this.wrReportFieldDefMods.push({field: "wr.pmp_id", hidden: "true"});
	},

	/**
     * Assign the data sources from the View
     */
	initDataSources: function() {
		this.workOrderDataSrc = View.dataSources.get('workOrderDataSrc');
		this.workRequestDataSrc = View.dataSources.get('workRequestDataSrc');
		this.tradeDataSrc = View.dataSources.get('tradeDataSrc');
		this.craftDataSrc = View.dataSources.get('craftDataSrc');
		this.toolTypeDataSrc = View.dataSources.get('toolTypeDataSrc');
		this.toolAssignDataSrc = View.dataSources.get('toolAssignDataSrc');
		this.partDataSrc = View.dataSources.get('partDataSrc');
	},


	/**
	 *  Fetch the records for each of the resource groups restricted by the wr list
	 *
	 */
	fetchResourceRecords: function(wrIdList) {
		this.wrTradeRecords = this.tradeDataSrc.getRecords('wrtr.wr_id in ' + wrIdList);
		this.wrCraftRecords = this.craftDataSrc.getRecords('wrcf.wr_id in ' + wrIdList);
		this.wrPartRecords = this.partDataSrc.getRecords('wrpt.wr_id in ' + wrIdList);
		this.toolTypeRecords = this.toolTypeDataSrc.getRecords('wrtt.wr_id in ' + wrIdList);
		this.toolAssignRecords = this.toolAssignDataSrc.getRecords('wrtl.wr_id in ' + wrIdList);
	},

	/**
	 * generate an id list of a form useful for a restriction WHERE id IN (id_1, id_2, id_3...)
	 * iterate over a set of records pulling out the id of the first arg
	 */
	getIdListFromRecords: function(columnFullName, records) {
		var idList = '';
		var id = null;
		for (var i=0, record; record = records[i]; i++) {
			id = record.getValue(columnFullName);
			idList += id + "," ;
		}
	
		if (records.length > 0) {
			idList = '(' + idList.substr(0, idList.length - 1) + ')';
		}
		return idList;
	},


	/**
	 * generate an id list of a form useful for a restriction WHERE id IN (id_1, id_2, id_3...)
	 * iterate over a set of records pulling out the id of the first arg
	 */
	getIdListFromRows: function(columnFullName, rows) {
		var idList = '';
		var id = null;
		for (var i=0, row; row = rows[i]; i++) {
			id = row[columnFullName];
			idList += id + "," ;
		}
	
		if (rows.length > 0) {
			idList = '(' + idList.substr(0, idList.length - 1) + ')';
		}
		return idList;
	},


	/**
	 * select out of the given records only those records with the given foreign key
	 */
	getResourceRecordsForWrId: function(records, tbl, wrId) {
		var resourceRecords = [];
		var found = false;
		for (var i=0, record; record = records[i]; i++) {
			if (wrId == record.getValue(tbl + '.wr_id')) {
				resourceRecords.push(record);
				found = true;
			}
			else if (found) {
				break;
			}
		}
		return resourceRecords;
	},
		

	/**
     * Append the given element into a new table row within the wrapping table
     */
	appendChildRow: function(element) {
		reportTableRow = document.createElement('tr');
		this.reportTableBody.appendChild(reportTableRow);
		reportTableCell = document.createElement('td');
		reportTableRow.appendChild(reportTableCell);

		if (typeof element == 'string') {
			reportTableCell.innerHTML = element;
		}
		else {
			reportTableCell.appendChild(element);
		}
	},


	/**
	 * Create Column Report & append it to the given parentElem
	 * Create divs as an axvw panel would do for layout wrapper & control parent
	 * Use fields' order as defined in the dataSource
	 * fieldDefMods can be used to configure individual fields (e.g., colspan)
	 */
	createColumnReport: function(id, record) {
		// divs' ids -  'workOrder_'i  or 'workRequest_'j
		var config;
		if (id.substr(0,7) == 'workOrd') {
			id = id + '_' + this.workOrderCount + '_table';
			config = this.woReportConfig;
		}
		else if (id.substr(0,7) == 'workReq') {
			id = id  + '_' + this.workRequestCount + '_table';
			config = this.wrReportConfig;
		}
		else if (id.substr(0,6) == 'pmProj') {
			id = id  + '_' + this.workOrderCount + '_table';
			config = this.pmpReportConfig;
		}

		var reportTableRow = document.createElement('tr');
		this.reportTableBody.appendChild(reportTableRow);
		var reportTableCell = document.createElement('td');
		reportTableCell.id = id;
		reportTableRow.appendChild(reportTableCell);

		var control = new Ab.form.ColumnReport(id, config);
		if (record && record != null) {
            control.setRecord(record);   
			control.show(control.showOnLoad);
		}
	},
		

	
	/**
     * Add a work order section to the report
     */
	 addWorkOrderSection: function(woId, woRecord) {
		 // Work Order restriction
		this.woId = woId;

		// Horizontal Rule before all work orders
		var workOrderHRule = document.createElement('hr');
		// page break before all work orders except the first
		if (this.workOrderCount > 0) {
			workOrderHRule.style.pageBreakBefore = 'always';
		}
		this.appendChildRow(workOrderHRule);
		
		// Work Order report
		this.createColumnReport('workOrderReport', woRecord);

		this.appendChildRow(document.createElement('hr'));
		this.pmpId = null;
	},



	/**
     * Append a new table row within the wrapping table
	 * give it an id for the proper resource report type but no content
	 * result is used as the parent element for a resource report
	 */
	createRsrcReportRow: function(reportType) {
		var rsrcReportTableRow = document.createElement('tr');
		this.reportTableBody.appendChild(rsrcReportTableRow);
		var rsrcReportTableCell = document.createElement('td');
		rsrcReportTableRow.appendChild(rsrcReportTableCell);
		rsrcReportTableCell.id = reportType + '_' + this.workRequestCount;
		return rsrcReportTableCell.id;
	},
		
	
	/**
	 * Create a resource report and append it to the wrapping table
	 * Depending on args may be a trade, tool or part resource
	 * When no rsrcRecords match the parentRecordId, nothing is appended to the wrapping table
	 * Return a count of records in resourceReport
	 */
	appendResourceReport: function (parentRecordId, config, rsrcRecords, tableName, reportType) {
		config.parentRecordId = parentRecordId;
		/*
		config.records = this.getResourceRecordsForWrId(rsrcRecords, tableName, parentRecordId);
		if (config.records.length > 0) {
			var control = new Ab.grid.ResourceReport(this.createRsrcReportRow(reportType), config);
			// IE makes a panel whose initialDataFetch() gets called from View.doInitialDataFetch()
			if (!microsoftIEBrowser) {
				control.initialDataFetch();
			}
		}
		return config.records.length;
		*/
		var records = this.getResourceRecordsForWrId(rsrcRecords, tableName, parentRecordId);
		if (records.length > 0) {
			var control = new Ab.grid.ResourceReport(this.createRsrcReportRow(reportType), config);
			control.addRecords(records);
			// IE makes a panel whose initialDataFetch() gets called from View.doInitialDataFetch()
			if (!microsoftIEBrowser) {
				control.initialDataFetch();
			}
		}
		return records.length;
	},


	/**
     * return a copy of the fieldDef, so that multiple uses don't override each other
     */
	cloneFieldDef: function(srcFldDef) {
		var fieldDef = new Object();
		fieldDef.afmType = srcFldDef.afmType;
		fieldDef.colspan = srcFldDef.colspan;
		fieldDef.commands = srcFldDef.commands;
		fieldDef.decimals = srcFldDef.decimals;
		fieldDef.enabled = srcFldDef.enabled;
		fieldDef.enumValues = srcFldDef.enumValues;
		fieldDef.foreignKey = srcFldDef.foreignKey;
		fieldDef.format = srcFldDef.format;
		fieldDef.fullName = srcFldDef.fullName;
		fieldDef.groupBy = srcFldDef.groupBy;
		fieldDef.hidden = srcFldDef.hidden;
		fieldDef.id = srcFldDef.id;
		fieldDef.isDate = srcFldDef.isDate;
		fieldDef.isDocument = srcFldDef.isDocument;
		fieldDef.isEnum = srcFldDef.isEnum;
		fieldDef.isTime = srcFldDef.isTime;
		fieldDef.op = srcFldDef.op;
		fieldDef.primaryKey = srcFldDef.primaryKey;
		fieldDef.readOnly = srcFldDef.readOnly;
		fieldDef.required = srcFldDef.required;
		fieldDef.rowspan = srcFldDef.rowspan
		fieldDef.size = srcFldDef.size;
		fieldDef.title = srcFldDef.title;
		fieldDef.value = srcFldDef.value;		
		fieldDef.width = srcFldDef.width;
		return fieldDef;			
	},


	/**
	 *  Modify the style for the work order title
	 *
	 */
	adjustWorkOrderStyle: function() {
		// adjust style of work order title
		for (var i=0; i < this.workOrderCount; i++) {
			var workOrderTableElem = $('workOrderReport_' + i + '_table');
			var cells = workOrderTableElem.getElementsByTagName('td'); 
			for (var j=0, cell; cell = cells[j]; j++) { 
				if (cell.className == 'columnReportLabel' ) {
					cell.style.fontSize = '16px';
					cell.style.fontWeight = 'bold';
					cell.style.fontStyle = 'italic';
				}
				else if (cell.className == 'columnReportValue' ) {
					cell.style.fontSize = '16px';
				}
			}
		}
	},

	adjustPMPStyle: function() {
		for (var i=0; i < this.workOrderCount; i++) {
			var pmpTableElem = $('pmProjectReport_' + i + '_table');
			var cells = pmpTableElem.getElementsByTagName('td'); 
			for (var j=0, cell; cell = cells[j]; j++) { 
				cell.style.fontSize = '12px';
				cell.style.fontWeight = 'bold';
				cell.style.fontStyle = 'italic';
			}
		}
	}

});



