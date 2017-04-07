/**
 * This example shows how to customise crosstable and set row color according to content. Derived from ab-ca-scoreboard.js
 */

var scoreBoardController = View.createController('scoreBoardCtrl', {
    /**
     * Calls refresh so the crosstable can call the afterRefresh event listener.
     */
    afterViewLoad: function () {
        this.panelScoreboard.refresh();
    },

    /**
     * After refresh we need to set the colors.
     */
    panelScoreboard_afterRefresh: function () {
        this.panelScoreboard_colorcode();
    },

    /**
     * Set scoreboard colors.
     */
    panelScoreboard_colorcode: function () {
        var styleCode = [
            ['1', '1', '2', '3', '4', '5'],
            ['1', '2', '2', '3', '4', '5'],
            ['2', '2', '2', '3', '4', '5'],
            ['2', '2', '3', '3', '4', '5'],
            ['3', '3', '3', '3', '4', '5'],
            ['3', '3', '3', '3', '4', '5'],
            ['4', '4', '4', '4', '4', '5'],
            ['4', '4', '4', '4', '5', '5'],
            ['4', '4', '4', '5', '5', '5'],
            ['4', '4', '5', '5', '5', '5'],
            ['5', '5', '5', '5', '5', '5'],
        ];
        for (var i = 0; i < 11; i++) {
            for (var j = 0; j < 6; j++) {
                this.colorBlock(i, j, 'CARating' + styleCode[i][j]);
            }
        }
    },

    /**
     * Set style for a specific cell.
     * @param {Object} row
     * @param {Object} column
     * @param {Object} class_name
     */
    colorBlock: function (row, column, class_name) {
        this.panelScoreboard.getCellElement(row, column, 0).parentNode.className = class_name;
        this.panelScoreboard.getCellElement(row, column, 1).parentNode.className = class_name;
    }
})