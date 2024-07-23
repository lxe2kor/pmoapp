import React, { useState, useEffect } from "react";
import AdminHeader from "../../Common/AdminHeader";
import axios from "axios";
import './VerifyPlanisware.css';

function VerifyPlanisware() {
    const [teams, setTeams] = useState([]);
    const [groups, setGroups] = useState([]);
    const [groupSelected, setGroupSelected] = useState('');
    const [teamSelected, setTeamSelected] = useState('');
    const [month, setMonth] = useState('');

    const [data, setData] = useState([]);
    const [count, setCount] = useState([]);
    const [grmName, setGrmName] = useState('');
    const [grmEmail, setGrmEmail] = useState('');

    useEffect(() => {
        axios.get('http://localhost:7000/api/group')
        .then(response => {
            setGroups(response.data);
        })
        .catch(error => {
            console.error('Error fetching groups:', error);
        });
        if(groupSelected){
            axios.get(`http://localhost:7000/api/team?group=${groupSelected}`)
            .then(response => {
                setTeams(response.data);
            })
            .catch(error => {
                console.error('Error fetching teams:', error);
            });
        } else {
            setTeams([]);
            setTeamSelected('');
        }
    }, [groupSelected]);

    const handleSubmit = async() => {
        if(teamSelected) {
            await axios.get("http://localhost:7000/api/verifyplanisware", {
                params: {
                    group: groupSelected,
                    team: teamSelected, 
                    month: month
                }
            })
            .then(response => {
                setData(response.data);
            }) 
            .catch (err => {
                console.error('Error fetching teams:', err);
            });

            await axios.get("http://localhost:7000/api/notallocated", {
                params: {
                    group: groupSelected,
                    team: teamSelected, 
                    month: month
                }
            })
            .then(response => {
                setCount(response.data);
            }) 
            .catch (err => {
                console.error('Error fetching teams:', err);
            });
        }
        else if(!teamSelected){
            await axios.get("http://localhost:7000/api/fetchallteams", {
                params: {
                    group: groupSelected,
                    month: month
                }
            })
            .then(response => {
                setData(response.data);
            }) 
            .catch (err => {
                console.error('Error fetching teams:', err);
            });

            await axios.get("http://localhost:7000/api/fetchnotallocated", {
                params: {
                    group: groupSelected, 
                    month: month
                }
            })
            .then(response => {
                setCount(response.data);
            }) 
            .catch (err => {
                console.error('Error fetching teams:', err);
            });
        }

        try {
            const res = await axios.get("http://localhost:7000/api/getGrmDetails", {
                params: {
                    grm_dept: groupSelected
                }
            });
            if(res.data) {
                setGrmName(res.data.grmname);
                setGrmEmail(res.data.grmemail);
            }
        } catch (err) {
            console.error('Error fetching GrM information:', err);
        }
    }

    const generateEmailContent = () => {
        let tableData = `
            Not allocated associate details:
            ${data.map(item => `
                Associate Name: ${item.employee_name}, Team: ${item.employee_team}, Allocated: ${item.pmo || 0}
            `).join('\n')}
            
            Not allocated associates count with respect to team:
            ${count.map(item => `
                Team: ${item.employee_team}, Not allocated: ${item.Count}
            `).join('\n')}
        `;
        return tableData;
    };
    
    const handleSendEmail = () => {
        const emailContent = generateEmailContent();
        const mailtoLink = `mailto:${grmEmail}?subject=Planisware Verification&body=${encodeURIComponent(emailContent)}`;
        window.location.href = mailtoLink;
    };

    return(
        <>
            <AdminHeader/>
            <div className="verify-planisware container-fluid">
                <div className="team-group row mb-4">
                    <div className="col-md-2 mb-3">
                        <label className="form-label"><b>Select Group:</b></label>
                        <select className="form-select" aria-label="Select team" style={{ fontSize: '12px' }} value={groupSelected} onChange={(e) => setGroupSelected(e.target.value)}>
                            <option value="">Select Group</option>
                            {groups.map((group, index) => (
                                <option key={index} value={group.cgroup}>
                                    {group.cgroup}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-2 mb-3">
                        <label className="form-label"><b>Select Team:</b></label>
                        <select className="form-select" aria-label="Select team" style={{ fontSize: '12px' }} value={teamSelected} onChange={(e) => setTeamSelected(e.target.value)}>
                            <option value="">Select Team</option>
                            {teams.map((group, index) => (
                                <option key={index} value={group.cteam}>
                                    {group.cteam}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-2 mb-3">
                        <label className="form-label"><b>Select Month:</b></label>
                        <select className="form-select" aria-label="Select team" style={{ fontSize: '12px' }} value={month} onChange={(e) => setMonth(e.target.value)}>
                            <option value="">Select Month</option>
                            <option value="jan">JAN</option>
                            <option value="feb">FEB</option>
                            <option value="mar">MAR</option>
                            <option value="apr">APR</option>
                            <option value="may">MAY</option>
                            <option value="jun">JUN</option>
                            <option value="jul">JUL</option>
                            <option value="aug">AUG</option>
                            <option value="sep">SEP</option>
                            <option value="oct">OCT</option>
                            <option value="nov">NOV</option>
                            <option value="dec">DEC</option>
                        </select>
                    </div>
                    <div className="col-md-2 mb-3 d-flex align-items-end">
                        <button type="submit" className="btn btn-primary btn-sm w-50" onClick={handleSubmit}>
                            Verify
                        </button>
                    </div>
                </div>
                <div className="team-row row mb-4">
                    <div className="team-column col-md-6 mb-3">
                        <h5>Not allocated associate details</h5>
                        <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <table className="table table-striped">
                                <thead>
                                    <tr className="table-dark">
                                        <th>Associate Name</th>
                                        <th>Team</th>
                                        <th>Allocated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.employee_name}</td>
                                            <td>{item.employee_team}</td>
                                            <td>{item.pmo || 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="team-column col-md-6 mb-3">
                        <h5>Not allocated associates count with respect to team</h5>
                        <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <table className="table table-striped">
                                <thead>
                                    <tr className="table-dark">
                                        <th>Team</th>
                                        <th>Not allocated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {count.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.employee_team}</td>
                                            <td>{item.Count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="team-manager row mb-4">
                    <div className="col-md-2 mb-3">
                        <label className="form-label">GrM Name</label>
                        <input type="text" className="form-control" style={{ fontSize: '12px' }} value={grmName} disabled />
                    </div>
                    <div className="col-md-2 mb-3">
                        <label className="form-label">GrM Email</label>
                        <input type="text" className="form-control" style={{ fontSize: '12px' }} value={grmEmail} disabled />
                    </div>
                    <div className="col-md-2 mb-3 d-flex align-items-end">
                        <button type="submit" className="btn btn-primary btn-sm" onClick={handleSendEmail}>
                            Send Email
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VerifyPlanisware;