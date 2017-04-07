// CHANGE LOG:
// 2015/12/01 - MSHUSSAI - updated the selectEm function to restrict Status=A for active employees
// 2015/06/07 - MSHUSSAI - Modified major parts of code to reflect the following changes:
//					     - Added a Status for each certification, possible values are (A-Active, R-Renewed, E-Expired 
//						 - Developed a new screen to Renew a Certification since the existing one had functionality which was confusing and not so user friendly
//						 - Added a 'Renew' button for each certification per employees
//						 - Removed the 'Edit' button for each certification 

var brgActiveCertRptController = View.createController('brgActiveCertRpt',{
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
		this.certGrid.afterCreateCellContent = this.renderReportGrid;
		
		var dtTypeSpan = $("dtTypeSpan");
		dtTypeSpan.innerHTML = '<select id="dtTypeDL" onchange="dtFldChange()">' +
            '<option value="ct.date_renew" label="Certifications Up For Renewal">Renew From Date</option>' +
            '<option value="ct.start_date" label="Certifications - Start Date">Start From Date</option>' +
            '<option value="ct.expiry_date" label="Certifications - Expiry Date">Expiry From Date</option>' +
            '<option value="" label="Certifications Not Expiring">No Expiry</option>' +
            '</select>'

	},
	renderReportGrid: function (row, col, cellElement) {
		if (col.id == "UC_certifications.date_renew") {
			var value = +row['UC_certifications.daysToRenew'];
			if (value == "") {
			}
			else if (value<= 7) {
				cellElement.style.backgroundColor = "salmon";
			}
			else if (value<= 14) {
				cellElement.style.backgroundColor = "yellow";
			}
			else if (value<= 28) {
				cellElement.style.backgroundColor = "lightgreen";
			}
		}
	},
	checkCourseAdminGroup: function() {
		if (!View.user.isMemberOfGroup('COURSE-ADMIN')) {

			this.certGrid.addParameter("adminRest",  "exists (select 1 from em where em.em_id=UC_certifications.em_id and " + makeLiteralOrNull(View.user.employee_id) + " in (em.em_id,em.reports_to) )");
		}
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

   afterInitialDataFetch: function(){
		var d = new Date();
		var day = d.getDate();
		var mnth = d.getMonth()+1;
		var yr = d.getFullYear();
		var fromDt = mnth+'/'+day+'/'+yr;
		d = new Date( yr+'/'+mnth+'/01');
		d.setMonth(d.getMonth()+4);
		d.setDate(d.getDate()-1);
		day = d.getDate();
		mnth = d.getMonth()+1;
		yr = d.getFullYear();
		var toDt = mnth+'/'+day+'/'+yr;

		this.console.setFieldValue("UC_certifications.start_date", fromDt);
		this.console.setFieldValue("UC_certifications.date_renew", toDt);

   },

   certGrid_onRenewButton1: function(row, action) {
		
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
	
	renewalFormPanel_onSubmit: function() {
	
		//var renewalDSOld = row.getRecord();
		var renewalForm = this.renewalFormPanel;
		var gridPanel2 = View.panels.get("certGrid");
		//var dataSource = View.dataSources.get("dispatcher_add_ds13");		
		var dataSource = View.dataSources.get(View.panels.get('renewalFormPanel').dataSourceId);		
		var dataSourceOld = View.dataSources.get(View.panels.get('certGrid').dataSourceId);
		//var selectedRecords = consolePanel.getSelectedRecords();
		
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
		
		//var startdateOld = gridPanel2.getValue('UC_certifications.start_date');
		var startDateOld = this.renewalFormPanel.getFieldValue('start_date_old');
			
		//var emIdOld = this.renewalFormPanel.getFieldValue('UC_certifications.em_id');
		//var courseIdOld = this.renewalFormPanel.getFieldValue('UC_certifications.course_id');
		//var startDateOld = "2013-09-25";
		var statusOld = "R";
		
		if(startdate == ""){
			View.showMessage("Please Enter a Start Date before saving");
		}
		else if(expirydate != "" && expirydate != null && expirydate <= startdate){
			View.showMessage("Expiry Date should be greater then Start Date");
		}			
		else{
			//View.openProgressBar("Course Renewal in Progress");
			
			try {				
					//var wr_id = selectedRecords[i].getValue("wr.wr_id");
					
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
			
			//View.closeProgressBar();
			
			gridPanel2.refresh();
			this.renewalFormPanel.closeWindow();
			
			//View.showMessage(i + " Work Request(s) have been dispatched to: " + CCCUser);
		}
	},
	
   	console_onFilter: function(){

		var dtFld = document.getElementById("dtTypeDL");
		if (dtFld.value == "") {
			this.certGrid.addParameter("todt", " and ct.expiry_date is null");
			this.certGrid.addParameter("fromdt","");
		}
		else {
			var fromDt = this.console.getFieldValue("UC_certifications.start_date");
			var toDt = this.console.getFieldValue("UC_certifications.date_renew");
			if (fromDt == '' || toDt == "") {
				View.showMessage("Please fill in a Start and End date range")
				return;
			}
			this.certGrid.addParameter("fromdt"," and " + dtFld.value + " >= " +  makeLiteralOrNull(fromDt));
			this.certGrid.addParameter("todt"," and " + dtFld.value + " <= " +  makeLiteralOrNull(toDt));


		}

		this.certGrid.addParameter("filterCert", "");
		var certRest = "";

		var val = this.console.getFieldValue("UC_courses.type");
		if (val != '') {
			certRest += " and isnull(ct.type,'Misc') = " + makeLiteralOrNull(val);
		}
		var val = this.console.getFieldValue("UC_courses.category_id");
		if (val != '') {
			certRest += " and ct.category_id like " + makeLiteralOrNull(val);
		}
		val = this.console.getFieldValue("UC_certifications.course_name");
		if (val != '') {
			certRest += " and ct.course_name like " + makeLiteralOrNull(val);
		}
		val = this.console.getFieldValue("UC_certifications.course_id");
		if (val != '') {
			certRest += " and ct.course_id like " + makeLiteralOrNull(val);
		}
		val = this.console.getFieldValue("UC_certifications.cert_number");
		if (val != '') {
			certRest += " and ct.cert_number like " + makeLiteralOrNull(val);
		}
		val = this.console.getFieldValue("UC_certifications.description");
		if (val != '') {
			certRest += " and ct.description like " + makeLiteralOrNull('%' + val + '%');
		}


		val = this.console.getFieldValue("UC_certifications.em_id");
		if (val != '') {
			certRest += " and ct.em_id like " + makeLiteralOrNull(val);
		}

		if (certRest != '') {
			this.certGrid.addParameter("filterCert",  certRest);
		}


		this.certGrid.refresh();
		this.certGrid.setTitle(dtFld.options[dtFld.selectedIndex].title)



	},
   certGrid_onButton1: function(row){
		openBrgAddEmMultiple(row)
	}


});
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

function openBrgAddEmMultiple(row) {
	var rec = row.record
	var detailsPanelRest = "UC_certifications.course_id"+makeLiteralOrNull(rec["UC_certifications.course_id"],"=")
	detailsPanelRest +=" and UC_certifications.start_date"+makeLiteralOrNull(rec["UC_certifications.start_date.raw"],"=")
	detailsPanelRest +=" and UC_certifications.em_id"+makeLiteralOrNull(rec["UC_certifications.em_id"],"=")


	//View.openDialog("brg-cert-edit.axvw", '', false, {
	View.openDialog("brg-renew-em-single.axvw", '', false, {
		width: 800,
		height: 700,
		closeButton: true,
		maximize: false,
		afterViewLoad: function(dialogView) {
			var controller = dialogView.controllers.get('theController');
			controller.detailsPanel.newRecord=false;
			controller.detailsPanel.refresh(detailsPanelRest);
		},
		callback: function() {
			View.panels.get("certGrid").refresh();
		}

	});
}

function dtFldChange(){
	var dtFld = document.getElementById("dtTypeDL").value;
	var display = "";
	if (dtFld == "") {display = "none";}
	var pnl = View.panels.get("console");
	pnl.getFieldElement("UC_certifications.start_date").parentElement.style.display = display;

	//pnl.showField("UC_certifications.start_date",dtFld != "");
	pnl.showField("UC_certifications.date_renew",dtFld != "");
}