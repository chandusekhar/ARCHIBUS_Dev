/**
 * Controller of the BudgetAnalysis dashboard main controller
 * @author ZhangYi
 */
var dashBudgetAnalysisMainController = View.createController('dashBudgetAnalysisMainController', {

    // restriction of the tree filter
    treeRes: " 1=1 ",
    
    // the selected year in the cosole filter
	isCalYear:true,
	year: null,

    // the date range variables calculated from above selected year
	dateStart:null,
	dateEnd:null,
    
    // the selected group by value in the console filter
    groupoption: null,
    
     // the selected work type value in the console filter
    worktype: null,

	//collection of the sub view controllers
    subViewControllers: [],

    afterInitialDataFetch: function(){
		View.controllers.get("dashTreeController").parentController = this;
	},    
    /**
     * sub dashboard chart will register their controller by calling this method
     * @param subViewController {Object} the view controller object of the sub view.
     */
    registerSubViewController: function(subViewController){
        this.subViewControllers.push(subViewController);
    },

	getSubControllerById:function(dashControllerId){
		if(this.subViewControllers){
			for (var i=0; i<this.subViewControllers.length;i++)
			{	
				if(this.subViewControllers[i].id == dashControllerId){
					return this.subViewControllers[i];
				}
			}
		}
		return null;
	},

	
	/**
     * refresh sub dash chart by calling refreshDashChart method of the sub view controller
     */
    refreshDashboard: function(){
		var restrictionWr = " 1=1 ";
		var restrictionBudget=" 1=1 ";
		//Construct sql restriction according to work type option
        if (this.workType == 'ondemand') {
			restrictionWr += " AND wr.prob_type!='PREVENTIVE MAINT' ";
			restrictionBudget += " AND budget_item.cost_cat_id in('MAINT - CORRECTIVE EXPENSE') ";
        } 
		else  if (this.workType == 'pm') {
		 	restrictionWr += " AND wr.prob_type='PREVENTIVE MAINT' ";
			restrictionBudget += " AND budget_item.cost_cat_id in('MAINT - PREVENTIVE EXPENSE') ";
         }
		 else{ 
			restrictionBudget += " AND budget_item.cost_cat_id in('MAINT - PREVENTIVE EXPENSE', 'MAINT - CORRECTIVE EXPENSE') ";
		 }

		var dateRangeRes = 	" AND (budget_item.date_start IS NULL OR budget_item.date_start <= ${sql.date('"+this.dateEnd+"')} )" 
									+ " AND ( budget_item.date_end IS NULL OR budget_item.date_end  >= ${sql.date('"+this.dateStart+"')} )";
		restrictionWr +=" AND "+this.treeRes.replace(/rm./g, "wr."); 
		restrictionWr += " AND wr.date_assigned >= ${sql.date('"+this.dateStart+"')} AND  wr.date_assigned <= ${sql.date('"+this.dateEnd+"')} ";

		restrictionBudget +=" AND "+this.treeRes.replace(/rm./g, "budget_item."); 
		restrictionBudget += dateRangeRes;

		//Set group parameter values according to group option
		var groupPara="";
		if(this.groupoption=='accode'){
			groupPara = 'wr.ac_id';
		}else if(this.groupoption=='blcode'){
			groupPara = 'wr.bl_id';
		}else{
			groupPara = "RTRIM(wr.dv_id)${sql.concat}'"+"-"+"'${sql.concat}RTRIM(wr.dp_id)";
		}
		for (var i = 0; i < this.subViewControllers.length; i++) {
			if( this.subViewControllers[i].id == "abBldgopsReportWrBudgetAndCostChartController" ){
				this.subViewControllers[i].refreshChart(restrictionWr,restrictionBudget, groupPara, this.dateStart, this.dateEnd);
			} else if( this.subViewControllers[i].id == "abBldgopsReportWrBudgetAndCostMonthChartController" ){
				this.subViewControllers[i].refreshChart(restrictionWr,restrictionBudget,this.year,this.isCalYear );
			} else if( this.subViewControllers[i].id == "abBldgopsReportComplWrBudgetAndCostChartController" ){
				this.subViewControllers[i].refreshChart(restrictionWr.replace(/date_assigned/g, "date_completed"),restrictionBudget, groupPara, this.dateStart, this.dateEnd );
			} else if( this.subViewControllers[i].id == "abBldgopsReportComplWrBudgetAndCostMonthChartController" ){
				this.subViewControllers[i].refreshChart(restrictionWr.replace(/date_assigned/g, "date_completed"),restrictionBudget,this.year, this.isCalYear);
			}
        }
    }
});
