var abEhsRptRestrByCategCtrl = View.createController('abEhsRptRestrByCategCtrl',{
	//1 = display only active restrictions, 0 = display all restrictions
	display: 1,
	activeRestriction: '',
	
	afterViewLoad: function(){
		this.activeRestriction = "(ehs_restrictions.date_start <= ${sql.currentDate}) AND (ehs_restrictions.restriction_type_id = 'Permanent' OR " +
			"(ehs_restrictions.restriction_type_id = 'Temporary' " +
			"	AND (ehs_restrictions.date_end IS NULL OR ehs_restrictions.date_end > ${sql.currentDate})))";
		this.abEhsRptRestrByCateg_restr.addParameter('activeRestriction',this.activeRestriction);
		this.abEhsRptRestrByCateg_restr.refresh(this.abEhsRptRestrByCateg_restr.restriction);
		this.abEhsRptRestrByCateg_restr.setTitle(getMessage("activeRestrictionsPanelTitle"));
		this.abEhsRptRestrByCateg_restr.actions.get("see").setTitle(getMessage("seeAllButtonTitle"));
	},
	
	abEhsRptRestrByCateg_restr_onSee: function(){
		if(this.display == 1){
			this.display = 0;
			this.abEhsRptRestrByCateg_restr.addParameter('activeRestriction','');
			this.abEhsRptRestrByCateg_restr.refresh(this.abEhsRptRestrByCateg_restr.restriction);
			this.abEhsRptRestrByCateg_restr.setTitle(getMessage("workRestrictionsPanelTitle"));
			this.abEhsRptRestrByCateg_restr.actions.get("see").setTitle(getMessage("seeOnlyButtonTitle"));
		}else{
			this.display = 1;
			this.abEhsRptRestrByCateg_restr.addParameter('activeRestriction',this.activeRestriction);
			this.abEhsRptRestrByCateg_restr.refresh(this.abEhsRptRestrByCateg_restr.restriction);
			this.abEhsRptRestrByCateg_restr.setTitle(getMessage("activeRestrictionsPanelTitle"));
			this.abEhsRptRestrByCateg_restr.actions.get("see").setTitle(getMessage("seeAllButtonTitle"));
		}
	}
	
});