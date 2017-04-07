/*
 * JSON-RPC JavaScript client
 *
 * $Id: jsonrpc.js,v 1.36.2.3 2006/03/08 15:09:37 mclark Exp $
 *
 * Copyright (c) 2003-2004 Jan-Klaas Kollhof
 * Copyright (c) 2005 Michael Clark, Metaparadigm Pte Ltd
 *
 * This code is based on Jan-Klaas' JavaScript o lait library (jsolait).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */


/* escape a character */

escapeJSONChar =
function escapeJSONChar(c)
{
    if(c == "\"" || c == "\\") return "\\" + c;
    else if (c == "\b") return "\\b";
    else if (c == "\f") return "\\f";
    else if (c == "\n") return "\\n";
    else if (c == "\r") return "\\r";
    else if (c == "\t") return "\\t";
    var hex = c.charCodeAt(0).toString(16);
    if(hex.length == 1) return "\\u000" + hex;
    else if(hex.length == 2) return "\\u00" + hex;
    else if(hex.length == 3) return "\\u0" + hex;
    else return "\\u" + hex;
};


/* encode a string into JSON format */

escapeJSONString =
function escapeJSONString(s)
{
    /* The following should suffice but Safari's regex is b0rken
       (doesn't support callback substitutions)
       return "\"" + s.replace(/([^\u0020-\u007f]|[\\\"])/g,
       escapeJSONChar) + "\"";
    */

    /* Rather inefficient way to do it */
    var parts = s.split("");
    for(var i=0; i < parts.length; i++) {
	var c =parts[i];
	if(c == '"' ||
	   c == '\\' ||
	   c.charCodeAt(0) < 32 ||
	   c.charCodeAt(0) >= 128)
	    parts[i] = escapeJSONChar(parts[i]);
    }
    return "\"" + parts.join("") + "\"";
};


/* Marshall objects to JSON format */

toJSON = function toJSON(o)
{
    if(o == null) {
	return "null";
    } else if(o.constructor == String) {
	return escapeJSONString(o);
    } else if(o.constructor == Number) {
	return o.toString();
    } else if(o.constructor == Boolean) {
	return o.toString();
    } else if(o.constructor == Date) {
	return '{javaClass: "java.util.Date", time: ' + o.valueOf() +'}';
    } else if(o.constructor == Array || typeof(o.length) != 'undefined') {
	var v = [];
	for(var i = 0; i < o.length; i++) v.push(toJSON(o[i]));
	return "[" + v.join(", ") + "]";
    } else {
	var v = [];
	for(attr in o) {
	    if(o[attr] == null) v.push("\"" + attr + "\": null");
	    else if(typeof o[attr] == "function"); /* skip */
	    else v.push(escapeJSONString(attr) + ": " + toJSON(o[attr]));
	}
	return "{" + v.join(", ") + "}";
    }
};
