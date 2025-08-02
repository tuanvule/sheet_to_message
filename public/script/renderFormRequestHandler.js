import { popupNotification } from "./popupNotification.js";
import { fetchWithAuth, ParseDateTime, TimeAgoUTC } from "./uti/func.js";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

export class RenderFormRequestHandler {
    constructor() {
        this.form_configs = [];
        this.data = {};
        this.state = {
            sort_type: "newest",
            filter_keys: [],
            filters: {},
        }
        this.current_form_config = {};
        this.current_formId = null;
        this.showed_data = null;
    }

    async Init() {
        try {
            const res = await fetchWithAuth("/api/get-form-request");
            const data = await res.json();
            if(res.status !== 500) {
                this.form_configs = data.formConfig
                this.data = data;
                this.RenderFormOnSideBar()
            } else {
              popupNotification.Init()
              popupNotification.Fail(data.message)
            }
        } catch(err) {
            console.error("init error: ", err);
        }
    }

    RenderFormOnSideBar() {
        const notifications_submenu = $(".notifications_submenu")
        let form_items = ``
        this.form_configs.forEach((data,i) => {
            if(i === 0) this.current_formId = data.formId
            form_items+=`
              <li class="notifications_submenu_item ${i === 0 ? "active" : ""}" data-formid="${data.formId}"><i class="fa-solid fa-file-lines"></i> ${data.formName} ${this.data.forms_request[this.form_configs[i].formName] ? `<div class="unHandled_requests">${this.data.forms_request[this.form_configs[i].formName].length}</div>` : ""}</li>
            `
        })
        notifications_submenu.innerHTML = form_items
        this.HandleSideBarEvent()
    }

    HandleSideBarEvent() {
        const notifications_submenu_items = $$(".notifications_submenu_item")
        const notifications_box = $(".notifications_box")
        notifications_submenu_items.forEach(ele => {
            ele.onclick = () => {
                notifications_submenu_items.forEach(e => e.classList.remove("active"))
                ele.classList.add("active")
                this.current_formId = ele.dataset.formid
                this.current_form_config = this.form_configs.find(form_config => form_config.formId === this.current_formId)
                if(!this.data.forms_request[this.current_form_config.formName]) {
                    this.ShowNoRequestTitle()
                    notifications_box.style.display = "none"
                    return
                } else {
                    this.HideNoRequestTitle()
                    notifications_box.style.display = "block"
                }

                this.showed_data = this.data.forms_request[this.current_form_config.formName]
                this.state.filter_keys = this.current_form_config.config.filterKeys
                this.state.filters = this.state.filter_keys.reduce((obj,key) => {
                    obj[key] = new Set()
                    return obj
                }, {})
                this.RenderFilterItem()
                this.HandleFilterBar()
                this.ChangeSortState("newest")
                this.Render()
            }
        })
    }

    HandleFormRequestsEvent() {
        const handled_btn = $(".handled_btn")
        const confirm_btn = $(".confirm_btn")

        if(window.mobileCheck()) {
            $$(".notification_mobile_item-item .value").forEach(ele => {
                ele.onblur = () => {
                    ele.parentElement.querySelector('input[type="checkbox"]').checked = false
                }
            })

            const see_detail_btns = $$(".notification-mobile-footer-detail")
            see_detail_btns.forEach(ele => {
                ele.onclick = () => {
                    ele.classList.toggle("active")
                }
            })

            const action_btns = $$(".notification-mobile-footer-action")
            const notification_mobile_items = $$(".notification_mobile_item")

            action_btns.forEach((e,i) => {
                e.onclick = () => {
                    if(confirm_btn.classList.contains("active")) {
                        console.log("active")
                        const checktype = (handled_btn.classList.contains("active") ? "handled" : "delete")
                        notification_mobile_items[i].dataset.checktype = notification_mobile_items[i].dataset.checktype === "none" ? checktype : "none"
                        e.dataset.checktype = e.dataset.checktype === "none" ? checktype : "none"
                    }
                }
            })
        } else {

            const notification_table_rows = $$(".notification_table-row")

            notification_table_rows.forEach(e => {
                e.onclick = () => {
                    console.log(e)
                    if(confirm_btn.classList.contains("active")) {
                        e.dataset.checktype = e.dataset.checktype === "none" ? (handled_btn.classList.contains("active") ? "handled" : "delete") : "none"
                    }
                }
            })
        }
    }

