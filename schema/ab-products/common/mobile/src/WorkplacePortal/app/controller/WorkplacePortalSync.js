Ext.define('WorkplacePortal.controller.WorkplacePortalSync', {
    extend: 'Ext.app.Controller',

    requires: [
        'Common.util.SynchronizationManager',
        'Common.util.Mask',
        'Common.service.workflow.Workflow',
        'WorkplacePortal.util.WorkflowRules'
    ],

    config: {
        refs: {
            mainView: 'mainview',
            syncServiceDeskRequestsButton: 'button[itemId=syncServiceDeskRequestsButton]',
            syncReservationRequestsButton: 'button[itemId=syncReservationRequestsButton]',
            syncHotelingBookingsButton: 'button[itemId=syncHotelingBookingsButton]'
        },
        control: {
            syncServiceDeskRequestsButton: {
                tap: 'onSyncServiceDeskRequests'
            },
            syncReservationRequestsButton: {
                tap: 'onSyncReservationRequests'
            },
            syncHotelingBookingsButton: {
                tap: 'onSyncHotelingBookings'
            }
        }
    },

    // Buffer the button tap events to prevent multiple sync actions from being fired when a button is tapped rapidly

    onSyncServiceDeskRequests: (function() {
        var isTapped = false;
        return function(button) {
            if(!isTapped) {
                isTapped = true;
                WorkplacePortal.util.SyncHelper.syncServiceDeskRequests(button.activityType);
            }
            setTimeout(function() {
                isTapped = false;
            }, 500);
        };
    })(),

    onSyncReservationRequests: (function(){
        var isTapped = false;
        return function() {
            if(!isTapped) {
                isTapped = true;
                WorkplacePortal.util.Reservation.onSyncReservationRequestsButton();
            }
            setTimeout(function() {
                isTapped = false;
            }, 500);
        };
    })(),

    onSyncHotelingBookings: (function() {
        var isTapped = false;
        return function() {
            if(!isTapped) {
                isTapped = true;
                WorkplacePortal.util.Hoteling.onSyncHotelingBookingsButton();
            }
            setTimeout(function() {
                isTapped = false;
            }, 500);
        };
    })()

});