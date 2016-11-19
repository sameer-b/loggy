class Loggy {

    constructor() {
        this.config = {
            storeLogServiceUrl: '',
            alertLog: false,
            logReportFrequency: {limit: 1, timer: 0},
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
    setConfig(customConfig) {
        if (customConfig) {
            for (const prop in customConfig) {
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
    getTimeStamp() {
        const currentdate = new Date();
        return currentdate.getFullYear()
            + '-' + (currentdate.getMonth() + 1)
            + '-' + currentdate.getDate()
            + ' ' + currentdate.getHours()
            + ':' + currentdate.getMinutes()
            + ':' + currentdate.getSeconds()
            + '.' + currentdate.getMilliseconds();
    }

    /**
     * This function transform a log object into a string
     * @private
     * @memberOf Loggy
     * @param {Object} logObj - is the log object
     * @returns {String} - is the stringified logObj
     */
    logToString(logObj) {
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
    consoleLogging(logObj, browserConsole) {
        if (browserConsole && this.config.consoleLog) {
            const logMsg = this.logToString(logObj);
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
    _logCommunicator(hostUrl, successCallback, errorCallback) {
        /* global XMLHttpRequest */
        const http = new XMLHttpRequest();
        http.open('POST', hostUrl, true);
        http.setRequestHeader('Content-type', 'application/json');

        http.onreadystatechange = function() {
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

    sendLogToWS() {
        function successCallback() {
            if (this.config.clearAfterSend) {
                this.clear();
                this._localStoreManager().clearLogs();
            }
        }
        this._logCommunicator(this.config.storeLogServiceUrl,successCallback);
    }

    /**
     *
     * LocalStorage manager
     * @returns {Object} Local storage manager
     */
    _localStoreManager() {
        return {
            isLocalStorageSupported: !!window.localStorage,
            lsKey: this.config.lsKey,
            storeLogs: function(logs) {
                if (this.isLocalStorageSupported) {
                    if (!Array.isArray(logs)) {
                        logs = [logs];
                    }
                    /* global localStorage */
                    localStorage.setItem(this.lsKey, JSON.stringify(logs));
                }
            },
            getLogs: function() {
                if (this.isLocalStorageSupported) {
                    /* global localStorage */
                    return JSON.parse(localStorage.getItem(this.lsKey));
                }
            },
            clearLogs: function() {
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
    clear(limit) {
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
    toLogObj(logLevel, msg) {
        const logObj = {
            timestamp: this.getTimeStamp()
        };
        if (typeof msg === 'object' && msg.message) {
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
    handleNewLog(logObj, browserConsole) {
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
    debug(msg, browserConsole) {
        this.handleNewLog(this.toLogObj(this.level.DEBUG, msg), browserConsole);
    }

    /**
     * Log a message
     * @memberOf Loggy
     * @param {String} msg - is the message to log
     * @param {object} browserConsole - Original browser console
     */
    log(msg, browserConsole) {
        this.handleNewLog(this.toLogObj(this.level.LOG, msg), browserConsole);
    }

    /**
     * Log a information
     * @memberOf Loggy
     * @param {String} msg - is the message to log
     * @param {object} browserConsole - Original browser console
     */
    info(msg, browserConsole) {
        this.handleNewLog(this.toLogObj(this.level.INFO, msg), browserConsole);
    }

    /**
     * Log a warning
     * @memberOf Loggy
     * @param {String} msg - is the message to log
     * @param {object} browserConsole - Original browser console
     */
    warn(msg, browserConsole) {
        this.handleNewLog(this.toLogObj(this.level.WARN, msg), browserConsole);
    }

    /**
     * Log a error
     * @memberOf Loggy
     * @param {String|Object} msg - is the message to log or the exception object
     * @param {object} browserConsole - Original browser console
     */
    error(msg, browserConsole) {
        this.handleNewLog(this.toLogObj(this.level.ERROR, msg), browserConsole);
    }

    /**
     * Get the stored logs
     * @memberOf Loggy
     * @returns {Array} logs - are the logs
     * @returns {Object} logs[n] - is the log object
     */
    getLogs() {
        return this._logs;
    }

    init() {
        /* global window */
        if (window.console && console.log) {
            const browserConsole = Object.assign({}, console);
            console.log = function() {
                this.log(arguments, browserConsole);
            };
        }

        if (window.console && console.info) {
            const browserConsole = Object.assign({}, console);
            console.info = function() {
                this.info(arguments, browserConsole);
            };
        }

        if (window.console && console.warn) {
            const browserConsole = Object.assign({}, console);
            console.warn = function() {
                this.warn(arguments, browserConsole);
            };
        }

        if (window.console && console.error) {
            const browserConsole = Object.assign({}, console);
            console.error = function() {
                this.error(arguments, browserConsole);
            };
        }
    }
}

export default Loggy;
