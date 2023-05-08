let usr_menu_lst_id = document.getElementById("usr_menu_lst_id")
function usr_ico_clicked(){
    usr_menu_lst_id.classList.toggle("usr_menu_lst_show");
}
window.addEventListener('click',(event=>{
    if(event.target.id != "usr_ico" && event.target.id != "usr_menu_lst_id"){
        usr_menu_lst_id.classList.remove("usr_menu_lst_show");
    }
}))
