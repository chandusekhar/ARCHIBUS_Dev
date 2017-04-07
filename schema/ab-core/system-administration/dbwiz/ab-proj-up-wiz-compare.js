var compDataDictController = View.createController('compDataDict_ctrl', {
	wizardController:null,
	
	afterInitialDataFetch:function(){
		this.afmFldsTransCompare_grid.refresh();
		this.wizardController = View.getOpenerView().controllers.get('tabsController');
	},
	fieldsToShow_onBack:function(){
		goToTabName(this.wizardController.updProjWizTabs, 'specifyTables');
	}
});

function checkHideMLHeading(){
	if(document.getElementById("ml_heading").checked){
		compDataDictController.afmFldsTransCompare_grid.addParameter('hideMLRestr',"afm_flds_trans.change_type NOT IN ('ML_HEADING')");
	}else{
		compDataDictController.afmFldsTransCompare_grid.addParameter('hideMLRestr',"1=1");
	}
	compDataDictController.afmFldsTransCompare_grid.refresh();
}

function checkHideNew(){
	if(document.getElementById("new").checked){
		compDataDictController.afmFldsTransCompare_grid.addParameter('hideNewRestr',"afm_flds_trans.change_type NOT IN ('TBL_IS_NEW', 'NEW')");
	}else{
		compDataDictController.afmFldsTransCompare_grid.addParameter('hideNewRestr',"1=1");
	}
	compDataDictController.afmFldsTransCompare_grid.refresh();
}

function checkHideFieldSize(){
	if(document.getElementById("fieldSize").checked){
		compDataDictController.afmFldsTransCompare_grid.addParameter('hideSizeChgRestr',"afm_flds_trans.change_type NOT IN ('SIZE', 'DECIMALS')");
	}else{
		compDataDictController.afmFldsTransCompare_grid.addParameter('hideSizeChgRestr',"1=1");
	}
	compDataDictController.afmFldsTransCompare_grid.refresh();
}

function checkHideDataDictDiffs(){
	if(document.getElementById("dataDict").checked){
		compDataDictController.afmFldsTransCompare_grid.addParameter('hideDDChgRestr',"afm_flds_trans.data_dict_diffs IS NULL");
	}else{
		compDataDictController.afmFldsTransCompare_grid.addParameter('hideDDChgRestr',"1=1");
	}
	compDataDictController.afmFldsTransCompare_grid.refresh();
}