View.createController('abSpSuByBlCtrl',{
	abSpSuByBl_detailsSu_afterRefresh: function(){
        var suPanel = this.abSpSuByBl_detailsSu;
        suPanel.setTitle(getMessage('setTitleForSu') + ' ' + suPanel.restriction['bl.bl_id']);
	}
})
