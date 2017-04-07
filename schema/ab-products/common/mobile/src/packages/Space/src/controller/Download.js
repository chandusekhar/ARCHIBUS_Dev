/**
 * Download controller for the Space Data Download and Floorplan Downloads
 * @author Jeff Martin
 * @since 22.1
 */
Ext.define('Space.controller.Download', {
    extend: 'Ext.app.Controller',

    config: {
        refs: {
            mainView: 'mainview',
            floorsListView: 'floorsListPanel',
            siteView: 'sitePanel',
            siteList: 'siteListPanel',
            downloadActionButtonPicker: 'mainview buttonpicker[itemId=downloadActionPicker]'
        },
        control: {
            'button[itemId=downloadData]': {
                tap: function () {
                    this.onDownloadData();
                }
            },
            downloadActionButtonPicker: {
                itemselected: function (value) {
                    var navBar = this.getMainView().getNavigationBar(),
                        currentView = navBar.getCurrentView();

                    if (value.get('action') === 'start') {
                        if (currentView) {
                            if (currentView.xtype === 'mainview') {
                                this.onDownloadFloorPlans('all');
                            } else if (currentView.xtype === 'sitePanel') {
                                this.onDownloadFloorPlans('site');
                            } else if (currentView.xtype === 'floorsListPanel') {
                                this.onDownloadFloorPlans('building');
                            }
                        }
                    }
                }
            },

            progressbarpanel: {
                cancel: function () {
                    Space.SpaceDownload.onCancelProgress();
                },
                complete: function () {
                    Space.SpaceDownload.onCompleteProgress();
                }
            }
        }
    },

    // Prevent multiple fast button taps from starting multiple service calls
    onDownloadFloorPlans: (function () {
        var isTapped = false;
        return function (level) {
            if (!isTapped) {
                isTapped = true;
                Space.SpaceDownload.downloadFloorPlans(level, this, true, false);
                setTimeout(function () {
                    isTapped = false;
                }, 500);
            }
        };
    })(),

    onDownloadData: (function () {
        var isTapped = false;
        return function () {
            if (!isTapped) {
                isTapped = true;
                Space.SpaceDownload.onDownloadData(this);
                setTimeout(function () {
                    isTapped = false;
                }, 500);
            }
        };
    })()
});