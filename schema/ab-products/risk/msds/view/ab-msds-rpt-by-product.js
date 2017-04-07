/**

* @author xianchao

*/
var abRiskMsdsRptByProController = View.createController('abRiskMsdsRptByProController',
{
	/**
	* This event handler is called by clear button in abRiskMsdsRptByProConsole.
	*/
	abRiskMsdsRptByProConsole_onClear : function() {
		this.abRiskMsdsRptByProConsole.clear();
	},
	/**
	* This event handler is called by show button in abRiskMsdsRptByProConsole.
	*/
	abRiskMsdsRptByProConsole_onShow : function() {
		this.abRiskMsdsRptByProGrid.refresh(this.getRes());
		this.abRiskMsdsRptByProGridSouth.show(false);
	},
	/**
	* get restriction of abRiskMsdsRptByProConsole
	*/
	getRes: function(){
		var res="1=1 ";
		var ghsId=this.abRiskMsdsRptByProConsole.getFieldValue('msds_data.ghs_id');
		var proName=this.abRiskMsdsRptByProConsole.getFieldValue('msds_data.product_name');
		var cheName=this.abRiskMsdsRptByProConsole.getFieldValue('msds_data.chemical_name');
		var proId=this.abRiskMsdsRptByProConsole.getFieldValue('provider_id');
		if(''!=ghsId){
			res=res+" and msds_data.ghs_id like '%"+convert2SafeSqlString(ghsId)+"%'";
		}
		if(''!=proName){
			res=res+ " and msds_data.product_name='"+convert2SafeSqlString(proName)+"'";
		}
		if(''!=cheName){
			
			res=res+" and msds_data.chemical_name='"+convert2SafeSqlString(cheName)+"'";
		}if(''!=proId){
			res=res+" and (msds_data.distributor_id='"+convert2SafeSqlString(proId)+"' or  msds_data.manufacturer_id='"+convert2SafeSqlString(proId)+"' or  msds_data.preparer_id='"+convert2SafeSqlString(proId)+"')";
		}
		
		return res;
	}
});
//after click manifest 
function clickMsds(){
	var grid = abRiskMsdsRptByProController.abRiskMsdsRptByProGrid;
	var num = grid.selectedRowIndex;
	var rows = grid.rows;
	var res = '1=1';
	var msdsId = rows[num]['msds_data.msds_id'];
	var res=new Ab.view.Restriction();
	res.addClause('msds_constituent.msds_id', msdsId);
	abRiskMsdsRptByProController.abRiskMsdsRptByProGridSouth.refresh(res);
}
