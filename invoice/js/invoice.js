(function () {
    function changeRootFont() {
        var designWidth = 750, rem2px = 100;
        document.documentElement.style.fontsize =
            ((window.innerWidth / designWidth) * rem2px) + 'px';
        //iphone6: (375 / 750) * 100 + 'px';
    }

    changeRootFont();
    window.addEventListener('resize', changeRootFont, false);

    // 避免ajax重复提交
    var pendingRequests = {};
    jQuery.ajaxPrefilter(function (options, originalOptions, jqXHR) {
        var key = options.url;
        if (!pendingRequests[key]) {
            pendingRequests[key] = jqXHR;
        } else {
            // jqXHR.abort(); //放弃后触发的提交
            pendingRequests[key].abort(); // 放弃先触发的提交
        }
        var complete = options.complete;
        options.complete = function (jqXHR, textStatus) {
            pendingRequests[key] = null;
            if (jQuery.isFunction(complete)) {
                complete.apply(this, arguments);
            }
        };
    });

    // 只有IOS实现的功能在Android进行屏蔽
    if (mui.os.android) {
        var list = document.querySelectorAll('.ios-only');
        if (list) {
            for (var i = 0; i < list.length; i++) {
                list[i].style.display = 'none';
            }
        }
        //Android平台暂时使用slide-in-right动画
        if (parseFloat(mui.os.version) < 4.4) {
            aniShow = "slide-in-right";
        }
    }

    //过滤器
    avalon.filters.caseIf = function (flg) {
        return flg ? '默认抬头' : '设为默认'
    }
    avalon.filters.checkedIf = function (flg) {
        return flg ? 'checked' : ''
    }
})();

var config_data = {
    alertTitle: '酒店帮Hotel'
}

// var vConsole = new VConsole();

//首页
var invoice = avalon.define({
    $id: 'invoice',
    showInvoiceInfo: {},
    // 该版本不用
    funObjArr: [
        {
            id: '001',
            icon: 'img/cxqy.png',
            title: '查询企业',
            subTitle: '查看更多企业',
            jumpUrl: localStorage.getItem('queryPage')
        },
        {
            id: '.002',
            icon: 'img/fptt.png',
            title: '发票抬头',
            subTitle: '管理发票抬头',
            jumpUrl: localStorage.getItem('invoiceManagePage')
        }
    ],
    funItemArr: [
        {
            id: '001',
            icon: 'img/invoice_code.png',
            title: '开票码',
            jumpUrl: localStorage.getItem('invoiceCodePage')
        },
        {
            id: '.002',
            icon: 'img/scan_code.png',
            title: '发票抬头',
            jumpUrl: localStorage.getItem('invoiceManagePage')
        }
    ],
    toChildPage: function (url) {
        if (!$.isEmptyObject(JSON.parse(localStorage.getItem('userInfo'))))
            window.open(url, '_parent')
    },
    showCode: function (tax) {
        if (!$.isEmptyObject(JSON.parse(localStorage.getItem('userInfo')))) {
            if (tax != null && tax != '') {
                localStorage.setItem('showCodeTax', tax);
                window.open(localStorage.getItem('invoiceCodePage'), '_parent')
            } else {
                // 查询抬头列表
                var _data = {
                    UserIdentifier: JSON.parse(localStorage.getItem('userInfo')).Phone
                };
                $.ajax({
                    url: localStorage.getItem('BaseUrl') + localStorage.getItem('GetSelectInvoiceList'),
                    dataType: 'json',
                    data: _data,
                    type: 'GET'
                }).done(function (response) {
                    if (response.Message == '' || response.Message == null) {
                        var btnArray = ['点错了', '火速添加'];
                        mui.confirm('请先添加发票抬头', config_data.alertTitle, btnArray, function (e) {
                            if (e.index == 1)
                                window.open(localStorage.getItem('invoiceAddAndCheckPage'), '_parent');
                        })
                    } else {
                        // 将数据保存在config中 并 跳转页面
                        localStorage.setItem('invoiceList', response.Message)
                        // 请求默认抬头传递过去
                        $.ajax({
                            url: localStorage.getItem('BaseUrl') + localStorage.getItem('SelectUserDefault') + "?IUserTelephone=" + _data.UserIdentifier,
                            dataType: 'json',
                            type: 'POST',
                        }).done(function (res) {
                            if (res.Message != '' && res.Message != null) {
                                var _tax = JSON.parse(res.Message)[0].IHeadDefaultId;
                                if (_tax != '' && _tax != null) {
                                    // 有默认抬头
                                    localStorage.setItem('showCodeTax', JSON.parse(res.Message)[0].IHeadDefaultId);
                                    window.open(localStorage.getItem('invoiceCodePage'), '_parent');
                                } else {
                                    // 无默认抬头
                                    invoiceManage.setDefault(JSON.parse(localStorage.getItem('invoiceList'))[0].BusinessTax)
                                }
                            } else {
                                // 避免无默认抬头
                                mui.confirm('请先添加默认发票抬头', config_data.alertTitle, ['点错了', '火速添加'], function (e) {
                                    if (e.index == 1)
                                        window.open(localStorage.getItem('invoiceManagePage'), '_parent');
                                })
                            }
                        }).fail(function () {
                            mui.alert('服务器被你的颜值所征服，请稍后再试', config_data.alertTitle, function () {
                            });
                        })
                    }
                }).fail(function () {
                    mui.alert('服务器被你的颜值所征服，请稍后再试', config_data.alertTitle, function () {
                    });
                })
            }
        }
    }
});

