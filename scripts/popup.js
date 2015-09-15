/**
 * Copyright (C) 2015 yanni4night.com
 * popup.js
 *
 * changelog
 * 2015-09-15[11:02:07]:revised
 *
 * @author yanni4night@gmail.com
 * @version 0.1.0
 * @since 0.1.0
 */
require(['./lib/jquery', './lib/underscore', './scripts/meetings'], function ($, _, Meetings) {
    $ = $ || window.$;
    _ = _ || window._;

    $.ajaxSetup({
        cache: false
    });

    var Popup = function () {
        this.start = function () {
            return this.initDomEvents().refreshScheduleTable();
        };
    };

    Popup.prototype.initDomEvents = function () {
        $('.myschedule').click(function (e) {
            e.preventDefault();
            chrome.tabs.create({
                url: 'http://meeting.baidu.com/web/scheduleList'
            });
        });
        return this;
    };

    Popup.prototype.refreshScheduleTable = function () {
        Meetings.list(function (err, scheduleList) {
            if (scheduleList) {
                this.drawScheduleTable(scheduleList);
            }
        }.bind(this));
        return this;
    };

    Popup.prototype.drawScheduleTable = function (scheduleList) {
        var html = _.template($('#scheduleTpl').html())(scheduleList);
        $('.schedule-list').html(html);
    };

    new Popup().start();

});