    HandleFilterBarEvent() {
        // --- Select by  ---
        const leftsSlectWrappers = $$(".select-wrapper")

        leftsSlectWrappers.forEach(ele => {
            const Dropdown = ele.querySelector(".custom-dropdown");
            const Toggle = Dropdown.querySelector(".dropdown-toggle");
            const Menu = Dropdown.querySelector(".dropdown-menu");
            const clearBtn = ele.querySelector(".clear-filter")
            const options = Menu.querySelectorAll("input")
            
            const DropdownKey = Dropdown.dataset.key

            options.forEach(ele => {
                ele.onchange = () => {
                    if(ele.checked) {
                        this.AddFilterState(DropdownKey, ele.value)
                    } else {
                        this.RemoveFilterState(DropdownKey, ele.value)
                    }
                }
            })
    
            Toggle.addEventListener("click", () => {
                Menu.style.display = (Menu.style.display === "block") ? "none" : "block";
            });

            clearBtn.onclick = () => {
                this.state.filters[DropdownKey] = new Set()
                this.RenderFilterItem()
                this.ChangeShowData()
                options.forEach(ele => {
                    ele.checked = false
                })
            }
        })

        // --- Sort by Dropdown ---
        const sortDropdown = document.getElementById("sortSelect");
        const sortToggle = sortDropdown.querySelector(".sort-toggle");
        const sortMenu = sortDropdown.querySelector(".sort-menu");
        const sortOptions = sortDropdown.querySelectorAll(".sort-option");

        sortToggle.onclick = () => {
            sortMenu.style.display = (sortMenu.style.display === "block") ? "none" : "block";
        };

        sortDropdown.onblur = () => {
            if(sortMenu.style.display !== "none") {
                sortMenu.style.display = "none";
            }
        };

        sortOptions.forEach(option => {
            option.onclick = () => {
                sortOptions.forEach(ele => ele.classList.remove("selected"))
                option.classList.add("selected")
                this.ChangeSortState(option.dataset.type)
                sortMenu.style.display = "none";
            };
        });

        const handled_btn = $(".handled_btn")
        const delete_btn = $(".delete_btn")
        const confirm_btn = $(".confirm_btn")

        handled_btn.onclick = () => this.HandleActionState("handled")

        delete_btn.onclick = () => this.HandleActionState("delete")

        confirm_btn.onclick = async () => {
            let id_list = []
            const action_type = handled_btn.classList.contains("active") ? "handled" : "delete"
            

            if(window.mobileCheck()) {
                const notification_mobile_items = $$(".notification_mobile_item")
                notification_mobile_items.forEach(item => {
                    if(item.dataset.checktype === action_type) id_list.push(item.dataset.id)
                })
            } else {
                const notification_table_rows = $$(".notification_table-row")
                notification_table_rows.forEach(item => {
                    if(item.dataset.checktype === action_type) id_list.push(item.dataset.id)
                })
            }


            const res = await fetchWithAuth("/api/processing_notify", {
                method: "POST",
                body: JSON.stringify({
                    id_list,
                    action_type
                })
            })
            if(res.status === 200) {
                console.log("success")
                this.showed_data = this.showed_data.filter((data) => !(id_list.find(id => id === data.id)))
                this.data.forms_request[this.current_form_config.formName] = this.data.forms_request[this.current_form_config.formName].filter((data) => !(id_list.find(id => {
                    // console.log(id)
                    if(id === data.id) {
                        if(window.mobileCheck()) {
                            $(`.notification_mobile_item[data-id="${id}"]`).remove()
                        } else {
                            $(`.notification_table-row[data-id="${id}"]`).remove()
                        }
                        return true
                    }
                    return false
                })))
                localStorage.setItem("numberOfUnreadMessages", localStorage.getItem("numberOfUnreadMessages") - id_list.length)
            } else {
                console.log(res)
            }
            // fetching
        }
    }

