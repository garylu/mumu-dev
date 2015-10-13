// 请将 AppId 改为你自己的 AppId，否则无法本地测试
var appId = '2NoV7CLMeVkPpcPwjqnjilyV';

// 请换成你自己的一个房间的 conversation id（这是服务器端生成的）
var roomId = '5617515660b27db42c54e4a3';

// 每个客户端自定义的 id
var clientId = 'default';

// 用来存储 realtimeObject
var rt;

// 用来存储创建好的 roomObject
var room;

// 监听是否服务器连接成功
var firstFlag = true;

// 用来标记历史消息获取状态
var logFlag = false;

var printWall = document.getElementById('dialog-list');

var styleBtn = document.getElementById('color-btn');
var inputSend = document.getElementById('chat-box-input');
var emojiBtn = document.getElementById('face-btn');
var sendBtn = document.getElementById('send-btn');

// 拉取历史相关
// 最早一条消息的时间戳
var msgTime;

// start
function window_onload(){
  checkCookie();
  main();
  getHeight();
  console.log("有何建议请发邮件至lgy0305@163.com 谢谢＝。＝");
}

// 回车键亦可触发
// bindEvent(sendBtn, 'click', sendMsg);
// bindEvent(document.body, 'keydown', function(e) {
//   if (e.keyCode === 13) {
//     if (firstFlag) {
//       main();
//     } else {
//       sendMsg();
//     }
//   }
// });

styleBtn.onclick = function(){
  changeStyle('color1');
  setCookie('userStyle','color1',365);
};

function main() {
  // showLog('正在链接服务器，请等待。。。');
  clientId = uuid();

  if (!firstFlag) {
    rt.close();
  }

  // 创建实时通信实s例
  rt = AV.realtime({
    appId: appId,
    clientId: clientId,

    // 请注意，这里关闭 secure 完全是为了 Demo 兼容范围更大些
    // 具体请参考实时通信文档中的「其他兼容问题」部分
    // 如果真正使用在生产环境，建议不要关闭 secure，具体阅读文档
    // secure 设置为 true 是开启
    secure: false
  });

  // 监听连接成功事件
  rt.on('open', function() {
    firstFlag = false;
    showLog('连接成功＝。＝');

    // 获得已有房间的实例
    rt.room(roomId, function(object) {

      // 判断服务器端是否存在这个 room，如果存在
      if (object) {
        room = object;

        // 当前用户加入这个房间
        room.join(function() {

          // 获取成员列表
          room.list(function(data) {
            // showLog('当前 Conversation 的成员列表：', data);

            // 获取在线的 client（Ping 方法每次只能获取 20 个用户在线信息）
            rt.ping(data.slice(0, 20), function(list) {
              // showLog('当前在线的成员列表：', list);
            });

            var l = data.length;

            // 如果超过 500 人，就踢掉一个。
            if (l > 490) {
              room.remove(data[30], function() {
                // showLog('人数过多，踢掉： ', data[30]);
              });
            }

            // 获取聊天历史
            getLog(function() {
              printWall.scrollTop = printWall.scrollHeight;
              // showLog('连接成功＝。＝');
            });
          });

        });

        // 房间接受消息
        room.receive(function(data) {
          if (!msgTime) {
            // 存储下最早的一个消息时间戳
            msgTime = data.timestamp;
          }
          showMsg(data);
        });
      } else {
        // 如果服务器端不存在这个 conversation
        // showLog('服务器不存在这个 conversation，你需要创建一个。');

        // 创建一个新 room
        rt.room({
          // Room 的默认名字
          name: 'LeanCloud-Room',

          // 默认成员的 clientId
          members: [
            // 当前用户
            clientId
          ],
          // 创建暂态的聊天室（暂态聊天室支持无限人员聊天，但是不支持存储历史）
          // transient: true,
          // 默认的数据，可以放 Conversation 名字等
          attr: {
            test: 'demo2'
          }
        }, function(obj) {

          // 创建成功，后续你可以将 room id 存储起来
          room = obj;
          roomId = room.id;
          // showLog('创建一个新 Room 成功，id 是：', roomId);

          // 关闭原连接，重新开启新连接
          rt.close();
          main();
        });
      }
    });
  });

  // 监听服务情况
  rt.on('reuse', function() {
    showLog('服务器正在重连，请耐心等待。。。');
  });

  // 监听错误
  rt.on('error', function() {
    showLog('连接遇到错误。。。');
  });
}

function sendMsg() {

  // 如果没有连接过服务器
  if (firstFlag) {
    alert('请先连接服务器！');
    return;
  }
  var cls = inputSend.className;
  var text = inputSend.value;
  var val = text + "*(%" + cls;

  // 不让发送空字符
  if (!String(text).replace(/^\s+/, '').replace(/\s+$/, '')) {
    alert('空的发不出去＝。＝');
    return;
  }

  // 向这个房间发送消息，这段代码是兼容多终端格式的，包括 iOS、Android、Window Phone
  room.send({
    text: val
  }, {
    type: 'text'
  }, function(data) {

    // 发送成功之后的回调
    inputSend.value = '';
    // showLog('（' + formatTime(data.t) + '）  自己： ', val);
    showLog('', val);
    console.log(printWall.scrollTop, printWall.scrollHeight);
    printWall.scrollTop = printWall.scrollHeight;
  });

  // 发送多媒体消息，如果想测试图片发送，可以打开注释
  // room.send({
  //     text: '图片测试',
  //     // 自定义的属性
  //     attr: {
  //         a:123
  //     },
  //     url: 'https://leancloud.cn/images/static/press/Logo%20-%20Blue%20Padding.png',
  //     metaData: {
  //         name:'logo',
  //         format:'png',
  //         height: 123,
  //         width: 123,
  //         size: 888
  //     }
  // }, {
  //    type: 'image'
  // }, function(data) {
  //     console.log('图片数据发送成功！');
  // });
}

