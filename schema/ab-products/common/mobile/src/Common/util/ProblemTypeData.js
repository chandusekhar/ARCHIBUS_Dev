/**
 * Generates the Problem Type hierarchical data structure
 *
 * @author Jeff Martin
 * @since 21.1
 * @singleton
 */
Ext.define('Common.util.ProblemTypeData', {

    singleton: true,

	generateProbtypeObject : function() {

		var store = Ext.getStore('problemTypesStore'),
            i, data = [], problemTypeItems;

		problemTypeItems = Ext.Array.map(store.data.all, function(storeItem) {
			var hierarchyIds = storeItem.get('hierarchy_ids'),
                hierarchyIdArray = hierarchyIds.split('|');

			return {
				probType : storeItem.get('prob_type'),
				hierIdArray : hierarchyIdArray,
				level : hierarchyIdArray.length - 1
			};
		});

		// Sort problem type items by level
		problemTypeItems.sort(function(a, b) {
			return a.level - b.level;
		});

		// Process data
		for (i = 0; i < problemTypeItems.length; i++) {
			var item = problemTypeItems[i];
			if (item.level === 1) {
				data.push({
					text : item.hierIdArray[0],
					leaf : true,
					code : item.probType,
					children : []
				});
			} else {
				// find the parent element
				var element = this.findElement(data, item.hierIdArray[item.level - 2]);
				if (element) {
					element.leaf = false;
					element.children.push({
						text : item.hierIdArray[item.level - 1],
						leaf : true,
						code : item.probType,
						children : []
					});
				}
			}
		}

        // Sort the problem types by code
        var sortedData = this.sortByCode(data);

        // Sort the child elements
        Ext.Array.each(sortedData, function(item) {
            var sortedChildren;
            if(item.children.length > 0) {
                sortedChildren = this.sortByCode(item.children);
                item.children = sortedChildren;
            }
        }, this);
		return sortedData;
	},

    /**
     * Sort the problem type data by code
     * @private
     * @param data {Array} Array of problem types
     * @returns {Array} Sorted array
     */
    sortByCode: function(data) {
        var sortedData;

        sortedData = Ext.Array.sort(data, function (a,b) {
            if (a.code > b.code) {
                return 1;
            } else if (a.code < b.code) {
                return - 1;
            } else {
                return 0;
            }
        });

        return sortedData;
    },

	findElement : function(data, elementId) {
		var i;
		for (i = 0; i < data.length; i++) {
			if (data[i].text === elementId) {
				return data[i];
			}
		}
		return null;
	}

});