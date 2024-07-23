import React, { useContext } from 'react';
import './Header.css';
import BoschLogo from '../../Images/bosch-logo.png';
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from 'react-bootstrap';
import { Container } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { FaRightFromBracket } from 'react-icons/fa6';
import { UserContext } from '../../UserContext';
import { AdminContext } from '../../AdminContext';

function Header()
{
    const navigate = useNavigate();
    const { userLogout } = useContext(UserContext);
    const { adminLogout } = useContext(AdminContext);

    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const isUserHome = location.pathname === '/UserHome';
    const isAdminHome = location.pathname === '/AdminHome';
    const handleLogout = () => {
        if(isAdminHome){
            adminLogout();
            navigate("/");
        } else if(isUserHome) {
            userLogout();
            navigate("/");
        }
    };

    return(
        <div className='header-part'>
            <React.Fragment>
                <header className='headerbg' />
                <Navbar expand="lg" className="bg-body-tertiary">
                    <Container>
                        <Navbar.Brand onClick={() => { isUserHome ? navigate('/UserHome') : navigate('/AdminHome') }}>
                            <img src={BoschLogo} onClick={() => navigate('/')} height='50' width='150' alt='Bosch Logo' className='d-inline-block align-top'/>
                        </Navbar.Brand>
                        {
                            !isHomePage && <Button variant="danger" onClick={handleLogout}>Logout <FaRightFromBracket/></Button>
                        }
                    </Container>
                </Navbar>              
            </React.Fragment>
        </div>
    );
}

export default Header;