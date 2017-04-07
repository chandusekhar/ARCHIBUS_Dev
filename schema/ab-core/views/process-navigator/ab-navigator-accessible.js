/**
 * Declare the namespace for the navigator JS classes.
 */
Ab.namespace('navigator');

/**
 * Accessibility Navigator toolbar control.
 */
Ab.navigator.AccessibilityToolbar = Ab.view.Component.extend({
    
    // Ab.view.Toolbar instance
    toolbar: null,

	// when loading myFavorites, store the current viewName to return when user returns via showDashboard/showMavigator
	cachedViewName: null,

    /**
     * Constructor.
     */
    constructor: function(id, configObject) {
        this.inherit(id, 'accessibilityToolbar', configObject);
    },
    
    /**
     * Control layout.
     */
    doLayout: function() {
        this.inherit();

        var region = this.getLayoutRegion();
        region.margins = '0 0 4 0';        

        this.toolbar = new Ab.view.Toolbar('mainToolbar', new Ab.view.ConfigObject({
        	// --- text replaced by an image defined in the .css.  Firefox needs the row of &nbsp; to expand the <div> element. ----
            title: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
            titleLink: 'http://www.archibus.com',
            buttons: [
                {id: 'accessibleHome', text: 'My Home', handler: this.onMyHome.createDelegate(this), minWidth:75},
                {id: 'accessibleFavorites', text: 'My Favorites', handler: this.onMyFavorites.createDelegate(this), minWidth:75},
                {id: 'accessibleLogout', text: 'Log Out', handler: this.onLogout.createDelegate(this), minWidth:75}
            ],
            cls: 'navigatorToolbar',
            layout: this.layout,
            region: this.region
        }));
        
        this.toolbar.navigatorToolbar = this;
        
        // IE6 creates extra DIVs for the main toolbar, which cause the scollbar to appear - remove them    
        var div = Ext.get('mainToolbar'); if (div) div.remove();
            div = Ext.get('mainToolbar'); if (div) div.remove();

        this.toolbar.doLayout();

        this.doKeyMap();
    },
    
    doKeyMap: function() {
		var i = 0;
		var delegateName = '';
		for (var i=0, butn; butn = this.toolbar.buttons[i]; i++) {			
			if (butn.id == 'accessibleHome') {
				delegateName = this.onMyHome;
				this.toolbar.homeButton = butn;
			}
			else if (butn.id == 'accessibleFavorites') {
				delegateName = this.onMyFavorites;
			}
			else if (butn.id == 'accessibleLogout') {
				delegateName = this.onLogout;
			}
			var map = new Ext.KeyMap(butn.getEl(), {
				key: Ext.EventObject.ENTER,
				fn: delegateName,
				scope: butn
			});
		}

	},


	/**
     * Display My Home view.
     */
    onMyHome: function() {
        var viewPanel = View.getControl('', 'viewContent');
        window.location = View.mainView;
    },
    
    
    /**
     * Display My Favorites view 
     */
    onMyFavorites: function() {       
		var viewPanel = View.getControl('', 'viewContent');
		this.cachedViewName = viewPanel.fileName;
        viewPanel.loadView('ab-my-favorites.axvw');
    },
    
    /**
     * Logout event handler.
     */
    onLogout: function() {
		if (View.sessionTimeoutDetected) {
			window.location = View.logoutView;
			return;
		}
		
        SecurityService.logout({
            callback: function(x, y, z) {
               window.location = View.logoutView;
            },
            errorHandler: function(message, e) {
                // DWR has its own session timeout check which may bypass our server-side timeout check
                if (message == 'Attempt to fix script session') {
                    window.location = View.logoutView;
                } else {
                    View.showException(e);
                }
            }
        });
    }


    
});

var accessibleController = View.createController('accessibleController', {
	/**
	 * Set focus to 'My Home' button once view has loaded for easy subsequent tab access to the view
	 */
    afterViewLoad: function(){
		var toolbar = View.getControl('mainToolbar');
		toolbar.homeButton.focus();
		jQuery("#mainToolbar_title").attr("title","ARCHIBUS - Go to Archibus.com");
	}
});



