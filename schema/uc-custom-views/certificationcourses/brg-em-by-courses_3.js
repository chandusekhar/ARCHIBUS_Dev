// CHANGE LOG:
// 2015/12/01 - MSHUSSAI - updated the selectEm function to restrict Status=A for active employees

var courseAdminFlag = false;
var certRest = "1=1"
var abCoursesByEm = View.createController('abCoursesByEm',{

	afterViewLoad: function() {
		this.checkCourseAdminGroup();
		var newOptionElement = document.createElement('option');
		newOptionElement.text = "Miscellaneous";
		newOptionElement.value = "Misc";
		var selectBox = $("console_UC_courses.type")
		try {
		  selectBox.add(newOptionElement, selectBox.options[0]); // standards compliant, not IE.
		}
		catch (ex) {
		  selectBox.add(newOptionElement, 0);  // IE only.
		}
	},
	
	checkCourseAdminGroup: function() {
		
		if (View.user.isMemberOfGroup('COURSE-ADMIN')) {
			courseAdminFlag = true;
		} else {
			this.catPanel.addParameter("reportsTo", " and " + makeLiteralOrNull(View.user.employee.id) + " in (em.em_id,em.reports_to))");
			this.coursesPanel.addParameter("reportsTo", " and " + makeLiteralOrNull(View.user.employee.id) + " in (em.em_id,em.reports_to))");
			this.coursesPanel.addParameter("reportsTo", " and " + makeLiteralOrNull(View.user.employee.id) + " in (em.em_id,em.reports_to))");
			this.detailsPanelNorth.addParameter("reportsTo", " and " + makeLiteralOrNull(View.user.employee.id) + " in (em.em_id,em.reports_to))");
			this.detailsPanelCenter.addParameter("reportsTo", " and " + makeLiteralOrNull(View.user.employee.id) + " in (em.em_id,em.reports_to))");
			this.detailsPanelSouth.addParameter("reportsTo", " and " + makeLiteralOrNull(View.user.employee.id) + " in (em.em_id,em.reports_to))");
			courseAdminFlag = false;
		}
	},
	
	catPanel_onCatIdLink: function(row, action){

		var record = row.getRecord();
		var catId = record.values["UC_course_categories.category_id"];
		
		if (courseAdminFlag == true) {
			var rest = "category_id"+makeLiteralOrNull(catId,"=");
		
			this.coursesPanel.refresh(rest);
		} else {
			var rest = "exists (select 1 from uc_certifications u inner join em on u.em_id=em.em_id where UC_course_categories.category_id=u.category_id and em.status='A' and " + makeLiteralOrNull(View.user.employee.id) + " in (em.em_id,em.reports_to)) and category_id="+makeLiteralOrNull(catId,"=") + ")" 

			//var rest = "course_id in (select course_id from uc_certifications u left join em on u.em_id=em.em_id where em.reports_to =" + makeLiteralOrNull(View.user.employee.id) + ") and category_id="+makeLiteralOrNull(catId)+" or course_id in (select course_id from uc_certifications left join em on UC_certifications.em_id=em.em_id where em.em_id=" + makeLiteralOrNull(View.user.employee.id) + ") and category_id="+ makeLiteralOrNull(catId);
			this.coursesPanel.refresh(rest);
		}
	},
	
	catPanel_onCatIdLink2: function(row, action){
		this.catPanel_onCatIdLink(row,action)
	
	},
	
	catPanel_onCatIdLink3: function(row, action){
		this.catPanel_onCatIdLink(row,action)
	},
	
	coursesPanel_onCourseIdLink: function(row, action){
		if (courseAdminFlag == false) {
			var record = row.getRecord();
			var courseId = record.values["UC_courses.course_id"];
			var rest = "uc_certifications.course_id="+makeLiteralOrNull(courseId);
			if (courseId == 'MISC') {rest = "uc_certifications.category is null" ;}
			rest += " and exists (select 1 em where uc_certifications.em_id=em.em_id and em.status='A' and " + makeLiteralOrNull(View.user.employee.id) + " in (em.reports_to,em.em_id)";
			this.detailsPanelNorth.refresh(rest);
			this.detailsPanelCenter.refresh(rest);
			this.detailsPanelSouth.refresh(rest);
		} else {
			var record = row.getRecord();
			var courseId = record.values["UC_courses.course_id"];
			this.detailsPanelNorth.refresh("UC_certifications.course_id = " + makeLiteralOrNull(courseId));
			this.detailsPanelCenter.refresh("UC_certifications.course_id = " + makeLiteralOrNull(courseId));
			this.detailsPanelSouth.refresh("UC_certifications.course_id = " + makeLiteralOrNull(courseId));
		}
		this.detailsPanelNorth.setTitle(courseId + " - Active Certifications" )
		this.detailsPanelCenter.setTitle(courseId + " - Expired Certifications" )
		this.detailsPanelSouth.setTitle(courseId + " - Missing Certifications" )
	},
	
	coursesPanel_onCourseIdLink2: function(){
		var row = this.coursesPanel.rows[this.coursesPanel.selectedRowIndex].row;
		this.coursesPanel_onCourseIdLink(row)
	},
	
	coursesPanel_onCourseIdLink3: function(row, action){
		this.coursesPanel_onCourseIdLink(row,action)
	},
	
	coursesPanel_onCourseIdLink4: function(row, action){
		this.coursesPanel_onCourseIdLink(row,action)
	},
	
	coursesPanel_onCourseIdLink5: function(row, action){
		this.coursesPanel_onCourseIdLink(row,action)
	},
  
   
   selectEm: function(commandObject){					
		var rest = "exists (select 1 from UC_certifications c where c.em_id=em.em_id) and em.status='A'";
		if (!View.user.isMemberOfGroup('COURSE-ADMIN')) {
			rest += " and " + makeLiteralOrNull(View.user.employee.id) + " in (em.reports_to,em.em_id)"
		}
		
		   
		var form = commandObject.getParentPanel();
		View.selectValue(form.id, 'Employees',['UC_certifications.em_id'], 
						  'em', [ 'em.em_id'], 
						  ['em.em_id',  'em.name_first', 'em.name_last'],
						  rest, null, false);
   
   },
	console_onFilter: function(){
		this.catPanel.addParameter("filterCat", " ");
		this.catPanel.addParameter("filterCourse", " ");
		this.catPanel.addParameter("filterCert", " ");
		this.catPanel.addParameter("filterMisc", " ");
		
		this.coursesPanel.addParameter("filterCourse", " ");
		this.coursesPanel.addParameter("filterCert", " ");
		this.coursesPanel.addParameter("filterMisc", " ");
			
		this.detailsPanelNorth.addParameter("filterCert", "");
		this.detailsPanelCenter.addParameter("filterCert","");
		this.detailsPanelSouth.addParameter("filterCert","");
			
		var courseRest = "";
		
		var courseRest1 = "";
		var certRest = "";
		var miscRest = "";
		var catRest="";
		var posRest = ""
		var posRest1 = ""
		
		
		val = this.console.getFieldValue("UC_certifications.course_id");
		if (val != '') {courseRest1 += " and ${tbl}.course_id like " + makeLiteralOrNull(val);}
		val = this.console.getFieldValue("UC_certifications.course_name");
		if (val != '') {courseRest1 += " and ${tbl}.course_name like " + makeLiteralOrNull(val);}
		courseRest += courseRest1 
		
		
		//this one
		
		
		val = this.console.getFieldValue("UC_certifications.em_id");
		if (val != '') {certRest += " and ${tbl}.em_id like " + makeLiteralOrNull(val);}
		val = this.console.getFieldValue("UC_certifications.description");
		if (val != '') {certRest += " and ${tbl}.description like " + makeLiteralOrNull('%' + val + '%');}
		
		var pRest = certRest + courseRest1
		
		
		
		miscRest = certRest + courseRest1;
		var val = this.console.getFieldValue("UC_courses.type");
		if (val != '' && val != 'Misc') {
			courseRest += " and ${tbl}.type = " + makeLiteralOrNull(val);
			miscRest = " and 1=2";
		}
		else if (val == 'Misc') {
			catRest = " and cg.category_Id is null"
		}
		
		val = this.console.getFieldValue("UC_courses.category_id");
		if (val != '') {
			catRest +=" and cg.category_id like " + makeLiteralOrNull(val)
			miscRest = " and 1=2"
			courseRest += " and  ${tbl}.category_id like " + makeLiteralOrNull(val)	
		}
		
		val = this.console.getFieldValue("em.position");
		if (val != '') {
			miscRest += " and 1=2";
			posRest = " and ct.position like " + makeLiteralOrNull(val) ;
			posRest1 = " and p.position like " + makeLiteralOrNull(val)
		}
		
		if (certRest != "" || posRest != "") {this.detailsPanelSouth.addParameter("filterCert",  certRest.replace(/\${tbl}/g, "ct") + posRest);}
		
		val = this.console.getFieldValue("UC_certifications.cert_number");
		if (val != '') {
			certRest += " and ${tbl}.cert_number like " + makeLiteralOrNull(val);
			miscRest += " and ${tbl}.cert_number like " + makeLiteralOrNull(val);
		}
		this.catPanel.addParameter("filterCat",catRest);
		//if (certRest=="") {posRest1 += " and ct.course_id is not null" } 
		if (courseRest != "") {this.catPanel.addParameter("filterCourse", courseRest.replace(/\${tbl}/g, "cs"));}
		if (certRest != ""  || posRest1 != "") {this.catPanel.addParameter("filterCert", certRest.replace(/\${tbl}/g, "ct")+ posRest1);}
		if (miscRest != "") {this.catPanel.addParameter("filterMisc", miscRest.replace(/\${tbl}/g, "ct"));}
	

		
		//if (courseRest != "") {
			if (courseRest != "") {this.coursesPanel.addParameter("filterCourse", courseRest.replace(/\${tbl}/g, "cs"));}
			if (certRest != ""  || posRest1 != "") {this.coursesPanel.addParameter("filterCert", certRest.replace(/\${tbl}/g, "ct") + posRest1);}
			if (miscRest != "") {this.coursesPanel.addParameter("filterMisc", miscRest.replace(/\${tbl}/g, "ct"));}
		//}
		certRest += courseRest1
		if (certRest != ""  || posRest != "") {
			this.detailsPanelNorth.addParameter("filterCert", certRest.replace(/\${tbl}/g, "ct")+ posRest);
			this.detailsPanelCenter.addParameter("filterCert", certRest.replace(/\${tbl}/g, "ct")+ posRest);
		}
		
		
		this.catPanel.refresh();
		this.coursesPanel.show(false,true);
		this.detailsPanelNorth.show(false,true);
		this.detailsPanelCenter.show(false,true);
		this.detailsPanelSouth.show(false,true);	
	},
	
	//CREATION OF A NEW CERTIFICATION FOR AN EMPLOYEE
	coursesPanel_onAddButton: function(row, action) {
		var renewalDS = row.getRecord();
		var startdateold=renewalDS.getValue('UC_certifications.start_date');
		
		this.renewalFormPanel.enableField('UC_certifications.em_id', true);
		this.renewalFormPanel.showField('em.name_first', false);
		this.renewalFormPanel.showField('em.name_last', false);
		
		//this.renewalFormPanel.show(true, false);
		this.renewalFormPanel.showInWindow({
			x: 500,
			y: 150,		
			width: 500,
			height: 450,
			newRecord: true
        });
		
		this.renewalFormPanel.setFieldValue('UC_certifications.em_id', "");
		this.renewalFormPanel.setFieldValue('UC_courses.category_id', renewalDS.getValue('UC_courses.category_id'));
		this.renewalFormPanel.setFieldValue('UC_certifications.course_name', renewalDS.getValue('UC_courses.course_name'));
		this.renewalFormPanel.setFieldValue('UC_certifications.start_date', "");
		this.renewalFormPanel.setFieldValue('UC_certifications.expiry_date', "");
		this.renewalFormPanel.setFieldValue('UC_certifications.course_id', renewalDS.getValue('UC_courses.course_id'));
		this.renewalFormPanel.setFieldValue('UC_certifications.date_renew', "");
		this.renewalFormPanel.setFieldValue('UC_certifications.doc', "");
		
		this.renewalFormPanel.setFieldValue('UC_certifications.description', renewalDS.getValue('UC_courses.description'));
		this.renewalFormPanel.setFieldValue('em.name_first', "");
		this.renewalFormPanel.setFieldValue('em.name_last', "");
		
		this.renewalFormPanel.setFieldValue('UC_certifications.cert_number', "");																		
		this.renewalFormPanel.setFieldValue('UC_certifications.type', renewalDS.getValue('type1'));
		this.renewalFormPanel.setFieldValue('UC_certifications.status', "A");
		this.renewalFormPanel.setFieldValue('UC_certifications.entrytype', "New");
		
		startdateold=(startdateold.getMonth() + 1) + '/' + startdateold.getDate() + '/' +  startdateold.getFullYear();
		this.renewalFormPanel.setFieldValue('start_date_old', startdateold);
		
	},
	
    //ACTIVE CERTIFICATION RENEWAL SETUP
    detailsPanelNorth_onRenewButton: function(row, action) {
		var renewalDS = row.getRecord();
		var startdateold=renewalDS.getValue('UC_certifications.start_date');
		this.renewalFormPanel.enableField('UC_certifications.em_id', false);
		this.renewalFormPanel.showField('em.name_first', true);
		this.renewalFormPanel.showField('em.name_last', true);
		
		this.renewalFormPanel.show(true, false);
		this.renewalFormPanel.showInWindow({
			x: 500,
			y: 150,		
			width: 500,
			height: 450,
			newRecord: true
        });
		
		this.renewalFormPanel.setFieldValue('UC_certifications.em_id', renewalDS.getValue('UC_certifications.em_id'));
		this.renewalFormPanel.setFieldValue('UC_courses.category_id', renewalDS.getValue('UC_courses.category_id'));
		this.renewalFormPanel.setFieldValue('UC_certifications.course_name', renewalDS.getValue('UC_certifications.course_name'));
		this.renewalFormPanel.setFieldValue('UC_certifications.start_date', "");
		this.renewalFormPanel.setFieldValue('UC_certifications.expiry_date', "");
		this.renewalFormPanel.setFieldValue('UC_certifications.course_id', renewalDS.getValue('UC_certifications.course_id'));
		this.renewalFormPanel.setFieldValue('UC_certifications.date_renew', "");
		this.renewalFormPanel.setFieldValue('UC_certifications.doc', "");
		this.renewalFormPanel.setFieldValue('UC_certifications.description', renewalDS.getValue('UC_certifications.description'));
		this.renewalFormPanel.setFieldValue('em.name_first', renewalDS.getValue('em.name_first'));
		this.renewalFormPanel.setFieldValue('em.name_last', renewalDS.getValue('em.name_last'));
		this.renewalFormPanel.setFieldValue('UC_certifications.cert_number', "");																		
		//this.renewalFormPanel.setFieldValue('UC_certifications.type', renewalDS.getValue('UC_certifications.type'));
		this.renewalFormPanel.setFieldValue('UC_certifications.status', renewalDS.getValue('UC_certifications.status'));
	
		startdateold=(startdateold.getMonth() + 1) + '/' + startdateold.getDate() + '/' +  startdateold.getFullYear();
		this.renewalFormPanel.setFieldValue('start_date_old', startdateold);
		this.renewalFormPanel.setFieldValue('UC_certifications.entrytype', "Renew");
	},
	
	
	//EXPIRED CERTIFICATION RENEWAL SETUP
	detailsPanelCenter_onRenewExpired: function(row, action) {
		var renewalDS = row.getRecord();
		var startdateold=renewalDS.getValue('UC_certifications.start_date');
		this.renewalFormPanel.enableField('UC_certifications.em_id', false);
		this.renewalFormPanel.showField('em.name_first', true);
		this.renewalFormPanel.showField('em.name_last', true);
		
		
		this.renewalFormPanel.show(true, false);
		this.renewalFormPanel.showInWindow({
			x: 500,
			y: 150,		
			width: 500,
			height: 450,
			newRecord: true
        });
		
		this.renewalFormPanel.setFieldValue('UC_certifications.em_id', renewalDS.getValue('UC_certifications.em_id'));
		this.renewalFormPanel.setFieldValue('UC_courses.category_id', renewalDS.getValue('UC_courses.category_id'));
		this.renewalFormPanel.setFieldValue('UC_certifications.course_name', renewalDS.getValue('UC_certifications.course_name'));
		this.renewalFormPanel.setFieldValue('UC_certifications.start_date', "");
		this.renewalFormPanel.setFieldValue('UC_certifications.expiry_date', "");
		this.renewalFormPanel.setFieldValue('UC_certifications.course_id', renewalDS.getValue('UC_certifications.course_id'));
		this.renewalFormPanel.setFieldValue('UC_certifications.date_renew', "");
		this.renewalFormPanel.setFieldValue('UC_certifications.doc', "");
		this.renewalFormPanel.setFieldValue('UC_certifications.description', renewalDS.getValue('UC_certifications.description'));
		this.renewalFormPanel.setFieldValue('em.name_first', renewalDS.getValue('em.name_first'));
		this.renewalFormPanel.setFieldValue('em.name_last', renewalDS.getValue('em.name_last'));
		this.renewalFormPanel.setFieldValue('UC_certifications.cert_number', "");																		
		this.renewalFormPanel.setFieldValue('UC_certifications.type', renewalDS.getValue('UC_certifications.type'));
		this.renewalFormPanel.setFieldValue('UC_certifications.status', renewalDS.getValue('UC_certifications.status'));
		this.renewalFormPanel.setFieldValue('UC_certifications.entrytype', "Renew");
		startdateold=(startdateold.getMonth() + 1) + '/' + startdateold.getDate() + '/' +  startdateold.getFullYear();
		this.renewalFormPanel.setFieldValue('start_date_old', startdateold);
		
	},
	
	// MISSING CERTIFICATION CREATION
	detailsPanelSouth_onCertifyButton: function(row){
		var renewalDS = row.getRecord();
		var startdateold=renewalDS.getValue('UC_certifications.start_date');
		this.renewalFormPanel.enableField('UC_certifications.em_id', false);
		this.renewalFormPanel.showField('em.name_first', true);
		this.renewalFormPanel.showField('em.name_last', true);
		
		this.renewalFormPanel.show(true, false);
		this.renewalFormPanel.showInWindow({
			x: 500,
			y: 150,		
			width: 500,
			height: 450,
			newRecord: true
        });
		this.renewalFormPanel.setFieldValue('UC_certifications.em_id', renewalDS.getValue('em.em_id'));
		this.renewalFormPanel.setFieldValue('UC_courses.category_id', renewalDS.getValue('UC_courses.category_id'));
		this.renewalFormPanel.setFieldValue('UC_certifications.course_name', renewalDS.getValue('UC_courses.course_name'));
		this.renewalFormPanel.setFieldValue('UC_certifications.start_date', "");
		this.renewalFormPanel.setFieldValue('UC_certifications.expiry_date', "");
		this.renewalFormPanel.setFieldValue('UC_certifications.course_id', renewalDS.getValue('UC_courses.course_id'));
		this.renewalFormPanel.setFieldValue('UC_certifications.date_renew', "");
		this.renewalFormPanel.setFieldValue('UC_certifications.doc', "");
		this.renewalFormPanel.setFieldValue('UC_certifications.description', "");
		this.renewalFormPanel.setFieldValue('em.name_first', renewalDS.getValue('em.name_first'));
		this.renewalFormPanel.setFieldValue('em.name_last', renewalDS.getValue('em.name_last'));
		this.renewalFormPanel.setFieldValue('UC_certifications.cert_number', "");																		
		this.renewalFormPanel.setFieldValue('UC_certifications.type', "");
		this.renewalFormPanel.setFieldValue('UC_certifications.status', "A");
		this.renewalFormPanel.setFieldValue('UC_certifications.entrytype', "Renew");
	
		startdateold=(startdateold.getMonth() + 1) + '/' + startdateold.getDate() + '/' +  startdateold.getFullYear();
		this.renewalFormPanel.setFieldValue('start_date_old', startdateold);
	},
	
	
	
	//On submission of a certification renewal or creation
	renewalFormPanel_onSubmit: function() {
		var renewalForm = this.renewalFormPanel;
		//var activeGridPanel = View.panels.get("detailsPanelNorth");
			
		var dataSource = View.dataSources.get(View.panels.get('renewalFormPanel').dataSourceId);		
		//var dataSourceOld = View.dataSources.get(View.panels.get('detailsPanelNorth').dataSourceId);
				
		var em_id = this.renewalFormPanel.getFieldValue('UC_certifications.em_id');
		var category = this.renewalFormPanel.getFieldValue('UC_courses.category_id');
		var coursename = this.renewalFormPanel.getFieldValue('UC_certifications.course_name');
		var startdate = this.renewalFormPanel.getFieldValue('UC_certifications.start_date');
		var expirydate = this.renewalFormPanel.getFieldValue('UC_certifications.expiry_date');
		var courseid = this.renewalFormPanel.getFieldValue('UC_certifications.course_id');
		var renewdate = this.renewalFormPanel.getFieldValue('UC_certifications.date_renew');
		var doc = ""; 
		var description = this.renewalFormPanel.getFieldValue('UC_certifications.description');
		var firstname = this.renewalFormPanel.getFieldValue('em.name_first');
		var lastname = this.renewalFormPanel.getFieldValue('em.name_last');
		var certnumber = this.renewalFormPanel.getFieldValue('UC_certifications.cert_number');																		
		var certtype = this.renewalFormPanel.getFieldValue('UC_certifications.type');
		var statusNew = this.renewalFormPanel.getFieldValue('UC_certifications.status');
				
		var startDateOld = this.renewalFormPanel.getFieldValue('start_date_old');
		var statusNew = "A"; 
		var statusOld = "R";
		var entrytype = this.renewalFormPanel.getFieldValue('UC_certifications.entrytype');
		
		
		if(startdate == ""){
			View.showMessage("Please Enter a Start Date before saving");
		}
		else if(expirydate != "" && expirydate != null && expirydate <= startdate){
			View.showMessage("Expiry Date should be greater then Start Date");
		} else if (em_id == "") {
			View.showMessage("Please enter an employee before saving");
		}
		else{
			
			try {				
					var insertRecord = new Ab.data.Record();
					
					var updateRecord = new Ab.data.Record();
					
					insertRecord.isNew = true;
					insertRecord.setValue('UC_certifications.em_id',em_id);
					insertRecord.setValue('UC_certifications.type',certtype);
					insertRecord.setValue('UC_certifications.course_name',coursename);
					insertRecord.setValue('UC_certifications.start_date',startdate);
					insertRecord.setValue('UC_certifications.expiry_date',expirydate);
					insertRecord.setValue('UC_certifications.course_id',courseid);
					insertRecord.setValue('UC_certifications.date_renew',renewdate);
					insertRecord.setValue('UC_certifications.doc',doc);
					insertRecord.setValue('UC_certifications.description',description);
					insertRecord.setValue('UC_certifications.cert_number',certnumber);
					insertRecord.setValue('UC_certifications.status',statusNew);
					
					
					updateRecord.isNew = false;
					updateRecord.setValue('UC_certifications.em_id',em_id);
					updateRecord.setValue('UC_certifications.course_id',courseid);
					updateRecord.setValue('UC_certifications.start_date', startDateOld);
					updateRecord.setValue('UC_certifications.status',statusOld);
					
					updateRecord.oldValues = {};
					updateRecord.oldValues["UC_certifications.em_id"]  = em_id;
					updateRecord.oldValues["UC_certifications.course_id"]  = courseid;
					updateRecord.oldValues["UC_certifications.start_date"]  = startDateOld;

					
					if (entrytype=='New') {		//if we are trying to enter a new certification, see if they can renew instead
						var checkRecords = UC.Data.getDataRecords('UC_certifications', ['course_id'], "em_id='" + em_id + "' and course_id='" + courseid + "'");
						if (!checkRecords.length) {	
							dataSource.saveRecord(insertRecord);					
						}
						else {
							View.showMessage("A certification for Course ID: " + courseid + " already exists for " + em_id + ", please use the Renew option instead.");
						}
					} else {
						dataSource.saveRecord(insertRecord);
					}

					
					if (startDateOld != '') {		//don't save old record if there isn't one
						dataSource.saveRecord(updateRecord);

					}
				}
			catch (e) {
				Workflow.handleError(e);
			}
			
			//REFRESH ALL PANELS
			View.panels.get("detailsPanelCenter").refresh();
			View.panels.get("detailsPanelNorth").refresh();
			View.panels.get("detailsPanelSouth").refresh();
			this.renewalFormPanel.closeWindow();			
		}
	},
	
   detailsPanelNorth_onViewHistory: function(row)
	{
	
	  var record = row.getRecord();
	   
	  var targetCourse = record.getValue("UC_certifications.course_id");
	  var targetEmId = record.getValue("UC_certifications.em_id");
	  
	  var theRest = "UC_certifications.em_id = " + makeLiteralOrNull(targetEmId) ;
	  if (targetCourse != null)
	      theRest += " and UC_certifications.course_id = "+  makeLiteralOrNull(targetCourse);
	  
	  View.openDialog('brg-certification-history.axvw', theRest , false, {
        width: '950',
        height: '950',
        closeButton: true,
		maximize: false
		});
	},
	
	detailsPanelCenter_onViewHistory: function(row){
	
	  var record = row.getRecord();
	   
	  var targetCourse = record.getValue("UC_certifications.course_id");
	  var targetEmId = record.getValue("UC_certifications.em_id");
	  
	  var theRest = "UC_certifications.em_id = " +  makeLiteralOrNull(targetEmId);
	  if (targetCourse != null)
	      theRest += " and UC_certifications.course_id = "+  makeLiteralOrNull(targetCourse);
	  
	  View.openDialog('brg-certification-history.axvw', theRest , false, {
        width: '950',
        height: '950',
        closeButton: true,
		maximize: false
		});
	},
	
	
});

