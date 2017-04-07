(function () {
    var root,
        animations = {
            text: 'Animations',
            card: false,
            id: 'animations',
            items: [
                {
                    text: 'Slide',
                    id: 'Slide',
                    items: [
                        {
                            text: 'Slide Left',
                            id: 'SlideLeft',
                            view: 'SlideLeft',
                            card: false,
                            animation: {
                                type: 'slide'
                            },
                            leaf: true
                        },
                        {
                            text: 'Slide Right',
                            card: false,
                            id: 'SlideRight',
                            view: 'SlideRight',
                            animation: {
                                type: 'slide',
                                direction: 'right'
                            },
                            leaf: true
                        },
                        {
                            text: 'Slide Up',
                            card: false,
                            id: 'SlideUp',
                            view: 'SlideUp',
                            animation: {
                                type: 'slide',
                                direction: 'up'
                            },
                            leaf: true
                        },
                        {
                            text: 'Slide Down',
                            card: false,
                            id: 'SlideDown',
                            view: 'SlideDown',
                            animation: {
                                type: 'slide',
                                direction: 'down'
                            },
                            leaf: true
                        }
                    ]
                },
                {
                    text: 'Fade',
                    id: 'Fade',
                    card: false,
                    animation: {
                        type: 'fade',
                        duration: 500
                    },
                    leaf: true
                }
            ]
        };

    if (!Ext.browser.is.AndroidStock2) {
        animations.items.push({
                text: 'Cover',
                id: 'Cover',
                items: [
                    {
                        text: 'Cover Left',
                        card: false,
                        view: 'CoverLeft',
                        id: 'CoverLeft',
                        animation: {
                            type: 'cover'
                        },
                        leaf: true
                    },
                    {
                        text: 'Cover Right',
                        card: false,
                        id: 'CoverRight',
                        view: 'CoverRight',
                        animation: {
                            type: 'cover',
                            direction: 'right'
                        },
                        leaf: true
                    },
                    {
                        text: 'Cover Up',
                        card: false,
                        view: 'CoverUp',
                        id: 'CoverUp',
                        animation: {
                            type: 'cover',
                            direction: 'up'
                        },
                        leaf: true
                    },
                    {
                        text: 'Cover Down',
                        card: false,
                        id: 'CoverDown',
                        view: 'CoverDown',
                        animation: {
                            type: 'cover',
                            direction: 'down'
                        },
                        leaf: true
                    }
                ]
            },
            {
                text: 'Reveal',
                id: 'Reveal',
                items: [
                    {
                        text: 'Reveal Left',
                        card: false,
                        id: 'RevealLeft',
                        view: 'RevealLeft',
                        animation: {
                            type: 'reveal'
                        },
                        leaf: true
                    },
                    {
                        text: 'Reveal Right',
                        card: false,
                        id: 'RevealRight',
                        view: 'RevealRight',
                        animation: {
                            direction: 'right',
                            type: 'reveal'
                        },
                        leaf: true
                    },
                    {
                        text: 'Reveal Up',
                        card: false,
                        id: 'RevealUp',
                        view: 'RevealUp',
                        animation: {
                            direction: 'up',
                            type: 'reveal'
                        },
                        leaf: true
                    },
                    {
                        text: 'Reveal Down',
                        card: false,
                        id: 'RevealDown',
                        view: 'RevealDown',
                        animation: {
                            direction: 'down',
                            type: 'reveal'
                        },
                        leaf: true
                    }
                ]
            }, {
                text: 'Pop',
                id: 'Pop',
                card: false,
                animation: {
                    type: 'pop'
                },
                leaf: true
            }, {
                text: 'Flip',
                id: 'Flip',
                card: false,
                animation: {
                    type: 'flip'
                },
                leaf: true
            });
    }

    root = {
        id: 'root',
        text: 'Solutions',
        items: [
            {
                text: 'Controls',
                id: 'controls',
                cls: 'launchscreen',
                items: [
                    {
                        text: 'Prompt',
                        leaf: false,
                        id: 'promptcontrols',
                        items: [
                            {
                                text: 'Common Prompt',
                                leaf: true,
                                view: 'PromptCommon',
                                id: 'promptcommon'
                            },
                            {
                                text: 'Configure Prompt',
                                leaf: true,
                                view: 'PromptConfigure',
                                id: 'promptconfigure'
                            },
                            {
                                text: 'Hierarchical Prompts',
                                leaf: true,
                                view: 'PromptHierarchical',
                                id: 'prompthierarchical'
                            },
                            {
                                text: 'Prompt Friendly Values',
                                leaf: 'true',
                                view: 'PromptFriendlyValues',
                                id: 'promptfriendlyvalues'
                            },
                            {
                                text: 'Multi-key Bar Code',
                                leaf: true,
                                view: 'PromptBarcode',
                                id: 'promptbarcode'
                            }
                        ]
                    },
                    {
                        text: 'Picker and Text Prompt',
                        leaf: true,
                        view: 'TextPrompt',
                        id: 'textprompt'
                    },
                    {
                        text: 'Phone and Email Fields',
                        leaf: true,
                        view: 'PhoneEmailField',
                        id: 'phoneemail'
                    },
                    {
                        text: 'Progress Bar',
                        leaf: true,
                        view: 'ProgressBar',
                        id: 'progressbar'
                    },
                    {
                        text: 'Signature Capture',
                        leaf: true,
                        view: 'Signature',
                        id: 'signature'
                    },
                    {
                        text: 'Camera',
                        leaf: false,
                        id: 'cameracontrols',
                        items: [
                            {
                                text: 'Camera Button',
                                leaf: true,
                                view: 'CameraButton',
                                id: 'camerabutton'
                            },
                            {
                                text: 'Document Field',
                                leaf: true,
                                view: 'CameraDocument',
                                id: 'cameradocument'
                            },
                            {
                                text: 'Image in Form',
                                leaf: true,
                                view: 'CameraForm',
                                id: 'cameraform'
                            },
                            {
                                text: 'View Selector',
                                leaf: true,
                                view: 'ViewSelector',
                                id: 'viewselector'
                            }
                        ]
                    },
                    {
                        text: 'Bar Code',
                        leaf: true,
                        view: 'Barcode',
                        id: 'barcode'
                    },
                    {
                        text: 'Search with Bar Code',
                        leaf: true,
                        view: 'SearchBarcode',
                        id: 'searchbarcode'
                    },
                    {
                        text: 'Location',
                        leaf: true,
                        view: 'Location',
                        id: 'location'
                    },
                    {
                        text: 'Calendar',
                        leaf: false,
                        id: 'calendarcontrols',
                        items: [
                            {
                                text: 'Calendar Field',
                                leaf: true,
                                view: 'Calendar'
                            },
                            {
                                text: 'Calendar',
                                leaf: true,
                                view: 'CalendarView'
                            }
                        ]
                    },
                    {
                        text: 'Select',
                        leaf: true,
                        view: 'Select',
                        id: 'select'
                    }
                ]
            },
            {
                text: 'Drawings',
                id: 'drawings',
                items: [
                    {
                        text: 'Pan-Zoom',
                        leaf: true,
                        view: 'PanZoom',
                        id: 'panzoom'
                    },
                    {
                        text: 'Locate Assets',
                        leaf: true,
                        view: 'LocateAsset',
                        id: 'locateasset'
                    },
                    {
                        text: 'Marker',
                        leaf: true,
                        view: 'Marker',
                        id: 'Marker'
                    },
                    {
                        text: 'Placement',
                        leaf: true,
                        view: 'Placement',
                        id: 'placement'
                    },
                    {
                        text: 'Redlining',
                        leaf: true,
                        view: 'Redline',
                        id: 'redline'
                    }
                ]
            },
            {
                text: 'Maps',
                id: 'maps',
                items: [
                    {
                        text: 'Esri Map',
                        leaf: true,
                        view: 'EsriMap',
                        id: 'esrimap'
                    },
                    {
                        text: 'Esri Basemaps',
                        leaf: true,
                        view: 'EsriBasemaps',
                        id: 'esribasemaps'
                    },
                    {
                        text: 'Show Building',
                        leaf: true,
                        view: 'ShowBuildingMap',
                        id: 'showbuildingmap'
                    },
                    {
                        text: 'Show All Buildings',
                        leaf: true,
                        view: 'ShowAllBuildingsMap',
                        id: 'showallbuildingsmap'
                    },
                    {
                        text: 'Show Buildings By Use/Occupancy',
                        leaf: true,
                        view: 'ShowBuildingsByUseAndOccupancyMap',
                        id: 'showbuildingbyuseandoccupancysmap'
                    },
                    {
                        text: 'Show Current Location',
                        leaf: true,
                        view: 'ShowCurrentLocationMap',
                        id: 'showcurrentlocationmap'
                    },
                    {
                        text: 'Locate Asset',
                        leaf: true,
                        view: 'LocateAssetMap',
                        id: 'locateassetmap'
                    },
                    {
                        text: 'Marker Action',
                        leaf: true,
                        view: 'MarkerActionMap',
                        id: 'markeractionmap'
                    },   
                    {
                        text: 'Marker Click Event',
                        leaf: true,
                        view: 'MarkerClickEventMap',
                        id: 'markerclickeventmap'
                    }     
                ]
            },
            {
                text: 'Navigation',
                id: 'navigation',
                items: [
                    {
                        text: 'Navigation View',
                        leaf: true,
                        view: 'NavigationView',
                        id: 'navigationview'
                    },
                    {
                        text: 'List and Edit Views',
                        leaf: true,
                        view: 'NavigationListView',
                        id: 'navigationlistview'
                    },
                    {
                        text: 'Icons',
                        leaf: true,
                        view: 'Icons',
                        id: 'icons'
                    }
                ]
            },
            {
                text: 'Sync',
                id: 'sync',
                items: [
                    {
                        text: 'Download Validating Table',
                        leaf: true,
                        view: 'DownloadValidatingTable',
                        id: 'downloadvalidatingtable'
                    },
                    {
                        text: 'Sync Transaction Table',
                        leaf: true,
                        view: 'SyncTransactionTable',
                        id: 'synctransactiontable'
                    },
                    {
                        text: 'Partial Sync',
                        leaf: true,
                        view: 'PartialSync',
                        id: 'partialsync'
                    }
                ]
            },
            {
                text: 'Validations',
                id: 'valdations',
                items: [
                    {
                        text: 'Validation',
                        leaf: true,
                        view: 'Validation',
                        id: 'validation'
                    },
                    {
                        text: 'Custom Validation',
                        leaf: true,
                        view: 'CustomValidation',
                        id: 'customvalidation'
                    }
                ]
            },
            {
                text: 'Questionnaires',
                id: 'questionnaire',
                items: [
                    {
                        text: 'Questionnaires',
                        leaf: true,
                        view: 'Questionnaire'
                    }
                ]
            },
            {
                text: 'Documents',
                id: 'documents',
                items: [
                    {
                        text: 'On Demand',
                        leaf: true,
                        view: 'DocumentDownload'
                    },
                    {
                        text: 'File Download',
                        leaf: true,
                        view: 'FileDownload'
                    }

                ]
            }

        ]
    };


    Ext.define('Solutions.store.Demos', {
        alias: 'store.Demos',
        extend: 'Ext.data.TreeStore',
        requires: ['Solutions.model.Demo'],

        config: {
            model: 'Solutions.model.Demo',
            root: root,
            defaultRootProperty: 'items'
        }
    });
})();
