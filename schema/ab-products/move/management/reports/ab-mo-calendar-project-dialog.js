var abMoveCalendarPrjController = View.createController('abMoveCalendarPrjCtrl',{
	project_id: null,
	selectedTab: null,
	afterInitialDataFetch: function(){
		var viewRestriction  = this.view.restriction;
		if(viewRestriction){
			var clause = viewRestriction.findClause('project.project_id');
			this.project_id = clause.value;
		}
		if(!valueExistsNotEmpty(this.project_id)){
			return;
		}
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('project.project_id', this.project_id, '=');
		this.form_abMoveCalendar_project.refresh(restriction);
		replaceNewLinesInDivFields(this.form_abMoveCalendar_project, true);

		this.refreshTab('detailTabs','employeeTab','grid_abMoveCalendar_em',
			'ds_abMoveCalendar_mo','Employee', this.project_id, this.selectedTab, this);

		this.refreshTab('detailTabs','hireTab','grid_abMoveCalendar_hr',
			'ds_abMoveCalendar_mo','New Hire', this.project_id, this.selectedTab, this);

		this.refreshTab('detailTabs','leavingTab','grid_abMoveCalendar_lv',
			'ds_abMoveCalendar_mo','Leaving', this.project_id, this.selectedTab, this);

		this.refreshTab('detailTabs','equipmentTab','grid_abMoveCalendar_eq',
			'ds_abMoveCalendar_mo','Equipment', this.project_id, this.selectedTab, this);

		this.refreshTab('detailTabs','assetTab','grid_abMoveCalendar_asset',
			'ds_abMoveCalendar_mo','Asset', this.project_id, this.selectedTab, this);

		this.refreshTab('detailTabs','roomTab','grid_abMoveCalendar_rm',
			'ds_abMoveCalendar_mo','Room', this.project_id, this.selectedTab, this);
			
		this.refreshTab('detailTabs','actionTab','grid_abMoveCalendar_action',
			'ds_abMoveCalendar_action','Action', this.project_id, this.selectedTab, this);
			
			
		//refresh associated assets panels (Equipment and Furniture)
		var restrAssets = new Ab.view.Restriction();
		restrAssets.addClause('mo.project_id' ,this.project_id, '=' ); 
	
		this.rep_abMoGroupListMoEq_list.refresh(restrAssets);
		this.rep_abMoGroupListMoTa_list.refresh(restrAssets);
	
		this.detailTabs.showTab('abMoveCalendar_moeq' , (this.rep_abMoGroupListMoEq_list.rows.length>0));
		this.detailTabs.showTab('abMoveCalendar_mota' , (this.rep_abMoGroupListMoTa_list.rows.length>0));		
	},
	refreshTab: function(tabs, tab, mainPanel, mainDs, moType, projectId, selectedTab, controller){
		var objTabs = View.panels.get(tabs);
		var restrMain = new Ab.view.Restriction();
		restrMain.addClause('mo.project_id', projectId, '=');
		if (moType != 'Action') {
			restrMain.addClause('mo.mo_type', moType, '=');
		}
		var objMainDs = View.dataSources.get(mainDs);
		var recs = objMainDs.getRecords(restrMain);
		var visible = ( recs.length > 0);
		if(!visible){
			return false;
		}
		if(mainPanel != null){
			var objMainPanel = View.panels.get(mainPanel);
			objMainPanel.addParameter('labelNotAvailable', getMessage('label_not_available'));
			objMainPanel.refresh(restrMain);
		}
		if(selectedTab == null){
			controller.selectedTab = tab;
			objTabs.selectTab(tab, null , false, false , true);
		}
		objTabs.showTab(tab, visible);
	}
})

function replaceNewLinesInDivFields(form, changeColor){
	var fields = ['project.description','project.comments'];
	
	for(var i=0; i < fields.length; i++) {
		var fieldName = fields[i];
		if (form.fields.get(fieldName).fieldDef.readOnly
				&& form.getFieldElement(fieldName)
				&& form.getFieldElement(fieldName).nextSibling) {
			if (form.getFieldValue(fieldName) != "") {
				form.getFieldElement(fieldName).nextSibling.innerHTML = form.getFieldValue(fieldName).replace(/\n/g, "<BR/>");
			}
			else {
				// for Firefox we must have a new line in the DIV in order to have the same height as the field's label
				form.getFieldElement(fieldName).nextSibling.innerHTML = "<BR/>";
			}	
			form.getFieldElement(fieldName).nextSibling.style.overflow = "visible";
			if(changeColor != false) {
				form.getFieldElement(fieldName).nextSibling.style.backgroundColor = "white";
				form.getFieldElement(fieldName).nextSibling.style.borderWidth = "0px";
			}
		}
	}
}

