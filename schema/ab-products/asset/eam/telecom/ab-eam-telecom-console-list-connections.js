View.createController('listConnectionsController', {
    connections: null,

    afterViewLoad: function () {
        if (valueExists(View.parameters) && valueExists(View.parameters.connections)) {
            this.connections = View.parameters.connections;
        }
    },
    /**
     * render list connections template
     */
    afterInitialDataFetch: function () {
        var template = View.templates.get('mainTemplate');
        Handlebars.registerPartial("towardServerConnections", jQuery('#towardServerConnectionsPartial').html());
        Handlebars.registerPartial("towardClientConnections", jQuery('#towardClientConnectionsPartial').html());
        Handlebars.registerPartial("selectedAsset", jQuery('#selectedAssetPartial').html());
        Handlebars.registerPartial("connectionData", jQuery('#connectionDataPartial').html());
        Handlebars.registerPartial("listConnection", jQuery('#listConnectionPartial').html());
        Handlebars.registerPartial("connection", jQuery('#connectionPartial').html());

        template.render({
            connections: this.connections,
            twdClient: getMessage('towardClientTitle'),
            startingPoint: getMessage('startingPointTitle'),
            twdServer: getMessage('towardServerTitle')
        }, this.listConnectionPanel.parentElement);
        this.showTowardConnections();
    },

    /**
     * Show toward client pr server connections rows
     */
    showTowardConnections: function () {
        var twdClient = jQuery(".towardClient"),
            twdServer = jQuery(".towardServer");
        var hideClient = twdClient.children().length == 0;
        var hideServer = twdServer.children().length == 0;
        if (hideClient) {
            jQuery(".towardClientHeader").parent().hide();
            twdClient.parent().hide();
        }
        if (hideServer) {
            jQuery(".towardServerHeader").parent().hide();
            twdServer.parent().hide();
        }
    }
});

function print() {
    printConnections(jQuery('#listConnections').html());
}

function printConnections(printEl) {
    var html = '<' + 'html' + '><' + 'head' + '><' + 'style' + '>';
    html += 'body, .layout {white-space:nowrap; vertical-align:top; display:inline-block} ' +
        '.layout div {font-family: PT Sans, Verdana, Arial, Helvetica, sans-serif;font-size: 13px;padding: 2px;vertical-align: top;} ' +
        '.panel-light {background-color: #F3F7FB; margin-bottom: 8px;margin-top: 4px;padding: 4px;position: relative;}' +
        '.isMultiplexing {color:darkblue} ' +
        '.selected {font-weight:bold} ';
    html += '<' + '/' + 'style' + '><' + '/' + 'head' + '><' + 'body' + '>';
    html += '<' + 'h2' + '>' + getMessage("connectionListTitle") + '<' + '/' + 'h2' + '>';
    html += '<' + 'h3' + '>' + getAssetPrintTitle() + '<' + '/' + 'h3' + '>';
    html += printEl;
    html += '<' + '/' + 'body' + '><' + '/' + 'html' + '>';

    var win = window.open();
    self.focus();
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.print();
    win.close();
}

function getAssetPrintTitle() {
    var controller = View.controllers.get('listConnectionsController');
    var assetType = controller.connections[0].assetType,
        assetPrintTitle = controller.connections[0].localizedAsset;
    switch (assetType) {
        case 'eqport':
            assetPrintTitle = getMessage('eqPrintTitle');
            break;
        case 'pnport':
            assetPrintTitle = getMessage('pnPrintTitle');
            break;
    }
    return assetPrintTitle + " " + controller.connections[0].assetId;
}