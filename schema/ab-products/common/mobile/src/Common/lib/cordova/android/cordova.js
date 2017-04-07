// Platform: android
// 3.5.0
/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */
;
(function () {
    var CORDOVA_JS_BUILD_LABEL = '3.5.0';
// file: src/scripts/require.js

    /*jshint -W079 */
    /*jshint -W020 */

    var require,
        define;

    (function () {
        var modules = {},
        // Stack of moduleIds currently being built.
            requireStack = [],
        // Map of module ID -> index into requireStack of modules currently being built.
            inProgressModules = {},
            SEPARATOR = ".";


        function build(module) {
            var factory = module.factory,
                localRequire = function (id) {
                    var resultantId = id;
                    //Its a relative path, so lop off the last portion and add the id (minus "./")
                    if (id.charAt(0) === ".") {
                        resultantId = module.id.slice(0, module.id.lastIndexOf(SEPARATOR)) + SEPARATOR + id.slice(2);
                    }
                    return require(resultantId);
                };
            module.exports = {};
            delete module.factory;
            factory(localRequire, module.exports, module);
            return module.exports;
        }

        require = function (id) {
            if (!modules[id]) {
                throw "module " + id + " not found";
            } else if (id in inProgressModules) {
                var cycle = requireStack.slice(inProgressModules[id]).join('->') + '->' + id;
                throw "Cycle in require graph: " + cycle;
            }
            if (modules[id].factory) {
                try {
                    inProgressModules[id] = requireStack.length;
                    requireStack.push(id);
                    return build(modules[id]);
                } finally {
                    delete inProgressModules[id];
                    requireStack.pop();
                }
            }
            return modules[id].exports;
        };

        define = function (id, factory) {
            if (modules[id]) {
                throw "module " + id + " already defined";
            }

            modules[id] = {
                id: id,
                factory: factory
            };
        };

        define.remove = function (id) {
            delete modules[id];
        };

        define.moduleMap = modules;
    })();

//Export for use in node
    if (typeof module === "object" && typeof require === "function") {
        module.exports.require = require;
        module.exports.define = define;
    }

// file: src/cordova.js
    define("cordova", function (require, exports, module) {


        var channel = require('cordova/channel');
        var platform = require('cordova/platform');

        /**
         * Intercept calls to addEventListener + removeEventListener and handle deviceready,
         * resume, and pause events.
         */
        var m_document_addEventListener = document.addEventListener;
        var m_document_removeEventListener = document.removeEventListener;
        var m_window_addEventListener = window.addEventListener;
        var m_window_removeEventListener = window.removeEventListener;

        /**
         * Houses custom event handlers to intercept on document + window event listeners.
         */
        var documentEventHandlers = {},
            windowEventHandlers = {};

        document.addEventListener = function (evt, handler, capture) {
            var e = evt.toLowerCase();
            if (typeof documentEventHandlers[e] != 'undefined') {
                documentEventHandlers[e].subscribe(handler);
            } else {
                m_document_addEventListener.call(document, evt, handler, capture);
            }
        };

        window.addEventListener = function (evt, handler, capture) {
            var e = evt.toLowerCase();
            if (typeof windowEventHandlers[e] != 'undefined') {
                windowEventHandlers[e].subscribe(handler);
            } else {
                m_window_addEventListener.call(window, evt, handler, capture);
            }
        };

        document.removeEventListener = function (evt, handler, capture) {
            var e = evt.toLowerCase();
            // If unsubscribing from an event that is handled by a plugin
            if (typeof documentEventHandlers[e] != "undefined") {
                documentEventHandlers[e].unsubscribe(handler);
            } else {
                m_document_removeEventListener.call(document, evt, handler, capture);
            }
        };

        window.removeEventListener = function (evt, handler, capture) {
            var e = evt.toLowerCase();
            // If unsubscribing from an event that is handled by a plugin
            if (typeof windowEventHandlers[e] != "undefined") {
                windowEventHandlers[e].unsubscribe(handler);
            } else {
                m_window_removeEventListener.call(window, evt, handler, capture);
            }
        };

        function createEvent(type, data) {
            var event = document.createEvent('Events');
            event.initEvent(type, false, false);
            if (data) {
                for (var i in data) {
                    if (data.hasOwnProperty(i)) {
                        event[i] = data[i];
                    }
                }
            }
            return event;
        }


        var cordova = {
            define: define,
            require: require,
            version: CORDOVA_JS_BUILD_LABEL,
            platformId: platform.id,
            /**
             * Methods to add/remove your own addEventListener hijacking on document + window.
             */
            addWindowEventHandler: function (event) {
                return (windowEventHandlers[event] = channel.create(event));
            },
            addStickyDocumentEventHandler: function (event) {
                return (documentEventHandlers[event] = channel.createSticky(event));
            },
            addDocumentEventHandler: function (event) {
                return (documentEventHandlers[event] = channel.create(event));
            },
            removeWindowEventHandler: function (event) {
                delete windowEventHandlers[event];
            },
            removeDocumentEventHandler: function (event) {
                delete documentEventHandlers[event];
            },
            /**
             * Retrieve original event handlers that were replaced by Cordova
             *
             * @return object
             */
            getOriginalHandlers: function () {
                return {
                    'document': {
                        'addEventListener': m_document_addEventListener,
                        'removeEventListener': m_document_removeEventListener
                    },
                    'window': {
                        'addEventListener': m_window_addEventListener,
                        'removeEventListener': m_window_removeEventListener
                    }
                };
            },
            /**
             * Method to fire event from native code
             * bNoDetach is required for events which cause an exception which needs to be caught in native code
             */
            fireDocumentEvent: function (type, data, bNoDetach) {
                var evt = createEvent(type, data);
                if (typeof documentEventHandlers[type] != 'undefined') {
                    if (bNoDetach) {
                        documentEventHandlers[type].fire(evt);
                    }
                    else {
                        setTimeout(function () {
                            // Fire deviceready on listeners that were registered before cordova.js was loaded.
                            if (type == 'deviceready') {
                                document.dispatchEvent(evt);
                            }
                            documentEventHandlers[type].fire(evt);
                        }, 0);
                    }
                } else {
                    document.dispatchEvent(evt);
                }
            },
            fireWindowEvent: function (type, data) {
                var evt = createEvent(type, data);
                if (typeof windowEventHandlers[type] != 'undefined') {
                    setTimeout(function () {
                        windowEventHandlers[type].fire(evt);
                    }, 0);
                } else {
                    window.dispatchEvent(evt);
                }
            },

            /**
             * Plugin callback mechanism.
             */
            // Randomize the starting callbackId to avoid collisions after refreshing or navigating.
            // This way, it's very unlikely that any new callback would get the same callbackId as an old callback.
            callbackId: Math.floor(Math.random() * 2000000000),
            callbacks: {},
            callbackStatus: {
                NO_RESULT: 0,
                OK: 1,
                CLASS_NOT_FOUND_EXCEPTION: 2,
                ILLEGAL_ACCESS_EXCEPTION: 3,
                INSTANTIATION_EXCEPTION: 4,
                MALFORMED_URL_EXCEPTION: 5,
                IO_EXCEPTION: 6,
                INVALID_ACTION: 7,
                JSON_EXCEPTION: 8,
                ERROR: 9
            },

            /**
             * Called by native code when returning successful result from an action.
             */
            callbackSuccess: function (callbackId, args) {
                try {
                    cordova.callbackFromNative(callbackId, true, args.status, [args.message], args.keepCallback);
                } catch (e) {
                    console.log("Error in error callback: " + callbackId + " = " + e);
                }
            },

            /**
             * Called by native code when returning error result from an action.
             */
            callbackError: function (callbackId, args) {
                // TODO: Deprecate callbackSuccess and callbackError in favour of callbackFromNative.
                // Derive success from status.
                try {
                    cordova.callbackFromNative(callbackId, false, args.status, [args.message], args.keepCallback);
                } catch (e) {
                    console.log("Error in error callback: " + callbackId + " = " + e);
                }
            },

            /**
             * Called by native code when returning the result from an action.
             */
            callbackFromNative: function (callbackId, success, status, args, keepCallback) {
                var callback = cordova.callbacks[callbackId];
                if (callback) {
                    if (success && status == cordova.callbackStatus.OK) {
                        callback.success && callback.success.apply(null, args);
                    } else if (!success) {
                        callback.fail && callback.fail.apply(null, args);
                    }

                    // Clear callback if not expecting any more results
                    if (!keepCallback) {
                        delete cordova.callbacks[callbackId];
                    }
                }
            },
            addConstructor: function (func) {
                channel.onCordovaReady.subscribe(function () {
                    try {
                        func();
                    } catch (e) {
                        console.log("Failed to run constructor: " + e);
                    }
                });
            }
        };


        module.exports = cordova;

    });

// file: src/android/android/nativeapiprovider.js
    define("cordova/android/nativeapiprovider", function (require, exports, module) {

        /**
         * Exports the ExposedJsApi.java object if available, otherwise exports the PromptBasedNativeApi.
         */

        var nativeApi = this._cordovaNative || require('cordova/android/promptbasednativeapi');
        var currentApi = nativeApi;

        module.exports = {
            get: function () {
                return currentApi;
            },
            setPreferPrompt: function (value) {
                currentApi = value ? require('cordova/android/promptbasednativeapi') : nativeApi;
            },
            // Used only by tests.
            set: function (value) {
                currentApi = value;
            }
        };

    });

// file: src/android/android/promptbasednativeapi.js
    define("cordova/android/promptbasednativeapi", function (require, exports, module) {

        /**
         * Implements the API of ExposedJsApi.java, but uses prompt() to communicate.
         * This is used only on the 2.3 simulator, where addJavascriptInterface() is broken.
         */

        module.exports = {
            exec: function (service, action, callbackId, argsJson) {
                return prompt(argsJson, 'gap:' + JSON.stringify([service, action, callbackId]));
            },
            setNativeToJsBridgeMode: function (value) {
                prompt(value, 'gap_bridge_mode:');
            },
            retrieveJsMessages: function (fromOnlineEvent) {
                return prompt(+fromOnlineEvent, 'gap_poll:');
            }
        };

    });

// file: src/common/argscheck.js
    define("cordova/argscheck", function (require, exports, module) {

        var exec = require('cordova/exec');
        var utils = require('cordova/utils');

        var moduleExports = module.exports;

        var typeMap = {
            'A': 'Array',
            'D': 'Date',
            'N': 'Number',
            'S': 'String',
            'F': 'Function',
            'O': 'Object'
        };

        function extractParamName(callee, argIndex) {
            return (/.*?\((.*?)\)/).exec(callee)[1].split(', ')[argIndex];
        }

        function checkArgs(spec, functionName, args, opt_callee) {
            if (!moduleExports.enableChecks) {
                return;
            }
            var errMsg = null;
            var typeName;
            for (var i = 0; i < spec.length; ++i) {
                var c = spec.charAt(i),
                    cUpper = c.toUpperCase(),
                    arg = args[i];
                // Asterix means allow anything.
                if (c == '*') {
                    continue;
                }
                typeName = utils.typeName(arg);
                if ((arg === null || arg === undefined) && c == cUpper) {
                    continue;
                }
                if (typeName != typeMap[cUpper]) {
                    errMsg = 'Expected ' + typeMap[cUpper];
                    break;
                }
            }
            if (errMsg) {
                errMsg += ', but got ' + typeName + '.';
                errMsg = 'Wrong type for parameter "' + extractParamName(opt_callee || args.callee, i) + '" of ' + functionName + ': ' + errMsg;
                // Don't log when running unit tests.
                if (typeof jasmine == 'undefined') {
                    console.error(errMsg);
                }
                throw TypeError(errMsg);
            }
        }

        function getValue(value, defaultValue) {
            return value === undefined ? defaultValue : value;
        }

        moduleExports.checkArgs = checkArgs;
        moduleExports.getValue = getValue;
        moduleExports.enableChecks = true;


    });

// file: src/common/base64.js
    define("cordova/base64", function (require, exports, module) {

        var base64 = exports;

        base64.fromArrayBuffer = function (arrayBuffer) {
            var array = new Uint8Array(arrayBuffer);
            return uint8ToBase64(array);
        };

        base64.toArrayBuffer = function (str) {
            var decodedStr = typeof atob != 'undefined' ? atob(str) : new Buffer(str, 'base64').toString('binary');
            var arrayBuffer = new ArrayBuffer(decodedStr.length);
            var array = new Uint8Array(arrayBuffer);
            for (var i = 0, len = decodedStr.length; i < len; i++) {
                array[i] = decodedStr.charCodeAt(i);
            }
            return arrayBuffer;
        };

//------------------------------------------------------------------------------

        /* This code is based on the performance tests at http://jsperf.com/b64tests
         * This 12-bit-at-a-time algorithm was the best performing version on all
         * platforms tested.
         */

        var b64_6bit = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var b64_12bit;

        var b64_12bitTable = function () {
            b64_12bit = [];
            for (var i = 0; i < 64; i++) {
                for (var j = 0; j < 64; j++) {
                    b64_12bit[i * 64 + j] = b64_6bit[i] + b64_6bit[j];
                }
            }
            b64_12bitTable = function () {
                return b64_12bit;
            };
            return b64_12bit;
        };

        function uint8ToBase64(rawData) {
            var numBytes = rawData.byteLength;
            var output = "";
            var segment;
            var table = b64_12bitTable();
            for (var i = 0; i < numBytes - 2; i += 3) {
                segment = (rawData[i] << 16) + (rawData[i + 1] << 8) + rawData[i + 2];
                output += table[segment >> 12];
                output += table[segment & 0xfff];
            }
            if (numBytes - i == 2) {
                segment = (rawData[i] << 16) + (rawData[i + 1] << 8);
                output += table[segment >> 12];
                output += b64_6bit[(segment & 0xfff) >> 6];
                output += '=';
            } else if (numBytes - i == 1) {
                segment = (rawData[i] << 16);
                output += table[segment >> 12];
                output += '==';
            }
            return output;
        }

    });

// file: src/common/builder.js
    define("cordova/builder", function (require, exports, module) {

        var utils = require('cordova/utils');

        function each(objects, func, context) {
            for (var prop in objects) {
                if (objects.hasOwnProperty(prop)) {
                    func.apply(context, [objects[prop], prop]);
                }
            }
        }

        function clobber(obj, key, value) {
            exports.replaceHookForTesting(obj, key);
            obj[key] = value;
            // Getters can only be overridden by getters.
            if (obj[key] !== value) {
                utils.defineGetter(obj, key, function () {
                    return value;
                });
            }
        }

        function assignOrWrapInDeprecateGetter(obj, key, value, message) {
            if (message) {
                utils.defineGetter(obj, key, function () {
                    console.log(message);
                    delete obj[key];
                    clobber(obj, key, value);
                    return value;
                });
            } else {
                clobber(obj, key, value);
            }
        }

        function include(parent, objects, clobber, merge) {
            each(objects, function (obj, key) {
                try {
                    var result = obj.path ? require(obj.path) : {};

                    if (clobber) {
                        // Clobber if it doesn't exist.
                        if (typeof parent[key] === 'undefined') {
                            assignOrWrapInDeprecateGetter(parent, key, result, obj.deprecated);
                        } else if (typeof obj.path !== 'undefined') {
                            // If merging, merge properties onto parent, otherwise, clobber.
                            if (merge) {
                                recursiveMerge(parent[key], result);
                            } else {
                                assignOrWrapInDeprecateGetter(parent, key, result, obj.deprecated);
                            }
                        }
                        result = parent[key];
                    } else {
                        // Overwrite if not currently defined.
                        if (typeof parent[key] == 'undefined') {
                            assignOrWrapInDeprecateGetter(parent, key, result, obj.deprecated);
                        } else {
                            // Set result to what already exists, so we can build children into it if they exist.
                            result = parent[key];
                        }
                    }

                    if (obj.children) {
                        include(result, obj.children, clobber, merge);
                    }
                } catch (e) {
                    utils.alert('Exception building Cordova JS globals: ' + e + ' for key "' + key + '"');
                }
            });
        }

        /**
         * Merge properties from one object onto another recursively.  Properties from
         * the src object will overwrite existing target property.
         *
         * @param target Object to merge properties into.
         * @param src Object to merge properties from.
         */
        function recursiveMerge(target, src) {
            for (var prop in src) {
                if (src.hasOwnProperty(prop)) {
                    if (target.prototype && target.prototype.constructor === target) {
                        // If the target object is a constructor override off prototype.
                        clobber(target.prototype, prop, src[prop]);
                    } else {
                        if (typeof src[prop] === 'object' && typeof target[prop] === 'object') {
                            recursiveMerge(target[prop], src[prop]);
                        } else {
                            clobber(target, prop, src[prop]);
                        }
                    }
                }
            }
        }

        exports.buildIntoButDoNotClobber = function (objects, target) {
            include(target, objects, false, false);
        };
        exports.buildIntoAndClobber = function (objects, target) {
            include(target, objects, true, false);
        };
        exports.buildIntoAndMerge = function (objects, target) {
            include(target, objects, true, true);
        };
        exports.recursiveMerge = recursiveMerge;
        exports.assignOrWrapInDeprecateGetter = assignOrWrapInDeprecateGetter;
        exports.replaceHookForTesting = function () {
        };

    });

// file: src/common/channel.js
    define("cordova/channel", function (require, exports, module) {

        var utils = require('cordova/utils'),
            nextGuid = 1;

        /**
         * Custom pub-sub "channel" that can have functions subscribed to it
         * This object is used to define and control firing of events for
         * cordova initialization, as well as for custom events thereafter.
         *
         * The order of events during page load and Cordova startup is as follows:
         *
         * onDOMContentLoaded*         Internal event that is received when the web page is loaded and parsed.
         * onNativeReady*              Internal event that indicates the Cordova native side is ready.
         * onCordovaReady*             Internal event fired when all Cordova JavaScript objects have been created.
         * onDeviceReady*              User event fired to indicate that Cordova is ready
         * onResume                    User event fired to indicate a start/resume lifecycle event
         * onPause                     User event fired to indicate a pause lifecycle event
         * onDestroy*                  Internal event fired when app is being destroyed (User should use window.onunload event, not this one).
         *
         * The events marked with an * are sticky. Once they have fired, they will stay in the fired state.
         * All listeners that subscribe after the event is fired will be executed right away.
         *
         * The only Cordova events that user code should register for are:
         *      deviceready           Cordova native code is initialized and Cordova APIs can be called from JavaScript
         *      pause                 App has moved to background
         *      resume                App has returned to foreground
         *
         * Listeners can be registered as:
         *      document.addEventListener("deviceready", myDeviceReadyListener, false);
         *      document.addEventListener("resume", myResumeListener, false);
         *      document.addEventListener("pause", myPauseListener, false);
         *
         * The DOM lifecycle events should be used for saving and restoring state
         *      window.onload
         *      window.onunload
         *
         */

        /**
         * Channel
         * @constructor
         * @param type  String the channel name
         */
        var Channel = function (type, sticky) {
                this.type = type;
                // Map of guid -> function.
                this.handlers = {};
                // 0 = Non-sticky, 1 = Sticky non-fired, 2 = Sticky fired.
                this.state = sticky ? 1 : 0;
                // Used in sticky mode to remember args passed to fire().
                this.fireArgs = null;
                // Used by onHasSubscribersChange to know if there are any listeners.
                this.numHandlers = 0;
                // Function that is called when the first listener is subscribed, or when
                // the last listener is unsubscribed.
                this.onHasSubscribersChange = null;
            },
            channel = {
                /**
                 * Calls the provided function only after all of the channels specified
                 * have been fired. All channels must be sticky channels.
                 */
                join: function (h, c) {
                    var len = c.length,
                        i = len,
                        f = function () {
                            if (!(--i)) h();
                        };
                    for (var j = 0; j < len; j++) {
                        if (c[j].state === 0) {
                            throw Error('Can only use join with sticky channels.');
                        }
                        c[j].subscribe(f);
                    }
                    if (!len) h();
                },
                create: function (type) {
                    return channel[type] = new Channel(type, false);
                },
                createSticky: function (type) {
                    return channel[type] = new Channel(type, true);
                },

                /**
                 * cordova Channels that must fire before "deviceready" is fired.
                 */
                deviceReadyChannelsArray: [],
                deviceReadyChannelsMap: {},

                /**
                 * Indicate that a feature needs to be initialized before it is ready to be used.
                 * This holds up Cordova's "deviceready" event until the feature has been initialized
                 * and Cordova.initComplete(feature) is called.
                 *
                 * @param feature {String}     The unique feature name
                 */
                waitForInitialization: function (feature) {
                    if (feature) {
                        var c = channel[feature] || this.createSticky(feature);
                        this.deviceReadyChannelsMap[feature] = c;
                        this.deviceReadyChannelsArray.push(c);
                    }
                },

                /**
                 * Indicate that initialization code has completed and the feature is ready to be used.
                 *
                 * @param feature {String}     The unique feature name
                 */
                initializationComplete: function (feature) {
                    var c = this.deviceReadyChannelsMap[feature];
                    if (c) {
                        c.fire();
                    }
                }
            };

        function forceFunction(f) {
            if (typeof f != 'function') throw "Function required as first argument!";
        }

        /**
         * Subscribes the given function to the channel. Any time that
         * Channel.fire is called so too will the function.
         * Optionally specify an execution context for the function
         * and a guid that can be used to stop subscribing to the channel.
         * Returns the guid.
         */
        Channel.prototype.subscribe = function (f, c) {
            // need a function to call
            forceFunction(f);
            if (this.state == 2) {
                f.apply(c || this, this.fireArgs);
                return;
            }

            var func = f,
                guid = f.observer_guid;
            if (typeof c == "object") {
                func = utils.close(c, f);
            }

            if (!guid) {
                // first time any channel has seen this subscriber
                guid = '' + nextGuid++;
            }
            func.observer_guid = guid;
            f.observer_guid = guid;

            // Don't add the same handler more than once.
            if (!this.handlers[guid]) {
                this.handlers[guid] = func;
                this.numHandlers++;
                if (this.numHandlers == 1) {
                    this.onHasSubscribersChange && this.onHasSubscribersChange();
                }
            }
        };

        /**
         * Unsubscribes the function with the given guid from the channel.
         */
        Channel.prototype.unsubscribe = function (f) {
            // need a function to unsubscribe
            forceFunction(f);

            var guid = f.observer_guid,
                handler = this.handlers[guid];
            if (handler) {
                delete this.handlers[guid];
                this.numHandlers--;
                if (this.numHandlers === 0) {
                    this.onHasSubscribersChange && this.onHasSubscribersChange();
                }
            }
        };

        /**
         * Calls all functions subscribed to this channel.
         */
        Channel.prototype.fire = function (e) {
            var fail = false,
                fireArgs = Array.prototype.slice.call(arguments);
            // Apply stickiness.
            if (this.state == 1) {
                this.state = 2;
                this.fireArgs = fireArgs;
            }
            if (this.numHandlers) {
                // Copy the values first so that it is safe to modify it from within
                // callbacks.
                var toCall = [];
                for (var item in this.handlers) {
                    toCall.push(this.handlers[item]);
                }
                for (var i = 0; i < toCall.length; ++i) {
                    toCall[i].apply(this, fireArgs);
                }
                if (this.state == 2 && this.numHandlers) {
                    this.numHandlers = 0;
                    this.handlers = {};
                    this.onHasSubscribersChange && this.onHasSubscribersChange();
                }
            }
        };


// defining them here so they are ready super fast!
// DOM event that is received when the web page is loaded and parsed.
        channel.createSticky('onDOMContentLoaded');

// Event to indicate the Cordova native side is ready.
        channel.createSticky('onNativeReady');

// Event to indicate that all Cordova JavaScript objects have been created
// and it's time to run plugin constructors.
        channel.createSticky('onCordovaReady');

// Event to indicate that all automatically loaded JS plugins are loaded and ready.
// FIXME remove this
        channel.createSticky('onPluginsReady');

// Event to indicate that Cordova is ready
        channel.createSticky('onDeviceReady');

// Event to indicate a resume lifecycle event
        channel.create('onResume');

// Event to indicate a pause lifecycle event
        channel.create('onPause');

// Event to indicate a destroy lifecycle event
        channel.createSticky('onDestroy');

// Channels that must fire before "deviceready" is fired.
        channel.waitForInitialization('onCordovaReady');
        channel.waitForInitialization('onDOMContentLoaded');

        module.exports = channel;

    });

// file: src/android/exec.js
    define("cordova/exec", function (require, exports, module) {

        /**
         * Execute a cordova command.  It is up to the native side whether this action
         * is synchronous or asynchronous.  The native side can return:
         *      Synchronous: PluginResult object as a JSON string
         *      Asynchronous: Empty string ""
         * If async, the native side will cordova.callbackSuccess or cordova.callbackError,
         * depending upon the result of the action.
         *
         * @param {Function} success    The success callback
         * @param {Function} fail       The fail callback
         * @param {String} service      The name of the service to use
         * @param {String} action       Action to be run in cordova
         * @param {String[]} [args]     Zero or more arguments to pass to the method
         */
        var cordova = require('cordova'),
            nativeApiProvider = require('cordova/android/nativeapiprovider'),
            utils = require('cordova/utils'),
            base64 = require('cordova/base64'),
            jsToNativeModes = {
                PROMPT: 0,
                JS_OBJECT: 1,
                // This mode is currently for benchmarking purposes only. It must be enabled
                // on the native side through the ENABLE_LOCATION_CHANGE_EXEC_MODE
                // constant within CordovaWebViewClient.java before it will work.
                LOCATION_CHANGE: 2
            },
            nativeToJsModes = {
                // Polls for messages using the JS->Native bridge.
                POLLING: 0,
                // For LOAD_URL to be viable, it would need to have a work-around for
                // the bug where the soft-keyboard gets dismissed when a message is sent.
                LOAD_URL: 1,
                // For the ONLINE_EVENT to be viable, it would need to intercept all event
                // listeners (both through addEventListener and window.ononline) as well
                // as set the navigator property itself.
                ONLINE_EVENT: 2,
                // Uses reflection to access private APIs of the WebView that can send JS
                // to be executed.
                // Requires Android 3.2.4 or above.
                PRIVATE_API: 3
            },
            jsToNativeBridgeMode,  // Set lazily.
            nativeToJsBridgeMode = nativeToJsModes.ONLINE_EVENT,
            pollEnabled = false,
            messagesFromNative = [];

        function androidExec(success, fail, service, action, args) {
            // Set default bridge modes if they have not already been set.
            // By default, we use the failsafe, since addJavascriptInterface breaks too often
            if (jsToNativeBridgeMode === undefined) {
                androidExec.setJsToNativeBridgeMode(jsToNativeModes.JS_OBJECT);
            }

            // Process any ArrayBuffers in the args into a string.
            for (var i = 0; i < args.length; i++) {
                if (utils.typeName(args[i]) == 'ArrayBuffer') {
                    args[i] = base64.fromArrayBuffer(args[i]);
                }
            }

            var callbackId = service + cordova.callbackId++,
                argsJson = JSON.stringify(args);

            if (success || fail) {
                cordova.callbacks[callbackId] = {success: success, fail: fail};
            }

            if (jsToNativeBridgeMode == jsToNativeModes.LOCATION_CHANGE) {
                window.location = 'http://cdv_exec/' + service + '#' + action + '#' + callbackId + '#' + argsJson;
            } else {
                var messages = nativeApiProvider.get().exec(service, action, callbackId, argsJson);
                // If argsJson was received by Java as null, try again with the PROMPT bridge mode.
                // This happens in rare circumstances, such as when certain Unicode characters are passed over the bridge on a Galaxy S2.  See CB-2666.
                if (jsToNativeBridgeMode == jsToNativeModes.JS_OBJECT && messages === "@Null arguments.") {
                    androidExec.setJsToNativeBridgeMode(jsToNativeModes.PROMPT);
                    androidExec(success, fail, service, action, args);
                    androidExec.setJsToNativeBridgeMode(jsToNativeModes.JS_OBJECT);
                    return;
                } else {
                    androidExec.processMessages(messages, true);
                }
            }
        }

        function pollOnceFromOnlineEvent() {
            pollOnce(true);
        }

        function pollOnce(opt_fromOnlineEvent) {
            var msg = nativeApiProvider.get().retrieveJsMessages(!!opt_fromOnlineEvent);
            androidExec.processMessages(msg);
        }

        function pollingTimerFunc() {
            if (pollEnabled) {
                pollOnce();
                setTimeout(pollingTimerFunc, 50);
            }
        }

        function hookOnlineApis() {
            function proxyEvent(e) {
                cordova.fireWindowEvent(e.type);
            }

            // The network module takes care of firing online and offline events.
            // It currently fires them only on document though, so we bridge them
            // to window here (while first listening for exec()-releated online/offline
            // events).
            window.addEventListener('online', pollOnceFromOnlineEvent, false);
            window.addEventListener('offline', pollOnceFromOnlineEvent, false);
            cordova.addWindowEventHandler('online');
            cordova.addWindowEventHandler('offline');
            document.addEventListener('online', proxyEvent, false);
            document.addEventListener('offline', proxyEvent, false);
        }

        hookOnlineApis();

        androidExec.jsToNativeModes = jsToNativeModes;
        androidExec.nativeToJsModes = nativeToJsModes;

        androidExec.setJsToNativeBridgeMode = function (mode) {
            if (mode == jsToNativeModes.JS_OBJECT && !window._cordovaNative) {
                mode = jsToNativeModes.PROMPT;
            }
            nativeApiProvider.setPreferPrompt(mode == jsToNativeModes.PROMPT);
            jsToNativeBridgeMode = mode;
        };

        androidExec.setNativeToJsBridgeMode = function (mode) {
            if (mode == nativeToJsBridgeMode) {
                return;
            }
            if (nativeToJsBridgeMode == nativeToJsModes.POLLING) {
                pollEnabled = false;
            }

            nativeToJsBridgeMode = mode;
            // Tell the native side to switch modes.
            nativeApiProvider.get().setNativeToJsBridgeMode(mode);

            if (mode == nativeToJsModes.POLLING) {
                pollEnabled = true;
                setTimeout(pollingTimerFunc, 1);
            }
        };

// Processes a single message, as encoded by NativeToJsMessageQueue.java.
        function processMessage(message) {
            try {
                var firstChar = message.charAt(0);
                if (firstChar == 'J') {
                    eval(message.slice(1));
                } else if (firstChar == 'S' || firstChar == 'F') {
                    var success = firstChar == 'S';
                    var keepCallback = message.charAt(1) == '1';
                    var spaceIdx = message.indexOf(' ', 2);
                    var status = +message.slice(2, spaceIdx);
                    var nextSpaceIdx = message.indexOf(' ', spaceIdx + 1);
                    var callbackId = message.slice(spaceIdx + 1, nextSpaceIdx);
                    var payloadKind = message.charAt(nextSpaceIdx + 1);
                    var payload;
                    if (payloadKind == 's') {
                        payload = message.slice(nextSpaceIdx + 2);
                    } else if (payloadKind == 't') {
                        payload = true;
                    } else if (payloadKind == 'f') {
                        payload = false;
                    } else if (payloadKind == 'N') {
                        payload = null;
                    } else if (payloadKind == 'n') {
                        payload = +message.slice(nextSpaceIdx + 2);
                    } else if (payloadKind == 'A') {
                        var data = message.slice(nextSpaceIdx + 2);
                        var bytes = window.atob(data);
                        var arraybuffer = new Uint8Array(bytes.length);
                        for (var i = 0; i < bytes.length; i++) {
                            arraybuffer[i] = bytes.charCodeAt(i);
                        }
                        payload = arraybuffer.buffer;
                    } else if (payloadKind == 'S') {
                        payload = window.atob(message.slice(nextSpaceIdx + 2));
                    } else {
                        payload = JSON.parse(message.slice(nextSpaceIdx + 1));
                    }
                    cordova.callbackFromNative(callbackId, success, status, [payload], keepCallback);
                } else {
                    console.log("processMessage failed: invalid message: " + JSON.stringify(message));
                }
            } catch (e) {
                console.log("processMessage failed: Error: " + e);
                console.log("processMessage failed: Stack: " + e.stack);
                console.log("processMessage failed: Message: " + message);
            }
        }

        var isProcessing = false;

// This is called from the NativeToJsMessageQueue.java.
        androidExec.processMessages = function (messages, opt_useTimeout) {
            if (messages) {
                messagesFromNative.push(messages);
            }
            // Check for the reentrant case.
            if (isProcessing) {
                return;
            }
            if (opt_useTimeout) {
                window.setTimeout(androidExec.processMessages, 0);
                return;
            }
            isProcessing = true;
            try {
                // TODO: add setImmediate polyfill and process only one message at a time.
                while (messagesFromNative.length) {
                    var msg = popMessageFromQueue();
                    // The Java side can send a * message to indicate that it
                    // still has messages waiting to be retrieved.
                    if (msg == '*' && messagesFromNative.length === 0) {
                        setTimeout(pollOnce, 0);
                        return;
                    }
                    processMessage(msg);
                }
            } finally {
                isProcessing = false;
            }
        };

        function popMessageFromQueue() {
            var messageBatch = messagesFromNative.shift();
            if (messageBatch == '*') {
                return '*';
            }

            var spaceIdx = messageBatch.indexOf(' ');
            var msgLen = +messageBatch.slice(0, spaceIdx);
            var message = messageBatch.substr(spaceIdx + 1, msgLen);
            messageBatch = messageBatch.slice(spaceIdx + msgLen + 1);
            if (messageBatch) {
                messagesFromNative.unshift(messageBatch);
            }
            return message;
        }

        module.exports = androidExec;

    });

// file: src/common/exec/proxy.js
    define("cordova/exec/proxy", function (require, exports, module) {


// internal map of proxy function
        var CommandProxyMap = {};

        module.exports = {

            // example: cordova.commandProxy.add("Accelerometer",{getCurrentAcceleration: function(successCallback, errorCallback, options) {...},...);
            add: function (id, proxyObj) {
                console.log("adding proxy for " + id);
                CommandProxyMap[id] = proxyObj;
                return proxyObj;
            },

            // cordova.commandProxy.remove("Accelerometer");
            remove: function (id) {
                var proxy = CommandProxyMap[id];
                delete CommandProxyMap[id];
                CommandProxyMap[id] = null;
                return proxy;
            },

            get: function (service, action) {
                return ( CommandProxyMap[service] ? CommandProxyMap[service][action] : null );
            }
        };
    });

// file: src/common/init.js
    define("cordova/init", function (require, exports, module) {

        var channel = require('cordova/channel');
        var cordova = require('cordova');
        var modulemapper = require('cordova/modulemapper');
        var platform = require('cordova/platform');
        var pluginloader = require('cordova/pluginloader');

        var platformInitChannelsArray = [channel.onNativeReady, channel.onPluginsReady];

        function logUnfiredChannels(arr) {
            for (var i = 0; i < arr.length; ++i) {
                if (arr[i].state != 2) {
                    console.log('Channel not fired: ' + arr[i].type);
                }
            }
        }

        window.setTimeout(function () {
            if (channel.onDeviceReady.state != 2) {
                console.log('deviceready has not fired after 5 seconds.');
                logUnfiredChannels(platformInitChannelsArray);
                logUnfiredChannels(channel.deviceReadyChannelsArray);
            }
        }, 5000);

// Replace navigator before any modules are required(), to ensure it happens as soon as possible.
// We replace it so that properties that can't be clobbered can instead be overridden.
        function replaceNavigator(origNavigator) {
            var CordovaNavigator = function () {
            };
            CordovaNavigator.prototype = origNavigator;
            var newNavigator = new CordovaNavigator();
            // This work-around really only applies to new APIs that are newer than Function.bind.
            // Without it, APIs such as getGamepads() break.
            if (CordovaNavigator.bind) {
                for (var key in origNavigator) {
                    if (typeof origNavigator[key] == 'function') {
                        newNavigator[key] = origNavigator[key].bind(origNavigator);
                    }
                }
            }
            return newNavigator;
        }

        if (window.navigator) {
            window.navigator = replaceNavigator(window.navigator);
        }

        if (!window.console) {
            window.console = {
                log: function () {
                }
            };
        }
        if (!window.console.warn) {
            window.console.warn = function (msg) {
                this.log("warn: " + msg);
            };
        }

// Register pause, resume and deviceready channels as events on document.
        channel.onPause = cordova.addDocumentEventHandler('pause');
        channel.onResume = cordova.addDocumentEventHandler('resume');
        channel.onDeviceReady = cordova.addStickyDocumentEventHandler('deviceready');

// Listen for DOMContentLoaded and notify our channel subscribers.
        if (document.readyState == 'complete' || document.readyState == 'interactive') {
            channel.onDOMContentLoaded.fire();
        } else {
            document.addEventListener('DOMContentLoaded', function () {
                channel.onDOMContentLoaded.fire();
            }, false);
        }

// _nativeReady is global variable that the native side can set
// to signify that the native code is ready. It is a global since
// it may be called before any cordova JS is ready.
        if (window._nativeReady) {
            channel.onNativeReady.fire();
        }

        modulemapper.clobbers('cordova', 'cordova');
        modulemapper.clobbers('cordova/exec', 'cordova.exec');
        modulemapper.clobbers('cordova/exec', 'Cordova.exec');

// Call the platform-specific initialization.
        platform.bootstrap && platform.bootstrap();

// Wrap in a setTimeout to support the use-case of having plugin JS appended to cordova.js.
// The delay allows the attached modules to be defined before the plugin loader looks for them.
        setTimeout(function () {
            pluginloader.load(function () {
                channel.onPluginsReady.fire();
            });
        }, 0);

        /**
         * Create all cordova objects once native side is ready.
         */
        channel.join(function () {
            modulemapper.mapModules(window);

            platform.initialize && platform.initialize();

            // Fire event to notify that all objects are created
            channel.onCordovaReady.fire();

            // Fire onDeviceReady event once page has fully loaded, all
            // constructors have run and cordova info has been received from native
            // side.
            channel.join(function () {
                require('cordova').fireDocumentEvent('deviceready');
            }, channel.deviceReadyChannelsArray);

        }, platformInitChannelsArray);


    });

// file: src/common/init_b.js
    define("cordova/init_b", function (require, exports, module) {

        var channel = require('cordova/channel');
        var cordova = require('cordova');
        var platform = require('cordova/platform');

        var platformInitChannelsArray = [channel.onDOMContentLoaded, channel.onNativeReady];

// setting exec
        cordova.exec = require('cordova/exec');

        function logUnfiredChannels(arr) {
            for (var i = 0; i < arr.length; ++i) {
                if (arr[i].state != 2) {
                    console.log('Channel not fired: ' + arr[i].type);
                }
            }
        }

        window.setTimeout(function () {
            if (channel.onDeviceReady.state != 2) {
                console.log('deviceready has not fired after 5 seconds.');
                logUnfiredChannels(platformInitChannelsArray);
                logUnfiredChannels(channel.deviceReadyChannelsArray);
            }
        }, 5000);

// Replace navigator before any modules are required(), to ensure it happens as soon as possible.
// We replace it so that properties that can't be clobbered can instead be overridden.
        function replaceNavigator(origNavigator) {
            var CordovaNavigator = function () {
            };
            CordovaNavigator.prototype = origNavigator;
            var newNavigator = new CordovaNavigator();
            // This work-around really only applies to new APIs that are newer than Function.bind.
            // Without it, APIs such as getGamepads() break.
            if (CordovaNavigator.bind) {
                for (var key in origNavigator) {
                    if (typeof origNavigator[key] == 'function') {
                        newNavigator[key] = origNavigator[key].bind(origNavigator);
                    }
                }
            }
            return newNavigator;
        }

        if (window.navigator) {
            window.navigator = replaceNavigator(window.navigator);
        }

        if (!window.console) {
            window.console = {
                log: function () {
                }
            };
        }
        if (!window.console.warn) {
            window.console.warn = function (msg) {
                this.log("warn: " + msg);
            };
        }

// Register pause, resume and deviceready channels as events on document.
        channel.onPause = cordova.addDocumentEventHandler('pause');
        channel.onResume = cordova.addDocumentEventHandler('resume');
        channel.onDeviceReady = cordova.addStickyDocumentEventHandler('deviceready');

// Listen for DOMContentLoaded and notify our channel subscribers.
        if (document.readyState == 'complete' || document.readyState == 'interactive') {
            channel.onDOMContentLoaded.fire();
        } else {
            document.addEventListener('DOMContentLoaded', function () {
                channel.onDOMContentLoaded.fire();
            }, false);
        }

// _nativeReady is global variable that the native side can set
// to signify that the native code is ready. It is a global since
// it may be called before any cordova JS is ready.
        if (window._nativeReady) {
            channel.onNativeReady.fire();
        }

// Call the platform-specific initialization.
        platform.bootstrap && platform.bootstrap();

        /**
         * Create all cordova objects once native side is ready.
         */
        channel.join(function () {

            platform.initialize && platform.initialize();

            // Fire event to notify that all objects are created
            channel.onCordovaReady.fire();

            // Fire onDeviceReady event once page has fully loaded, all
            // constructors have run and cordova info has been received from native
            // side.
            channel.join(function () {
                require('cordova').fireDocumentEvent('deviceready');
            }, channel.deviceReadyChannelsArray);

        }, platformInitChannelsArray);

    });

// file: src/common/modulemapper.js
    define("cordova/modulemapper", function (require, exports, module) {

        var builder = require('cordova/builder'),
            moduleMap = define.moduleMap,
            symbolList,
            deprecationMap;

        exports.reset = function () {
            symbolList = [];
            deprecationMap = {};
        };

        function addEntry(strategy, moduleName, symbolPath, opt_deprecationMessage) {
            if (!(moduleName in moduleMap)) {
                throw new Error('Module ' + moduleName + ' does not exist.');
            }
            symbolList.push(strategy, moduleName, symbolPath);
            if (opt_deprecationMessage) {
                deprecationMap[symbolPath] = opt_deprecationMessage;
            }
        }

// Note: Android 2.3 does have Function.bind().
        exports.clobbers = function (moduleName, symbolPath, opt_deprecationMessage) {
            addEntry('c', moduleName, symbolPath, opt_deprecationMessage);
        };

        exports.merges = function (moduleName, symbolPath, opt_deprecationMessage) {
            addEntry('m', moduleName, symbolPath, opt_deprecationMessage);
        };

        exports.defaults = function (moduleName, symbolPath, opt_deprecationMessage) {
            addEntry('d', moduleName, symbolPath, opt_deprecationMessage);
        };

        exports.runs = function (moduleName) {
            addEntry('r', moduleName, null);
        };

        function prepareNamespace(symbolPath, context) {
            if (!symbolPath) {
                return context;
            }
            var parts = symbolPath.split('.');
            var cur = context;
            for (var i = 0, part; part = parts[i]; ++i) {
                cur = cur[part] = cur[part] || {};
            }
            return cur;
        }

        exports.mapModules = function (context) {
            var origSymbols = {};
            context.CDV_origSymbols = origSymbols;
            for (var i = 0, len = symbolList.length; i < len; i += 3) {
                var strategy = symbolList[i];
                var moduleName = symbolList[i + 1];
                var module = require(moduleName);
                // <runs/>
                if (strategy == 'r') {
                    continue;
                }
                var symbolPath = symbolList[i + 2];
                var lastDot = symbolPath.lastIndexOf('.');
                var namespace = symbolPath.substr(0, lastDot);
                var lastName = symbolPath.substr(lastDot + 1);

                var deprecationMsg = symbolPath in deprecationMap ? 'Access made to deprecated symbol: ' + symbolPath + '. ' + deprecationMsg : null;
                var parentObj = prepareNamespace(namespace, context);
                var target = parentObj[lastName];

                if (strategy == 'm' && target) {
                    builder.recursiveMerge(target, module);
                } else if ((strategy == 'd' && !target) || (strategy != 'd')) {
                    if (!(symbolPath in origSymbols)) {
                        origSymbols[symbolPath] = target;
                    }
                    builder.assignOrWrapInDeprecateGetter(parentObj, lastName, module, deprecationMsg);
                }
            }
        };

        exports.getOriginalSymbol = function (context, symbolPath) {
            var origSymbols = context.CDV_origSymbols;
            if (origSymbols && (symbolPath in origSymbols)) {
                return origSymbols[symbolPath];
            }
            var parts = symbolPath.split('.');
            var obj = context;
            for (var i = 0; i < parts.length; ++i) {
                obj = obj && obj[parts[i]];
            }
            return obj;
        };

        exports.reset();


    });

// file: src/android/platform.js
    define("cordova/platform", function (require, exports, module) {

        module.exports = {
            id: 'android',
            bootstrap: function () {
                var channel = require('cordova/channel'),
                    cordova = require('cordova'),
                    exec = require('cordova/exec'),
                    modulemapper = require('cordova/modulemapper');

                // Tell the native code that a page change has occurred.
                exec(null, null, 'PluginManager', 'startup', []);
                // Tell the JS that the native side is ready.
                channel.onNativeReady.fire();

                // TODO: Extract this as a proper plugin.
                modulemapper.clobbers('cordova/plugin/android/app', 'navigator.app');

                // Inject a listener for the backbutton on the document.
                var backButtonChannel = cordova.addDocumentEventHandler('backbutton');
                backButtonChannel.onHasSubscribersChange = function () {
                    // If we just attached the first handler or detached the last handler,
                    // let native know we need to override the back button.
                    exec(null, null, "App", "overrideBackbutton", [this.numHandlers == 1]);
                };

                // Add hardware MENU and SEARCH button handlers
                cordova.addDocumentEventHandler('menubutton');
                cordova.addDocumentEventHandler('searchbutton');

                // Let native code know we are all done on the JS side.
                // Native code will then un-hide the WebView.
                channel.onCordovaReady.subscribe(function () {
                    exec(null, null, "App", "show", []);
                });
            }
        };

    });

// file: src/android/plugin/android/app.js
    define("cordova/plugin/android/app", function (require, exports, module) {

        var exec = require('cordova/exec');

        module.exports = {
            /**
             * Clear the resource cache.
             */
            clearCache: function () {
                exec(null, null, "App", "clearCache", []);
            },

            /**
             * Load the url into the webview or into new browser instance.
             *
             * @param url           The URL to load
             * @param props         Properties that can be passed in to the activity:
             *      wait: int                           => wait msec before loading URL
             *      loadingDialog: "Title,Message"      => display a native loading dialog
             *      loadUrlTimeoutValue: int            => time in msec to wait before triggering a timeout error
             *      clearHistory: boolean              => clear webview history (default=false)
             *      openExternal: boolean              => open in a new browser (default=false)
             *
             * Example:
             *      navigator.app.loadUrl("http://server/myapp/index.html", {wait:2000, loadingDialog:"Wait,Loading App", loadUrlTimeoutValue: 60000});
             */
            loadUrl: function (url, props) {
                exec(null, null, "App", "loadUrl", [url, props]);
            },

            /**
             * Cancel loadUrl that is waiting to be loaded.
             */
            cancelLoadUrl: function () {
                exec(null, null, "App", "cancelLoadUrl", []);
            },

            /**
             * Clear web history in this web view.
             * Instead of BACK button loading the previous web page, it will exit the app.
             */
            clearHistory: function () {
                exec(null, null, "App", "clearHistory", []);
            },

            /**
             * Go to previous page displayed.
             * This is the same as pressing the backbutton on Android device.
             */
            backHistory: function () {
                exec(null, null, "App", "backHistory", []);
            },

            /**
             * Override the default behavior of the Android back button.
             * If overridden, when the back button is pressed, the "backKeyDown" JavaScript event will be fired.
             *
             * Note: The user should not have to call this method.  Instead, when the user
             *       registers for the "backbutton" event, this is automatically done.
             *
             * @param override        T=override, F=cancel override
             */
            overrideBackbutton: function (override) {
                exec(null, null, "App", "overrideBackbutton", [override]);
            },

            /**
             * Exit and terminate the application.
             */
            exitApp: function () {
                return exec(null, null, "App", "exitApp", []);
            }
        };

    });

// file: src/common/pluginloader.js
    define("cordova/pluginloader", function (require, exports, module) {

        var modulemapper = require('cordova/modulemapper');
        var urlutil = require('cordova/urlutil');

// Helper function to inject a <script> tag.
// Exported for testing.
        exports.injectScript = function (url, onload, onerror) {
            //var script = document.createElement("script");
            // onload fires even when script fails loads with an error.
            //script.onload = onload;
            // onerror fires for malformed URLs.
            //script.onerror = onerror;
            //script.src = url;
            //document.head.appendChild(script);
            onload();
        };

        function injectIfNecessary(id, url, onload, onerror) {
            onerror = onerror || onload;
            if (id in define.moduleMap) {
                onload();
            } else {
                exports.injectScript(url, function () {
                    if (id in define.moduleMap) {
                        onload();
                    } else {
                        onerror();
                    }
                }, onerror);
            }
        }

        function onScriptLoadingComplete(moduleList, finishPluginLoading) {
            // Loop through all the plugins and then through their clobbers and merges.
            for (var i = 0, module; module = moduleList[i]; i++) {
                if (module.clobbers && module.clobbers.length) {
                    for (var j = 0; j < module.clobbers.length; j++) {
                        modulemapper.clobbers(module.id, module.clobbers[j]);
                    }
                }

                if (module.merges && module.merges.length) {
                    for (var k = 0; k < module.merges.length; k++) {
                        modulemapper.merges(module.id, module.merges[k]);
                    }
                }

                // Finally, if runs is truthy we want to simply require() the module.
                if (module.runs) {
                    modulemapper.runs(module.id);
                }
            }

            finishPluginLoading();
        }

// Handler for the cordova_plugins.js content.
// See plugman's plugin_loader.js for the details of this object.
// This function is only called if the really is a plugins array that isn't empty.
// Otherwise the onerror response handler will just call finishPluginLoading().
        function handlePluginsObject(path, moduleList, finishPluginLoading) {
            // Now inject the scripts.
            var scriptCounter = moduleList.length;

            if (!scriptCounter) {
                finishPluginLoading();
                return;
            }
            function scriptLoadedCallback() {
                if (!--scriptCounter) {
                    onScriptLoadingComplete(moduleList, finishPluginLoading);
                }
            }

            for (var i = 0; i < moduleList.length; i++) {
                injectIfNecessary(moduleList[i].id, path + moduleList[i].file, scriptLoadedCallback);
            }
        }

        function findCordovaPath() {
            var path = null;
            var scripts = document.getElementsByTagName('script');
            var term = 'cordova.js';
            for (var n = scripts.length - 1; n > -1; n--) {
                var src = scripts[n].src.replace(/\?.*$/, ''); // Strip any query param (CB-6007).
                if (src.indexOf(term) == (src.length - term.length)) {
                    path = src.substring(0, src.length - term.length);
                    break;
                }
            }
            return path;
        }

// Tries to load all plugins' js-modules.
// This is an async process, but onDeviceReady is blocked on onPluginsReady.
// onPluginsReady is fired when there are no plugins to load, or they are all done.
        exports.load = function (callback) {
            var pathPrefix = findCordovaPath();
            if (pathPrefix === null) {
                console.log('Could not find cordova.js script tag. Plugin loading may fail.');
                pathPrefix = '';
            }
            injectIfNecessary('cordova/plugin_list', pathPrefix + 'cordova_plugins.js', function () {
                var moduleList = require("cordova/plugin_list");
                handlePluginsObject(pathPrefix, moduleList, callback);
            }, callback);
        };


    });

// file: src/common/urlutil.js
    define("cordova/urlutil", function (require, exports, module) {


        /**
         * For already absolute URLs, returns what is passed in.
         * For relative URLs, converts them to absolute ones.
         */
        exports.makeAbsolute = function makeAbsolute(url) {
            var anchorEl = document.createElement('a');
            anchorEl.href = url;
            return anchorEl.href;
        };


    });

// file: src/common/utils.js
    define("cordova/utils", function (require, exports, module) {

        var utils = exports;

        /**
         * Defines a property getter / setter for obj[key].
         */
        utils.defineGetterSetter = function (obj, key, getFunc, opt_setFunc) {
            if (Object.defineProperty) {
                var desc = {
                    get: getFunc,
                    configurable: true
                };
                if (opt_setFunc) {
                    desc.set = opt_setFunc;
                }
                Object.defineProperty(obj, key, desc);
            } else {
                obj.__defineGetter__(key, getFunc);
                if (opt_setFunc) {
                    obj.__defineSetter__(key, opt_setFunc);
                }
            }
        };

        /**
         * Defines a property getter for obj[key].
         */
        utils.defineGetter = utils.defineGetterSetter;

        utils.arrayIndexOf = function (a, item) {
            if (a.indexOf) {
                return a.indexOf(item);
            }
            var len = a.length;
            for (var i = 0; i < len; ++i) {
                if (a[i] == item) {
                    return i;
                }
            }
            return -1;
        };

        /**
         * Returns whether the item was found in the array.
         */
        utils.arrayRemove = function (a, item) {
            var index = utils.arrayIndexOf(a, item);
            if (index != -1) {
                a.splice(index, 1);
            }
            return index != -1;
        };

        utils.typeName = function (val) {
            return Object.prototype.toString.call(val).slice(8, -1);
        };

        /**
         * Returns an indication of whether the argument is an array or not
         */
        utils.isArray = function (a) {
            return utils.typeName(a) == 'Array';
        };

        /**
         * Returns an indication of whether the argument is a Date or not
         */
        utils.isDate = function (d) {
            return utils.typeName(d) == 'Date';
        };

        /**
         * Does a deep clone of the object.
         */
        utils.clone = function (obj) {
            if (!obj || typeof obj == 'function' || utils.isDate(obj) || typeof obj != 'object') {
                return obj;
            }

            var retVal, i;

            if (utils.isArray(obj)) {
                retVal = [];
                for (i = 0; i < obj.length; ++i) {
                    retVal.push(utils.clone(obj[i]));
                }
                return retVal;
            }

            retVal = {};
            for (i in obj) {
                if (!(i in retVal) || retVal[i] != obj[i]) {
                    retVal[i] = utils.clone(obj[i]);
                }
            }
            return retVal;
        };

        /**
         * Returns a wrapped version of the function
         */
        utils.close = function (context, func, params) {
            if (typeof params == 'undefined') {
                return function () {
                    return func.apply(context, arguments);
                };
            } else {
                return function () {
                    return func.apply(context, params);
                };
            }
        };

        /**
         * Create a UUID
         */
        utils.createUUID = function () {
            return UUIDcreatePart(4) + '-' +
                UUIDcreatePart(2) + '-' +
                UUIDcreatePart(2) + '-' +
                UUIDcreatePart(2) + '-' +
                UUIDcreatePart(6);
        };

        /**
         * Extends a child object from a parent object using classical inheritance
         * pattern.
         */
        utils.extend = (function () {
            // proxy used to establish prototype chain
            var F = function () {
            };
            // extend Child from Parent
            return function (Child, Parent) {
                F.prototype = Parent.prototype;
                Child.prototype = new F();
                Child.__super__ = Parent.prototype;
                Child.prototype.constructor = Child;
            };
        }());

        /**
         * Alerts a message in any available way: alert or console.log.
         */
        utils.alert = function (msg) {
            if (window.alert) {
                window.alert(msg);
            } else if (console && console.log) {
                console.log(msg);
            }
        };


//------------------------------------------------------------------------------
        function UUIDcreatePart(length) {
            var uuidpart = "";
            for (var i = 0; i < length; i++) {
                var uuidchar = parseInt((Math.random() * 256), 10).toString(16);
                if (uuidchar.length == 1) {
                    uuidchar = "0" + uuidchar;
                }
                uuidpart += uuidchar;
            }
            return uuidpart;
        }


    });

    window.cordova = require('cordova');
// file: src/scripts/bootstrap.js

    cordova.define('cordova/plugin_list', function (require, exports, module) {
        module.exports = [
            {
                "file": "plugins/org.apache.cordova.device/www/device.js",
                "id": "org.apache.cordova.device.device",
                "clobbers": [
                    "device"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.network-information/www/network.js",
                "id": "org.apache.cordova.network-information.network",
                "clobbers": [
                    "navigator.connection",
                    "navigator.network.connection"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.network-information/www/Connection.js",
                "id": "org.apache.cordova.network-information.Connection",
                "clobbers": [
                    "Connection"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.camera/www/CameraConstants.js",
                "id": "org.apache.cordova.camera.Camera",
                "clobbers": [
                    "Camera"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.camera/www/CameraPopoverOptions.js",
                "id": "org.apache.cordova.camera.CameraPopoverOptions",
                "clobbers": [
                    "CameraPopoverOptions"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.camera/www/Camera.js",
                "id": "org.apache.cordova.camera.camera",
                "clobbers": [
                    "navigator.camera"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.camera/www/CameraPopoverHandle.js",
                "id": "org.apache.cordova.camera.CameraPopoverHandle",
                "clobbers": [
                    "CameraPopoverHandle"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.splashscreen/www/splashscreen.js",
                "id": "org.apache.cordova.splashscreen.SplashScreen",
                "clobbers": [
                    "navigator.splashscreen"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.inappbrowser/www/inappbrowser.js",
                "id": "org.apache.cordova.inappbrowser.inappbrowser",
                "clobbers": [
                    "window.open"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.statusbar/www/statusbar.js",
                "id": "org.apache.cordova.statusbar.statusbar",
                "clobbers": [
                    "window.StatusBar"
                ]
            },
            {
                "file": "plugins/com.phonegap.plugins.sqlite/www/SQLitePlugin.js",
                "id": "com.phonegap.plugins.sqlite.SQLitePlugin",
                "clobbers": [
                    "SQLitePlugin"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.file/www/DirectoryEntry.js",
                "id": "org.apache.cordova.file.DirectoryEntry",
                "clobbers": [
                    "window.DirectoryEntry"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.file/www/DirectoryReader.js",
                "id": "org.apache.cordova.file.DirectoryReader",
                "clobbers": [
                    "window.DirectoryReader"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.file/www/Entry.js",
                "id": "org.apache.cordova.file.Entry",
                "clobbers": [
                    "window.Entry"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.file/www/File.js",
                "id": "org.apache.cordova.file.File",
                "clobbers": [
                    "window.File"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.file/www/FileEntry.js",
                "id": "org.apache.cordova.file.FileEntry",
                "clobbers": [
                    "window.FileEntry"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.file/www/FileError.js",
                "id": "org.apache.cordova.file.FileError",
                "clobbers": [
                    "window.FileError"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.file/www/FileReader.js",
                "id": "org.apache.cordova.file.FileReader",
                "clobbers": [
                    "window.FileReader"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.file/www/FileSystem.js",
                "id": "org.apache.cordova.file.FileSystem",
                "clobbers": [
                    "window.FileSystem"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.file/www/FileUploadOptions.js",
                "id": "org.apache.cordova.file.FileUploadOptions",
                "clobbers": [
                    "window.FileUploadOptions"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.file/www/FileUploadResult.js",
                "id": "org.apache.cordova.file.FileUploadResult",
                "clobbers": [
                    "window.FileUploadResult"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.file/www/FileWriter.js",
                "id": "org.apache.cordova.file.FileWriter",
                "clobbers": [
                    "window.FileWriter"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.file/www/Flags.js",
                "id": "org.apache.cordova.file.Flags",
                "clobbers": [
                    "window.Flags"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.file/www/LocalFileSystem.js",
                "id": "org.apache.cordova.file.LocalFileSystem",
                "clobbers": [
                    "window.LocalFileSystem"
                ],
                "merges": [
                    "window"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.file/www/Metadata.js",
                "id": "org.apache.cordova.file.Metadata",
                "clobbers": [
                    "window.Metadata"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.file/www/ProgressEvent.js",
                "id": "org.apache.cordova.file.ProgressEvent",
                "clobbers": [
                    "window.ProgressEvent"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.file/www/requestFileSystem.js",
                "id": "org.apache.cordova.file.requestFileSystem",
                "clobbers": [
                    "window.requestFileSystem"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.file/www/resolveLocalFileSystemURI.js",
                "id": "org.apache.cordova.file.resolveLocalFileSystemURI",
                "merges": [
                    "window"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.file/www/android/FileSystem.js",
                "id": "org.apache.cordova.file.androidFileSystem",
                "merges": [
                    "window.FileSystem"
                ]
            },
            {
                "file": "plugins/com.phonegap.plugins.barcodescanner/www/barcodescanner.js",
                "id": "com.phonegap.plugins.barcodescanner.barcodescanner",
                "clobbers": [
                    "plugins.barcodeScanner"
                ]
            },
            {
                "file": "plugins/com.archibus.plugins.configuration/www/configuration.js",
                "id": "com.archibus.plugins.configuration.Configuration",
                "clobbers": [
                    "Configuration"
                ]
            },
            {
                "file": "plugins/com.archibus.plugins.docconverter/www/docconverter.js",
                "id": "com.archibus.plugins.docconverter.DocumentConveter",
                "clobbers": [
                    "DocumentConverter"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.battery-status/www/battery.js",
                "id": "org.apache.cordova.battery-status.battery",
                "clobbers": [
                    "navigator.battery"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.device-motion/www/Acceleration.js",
                "id": "org.apache.cordova.device-motion.Acceleration",
                "clobbers": [
                    "Acceleration"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.device-motion/www/accelerometer.js",
                "id": "org.apache.cordova.device-motion.accelerometer",
                "clobbers": [
                    "navigator.accelerometer"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.device-orientation/www/CompassError.js",
                "id": "org.apache.cordova.device-orientation.CompassError",
                "clobbers": [
                    "CompassError"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.device-orientation/www/CompassHeading.js",
                "id": "org.apache.cordova.device-orientation.CompassHeading",
                "clobbers": [
                    "CompassHeading"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.device-orientation/www/compass.js",
                "id": "org.apache.cordova.device-orientation.compass",
                "clobbers": [
                    "navigator.compass"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.vibration/www/vibration.js",
                "id": "org.apache.cordova.vibration.notification",
                "merges": [
                    "navigator.notification"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.contacts/www/contacts.js",
                "id": "org.apache.cordova.contacts.contacts",
                "clobbers": [
                    "navigator.contacts"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.contacts/www/Contact.js",
                "id": "org.apache.cordova.contacts.Contact",
                "clobbers": [
                    "Contact"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.contacts/www/ContactAddress.js",
                "id": "org.apache.cordova.contacts.ContactAddress",
                "clobbers": [
                    "ContactAddress"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.contacts/www/ContactError.js",
                "id": "org.apache.cordova.contacts.ContactError",
                "clobbers": [
                    "ContactError"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.contacts/www/ContactField.js",
                "id": "org.apache.cordova.contacts.ContactField",
                "clobbers": [
                    "ContactField"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.contacts/www/ContactFindOptions.js",
                "id": "org.apache.cordova.contacts.ContactFindOptions",
                "clobbers": [
                    "ContactFindOptions"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.contacts/www/ContactName.js",
                "id": "org.apache.cordova.contacts.ContactName",
                "clobbers": [
                    "ContactName"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.contacts/www/ContactOrganization.js",
                "id": "org.apache.cordova.contacts.ContactOrganization",
                "clobbers": [
                    "ContactOrganization"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.contacts/www/ContactFieldType.js",
                "id": "org.apache.cordova.contacts.ContactFieldType"
            },
            {
                "file": "plugins/org.apache.cordova.media-capture/www/CaptureAudioOptions.js",
                "id": "org.apache.cordova.media-capture.CaptureAudioOptions",
                "clobbers": [
                    "CaptureAudioOptions"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.media-capture/www/CaptureImageOptions.js",
                "id": "org.apache.cordova.media-capture.CaptureImageOptions",
                "clobbers": [
                    "CaptureImageOptions"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.media-capture/www/CaptureVideoOptions.js",
                "id": "org.apache.cordova.media-capture.CaptureVideoOptions",
                "clobbers": [
                    "CaptureVideoOptions"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.media-capture/www/CaptureError.js",
                "id": "org.apache.cordova.media-capture.CaptureError",
                "clobbers": [
                    "CaptureError"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.media-capture/www/MediaFileData.js",
                "id": "org.apache.cordova.media-capture.MediaFileData",
                "clobbers": [
                    "MediaFileData"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.media-capture/www/MediaFile.js",
                "id": "org.apache.cordova.media-capture.MediaFile",
                "clobbers": [
                    "MediaFile"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.media-capture/www/capture.js",
                "id": "org.apache.cordova.media-capture.capture",
                "clobbers": [
                    "navigator.device.capture"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.media/www/MediaError.js",
                "id": "org.apache.cordova.media.MediaError",
                "clobbers": [
                    "window.MediaError"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.media/www/Media.js",
                "id": "org.apache.cordova.media.Media",
                "clobbers": [
                    "window.Media"
                ]
            },
            {
                "file": "plugins/com.archibus.plugins.dbcredential/www/keychain.js",
                "id": "com.archibus.plugins.dbcredential.keychain",
                "clobbers": [
                    "Keychain"
                ]
            },

            {
                "file": "plugins/org.apache.cordova.file-transfer/www/FileTransferError.js",
                "id": "org.apache.cordova.file-transfer.FileTransferError",
                "clobbers": [
                    "window.FileTransferError"
                ]
            },
            {
                "file": "plugins/org.apache.cordova.file-transfer/www/FileTransfer.js",
                "id": "org.apache.cordova.file-transfer.FileTransfer",
                "clobbers": [
                    "window.FileTransfer"
                ]
            },
            {
                "file": "plugins/com.archibus.plugins.appversion/www/appversion.js",
                "id": "com.archibus.plugins.appversion.AppVersion",
                "clobbers": [
                    "AppVersion"
                ]
            },
            {
                "file": "plugins/com.archibus.plugins.textarea/www/textarea.js",
                "id": "com.archibus.plugins.textarea.TextArea",
                "clobbers": [
                    "TextArea"
                ]
            },
            {
                "file": "plugins/com.archibus.plugins.registration/www/registration.js",
                "id": "com.archibus.plugins.registration.Registration",
                "clobbers": [
                    "Registration"
                ]
            }
        ];
        module.exports.metadata =
// TOP OF METADATA
        {
            "org.apache.cordova.device": "0.2.8",
            "org.apache.cordova.network-information": "0.2.7",
            "org.apache.cordova.camera": "0.2.8",
            "org.apache.cordova.splashscreen": "0.2.7",
            "org.apache.cordova.inappbrowser": "0.3.3",
            "org.apache.cordova.statusbar": "0.1.3",
            "com.phonegap.plugins.sqlite": "1.0.0",
            "org.apache.cordova.file": "1.1.0",
            "com.phonegap.plugins.barcodescanner": "0.6.0",
            "com.archibus.plugins.configuration": "0.0.1",
            "com.archibus.plugins.docconverter": "0.0.1",
            "org.apache.cordova.battery-status": "0.2.10",
            "org.apache.cordova.device-motion": "0.2.9",
            "org.apache.cordova.device-orientation": "0.3.8",
            "org.apache.cordova.vibration": "0.3.10",
            "org.apache.cordova.contacts": "0.2.12",
            "org.apache.cordova.media-capture": "0.3.2",
            "org.apache.cordova.media": "0.2.12",
            "com.archibus.plugins.dbcredential": "0.0.1",
            "org.apache.cordova.file-transfer": "0.4.8"
        }
// BOTTOM OF METADATA
    });
    cordova.define("org.apache.cordova.device.device", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        var argscheck = require('cordova/argscheck'),
            channel = require('cordova/channel'),
            utils = require('cordova/utils'),
            exec = require('cordova/exec'),
            cordova = require('cordova');

        channel.createSticky('onCordovaInfoReady');
// Tell cordova channel to wait on the CordovaInfoReady event
        channel.waitForInitialization('onCordovaInfoReady');

        /**
         * This represents the mobile device, and provides properties for inspecting the model, version, UUID of the
         * phone, etc.
         * @constructor
         */
        function Device() {
            this.available = false;
            this.platform = null;
            this.version = null;
            this.uuid = null;
            this.cordova = null;
            this.model = null;
            this.name = 'Android';

            var me = this;

            channel.onCordovaReady.subscribe(function () {
                me.getInfo(function (info) {
                    //ignoring info.cordova returning from native, we should use value from cordova.version defined in cordova.js
                    //TODO: CB-5105 native implementations should not return info.cordova
                    var buildLabel = cordova.version;
                    me.available = true;
                    me.platform = info.platform;
                    me.version = info.version;
                    me.uuid = info.uuid;
                    me.cordova = buildLabel;
                    me.model = info.model;
                    channel.onCordovaInfoReady.fire();
                }, function (e) {
                    me.available = false;
                    utils.alert("[ERROR] Error initializing Cordova: " + e);
                });
            });
        }

        /**
         * Get device info
         *
         * @param {Function} successCallback The function to call when the heading data is available
         * @param {Function} errorCallback The function to call when there is an error getting the heading data. (OPTIONAL)
         */
        Device.prototype.getInfo = function (successCallback, errorCallback) {
            argscheck.checkArgs('fF', 'Device.getInfo', arguments);
            exec(successCallback, errorCallback, "Device", "getDeviceInfo", []);
        };

        module.exports = new Device();

    });

    cordova.define("org.apache.cordova.network-information.network", function (require, exports, module) { /*
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        var exec = require('cordova/exec'),
            cordova = require('cordova'),
            channel = require('cordova/channel'),
            utils = require('cordova/utils');

// Link the onLine property with the Cordova-supplied network info.
// This works because we clobber the naviagtor object with our own
// object in bootstrap.js.
        if (typeof navigator != 'undefined') {
            utils.defineGetter(navigator, 'onLine', function () {
                return this.connection.type != 'none';
            });
        }

        function NetworkConnection() {
            this.type = 'unknown';
        }

        /**
         * Get connection info
         *
         * @param {Function} successCallback The function to call when the Connection data is available
         * @param {Function} errorCallback The function to call when there is an error getting the Connection data. (OPTIONAL)
         */
        NetworkConnection.prototype.getInfo = function (successCallback, errorCallback) {
            exec(successCallback, errorCallback, "NetworkStatus", "getConnectionInfo", []);
        };

        var me = new NetworkConnection();
        var timerId = null;
        var timeout = 500;

        channel.createSticky('onCordovaConnectionReady');
        channel.waitForInitialization('onCordovaConnectionReady');

        channel.onCordovaReady.subscribe(function () {
            me.getInfo(function (info) {
                    me.type = info;
                    if (info === "none") {
                        // set a timer if still offline at the end of timer send the offline event
                        timerId = setTimeout(function () {
                            cordova.fireDocumentEvent("offline");
                            timerId = null;
                        }, timeout);
                    } else {
                        // If there is a current offline event pending clear it
                        if (timerId !== null) {
                            clearTimeout(timerId);
                            timerId = null;
                        }
                        cordova.fireDocumentEvent("online");
                    }

                    // should only fire this once
                    if (channel.onCordovaConnectionReady.state !== 2) {
                        channel.onCordovaConnectionReady.fire();
                    }
                },
                function (e) {
                    // If we can't get the network info we should still tell Cordova
                    // to fire the deviceready event.
                    if (channel.onCordovaConnectionReady.state !== 2) {
                        channel.onCordovaConnectionReady.fire();
                    }
                    console.log("Error initializing Network Connection: " + e);
                });
        });

        module.exports = me;

    });

    cordova.define("org.apache.cordova.network-information.Connection", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        /**
         * Network status
         */
        module.exports = {
            UNKNOWN: "unknown",
            ETHERNET: "ethernet",
            WIFI: "wifi",
            CELL_2G: "2g",
            CELL_3G: "3g",
            CELL_4G: "4g",
            CELL: "cellular",
            NONE: "none"
        };

    });

    cordova.define("org.apache.cordova.camera.Camera", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        module.exports = {
            DestinationType: {
                DATA_URL: 0,         // Return base64 encoded string
                FILE_URI: 1,         // Return file uri (content://media/external/images/media/2 for Android)
                NATIVE_URI: 2        // Return native uri (eg. asset-library://... for iOS)
            },
            EncodingType: {
                JPEG: 0,             // Return JPEG encoded image
                PNG: 1               // Return PNG encoded image
            },
            MediaType: {
                PICTURE: 0,          // allow selection of still pictures only. DEFAULT. Will return format specified via DestinationType
                VIDEO: 1,            // allow selection of video only, ONLY RETURNS URL
                ALLMEDIA: 2         // allow selection from all media types
            },
            PictureSourceType: {
                PHOTOLIBRARY: 0,    // Choose image from picture library (same as SAVEDPHOTOALBUM for Android)
                CAMERA: 1,          // Take picture from camera
                SAVEDPHOTOALBUM: 2  // Choose image from picture library (same as PHOTOLIBRARY for Android)
            },
            PopoverArrowDirection: {
                ARROW_UP: 1,        // matches iOS UIPopoverArrowDirection constants to specify arrow location on popover
                ARROW_DOWN: 2,
                ARROW_LEFT: 4,
                ARROW_RIGHT: 8,
                ARROW_ANY: 15
            },
            Direction: {
                BACK: 0,
                FRONT: 1
            }
        };

    });

    cordova.define("org.apache.cordova.camera.CameraPopoverOptions", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        var Camera = require('./Camera');

        /**
         * Encapsulates options for iOS Popover image picker
         */
        var CameraPopoverOptions = function (x, y, width, height, arrowDir) {
            // information of rectangle that popover should be anchored to
            this.x = x || 0;
            this.y = y || 32;
            this.width = width || 320;
            this.height = height || 480;
            // The direction of the popover arrow
            this.arrowDir = arrowDir || Camera.PopoverArrowDirection.ARROW_ANY;
        };

        module.exports = CameraPopoverOptions;

    });

    cordova.define("org.apache.cordova.camera.camera", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        var argscheck = require('cordova/argscheck'),
            exec = require('cordova/exec'),
            Camera = require('./Camera');
        // XXX: commented out
        //CameraPopoverHandle = require('./CameraPopoverHandle');

        var cameraExport = {};

// Tack on the Camera Constants to the base camera plugin.
        for (var key in Camera) {
            cameraExport[key] = Camera[key];
        }

        /**
         * Gets a picture from source defined by "options.sourceType", and returns the
         * image as defined by the "options.destinationType" option.

         * The defaults are sourceType=CAMERA and destinationType=FILE_URI.
         *
         * @param {Function} successCallback
         * @param {Function} errorCallback
         * @param {Object} options
         */
        cameraExport.getPicture = function (successCallback, errorCallback, options) {
            argscheck.checkArgs('fFO', 'Camera.getPicture', arguments);
            options = options || {};
            var getValue = argscheck.getValue;

            var quality = getValue(options.quality, 50);
            var destinationType = getValue(options.destinationType, Camera.DestinationType.FILE_URI);
            var sourceType = getValue(options.sourceType, Camera.PictureSourceType.CAMERA);
            var targetWidth = getValue(options.targetWidth, -1);
            var targetHeight = getValue(options.targetHeight, -1);
            var encodingType = getValue(options.encodingType, Camera.EncodingType.JPEG);
            var mediaType = getValue(options.mediaType, Camera.MediaType.PICTURE);
            var allowEdit = !!options.allowEdit;
            var correctOrientation = !!options.correctOrientation;
            var saveToPhotoAlbum = !!options.saveToPhotoAlbum;
            var popoverOptions = getValue(options.popoverOptions, null);
            var cameraDirection = getValue(options.cameraDirection, Camera.Direction.BACK);

            var args = [quality, destinationType, sourceType, targetWidth, targetHeight, encodingType,
                mediaType, allowEdit, correctOrientation, saveToPhotoAlbum, popoverOptions, cameraDirection];

            exec(successCallback, errorCallback, "Camera", "takePicture", args);
            // XXX: commented out
            //return new CameraPopoverHandle();
        };

        cameraExport.cleanup = function (successCallback, errorCallback) {
            exec(successCallback, errorCallback, "Camera", "cleanup", []);
        };

        module.exports = cameraExport;

    });

    cordova.define("org.apache.cordova.camera.CameraPopoverHandle", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        var exec = require('cordova/exec');

        /**
         * A handle to an image picker popover.
         */
        var CameraPopoverHandle = function () {
            this.setPosition = function (popoverOptions) {
                console.log('CameraPopoverHandle.setPosition is only supported on iOS.');
            };
        };

        module.exports = CameraPopoverHandle;

    });

    cordova.define("org.apache.cordova.splashscreen.SplashScreen", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        var exec = require('cordova/exec');

        var splashscreen = {
            show: function () {
                exec(null, null, "SplashScreen", "show", []);
            },
            hide: function () {
                exec(null, null, "SplashScreen", "hide", []);
            }
        };

        module.exports = splashscreen;

    });

    cordova.define("org.apache.cordova.inappbrowser.inappbrowser", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        var exec = require('cordova/exec');
        var channel = require('cordova/channel');
        var modulemapper = require('cordova/modulemapper');
        var urlutil = require('cordova/urlutil');

        function InAppBrowser() {
            this.channels = {
                'loadstart': channel.create('loadstart'),
                'loadstop': channel.create('loadstop'),
                'loaderror': channel.create('loaderror'),
                'exit': channel.create('exit')
            };
        }

        InAppBrowser.prototype = {
            _eventHandler: function (event) {
                if (event.type in this.channels) {
                    this.channels[event.type].fire(event);
                }
            },
            close: function (eventname) {
                exec(null, null, "InAppBrowser", "close", []);
            },
            show: function (eventname) {
                exec(null, null, "InAppBrowser", "show", []);
            },
            addEventListener: function (eventname, f) {
                if (eventname in this.channels) {
                    this.channels[eventname].subscribe(f);
                }
            },
            removeEventListener: function (eventname, f) {
                if (eventname in this.channels) {
                    this.channels[eventname].unsubscribe(f);
                }
            },

            executeScript: function (injectDetails, cb) {
                if (injectDetails.code) {
                    exec(cb, null, "InAppBrowser", "injectScriptCode", [injectDetails.code, !!cb]);
                } else if (injectDetails.file) {
                    exec(cb, null, "InAppBrowser", "injectScriptFile", [injectDetails.file, !!cb]);
                } else {
                    throw new Error('executeScript requires exactly one of code or file to be specified');
                }
            },

            insertCSS: function (injectDetails, cb) {
                if (injectDetails.code) {
                    exec(cb, null, "InAppBrowser", "injectStyleCode", [injectDetails.code, !!cb]);
                } else if (injectDetails.file) {
                    exec(cb, null, "InAppBrowser", "injectStyleFile", [injectDetails.file, !!cb]);
                } else {
                    throw new Error('insertCSS requires exactly one of code or file to be specified');
                }
            }
        };

        module.exports = function (strUrl, strWindowName, strWindowFeatures) {
            // Don't catch calls that write to existing frames (e.g. named iframes).
            if (window.frames && window.frames[strWindowName]) {
                var origOpenFunc = modulemapper.getOriginalSymbol(window, 'open');
                return origOpenFunc.apply(window, arguments);
            }

            strUrl = urlutil.makeAbsolute(strUrl);
            var iab = new InAppBrowser();
            var cb = function (eventname) {
                iab._eventHandler(eventname);
            };

            exec(cb, cb, "InAppBrowser", "open", [strUrl, strWindowName, strWindowFeatures]);
            return iab;
        };


    });

    cordova.define("org.apache.cordova.statusbar.statusbar", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        var argscheck = require('cordova/argscheck'),
            utils = require('cordova/utils'),
            exec = require('cordova/exec');

// prime it
        exec(null, null, "StatusBar", "_ready", []);

        var StatusBar = function () {
        };

        StatusBar.overlaysWebView = function (doOverlay) {
            exec(null, null, "StatusBar", "overlaysWebView", [doOverlay]);
        };

        StatusBar.styleDefault = function () {
            exec(null, null, "StatusBar", "styleDefault", []);
        };

        StatusBar.styleLightContent = function () {
            exec(null, null, "StatusBar", "styleLightContent", []);
        };

        StatusBar.styleBlackTranslucent = function () {
            exec(null, null, "StatusBar", "styleBlackTranslucent", []);
        };

        StatusBar.styleBlackOpaque = function () {
            exec(null, null, "StatusBar", "styleBlackOpaque", []);
        };

        StatusBar.backgroundColorByName = function (colorname) {
            exec(null, null, "StatusBar", "backgroundColorByName", [colorname]);
        }

        StatusBar.backgroundColorByHexString = function (hexString) {
            exec(null, null, "StatusBar", "backgroundColorByHexString", [hexString]);
        }

        StatusBar.hide = function () {
            exec(null, null, "StatusBar", "hide", []);
        }

        StatusBar.show = function () {
            exec(null, null, "StatusBar", "show", []);
        }

        StatusBar.isVisible = true;

        module.exports = StatusBar;

    });

    cordova.define("com.phonegap.plugins.sqlite.SQLitePlugin", function (require, exports, module) {
        (function () {
            var SQLiteFactory, SQLitePlugin, SQLitePluginCallback, SQLitePluginTransaction, pcb, root;

            root = this;

            SQLitePlugin = function (openargs, openSuccess, openError) {
                var dbname;
                console.log("SQLitePlugin openargs: " + (JSON.stringify(openargs)));
                if (!(openargs && openargs['name'])) {
                    throw new Error("Cannot create a SQLitePlugin instance without a db name");
                }
                dbname = openargs.name;
                this.openargs = openargs;
                this.dbname = dbname;
                this.openSuccess = openSuccess;
                this.openError = openError;
                this.openSuccess || (this.openSuccess = function () {
                    console.log("DB opened: " + dbname);
                });
                this.openError || (this.openError = function (e) {
                    console.log(e.message);
                });
                this.bg = !openargs.bgType ? (navigator.userAgent.match(/iPad/i)) || (navigator.userAgent.match(/iPhone/i)) : openargs.bgType === 1;
                this.open(this.openSuccess, this.openError);
            };

            SQLitePlugin.prototype.databaseFeatures = {
                isSQLitePluginDatabase: true
            };

            SQLitePlugin.prototype.openDBs = {};

            SQLitePlugin.prototype.txQ = [];

            SQLitePlugin.prototype.addTransaction = function (t) {
                this.txQ.push(t);
                if (this.txQ.length === 1) {
                    t.start();
                }
            };

            SQLitePlugin.prototype.transaction = function (fn, error, success) {
                this.addTransaction(new SQLitePluginTransaction(this, fn, error, success, true));
            };

            SQLitePlugin.prototype.startNextTransaction = function () {
                this.txQ.shift();
                if (this.txQ[0]) {
                    this.txQ[0].start();
                }
            };

            SQLitePlugin.prototype.open = function (success, error) {
                if (!(this.dbname in this.openDBs)) {
                    this.openDBs[this.dbname] = true;
                    cordova.exec(success, error, "SQLitePlugin", "open", [this.openargs]);
                }
            };

            SQLitePlugin.prototype.close = function (success, error) {
                if (this.dbname in this.openDBs) {
                    delete this.openDBs[this.dbname];
                    cordova.exec(null, null, "SQLitePlugin", "close", [
                        {
                            path: this.dbname
                        }
                    ]);
                }
            };

            SQLitePlugin.prototype.executeSql = function (statement, params, success, error) {
                var myerror, myfn, mysuccess;
                mysuccess = function (t, r) {
                    if (!!success) {
                        return success(r);
                    }
                };
                myerror = function (t, e) {
                    if (!!error) {
                        return error(e);
                    }
                };
                myfn = function (tx) {
                    tx.executeSql(statement, params, mysuccess, myerror);
                };
                this.addTransaction(new SQLitePluginTransaction(this, myfn, myerror, mysuccess, false));
            };

            pcb = function () {
                return 1;
            };

            /*
             DEPRECATED AND WILL BE REMOVED:
             */


            SQLitePlugin.prototype.executePragmaStatement = function (statement, success, error) {
                console.log("SQLitePlugin::executePragmaStatement");
                pcb = success;
                cordova.exec((function () {
                    return 1;
                }), error, "SQLitePlugin", "executePragmaStatement", [this.dbname, statement]);
            };

            /*
             FUTURE TBD GONE: Required for db.executePragmStatement() callback ONLY:
             */


            SQLitePluginCallback = {
                p1: function (id, result) {
                    var mycb;
                    console.log("PRAGMA CB");
                    mycb = pcb;
                    pcb = function () {
                        return 1;
                    };
                    mycb(result);
                }
            };

            /*
             Transaction batching object:
             */


            SQLitePluginTransaction = function (db, fn, error, success, txlock) {
                if (typeof fn !== "function") {
                    /*
                     This is consistent with the implementation in Chrome -- it
                     throws if you pass anything other than a function. This also
                     prevents us from stalling our txQueue if somebody passes a
                     false value for fn.
                     */

                    throw new Error("transaction expected a function");
                }
                this.db = db;
                this.fn = fn;
                this.error = error;
                this.success = success;
                this.txlock = txlock;
                this.executes = [];
                if (txlock) {
                    this.executeSql("BEGIN", [], null, function (tx, err) {
                        throw new Error("unable to begin transaction: " + err.message);
                    });
                }
            };

            SQLitePluginTransaction.prototype.start = function () {
                var err;
                try {
                    if (!this.fn) {
                        return;
                    }
                    this.fn(this);
                    this.fn = null;
                    this.run();
                } catch (_error) {
                    err = _error;
                    /*
                     If "fn" throws, we must report the whole transaction as failed.
                     */

                    this.db.startNextTransaction();
                    if (this.error) {
                        this.error(err);
                    }
                }
            };

            SQLitePluginTransaction.prototype.executeSql = function (sql, values, success, error) {
                var qid;
                qid = this.executes.length;
                this.executes.push({
                    success: success,
                    error: error,
                    qid: qid,
                    sql: sql,
                    params: values || []
                });
            };

            SQLitePluginTransaction.prototype.handleStatementSuccess = function (handler, response) {
                var payload, rows;
                if (!handler) {
                    return;
                }
                rows = response.rows || [];
                payload = {
                    rows: {
                        item: function (i) {
                            return rows[i];
                        },
                        length: rows.length
                    },
                    rowsAffected: response.rowsAffected || 0,
                    insertId: response.insertId || void 0
                };
                handler(this, payload);
            };

            SQLitePluginTransaction.prototype.handleStatementFailure = function (handler, response) {
                if (!handler) {
                    throw new Error("a statement with no error handler failed: " + response.message);
                }
                if (handler(this, response)) {
                    throw new Error("a statement error callback did not return false");
                }
            };

            SQLitePluginTransaction.prototype.run = function () {
                var batchExecutes, handlerFor, i, mycb, mycbmap, mycommand, qid, request, tropts, tx, txFailure, waiting;
                txFailure = null;
                tropts = [];
                batchExecutes = this.executes;
                waiting = batchExecutes.length;
                this.executes = [];
                tx = this;
                handlerFor = function (index, didSucceed) {
                    return function (response) {
                        var err;
                        try {
                            if (didSucceed) {
                                tx.handleStatementSuccess(batchExecutes[index].success, response);
                            } else {
                                tx.handleStatementFailure(batchExecutes[index].error, response);
                            }
                        } catch (_error) {
                            err = _error;
                            if (!txFailure) {
                                txFailure = err;
                            }
                        }
                        if (--waiting === 0) {
                            if (txFailure) {
                                tx.abort(txFailure);
                            } else if (tx.executes.length > 0) {
                                /*
                                 new requests have been issued by the callback
                                 handlers, so run another batch.
                                 */

                                tx.run();
                            } else {
                                tx.finish();
                            }
                        }
                    };
                };
                i = 0;
                mycbmap = {};
                while (i < batchExecutes.length) {
                    request = batchExecutes[i];
                    qid = request.qid;
                    mycbmap[qid] = {
                        success: handlerFor(i, true),
                        error: handlerFor(i, false)
                    };
                    tropts.push({
                        qid: qid,
                        query: [request.sql].concat(request.params),
                        sql: request.sql,
                        params: request.params
                    });
                    i++;
                }
                mycb = function (result) {
                    var q, r, res, type, _i, _len;
                    for (_i = 0, _len = result.length; _i < _len; _i++) {
                        r = result[_i];
                        type = r.type;
                        qid = r.qid;
                        res = r.result;
                        q = mycbmap[qid];
                        if (q) {
                            if (q[type]) {
                                q[type](res);
                            }
                        }
                    }
                };
                mycommand = this.db.bg ? "backgroundExecuteSqlBatch" : "executeSqlBatch";
                cordova.exec(mycb, null, "SQLitePlugin", mycommand, [
                    {
                        dbargs: {
                            dbname: this.db.dbname
                        },
                        executes: tropts
                    }
                ]);
            };

            SQLitePluginTransaction.prototype.abort = function (txFailure) {
                var failed, succeeded, tx;
                if (this.finalized) {
                    return;
                }
                tx = this;
                succeeded = function (tx) {
                    tx.db.startNextTransaction();
                    if (tx.error) {
                        tx.error(txFailure);
                    }
                };
                failed = function (tx, err) {
                    tx.db.startNextTransaction();
                    if (tx.error) {
                        tx.error(new Error("error while trying to roll back: " + err.message));
                    }
                };
                this.finalized = true;
                if (this.txlock) {
                    this.executeSql("ROLLBACK", [], succeeded, failed);
                    this.run();
                } else {
                    succeeded(tx);
                }
            };

            SQLitePluginTransaction.prototype.finish = function () {
                var failed, succeeded, tx;
                if (this.finalized) {
                    return;
                }
                tx = this;
                succeeded = function (tx) {
                    tx.db.startNextTransaction();
                    if (tx.success) {
                        tx.success();
                    }
                };
                failed = function (tx, err) {
                    tx.db.startNextTransaction();
                    if (tx.error) {
                        tx.error(new Error("error while trying to commit: " + err.message));
                    }
                };
                this.finalized = true;
                if (this.txlock) {
                    this.executeSql("COMMIT", [], succeeded, failed);
                    this.run();
                } else {
                    succeeded(tx);
                }
            };

            SQLiteFactory = {
                /*
                 NOTE: this function should NOT be translated from Javascript
                 back to CoffeeScript by js2coffee.
                 If this function is edited in Javascript then someone will
                 have to translate it back to CoffeeScript by hand.
                 */

                opendb: function () {
                    var errorcb, first, okcb, openargs;
                    if (arguments.length < 1) {
                        return null;
                    }
                    first = arguments[0];
                    openargs = null;
                    okcb = null;
                    errorcb = null;
                    if (first.constructor === String) {
                        openargs = {
                            name: first
                        };
                        if (arguments.length >= 5) {
                            okcb = arguments[4];
                            if (arguments.length > 5) {
                                errorcb = arguments[5];
                            }
                        }
                    } else {
                        openargs = first;
                        if (arguments.length >= 2) {
                            okcb = arguments[1];
                            if (arguments.length > 2) {
                                errorcb = arguments[2];
                            }
                        }
                    }
                    return new SQLitePlugin(openargs, okcb, errorcb);
                },
                deleteDb: function (databaseName, success, error) {
                    return cordova.exec(success, error, "SQLitePlugin", "delete", [
                        {
                            path: databaseName
                        }
                    ]);
                }
            };

            /*
             FUTURE TBD GONE: Required for db.executePragmStatement() callback ONLY:
             */


            root.SQLitePluginCallback = SQLitePluginCallback;

            root.sqlitePlugin = {
                sqliteFeatures: {
                    isSQLitePlugin: true
                },
                openDatabase: SQLiteFactory.opendb,
                deleteDatabase: SQLiteFactory.deleteDb
            };

        }).call(this);

    });

    cordova.define("org.apache.cordova.file.DirectoryEntry", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        var argscheck = require('cordova/argscheck'),
            utils = require('cordova/utils'),
            exec = require('cordova/exec'),
            Entry = require('./Entry'),
            FileError = require('./FileError'),
            DirectoryReader = require('./DirectoryReader');

        /**
         * An interface representing a directory on the file system.
         *
         * {boolean} isFile always false (readonly)
         * {boolean} isDirectory always true (readonly)
         * {DOMString} name of the directory, excluding the path leading to it (readonly)
         * {DOMString} fullPath the absolute full path to the directory (readonly)
         * {FileSystem} filesystem on which the directory resides (readonly)
         */
        var DirectoryEntry = function (name, fullPath, fileSystem, nativeURL) {
            DirectoryEntry.__super__.constructor.call(this, false, true, name, fullPath, fileSystem, nativeURL);
        };

        utils.extend(DirectoryEntry, Entry);

        /**
         * Creates a new DirectoryReader to read entries from this directory
         */
        DirectoryEntry.prototype.createReader = function () {
            return new DirectoryReader(this.toInternalURL());
        };

        /**
         * Creates or looks up a directory
         *
         * @param {DOMString} path either a relative or absolute path from this directory in which to look up or create a directory
         * @param {Flags} options to create or exclusively create the directory
         * @param {Function} successCallback is called with the new entry
         * @param {Function} errorCallback is called with a FileError
         */
        DirectoryEntry.prototype.getDirectory = function (path, options, successCallback, errorCallback) {
            argscheck.checkArgs('sOFF', 'DirectoryEntry.getDirectory', arguments);
            var fs = this.filesystem;
            var win = successCallback && function (result) {
                    var entry = new DirectoryEntry(result.name, result.fullPath, fs, result.nativeURL);
                    successCallback(entry);
                };
            var fail = errorCallback && function (code) {
                    errorCallback(new FileError(code));
                };
            exec(win, fail, "File", "getDirectory", [this.toInternalURL(), path, options]);
        };

        /**
         * Deletes a directory and all of it's contents
         *
         * @param {Function} successCallback is called with no parameters
         * @param {Function} errorCallback is called with a FileError
         */
        DirectoryEntry.prototype.removeRecursively = function (successCallback, errorCallback) {
            argscheck.checkArgs('FF', 'DirectoryEntry.removeRecursively', arguments);
            var fail = errorCallback && function (code) {
                    errorCallback(new FileError(code));
                };
            exec(successCallback, fail, "File", "removeRecursively", [this.toInternalURL()]);
        };

        /**
         * Creates or looks up a file
         *
         * @param {DOMString} path either a relative or absolute path from this directory in which to look up or create a file
         * @param {Flags} options to create or exclusively create the file
         * @param {Function} successCallback is called with the new entry
         * @param {Function} errorCallback is called with a FileError
         */
        DirectoryEntry.prototype.getFile = function (path, options, successCallback, errorCallback) {
            argscheck.checkArgs('sOFF', 'DirectoryEntry.getFile', arguments);
            var fs = this.filesystem;
            var win = successCallback && function (result) {
                    var FileEntry = require('./FileEntry');
                    var entry = new FileEntry(result.name, result.fullPath, fs, result.nativeURL);
                    successCallback(entry);
                };
            var fail = errorCallback && function (code) {
                    errorCallback(new FileError(code));
                };
            exec(win, fail, "File", "getFile", [this.toInternalURL(), path, options]);
        };

        module.exports = DirectoryEntry;

    });

    cordova.define("org.apache.cordova.file.DirectoryReader", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        var exec = require('cordova/exec'),
            FileError = require('./FileError');

        /**
         * An interface that lists the files and directories in a directory.
         */
        function DirectoryReader(localURL) {
            this.localURL = localURL || null;
            this.hasReadEntries = false;
        }

        /**
         * Returns a list of entries from a directory.
         *
         * @param {Function} successCallback is called with a list of entries
         * @param {Function} errorCallback is called with a FileError
         */
        DirectoryReader.prototype.readEntries = function (successCallback, errorCallback) {
            // If we've already read and passed on this directory's entries, return an empty list.
            if (this.hasReadEntries) {
                successCallback([]);
                return;
            }
            var reader = this;
            var win = typeof successCallback !== 'function' ? null : function (result) {
                var retVal = [];
                for (var i = 0; i < result.length; i++) {
                    var entry = null;
                    if (result[i].isDirectory) {
                        entry = new (require('./DirectoryEntry'))();
                    }
                    else if (result[i].isFile) {
                        entry = new (require('./FileEntry'))();
                    }
                    entry.isDirectory = result[i].isDirectory;
                    entry.isFile = result[i].isFile;
                    entry.name = result[i].name;
                    entry.fullPath = result[i].fullPath;
                    entry.filesystem = new (require('./FileSystem'))(result[i].filesystemName);
                    entry.nativeURL = result[i].nativeURL;
                    retVal.push(entry);
                }
                reader.hasReadEntries = true;
                successCallback(retVal);
            };
            var fail = typeof errorCallback !== 'function' ? null : function (code) {
                errorCallback(new FileError(code));
            };
            exec(win, fail, "File", "readEntries", [this.localURL]);
        };

        module.exports = DirectoryReader;

    });

    cordova.define("org.apache.cordova.file.Entry", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        var argscheck = require('cordova/argscheck'),
            exec = require('cordova/exec'),
            FileError = require('./FileError'),
            Metadata = require('./Metadata');

        /**
         * Represents a file or directory on the local file system.
         *
         * @param isFile
         *            {boolean} true if Entry is a file (readonly)
         * @param isDirectory
         *            {boolean} true if Entry is a directory (readonly)
         * @param name
         *            {DOMString} name of the file or directory, excluding the path
         *            leading to it (readonly)
         * @param fullPath
         *            {DOMString} the absolute full path to the file or directory
         *            (readonly)
         * @param fileSystem
         *            {FileSystem} the filesystem on which this entry resides
         *            (readonly)
         * @param nativeURL
         *            {DOMString} an alternate URL which can be used by native
         *            webview controls, for example media players.
         *            (optional, readonly)
         */
        function Entry(isFile, isDirectory, name, fullPath, fileSystem, nativeURL) {
            this.isFile = !!isFile;
            this.isDirectory = !!isDirectory;
            this.name = name || '';
            this.fullPath = fullPath || '';
            this.filesystem = fileSystem || null;
            this.nativeURL = nativeURL || null;
        }

        /**
         * Look up the metadata of the entry.
         *
         * @param successCallback
         *            {Function} is called with a Metadata object
         * @param errorCallback
         *            {Function} is called with a FileError
         */
        Entry.prototype.getMetadata = function (successCallback, errorCallback) {
            argscheck.checkArgs('FF', 'Entry.getMetadata', arguments);
            var success = successCallback && function (entryMetadata) {
                    var metadata = new Metadata(entryMetadata);
                    successCallback(metadata);
                };
            var fail = errorCallback && function (code) {
                    errorCallback(new FileError(code));
                };
            exec(success, fail, "File", "getMetadata", [this.toInternalURL()]);
        };

        /**
         * Set the metadata of the entry.
         *
         * @param successCallback
         *            {Function} is called with a Metadata object
         * @param errorCallback
         *            {Function} is called with a FileError
         * @param metadataObject
         *            {Object} keys and values to set
         */
        Entry.prototype.setMetadata = function (successCallback, errorCallback, metadataObject) {
            argscheck.checkArgs('FFO', 'Entry.setMetadata', arguments);
            exec(successCallback, errorCallback, "File", "setMetadata", [this.toInternalURL(), metadataObject]);
        };

        /**
         * Move a file or directory to a new location.
         *
         * @param parent
         *            {DirectoryEntry} the directory to which to move this entry
         * @param newName
         *            {DOMString} new name of the entry, defaults to the current name
         * @param successCallback
         *            {Function} called with the new DirectoryEntry object
         * @param errorCallback
         *            {Function} called with a FileError
         */
        Entry.prototype.moveTo = function (parent, newName, successCallback, errorCallback) {
            argscheck.checkArgs('oSFF', 'Entry.moveTo', arguments);
            var fail = errorCallback && function (code) {
                    errorCallback(new FileError(code));
                };
            var srcURL = this.toInternalURL(),
            // entry name
                name = newName || this.name,
                success = function (entry) {
                    if (entry) {
                        if (successCallback) {
                            // create appropriate Entry object
                            var fs = entry.filesystemName ? new FileSystem(entry.filesystemName, {
                                name: "",
                                fullPath: "/"
                            }) : this.filesystem;
                            var result = (entry.isDirectory) ? new (require('./DirectoryEntry'))(entry.name, entry.fullPath, fs, entry.nativeURL) : new (require('org.apache.cordova.file.FileEntry'))(entry.name, entry.fullPath, fs, entry.nativeURL);
                            successCallback(result);
                        }
                    }
                    else {
                        // no Entry object returned
                        fail && fail(FileError.NOT_FOUND_ERR);
                    }
                };

            // copy
            exec(success, fail, "File", "moveTo", [srcURL, parent.toInternalURL(), name]);
        };

        /**
         * Copy a directory to a different location.
         *
         * @param parent
         *            {DirectoryEntry} the directory to which to copy the entry
         * @param newName
         *            {DOMString} new name of the entry, defaults to the current name
         * @param successCallback
         *            {Function} called with the new Entry object
         * @param errorCallback
         *            {Function} called with a FileError
         */
        Entry.prototype.copyTo = function (parent, newName, successCallback, errorCallback) {
            argscheck.checkArgs('oSFF', 'Entry.copyTo', arguments);
            var fail = errorCallback && function (code) {
                    errorCallback(new FileError(code));
                };
            var srcURL = this.toInternalURL(),
            // entry name
                name = newName || this.name,
            // success callback
                success = function (entry) {
                    if (entry) {
                        if (successCallback) {
                            // create appropriate Entry object
                            var fs = entry.filesystemName ? new FileSystem(entry.filesystemName, {
                                name: "",
                                fullPath: "/"
                            }) : this.filesystem;
                            var result = (entry.isDirectory) ? new (require('./DirectoryEntry'))(entry.name, entry.fullPath, fs, entry.nativeURL) : new (require('org.apache.cordova.file.FileEntry'))(entry.name, entry.fullPath, fs, entry.nativeURL);
                            successCallback(result);
                        }
                    }
                    else {
                        // no Entry object returned
                        fail && fail(FileError.NOT_FOUND_ERR);
                    }
                };

            // copy
            exec(success, fail, "File", "copyTo", [srcURL, parent.toInternalURL(), name]);
        };

        /**
         * Return a URL that can be passed across the bridge to identify this entry.
         */
        Entry.prototype.toInternalURL = function () {
            if (this.filesystem && this.filesystem.__format__) {
                return this.filesystem.__format__(this.fullPath);
            }
        };

        /**
         * Return a URL that can be used to identify this entry.
         * Use a URL that can be used to as the src attribute of a <video> or
         * <audio> tag. If that is not possible, construct a cdvfile:// URL.
         */
        Entry.prototype.toURL = function () {
            if (this.nativeURL) {
                return this.nativeURL;
            }
            // fullPath attribute may contain the full URL in the case that
            // toInternalURL fails.
            return this.toInternalURL() || "file://localhost" + this.fullPath;
        };

        /**
         * Backwards-compatibility: In v1.0.0 - 1.0.2, .toURL would only return a
         * cdvfile:// URL, and this method was necessary to obtain URLs usable by the
         * webview.
         * See CB-6051, CB-6106, CB-6117, CB-6152, CB-6199, CB-6201, CB-6243, CB-6249,
         * and CB-6300.
         */
        Entry.prototype.toNativeURL = function () {
            console.log("DEPRECATED: Update your code to use 'toURL'");
            return this.toURL();
        };

        /**
         * Returns a URI that can be used to identify this entry.
         *
         * @param {DOMString} mimeType for a FileEntry, the mime type to be used to interpret the file, when loaded through this URI.
         * @return uri
         */
        Entry.prototype.toURI = function (mimeType) {
            console.log("DEPRECATED: Update your code to use 'toURL'");
            return this.toURL();
        };

        /**
         * Remove a file or directory. It is an error to attempt to delete a
         * directory that is not empty. It is an error to attempt to delete a
         * root directory of a file system.
         *
         * @param successCallback {Function} called with no parameters
         * @param errorCallback {Function} called with a FileError
         */
        Entry.prototype.remove = function (successCallback, errorCallback) {
            argscheck.checkArgs('FF', 'Entry.remove', arguments);
            var fail = errorCallback && function (code) {
                    errorCallback(new FileError(code));
                };
            exec(successCallback, fail, "File", "remove", [this.toInternalURL()]);
        };

        /**
         * Look up the parent DirectoryEntry of this entry.
         *
         * @param successCallback {Function} called with the parent DirectoryEntry object
         * @param errorCallback {Function} called with a FileError
         */
        Entry.prototype.getParent = function (successCallback, errorCallback) {
            argscheck.checkArgs('FF', 'Entry.getParent', arguments);
            var fs = this.filesystem;
            var win = successCallback && function (result) {
                    var DirectoryEntry = require('./DirectoryEntry');
                    var entry = new DirectoryEntry(result.name, result.fullPath, fs, result.nativeURL);
                    successCallback(entry);
                };
            var fail = errorCallback && function (code) {
                    errorCallback(new FileError(code));
                };
            exec(win, fail, "File", "getParent", [this.toInternalURL()]);
        };

        module.exports = Entry;

    });

    cordova.define("org.apache.cordova.file.File", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        /**
         * Constructor.
         * name {DOMString} name of the file, without path information
         * fullPath {DOMString} the full path of the file, including the name
         * type {DOMString} mime type
         * lastModifiedDate {Date} last modified date
         * size {Number} size of the file in bytes
         */

        var File = function (name, localURL, type, lastModifiedDate, size) {
            this.name = name || '';
            this.localURL = localURL || null;
            this.type = type || null;
            this.lastModifiedDate = lastModifiedDate || null;
            this.size = size || 0;

            // These store the absolute start and end for slicing the file.
            this.start = 0;
            this.end = this.size;
        };

        /**
         * Returns a "slice" of the file. Since Cordova Files don't contain the actual
         * content, this really returns a File with adjusted start and end.
         * Slices of slices are supported.
         * start {Number} The index at which to start the slice (inclusive).
         * end {Number} The index at which to end the slice (exclusive).
         */
        File.prototype.slice = function (start, end) {
            var size = this.end - this.start;
            var newStart = 0;
            var newEnd = size;
            if (arguments.length) {
                if (start < 0) {
                    newStart = Math.max(size + start, 0);
                } else {
                    newStart = Math.min(size, start);
                }
            }

            if (arguments.length >= 2) {
                if (end < 0) {
                    newEnd = Math.max(size + end, 0);
                } else {
                    newEnd = Math.min(end, size);
                }
            }

            var newFile = new File(this.name, this.localURL, this.type, this.lastModifiedData, this.size);
            newFile.start = this.start + newStart;
            newFile.end = this.start + newEnd;
            return newFile;
        };


        module.exports = File;

    });

    cordova.define("org.apache.cordova.file.FileEntry", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        var utils = require('cordova/utils'),
            exec = require('cordova/exec'),
            Entry = require('./Entry'),
            FileWriter = require('./FileWriter'),
            File = require('./File'),
            FileError = require('./FileError');

        /**
         * An interface representing a file on the file system.
         *
         * {boolean} isFile always true (readonly)
         * {boolean} isDirectory always false (readonly)
         * {DOMString} name of the file, excluding the path leading to it (readonly)
         * {DOMString} fullPath the absolute full path to the file (readonly)
         * {FileSystem} filesystem on which the file resides (readonly)
         */
        var FileEntry = function (name, fullPath, fileSystem, nativeURL) {
            FileEntry.__super__.constructor.apply(this, [true, false, name, fullPath, fileSystem, nativeURL]);
        };

        utils.extend(FileEntry, Entry);

        /**
         * Creates a new FileWriter associated with the file that this FileEntry represents.
         *
         * @param {Function} successCallback is called with the new FileWriter
         * @param {Function} errorCallback is called with a FileError
         */
        FileEntry.prototype.createWriter = function (successCallback, errorCallback) {
            this.file(function (filePointer) {
                var writer = new FileWriter(filePointer);

                if (writer.localURL === null || writer.localURL === "") {
                    errorCallback && errorCallback(new FileError(FileError.INVALID_STATE_ERR));
                } else {
                    successCallback && successCallback(writer);
                }
            }, errorCallback);
        };

        /**
         * Returns a File that represents the current state of the file that this FileEntry represents.
         *
         * @param {Function} successCallback is called with the new File object
         * @param {Function} errorCallback is called with a FileError
         */
        FileEntry.prototype.file = function (successCallback, errorCallback) {
            var localURL = this.toInternalURL();
            var win = successCallback && function (f) {
                    var file = new File(f.name, localURL, f.type, f.lastModifiedDate, f.size);
                    successCallback(file);
                };
            var fail = errorCallback && function (code) {
                    errorCallback(new FileError(code));
                };
            exec(win, fail, "File", "getFileMetadata", [localURL]);
        };


        module.exports = FileEntry;

    });

    cordova.define("org.apache.cordova.file.FileError", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        /**
         * FileError
         */
        function FileError(error) {
            this.code = error || null;
        }

// File error codes
// Found in DOMException
        FileError.NOT_FOUND_ERR = 1;
        FileError.SECURITY_ERR = 2;
        FileError.ABORT_ERR = 3;

// Added by File API specification
        FileError.NOT_READABLE_ERR = 4;
        FileError.ENCODING_ERR = 5;
        FileError.NO_MODIFICATION_ALLOWED_ERR = 6;
        FileError.INVALID_STATE_ERR = 7;
        FileError.SYNTAX_ERR = 8;
        FileError.INVALID_MODIFICATION_ERR = 9;
        FileError.QUOTA_EXCEEDED_ERR = 10;
        FileError.TYPE_MISMATCH_ERR = 11;
        FileError.PATH_EXISTS_ERR = 12;

        module.exports = FileError;

    });

    cordova.define("org.apache.cordova.file.FileReader", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        var exec = require('cordova/exec'),
            modulemapper = require('cordova/modulemapper'),
            utils = require('cordova/utils'),
            File = require('./File'),
            FileError = require('./FileError'),
            ProgressEvent = require('./ProgressEvent'),
            origFileReader = modulemapper.getOriginalSymbol(this, 'FileReader');

        /**
         * This class reads the mobile device file system.
         *
         * For Android:
         *      The root directory is the root of the file system.
         *      To read from the SD card, the file name is "sdcard/my_file.txt"
         * @constructor
         */
        var FileReader = function () {
            this._readyState = 0;
            this._error = null;
            this._result = null;
            this._localURL = '';
            this._realReader = origFileReader ? new origFileReader() : {};
        };

// States
        FileReader.EMPTY = 0;
        FileReader.LOADING = 1;
        FileReader.DONE = 2;

        utils.defineGetter(FileReader.prototype, 'readyState', function () {
            return this._localURL ? this._readyState : this._realReader.readyState;
        });

        utils.defineGetter(FileReader.prototype, 'error', function () {
            return this._localURL ? this._error : this._realReader.error;
        });

        utils.defineGetter(FileReader.prototype, 'result', function () {
            return this._localURL ? this._result : this._realReader.result;
        });

        function defineEvent(eventName) {
            utils.defineGetterSetter(FileReader.prototype, eventName, function () {
                return this._realReader[eventName] || null;
            }, function (value) {
                this._realReader[eventName] = value;
            });
        }

        defineEvent('onloadstart');    // When the read starts.
        defineEvent('onprogress');     // While reading (and decoding) file or fileBlob data, and reporting partial file data (progress.loaded/progress.total)
        defineEvent('onload');         // When the read has successfully completed.
        defineEvent('onerror');        // When the read has failed (see errors).
        defineEvent('onloadend');      // When the request has completed (either in success or failure).
        defineEvent('onabort');        // When the read has been aborted. For instance, by invoking the abort() method.

        function initRead(reader, file) {
            // Already loading something
            if (reader.readyState == FileReader.LOADING) {
                throw new FileError(FileError.INVALID_STATE_ERR);
            }

            reader._result = null;
            reader._error = null;
            reader._readyState = FileReader.LOADING;

            if (typeof file.localURL == 'string') {
                reader._localURL = file.localURL;
            } else {
                reader._localURL = '';
                return true;
            }

            reader.onloadstart && reader.onloadstart(new ProgressEvent("loadstart", {target: reader}));
        }

        /**
         * Abort reading file.
         */
        FileReader.prototype.abort = function () {
            if (origFileReader && !this._localURL) {
                return this._realReader.abort();
            }
            this._result = null;

            if (this._readyState == FileReader.DONE || this._readyState == FileReader.EMPTY) {
                return;
            }

            this._readyState = FileReader.DONE;

            // If abort callback
            if (typeof this.onabort === 'function') {
                this.onabort(new ProgressEvent('abort', {target: this}));
            }
            // If load end callback
            if (typeof this.onloadend === 'function') {
                this.onloadend(new ProgressEvent('loadend', {target: this}));
            }
        };

        /**
         * Read text file.
         *
         * @param file          {File} File object containing file properties
         * @param encoding      [Optional] (see http://www.iana.org/assignments/character-sets)
         */
        FileReader.prototype.readAsText = function (file, encoding) {
            if (initRead(this, file)) {
                return this._realReader.readAsText(file, encoding);
            }

            // Default encoding is UTF-8
            var enc = encoding ? encoding : "UTF-8";
            var me = this;
            var execArgs = [this._localURL, enc, file.start, file.end];

            // Read file
            exec(
                // Success callback
                function (r) {
                    // If DONE (cancelled), then don't do anything
                    if (me._readyState === FileReader.DONE) {
                        return;
                    }

                    // Save result
                    me._result = r;

                    // If onload callback
                    if (typeof me.onload === "function") {
                        me.onload(new ProgressEvent("load", {target: me}));
                    }

                    // DONE state
                    me._readyState = FileReader.DONE;

                    // If onloadend callback
                    if (typeof me.onloadend === "function") {
                        me.onloadend(new ProgressEvent("loadend", {target: me}));
                    }
                },
                // Error callback
                function (e) {
                    // If DONE (cancelled), then don't do anything
                    if (me._readyState === FileReader.DONE) {
                        return;
                    }

                    // DONE state
                    me._readyState = FileReader.DONE;

                    // null result
                    me._result = null;

                    // Save error
                    me._error = new FileError(e);

                    // If onerror callback
                    if (typeof me.onerror === "function") {
                        me.onerror(new ProgressEvent("error", {target: me}));
                    }

                    // If onloadend callback
                    if (typeof me.onloadend === "function") {
                        me.onloadend(new ProgressEvent("loadend", {target: me}));
                    }
                }, "File", "readAsText", execArgs);
        };


        /**
         * Read file and return data as a base64 encoded data url.
         * A data url is of the form:
         *      data:[<mediatype>][;base64],<data>
         *
         * @param file          {File} File object containing file properties
         */
        FileReader.prototype.readAsDataURL = function (file) {
            if (initRead(this, file)) {
                return this._realReader.readAsDataURL(file);
            }

            var me = this;
            var execArgs = [this._localURL, file.start, file.end];

            // Read file
            exec(
                // Success callback
                function (r) {
                    // If DONE (cancelled), then don't do anything
                    if (me._readyState === FileReader.DONE) {
                        return;
                    }

                    // DONE state
                    me._readyState = FileReader.DONE;

                    // Save result
                    me._result = r;

                    // If onload callback
                    if (typeof me.onload === "function") {
                        me.onload(new ProgressEvent("load", {target: me}));
                    }

                    // If onloadend callback
                    if (typeof me.onloadend === "function") {
                        me.onloadend(new ProgressEvent("loadend", {target: me}));
                    }
                },
                // Error callback
                function (e) {
                    // If DONE (cancelled), then don't do anything
                    if (me._readyState === FileReader.DONE) {
                        return;
                    }

                    // DONE state
                    me._readyState = FileReader.DONE;

                    me._result = null;

                    // Save error
                    me._error = new FileError(e);

                    // If onerror callback
                    if (typeof me.onerror === "function") {
                        me.onerror(new ProgressEvent("error", {target: me}));
                    }

                    // If onloadend callback
                    if (typeof me.onloadend === "function") {
                        me.onloadend(new ProgressEvent("loadend", {target: me}));
                    }
                }, "File", "readAsDataURL", execArgs);
        };

        /**
         * Read file and return data as a binary data.
         *
         * @param file          {File} File object containing file properties
         */
        FileReader.prototype.readAsBinaryString = function (file) {
            if (initRead(this, file)) {
                return this._realReader.readAsBinaryString(file);
            }

            var me = this;
            var execArgs = [this._localURL, file.start, file.end];

            // Read file
            exec(
                // Success callback
                function (r) {
                    // If DONE (cancelled), then don't do anything
                    if (me._readyState === FileReader.DONE) {
                        return;
                    }

                    // DONE state
                    me._readyState = FileReader.DONE;

                    me._result = r;

                    // If onload callback
                    if (typeof me.onload === "function") {
                        me.onload(new ProgressEvent("load", {target: me}));
                    }

                    // If onloadend callback
                    if (typeof me.onloadend === "function") {
                        me.onloadend(new ProgressEvent("loadend", {target: me}));
                    }
                },
                // Error callback
                function (e) {
                    // If DONE (cancelled), then don't do anything
                    if (me._readyState === FileReader.DONE) {
                        return;
                    }

                    // DONE state
                    me._readyState = FileReader.DONE;

                    me._result = null;

                    // Save error
                    me._error = new FileError(e);

                    // If onerror callback
                    if (typeof me.onerror === "function") {
                        me.onerror(new ProgressEvent("error", {target: me}));
                    }

                    // If onloadend callback
                    if (typeof me.onloadend === "function") {
                        me.onloadend(new ProgressEvent("loadend", {target: me}));
                    }
                }, "File", "readAsBinaryString", execArgs);
        };

        /**
         * Read file and return data as a binary data.
         *
         * @param file          {File} File object containing file properties
         */
        FileReader.prototype.readAsArrayBuffer = function (file) {
            if (initRead(this, file)) {
                return this._realReader.readAsArrayBuffer(file);
            }

            var me = this;
            var execArgs = [this._localURL, file.start, file.end];

            // Read file
            exec(
                // Success callback
                function (r) {
                    // If DONE (cancelled), then don't do anything
                    if (me._readyState === FileReader.DONE) {
                        return;
                    }

                    // DONE state
                    me._readyState = FileReader.DONE;

                    me._result = r;

                    // If onload callback
                    if (typeof me.onload === "function") {
                        me.onload(new ProgressEvent("load", {target: me}));
                    }

                    // If onloadend callback
                    if (typeof me.onloadend === "function") {
                        me.onloadend(new ProgressEvent("loadend", {target: me}));
                    }
                },
                // Error callback
                function (e) {
                    // If DONE (cancelled), then don't do anything
                    if (me._readyState === FileReader.DONE) {
                        return;
                    }

                    // DONE state
                    me._readyState = FileReader.DONE;

                    me._result = null;

                    // Save error
                    me._error = new FileError(e);

                    // If onerror callback
                    if (typeof me.onerror === "function") {
                        me.onerror(new ProgressEvent("error", {target: me}));
                    }

                    // If onloadend callback
                    if (typeof me.onloadend === "function") {
                        me.onloadend(new ProgressEvent("loadend", {target: me}));
                    }
                }, "File", "readAsArrayBuffer", execArgs);
        };

        module.exports = FileReader;

    });

    cordova.define("org.apache.cordova.file.FileSystem", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        var DirectoryEntry = require('./DirectoryEntry');

        /**
         * An interface representing a file system
         *
         * @constructor
         * {DOMString} name the unique name of the file system (readonly)
         * {DirectoryEntry} root directory of the file system (readonly)
         */
        var FileSystem = function (name, root) {
            this.name = name || null;
            if (root) {
                this.root = new DirectoryEntry(root.name, root.fullPath, this);
            } else {
                this.root = new DirectoryEntry(this.name, '/', this);
            }
        };

        FileSystem.prototype.__format__ = function (fullPath) {
            return fullPath;
        };

        FileSystem.prototype.toJSON = function () {
            return "<FileSystem: " + this.name + ">";
        };

        module.exports = FileSystem;

    });

    cordova.define("org.apache.cordova.file.FileUploadOptions", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        /**
         * Options to customize the HTTP request used to upload files.
         * @constructor
         * @param fileKey {String}   Name of file request parameter.
         * @param fileName {String}  Filename to be used by the server. Defaults to image.jpg.
         * @param mimeType {String}  Mimetype of the uploaded file. Defaults to image/jpeg.
         * @param params {Object}    Object with key: value params to send to the server.
         * @param headers {Object}   Keys are header names, values are header values. Multiple
         *                           headers of the same name are not supported.
         */
        var FileUploadOptions = function (fileKey, fileName, mimeType, params, headers, httpMethod) {
            this.fileKey = fileKey || null;
            this.fileName = fileName || null;
            this.mimeType = mimeType || null;
            this.params = params || null;
            this.headers = headers || null;
            this.httpMethod = httpMethod || null;
        };

        module.exports = FileUploadOptions;

    });

    cordova.define("org.apache.cordova.file.FileUploadResult", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        /**
         * FileUploadResult
         * @constructor
         */
        module.exports = function FileUploadResult(size, code, content) {
            this.bytesSent = size;
            this.responseCode = code;
            this.response = content;
        };
    });

    cordova.define("org.apache.cordova.file.FileWriter", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        var exec = require('cordova/exec'),
            FileError = require('./FileError'),
            ProgressEvent = require('./ProgressEvent');

        /**
         * This class writes to the mobile device file system.
         *
         * For Android:
         *      The root directory is the root of the file system.
         *      To write to the SD card, the file name is "sdcard/my_file.txt"
         *
         * @constructor
         * @param file {File} File object containing file properties
         * @param append if true write to the end of the file, otherwise overwrite the file
         */
        var FileWriter = function (file) {
            this.fileName = "";
            this.length = 0;
            if (file) {
                this.localURL = file.localURL || file;
                this.length = file.size || 0;
            }
            // default is to write at the beginning of the file
            this.position = 0;

            this.readyState = 0; // EMPTY

            this.result = null;

            // Error
            this.error = null;

            // Event handlers
            this.onwritestart = null;   // When writing starts
            this.onprogress = null;     // While writing the file, and reporting partial file data
            this.onwrite = null;        // When the write has successfully completed.
            this.onwriteend = null;     // When the request has completed (either in success or failure).
            this.onabort = null;        // When the write has been aborted. For instance, by invoking the abort() method.
            this.onerror = null;        // When the write has failed (see errors).
        };

// States
        FileWriter.INIT = 0;
        FileWriter.WRITING = 1;
        FileWriter.DONE = 2;

        /**
         * Abort writing file.
         */
        FileWriter.prototype.abort = function () {
            // check for invalid state
            if (this.readyState === FileWriter.DONE || this.readyState === FileWriter.INIT) {
                throw new FileError(FileError.INVALID_STATE_ERR);
            }

            // set error
            this.error = new FileError(FileError.ABORT_ERR);

            this.readyState = FileWriter.DONE;

            // If abort callback
            if (typeof this.onabort === "function") {
                this.onabort(new ProgressEvent("abort", {"target": this}));
            }

            // If write end callback
            if (typeof this.onwriteend === "function") {
                this.onwriteend(new ProgressEvent("writeend", {"target": this}));
            }
        };

        /**
         * Writes data to the file
         *
         * @param data text or blob to be written
         */
        FileWriter.prototype.write = function (data) {

            var that = this;
            var supportsBinary = (typeof window.Blob !== 'undefined' && typeof window.ArrayBuffer !== 'undefined');
            var isBinary;

            // Check to see if the incoming data is a blob
            if (data instanceof File || (supportsBinary && data instanceof Blob)) {
                var fileReader = new FileReader();
                fileReader.onload = function () {
                    // Call this method again, with the arraybuffer as argument
                    FileWriter.prototype.write.call(that, this.result);
                };
                if (supportsBinary) {
                    fileReader.readAsArrayBuffer(data);
                } else {
                    fileReader.readAsText(data);
                }
                return;
            }

            // Mark data type for safer transport over the binary bridge
            isBinary = supportsBinary && (data instanceof ArrayBuffer);
            if (isBinary && ['windowsphone', 'windows8'].indexOf(cordova.platformId) >= 0) {
                // create a plain array, using the keys from the Uint8Array view so that we can serialize it
                data = Array.apply(null, new Uint8Array(data));
            }

            // Throw an exception if we are already writing a file
            if (this.readyState === FileWriter.WRITING) {
                throw new FileError(FileError.INVALID_STATE_ERR);
            }

            // WRITING state
            this.readyState = FileWriter.WRITING;

            var me = this;

            // If onwritestart callback
            if (typeof me.onwritestart === "function") {
                me.onwritestart(new ProgressEvent("writestart", {"target": me}));
            }

            // Write file
            exec(
                // Success callback
                function (r) {
                    // If DONE (cancelled), then don't do anything
                    if (me.readyState === FileWriter.DONE) {
                        return;
                    }

                    // position always increases by bytes written because file would be extended
                    me.position += r;
                    // The length of the file is now where we are done writing.

                    me.length = me.position;

                    // DONE state
                    me.readyState = FileWriter.DONE;

                    // If onwrite callback
                    if (typeof me.onwrite === "function") {
                        me.onwrite(new ProgressEvent("write", {"target": me}));
                    }

                    // If onwriteend callback
                    if (typeof me.onwriteend === "function") {
                        me.onwriteend(new ProgressEvent("writeend", {"target": me}));
                    }
                },
                // Error callback
                function (e) {
                    // If DONE (cancelled), then don't do anything
                    if (me.readyState === FileWriter.DONE) {
                        return;
                    }

                    // DONE state
                    me.readyState = FileWriter.DONE;

                    // Save error
                    me.error = new FileError(e);

                    // If onerror callback
                    if (typeof me.onerror === "function") {
                        me.onerror(new ProgressEvent("error", {"target": me}));
                    }

                    // If onwriteend callback
                    if (typeof me.onwriteend === "function") {
                        me.onwriteend(new ProgressEvent("writeend", {"target": me}));
                    }
                }, "File", "write", [this.localURL, data, this.position, isBinary]);
        };

        /**
         * Moves the file pointer to the location specified.
         *
         * If the offset is a negative number the position of the file
         * pointer is rewound.  If the offset is greater than the file
         * size the position is set to the end of the file.
         *
         * @param offset is the location to move the file pointer to.
         */
        FileWriter.prototype.seek = function (offset) {
            // Throw an exception if we are already writing a file
            if (this.readyState === FileWriter.WRITING) {
                throw new FileError(FileError.INVALID_STATE_ERR);
            }

            if (!offset && offset !== 0) {
                return;
            }

            // See back from end of file.
            if (offset < 0) {
                this.position = Math.max(offset + this.length, 0);
            }
            // Offset is bigger than file size so set position
            // to the end of the file.
            else if (offset > this.length) {
                this.position = this.length;
            }
            // Offset is between 0 and file size so set the position
            // to start writing.
            else {
                this.position = offset;
            }
        };

        /**
         * Truncates the file to the size specified.
         *
         * @param size to chop the file at.
         */
        FileWriter.prototype.truncate = function (size) {
            // Throw an exception if we are already writing a file
            if (this.readyState === FileWriter.WRITING) {
                throw new FileError(FileError.INVALID_STATE_ERR);
            }

            // WRITING state
            this.readyState = FileWriter.WRITING;

            var me = this;

            // If onwritestart callback
            if (typeof me.onwritestart === "function") {
                me.onwritestart(new ProgressEvent("writestart", {"target": this}));
            }

            // Write file
            exec(
                // Success callback
                function (r) {
                    // If DONE (cancelled), then don't do anything
                    if (me.readyState === FileWriter.DONE) {
                        return;
                    }

                    // DONE state
                    me.readyState = FileWriter.DONE;

                    // Update the length of the file
                    me.length = r;
                    me.position = Math.min(me.position, r);

                    // If onwrite callback
                    if (typeof me.onwrite === "function") {
                        me.onwrite(new ProgressEvent("write", {"target": me}));
                    }

                    // If onwriteend callback
                    if (typeof me.onwriteend === "function") {
                        me.onwriteend(new ProgressEvent("writeend", {"target": me}));
                    }
                },
                // Error callback
                function (e) {
                    // If DONE (cancelled), then don't do anything
                    if (me.readyState === FileWriter.DONE) {
                        return;
                    }

                    // DONE state
                    me.readyState = FileWriter.DONE;

                    // Save error
                    me.error = new FileError(e);

                    // If onerror callback
                    if (typeof me.onerror === "function") {
                        me.onerror(new ProgressEvent("error", {"target": me}));
                    }

                    // If onwriteend callback
                    if (typeof me.onwriteend === "function") {
                        me.onwriteend(new ProgressEvent("writeend", {"target": me}));
                    }
                }, "File", "truncate", [this.localURL, size]);
        };

        module.exports = FileWriter;

    });

    cordova.define("org.apache.cordova.file.Flags", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        /**
         * Supplies arguments to methods that lookup or create files and directories.
         *
         * @param create
         *            {boolean} file or directory if it doesn't exist
         * @param exclusive
         *            {boolean} used with create; if true the command will fail if
         *            target path exists
         */
        function Flags(create, exclusive) {
            this.create = create || false;
            this.exclusive = exclusive || false;
        }

        module.exports = Flags;

    });

    cordova.define("org.apache.cordova.file.LocalFileSystem", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        exports.TEMPORARY = 0;
        exports.PERSISTENT = 1;

    });

    cordova.define("org.apache.cordova.file.Metadata", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        /**
         * Information about the state of the file or directory
         *
         * {Date} modificationTime (readonly)
         */
        var Metadata = function (metadata) {
            if (typeof metadata == "object") {
                this.modificationTime = new Date(metadata.modificationTime);
                this.size = metadata.size || 0;
            } else if (typeof metadata == "undefined") {
                this.modificationTime = null;
                this.size = 0;
            } else {
                /* Backwards compatiblity with platforms that only return a timestamp */
                this.modificationTime = new Date(metadata);
            }
        };

        module.exports = Metadata;

    });

    cordova.define("org.apache.cordova.file.ProgressEvent", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

// If ProgressEvent exists in global context, use it already, otherwise use our own polyfill
// Feature test: See if we can instantiate a native ProgressEvent;
// if so, use that approach,
// otherwise fill-in with our own implementation.
//
// NOTE: right now we always fill in with our own. Down the road would be nice if we can use whatever is native in the webview.
        var ProgressEvent = (function () {
            /*
             var createEvent = function(data) {
             var event = document.createEvent('Events');
             event.initEvent('ProgressEvent', false, false);
             if (data) {
             for (var i in data) {
             if (data.hasOwnProperty(i)) {
             event[i] = data[i];
             }
             }
             if (data.target) {
             // TODO: cannot call <some_custom_object>.dispatchEvent
             // need to first figure out how to implement EventTarget
             }
             }
             return event;
             };
             try {
             var ev = createEvent({type:"abort",target:document});
             return function ProgressEvent(type, data) {
             data.type = type;
             return createEvent(data);
             };
             } catch(e){
             */
            return function ProgressEvent(type, dict) {
                this.type = type;
                this.bubbles = false;
                this.cancelBubble = false;
                this.cancelable = false;
                this.lengthComputable = false;
                this.loaded = dict && dict.loaded ? dict.loaded : 0;
                this.total = dict && dict.total ? dict.total : 0;
                this.target = dict && dict.target ? dict.target : null;
            };
            //}
        })();

        module.exports = ProgressEvent;

    });

    cordova.define("org.apache.cordova.file.requestFileSystem", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        var argscheck = require('cordova/argscheck'),
            FileError = require('./FileError'),
            FileSystem = require('./FileSystem'),
            exec = require('cordova/exec');

        /**
         * Request a file system in which to store application data.
         * @param type  local file system type
         * @param size  indicates how much storage space, in bytes, the application expects to need
         * @param successCallback  invoked with a FileSystem object
         * @param errorCallback  invoked if error occurs retrieving file system
         */
        var requestFileSystem = function (type, size, successCallback, errorCallback) {
            argscheck.checkArgs('nnFF', 'requestFileSystem', arguments);
            var fail = function (code) {
                errorCallback && errorCallback(new FileError(code));
            };

            if (type < 0) {
                fail(FileError.SYNTAX_ERR);
            } else {
                // if successful, return a FileSystem object
                var success = function (file_system) {
                    if (file_system) {
                        if (successCallback) {
                            // grab the name and root from the file system object
                            var result = new FileSystem(file_system.name, file_system.root);
                            successCallback(result);
                        }
                    }
                    else {
                        // no FileSystem object returned
                        fail(FileError.NOT_FOUND_ERR);
                    }
                };
                exec(success, fail, "File", "requestFileSystem", [type, size]);
            }
        };

        module.exports = requestFileSystem;

    });

    cordova.define("org.apache.cordova.file.resolveLocalFileSystemURI", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        var argscheck = require('cordova/argscheck'),
            DirectoryEntry = require('./DirectoryEntry'),
            FileEntry = require('./FileEntry'),
            FileError = require('./FileError'),
            exec = require('cordova/exec');

        /**
         * Look up file system Entry referred to by local URI.
         * @param {DOMString} uri  URI referring to a local file or directory
         * @param successCallback  invoked with Entry object corresponding to URI
         * @param errorCallback    invoked if error occurs retrieving file system entry
         */
        module.exports.resolveLocalFileSystemURL = function (uri, successCallback, errorCallback) {
            argscheck.checkArgs('sFF', 'resolveLocalFileSystemURI', arguments);
            // error callback
            var fail = function (error) {
                errorCallback && errorCallback(new FileError(error));
            };
            // sanity check for 'not:valid:filename'
            if (!uri || uri.split(":").length > 2) {
                setTimeout(function () {
                    fail(FileError.ENCODING_ERR);
                }, 0);
                return;
            }
            // if successful, return either a file or directory entry
            var success = function (entry) {
                if (entry) {
                    if (successCallback) {
                        // create appropriate Entry object
                        var fsName = entry.filesystemName || (entry.filesystem == window.PERSISTENT ? 'persistent' : 'temporary');
                        var fs = new FileSystem(fsName, {name: "", fullPath: "/"});
                        var result = (entry.isDirectory) ? new DirectoryEntry(entry.name, entry.fullPath, fs, entry.nativeURL) : new FileEntry(entry.name, entry.fullPath, fs, entry.nativeURL);
                        successCallback(result);
                    }
                }
                else {
                    // no Entry object returned
                    fail(FileError.NOT_FOUND_ERR);
                }
            };

            exec(success, fail, "File", "resolveLocalFileSystemURI", [uri]);
        };
        module.exports.resolveLocalFileSystemURI = function () {
            console.log("resolveLocalFileSystemURI is deprecated. Please call resolveLocalFileSystemURL instead.");
            module.exports.resolveLocalFileSystemURL.apply(this, arguments);
        };

    });

    cordova.define("org.apache.cordova.file.androidFileSystem", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        FILESYSTEM_PROTOCOL = "cdvfile";

        module.exports = {
            __format__: function (fullPath) {
                if (this.name === 'content') {
                    return 'content:/' + fullPath;
                }
                var path = ('/' + this.name + (fullPath[0] === '/' ? '' : '/') + encodeURI(fullPath)).replace('//', '/');
                return FILESYSTEM_PROTOCOL + '://localhost' + path;
            }
        };


    });

    cordova.define("com.phonegap.plugins.barcodescanner.barcodescanner", function (require, exports, module) {
        /**
         * cordova is available under *either* the terms of the modified BSD license *or* the
         * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
         *
         * Copyright (c) Matt Kane 2010
         * Copyright (c) 2011, IBM Corporation
         */



        var exec = require('cordova/exec'),
            cordova = require('cordova');

        var BarcodeScanner = function () {
        };

//-------------------------------------------------------------------
        BarcodeScanner.Encode = {
            TEXT_TYPE: "TEXT_TYPE",
            EMAIL_TYPE: "EMAIL_TYPE",
            PHONE_TYPE: "PHONE_TYPE",
            SMS_TYPE: "SMS_TYPE"
            //  CONTACT_TYPE: "CONTACT_TYPE",  // TODO:  not implemented, requires passing a Bundle class from Javascript to Java
            //  LOCATION_TYPE: "LOCATION_TYPE" // TODO:  not implemented, requires passing a Bundle class from Javascript to Java
        };

//-------------------------------------------------------------------
        BarcodeScanner.prototype.scan = function (successCallback, errorCallback) {
            if (errorCallback == null) {
                errorCallback = function () {
                }
            }

            if (typeof errorCallback != "function") {
                console.log("BarcodeScanner.scan failure: failure parameter not a function");
                return
            }

            if (typeof successCallback != "function") {
                console.log("BarcodeScanner.scan failure: success callback parameter must be a function");
                return
            }

            cordova.exec(successCallback, errorCallback, 'BarcodeScanner', 'scan', []);
        };

//-------------------------------------------------------------------
        BarcodeScanner.prototype.encode = function (type, data, successCallback, errorCallback, options) {
            if (errorCallback == null) {
                errorCallback = function () {
                }
            }

            if (typeof errorCallback != "function") {
                console.log("BarcodeScanner.encode failure: failure parameter not a function");
                return
            }

            if (typeof successCallback != "function") {
                console.log("BarcodeScanner.encode failure: success callback parameter must be a function");
                return
            }

            cordova.exec(successCallback, errorCallback, 'BarcodeScanner', 'encode', [
                {"type": type, "data": data, "options": options}
            ]);
        };

        var barcodeScanner = new BarcodeScanner();
        module.exports = barcodeScanner;

    });

    cordova.define("com.archibus.plugins.configuration.Configuration", function (require, exports, module) {
        var exec = require('cordova/exec');


        var Configuration = {
            readConfigFile: function (success, error) {
                exec(success, error, 'Configuration', 'readConfigFile', []);
            },
            writeConfigFile: function (data, success, error) {
                exec(success, error, 'Configuration', 'writeConfigFile', [data]);
            },
            configFileExists: function (success, error) {
                exec(success, error, 'Configuration', 'configFileExists', []);
            },
            writeFile: function (fileName, data, success, error) {
                exec(success, error, 'Configuration', 'writeFile', [fileName, data]);
            },
            readFile: function (fileName, success, error) {
                exec(success, error, 'Configuration', 'readFile', [fileName]);
            }
        };

        module.exports = Configuration;

    });

    cordova.define("com.archibus.plugins.docconverter.DocumentConveter", function (require, exports, module) {
        var exec = require('cordova/exec');


        var DocumentConverter = {
            convertBase64ToBinary: function (base64String, fileName, success, error) {
                exec(success, error, 'DocumentConverter', 'convertBase64AndWriteToFile', [base64String, fileName]);
            },
            displayFileUsingIntent: function (filePath, success, error) {
                exec(success, error, 'DocumentConverter', 'displayFileUsingIntent', [filePath]);
            }
        };

        module.exports = DocumentConverter;

    });

    cordova.define("org.apache.cordova.battery-status.battery", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        /**
         * This class contains information about the current battery status.
         * @constructor
         */
        var cordova = require('cordova'),
            exec = require('cordova/exec');

        function handlers() {
            return battery.channels.batterystatus.numHandlers +
                battery.channels.batterylow.numHandlers +
                battery.channels.batterycritical.numHandlers;
        }

        var STATUS_CRITICAL = 5;
        var STATUS_LOW = 20;

        var Battery = function () {
            this._level = null;
            this._isPlugged = null;
            // Create new event handlers on the window (returns a channel instance)
            this.channels = {
                batterystatus: cordova.addWindowEventHandler("batterystatus"),
                batterylow: cordova.addWindowEventHandler("batterylow"),
                batterycritical: cordova.addWindowEventHandler("batterycritical")
            };
            for (var key in this.channels) {
                this.channels[key].onHasSubscribersChange = Battery.onHasSubscribersChange;
            }
        };
        /**
         * Event handlers for when callbacks get registered for the battery.
         * Keep track of how many handlers we have so we can start and stop the native battery listener
         * appropriately (and hopefully save on battery life!).
         */
        Battery.onHasSubscribersChange = function () {
            // If we just registered the first handler, make sure native listener is started.
            if (this.numHandlers === 1 && handlers() === 1) {
                exec(battery._status, battery._error, "Battery", "start", []);
            } else if (handlers() === 0) {
                exec(null, null, "Battery", "stop", []);
            }
        };

        /**
         * Callback for battery status
         *
         * @param {Object} info            keys: level, isPlugged
         */
        Battery.prototype._status = function (info) {

            if (info) {
                if (battery._level !== info.level || battery._isPlugged !== info.isPlugged) {

                    if (info.level == null && battery._level != null) {
                        return; // special case where callback is called because we stopped listening to the native side.
                    }

                    // Something changed. Fire batterystatus event
                    cordova.fireWindowEvent("batterystatus", info);

                    if (!info.isPlugged) { // do not fire low/critical if we are charging. issue: CB-4520
                        // note the following are NOT exact checks, as we want to catch a transition from 
                        // above the threshold to below. issue: CB-4519
                        if (battery._level > STATUS_CRITICAL && info.level <= STATUS_CRITICAL) {
                            // Fire critical battery event
                            cordova.fireWindowEvent("batterycritical", info);
                        }
                        else if (battery._level > STATUS_LOW && info.level <= STATUS_LOW) {
                            // Fire low battery event
                            cordova.fireWindowEvent("batterylow", info);
                        }
                    }
                    battery._level = info.level;
                    battery._isPlugged = info.isPlugged;
                }
            }
        };

        /**
         * Error callback for battery start
         */
        Battery.prototype._error = function (e) {
            console.log("Error initializing Battery: " + e);
        };

        var battery = new Battery();

        module.exports = battery;


    });

    cordova.define("org.apache.cordova.device-motion.Acceleration", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        var Acceleration = function (x, y, z, timestamp) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.timestamp = timestamp || (new Date()).getTime();
        };

        module.exports = Acceleration;

    });

    cordova.define("org.apache.cordova.device-motion.accelerometer", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        /**
         * This class provides access to device accelerometer data.
         * @constructor
         */
        var argscheck = require('cordova/argscheck'),
            utils = require("cordova/utils"),
            exec = require("cordova/exec"),
            Acceleration = require('./Acceleration');

// Is the accel sensor running?
        var running = false;

// Keeps reference to watchAcceleration calls.
        var timers = {};

// Array of listeners; used to keep track of when we should call start and stop.
        var listeners = [];

// Last returned acceleration object from native
        var accel = null;

// Tells native to start.
        function start() {
            exec(function (a) {
                var tempListeners = listeners.slice(0);
                accel = new Acceleration(a.x, a.y, a.z, a.timestamp);
                for (var i = 0, l = tempListeners.length; i < l; i++) {
                    tempListeners[i].win(accel);
                }
            }, function (e) {
                var tempListeners = listeners.slice(0);
                for (var i = 0, l = tempListeners.length; i < l; i++) {
                    tempListeners[i].fail(e);
                }
            }, "Accelerometer", "start", []);
            running = true;
        }

// Tells native to stop.
        function stop() {
            exec(null, null, "Accelerometer", "stop", []);
            running = false;
        }

// Adds a callback pair to the listeners array
        function createCallbackPair(win, fail) {
            return {win: win, fail: fail};
        }

// Removes a win/fail listener pair from the listeners array
        function removeListeners(l) {
            var idx = listeners.indexOf(l);
            if (idx > -1) {
                listeners.splice(idx, 1);
                if (listeners.length === 0) {
                    stop();
                }
            }
        }

        var accelerometer = {
            /**
             * Asynchronously acquires the current acceleration.
             *
             * @param {Function} successCallback    The function to call when the acceleration data is available
             * @param {Function} errorCallback      The function to call when there is an error getting the acceleration data. (OPTIONAL)
             * @param {AccelerationOptions} options The options for getting the accelerometer data such as timeout. (OPTIONAL)
             */
            getCurrentAcceleration: function (successCallback, errorCallback, options) {
                argscheck.checkArgs('fFO', 'accelerometer.getCurrentAcceleration', arguments);

                var p;
                var win = function (a) {
                    removeListeners(p);
                    successCallback(a);
                };
                var fail = function (e) {
                    removeListeners(p);
                    errorCallback && errorCallback(e);
                };

                p = createCallbackPair(win, fail);
                listeners.push(p);

                if (!running) {
                    start();
                }
            },

            /**
             * Asynchronously acquires the acceleration repeatedly at a given interval.
             *
             * @param {Function} successCallback    The function to call each time the acceleration data is available
             * @param {Function} errorCallback      The function to call when there is an error getting the acceleration data. (OPTIONAL)
             * @param {AccelerationOptions} options The options for getting the accelerometer data such as timeout. (OPTIONAL)
             * @return String                       The watch id that must be passed to #clearWatch to stop watching.
             */
            watchAcceleration: function (successCallback, errorCallback, options) {
                argscheck.checkArgs('fFO', 'accelerometer.watchAcceleration', arguments);
                // Default interval (10 sec)
                var frequency = (options && options.frequency && typeof options.frequency == 'number') ? options.frequency : 10000;

                // Keep reference to watch id, and report accel readings as often as defined in frequency
                var id = utils.createUUID();

                var p = createCallbackPair(function () {
                }, function (e) {
                    removeListeners(p);
                    errorCallback && errorCallback(e);
                });
                listeners.push(p);

                timers[id] = {
                    timer: window.setInterval(function () {
                        if (accel) {
                            successCallback(accel);
                        }
                    }, frequency),
                    listeners: p
                };

                if (running) {
                    // If we're already running then immediately invoke the success callback
                    // but only if we have retrieved a value, sample code does not check for null ...
                    if (accel) {
                        successCallback(accel);
                    }
                } else {
                    start();
                }

                return id;
            },

            /**
             * Clears the specified accelerometer watch.
             *
             * @param {String} id       The id of the watch returned from #watchAcceleration.
             */
            clearWatch: function (id) {
                // Stop javascript timer & remove from timer list
                if (id && timers[id]) {
                    window.clearInterval(timers[id].timer);
                    removeListeners(timers[id].listeners);
                    delete timers[id];
                }
            }
        };
        module.exports = accelerometer;

    });

    cordova.define("org.apache.cordova.device-orientation.CompassError", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        /**
         *  CompassError.
         *  An error code assigned by an implementation when an error has occurred
         * @constructor
         */
        var CompassError = function (err) {
            this.code = (err !== undefined ? err : null);
        };

        CompassError.COMPASS_INTERNAL_ERR = 0;
        CompassError.COMPASS_NOT_SUPPORTED = 20;

        module.exports = CompassError;

    });

    cordova.define("org.apache.cordova.device-orientation.CompassHeading", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        var CompassHeading = function (magneticHeading, trueHeading, headingAccuracy, timestamp) {
            this.magneticHeading = magneticHeading;
            this.trueHeading = trueHeading;
            this.headingAccuracy = headingAccuracy;
            this.timestamp = timestamp || new Date().getTime();
        };

        module.exports = CompassHeading;

    });

    cordova.define("org.apache.cordova.device-orientation.compass", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        var argscheck = require('cordova/argscheck'),
            exec = require('cordova/exec'),
            utils = require('cordova/utils'),
            CompassHeading = require('./CompassHeading'),
            CompassError = require('./CompassError'),

            timers = {},
            compass = {
                /**
                 * Asynchronously acquires the current heading.
                 * @param {Function} successCallback The function to call when the heading
                 * data is available
                 * @param {Function} errorCallback The function to call when there is an error
                 * getting the heading data.
                 * @param {CompassOptions} options The options for getting the heading data (not used).
                 */
                getCurrentHeading: function (successCallback, errorCallback, options) {
                    argscheck.checkArgs('fFO', 'compass.getCurrentHeading', arguments);

                    var win = function (result) {
                        var ch = new CompassHeading(result.magneticHeading, result.trueHeading, result.headingAccuracy, result.timestamp);
                        successCallback(ch);
                    };
                    var fail = errorCallback && function (code) {
                            var ce = new CompassError(code);
                            errorCallback(ce);
                        };

                    // Get heading
                    exec(win, fail, "Compass", "getHeading", [options]);
                },

                /**
                 * Asynchronously acquires the heading repeatedly at a given interval.
                 * @param {Function} successCallback The function to call each time the heading
                 * data is available
                 * @param {Function} errorCallback The function to call when there is an error
                 * getting the heading data.
                 * @param {HeadingOptions} options The options for getting the heading data
                 * such as timeout and the frequency of the watch. For iOS, filter parameter
                 * specifies to watch via a distance filter rather than time.
                 */
                watchHeading: function (successCallback, errorCallback, options) {
                    argscheck.checkArgs('fFO', 'compass.watchHeading', arguments);
                    // Default interval (100 msec)
                    var frequency = (options !== undefined && options.frequency !== undefined) ? options.frequency : 100;
                    var filter = (options !== undefined && options.filter !== undefined) ? options.filter : 0;

                    var id = utils.createUUID();
                    if (filter > 0) {
                        // is an iOS request for watch by filter, no timer needed
                        timers[id] = "iOS";
                        compass.getCurrentHeading(successCallback, errorCallback, options);
                    } else {
                        // Start watch timer to get headings
                        timers[id] = window.setInterval(function () {
                            compass.getCurrentHeading(successCallback, errorCallback);
                        }, frequency);
                    }

                    return id;
                },

                /**
                 * Clears the specified heading watch.
                 * @param {String} watchId The ID of the watch returned from #watchHeading.
                 */
                clearWatch: function (id) {
                    // Stop javascript timer & remove from timer list
                    if (id && timers[id]) {
                        if (timers[id] != "iOS") {
                            clearInterval(timers[id]);
                        } else {
                            // is iOS watch by filter so call into device to stop
                            exec(null, null, "Compass", "stopHeading", []);
                        }
                        delete timers[id];
                    }
                }
            };

        module.exports = compass;

    });

    cordova.define("org.apache.cordova.vibration.notification", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        var exec = require('cordova/exec');

        /**
         * Provides access to the vibration mechanism on the device.
         */

        module.exports = {

            /**
             * Vibrates the device for a given amount of time.
             *
             * @param {Integer} mills       The number of milliseconds to vibrate.
             */
            vibrate: function (mills) {
                exec(null, null, "Vibration", "vibrate", [mills]);
            },

            /**
             * Vibrates the device with a given pattern.
             *
             * @param {Array of Integer} pattern    Pattern with which to vibrate the device.
             *                                      Pass in an array of integers that
             *                                      are the durations for which to
             *                                      turn on or off the vibrator in
             *                                      milliseconds. The first value
             *                                      indicates the number of milliseconds
             *                                      to wait before turning the vibrator
             *                                      on. The next value indicates the
             *                                      number of milliseconds for which
             *                                      to keep the vibrator on before
             *                                      turning it off. Subsequent values
             *                                      alternate between durations in
             *                                      milliseconds to turn the vibrator
             *                                      off or to turn the vibrator on.
             *
             * @param {Integer} repeat              Optional index into the pattern array at which
             *                                      to start repeating (will repeat until canceled),
             *                                      or -1 for no repetition (default).
             */
            vibrateWithPattern: function (pattern, repeat) {
                repeat = (typeof repeat !== "undefined") ? repeat : -1;
                exec(null, null, "Vibration", "vibrateWithPattern", [pattern, repeat]);
            },

            /**
             * Immediately cancels any currently running vibration.
             */
            cancelVibration: function () {
                exec(null, null, "Vibration", "cancelVibration", []);
            }
        };

    });

    cordova.define("org.apache.cordova.contacts.contacts", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        var argscheck = require('cordova/argscheck'),
            exec = require('cordova/exec'),
            ContactError = require('./ContactError'),
            utils = require('cordova/utils'),
            Contact = require('./Contact'),
            fieldType = require('./ContactFieldType');


        /**
         * Represents a group of Contacts.
         * @constructor
         */
        var contacts = {
            fieldType: fieldType,
            /**
             * Returns an array of Contacts matching the search criteria.
             * @param fields that should be searched
             * @param successCB success callback
             * @param errorCB error callback
             * @param {ContactFindOptions} options that can be applied to contact searching
             * @return array of Contacts matching search criteria
             */
            find: function (fields, successCB, errorCB, options) {
                argscheck.checkArgs('afFO', 'contacts.find', arguments);
                if (!fields.length) {
                    errorCB && errorCB(new ContactError(ContactError.INVALID_ARGUMENT_ERROR));
                } else {
                    // missing 'options' param means return all contacts
                    options = options || {filter: '', multiple: true}
                    var win = function (result) {
                        var cs = [];
                        for (var i = 0, l = result.length; i < l; i++) {
                            cs.push(contacts.create(result[i]));
                        }
                        successCB(cs);
                    };
                    exec(win, errorCB, "Contacts", "search", [fields, options]);
                }
            },

            /**
             * This function picks contact from phone using contact picker UI
             * @returns new Contact object
             */
            pickContact: function (successCB, errorCB) {

                argscheck.checkArgs('fF', 'contacts.pick', arguments);

                var win = function (result) {
                    // if Contacts.pickContact return instance of Contact object
                    // don't create new Contact object, use current
                    var contact = result instanceof Contact ? result : contacts.create(result);
                    successCB(contact);
                };
                exec(win, errorCB, "Contacts", "pickContact", []);
            },

            /**
             * This function creates a new contact, but it does not persist the contact
             * to device storage. To persist the contact to device storage, invoke
             * contact.save().
             * @param properties an object whose properties will be examined to create a new Contact
             * @returns new Contact object
             */
            create: function (properties) {
                argscheck.checkArgs('O', 'contacts.create', arguments);
                var contact = new Contact();
                for (var i in properties) {
                    if (typeof contact[i] !== 'undefined' && properties.hasOwnProperty(i)) {
                        contact[i] = properties[i];
                    }
                }
                return contact;
            }
        };

        module.exports = contacts;

    });

    cordova.define("org.apache.cordova.contacts.Contact", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        var argscheck = require('cordova/argscheck'),
            exec = require('cordova/exec'),
            ContactError = require('./ContactError'),
            utils = require('cordova/utils');

        /**
         * Converts primitives into Complex Object
         * Currently only used for Date fields
         */
        function convertIn(contact) {
            var value = contact.birthday;
            try {
                contact.birthday = new Date(parseFloat(value));
            } catch (exception) {
                console.log("Cordova Contact convertIn error: exception creating date.");
            }
            return contact;
        }

        /**
         * Converts Complex objects into primitives
         * Only conversion at present is for Dates.
         **/

        function convertOut(contact) {
            var value = contact.birthday;
            if (value !== null) {
                // try to make it a Date object if it is not already
                if (!utils.isDate(value)) {
                    try {
                        value = new Date(value);
                    } catch (exception) {
                        value = null;
                    }
                }
                if (utils.isDate(value)) {
                    value = value.valueOf(); // convert to milliseconds
                }
                contact.birthday = value;
            }
            return contact;
        }

        /**
         * Contains information about a single contact.
         * @constructor
         * @param {DOMString} id unique identifier
         * @param {DOMString} displayName
         * @param {ContactName} name
         * @param {DOMString} nickname
         * @param {Array.<ContactField>} phoneNumbers array of phone numbers
         * @param {Array.<ContactField>} emails array of email addresses
         * @param {Array.<ContactAddress>} addresses array of addresses
         * @param {Array.<ContactField>} ims instant messaging user ids
         * @param {Array.<ContactOrganization>} organizations
         * @param {DOMString} birthday contact's birthday
         * @param {DOMString} note user notes about contact
         * @param {Array.<ContactField>} photos
         * @param {Array.<ContactField>} categories
         * @param {Array.<ContactField>} urls contact's web sites
         */
        var Contact = function (id, displayName, name, nickname, phoneNumbers, emails, addresses,
                                ims, organizations, birthday, note, photos, categories, urls) {
            this.id = id || null;
            this.rawId = null;
            this.displayName = displayName || null;
            this.name = name || null; // ContactName
            this.nickname = nickname || null;
            this.phoneNumbers = phoneNumbers || null; // ContactField[]
            this.emails = emails || null; // ContactField[]
            this.addresses = addresses || null; // ContactAddress[]
            this.ims = ims || null; // ContactField[]
            this.organizations = organizations || null; // ContactOrganization[]
            this.birthday = birthday || null;
            this.note = note || null;
            this.photos = photos || null; // ContactField[]
            this.categories = categories || null; // ContactField[]
            this.urls = urls || null; // ContactField[]
        };

        /**
         * Removes contact from device storage.
         * @param successCB success callback
         * @param errorCB error callback
         */
        Contact.prototype.remove = function (successCB, errorCB) {
            argscheck.checkArgs('FF', 'Contact.remove', arguments);
            var fail = errorCB && function (code) {
                    errorCB(new ContactError(code));
                };
            if (this.id === null) {
                fail(ContactError.UNKNOWN_ERROR);
            }
            else {
                exec(successCB, fail, "Contacts", "remove", [this.id]);
            }
        };

        /**
         * Creates a deep copy of this Contact.
         * With the contact ID set to null.
         * @return copy of this Contact
         */
        Contact.prototype.clone = function () {
            var clonedContact = utils.clone(this);
            clonedContact.id = null;
            clonedContact.rawId = null;

            function nullIds(arr) {
                if (arr) {
                    for (var i = 0; i < arr.length; ++i) {
                        arr[i].id = null;
                    }
                }
            }

            // Loop through and clear out any id's in phones, emails, etc.
            nullIds(clonedContact.phoneNumbers);
            nullIds(clonedContact.emails);
            nullIds(clonedContact.addresses);
            nullIds(clonedContact.ims);
            nullIds(clonedContact.organizations);
            nullIds(clonedContact.categories);
            nullIds(clonedContact.photos);
            nullIds(clonedContact.urls);
            return clonedContact;
        };

        /**
         * Persists contact to device storage.
         * @param successCB success callback
         * @param errorCB error callback
         */
        Contact.prototype.save = function (successCB, errorCB) {
            argscheck.checkArgs('FFO', 'Contact.save', arguments);
            var fail = errorCB && function (code) {
                    errorCB(new ContactError(code));
                };
            var success = function (result) {
                if (result) {
                    if (successCB) {
                        var fullContact = require('./contacts').create(result);
                        successCB(convertIn(fullContact));
                    }
                }
                else {
                    // no Entry object returned
                    fail(ContactError.UNKNOWN_ERROR);
                }
            };
            var dupContact = convertOut(utils.clone(this));
            exec(success, fail, "Contacts", "save", [dupContact]);
        };


        module.exports = Contact;

    });

    cordova.define("org.apache.cordova.contacts.ContactAddress", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        /**
         * Contact address.
         * @constructor
         * @param {DOMString} id unique identifier, should only be set by native code
         * @param formatted // NOTE: not a W3C standard
         * @param streetAddress
         * @param locality
         * @param region
         * @param postalCode
         * @param country
         */

        var ContactAddress = function (pref, type, formatted, streetAddress, locality, region, postalCode, country) {
            this.id = null;
            this.pref = (typeof pref != 'undefined' ? pref : false);
            this.type = type || null;
            this.formatted = formatted || null;
            this.streetAddress = streetAddress || null;
            this.locality = locality || null;
            this.region = region || null;
            this.postalCode = postalCode || null;
            this.country = country || null;
        };

        module.exports = ContactAddress;

    });

    cordova.define("org.apache.cordova.contacts.ContactError", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        /**
         *  ContactError.
         *  An error code assigned by an implementation when an error has occurred
         * @constructor
         */
        var ContactError = function (err) {
            this.code = (typeof err != 'undefined' ? err : null);
        };

        /**
         * Error codes
         */
        ContactError.UNKNOWN_ERROR = 0;
        ContactError.INVALID_ARGUMENT_ERROR = 1;
        ContactError.TIMEOUT_ERROR = 2;
        ContactError.PENDING_OPERATION_ERROR = 3;
        ContactError.IO_ERROR = 4;
        ContactError.NOT_SUPPORTED_ERROR = 5;
        ContactError.PERMISSION_DENIED_ERROR = 20;

        module.exports = ContactError;

    });

    cordova.define("org.apache.cordova.contacts.ContactField", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        /**
         * Generic contact field.
         * @constructor
         * @param {DOMString} id unique identifier, should only be set by native code // NOTE: not a W3C standard
         * @param type
         * @param value
         * @param pref
         */
        var ContactField = function (type, value, pref) {
            this.id = null;
            this.type = (type && type.toString()) || null;
            this.value = (value && value.toString()) || null;
            this.pref = (typeof pref != 'undefined' ? pref : false);
        };

        module.exports = ContactField;

    });

    cordova.define("org.apache.cordova.contacts.ContactFindOptions", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        /**
         * ContactFindOptions.
         * @constructor
         * @param filter used to match contacts against
         * @param multiple boolean used to determine if more than one contact should be returned
         */

        var ContactFindOptions = function (filter, multiple, desiredFields) {
            this.filter = filter || '';
            this.multiple = (typeof multiple != 'undefined' ? multiple : false);
            this.desiredFields = typeof desiredFields != 'undefined' ? desiredFields : [];
        };

        module.exports = ContactFindOptions;

    });

    cordova.define("org.apache.cordova.contacts.ContactName", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        /**
         * Contact name.
         * @constructor
         * @param formatted // NOTE: not part of W3C standard
         * @param familyName
         * @param givenName
         * @param middle
         * @param prefix
         * @param suffix
         */
        var ContactName = function (formatted, familyName, givenName, middle, prefix, suffix) {
            this.formatted = formatted || null;
            this.familyName = familyName || null;
            this.givenName = givenName || null;
            this.middleName = middle || null;
            this.honorificPrefix = prefix || null;
            this.honorificSuffix = suffix || null;
        };

        module.exports = ContactName;

    });

    cordova.define("org.apache.cordova.contacts.ContactOrganization", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        /**
         * Contact organization.
         * @constructor
         * @param {DOMString} id unique identifier, should only be set by native code // NOTE: not a W3C standard
         * @param name
         * @param dept
         * @param title
         * @param startDate
         * @param endDate
         * @param location
         * @param desc
         */

        var ContactOrganization = function (pref, type, name, dept, title) {
            this.id = null;
            this.pref = (typeof pref != 'undefined' ? pref : false);
            this.type = type || null;
            this.name = name || null;
            this.department = dept || null;
            this.title = title || null;
        };

        module.exports = ContactOrganization;

    });

    cordova.define("org.apache.cordova.contacts.ContactFieldType", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        // Possible field names for various platforms.
        // Some field names are platform specific

        var fieldType = {
            addresses: "addresses",
            birthday: "birthday",
            categories: "categories",
            country: "country",
            department: "department",
            displayName: "displayName",
            emails: "emails",
            familyName: "familyName",
            formatted: "formatted",
            givenName: "givenName",
            honorificPrefix: "honorificPrefix",
            honorificSuffix: "honorificSuffix",
            id: "id",
            ims: "ims",
            locality: "locality",
            middleName: "middleName",
            name: "name",
            nickname: "nickname",
            note: "note",
            organizations: "organizations",
            phoneNumbers: "phoneNumbers",
            photos: "photos",
            postalCode: "postalCode",
            region: "region",
            streetAddress: "streetAddress",
            title: "title",
            urls: "urls"
        };

        module.exports = fieldType;

    });

    cordova.define("org.apache.cordova.media-capture.CaptureAudioOptions", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        /**
         * Encapsulates all audio capture operation configuration options.
         */
        var CaptureAudioOptions = function () {
            // Upper limit of sound clips user can record. Value must be equal or greater than 1.
            this.limit = 1;
            // Maximum duration of a single sound clip in seconds.
            this.duration = 0;
        };

        module.exports = CaptureAudioOptions;

    });

    cordova.define("org.apache.cordova.media-capture.CaptureImageOptions", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        /**
         * Encapsulates all image capture operation configuration options.
         */
        var CaptureImageOptions = function () {
            // Upper limit of images user can take. Value must be equal or greater than 1.
            this.limit = 1;
        };

        module.exports = CaptureImageOptions;

    });

    cordova.define("org.apache.cordova.media-capture.CaptureVideoOptions", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        /**
         * Encapsulates all video capture operation configuration options.
         */
        var CaptureVideoOptions = function () {
            // Upper limit of videos user can record. Value must be equal or greater than 1.
            this.limit = 1;
            // Maximum duration of a single video clip in seconds.
            this.duration = 0;
        };

        module.exports = CaptureVideoOptions;

    });

    cordova.define("org.apache.cordova.media-capture.CaptureError", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        /**
         * The CaptureError interface encapsulates all errors in the Capture API.
         */
        var CaptureError = function (c) {
            this.code = c || null;
        };

// Camera or microphone failed to capture image or sound.
        CaptureError.CAPTURE_INTERNAL_ERR = 0;
// Camera application or audio capture application is currently serving other capture request.
        CaptureError.CAPTURE_APPLICATION_BUSY = 1;
// Invalid use of the API (e.g. limit parameter has value less than one).
        CaptureError.CAPTURE_INVALID_ARGUMENT = 2;
// User exited camera application or audio capture application before capturing anything.
        CaptureError.CAPTURE_NO_MEDIA_FILES = 3;
// The requested capture operation is not supported.
        CaptureError.CAPTURE_NOT_SUPPORTED = 20;

        module.exports = CaptureError;

    });

    cordova.define("org.apache.cordova.media-capture.MediaFileData", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        /**
         * MediaFileData encapsulates format information of a media file.
         *
         * @param {DOMString} codecs
         * @param {long} bitrate
         * @param {long} height
         * @param {long} width
         * @param {float} duration
         */
        var MediaFileData = function (codecs, bitrate, height, width, duration) {
            this.codecs = codecs || null;
            this.bitrate = bitrate || 0;
            this.height = height || 0;
            this.width = width || 0;
            this.duration = duration || 0;
        };

        module.exports = MediaFileData;

    });

    cordova.define("org.apache.cordova.media-capture.MediaFile", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        var utils = require('cordova/utils'),
            exec = require('cordova/exec'),
            File = require('org.apache.cordova.file.File'),
            CaptureError = require('./CaptureError');
        /**
         * Represents a single file.
         *
         * name {DOMString} name of the file, without path information
         * fullPath {DOMString} the full path of the file, including the name
         * type {DOMString} mime type
         * lastModifiedDate {Date} last modified date
         * size {Number} size of the file in bytes
         */
        var MediaFile = function (name, localURL, type, lastModifiedDate, size) {
            MediaFile.__super__.constructor.apply(this, arguments);
        };

        utils.extend(MediaFile, File);

        /**
         * Request capture format data for a specific file and type
         *
         * @param {Function} successCB
         * @param {Function} errorCB
         */
        MediaFile.prototype.getFormatData = function (successCallback, errorCallback) {
            if (typeof this.fullPath === "undefined" || this.fullPath === null) {
                errorCallback(new CaptureError(CaptureError.CAPTURE_INVALID_ARGUMENT));
            } else {
                exec(successCallback, errorCallback, "Capture", "getFormatData", [this.localURL, this.type]);
            }
        };

        module.exports = MediaFile;

    });

    cordova.define("org.apache.cordova.media-capture.capture", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        var exec = require('cordova/exec'),
            MediaFile = require('./MediaFile');

        /**
         * Launches a capture of different types.
         *
         * @param (DOMString} type
         * @param {Function} successCB
         * @param {Function} errorCB
         * @param {CaptureVideoOptions} options
         */
        function _capture(type, successCallback, errorCallback, options) {
            var win = function (pluginResult) {
                var mediaFiles = [];
                var i;
                for (i = 0; i < pluginResult.length; i++) {
                    var mediaFile = new MediaFile();
                    mediaFile.name = pluginResult[i].name;

                    // Backwards compatibility
                    mediaFile.localURL = pluginResult[i].localURL || pluginResult[i].fullPath;
                    mediaFile.fullPath = pluginResult[i].fullPath;
                    mediaFile.type = pluginResult[i].type;
                    mediaFile.lastModifiedDate = pluginResult[i].lastModifiedDate;
                    mediaFile.size = pluginResult[i].size;
                    mediaFiles.push(mediaFile);
                }
                successCallback(mediaFiles);
            };
            exec(win, errorCallback, "Capture", type, [options]);
        }

        /**
         * The Capture interface exposes an interface to the camera and microphone of the hosting device.
         */
        function Capture() {
            this.supportedAudioModes = [];
            this.supportedImageModes = [];
            this.supportedVideoModes = [];
        }

        /**
         * Launch audio recorder application for recording audio clip(s).
         *
         * @param {Function} successCB
         * @param {Function} errorCB
         * @param {CaptureAudioOptions} options
         */
        Capture.prototype.captureAudio = function (successCallback, errorCallback, options) {
            _capture("captureAudio", successCallback, errorCallback, options);
        };

        /**
         * Launch camera application for taking image(s).
         *
         * @param {Function} successCB
         * @param {Function} errorCB
         * @param {CaptureImageOptions} options
         */
        Capture.prototype.captureImage = function (successCallback, errorCallback, options) {
            _capture("captureImage", successCallback, errorCallback, options);
        };

        /**
         * Launch device camera application for recording video(s).
         *
         * @param {Function} successCB
         * @param {Function} errorCB
         * @param {CaptureVideoOptions} options
         */
        Capture.prototype.captureVideo = function (successCallback, errorCallback, options) {
            _capture("captureVideo", successCallback, errorCallback, options);
        };


        module.exports = new Capture();

    });

    cordova.define("org.apache.cordova.media.MediaError", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        /**
         * This class contains information about any Media errors.
         */
        /*
         According to :: http://dev.w3.org/html5/spec-author-view/video.html#mediaerror
         We should never be creating these objects, we should just implement the interface
         which has 1 property for an instance, 'code'

         instead of doing :
         errorCallbackFunction( new MediaError(3,'msg') );
         we should simply use a literal :
         errorCallbackFunction( {'code':3} );
         */

        var _MediaError = window.MediaError;


        if (!_MediaError) {
            window.MediaError = _MediaError = function (code, msg) {
                this.code = (typeof code != 'undefined') ? code : null;
                this.message = msg || ""; // message is NON-standard! do not use!
            };
        }

        _MediaError.MEDIA_ERR_NONE_ACTIVE = _MediaError.MEDIA_ERR_NONE_ACTIVE || 0;
        _MediaError.MEDIA_ERR_ABORTED = _MediaError.MEDIA_ERR_ABORTED || 1;
        _MediaError.MEDIA_ERR_NETWORK = _MediaError.MEDIA_ERR_NETWORK || 2;
        _MediaError.MEDIA_ERR_DECODE = _MediaError.MEDIA_ERR_DECODE || 3;
        _MediaError.MEDIA_ERR_NONE_SUPPORTED = _MediaError.MEDIA_ERR_NONE_SUPPORTED || 4;
// TODO: MediaError.MEDIA_ERR_NONE_SUPPORTED is legacy, the W3 spec now defines it as below.
// as defined by http://dev.w3.org/html5/spec-author-view/video.html#error-codes
        _MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED = _MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED || 4;

        module.exports = _MediaError;

    });

    cordova.define("org.apache.cordova.media.Media", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        var argscheck = require('cordova/argscheck'),
            utils = require('cordova/utils'),
            exec = require('cordova/exec');

        var mediaObjects = {};

        /**
         * This class provides access to the device media, interfaces to both sound and video
         *
         * @constructor
         * @param src                   The file name or url to play
         * @param successCallback       The callback to be called when the file is done playing or recording.
         *                                  successCallback()
         * @param errorCallback         The callback to be called if there is an error.
         *                                  errorCallback(int errorCode) - OPTIONAL
         * @param statusCallback        The callback to be called when media status has changed.
         *                                  statusCallback(int statusCode) - OPTIONAL
         */
        var Media = function (src, successCallback, errorCallback, statusCallback) {
            argscheck.checkArgs('SFFF', 'Media', arguments);
            this.id = utils.createUUID();
            mediaObjects[this.id] = this;
            this.src = src;
            this.successCallback = successCallback;
            this.errorCallback = errorCallback;
            this.statusCallback = statusCallback;
            this._duration = -1;
            this._position = -1;
            exec(null, this.errorCallback, "Media", "create", [this.id, this.src]);
        };

// Media messages
        Media.MEDIA_STATE = 1;
        Media.MEDIA_DURATION = 2;
        Media.MEDIA_POSITION = 3;
        Media.MEDIA_ERROR = 9;

// Media states
        Media.MEDIA_NONE = 0;
        Media.MEDIA_STARTING = 1;
        Media.MEDIA_RUNNING = 2;
        Media.MEDIA_PAUSED = 3;
        Media.MEDIA_STOPPED = 4;
        Media.MEDIA_MSG = ["None", "Starting", "Running", "Paused", "Stopped"];

// "static" function to return existing objs.
        Media.get = function (id) {
            return mediaObjects[id];
        };

        /**
         * Start or resume playing audio file.
         */
        Media.prototype.play = function (options) {
            exec(null, null, "Media", "startPlayingAudio", [this.id, this.src, options]);
        };

        /**
         * Stop playing audio file.
         */
        Media.prototype.stop = function () {
            var me = this;
            exec(function () {
                me._position = 0;
            }, this.errorCallback, "Media", "stopPlayingAudio", [this.id]);
        };

        /**
         * Seek or jump to a new time in the track..
         */
        Media.prototype.seekTo = function (milliseconds) {
            var me = this;
            exec(function (p) {
                me._position = p;
            }, this.errorCallback, "Media", "seekToAudio", [this.id, milliseconds]);
        };

        /**
         * Pause playing audio file.
         */
        Media.prototype.pause = function () {
            exec(null, this.errorCallback, "Media", "pausePlayingAudio", [this.id]);
        };

        /**
         * Get duration of an audio file.
         * The duration is only set for audio that is playing, paused or stopped.
         *
         * @return      duration or -1 if not known.
         */
        Media.prototype.getDuration = function () {
            return this._duration;
        };

        /**
         * Get position of audio.
         */
        Media.prototype.getCurrentPosition = function (success, fail) {
            var me = this;
            exec(function (p) {
                me._position = p;
                success(p);
            }, fail, "Media", "getCurrentPositionAudio", [this.id]);
        };

        /**
         * Start recording audio file.
         */
        Media.prototype.startRecord = function () {
            exec(null, this.errorCallback, "Media", "startRecordingAudio", [this.id, this.src]);
        };

        /**
         * Stop recording audio file.
         */
        Media.prototype.stopRecord = function () {
            exec(null, this.errorCallback, "Media", "stopRecordingAudio", [this.id]);
        };

        /**
         * Release the resources.
         */
        Media.prototype.release = function () {
            exec(null, this.errorCallback, "Media", "release", [this.id]);
        };

        /**
         * Adjust the volume.
         */
        Media.prototype.setVolume = function (volume) {
            exec(null, null, "Media", "setVolume", [this.id, volume]);
        };

        /**
         * Audio has status update.
         * PRIVATE
         *
         * @param id            The media object id (string)
         * @param msgType       The 'type' of update this is
         * @param value         Use of value is determined by the msgType
         */
        Media.onStatus = function (id, msgType, value) {

            var media = mediaObjects[id];

            if (media) {
                switch (msgType) {
                    case Media.MEDIA_STATE :
                        media.statusCallback && media.statusCallback(value);
                        if (value == Media.MEDIA_STOPPED) {
                            media.successCallback && media.successCallback();
                        }
                        break;
                    case Media.MEDIA_DURATION :
                        media._duration = value;
                        break;
                    case Media.MEDIA_ERROR :
                        media.errorCallback && media.errorCallback(value);
                        break;
                    case Media.MEDIA_POSITION :
                        media._position = Number(value);
                        break;
                    default :
                        console.error && console.error("Unhandled Media.onStatus :: " + msgType);
                        break;
                }
            }
            else {
                console.error && console.error("Received Media.onStatus callback for unknown media :: " + id);
            }

        };

        module.exports = Media;

    });

    cordova.define("com.archibus.plugins.dbcredential.keychain", function (require, exports, module) {
        var exec = require('cordova/exec');

        var Keychain = {
            setSqlitePassphrase: function (password, success, error) {
                exec(success, error, 'DbCredential', 'setSqlitePassphrase', [password]);
            }
        };

        module.exports = Keychain;


    });

    cordova.define("com.archibus.plugins.appversion.AppVersion", function (require, exports, module) {
        var exec = require('cordova/exec');


        var AppVersion = {
            getAppVersion: function (success, error) {
                exec(success, error, 'AppVersion', 'getAppVersion', []);
            }
        };

        module.exports = AppVersion;
    });


    cordova.define('com.archibus.plugins.textarea.TextArea', function (require, exports, module) {

        var exec = require('cordova/exec');
        var TextArea = {
            openTextArea: function (text, maxCharacters, readOnly, success, failure) {
                if (!maxCharacters) {
                    maxCharacters = 5000;
                }
                if (readOnly === 'undefined') {
                    readOnly = false;
                }
                cordova.exec(success, failure, "TextArea", "showTextView", [text, maxCharacters, readOnly]);
            }
        };
        module.exports = TextArea;
    });

    cordova.define('com.archibus.plugins.registration.Registration', function(require, exports, module) {

        var exec = require('cordova/exec');
        var Registration = {
            displayRegistrationView: function(errorMessage, success, failure) {
                if(!errorMessage) {
                    errorMessage = '';
                }
                cordova.exec(success, failure, "Registration", "showRegistrationView", [errorMessage]);
            }
        };
        module.exports = Registration;
    });

    cordova.define("org.apache.cordova.file-transfer.FileTransferError", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        /**
         * FileTransferError
         * @constructor
         */
        var FileTransferError = function (code, source, target, status, body, exception) {
            this.code = code || null;
            this.source = source || null;
            this.target = target || null;
            this.http_status = status || null;
            this.body = body || null;
            this.exception = exception || null;
        };

        FileTransferError.FILE_NOT_FOUND_ERR = 1;
        FileTransferError.INVALID_URL_ERR = 2;
        FileTransferError.CONNECTION_ERR = 3;
        FileTransferError.ABORT_ERR = 4;
        FileTransferError.NOT_MODIFIED_ERR = 5;

        module.exports = FileTransferError;

    });

    cordova.define("org.apache.cordova.file-transfer.FileTransfer", function (require, exports, module) { /*
     *
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     * KIND, either express or implied.  See the License for the
     * specific language governing permissions and limitations
     * under the License.
     *
     */

        var argscheck = require('cordova/argscheck'),
            exec = require('cordova/exec'),
            FileTransferError = require('./FileTransferError'),
            ProgressEvent = require('org.apache.cordova.file.ProgressEvent');

        function newProgressEvent(result) {
            var pe = new ProgressEvent();
            pe.lengthComputable = result.lengthComputable;
            pe.loaded = result.loaded;
            pe.total = result.total;
            return pe;
        }

        function getUrlCredentials(urlString) {
            var credentialsPattern = /^http\:\/\/((.*?)\:(.*?))@.*$/g,
                credentials = credentialsPattern.exec(urlString);

            return credentials && credentials[1];
        }

        function getBasicAuthHeader(urlString) {
            var header = null;


            // This is changed due to MS Windows doesn't support credentials in http uris
            // so we detect them by regexp and strip off from result url
            // Proof: http://social.msdn.microsoft.com/Forums/windowsapps/en-US/a327cf3c-f033-4a54-8b7f-03c56ba3203f/windows-foundation-uri-security-problem

            if (window.btoa) {
                var credentials = getUrlCredentials(urlString);
                if (credentials) {
                    var authHeader = "Authorization";
                    var authHeaderValue = "Basic " + window.btoa(credentials);

                    header = {
                        name: authHeader,
                        value: authHeaderValue
                    };
                }
            }

            return header;
        }

        var idCounter = 0;

        /**
         * FileTransfer uploads a file to a remote server.
         * @constructor
         */
        var FileTransfer = function () {
            this._id = ++idCounter;
            this.onprogress = null; // optional callback
        };

        /**
         * Given an absolute file path, uploads a file on the device to a remote server
         * using a multipart HTTP request.
         * @param filePath {String}           Full path of the file on the device
         * @param server {String}             URL of the server to receive the file
         * @param successCallback (Function}  Callback to be invoked when upload has completed
         * @param errorCallback {Function}    Callback to be invoked upon error
         * @param options {FileUploadOptions} Optional parameters such as file name and mimetype
         * @param trustAllHosts {Boolean} Optional trust all hosts (e.g. for self-signed certs), defaults to false
         */
        FileTransfer.prototype.upload = function (filePath, server, successCallback, errorCallback, options, trustAllHosts) {
            argscheck.checkArgs('ssFFO*', 'FileTransfer.upload', arguments);
            // check for options
            var fileKey = null;
            var fileName = null;
            var mimeType = null;
            var params = null;
            var chunkedMode = true;
            var headers = null;
            var httpMethod = null;
            var basicAuthHeader = getBasicAuthHeader(server);
            if (basicAuthHeader) {
                server = server.replace(getUrlCredentials(server) + '@', '');

                options = options || {};
                options.headers = options.headers || {};
                options.headers[basicAuthHeader.name] = basicAuthHeader.value;
            }

            if (options) {
                fileKey = options.fileKey;
                fileName = options.fileName;
                mimeType = options.mimeType;
                headers = options.headers;
                httpMethod = options.httpMethod || "POST";
                if (httpMethod.toUpperCase() == "PUT") {
                    httpMethod = "PUT";
                } else {
                    httpMethod = "POST";
                }
                if (options.chunkedMode !== null || typeof options.chunkedMode != "undefined") {
                    chunkedMode = options.chunkedMode;
                }
                if (options.params) {
                    params = options.params;
                }
                else {
                    params = {};
                }
            }

            var fail = errorCallback && function (e) {
                    var error = new FileTransferError(e.code, e.source, e.target, e.http_status, e.body, e.exception);
                    errorCallback(error);
                };

            var self = this;
            var win = function (result) {
                if (typeof result.lengthComputable != "undefined") {
                    if (self.onprogress) {
                        self.onprogress(newProgressEvent(result));
                    }
                } else {
                    successCallback && successCallback(result);
                }
            };
            exec(win, fail, 'FileTransfer', 'upload', [filePath, server, fileKey, fileName, mimeType, params, trustAllHosts, chunkedMode, headers, this._id, httpMethod]);
        };

        /**
         * Downloads a file form a given URL and saves it to the specified directory.
         * @param source {String}          URL of the server to receive the file
         * @param target {String}         Full path of the file on the device
         * @param successCallback (Function}  Callback to be invoked when upload has completed
         * @param errorCallback {Function}    Callback to be invoked upon error
         * @param trustAllHosts {Boolean} Optional trust all hosts (e.g. for self-signed certs), defaults to false
         * @param options {FileDownloadOptions} Optional parameters such as headers
         */
        FileTransfer.prototype.download = function (source, target, successCallback, errorCallback, trustAllHosts, options) {
            argscheck.checkArgs('ssFF*', 'FileTransfer.download', arguments);
            var self = this;

            var basicAuthHeader = getBasicAuthHeader(source);
            if (basicAuthHeader) {
                source = source.replace(getUrlCredentials(source) + '@', '');

                options = options || {};
                options.headers = options.headers || {};
                options.headers[basicAuthHeader.name] = basicAuthHeader.value;
            }

            var headers = null;
            if (options) {
                headers = options.headers || null;
            }

            var win = function (result) {
                if (typeof result.lengthComputable != "undefined") {
                    if (self.onprogress) {
                        return self.onprogress(newProgressEvent(result));
                    }
                } else if (successCallback) {
                    var entry = null;
                    if (result.isDirectory) {
                        entry = new (require('org.apache.cordova.file.DirectoryEntry'))();
                    }
                    else if (result.isFile) {
                        entry = new (require('org.apache.cordova.file.FileEntry'))();
                    }
                    entry.isDirectory = result.isDirectory;
                    entry.isFile = result.isFile;
                    entry.name = result.name;
                    entry.fullPath = result.fullPath;
                    entry.filesystem = new FileSystem(result.filesystemName || (result.filesystem == window.PERSISTENT ? 'persistent' : 'temporary'));
                    entry.nativeURL = result.nativeURL;
                    successCallback(entry);
                }
            };

            var fail = errorCallback && function (e) {
                    var error = new FileTransferError(e.code, e.source, e.target, e.http_status, e.body, e.exception);
                    errorCallback(error);
                };

            exec(win, fail, 'FileTransfer', 'download', [source, target, trustAllHosts, this._id, headers]);
        };

        /**
         * Aborts the ongoing file transfer on this object. The original error
         * callback for the file transfer will be called if necessary.
         */
        FileTransfer.prototype.abort = function () {
            exec(null, null, 'FileTransfer', 'abort', [this._id]);
        };

        module.exports = FileTransfer;

    });

//insert packages here
    require('cordova/init');

})();