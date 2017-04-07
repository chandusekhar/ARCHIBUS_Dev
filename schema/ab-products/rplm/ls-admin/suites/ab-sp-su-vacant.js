View.createController('abSpSuVacantCtrl',{
	abSpSuVacant_detailsSu_afterRefresh: function(){
        var suPanel = this.abSpSuVacant_detailsSu;
        suPanel.setTitle(getMessage('setTitleForSu') + ' ' + suPanel.restriction['bl.bl_id']);
	}
})
