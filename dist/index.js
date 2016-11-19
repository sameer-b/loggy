'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Loggy = function () {
    function Loggy() {
        _classCallCheck(this, Loggy);

        this.config = {
            storeLogServiceUrl: '',
            alertLog: false,
            logReportFrequency: { limit: 1, timer: 0 },
            logSeverityLevel: 1,
            consoleLog: true,
            clearAfterSend: true,
            alertIfNoService: false,
            lsLogging: true,
            lsKey: 'Loggy'
        };

        /**
         * The array of logged objects
         * @private
         */
        this._logs = [];

        /**
         * Is the log level used for the configuration
         * @type {object}
         * @property {number} DEBUG - Constant to define a type of log used for debugging purposes
         * @property {number} LOG - Constant to define a type of log as a simple log
         * @property {number} INFO - Constant to define a ytpe of log as an info log
         * @property {number} WARN - Constant to define a type of log as a warning log
         * @property {number} ERROR - Constant to define a type of log as an error log
         * @property {number} OFF - Constant to define the 'no-log' level
         */
        this.level = {
            DEBUG: 5,
            LOG: 4,
            INFO: 3,
            WARN: 2,
            ERROR: 1,
            OFF: 0
        };
    }

    /**
     * Set a custom logger config
     * @memberOf Loggy
     * @param {object} customConfig - is the custom config object
     */


    _createClass(Loggy, [{
        key: 'setConfig',
        value: function setConfig(customConfig) {
            if (customConfig) {
                for (var prop in customConfig) {
                    if (customConfig.hasOwnProperty(prop) && this.config.hasOwnProperty(prop)) {
                        this.config[prop] = customConfig[prop];
                    }
                }
            }
        }

        /**
         * This function generate a user readable timestamp
         * @private
         * @memberOf Loggy
         * @returns {String} - is the stringified timestamp
         */

    }, {
        key: 'getTimeStamp',
        value: function getTimeStamp() {
            var currentdate = new Date();
            return currentdate.getFullYear() + '-' + (currentdate.getMonth() + 1) + '-' + currentdate.getDate() + ' ' + currentdate.getHours() + ':' + currentdate.getMinutes() + ':' + currentdate.getSeconds() + '.' + currentdate.getMilliseconds();
        }

        /**
         * This function transform a log object into a string
         * @private
         * @memberOf Loggy
         * @param {Object} logObj - is the log object
         * @returns {String} - is the stringified logObj
         */

    }, {
        key: 'logToString',
        value: function logToString(logObj) {
            return logObj.msg;
        }

        /**
         * Log in the browser's console.
         * and if the console logging was activated in the configuration.
         * @private
         * @memberOf Loggy
         * @param {object} logObj - is the object which contains the log message, type,...
         * @param {object} browserConsole - Original browser console
         */

    }, {
        key: 'consoleLogging',
        value: function consoleLogging(logObj, browserConsole) {
            if (browserConsole && this.config.consoleLog) {
                var logMsg = this.logToString(logObj);
                switch (logObj.logSeverityLevel) {
                    case this.level.DEBUG:
                        browserConsole.debug(logMsg);
                        break;
                    case this.level.LOG:
                        browserConsole.log(logMsg);
                        break;
                    case this.level.INFO:
                        browserConsole.info(logMsg);
                        break;
                    case this.level.WARN:
                        browserConsole.warn(logMsg);
                        break;
                    case this.level.ERROR:
                        browserConsole.error(logMsg);
                        break;
                    default:
                        break;
                }
            }
        }

        /**
         * The httpRequestManager is a simple interface to send the log to the server.
         * @param {String} hostUrl - is the url to the service that will store the logs
         * @param {object} successCallback - is the callback function to call on success
         * @param {object} errorCallback - is the callback function to call on error
         */

    }, {
        key: '_logCommunicator',
        value: function _logCommunicator(hostUrl, successCallback, errorCallback) {
            /* global XMLHttpRequest */
            var http = new XMLHttpRequest();
            http.open('POST', hostUrl, true);
            http.setRequestHeader('Content-type', 'application/json');

            http.onreadystatechange = function () {
                if (http.readyState === 4) {
                    if (http.status >= 200 && http.status < 400) {
                        successCallback && successCallback();
                    } else {
                        errorCallback && errorCallback();
                    }
                }
            };
            http.send(JSON.stringify(this._logs));
        }
    }, {
        key: 'sendLogToWS',
        value: function sendLogToWS() {
            function successCallback() {
                if (this.config.clearAfterSend) {
                    this.clear();
                    this._localStoreManager().clearLogs();
                }
            }
            this._logCommunicator(this.config.storeLogServiceUrl, successCallback);
        }

        /**
         *
         * @returns {Object} Local storage manager
         */

    }, {
        key: '_localStoreManager',
        value: function _localStoreManager() {
            return {
                isLocalStorageSupported: !!window.localStorage,
                lsKey: this.config.lsKey,
                storeLogs: function storeLogs(logs) {
                    if (this.isLocalStorageSupported) {
                        if (!Array.isArray(logs)) {
                            logs = [logs];
                        }
                        /* global localStorage */
                        localStorage.setItem(this.lsKey, JSON.stringify(logs));
                    }
                },
                getLogs: function getLogs() {
                    if (this.isLocalStorageSupported) {
                        /* global localStorage */
                        return JSON.parse(localStorage.getItem(this.lsKey));
                    }
                },
                clearLogs: function clearLogs() {
                    if (this.isLocalStorageSupported) {
                        /* global localStorage */
                        localStorage.removeItem(this.lsKey);
                    }
                }
            };
        }

        /**
         * This function clears the logs array in memory
         * @param {number} [limit] - is the limit of records to delete starting at the first element. Should be a number from 1 to Infinity. If not setted, full log array is cleared
         */

    }, {
        key: 'clear',
        value: function clear(limit) {
            if (typeof limit === 'number') {
                this._logs.splice(0, limit - 1);
            } else {
                this._logs = [];
            }
        }

        /**
         * Generate a log object from a passed log
         * @private
         * @memberOf Loggy
         * @param {number} logLevel - is the number according to the log severity level constants (ex: level.LOG, level.DEBUG)
         * @param {string} msg - is the message of the log
         * @returns {object} is the log object constructed
         */

    }, {
        key: 'toLogObj',
        value: function toLogObj(logLevel, msg) {
            var logObj = {
                timestamp: this.getTimeStamp()
            };
            if ((typeof msg === 'undefined' ? 'undefined' : _typeof(msg)) === 'object' && msg.message) {
                logObj.msg = msg.message;
                logObj.stack = msg.stack;
                logObj.logSeverityLevel = this.level.ERROR;
            } else if (typeof msg === 'string') {
                logObj.msg = msg;
                logObj.stack = '';
                logObj.logSeverityLevel = logLevel;
            } else {
                logObj.msg = JSON.stringify(msg);
                logObj.stack = '';
                logObj.logSeverityLevel = logLevel;
            }
            return logObj;
        }

        /**
         * Handle the log request called by the application and dispatch it to the different logging features
         * @private
         * @memberOf Loggy
         * @param {object} logObj - is the log object to dispatch
         * @param {object} browserConsole - Original browser console
         */

    }, {
        key: 'handleNewLog',
        value: function handleNewLog(logObj, browserConsole) {
            if (logObj.logSeverityLevel >= this.config.logSeverityLevel) {
                this.consoleLogging(logObj, browserConsole);
                this._logs.push(logObj);

                if (this.config.lsLogging) {
                    this._localStoreManager().storeLogs(logObj);
                }
            }
        }

        /**
         * Log a debug trace
         * @memberOf Loggy
         * @param {String} msg - is the message to log
         * @param {object} browserConsole - Original browser console
         */

    }, {
        key: 'debug',
        value: function debug(msg, browserConsole) {
            this.handleNewLog(this.toLogObj(this.level.DEBUG, msg), browserConsole);
        }
        /**
         * Log a message
         * @memberOf Loggy
         * @param {String} msg - is the message to log
         * @param {object} browserConsole - Original browser console
         */

    }, {
        key: 'log',
        value: function log(msg, browserConsole) {
            this.handleNewLog(this.toLogObj(this.level.LOG, msg), browserConsole);
        }
        /**
         * Log a information
         * @memberOf Loggy
         * @param {String} msg - is the message to log
         * @param {object} browserConsole - Original browser console
         */

    }, {
        key: 'info',
        value: function info(msg, browserConsole) {
            this.handleNewLog(this.toLogObj(this.level.INFO, msg), browserConsole);
        }
        /**
         * Log a warning
         * @memberOf Loggy
         * @param {String} msg - is the message to log
         * @param {object} browserConsole - Original browser console
         */

    }, {
        key: 'warn',
        value: function warn(msg, browserConsole) {
            this.handleNewLog(this.toLogObj(this.level.WARN, msg), browserConsole);
        }

        /**
         * Log a error
         * @memberOf Loggy
         * @param {String|Object} msg - is the message to log or the exception object
         * @param {object} browserConsole - Original browser console
         */

    }, {
        key: 'error',
        value: function error(msg, browserConsole) {
            this.handleNewLog(this.toLogObj(this.level.ERROR, msg), browserConsole);
        }
        /**
         * Get the stored logs
         * @memberOf Loggy
         * @returns {Array} logs - are the logs
         * @returns {Object} logs[n] - is the log object
         */

    }, {
        key: 'getLogs',
        value: function getLogs() {
            return this._logs;
        }
    }, {
        key: 'init',
        value: function init() {
            /* global window */
            if (window.console && console.log) {
                (function () {
                    var browserConsole = Object.assign({}, console);
                    console.log = function () {
                        this.log(arguments, browserConsole);
                    };
                })();
            }

            if (window.console && console.info) {
                (function () {
                    var browserConsole = Object.assign({}, console);
                    console.info = function () {
                        this.info(arguments, browserConsole);
                    };
                })();
            }

            if (window.console && console.warn) {
                (function () {
                    var browserConsole = Object.assign({}, console);
                    console.warn = function () {
                        this.warn(arguments, browserConsole);
                    };
                })();
            }

            if (window.console && console.error) {
                (function () {
                    var browserConsole = Object.assign({}, console);
                    console.error = function () {
                        this.error(arguments, browserConsole);
                    };
                })();
            }
        }
    }]);

    return Loggy;
}();

exports.default = Loggy;