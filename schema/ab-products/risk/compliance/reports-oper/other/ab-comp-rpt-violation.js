/**
*
* Added for 20.1 Compliance  :   Operational Reports:  Compliance Violations 
*
* @author Zhang Yi
*/
var abViolationRptController = View.createController('abViolationRptController',
{
	//restriction of console
	consoleRes: " 1=1 ", 
	
	//restriction of tree
	treeRes: ' 1=1 ',

	//variables indicates current view is manage view or report view
	mode: 'report', 

	afterInitialDataFetch:function(){

		//initally hide the tree
		var layoutManager = View.getLayoutManager('main');
		layoutManager.collapseRegion('west');

		this.abCompViolationGrid.refresh();
		//Hide eq_id, eq_std, em_id, and any location columns if all records are null for the column.
		hideEmptyColumnsByPrefix(this.abCompViolationGrid, "compliance_locations.");
	},

	/**
	 * Events Handler for 'Show' action on console 
	 */
	onFilter: function(consoleController){
		//store console's restriction
		this.consoleRes = consoleController.consoleRes;

		//apply console restriction on grid
		this.abCompViolationGrid.show(true);
		this.abCompViolationGrid.refresh(this.consoleRes);
		//Hide eq_id, eq_std, em_id, and any location columns if all records are null for the column.
		hideEmptyColumnsByPrefix(this.abCompViolationGrid, "compliance_locations.");
		
		//apply console restriction on tree
		//Todo:this.abCompRegTree.refresh(consoleRes);
    },

	onClickRegulationNode:function(regulation){
		this.treeRes = " regviolation.regulation='"+regulation+"'  ";
		this.abCompViolationGrid.refresh(this.treeRes+" and "+ this.consoleRes);
		//Hide eq_id, eq_std, em_id, and any location columns if all records are null for the column.
		hideEmptyColumnsByPrefix(this.abCompViolationGrid, "compliance_locations.");
	},

	onClickProgramNode:function(regulation,program){
		this.treeRes = " regviolation.regulation='"+regulation+"'  AND regviolation.reg_program='"+program+"'  ";
		this.abCompViolationGrid.refresh(this.treeRes+" and "+ this.consoleRes);
		//Hide eq_id, eq_std, em_id, and any location columns if all records are null for the column.
		hideEmptyColumnsByPrefix(this.abCompViolationGrid, "compliance_locations.");
	},

	onClickRequirementNode:function(regulation,program,requirement){
		this.treeRes = " regviolation.regulation='"+regulation+"'  AND regviolation.reg_program='"+program+"'  AND regviolation.reg_requirement='"+requirement+"' ";
		this.abCompViolationGrid.refresh(this.treeRes+" and "+ this.consoleRes);
		//Hide eq_id, eq_std, em_id, and any location columns if all records are null for the column.
		hideEmptyColumnsByPrefix(this.abCompViolationGrid, "compliance_locations.");
	}

});