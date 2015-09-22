/**
 * Copyright (C) 2015 yanni4night.com
 * popup.js
 *
 * changelog
 * 2015-09-15[11:02:07]:revised
 * 2015-09-20[00:04:57]:support cancel/checkin/checkout
 * 2015-09-20[10:56:45]:support transfer
 *
 * @author yanni4night@gmail.com
 * @version 0.1.1
 * @since 0.1.0
 */
require(['./lib/underscore', './scripts/meetings'], function (_, Meetings) {
    _ = _ || window._;

    // 表格模板
    var tplFunc = _.template($('#scheduleTpl').html());

    var Popup = function () {
        // 缓存
        var scheduleList;

        this.start = function () {
            return this.initDomEvents().refreshScheduleTable();
        };

        /**
         * 刷新列表，重新请求。
         * 
         * @return {this}
         */
        this.refreshScheduleTable = function () {
            Meetings.list(function (err, schedules) {
                // 先缓存再渲染
                var html = tplFunc({
                    schedules: (scheduleList = schedules),
                    errmsg: err && err.message
                });

                $('.schedule-list').html(html);
            });

            return this;
        };

        /**
         * 根据ID查询缓存中的实例。
         * 
         * @param  {string} id 
         * @return {Object|undefined}    Schedule对象
         */
        this.findScheduleById = function (id) {
            if (!Array.isArray(scheduleList) || !scheduleList.length) {
                return undefined;
            }

            return scheduleList.filter(function (schedule) {
                return String(id) === schedule.getId();
            })[0];
        };

        /**
         * 确认对话框。
         * 
         * @param  {string}   msg
         * @param  {Function} cb
         */
        this.confirm = function (msg, cb) {
            BootstrapDialog.confirm({
                title: '确认',
                message: msg,
                closable: true,
                draggable: true,
                btnCancelLabel: '取消',
                btnOKLabel: '确认',
                callback: $.isFunction(cb) ? cb : $.noop
            });
        };

        /**
         * 提示对话框。
         * 
         * @param  {string}   msg
         * @param  {Function} cb
         */
        this.alert = function (msg, cb) {
            BootstrapDialog.alert({
                title: '通知',
                message: msg,
                closable: true,
                draggable: true,
                buttonLabel: '确定',
                callback: $.isFunction(cb) ? cb : $.noop
            })
        };

        /**
         * 输入对话框。
         * 
         * @param  {string}   msg
         * @param  {Function} cb
         */
        this.prompt = function (msg, cb) {
            BootstrapDialog.show({
                title: msg,
                message: '<div class="input-group">\
          <span class="input-group-btn">\
            <button class="btn btn-default" type="button">To</button>\
          </span>\
          <input type="text" class="form-control" placeholder="transfer@baidu.com">\
        </div>',
                buttons: [{
                    label: '取消',
                    action: function (dialog) {
                        dialog.close();
                        cb();
                    }
                }, {
                    label: '确定',
                    action: function (dialog) {
                        var to = dialog.getModalBody().find('input').val().trim();
                        if (to) {
                            cb(to);
                            dialog.close();
                        }
                    }
                }]
            });
        };
    };

    Popup.prototype.initDomEvents = function () {
        var self = this;

        $(document)
            // 签入按钮事件
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
            // 签出按钮事件
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
            // 取消按钮事件
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
            // 转让按钮事件
            .delegate('.bdm-transfer', 'click', function (e) {
                e.preventDefault();

                var schedule;
                var id = $(this).data('sid');

                if (!id || !(schedule = self.findScheduleById(id))) {
                    self.alert('出错，没有找到会议信息，请重试');
                    return;
                }

                self.prompt('请输入转让者的邮箱', function (to) {
                    if (to) {
                        schedule.transfer(to, function (err) {
                            if (!err) {
                                self.alert('转让给' + to + '成功!');
                                self.refreshScheduleTable();
                            } else {
                                self.alert('转让失败!');
                            }
                        });
                    }
                });

            });

        $('#refresh').click(function () {
            $('.schedule-list').empty();
            self.refreshScheduleTable();
        });

        return this;
    };

    new Popup().start();
});