/**
 * Created by Meyer on 10/18/2015.
 *
 * ab-pgnav-editor-parser.js
 *
 * Support for the home page editor.
 *
 * Parse XML descriptor into viewable HTML,
 * and parse HTML view back to XML descriptor.
 *
 */
/**
 * Namespace for the home page editor JS classes.
 */
Ab.namespace('homepage');

/**
 * Parser for the Home Page Editor.
 * Singleton class transforms descriptor XML to model HTML and back.
 */
Ab.homepage.EditorParser = new (Base.extend({
        /**
         * Mapping from data attribute property name to descriptor property name.
         * left - internal: all lower-case, no punctuation
         * right - descriptor: mixed-case, inconsistent underscore
         */
        descriptorAttributeNames: JSON.parse('{"activityid": "activity_id",' +
            '"abbreviatevalues": "abbreviateValues",' +
            '"backgroundshading": "backgroundShading",' +
            '"basemaplayer": "basemapLayer",' +
            '"columnspan": "columnSpan",' +
            '"controltype": "controlType",' +
            '"datasourceid": "dataSourceId",' +
            '"granularitylocation": "granularityLocation",' +
            '"labelfield": "labelField",' +
            '"mapimplementation": "mapImplementation",' +
            '"markerradius": "markerRadius",' +
            '"metricname": "metricName",' +
            '"processid": "process_id",' +
            '"recordlimit": "recordLimit",' +
            '"sortorder": "sortOrder",' +
            '"type": "type",' +
            '"usestoplightcolors": "useStoplightColors",' +
            '"valuefield": "valueField",' +
            '"valueontop": "valueOnTop",' +
            '"viewname": "viewName"}'),

        /**
         * Return an object modelling the descriptor file.
         *
         * @param xmlDoc XML Document - a descriptor file from the server.
         */
        parseDescriptorToModel: function (xmlDoc) {
            var model = {};
            model.abstractNavBlocks = [];
            if (xmlDoc != null) {
                var root = xmlDoc.getElementsByTagName("navigation-page");
                if (root.length > 0) {
                    // for IE use childNodes r.t. children even though it also returns text and comment nodes
                    var blocks = root[0].childNodes;
                    var blockCount = blocks.length;
                    for (var i = 0; blocks != null && i < blockCount; i++) {
                        var block = blocks[i];
                        // filter out text and comment child nodes
                        if (block.nodeName !== 'row' && block.nodeName !== 'page-divider') {
                            continue;
                        }
                        model.abstractNavBlocks.push({
                            type: block.nodeName,
                            index: i,
                            attributes: this.getAttributesObject(block.attributes),
                            buckets: this.parseBucketCollection(block.childNodes)
                        });
                    }
                }
            }

            return model;
        },

        /**
         * Return a simple object whose properties are the attributes in the NamedNodeMap.
         *
         * @param attributesNodeMap an HTML DOM NamedNodeMap
         * @returns {{}} attribute-name-indexed object representation.
         */
        getAttributesObject: function (attributesNodeMap) {
            var attributeObject = {};
            var attributeCount = attributesNodeMap.length;
            for (var i = 0; i < attributeCount; i++) {
                var node = attributesNodeMap.item(i);
                var nodeName = node.name.toLowerCase().replace('_', '').replace('-', '');
                attributeObject[nodeName] = node.value;

                if ("height" === node.name && "three-quarters" === node.value) {
                    attributeObject[node.name] = "three-quarter";
                }
            }
            return attributeObject;
        },

        /**
         * Return an array of bucket objects for the model.
         *
         * @param bucketCollection
         * @returns {Array} of bucket objects.
         */
        parseBucketCollection: function (bucketCollection) {
            var bucketArray = [];
            var bucketCount = bucketCollection.length;
            for (var j = 0; bucketCollection != null && j < bucketCount; j++) {
                var bucketElem = bucketCollection[j];
                if (bucketElem.nodeName !== 'bucket') {
                    continue;
                }
                bucketArray.push({
                    type: bucketElem.getAttribute("type"),
                    title: bucketElem.getAttribute("title"),
                    index: j,
                    // turn NamedNodeMap into a simple (attribute name indexed) object
                    attributes: this.getAttributesObject(bucketElem.attributes)
                });
            }

            return bucketArray;
        },

//===============

        /**
         * Parse the HTML page to form the descriptor model object.
         */
        parseDisplayToModel: function () {
            var pageModel = {};
            pageModel.abstractNavBlocks = [];
            var editorPageNodes = jQuery('.editor-page');
            if (editorPageNodes.length > 0 && editorPageNodes[0].hasChildNodes) {
                //
                // TODO class="page-break-banner" || class="page-row
                var abstrNavBlockElements = jQuery(editorPageNodes[0]).children('div');
                var blockCount = abstrNavBlockElements.length;
                for (var i = 0; i < blockCount; i++) {
                    var block = abstrNavBlockElements[i];
                    var isPgRow = jQuery(block).hasClass("page-row");
                    var isPgDivider = jQuery(block).hasClass("page-break-banner");

                    pageModel.abstractNavBlocks.push({
                        index: i,
                        blockType: isPgRow ? "row" : isPgDivider ? "page-divider" : "rule",
                        attributes: this.getAbstractNavBlockAttributes(block, isPgRow, isPgDivider),
                        buckets: []
                    });

                    if (isPgRow) {
                        // add page-row to model
                        var rowBuckets = jQuery(block).find(".bucket-process");
                        // add row buckets to model
                        var bucketCount = rowBuckets.length;
                        for (var j = 0; j < bucketCount; j++) {
                            // form bucket objects and push onto array
                            pageModel.abstractNavBlocks[i].buckets.push({
                                index: j,
                                id: jQuery(rowBuckets[j]).attr("id"),
                                title: jQuery(rowBuckets[j]).attr("title"),
                                attributes: this.getBucketDataAttributes(rowBuckets[j], true)
                            });
                        }
                    }
                }
            }
            else {
                alert("No editor-page found!");
            }

            return pageModel;
        },

        /**
         * Return a string representing the XML descriptor without any formatting.
         *
         * @returns {string}
         */
        parseDisplayToXml: function () {
            var pageModel = this.parseDisplayToModel();
            var descriptorXml = '<navigation-page>';
            var blockCount = pageModel.abstractNavBlocks.length;
            for (var i = 0; i < blockCount; i++) {
                var abstractNavBlock = pageModel.abstractNavBlocks[i];
                if ("page-divider" === abstractNavBlock.blockType) {
                    // TODO modularize these two conditions
                    descriptorXml += '<page-divider';
                    if (abstractNavBlock.attributes.title) {
                        descriptorXml += ' title="' + abstractNavBlock.attributes.title + '"';
                    }
                    if (abstractNavBlock.attributes.backgroundshading){
                        descriptorXml += ' backgroundShading="' + abstractNavBlock.attributes.backgroundshading + '"';
                    }
                    descriptorXml += '></page-divider>';
                }
                else if ("row" === abstractNavBlock.blockType) {
                    descriptorXml += '<row height="' + abstractNavBlock.attributes.height + '">';
                    var bucketCount = abstractNavBlock.buckets.length;
                    for (var j = 0; j < bucketCount; j++) {
                        var bucketAttributes = abstractNavBlock.buckets[j].attributes;
                        descriptorXml += '<bucket ';
                        for (var attributeName in bucketAttributes) {
                            if (bucketAttributes.hasOwnProperty(attributeName) &&
                                ("" !== bucketAttributes[attributeName] || 'activityid' === attributeName || 'processid' === attributeName)) {
                                descriptorXml += ' ' + attributeName + '="' + bucketAttributes[attributeName] + '"';
                            }
                        }
                        descriptorXml += '/>';
                    }
                    descriptorXml += '</row>';
                }
            }
            descriptorXml += '</navigation-page>';

            return descriptorXml;
        },

        /**
         * Return the single attribute on the abstract navigation block (divider, row, rule) element.
         *
         * @param abstractNavBlock
         * @param isPgRow
         * @param isPgDivider
         * @returns {string}
         */
        getAbstractNavBlockAttributes: function (abstractNavBlock, isPgRow, isPgDivider) {
            var attributes = {};
            var dataAttr = jQuery(abstractNavBlock).data();
            if (isPgDivider) {
                for (attributeName in dataAttr) {
                    attributes[attributeName] = dataAttr[attributeName];
                }
                //var textNode = jQuery(abstractNavBlock).find("div.page-break-archibus > span");
                //if (textNode.length === 1) { attributes.title = dataAttr.title; }
                //attributes.backgroundshading = dataAttr.backgroundshading;
            }
            else if (isPgRow) {
                var isHalfHt = jQuery(abstractNavBlock).hasClass("half-height");
                var isThreeQuarterHt = jQuery(abstractNavBlock).hasClass("three-quarter-height");
                var isFullHt = jQuery(abstractNavBlock).hasClass("full-height");

                // alternate method. above more efficient?
                ///var rowPalette = jQuery(abstractNavBlock).children('.row-palette');
                ///var dataHt = jQuery(rowPalette).data('height');

                attributes.height = isHalfHt ? 'half' : isThreeQuarterHt ? 'three-quarters' : isFullHt ? 'full' : '';
            }

            return attributes;
        },

        /**
         * Return the bucket element's data attributes,
         * cleaned up to only hold descriptor-valid attribute names.
         *
         * @param bucketElem
         * @param forServer
         * @returns {{}}
         */
        getBucketDataAttributes: function (bucketElem, forServer) {
            var cleanedAttributes = {};
            var bucketAttributes = jQuery(bucketElem).data();

            for (var attributeName in bucketAttributes) {
                if (bucketAttributes.hasOwnProperty(attributeName)) {
                    var formattedName = this.descriptorAttributeNames[attributeName] ? this.descriptorAttributeNames[attributeName] : attributeName;
                    var formattedNameLowerCase = formattedName.toLowerCase();
                    if ('sortableitem' === formattedNameLowerCase || 'rowindex' === formattedNameLowerCase || 'columnindex' === formattedNameLowerCase) {
                        continue;
                    }

                    // writing descriptor to server uses camel-cased attribute names, client-side process uses all lowercase
                    formattedName = forServer ? formattedName : formattedNameLowerCase;
                    // TODO make data value XML-compatible e.g., '&' -> parse error
                    cleanedAttributes[formattedName] = convertToXMLValue(bucketAttributes[attributeName]);
                }
            }

            return cleanedAttributes;
        },

        /**
         * Ensure the descriptor file name ends in '.xml'.
         * Ensure the descriptor file doesn't contain spaces.
         *
         * @param descriptorFileName
         * @returns {string}
         */
        ensureDescriptorFileNameValidity: function(descriptorFileName) {
            var validName = descriptorFileName.trim();
            while (validName.indexOf(' ') > 0) {
                validName = validName.replace(' ', '-');
            }

            if (validName && validName.length > 0) {
                var index = validName.toLowerCase().indexOf('.xml');
                if (index < 0 || index !== (validName.length - 4)) {
                    validName = validName + '.xml';
                }
            }

            return validName;
        }
    })
);
