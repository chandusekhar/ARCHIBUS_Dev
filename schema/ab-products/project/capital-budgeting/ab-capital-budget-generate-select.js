var capitalBudgetGenerateSelectController = View.createController('capitalBudgetGenerateSelect', {
	
	afterViewLoad : function() {
		this.capitalBudgetGenerateSelectProgramTypes.show(false);
		this.capitalBudgetGenerateSelectProgramSites.show(false);
	},
	
	capitalBudgetGenerateSelectProgramTypes_onSelect : function() {
		var programtypes = this.capitalBudgetGenerateSelectProgramTypes.getSelectedRecords();
		var openerController = View.getOpenerView().controllers.get('capitalBudgetGenerate');
		openerController.programtypes = programtypes;
		openerController.showProgramFieldValues();
		View.closeThisDialog();
	},
	
	capitalBudgetGenerateSelectProgramSites_onSelect : function() {
		var programsites = this.capitalBudgetGenerateSelectProgramSites.getSelectedRecords();
		var openerController = View.getOpenerView().controllers.get('capitalBudgetGenerate');
		openerController.programsites = programsites;
		openerController.showProgramFieldValues();
		View.closeThisDialog();
	}
});