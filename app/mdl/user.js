const DataStore = require(appPath+'/dao/dao.js')

let dsUser = new DataStore('user')

function login(data){
    return new Promise((resolve, reject)=>{
        dsUser.findOne({email: data.email}).then((user)=>{
            let rst = {ok: false, user}
            if (user){
                rst.ok = true;
            }else{
                dsUser.save(data)
            }
            resolve(rst);
        }).catch((err)=>{
            reject(err);
        })
    })
}

module.exports = {login}
