/**
*
* Added for 20.2 Compliance  :   Operational Report - "Compliance Notification Templates" 
*
* @author Zhang Yi
*/
var rptNotifyTemplateController = View.createController('rptNotifyTemplateController',
{
	//variables indicates current view is manage view or report view
	mode: 'report', 

	//first grid's initial restriction for notify template 
	perRes: "  (activity_id IS NULL OR activity_id = 'AbRiskCompliance') "+ 
		" AND template_id NOT IN (select template_id from regnotify where reg_requirement IS NULL AND reg_program IS NULL) ",

	//first grid's console restriction
	tab1Res: " 1=1 ",

	//second grid's console restriction
	tab2Res: " 1=1 ",

	//arrays of console fields, used  to generate restriction string
	fieldsArraysForPerson: new Array(['regprogram.em_id']),		

	//arrays of console fields, used  to generate restriction string
	fieldsArraysForTemplates: new Array(['notify_templates.template_id'],['notify_templates.trigger_date_field'],
		['notify_templates.notify_recipients','like'],['notify_templates.notify_cat']),		

	//arrays of console fields, used  to generate restriction string
	fieldsArraysForNotify: new Array(['regnotify.regulation'],
									['regnotify.reg_program'],
									['regnotify.reg_requirement']),		

	afterInitialDataFetch:function(){

		this.abCompNotifyTemplateColumnRpt.show(false);

		//initial show and refresh grids in tabs
		this.abCompNotificationGrid.addParameter("yes",getMessage('yes'));
		this.abCompNotificationGrid.addParameter("no",getMessage('no'));
		this.abCompAassignedNotifyTemplateGrid.addParameter("yes",getMessage('yes'));
		this.abCompAassignedNotifyTemplateGrid.addParameter("no",getMessage('no'));
		this.abCompNotificationConsole_onShow();
	},

	/**
	 * Events Handler for 'Show' action on console 
	 */
	abCompNotificationConsole_onShow: function(){

		//Get string format restriction from console's fields of notify_templates table
		var templateRes = getRestrictionStrFromConsole(this.abCompNotificationConsole, this.fieldsArraysForTemplates);
		
		//Get string format restriction from console's fields of notify_templates table
		var notifyRes = getRestrictionStrFromConsole(this.abCompNotificationConsole, this.fieldsArraysForNotify);

		//sign indicate if for tab1 need to consider the restriction 'exists from regnotify'
		var needExistsRes = this.abCompNotificationConsole.getFieldValue("regprogram.em_id") ||
			this.abCompNotificationConsole.getFieldValue("regnotify.regulation")||
			this.abCompNotificationConsole.getFieldValue("regnotify.reg_program")||
			this.abCompNotificationConsole.getFieldValue("regnotify.reg_requirement");

		//Search Responsible Person in both Programs and Requirements (OR)
		var person = this.abCompNotificationConsole.getFieldValue("regprogram.em_id");
		var personRes = null;
		if (person){
			//KB3036965 - support em_id with single quotes
			person = person.replace(/\'/g, "''");
			personRes = " (regprogram.em_id='"+ person+"' or regrequirement.em_id='"+person+"') "
		}

		//For values in Regulation, Program, Requirement, 
		//show notify_templates that exist in regnotify and regnotify record match values in those filter fields
		var existsRes = " exists( select * from regnotify "+
							" left outer join regprogram on regnotify.regulation=regprogram.regulation " + 
								" and  regnotify.reg_program=regprogram.reg_program " + 
							" left outer join regrequirement on regnotify.regulation=regrequirement.regulation "+
								" and  regnotify.reg_program=regrequirement.reg_program "+
								" and  regnotify.reg_requirement=regrequirement.reg_requirement " +
						" where regnotify.template_id=notify_templates.template_id AND " + notifyRes +	(personRes?(" and "+personRes):"") + " ) ";
		
		//Construct restriction for "Show Templates For" selection
		var showForRes="'";
		var showFor = $("virtual_for").value;
		switch (showFor) {
			//Activity Defaults: template_id in regnotify and regnotify.reg_program IS NULL
			case "default":
				showForRes = " exists( select 1 from regnotify where regnotify.reg_program IS NULL " +
							 " and regnotify.template_id= notify_templates.template_id) ";
				break;
			//Programs: template_id in regnotify and regnotify.reg_program IS NOT NULL AND regnotify.reg_requirement IS NULL
			case "program":
				showForRes = " exists( select 1 from regnotify where regnotify.reg_program IS NOT NULL " +
							 " and regnotify.reg_requirement IS NULL  " + 
							 " and regnotify.template_id= notify_templates.template_id) ";
				break;
			//Requirements: template_id in regnotify and regnotify.reg_requirement IS NOT NULL
			case "requirement":
				showForRes = " exists( select 1 from regnotify where regnotify.reg_requirement IS NOT NULL " +
							 " and regnotify.template_id= notify_templates.template_id) ";
				break;
			//Unassigned:  template_id not in regnotify
			case "unassign":
				showForRes = " not exists( select 1 from regnotify where regnotify.template_id= notify_templates.template_id) ";
				break;

			default:
				showForRes=" 1=1 ";
				break;
		}
		this.tab1Res  = templateRes+" and " + (needExistsRes?(existsRes+" and "):"") +showForRes;
		this.abCompNotificationGrid.refresh(this.tab1Res);

		this.tab2Res  = templateRes+" and " + notifyRes +(personRes?(" and "+personRes):"");
		this.abCompAassignedNotifyTemplateGrid.refresh(this.tab2Res);
    },


	/**
	 * Events Handler for 'Clear' action on console 
	 */
	abCompNotificationConsole_onClear: function(){
		
		this.abCompNotificationConsole.clear();

		//revert selection of "Show Templates For" list to 'All'
		setOptionValue("virtual_for", "all");
	},

	/**
	 * Events Handler for row action 'Edit' in grid 
	 */
	abCompAassignedNotifyTemplateGrid_view_onClick: function(row){
		
		//enable and refresh second tab with pk from selected row
		var restriction = "notify_templates.template_id='"+row.record['notify_templates.template_id']+"'";

		//show and refresh form with pk from selected row
		this.abCompNotifyTemplateColumnRpt.refresh(restriction);
		this.abCompNotifyTemplateColumnRpt.show(true);
	},

	/**
	* Event handler for "Doc" action of grid.
	*/
	abCompNotificationGrid_onDoc1 : function() {
		//set restriction parameters of paginate report
		var parameters = {};
		parameters.consoleRes = this.perRes+" and "+ this.tab1Res;
		parameters.yes = getMessage('yes');
		parameters.no = getMessage('no');
		//open paginated report
		View.openPaginatedReportDialog("ab-comp-notify-template-paginate-rpt.axvw" ,null, parameters);
	},

	/**
	* Event handler for "Doc" action of grid.
	*/
	abCompAassignedNotifyTemplateGrid_onDoc2 : function() {
		//set restriction parameters of paginate report
		var parameters = {};
		parameters.consoleRes = this.tab2Res;
		//open paginated report
		View.openPaginatedReportDialog("ab-comp-reg-notify-paginate-rpt.axvw" ,null, parameters);
	}
});