invoice.$watch('onReady', function () {
    //获取当前地址参数
    function GetQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }

    var code = GetQueryString('code');
    var APPID = 'wxb37c82d303e5a0fb';
    var REDIRECT_URI = 'http://www.chinahotelhelp.com/Apis/WX/invoice/invoice.html';
    var url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + APPID + "&redirect_uri=" + REDIRECT_URI + "&response_type=code&scope=snsapi_base";
    if (code == '' || code == null) {
        // 判断是否已登录
        location.href = url;
    } else {
        if (code != localStorage.getItem('WXcode')) {
            localStorage.setItem('WXcode', code);
            $.ajax({
                url: localStorage.getItem('getOpenIdByCode') + '?code=' + localStorage.getItem('WXcode'),
                type: "post",
                dataType: 'json'
            }).done(function (data) {
                var data = JSON.parse(data.Message);
                if (data.openid != "" && data.openid != null) {
                    localStorage.setItem('userOpenId', data.openid);
                    $.ajax({
                        url: localStorage.getItem('GetUserInfo'),
                        type: "post",
                        dataType: "json",
                        async: true,
                        data: {
                            Extend: data.openid
                        }
                    }).done(function (data) {
                        if (data.resultdata == '' || data.resultdata == null || data.resultdata.Phone == '' || data.resultdata.Phone == null) {
                            mui.alert('用户信息获取失败，请退出重试', config_data.alertTitle, function () {
                            });
                        } else {
                            localStorage.setItem('userInfo', JSON.stringify(data.resultdata));
                            // 发送ajax请求保存用户信息
                            $.ajax({
                                url: localStorage.getItem('saveUserInfo'),
                                dataType: 'json',
                                data: {
                                    IUserTelephone: data.resultdata.Phone,
                                    IUserEmail: data.resultdata.Email == null ? '' : data.resultdata.Email
                                },
                                type: 'POST'
                            }).done(function () {
                            }).fail(function () {
                                mui.alert('用户登录失败，请稍后再试', config_data.alertTitle, function () {
                                });
                            })
                        }
                    }).fail(function () {
                        mui.alert('用户登录失败，请稍后再试', config_data.alertTitle, function () {
                        });
                    })
                } else {
                    mui.alert('用户信息获取失败，请退出重试', config_data.alertTitle, function () {
                    });
                }
            }).fail(function () {
                mui.confirm('请先进行会员登录后使用', config_data.alertTitle, ['暂时不用', '火速登录'], function (e) {
                    if (e.index == 1) {
                        window.open('http://gy.chinahotelhelp.com/apis/WX/html/userlogin.html?url=' + REDIRECT_URI.slice(7), '_parent')
                    }
                    else
                        WeixinJSBridge.call('closeWindow');
                })
            })
        } else {
            $.ajax({
                url: localStorage.getItem('GetUserInfo'),
                type: "post",
                dataType: "json",
                async: true,
                data: {
                    Extend: localStorage.getItem('userOpenId')
                }
            }).done(function (data) {
                if (data.resultdata == '' || data.resultdata == null || data.resultdata.Phone == '' || data.resultdata.Phone == null) {
                    mui.alert('用户登录失败，请稍后再试', config_data.alertTitle, function () {
                    });
                } else {
                    localStorage.setItem('userInfo', JSON.stringify(data.resultdata));
                }
            }).fail(function () {
                mui.alert('用户登录失败，请稍后再试', config_data.alertTitle, function () {
                });
            })
        }
    }
})
//根据企业名称查询
var query = avalon.define({
    $id: 'query',
    searchKeyWord: '',
    clearIptVal: function () {
        query.searchKeyWord = ''
    },
    keySearch: function () {
    }
});

