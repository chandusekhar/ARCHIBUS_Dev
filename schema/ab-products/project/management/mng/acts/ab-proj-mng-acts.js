var projMngActsController = View.createController('projMngActs', {
	project_id: '',
	menuOptions: new Array('option1','option2','option3','option4','option5'),
	moreShown: false,
	showCopyBaseline: true,
	
	afterInitialDataFetch: function(){
        var titleObjOptions = Ext.get('projMngActsFilter_optionsMenu');
        titleObjOptions.on('click', this.showOptionsMenu, this, null);
        this.projMngActsFilter.showField('activity_log.date_scheduled', false);
    	this.projMngActsFilter.showField('activity_log.date_scheduled_end', false);
    	this.projMngActsFilter.showField('activity_log.date_started', false);
		this.projMngActsFilter.showField('activity_log.date_completed', false);
    	Ext.get('num_days').dom.parentNode.parentNode.style.display = 'none';
    },
    
    showOptionsMenu: function(e, item){
    	var menuArr = this.menuOptions;
		var handler = this.onOptionsButtonPush;
		var menuItems = [];
		for(var i = 0; i < menuArr.length; i++){
			if (this.moreShown && i==0) continue;
			else if (!this.moreShown && i==1) continue;
			if (!this.showCopyBaseline && i==2) continue;
			var menuItem = null;
			menuItem = new Ext.menu.Item({
				text: getMessage('menu_' + menuArr[i]),
				handler: handler.createDelegate(this, [menuArr[i]])});

			menuItems.push(menuItem);
		}
		var menu = new Ext.menu.Menu({items: menuItems});
		menu.showAt(e.getXY());
    },
	
	onOptionsButtonPush: function(menuItemId){
		switch(menuItemId) {
		case 'option1':
			this.projMngActsFilter_onShowMore();
			break;
		case 'option2':
			this.projMngActsFilter_onShowLess();
			break;
		case 'option3':
			this.projMngActsFilter_onCopyBaseline();
			break;	
		case 'option4':
			onExportMsProject();
			break;	
		case 'option5':
			View.openDialog('ab-proj-mng-acts-msproj-imp.axvw');
			break;
		}
	},
    
    projMngActsFilter_afterRefresh: function() {
    	var openerController = View.getOpenerView().controllers.get('projMng');
    	this.project_id = openerController.project_id;
    	var title = this.project_id;
		if (openerController.project_name != '') title += ' - ' + openerController.project_name;
    	this.projMngActsFilter.appendTitle(title);
    	this.projMngActsFilter_onClear();
    },
    
    projMngActsGrid_afterRefresh: function() {
    	var existsZero = false;
    	this.projMngActsGrid.gridRows.each(function (row) {
    	   var record = row.getRecord();
    	   var action = row.actions.get('requests');
 		   var num_requests = record.getValue('activity_log.num_requests');
 		   if (num_requests < 1) {
 			   action.show(false);
 		   }
 		   else action.show(true)
 		   
 		   var statusTick = row.actions.get('status_tick');
		   var pct_complete = record.getValue('activity_log.pct_complete');
		   var status = record.getValue('activity_log.status');
		   if (pct_complete >= 100 || status == 'COMPLETED' || status == 'COMPLETED-V' || status == 'CLOSED') {		  
			   statusTick.show(true);
		   }
		   else statusTick.show(false);
		   
 		   if (!existsZero) {
 			   var design_costs = record.getValue('activity_log.tot_costs_design');
 			   var base_costs = record.getValue('activity_log.tot_costs_base');
 			   if (design_costs == 0 && base_costs > 0) existsZero = true;
 		   }		   
 		});
    	if (!existsZero) this.showCopyBaseline = false;
    	else this.showCopyBaseline = true;
    },
    
    projMngActsFilter_onClear: function() {
    	this.projMngActsFilter.setFieldValue('activity_log.work_pkg_id', '');
    	this.projMngActsFilter.setFieldValue('activity_log.activity_type', '');
    	this.projMngActsFilter.setFieldValue('activity_log.date_scheduled', '');
    	this.projMngActsFilter.setFieldValue('activity_log.date_scheduled_end', '');
    	this.projMngActsFilter.setFieldValue('activity_log.date_started', '');
    	this.projMngActsFilter.setFieldValue('activity_log.date_completed', '');
    	this.projMngActsFilter.showField('activity_log.date_scheduled', false);
    	this.projMngActsFilter.showField('activity_log.date_scheduled_end', false);
    	this.projMngActsFilter.showField('activity_log.date_started', false);
		this.projMngActsFilter.showField('activity_log.date_completed', false);
    	Ext.get('num_days').dom.parentNode.parentNode.style.display = 'none';
    	$('num_days').value = 0;
    	$('projMngActsFilter_show').value = 'all';
    	$('hideRejectedCancelled').checked = true;
    	
    	/* get filter restriction from alerts selection */
    	var openerController = View.getOpenerView().controllers.get('projMng');
    	var alertsFilter = openerController.alertsFilter;
    	if (alertsFilter) {
    		$('projMngActsFilter_show').value = alertsFilter;
    		openerController.alertsFilter = '';
    	}
    	
    	this.projMngActsFilter_onFilter();
    },
    
    projMngActsFilter_onFilter: function() {
    	var work_pkg_id = this.projMngActsFilter.getFieldValue('activity_log.work_pkg_id');
    	var activity_type = this.projMngActsFilter.getFieldValue('activity_log.activity_type');
    	var restriction = getTimeRestriction();
    	restriction += " AND activity_log.project_id = '" + getValidRestVal(this.project_id) + "'";
    	if (work_pkg_id) restriction += " AND activity_log.work_pkg_id = '" + getValidRestVal(work_pkg_id) + "'";
    	if (activity_type) restriction += " AND activity_log.activity_type = '" + getValidRestVal(activity_type) + "'";
    	if ($('hideRejectedCancelled').checked) restriction += " AND activity_log.status NOT IN ('REJECTED','CANCELLED') ";
    	
    	this.projMngActsGrid.refresh(restriction);    	
    },
	
	projMngActsFilter_onUpdateActions : function() {
		var records = this.projMngActsGrid.getSelectedRecords();
		if (records.length < 1) {
			View.showMessage(getMessage('noRecords'));
			return;
		}
		var updateParameters = {};
		updateParameters.records = records;
        
        View.openDialog('ab-proj-mng-acts-up.axvw', null, true, {
            width: 800,
            height: 600,
            closeButton: true,
            updateParameters: updateParameters,
            callback: function() {
            	View.controllers.get('projMngActs').projMngActsGrid.refresh();
            }
        });
	},
	
	projMngActsFilter_onCopyBaseline : function() {
		var records = this.projMngActsGrid.getSelectedRecords();
		if (records.length < 1) {
			View.showMessage(getMessage('noRecords'));
			return;
		}
		var controller = this;
		View.confirm(getMessage('copyCostsFromBaseline'), function(button){
            if (button == 'yes') {
            	controller.copyCostsFromBaseline(records);
            }
            else {
                
            }
        });
	},
	
	copyCostsFromBaseline: function(records) {
		View.openProgressBar(getMessage('msg_progress'));
		var numRecords = records.length;
		for (var i = 0; i < numRecords; i++) {
			View.updateProgressBar(i/numRecords);
			var restriction = new Ab.view.Restriction();
			restriction.addClause('activity_log.activity_log_id', records[i].getValue('activity_log.activity_log_id'));
			var record = this.projMngActsDs2.getRecord(restriction);
			if (record.getValue('activity_log.cost_est_design_exp') <= 0 && record.getValue('activity_log.cost_est_design_cap') <= 0) {
				var cost_estimated = record.getValue('activity_log.cost_estimated');
				var cost_est_cap = record.getValue('activity_log.cost_est_cap');
				record.setValue('activity_log.cost_est_design_exp', cost_estimated);
				record.setValue('activity_log.cost_est_design_cap', cost_est_cap);
				this.projMngActsDs2.saveRecord(record);
			}
		}
		this.projMngActsGrid.refresh();
		View.closeProgressBar();
	},
	
	projMngActsFilter_onAddNew: function() {
		var openerController = View.getOpenerView().controllers.get('projMng');
		var projectRestriction = new Ab.view.Restriction();
		projectRestriction.addClause('project.project_id', openerController.project_id);
		View.openDialog('ab-proj-mng-acts-add.axvw', projectRestriction, true, {
			closeButton: true,
			createWorkRequest: function(dialog, record) {
				View.controllers.get('projMngActs').onCreateWorkRequest(dialog, record);
			},
			callback: function() {
				View.controllers.get('projMngActs').projMngActsFilter_onClear();
		    }
		});
	},

	projMngActsFilter_onShowMore: function() {
		this.projMngActsGrid.showColumn('activity_log.date_planned_for', true);
		this.projMngActsGrid.showColumn('activity_log.date_started', true);
		this.projMngActsGrid.showColumn('activity_log.duration_est_baseline', true);
		this.projMngActsGrid.showColumn('activity_log.duration', true);
		this.projMngActsGrid.showColumn('activity_log.duration_act', true);
		this.projMngActsGrid.showColumn('activity_log.tot_costs_base', true);
		this.projMngActsGrid.showColumn('activity_log.tot_costs_act', true);
	    this.projMngActsGrid.showColumn('activity_log.site_id', true);
	    this.projMngActsGrid.showColumn('activity_log.bl_id', true);
	    this.projMngActsGrid.showColumn('activity_log.fl_id', true);
	    this.projMngActsGrid.showColumn('activity_log.rm_id', true);
	    this.projMngActsGrid.showColumn('activity_log.location', true);
	    this.projMngActsGrid.showColumn('activity_log.prob_type', true);
	    this.projMngActsGrid.showColumn('activity_log.description', true);
	    this.projMngActsGrid.update();
		this.moreShown = true;
    },
    
    projMngActsFilter_onShowLess: function() {
    	this.projMngActsGrid.showColumn('activity_log.date_planned_for', false);
    	this.projMngActsGrid.showColumn('activity_log.date_started', false);
    	this.projMngActsGrid.showColumn('activity_log.duration_est_baseline', false);
    	this.projMngActsGrid.showColumn('activity_log.duration', false);
    	this.projMngActsGrid.showColumn('activity_log.duration_act', false);
    	this.projMngActsGrid.showColumn('activity_log.tot_costs_base', false);
		this.projMngActsGrid.showColumn('activity_log.tot_costs_act', false);
    	this.projMngActsGrid.showColumn('activity_log.site_id', false);
	    this.projMngActsGrid.showColumn('activity_log.bl_id', false);
	    this.projMngActsGrid.showColumn('activity_log.fl_id', false);
	    this.projMngActsGrid.showColumn('activity_log.rm_id', false);
	    this.projMngActsGrid.showColumn('activity_log.location', false);
	    this.projMngActsGrid.showColumn('activity_log.prob_type', false);
	    this.projMngActsGrid.showColumn('activity_log.description', false);
	    this.projMngActsGrid.update();
		this.moreShown = false;
    },
    
    onCreateWorkRequest: function(dialog, record) {
    	dialog.closeThisDialog();
    	var restriction = new Ab.view.Restriction({
    		'activity_log.site_id': record.getValue('activity_log.site_id'),
    		'activity_log.bl_id': record.getValue('activity_log.bl_id'),
    		'activity_log.fl_id': record.getValue('activity_log.fl_id'),
    		'activity_log.rm_id': record.getValue('activity_log.rm_id'),
    		'activity_log.location': record.getValue('activity_log.location'),
    		'activity_log.eq_id': record.getValue('activity_log.eq_id'),
    		'activity_log.requestor': record.getValue('activity_log.requestor'),
    		'activity_log.phone_requestor': record.getValue('activity_log.phone_requestor'),
    		'activity_log.description': record.getValue('activity_log.description'),
    		'activity_log.copied_from': record.getValue('activity_log.activity_log_id'),
    		'activity_log.date_scheduled': record.getValue('activity_log.date_scheduled'),
    		'activity_log.activity_type': 'SERVICE DESK - MAINTENANCE'
    	});
    	View.closeDialog = function(){
            if (this.dialog != null) {
        		this.dialog.close();
    			if(this.dialogConfig.callback){
    				this.dialogConfig.callback();
    			}
    			this.dialog = null;
            }
    	}	
    	View.openDialog('ab-ondemand-request-create.axvw', restriction, true, { 
    		callback: function() {
    			View.panels.get('projMngActsGrid').refresh();
    		}
    	});	
    }
});

