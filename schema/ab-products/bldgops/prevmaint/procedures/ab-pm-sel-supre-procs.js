/**
 * @author Zhang Yi
 */
var selSupressProcsController = View.createController('selSuprePMP', {
    openerView: null,
    
    afterInitialDataFetch: function(){
        this.openerView = View.getOpenerView();
		//Restrict the procedure list to match: 
		//the same pmp_type, the same eq_std (if not null), and not the passed-in pmp_id. 
		var restriction = new Ab.view.Restriction();
		restriction.addClause('pmp.pmp_id', this.openerView.selectPmpId, '!=');
		restriction.addClause('pmp.pmp_type', this.openerView.selectPmpType, '=');
		if (this.openerView.selectEqStd){
			restriction.addClause('pmp.eq_std', this.openerView.selectEqStd, '=');
		}
		this.pmp_select.refresh(restriction);

		//Parse the suprress string, then check supressed procedures
		if(this.openerView.supressString){
			var selectedPMP = this.openerView.supressString.split(",");
			var pmpRows = this.pmp_select.rows;
			for (var i = 0; i <pmpRows.length; i++) {
				var pmp_id = pmpRows[i]['pmp.pmp_id'];
				for(var j=0;j<selectedPMP.length;j++){
					if(selectedPMP[j]=="'"+pmp_id+"'"){
						this.pmp_select.getDataRows()[i].firstChild.firstChild.checked=true;//Retrieve code from Api, it looks the grid.selectRow(index) could not work.
					}
				}
			}
		}
    },
    
    // ----------------------- event handlers -----------------------------------------------------
    
    pmp_select_onSave: function(){
		var supressString="";
		var selRecs = this.pmp_select.getSelectedRecords();
		for (var i = 0; i <selRecs.length; i++) {
			if (i == 0) {
				supressString = supressString+"'"+selRecs[i].getValue("pmp.pmp_id")+"'";
			}
			else{
				supressString = supressString+","+"'"+selRecs[i].getValue("pmp.pmp_id")+"'";
			}
		}
        this.openerView.pmp_detail.setFieldValue("pmp.pmp_ids_to_suppress", supressString);
		this.openerView.closeDialog();
    },
		
	pmp_select_onCancel: function(){ 
		this.openerView.closeDialog();
	}

});
