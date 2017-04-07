/**
 * Helper file for SVG Drawing control to generate popup of layers.
 */
var LayersPopup = Base.extend({
	_svg: null, 
	_div: '',
	_containerId: '', 
	_opts: {}, 
	_cols: -1, 
	_rows: -1,
	
	create: function(svg, div, containerId, rows, cols, opts) {
        this.setParameters(svg, div, containerId, rows, cols, opts);
        this.container = this.createPopup();
        return this.container;
    },

    setParameters: function(svg, div, containerId, rows, cols, opts) {
        this._svg = svg;
        this._div = div.node();
        this._containerId = containerId;
        this._rows =  rows;
        this._cols = cols;
        this._opts = opts;
    },

    createLayerPopup: function(svg, div, containerId, opts) {
        d3.select("#" + containerId).remove();
    	this.setParameters(svg, div, containerId, -1, -1, opts);
        var ids = this.getLayerIds();
        this.create(svg, div, containerId, ids.length, 2, opts);
        this.insertTableContent(document.getElementById(this._containerId + "_table"));

        return this;
    },

    show: function(bShow) {
        document.getElementById(this._containerId).style.display = (bShow) ? '' : 'none';
    },

    setText: function(text) {
        var node = document.getElementById(this.container.id + "_infobartext");
        node.innerHTML = text;
    },

    createPopup: function() {
        var container = document.createElement('div');
        container.id = this._containerId;
        container.className = "layer-list";
        container.appendChild(this.createMinimizeButton());
        
        // prevent double click from propagating
        container.addEventListener("dblclick", function(event){
        	event.stopPropagation();
        });
                          
        var table = this.createTable(this._cols, this._rows);
        container.appendChild(table);
        this._div.insertBefore(container, this._svg.node());

        return container;
    },

    createMinimizeButton: function() {
        var minimizeButton = document.createElement('div');
        minimizeButton.className = 'minimize-button';
        minimizeButton.addEventListener("click", function(event){            
            if (this.parentNode.style.height !== '13px') {
                this.parentNode.style.height = 13 + 'px';
                this.parentNode.style.width = 16 + 'px';
                this.parentNode.style.overflow = 'hidden';
                minimizeButton.className = 'open-button';
            } else {
                this.parentNode.style.height = 'auto';
                this.parentNode.style.width = 'auto';
                this.parentNode.style.overflow = 'auto';
                minimizeButton.className = 'minimize-button';
            }
        }, false);

        return minimizeButton;
    },
    
    createTable: function(cols, rows) {
        var table = document.createElement("table");
        table.id = this._containerId + "_table";
        this.tableId = table.id;
        var tbody = document.createElement("tbody");
        table.appendChild(tbody);

        this.createRows(tbody, cols, rows);

        return table;
    },

    createRows: function(tbody, cols, rows) {
        for (var i=0; i<rows; i++) {
            var tr = document.createElement("tr");
            for (var j=0; j<cols; j++) {
                var td = document.createElement("td");
                td.className = "column" + j;
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
        return tbody;
    },

    /*
     createRows: function(tbody, ids) {
     for (var i=0; i<ids.length; i++) {
     var tr = document.createElement("tr");
     var td1 = document.createElement("td");
     td1.className = "column" + i;

     var checkbox = this.createCheckbox(ids[i]);
     td1.appendChild(checkbox);
     var td2 = document.createElement("td");
     td2.innerHTML = ids[i];
     td2.className = "column" + i;
     tr.appendChild(td1);
     tr.appendChild(td2);
     tbody.appendChild(tr);
     }
     return tbody;
     }
     */

    insertTableContent: function(table) {
        var ids = this.getLayerIds();
        var rows = table.tBodies[0].rows;
        var control = this;

        for (var i=0; i<ids.length; i++) {
            var row = rows[i];
            var tds = row.childNodes;

            var checkbox = this.createCheckbox(ids[i], this.checkboxEvent);
            tds[0].appendChild(checkbox);
            tds[1].innerHTML = ids[i];
        }
    },

    createCheckbox: function(id, eventListener) {
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = true;
        checkbox.id = "checkbox_" + id;
        var control = this;
        if (eventListener.createDelegate) {
        	checkbox.addEventListener('change', eventListener.createDelegate(checkbox, [checkbox, control]), false);
        } else {
        	checkbox.addEventListener('change', Ext.bind(eventListener, checkbox, [checkbox, control]), false);
        }

        return checkbox;
    },

    checkboxEvent: function(checkbox, control){
    	
        var display = (this.checked) ? "" : "none";
        control._svg.selectAll("#" + this.id.replace("checkbox_", "")).style("display", display);
        control._svg.selectAll(".cluster." + this.id.replace("checkbox_", "")).style("display", display);
    },

    getLayerIds: function() {
        var background = this._svg.selectAll("#background").node().id,
            //assets = this._svg.selectAll("#assets").selectAll("g")[0],
            assets = this._svg.selectAll("#assets > g")[0],
            assetLabels = this._svg.selectAll("#asset-labels").node().childNodes,
            redline = this._svg.selectAll("#redline");

        var ids = [background];
        for(var j=0; j<assetLabels.length; j++) {
            if (assetLabels[j].nodeName === 'g') {
                ids.push(assetLabels[j].id);
            }
        }
        for(var k=0; k<assets.length; k++) {
            ids.push(assets[k].id);
        }
        if (!redline.empty()) {
            ids.push(redline.node().id);
        }

        return ids.sort();
    }
}, {});