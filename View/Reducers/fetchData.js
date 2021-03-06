import {
    AJAX_DATA,
    AJAX_SUCCEED,
    AJAX_FAILED,
    AJAX_RELOAD,
    UPDATE_TODO
} from '../Config/actionType'

import defaultData from '../Config/defaultData'
import Api from '../Api'
import tipper from './tipper.js'

function FetchData(state = defaultData, action) {
    switch (action.type) {

        case AJAX_DATA:
            var getParas = '',
                postParas = {};
            if (action.data.method.toLowerCase() == 'get') {
                getParas = '?' + action.data.body;
            } else {
                postParas = {
                    method: 'post',
                    // mode: 'cors', //“cors” 允许不同域的请求，但要求有正确的 CORs 头信息。
                    // credentials: 'include', //附带cookies之类的凭证信息，可以将 credentials 参数设置成 “include” 值。
                    headers: {
                        "Content-Type": "application/json", //"text/plain",//"application/json" //"application/x-www-form-urlencoded"
                    },
                    body: action.data.body,
                    credentials: "include" //默认不带cookie，增加此参数带cookie
                }
            }
            action.data.beforeCallback && action.data.beforeCallback();

            if (localStorage.fetch == 'true') { //真实的请求url，在Config/defaultData可更改localStorage.fetch的值，是否调试 string类型，值'true'||'false'

                fetch(Api[action.data.url] + getParas, postParas).then(response => {
                    return response.json();
                }).then(json => {

                    //按ret约定显示错误提示
                    if (('ret' in json) && json.ret != 1) {
                        //alert(json.msg);
                        tipper.emitMsg('ServerError', json.msg);

                        action.data.finalCallback && action.data.finalCallback(json);

                        console.log('Request:', action.data.url, ' Error：', json);
                        return;
                    }

                    //处理返回的正常的数据
                    action.data.succeed({
                        json: json,
                        name: action.data.url,
                        callback: action.data.afterCallback ? action.data.afterCallback : false,
                        finalCall: action.data.finalCallback,
                    })

                }).catch(err => {
                    action.data.afterCallback && action.data.afterCallback();
                })
            } else { //假请求 调试
                if (('ret' in state[0][action.data.url]) && state[0][action.data.url].ret != 1) {
                    tipper.emitMsg('ServerError', state[0][action.data.url].msg);
                }
                action.data.afterCallback && action.data.afterCallback();
            }
            return [...state]

        case AJAX_SUCCEED:
            var actionJson = {};
            actionJson[action.data.name] = action.data.json;
            // actionJson[action.data.name][action.data.name] = true;
            var obj = Object.assign(...state, actionJson);
            // console.log(action.data.name);
            if (action.data.callback) {
                setTimeout(action.data.callback, 100);
            }
            if (action.data.finalCall) {
                setTimeout(action.data.finalCall, 100);
            }
            return [obj]
        case AJAX_RELOAD:
            var newObj = state[0];
            newObj.focusInfo.focus = false;
            newObj.navInfo.nav = false;
            newObj.productInfo.product = false;
            newObj.swiperInfo.swiper = false;
            var obj = Object.assign(...state, newObj);
            return [obj]

        case AJAX_FAILED:
            return [...state]

        case UPDATE_TODO:
            var obj = Object.assign(...state, action.data);
            return [obj]

        default:

            return [...state]
    }
}


module.exports = FetchData