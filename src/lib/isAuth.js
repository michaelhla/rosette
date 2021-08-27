import Cookies from 'js-cookie'
const API = process.env.REACT_APP_API || 'http://localhost:3001';
export default async function isAuth(){
    var isAuth = false 
    const token = {token: Cookies.get('token')}
    var jsonhold = null
    if(token.token===undefined){
        return isAuth
    }
    try{ 
        fetch(`${API}/isAuth`,{
            method: 'post',
            body: token && JSON.stringify(token), 
            headers: {
            'content-type': 'application/json',
            accept: 'application/json',
            }
        }).then(res=>res.json).then(jsondata=>{
            jsonhold = jsondata
            console.log('jsonhold', jsonhold)
        })
    }
    catch(err){
        console.log(err)
        isAuth = false
    }
    if(jsonhold!==null){
        isAuth = true
        console.log('isAuth is true')
    }
    console.log('final isauth', isAuth)
    return isAuth
}