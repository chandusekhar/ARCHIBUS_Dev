/**

* @author lei

*/
var assignConsoleController = View.createController('assignConsoleController',
{	
	mainController:'',
	
	consoleReglocArraysForRes: new Array(),
	consoleRegulationArraysForRes1: new Array(['regulation.reg_cat'], ['regulation.reg_type']),
	consoleRegprogramArraysForRes1: new Array( ['regprogram.regprog_cat'], ['regprogram.regprog_type'], ['regprogram.project_id']),
	consoleRegrequireArraysForRes1: new Array(['regrequirement.regulation'],['regrequirement.reg_program'], ['regrequirement.reg_requirement'], ['regrequirement.regreq_cat'], ['regrequirement.regreq_type']),
	consoleEmAndVnArraysForRequire1: new Array(['regrequirement.em_id'], ['regrequirement.vn_id']),
	
	//for program console
	consoleRegulationArraysForRes2: new Array(['regulation.reg_cat'], ['regulation.reg_type']),
	consoleRegprogramArraysForRes2: new Array( ['regrequirement.regulation' ,'like','regprogram.regulation'],
												['regrequirement.reg_program' ,'like','regprogram.reg_program'] ,
												['regprogram.regprog_cat'], ['regprogram.regprog_type'], ['regprogram.project_id']),
	consoleRegrequireArraysForRes2: new Array( ['regrequirement.regreq_cat'], ['regrequirement.regreq_type']),
	consoleEmAndVnArraysForRequire2: new Array(['regrequirement.em_id'], ['regrequirement.vn_id']),
	consoleEmAndVnArraysForProgram2: new Array(['regprogram.em_id'], ['regprogram.vn_id']),
	
	//for program console
	consoleRegulationArraysForRes3: new Array(['regulation.reg_class'],
											['regulation.authority'],['regulation.citation','like','regulation.citation'],
											['regulation.related_reg'],['regulation.reg_cat'],['regulation.reg_type']),
	consoleRegulationArray3: new Array( ['regrequirement.regulation' ,'like','regulation.regulation']),
	consoleRegulationArrayForHie3: new Array( ['regrequirement.regulation' ,'like','regulation.hierarchy_ids']),
	
	
	
	/**
	 * Control panel display
	 */
	afterInitialDataFetch: function(){
		this.mainController=View.getOpenerView().controllers.get('assignController');
		
		if(this.mainController.currentCompliance=='requirementGrid'){
			this.filterButtonForProgram.show(false);
			this.filterButtonForRegulation.show(false);
		}else if(this.mainController.currentCompliance=='programGrid'){
			this.filterButtonForRequirement.show(false);
			this.filterButtonForRegulation.show(false);
			
		}else if(this.mainController.currentCompliance=='regulationGrid'){
			this.filterButtonForRequirement.show(false);
			this.filterButtonForProgram.show(false);
		}
	},
  
	
	/**
	 * Filter requirement
	 */
	filterButtonForRequirement_onFilter:function(){
		
		 var res=' 1=1 '; 
		 var res1=getRestrictionStrFromConsole(this.filterButtonForRequirement, this.consoleRegulationArraysForRes1);
		 var res2=getRestrictionStrFromConsole(this.filterButtonForRequirement, this.consoleRegprogramArraysForRes1);
		 var res3=getRestrictionStrFromConsole(this.filterButtonForRequirement, this.consoleRegrequireArraysForRes1);
		 var res4=getRestrictionStrFromConsole(this.filterButtonForRequirement, this.consoleEmAndVnArraysForRequire1);
		 var dateRes=this.getDateRestriction('filterButtonForRequirement');
		 
		 res=res1+" AND "+res2+" AND "+res3 +" AND " +res4+" AND ("+dateRes+")";
		 
		 View.getOpenerView().panels.get(this.mainController.currentCompliance).refresh(res);
		
	},
	
	/**
	 * Filter Program
	 */
	filterButtonForProgram_onFilter:function(){
		 var res=' 1=1 '; 
		 var res1=getRestrictionStrFromConsole(this.filterButtonForProgram, this.consoleRegulationArraysForRes2);
		 var res2=getRestrictionStrFromConsole(this.filterButtonForProgram, this.consoleRegprogramArraysForRes2);
		 
		
		 var res4=getRestrictionStrFromConsole(this.filterButtonForProgram, this.consoleEmAndVnArraysForProgram2);
		 var dateRes=this.getDateRestriction('filterButtonForProgram');
		 
		 res=res1+" AND "+res2+" AND " +res4+" AND ("+dateRes+")";
		 
		 View.getOpenerView().panels.get(this.mainController.currentCompliance).refresh(res);
	},
	
	

	/**
	 * Filter Regulation
	 */
	filterButtonForRegulation_onFilter:function(){
		
		 var res=' 1=1 '; 
		 var res1=getRestrictionStrFromConsole(this.filterButtonForRegulation, this.consoleRegulationArraysForRes3);
		
	 	var res4=getRestrictionStrFromConsole(this.filterButtonForRegulation, this.consoleRegulationArray3);
	 	var res5=getRestrictionStrFromConsole(this.filterButtonForRegulation, this.consoleRegulationArrayForHie3);
		 	
		 	res=res1 ;
			
			if(res5.indexOf('AND')!=-1){
				if($("childId").checked){
					res=res+" AND "+res5;
				}else{
					res=res+" AND "+res4;
				}
			}
				
		 
		 View.getOpenerView().panels.get(this.mainController.currentCompliance).refresh(res);
	},
	
	/**
	 * Clear requirement
	 */
	filterButtonForRequirement_onClear:function(){
		this.filterButtonForRequirement.clear();
	},
	
	/**
	 * Clear Program
	 */
	filterButtonForProgram_onClear:function(){
		this.filterButtonForProgram.clear();
	},
	
	/**
	 * Clear Regulation
	 */
	filterButtonForRegulation_onClear:function(){
		this.filterButtonForRegulation.clear();
		$('childId').checked=false;		
	},
	
	/**
	 * Get console restriction string
	 */
	getDateRestriction:function(panel){
		var dateRes=" 1=1";
		
		if(panel=='filterButtonForRequirement'){
			dateRes = this.getDateString("filterButtonForRequirement","regrequirement");
			
		}else if(panel=='filterButtonForProgram'){
			dateRes = this.getDateString("filterButtonForProgram", "regprogram");
		}
		
		return dateRes;
	},
	
	/**
	 * Get common date string for generating date restriction.
	 */
	getDateString:function(panelName,tableName){
		
		var dateRes=" 1=1";
		var date_start="1900-01-01";
		var date_end="2200-01-01";
		
		 	date_start=View.panels.get(panelName).getFieldValue(tableName+".date_start");
		 	date_end=View.panels.get(panelName).getFieldValue(tableName+".date_end");
		 	
			if(date_start==""){
				date_start="1900-01-01";
			}
			if(date_end==""){
				date_end="2200-01-01";
			}
		
			dateRes=" ("+tableName+".date_start >= ${sql.date('"+date_start+"')} " +" and "+tableName+".date_start <= ${sql.date('"+date_end+"')}) " +
		"or("+tableName+".date_end >= ${sql.date('"+date_start+"')} " +"and "+tableName+".date_end <= ${sql.date('"+date_end+"')} ) " +
		" or("+tableName+".date_start is null and "+tableName+".date_end is null) "+
		" or("+tableName+".date_start <= ${sql.date('"+date_start+"')} " +" and "+tableName+".date_end >= ${sql.date('"+date_end+"')}) ";
			
			return dateRes;
	}
	

});