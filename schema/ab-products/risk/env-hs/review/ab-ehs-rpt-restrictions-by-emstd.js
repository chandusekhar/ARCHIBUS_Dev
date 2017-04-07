var abEhsRptRestrByEmstdCtrl = View.createController('abEhsRptRestrByEmstdCtrl',{
	//1 = display only active restrictions, 0 = display all restrictions
	display: 1,
	activeRestriction: '',
	
	afterViewLoad: function(){
		this.activeRestriction = "(ehs_restrictions.date_start <= ${sql.currentDate}) AND (ehs_restrictions.restriction_type_id = 'Permanent' OR " +
		"(ehs_restrictions.restriction_type_id = 'Temporary' " +
		"	AND (ehs_restrictions.date_end IS NULL OR ehs_restrictions.date_end > ${sql.currentDate})))";
		this.abEhsRptRestrByEmstd_restr.addParameter('activeRestriction',this.activeRestriction);
		this.abEhsRptRestrByEmstd_restr.refresh(this.abEhsRptRestrByEmstd_restr.restriction);
		this.abEhsRptRestrByEmstd_restr.setTitle(getMessage("activeRestrictionsPanelTitle"));
		this.abEhsRptRestrByEmstd_restr.actions.get("see").setTitle(getMessage("seeAllButtonTitle"));
	},
	
	abEhsRptRestrByEmstd_restr_onSee: function(){
		if(this.display == 1){
			this.display = 0;
			this.abEhsRptRestrByEmstd_restr.addParameter('activeRestriction','');
			this.abEhsRptRestrByEmstd_restr.refresh(this.abEhsRptRestrByEmstd_restr.restriction);
			this.abEhsRptRestrByEmstd_restr.setTitle(getMessage("workRestrictionsPanelTitle"));
			this.abEhsRptRestrByEmstd_restr.actions.get("see").setTitle(getMessage("seeOnlyButtonTitle"));
		}else{
			this.display = 1;
			this.abEhsRptRestrByEmstd_restr.addParameter('activeRestriction',this.activeRestriction);
			this.abEhsRptRestrByEmstd_restr.refresh(this.abEhsRptRestrByEmstd_restr.restriction);
			this.abEhsRptRestrByEmstd_restr.setTitle(getMessage("activeRestrictionsPanelTitle"));
			this.abEhsRptRestrByEmstd_restr.actions.get("see").setTitle(getMessage("seeAllButtonTitle"));
		}
	}
	
});

function abEhsRptRestrByEmstd_showGrid(commandContext){
	var restriction = new Ab.view.Restriction();
	if(commandContext.restriction['emstd.em_std']){
		restriction.addClause("em.em_std", "'" +commandContext.restriction['emstd.em_std'] + "'", "="); 
	}
	View.panels.get('abEhsRptRestrByEmstd_restr').refresh(restriction);
}