function openSrForAction(commandContext){
	var activity_log_id = commandContext.restriction["activity_log.activity_log_id"];	
	var restriction = new Ab.view.Restriction();
	restriction.addClause('activity_log.activity_type', 'SERVICE DESK - MAINTENANCE');
	restriction.addClause('activity_log.copied_from', activity_log_id);
	View.openDialog('ab-proj-mng-acts-sr.axvw', restriction);
}

function openAction(commandContext) {
	var activity_log_id = commandContext.restriction['activity_log.activity_log_id'];
	var restriction = new Ab.view.Restriction();
	restriction.addClause('activity_log.activity_log_id', activity_log_id);
	var record = View.dataSources.get('projMngActsDs0').getRecord(restriction);
	if ((record.getValue('activity_log.status') == 'REQUESTED' || record.getValue('activity_log.status') == 'REJECTED') && record.getValue('activity_log.activity_type') == 'PROJECT - CHANGE ORDER') {
		View.openDialog('ab-proj-mng-chg-edit.axvw', restriction, false, {
		    closeButton: true,
		    callback: function() {
		    	View.panels.get('projMngActsGrid').refresh();
		    } 
		});
	}
	else {
		View.openDialog('ab-proj-mng-act-edit.axvw', restriction, false, {
		    closeButton: true,
		    createWorkRequest: function(dialog, record) {
				View.controllers.get('projMngActs').onCreateWorkRequest(dialog, record);
			},
		    callback: function() {
		    	View.panels.get('projMngActsGrid').refresh();
		    } 
		});
	}
}

