View.createController('capitalExpenseMatrix', {
    _sidecar: null,
    _matrix: null,

    afterViewLoad: function() {
        this._sidecar = this.capitalExpenseMatrix.getSidecar();
        /*this.readSidecar('test');
         this.writeSidecar('test', {id1: 'true'});
         this.writeSidecar('test', {id1: 'false'});
         this.writeSidecar('test', {id2: 'true'});*/

        var controller = this;
        var layoutManager = View.getLayoutManager('mainLayout');
        var layoutRegionPanel = layoutManager.getRegionPanel('west');

        this.capitalExpenseMatrix.syncHeight = function() {
            var panel = Ext.get(layoutRegionPanel.contentEl) ;
            var height = panel.getHeight() - 10;
            var width = panel.getWidth();
            if (controller._matrix) {
                controller._matrix.resize(height, width);
            }
        };

        layoutRegionPanel.on('collapse', function() {
            if (controller._matrix) {
                controller._matrix.hideMarkerMenu();
            }
        });
        layoutRegionPanel.on('expand', function() {
            var panel = Ext.get(layoutRegionPanel.contentEl) ;
            if (controller._matrix) {
                controller._matrix.showMarkerMenu(panel.getWidth());
            }
        });

        this.on('app:rplm:sfa:selectAnalysis', this.onSelectAnalysis);
    },

    onSelectAnalysis: function(analysis) {
        jQuery('#capitalExpenseContainer').empty();

        var analysisMatrixName = analysis.getValue('finanal_analyses.matrix_name');

        // load matrix box records
        var capitalExpenseRecords = this.capitalExpenseDataSource.getRecords();
        // filter out the boxes that the user has no permission to view
        capitalExpenseRecords = _.filter(capitalExpenseRecords, function(record) {
            var canView = true;
            var securityGroup = record.getValue('finanal_matrix.group_name');
            if (securityGroup) {
                canView = View.user.isMemberOfGroup(securityGroup);
            }

            var inSelectedMatrix = true;
            var matrixName = record.getValue('finanal_matrix.group_name');
            if (valueExistsNotEmpty(matrixName) && matrixName !== analysisMatrixName) {
                inSelectedMatrix = false;
            }

            return canView && inSelectedMatrix;
        });

        var events = {
            onClickBox: {
                function: this.updateMetrics,
                scope: this
            },
            afterZoomIn: {
                function: this.updateLayout,
                scope: this
            },
            afterZoomOut: {
                function: this.updateLayout,
                scope: this
            },
            afterCollapse: {
                function: this.updateLayout,
                scope: this
            },
            readSidecar: {
                function: this.readSidecar,
                scope: this
            },
            writeSidecar: {
                function: this.writeSidecar,
                scope: this
            }
        };
        var config = {
            container: 'capitalExpenseContainer',
            height: this._calculateViewHeight()
        };

        this._matrix = new CapitalExpense.Matrix(capitalExpenseRecords, config, events);
    },

    updateLayout: function(matrix) {
        var width = matrix.getWidth();
        var layoutManager = View.getLayoutManager('mainLayout');
        layoutManager.setRegionSize('west', width);
    },

    updateMetrics: function(box, isSelected) {
        var boxId = box.getValue('finanal_matrix.box_id');
        this.trigger('app:rplm:sfa:selectAnalysisFields', boxId, isSelected);
    },
    readSidecar: function (eventType) {
        return this._getMatrixEventSidecar(eventType);
    },
    writeSidecar: function (eventType, value) {
        if (this._sidecar.get('matrixState') == null) {
            this._sidecar.attributes['matrixState'] = [];
        }
        var event = this._getMatrixEventSidecar(eventType);
        if (event == null) {
            event = this._createMatrixEventSidecar(eventType);
        }
        this._addValueInSidecar(event, value);
        this._sidecar.save();
    },
    /*
     * Get event of the sidecar
     *  @eventType: event type
     */
    _getMatrixEventSidecar: function (eventType) {
        var matrixState = this._sidecar.get('matrixState');
        if (matrixState == null) {
            return null;
        }
        for (var i = 0; i < matrixState.length; i++) {
            if (matrixState[i].type == eventType) {
                return  matrixState[i];
            }
        }
        return null;
    },
    /*
     * Create a new event in the sidecar and return the object for this event
     *   @eventType: event type
     */
    _createMatrixEventSidecar: function (eventType) {
        var matrixState = this._sidecar.get('matrixState');
        matrixState[matrixState.length] = {
            type: eventType,
            actions: []
        };
        return matrixState[matrixState.length -1];
    },
    /*
     * Add value to the event matrix. If the object has performed the action then the result of the action will be replaced.
     *  @event: event type
     *  @value: the object with which the action is performed. The structure of the object
     *   {
     *      id: 'idColumn'
     *      action: true/false
     *   }
     */
    _addValueInSidecar: function (event, value) {
        var data = event.actions;
        var i = 0;
        for (i = 0; i < data.length; i++) {
            if (data[i].id == value.id) {
                break;
            }
        }
        if (i ==  data.length) {
            data[i] = value;
        }
        data[i].action = value.action;
    },
    /*
     *  Calculate the height of the console
     */
    _calculateViewHeight: function () {
        var layoutManager =  View.getLayoutManager('mainLayout').getRegionPanel('west');
        var panel = Ext.get(layoutManager.contentEl) ;
        return panel.getHeight() - 10;
    }
});

