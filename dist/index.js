'use strict';

/**
 * Loggy is a simple JavaScript Logger that can store logs and send them to a webservice
 *
 * @class
 * @author Loggy
 * @example to use Loggy object, simply call the method from the object and optionnaly set your custom configuration :
 * Loggy.log('hello world');
 */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var Loggy = function () {
    var _self = {};
    /**
     * Loggy version
     * @type {string}
     */
    _self.version = '0.1.0';

    /**
     * Is the default configuration object
     * @type {object}
     */
    var config = {
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
    var _logs = [];

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
    _self.level = {
        DEBUG: 5,
        LOG: 4,
        INFO: 3,
        WARN: 2,
        ERROR: 1,
        OFF: 0
    };

    /**
     * Set a custom logger config
     * @memberOf Loggy
     * @param {object} customConfig - is the custom config object
     */
    _self.setConfig = function (customConfig) {
        if (customConfig) {
            for (var prop in customConfig) {
                if (customConfig.hasOwnProperty(prop) && config.hasOwnProperty(prop)) {
                    config[prop] = customConfig[prop];
                }
            }
        }
    };

    /**
     * This function generate a user readable timestamp
     * @private
     * @memberOf Loggy
     * @returns {String} - is the stringified timestamp
     */
    function getTimeStamp() {
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
    function logToString(logObj) {
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
    function consoleLogging(logObj, browserConsole) {
        if (console && config.consoleLog) {
            var logMsg = logToString(logObj);
            switch (logObj.logSeverityLevel) {
                case _self.level.DEBUG:
                    browserConsole.debug(logMsg);
                    break;
                case _self.level.LOG:
                    browserConsole.log(logMsg);
                    break;
                case _self.level.INFO:
                    browserConsole.info(logMsg);
                    break;
                case _self.level.WARN:
                    browserConsole.warn(logMsg);
                    break;
                case _self.level.ERROR:
                    browserConsole.error(logMsg);
                    break;
                default:
                    break;
            }
        }
    }

    /**
     * LocalStore Manager to store the logs locally
     */
    var _localStoreManager = {
        isLocalStorageSupported: !!window.localStorage,
        lsKey: config.lsKey,
        storeLogs: function storeLogs(logs) {
            if (_self.isLocalStorageSupported) {
                if (!Array.isArray(logs)) {
                    logs = [logs];
                }
                /* global localStorage */
                localStorage.setItem(_self.lsKey, JSON.stringify(logs));
            }
        },
        getLogs: function getLogs() {
            if (_self.isLocalStorageSupported) {
                /* global localStorage */
                return JSON.parse(localStorage.getItem(_self.lsKey));
            }
        },
        clearLogs: function clearLogs() {
            if (_self.isLocalStorageSupported) {
                /* global localStorage */
                localStorage.removeItem(_self.lsKey);
            }
        }
    };

    /**
     * The httpRequestManager is a simple interface to send the log to the server.
     * @param {String} hostUrl - is the url to the service that will store the logs
     * @param {object} successCallback - is the callback function to call on success
     * @param {object} errorCallback - is the callback function to call on error
     */
    function _logCommunicator(hostUrl, successCallback, errorCallback) {
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
        http.send(JSON.stringify(_logs));
    }

    _self.sendLogToWS = function () {
        function successCallback() {
            if (config.clearAfterSend) {
                _self.clear();
                _localStoreManager.clearLogs();
            }
        }
        _logCommunicator(config.storeLogServiceUrl, successCallback);
    };

    /**
     * This function clears the logs array in memory
     * @param {number} [limit] - is the limit of records to delete starting at the first element. Should be a number from 1 to Infinity. If not setted, full log array is cleared
     */
    _self.clear = function (limit) {
        if (typeof limit === 'number') {
            _logs.splice(0, limit - 1);
        } else {
            _logs = [];
        }
    };

    /**
     * Generate a log object from a passed log
     * @private
     * @memberOf Loggy
     * @param {number} logLevel - is the number according to the log severity level constants (ex: level.LOG, level.DEBUG)
     * @param {string} msg - is the message of the log
     * @returns {object} is the log object constructed
     */
    function toLogObj(logLevel, msg) {
        var logObj = {
            timestamp: getTimeStamp()
        };
        if ((typeof msg === 'undefined' ? 'undefined' : _typeof(msg)) === 'object' && msg.message) {
            logObj.msg = msg.message;
            logObj.stack = msg.stack;
            logObj.logSeverityLevel = _self.level.ERROR;
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
    function handleNewLog(logObj, browserConsole) {
        if (logObj.logSeverityLevel >= config.logSeverityLevel) {
            consoleLogging(logObj, browserConsole);
            _logs.push(logObj);

            if (config.lsLogging) {
                _localStoreManager.storeLogs(logObj);
            }
        }
    }

    /**
     * Log a debug trace
     * @memberOf Loggy
     * @param {String} msg - is the message to log
     * @param {object} browserConsole - Original browser console
     */
    _self.debug = function (msg, browserConsole) {
        handleNewLog(toLogObj(_self.level.DEBUG, msg), browserConsole);
    };
    /**
     * Log a message
     * @memberOf Loggy
     * @param {String} msg - is the message to log
     * @param {object} browserConsole - Original browser console
     */
    _self.log = function (msg, browserConsole) {
        handleNewLog(toLogObj(_self.level.LOG, msg), browserConsole);
    };
    /**
     * Log a information
     * @memberOf Loggy
     * @param {String} msg - is the message to log
     * @param {object} browserConsole - Original browser console
     */
    _self.info = function (msg, browserConsole) {
        handleNewLog(toLogObj(_self.level.INFO, msg), browserConsole);
    };
    /**
     * Log a warning
     * @memberOf Loggy
     * @param {String} msg - is the message to log
     * @param {object} browserConsole - Original browser console
     */
    _self.warn = function (msg, browserConsole) {
        handleNewLog(toLogObj(_self.level.WARN, msg), browserConsole);
    };

    /**
     * Log a error
     * @memberOf Loggy
     * @param {String|Object} msg - is the message to log or the exception object
     * @param {object} browserConsole - Original browser console
     */
    _self.error = function (msg, browserConsole) {
        handleNewLog(toLogObj(_self.level.ERROR, msg), browserConsole);
    };
    /**
     * Get the stored logs
     * @memberOf Loggy
     * @returns {Array} logs - are the logs
     * @returns {Object} logs[n] - is the log object
     */
    _self.getLogs = function () {
        return _logs;
    };

    _self.setConfig(config);

    _self.init = function () {
        /* global window */
        if (window.console && console.log) {
            (function () {
                var browserConsole = Object.assign({}, console);
                console.log = function () {
                    _self.log(arguments, browserConsole);
                };
            })();
        }

        if (window.console && console.info) {
            (function () {
                var browserConsole = Object.assign({}, console);
                console.info = function () {
                    _self.info(arguments, browserConsole);
                };
            })();
        }

        if (window.console && console.warn) {
            (function () {
                var browserConsole = Object.assign({}, console);
                console.warn = function () {
                    _self.warn(arguments, browserConsole);
                };
            })();
        }

        if (window.console && console.error) {
            (function () {
                var browserConsole = Object.assign({}, console);
                console.error = function () {
                    _self.error(arguments, browserConsole);
                };
            })();
        }
    };

    return _self;
}();

Loggy.init();