function onExportMsProject() {
	var openerController = View.getOpenerView().controllers.get('projMng');
	var project_id = openerController.project_id;
	var restriction = new Ab.view.Restriction();
	restriction.addClause('project.project_id', project_id);
	View.openDialog('ab-proj-mng-acts-msproj-exp.axvw', restriction, false, {
			closeButton: false,
			maximize: false,
			minimize: false,
			width : 500,
			height : 150});
}

function timeframeListener()
{
	var projMngActsFilter = View.panels.get('projMngActsFilter');
	var value = $('projMngActsFilter_show').value;
	if (value == 'schedRange') {
		projMngActsFilter.showField('activity_log.date_scheduled', true);
		projMngActsFilter.showField('activity_log.date_scheduled_end', true);
		projMngActsFilter.showField('activity_log.date_started', false);
		projMngActsFilter.showField('activity_log.date_completed', false);
		Ext.get('num_days').dom.parentNode.parentNode.style.display = '';
	} else if (value == 'complRange') {
		projMngActsFilter.showField('activity_log.date_scheduled', false);
		projMngActsFilter.showField('activity_log.date_scheduled_end', false);
		projMngActsFilter.showField('activity_log.date_started', true);
		projMngActsFilter.showField('activity_log.date_completed', true);
		Ext.get('num_days').dom.parentNode.parentNode.style.display = 'none';
	} else {
		projMngActsFilter.showField('activity_log.date_scheduled', false);
		projMngActsFilter.showField('activity_log.date_scheduled_end', false);
		projMngActsFilter.showField('activity_log.date_started', false);
		projMngActsFilter.showField('activity_log.date_completed', false);
		Ext.get('num_days').dom.parentNode.parentNode.style.display = 'none';
	}
}