    HandleActionState(state = "no_action") {
        const handled_btn = $(".handled_btn")
        const delete_btn = $(".delete_btn")
        const confirm_btn = $(".confirm_btn")

        switch(state) {
            case "handled":
                $$(".notification_table-row").forEach(e => e.dataset.checktype = "none")
                handled_btn.classList.toggle("active")
                delete_btn.classList.remove("active")
                if(handled_btn.classList.contains("active")){
                    confirm_btn.classList.add("active")
                } else {
                    confirm_btn.classList.remove("active")
                }
                break
            case "delete":
                $$(".notification_table-row").forEach(e => e.dataset.checktype = "none")
                delete_btn.classList.toggle("active")
                handled_btn.classList.remove("active")
                if(delete_btn.classList.contains("active")){
                    confirm_btn.classList.add("active")
                } else {
                    confirm_btn.classList.remove("active")
                }
                break
            case "confirm":
                break
            default:
                handled_btn.classList.remove("active")
                delete_btn.classList.remove("active")
                confirm_btn.classList.remove("active")
                break
        }

        if(window.mobileCheck()) {
            const action_btns = $$(".notification-mobile-footer-action")
            action_btns.forEach((e,i) => {
                const notification_mobile_items = $$(".notification_mobile_item")
                if(!confirm_btn.classList.contains("active")) {
                    e.classList.remove("active")
                } else {
                    e.classList.add("active")
                }
                notification_mobile_items[i].dataset.checktype = "none"
                e.dataset.checktype = "none"
            })
        }
    }

    HandleFilterBar() {
        const { filterKeys } = this.current_form_config.config
        
        const filter_left = $(".filter-left")
        let select_wrappers = ``
        
        filterKeys.forEach((key,i) => {
            
            const filterKeyValues = new Set()
            this.data.forms_request[this.current_form_config.formName].forEach(request => {
                const keyIndex = request.submitData.headerData.findIndex(e => e === key)
                filterKeyValues.add(request.submitData.rowData[keyIndex])
            })
            select_wrappers += `
                    <div class="select-wrapper">
                        <div class="custom-dropdown" id="filterSelect" data-key="${key}" tabindex="0">
                            <button class="dropdown-toggle">${key} ▾</button>
                            <div class="dropdown-menu" id="countryDropdown">`
            for(const item of filterKeyValues) {
                select_wrappers += `<label><input type="checkbox" value="${item}" data-key="${key}"> ${item}</label>`
            } 
            select_wrappers += `</div>
                            </div>
                            <div class="clear-filter" data-key="${key}">Clear</div>
                        </div>`
        })

        // console.log(filterKeys)
        filter_left.innerHTML = select_wrappers
        this.HandleFilterBarEvent()
    }

    GetAll() {
        return this.data
    }

    FindHeaderIndex(request, target) {
        return request.submitData.headerData.findIndex(e => e === target)
    }

    GetValueByHeader(request, target) {
        return request.submitData.rowData[request.submitData.headerData.findIndex(e => e === target)]
    }

    ChangeSortState(type) {
        this.state.sort_type = type;
        console.log(this.current_form_config.config.convertedHeader.fixedHeader)
        const { time } = this.current_form_config.config.convertedHeader.fixedHeader
        // if(this.type !== "all") {
        //     this.showed_data = this.showed_data.filter((data) => data.type == this.type)
        // } else {
        //     this.showed_data = this.data
        // }
        if(this.state.sort_type == "newest") {
            this.showed_data.sort((a, b) => ParseDateTime(this.GetValueByHeader(b, time)) - ParseDateTime(this.GetValueByHeader(a, time)));
        } else {
            this.showed_data.sort((a, b) => ParseDateTime(this.GetValueByHeader(a, time)) - ParseDateTime(this.GetValueByHeader(b, time)));
        }

        this.Render();
    }

