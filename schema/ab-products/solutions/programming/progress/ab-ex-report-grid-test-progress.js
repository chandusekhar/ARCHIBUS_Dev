var myController = View.createController('myController', {

reportGridIndexLarge_grid_onRefresh: function() {
    View.openProgressBar("Loading Employees Records...");

    var refresh = function() {
        var panel = View.panels.get('reportGridIndexLarge_grid');
        panel.refresh();
        View.closeProgressBar();
    }
    refresh.defer(100);
},

reportGridIndexLarge_grid_beforeRefresh: function() {
	View.openProgressBar("Refreshing Records...");
},

reportGridIndexLarge_grid_afterRefresh: function() {
	View.closeProgressBar();
}

});