var courseAdminFlag = false;
var docRow
var refreshdt2 = false;
//var origCourseId;
//var origStartDate;
//var origExpiryDate;

var theController = View.createController('theController',{
	openerRec:null,
   afterViewLoad: function(){
		this.docPanel.restriction="1=2"
		this.docPanel.show(false,true)
		this.formSelectValueMultiple_grid.show(false,true)
		//this.treePanelActive.restriction = "UC_certifications.expiry_date is null or UC_certifications.expiry_date >= getdate()";
		//this.setLabel();
		// this.treePanelExpired.restriction = " certifications.expiry_date < getdate() and certifications.course_id not in (select course_id from certifications where certifications.expiry_date is null or certifications.expiry_date >= getdate()) ";
		this.checkCourseAdminGroup();
		
		var newOptionElement = document.createElement('option');
		newOptionElement.text = " ";
		newOptionElement.value = "-";
		
		var selectBox = $("detailsPanel_UC_courses.type")
  
	
   
		try {
		  selectBox.add(newOptionElement, selectBox.options[0]); // standards compliant, not IE.
		}
		catch (ex) {
		  selectBox.add(newOptionElement, 0);  // IE only.
		}
		//this.detailsPanel.defaultRecord.setValue('UC_courses.type','-')
		this.detailsPanel.fields.get('UC_certifications.doc').dom.parentElement.parentElement.style.display='none'
		
		
   },
   
  
   
   
   	checkCourseAdminGroup: function() {
	
		
		if (View.user.isMemberOfGroup('COURSE-ADMIN')) {
			courseAdminFlag = true;
		} else {
			courseAdminFlag = false;
		}
	},
	
	afterInitialDataFetch: function() {
		this.detailsPanel.actions.get("renew").setTitle( this.detailsPanel.actions.get("renew").config.text)
		if (courseAdminFlag == true) {
			//this.formSelectValueMultiple_grid.refresh();
			
		} else {
			var rest = makeLiteralOrNull(View.user.employee.id) + " in (reports_to,em_id)";
			this.formSelectValueMultiple_grid.restriction=rest;
		}
		
		if (this.openerRec){
			this.detailsPanel.setFieldValue("UC_certifications.course_id",this.openerRec[0].record["UC_courses.course_id"])			
			this.detailsPanel.setFieldValue("UC_certifications.em_id",this.openerRec[0].record["UC_certifications.em_id.key"])				
			this.detailsPanel.setFieldValue("UC_courses.type",this.openerRec[0].record["UC_courses.type"])			
			this.detailsPanel.setFieldValue("UC_courses.category_id",this.openerRec[0].record["UC_courses.category_id"])			
			this.detailsPanel.setFieldValue("UC_certifications.course_name",this.openerRec[0].record["UC_courses.course_name"])			
			this.detailsPanel.setFieldValue("UC_courses.course_name",this.openerRec[0].record["UC_courses.course_name"])		
		
		
		
			var rest = "em.em_id in (''"
			for (var x=0;x<this.openerRec.length;x++){
				rest += "," + makeLiteralOrNull(this.openerRec[x].record["UC_certifications.em_id.key"])
			}
			//add the employee to the grid
			var parameters = {
				tableName: 'em',
				fieldNames: toJSON(['em.em_id','em.name_last','em.name_first']),
				restriction: rest + ")" 
			};
			
			var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
			if (result.code == 'executed' && result.data != "undefined" && result.data.records[0]){
				var record = result.data.records
				var grid = View.panels.get("detailsPanel2");
				for (var x=0;x<record.length;x++){ 
				
					var selectedEm = new Ab.data.Record();
					selectedEm.setValue("em.em_id", record[x]['em.em_id']);
					selectedEm.setValue("em.name_first", record[x]['em.name_first']);
					selectedEm.setValue("em.name_last", record[x]['em.name_last']);
					selectedEm.setValue("em.emstartdate", '');
					selectedEm.setValue("em.emcourse_id", '');
					selectedEm.setValue("em.emdoc", '');
					grid.addGridRow(selectedEm);
				}
				grid.update();
			}
		}
		
		
   },
   detailsPanel_onNewSave: function(){
		if (this.savedt(true)){
			this.detailsPanel_onNew()
		}
		
   },
     detailsPanel_onNew: function(){
		this.detailsPanel.newRecord = true
		this.detailsPanel2.newRecord=true
		this.detailsPanel.refresh();
		this.detailsPanel2.refresh("1=2");
   },
   detailsPanel_afterRefresh: function(){
		var target = this.detailsPanel.getFieldValue("UC_courses.course_name");
		 if (target != '' && target != null){
		   this.detailsPanel.setFieldValue ("UC_certifications.course_name", target);
		   this.disableDetailsPanelField ("UC_certifications.course_name");   
		 }
		 else{
			this.enableDetailsPanelField ("UC_certifications.course_name"); 
		}
		 var theName = this.detailsPanel.getFieldValue("UC_certifications.course_name");
		 if (theName != null && theName != ''){
			 this.detailsPanel.setFieldValue("UC_courses.course_name", theName);	
		 }	
		 
		var rest = "c.course_id=" + makeLiteralOrNull(this.detailsPanel.getFieldValue("UC_certifications.course_id")) + " and c.start_date=" + makeLiteralOrNull(this.detailsPanel.getFieldValue("UC_certifications.start_date"))
		this.detailsPanel2.addParameter("paramCourse", rest);

		if (!this.detailsPanel.newRecord){
				rest +=" and c.date_renew"+makeLiteralOrNull(this.detailsPanel.getFieldValue("UC_certifications.date_renew"),"=")
				rest +=" and c.course_name"+makeLiteralOrNull(this.detailsPanel.getFieldValue("UC_certifications.course_name"),"=")
				rest +=" and c.cert_number"+makeLiteralOrNull(this.detailsPanel.getFieldValue("UC_certifications.cert_number"),"=")
				rest +=" and c.description"+makeLiteralOrNull(this.detailsPanel.getFieldValue("UC_certifications.description"),"=")
				
				rest +=" and c.expiry_date"+makeLiteralOrNull(this.detailsPanel.getFieldValue("UC_certifications.expiry_date"),"=")
				//var rest = "exists (select 1 from UC_certifications c where c.em_id=em.em_id and u.course_id="+makeLiteralOrNull(courseId)+" and u.start_date="+makeLiteralOrNull(startDate)+" and u.expiry_date"+expiryDate+")";
				 rest = "exists (select 1 from UC_certifications c where c.em_id=em.em_id and " + rest
				 rest += " and exists (select 1 from UC_certifications m where m.em_id=c.em_id and m.course_id=c.course_id having max(isnull(m.expiry_date,m.start_date + 100000)) = isnull(c.expiry_date,c.start_date + 100000))"
				rest += ")";
			
				
				if (courseAdminFlag != true) {rest +=   " and " + makeLiteralOrNull(View.user.employee.id) + " in (reports_to,em_id)"}
		}
		else {
			rest = "1=2"
		}

		this.detailsPanel2.restriction=rest;
		this.detailsPanel2.actions.get('delete').show(rest !="1=2")
		
		
	
		this.detailsPanel.actions.get('renew').show(rest !="1=2" && View.parameters != null)
		
		if (this.detailsPanel.getFieldValue("UC_certifications.course_id") == ""){
			
			this.detailsPanel.setFieldValue("UC_courses.type", "-")
		}
		this.removeError();
		docRow = null;
		if (this.detailsPanel.newRecord || View.parameters == null ) {
			this.detailsPanel.actions.get('newSave').show(true)
		}
		if (refreshdt2) {
			refreshdt2=false;
			this.detailsPanel2.refresh(rest)
		}
   },
   docPanel_afterRefresh: function() {
	if (docRow != null && this.docPanel.restriction!="1=2") {
		var emid = this.docPanel.gridRows.items[0].record['UC_certifications.em_id']
		var doc = this.docPanel.gridRows.items[0].record['UC_certifications.doc']
		var grid =this.detailsPanel2;
		var row = grid.gridRows.items[docRow]
		if (row) {
			if (row.getFieldValue("em.em_id") == emid) {
				//row.setFieldValue("em.emdoc",doc);
				row.record['em.emdoc']=doc;
				grid.update();
			}
		}
	
	}
	docRow = null;
	this.docPanel.restriction="1=2"
	this.docPanel.show(false,true);
   },
   
   
   disableDetailsPanelField: function(theFieldName){
     var targetPanel = View.panels.get("detailsPanel");
     var theField = targetPanel.getFieldElement (theFieldName);
	 if (theField != null)
	     theField.disabled=true;
   },
   
   enableDetailsPanelField: function(theFieldName){
     var targetPanel = View.panels.get("detailsPanel");
     var theField = targetPanel.getFieldElement (theFieldName);
	 if (theField != null)
	     theField.disabled=false;
   },
   
   treePanelExpired_afterRefresh: function(){
	 var targetColumn = "UC_certifications.course_id";
	 var theRows = this.treePanelExpired.gridRows.items;
   },
   
   detailsPanel_onRenew: function(){
		
		if (this.detailsPanel.actions.get("renew").button.text == this.detailsPanel.actions.get("renew").config.text){
			this.detailsPanel.newRecord=true
			this.detailsPanel2.newRecord=true
			this.detailsPanel.actions.get("renew").setTitle("Cancel " +  this.detailsPanel.actions.get("renew").config.text)
			 this.detailsPanel.setFieldValue('UC_certifications.start_date', '');
			 //enable start_date
			 this.enableDetailsPanelField ("UC_certifications.start_date");
			 this.detailsPanel.setFieldValue('UC_certifications.expiry_date', '');
			 this.detailsPanel.setFieldValue('UC_certifications.date_renew', '');
			 this.detailsPanel.setFieldValue('UC_certifications.cert_number', '');
			 this.detailsPanel.setFieldValue('UC_certifications.doc', '');
			 this.detailsPanel2.actions.get('delete').show(false);
			 this.detailsPanel.enableField('UC_certifications.start_date',true)	
			 this.detailsPanel2.update();
		}
		else {
			this.detailsPanel.newRecord=false
			this.detailsPanel2.newRecord=false
			this.detailsPanel.actions.get("renew").setTitle( this.detailsPanel.actions.get("renew").config.text)
			this.detailsPanel.enableField('UC_certifications.start_date',false)	
			this.detailsPanel.refresh()
			this.detailsPanel2.actions.get('delete').show(true)
			this.detailsPanel2.refresh()
		}
	},
	
	
	
   hideRenew: function(){
     var ren = this.detailsPanel.actions.get('renew');
	 ren.show(false);
	 
   },
   
   hideDetailFields: function(){
     this.disableDetailsPanelField ("UC_courses.category_id");
	 this.disableDetailsPanelField ("UC_courses.type");
	 this.disableDetailsPanelField ("UC_certifications.course_id");
	 this.disableDetailsPanelField ("UC_certifications.start_date");
	 try 
	 {
	   var theEl =  document.getElementById("detailsPanel.UC_courses.category_id_selectValue");
	 theEl.disabled= true;
	 theEl.hidden= true;
	 }
	 catch (e) {}
   },
   
   showDetailFields: function(){
     this.hideRenew();
	 
     //this.enableDetailsPanelField ("UC_courses.category_id");
	 //this.enableDetailsPanelField ("UC_courses.type");
	 //this.enableDetailsPanelField ("UC_certifications.course_id");
	 //this.enableDetailsPanelField ("UC_certifications.start_date");
	 try {
	   var theEl =  document.getElementById("detailsPanel.UC_courses.category_id_selectValue");
	   theEl.disabled= false;
	   theEl.hidden= false;
	 }
	 catch (e) {}
   },
   
   showRenew: function(){
     var ren = this.detailsPanel.actions.get('renew');
	 ren.show(true);
	 this.hideDetailFields();
   },
   
   applyNorthRestriction: function()
   {
      this.treePanelActive.refresh (" UC_certifications.expiry_date is null or UC_certifications.expiry_date >= getdate() ");
   },
   
   applyCenterRestriction: function()
   {
      this.treePanelExpired.refresh (" UC_certifications.expiry_date < getdate() and UC_certifications.course_id not in (select course_id from UC_certifications where UC_certifications.expiry_date is null or UC_certifications.expiry_date >= getdate()) ");
   },
   
   selectCourses: function(commandObject)
   {
    var theRest = "UC_courses.status='A' and exists (select 1 from uc_course_categories c where c.category_id=uc_courses.category_id and c.status='A')";
	var theCat = this.detailsPanel.getFieldValue ("UC_courses.category_id");
	var theType = this.detailsPanel.getFieldValue ("UC_courses.type");
	if (theCat != '') {theRest = theRest + " and rtrim(UC_courses.category_id) = "+ makeLiteralOrNull(theCat);}
    if (theType != '-') {theRest = theRest + " and rtrim(UC_courses.type) = "+ makeLiteralOrNull(theType);}
	   
    var form = commandObject.getParentPanel();
	View.selectValue(form.id, 'Courses',['UC_certifications.course_id','UC_courses.category_id', 'UC_courses.type', 'UC_certifications.course_name', 'UC_courses.course_name'], 
	                  'UC_courses', [ 'UC_courses.course_id',  'UC_courses.category_id', 'UC_courses.type', 'UC_courses.course_name', 'UC_courses.course_name'], 
					  ['UC_courses.course_id',  'UC_courses.category_id', 'UC_courses.type', 'UC_courses.course_name'],
					  theRest, this.updateCourseName(), false);
   
   },
   selectCategory: function(commandObject){
    var theRest = "UC_course_categories.status='A'";
	
    var form = commandObject.getParentPanel();
	View.selectValue(form.id, 'Categories',['UC_courses.category_id'], 
	                  'UC_course_categories', [ 'UC_course_categories.category_id'], 
					  ['UC_course_categories.category_id', 'UC_course_categories.category_name', 'UC_course_categories.description'],
					  theRest, this.onChangeCategory(1), false);
   
   },
   updateCourseName: function()
   {
     theController.disableDetailsPanelField ("UC_courses.course_name");  
	 theController.disableDetailsPanelField ("UC_certifications.course_name");  
   },

   onChangeCategory: function(t) //clear course_id
   {
     this.detailsPanel.setFieldValue("UC_certifications.course_id", "");
	 this.detailsPanel.setFieldValue("UC_certifications.course_name", "");
	if (this.detailsPanel.getFieldValue("UC_courses.course_id", "") != "") {
		 this.disableDetailsPanelField ("UC_certifications.course_name"); 
	}
	else {
		this.enableDetailsPanelField ("UC_certifications.course_name"); 
	}
	 if (t==1) { this.detailsPanel.setFieldValue("UC_courses.type", "-");}
   },
   
   onChangeCourseId: function()
   {
    var restriction = new Ab.view.Restriction();
    var theCourse = this.detailsPanel.getFieldValue("UC_certifications.course_id");
	if (theCourse == '')
	  	 this.detailsPanel.setFieldValue("UC_certifications.course_name", "");
	restriction.addClause('UC_certifications.course_id',theCourse,'=');
	var ds = View.dataSources.get(View.panels.get('detailsPanel').dataSourceId);
	var record =  ds.processOutboundRecord(ds.getRecord(restriction));
	var theCategory = record.getValue('UC_courses.category_id');
    var theType = record.getValue('UC_courses.type');
	var theName = record.getValue('UC_courses.course_name');
	if (theCategory == null)
	   theCategory = '';
	if (theType == null)
	   theType = '';
	if (theName == null)
	   theName = '';

    this.detailsPanel.setFieldValue("UC_certifications.course_name", theName);
	this.detailsPanel.setFieldValue("UC_courses.course_name", theName);
	this.detailsPanel.setFieldValue("UC_courses.category_id", theCategory);
	this.detailsPanel.setFieldValue("UC_courses.type", theType);
   },
   
   onChangeCourseName: function()
   {
     var theName = this.detailsPanel.getFieldValue("UC_certifications.course_name");
	 this.detailsPanel.setFieldValue("UC_courses.course_name", theName);
   },
   
   	addEmToTA: function() {
		// select cost categories in the grid
		//this.formSelectValueMultiple_grid.refresh();
		//var values = $(ta).value;
		//this.emTextArea = ta;
		//this.setSelectedItems(this.formSelectValueMultiple_grid, 'em.em_in', values);
		var rest = "1=1";
		var grid = View.panels.get("detailsPanel2");
		//}
		for (var j = 0; j < grid.gridRows.length; j++) {
			var row = grid.gridRows.items[j];
			var emId = row.getFieldValue("em.em_id");
			rest = rest + " and em_id != "+makeLiteralOrNull(emId);
		}
		
		this.formSelectValueMultiple_grid.showInWindow({width: 600, height: 400});
		if (courseAdminFlag == true) {
			this.formSelectValueMultiple_grid.refresh(rest);
		} else {
			rest = makeLiteralOrNull(View.user.employee.id) + " in (reports_to,em_id)";
			this.formSelectValueMultiple_grid.refresh(rest);
		}
	},
	setSelectedItems: function (grid, fieldName, values) {
		// prepare the values map for fast indexing
		var valuesMap = {};
		var valuesArray = values.split(',');
		for (var i = 0; i < valuesArray.length; i++) {
			var value = valuesArray[i];
			valuesMap[value] = value;
		}
		// select rows
		grid.gridRows.each(function (row) {
			var value = row.getRecord().getValue(fieldName);
			// if we have this value in the list, select the row
			if (valueExists(valuesMap[value])) {
				row.select();
			}
		});
	},
	formSelectValueMultiple_grid_onAddSelected: function () {
		
		var rows = this.formSelectValueMultiple_grid.getSelectedGridRows();
		for(i=0; i<rows.length; i++){
			var row = rows[i];
			var emId =  row.getFieldValue('em.em_id')
			var selectedEm = new Ab.data.Record();
			selectedEm.setValue("em.em_id", emId);
			selectedEm.setValue("em.name_first", row.getFieldValue('em.name_first'));
			selectedEm.setValue("em.name_last", row.getFieldValue('em.name_last'));
			selectedEm.setValue("em.emstartdate", '');
			selectedEm.setValue("em.emcourse_id", '');
			selectedEm.setValue("em.emdoc", '');
			var grid = View.panels.get("detailsPanel2");
			grid.sortEnabled = false;
	
			// Find the existing grid row and remove it, if it exists
			var bFound = false;
			for (var j = 0; j < grid.gridRows.length && !bFound; j++) {
				var row = grid.gridRows.items[j];
				if (row.getFieldValue("em.em_id") == emId) {
					grid.removeGridRow(row.getIndex());
					bFound = true;
				}
			}

			grid.addGridRow(selectedEm);

			grid.update();
			docRow = null;
			this.docPanel.restriction="1=2"
			this.formSelectValueMultiple_grid.closeWindow();
			
		}
		
	
		
		
//		$(this.aEmTextArea).value = values;
		this.formSelectValueMultiple_grid.closeWindow();
	},
/*	getSelectedItems: function (grid, fieldName) {
		var values = '';
		
	
		grid.gridRows.each(function (row) {
			if (row.isSelected()) {
				var value = row.getRecord().getValue(fieldName);
				if (values != '') {
					values += ',';
				}
				values += value;
			}
		});
	
		return values;
	},*/
	deleteEmFromTA: function (deleteRec) {
		var grid = View.panels.get("detailsPanel2");
		var rows = grid.getSelectedGridRows();
		if (rows.length == 0) {
			View.showMessage('Please select at least one employee to Remove.');
			return false;
		}
		var refreshParent = false;
		
		for(i=rows.length - 1; i>-1; i--){
			var row = rows[i];
			if (!(row.getFieldValue("em.emcourse_id") == "" || typeof(row.getFieldValue("em.emcourse_id")) == "undefined") && deleteRec) {
				//delete record
				refreshParent = true
				try {
							AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-deleteDataRecords', {
								  'records': toJSON([{"UC_certifications.course_id" :row.getFieldValue("em.emcourse_id"),"UC_certifications.em_id" : row.getFieldValue("em.em_id"),"UC_certifications.start_date" : row.getFieldValue("em.emstartdate.raw")}]),
								  'tableName': 'UC_certifications',
								  'fieldNames': toJSON(['UC_certifications.course_id','UC_certifications.em_id','UC_certifications.start_date'])
							});
						}catch(e){
							alert(e.message);
						}
			}
			grid.removeGridRow(row.getIndex());
		}	
		/*for (var i = grid.gridRows.length-1; i >-1; i--) {
	
	
			var row = grid.gridRows.items[i];
			if (row.isSelected()) {
				if (!(row.getFieldValue("em.emcourse_id") == "" || typeof(row.getFieldValue("em.emcourse_id")) == "undefined") && deleteRec) {
				
					//delete record
					var grid = this.bdgPanel,i,j,
		
				}
				grid.removeGridRow(row.getIndex());
				
			}
		}
		*/
		grid.update();
		docRow = null;
		this.docPanel.restriction="1=2"
		if (refreshParent) {
			if (View.parameters != null) {View.parameters.callback();}
			this.showSaveMsg(this.detailsPanel,"Employee Certifications Deleted")
			//var result = {}
			//result.message = "Employee Certifications Deleted"
			//result.detailedMessage = "Employee Certifications Deleted"
			//this.detailsPanel.displayValidationResult(result)
			
			
		}
		//grid.refresh();
	},
	
	showSaveMsg:function(panel,msg){
		var D = Ext.DomHelper.overwrite(panel.getMessageCell(), "<p>" + (msg || "") + "</p>", true);
		D.addClass("formMessage");
		D.setVisible(true, { duration: 1 });
		D.setHeight(20, { duration: 1 });
		panel.dismissMessage.defer(3000, panel, [D]);
	},
 
	removeError:function(){
		Ext.get(this.detailsPanel.getFieldElement("UC_certifications.course_id")).parent().removeClass("formerrorinput");
		Ext.get(this.detailsPanel.getFieldElement("UC_certifications.start_date")).parent().removeClass("formerrorinput");
		Ext.get(this.detailsPanel.getFieldElement("UC_certifications.course_name")).parent().removeClass("formerrorinput");
	},
	detailsPanel2_onDelete: function() {
		if (confirm("This action will Permanently Delete the Selected Employees for this Certification record.  Do you want to continue?")){
			this.deleteEmFromTA(true)
		}
		
		
	},
	
	detailsPanel_onSave: function() {
		this.savedt(false);
	},
	savedt: function(newSave){
		var detailsPanel = View.panels.get("detailsPanel");
		var grid = View.panels.get("detailsPanel2");
		var ds = View.dataSources.get(View.panels.get('detailsPanel').dataSourceId);
		
		var courseId = detailsPanel.getFieldValue("UC_certifications.course_id");
		var startDate = detailsPanel.getFieldValue("UC_certifications.start_date");
		var expiryDate = detailsPanel.getFieldValue("UC_certifications.expiry_date");
		var certNumber = detailsPanel.getFieldValue("UC_certifications.cert_number");
		var dateRenew = detailsPanel.getFieldValue("UC_certifications.date_renew");
		//var doc = detailsPanel.getFieldValue("UC_certifications.doc");
		var description = detailsPanel.getFieldValue("UC_certifications.description");
		var courseName = this.detailsPanel.getFieldValue("UC_certifications.course_name");
		this.removeError();
		if (grid.gridRows.length == 0) {
			View.showMessage('Please select at least one employee for this certification.');
			return false;
		}
		var msg = "";
		if (courseId == '' ){
			Ext.get(detailsPanel.getFieldElement("UC_certifications.course_id")).parent().addClass("formerrorinput");
			msg = "Course ID";
		}
		if (startDate == '' ){
			Ext.get(detailsPanel.getFieldElement("UC_certifications.start_date")).parent().addClass("formerrorinput");
			if (msg != "") {msg += ", "}
			msg += "Start Date";
		}
		if (courseName == '' ){
			Ext.get(detailsPanel.getFieldElement("UC_certifications.course_name")).parent().addClass("formerrorinput");
			if (msg != "") {msg += ", "}
			msg += "Course Name";
		}
		if (msg != "") {
			View.showMessage('The following fields are required: ' + msg);
			return false;
		}
		var restrict1 = "" //new Ab.view.Restriction();
		for (var i = 0; i < grid.gridRows.length; i++) {
			var row = grid.gridRows.items[i];
			var emId = row.getFieldValue("em.em_id");
			var record = new Ab.data.Record({
				'UC_certifications.course_id': courseId,
				'UC_certifications.start_date': startDate,
				'UC_certifications.em_id': emId},
				true
			); // true means new record
			
			var restrict = "UC_certifications.course_id=" + makeLiteralOrNull(courseId) // new Ab.view.Restriction();
			restrict += " and UC_certifications.start_date=" + makeLiteralOrNull(startDate)	
			restrict += " and UC_certifications.em_id=" + makeLiteralOrNull( emId)
			//restrict.addClause('UC_certifications.course_id',  courseId, '=');
			//restrict.addClause('UC_certifications.start_date', startDate, '=');
			//restrict.addClause('UC_certifications.em_id', emId, '=');
			restrict1 = restrict
			
			if (!(row.getFieldValue("em.emcourse_id") == "" || typeof(row.getFieldValue("em.emcourse_id")) == "undefined" || this.detailsPanel.newRecord == true)) {
				record = ds.getRecord(restrict);
			}
			
			record.setValue('UC_certifications.expiry_date', expiryDate);
			record.setValue('UC_certifications.cert_number', certNumber);
			record.setValue('UC_certifications.date_renew', dateRenew);
			record.setValue('UC_certifications.course_name', courseName);
			record.setValue('UC_certifications.description', description);
			
			detailsPanel.setRecord(record);
			try {
				ds.saveRecord(record);
				
			} 
			catch (e) {
				var message = getMessage('errorSave');
				View.showMessage('error', message, e.message, e.data);
				return false;
			}
			
			
		}
		if (!newSave) {
			refreshdt2 = true;
			this.detailsPanel2.newRecord=false;
			if (this.detailsPanel.newRecord == true) {
				this.detailsPanel.newRecord=false;
				this.detailsPanel.refresh(restrict1);
				this.detailsPanel.actions.get('renew').show(false);
			}
			else {
				this.detailsPanel.refresh()
			}
		}
		//this.detailsPanel2.refresh()
		
		if (View.parameters != null) {View.parameters.callback();}
		this.showSaveMsg(this.detailsPanel,"Employee Certifications Saved")
		
		return true
		//var result = {}
		//result.message = "Employee Certifications Saved"
		//result.detailedMessage = "Employee Certifications Saved"
		//this.detailsPanel.displayValidationResult(result)
		
		
		//setTimeout(function(){
		//	theController.detailsPanel.refresh()
		//	theController.detailsPanel2.refresh()
		//},300)
		
			
		
	}
	
});

