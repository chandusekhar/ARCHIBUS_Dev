/**
 * @author: Song
 */
var controllerConsole = View.createController('controllerConsole', {
	/**
	 * EventHandler when we click previous button.
	 */
	previousEventHandler:null,
	/**
	 * EventHandler when we click next button.
	 */
	nextEventHandler:null,
	/**
	 * EventHandler when we click reject button.
	 */
	rejectEventHandler:null,
	/**
	 * EventHandler when we click save button.
	 */
	saveEventHandler:null,
	/**
	 * EventHandler when we click issue button.
	 */
	issueEventHandler:null,
	/**
	 * EventHandler when we click cancel2 button.
	 */
	cancelEventHandler:null,
	/**
	 * EventHandler when we click complete button.
	 */
	completeEventHandler:null,
	/**
	 * EventHandler when we click stop button.
	 */
	stopEventHandler:null,
	/**
	 * EventHandler when we click approve button.
	 */
	approveEventHandler:null,
	afterInitialDataFetch: function(){
		this.abHelpRequestTreeConsole.actions.get('previous').setTitle(getMessage('previous'));
	},
	/**
	 * Register registerCancel  by other view function call
	 */
	registerPrevious:function(registerFunction){
		this.previousEventHandler=registerFunction;
	},
	/**
	 * Register registerNext  by other view function call
	 */
	registerNext:function(registerFunction){
		this.nextEventHandler=registerFunction;
	},
	/**
	 * Register registerNext  by other view function call
	 */
	registerReject:function(registerFunction){
		this.rejectEventHandler=registerFunction;
	},
	/**
	 * Register registerNext  by other view function call
	 */
	registerSave:function(registerFunction){
		this.saveEventHandler=registerFunction;
	},
	/**
	 * Register registerNext  by other view function call
	 */
	registerIssue:function(registerFunction){
		this.issueEventHandler=registerFunction;
	},
	/**
	 * Register registerNext  by other view function call
	 */
	registerCancel:function(registerFunction){
		this.cancelEventHandler=registerFunction;
	},
	/**
	 * Register registerNext  by other view function call
	 */
	registerComplete:function(registerFunction){
		this.completeEventHandler=registerFunction;
	},
	/**
	 * Register registerNext  by other view function call
	 */
	registerStop:function(registerFunction){
		this.stopEventHandler=registerFunction;
	},
	/**
	 * Register registerNext  by other view function call
	 */
	registerApprove:function(registerFunction){
		this.approveEventHandler=registerFunction;
	},
	
	
	 /**
      * event handle when search button click.
      */
     abHelpRequestTreeConsole_onFilter: function(){
        var inputRestriction = this.abHelpRequestTreeConsole.getFieldRestriction();
		var restPart = "";
		for (var i = 0; i < inputRestriction.clauses.length; i++) {
			var clause = inputRestriction.clauses[i];
			if (clause.value==''||clause.value==0) {
				restPart = restPart + " AND " + clause.name +" "+clause.op+" ";
			} else {
				if(clause.op == "IN"){
					restPart = restPart + " AND " + clause.name +" "+clause.op + "(" + this.changeFormatForSqlIn(clause.value) + ")";
				}else{
					restPart = restPart + " AND " + clause.name +" "+clause.op + " '" + clause.value + "'";
				}
			}
		}
		if(View.controllers.get('abSpAsgnDpToRm_Controller')){
			var requestDate = abSpAsgnDpToRm_Controller.requestDate;
			restPart=" AND  rmcat.supercat!='VERT' AND ( EXISTS(SELECT 1 FROM rmpct ,bl where bl.bl_id=rmpct.bl_id and rmpct.bl_id =rm.bl_id and rmpct.fl_id=rm.fl_id and rmpct.rm_id=rm.rm_id "+restPart+"and  " +
					" ( rmpct.dv_id = '${user.employee.organization.divisionId}' and rmpct.dp_id ='${user.employee.organization.departmentId}' or  '${user.employee.organization.departmentId}'='' and rmpct.dv_id = '${user.employee.organization.divisionId}' )  " +
					"AND (rmpct.date_start IS NULL OR rmpct.date_start <= ${sql.date('"+requestDate+"')}) AND (rmpct.date_end IS NULL OR rmpct.date_end >= ${sql.date('"+requestDate+"')}) AND rmpct.status IN (0, 1) )  " +
					"OR ( EXISTS(SELECT 1 FROM rmpct ,bl where bl.bl_id=rmpct.bl_id and rmpct.bl_id =rm.bl_id and rmpct.fl_id=rm.fl_id and rmpct.rm_id=rm.rm_id "+restPart+" AND " +
					"(rmpct.date_start IS NULL OR rmpct.date_start <= ${sql.date('"+requestDate+"')}) AND " +
							"(rmpct.date_end IS NULL OR rmpct.date_end >=${sql.date('"+requestDate+"')}) AND rmpct.status IN (0, 1) AND rmpct.dv_id is null AND rmpct.dp_id is null ) " +
									"AND NOT EXISTS(SELECT 1 FROM rmpct ,bl where bl.bl_id=rmpct.bl_id and rmpct.bl_id =rm.bl_id and rmpct.fl_id=rm.fl_id and rmpct.rm_id=rm.rm_id  "+restPart
									+"and rmpct.dv_id IS NOT NULL and rmpct.dp_id IS NOT NULL  AND (rmpct.date_start IS NULL OR rmpct.date_start <= ${sql.date('"+requestDate+"')}) " +
											"AND (rmpct.date_end IS NULL OR rmpct.date_end >= ${sql.date('"+requestDate+"')}) AND rmpct.status IN (0, 1))))";
		
			var abSpAsgnEmToRm_blTree = View.panels.get("abSpAsgnEmToRm_blTree")
			var blRes = " bl_id in (select distinct rm.bl_id from rm left join rmcat on rm.rm_cat =rmcat.rm_cat where  rmcat.occupiable = 1 and rm.dwgname IS NOT NULL "+ restPart +")";
			abSpAsgnEmToRm_blTree.addParameter('consoleResBl', blRes);
			var flRes = " fl_id in (select distinct rm.fl_id from rm  left join rmcat on rm.rm_cat =rmcat.rm_cat where rmcat.occupiable = 1 and  rm.dwgname IS NOT NULL  "+ restPart +" )";
			abSpAsgnEmToRm_blTree.addParameter('consoleResFl', flRes);
		}else{

			var abSpAsgnEmToRm_blTree = View.panels.get("abSpAsgnEmToRm_blTree")
				var blRes = " bl_id in (select distinct rm.bl_id from  rm left join rmcat on rm.rm_cat =rmcat.rm_cat  where  rmcat.occupiable = 1 and rm.dwgname IS NOT NULL and exists(select 1 from rmpct,bl where bl.bl_id=rmpct.bl_id and  rm.fl_id=rmpct.fl_id and rm.rm_id=rmpct.rm_id and  rm.bl_id = rmpct.bl_id "+restPart+"))";
				abSpAsgnEmToRm_blTree.addParameter('consoleResBl', blRes);
				var flRes = " fl_id in (select distinct rm.fl_id from  rm left join rmcat on rm.rm_cat =rmcat.rm_cat  where rmcat.occupiable = 1 and  rm.dwgname IS NOT NULL and exists(select 1 from rmpct,bl where bl.bl_id=rmpct.bl_id and  rm.fl_id=rmpct.fl_id and rm.rm_id=rmpct.rm_id and  rm.bl_id = rmpct.bl_id "+restPart+"))";
				abSpAsgnEmToRm_blTree.addParameter('consoleResFl', flRes);
		}
			
		abSpAsgnEmToRm_blTree.refresh();
		this.abSpAsgnEmToRm_blTree.show(true);
		//first tree node extend by default.
    	var root=abSpAsgnEmToRm_blTree.treeView.getRoot();
    	for (var i = 0; i < root.children.length; i++) {
            root.children[i].expand();
            break;
    	}
     },
     /**
      * private method
      * change array to String[key=value]
      */
     changeFormatForSqlIn: function(array){
    	 var result = "";
    	 if(array.length>1){
    		for(var i=0;i<array.length;i++){
    			result+="'"+array[i]+"',"
    		}
    		return result.substring(0,result.length-1);
    	 }
    	 return array;
     },
     abHelpRequestTreeConsole_onPrevious: function(){
    	 this.previousEventHandler();
    		
	},
	abHelpRequestTreeConsole_onQuestNext: function(){
   	 this.nextEventHandler();
	},
	
	abHelpRequestTreeConsole_onApprove: function(){
		this.approveEventHandler();
	},
	
	
	abHelpRequestTreeConsole_onReject: function(){
		this.rejectEventHandler();
	},
	
	abHelpRequestTreeConsole_onSave: function(){
		this.saveEventHandler();
	},

	abHelpRequestTreeConsole_onIssue: function(){
		this.issueEventHandler();
	},
	
	abHelpRequestTreeConsole_onCancel: function(){
		this.cancelEventHandler();
	},
	
	abHelpRequestTreeConsole_onComplete: function(){
		this.completeEventHandler();
	},
	
	abHelpRequestTreeConsole_onStop: function(){
		this.stopEventHandler();
	},
	
	showOrhideButton: function(array){
		for(var i=0;i<array.length;i++){
			this.abHelpRequestTreeConsole.actions.get(array[i][0]).show(array[i][1]);

		}
	}
	
	
});