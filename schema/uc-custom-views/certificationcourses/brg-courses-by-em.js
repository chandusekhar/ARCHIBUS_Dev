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
		var rest = "exists (select 1 from UC_certifications c where c.em_id=em.em_id)";
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

