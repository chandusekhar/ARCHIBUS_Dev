var abRplmLsAdminAddEditLeaseTemplate_ctrl = View.createController('abRplmLsAdminAddEditLeaseTemplate_ctrl',{
	ls_id:null,
	contactsTree:null,
	refreshContactsTree:true,
	
	afterViewLoad: function(){
		
//		this.leaseTemplatesTabs.tabs[3].loadView();
		this.leaseTemplatesTabs.addEventListener('afterTabChange', afterTabChange);	
		this.hideTabs();
	},
	
	//event listener function for actions 'Finish', from multiples tabs
	finishWizard:function(){
		
		this.abRplmLsAdminLeaseTemplateSelectTab_grid.refresh();
		//select 'selectTab'
		this.leaseTemplatesTabs.selectTab("selectTab");
		this.hideTabs();
		
	},
	
	//hide detailes tabs
	hideTabs: function(){
//		this.leaseTemplatesTabs.showTab("leaseTab", false);
//		this.leaseTemplatesTabs.showTab("documentsTab", false);
//		this.leaseTemplatesTabs.showTab("contactsTab", false);
//		this.leaseTemplatesTabs.showTab("baseRentsTab", false);
		this.leaseTemplatesTabs.showTab("clausesTab", false);
		this.leaseTemplatesTabs.showTab("optionsTab", false);
//		this.leaseTemplatesTabs.showTab("amendmentsTab", false);
	}
	
});

function afterTabChange(tabPanel, newTabName){
	if(newTabName == 'contactsTab' && abRplmLsAdminAddEditLeaseTemplate_ctrl.refreshContactsTree){
		var restriction = new Ab.view.Restriction();
    	restriction.addClause('ls.ls_id', abRplmLsAdminAddEditLeaseTemplate_ctrl.ls_id);
		abRplmLsAdminAddEditLeaseTemplate_ctrl.contactsTree.refresh(restriction);
		abRplmLsAdminAddEditLeaseTemplate_ctrl.refreshContactsTree = false;
	}
    
}