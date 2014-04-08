'use strict';

var winston = require('winston'),
    q = require('q'),
    util = require('util'),
    Waterline = function (options) {
        var me = this;

        if (typeof options.model === 'undefined' || options.model === null) {
            throw new Error(new Date() + ' - ' + 'error: a Waterline model is required');
        }

        me.model = options.model;
        me.level = options.level || 'info';
        me.silent = options.silent || false;
        me.safe = options.safe || false;
        me.fields = options.fields || {
            id: 'id',
            level: 'level',
            message: 'message',
            timestamp: 'timestamp'
        };

        return me;
    };

util.inherits(Waterline, winston.Transport);

Waterline.prototype.log = function (level, message, meta, callback) {
    var me = this,
        deferred = q.defer(),
        timestamp = new Date(),
        prefix = timestamp + ' - ',
        log = {};

    meta = meta || {};
    level = level || me.level;
    prefix += level + ': ';

    if (typeof message === 'undefined' || message === null || message.length === 0) {
        var error = new Error(prefix + "can't log an empty message");

        deferred.reject(error);
        if (typeof callback === 'function') callback(error);

        throw error;
    }

    log[me.fields.level] = level;
    log[me.fields.message] = message;
    log[me.fields.timestamp] = timestamp;

    Object.keys(meta).forEach(function (field) {
        if (typeof me.fields[field] !== 'undefined' && me.fields[field] !== null) {
            log[field] = meta[field];
        }
    });

    me.model.create(log, function (err, record) {
        if (err) {
            deferred.reject(err);
            if (typeof callback === 'function') callback(err);

            throw err;
        }

        if (me.safe) {
            var search = {};
            search[me.fields.id] = record[me.fields.id];
            me.model.findOne(search, function (err, safeRecord) {
                if (err) {
                    deferred.reject(err);
                    if (typeof callback === 'function') callback(err);

                    throw err;
                }

                if (safeRecord[me.fields.id] === record[me.fields.id]) {
                    if (!me.silent) console.log(prefix + message);
                    deferred.resolve(safeRecord);
                    if (typeof callback === 'function') callback(null, safeRecord);
                }
                else {
                    var error = new Error(prefix + "no log saved on the database.");

                    deferred.reject(error);
                    if (typeof callback === 'function') callback(error);

                    throw error;
                }
            });
        }
        else {
            if (!me.silent) console.log(prefix + message);
            deferred.resolve(record);
            if (typeof callback === 'function') callback(null, record);
        }
    });

    return deferred;
};

module.exports = winston.transports.Waterline = Waterline;