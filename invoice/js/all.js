//全局变量
var config = {
    BaseUrl: 'http://139.199.194.37:81/InvoiceHead/',                               //发票接口前部分地址
    saveUserInfo:'http://139.199.194.37:81/User/UserAdd',                           //新增用户接口
    leagueLoginUrl:'http://gy.chinahotelhelp.com/apis/WX/html/userlogin.html',
    GetUserInfo:'http://139.199.194.37/api/Public/GetUserInfoByOpenID',     //根据openid获取用户信息
    getOpenid:'http://www.chinahotelhelp.com/api/Public/GetWxOpenIDByCode',         //根据code获取openid
    getOpenIdByCode:'http://139.199.194.37:81/User/PostWX',
    GetInvoiceHeadByCode: 'GetInvoiceHeadBycode',                                   //根据code获取发票抬头
    GetInvoiceHeadByBt: 'GetInvoiceHeadByBt',                                       //根据税号获取发票抬头
    OnLineQRCode: 'PostInvoice/OnLine',                                             //根据发票抬头生成在线二维码
    OffLineQRCode: 'PostInvoice/OffLine',                                           //根据发票抬头生成离线二维码
    QRCodeAnalysis: 'PostInvoice/Analysis',                                         //根据二维码信息解析
    UpdateInvoiceHead: 'PostInvoice/PostUpdateIncoiceHead',                         //修改发票抬头
    DeleteInvoiceHead: 'PostInvoice/PostDeleteIncoiveHead',                         //删除发票抬头数据
    GetSelectInvoiceList: 'GetInvoice/GetSelectInvoiceList',                        //查询列表
    GetSetInvoiceDefault: 'GetInvoice/GetSetInvoicedefault',                        //设置默认
    SelectUserDefault: 'PostInvoice/SelectUserDefault',                             //查询默认
    AddInvoiceHead: 'PostInvoice/PostAddIncoiceHeed',                               //新增发票抬头
    invoiceList: [],                                                                //本账户抬头列表数组
    defaultTx: '',                                                                  //默认抬头税号
    invoiceIndex: './invoice.html',                                                 //发票主界面
    queryPage: './query.html',                                                      //根据企业名称查询界面
    invoiceManagePage: './invoiceManage.html',                                      //发票抬头管理界面
    invoiceAddAndCheckPage: './addAndCheckInvoice.html',                            //添加和查看发票抬头界面
    invoiceCodePage: './invoiceCodePage.html',                                      //发票二维码界面
    userInfo: '',
    showCodeTax: '',                                              //显示二维码的抬头税号
    showCodeIdx: -1,                                              //显示二维码的抬头下标
    OnlineCodeImg:'',                                             //在线二维码图片数据
    OfflineCodeImg:'',                                            //离线二维码图片数据
}

$(function () {

//全局变量本地存储
    function objLocalSave(obj) {
        for (var key in obj) {
            localStorage.setItem(key, typeof obj[key] == 'string'?obj[key]:JSON.stringify(obj[key]))
        };
    }
    objLocalSave(config);
})
