// let username_enter_login = document.getElementById('username_enter_login');

if(localStorage.getItem('NAME') && localStorage.getItem('ROOM-ID') && localStorage.getItem('ROOM_PASSWORD'))
{
  window.location.href = 'Room.html';
}

document.getElementById('join_room_btn_login').onsubmit = e =>{
    e.preventDefault()

    let username_enter_login = document.getElementById('username_enter_login');
    username_enter_login = username_enter_login.value.trim()
    let room_id_join_login = document.getElementById('room_id_join_login')
    room_id_join_login = room_id_join_login.value.trim()
    let room_id_password_login = document.getElementById('room_id_password_login')
    room_id_password_login = room_id_password_login.value.trim()

    if(username_enter_login && room_id_join_login && room_id_password_login)
    {

        
        localStorage.setItem('NAME',username_enter_login)
        localStorage.setItem('ROOM-ID',room_id_join_login)
        localStorage.setItem('ROOM_PASSWORD',room_id_password_login)
        localStorage.setItem('Login_True','False');

        window.location.href = `Room.html`;

        document.getElementById('username_enter_login').value = null;
        document.getElementById('room_id_join_login').value = null;
        document.getElementById('room_id_password_login').value = null;

    }else
    {
        alert('Please Fill All Details');
    }
}


function generate(){
    _sym = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
    str = '';
    for(var i = 0; i < 20; i++) {
        str += _sym[parseInt(Math.random() * (_sym.length))];
    }
    document.getElementById('room_id_join_login').value =  str;
}