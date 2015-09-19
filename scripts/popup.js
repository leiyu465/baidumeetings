/**
 * Copyright (C) 2015 yanni4night.com
 * popup.js
 *
 * changelog
 * 2015-09-15[11:02:07]:revised
 * 2015-09-20[00:04:57]:support cancel/checkin/checkout
 *
 * @author yanni4night@gmail.com
 * @version 0.1.1
 * @since 0.1.0
 */
require(['./lib/underscore', './scripts/meetings'], function (_, Meetings) {
    _ = _ || window._;

    var tplFunc = _.template($('#scheduleTpl').html());

    var Popup = function () {
        var scheduleList;

        this.start = function () {
            return this.initDomEvents().refreshScheduleTable();
        };

        this.refreshScheduleTable = function () {
            Meetings.list(function (err, schedules) {
                if (schedules) {
                    scheduleList = schedules
                }
                var html = tplFunc({
                    schedules: scheduleList || []
                });
                $('.schedule-list').html(html);
            });
            return this;
        };

        this.findScheduleById = function (id) {
            if (!Array.isArray(scheduleList) || !scheduleList.length) {
                return null;
            }

            return scheduleList.filter(function (schedule) {
                return String(id) === schedule.getId();
            })[0];
        };

        this.confirm = function (msg, cb) {
            BootstrapDialog.confirm({
                title: '确认',
                message: msg,
                type: BootstrapDialog.TYPE_WARNING, // <-- Default value is BootstrapDialog.TYPE_PRIMARY
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: '取消', // <-- Default value is 'Cancel',
                btnOKLabel: '确认', // <-- Default value is 'OK',
                btnOKClass: 'btn-warning', // <-- If you didn't specify it, dialog type will be used,
                callback: $.isFunction(cb) ? cb : $.noop
            });
        };

        this.alert = function (msg, cb) {
            BootstrapDialog.alert({
                title: '通知',
                message: msg,
                type: BootstrapDialog.TYPE_INFO, // <-- Default value is BootstrapDialog.TYPE_PRIMARY
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                buttonLabel: '确定', // <-- Default value is 'OK',
                callback: $.isFunction(cb) ? cb : $.noop
            })
        };
    };

    Popup.prototype.initDomEvents = function () {
        var self = this;

        $(document)
            .delegate('.bdm-checkin', 'click', function (e) {
                e.preventDefault();

                var schedule;
                var id = $(this).data('sid');

                if (!id || !(schedule = self.findScheduleById(id))) {
                    self.alert('出错，没有找到会议信息，请重试');
                    return;
                }

                self.confirm('确定签入该会议室?', function (result) {
                    if (result) {
                        schedule.checkin(function (err) {
                            if (!err) {
                                self.alert('签入成功!');
                                self.refreshScheduleTable();
                            } else {
                                self.alert('签入失败!');
                            }
                        });
                    }
                });
            })
            .delegate('.bdm-checkout', 'click', function (e) {
                e.preventDefault();

                var schedule;
                var id = $(this).data('sid');
                if (!id || !(schedule = self.findScheduleById(id))) {
                    self.alert('出错，没有找到会议信息，请重试');
                    return;
                }

                self.confirm('确定签出该会议室?', function (result) {
                    if (result) {
                        schedule.checkout(function (err) {
                            if (!err) {
                                self.alert('签出成功!');
                                self.refreshScheduleTable();
                            } else {
                                self.alert('签出失败!');
                            }
                        });
                    }
                });
            })
            .delegate('.bdm-cancel', 'click', function (e) {
                e.preventDefault();

                var schedule;
                var id = $(this).data('sid');

                if (!id || !(schedule = self.findScheduleById(id))) {
                    self.alert('出错，没有找到会议信息，请重试');
                    return;
                }

                self.confirm('确定取消该会议室?', function (result) {
                    if (result) {
                        schedule.cancel(function (err) {
                            if (!err) {
                                self.alert('取消成功!');
                                self.refreshScheduleTable();
                            } else {
                                self.alert('取消失败!');
                            }
                        });
                    }
                });
            })
            .delegate('.bdm-transfer', 'click', function (e) {
                e.preventDefault();
                var id = $(this).data('sid');
                self.alert('暂不支持转出');
                if (!id) {

                    return;
                }

            });
        return this;
    };



    new Popup().start();

});