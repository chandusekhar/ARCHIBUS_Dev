var projActionsScheduledPerformedController = View.createController('projActionsScheduledPerformed', {
	project_id : '',
	
	projActionsScheduledPerformedConsole_afterRefresh : function() {
		var controller = View.getOpenerView().controllers.get('projManageConsole');
		this.project_id = controller.project_id;
		this.projActionsScheduledPerformedConsole.enableField('activity_log.date_scheduled', false);
		this.projActionsScheduledPerformedConsole.enableField('activity_log.date_completed', false);
	},
	
	projActionsScheduledPerformedConsole_onShow : function() {
		var date_scheduled_since = this.projActionsScheduledPerformedConsole.getFieldValue('activity_log.date_scheduled');
		var date_scheduled_until = this.projActionsScheduledPerformedConsole.getFieldValue('activity_log.date_completed');
		
		var strSQLRestriction = "";
		var strDateRangeStatement = "";
		var status ="('CLOSED', 'IN PROGRESS', 'COMPLETED', 'COMPLETED-V')";
		var restrictions = $('restrictions').value;
		var auxDate = new Date();
		var timeRestriction = '';
		
		if (restrictions == 1){
			timeRestriction = " date_scheduled = ${sql.currentDate}";
		}
		if (restrictions == 2){
			timeRestriction = " date_scheduled > ${sql.currentDate}";
			var next7 = new Date(addTime(auxDate,7));
			timeRestriction += " AND date_scheduled <= ${sql.date('"+next7.getFullYear()+ "-"+(next7.getMonth()+1)+"-"+next7.getDate()+"')}";
		}
		if (restrictions == 3){
			timeRestriction = " date_scheduled > ${sql.currentDate}";
			var next30 = new Date(addTime(auxDate,31));
			timeRestriction += " AND date_scheduled <= ${sql.date('"+next30.getFullYear()+ "-"+(next30.getMonth()+1)+"-"+next30.getDate()+"')}";
		}
		if (restrictions == 4){
			timeRestriction = " date_scheduled >= ${sql.date('"+date_scheduled_since+"')}";
			timeRestriction += " AND date_scheduled <= ${sql.date('"+date_scheduled_until+"')}";
		}
		if (restrictions == 5){
			var lastWeekMonday = new Date(lastMonday(auxDate));
			timeRestriction= " date_completed >= ${sql.date('"+lastWeekMonday.getFullYear()+ "-"+(lastWeekMonday.getMonth()+1)+"-"+lastWeekMonday.getDate()+"')}";
			var next7 = new Date(addTime(lastWeekMonday,7));
			timeRestriction += " AND date_completed < ${sql.date('"+next7.getFullYear()+ "-"+(next7.getMonth()+1)+"-"+next7.getDate()+"')}";
		}
		if (restrictions == 6){
			var thisWeekMonday = new Date(thisMonday());
			timeRestriction = " date_completed >= ${sql.date('"+thisWeekMonday.getFullYear()+ "-"+(thisWeekMonday.getMonth()+1)+"-"+thisWeekMonday.getDate()+"')}";
			var next7 = new Date(addTime(thisWeekMonday,7));
			timeRestriction += " AND date_completed < ${sql.date('"+next7.getFullYear()+ "-"+(next7.getMonth()+1)+"-"+next7.getDate()+"')}";
		}
		if (restrictions == 7){
			timeRestriction = " date_completed >= ${sql.date('"+date_scheduled_since+"')}";
			timeRestriction += " AND date_completed <= ${sql.date('"+date_scheduled_until+"')}";
		}
		if (restrictions == 8){
			timeRestriction = "status not in"+ status +"  AND date_scheduled < ${sql.currentDate}";
		}
		
		var restriction = timeRestriction + " AND activity_log.project_id = '"+this.project_id+"'";
		this.projActionsScheduledPerformedGrid.restriction = restriction;
		this.projActionsScheduledPerformedGrid.refresh();
		this.projActionsScheduledPerformedGrid.show(true);
	}
});

function timeframeListener()
{
	var projActionsScheduledPerformedConsole = View.panels.get('projActionsScheduledPerformedConsole');
	var restrictions = $('restrictions').value;
	if (restrictions == '4' || restrictions == '7') 
	{
		projActionsScheduledPerformedConsole.enableField('activity_log.date_scheduled', true);
		projActionsScheduledPerformedConsole.enableField('activity_log.date_completed', true);
	}
	else
	{
		projActionsScheduledPerformedConsole.enableField('activity_log.date_scheduled', false);
		projActionsScheduledPerformedConsole.enableField('activity_log.date_completed', false);
	}
}

// to make date additions
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

