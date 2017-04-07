var abGbRptCertCreditsController = View.createController('abGbRptCertCreditsController',{
	 /**
     * on_click event handler for 'Show' action
     */
	fieldsArraysForRestriction: new Array(['gb_cert_credits.cert_std',,'gb_cert_credits.cert_std'], ['gb_cert_credits.cert_cat',,'gb_cert_credits.cert_cat'] ),
	fieldsArraysForDialogRestriction: new Array(['gb_cert_credits.cert_std',,'gb_cert_cat.cert_std'] ),
	/**
	 * Show grid 
	 */
	abGbRptCertCreditsConsole_onShow: function(){
		var res=this.getConsoleRestriction();
        this.abGbRptCertCreditsGrid.refresh(res);
    },
    
    /**
     * Get restriction from console
     */
    getConsoleRestriction: function() {
		var console = View.panels.get('abGbRptCertCreditsConsole');
		var restriction = getRestrictionStrFromConsole(console, this.fieldsArraysForRestriction);		
		var creditType=console.getFieldValue("gb_cert_credits.credit_type");
		if(creditType!=''){
			restriction=restriction+" AND gb_cert_credits.credit_type='"+creditType+"'";
		}
		return restriction;
	},
    
    /**
     * Clear console 
     */
    abGbRptCertCreditsConsole_onClear: function(){
        this.abGbRptCertCreditsConsole.clear();
    },
    
    abGbRptCertCreditsConsole_onDoc: function(){
		 var res=this.getConsoleRestriction();
		 var ds = this.abGbRptCertCreditsConsoleDS;
		 var printableRestrictions=this.getResParameters();
		 var creditTypeEnumValues = ds.fieldDefs.items[ds.fieldDefs.indexOfKey('gb_cert_credits.credit_type')].enumValues;
		//paired parameter names with parameter values
		 var parameters = {
				 'certPram':res,
				 'credit':creditTypeEnumValues['C'],
				 'prerequisite':creditTypeEnumValues['P'],
				 'printRestriction':true, 
				 'printableRestriction':printableRestrictions
		 };
		//passing parameters
		 View.openPaginatedReportDialog('ab-gb-rpt-cert-credits-paginate.axvw', null, parameters);
    	
    },
    getResParameters:function(){
		var printableRestrictions = [];
		if(this.abGbRptCertCreditsConsole.getFieldValue('gb_cert_credits.cert_std')){
			printableRestrictions.push({'title': getMessage('certStd'), 'value': this.abGbRptCertCreditsConsole.getFieldValue('gb_cert_credits.cert_std')});
		}
		if(this.abGbRptCertCreditsConsole.getFieldValue('gb_cert_credits.cert_cat')){
			printableRestrictions.push({'title': getMessage('certCat'), 'value': this.abGbRptCertCreditsConsole.getFieldValue('gb_cert_credits.cert_cat')});
		}
		if(this.abGbRptCertCreditsConsole.getFieldValue('gb_cert_credits.credit_type')){
			printableRestrictions.push({'title': getMessage('creditType'), 'value': this.abGbRptCertCreditsConsole.getFieldValue('gb_cert_credits.credit_type')});
		}
		return printableRestrictions;
	},
    /**
     * Execute after grid refresh
     */
    abGbRptCertCreditsGrid_afterRefresh:function(){
    	replaceType();
    }
})

/**
 * Replace The field creditType
 */
function replaceType(){
    var grid = abGbRptCertCreditsController.abGbRptCertCreditsGrid;
    var rows = grid.rows;
    var rs = new Array();
    for (var i = 0; i <= rows.length - 1; i++) {
        var cred = rows[i];
        var credType = cred['gb_cert_credits.creditType'];
        var type = cred['gb_cert_credits.credit_type'];
        var t = credType.substring(1);
        credType = type + t;
        rs[i] = credType;
    }
    var n = 0;
    abGbRptCertCreditsController.abGbRptCertCreditsGrid.gridRows.each(function(row){
    	row.record["gb_cert_credits.credit"]=rs[n];
        row.cells.get(3).dom.firstChild.data = rs[n];
        n++;
    });
}

/**
 * Select gb_cert_credits.cert_cat field value by gb_cert_credits.cert_std when we click on Category ID in filter panel
 */
function selectValue(){
	var console = View.panels.get('abGbRptCertCreditsConsole');
	var restriction = getRestrictionStrFromConsole(console, abGbRptCertCreditsController.fieldsArraysForDialogRestriction);	
	View.selectValue("abGbRptCertCreditsConsole",getMessage('catId'),["gb_cert_credits.cert_cat"],"gb_cert_cat",["gb_cert_cat.cert_cat"],["gb_cert_cat.cert_std","gb_cert_cat.cert_cat","gb_cert_cat.cat_name"],restriction, null , false , true ,null , 800, 600, "multiple");
}

