import React from "react";
import Header from "../../Common/Header";
import './AdminHomepage.css';
import { useNavigate } from 'react-router-dom';

function AdminHomepage()
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
                            <h2>Upload Planisware/MCR</h2>
                            <p>
                                Here, you can upload MCR and Planisware data.
                            </p>
                            <button onClick={() => navigate('/AdminPlanisware')}>Upload Planisware/MCR</button>
                        </div>
                        <div className="feature">
                            <h2>MCR Billing</h2>
                            <p>
                                MCR Billing is used to manage the monthly billing information of MCR associates.
                            </p>
                            <button onClick={() => navigate('/McrBilling')}>MCR Billing</button>
                        </div>
                        <div className="feature">
                            <h2>Non-MCR Billing</h2>
                            <p>
                                Non-MCR Billing is used to manage the monthly billing information of Non-MCR associates.
                            </p>
                            <button onClick={() => navigate('/NonMcrBilling')}>Non-MCR Billing</button>
                        </div>
                        <div className="feature">
                            <h2>Billing Status</h2>
                            <p>
                                Here, you can check the billing status of MCR and Non-MCR associates.
                            </p>
                            <button onClick={() => navigate('/McrStatus')}>Billing Status</button>
                        </div>
                        <div className="feature">
                            <h2>Verify Planisware</h2>
                            <p>
                                Here, you can verify Planisware by determining the number of allocated and unallocated associates.
                            </p>
                            <button onClick={() => navigate('/VerifyPlanisware')}>Verify Planisware</button>
                        </div>
                        <div className="feature">
                            <h2>MCR Group Setup</h2>
                            <p>
                                This is used by admins to manage information on departments, groups, and associates. 
                            </p>
                            <button onClick={() => navigate('/McrGrpSetup')}>MCR Group Setup</button>
                        </div>
                        <div className="feature">
                            <h2>GrM Information</h2>
                            <p>
                                This is used to manage GrM information. 
                            </p>
                            <button onClick={() => navigate('/McrGrpSetup')}>GrM Info</button>
                        </div>
                        <div className="feature">
                            <h2>Resource Group DB</h2>
                            <p>
                                This is used to manage Resource group and BM numbers information. 
                            </p>
                            <button onClick={() => navigate('/McrGrpSetup')}>Resource Group DB</button>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}

export default AdminHomepage;