/*
 * 抬头管理页面
 */
var invoiceManage = avalon.define({
    $id: 'invoiceManage',
    hasInvoice: false,
    defaultTx: '',
    _invoiceList: JSON.parse(localStorage.getItem('invoiceList')),
    /*
     * 添加抬头按钮点击事件
     * @param idx {Int} 抬头数据所在_invoiceList数组下标
     */
    addAndCheckTt: function (idx) {
        window.open(localStorage.getItem('invoiceAddAndCheckPage') + '?index=' + idx, '_parent')
    },
    /*
     *  删除抬头事件
     */
    deleteInvoice: function (tax, idx) {
        var _data = {
            UserIdentifier: JSON.parse(localStorage.getItem('userInfo')).Phone,
            BusinessTax: tax
        }
        var btnArray = ['点错了', '狠心删除'];
        mui.confirm('你确定要删除吗？', config_data.alertTitle, btnArray, function (e) {
            if (e.index == 1) {
                $.ajax({
                    url: localStorage.getItem('BaseUrl') + localStorage.getItem('DeleteInvoiceHead') + "?UserIdentifier=" + _data.UserIdentifier + "&BusinessTax=" + _data.BusinessTax,
                    dataType: 'json',
                    type: 'POST'
                }).done(function (response) {
                    mui.toast('删除成功');
                    // 将本地对应数据删除
                    invoiceManage._invoiceList.removeAt(idx);
                    localStorage.setItem('invoiceList', JSON.stringify(invoiceManage._invoiceList));
                    // 判断是否还有抬头
                    var _invoiceList = JSON.parse(localStorage.getItem('invoiceList'));
                    if (_invoiceList.length >= 1 && invoiceManage.defaultTx === tax) {
                        invoiceManage.setDefault(_invoiceList[0].BusinessTax);
                    }
                }).fail(function (response) {
                    mui.alert('服务器被你的颜值所征服，请稍后再试', config_data.alertTitle, function () {
                    });
                })
            }
        })
    }
    ,
    /*
     * 设置默认抬头事件
     */
    setDefault: function (bTax) {
        // 发送ajax请求修改默认
        var _config = {
            IUserTelephone: JSON.parse(localStorage.getItem('userInfo')).Phone,
            BusinessTax: bTax
        }
        $.ajax({
            type: 'GET',
            url: localStorage.getItem('BaseUrl') + localStorage.getItem('GetSetInvoiceDefault'),
            data: _config,
            dataType: 'json'
        }).done(function (response) {
            // 修改当前默认抬头
            localStorage.setItem('defaultTx', bTax);
            invoiceManage.defaultTx = bTax;
        }).fail(function (response) {
            mui.alert('服务器被你的颜值所征服，请稍后再试', config_data.alertTitle, function () {
            });
        })
    },
    toCodePage: function (tax) {
        invoice.showCode(tax)
    }
});

//
invoiceManage.$watch('onReady', function () {
    // 查询抬头列表
    var _data = {
        UserIdentifier: JSON.parse(localStorage.getItem('userInfo')).Phone
    }
    $.ajax({
        url: localStorage.getItem('BaseUrl') + localStorage.getItem('GetSelectInvoiceList') + '?timeHash=' + new Date().getTime(),
        dataType: 'json',
        data: _data,
        type: 'GET'
    }).done(function (response) {
        if (response.Message != '' && response.Message != null) {
            localStorage.setItem('invoiceList', response.Message);
            invoiceManage._invoiceList = JSON.parse(response.Message);
            // 判断是否只有一条数据
            if (invoiceManage._invoiceList.length === 1) {
                // 只有一条数据，手动设置其为默认
                invoiceManage.setDefault(invoiceManage._invoiceList[0].BusinessTax)
            } else if (invoiceManage._invoiceList.length != 0) {// 查询默认
                var __data = {
                    IUserTelephone: JSON.parse(localStorage.getItem('userInfo')).Phone
                }
                $.ajax({
                    url: localStorage.getItem('BaseUrl') + localStorage.getItem('SelectUserDefault') + "?IUserTelephone=" + __data.IUserTelephone,
                    dataType: 'json',
                    type: 'POST',
                }).done(function (response) {
                    if (response.Message != '' && response.Message != null) {
                        localStorage.setItem('defaultTx', JSON.parse(response.Message)[0].IHeadDefaultId);
                        invoiceManage.defaultTx = localStorage.getItem('defaultTx');
                    }
                }).fail(function () {
                    mui.alert('服务器被你的颜值所征服，请稍后再试', config_data.alertTitle, function () {
                    });
                })
            }
        }
    }).fail(function () {
        mui.alert('服务器被你的颜值所征服，请稍后再试', config_data.alertTitle, function () {
        });
    })
})

