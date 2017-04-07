var ctrlAbApTaByRmCnt = View.createController('abApTaByRmCntCtrl', {
	afterViewLoad: function(){
		this.list_abApTaByRmCnt_fnstd.buildPostFooterRows = addTotalRow;
	}
})
