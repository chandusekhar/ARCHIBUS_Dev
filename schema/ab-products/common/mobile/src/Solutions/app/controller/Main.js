Ext.define('Solutions.controller.Main', {
    extend: 'Ext.app.Controller',

    config: {
        viewCache: [],

        refs: {
            nav: '#mainNestedList',
            main: 'main',
            toolbar: 'main titlebar',
            sourceButton: 'button[action=viewSource]',

            sourceOverlay: {
                selector: 'sourceoverlay',
                xtype: 'sourceoverlay',
                autoCreate: true
            },

            backToAppLauncherButton: 'button[action=backToAppLauncher]'

        },

        control: {
            nav: {
                itemtap: 'onNavTap',
                back: 'onNavBack'

            },
            sourceButton: {
                tap: 'onSourceTap'
            }
        },

        routes: {
            'demo/:id': 'showViewById',
            'menu/:id': 'showMenuById',
            '': 'showMenuById'
        },

        currentDemo: undefined
    },

    init: function() {
        // Clean up any left over routes when starting up
        parent.location.hash = '';
    },

    /**
     * Finds a given view by ID and shows it. End-point of the "demo/:id" route
     */
    showViewById: function (id) {
        var nav = this.getNav(),
            view = nav.getStore().getNodeById(id);

        this.showView(view);
        this.setCurrentDemo(view);
    },

    showView: function(item) {
        var nav = this.getNav(),
            view = this.createView(item),
            main = this.getMain(),
            anim = item.get('animation'),
            layout = main.getLayout(),
            initialAnim = layout.getAnimation(),
            newAnim;

        if (anim) {
            layout.setAnimation(anim);
            newAnim = layout.getAnimation();
        }

        nav.setDetailContainer(main);
        nav.setDetailCard(view);
        nav.goToNode(item.parentNode);
        nav.goToLeaf(item);
        nav.getActiveItem().select(item);

        if (newAnim) {
            newAnim.on('animationend', function () {
                layout.setAnimation(initialAnim);
            }, this, { single: true });
        }

        this.getToolbar().setTitle(item.get('text'));
        this.getSourceButton().setHidden(false);
    },

    createView: function (item) {
        var name = this.getViewName(item),
            cache = this.getViewCache(),
            ln = cache.length,
            limit = item.get('limit') || 20,
            view, i = 0, j, oldView;

        for (; i < ln; i++) {
            if (cache[i].viewName === name) {
                return cache[i];
            }
        }

        if (ln >= limit) {
            for (i = 0, j = 0; i < ln; i++) {
                oldView = cache[i];
                if (!oldView.isPainted()) {
                    oldView.destroy();
                } else {
                    cache[j++] = oldView;
                }
            }
            cache.length = j;
        }

        view = Ext.create(name);
        view.viewName = name;
        cache.push(view);
        this.setViewCache(cache);

        return view;
    },

    getViewName: function (item) {
        var name = item.get('view') || item.get('text'),
            ns = 'Solutions.view.';

        return ns + name;

    },

    /**
     * Shows the source code for the {@link #currentDemo} in an overlay
     */
    onSourceTap: function () {
        var overlay = this.getSourceOverlay(),
            demo = this.getCurrentDemo();

        Network.checkNetworkConnectionAndDisplayMessageAsync(function(isConnected) {
            if (isConnected) {
                if (!overlay.getParent()) {
                    Ext.Viewport.add(overlay);
                }

                overlay.show();

                overlay.setMasked({
                    xtype: 'loadmask',
                    message: 'Loading Source'
                });

                if (demo) {
                    Ext.Ajax.request({
                        url: 'app/view/' + (demo.get('view') || demo.get('text')) + '.js',
                        callback: function (request, success, response) {
                            setTimeout(function () {
                                overlay.unmask();
                                overlay.setHtml(response.responseText);
                            }, 500);
                        }
                    });
                }
            }
        });
    },

    onNavBack: function(list, node) {
        if(list._backButton._hidden) {
            this.getBackToAppLauncherButton().setHidden(false);
        }

        if (node.isLeaf()) {
            this.getSourceButton().setHidden(true);
        }
    }

});