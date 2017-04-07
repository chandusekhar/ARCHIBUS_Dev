/**
 * ARCHIBUS JSON utility functions. Used with {@link Common.service.workflow.Workflow}
 *
 * @singleton
 * @author Jeff Martin
 * @since 21.1
 */

Ext.define('Common.service.workflow.JsonUtil', {
    singleton: true,

    /**
     * @private
     */
    escapeJSONChar: function (c) {
        var hex,
            zeros = '000';

        if (c === "\"" || c === "\\") {
            return "\\" + c;
        }

        if (c === "\b") {
            return "\\b";
        }

        if (c === "\f") {
            return "\\f";
        }

        if (c === "\n") {
            return "\\n";
        }

        if (c === "\r") {
            return "\\r";
        }

        if (c === "\t") {
            return "\\t";
        }

        hex = c.charCodeAt(0).toString(16);
        return '\\u' + zeros.slice(0, 4 - hex.length) + hex;
    },

    /**
     * @private
     */
    escapeJSONString: function (s) {

        /*
         * The following should suffice but Safari's regex is broken (doesn't support callback substitutions) return
         * "\"" + s.replace(/([^\u0020-\u007f]|[\\\"])/g, escapeJSONChar) + "\"";
         */

        /* Rather inefficient way to do it */
        var parts = s.split(""),
            i, c;
        for (i = 0; i < parts.length; i++) {
            c = parts[i];
            if (c === '"' || c === '\\' || c.charCodeAt(0) < 32 || c.charCodeAt(0) >= 128) {
                parts[i] = this.escapeJSONChar(parts[i]);
            }
        }
        return "\"" + parts.join("") + "\"";
    },

    /**
     * Converts object to ARCHIBUS JSON format
     *
     * @param {Object} o The object to convert
     * @return {String} The contents of the passed object as a JSON string
     */
    toJSON: function (o) {
        // TODO: Use Ext.JSON.encode()
        var v = [],
            attr,
            errorMessage = LocaleManager.getLocalizedString(
                'Workflow toJSON. Date objects are not permitted to be marshalled using Workflow Rules.',
                'Common.service.workflow.JsonUtil');

        if (o.constructor === Date) {
            //return '{javaClass: "java.util.Date", time: ' + o.valueOf() + '}';
            // KB 3039822. Do not allow marshalling of Date/Time objects using Workflow Rules
            throw new Error(errorMessage);
        }

        if (o === null) {
            return "null";
        }

        if (o.constructor === String) {
            return this.escapeJSONString(o);
        }

        if (o.constructor === Number || o.constructor === Boolean) {
            return o.toString();
        }

        if (o.constructor === Array || typeof (o.length) !== 'undefined') {
            for (var i = 0; i < o.length; i++) {
                v.push(this.toJSON(o[i]));
            }
            return "[" + v.join(", ") + "]";
        }

        for (attr in o) {
            if (typeof o[attr] !== "function") {
                if (o[attr] === null) {
                    v.push("\"" + attr + "\": null");
                } else {
                    v.push(this.escapeJSONString(attr) + ": " + this.toJSON(o[attr]));
                }
            }
        }
        return "{" + v.join(", ") + "}";
    }
});