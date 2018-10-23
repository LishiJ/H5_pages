//
function showAlert(_this, key, text, duration) {
    _this.errText = text;
    $('.alert-info>i').css({'background-image':'url('+(key=='succ'?'./img/Success.png':'./img/err.png')+')'})
    $('.alert-info').addClass('show');
    setTimeout(function () {
        $('.alert-info').removeClass('show');
    }, duration)
}
//
function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}
// var vConsole = new VConsole();
//
var luckyDrawJoin = avalon.define({
    $id: 'luckyDrawJoin',
    // 用户基本信息
    // 手机号或者验证码 错误标识
    phoneErr: false,
    codeErr: false,
    // 手机号和验证码
    phoneNum: '',
    // 重新获取验证码时间
    canGetCodeTime: 60,
    // 是否能获取验证码
    canGetCodeFlg: true,
    verificationCode: '',
    alertText:'活动将在发布会中进行~',
    // 手机验证规则
    regPhone: /^1[34578]\d{9}$/,     // /^((\+86)|(86))?(1[34578])\d{9}$/,
    errText: '',
    $computed: {
        countText: function () {
            return this.canGetCodeFlg ? '获取验证码' : '重新获取(' + this.canGetCodeTime + ')'
        }
    },
    toggleMask:function () {
      $(".mask").toggleClass('on')
    },
    numKeyUp: function () {
        this.phoneNum = this.phoneNum.replace(/\D|[a-zA-Z]/g, '');
        this.verificationCode = this.verificationCode.replace(/\D|[a-zA-Z]/g, '');

        if (this.phoneNum.length > 3) {
            this.phoneNum = this.phoneNum.replace(/\s*/g, "");
            if (this.phoneNum.length > 7) {
                if (this.phoneNum.replace(/\s/g, "").length > 11) {
                    this.phoneNum = this.phoneNum.replace(/\s/g, "").substr(0, 11);
                }
                this.phoneNum = this.phoneNum.replace(/^(...)(....)/g, "$1 $2 ");
            } else if (this.phoneNum.length > 3) {
                this.phoneNum = this.phoneNum.replace(/^(...)/g, "$1 ");
            }
        }

        // dom.value = phone;
    },
    getVerificationCode: function () {
        var _this = this;
        if (_this.canGetCodeFlg && _this.regPhone.test(_this.phoneNum.replace(/\s/g, ""))) {
            // 设置不能再次点击获取验证码 && 开始倒计时
            _this.canGetCodeFlg = false;
            _this.countDown();
            // 发送请求验证码
            $.ajax({
                type: "post",
                url: 'http://www.chinahotelhelp.com/api/Public/PhoneLoginSendPhoneVerification', // 跳转到 action
                async: true,
                data: {
                    Extend: _this.phoneNum.replace(/\s/g, "")
                },
                success: function (ret) {
                    if (ret.errorcode == 0) {
                        showAlert(_this, 'succ','已发送', 2000)
                    }else{
                        showAlert(_this, 'err',ret.message, 2000)
                    }
                }
            })
        } else if (_this.canGetCodeFlg) {
            // 手机号格式错误
            _this.phoneErr = true;
            showAlert(_this, 'err','请输入正确的手机号', 2000)
        }
    },
    sureBind: function () {
        var _this = this;
        if (!_this.regPhone.test(_this.phoneNum.replace(/\s/g, ""))) {
            // 手机号格式错误
            showAlert(_this, 'err','请输入正确的手机号', 2000)
        } else if (_this.verificationCode.length < 6) {
            // 验证码不正确
            showAlert(_this,'err', '验证码格式不正确', 2000)
        } else {
            //发送ajax请求
            $.ajax({
                url: 'http://www.chinahotelhelp.com/api/Public/InspectPhoneVerification', // 跳转到 action
                type: "post",
                async: true,
                data: {
                    Extend: _this.phoneNum.replace(/\s/g, ""),
                    Extend1: _this.verificationCode
                }
            }).done(function(data){
                //
                if(data.errorcode == 0){
                    if(JSON.parse(localStorage.getItem('canAddUserInfo')) ||localStorage.getItem('canAddUserInfo') == null){
                        var data = JSON.parse(localStorage.getItem('userInfo'));
                        $.ajax({
                            url:'http://139.199.194.37:81/User/UserinfoAdd',
                            type: "post",
                            data:{
                                Openid:data.openid,
                                Sex:data.sex,
                                Nickname:data.nickname,
                                Language:data.language,
                                City:data.city,
                                Province:data.province,
                                Country:data.country,
                                Headimgurl:data.headimgurl,
                                Subscribe_time:new Date(),
                                phone: _this.phoneNum.replace(/\s/g, "")
                            }
                        }).done(function (data) {
                            _this.toggleMask();
                            localStorage.setItem('canAddUserInfo',false)
                        }).fail(function (data) {
                            console.log(data)
                        })
                    }else{
                        _this.alertText = '您已参与抽奖~'
                        _this.toggleMask();
                    }

                }else{
                    showAlert(_this, 'err',data.message, 2000);
                }
            }).fail(function(data) {
                console.log(data)
                showAlert(_this, 'err','绑定手机失败，请退出重试', 2000)
            })
        }
    },
    countDown: function () {
        var timer = setInterval(function () {
            if (this.canGetCodeTime > 0) {
                this.canGetCodeTime--;
            } else {
                // 重置
                this.canGetCodeTime = 60;
                this.canGetCodeFlg = true;
                clearInterval(timer);
            }
        }.bind(this), 1000)
    }

});
// 页面加载完成时
luckyDrawJoin.$watch('onReady', function () {
    var _this = this;
    var code = GetQueryString('code');
    $.ajax({
        url:'http://139.199.194.37:81/User/PostWXNew?code='+code,
        type: "post"
    }).done(function (data) {
        data = JSON.parse(data.Message);
        $.ajax({
            url:'http://139.199.194.37:81/User/PostWXNew2?access_token='+data.access_token+'&openid='+data.openid,
            type: "post"
        }).done(function (data) {
            localStorage.setItem('userInfo',data.Message)
        }).fail(function (data) {
            console.log(data);
        })
    }).fail(function (data) {
        console.log(data)
    })
});