var theController = View.createController('theController',{
   afterViewLoad: function()
   {
     this.treePanelActive.restriction = "UC_certifications.expiry_date is null or UC_certifications.expiry_date >= getdate()";
	// this.treePanelExpired.restriction = " certifications.expiry_date < getdate() and certifications.course_id not in (select course_id from certifications where certifications.expiry_date is null or certifications.expiry_date >= getdate()) ";
   },
   detailsPanel_afterRefresh: function()
   {
     var target = this.detailsPanel.getFieldValue("UC_certifications.course_name");
	 if (target != '' && target != null)
	 {
	   this.detailsPanel.setFieldValue ("UC_certifications.course_name", target);
       this.disableDetailsPanelField ("UC_certifications.course_name");   
	 }
	 else
	    this.enableDetailsPanelField ("UC_certifications.course_name"); 

     var theName = this.detailsPanel.getFieldValue("UC_certifications.course_name");
	 if (theName != null && theName != '')
	 {
	     this.detailsPanel.setFieldValue("UC_courses.course_name", theName);	
     }		 
   },
   
   disableDetailsPanelField: function(theFieldName)
   {
     var targetPanel = View.panels.get("detailsPanel");
     var theField = targetPanel.getFieldElement (theFieldName);
	 if (theField != null)
	     theField.disabled=true;
   },
   
   enableDetailsPanelField: function(theFieldName)
   {
     var targetPanel = View.panels.get("detailsPanel");
     var theField = targetPanel.getFieldElement (theFieldName);
	 if (theField != null)
	     theField.disabled=false;
   },
   
   treePanelExpired_afterRefresh: function()
   {
	 var targetColumn = "UC_certifications.course_id";
	 var theRows = this.treePanelExpired.gridRows.items;
   },
   
   detailsPanel_onRenew: function()
	{
	 this.detailsPanel.setFieldValue('UC_certifications.start_date', '');
	 //enable start_date
	 this.enableDetailsPanelField ("UC_certifications.start_date");
	 this.detailsPanel.setFieldValue('UC_certifications.expiry_date', '');
	 this.detailsPanel.setFieldValue('UC_certifications.cert_number', '');
	 this.detailsPanel.setFieldValue('UC_certifications.doc', '');
	 this.detailsPanel.setFieldValue('UC_certifications.date_renew', '');
	},
	
	detailsPanel_onHistory: function()
	{
	  var targetCourse = this.detailsPanel.getFieldValue("UC_certifications.course_id");
	  var theUser = this.view.user.employee.id;
	  var theRest = "1=1 and UC_certifications.em_id = "+ makeLiteralOrNull(theUser);
	  if (targetCourse != null)
	      theRest += " and UC_certifications.course_id = "+ makeLiteralOrNull(targetCourse);
	  
	  View.openDialog('brg-certification-history.axvw', theRest , false, {
        width: '950',
        height: '950',
        closeButton: true,
		maximize: false
		});
	},
	
   hideRenew: function()
   {
     var ren = this.detailsPanel.actions.get('renew');
	 ren.show(false);
	 
   },
   
   hideDetailFields: function()
   {
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
   
   showDetailFields: function()
   {
     this.hideRenew();
     this.enableDetailsPanelField ("UC_courses.category_id");
	 this.enableDetailsPanelField ("UC_courses.type");
	 this.enableDetailsPanelField ("UC_certifications.course_id");
	 this.enableDetailsPanelField ("UC_certifications.start_date");
	 try 
	 {
	   var theEl =  document.getElementById("detailsPanel.UC_courses.category_id_selectValue");
	   theEl.disabled= false;
	   theEl.hidden= false;
	 }
	 catch (e) {}
   },
   
   showRenew: function()
   {
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
    var theRest = "1=1";
	var theCat = this.detailsPanel.getFieldValue ("UC_courses.category_id");
	var theType = this.detailsPanel.getFieldValue ("UC_courses.type");
	if (theCat != '')
	   theRest = theRest + " and rtrim(UC_courses.category_id) like '%"+ theCat +"%'";
    if (theType != '')
	   theRest = theRest + " and rtrim(UC_courses.type) like '%"+ theType +"%'";
	   
    var form = commandObject.getParentPanel();
	View.selectValue(form.id, 'Courses',['UC_certifications.course_id','UC_courses.category_id', 'UC_courses.type', 'UC_certifications.course_name', 'UC_courses.course_name'], 
	                  'UC_courses', [ 'UC_courses.course_id',  'UC_courses.category_id', 'UC_courses.type', 'UC_courses.course_name', 'UC_courses.course_name'], 
					  ['UC_courses.course_id',  'UC_courses.category_id', 'UC_courses.type', 'UC_courses.course_name'],
					  theRest, this.updateCourseName(), false);
   
   },
   updateCourseName: function()
   {
     theController.disableDetailsPanelField ("UC_courses.course_name");  
	 theController.disableDetailsPanelField ("UC_certifications.course_name");  
   },

   onChangeCategory: function() //clear course_id
   {
     this.detailsPanel.setFieldValue("UC_certifications.course_id", "");
	 this.detailsPanel.setFieldValue("UC_certifications.course_name", "");
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
   }
   
});
function makeLiteralOrNull(val) {
    var rVal = "NULL";
    if (val != '') {
         rVal = "'" + val.toString().replace(/'/g, "''") + "'";
    }
    return  rVal;
}