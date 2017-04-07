
function createWorkRequestN(addNew){
	createWorkRequest(true)
}
function createWorkRequestS(addNew){
	createWorkRequest(false)
}

function createWorkRequest(addNew){
	var northPanel = AFM.view.View.getControl('northFrame','northPanel');
	var insertPanel = AFM.view.View.getControl('insertFrame','insertPanel');
	var detailsPanel = AFM.view.View.getControl('detailsFrame','detailsPanel');
	
	//Fill in Site based on bl_id prior to saving


	if (insertPanel.save()){
		
		activity_log_id = insertPanel.record['activity_log.activity_log_id']
		
		var record = "<record ";

		for(var i=0;i<insertPanel.fieldDefs.length;i++){
			var fieldId = 	insertPanel.fieldDefs[i].fullName;
			//recordValues[fieldId] = insertPanel.record[fieldId];
			record = record + fieldId;
			record = record + '="' + convert2validXMLValue(insertPanel.record[fieldId]) + '" ';
		}
		record = record + " />"
		
		
				

		parameters = {
			"tableName":'activity_log', 
			"fieldName":'activity_log_id',
			"activity_log.activity_log_id": activity_log_id,
			"fields": record
		};
		
	
	
		//result = AFM.Workflow.runRuleAndReturnResult('AbBldgOpsHelpDesk-submitRequest', parameters);
		var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbBldgOpsHelpDesk-submitRequest', parameters);

		if(result.code == 'executed'){
			//get activity_log_id from result
			var res;
			if(result.jsonExpression != ""){
				res = eval('('+result.jsonExpression+')');
			} 
			//Refresh the NorthPanel's WR list
			northPanel.refresh();
			if (addNew) {
				//Put Insert panel back into New mode
				insertPanel.refresh("",true)
			}
			else {
				//hide the insert panel
				insertPanel.show(false)
				toggleWRFrames1()
				//restrict the details panel to the new wr
				var restriction = new AFM.view.Restriction();
				restriction.addClause('wr.activity_log_id',activity_log_id);
				detailsPanel.refresh(restriction)
				//Show the details panel
				detailsPanel.show(true)
			}
		} 
		else {
			alert(result.code + " :: " + result.message);
		}
	/*		
			var parameters = {
			'activity_log_id': insertPanel.getFieldValue('activity_log.requestor') assessment_id, 
			'updatedRecordsRequired':false
		};
		
		//Modify to call new workflow that creates a new activity_log record and ties it back to the project activity_log via the assessment_id code
		//var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbProjectManagement-createWorkRequestForAction', parameters);
		
	var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbProjectManagement-brgcreateWorkRequestForAction', parameters);
		if (result.code == 'executed') {
			//refresh the wr list
			northPanel.refresh();
			if (addNew) {
				//Put Insert panel back into New mode
				insertPanel.refresh("",true)
			}
			else {
				//hide the insert panel
				insertPanel.show(false)
				//restrict the details panel to the new wr
				detailsPanel.refresh("wr.activity_log_id = " + activity_log_id)
				//Show the details panel
				detailsPanel.show(true)
			}
			
		} else {
			alert(result.code + " :: " + result.message);
		}
		*/
		
	}
}



function getDateWithISOFormat(date)
{
	var strDateSeparator = GetDateSeparator(strDateShortPattern);
	var arrDate = new Array();
	var curDate = new Date();
	var month = curDate.getMonth()+ 1;
	var day	  = curDate.getDate();
	var year  = curDate.getFullYear();
	if(date != ""){
		arrDate = date.split(strDateSeparator);
		for(var i=0; i < arrDate.length; i++){
			var temp = arrDateShortPattern[i];
			if(temp!=null){
			if(temp.indexOf("Y")>=0)
				year = arrDate[i];
			else if(temp.indexOf("M")>=0)
				month = arrDate[i];
			else if(temp.indexOf("D")>=0)
				day = arrDate[i];
			}
		}
		day		= parseInt(day,10);
		month	= parseInt(month,10);
		year	= parseInt(year,10);
		//digits 0-30 are 2000 years, and 31-99 are 1900 years.
		if(year <= 30)
			year = 2000+year;
		if(year>30 && year<=99)
			year = 1900+year;
		if(year > 99 && year <= 999)
			year = 2000+year;
		
		month =  (month<10)?("0"+month):month;
		day =  (day<10)?("0"+day):day;
		//date in ISO format(YYYY-MM-DD)
		date = year + "-" + month + "-" + day;
	}
	return date;
}

function showNorthFrame(row){
	var northPanel = AFM.view.View.getControl('northFrame','northPanel');
	var restriction = new AFM.view.Restriction();
	restriction.addClause('activity_log.assessment_id', row.restriction['activity_log.activity_log_id'], '=');
	northPanel.refresh(restriction);
	northPanel.show(true)
}

