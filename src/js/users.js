import { Apis } from "../config.js";

// 消息提示
export var success_msg_options = {offset: ['28px'], skin: 'custom-msg-layer-success'};
export var failure_msg_options = {offset: ['28px'], skin: 'custom-msg-layer-failure'};

layui.use(function(){
    var table = layui.table;
    var form = layui.form;
    var layer = layui.layer;
    var msg = layui.layer.msg;
    var $ = layui.jquery;
    var util = layui.util;
    var laypage = layui.laypage;

    var url = Apis.user.manage;

    // 表头结构
    var cols = [[
        {type: 'checkbox', fixed: 'left'},
        {field: 'id', title: 'ID', width: 80, sort: true},
        {field: 'name', title: '名称<i layer-filter="username">', width: 120, edit: 'text'},
        {field: 'type', title: '是否为管理员', width:125, templet: '#users-is-admin-switch'},
        {fixed: 'right', title: '操作', width: 150, toolbar: '#user_operations'}
    ]];

    // 页码对象
    var page_obj = {
        elem: 'users_page',
        count: 1,
        limit: 2,
        limits: [2, 5, 10],
        curr: location.hash.replace('#!curr=', ''), // 初始获取 hash 值为 curr 的当前页
        hash: 'curr' // 自定义 hash 名称
    }

    // 表格对象
    var table_obj = {
        elem: '#users',
        id: 'users',
        cols: cols,
        url: url,
        method: 'get',
        request: {pageName: 'page', limitName: 'page_size'}, 
        page: 1,
        limit: 2,
        limits: [2, 5, 10],
        parseData: (res) => {
            page_obj.count = Math.ceil(res.total / res.page_size);
            page_obj.limit = res.page_size;
            page_obj.curr = res.page;
            table_obj.limit = res.page_size;
            table_obj.page = res.page;
            console.log(page_obj);
            console.log(table_obj);
            return {"code": 0, "msg": "获取成功", "count": res.total, "data": res.data}
        }
    }

    // 表格渲染
    // table.set({
    //     contentType: 'application/json',
    //     page: 1,
    //     limit: 2, 
    //     limits: [2, 5, 10]
    // })
    table.render(table_obj);
    laypage.render(page_obj);

    // 表格编辑事件
    table.on('edit(users)', function(obj) {
        console.log("数据修改事件");
        console.log(obj);
        var old_value = obj.oldValue;
        var field = obj.field;
        var data = obj.data;
        // 弹窗询问
        // 发送数据修改请求
        // 根据结果响应提示
        // 重新渲染本页数据
        layer.confirm('确定要修改用户昵称？', {
            btn: ['确定', '取消']
        }, function() {
            // 发送数据修改请求
            $.ajax({
                url: Apis.user.manage,
                method: "PUT",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data),
                success: (data) => {
                    // 视频添加成功后刷新表格
                    msg(data.message, success_msg_options);
                    // table.render(table_obj);
                },
                error: (data) => {
                    // 失败提示
                    msg(data.responseJSON.message, failure_msg_options);
                }
            })

        }, function() {
            msg("取消成功");
            // 恢复旧数据
            var update = {};
            update[field] = old_value;
            obj.update(update, true);
        })
    });
    // 工具栏事件
    table.on('tool(users)', function(obj) {
        console.log(obj);
        var user_id = obj.data.id;
        switch(obj.event) {
            case 'change_password':
                console.log("修改密码事件");
                layer.prompt({
                    formType: 0,
                    title: "修改密码",
                    placeholder: "请输入新密码",
                }, function(value, index, elem) {
                    var args = {"id": user_id, "password": value};
                    $.ajax({
                        url: Apis.user.password,
                        method: 'put',
                        contentType: "application/json;charset=utf-8",
                        data: JSON.stringify(args),
                        success: (data) => {
                            // 成功提示
                            msg(data.message, success_msg_options);
                        },
                        error: (data) => {
                            // 失败提示
                            msg(data.responseJSON.message, failure_msg_options);
                        }
                    })
                })
            break;
            
            case 'delete':
                console.log("用户删除事件");
                layer.confirm('确定要删除此用户？', {
                    btn: ['删除', '取消']
                }, function() {
                    var data = {"ids": [user_id]};
                    // 发送删除用户请求
                    $.ajax({
                        url: Apis.user.manage,
                        method: "DELETE", 
                        contentType: "application/json;charset=utf-8",
                        data: JSON.stringify(data),
                        success: (data) => {
                            // 视频添加成功后刷新表格
                            msg(data.message, success_msg_options);
                            table.reloadData('users', {
                                where: {"page": table_obj.page, "page_size": table_obj.limit},
                                scrollPos: true,
                            })
                        },
                        error: (data) => {
                            // 失败提示
                            msg(data.responseJSON.message, failure_msg_options);
                        }
                    })
                }, function() {
                    // 弹出取消提示
                    msg('取消成功', success_msg_options);
                })
            break;
        }
    })
    // 用户身份修改事件
    form.on('switch(is_admin)', function(obj) {
        console.log("用户身份修改事件");
        var old_value;
        if (this.value == "false") {
            old_value = true;
        }else {
            old_value = false;
        }
        var user_info = this.name.split(" ");
        var data = {"id": user_info[0], "name": user_info[1], "is_admin": old_value};
        console.log(data);
        // 弹窗询问
        // 发起请求
        // 弹窗提示结果
        // 重新渲染数据
        layer.confirm('确定要修改用户身份？', {
            btn: ['确定', '取消']
        }, function() {
            // 发送数据修改请求
            $.ajax({
                url: Apis.user.manage,
                method: "PUT",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data),
                success: (data) => {
                    // 视频添加成功后刷新表格
                    msg(data.message, success_msg_options);
                    // table.render(table_obj);
                },
                error: (data) => {
                    // 失败提示
                    msg(data.responseJSON.message, failure_msg_options);
                }
            })

        }, function() {
            msg("取消成功");
            // 恢复旧数据
            // console.log(page_obj.curr);
            table.render(table_obj);
            // window.location.reload();
        })
    });

    // 新增与批量删除用户按钮
    util.on('lay-on', {
        create_user: function() {
            var index = layer.open({
                type: 1,
                title: '新增用户',
                content: $('#create_user_layer'),
                area: ['340px', 'auto']
            });
            form.on('submit(create_user_submit)', function(data) {
                var args = data.field;
                args["is_admin"] = args["is_admin"] | false;
                $.ajax({
                    url: Apis.user.manage,
                    method: "post",
                    contentType: "application/json;charset=utf-8",
                    data: JSON.stringify(args),
                    success: (data) => {
                        // 视频添加成功后刷新表格
                        msg(data.message, success_msg_options);
                        table.reloadData('users', {
                            where: {"page": table_obj.page, "page_size": table_obj.limit},
                            scrollPos: true,
                        })
                        layer.close(index);
                    },
                    error: (data) => {
                        // 失败提示
                        msg(data.responseJSON.message, failure_msg_options);
                    }
                })
                return false;
            })
        },
        delete_users: function(obj) {
            console.log("批量删除用户事件");
            var checked_users = table.checkStatus("users");
            var args = {"ids": []};
            for (var i in checked_users.data) {
                args["ids"].push(checked_users.data[i].id);
            };

            $.ajax({
                url: Apis.user.manage,
                method: "delete",
                contentType: "application/json;charset=utf-8",
                    data: JSON.stringify(args),
                    success: (data) => {
                        // 视频添加成功后刷新表格
                        msg(data.message, success_msg_options);
                        table.reloadData('users', {
                            where: {"page": table_obj.page, "page_size": table_obj.limit},
                            scrollPos: true,
                        })
                    },
                    error: (data) => {
                        // 失败提示
                        msg(data.responseJSON.message, failure_msg_options);
                    }
            });

        }
    });

    // 搜索事件
    document.getElementById("search").onclick = function() {
        msg("Test", failure_msg_options);
        var username = document.getElementById("search_username").value;
        var search_table_obj = table_obj;
        search_table_obj["where"] = {"name": username};
        table.render(search_table_obj);
    };
    
})