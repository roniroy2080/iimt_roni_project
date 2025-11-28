
let checking_ISLOGIN = () =>{
    if(localStorage.getItem('NAME') && localStorage.getItem('PASSWORD') && localStorage.getItem('ROOM-ID'))
    {
        window.location.href = 'Room.html';
    }
}

checking_ISLOGIN()

let toast_text = document.getElementById('snackbar');

document.getElementById('join_room_btn_login').onsubmit = e =>{
    e.preventDefault()

    var name = document.getElementById('username_enter_login');
    var password = document.getElementById('room_id_password_login');
    var room_id_login = document.getElementById('room_id_join_login');
    name = name.value.trim()
    password = password.value.trim()
    room_id_login = room_id_login.value.trim()
    
    if(name.length > 0 && password.length > 0 && room_id_login.length > 0)
    {
        localStorage.setItem('NAME',name)
        localStorage.setItem('PASSWORD',password)
        localStorage.setItem('ROOM-ID',room_id_login)

        window.location.href = 'Room.html';

    }else
    {
        toast_text.innerHTML = 'All Required Filled Must Fill';
        toast();
    }

}

let generate = () =>{
    _sym = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
    str = '';
    for(var i = 0; i < 25; i++) {
        str += _sym[parseInt(Math.random() * (_sym.length))];
    }
    document.getElementById('room_id_join_login').value = str;
}
