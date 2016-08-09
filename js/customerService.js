/*
自己测试
app key kj7swf8o7ob42
用户a和d
{"code":200,"userId":"a","token":"qmNXHKMa7PIfID6ImHAqSl/6VTlV7ddnkHyghYrMJXTZMNMvM5uu4u79QSeT3IEdb5Bdhw+ijUc="}
{"code":200,"userId":"d","token":"aklJMY/lnGLbCkQD34tT6F/6VTlV7ddnkHyghYrMJXQH1bKBLlDIVeejMvt3eCqC/vg3gO4kapI="}
客服b和c
{"code":200,"userId":"b","token":"oBy/x4cVyb7JKWhu0hhQFIRmJTQ+A9fRpCROza4vqy9vSms3V9ixEcOqDuDunJZnfzQGnLU4IuAbtrFRDNd9JA=="}
{"code":200,"userId":"c","token":"BGgu0wPz13t4JvbHeEZq6zuA/wBR48rVh357qel6sI39NuyLwQDOVVYFDeSQCJrOLbmChERZW+7ZhOq3z8zRyQ=="}
*/
;
(function($) {
    var chart = {
        /*
         *   初始化
         */
        init: function() {
            var that = this;
            /*初始化，获取App key 和 token*/
            RongIMClient.init("kj7swf8o7ob42");
            var token = "oBy/x4cVyb7JKWhu0hhQFIRmJTQ+A9fRpCROza4vqy9vSms3V9ixEcOqDuDunJZnfzQGnLU4IuAbtrFRDNd9JA==";

            that.historyObjSub = new that.historyObj();
            that.historyFirstSub = new that.historyFirst();
            that.currentObjSub = new that.currentObj();
            this.dom(); //操作dom
            this.initEmojis() //初始化表情包
            this.setConnection(); //连接状态监听器&消息监听器
            this.connectServer(token); //连接融云服务器
            this.event() //事件触发

        },
        /*
         *   初始化表情包
         */
        initEmojis: function() {
            var that = this;
            RongIMLib.RongIMEmoji.init()
            var emojis = RongIMLib.RongIMEmoji.emojis,
                str = ""
            for (i in emojis) {
                str += emojis[i].innerHTML
            }
            that.emojis.html(str)
            $(".emojis span").on("click", function() {
                var n = $(this).index();
                var name = emojis[n].children[0].getAttribute("name")
                that.domTalk.append(name)
            })
        },
        /*
         *   dom 节点赋值
         */
        dom: function() {
            var that = this;
            that.domTalk = $("#talk");
            that.emojis = $(".emojis");
            that.expressionBtn = $(".expression a");
            that.tabBtn = $(".body-right .tab a ");
        },
        /*
         *   事件方法
         */
        event: function(message) {
            var that = this;
            /*表情包切换*/
            that.expressionBtn.on("click", function() {
                $(this).parents(".expression").find('.emojis').toggleClass('cur');
            })
            that.emojis.on("click", "span", function() {
                $(this).parent().addClass('cur')
            })
            that.domTalk.focus(function() {
                that.emojis.addClass('cur')
            });

            /*当前会话&历史记录tab*/
            that.tabBtn.on("click", function() {
                if ($(this).hasClass('history-btn')) {
                    for (var i = 0, j = $(".user li ").length; i < j; i++) {
                        if ($(".user li ").eq(i).find(".customerName").attr("data-id") == that.targetId) {
                            if (that.historyFirstSub[that.targetId]) {
                                that.historyFirstSub[that.targetId] = false;
                                that.getHistoryMessages();
                            }
                        }
                    }
                }
                var nIndex = $(this).index();
                $(this).addClass('current').siblings().removeClass('current');
                $(".body-right .tab-content .list").eq(nIndex).removeClass('cur').siblings().addClass('cur');
                // $(this).eq(nIndex)
            });

            /*消息按钮，提示是否显示消息列表*/
            $(".news-box ").on("click", function() {
                $(this).animate({
                        bottom: -50 + "px"
                    },
                    300,
                    function() {
                        $(".news-window").animate({
                                bottom: 80 + "px"
                            },
                            300);

                    });
            })
            $(".close").on("click", function() {
                $(".news-window").animate({
                        bottom: -500 + "px"
                    },
                    300,
                    function() {
                        $(".news-box").animate({
                                bottom: 80 + "px"
                            },
                            300);
                    });
            })

        },
        /*
         *   融云服务链接成功后事件方法
         */
        connectAfterEvent: function() {
            var that = this;
            // 定义消息类型,文字消息使用 RongIMLib.TextMessage
            $(".sendMsg").on("click", function() {
                var useMsg = that.domTalk.html()
                var msg = new RongIMLib.TextMessage({
                    content: useMsg,
                    extra: {
                        name: that.selfName,
                        company: that.selfCompany,
                        icon: that.selfIcon
                    }
                });
                //或者使用RongIMLib.TextMessage.obtain 方法.具体使用请参见文档
                // var msg = RongIMLib.TextMessage.obtain("hello");
                var conversationtype = RongIMLib.ConversationType.PRIVATE; // 私聊
                var targetId = that.targetId; // 目标 Id
                that.sendMsg(conversationtype, targetId, msg);
                /*切换为当前会话*/
                $(".current-btn").addClass('current').siblings().removeClass('current');
                $(".body-right .tab-content .list").eq(0).removeClass('cur').siblings().addClass('cur');
            });
            //回车发送
            that.domTalk.keypress(function(e) {
                var code = event.keyCode;
                if (13 == code && !event.shiftKey && !event.ctrlKey && !event.altKey) {
                    var useMsg = that.domTalk.html(),
                        msg = new RongIMLib.TextMessage({
                            content: useMsg,
                            extra: {
                                name: that.selfName,
                                company: that.selfCompany,
                                icon: that.selfIcon
                            }
                        }),
                        conversationtype = RongIMLib.ConversationType.PRIVATE // 私聊
                        ,
                        targetId = that.targetId; // 目标 Id
                    that.sendMsg(conversationtype, targetId, msg)
                        /*切换为当前会话*/
                    $(".current-btn").addClass('current').siblings().removeClass('current');
                    $(".body-right .tab-content .list").eq(0).removeClass('cur').siblings().addClass('cur');
                }
            });
            $('.content').scroll(function() {
                $('#' + $('.content').getNiceScroll(0).id).css('left', '891px');
            })

            $(".user").on("click", 'li', function() {
                that.targetId = $(this).find(".customerName").attr("data-id");
                that.targetCompany = $(this).find(".customerName").attr("data-company");
                that.targetName = $(this).find(".customerName").attr("data-name");
                that.targetIocn = $(this).find(".customerName").attr("data-icon");

                /*切换为当前会话*/
                $(".current-btn").addClass('current').siblings().removeClass('current');
                $(".body-right .tab-content .list").eq(0).removeClass('cur').siblings().addClass('cur');

                $(".chat-list-history").html(that.historyObjSub[that.targetId]);
                // $(".chat-list").html(sessionStorage.getItem('' + that.targetId + ''));
                $(".chat-list").html(that.currentObjSub[that.targetId]);
                $(".chart").show().find('.user-name').html(that.targetName);
                $(".content").scrollTop($('.content')[0].scrollHeight);

                // $('#' + $('.content').getNiceScroll(0).id).css('left', '891px');
                $(this).addClass('selec').siblings().removeClass('selec');
                $(this).find('.read').removeClass('curno');
                var cuName = $(".user li"),
                    i = 0,
                    flag = true;
                for (; i < cuName.length; i++) {
                    if (cuName.eq(i).find('.read').hasClass('curno')) {
                        flag = false;
                    }
                }
                if (flag) {
                    clearInterval(that.timer)
                    $(".twinkle").removeClass('curno')
                }
            });

            $(".history-show").on("click", function() {
                that.getHistoryMessages();
            });
        },
        /*
         *   连接监听状态&&消息监听
         */
        setConnection: function() {
            var that = this;
            // 设置连接监听状态 （ status 标识当前连接状态）
            // 连接状态监听器
            RongIMClient.setConnectionStatusListener({
                onChanged: function(status) {
                    switch (status) {
                        //链接成功
                        case RongIMLib.ConnectionStatus.CONNECTED:
                            console.log('链接成功');
                            break;
                            //正在链接
                        case RongIMLib.ConnectionStatus.CONNECTING:
                            console.log('正在链接');
                            break;
                            //重新链接
                        case RongIMLib.ConnectionStatus.DISCONNECTED:
                            console.log('断开连接');
                            break;
                            //其他设备登录
                        case RongIMLib.ConnectionStatus.KICKED_OFFLINE_BY_OTHER_CLIENT:
                            console.log('其他设备登录');
                            break;
                            //网络不可用
                        case RongIMLib.ConnectionStatus.NETWORK_UNAVAILABLE:
                            console.log('网络不可用');
                            break;
                    }
                }
            });

            // 消息监听器
            RongIMClient.setOnReceiveMessageListener({
                // 接收到的消息
                onReceived: function(message) {
                    // 判断消息类型
                    switch (message.messageType) {
                        case RongIMClient.MessageType.TextMessage:
                            // 发送的消息内容将会被打印
                            console.log(message);
                            that.receivedMsg(message);
                            break;
                        case RongIMClient.MessageType.VoiceMessage:
                            // 对声音进行预加载                
                            // message.content.content 格式为 AMR 格式的 base64 码
                            RongIMLib.RongIMVoice.preLoaded(message.content.content);
                            break;
                        case RongIMClient.MessageType.ImageMessage:
                            // do something...
                            break;
                        case RongIMClient.MessageType.DiscussionNotificationMessage:
                            // do something...
                            break;
                        case RongIMClient.MessageType.LocationMessage:
                            // do something...
                            break;
                        case RongIMClient.MessageType.RichContentMessage:
                            // do something...
                            break;
                        case RongIMClient.MessageType.DiscussionNotificationMessage:
                            // do something...
                            break;
                        case RongIMClient.MessageType.InformationNotificationMessage:
                            // do something...
                            break;
                        case RongIMClient.MessageType.ContactNotificationMessage:
                            // do something...
                            break;
                        case RongIMClient.MessageType.ProfileNotificationMessage:
                            // do something...
                            break;
                        case RongIMClient.MessageType.CommandNotificationMessage:
                            // do something...
                            break;
                        case RongIMClient.MessageType.CommandMessage:
                            // do something...
                            break;
                        case RongIMClient.MessageType.UnknownMessage:
                            // do something...
                            break;
                        default:
                            // 自定义消息
                            // do something...
                    }
                }
            });
        },
        /*
         *   连接融云服务器
         */
        connectServer: function(token) {
            var that = this;
            // RongIMClient.getInstance().disconnect();断开
            RongIMClient.connect(token, {
                onSuccess: function(userId) {
                    console.log("Login successfully." + userId);
                    //链接成功取，用户自己的 , id ,用户名，icon
                    that.selfId = userId;
                    that.selfName = "张珊";
                    that.selfCompany = "薪福社"
                    that.connectAfterEvent();
                },
                onTokenIncorrect: function() {
                    console.log('token无效');
                },
                onError: function(errorCode) {
                    var info = '';
                    switch (errorCode) {
                        case RongIMLib.ErrorCode.TIMEOUT:
                            info = '超时';
                            break;
                        case RongIMLib.ErrorCode.UNKNOWN_ERROR:
                            info = '未知错误';
                            break;
                        case RongIMLib.ErrorCode.UNACCEPTABLE_PaROTOCOL_VERSION:
                            info = '不可接受的协议版本';
                            break;
                        case RongIMLib.ErrorCode.IDENTIFIER_REJECTED:
                            info = 'appkey不正确';
                            break;
                        case RongIMLib.ErrorCode.SERVER_UNAVAILABLE:
                            info = '服务器不可用';
                            break;
                    }
                    console.log(errorCode);
                }
            });
        },
        /*
         *   对接收消息进行处理
         */
        receivedMsg: function(message) {
            var that = this;
            var content = RongIMLib.RongIMEmoji.symbolToHTML(message.content.content),
                sentTime = that.getIMTime(message.sentTime);

            /*存用户名&id&icon*/
            var
                i = 0,
                j = 0,
                haveUser = true,
                userStr =
                '                        <li class="clearfix">' +
                '                            <div class="icon f-lfet">' +
                '                                <img src="../assets/img/shang.jpg" alt="" >' +
                '                                <span class="read  curno"></span>' +
                '                            </div>' +
                '                            <div class="tit f-lfet">' +
                '                                <a href="javascript:;" class="customerName" data-id=' + message.senderUserId + ' data-name = ' + message.content.extra.name + ' data-icon = ' + message.content.extra.icon + '>' + message.content.extra.name + ' </a>' +
                '                                <span class="name">' + message.content.extra.company + '</span>' +
                '                            </div>' +
                '                        </li>';
            if ($(".user li").length == 0) {
                $(".user").prepend(userStr)
                that.historyFirstSub[message.senderUserId] = true; //存用户列表里每个第一次历史记录是否获取状态
            }
            var cuName = $(".user li");
            for (; i < cuName.length; i++) {
                if (message.senderUserId == cuName.eq(i).find(".customerName").attr("data-id")) {
                    cuName.eq(i).find(".read").addClass('curno');
                    haveUser = false;
                }
            }
            if (haveUser) {
                that.historyFirstSub[message.senderUserId] = true;
                $(".user").prepend(userStr)
            }
            // that.targetId = message.senderUserId
            for (; j < cuName.length; j++) {
                if (cuName.eq(j).hasClass('selec')) {
                    var cuId = cuName.eq(j).attr("data-id");
                    if (cuId == message.senderUserId) {
                        $(".chat-list").append("<li class='left left-tips'><span class='chart-text'>" + content + "</span><span class='time'>" + sentTime + "</span></li>");
                    }
                }
            }
            $(".content").scrollTop($('.content')[0].scrollHeight);
            /*存session or 存变量*/
            var str = "<li class='left left-tips'><span class='chart-text'>" + content + "</span><span class='time'>" + sentTime + "</span></li>";
            if (typeof that.currentObjSub[message.senderUserId] == "undefined") {
                that.currentObjSub[message.senderUserId] = str;
            } else {
                that.currentObjSub[message.senderUserId] += str;
            }
            // sessionStorage.setItem('' + message.senderUserId + '', '' + that.currentObjSub[message.senderUserId] + '');
            clearInterval(that.timer);
            that.twinkle()

        },
        twinkle: function() {
            var that = this;
            var step = 0;
            that.timer = setInterval(function() {
                step++;
                if ((step % 2) == 0) {
                    $(".twinkle").addClass('curno');
                } else {
                    $(".twinkle").removeClass('curno');
                }
            }, 500);
        },
        /*
         *   发送消息
         */
        sendMsg: function(conversationtype, targetId, msg) {
            var that = this;
            RongIMClient.getInstance().sendMessage(conversationtype, targetId, msg, {
                // 发送消息成功
                onSuccess: function(message) {
                    //message 为发送的消息对象并且包含服务器返回的消息唯一Id和发送消息时间戳
                    console.log("Send successfully");
                    //成功后
                    console.log(message)
                    that.sendSuccess(message)
                },
                onError: function(errorCode, message) {
                    var info = '';
                    switch (errorCode) {
                        case RongIMLib.ErrorCode.TIMEOUT:
                            info = '超时';
                            break;
                        case RongIMLib.ErrorCode.UNKNOWN_ERROR:
                            info = '未知错误';
                            break;
                        case RongIMLib.ErrorCode.REJECTED_BY_BLACKLIST:
                            info = '在黑名单中，无法向对方发送消息';
                            break;
                        case RongIMLib.ErrorCode.NOT_IN_DISCUSSION:
                            info = '不在讨论组中';
                            break;
                        case RongIMLib.ErrorCode.NOT_IN_GROUP:
                            info = '不在群组中';
                            break;
                        case RongIMLib.ErrorCode.NOT_IN_CHATROOM:
                            info = '不在聊天室中';
                            break;
                        default:
                            info = x;
                            break;
                    }
                    console.log('发送失败:' + info);
                }
            });
        },
        /*
         *   发送消息成功后
         */
        sendSuccess: function(message) {
            var that = this;
            var content = RongIMLib.RongIMEmoji.symbolToHTML(message.content.content),
                sentTime = that.getIMTime(message.sentTime);
            if (content == "") return false;
            that.domTalk.html("").focus();
            // $(".chat-list").append("<li class='left'><span class='name'>" + that.selfName + "</span><span class='time'>" + sentTime + "</span><br><span class='chart-text'>" + content + "</span></li>");
            $(".chat-list").append("<li class='right right-tips'><span class='chart-text'>" + content + "</span><span class='time'>" + sentTime + "</span></li>");
            var userName = $(".user .customerName"),
                i = 0;
            for (; i < userName.length; i++) {
                if (userName.eq(i).attr("data-id") == that.targetId) {
                    userName.eq(i).find(".read").removeClass('curno');
                };
            }
            /*存session  or  存变量*/
            // var str = "<li class='left'><span class='name'>" + message.content.extra.name + "</span><span class='time'>" + sentTime + "</span><br><span class='chart-text'>" + content + "</span></li>"
            var str = "<li class='right right-tips'><span class='chart-text'>" + content + "</span><span class='time'>" + sentTime + "</span></li>";
            if (typeof that.currentObjSub[that.targetId] == "undefined") {
                that.currentObjSub[that.targetId] = str;
            } else {
                that.currentObjSub[that.targetId] += str;
            }
            // sessionStorage.setItem('' + that.targetId + '', '' + that.currentObjSub[that.targetId] + '')
            $(".content").scrollTop($('.content')[0].scrollHeight);
        },
        /*
         *   获取融云返回时间戳的格式化时间
         */
        getIMTime: function(nS) {
            return new Date(parseInt(nS)).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
        },
        /*
         *  不同用户第一条历史记录的暂存标记
         */
        historyFirst: function() {},
        /*
         *  历史记录暂存区 
         */
        historyObj: function() {},
        /*
         *   当前聊天内容接收方暂存区
         */
        currentObj: function() {},
        /*
         *   获取融云返回的历史消息记录
         */
        getHistoryMessages: function() {
            var that = this;
            var conversationType = RongIMLib.ConversationType.PRIVATE, //私聊,其他会话选择相应的消息类型即可。
                targetId = that.targetId, // 想获取自己和谁的历史消息，targetId 赋值为对方的 Id。
                timestrap = null, // 默认传 null，若从头开始获取历史消息，请赋值为 0 ,timestrap = 0;
                count = 5; // 每次获取的历史消息条数，范围 0-20 条，可以多次获取。
            RongIMLib.RongIMClient.getInstance().getHistoryMessages(conversationType, targetId, timestrap, count, {
                onSuccess: function(list, hasMsg) {
                    // list => Message 数组。
                    // hasMsg => 是否还有历史消息可以获取。
                    var historyStr = "";
                    if (hasMsg) {
                        for (var i = 0, j = list.length; i < j; i++) {
                            var sentTime = that.getIMTime(list[i].sentTime),
                                content = RongIMLib.RongIMEmoji.symbolToHTML(list[i].content.content),
                                targetName = list[i].content.extra.name;
                            if (list[i].senderUserId == that.selfId) {
                                historyStr += "<li class='right right-tips'><span class='chart-text'>" + content + "</span><span class='time'>" + sentTime + "</span></li>"
                            } else {
                                historyStr += "<li class='left left-tips'><span class='chart-text'>" + content + "</span><span class='time'>" + sentTime + "</span></li>"
                            };
                        };
                        $(".chat-list-history").prepend(historyStr);
                        that.historyObjSub[that.targetId] = $(".chat-list-history").html();
                        // $(".chat-history-wrap").scrollTop($('.chat-history-wrap')[0].scrollHeight);
                    };
                },
                onError: function(error) {
                    console.log("GetHistoryMessages,errorcode:" + error);
                }
            });
        }
    }
    chart.init();
})(jQuery)
