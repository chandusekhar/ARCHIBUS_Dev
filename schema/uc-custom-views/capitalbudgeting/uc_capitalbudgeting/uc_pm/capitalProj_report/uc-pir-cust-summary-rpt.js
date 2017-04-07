//florin
var nameLabelConfig = {lengthLimit : 50, textTemplate : "<span style='color:#FF0000;text-transform:lowercase;'>{0}</span>", nameFieldTemplate : "{0}",
        textColor : "#000000", defaultValue : "", raw : false };

var emNameLabelConfig = {lengthLimit : 50, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{1}, {0}",
        textColor : "#000000", defaultValue : "", raw : false };

var myController = View.createController('myController', {
    openBy:"",
   afterInitialDataFetch:function()
	{
	   //populate funding year lists
	   var fromPrimaryList =  document.getElementById('from_primary');
	   var toPrimaryList =  document.getElementById('to_primary');
	   
	},

   afterViewLoad: function()
   {

		docCntrl.docTable='uc_pir';
		docCntrl.docPkey=this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.pir_id");
		docCntrl.docTitle = "Project Request Documents";
		docCntrl.docPdf = false;
		docCntrl.docXls = false;
		docCntrl.docAdd = false;
		docCntrl.docEdit=false;
		this.doc_grid.restriction="1=2"

 		var sectionLabels = document.getElementsByName("sectionLabels");
	},
	

   

	projectInitiationViewSummaryForm_afterRefresh: function(){
		var status = this.projectInitiationViewSummaryForm.getFieldValue('uc_pir.status');
		var review_by = this.projectInitiationViewSummaryForm.getFieldValue('uc_pir.review_by');
		
		//Endorser panel
		BRG.UI.addNameField('endorser_name', this.projectInitiationViewSummaryForm, 'uc_pir.endorser', 'em', ['name_first','name_last'],{'em.em_id' : 'uc_pir.endorser'},emNameLabelConfig);

	  
	   	

		
		var currentProj = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.pir_id");
		var rest = new Ab.view.Restriction();
		rest.addClause('uc_docs_extension.table_name','uc_pir',"=");
		if (currentProj == ""){
			currentProj="-1"
		}
		else {
			docCntrl.docPkey= currentProj
		}
		rest.addClause("uc_docs_extension.pkey", currentProj, "=");
		this.doc_grid.restriction=rest
		this.doc_grid.refresh()

		
	   
	   	 //set the title
	   var review_by = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.review_by");
	   var review_byValue = this.projectInitiationViewSummaryForm.fields.get("uc_pir.review_by").fieldDef.enumValues[review_by];
	   var theTitle = "In Review By: " + review_byValue;
       this.projectInitiationViewSummaryForm.setTitle (theTitle); //use the long name from enum list
	   
	   document.getElementById("sectionLabels1").style.display = "none";
	   document.getElementById("sectionLabels_title1").innerHTML = theTitle;

	   var t = document.getElementById("projectInitiationViewSummaryForm_requestorInfo_labelCell");
	  
	   //add name label below the requestor
	   BRG.UI.addNameField('requestor_name', this.projectInitiationViewSummaryForm, 'uc_pir.requestor', 'em', ['name_first', 'name_last'],{'em.em_id' : 'uc_pir.requestor'},emNameLabelConfig);

       BRG.UI.addNameField('costcenter_name', this.projectInitiationViewSummaryForm, 'uc_pir.dp_id', 'dp', ['name'],
        {'dp.dv_id' : 'uc_pir.dv_id','dp.dp_id' : 'uc_pir.dp_id'},
        nameLabelConfig);

	   BRG.UI.addNameField('building_name', this.projectInitiationViewSummaryForm, 'uc_pir.bl_id', 'bl', ['name'],
        {'bl.bl_id' : 'uc_pir.bl_id'},
        nameLabelConfig);

		
		
		if (this.projectInitiationViewSummaryForm.getFieldValue('uc_pir.comments_pp') !="") {
			this.projectInitiationViewSummaryForm.showField('uc_pir.comments_pp',true)
			this.projectInitiationViewSummaryForm.showField('uc_pir.reject_comments',false)
		}
		else if (this.projectInitiationViewSummaryForm.getFieldValue('uc_pir.reject_comments') !=""){
			this.projectInitiationViewSummaryForm.showField('uc_pir.comments_pp',false)
			this.projectInitiationViewSummaryForm.showField('uc_pir.reject_comments',true)
		}
		else{
			this.projectInitiationViewSummaryForm.showField('uc_pir.comments_pp',false)
			this.projectInitiationViewSummaryForm.showField('uc_pir.reject_comments',false)
		}
			
		this.projectInitiationViewSummaryForm.showField('uc_pir.project_title',this.projectInitiationViewSummaryForm.getFieldValue('uc_pir.project_title') !="")
		
		
	   myController.replaceDisabledEnumFields([this.projectInitiationViewSummaryForm.fields.get('uc_pir.driver').dom]);
	   myController.replaceDisabledEnumFields([this.projectInitiationViewSummaryForm.fields.get('uc_pir.funding_primary').dom]);
	   myController.replaceDisabledEnumFields([this.projectInitiationViewSummaryForm.fields.get('uc_pir.funding_secondary').dom]);
	   myController.replaceDisabledEnumFields([this.projectInitiationViewSummaryForm.fields.get('uc_pir.rank').dom]);
	   myController.replaceDisabledEnumFields([this.projectInitiationViewSummaryForm.fields.get('uc_pir.imp').dom]);
	   
	   myController.replaceDisabledEnumFields([this.projectInitiationViewSummaryForm.fields.get('uc_pir.funding_tertiary').dom]);
	   
	   //myController.replaceDisabledEnumDateFields([this.projectInitiationViewSummaryForm.fields.get('uc_pir.years_from_secondary').dom]);
	   
	   //Style uc_pir.return_comments text box
 	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.return_comments").style.background="transparent";
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.return_comments").style.overflow="hidden";
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.return_comments").style.border="none";
	   
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.reject_comments").style.background="transparent";
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.reject_comments").style.overflow="hidden";
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.reject_comments").style.border="none";
	   
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.comments_pp").style.background="transparent";
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.comments_pp").style.overflow="hidden";
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.comments_pp").style.border="none";
	   
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.criteria").style.background="transparent";
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.criteria").style.overflow="hidden";
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.criteria").style.border="none";
	   
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.infrastructural_requirements").style.background="transparent";
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.infrastructural_requirements").style.overflow="hidden";
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.infrastructural_requirements").style.border="none";
	   
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.situation_analysis").style.background="transparent";
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.situation_analysis").style.overflow="hidden";
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.situation_analysis").style.border="none";
	   
	     document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.comments_cp").style.background="transparent";
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.comments_cp").style.overflow="hidden";
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.comments_cp").style.border="none";
	   
	    document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.best_use").style.background="transparent";
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.best_use").style.overflow="hidden";
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.best_use").style.border="none";
	   
	    document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.program_align").style.background="transparent";
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.program_align").style.overflow="hidden";
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.program_align").style.border="none";
	   
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.strategic_assess").style.background="transparent";
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.strategic_assess").style.overflow="hidden";
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.strategic_assess").style.border="none";
	   
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.scope").style.background="transparent";
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.scope").style.overflow="hidden";
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.scope").style.border="none";
	   
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.comments_en").style.background="transparent";
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.comments_en").style.overflow="hidden";
	   document.getElementById("ShowprojectInitiationViewSummaryForm_uc_pir.comments_en").style.border="none";
	   
	   var pyrfrm = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.years_from_primary");
	   var pyrto = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.years_to_primary");
	   var syrfrm = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.years_from_secondary");
	   var syrto = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.years_to_secondary");
	   var tyrfrm = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.years_from_tertiary");
	   var tyrto = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.years_to_tertiary");
	   
	   document.getElementById('frompyr').innerHTML = pyrfrm + " ";
	   document.getElementById('topyr').innerHTML = pyrto;
	   document.getElementById('fromsyr').innerHTML = syrfrm + " ";
	   document.getElementById('tosyr').innerHTML = syrto;
	   document.getElementById('fromtyr').innerHTML = tyrfrm + " ";
	   document.getElementById('totyr').innerHTML = tyrto;
	   

	   
	   this.updateEstimatedAmountsTotal();
	   
	    document.getElementById("sectionLabels1").style.display = "inline";
		var oContent1 = frames["projectInitiationViewSummaryForm_form"].innerHTML;
	    document.getElementById("sectionLabels1").style.display = "none";
		//frames["projectInitiationViewSummaryForm_form"].style.display = "none"
		
		
		//this.pnl.show(false,false)
		//You can manipulate the content here or with the styles
		var oIframe = frames["print_iframe"]
		
	    if( oIframe.document ) {
			oIframe.document.body.innerHTML = ""; //Chrome, IE
		}else {
			oIframe.contentDocument.body.innerHTML = ""; //FireFox
		}

		var oDoc1 
		if (oIframe.document) oDoc1 = oIframe.document;
		
		this.getPrintTxt(oDoc1,oContent1)
		oDoc1.close()
	   frames["projectInitiationViewSummaryForm_form"].style.display = ""
	   
    }, //end projectInitiationViewSummaryForm_afterRefresh
/*
	projectInitiationViewSummaryForm_onPrint: function() {
		//frames["projectInitiationViewSummaryForm_form"].style.display = ""
	    document.getElementById("sectionLabels1").style.display = "inline";
		var oContent1 = frames["projectInitiationViewSummaryForm_form"].innerHTML;
	    document.getElementById("sectionLabels1").style.display = "none";
		//frames["projectInitiationViewSummaryForm_form"].style.display = "none"
		//this.pnl.show(false,false)
		//You can manipulate the content here or with the styles
		var oIframe = frames["print_iframe"]
		
	    if( oIframe.document ) {
			oIframe.document.body.innerHTML = ""; //Chrome, IE
		}else {
			oIframe.contentDocument.body.innerHTML = ""; //FireFox
		}

		var oDoc1 
		if (oIframe.document) oDoc1 = oIframe.document;
		this.getPrintTxt(oDoc1,oContent1)
		
		var browser=navigator.appName;
		if ((browser=="Microsoft Internet Explorer")) {
			oIframe.document.execCommand('print', false, null);
		} else {
			oIframe.print();
		}
		oDoc1.close()
	},
*/
	projectInitiationViewSummaryForm_onPrint: function() {
	
		var oIframe = frames["print_iframe"]
		var browser=navigator.appName;
		if ((browser=="Microsoft Internet Explorer")) {
				oIframe.document.execCommand('print', false, null);
			} else {
			
			oIframe.print();
		}
	},	
	getPrintTxt: function(oDoc1,oContent1){
		//var title=this.pnl.title
		var styles = []  //used if you need to set a style for printing i.e. hiding a component
		//oDoc1.write("<head><title style='font-size:18;'>" + title + "</title>");
		oDoc1.write("<head><title style='font-size:18;'>Capital Project Report</title>");
		
		oDoc1.write("<STYLE TYPE='text/css'>");
		for (var y = 0; y < styles.length; y++) {
			oDoc1.write(styles[y]);
		}
		oDoc1.write("</STYLE>");
		var stylesheets = Ext.select("link").elements
		//Add or adjust any print style
		for (var s = 0; s < stylesheets.length; s++) {
			if (stylesheets[s].type == "text/css") {
				oDoc1.write("<LINK href='" + stylesheets[s].href + "' type=text/css rel=stylesheet>");
			}
		}

		oDoc1.write("</head><body onLoad='this.focus();'>");
		
		oDoc1.write(oContent1);
		oDoc1.write("</body>");
		return oDoc1
	},

	replaceDisabledEnumFields: function (fields) {

        for (var i = 0, j = fields.length; i < j; i++) {
			if (fields[i] !== null && fields[i].disabled === true) {
                 var coverEl = document.createElement("SPAN");
                fields[i].style.display = "none";
				if (fields[i].selectedIndex >=0) {
					coverEl.innerHTML = fields[i].options[fields[i].selectedIndex].text;
				}
				//coverEl.innerHTML = fields[i].options[0].label;
                if (fields[i].coverEl) {
                    fields[i].parentNode.removeChild(fields[i].coverEl);
                }
                fields[i].coverEl = coverEl;
                fields[i].parentNode.appendChild(coverEl); 
            }
            else if (fields[i].coverEl) {
                fields[i].coverEl.style.display = "none";
                fields[i].style.display = "block";
            }
        } 
    },
	
	replaceDisabledEnumDateFields: function (fields) {

        for (var i = 0, j = fields.length; i < j; i++) {
			if (fields[i] !== null && fields[i].disabled === true) {
                 var coverEl = document.createElement("SPAN");
                fields[i].style.display = "none";
				//coverEl.innerHTML = fields[i].options[fields[i].selectedIndex].label;
				coverEl.innerHTML = fields[i].value;
                if (fields[i].coverEl) {
                    fields[i].parentNode.removeChild(fields[i].coverEl);
                }
                fields[i].coverEl = coverEl;
                fields[i].parentNode.appendChild(coverEl); 
            }
            else if (fields[i].coverEl) {
                fields[i].coverEl.style.display = "none";
                fields[i].style.display = "block";
            }
        } 
    },

   updateEstimatedAmountsTotal: function()
   {

         var primaryAmount = parseFloat(this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.cost_est_primary"));
	 var secondaryAmount = parseFloat(this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.cost_est_secondary"));
	 var tertiaryAmount = parseFloat(this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.cost_est_tertiary"));


	 if (isNaN(primaryAmount) || isNaN(secondaryAmount) || isNaN(tertiaryAmount)) return;

	 var total = primaryAmount + secondaryAmount + tertiaryAmount;

	 total = Ext.util.Format.usMoney(parseFloat(total).toFixed(2));

	 var target = document.getElementById("totalSum");
	 target.innerHTML = total.replace ("$","");
   }
  
});
