var mngCostAccountController = View.createController('mngCostAccountCtrl',{
	viewMode:'account',
	search:{
		'ac_id':'',
		'description':''
	},
	selection:{
		type:'',
		id:''
	},
	afterViewLoad: function(){
		this.setLabels();
	},
	treeAccounts_onSearch: function(){
		this.consoleSearch.setFieldValue('ac.ac_id', this.search.ac_id);
	},
	treeAccounts_onShowAll: function(){
		this.search.ac_id = '';
		this.refreshTree();
		this.treeAccounts.actions.get('showAll').enable(false);
		this.treeAccounts.actions.get('showAll').config['enabled']= 'false';
	},
	consoleSearch_onSave: function(){
		this.search.ac_id = '';
		if(valueExistsNotEmpty(this.consoleSearch.getFieldValue('ac.ac_id'))){
			this.search.ac_id = this.consoleSearch.getFieldValue('ac.ac_id');
		}
		this.refreshTree();
		this.treeAccounts.actions.get('showAll').enable(true);
		this.treeAccounts.actions.get('showAll').config['enabled']= 'true';
	},
	setLabels:function(){
		$('labelSelectType').innerHTML = getMessage('label_select_type');
		$('selectTypeOptionOne').innerHTML = getMessage('option_select_type_one');
		$('selectTypeOptionTwo').innerHTML = getMessage('option_select_type_two');
		$('selectType').value = this.viewMode;
	},
	loadDetails: function(type, id){
		this.selection.type = type;
		this.selection.id = id;
		this.viewWizardDetails.contentView.controllers.get('wizardDetailsCtrl').initializeDetails(this.selection.type, this.selection.id);
	},
	refreshTree: function(){
		if(valueExistsNotEmpty(this.search.ac_id)){
			this.treeAccounts.addParameter('subquery', " x.ac_id like '%"+this.search.ac_id+"%' ");
		}else{
			this.treeAccounts.addParameter('subquery', " 1 = 1 ");
		}
		this.treeAccounts.refresh();
	}
});

function changeWizard(){
	var selected = $('selectType').value;
	var targetUrl = View.getBaseUrl()+ "/ab-rplm-cost-mgmt-costs-wiz-ls-bl-pr.axvw";
	this.location.href = targetUrl;
}

function showDetails(event){
	var node = mngCostAccountController.treeAccounts.lastNodeClicked;
	var level = node.depth;
	var type = 'account';
	var nodeId = node.data['ac.ac_id'];
	mngCostAccountController.loadDetails(type, nodeId);
}
