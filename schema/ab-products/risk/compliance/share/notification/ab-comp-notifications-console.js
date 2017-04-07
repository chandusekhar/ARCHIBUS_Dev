/**
*
* Added for 20.1 Compliance
*
* @author Zhang Yi
*/
var abCompNotificationConsoleController = View.createController('abCompNotificationConsoleController',
{
	consoleRes:' 1=1 ',

	// arrays of console fields that from tables regrequirement, regprogram and regulation, used to construct a sub exists restriction: 
	// ( exists select 1 from activity_log left  outer join regrequirement on regrequirement.regcomp_id=activity_log.regcomp_id 
	// left outer join regprogram on regprogram.reg_program=regrequirement.reg_program 
	// left outer join regulation on regulation.regulation=regrequirement.regulation  where  .... 
	consoleFieldsArraysForRes: new Array(['notifications.template_id'],['notify_templates.notify_cat'],['notifications.is_active'],
			['notify_templates.notify_recipients','like'],['activity_log.manager'],
			['activity_log.regulation'],['activity_log.reg_program'],['activity_log.reg_requirement'],
			['activity_log.status'],['activity_log.action_title', 'like'],['activity_log.activity_log_id']),		

	afterInitialDataFetch: function(){
		var console = this.abCompNotificationConsole;
		//enable all console fields
		console.fields.each(function(field) {
			console.enableField(field.fieldDef.id, true);
		});

    },

	/**
	 * Events Handler for 'Show' action on console 
	 */
	abCompNotificationConsole_onShow: function(){
		
		this.consoleRes = getRestrictionStrFromConsole(this.abCompNotificationConsole, this.consoleFieldsArraysForRes);
		
		var date_scheduled = this.abCompNotificationConsole.getFieldValue("activity_log.date_scheduled");
		if(date_scheduled){
			this.consoleRes +=  " AND ${sql.yearMonthDayOf('activity_log.date_scheduled')} >='"+ date_scheduled+"'";
		}

		var date_sent = this.abCompNotificationConsole.getFieldValue("notifications.date_sent");
		if(date_sent){
			this.consoleRes +=  " AND ${sql.yearMonthDayOf('notifications.date_sent')} ='"+ date_sent+"'";
		}
		
		//for console fileds requirement type and requirement status, construct proper sql restriction
		this.consoleRes +=  " AND exists ( select 1 from regrequirement where activity_log.regulation=regrequirement.regulation " + 
			" and activity_log.reg_program=regrequirement.reg_program and activity_log.reg_requirement=regrequirement.reg_requirement ";
		var requirementStatus = this.abCompNotificationConsole.getFieldValue("regrequirement.status");
		if(requirementStatus){
			this.consoleRes +=  " and regrequirement.status='" + requirementStatus + "' ";
		}
		var requirementType = this.abCompNotificationConsole.getFieldValue("regrequirement.regreq_type");
		if(requirementType){
			this.consoleRes +=  " and regrequirement.regreq_type='" + requirementType + "' ";
		}
		this.consoleRes +=  " ) "; 


		var index = View.controllers.length;
		var parentController = View.controllers.get(index-1);
		parentController.onFilter(this.consoleRes);
    }
});

