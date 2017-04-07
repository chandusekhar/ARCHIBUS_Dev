Ext.define('Solutions.controller.phone.Main', {
    extend: 'Solutions.controller.Main',

    config: {
        control: {
            'button[action=sourceDone]': {
                tap: 'onSourceDone'
            }
        }
    },

    /**
     * This is called whenever the user taps on an item in the main navigation NestedList
     */
    onNavTap: function(nestedList, list, index) {
        var record = list.getStore().getAt(index);

        // Hide Back to Apps button
        this.getBackToAppLauncherButton().setHidden(true);

        if (record.isLeaf()) {
            this.redirectTo(record);
        } else {
            this.getApplication().getHistory().add(Ext.create('Ext.app.Action', {
                url: 'menu/' + record.get('id')
            }));
        }
    },

    /**
     * In the Phone Profile only we support routing through to a menu page (urls like "menu/ui"). This function
     * just sets everything up to show that menu
     */
    showMenuById: function(id) {
        var nav  = this.getNav(),
            store = nav.getStore(),
            item = (!id || id === 'root') ? store.getRoot() : store.getNodeById(id);

        if (item) {
            nav.goToNode(item);
            this.getSourceButton().setHidden(true);
            this.getSourceOverlay().setHidden(true);
        }
    },

    /**
     * For a given Demo model instance, shows the appropriate view. This is the endpoint for all routes matching
     * 'demo/:id', so is called automatically whenever the user navigates back or forward between demos.
     * @param {Kitchensink.model.Demo} item The Demo model instance for which we want to show a view
     */
    showView: function(item) {
        var nav    = this.getNav(),
            view   = this.createView(item),
            layout = nav.getLayout(),
            anim   = item.get('animation'),
            initialAnim = layout.getAnimation(),
            newAnim;

        if (anim) {
            layout.setAnimation(anim);
            newAnim = layout.getAnimation();
        }

        nav.setDetailCard(view);
        nav.goToNode(item.parentNode);
        nav.goToLeaf(item);

        if (newAnim) {
            newAnim.on('animationend', function() {
                layout.setAnimation(initialAnim);
            }, this, { single: true });
        }

        this.getSourceButton().setHidden(false);
    },

    onSourceDone: function() {
        this.getSourceOverlay().hide();
    }



});