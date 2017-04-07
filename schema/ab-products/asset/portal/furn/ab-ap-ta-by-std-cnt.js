var ctrlAbApTaByStdCnt = View.createController('abApTaByStdCntCtrl', {
	afterViewLoad: function(){
		this.list_abApTaByStdCnt.buildPostFooterRows = addTotalRow;
	}
})
