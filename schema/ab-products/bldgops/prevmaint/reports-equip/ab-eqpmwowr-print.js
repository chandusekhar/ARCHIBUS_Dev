/**
 * ab-eqpmwowr-print.js
 *
 * Custom class for EQ PM WO WR report
 * Append an HTML table to the parent element to hold the whole report
 * Each row (i.e., <tr>) is a sub table holding either a spacer or another table detailing a wo, wr, wrtr, wrtt, wrpt, or pmp record
 * Column report HTML is used for wo, wr & pmp records
 * Custom report is used for resource (i.e., wrtr, wrtt, wrpt)
 * Custom report is a combination of a grid and a column report configured by gridColumnNames & formColumnNames arrays
 *
 */

Ab.view.EqPmWoWrReport = Base.extend({
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
	workOrderHdrDataSrc: null,
    workRequestDataSrc: null,
    toolTypeDataSrc: null,
    toolAssignDataSrc: null,
    partDataSrc: null,
    tradeDataSrc: null,
    craftDataSrc: null,

	
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
	woReportFieldDefMods: null, 
	wrReportFieldDefMods: null, 

	// use work order count to create unique ids for divs to which wo report is attached
	workOrderCount: 0,

	// use work request count to create unique ids for divs to which wr report is attached
	workRequestCount: 0,
	

	constructor: function (parentElem) {
		this.initializeTargetTable(parentElem);
		this.initResourceReportConfigs();
		this.initWorkOrderReportFieldDefs();
		this.initWorkRequestReportFieldDefs();
		this.initDataSources()
    },

		
	/**
	 * fetch data and control the section - by - section addition to the report
	 */
	printReport: function() {
		var wrPmpId = null;
		if (!this.woIdList || this.woIdList.length == 0) {
			return;
		}

		// FETCH ALL DATA
		// fetch Work Order - Work Request - EQ - PMP records, later we'lliterate over them
		var woWrRecords = this.workRequestDataSrc.getRecords('wr.wo_id in ' + this.woIdList);
		
		// form a list of work request ids for use in 'SELECT * FROM wrtr where wr_id in (wr_id_1, wr_id_2, wr_id_3, ...)'
		var wrIdList = this.getIdListFromRecords('wr.wr_id', woWrRecords);
		
		// fetch resource records for all relevant work requests 
		if (woWrRecords) {
			this.fetchResourceRecords(wrIdList);
		}
		//
		// ALL DATA FETCHED

		// iterate over Work Order - Work Request - EQ - PMP records, adding wo section, pmp section, the wr section
		for (var i=0, woWrRecord; woWrRecord = woWrRecords[i]; i++) {
			var workOrderId = woWrRecord.getValue('wr.wo_id');

			// if new Work Order print WO column report
			if (!this.woId || this.woId != workOrderId) { 
				this.addWorkOrderSection(workOrderId, woWrRecord);
			}

			// wr's pmp as wo subtitle if not added yet or different from existing one for this wo
			wrPmpId = woWrRecord.getValue('wr.pmp_id');
			if (this.pmpId == null || this.pmpId != wrPmpId) {
				this.appendPmpRecord(wrPmpId);
				this.pmpId = wrPmpId;
			}

			// HRule before each work request
			this.appendChildRow(document.createElement('hr'));
			// Work Request restriction			
			this.wrId = woWrRecord.getValue('wr.wr_id');

			// Work Request report
			this.createColumnReport('workRequestReport', 'workRequestDataSrc', woWrRecord, 2, this.wrReportFieldDefMods);

			// space between work request and resources
			this.appendChildRow('&nbsp;');

			// Trades resource report
			this.appendResourceReport(this.wrId, this.tradeRsrcReportConfig, this.wrTradeRecords, 'wrtr', 'tradeReport');
			// Crafts resource report
			this.appendResourceReport(this.wrId, this.craftRsrcReportConfig, this.wrCraftRecords, 'wrcf', 'craftReport');
			// Parts resource report
			this.appendResourceReport(this.wrId, this.partRsrcReportConfig, this.wrPartRecords, 'wrpt', 'partReport');
			// Tool Types resource report
			this.appendResourceReport(this.wrId, this.toolTypeRsrcReportConfig, this.toolTypeRecords, 'wrtt', 'toolTypeReport');
			// Tool Assignments resource report
			this.appendResourceReport(this.wrId, this.toolAssignRsrcReportConfig, this.toolAssignRecords, 'wrtl', 'toolAssignReport');

			// space between work orders
			this.appendChildRow('&nbsp;');

			this.workOrderCount++;
			this.workRequestCount++;
		}

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
     * Initialize the static config objects used (and reused) by the resource reports
     */
    initResourceReportConfigs: function() {
		var config = new Ab.view.ConfigObject();
		config.viewDef = this.viewName;
		config.dataSourceId = 'tradeDataSrc';
		config.gridColumnNames = ['wrtr.tr_id','wrtr.date_assigned','wrtr.hours_est','wrtr.date_end','wrtr.hours_straight'];
		config.formColumnNames = ['wrtr.comments'];
		this.tradeRsrcReportConfig = config;

		config = new Ab.view.ConfigObject();
		config.viewDef = this.viewName;
		config.dataSourceId = 'craftDataSrc';
		config.gridColumnNames = ['wrcf.cf_id','wrcf.date_assigned','wrcf.hours_est','wrcf.date_end','wrcf.hours_straight'];
		config.formColumnNames = ['wrcf.comments'];
		this.craftRsrcReportConfig = config;

		config = new Ab.view.ConfigObject();
		config.viewDef = this.viewName;
		config.dataSourceId = 'partDataSrc';
		config.gridColumnNames = ['wrpt.part_id','wrpt.date_assigned','wrpt.qty_estimated','wrpt.status','wrpt.qty_actual'];
		config.formColumnNames = ['wrpt.comments'];
		this.partRsrcReportConfig = config;

		config = new Ab.view.ConfigObject();
		config.viewDef = this.viewName;
		config.dataSourceId = 'toolTypeDataSrc';
		config.gridColumnNames = ['wrtt.tool_type','wrtt.date_assigned','wrtt.hours_est','wrtt.date_end','wrtt.hours_straight'];
		config.formColumnNames = ['wrtt.comments'];
		this.toolTypeRsrcReportConfig = config;

		config = new Ab.view.ConfigObject();
		config.viewDef = this.viewName;
		config.dataSourceId = 'toolAssignDataSrc';
		config.gridColumnNames = ['wrtl.tool_id','wrtl.date_assigned','wrtl.hours_est','wrtl.date_end','wrtl.hours_straight'];
		config.formColumnNames = ['wrtl.comments'];
		this.toolAssignRsrcReportConfig = config;
	},


	/**
     * Initialize the modifications to the fieldDefs for the work request reports
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
    initWorkOrderReportFieldDefs: function() {
		this.woReportFieldDefMods = [];
		this.woReportFieldDefMods.push({field: "wr.wo_id", labelStyle: 'font-weight: bold; font-size: 16px; font-style: italic;', style: 'font-size: 16px;'});
	},


	/**
     * Assign the data sources from the View
     */
	initDataSources: function() {
		this.workOrderDataSrc = View.dataSources.get('workOrderDataSrc');
		this.workOrderHdrDataSrc = View.dataSources.get('workOrderHdrDataSrc');
		this.workRequestDataSrc = View.dataSources.get('workRequestDataSrc');
		this.tradeDataSrc = View.dataSources.get('tradeDataSrc');
		this.craftDataSrc = View.dataSources.get('craftDataSrc');
		this.toolTypeDataSrc = View.dataSources.get('toolTypeDataSrc');
		this.toolAssignDataSrc = View.dataSources.get('toolAssignDataSrc');
		this.partDataSrc = View.dataSources.get('partDataSrc');
	},

	/**
	 * generate an id list of a form useful for a restriction WHERE id IN (id_1, id_2, id_3...)
	 * iterate over a set of recors pulling out the id of the first arg
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
     * Append the given element into a new table row within the wrapping table
     */
	appendChildRow: function(element) {
		var reportTableRow = document.createElement('tr');
		this.reportTableBody.appendChild(reportTableRow);
		var reportTableCell = document.createElement('td');
		reportTableRow.appendChild(reportTableCell);

		if (typeof element == 'string') {
			reportTableCell.innerHTML = element;
		}
		else {
			reportTableCell.appendChild(element);
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
		this.createColumnReport('workOrderReport','workOrderHdrDataSrc', woRecord, 1, this.woReportFieldDefMods);

		this.appendChildRow(document.createElement('hr'));
		this.pmpId = null;
	},



	/**
	 * Create Column Report & append it to the given parentElem
	 * Create divs as an axvw panel would do for layout wrapper & control parent
	 * Use fields' order as defined in the dataSource
	 * fieldDefMods can be used to configure individual fields (e.g., colspan)
	 */
	createColumnReport: function(id, dataSrcId, record, columns, fieldDefMods) {
		var config = new Ab.view.ConfigObject();
		config.viewDef = this.viewName;
		config.dataSourceId = dataSrcId;
		config.showOnLoad = true;
		if (columns) {
			config.columns = columns;
		}

		// get fieldDefs from dataSource & transform from Ext.MixedCollection to Array
		var fieldDefCollection = this[dataSrcId].fieldDefs; //View.dataSources.get(config.dataSourceId).fieldDefs; 
		// configure individual fields if needed
		if (fieldDefMods) {
			for (var j=0, mod; mod = fieldDefMods[j]; j++) {
				var fld = fieldDefCollection.get(mod.field);
				//if (typeof fld == 'undefined' || fld == null) {
				//	alert('Unkown fiield ' + mod.field);
				//}
				for (param in mod) {
					if (param != 'field') {
						fld[param] = mod[param];
					}
				}
			}
		}
		// copy MixedCollection to Array
		config.fieldDefs = [];
		for (var i=0,fld; fld = fieldDefCollection.items[i]; i++) {
			config.fieldDefs.push(fld);
		}

		// divs' ids -  'workOrder_'i  or 'workRequest_'j
		if (id.substr(0,7) == 'workOrd') {
			id = id + '_' + this.workOrderCount;
		}
		else if (id.substr(0,7) == 'workReq') {
			id = id  + '_' + this.workRequestCount;			
		}
		
		this.createColumnReportHTML(id, this[dataSrcId], config.fieldDefs, columns, record);
	},
		

	/**
	 * create the HTML that an ab-column-report would have created
	 * skipping any refresh, afterRefresh or other Component methods
	 */
	createColumnReportHTML: function(parentElementId, dataSource, fieldDefs, columns, record) {
        // create new table with row for each field
        var tableId = parentElementId + '_table';
        var html = '<table id="' + tableId + '" class="columnReport">';
        
        var columnCounter = 0;
        for (var i = 0; i < fieldDefs.length; i++) {
            var fieldDef = fieldDefs[i];
            if (fieldDef.hidden == 'true') {
                continue;
            }
			
            var fieldValue = record.getValue(fieldDef.id);
            
            if (valueExistsNotEmpty(fieldValue)) {
                // format object values into localized strings
                if (dataSource) {
                    fieldValue = dataSource.formatValue(fieldDef.id, fieldValue, true);
                }
            } else {
                fieldValue = '&nbsp;';
            }
            
            var title = '';
            if (valueExistsNotEmpty(fieldDef.title)) {
                title = fieldDef.title;
                if (title.charAt(title.length - 1) != ':' && title.charAt(title.length - 1) != '?') {
                    title = fieldDef.title + ':';
                }  
            } 
            
            if (columnCounter == 0) {
                html = html + '<tr>';
            }
            
            var id = parentElementId + '_' + fieldDef.id;
			
			var isNumber = (fieldDef.type === 'java.lang.Double' || fieldDef.type === 'java.lang.Integer');
			var style = isNumber ? 'text-align:right;' : '';
            if (valueExistsNotEmpty(fieldDef.style)) {
				style += fieldDef.style;
				if (microsoftIEBrowser && fieldDef.style.indexOf('white-space: pre') != -1) {
					fieldValue = '<pre>' + fieldValue + '</pre>';
				}
			}
			var labelStyle = "";
            if (valueExistsNotEmpty(fieldDef.labelStyle)) {
				labelStyle += fieldDef.labelStyle;
			}

            var dataCellColSpan = fieldDef.colspan > 1 ? 5 + ((fieldDef.colspan - 2) * 4) : 1;
            html = html + '<td class="columnReportSpacer"> </td>'
                        + '<td class="columnReportLabel" style="' + labelStyle + '">' + title + '</td>' 
                        + '<td id="' + id + '" class="columnReportValue" style="' + style + '" colspan="' + dataCellColSpan + '">' + fieldValue + '</td>'
                        + '<td class="columnReportSpacer"> </td>';
            
            columnCounter = columnCounter + fieldDef.colspan;
            if (columnCounter == columns) {
                columnCounter = 0;
                html = html + '</tr>';
            }
        }
        html = html + '</table>';
		this.appendChildRow(html);
    },

	
	
	/**
	 *  Create a one-record column report for the PMP record 
	 *  without the overhead of a dataSource
	 */	
	appendPmpRecord: function(wrPmpId) {
		var id = 'pmp_' + this.workOrderCount + '_' + this.workRequestCount;

		var pmpTable = document.createElement('table');
		pmpTable.id = id + '_table';
		pmpTable.className = 'columnReport';

		// for IE table must have body, can't append tr to table
		var pmpTbody = document.createElement('tbody');
		pmpTable.appendChild(pmpTbody);

		var pmpTR = document.createElement('tr');
		pmpTbody.appendChild(pmpTR);

		var pmpTD = document.createElement('td');
		pmpTD.className = 'columnReportSpacer';
		pmpTR.appendChild(pmpTD);

		pmpTD = document.createElement('td');
		pmpTD.className = 'columnReportLabel';
		pmpTD.style.fontSize = '12px';
		pmpTD.style.fontWeight = 'bold';
		pmpTD.style.fontStyle = 'italic';
		pmpTD.innerHTML = Ab.view.View.getOpenerWindow().getMessage('recordsPMProc');	
		pmpTR.appendChild(pmpTD);

		pmpTD = document.createElement('td');
		pmpTD.className = 'columnReportValue';
		pmpTD.style.fontSize = '12px';
		pmpTD.style.fontWeight = 'bold';
		pmpTD.style.fontStyle = 'italic';
		pmpTD.innerHTML = wrPmpId;
		pmpTR.appendChild(pmpTD);

		var pmpTD = document.createElement('td');
		pmpTD.className = 'columnReportSpacer';
		pmpTR.appendChild(pmpTD);

		this.appendChildRow(pmpTable);
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
	 * Create a resource report and append it to the wrapping table
	 * Depending on args may be a trade, tool or part resource
	 * When no rsrcRecords match the parentRecordId, nothing is appended to the wrapping table
	 */
	appendResourceReport: function (parentRecordId, config, rsrcRecords, tableName, reportType) {
		config.parentRecordId = parentRecordId;
		config.records = this.getResourceRecordsForWrId(rsrcRecords, tableName, parentRecordId);
		var control = new Ab.grid.ResourceReport(this.createRsrcReportRow(reportType), config);
		// IE makes a panel whose initialDataFetch() gets called from View.doInitialDataFetch()
		if (!microsoftIEBrowser) {
			control.initialDataFetch();
		}
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
	}
		
	
	/**
	 *  Modify the style for the work order title
	 *
	 *
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
	}
	*/
});




    /**
	 * Function called by HTML page's body onload
	 * Uses the Ab.view.View to get the opener's controller from which the work order id list & dataSources are referenced
	 * the View
	 */
	function loadPrintView() {
		var openingView = View.getOpenerWindow().View;
		var controller = openingView.controllers.get('viewPMWorkOrder');


		var reportTargetPanel = document.getElementById("reportTargetPrintPanel");
		var bodyElem = reportTargetPanel.parentNode;
		if (!bodyElem) {
			var bodyElems = document.getElementsByTagName('body');
			if (bodyElems.length > 0) {
				bodyElem = bodyElems[0];
			}			
		}

		Ab.view.View.messages = {};
		Ab.view.View.init();
		// finish init of view for evalExpr functions
		Ab.view.View.user = 'printer';
		//change for KB3021763
		Ab.view.View.originalTitle = Ab.view.View.getOpenerWindow().getMessage('printViewTitle');
		Ab.view.View.dateFormat = 'MM/DD/YY';
		Ab.view.View.timeFormat = 'HH:mm:ss';

		// set View dataSources from opening view for use by other classes (e.g., resource report)
		Ab.view.View.dataSources.add('workOrderDataSrc', controller.workOrderDataSrc);
		Ab.view.View.dataSources.add('workOrderHdrDataSrc', controller.workOrderHdrDataSrc);
		Ab.view.View.dataSources.add('workRequestDataSrc', controller.workRequestDataSrc);
		Ab.view.View.dataSources.add('tradeDataSrc', controller.tradeDataSrc);
		Ab.view.View.dataSources.add('craftDataSrc', controller.craftDataSrc);
		Ab.view.View.dataSources.add('toolTypeDataSrc', controller.toolTypeDataSrc);
		Ab.view.View.dataSources.add('toolAssignDataSrc', controller.toolAssignDataSrc);
		Ab.view.View.dataSources.add('partDataSrc', controller.partDataSrc);

		// create a new control for this HTML page
		var reportControl = new Ab.view.EqPmWoWrReport(bodyElem);

		// specific work orders to include in report
		reportControl.woIdList = controller.woIdList;

		reportControl.printReport();
	}

