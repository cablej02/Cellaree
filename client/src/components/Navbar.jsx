import { useUser } from '../context/UserContext';
import AuthService from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { user } = useUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        AuthService.logout(navigate);
    };

    return (
        <nav>
            <h1>Cellar</h1>
            <div>
                {user ? (
                    <>
                        <p>{user.username}</p>
                        <button onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <span>Loading...</span>
                )}
            </div>
        </nav>
    );
};

export default Navbar;