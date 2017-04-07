/**
 * @author Guo Jiangtao
 */

View.createController('abCompEventCalendarYearViewTab', {

	currentUserParameter : " 1=1 ",
	
	monthArray : null,
	
	colorByField: 'activity_log.status',

	afterInitialDataFetch : function() {

		//for view 'Viwe My Event Calendar'
		if (View.getOpenerView().viewName.toLowerCase().indexOf('my') != -1) {
		    //  Only show events where Responsible Person for event,
			//  event,s location, event,s requirement, or event,s program 
			//  is the logged in user.
			//KB3036311 - change the restriction for current user according to the spec
			this.currentUserParameter = "((activity_log.manager=${sql.literal(user.employee.id)})  " +
			" OR (exists (select 1 from regloc " +
			"     where activity_log.location_id = regloc.location_id " +
			"     and regloc.resp_person = ${sql.literal(user.employee.id)})) " +
			" OR (exists (select 1 from regrequirement " +
			"     where activity_log.reg_requirement = regrequirement.reg_requirement and activity_log.reg_program = regrequirement.reg_program and activity_log.regulation = regrequirement.regulation " +
			"     and regrequirement.em_id = ${sql.literal(user.employee.id)} )) " +
			" OR (exists (select 1 from regprogram " +
			"     where activity_log.reg_program = regprogram.reg_program and activity_log.regulation = regprogram.regulation " +
			"     and regprogram.em_id = ${sql.literal(user.employee.id)} ))) ";
			this.abCompEventCalendarYearViewTabDS.addParameter('currentUserParameter', this.currentUserParameter);
		}
		
		// register controller to the console view
		View.getOpenerView().controllers.get('abCompEventCalendarConsole').controllers.push(this);
		
		var tabs = View.getControlsByType(parent, 'tabs')[0];
		this.monthArray = tabs.monthArray;
		
		setInstruction(this.panelHtml, 'activity_log.status');
		this.createDropDown();
		
		//change default value of  recordLimit to -1 to load all events
		this.abCompEventCalendarYearViewTabDS.addParameter('recordLimit',-1);
		
		this.createTable();
		
		this.refreshFromConsole();
	},
	
	createDropDown: function() {
		// incude border highlight option to the drawing panel
		var panelTitleNode = document.getElementById('panelHtml_title').parentNode.parentNode;
		
		var cell = Ext.DomHelper.append(panelTitleNode, {
			tag : 'td',
			id : 'colorByTitle'
		});

		var tn = Ext.DomHelper.append(cell, '<p>' + getMessage('colorByTitle')+":" + '</p>', true);
		Ext.DomHelper.applyStyles(tn, "x-btn-text");

		cell = Ext.DomHelper.append(panelTitleNode, {
			tag : 'td',
			id : 'colorByOptions_td'
		});

		var options = Ext.DomHelper.append(cell, {
			tag : 'select',
			id : 'colorByOptions'
		}, true);
		
		options.dom.options[0] = new Option(getMessage('eventStatus'), 'activity_log.status');
		options.dom.options[1] = new Option(getMessage('requirmentPriority'), 'regrequirement.priority');
		options.dom.options[2] = new Option(getMessage('requirementType'), 'regrequirement.regreq_type');
        
        options.on('change', this.selectColorBy, this, {
			delay : 100,
			single : false
		});
		
		
		var cell = Ext.DomHelper.append(panelTitleNode, {
			tag : 'td',
			id : 'yearOptionsTitle'
		});

		var tn = Ext.DomHelper.append(cell, '<p>' + getMessage('selectYear') + '</p>', true);
		Ext.DomHelper.applyStyles(tn, "x-btn-text");

		cell = Ext.DomHelper.append(panelTitleNode, {
			tag : 'td',
			id : 'yearOptions_td'
		});

		var options = Ext.DomHelper.append(cell, {
			tag : 'select',
			id : 'yearOptions'
		}, true);
		
		var recs = View.dataSources.get("dsYears").getRecords();
        var yearSelect = $('yearOptions');
        populateYearSelectLists(recs, yearSelect);
        
        options.on('change', this.selectYear, this, {
			delay : 100,
			single : false
		});
	},
	
	/**
	 * select color by option.
	 */
	selectColorBy : function(e, option) {
		this.colorByField = option.value;
		setInstruction(this.panelHtml,this.colorByField);
		this.refreshTable($('yearOptions').value);
	},

	
	/**
	 * select year option.
	 */
	selectYear : function(e, option) {
		this.refreshTable(option.value);
	},

	createTable : function() {
		var rows = [];
		var columns = [new Ab.grid.Column('1', '1', 'link'), new Ab.grid.Column('2', '2', 'link'), new Ab.grid.Column('3', '3', 'link')];
		for ( var r = 0; r < 4; r++) {
			var row = {};
			for ( var c = 1; c < 4; c++) {
				var cellContent = this.monthArray[r * 3 + c - 1] + ":";
				row['' + c] = cellContent;
			}
			rows.push(row)
		}

		var configObj = new Ab.view.ConfigObject();
		configObj['rows'] = rows; // row data values
		configObj['columns'] = columns;

		// create new Grid component instance
		var grid = new Ab.grid.ReportGrid('calendarByYear_div', configObj);
		grid.sortEnabled = false;
		grid.build();
		Ext.get('headerRow_0').remove();
	},

	refreshTable : function(year) {
		this.abCompEventCalendarYearViewTabDS.addParameter('year', year);
		var records = this.abCompEventCalendarYearViewTabDS.getRecords();
		var cells = Ext.DomQuery.select('td', $('grid_calendarByYear_div_divBody'));
		for ( var i = 0; i < cells.length; i++) {
			var cellContent = this.monthArray[i] + ": <br>";
			for ( var n = 0; n < records.length; n++) {
				var event = records[n];
				if (event.getValue('activity_log.startMonthNumber') <= (i + 1) && event.getValue('activity_log.endMonthNumber') >= (i + 1)) {
					var color = this.getColorForRecord(event);
					cellContent = cellContent + '<br><a style="background-color:#'+color+'" href="javascript: //" id="' + event.getValue('activity_log.activity_log_id') + '">' + event.getValue('activity_log.action_title') + "</a>"
				}
			}

			Ext.get(cells[i]).update(cellContent);

			var links = Ext.DomQuery.select('a', Ext.get(cells[i]).dom);
			for ( var m = 0; m < links.length; m++) {
				Ext.get(links[m]).addListener('click', function() {
					onclickEvent(this.id);
				});
			}
			if (links.length == 0) {
				Ext.get(cells[i]).update(this.monthArray[i] + ": <br> <br>" + getMessage('noEvent'));
			}
		}
	},
	
	getColorForRecord : function(record) {
		var color = 0xFFFFFF;
		if (this.colorByField == 'activity_log.status') {
			color = getColorByStatus(record);
		} else if (this.colorByField == 'regrequirement.priority') {
			color = getColorByPriority(record);
		} else if (this.colorByField == 'regrequirement.regreq_type') {
			color = getColorByRequiementType(record);
		}
		
		var nBlue = parseInt(color/(256*256));
		var nGreen = parseInt((color - nBlue*256*256)/256);
		var nRed = color - nBlue*256*256 - nGreen*256;

		return this.toHex(nBlue)+this.toHex(nGreen)+this.toHex(nRed);
	},
	
	toHex: function(N) {
 		if (N==null) return "00";
 		N=parseInt(N); if (N==0 || isNaN(N)) return "00";
 		N=Math.max(0,N); N=Math.min(N,255); N=Math.round(N);
 		return "0123456789ABCDEF".charAt((N-N%16)/16) + "0123456789ABCDEF".charAt(N%16);
	},
	
	refreshFromConsole: function(){
		var consoleRestriction = View.getOpenerView().controllers.get('abCompEventCalendarConsole').consoleRestriction;
		if(valueExists(consoleRestriction)){
			//get dataSource
			var ds = this.abCompEventCalendarYearViewTabDS;
			
			//add dataSource parameter from console filter
			ds.addParameter('consoleRestriction', consoleRestriction);
			ds.addParameter('currentUserParameter', this.currentUserParameter);
		}
		
		//refresh the table
		this.refreshTable($('yearOptions').value);
	},
	
	/**
	* Event handler for action 'DOC'.
	*/
	panelHtml_onExportDOCX: function() {
		//get parameter from console panel
		var parameters = View.getOpenerView().controllers.get('abCompEventCalendarConsole').parameters;
		
		//if no console parameter, create new parameter 
		if(!parameters){
			parameters = {};
		}
		
		//add current user parameter
		parameters.currentUserParameter = this.currentUserParameter;
		
		//add other parameter
		var year = $('yearOptions').value;
		parameters.otherRes =
			"((${sql.yearOf('activity_log.date_scheduled')} = "+year+" or ${sql.yearOf('activity_log.date_scheduled_end')} =  "+year+")"+
	        "or (${sql.yearOf('activity_log.date_scheduled')} < "+year+" and ${sql.yearOf('activity_log.date_scheduled_end')} > "+year+"))";
		
		//open paginated report
		View.openPaginatedReportDialog("ab-comp-event-pgrt.axvw" ,null, parameters);
	}
});

function onclickEvent(id) {
	var openerView = View.getOpenerView();
	openerView.mode = 'edit'
	openerView.activityLogId = id;
	openerView.callBackController = View.controllers.get('abCompEventCalendarYearViewTab');

	var popUp = 'ab-comp-event-all-edit.axvw';
	var popUpTitle = getMessage('editEvent');
	if (openerView.viewName.toLowerCase().indexOf('rpt') != -1) {
		popUpTitle = getMessage('viewEvent');
		openerView.mode = 'report';
		popUp = 'ab-comp-event-column-rpt.axvw';	
		
		//set restriction for the popup
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.activity_log_id', id);
		openerView.openDialog(popUp,restriction, false, {width: 900,height: 430});	
	}else{
		openerView.popUpTitle = popUpTitle;
		openerView.openDialog(popUp, null, false, {width: 1140,height: 600});
	}
}