/*
 * 添加/查看抬头信息页面
 */

// 注册动画
avalon.effect('slide', {});
var addCheckInvoice = avalon.define({
    $id: 'addCheckInvoice',
    sixTaxCode: '',
    idx: -1,
    action: 'enter',
    stepArrL: [
        {
            icon: './img/no1.png',
            msg: '点击下方按钮，选择【查询企业】',
            img: './img/pic_1.png',
            link: 'http://url.cn/4EYCBMR'
        },
        {
            icon: './img/no2.png',
            msg: '搜索企业名称进行选择',
            img: './img/pic_2.png',
        },
        {
            icon: './img/no3.png',
            msg: '复制开票代码，在本页面粘贴，点击【查询】即可',
            img: './img/pic_3.png',
        }
    ],
    invoiceData: {
        CorporateName: '',
        BusinessTax: '',
        DetailedAddress: '',
        RegisteredTelephone: '',
        BankOfDeposit: '',
        AccountNumber: '',
        UserEmil: ''
    },
    reg: {
        regTax: /^[A-Z0-9]{15}$|^[A-Z0-9]{17}$|^[A-Z0-9]{18}$|^[A-Z0-9]{20}$/,
        regEmail: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
        regPhone: /(^(\d{3,4}[-]*)?\d{7,8})$|(^((\+86)|(86))?(1[34578])\d{9}$)/
    },
    /*
     * 验证格式是否正确
     */
    regFormat: function (reg, key) {
        if (reg.test(this.invoiceData[key]))
            return true
        else
            return false
    },
    /*
     * 确认按钮点击触发事件
     * @returns {boolean}
     */
    updateInvoice: function () {
        // 判断本地是否已有该税号
        var _invoiceList = JSON.parse(localStorage.getItem('invoiceList'));
        for (var i = 0; i < _invoiceList.length; i++) {
            if (_invoiceList[i].BusinessTax == addCheckInvoice.invoiceData.BusinessTax){
                addCheckInvoice.idx = 1;
                break
            }
            else
                addCheckInvoice.idx = -1;
        }


        var _config = {
            InvoiceHeadId: addCheckInvoice.idx >= 0 ? addCheckInvoice.invoiceData.InvoiceHeadId : '',
            Code: addCheckInvoice.idx >= 0 ? addCheckInvoice.invoiceData.Code : '',
            UserIdentifier: JSON.parse(localStorage.getItem('userInfo')).Phone,
            CorporateName: addCheckInvoice.invoiceData.CorporateName,
            BusinessTax: addCheckInvoice.invoiceData.BusinessTax,
            DetailedAddress: addCheckInvoice.invoiceData.DetailedAddress,
            RegisteredTelephone: addCheckInvoice.invoiceData.RegisteredTelephone,
            BankOfDeposit: addCheckInvoice.invoiceData.BankOfDeposit,
            AccountNumber: addCheckInvoice.invoiceData.AccountNumber,
            UserEmil: addCheckInvoice.invoiceData.UserEmil,
        }
        // 判断参数是否为空
        if (_config.CorporateName == '' || _config.BusinessTax == '' || _config.CorporateName == null || _config.BusinessTax == null) {
            mui.toast("请填写完整的企业信息");
            return false;
        }
        // 判断税号格式是否正确
        if (!this.regFormat(this.reg.regTax, 'BusinessTax')) {
            mui.alert('请输入正确的企业税号', config_data.alertTitle, function () {
            });
            return false
        } else if (!this.regFormat(this.reg.regPhone, 'RegisteredTelephone') && _config.RegisteredTelephone != '' && _config.RegisteredTelephone != null) {
            mui.alert('请输入正确的手机号', config_data.alertTitle, function () {
            });
            return false
        } else if (!this.regFormat(this.reg.regEmail, 'UserEmil') && _config.UserEmil != '' && _config.UserEmil != null) {
            mui.alert('请输入正确的邮箱', config_data.alertTitle, function () {
            });
            return false
        }
        $.ajax({
            url: localStorage.getItem('BaseUrl') + ((addCheckInvoice.idx >= 0) ? localStorage.getItem('UpdateInvoiceHead') : localStorage.getItem('AddInvoiceHead')),
            type: 'POST',
            dataType: 'json',
            data: _config,
        }).done(function (response) {
            // 提示信息
            mui.toast("保存成功");
            //跳转页面
            window.open(localStorage.getItem('invoiceManagePage'), '_parent')
        }).fail(function (response) {
            mui.alert('服务器被你的颜值所征服，请稍后再试', config_data.alertTitle, function () {
            });
        })
    },
    /*
     * 根据6位开票码查询开票信息
     */
    checkTaxInfo: function () {
        if (addCheckInvoice.sixTaxCode != null && addCheckInvoice.sixTaxCode != '') {
            var _config = {
                code: addCheckInvoice.sixTaxCode
            }
            $.ajax({
                url: localStorage.getItem('BaseUrl') + localStorage.getItem('GetInvoiceHeadByCode'),
                type: 'GET',
                dataType: 'json',
                data: _config,
            }).done(function (response) {
                var res = JSON.parse(response.Message);
                if (res.code === 'S0000') {
                    var _data = res.result;
                    var _invoiceData = {
                        InvoiceHeadId: '',
                        Code: _data.code,
                        UserIdentifier: JSON.parse(localStorage.getItem('userInfo')).Phone,
                        CorporateName: _data.kpName,
                        BusinessTax: _data.kpCode,
                        DetailedAddress: _data.kpAddr,
                        RegisteredTelephone: _data.kpTel,
                        BankOfDeposit: _data.accountBlank,
                        AccountNumber: _data.bankAccount,
                        UserEmil: '',
                    };
                    addCheckInvoice.invoiceData = _invoiceData;
                } else {
                    mui.alert('请输入正确的6位开票码', config_data.alertTitle, function () {
                    });
                }
            }).fail(function () {
                mui.alert('服务器被你的颜值所征服，请稍后再试', config_data.alertTitle, function () {
                });
            })
        } else
            mui.alert('请输入正确的6位开票码', config_data.alertTitle, function () {
            });
    },
    onReady: function () {
    }
})

