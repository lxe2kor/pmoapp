import React from "react";
import Header from '../../Common/Header';
import { useNavigate } from 'react-router-dom';
import './UserHomepage.css';

function UserHomepage()
{
    const navigate = useNavigate();

    return(
        <>
            <Header/>
            <div className="home-page">
                <div className="home-header">
                    <h1>Welcome to PMO</h1>
                </div>
                <main>
                    <section className="features">
                        <div className="feature">
                            <h2>MCR Billing</h2>
                            <p>
                                MCR Billing is used to manage the monthly billing information of MCR associates.
                            </p>
                            <button onClick={() => navigate('/UserMcrBilling')}>MCR Billing</button>
                        </div>
                        <div className="feature">
                            <h2>Non-MCR Billing</h2>
                            <p>
                                Non-MCR Billing is used to manage the monthly billing information of Non-MCR associates.
                            </p>
                            <button onClick={() => navigate('/UserNonMcrBilling')}>Non-MCR Billing</button>
                        </div>
                        <div className="feature">
                            <h2>Billing Status</h2>
                            <p>
                                Here, you can check the billing status of MCR and Non-MCR associates.
                            </p>
                            <button onClick={() => navigate('/UserMcrStatus')}>Billing Status</button>
                        </div>
                        
                    </section>
                </main>
            </div>
        </>
    );
}

export default UserHomepage;