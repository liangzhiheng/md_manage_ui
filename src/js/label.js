import { Apis } from "../configs";

// 消息提示
export var success_msg_options = {offset: ['28px'], skin: 'custom-msg-layer-success'};
export var failure_msg_options = {offset: ['28px'], skin: 'custom-msg-layer-failure'};

layui.use(function() {
    var table = layui.table;
    var form = layui.form;
    var layer = layui.layer;
    var msg = layui.layer.msg;
    var $ = layui.jquery;
    var dropdown = layui.dropdown;
    var util = layui.util;
    var laypage = layui.laypage;

    // 表头结构
    var cols = [[
        {type: 'checkbox', fixed: 'left'},
        {field: 'id', title: 'ID', width: 80, sort: true},
        {field: 'name', title: '名称', width: 120, edit: 'text'},
        {field: 'type', title: '类型', width:125, align: 'center', templet: '#label_type_dropdown'},
        {field: 'desc', title: '描述', width: 150, edit: 'textarea'},
        {fixed: 'right', title: '操作', width: 150, toolbar: '#label_operations'}
    ]];

    // 页码对象
    var page_obj = {
        elem: 'labels_page',
        count: 1,
        limit: 2,
        limits: [2, 5, 10],
        curr: location.hash.replace('#!curr=', ''), // 初始获取 hash 值为 curr 的当前页
        hash: 'curr' // 自定义 hash 名称
    }

    // 表格对象
    var table_obj = {
        elem: '#labels',
        id: 'labels',
        cols: cols,
        url: Apis.label.label,
        method: 'get',
        request: {pageName: 'page', limitName: 'page_size'}, 
        page: 1,
        limit: 2,
        limits: [2, 5, 10],
        parseData: (res) => {
            page_obj.count = Math.ceil(res.total / res.page_size);
            table_obj.page = res.page;
            table_obj.limit = res.page_size;

            var data = res.data;
            for (var i in data) {
                if (data[i]["type"] == "text") {
                    data[i]["title"] = "文本";
                }else if (data[i]["type"] == "audio") {
                    data[i]["title"] = "音频";
                }else {
                    data[i]["title"] = "视频";
                }
            }
            return {"code": 0, "msg": "获取成功", "count": res.total, "data": res.data}
        },
        done: (res, curr, count) => {
            var options = this;
            // 获取当前行数据
            table.getRowData = function(data, elem){
                var index = layui.$(elem).closest('tr').data('index');
                return data[index] || {};
            };
            // dropdown下拉框
            dropdown.render({
                elem: '.label_type_dropdown',
                data: [
                    {title: '文本', type: 'text'},
                    {title: '音频', type: 'audio'},
                    {title: '视频', type: 'video'}
                ],
                click: function(obj) {
                    var data = table.getRowData(options.table.cache.labels, this.elem);
                    this.elem.find('span').html(obj.title);
                    data.type = obj.type;
                    var args = {"name": data.name, "type": data.type, "desc": data.desc};
                    
                    $.ajax({
                        url: Apis.label.label + data.id.toString(),
                        method: 'put',
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
                            // 恢复数值
                            table.reloadData('labels', {
                                where: {"page": table_obj.page, "page_size": table_obj.limit},
                                scrollPos: true,
                            });
                        }
                    })
                }
            })
        }
    }

    table.render(table_obj);
    laypage.render(page_obj);

    // 名称与描述编辑事件
    table.on('edit(labels)', function(obj) {
        var args = {"name": obj.data.name, "type": obj.data.type, "desc": obj.data.desc};
        $.ajax({
            url: Apis.label.label + obj.data.id.toString(),
            method: 'put',
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify(args),
            success: (data) => {
                // 视频添加成功后刷新表格
                msg(data.message, success_msg_options);
                // table.render(table_obj);
            },
            error: (data) => {
                // 失败提示
                msg(data.responseJSON.message, failure_msg_options);
                // 恢复数据
                table.reloadData('labels', {
                    where: {"page": table_obj.page, "page_size": table_obj.limit},
                    scrollPos: true,
                });
            }
        });
    });

    // 工具栏事件
    table.on('tool(labels)', function(obj) {
        var label_id = obj.data.id;
        $.ajax({
            url: Apis.label.label + label_id.toString(),
            method: 'delete',
            contentType: "application/json;charset=utf-8",
            // data: JSON.stringify(args),
            success: (data) => {
                // 视频添加成功后刷新表格
                msg(data.message, success_msg_options);
                // 恢复数据
                table.reloadData('labels', {
                    where: {"page": table_obj.page, "page_size": table_obj.limit},
                    scrollPos: true,
                });
            },
            error: (data) => {
                // 失败提示
                msg(data.responseJSON.message, failure_msg_options);
            }
        });
    });

    // 新建与批量删除标签事件
    util.on('lay-on', {
        create_label: function() {
            var index = layer.open({
                type: 1,
                title: '新增标签',
                content: $('#create_label_layer'),
                area: ['340px', 'auto']
            });
            form.on('submit(create_label_submit)', function(data) {
                var args = data.field;
                $.ajax({
                    url: Apis.label.label,
                    method: "post",
                    contentType: "application/json;charset=utf-8",
                    data: JSON.stringify(args),
                    success: (data) => {
                        // 视频添加成功后刷新表格
                        msg(data.message, success_msg_options);
                        table.reloadData('labels', {
                            where: {"page": table_obj.page, "page_size": table_obj.limit},
                            scrollPos: true,
                        })
                        layer.close(index);
                    },
                    error: (data) => {
                        // 失败提示
                        msg(data.responseJSON.message, failure_msg_options);
                    }
                });
                return false;
            });
        },
        delete_labels: function() {
            var checked_labels = table.checkStatus("labels");
            var args = {"ids": []};
            for (var i in checked_labels.data) {
                args["ids"].push(checked_labels.data[i].id);
            };

            $.ajax({
                url: Apis.label.label,
                method: "delete",
                contentType: "application/json;charset=utf-8",
                    data: JSON.stringify(args),
                    success: (data) => {
                        // 视频添加成功后刷新表格
                        msg(data.message, success_msg_options);
                        table.reloadData('labels', {
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
        var name = document.getElementById("search_labels").value;
        var search_table_obj = table_obj;
        search_table_obj["where"] = {"name": name};
        table.render(search_table_obj);
    };
})