function getTimeRestriction() {
	var controller = View.controllers.get('projMngActs');
	var date_scheduled = controller.projMngActsFilter.getFieldValue('activity_log.date_scheduled');
	var date_scheduled_end = controller.projMngActsFilter.getFieldValue('activity_log.date_scheduled_end');
	var date_started = controller.projMngActsFilter.getFieldValue('activity_log.date_started');
	var date_completed = controller.projMngActsFilter.getFieldValue('activity_log.date_completed');
	
	var status = "('CLOSED', 'IN PROGRESS', 'COMPLETED', 'COMPLETED-V')";
	var value = $('projMngActsFilter_show').value;
	var auxDate = new Date();
	var project_id = View.controllers.get('projMngActs').project_id;
	var timeRestriction = ' 1=1 ';
	
	switch (value) {
	case 'all':
		break;
	case 'assignedAct':
		timeRestriction += " AND activity_log.status NOT IN ('STOPPED', 'CLOSED', 'COMPLETED', 'COMPLETED-V')";
        timeRestriction += " AND activity_log.pct_complete < 100";
        timeRestriction += " AND activity_log.assigned_to = '" + View.user.employee.id + "'";
		break;
	case 'schedToday':
		onCalcEndDatesForProject(project_id);
		timeRestriction += " AND activity_log.status NOT IN ('STOPPED', 'CLOSED', 'COMPLETED', 'COMPLETED-V')";
		timeRestriction += getSchedRangeRestriction(dateAddDays(new Date(), 0), dateAddDays(new Date(), 0));
		break;
	case 'schedRange':		
		onCalcEndDatesForProject(project_id);
		timeRestriction += " AND activity_log.status NOT IN ('STOPPED', 'CLOSED', 'COMPLETED', 'COMPLETED-V')";
		timeRestriction += getSchedRangeRestriction(date_scheduled, date_scheduled_end);
		break;
	case 'complLstWk':
		var lastWeekMonday = new Date(lastMonday(auxDate));
		timeRestriction += " AND date_completed >= ${sql.date('"+lastWeekMonday.getFullYear()+ "-"+(lastWeekMonday.getMonth()+1)+"-"+lastWeekMonday.getDate()+"')}";
		var next7 = new Date(addTime(lastWeekMonday,7));
		timeRestriction += " AND date_completed < ${sql.date('"+next7.getFullYear()+ "-"+(next7.getMonth()+1)+"-"+next7.getDate()+"')}";
		break;
	case 'complThsWk':
		var thisWeekMonday = new Date(thisMonday());
		timeRestriction += " AND date_completed >= ${sql.date('"+thisWeekMonday.getFullYear()+ "-"+(thisWeekMonday.getMonth()+1)+"-"+thisWeekMonday.getDate()+"')}";
		var next7 = new Date(addTime(thisWeekMonday,7));
		timeRestriction += " AND date_completed < ${sql.date('"+next7.getFullYear()+ "-"+(next7.getMonth()+1)+"-"+next7.getDate()+"')}";
		break;
	case 'complRange':
		timeRestriction += " AND date_completed >= ${sql.date('"+date_started+"')}";
		timeRestriction += " AND date_completed <= ${sql.date('"+date_completed+"')}";	
		break;
	case 'behSched':
		timeRestriction += " AND status NOT IN "+ status +"  AND date_scheduled < ${sql.currentDate}";
		break;
	case 'onHold':
		timeRestriction += " AND status = 'IN PROCESS-H'";
		break;
	}
	return timeRestriction;
}

