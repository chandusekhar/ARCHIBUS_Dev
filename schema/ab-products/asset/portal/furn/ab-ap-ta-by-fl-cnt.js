var ctrlAbApTaByFlCnt = View.createController('abApTaByFlCntCtrl', {
	afterViewLoad: function(){
		this.list_abApTaByFlCnt_fnstd.buildPostFooterRows = addTotalRow;
	}
})