    ChangeShowData() {
        const allRequest = this.data.forms_request[this.current_form_config.formName]

        let conditionStr = ``
        
        this.state.filter_keys.forEach(key => {
            Array.from(this.state.filters[key]).forEach(value => {
                conditionStr += `request.submitData.rowData[request.submitData.headerData.findIndex(e => e === "${key}")] === "${value}" || `
            })
        })

        conditionStr = conditionStr.slice(0, conditionStr.length-4)

        function buildConditionFunction(conditionStr) {
            return new Function("request", `return ${conditionStr};`);
        }

        const fn = buildConditionFunction(conditionStr);
        
        const newShowedData = allRequest.filter(request => {
            console.log(fn(request))
            return fn(request)
        })
        this.showed_data = newShowedData.length !== 0 ? newShowedData : allRequest 
        this.Render()
    }

    AddFilterState(key, value) {
        this.state.filters[key].add(value)
        const filting_box = $(`.filting-box[data-key="${key}"]`)
        const filting_item = document.createElement('div');
        filting_item.classList.add('filting_item');
        filting_item.setAttribute('data-value', value);
        filting_item.setAttribute('data-key', key);
        filting_item.textContent = value;

        const icon = document.createElement('i');
        icon.classList.add('fa-solid', 'fa-xmark');

        filting_item.appendChild(icon);

        filting_box.appendChild(filting_item)
        $(`input[value="${value}"][data-key="${key}"]`).checked = true
        console.log( $(`.filting_item[data-value="${value}"][data-key="${key}"]`))
        $(`.filting_item[data-value="${value}"][data-key="${key}"]`).onclick = () => {
            console.log("remove")
            this.RemoveFilterState(key,value)
        }
        this.ChangeShowData()
    }

    RemoveFilterState(key, value) {
        this.state.filters[key].delete(value)
        $(`input[value="${value}"][data-key="${key}"]`).checked = false
        $(`.filting_item[data-value="${value}"][data-key="${key}"]`).remove()
        this.ChangeShowData()
    }

    RenderFilterItem() {
        const filting_bar = $(".filting-bar")
        let newFilting_bar = ``
        this.state.filter_keys.forEach(key => {
            newFilting_bar += `<div class="filting-box" data-key="${key}">
                                    <span class="highlight">Filtering by:</span>
                                    ${Array.from(this.state.filters[key]).map(item => 
                                    `<div class="filting_item" data-value="${item}" data-key="${key}">
                                        ${item}
                                        <i class="fa-solid fa-xmark"></i>
                                    </div>`
                                    ).toString().replaceAll(">,<","><")}
                                </div>`
        })
        filting_bar.innerHTML = newFilting_bar
        const filting_item = document.querySelectorAll('.filting_item')
        filting_item.forEach(ele => {
            ele.onclick = () => {
                this.RemoveFilterState(ele.dataset.key, ele.dataset.value)
            }
        })
    }

    // RenderMobile() {
    //     const notification_box = $(".notifications_box")
    //     if(!this.showed_data) return
    //     let messageHTMLs = ``

