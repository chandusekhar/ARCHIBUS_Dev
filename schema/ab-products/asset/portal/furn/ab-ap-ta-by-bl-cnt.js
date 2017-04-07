var ctrlAbApTaByBlCnt = View.createController('abApTaByBlCntCtrl', {
	afterViewLoad: function(){
		this.list_abApTaByBlCnt_fnstd.buildPostFooterRows = addTotalRow;
	}
})
