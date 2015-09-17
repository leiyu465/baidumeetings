/**
 * Copyright (C) 2015 yanni4night.com
 * meetings.js
 *
 * changelog
 * 2015-09-14[16:06:41]:revised
 *
 * @author yanni4night@gmail.com
 * @version 0.1.0
 * @since 0.1.0
 */

define(['../lib/jquery', './htmlparser'], function($, parser) {
    $ = $ || window.$;

    $.ajaxSetup({
        cache: false
    });

    var Core = {
        /**
         * Get my-schedule-list 
         * from `http://meeting.baidu.com/web/scheduleList`.
         * 
         * @param  {Function} cb cb(err, html)
         * @return {this}
         */
        getScheduleList: function(cb) {
            $.get('http://meeting.baidu.com/web/scheduleList').done(function(content) {
                if (content) {
                    var parsedSchedules = parser.parse(content);
                    if (parsedSchedules) {
                        cb(null, parsedSchedules);
                    } else {
                        cb(new Error('Parsed error'));
                    }
                } else {
                    cb(new Error('No content'));
                }
            }).fail(function(jqXhr, error, errText) {
                cb(new Error(errText));
            });
        }
    };

    var Web = {
        request: function(url, cb) {
            $.getJSON(url).done(function(data) {
                if (200 === data.code && 1 === data.status) {
                    cb(null, data);
                } else {
                    cb(new Error('操作失败'));
                }
            }).fail(function(jqXhr, error, errText) {
                cb(new Error(errText));
            });
        }
    };

    return {
        test: function(cb) {
            Core.getScheduleList(function(err, scheduleList) {
                return cb(!err && scheduleList.headers && scheduleList.schedules);
            });
        },
        checkin: function(id, cb) {
            Web.request('http://meeting.baidu.com/web/checkIn?scheduleId=' + id, cb);
        },
        cancel: function(id, cb) {
            Web.request('http://meeting.baidu.com/web/cancel?scheduleId=' + id, cb);
        },
        checkout: function(id, cb) {
            Web.request('http://meeting.baidu.com/web/checkOut?scheduleId=' + id, cb);
        },
        transder: function(id, targetMan, cb) {
            Web.request('http://meeting.baidu.com/web/transferOrderMan?scheduleId=' + id + '&newOrderManEmail=' + encodeURIComponent(targetMan), cb);
        },
        list: function(cb) {
            Core.getScheduleList(cb);
        }
    };

});