function getSchedRangeRestriction(from_date, to_date)
{
	var restriction = '';
	if (from_date != "" && to_date != "")
		restriction = restriction + " AND (" +
		"(activity_log.date_scheduled&gt;='"+from_date+"' AND activity_log.date_scheduled_end&lt;='"+to_date+"') OR " +
		"(activity_log.date_scheduled&lt;='"+from_date+"' AND activity_log.date_scheduled_end&gt;='"+from_date+"') OR " +
		"(activity_log.date_scheduled&lt;='"+to_date+"' AND activity_log.date_scheduled_end&gt;='"+to_date+"') OR " +
		"(activity_log.date_scheduled&lt;='"+from_date+"' AND activity_log.date_scheduled_end&gt;='"+to_date+"'))";	
	else if (from_date != "" && to_date == "")
		restriction = restriction + " AND (activity_log.date_scheduled&gt;='"+from_date+"' OR " +
		"activity_log.date_scheduled_end&gt;='"+from_date+"')";		
	else if (from_date == "" && to_date != "")
		restriction = restriction + " AND (activity_log.date_scheduled&lt;='"+to_date+"' OR " +
		"activity_log.date_scheduled_end&lt;='"+to_date+"')";
	return restriction;
}

//to make date additions
function addTime(date, daystoadd)
{
var d, s, t;
var MinMilli = 1000 * 60;
var HrMilli = MinMilli * 60;
var DyMilli = HrMilli * 24;
t = Date.parse(date);
s = Math.round(Math.abs(daystoadd * DyMilli)+Math.abs(t));
d = new Date(s);
return(d);
}