// 显示接收到的信息
function showMsg(data, isBefore) {
  var text = '';
  var from = data.fromPeerId;
  if (data.msg.type) {
    text = data.msg.text;
  } else {
    text = data.msg;
  }
  if (data.fromPeerId === clientId) {
    from = '自己';
  }
  if (String(text).replace(/^\s+/, '').replace(/\s+$/, '')) {
    // showLog('（' + formatTime(data.timestamp) + '）  ' + encodeHTML(from) + '： ', text, isBefore);
    showLog('', text, isBefore);
  }
}

// 拉取历史
bindEvent(printWall, 'scroll', function(e) {
  if (printWall.scrollTop < 10) {
    getLog();
  }
});

// 获取消息历史
function getLog(callback) {
  var height = printWall.scrollHeight;
  if (logFlag) {
    return;
  } else {
    // 标记正在拉取
    logFlag = true;
  }
  room.log({
    t: msgTime
  }, function(data) {
    logFlag = false;
    // 存储下最早一条的消息时间戳
    var l = data.length;
    if (l) {
      msgTime = data[0].timestamp;
    }
    for (var i = l - 1; i >= 0; i--) {
      showMsg(data[i], true);
    }
    if (l) {
      printWall.scrollTop = printWall.scrollHeight - height;
    }
    if (callback) {
      callback();
    }
  });
}

// demo 中输出代码
function showLog(msg, data, isBefore) {
  var datas= new Array();
  var colorStyle;
  var posStyle = "mine-reply";
  if (data) {
    // console.log(data);
    datas=data.split("*(%");
    // msg = msg + '<li class="' + datas[1] + ' mine-reply"><p>' + encodeHTML(JSON.stringify(datas[0])) + '</p></li>';
    msg = msg + encodeHTML(datas[0]);
    colorStyle = datas[1];
  }

  var p = document.createElement('p');
  p.innerHTML = msg;
  p.className += colorStyle + " " + posStyle;

  if (isBefore) {
    printWall.insertBefore(p, printWall.childNodes[0]);
  } else {
    printWall.appendChild(p);
  }
}
// 转译bug
function encodeHTML(source) {
  return String(source)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\\/g, '&#92;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatTime(time) {
  var date = new Date(time);
  var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
  var currentDate = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  var hh = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
  var mm = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  var ss = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
  return date.getFullYear() + '-' + month + '-' + currentDate + ' ' + hh + ':' + mm + ':' + ss;
}

function bindEvent(dom, eventName, fun) {
  if (window.addEventListener) {
    dom.addEventListener(eventName, fun);
  } else {
    dom.attachEvent('on' + eventName, fun);
  }
}

// cookie 获取样式
function getCookie(c_name) {
  if (document.cookie.length > 0) {
    c_start = document.cookie.indexOf(c_name + "=");
    if (c_start != -1) { 
      c_start = c_start + c_name.length+1;
      c_end = document.cookie.indexOf(";", c_start);
      if (c_end == -1) {
        c_end = document.cookie.length;
      }
      return unescape(document.cookie.substring(c_start, c_end));
    } 
  }
  return "";
}
function setCookie(c_name, value, expiredays) {
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + expiredays);
  document.cookie = c_name + "=" + escape(value) + ((expiredays==null) ? "" : ";expires=" + exdate.toGMTString());
}
function checkCookie(){
  userStyle=getCookie('userStyle');
  if (userStyle != null && userStyle != "") {
    changeStyle(userStyle); 
  } else {
    userStyle = "color6";
    if (userStyle!=null && userStyle!="")
    {
      setCookie('userStyle',userStyle,365);
    }
  }
}

// 更换class
function hasClass(obj, cls) {  
  return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));  
}  
function addClass(obj, cls) {  
  if (!this.hasClass(obj, cls)) obj.className += " " + cls;  
}  
function removeClass(obj, cls) {  
  if (hasClass(obj, cls)) {  
      var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');  
      obj.className = obj.className.replace(reg, ' ');  
  }  
}
function changeStyle(cls){
  var before = inputSend.className;
  removeClass(styleBtn, before);
  addClass(styleBtn, cls);
  removeClass(inputSend, before);
  addClass(inputSend, cls); 
  removeClass(emojiBtn, before);
  addClass(emojiBtn, cls); 
  removeClass(sendBtn, before);
  addClass(sendBtn, cls);
}

// 获取高度
function getHeight(){
  var height_screen = screen.height;
  var height = height_screen - 90;
  document.getElementById("dialog-list").style.height = height+"px";
  // document.getElementById("room-list").style.height = height+"px"; zheng???
}

// 生成uuid
function uuid() {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4";
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
  s[8] = s[13] = s[18] = s[23] = "-";
  var uuid = s.join("");
  return uuid;
}

function diaoyong(){
  alert("调用成功");
}
