---
title: SIP学习笔记
date: 2018-02-04 00:15:12
tags: WebRTC
categories: 软件技术
---

通俗的说，SIP就是一个轻量级信令协议，它可以作为音频、视频、及时信息的信令。具体细节可以参看[这篇文章](http://www.cnblogs.com/gnuhpc/archive/2012/01/16/2323637.html),这里只是从前端的角度，做一个入门介绍。

## SIP依靠怎么运作？

既然SIP是建立在SMTP和HTTP上的，那么其消息格式也有巨大的相似度，但是注意到一个SIP会话的资源是通信资源，而不是页面或者网页资源，这是与HTTP不同的地方。一个身份或者叫做一个寻址体制必须在请求/响应集有效建立之前建立。

身份标识就是所谓的SIP URI（SIP Uniform Resource Indicator），其中包含了充足的信息来初始化一个会话。SIP URI与电子邮件地址类似，这也是借用了SMTP协议中的规定：典型的包含两部分，第一部分为用户名，第二部分为主机名，sip:huangpc@bupt.cn。 当然SIP URI还有其他的一些格式，比如在RFC 3261中引入的安全SIP URI：sips:huangpc@bupt.cn， 这个是在TCP上的TLS作为安全传输层的一种方式。

## 请求标识

定义了用户标识后，我们就可以定义请求的标识了——SIP中称为方法（Method）。其他的扩展方法在后续的RFC中都有定义。

- REGISTER: 用于与SIP服务器进行注册。

- INVITE: 用于表明用户或者服务器被邀请参与这个会话。这个消息体中将包含一个对被叫端的会话描述。

- ACK: 仅用了INVITE请求，表明收到请求。

- CANCEL: 用于取消一个pending 的请求。

- BYE: User Agent Client用户代理客户端发送，来告诉服务器它希望结束通话。

- OPTIONS: 向服务器查询它的能力。

定义完请求，很自然我们需要回应的语言规范：包含状态码和描述性短语。分为六类：

- 1xx: 暂时性回应，表明已经接收到，正在处理之中。

- 2xx: 成功回应，表明动作已经被接收，理解并且接受了。

- 3xx: 重定向回应，需要进一步的动作来处理处理这个请求。

- 4xx: 客户端错误回应，请求中语法不对，不能被服务器接受。

- 5xx: 服务器错误回应，服务器不能处理这个有效的请求。

- 6xx: 全局错误回应，这个请求不能被任何服务器接受。

你现在可能比较纳闷，这都是些关于SIP会话建立和拆除的部分，但关于这个会话中要传的文字、音视频等的格式等双方是怎么知道的呢？
在INVITE中，就带有了这些信息，这个信息的格式则又引出了另一个RFC，RFC 2327，会话描述协议（Session Description Protocol (SDP)）。

## SDP

RFC 2327专门注明了一些SDP能提供的比较关键的信息：

- 会话名和目的。

- 会话激活的时间。

- 构成会话的媒体。

怎么样接收这些媒体（地址、端口号、格式等）

一个比较复杂的例子：使用了代理服务器作为通信通路。SIP代理服务器代表其他的Client发起请求，并且在许多时候作为路由模式，将SIP请求转发给另一个距离最终目的地（也就是被叫端）较近的设备。因此，SIP代理服务器扮演着两个角色——在接收请求时是server角色，在发送请求时是client角色。注意，代理服务器必须可以解释一个SIP消息，并且需要的时候转发这条消息前对其进行重写，大的网络中可能有多个代理服务器。在RFC3261中的第四节中有个比较有趣的例子，描述了两个SIP终端通过两个代理服务器建立呼叫的过程。在这个例子中，两个终端位于两个不同的城市：Atlanta and Biloxi，因此是在两个相互隔离的网络中。每个网络有它自己的代理服务器，分别称为atlanta.com 和 biloxi.com。 若在Atlanta的Alice想呼叫在Biloxi的Bob，那么Alice的电话就会发送以下的INVITE消息给它的代理服务器atlanta.com：

> Via: SIP/2.0/UDP pc33.atlanta.com;branch=z9hG4bK776asdhds  
> Max-Forwards: 70  
> To: Bob  
> From: Alice ;tag=1928301774  
> Call-ID: a84b4c76e66710@pc33.atlanta.com  
> CSeq: 314159 INVITE  
> Contact:  
> Content-Type: application/sdp  
> Content-Length: 142  

当这个消息通过网络转到Bob后Bob要是愿意接受这个呼叫那么它就会返回一个OK，这个消息会先到biloxi.com 代理：

> SIP/2.0 200 OK  
> Via: SIP/2.0/UDP server10.biloxi.com  
> ;branch=z9hG4bKnashds8;received=192.0.2.3  
> Via: SIP/2.0/UDP bigbox3.site3.atlanta.com  
> ;branch=z9hG4bK77ef4c2312983.1;received=192.0.2.2  
> Via: SIP/2.0/UDP pc33.atlanta.com  
> ;branch=z9hG4bK776asdhds ;received=192.0.2.1  
> To: Bob ;tag=a6c85cf  
> From: Alice ;tag=1928301774  
> Call-ID: a84b4c76e66710@pc33.atlanta.com  
> CSeq: 314159 INVITE  
> Contact:  
> Content-Type: application/sdp  
> Content-Length: 131  

## [sip.js](https://sipjs.com/)

sip.js是一个基于jssip的库，用途是使用 WebRTC技术 + sip协议 实现网页中的视频音频通讯，sip.js的有优点是提供免费的[onsip服务器](https://www.onsip.com/)，下面是一个sip.js的实例

```javascript
!function() {

    if (!window.RTCPeerConnection) {
        alert('当前浏览器不支持，请更换升级chrome或火狐浏览器');
        return;
    }

    // 实例化sip对象
    var simple;

    // 用户名和URI
    var localURI, localName, localPassword, remoteURI, remoteName;

    // 按钮和弹窗
    var remoteAudio = document.getElementById('remoteAudio');
    var registerBtn = document.getElementById('register');
    var callBtn = document.getElementById('call');

    // 注册事件绑定
    registerBtn.onclick = register;

    // 拨号事件绑定
    callBtn.onclick = call;

    // 注册事件
    function register() {
        registerBtn.innerHTML = 'registering....';

        localPassword = document.getElementById('localPassword').value;
        localUri = document.getElementById('localUri').value;
        localName = localUri.replace(/@.+$/, '');

        var configuration = {
            media: {
                remote: {
                    // video: remoteVideo,
                    audio: remoteAudio
                }
            },
            ua: {
                traceSip: true,     // 控制台打印sip消息
                uri: localUri,      // 账号
                wsServers: ['wss://192.168.10.222:7443'],   // 通讯需要的websocket地址，不填则默认是onsip的服务器
                password: localPassword,    // 密码
                displayName: localName,
                userAgentString: SIP.C.USER_AGENT + " 192.168.10.222:7443"
            }
        };

        simple = new SIP.WebRTC.Simple(configuration);

        // 实例的监听事件
        simple.on('ended', function () {
            callBtn.innerHTML = 'call';
        });

        simple.on('connected', function () {
            callBtn.innerHTML = 'hang up';
        });

        simple.on('ringing', function () {
            simple.answer();
            callBtn.innerHTML = 'connecting.....';
        });

        simple.on('registered', function () {
            registerBtn.innerHTML = 'registered';
        });

        simple.on('registrationFailed', function () {
            console.log('registrationFailed.');
        });

        // Unregister the user agents and terminate all active sessions when the
        // window closes or when we navigate away from the page
        window.onunload = function () {
            simple.stop();
        };

    }

    // 拨号事件
    function call() {
        callBtn.innerHTML = 'calling....';

        remoteUri = document.getElementById('remoteUri').value;
        remoteName = remoteUri.replace(/@.+$/, '');
        // No current call up
        if (simple.state === SIP.WebRTC.Simple.C.STATUS_NULL ||
            simple.state === SIP.WebRTC.Simple.C.STATUS_COMPLETED) {
            simple.call(remoteUri);
        } else {
            simple.hangup();
        }
    }
}()
```