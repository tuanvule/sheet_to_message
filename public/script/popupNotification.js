const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

export const popupNotification = {
    notifi_list: "",
    popupNotification: "",
    popupNotification_result: "",
    popupNotification_message: "",
    token_show_token: "",

    no_btn: "",
    yes_btn: "",

    Reset() {
        this.popupNotification_result.className = "popupNotification_result"
        this.ShowMessage("")
    },

    GetElement(type) {
        this.popupNotification = $(".popupNotification")
        this.popupNotification_message = $(".popupNotification_message")
        switch (type) {
            case "getPerm":
                this.popupNotification_result = $(".popupNotification_result")
                this.token_show_token = $(".token_show_token")
                break;
            case "YESNO":
                this.no_btn = $(".popupNotification_decision_box-no")
                this.yes_btn = $(".popupNotification_decision_box-yes")
                break
            default:
                this.popupNotification_result = $(".popupNotification_result")
                break;
        }
    },

    AddGetPermNotificationThemplate() {
        // Tạo div.popupNotification
        const popupNotification = document.createElement("div");
        popupNotification.className = "popupNotification";

        // Tạo div.popupNotification_main
        const popupMain = document.createElement("div");
        popupMain.className = "popupNotification_main";

        // Tạo div.popupNotification_exit
        const popupExit = document.createElement("div");
        popupExit.className = "popupNotification_exit";

        // Thêm icon x
        const exitIcon = document.createElement("i");
        exitIcon.className = "fa-solid fa-x";
        popupExit.appendChild(exitIcon);

        // Tạo div.popupNotification_result.loading
        const popupResult = document.createElement("div");
        popupResult.className = "popupNotification_result loading";

        // Tạo div.loader
        const loader = document.createElement("div");
        loader.className = "loader";

        // Tạo div.success
        const success = document.createElement("div");
        success.className = "success";
        const successIcon = document.createElement("i");
        successIcon.className = "fa-solid fa-circle-check";
        success.appendChild(successIcon);

        // Tạo div.fail
        const fail = document.createElement("div");
        fail.className = "fail";
        const failIcon = document.createElement("i");
        failIcon.className = "fa-solid fa-circle-xmark";
        fail.appendChild(failIcon);

        // Thêm loader, success, fail vào popupResult
        popupResult.appendChild(loader);
        popupResult.appendChild(success);
        popupResult.appendChild(fail);

        // Tạo h2.popupNotification_message
        const message = document.createElement("h2");
        message.className = "popupNotification_message";
        message.textContent = "Get Perm successfully";

        // Tạo h3.token_show
        const tokenShow = document.createElement("h3");
        tokenShow.className = "token_show";

        // Tạo div.token_show_title
        const tokenTitle = document.createElement("div");
        tokenTitle.className = "token_show_title";
        tokenTitle.textContent = "Your token is:";

        // Tạo div.token_show_token
        const tokenValue = document.createElement("div");
        tokenValue.className = "token_show_token";

        // Thêm tokenTitle và tokenValue vào tokenShow
        tokenShow.appendChild(tokenTitle);
        tokenShow.appendChild(tokenValue);

        // Gắn các thành phần vào popupMain
        popupMain.appendChild(popupExit);
        popupMain.appendChild(popupResult);
        popupMain.appendChild(message);
        popupMain.appendChild(tokenShow);

        // Gắn popupMain vào popupNotification
        popupNotification.appendChild(popupMain);

        // Cuối cùng, thêm vào body hoặc container mong muốn
        document.body.appendChild(popupNotification);

    },

    AddYESNONotificationThemplate() {
        // Tạo div.popupNotification
        const popupNotification = document.createElement("div");
        popupNotification.className = "popupNotification";

        // Tạo div.popupNotification_main
        const popupMain = document.createElement("div");
        popupMain.className = "popupNotification_main";

        // Tạo div.popupNotification_exit
        const popupExit = document.createElement("div");
        popupExit.className = "popupNotification_exit";

        // Thêm icon x
        const exitIcon = document.createElement("i");
        exitIcon.className = "fa-solid fa-x";
        popupExit.appendChild(exitIcon);

        // Tạo div.spacing
        const spacing = document.createElement("div");
        spacing.className = "spacing";

        // Tạo h2.popupNotification_message
        const message = document.createElement("h2");
        message.className = "popupNotification_message";
        // Nếu bạn muốn gán text ban đầu, thêm:
        // message.textContent = "Your message here";

        // Tạo div.popupNotification_decision_box
        const decisionBox = document.createElement("div");
        decisionBox.className = "popupNotification_decision_box";

        // Tạo div.popupNotification_decision_box-no
        const decisionNo = document.createElement("div");
        decisionNo.className = "popupNotification_decision_box-no";
        decisionNo.textContent = "Hủy";

        // Tạo div.popupNotification_decision_box-yes
        const decisionYes = document.createElement("div");
        decisionYes.className = "popupNotification_decision_box-yes";
        decisionYes.textContent = "OK";

        // Thêm no và yes vào decisionBox
        decisionBox.appendChild(decisionNo);
        decisionBox.appendChild(decisionYes);

        // Gắn tất cả vào popupMain
        popupMain.appendChild(popupExit);
        popupMain.appendChild(spacing);
        popupMain.appendChild(message);
        popupMain.appendChild(decisionBox);

        // Gắn popupMain vào popupNotification
        popupNotification.appendChild(popupMain);

        // Thêm popupNotification vào body hoặc container mong muốn
        document.body.appendChild(popupNotification);
    },

    AddDefaultNotificationThemplate() {
        // Tạo div.popupNotification
        const popupNotification = document.createElement("div");
        popupNotification.className = "popupNotification";

        // Tạo div.popupNotification_main
        const popupMain = document.createElement("div");
        popupMain.className = "popupNotification_main";

        // Tạo div.popupNotification_exit
        const popupExit = document.createElement("div");
        popupExit.className = "popupNotification_exit";

        // Thêm icon x
        const exitIcon = document.createElement("i");
        exitIcon.className = "fa-solid fa-x";
        popupExit.appendChild(exitIcon);

        // Tạo div.popupNotification_result.loading
        const popupResult = document.createElement("div");
        popupResult.className = "popupNotification_result loading";

        // Tạo div.loader
        const loader = document.createElement("div");
        loader.className = "loader";

        // Tạo div.success
        const success = document.createElement("div");
        success.className = "success";
        const successIcon = document.createElement("i");
        successIcon.className = "fa-solid fa-circle-check";
        success.appendChild(successIcon);

        // Tạo div.fail
        const fail = document.createElement("div");
        fail.className = "fail";
        const failIcon = document.createElement("i");
        failIcon.className = "fa-solid fa-circle-xmark";
        fail.appendChild(failIcon);

        // Thêm loader, success, fail vào popupResult
        popupResult.appendChild(loader);
        popupResult.appendChild(success);
        popupResult.appendChild(fail);

        // Tạo h2.popupNotification_message
        const message = document.createElement("h2");
        message.className = "popupNotification_message";
        // Nếu muốn thêm text ban đầu:
        // message.textContent = "Your message here";

        // Gắn các phần tử vào popupMain
        popupMain.appendChild(popupExit);
        popupMain.appendChild(popupResult);
        popupMain.appendChild(message);

        // Gắn popupMain vào popupNotification
        popupNotification.appendChild(popupMain);

        // Thêm popupNotification vào body hoặc container mong muốn
        document.body.appendChild(popupNotification);

    },

    Init(type) {
        switch(type) {
            case "getPerm":
                this.AddGetPermNotificationThemplate()
                this.GetElement("getPerm")
                break
            case "YESNO":
                this.AddYESNONotificationThemplate()
                this.GetElement("YESNO")
                break
            default: 
                this.AddDefaultNotificationThemplate()
                this.GetElement()
                break
        }
        this.GetElement(type)
        $(".popupNotification_exit").onclick = () => this.Exit();
    },

    ShowGetPermSatus(status, token="") {
        if(!this.popupNotification) this.Init("getPerm")
        switch (status) {
            case "success":
                this.Success("thành công")
                this.Show_token(token)
                break
            case "fail":
                this.Fail("Chưa lấy được token, vui lòng thử lại")
                break
            case "loading":
                this.Loading("Get Perm ...")
                break
            case "failWithNoNotifiPerm":
                this.Fail()
                this.Show_token("Hệ thống không được hỗ trợ nếu không được cấp quyền thông báo, xin hãy bật quyền")
                break
            case "failWithoughtAccount":
                this.Fail("Bạn chưa có tài khoản, vui lòng đăng nhập hoặc tham gia với người dùng khác")
            default:

                break
        }
    },

    ShowYesNoNotification(message, callbackIfOK) {
        // if(!this.popupNotification) this.Init("YESNO")
        this.ShowMessage(message)
        this.no_btn.onclick = () => this.Exit()
        this.yes_btn.onclick = () => {
            callbackIfOK()
            this.Exit()
        }
    },

    ShowMessage(mes) {
        this.popupNotification_message.innerHTML = mes
    },

    Loading(message = "") {
        this.popupNotification.style.display = "grid"
        this.popupNotification_result.className = "popupNotification_result loading"
        if(message) {
            this.ShowMessage(message)
        }
    },

    Success(message = "") {
        this.popupNotification_result.className = "popupNotification_result success"
        if(message) this.ShowMessage(message)
    },

    Fail(message = "") {
        this.popupNotification_result.className = "popupNotification_result fail"
        // this.ShowMessage("Get Perm Fail")
        if(message) this.ShowMessage(message)
    },

    Show_token(token) {
        this.token_show_token.innerHTML = token
    },

    Exit() {
        $(".popupNotification").remove()
    },
}