CapitalExpense = {
    /*
     * Defines a matrix displayed in
     */
    Matrix: Base.extend({
        _dataStore: '',
        _manager: '',
        _eventManager: '',
        /*
         * Constructor
         *  @records: database
         *  @viewConfig: view config
         *  @events: events the console
         */
        constructor: function (records, viewConfig, events) {
            this._manager = new ViewManager(viewConfig, events);
            this._eventManager = this._manager.getEventManager();
            this._dataStore = new CapitalExpense.DataStore(records, this._eventManager);

            this._manager.calculateLocalizationElement(this._dataStore);
            this._initEvents();
            this._render(this._manager);
            this._eventManager.callEvent('loadPrevSession', []);
        },
        /*
         * Add event
         *  @eventName: the name of the events
         *  @callback: function
         *  @scope: the scope of the area events
         */
        addEventListener: function (eventName, callback, scope) {
            this._eventManager.addEventListener(eventName, callback, scope);
        },
        /*
         * Resize the size of the matrix given the height and width
         *  @height: the height console
         *  @width: the width console
         */
        resize: function (height, width) {
            var scope = this;
            var currentHeight = this._eventManager.callEvent('getConfig', []).height;
            this._dataStore.eachColumn(function(column) {
                if (column.getType() != CapitalExpense.Constants.C3) {
                    if (width < column.getSwitchMenuPosition()) {
                        column.hideSwitchMenu();
                    } else {
                        if (!scope._eventManager.callEvent('onCheckZoom', [])) {
                            column.showSwitchMenu();
                        }
                    }
                }
            });
            if (height != currentHeight) {
                this._eventManager.callEvent('getConfig', []).height = height;
                this._manager.calculateLocalizationElement(this._dataStore);
                this._eventManager.callEvent('onResizeSVG', []);
                this._dataStore.eachColumn(function (column) {
                    column.resize();
                });
            }
        },
        /*
         *  Hide the menu
         */
        hideMarkerMenu: function () {
            this._dataStore.eachColumn(function(column) {
                if (column.getType() != CapitalExpense.Constants.C3) {
                        column.hideSwitchMenu();
                }
            });
        },
        /*
         *  Show the menu
         */
        showMarkerMenu: function (width) {
            var eventManager = this._eventManager;
            if (!eventManager.callEvent('onCheckZoom', [])) {
                this._dataStore.eachColumn(function(column) {
                    if (column.getType() != CapitalExpense.Constants.C3) {
                        if (width > column.getSwitchMenuPosition()) {
                            column.showSwitchMenu();
                        }

                    }
                });
            }
        },
        /*
         *  Hide all the elements of matrix
         */
        hide: function () {
            this._dataStore. eachColumn(function (column) {
                column.hide();
            });

        },
        /*
         *  Show all the elements of matrix
         */
        show: function () {
            this._dataStore. eachColumn(function (column) {
                column.show();
            });

        },
        /*
         * Initialize the events work with the controller
         */
        _initEvents: function () {
            this._eventManager.addEventListener('onMatrixShow', this.show, this);
            this._eventManager.addEventListener('onMatrixHide', this.hide, this);
            this._eventManager.addEventListener('onResizeSVG', function () {
                var container = this._eventManager.callEvent('getContainer', []);
                container.select('svg').attr({
                    width: this._eventManager.callEvent('getConfig', []).width,
                    height: this._eventManager.callEvent('getConfig', []).height
                });
                var div = container[0][0].parentNode;
                d3.select('#' + div.id).style({
                    height:  this._eventManager.callEvent('getConfig', []).height + 'px'
                });
            }, this);

        },
        /*
         * Perform the render matrix.
         * Is drawing the column.
         *      @manager: the controller of the matrix
         */
        _render: function (manager) {
            var container = CapitalExpense.SVG.renderSVG(manager.getContainerName(), {
                width: manager.getConfig().width,
                height: manager.getConfig().height
            });
            container.append('rect').attr({
                x: 0,
                y: 0,
                width: manager.getConfig().width,
                height: manager.getConfig().height,
                display: 'none',
                id: CapitalExpense.ClassType.BACKGROUND
            });
            this._dataStore. eachColumn(function (column) {
                column.render(container);
            });
        }
    }),
    /*
     * Data store matrix
     */
    DataStore: Base.extend({
        _columnsData: [],
        _eventManager: '',
        /*
         * Constructor
         *  @records: database
         *  @eventManager: event manager
         */
        constructor: function (records, eventManager) {
            this._eventManager = eventManager;
            this._columnsData = [];
            this._initEvents();
            this._sampleData(records);

        },
        /*
         * To fetch data from the database
         */
        _sampleData: function (records) {
            var index = 0;
            for (var i = 0; i < records.length; i++) {
                var item = records[i];
                var type = item.getValue(CapitalExpense.Constants.BOX_TYPE);
                switch (type) {
                    case CapitalExpense.Constants.C1:
                    case CapitalExpense.Constants.C2:
                        this._columnsData[this._columnsData.length] = new ColumnData(
                            item,
                            records,
                            index,
                            this._eventManager
                        );
                        index++;
                        break;
                }
            }
            this._columnsData.sort(CapitalExpense.Tools.sortInOrder);
            var data = this._columnsData;
            for (i = 0; i < records.length; i++) {
                item = records[i];
                type = item.getValue(CapitalExpense.Constants.BOX_TYPE);
                if (type == CapitalExpense.Constants.C3) {
                    var order = item.getValue(CapitalExpense.Constants.DISPLAY_ORDER);
                    this.eachColumn(function (column) {
                        var columnOrder = column.getValue(CapitalExpense.Constants.DISPLAY_ORDER);
                        if (columnOrder == (order - 100)) {
                            data[data.length] = new AnalyticColumn(
                                item,
                                records,
                                column,
                                index,
                                this._eventManager
                            );
                        }
                    });
                }
            }

        },
        /*
         * Iterate over all column
         *  @action: function analysis of column
         */
        eachColumn: function (action) {
            for (var i = 0; i < this._columnsData.length; i++) {
                var column = this._columnsData[i];
                var result = action.apply(this, [column]);
                if (result) {
                    break;
                }
            }
        },
        /*
         * Get count of elements in the column
         */
        getCount: function () {
            return this._columnsData.length;
        },
        /*
         * Initialize the events work with the controller
         */
        _initEvents: function () {
            this._eventManager.addEventListener('getDataStore', function () {
                return this;
            }, this);
        }
    }),
    /*
     * Defines of methods for working with elements of the display
     */
    SVG: {
        /*
         * Render the svg tag in the html page
         *  @containerName: the name of the parent container
         *  @size: the size of the container
         */
        renderSVG: function (containerName, size) {
            return d3.select('#' + containerName)
                .append('svg').attr({
                    //fill: AnalyticBox.colorByClicking,
                    width: size.width,
                    height: size.height
                }).style({
                    backgroundColor: AnalyticBox.colorByClicking
                });
        },
        /*
         * Render the multiline text
         *  @type: container type
         *  @mainContainer: he name of the parent container
         *  @config: configuration for render text
         *  @tooltip: the display of the style pointer-events: 'none'
         */
        renderDynamicText: function (type, mainContainer, config, tooltip) {
            var container = this.renderContainer(mainContainer, type);
            container.append('text').attr(config.attr).text(config.text).call(CapitalExpense.Tools.wrap, config.attr);
            if (tooltip) {
                container.style('pointer-events', 'none');
            }
        },
        /*
         * Render the text
         *  @type: container type
         *  @mainContainer: he name of the parent container
         *  @config: configuration for render text
         *  @tooltip: the display of the style pointer-events: 'none'
         */
        renderStaticText: function (type, mainContainer, config, tooltip, style) {
            var container = this.renderContainer(mainContainer, type);
            if(config.delay) {
                container.selectAll('text')
                    .data(config.data)
                    .enter()
                    .append('text')
                    .transition().delay(config.delay)
                    .attr(config.attr)
                    .text(config.function);
            } else {
                if (style) {
                    container.selectAll('text')
                        .data(config.data)
                        .enter()
                        .append('text')
                        .attr(config.attr)
                        .style(style)
                        .text(config.function);
                } else {
                    container.selectAll('text')
                        .data(config.data)
                        .enter()
                        .append('text')
                        .attr(config.attr)
                        .text(config.function);
                }

            }

            if (tooltip) {
                container.style('pointer-events', 'none');
            }
            return container;

        },
        /*
         * Render background element.
         * Adding events: click, mouseover and mouseout
         *  @record: database data of the element
         *  @config: configuration for render
         *  @id: id of the container
         */
        renderBackground: function (record, config, id) {
            var mainContainer = config.container;
            var container = mainContainer.append('g').attr({
                class: config.type,
                opacity: 1
            });
            if (id) {
                container.attr('id', id);
            } else {
                container.attr('id', record.getValue(CapitalExpense.Constants.BOX_ID));
            }
            container.data([record]);

            var data = [record];
            var configData = {
                x: record.getValue(CapitalExpense.Constants.POSITION_X),
                y: record.getValue(CapitalExpense.Constants.POSITION_Y),
                width: record.getValue(CapitalExpense.Constants.WIDTH),
                height: record.getValue(CapitalExpense.Constants.HEIGHT),
                fill: '#ffffff',
                stroke: config.border.color,
                'stroke-width': config.border.size

            };
            if (config.id) {
                configData['id'] = config.id;
            }
            if (config.type == CapitalExpense.Constants.BO) {
                container.append('g').attr({
                    class: 'background'
                }).append('rect').attr(configData);
            }
            configData['class'] = 'fill';
            configData['fill'] = CapitalExpense.Tools.formatColor(record);
            var element = /*this.renderSVGElement('rect', container, data, configData);*/
                container.append('rect').attr(configData);
            if (config.click) {
                container.on('click', config.click(record));
            }

            if (config.tooltip && (record.getValue(CapitalExpense.Constants.BOX_TOOLTIP))) {
                element.call(config.tooltip);
                element.on("mouseover", function () {
                    if (!record.isCollapse()) {
                        config.tooltip.show(record);
                    }
                });
                element.on("mouseout", config.tooltip.hide);
            }
            if (config.mouseover) {
                container.on("mouseover", config.mouseover(record));
            }
            if (config.mouseout) {
                container.on("mouseout", config.mouseout(record));
            }

            return container;
        },
        /*
         * Render container to group items by purpose
         */
        renderContainer: function (container, containerClass, containerId) {
            var result = container.append('g').attr({
                class: containerClass,
                opacity: 1
            });
            if (containerId) {
                result.attr('id', containerId);
            }
            return result;
        },
        /*
         * Render the svg element "Line"
         *  @record: database data of the element
         *  @data: the coordinates of the drawing lines
         *  @border: the configuration border
         *  @id: id of the container
         */
        renderLine: function (container, data, border, id){
            var lineFunction = d3.svg.line()
                .x(function(data) { return data.x; })
                .y(function(data) { return data.y; })
                .interpolate("linear");
            container.append("path").attr({
                d: lineFunction(data),
                stroke: border.color,
                "stroke-width": border.width,
                'fill': 'none',
                id: id
            });
            return container;

        },
        /*
         * Render the svg element "Line" with a fill
         *  @record: database data of the element
         *  @data: the coordinates of the drawing lines
         *  @color: the background color
         *  @id: id of the container
         */
        renderFillLine: function (container, data, color, id) {
            var lineFunction = d3.svg.line()
                .x(function(data) { return data.x; })
                .y(function(data) { return data.y; })
                .interpolate("linear");
            container.append("path").attr({
                d: lineFunction(data),
                'fill': color,
                id: id
            });
            return container;
        },
        /*
         * Perform the transposition of view line
         *  @id: id of the container
         *  @position: the position of the border in the element
         *  @duration: animation transposition
         *  @data: the coordinates of the drawing lines
         */
        transitionLine: function (id, position, duration, data) {
            var lineFunction = d3.svg.line()
                .x(function(data) { return data.x; })
                .y(function(data) { return data.y; })
                .interpolate("linear");
            d3.selectAll('.column').select('#border_' + id).select('#' + position).transition().duration(duration). attr({
                d: lineFunction(data)
            });
        },
        /*
         * Render the svg element with the specified type
         *  @type: the specified type. Example: rect
         *  @mainContainer: he name of the parent container
         *  @data: database data of the element
         *  @config: configuration for render
         */
        renderSVGElement: function (type, mainContainer, data, config) {
            var container;
            if (config.delay) {
                if (config.duration) {
                    container = mainContainer.selectAll(type)
                        .data(data).enter()
                        .append(type)
                        .transition().duration(config.duration).delay(config.delay)
                        .attr(config);
                } else {
                    container = mainContainer.selectAll(type)
                        .data(data).enter()
                        .append(type)
                        .transition().delay(config.delay)
                        .attr(config);
                }

            } else {
                if (config.duration) {

                } else {
                    container = mainContainer.selectAll(type)
                        .data(data).enter()
                        .append(type).attr(config);
                }

            }

            return container;
        },
        /*
         * Perform the transposition of background
         *  @id: id of the container
         *  @config: configuration for transposition
         */
        transitionBackground: function (id, config) {
            if (config.duration) {
                d3.select(id).select('rect').transition().duration(config.duration).attr(config);
            } else {
                d3.select(id).select('rect').attr(config);
            }

        },
        /*
         * Perform the transposition of multiline text
         *  @id: id of the container
         *  @textClass: type text
         *  @config: configuration for transposition
         *  @isRender: TRUE - must render text
         */
        transitionDynamicText: function (id, textClass, config, isRender) {
            var attr = {
                x: config.x
            };
            if (config.y) {
                attr['y'] = config.y;
            }
            if (config.transform) {
                attr['transform'] = config.transform;
            }
            if (config.duration) {
                /*var attr = {
                    x: config.x
                };
                if (config.y) {
                    attr['y'] = config.y;
                }
                if (config.transform) {
                    attr['transform'] = config.transform;
                }*/
                if (isRender) {
                    //d3.select(id).select('.' + textClass).select('text').remove();
                    //d3.select(id).select('.' + textClass).append('text').attr(config).text(config.text);
                    d3.select(id).select('.' + textClass).select('text').attr(attr).text(config.text);
                    d3.select(id).select('.' + textClass).select('text').call(CapitalExpense.Tools.wrap, config);
                } else {
                    attr = {
                        x: config.x
                    };
                    if (config.y) {
                        attr['y'] = config.y;
                    }
                    d3.select(id).select('.' + textClass).select('text').transition().duration(config.duration).selectAll('tspan').attr(attr);
                    d3.select(id).select('.' + textClass).select('text').transition().duration(config.duration).attr(config);
                }

                /**/
            } else {
               /* var attr = {
                    y: config.y
                };
                if (config.transform) {
                    attr['transform'] = config.transform;
                }*/
                d3.select(id).select('.' + textClass).select('text').attr(attr).text(config.text);
                d3.select(id).select('.' + textClass).select('text').call(CapitalExpense.Tools.wrap, config);
            }
        },
        /*
         * Perform the transposition of text
         *  @id: id of the container
         *  @textClass: type text
         *  @config: configuration for transposition
         */
        transitionStaticText: function (id, textClass, config) {
            if (config.duration) {
                d3.select(id).select('.' + textClass).select('text').transition().duration(config.duration).attr(config);
            }
            else {
                d3.select(id).select('.' + textClass).select('text').attr(config);
            }
        },
        /*
         * Show/hide element with the specified the animation time
         *  @id: id of the container
         *  @opacity: the percentage of opacity
         *  @duration: the animation time
         */
        displayView: function (id, opacity, duration) {
            var display = 'block';
            d3.select(id).transition().duration(duration).attr('opacity', opacity);
           /* if (opacity == 0) {
                display = 'none';
            }
            d3.select(id).transition().duration(duration).delay(duration).attr('display', display);*/
        },
        /*
         * Scale the size of the element
         *  @id: id of the container
         *  @scale: the value by which to scale the size of the element
         *  @duration: the animation time
         */
        scale: function (id, scale, duration) {
            d3.select(id).transition().duration(duration).attr({
                transform: 'scale('+ scale +')'
            });
        }
    },
    /*
     * Defines helper methods for matrix
     */
    Tools: {
        /*
         * To convert the color format of the database in html color format
         */
        formatColor: function (record) {
            var color = record.getValue(CapitalExpense.Constants.BGK_COLOR).split("0x");
            return '#' + color[1];
        },
        /*
         * To sort elements of order display in the matrix
         */
        sortInOrder: function (current, next) {
            var currentOrder = current.getValue(CapitalExpense.Constants.DISPLAY_ORDER);
            var nextOrder = next.getValue(CapitalExpense.Constants.DISPLAY_ORDER);
            if (currentOrder > nextOrder) {
                return 1;
            } else {
                if (currentOrder < nextOrder) {
                    return -1;
                } else {
                    return 0;
                }
            }
        },
        /*
         * To accomplish the formation of the multi-string text the possibility of reducing the text size of the item
         */
        wrap: function (text, config) {
            CapitalExpense.Tools.configFontSizeText(text, config,'15px', '14px', '13px');
            var words = text.text().split(/\s+/).reverse(),
                currentText = text.text(),
                word,
                line = [],
                x = config.x,
                isFirstWord = true,
                isSmallText = false,
                isMultiText = false;
                y = config.y + 18,
                textHeight = 10,
                tspan = text.text(null).append("tspan").attr("x", x).attr("y", y);

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > config.width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    y = y + 17;
                    textHeight += 30;
                    if (isFirstWord || textHeight > config.height) {
                        isSmallText = true;
                        break;
                    }
                    tspan = text.append("tspan").attr("x",x).attr("y", y).text(word);
                    isMultiText = true;
                }
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > config.width) {
                    isSmallText = true;
                    break;
                }
                isFirstWord = false;
            }

            if (isSmallText) {
                CapitalExpense.Tools.configFontSizeText(text, config,'13px', '12px', '11px');
                words = currentText.split(/\s+/).reverse();
                line = [];
                x = config.x;
                y = config.y + 15;
                textHeight = 10;
                isFirstWord = true;
                tspan = text.text(null).append("tspan").attr("x", x).attr("y", y);
                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan.node().getComputedTextLength() > config.width) {
                        if (isFirstWord) {
                            tspan.text(line.join(" ") + '...');
                            if (tspan.node().getComputedTextLength() > config.width) {
                                CapitalExpense.Tools.renderNotFullText(line,tspan,config);
                            }
                            break;
                        }
                        line.pop();
                        tspan.text(line.join(" "));
                        textHeight += 25;
                        if (textHeight > config.height) {
                            tspan.text(line.join(" ") + '...');
                            break;
                        }
                        line = [word];
                        y = y + 15;
                        tspan = text.append("tspan").attr("x",x).attr("y", y).text(word);
                    }
                    tspan.text(line.join(" "));
                    if (tspan.node().getComputedTextLength() > config.width) {
                        CapitalExpense.Tools.renderNotFullText(line,tspan,config);
                    }
                    isFirstWord = false;
                }
            } else {
                if (config.box) {
                    config.box.displayFullText(true);
                }
            }
            if (!isMultiText) {
                if (config.type == CapitalExpense.Constants.FR) {
                    var step = config.height / 2 - 15;
                    tspan.attr({
                        x: x ,
                        y: y + step,
                        'transform': 'rotate(-90 ' + (x) +' '+ (y + step)  +')'
                    });
                }
            }
        },
        /*
         *  To render incomplete text
         */
        renderNotFullText: function (line, tspan, config){
            var resultText = '';
            for (var i = 0; i < line.length; i++) {
                resultText += line[i] + ' ';
            }
            var charText = resultText.split('').reverse();
            var result = '';
            var char = '';
            while(char = charText.pop()) {
                result +=  char;
                tspan.text(result + '...');
                if (tspan.node().getComputedTextLength() > config.width) {
                    break;
                }
            }
        },
        /*
         * Set the text size
         */
        configFontSizeText: function (text, config, fontSizeBO, fontSizeFR, fontSizeAR) {
            var size = fontSizeBO;
            switch (config.type) {
                case CapitalExpense.Constants.FR:
                    size = fontSizeFR;
                    break;
                case CapitalExpense.Constants.AR:
                    size = fontSizeAR;
                    break;
            }
            text.attr({
                'font-size': size
            });
        },
        /*
         * To accomplish the formation of the multi-string text
         */
        wrapFullText: function (text, config) {
            if (config.box) {
                text.attr({
                    'font-size': '13px'
                });
            }

            var words = text.text().split(/\s+/).reverse(),
                wordsLength = words.length,
                word,
                line = [],
                x = config.x,
            y = config.y + 18,
                textHeight = 10,
                tspan = text.text(null).append("tspan").attr("x", x).attr("y", y);
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > config.width) {
                    tspan.text(line.join(" "));
                    line.pop();
                    tspan.text(line.join(" "));
                    textHeight += 30;
                    line = [word];
                    y = y + 17;
                    tspan = text.append("tspan").attr("x",x).attr("y", y).text(word) ;
                }
            }
        }

    },
    /*
     * Defines constant values for database fields and paths to the images
     */
    Constants: {
        BOX_TYPE: 'finanal_matrix.box_type',
        DISPLAY_ORDER: 'finanal_matrix.display_order',
        COLUMN_BOX_ID: 'finanal_matrix.column_box_id',
        BOX_ID: 'finanal_matrix.box_id',
        BOX_TITLE: 'finanal_matrix.box_title',
        BOX_PERCENT: 'finanal_matrix.rollup_percent_box_id',
        BOX_TOOLTIP: 'finanal_matrix.box_tooltip',
        BOX_TOOLTIP_POSITION: 'finanal_matrix.box_tooltip_position',
        C1: 'C1',
        C2: 'C2',
        C3: 'C3',
        FR: 'FR',
        AR: 'AR',
        PR: 'PR',
        BO: 'BO',
        AR01: 'finanal_matrix.rollup_anlys_box_id_01',
        AR02: 'finanal_matrix.rollup_anlys_box_id_02',
        AR03: 'finanal_matrix.rollup_anlys_box_id_03',
        AR04: 'finanal_matrix.rollup_anlys_box_id_04',
        AR05: 'finanal_matrix.rollup_anlys_box_id_05',
        FIN_ROLL_UP: 'finanal_matrix.rollup_fin_box_id',
        VALUE: 'finanal_matrix.value',
        VALUE_FORMATTED: 'finanal_matrix.value_formatted',
        VALUE_MARKER: 'finanal_matrix.value_market',
        VALUE_MARKER_FORMATTED: 'finanal_matrix.value_market_formatted',
        BGK_COLOR: 'finanal_matrix.display_bkg_color',
        HEIGHT: 'finanal_matrix.display_height',
        WIDTH: 'finanal_matrix.display_width',
        POSITION_X: 'finanal_matrix.display_positionX',
        POSITION_Y: 'finanal_matrix.display_positionY',
        HIGHLIGHT: 'finanal_matrix.display_highlight',
        COLUMN_INDEX: 'finanal_matrix.display_column_index',
        TOTAL_VALUE: 'finanal_matrix.display_total_value',
        COLLAPSE: 'finanal_matrix.display_collsapse',
        COLLAPSE_BUTTON_CLOSE_IMAGE: '/archibus/schema/ab-products/rplm/finanal/console/close-arrows.png',
        COLLAPSE_BUTTON_OPEN_IMAGE: '/archibus/schema/ab-products/rplm/finanal/console/open-arrows.png',
        TOOLTIP_ANGLE_RIGHT: '/archibus/schema/ab-core/graphics/icons/view/angle-right.png',
        TOOLTIP_ANGLE_LEFT: '/archibus/schema/ab-core/graphics/icons/view/angle-left.png'
    },
    /*
     * Defines the class names of the display elements in the matrix
     */
    ClassType: {
        BACKGROUND: 'background',
        COLUMN: 'column',
        COLUMN_HEADER: 'columnHeader',
        TITLE_HEADER: 'textTitleHeader',
        VALUE_HEADER: 'textValueHeader',
        INFO_HEADER: 'textAdditionalInfoHeader',
        COLLAPSE_BUTTON: 'displayColumn',
        BUMP_HEADER: 'bumpColumn',
        BOX_RECT: 'fill',
        BOX_TITLE: 'textBoxTitle',
        BOX_VALUE: 'textBoxValue',
        BOX_PERCENT: 'textBoxPercent',
        TOOLTIP_IN_CONTAINER: 'capitalExpenseMatrixZoomInTooltip',
        TOOLTIP_IN_RECT: 'zoomInTooltipRect',
        TOOLTIP_IN_TITLE: 'zoomInTooltipTitle',
        TOOLTIP_IN_VALUE: 'zoomInTooltipValue',
        TOOLTIP_IN_IMAGE: 'zoomInTooltipImage',
        TOOLTIP_IN_BUMP: 'zoomInTooltipBump',
        TOOLTIP_OUT_CONTAINER: 'capitalExpenseMatrixZoomOutTooltip',
        TOOLTIP_OUT_TITLE: 'zoomOutTooltipTitle',
        TOOLTIP_OUT_IMAGE: 'zoomOutTooltipImage',
        ANALYTIC_BOX: 'analyticBox',
        ANALYTIC_BOX_TITLE: 'textAnalyticBoxTitle',
        ANALYTIC_BOX_VALUE: 'textAnalyticBoxValue',
        ANALYTIC_BOX_BORDER: 'borderAnalyticBox'
    },
    /*
     * Defines the animation time for action
     */
    Animation: {
        boxHide: 600,
        boxShow: 600,
        boxZoomIn: 800,
        boxZoomOut: 800,
        boxScale: 800,
        rollupHide: 600,
        rollupShow: 600,
        analyticBoxScale: 800,
        analyticBoxZoomIn: 800,
        analyticBoxZoomOut: 800,
        collapseColumn: 800,
        expandColumn: 800,
        columnShow: 600,
        columnHide: 600,
        columnShift: 800
    }
};

