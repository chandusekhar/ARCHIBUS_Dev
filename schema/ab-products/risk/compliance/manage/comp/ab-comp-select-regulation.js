/**
 * @author song
 */
var abCompSelectRegulationController = View.createController('abCompSelectRegulationController', {
	/**
	 * tabs name 
	 */
	sbfDetailTabs: null,
    
	//restriction of select regulation grid
	selectRes: " 1=1 ", 

	afterViewLoad: function(){
		//place an icon button to the right of the standard select value button
	    var regulation = this.abCompSelectRegulationConsole.getFieldElement("regulation.regulation");
	    //'<img onclick="selectParentFolder()" src="/schema/ab-system/graphics/ab-icon-hierarchy.png"/>';
	    var img = document.createElement("img");
	    img.setAttribute("src", "/archibus/schema/ab-system/graphics/ab-icon-hierarchy.png");
      var hierButtonTooltip = getMessage("hierButtonTooltip");
	    img.setAttribute("title", hierButtonTooltip);
	    img.onclick = selectParentFolder;
	    regulation.parentNode.appendChild(img);
	  },
	
    afterInitialDataFetch: function(){
    	
    	this.mainController=View.getOpenerView().controllers.get(0);
    	if(this.mainController){
    		this.sbfDetailTabs = this.mainController.sbfDetailTabs;
    	}

		this.abCompSelectRegulation.refresh();		  
    },
    
    /**
     * private method
     * change array to String[key=value]
     */
    changeFormatForSqlIn: function(array){
   	 var result = "";
   	 if(array.length>1){
   		for(var i=0;i<array.length;i++){
   			result+="'"+array[i]+"',"
   		}
   		return result.substring(0,result.length-1);
   	 }
   	 return array;
    },
    /**
     * filter console show button click.
     */
    abCompSelectRegulationConsole_onShow: function(){
        var inputRestriction = this.abCompSelectRegulationConsole.getFieldRestriction();
		var restPart = " 1=1 ";
		//for Citation fields, use a LIKE %field value% restriction.
		var citationClause = "";
		var citation = "";
		for (var i = 0; i < inputRestriction.clauses.length; i++) {
			var clause = inputRestriction.clauses[i];
			//if Include Child Regulations  is checked, then don't add restriction clause for field regulation.regulation
			if($("childId").checked && "regulation.regulation" ==clause.name){
				continue;
			}

			if (clause.value==''||clause.value==0) {
				restPart = restPart + " AND " + clause.name +" "+clause.op+" ";
			} else {
				if(clause.name=="regulation.citation"){
					citation = clause.value;
					continue;
				}
				if(clause.op == "IN"){
					restPart = restPart + " AND " + clause.name +" "+clause.op + "(" + this.changeFormatForSqlIn(clause.value) + ")";
				}else{
					if(clause.name=="regulation.legal_refs"){
						clause.value = "%"+clause.value+"%";
						clause.op="LIKE";
					}
					restPart = restPart + " AND " + clause.name +" "+clause.op + " '" + clause.value + "'";
				}
			}
		}
		
		//Regulatory Citation: WHERE regulation.citation LIKE '%value%' OR EXISTS 
		//(SELECT regulation FROM regrequirement WHERE regrequirement.regulation=regulation.regulation 
		//AND regrequirement.citation LIKE '%value%').
		if(citation!=""){
			
			if(typeof(citation)=="object"){
				for(var i=0;i<citation.length;i++){
					var requirementCitation = " OR EXISTS (SELECT 1 FROM regrequirement " +
							"WHERE regrequirement.regulation=regulation.regulation " +
							"AND regrequirement.citation LIKE '%" + citation[i] + "%' )"
					citationClause = citationClause + "(regulation.citation LIKE " + "'%" + citation[i] + "%'"+requirementCitation+ ") or ";
		   		}
		   		//remove last 'or' string and add this clause to restriction.
		   		restPart = restPart + " AND ( "+ citationClause.substring(0,citationClause.length-4)+ " )";
		   	}else{
		   		var requirementCitation = " OR EXISTS (SELECT 1 FROM regrequirement " +
				"WHERE regrequirement.regulation=regulation.regulation " +
				"AND regrequirement.citation LIKE '%" + citation + "%' )"
				citationClause = citationClause + "(regulation.citation LIKE " + "'%" + citation + "%'"+requirementCitation+ ")";
	
		   		//remove last 'or' string and add this clause to restriction.
		   		restPart = restPart + " AND ( "+ citationClause + " )";
		   	}
		}
		
//		Rank is a virtual field, a drop-down list with the selections: High, Medium, Low.  
		var obj = {"0":"1,2,3","1":"4,5,6","2":"7,8,9"};
		var reg_rank_val = $('virtual_reg_rank').value;
		if(valueExistsNotEmpty(reg_rank_val)){
			restPart = restPart + " AND regulation.reg_rank in (" + obj[reg_rank_val] + ")";
		}
		
		var restriction =restPart;
		var fieldRegulation = this.abCompSelectRegulationConsole.getFieldValue("regulation.regulation");
		if(fieldRegulation && $("childId").checked ){
			var regulationStr = inputRestriction.findClause('regulation.regulation').value+"";
			var regulations = regulationStr.split(",");
			restriction += " AND ( hierarchy_ids like '%"+regulations[0]+"|%'";
			for( var j=1; j<regulations.length; j++){
				restriction += " OR hierarchy_ids like '%"+regulations[j]+"|%'";
			}
			restriction += ") ";
		}
		
		//location restriction.
		if(View.locationRestriction){
			restriction += " and exists (select 1 from regloc,compliance_locations " +
			"where regulation.regulation = regloc.regulation and regloc.location_id = compliance_locations.location_id"+ View.locationRestriction+")";
		}

		//store restriction for select regulation grid
		this.selectRes = restriction;

		this.abCompSelectRegulation.refresh(restriction);
    },
    /**
     * first tab row record button click change to tab2 edit form.
     */
    clickSelectButtonEdit: function(){
    	var grid = this.abCompSelectRegulation;
    	var rowIndex = grid.rows[grid.selectedRowIndex];
    	
        var regulation = rowIndex["regulation.regulation"];
        //If Regulation = Egress or HAZMAT, disable Regulation field and Delete button.
    	if(regulation=='Egress'||regulation=='HAZMAT'){
    		this.mainController.isEgressOrHAZMAT = true;
    	}else{
    		this.mainController.isEgressOrHAZMAT = false;
    	}
    	
		    this.sbfDetailTabs.regulation = regulation;
        this.mainController.regulation = regulation;
        
        abCompSelectRegulationController.regulation = regulation;
        var restriction = new Ab.view.Restriction();
    	restriction.addClause('regulation.regulation', regulation, '=');
    	

		  this.mainController.newRecord = false;
    	this.mainController.setOthersTabRefreshObj("select", 1);
    	
    	this.sbfDetailTabs.selectTab("define", restriction, false, false, true);
    	

        var viewTitle = getMessage("manageRegulation")+": "+regulation;
        this.mainController.view.setTitle(viewTitle);
		this.sbfDetailTabs.setAllTabsEnabled(true);
		
    },
    
    /**
     * when add new button click.
     */
    abCompSelectRegulation_onAddNew: function(){
    	this.mainController.newRecord = true;
		this.mainController.copyRecord = false;

    	this.mainController.setOthersTabRefreshObj("select", 1);
    	
    	this.sbfDetailTabs.selectTab("define", null, true);    	

      this.mainController.view.setTitle(getMessage("addNewRegulation"));
			this.sbfDetailTabs.enableTab('select');
		
			var defineTab = this.sbfDetailTabs.findTab('define');
			defineTab.restriction = null;
		
    },
    
	/*
	* EventHandler for action "Clear": clear console,  set custom field child value uncheck, and regulation to empty.
	*/
    abCompSelectRegulationConsole_onClear : function() {
		//clear console values
		this.abCompSelectRegulationConsole.clear();
		
		//clear virtual location field value and View.locationRestriction, this method is defined in ab-comp-locations-console.js
		clearConsoleFields();
		
		//empty custom fields.
		$('childId').checked = false;
	},

	/**
	* Event Handler of action "Doc"
	*/
	abCompSelectRegulation_onDoc : function(){
		var	parameters = {};
		parameters.consoleRes = this.selectRes;
		View.openPaginatedReportDialog("ab-comp-reg-paginate-rpt.axvw" ,null, parameters);
	}
});    
/**
 * event handle when tree node click.
 * overwrite original method 'treeNodeClick' in file ab-comp-regulation-hier-tree.js
 */
function treeNodeClick(){
	
	var panel = View.panels.get("regulation_treePanelForDialog");
	var regulation=panel.lastNodeClicked.data['regulation.regulation'];
	abCompSelectRegulationController.abCompSelectRegulationConsole.setFieldValue('regulation.regulation', regulation);
	selectParentFolderClose.defer(200, this);
}