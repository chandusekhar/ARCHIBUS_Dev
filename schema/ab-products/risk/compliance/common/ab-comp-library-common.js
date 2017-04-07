/**
* @author Zhang Yi
*/

var docLibCommonController = View.createController('docLibCommonController',
{	

	//restriction string from tree
	treeRes:'',

	//console restriction string
	consoleRes:' 1=1 ',

	//variable indicates if current view is foManage or Operational Report, values of "manage" or "report"
	mode: "",
	

	/**
	* refresh all grids of each tab page within Tabs
	*/
	onRefresh:function(res){
		this.consoleRes = res;

		this.documentsGrid.addParameter("consoleRes",this.consoleRes);
		this.documentsGrid.refresh();
	},

	documentsGrid_edit_onClick: function(row){
		this.showDocLibForm(row);
	},

	/**
	 * Private function: show Document Lib form in edit or pop-up report mode.
	 */
	showDocLibForm: function(row){
		var pk = row.getFieldValue("docs_assigned.doc_id");
		this.abCompDocForm.refresh("docs_assigned.doc_id="+pk);
		if("report" ==this.mode){
			this.abCompDocForm.show(true);
			this.abCompDocForm.showInWindow({
				width: 800,
				height: 600,
			});
		}
	},

	/**
	 * event handler for clicking tree node on Document Lib tree.
	 */
	treeShow: function(res){
		this.consoleRes=this.consoleRes+res;
		this.refreshTabsGrid();
	},
		
});
