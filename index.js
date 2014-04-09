'use strict';

var winston = require('winston'),
    q = require('q'),
    util = require('util'),
    // Waterline transport definition
    Waterline = function (options) {
        var me = this;

        options = options || {};

        if (typeof options.collection === 'undefined' || options.collection === null) {
            throw new Error(new Date() + ' - ' + 'error: a Waterline collection is required');
        }

        // @todo: setup an empty Waterline collection if no one is given
        me.collection = options.collection;
        me.level = options.level || 'info';
        me.silent = options.silent || true;
        me.safe = options.safe || false;
        me.fields = options.fields || {
            id: 'id',
            message: 'message',
            timestamp: 'timestamp'
        };

        return me;
    };

// Extending winston transport
util.inherits(Waterline, winston.Transport);

/**
 * Override of the log method
 * @param {String} level Level log
 * @param {String} message Message to log
 * @param {Object} meta An object containing each field of the database to fill. It has to be as follows:
 *   {
 *     firstMappedField: 'something',
 *     secondoMappedField: 'whatever',
 *     ...
 *   }
 *   Check out Waterline fields property for the mapping.
 * @param {Function} callback A callback function. It will be filled with the error in the case of failure, or with the log collection created.
 * @returns {Promise} A Kriskowal Q promise. It's the same of the callback but it's cooler, of course!
 */
Waterline.prototype.log = function (level, message, meta, callback) {
    var me = this,
        deferred = q.defer(),
        timestamp = new Date(),
        prefix = timestamp + ' - ' + level + ': ',
        log = {};

    meta = meta || {};

    // Checks for a non-empty message to log
    if (typeof message === 'undefined' || message === null || message.length === 0) {
        var error = prefix + "can't log an empty message";

        if (typeof callback === 'function') callback(error);
        deferred.reject(error);

        return me.emit('error', error);
    }

    // Required field to log on the DB
    log[me.fields.message] = message;
    log[me.fields.timestamp] = timestamp;

    // Each item of meta will be logged as a DB field
    Object.keys(meta).forEach(function (field) {
        if (me.fields.hasOwnProperty(field)) {
            log[me.fields[field]] = meta[field];
        }
    });

    me.collection.create(log, function (err, record) {
        if (err) {
            if (typeof callback === 'function') callback(err);
            deferred.reject(err);

            return me.emit('error', error);
        }

        // In safe mode, it checks for the consistency of the saved log
        if (me.safe) {
            var search = {};
            search[me.fields.id] = record[me.fields.id];
            me.collection.findOne(search, function (err, safeRecord) {
                if (err) {
                    if (typeof callback === 'function') callback(err);
                    deferred.reject(err);

                    return me.emit('error', err);
                }

                if (safeRecord[me.fields.id] === record[me.fields.id]) {
                    if (!me.silent) console.log(prefix + message);
                    if (typeof callback === 'function') callback(null, safeRecord);
                    deferred.resolve(safeRecord);

                    return me.emit('logged');
                }
                else {
                    var error = prefix + "no log saved on the database.";

                    if (typeof callback === 'function') callback(error);
                    deferred.reject(error);

                    return me.emit('error', error);
                }
            });
        }
        else {
            if (!me.silent) console.log(prefix + message);
            if (typeof callback === 'function') callback(null, record);
            deferred.resolve(record);

            return me.emit('logged');
        }
    });

    return deferred;
};

module.exports.Waterline = winston.transports.Waterline = Waterline;