import { jwtDecode } from 'jwt-decode';

// create a new class to instantiate for a user
class AuthService {
  // get user data
  getProfile() {
    return jwtDecode(this.getToken() || '');
  }

  // check if user's logged in
  loggedIn() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp < Date.now() / 1000) {
        console.warn("Expired token detected, clearing storage.");
        localStorage.removeItem("id_token");
        return false;
      }
      return true;
    } catch (err) {
      console.error("Invalid token detected, clearing storage:", err);
      localStorage.removeItem("id_token");
      return false;
    }
  }

  getToken() {
    // Retrieves the user token from localStorage
    return localStorage.getItem('id_token');
  }

  login(idToken, navigate, client) {
    // Saves user token to localStorage
    localStorage.setItem('id_token', idToken);
    // clear the Apollo cache so the user data is cleared
    if(client) client.resetStore();
    navigate('/');
  }

  logout(navigate, client) {
    // Clear user token and profile data from localStorage
    localStorage.removeItem('id_token');
    // clear the Apollo cache so the user data is cleared
    if(client) client.resetStore();
    // this will reload the page and reset the state of the application
    if(navigate){
      navigate('/login');
    } else {
      window.location.assign('/login');
    }
  }
}

export default new AuthService();