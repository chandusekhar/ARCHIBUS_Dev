// CHANGE LOG:
// 2015/12/01 - MSHUSSAI - updated the selectEm function to restrict Status=A for active employees
// 2016/06/17 -  MSHUSSAI - Panel: Categories - Remove "Add" button
//				     		- Panel: Active Certifications: Add "Add Employee Certification" button. Build dialog for adding a certification
//							- Panel: Active Certifications: Remove "Edit" button
//							- Panel: Active Certifications: Add "Renew" per-row button. Build dialog for renewing a certification
//							- Panel: Expired Certifications: Remove "Edit" button
//							- Panel: Expired Certifications: Add "Renew" button. Build dialog for renewing a certification
//							- Panel: Missing Certifications: Rename "Add" button to "Certify". Build dialog for adding a certification
//							- View: Ensure latest certification is showing. This may be done by either adding a status, or simply building logic to view only records with the latest certification date

var courseAdminFlag = false;

var abCoursesByEm = View.createController('abCoursesByEm',{

   theEmId: '',
   
   afterViewLoad: function() {
		this.checkCourseAdminGroup();
		var newOptionElement = document.createElement('option');
		newOptionElement.text = "Miscellaneous";
		newOptionElement.value = "Misc";
		/*
		var selectBox = $("console_UC_courses.type")
		try {
		  selectBox.add(newOptionElement, selectBox.options[0]); // standards compliant, not IE.
		}
		catch (ex) {
		  selectBox.add(newOptionElement, 0);  // IE only.
		}
		*/
	},
	
	checkCourseAdminGroup: function() {
	
		
		if (View.user.isMemberOfGroup('COURSE-ADMIN')) {
			courseAdminFlag = true;
		} else {
			courseAdminFlag = false;
		}
	},
   
   afterInitialDataFetch: function()
   {
	
		if (courseAdminFlag == true) {
			this.treePanel.refresh();
		} else {
			var rest = makeLiteralOrNull(View.user.employee.id) + " in (reports_to,em_id)";
			this.treePanel.refresh(rest);
		}
   },
   

   
   displayPanels: function(theObj){
		var rest = theObj.getRestriction()["em.em_id"];
		this.theEmId = rest;
		this.detailsPanelNorth.refresh (" UC_certifications.em_id = "+ makeLiteralOrNull(rest) +" and (UC_certifications.expiry_date is null or UC_certifications.expiry_date >= getdate()  )");
		this.detailsPanelNorth.setTitle(rest + " - Active Certifications" )
		this.detailsPanelCenter.refresh (" UC_certifications.em_id = "+ makeLiteralOrNull(rest));
		this.detailsPanelCenter.setTitle(rest + " - Expired Certifications" )
		
		//rest = " and exists (select 1 from em where em.position=uc_certifications.position and em.em_id = "+ makeLiteralOrNull(this.theEmId) + ")"
		//rest = "uc_certifications.em_id= "+ makeLiteralOrNull(rest) +" and not exists (select 1 from uc_certifications ct where ct.course_id=uc_certifications.course_id) "
		rest = "uc_certifications.em_id= "+ makeLiteralOrNull(rest)
		this.detailsPanelSouth.refresh (rest);
	 
	 
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
	
		
		
		//this.treePanel.addParameter("filterCert", " ");
		this.detailsPanelNorth.addParameter("filterCert", "");
		this.detailsPanelCenter.addParameter("filterCert","");
		this.detailsPanelSouth.addParameter("filterCert", "");
	
		var emRest = "";
		var certRest = "";
		var postRest = "";
		
		
		var val = this.console.getFieldValue("UC_courses.type");
		if (val != '') {
			emRest += " and isnull(cs.type,'Misc') = " + makeLiteralOrNull(val);
			certRest += " and isnull(ct.type,'Misc') = " + makeLiteralOrNull(val);
		}
		var val = this.console.getFieldValue("UC_courses.category_id");
		if (val != '') {
			emRest += " and cs.category_id like " + makeLiteralOrNull(val);
			certRest += " and ct.category_id like " + makeLiteralOrNull(val);
		}
		
		val = this.console.getFieldValue("UC_certifications.course_name");
		if (val != '') {
			emRest += " and isnull(cs.course_name,ct.course_name) like " + makeLiteralOrNull(val);
			certRest += " and ct.course_name like " + makeLiteralOrNull(val);
		}	
		val = this.console.getFieldValue("UC_certifications.course_id");
		if (val != '') {
			emRest += " and ct.course_id like " + makeLiteralOrNull(val);
			certRest += " and ct.course_id like " + makeLiteralOrNull(val);
		}
		postRest = certRest
		
		
		var setemCertRest = false
		val = this.console.getFieldValue("UC_certifications.cert_number");
		if (val != '') {
			emRest += " and ct.cert_number like " + makeLiteralOrNull(val);
			certRest += " and ct.cert_number like " + makeLiteralOrNull(val);
			setemCertRest=true
		}
		val = this.console.getFieldValue("UC_certifications.description");
		if (val != '') {
			emRest += " and ct.description like " + makeLiteralOrNull('%' + val + '%');
			certRest += " and ct.description like " + makeLiteralOrNull('%' + val + '%');
			postRest += " and ct.description like " + makeLiteralOrNull('%' + val + '%');
		}
		
		
		
		if (emRest !=""){
			if (this.console.getFieldValue("em.position") == "" || setemCertRest) {f
				emRest = " and exists (select 1 from UC_certifications ct left join UC_courses cs on ct.course_id=cs.course_id where ct.em_id=em.em_id" +  emRest + ")"
			}
			else {
				emRest = " and exists (select 1 from uc_position_courses pc left join UC_courses cs on pc.course_id=cs.course_id where pc.position=em.position" +  emRest.replace(/ct/g, "cs") + ")"
			}
		}
		
		val = this.console.getFieldValue("UC_certifications.em_id");
		if (val != '') {
			emRest += " and em.em_id like " + makeLiteralOrNull(val);
		}
		
		val = this.console.getFieldValue("em.position");
		if (val != '') {
			certRest += " and exists (select 1 from uc_position_courses pc where pc.course_id=ct.course_id and pc.position like " + makeLiteralOrNull(val) +")";
			postRest += " and ct.position like " + makeLiteralOrNull(val);
			emRest += " and em.position like " + makeLiteralOrNull(val);
		}
		
		/*
		val = this.console.getFieldValue("cf.work_team_id");
		if (val != '') {
			emRest += " and emcf.work_team_id like " + makeLiteralOrNull(val);
			//alert(val);
		}
		
		*/
		emRest = "1=1" +emRest
		
		
		if (certRest) {
			this.detailsPanelNorth.addParameter("filterCert", "where 1=1" +certRest);
			this.detailsPanelCenter.addParameter("filterCert", "where 1=1" +certRest);
		}
		if (postRest) {
			this.detailsPanelSouth.addParameter("filterCert", "where 1=1" +postRest);
		}
		
		
		this.treePanel.refresh(emRest);
		this.detailsPanelNorth.show(false,true);
		this.detailsPanelCenter.show(false,true);
		this.detailsPanelSouth.show(false,true);
		
		
	},
   detailsPanelNorth_onViewHistory: function(row)
	{
	
	  var record = row.getRecord();
	   
	  var targetCourse = record.getValue("UC_certifications.course_id");
	  var targetEmId = record.getValue("UC_certifications.em_id");
	  
	  var theRest = "UC_certifications.em_id = " + makeLiteralOrNull(targetEmId);
	  if (targetCourse != null)
	      theRest += " and UC_certifications.course_id = "+ makeLiteralOrNull(targetCourse);
	  
	  View.openDialog('brg-certification-history.axvw', theRest , false, {
        width: '950',
        height: '950',
        closeButton: true,
		maximize: false
		});
	},
	
	 detailsPanelNorth_onRenewButton: function(row, action) {
		
		var renewalDS = row.getRecord();
		var em_id=renewalDS.getValue('UC_certifications.em_id');
		var category=renewalDS.getValue('UC_courses.category_id');
		var coursename=renewalDS.getValue('UC_certifications.course_name');
		var startdate="";
		var startdateold=renewalDS.getValue('UC_certifications.start_date');
		var expirydate="";
		var courseid=renewalDS.getValue('UC_certifications.course_id');
		var renewdate="";
		var doc=renewalDS.getValue('UC_certifications.doc');
		var description=renewalDS.getValue('UC_certifications.description');
		var firstname=renewalDS.getValue('em.name_first');
		var lastname=renewalDS.getValue('em.name_last');
		var certnumber="";
		var certtype=renewalDS.getValue('UC_certifications.type');
		var statusNew=renewalDS.getValue('UC_certifications.status');
		
		this.renewalFormPanel.show(true, false);
		this.renewalFormPanel.showInWindow({
			x: 500,
			y: 150,		
			width: 500,
			height: 420,
			newRecord: true
        });
		
		this.renewalFormPanel.setFieldValue('UC_certifications.em_id', em_id);
		this.renewalFormPanel.setFieldValue('UC_courses.category_id', category);
		this.renewalFormPanel.setFieldValue('UC_certifications.course_name', coursename);
		this.renewalFormPanel.setFieldValue('UC_certifications.start_date', startdate);
		//this.renewalFormPanel.setFieldValue('UC_certifications.start_date', startdate);
		this.renewalFormPanel.setFieldValue('UC_certifications.expiry_date', expirydate);
		this.renewalFormPanel.setFieldValue('UC_certifications.course_id', courseid);
		this.renewalFormPanel.setFieldValue('UC_certifications.date_renew', renewdate);
		this.renewalFormPanel.setFieldValue('UC_certifications.doc', doc);
		this.renewalFormPanel.setFieldValue('UC_certifications.description', description);
		this.renewalFormPanel.setFieldValue('em.name_first', firstname);
		this.renewalFormPanel.setFieldValue('em.name_last', lastname);
		this.renewalFormPanel.setFieldValue('UC_certifications.cert_number', certnumber);																		
		this.renewalFormPanel.setFieldValue('UC_certifications.type', certtype);
		this.renewalFormPanel.setFieldValue('UC_certifications.status', statusNew);
	
		startdateold=(startdateold.getMonth() + 1) + '/' + startdateold.getDate() + '/' +  startdateold.getFullYear();
		this.renewalFormPanel.setFieldValue('start_date_old', startdateold);
	},
	
	detailsPanelCenter_onRenewExpiredButton: function(row, action) {
		
		var renewalDS = row.getRecord();
		var em_id=renewalDS.getValue('UC_certifications.em_id');
		var category=renewalDS.getValue('UC_courses.category_id');
		var coursename=renewalDS.getValue('UC_certifications.course_name');
		var startdate="";
		var startdateold=renewalDS.getValue('UC_certifications.start_date');
		var expirydate="";
		var courseid=renewalDS.getValue('UC_certifications.course_id');
		var renewdate="";
		var doc=renewalDS.getValue('UC_certifications.doc');
		var description=renewalDS.getValue('UC_certifications.description');
		var firstname=renewalDS.getValue('em.name_first');
		var lastname=renewalDS.getValue('em.name_last');
		var certnumber="";
		var certtype=renewalDS.getValue('UC_certifications.type');
		var statusNew=renewalDS.getValue('UC_certifications.status');
		
		this.renewalExpFormPanel.show(true, false);
		this.renewalExpFormPanel.showInWindow({
			x: 500,
			y: 150,		
			width: 500,
			height: 420,
			newRecord: true
        });
		
		this.renewalExpFormPanel.setFieldValue('UC_certifications.em_id', em_id);
		this.renewalExpFormPanel.setFieldValue('UC_courses.category_id', category);
		this.renewalExpFormPanel.setFieldValue('UC_certifications.course_name', coursename);
		this.renewalExpFormPanel.setFieldValue('UC_certifications.start_date', startdate);
		//this.renewalFormPanel.setFieldValue('UC_certifications.start_date', startdate);
		this.renewalExpFormPanel.setFieldValue('UC_certifications.expiry_date', expirydate);
		this.renewalExpFormPanel.setFieldValue('UC_certifications.course_id', courseid);
		this.renewalExpFormPanel.setFieldValue('UC_certifications.date_renew', renewdate);
		this.renewalExpFormPanel.setFieldValue('UC_certifications.doc', doc);
		this.renewalExpFormPanel.setFieldValue('UC_certifications.description', description);
		this.renewalExpFormPanel.setFieldValue('em.name_first', firstname);
		this.renewalExpFormPanel.setFieldValue('em.name_last', lastname);
		this.renewalExpFormPanel.setFieldValue('UC_certifications.cert_number', certnumber);																		
		this.renewalExpFormPanel.setFieldValue('UC_certifications.type', certtype);
		this.renewalExpFormPanel.setFieldValue('UC_certifications.status', statusNew);
	
		startdateold=(startdateold.getMonth() + 1) + '/' + startdateold.getDate() + '/' +  startdateold.getFullYear();
		this.renewalExpFormPanel.setFieldValue('start_date_old', startdateold);
	},
		
	detailsPanelSouth_onCertifyButton: function(row, action) {
		
		var certifyDS = row.getRecord();
		var em_id=certifyDS.getValue('em.em_id');
		var category=certifyDS.getValue('UC_courses.category_id');
		var coursename=certifyDS.getValue('UC_courses.course_name');
		var startdate="";
		var startdateold="";
		var expirydate="";
		var courseid=certifyDS.getValue('UC_courses.course_id');
		var renewdate="";
		var doc="";
		var description="";
		var firstname=certifyDS.getValue('em.name_first');
		var lastname=certifyDS.getValue('em.name_last');
		var certnumber="";
		var certtype="";
		var statusNew="";
		
		this.certifyFormPanel.show(true, false);
		this.certifyFormPanel.showInWindow({
			x: 500,
			y: 150,		
			width: 500,
			height: 420,
			newRecord: true
        });
		
		this.certifyFormPanel.setFieldValue('UC_certifications.em_id', em_id);
		this.certifyFormPanel.setFieldValue('UC_courses.category_id', category);
		this.certifyFormPanel.setFieldValue('UC_certifications.course_name', coursename);
		this.certifyFormPanel.setFieldValue('UC_certifications.start_date', startdate);	
		this.certifyFormPanel.setFieldValue('UC_certifications.expiry_date', expirydate);
		this.certifyFormPanel.setFieldValue('UC_certifications.course_id', courseid);
		this.certifyFormPanel.setFieldValue('UC_certifications.date_renew', renewdate);
		this.certifyFormPanel.setFieldValue('UC_certifications.doc', doc);
		this.certifyFormPanel.setFieldValue('UC_certifications.description', description);
		this.certifyFormPanel.setFieldValue('em.name_first', firstname);
		this.certifyFormPanel.setFieldValue('em.name_last', lastname);
		this.certifyFormPanel.setFieldValue('UC_certifications.cert_number', certnumber);																		
		this.certifyFormPanel.setFieldValue('UC_certifications.type', certtype);
		this.certifyFormPanel.setFieldValue('UC_certifications.status', statusNew);
	
		startdateold=(startdateold.getMonth() + 1) + '/' + startdateold.getDate() + '/' +  startdateold.getFullYear();
		this.certifyFormPanel.setFieldValue('start_date_old', startdateold);
	},		
		
	treePanel_onAddButton: function(row, action) {
		
		var addNewDS = row.getRecord();
		var em_id=addNewDS.getValue('em.em_id');
		var category="";
		var coursename="";
		var startdate="";
		var startdateold=addNewDS.getValue('UC_certifications.start_date');
		var expirydate="";
		var courseid="";
		var renewdate="";
		var doc=addNewDS.getValue('UC_certifications.doc');
		var description="";
		var firstname=addNewDS.getValue('em.name_first');
		var lastname=addNewDS.getValue('em.name_last');
		var certnumber="";
		var certtype="";
		var statusNew=addNewDS.getValue('UC_certifications.status');
		
		this.addNewFormPanel.show(true, false);
		this.addNewFormPanel.showInWindow({
			x: 500,
			y: 150,		
			width: 500,
			height: 420,
			newRecord: true
        });
		
		this.addNewFormPanel.setFieldValue('UC_certifications.em_id', em_id);
		this.addNewFormPanel.setFieldValue('UC_courses.category_id', category);
		this.addNewFormPanel.setFieldValue('UC_certifications.course_name', coursename);
		this.addNewFormPanel.setFieldValue('UC_certifications.start_date', startdate);
		this.addNewFormPanel.setFieldValue('UC_certifications.expiry_date', expirydate);
		this.addNewFormPanel.setFieldValue('UC_certifications.course_id', courseid);
		this.addNewFormPanel.setFieldValue('UC_certifications.date_renew', renewdate);
		this.addNewFormPanel.setFieldValue('UC_certifications.doc', doc);
		this.addNewFormPanel.setFieldValue('UC_certifications.description', description);
		this.addNewFormPanel.setFieldValue('em.name_first', firstname);
		this.addNewFormPanel.setFieldValue('em.name_last', lastname);
		this.addNewFormPanel.setFieldValue('UC_certifications.cert_number', certnumber);																		
		this.addNewFormPanel.setFieldValue('UC_certifications.type', certtype);
		this.addNewFormPanel.setFieldValue('UC_certifications.status', statusNew);
	
		startdateold=(startdateold.getMonth() + 1) + '/' + startdateold.getDate() + '/' +  startdateold.getFullYear();
		this.addNewFormPanel.setFieldValue('start_date_old', startdateold);
	},
	
	renewalFormPanel_onSubmit: function() {
			
		var renewalForm = this.renewalFormPanel;
		var activeGridPanel = View.panels.get("detailsPanelNorth");
			
		var dataSource = View.dataSources.get(View.panels.get('renewalFormPanel').dataSourceId);		
		var dataSourceOld = View.dataSources.get(View.panels.get('detailsPanelNorth').dataSourceId);
				
		var em_id = this.renewalFormPanel.getFieldValue('UC_certifications.em_id');
		var category = this.renewalFormPanel.getFieldValue('UC_courses.category_id');
		var coursename = this.renewalFormPanel.getFieldValue('UC_certifications.course_name');
		var startdate = this.renewalFormPanel.getFieldValue('UC_certifications.start_date');
		var expirydate = this.renewalFormPanel.getFieldValue('UC_certifications.expiry_date');
		var courseid = this.renewalFormPanel.getFieldValue('UC_certifications.course_id');
		var renewdate = this.renewalFormPanel.getFieldValue('UC_certifications.date_renew');
		var doc = ""; //this.renewalFormPanel.getFieldValue('UC_certifications.doc');
		var description = this.renewalFormPanel.getFieldValue('UC_certifications.description');
		var firstname = this.renewalFormPanel.getFieldValue('em.name_first');
		var lastname = this.renewalFormPanel.getFieldValue('em.name_last');
		var certnumber = this.renewalFormPanel.getFieldValue('UC_certifications.cert_number');																		
		var certtype = this.renewalFormPanel.getFieldValue('UC_certifications.type');
		var statusNew = this.renewalFormPanel.getFieldValue('UC_certifications.status');
				
		var startDateOld = this.renewalFormPanel.getFieldValue('start_date_old');
			
		var statusOld = "R";
		
		if(startdate == ""){
			View.showMessage("Please Enter a Start Date before saving");
		}
		else if(expirydate != "" && expirydate != null && expirydate <= startdate){
			View.showMessage("Expiry Date should be greater then Start Date");
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
					updateRecord.setValue('UC_certifications.start_date',startDateOld);
					updateRecord.setValue('UC_certifications.status',statusOld);
					
					updateRecord.oldValues = {};
					updateRecord.oldValues["UC_certifications.em_id"]  = em_id;
					updateRecord.oldValues["UC_certifications.course_id"]  = courseid;
					updateRecord.oldValues["UC_certifications.start_date"]  = startDateOld;
					
															
					dataSource.saveRecord(insertRecord);
					dataSourceOld.saveRecord(updateRecord);
				}
			catch (e) {
				Workflow.handleError(e);
			}
			
			activeGridPanel.refresh();
			this.renewalFormPanel.closeWindow();			
		}
	},
	
	renewalExpFormPanel_onSubmit: function() {	
		
		var renewalForm = this.renewalFormPanel;
		var activeGridPanel2 = View.panels.get("detailsPanelNorth");
		var expiredGridPanel = View.panels.get("detailsPanelCenter");
			
		var dataSource = View.dataSources.get(View.panels.get('renewalExpFormPanel').dataSourceId);		
		var dataSourceOld = View.dataSources.get(View.panels.get('detailsPanelCenter').dataSourceId);
				
		var em_id = this.renewalExpFormPanel.getFieldValue('UC_certifications.em_id');
		var category = this.renewalExpFormPanel.getFieldValue('UC_courses.category_id');
		var coursename = this.renewalExpFormPanel.getFieldValue('UC_certifications.course_name');
		var startdate = this.renewalExpFormPanel.getFieldValue('UC_certifications.start_date');
		var expirydate = this.renewalExpFormPanel.getFieldValue('UC_certifications.expiry_date');
		var courseid = this.renewalExpFormPanel.getFieldValue('UC_certifications.course_id');
		var renewdate = this.renewalExpFormPanel.getFieldValue('UC_certifications.date_renew');
		var doc = ""; //this.renewalFormPanel.getFieldValue('UC_certifications.doc');
		var description = this.renewalExpFormPanel.getFieldValue('UC_certifications.description');
		var firstname = this.renewalExpFormPanel.getFieldValue('em.name_first');
		var lastname = this.renewalExpFormPanel.getFieldValue('em.name_last');
		var certnumber = this.renewalExpFormPanel.getFieldValue('UC_certifications.cert_number');																		
		var certtype = this.renewalExpFormPanel.getFieldValue('UC_certifications.type');
		var statusNew = "A"; //this.renewalExpFormPanel.getFieldValue('UC_certifications.status');
				
		var startDateOld = this.renewalExpFormPanel.getFieldValue('start_date_old');
			
		var statusOld = "R";
		
		if(startdate == ""){
			View.showMessage("Please Enter a Start Date before saving");
		}
		else if(expirydate != "" && expirydate != null && expirydate <= startdate){
			View.showMessage("Expiry Date should be greater then Start Date");
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
					updateRecord.setValue('UC_certifications.start_date',startDateOld);
					updateRecord.setValue('UC_certifications.status',statusOld);
					
					updateRecord.oldValues = {};
					updateRecord.oldValues["UC_certifications.em_id"]  = em_id;
					updateRecord.oldValues["UC_certifications.course_id"]  = courseid;
					updateRecord.oldValues["UC_certifications.start_date"]  = startDateOld;
					
															
					dataSource.saveRecord(insertRecord);
					dataSourceOld.saveRecord(updateRecord);
				}
			catch (e) {
				Workflow.handleError(e);
			}
			
			activeGridPanel2.refresh();
			expiredGridPanel.refresh();
			this.renewalExpFormPanel.closeWindow();			
		}
	},
	
	certifyFormPanel_onSubmit: function() {	
		
		var certifyForm = this.certifyFormPanel;
		var activeGridPanel3 = View.panels.get("detailsPanelNorth");
		var expiredGridPanel2 = View.panels.get("detailsPanelCenter");
		var certifyGridPanel = View.panels.get("detailsPanelSouth");
			
		var dataSource = View.dataSources.get(View.panels.get('certifyFormPanel').dataSourceId);		
				
		var em_id = this.certifyFormPanel.getFieldValue('UC_certifications.em_id');
		var category = this.certifyFormPanel.getFieldValue('UC_courses.category_id');
		var coursename = this.certifyFormPanel.getFieldValue('UC_certifications.course_name');
		var startdate = this.certifyFormPanel.getFieldValue('UC_certifications.start_date');
		var expirydate = this.certifyFormPanel.getFieldValue('UC_certifications.expiry_date');
		var courseid = this.certifyFormPanel.getFieldValue('UC_certifications.course_id');
		var renewdate = this.certifyFormPanel.getFieldValue('UC_certifications.date_renew');
		var doc = ""; //this.certifyFormPanel.getFieldValue('UC_certifications.doc');
		var description = this.certifyFormPanel.getFieldValue('UC_certifications.description');
		var firstname = this.certifyFormPanel.getFieldValue('em.name_first');
		var lastname = this.certifyFormPanel.getFieldValue('em.name_last');
		var certnumber = this.certifyFormPanel.getFieldValue('UC_certifications.cert_number');																		
		var certtype = this.certifyFormPanel.getFieldValue('UC_certifications.type');
		var statusNew = "A"; //this.certifyFormPanel.getFieldValue('UC_certifications.status');
				
		
		if(startdate == ""){
			View.showMessage("Please Enter a Start Date before saving");
		}
		else if(expirydate != "" && expirydate != null && expirydate <= startdate){
			View.showMessage("Expiry Date should be greater then Start Date");
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
									
					dataSource.saveRecord(insertRecord);					
				}
			catch (e) {
				Workflow.handleError(e);
			}
			
			activeGridPanel3.refresh();
			expiredGridPanel2.refresh();
			certifyGridPanel.refresh();
			
			this.certifyFormPanel.closeWindow();			
		}
	},
	
	addNewFormPanel_onSubmit: function() {	
		
		var addForm = this.addNewFormPanel;
		var activeGridPanel2 = View.panels.get("detailsPanelNorth");
					
		var dataSource = View.dataSources.get(View.panels.get('addNewFormPanel').dataSourceId);		
						
		var em_id = this.addNewFormPanel.getFieldValue('UC_certifications.em_id');
		var category = this.addNewFormPanel.getFieldValue('UC_courses.category_id');
		var coursename = this.addNewFormPanel.getFieldValue('UC_certifications.course_name');
		var startdate = this.addNewFormPanel.getFieldValue('UC_certifications.start_date');
		var expirydate = this.addNewFormPanel.getFieldValue('UC_certifications.expiry_date');
		var courseid = this.addNewFormPanel.getFieldValue('UC_certifications.course_id');
		var renewdate = this.addNewFormPanel.getFieldValue('UC_certifications.date_renew');
		var doc = ""; 
		var description = this.addNewFormPanel.getFieldValue('UC_certifications.description');
		var firstname = this.addNewFormPanel.getFieldValue('em.name_first');
		var lastname = this.addNewFormPanel.getFieldValue('em.name_last');
		var certnumber = this.addNewFormPanel.getFieldValue('UC_certifications.cert_number');																		
		var certtype = this.addNewFormPanel.getFieldValue('UC_certifications.type');
		var statusNew = "A"; 
		
		var course_idcheck = '';
				
		if(startdate == ""){
			View.showMessage("Please Enter a Start Date before saving");
		}
		else if(expirydate != "" && expirydate != null && expirydate <= startdate){
			View.showMessage("Expiry Date should be greater then Start Date");
		}			
		else{
			
			try {				
					
					var insertRecord = new Ab.data.Record();
										
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
					
					var checkRecords = UC.Data.getDataRecords('UC_certifications', ['course_id'], "em_id='" + em_id + "' and course_id='" + courseid + "'");
					//var blId = UC.Data.getDataRecord('eq', 'bl_id', "eq_id='"+eqId.replace(/'/g, "''")+"'");

					if (!checkRecords.length) {
						//course_idcheck = checkRecords[0]['UC_certifications.course_id'];						
						
						//if (course_idcheck == null)
						
						dataSource.saveRecord(insertRecord);					
					}
					else {
						View.showMessage("A record for Course ID: " + courseid + " already exists for this user, please use the Renew option instead");
					}
					
				}
			catch (e) {
				Workflow.handleError(e);
			}
			
			this.addNewFormPanel.closeWindow();			
			
			if(activeGridPanel2.visible){
				activeGridPanel2.refresh();	
			}				
		}
	},
	
    onChangeCourseId: function()
	{
		var restriction = new Ab.view.Restriction();
		var theCourse = this.addNewFormPanel.getFieldValue("UC_certifications.course_id");
		if (theCourse == '')
			 this.addNewFormPanel.setFieldValue("UC_certifications.course_name", "");
		restriction.addClause('UC_certifications.course_id',theCourse,'=');
		var ds = View.dataSources.get(View.panels.get('addNewFormPanel').dataSourceId);
		var record =  ds.processOutboundRecord(ds.getRecord(restriction));
		var theCategory = record.getValue('UC_courses.category_id');
		//var theType = record.getValue('UC_courses.type');
		var theName = record.getValue('UC_courses.course_name');
		if (theCategory == null)
		   theCategory = '';
		//if (theType == null)
		   //theType = '';
		if (theName == null)
		   theName = '';

		this.addNewFormPanel.setFieldValue("UC_certifications.course_name", theName);
		this.addNewFormPanel.setFieldValue("UC_courses.course_name", theName);
		this.addNewFormPanel.setFieldValue("UC_courses.category_id", theCategory);
		//this.addNewFormPanel.setFieldValue("UC_courses.type", theType);
    },
   
	onChangeCourseName: function()
    {
	    var theName = this.addNewFormPanel.getFieldValue("UC_certifications.course_name");
	    this.addNewFormPanel.setFieldValue("UC_courses.course_name", theName);
    },
	
	onChangeCategory: function(t) //clear course_id
	{
		this.addNewFormPanel.setFieldValue("UC_certifications.course_id", "");
		this.addNewFormPanel.setFieldValue("UC_certifications.course_name", "");
		if (this.addNewFormPanel.getFieldValue("UC_courses.course_id", "") != "") {
			this.disableDetailsPanelField ("UC_certifications.course_name"); 
		}
		else {
			this.enableDetailsPanelField ("UC_certifications.course_name"); 
		}
		if (t==1) { this.addNewFormPanel.setFieldValue("UC_courses.type", "-");}
	},
   
	selectCourses: function(commandObject)
	{
		var theRest = "UC_courses.status='A' and exists (select 1 from uc_course_categories c where c.category_id=uc_courses.category_id and c.status='A')";
		var theCat = this.addNewFormPanel.getFieldValue ("UC_courses.category_id");
		var theType = this.addNewFormPanel.getFieldValue ("UC_courses.type");
		if (theCat != '') {theRest = theRest + " and rtrim(UC_courses.category_id) = "+ makeLiteralOrNull(theCat);}
		if (theType != '-') {theRest = theRest + " and rtrim(UC_courses.type) = "+ makeLiteralOrNull(theType);}
		   
		var form = commandObject.getParentPanel();
		View.selectValue(form.id, 'Courses',['UC_certifications.course_id','UC_courses.category_id', 'UC_courses.type', 'UC_certifications.course_name', 'UC_courses.course_name'], 
						  'UC_courses', [ 'UC_courses.course_id',  'UC_courses.category_id', 'UC_courses.type', 'UC_courses.course_name', 'UC_courses.course_name'], 
						  ['UC_courses.course_id',  'UC_courses.category_id', 'UC_courses.type', 'UC_courses.course_name'],
						  theRest, this.updateCourseName(), false);   
	},
		
    updateCourseName: function()
	{
		abCoursesByEm.disableDetailsPanelField ("UC_courses.course_name");  
		abCoursesByEm.disableDetailsPanelField ("UC_certifications.course_name");  
	},
	
	enableDetailsPanelField: function(theFieldName)
	{
		var targetPanel = View.panels.get("addNewFormPanel");
		var theField = targetPanel.getFieldElement (theFieldName);
		if (theField != null)
			theField.disabled=false;
	},
	
	disableDetailsPanelField: function(theFieldName)
	{
		var targetPanel = View.panels.get("addNewFormPanel");
		var theField = targetPanel.getFieldElement (theFieldName);
		if (theField != null)
			theField.disabled=true;
	},
	
	selectCategory: function(commandObject)
	{
		var theRest = "UC_course_categories.status='A'";
	
		var form = commandObject.getParentPanel();
		View.selectValue(form.id, 'Categories',['UC_courses.category_id'], 
					   'UC_course_categories', [ 'UC_course_categories.category_id'], 
					  ['UC_course_categories.category_id', 'UC_course_categories.category_name', 'UC_course_categories.description'],
					  theRest, this.onChangeCategory(1), false);   
	},	
	
	detailsPanelCenter_onViewHistory: function(row)
	{
	
	  var record = row.getRecord();
	   
	  var targetCourse = record.getValue("UC_certifications.course_id");
	  var targetEmId = record.getValue("UC_certifications.em_id");
	  
	  var theRest = "UC_certifications.em_id = " + makeLiteralOrNull(targetEmId);
	  if (targetCourse != null)
	      theRest += " and UC_certifications.course_id = "+makeLiteralOrNull(targetCourse);
	  
	  View.openDialog('brg-certification-history.axvw', theRest , false, {
        width: '950',
        height: '950',
        closeButton: true,
		maximize: false
		});
	},
	detailsPanelNorth_onButton1: function(row){
		openBrgAddEmMultiple(row)
	},
	detailsPanelCenter_onButton2: function(row){
		openBrgAddEmMultiple(row)
	},
	detailsPanelSouth_onButton2: function(row){
		var rows = []
		rows.push(row)
		openBrgAddEmMultiple(rows,true)
	}
});

function openAddEmMultiple() {
	View.openDialog("brg-add-em-single-new.axvw", '', false, {
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
				 View.panels.get("treePanel").refresh();
			}
		//}
		
	});
}
function openBrgAddEmMultiple(row,pos) {
	
	var detailsPanelRest
	if (!pos) {
		var rec = row.record
		detailsPanelRest = "UC_certifications.course_id"+makeLiteralOrNull(rec["UC_certifications.course_id"],"=")
		detailsPanelRest +=" and UC_certifications.start_date"+makeLiteralOrNull(rec["UC_certifications.start_date.raw"],"=")
		detailsPanelRest +=" and UC_certifications.em_id"+makeLiteralOrNull(rec["UC_certifications.em_id"],"=")
	}

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
			var detailPanelS = View.panels.get("detailsPanelSouth");
			var detailPanelC = View.panels.get("detailsPanelCenter");
			detailPanelN.refresh();
			detailPanelC.refresh();
			detailPanelS.refresh();
			View.panels.get("treePanel").refresh();
		}
		
	});
}
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

