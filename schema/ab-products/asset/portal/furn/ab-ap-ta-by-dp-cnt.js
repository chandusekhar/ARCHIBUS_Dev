var ctrlAbApTaByDpCnt = View.createController('abApTaByDpCntCtrl', {
	afterViewLoad: function(){
		this.list_abApTaByDpCnt_fnstd.buildPostFooterRows = addTotalRow;
	}
})