function addEm_func() {
	var controller = View.controllers.get('theController');
	controller.addEmToTA();
}

function deleteEm_func() {
	var controller = View.controllers.get('theController');
	controller.deleteEmFromTA();
}


function makeLiteralOrNull(val,op) {
    var rVal = "NULL";
	if (!op) {op="";}
	if (op !="" ) {
		rVal = " IS NULL";
	}
    if (val != '') {
         rVal = op + "'" + val.toString().replace(/'/g, "''") + "'";
    }
    return  rVal;
}

function showDoc(row) { 
    
    var keys = { 'course_id':  row['em.emcourse_id'], 'em_id':  row['em.em_id'], 'start_date':  row['em.emstartdate.raw'] }; 
	var doc = row['em.emdoc']
    View.showDocument(keys, 'uc_certifications', 'doc',doc ); 
}

function loadNewDoc(row) { 
	
	
	var rest2 = new Ab.view.Restriction();
	rest2.addClause('UC_certifications.course_id', row['em.emcourse_id'], '=');
	rest2.addClause('UC_certifications.em_id', row['em.em_id'], '=');
	rest2.addClause('UC_certifications.start_date', row['em.emstartdate.raw'], '=');
	docRow = row.index;

	/*var panel = theController.detailsPanel;
	panel.restriction = rest2;
	theController.detailsPanel.fields.get('UC_certifications.doc').actions.get('detailsPanel_UC_certifications.doc_checkInNewDocument').button.dom.onclick()
	
	*/
	var panel = theController.docPanel;
	panel.restriction = rest2;
	//View.restriction=null;
	View.dialogDocumentParameters = {};
	View.dialogDocumentParameters.panel=panel
	View.dialogDocumentParameters.fieldName='doc'
	View.dialogDocumentParameters.fieldValue=row['em.emdoc']
	View.dialogDocumentParameters.tableName="UC_certifications"
	var keys = { 0:'UC_certifications.course_id',1: 'UC_certifications.em_id',2: 'UC_certifications.start_date' }; 
	View.dialogDocumentParameters.primaryKeyFields=keys;
	
	View.openDialog("ab-doc-checkin.axvw", null, false, {
		width: 800,
		height: 700,
		closeButton: false,
		maximize: false
	
	});
	
}

