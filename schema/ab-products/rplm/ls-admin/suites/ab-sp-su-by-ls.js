View.createController('abSpSuByLsCtrl',{
	abSpSuByBl_detailsSu_afterRefresh: function(){
        var suPanel = this.abSpSuByLs_detailsSu;
        suPanel.setTitle(getMessage('setTitleForSu') + ' ' + suPanel.restriction['ls.ls_id']);
	}
})
