import React, { useContext } from 'react';
import './Header.css';
import BoschLogo from '../../Images/bosch-logo.png';
import { Navbar } from 'react-bootstrap';
import { Container } from 'react-bootstrap';
import { Nav } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import { FaRightFromBracket } from 'react-icons/fa6';
import { UserContext } from '../../UserContext';

function UserHeader()
{
    const navigate = useNavigate();
    const { userLogout } = useContext(UserContext);

    const location = useLocation();
    const isHomePage = location.pathname === '/';

    const handleLogout = () => {
        userLogout();
        navigate("/");
    };

    const getLinkClass = (path) => {
        return location.pathname === path ? 'admin-item active-link' : 'admin-item';
    };

    return(
        <React.Fragment>
            <header className='headerbg' />
            <div className='user-header'>
                <Navbar expand="lg" className="bg-body-tertiary">
                    <Container>
                        <Navbar.Brand onClick={() => navigate('/UserHome')}>
                            <img src={BoschLogo} height='50' width='150' alt='Bosch Logo' className='d-inline-block align-top'/>
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto admin-nav-item">
                            <Nav.Link className={getLinkClass('/UserHome')} onClick={() => navigate('/UserHome')}>Home</Nav.Link>
                            <Nav.Link className={getLinkClass('/UserMcrBilling')} onClick={() => navigate('/UserMcrBilling')}>MCR Billing</Nav.Link>
                            <Nav.Link className={getLinkClass('/UserNonMcrBilling')} onClick={() => navigate('/UserNonMcrBilling')}>Non-MCR Billing</Nav.Link>
                            <Nav.Link className={getLinkClass('/UserMcrStatus')} onClick={() => navigate('/UserMcrStatus')}>Billing Status</Nav.Link>
                            {
                                !isHomePage && <Button variant="danger" size="sm" onClick={handleLogout}>Logout <FaRightFromBracket/></Button>
                            }
                        </Nav>
                        </Navbar.Collapse>
                        
                    </Container>
                    <h6>Powered by EEM-PJ1-VV</h6>
                </Navbar>
            </div>
        </React.Fragment>
    );
}

export default UserHeader;