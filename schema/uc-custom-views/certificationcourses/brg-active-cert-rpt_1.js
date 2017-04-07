// CHANGE LOG:
// 2015/12/01 - MSHUSSAI - updated the selectEm function to restrict Status=A for active employees

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
	View.openDialog("brg-add-em-multiple.axvw", '', false, {
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