addCheckInvoice.$watch('onReady', function () {
    // 将提示步骤隐藏 避免刚载入页面时的动画
    if (this.action == 'enter') {
        $('.getCodeStep').css('display', 'none');
    }
    // 监听变量
    this.$watch('action', function (a) {
        if (a == 'leave') {
            $('body,html').animate({scrollTop: 0}, 10)
            $('body,html').css({
                height: '100%',
                overflow: 'hidden'
            })
        } else {
            $('body').css({
                height: 'auto',
                overflow: 'auto'
            })
        }
    })

    // 查看是添加还是修改
    addCheckInvoice.idx = location.href.split('=')[1];
    addCheckInvoice.invoiceData = (addCheckInvoice.idx >= 0) ? JSON.parse(localStorage.getItem('invoiceList'))[addCheckInvoice.idx] : addCheckInvoice.invoiceData;

    // 用户表单操作效果
    var itemIpts = $(".tt-info-item input");
    itemIpts.bind('focus keyup', function () {
        var $this = $(this);
        // 隐藏其他input的close按钮
        itemIpts.not($this).next('i').removeClass('on')
        // 是否显示close按钮
        if ($this.val())
            $this.next('i').addClass('on')
        else
            $this.next('i').removeClass('on')
        // button按钮是否可点击
        if ($(this).hasClass('iptRequire')) {
            $(".iptRequire").each(function () {
                if ($(this).val() === '')
                    return false
            })
        }
        addCheckInvoice.invoiceData
        var _requireData = {
            CorporateName: addCheckInvoice.invoiceData.CorporateName,
            BusinessTax: addCheckInvoice.invoiceData.BusinessTax
        }
        for (var key in _requireData) {
            if (_requireData[key] == "" || null) {
                $('.sure-tt').removeClass('on');
                return false;
            }
        }
        // 否则可点击
        $('.sure-tt').addClass('on');
    })
    // 清楚按钮点击
    $(".tt-info-item i").click(function () {
        var $this = $(this);
        addCheckInvoice.invoiceData[$this.prev('input')[0].dataset.identification] = '';
        $this.removeClass('on')
        if ($this.prev().hasClass('iptRequire'))
            $('.sure-tt').removeClass('on');
    })

});


