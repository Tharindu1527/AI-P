function LecturerLogout(){
    localStorage.removeItem('lecturerLoginStatus')
    window.location.href='/lecturer-login';
    return (
        <div></div>
    );

}
export default LecturerLogout;