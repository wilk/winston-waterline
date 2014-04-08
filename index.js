'use strict';

var winston = require('winston'),
    q = require('q'),
    util = require('util'),
    Waterline = function (options) {
        var me = this;

        options = options || {};

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
        var error = prefix + "can't log an empty message";

        if (typeof callback === 'function') callback(error);
        deferred.reject(error);

        return me.emit('error', error);
    }

    log[me.fields.level] = level;
    log[me.fields.message] = message;
    log[me.fields.timestamp] = timestamp;

    Object.keys(meta).forEach(function (field) {
        if (me.fields.hasOwnProperty(field)) {
            log[me.fields[field]] = meta[field];
        }
    });

    me.model.create(log, function (err, record) {
        if (err) {
            if (typeof callback === 'function') callback(err);
            deferred.reject(err);

            return me.emit('error', error);
        }

        if (me.safe) {
            var search = {};
            search[me.fields.id] = record[me.fields.id];
            me.model.findOne(search, function (err, safeRecord) {
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