/*
 * 发票抬头二维码
 */
var invoiceCode = avalon.define({
    $id: 'invoiceCode',
    onlineCode: true,
    codeUrl: '',
    showCodeInvoice: {},
    showCodeFun: function (data, flg) {
        $.ajax({
            type: 'POST',
            dataType: 'json',
            data: data,
            url: localStorage.getItem('BaseUrl') + (flg ? localStorage.getItem('OnLineQRCode') : localStorage.getItem('OffLineQRCode'))
        }).done(function (response) {
            invoiceCode.codeUrl = response.Message;
        }).fail(function () {
            mui.alert('服务器被你的颜值所征服，请稍后再试', config_data.alertTitle, function () {
            });
        })
    },
    toggleOnOffLineCode: function () {
        invoiceCode.onlineCode = !invoiceCode.onlineCode;
        var _data = {
            InvoiceHeadId: invoiceCode.showCodeInvoice.InvoiceHeadId,
            Code: invoiceCode.showCodeInvoice.Code,
            CorporateName: invoiceCode.showCodeInvoice.CorporateName,
            BusinessTax: invoiceCode.showCodeInvoice.BusinessTax,
            DetailedAddress: invoiceCode.showCodeInvoice.DetailedAddress,
            RegisteredTelephone: invoiceCode.showCodeInvoice.RegisteredTelephone,
            BankOfDeposit: invoiceCode.showCodeInvoice.BankOfDeposit,
            AccountNumber: invoiceCode.showCodeInvoice.AccountNumber,
            UserIdentifier: invoiceCode.showCodeInvoice.UserIdentifier,
            UserEmil: invoiceCode.showCodeInvoice.UserEmil,
        }
        invoiceCode.showCodeFun(_data, invoiceCode.onlineCode)
    },
    editInvoice: function (tax) {
        var _invoiceList = JSON.parse(localStorage.getItem('invoiceList'));
        for (var i = 0; i < _invoiceList.length; i++) {
            if (_invoiceList[i].BusinessTax === tax) {
                invoiceManage.addAndCheckTt(i)
            }
        }
    },
    toggleCheckMore: function (e) {
        if (e.currentTarget == e.toElement || $(e.toElement).hasClass('close-company-info'))
            $(".company-more-info").toggleClass('on')
    }
})
invoiceCode.$watch('onReady', function () {
// 动画效果
    avalon.effect('fade')
    // 根据企业税号获取发票抬头
    var _data = {
        BusinessTax: localStorage.getItem('showCodeTax')
    }
    $.ajax({
        type: 'GET',
        dataType: 'json',
        data: _data,
        url: localStorage.getItem('BaseUrl') + localStorage.getItem('GetInvoiceHeadByBt'),
    }).done(function (response) {
        if (response.Message != '' && response.Message != null) {
            invoiceCode.showCodeInvoice = JSON.parse(response.Message).Tables[0];
            // 根据发票抬头信息生成在线二维码
            var __data = {
                InvoiceHeadId: invoiceCode.showCodeInvoice.InvoiceHeadId,
                Code: invoiceCode.showCodeInvoice.Code,
                CorporateName: invoiceCode.showCodeInvoice.CorporateName,
                BusinessTax: invoiceCode.showCodeInvoice.BusinessTax,
                DetailedAddress: invoiceCode.showCodeInvoice.DetailedAddress,
                RegisteredTelephone: invoiceCode.showCodeInvoice.RegisteredTelephone,
                BankOfDeposit: invoiceCode.showCodeInvoice.BankOfDeposit,
                AccountNumber: invoiceCode.showCodeInvoice.AccountNumber,
                UserIdentifier: invoiceCode.showCodeInvoice.UserIdentifier,
                UserEmil: invoiceCode.showCodeInvoice.UserEmil,
            }
            invoiceCode.showCodeFun(__data, true);
        }
    }).fail(function () {
        mui.alert('服务器被你的颜值所征服，请稍后再试', config_data.alertTitle, function () {
        });
    })
})
