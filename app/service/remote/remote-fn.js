const ERR_OFFLINE = new Error('未连接网络！')

exports.request = function(url, data){
    return new Promise((resolve, reject) => {
        if (!navigator.onLine){
            return reject(ERR_OFFLINE)
        }
        $.ajax({
            url, data, dataType: "json", type: "POST"
        }).then((rsp, textStatus, jqXHR) => {
            // console.log(rsp)
            if (rsp && rsp.responseCode === 0){
                return resolve(rsp.data)
            }
            let err = new Error(rsp&&rsp.msg||'系统出现意外错误！')
            err.code = rsp&&rsp.responseCode||10000
            reject(err)
        }).catch((jqXHR, textStatus, errorThrown) => {
            console.log(jqXHR, textStatus, errorThrown)
            let err = new Error(errorThrown||'无法连接服务器！')
            err.code = 10000
            reject(err)
        })
    })
}
