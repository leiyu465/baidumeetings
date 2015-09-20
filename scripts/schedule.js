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

    /**
     * 网络请求。
     * 
     * @type {Object}
     */
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

    /**
     * 一个会议室预订信息条目。
     * 
     * @param {Object} metaData
     * @class
     */
    var Schedule = function (metaData) {
        var id;

        this.get = function (key) {
            return metaData[key];
        };

        this.getId = function () {
            return id || (this.get('操作').match(/\b\d+\b/) || [])[0];
        };
    };

    Schedule.prototype = {
        getDateTimeStr: function () {
            return [this.get('日期'), '(', this.get('星期'), ')', ' ', this.get('开始时间'), '~', this.get(
                '结束时间')].join('');
        },

        getLocationStr: function () {
            return [this.get('地域'), this.get('楼层'), ' ', this.get('会议室描述'), ' ', this.get('会议室名称')].join(
                '');
        },

        getStatus: function () {
            return this.get('当前状态');
        },
        isInPlan: function () {
            return '未开始' === this.getStatus();
        },
        hasCheckedOut: function () {
            return '已签出' === this.getStatus();
        },
        hasFinished: function () {
            return !!~this.getStatus().indexOf('已结束');
        },
        hasOperations: function () {
            return !(this.hasFinished() || this.hasCheckedOut());
        },
        canCheckin: function () {
            return !!~['可签入'].indexOf(this.getStatus());
        },
        canTransfer: function () {
            return !!~['未开始', '可签入'].indexOf(this.getStatus());
        },
        canCancel: function () {
            return this.canTransfer();
        },
        canCheckout: function () {
            return !!~['已签入'].indexOf(this.getStatus());
        },
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