    //     this.showed_data.forEach((data,i) => {
    //         const { headerData, rowData} = data.submitData
    //         const {fixedHeader, laybelHeader} = this.current_form_config.config.convertedHeader
    //         messageHTMLs += `
    //         <div class="notification_mobile_item">
    //             <div class="notification_mobile_item-header">
    //                 <div class="notification_mobile_item-header-name">${rowData[headerData.findIndex(e => e === fixedHeader.name)]}</div>
    //                 <div class="notification_mobile_item-header-category">${rowData[headerData.findIndex(e => e === fixedHeader.category)]}</div>
    //             </div>
    //             <input hidden type="checkbox" id="detail_btn_${i}">
    //             <ul class="notification_mobile_item-list">
    //                 ${laybelHeader.map((item,j) => {
    //                     const label = item.key
    //                     const value = rowData[headerData.findIndex(e => e === item.laybel)]
    //                     if(value.length > 15) {
    //                         return `<li class="notification_mobile_item-item">
    //                             <div class="label">${label}</div>
    //                             <input hidden type="checkbox" name="" id="row_${j}">
    //                             <div tabindex="0" class="value">
    //                                 <label for="row_${j}" class="default_value need_extend">${value.slice(0,13) + "..."}</label>
    //                                 <div class="extend_value">${value}</div>
    //                             </div>
    //                         </li>`
    //                     } else {
    //                         return `<li class="notification_mobile_item-item">
    //                             <div class="label">${label}</div>
    //                             <label class="value">${value}</label>
    //                         </li>`
    //                     }
    //                 }).toString().replaceAll(">,<","><")}
    //             </ul>
    //             <div class="notification-mobile-footer">
    //             <label for="detail_btn_${i}" class="notification-mobile-footer-detail">Chi tiết</label>
    //             <button class="notification-mobile-footer-ishandled">Chưa xử lý</button>
    //             </div>
    //         </div>
    //         `
    //     })

    //     notification_box.innerHTML = messageHTMLs
    // }

    RenderMobile() {
        const notification_mobile = document.querySelector(".notification_mobile");

        if (!this.showed_data) return;

        // Xóa hết phần cũ
        notification_mobile.innerHTML = "";

        this.showed_data.forEach((data, i) => {
            const { headerData, rowData } = data.submitData;
            const { fixedHeader, laybelHeader } = this.current_form_config.config.convertedHeader;

            const container = document.createElement("div");
            container.className = "notification_mobile_item";
            container.dataset.checktype = "none"
            container.dataset.id = data.id

            // Header
            const header = document.createElement("div");
            header.className = "notification_mobile_item-header";

            const nameDiv = document.createElement("div");
            nameDiv.className = "notification_mobile_item-header-name";
            nameDiv.textContent = rowData[headerData.findIndex(e => e === fixedHeader.name)];

            const categoryDiv = document.createElement("div");
            categoryDiv.className = "notification_mobile_item-header-category";
            categoryDiv.textContent = rowData[headerData.findIndex(e => e === fixedHeader.category)];

            header.append(nameDiv, categoryDiv);
            container.appendChild(header);

            // Checkbox detail
            const detailCheckbox = document.createElement("input");
            detailCheckbox.type = "checkbox";
            detailCheckbox.hidden = true;
            detailCheckbox.id = `detail_btn_${i}`;
            container.appendChild(detailCheckbox);

            // List
            const ul = document.createElement("ul");
            ul.className = "notification_mobile_item-list";

            laybelHeader.forEach((item, j) => {
                const label = item.key;
                let value = null;
                if(item.laybel === this.current_form_config.config.convertedHeader.fixedHeader.time) {
                    value = TimeAgoUTC(rowData[headerData.findIndex(e => e === item.laybel)])
                } else {
                    value = rowData[headerData.findIndex(e => e === item.laybel)];
                }

                const li = document.createElement("li");
                li.className = "notification_mobile_item-item";

                const labelDiv = document.createElement("div");
                labelDiv.className = "label";
                labelDiv.textContent = label;

                li.appendChild(labelDiv);

                if (value.length > 15) {
                    const rowCheckbox = document.createElement("input");
                    rowCheckbox.type = "checkbox";
                    rowCheckbox.hidden = true;
                    rowCheckbox.id = `row_${j}`;

                    const valueDiv = document.createElement("div");
                    valueDiv.className = "value";
                    valueDiv.tabIndex = 0;

                    const labelShort = document.createElement("label");
                    labelShort.setAttribute("for", `row_${j}`);
                    labelShort.className = "default_value need_extend";
                    labelShort.textContent = value.slice(0, 13) + "...";

                    const extendDiv = document.createElement("div");
                    extendDiv.className = "extend_value";
                    extendDiv.textContent = value;

                    valueDiv.append(labelShort, extendDiv);
                    li.append(rowCheckbox, valueDiv);
                } else {
                    const labelValue = document.createElement("label");
                    labelValue.className = "value";
                    labelValue.textContent = value;
                    li.appendChild(labelValue);
                }

                ul.appendChild(li);
            });

            container.appendChild(ul);

            // Footer
            const footer = document.createElement("div");
            footer.className = "notification-mobile-footer";

            const labelDetail = document.createElement("label");
            labelDetail.setAttribute("for", `detail_btn_${i}`);
            labelDetail.className = "notification-mobile-footer-detail";
            labelDetail.textContent = "Chi tiết";

            const btn = document.createElement("div");
            btn.className = "notification-mobile-footer-action";
            btn.textContent = "đánh dấu";
            btn.dataset.checktype = "none"

            footer.append(labelDetail, btn);
            container.appendChild(footer);

            // Append full item
            notification_mobile.appendChild(container);
        });
    }

