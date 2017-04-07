/**
 * @author Guo Jiangtao
 */


View.createController('abCompEventCalendarCalendarTab', {
	
	currentUserParameter : " 1=1 ",

	calendarControl : null,

	afterViewLoad : function() {
		// register controller to the console view
		View.getOpenerView().controllers.get('abCompEventCalendarConsole').controllers.push(this);

		this.calendarControl = new Ab.flash.Calendar('calendar', // parent
		// panel
		// ID
		"abCompEventCalendarCalendarTabDS", // dataSourceId
		"activity_log.activity_log_id", // primary key field
		"activity_log.action_title", // summary field
		"activity_log.date_scheduled", // startTime field
		"activity_log.date_scheduled_end", // endTime field
		true, // whether to show weekend events
		"&colorField=activity_log.status"
		);
        this.panelHtml.setContentPanel(Ext.get('calendar'));

		var tabs = View.getControlsByType(parent, 'tabs')[0];
		tabs.monthArray = getLocalizedMonthArray_JS();
		
		this.createDropDown();
		
		this.calendarControl.show(true);
		setInstruction(this.calendarControl,'activity_log.status');
		
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
			this.abCompEventCalendarCalendarTabDS.addParameter('currentUserParameter', this.currentUserParameter);
		}
		
		//change default value of  recordLimit to -1 to load all events
		this.abCompEventCalendarCalendarTabDS.addParameter('recordLimit',-1);
		
		this.calendarControl.refreshData();
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
	},
	
	/**
	 * select color by option.
	 */
	selectColorBy : function(e, option) {
		this.calendarControl = new Ab.flash.Calendar('calendar', // parent
			// panel
			// ID
			"abCompEventCalendarCalendarTabDS", // dataSourceId
			"activity_log.activity_log_id", // primary key field
			"activity_log.action_title", // summary field
			"activity_log.date_scheduled", // startTime field
			"activity_log.date_scheduled_end", // endTime field
			true, // whether to show weekend events
			"&colorField="+option.value
			);
        this.panelHtml.setContentPanel(Ext.get('calendar'));

		setInstruction(this.calendarControl,this.calendarControl.colorField);
		this.calendarControl.refreshData();
	},

	refreshFromConsole : function() {
		var consoleRestriction = View.getOpenerView().controllers.get('abCompEventCalendarConsole').consoleRestriction;
		if(valueExists(consoleRestriction)){
			//get calendar dataSource
			var ds = this.abCompEventCalendarCalendarTabDS;
			
			//add dataSource parameter from console filter
			ds.addParameter('consoleRestriction', consoleRestriction);
			ds.addParameter('currentUserParameter', this.currentUserParameter);
		}
		
		//refresh the calendar control data
		this.calendarControl.refreshData();
	}
});

// this is called by the SWF control if an event is clicked
function calendarItemClick_JS(primaryKey) {
	var openerView = View.getOpenerView();
	openerView.mode = 'edit'
	openerView.activityLogId = primaryKey;
	openerView.callBackController = View.controllers.get('abCompEventCalendarCalendarTab');

	var popUp = 'ab-comp-event-all-edit.axvw';
	var popUpTitle = getMessage('editEvent');
	if (openerView.viewName.toLowerCase().indexOf('rpt') != -1) {
		popUpTitle = getMessage('viewEvent');
		openerView.mode = 'report';
		popUp = 'ab-comp-event-column-rpt.axvw';
		
		//set restriction for the popup
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.activity_log_id', primaryKey);
		openerView.openDialog(popUp,restriction, false, {width: 900,height: 430});	
	}else{
		openerView.popUpTitle = popUpTitle;
		openerView.openDialog(popUp, null, false, {width: 1140,height: 600});
	}
}