/*
function openAddEmMultiple() {
	View.openDialog("brg-add-em-multiple.axvw", '', true, {
		width: 800,
		height: 700,
		closeButton: true,
		maximize: false,
		//afterViewLoad: function(dialogView) { 
			//var controller = dialogView.controllers.get('theController');
			
			//controller.detailsPanel.setFieldValue("UC_course.type","-");
			

			
			callback: function() {
				var detailPanelN = View.panels.get("detailsPanelNorth");
				var detailPanelC = View.panels.get("detailsPanelCenter");
				var detailPanelS = View.panels.get("detailsPanelSouth");
				detailPanelN.refresh();
				detailPanelC.refresh();
				detailPanelS.refresh();
				 View.panels.get("catPanel").refresh();
				 View.panels.get("coursesPanel").refresh();
			}
		//}
		
	});
}

function openBrgAddEmMultiple(row, pos) {
	
	
	if (!pos) {
		var rec = row.record
		var detailsPanelRest = "UC_certifications.course_id"+makeLiteralOrNull(rec["UC_certifications.course_id"],"=")
		detailsPanelRest +=" and UC_certifications.start_date"+makeLiteralOrNull(rec["UC_certifications.start_date.raw"],"=")
		detailsPanelRest +=" and UC_certifications.em_id"+makeLiteralOrNull(rec["UC_certifications.em_id"],"=")
	}

	//View.openDialog("brg-cert-edit.axvw", '', false, {
	View.openDialog("brg-add-em-multiple.axvw", '', false, {
		width: 800,
		height: 700,
		closeButton: true,
		maximize: false,
		afterViewLoad: function(dialogView) { 
			var controller = dialogView.controllers.get('theController');
			controller.detailsPanel.newRecord=pos;
			if (!pos) {
				controller.detailsPanel.refresh(detailsPanelRest);
			} else {
				controller.openerRec=row		
			}
		},
		callback: function() {
			var detailPanelN = View.panels.get("detailsPanelNorth");
			var detailPanelC = View.panels.get("detailsPanelCenter");
			var detailPanelS = View.panels.get("detailsPanelSouth");
			detailPanelN.refresh();
			detailPanelC.refresh();
			detailPanelS.refresh();
			View.panels.get("catPanel").refresh();
			View.panels.get("coursesPanel").refresh();
		}
		
	});
}

*/
function makeLiteralOrNull(val,op) {
    var rVal = "NULL";
	if (!op) {op="";}
	if (op !="" ) {
		rVal = " IS NULL";
	}
	if (typeof val === "undefined") {
    }
	else if (val != '') {
         rVal = op + "'" + val.toString().replace(/'/g, "''") + "'";
    }
    return  rVal;
}