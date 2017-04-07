var abEhsRptRestrictionsByLocationCtrl = View.createController('abEhsRptIncidentDetailsCtrl',{
	//1 = display only active restrictions, 0 = display all restrictions
	display: 1,
	activeRestriction: '',
	
	afterViewLoad: function(){
		this.activeRestriction = "(ehs_restrictions.date_start <= ${sql.currentDate}) AND (ehs_restrictions.restriction_type_id = 'Permanent' OR " +
		"(ehs_restrictions.restriction_type_id = 'Temporary' " +
		"	AND (ehs_restrictions.date_end IS NULL OR ehs_restrictions.date_end > ${sql.currentDate})))";
		this.abEhsRptRestrictionsByLocation_restr.addParameter('activeRestriction',this.activeRestriction);
		this.abEhsRptRestrictionsByLocation_restr.refresh(this.abEhsRptRestrictionsByLocation_restr.restriction);
		this.abEhsRptRestrictionsByLocation_restr.setTitle(getMessage("activeRestrictionsPanelTitle"));
		this.abEhsRptRestrictionsByLocation_restr.actions.get("see").setTitle(getMessage("seeAllButtonTitle"));
	},
	
	abEhsRptRestrictionsByLocation_restr_onSee: function(){
		if(this.display == 1){
			this.display = 0;
			this.abEhsRptRestrictionsByLocation_restr.addParameter('activeRestriction','');
			this.abEhsRptRestrictionsByLocation_restr.refresh(this.abEhsRptRestrictionsByLocation_restr.restriction);
			this.abEhsRptRestrictionsByLocation_restr.setTitle(getMessage("workRestrictionsPanelTitle"));
			this.abEhsRptRestrictionsByLocation_restr.actions.get("see").setTitle(getMessage("seeOnlyButtonTitle"));
		}else{
			this.display = 1;
			this.abEhsRptRestrictionsByLocation_restr.addParameter('activeRestriction',this.activeRestriction);
			this.abEhsRptRestrictionsByLocation_restr.refresh(this.abEhsRptRestrictionsByLocation_restr.restriction);
			this.abEhsRptRestrictionsByLocation_restr.setTitle(getMessage("activeRestrictionsPanelTitle"));
			this.abEhsRptRestrictionsByLocation_restr.actions.get("see").setTitle(getMessage("seeAllButtonTitle"));
		}
	},
	
	abEhsRptRestrictionsByLocation_showGrid: function(node){
	    var locationRestriction = new Ab.view.Restriction(); 
	    if(node.restriction.clauses[0].name == 'property.pr_id'){
	    	locationRestriction.addClause('ehs_restrictions.vf_pr_id', node.restriction.clauses[0].value, "=");
	    }
	    if(node.restriction.clauses[0].name == 'bl.bl_id'){
	    	locationRestriction.addClause("em.bl_id", node.restriction.clauses[0].value, "=");
	    }
	    this.abEhsRptRestrictionsByLocation_restr.refresh(locationRestriction);
	}
});