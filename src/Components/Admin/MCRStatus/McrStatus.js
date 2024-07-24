import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import './McrStatus.css';
import PieChart from "./PieChart";
import AdminHeader from "../../Common/AdminHeader";

function McrStatus() {
    const [teams, setTeams] = useState([]);
    const [allTeams, setAllTeams] = useState([]);
    const [groups, setGroups] = useState([]);
    const [groupSelected, setGroupSelected] = useState('All');
    const [teamSelected, setTeamSelected] = useState('All');
    const [dataSelected, setDataSelected] = useState('all');
    const [month, setMonth] = useState('All');
    const [submit, setSubmit] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [result1, setResult1] = useState([]);
    const [result2, setResult2] = useState([]);
    const [grmName, setGrmName] = useState('');
    const [grmEmail, setGrmEmail] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [groupResponse, allTeamsResponse] = await Promise.all([
                    axios.get('http://10.187.61.41:7000/api/group'),
                    axios.get('http://10.187.61.41:7000/api/allTeam')
                ]);
                setGroups(groupResponse.data);
                setAllTeams(allTeamsResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (groupSelected !== 'All') {
            axios.get(`http://10.187.61.41:7000/api/team?group=${groupSelected}`)
                .then(response => {
                    setTeams(response.data);
                })
                .catch(error => {
                    console.error('Error fetching teams:', error);
                });
        } else {
            setTeams(allTeams);
        }
    }, [groupSelected, allTeams]);

    const handleSubmit = async () => {
        try {
            let fetchUrl = 'http://10.187.61.41:7000/api/fetchAllStatus';
            let fetchParams = { dataSelected };

            if (groupSelected === 'All' && teamSelected === 'All' && month !== 'All') {
                fetchUrl = 'http://10.187.61.41:7000/api/fetchAllButMonth';
                fetchParams = { pmomonth: month, dataSelected };
            } else if (groupSelected === 'All' && teamSelected !== 'All' && month === 'All') {
                fetchUrl = 'http://10.187.61.41:7000/api/fetchAllButTeam';
                fetchParams = { cteam: teamSelected, dataSelected };
            } else if (groupSelected !== 'All' && teamSelected === 'All' && month === 'All') {
                fetchUrl = 'http://10.187.61.41:7000/api/fetchAllButGroup';
                fetchParams = { cgroup: groupSelected, dataSelected };
            } else if (groupSelected !== 'All' && teamSelected !== 'All' && month === 'All') {
                fetchUrl = 'http://10.187.61.41:7000/api/fetchAllButGT';
                fetchParams = { cgroup: groupSelected, cteam: teamSelected, dataSelected };
            } else if (groupSelected !== 'All' && teamSelected === 'All' && month !== 'All') {
                fetchUrl = 'http://10.187.61.41:7000/api/fetchAllButGM';
                fetchParams = { cgroup: groupSelected, pmomonth: month, dataSelected };
            } else if (groupSelected === 'All' && teamSelected !== 'All' && month !== 'All') {
                fetchUrl = 'http://10.187.61.41:7000/api/fetchAllButTM';
                fetchParams = { cteam: teamSelected, pmomonth: month, dataSelected };
            } else if (groupSelected !== 'All' && teamSelected !== 'All' && month !== 'All') {
                fetchUrl = 'http://10.187.61.41:7000/api/fetchAllButGTM';
                fetchParams = { cgroup: groupSelected, cteam: teamSelected, pmomonth: month, dataSelected };
            }

            const response = await axios.get(fetchUrl, { params: fetchParams });
            setResult1(response.data.query1Result);
            setResult2(response.data.query2Result);
            setSubmit(true);

            const grmResponse = await axios.get("http://10.187.61.41:7000/api/getGrmDetails", {
                params: { grm_dept: groupSelected }
            });
            if (grmResponse.data) {
                setGrmName(grmResponse.data.grmname);
                setGrmEmail(grmResponse.data.grmemail);
            }
        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    const filteredResult1 = useMemo(() => {
        return result1.filter(item => {
            if (statusFilter === 'all') return true;
            if (statusFilter === 'Billed' && item.hours === '156') return true;
            if (statusFilter === 'Partially Billed' && item.hours < '156' && item.hours > '0') return true;
            return false;
        });
    }, [result1, statusFilter]);

    const filteredResult2 = useMemo(() => {
        return result2.filter(item => {
            if (statusFilter === 'all') return true;
            if (statusFilter === 'Unbilled' && (item.hours === null || item.hours === '0')) return true;
            return false;
        });
    }, [result2, statusFilter]);

    const generateEmailContent = () => {
        let tableData = `
            MCR Status Details:
    
            Employee Details:
            ${filteredResult1.concat(filteredResult2).map(item => `
                Name: ${item.associatename || item.employee_name}, 
                Month: ${item.pmo_month || month.toUpperCase()}, 
                Type: ${item.billing_type}, 
                Status: ${item.hours === '156' ? 'Billed' : 
                         item.hours < '156' && item.hours > '0' ? 'Partially Billed' : 
                         'Unbilled'}, 
                Hours: ${item.hours ? item.hours : 0}
            `).join('\n')}
        `;
        return tableData.trim();
    };
    
    
    const handleSendEmail = () => {
        const emailContent = generateEmailContent();
        const mailtoLink = `mailto:${grmEmail}?subject=MCR Status&body=${encodeURIComponent(emailContent)}`;
        window.location.href = mailtoLink;
    };
    
    

    return (
        <>
            <AdminHeader />
            <div className="mcr-status container-fluid mt-4">
                <div className="row">
                    <div className="col-md-6 border p-3">
                        <div className="row mb-4 align-items-end">
                            <div className="col-md-3 mb-3">
                                <label className="form-label"><b>Select Group:</b></label>
                                <select className="form-select" style={{ fontSize: '12px' }} value={groupSelected} onChange={(e) => setGroupSelected(e.target.value)}>
                                    <option value="All">All</option>
                                    {groups.map((group, index) => (
                                        <option key={index} value={group.cgroup}>
                                            {group.cgroup}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3 mb-3">
                                <label className="form-label"><b>Select Team:</b></label>
                                <select className="form-select" style={{ fontSize: '12px' }} value={teamSelected} onChange={(e) => setTeamSelected(e.target.value)}>
                                    <option value="All">All</option>
                                    {teams.map((team, index) => (
                                        <option key={index} value={team.cteam}>
                                            {team.cteam}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-2 mb-3">
                                <label className="form-label"><b>MCR/NON-MCR:</b></label>
                                <select className="form-select" style={{ fontSize: '12px' }} value={dataSelected} onChange={(e) => setDataSelected(e.target.value)}>
                                    <option value="all">All</option>
                                    <option value="mcr">MCR</option>
                                    <option value="nonmcr">NON-MCR</option>
                                </select>
                            </div>
                            <div className="col-md-2 mb-3">
                                <label className="form-label"><b>Select Month:</b></label>
                                <select className="form-select" style={{ fontSize: '12px' }} value={month} onChange={(e) => setMonth(e.target.value)}>
                                    <option value="All">All</option>
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
                            <div className="col-md-2 mb-3">
                                <button type="submit" className="btn btn-primary btn-sm w-50 mt-3" onClick={handleSubmit}>
                                    Fetch
                                </button>
                            </div>
                        </div>
                        {submit && <PieChart result1={filteredResult1} result2={filteredResult2} />}
                    </div>
                    <div className="col-md-6 border p-3">
                        <div className="col-md-3 mb-3">
                            <label className="form-label"><b>Filter by Status:</b></label>
                            <select className="form-select" style={{ fontSize: '12px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="all">All</option>
                                <option value="Billed">Billed</option>
                                <option value="Partially Billed">Partially Billed</option>
                                <option value="Unbilled">Unbilled</option>
                            </select>
                        </div>
                        <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <table className="table table-striped mt-3">
                                <thead>
                                    <tr className="table-danger">
                                        <th>Employee name</th>
                                        <th>Group</th>
                                        <th>Team</th>
                                        <th>Month</th>
                                        <th>MCR/NON-MCR</th>
                                        <th>Status</th>
                                        <th>Hours</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredResult1.concat(filteredResult2).map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.associatename || item.employee_name}</td>
                                            <td>{item.employee_dept}</td>
                                            <td>{item.employee_team}</td>
                                            <td>{item.pmo_month || month.toUpperCase()}</td>
                                            <td>{item.billing_type}</td>
                                            <td>
                                                {item.hours === '156' ? 'Billed' : 
                                                item.hours < '156' && item.hours > '0' ? 'Partially Billed' : 
                                                'Unbilled'}
                                            </td>
                                            <td>{item.hours ? item.hours : 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="team-manager row mb-4">
                            <div className="col-md-3 mb-3">
                                <label className="form-label">GrM Name</label>
                                <input type="text" className="form-control" style={{ fontSize: '12px' }} value={grmName} disabled />
                            </div>
                            <div className="col-md-3 mb-3">
                                <label className="form-label">GrM NT ID</label>
                                <input type="text" className="form-control" style={{ fontSize: '12px' }} value={grmEmail} disabled />
                            </div>
                            <div className="col-md-2 mb-3 d-flex align-items-end">
                                <button type="submit" className="btn btn-primary btn-sm" onClick={handleSendEmail}>
                                    Send Email
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default McrStatus;
