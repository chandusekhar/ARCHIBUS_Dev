/**
 * Controller for Space Report Scenario Grid Panel.
 */
View.createController('spaceProposedMoveGridPanelController', {
	portfolioResatriction: null,
	/**
	 * Constructor.
	 */
	afterCreate : function() {
		this.on('app:space:portfolio:report:onclickScenarioLink', this.showProposedMoves);
	},
	
	afterInitialDataFetch: function() {
		View.controllers.get('spaceReportFilter').hideComparisonTypeElement();
	 },

	// ----------------------- Action event handler--------------------
	/**
	 * Filter Proposed Moves.
	 */
	showProposedMoves : function(res) {
		this.portfolioResatriction = res;
		this.abSpRptMoveGrid.addParameter('filterRestriction', res);
		this.abSpRptMoveGrid.refresh(); 
	},

	abSpRptMoveGrid_onCreateWo : function() {
		View.openDialog('ab-sp-proposed-moves-create-wo.axvw', null, true, {
			portfolioResatriction: this.portfolioResatriction,
			width: 1024,
			height: 800,
			title: getMessage('createMoTitle'),
			callback: function(){
			}
		});		
	},

	abSpRptMoveGrid_afterRefresh : function() {
		if ( !this.abSpRptMoveGrid.rows || this.abSpRptMoveGrid.rows.length<1 ) {
			this.abSpRptMoveGrid.enableAction('createWo', false);
		} else {
			this.abSpRptMoveGrid.actions.get('createWo').forcedDisabled = false;
			this.abSpRptMoveGrid.enableAction('createWo', true);
		}
	}
});
