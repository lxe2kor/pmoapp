import React, { useContext } from 'react';
import './Header.css';
import BoschLogo from '../../Images/bosch-logo.png';
import { NavDropdown, Navbar } from 'react-bootstrap';
import { Container } from 'react-bootstrap';
import { Nav } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaRightFromBracket } from 'react-icons/fa6';
import { AdminContext } from '../../AdminContext';

function AdminHeader() {
    const navigate = useNavigate();
    const { adminLogout } = useContext(AdminContext);

    const location = useLocation();
    const isHomePage = location.pathname === '/';

    const handleLogout = () => {
        adminLogout();
        navigate("/");
    };

    const getLinkClass = (path) => {
        return location.pathname === path ? 'admin-item active-link' : 'admin-item';
    };

    return (
        <React.Fragment>
            <header className='headerbg' />
            <div className='admin-header'>
                <Navbar expand="lg" className="bg-body-tertiary">
                    <Container>
                        <Navbar.Brand onClick={() => navigate('/AdminHome')}>
                            <img src={BoschLogo} height='50' width='150' alt='Bosch Logo' className='d-inline-block align-top' />
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto admin-nav-item">
                                <Nav.Link className={getLinkClass('/AdminHome')} onClick={() => navigate('/AdminHome')}>Home</Nav.Link>
                                <NavDropdown title="Configure" id="basic-nav-dropdown" className="admin-item">
                                    <NavDropdown.Item onClick={() => navigate('/McrGrpSetup')}>MCR Group Setup</NavDropdown.Item>
                                    <NavDropdown.Item onClick={() => navigate('/GrmSetup')}>GrM Info</NavDropdown.Item>
                                    <NavDropdown.Item onClick={() => navigate('/ResourceGroupInfo')}>Resource Group DB</NavDropdown.Item>
                                </NavDropdown>
                                <Nav.Link className={getLinkClass('/AdminPlanisware')} onClick={() => navigate('/AdminPlanisware')}>Upload Planisware/MCR</Nav.Link>
                                <Nav.Link className={getLinkClass('/VerifyPlanisware')} onClick={() => navigate('/VerifyPlanisware')}>Verify Planisware</Nav.Link>
                                <Nav.Link className={getLinkClass('/McrBilling')} onClick={() => navigate('/McrBilling')}>MCR Billing</Nav.Link>
                                <Nav.Link className={getLinkClass('/NonMcrBilling')} onClick={() => navigate('/NonMcrBilling')}>Non-MCR Billing</Nav.Link>
                                <Nav.Link className={getLinkClass('/McrStatus')} onClick={() => navigate('/McrStatus')}>Billing Status</Nav.Link>
                                {
                                    !isHomePage && <Button variant="danger" size="sm" onClick={handleLogout}>Logout <FaRightFromBracket /></Button>
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

export default AdminHeader;