    // RenderPC() {
    //     const notification_box = $(".notification_pc")
    //     console.log( this.current_form_config.config)
    //     const laybelHeader = this.current_form_config.config.convertedHeader.laybelHeader
    //     // const formname = this.current_form_config.formName
    //     notification_box.innerHTML = `
    //     <table class="notification_table">
    //         <thead>
    //           <tr>
    //             ${laybelHeader.map(header => `<th class="notification_table-heading" style="width: ${header.range}">${header.key}</th>`).toString().replaceAll(">,<","><")}
    //           </tr>
    //         </thead>
    //         <tbody>
    //             ${this.showed_data.map(({submitData}) => {
    //                 const { rowData, headerData} = submitData
    //                 return `<tr class="notification_table-row">
    //                             ${laybelHeader.map((_,i) => `<td>${rowData[headerData.findIndex(e => e === laybelHeader[i].laybel)]}</td>`).toString().replaceAll(">,<","><")}
    //                         </tr>`
    //             }).toString().replaceAll(">,<","><")}
    //         </tbody>
    //     </table>
    //     `
    // }
    RenderPC() {
        const notification_box = document.querySelector(".notification_pc");
        const laybelHeader = this.current_form_config.config.convertedHeader.laybelHeader;

        // Xóa hết phần cũ
        notification_box.innerHTML = "";

        const table = document.createElement("table");
        table.className = "notification_table";

        const thead = document.createElement("thead");
        const headRow = document.createElement("tr");

        laybelHeader.forEach(header => {
            const th = document.createElement("th");
            th.className = "notification_table-heading";
            th.style.width = header.range;
            th.textContent = header.key;
            headRow.appendChild(th);
        });

        thead.appendChild(headRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");

        this.showed_data.forEach((data) => {
            const { submitData, id } = data
            const { rowData, headerData } = submitData;

            const row = document.createElement("tr");
            row.className = "notification_table-row";
            row.dataset.checktype = "none"
            row.dataset.id = id

            laybelHeader.forEach(header => {
                const td = document.createElement("td");
                // console.log(header)
                // console.log(this.current_form_config.config.convertedHeader.fixedHeader.time)
                if(header.laybel === this.current_form_config.config.convertedHeader.fixedHeader.time) {
                    td.textContent = TimeAgoUTC(rowData[headerData.findIndex(e => e === header.laybel)])
                } else {
                    td.textContent = rowData[headerData.findIndex(e => e === header.laybel)];
                }
                row.appendChild(td);
            });

            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        notification_box.appendChild(table);
    }

    ShowNoRequestTitle() {
        const no_request_title = $(".no_request_title")
        no_request_title.classList.remove("hide")
    }

    HideNoRequestTitle() {
        const no_request_title = $(".no_request_title")
        no_request_title.classList.add("hide")
    }

    Render() {
        if(window.mobileCheck()) {
            this.RenderMobile()
        } else {
            this.RenderPC()
        }
        this.HandleFormRequestsEvent()
    }
}