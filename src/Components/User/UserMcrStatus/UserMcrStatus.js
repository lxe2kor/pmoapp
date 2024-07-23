import React, { useState, useMemo, useContext } from "react";
import axios from "axios";
import '../../Admin/MCRStatus/McrStatus.css';
import PieChart from "./UserPieChart";
import UserHeader from "../../Common/UserHeader";
import { UserContext } from '../../../UserContext';

function UserMcrStatus() {
    const { user } = useContext(UserContext);
    const department = user.department;
    const group = user.group;
    const [dataSelected, setDataSelected] = useState('all');
    const [month, setMonth] = useState('All');
    const [submit, setSubmit] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [result1, setResult1] = useState([]);
    const [result2, setResult2] = useState([]);

    const handleSubmit = async () => {
        if(month === 'All'){
            axios.get('http://localhost:7000/api/fetchAllButGT', {
                params: {
                    cgroup: department,
                    cteam: group,
                    dataSelected
                }
            })
            .then(response => {
                setResult1(response.data.query1Result);
                setResult2(response.data.query2Result);
                setSubmit(true);
            })
            .catch(error => {
                console.error('Error fetching all data', error);
            })
        } else if(month !== 'All'){
            axios.get('http://localhost:7000/api/fetchAllButGTM', {
                params: {
                    cgroup: department,
                    cteam: group,
                    pmomonth: month,
                    dataSelected
                }
            })
            .then(response => {
                setResult1(response.data.query1Result);
                setResult2(response.data.query2Result);
                setSubmit(true);
            })
            .catch(error => {
                console.error('Error fetching all data', error);
            })
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

    return (
        <>
            <UserHeader />
            <div className="mcr-status container-fluid mt-4">
                <div className="row">
                    <div className="col-md-6 border p-3">
                        <div className="row mb-4 align-items-end">
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
                                        <th>Month</th>
                                        <th>MCR/Non-MCR</th>
                                        <th>Status</th>
                                        <th>Hours</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredResult1.concat(filteredResult2).map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.associatename || item.employee_name}</td>
                                            <td>{item.pmo_month}</td>
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
                    </div>
                </div>
            </div>
        </>
    );
}

export default UserMcrStatus;