function lastMonday(date)
{
var d, s, t;
var MinMilli = 1000 * 60;
var HrMilli = MinMilli * 60;
var DyMilli = HrMilli * 24;
t = Date.parse(date);
s = Math.round(Math.abs(t)-Math.abs((date.getDay()+6) * DyMilli));
d = new Date(s);
return(d);
}

function thisMonday()
{
var d, s, t, today;
var MinMilli = 1000 * 60;
var HrMilli = MinMilli * 60;
var DyMilli = HrMilli * 24;
today = new Date();
t = Date.parse(today);
s = Math.round(Math.abs(t)-Math.abs((today.getDay()-1) * DyMilli));
d = new Date(s);
return(d);
}

function projMngActsFilter_typeSelval() {
	var controller = View.controllers.get('projMngActs');
	View.selectValue('projMngActsFilter',
			getMessage('activityType'),
			['activity_log.activity_type'],
			'activitytype',
			['activitytype.activity_type'],
			['activitytype.activity_type','activitytype.description'],
			"EXISTS (SELECT 1 FROM activity_log WHERE activity_log.activity_type = activitytype.activity_type AND activity_log.project_id = '"+controller.project_id+"')"
	);
}

function setFromToDates()
{
	var num_days = $('num_days').value;
	var curdate = new Date();
	
	var from_date = dateAddDays(curdate, 0);
  	var to_date = dateAddDays(curdate, num_days==0?0:num_days-1);
	View.panels.get('projMngActsFilter').setFieldValue('activity_log.date_scheduled', from_date);
	View.panels.get('projMngActsFilter').setFieldValue('activity_log.date_scheduled_end', to_date);
}

function dateAddDays(date_start, nxtdays) 
{
	  date_new = new Date(date_start.getTime() + nxtdays*(24*60*60*1000));
	  var month = date_new.getMonth()+1;
	  if (month<10) month = "0" + month;
	  var day = date_new.getDate();
	  if (day<10) day = "0" + day;
	  return date_new.getFullYear() + '-' + month + '-' + day;
}
