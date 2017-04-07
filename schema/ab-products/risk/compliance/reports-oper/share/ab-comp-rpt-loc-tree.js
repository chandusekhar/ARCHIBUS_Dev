var treeController = View.createController('treeController', {
	mainController:'',
	ctryArr:[],
	regnArr:[],
	stateArr:[],
	cityArr:[],
	siteArr:[],
	propertyArr:[],
	blArr:[],
	flArr:[],
	rmArr:[],
	eqArr:[],
	regArr:[],
	programArr:[],
	requireArr:[],
	
	afterViewLoad: function() {
		
		setTreeMultipleCheckBox('abSpAsgnEmToRm_blTree',10);
		this.abSpAsgnEmToRm_blTree.show(false);
		this.showTree.defer(1000);
		
	},
	
	onMultipleSelectionChange:function(row){
	},
	
	afterInitialDataFetch: function(){
		//Get sub main controller
		this.mainController=mainController;
		if(this.abSpAsgnEmToRm_blTree.actions.get('abSpAsgnEmToRm_blTree_showAsDialog')){
			this.abSpAsgnEmToRm_blTree.actions.get('abSpAsgnEmToRm_blTree_showAsDialog').show(false);
		}
	},
	
	/**
	 * Load tree first time and add lisener for tree expand action.
	 */
	showTree:function(){
		
		treeController.abSpAsgnEmToRm_blTree.show(true);
		
	},
	/**
	 * Show button for tree
	 */
	abSpAsgnEmToRm_blTree_onShow:function(){
		var params=this.getLocResArray();
		this.mainController.refreshCenterTabs(params);
		
	},
    clearRestriction:function(){
    	this.abSpAsgnEmToRm_blTree.unselectAll();
    },
    
    /**
     * Get node restriction
     */
    getLocResArray:function(){
    	var tree=this.abSpAsgnEmToRm_blTree;
    	var ctrys = tree.getSelectedRecords(0);
    	var regns = tree.getSelectedRecords(1);
    	var states = tree.getSelectedRecords(2);
    	var citys = tree.getSelectedRecords(3);
    	var sites = tree.getSelectedRecords(4);
    	var propertys = tree.getSelectedRecords(5);
    	var bls = tree.getSelectedRecords(6);
    	var fls = tree.getSelectedRecords(7);
    	var rms = tree.getSelectedRecords(8);
    	var eqs = tree.getSelectedRecords(9);
  	
    	
    	var params=new Array(ctrys,regns,states,citys,sites,propertys,bls,fls,rms,eqs);
    	return params;
    },
    
    getResArray:function(){
    	var tree=this.abSpAsgnEmToRm_blTree;
    	var ctrys = tree.getSelectedRecords(0);
    	var regns = tree.getSelectedRecords(1);
    	var states = tree.getSelectedRecords(2);
    	var citys = tree.getSelectedRecords(3);
    	var sites = tree.getSelectedRecords(4);
    	var propertys = tree.getSelectedRecords(5);
    	var bls = tree.getSelectedRecords(6);
    	var fls = tree.getSelectedRecords(7);
    	var rms = tree.getSelectedRecords(8);
    	var eqs = tree.getSelectedRecords(9);
  	
    	var regulations=this.mainController.regTreeController.treeRegcomp.getSelectedRecords(0);
    	var programs=this.mainController.regTreeController.treeRegcomp.getSelectedRecords(1);
    	var requires=this.mainController.regTreeController.treeRegcomp.getSelectedRecords(2);
    	
    	
    	
    	var params=new Array(ctrys,regns,states,citys,sites,propertys,bls,fls,rms,eqs,regulations,programs,requires);
    	return params;
    },
    
    /**
     * Drop unuse code.
     */
    generateArray:function(params,levelsArr,levelFields){
    	for(var i=0;i<params.length;i++){
    		var param=params[i];
	    	for(var j=0;j<param.length;j++){
	    		levelsArr[i].push(param[j]);
	    	}
    	}
    }
})

