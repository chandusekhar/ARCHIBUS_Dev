var abRplmLsAdminAddEditLeaseTemplate_ctrl = View.createController('abRplmLsAdminAddEditLeaseTemplate_ctrl',{
	ls_id:null,
	contactsTree:null,
	refreshContactsTree:true,
	
	afterViewLoad: function(){
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
		this.leaseTemplatesTabs.showTab("leaseTab", false);
		this.leaseTemplatesTabs.showTab("documentsTab", false);
		this.leaseTemplatesTabs.showTab("contactsTab", false);
		this.leaseTemplatesTabs.showTab("baseRentsTab", false);
		this.leaseTemplatesTabs.showTab("clausesTab", false);
		this.leaseTemplatesTabs.showTab("optionsTab", false);
		this.leaseTemplatesTabs.showTab("amendmentsTab", false);
	}
	
});

