var lsAreaMethodController = View.createController('lsAreaMethodCtrl', {
    afterInitialDataFetch: function(){
		this.formSchPref.fields.items[0].dom.remove(2);
		this.formSchPref.fields.items[0].dom.options[2].text = getMessage('opt_room');
    }
});