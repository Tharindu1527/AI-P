function Logout(){
    localStorage.removeItem('studentLoginStatus')
    window.location.href='/user-login';
    return (
        <div></div>
    );

}
export default Logout;