function insertForm_afterRefresh() {
		var northPanel = AFM.view.View.getControl('northFrame','northPanel');
		var assessment_id = northPanel.restriction.clauses[northPanel.restriction.findClause('activity_log.assessment_id')].value	
		var insertPanel = AFM.view.View.getControl('insertFrame','insertPanel');

	if (insertPanel.record['activity_log.activity_log_id'] != "" ){return}

	var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getUser', {});

   
    if (result.code != 'executed') {
         AFM.workflow.Workflow.handleError(result, getMessage('error_getUser'));
     }

        
    var userInfo    = result.data;
 
	var emEm	 =  userInfo.Employee.em_id;	
   	var emPhone      =  userInfo.Employee.phone;

		
		
		//Fill assessment_id = the selected activity_logs activity_log_id
	
	//Fill in the following fields from the project  - site_id, bl_id, fl_id,location dv_id,dp_id,ac_id
		//????
		
		fields =  ['activity_log.site_id','activity_log.bl_id','activity_log.fl_id','activity_log.rm_id','activity_log.location','activity_log.ac_id','activity_log.eq_id','activity_log.prob_type','activity_log.project_id','activity_log.action_title']
		var parameters = 
		{
			tableName: 'activity_log',
			fieldNames: toJSON(fields),
			restriction: toJSON("activity_log.activity_log_id = " + assessment_id)
		};

		var wfrResult = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecord',parameters);  
		var desc = ""

		if (wfrResult.code == 'executed') {
			var record = wfrResult.data.records[0];
			if (typeof(record) != 'undefined') {

				for(var i=0;i<fields.length;i++){ 

					if (fields[i] == "activity_log.project_id" && record[fields[i]] != "") {
						desc = desc + "Project:  " +  record[fields[i]] + "\r\n"

					}
					else if (fields[i] == "activity_log.action_title" && record[fields[i]] != "" ) {
						desc = desc + "Action Title:  " +  record[fields[i]]  + "\r\n"
					}

					else if (record[fields[i]] != "") {

						insertPanel.setFieldValue(fields[i], record[fields[i]])
						insertPanel.record[fields[i]] = record[fields[i]]
					}
				}
				desc = desc + "Action Id:  " +  assessment_id  + "\r\n"
				desc = desc + "Description:  "   + "\r\n"
				insertPanel.setFieldValue('activity_log.description', desc)
				insertPanel.record['activity_log.description'] = desc
			}
		}
		else { 
			alert(wfrResult.code + " :: " + wfrResult.message);
		}

		//If the ac_id is not filled in then grab it from the project
		if (insertPanel.record['activity_log.ac_id'] == "" ){
			var parameters2 = 
			{
				tableName: 'project',
				fieldNames: toJSON(['project.ac_id']),
				restriction: toJSON("exists (select 1 from activity_log a where a.project_id = project.project_id and a.activity_log_id  = " + assessment_id + ")")
			};

			var wfrResult = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecord',parameters2);  
			if (wfrResult.code == 'executed') {
				var record = wfrResult.data.records[0];
				if (typeof(record) != 'undefined') {
					if (record['project.ac_id'] != "") {
						insertPanel.setFieldValue('activity_log.ac_id',  record['project.ac_id'])
						insertPanel.record['activity_log.ac_id'] = record['project.ac_id']
					}
				}

			}			
		}
		
		
		insertPanel.setFieldValue('activity_log.assessment_id',assessment_id)
		insertPanel.record['activity_log.assessment_id'] = assessment_id
		
		//Fill priority_id = 1
		insertPanel.setFieldValue('activity_log.priority_id','1')
		insertPanel.record['activity_log.priority_id'] = '1'
		
		//Fill tr_id = 'CCC'
		insertPanel.setFieldValue('activity_log.tr_id','CCC')
		insertPanel.record['activity_log.tr_id'] = 'CCC'

		//fill activity_type
		insertPanel.setFieldValue('activity_log.activity_type','SERVICE DESK - MAINTENANCE')
		insertPanel.record['activity_log.activity_type'] = 'SERVICE DESK - MAINTENANCE'
				
		//Insert Requestor name and phone number based on the users logged in
		insertPanel.setFieldValue('activity_log.requestor',emEm)
		insertPanel.record['activity_log.requestor'] = emEm
		
		insertPanel.setFieldValue('activity_log.phone_requestor',emPhone)
		insertPanel.record['activity_log.phone_requestor'] = emPhone
		
		insertPanel.setFieldValue('activity_log.created_by',emEm)
		insertPanel.record['activity_log.created_by'] = emEm
		
		insertPanel.setFieldValue('activity_log.status',"CREATED")
		insertPanel.record['activity_log.status'] = "CREATED"

}

function toggleWRFrames1() {
	toggleWRFrames(true)
}

function toggleWRFrames2() {
	toggleWRFrames(false)
}

function toggleWRFrames(detailsFrame) {
	wrFrameSet = parent.document.getElementById("wrFrameSet");
	if (detailsFrame) {
		wrFrameSet.rows="150,*,0"
	}
	else {
		wrFrameSet.rows="150,0,*"
	}
	
	

	
}

