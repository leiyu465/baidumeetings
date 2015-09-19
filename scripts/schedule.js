/**
 * Copyright (C) 2015 tieba.baidu.com
 * schedule.js
 *
 * changelog
 * 2015-09-19[21:26:06]:revised
 *
 * @author yinyong02@baidu.com
 * @version 0.1.0
 * @since 0.1.0
 */
define([], function () {

    var Web = {
        request: function (url, cb) {
            $.getJSON(url).done(function (data) {
                if (200 === data.code && 1 === data.status) {
                    cb(null, data);
                } else {
                    cb(new Error('操作失败'));
                }
            }).fail(function (jqXhr, error, errText) {
                cb(new Error(errText));
            });
        }
    };

    var Schedule = function (metaData) {
        var id;

        this.getMetaData = function () {
            return metaData;
        };

        this.get = function (key) {
            return metaData[key];
        };

        this.getDateTimeStr = function () {
            return [this.get('日期'), '(', this.get('星期'), ')', ' ', this.get('开始时间'), '~', this.get(
                '结束时间')].join('');
        };

        this.getLocationStr = function () {
            return [this.get('地域'), this.get('楼层'), ' ', this.get('会议室描述'), ' ', this.get('会议室名称')].join(
                '');
        };

        this.getStatus = function () {
            return this.get('当前状态');
        };

        this.getId = function () {
            return id || (this.get('操作').match(/\b\d+\b/) || [])[0];
        };

        this.isInPlan = function () {
            return '未开始' === this.getStatus();
        };

        this.canCheckin = function () {
            return !!~['可签入'].indexOf(this.getStatus());
        };

        this.canTransfer = function () {
            return !!~['未开始', '可签入'].indexOf(this.getStatus());
        };

        this.canCancel = function () {
            return this.canTransfer();
        };

        this.canCheckout = function () {
            return !!~['已签入'].indexOf(this.getStatus());
        };

    };

    Schedule.prototype = {
        checkin: function (cb) {
            Web.request('http://meeting.baidu.com/web/checkIn?scheduleId=' + this.getId(), cb);
        },
        cancel: function (cb) {
            Web.request('http://meeting.baidu.com/web/cancel?scheduleId=' + this.getId(), cb);
        },
        checkout: function (cb) {
            Web.request('http://meeting.baidu.com/web/checkOut?scheduleId=' + this.getId(), cb);
        },
        transder: function (targetMan, cb) {
            Web.request('http://meeting.baidu.com/web/transferOrderMan?scheduleId=' + this.getId() +
                '&newOrderManEmail=' + encodeURIComponent(targetMan), cb);
        }
    }

    return Schedule;
});