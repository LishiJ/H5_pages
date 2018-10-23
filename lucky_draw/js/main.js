//
var luckyDraw = avalon.define({
    $id: 'luckyDraw',
    btnMsg: '开始抽奖',
    showPhone: '',
    drawFlg: false,
    selectedIdx: 2,
    personCount:0,
    showPhoneList: [
    ],
    selectedPhoneList: [
        [],
        [],
        []
    ],
    // 获奖人数
    getAwardCount:[1,10,20],
        firstAwardList: [],
        secondAwardList: [],
        thirdAwardList: [],
    toggleMenu: function () {
        this.selectedIdx = this.selectedIdx == 0 ? 2 : (--this.selectedIdx)
    },
    toggleBtnMsg: function () {
        this.drawFlg = !this.drawFlg;
        this.btnMsg = this.drawFlg ? '停止抽奖' : '开始抽奖';
        if (this.drawFlg) {
            var _this = this;
            // 重新抽奖
            _this.showPhoneList.pushArray(_this.selectedPhoneList[_this.selectedIdx]);
            _this.selectedPhoneList[_this.selectedIdx].clear();
            // 开始抽奖
            timer = setInterval(function () {
                if (_this.showPhoneList != 0) {
                    shuffer(_this.showPhoneList)
                    _this.showPhone = _this.showPhoneList[0].phone;
                }
            }, 50);
        } else {
            clearInterval(timer)
            this.selectedPhoneList[this.selectedIdx].pushArray(this.showPhoneList.splice(0, this.getAwardCount[this.selectedIdx]))
        }
    }
})

luckyDraw.$watch('onReady',function () {
    var _this = this;
    $.ajax({
        url:'http://139.199.194.37:81/User/GetInvoice/GetSelectInvoiceList',
        type:'get'
    }).done(function (data) {
        _this.showPhoneList.pushArray(JSON.parse(data.Message));
        _this.showPhone = _this.showPhoneList[0].phone;
        _this.personCount = _this.showPhoneList.length;
    }).fail(function () {
        
    });

    /*global saveAs, self*/

    (function(view) {
        var
            document = view.document
            , $ = function(id) {
                return document.getElementById(id);
            }
            , text_options_form = $("text-options")
            , session = view.sessionStorage
            // only get URL when necessary in case Blob.js hasn't defined it yet
            , get_blob = function() {
                return view.Blob;
            }
        ;


        text_options_form.addEventListener("submit", function(event) {
            event.preventDefault();
            var BB = get_blob();
            saveAs(
                new BB(
                    [JSON.stringify(_this.selectedPhoneList)]
                    , {type: "text/plain;charset=" + document.characterSet}
                )
                , ('winners') + ".txt"
            );
        }, false);

    }(self));



});

function shuffer(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];//es6 写法

        /* es5 写法
        var temp = arr[j];
        arr[j]=arr[i];
        arr[i]=temp;
        */
    }
    return arr;
}

avalon.filters.phoneFilter = function (phone) {
    var reg = /^(\d{3})\d{4}(\d{4})$/;
    return ('' + phone.replace(/\s/g, "")).replace(reg, "$1 **** $2");
}