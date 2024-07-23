import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminHeader from "../../../Common/AdminHeader";
import './McrGrpSetup.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Button, Modal, Form } from "react-bootstrap";

function McrGroupSetup() {
    const [teams, setTeams] = useState([]);
    const [groups, setGroups] = useState([]);
    const [groupSelected, setGroupSelected] = useState('');
    const [teamSelected, setTeamSelected] = useState('');
    const [associateData, setAssociateData] = useState([]);
    const [pasteData, setPasteData] = useState(false);
    const [data, setData] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [associateName, setAssociateName] = useState('');
    const [empId, setEmpId] = useState('');
    const [status, setStatus] = useState('Active');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newGroup, setNewGroup] = useState('');
    const [newTeam, setNewTeam] = useState('');
    const [grmName, setGrmName] = useState('');
    const [grmEmail, setGrmEmail] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const groupResponse = await axios.get('http://10.164.151.171:7000/api/group');
                setGroups(groupResponse.data);
                if(groupSelected){
                    const teamResponse = await axios.get(`http://10.164.151.171:7000/api/team?group=${groupSelected}`);
                    setTeams(teamResponse.data);
                } else {
                    setTeams([]);
                    setTeamSelected('');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [groupSelected]);

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('Text');
        const rows = pastedData.split('\n').filter(row => row.trim() !== '');
        const newAssociates = rows.map(row => {
            const [employee_name, employee_id, employee_status] = row.split('\t');
            return { employee_name, employee_id, employee_status };
        });
        setPasteData(true);
        setAssociateData(prevData => [...prevData, ...newAssociates]);
    };


    const handleDelete = () => {
        setAssociateData([]);
        setPasteData(false);
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.get("http://10.164.151.171:7000/api/getAssociateData", {
                params: {
                    team: teamSelected
                }
            });
            setData(response.data);
        } catch (err) {
            console.error('Error fetching teams:', err);
        }

        try {
            const res = await axios.get("http://10.164.151.171:7000/api/getGrmDetails", {
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
    };

    const handleAdd = async () => {
        if (teamSelected && associateData.length > 0) {
            try {
                const dataToSend = {
                    employee_dept: groupSelected,
                    employee_team: teamSelected,
                    associates: associateData
                };
                const response = await axios.post('http://10.164.151.171:7000/api/addAssociates', dataToSend);
                if (response.data) {
                    alert('Data added successfully');
                    handleSubmit();
                }
                setAssociateData([]);
                setPasteData(false);
            } catch (error) {
                console.error('Error adding data:', error);
            }
        } else {
            alert("Please select group and team, and add data!");
        }
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    };

    const handleEditFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedItem = {
                employee_name: editForm.employee_name,
                employee_id: editForm.employee_id,
                employee_status: editForm.employee_status
            };
            await axios.put(`http://10.164.151.171:7000/api/updateAssociates/${editItem.id}`, updatedItem);
            setData((prevData) => 
                prevData.map((item) => (item.id === editItem.id ? updatedItem : item))
            );
            setEditItem(null);
        } catch (error) {
            console.error('Error updating data:', error);
        }
        
    };

    const handleModalClose = () => {
        setEditItem(null);
    };

    const handleAssociateDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete data?")) {
            try {
                await axios.delete(`http://10.164.151.171:7000/api/deleteAssociates/${id}`);
                setData((prevData) => prevData.filter((item) => item.id !== id));
                alert("Deleted data successfully!");
            } catch (error) {
                console.error('Error deleting data:', error);
            }
        }
    };

    const handleAssociateAdd = async () => {
        const myData = [{ employee_name: associateName, employee_id: empId, employee_status:status }];
        const dataToSend = {
            associates: myData,
            employee_dept: groupSelected,
            employee_team: teamSelected
        };
        if (teamSelected && associateName && empId) {
            try {
                const response = await axios.post('http://10.164.151.171:7000/api/addAssociates', dataToSend);
                if (response.data) {
                    alert('Data added successfully');
                    handleSubmit();
                }
                setAssociateName('');
                setEmpId('');
            } catch (error) {
                console.error('Error adding data:', error);
            }
        } else {
            alert("Please fill all fields and select group and team!");
        }
    };

    const handleShowAddModal = () => setShowAddModal(true);
    const handleCloseAddModal = () => setShowAddModal(false);

    const handleAddTeam = async () => {
        if (newTeam && newGroup) {
            try {
                const response = await axios.post('http://10.164.151.171:7000/api/addGroupTeam', { groupName: newGroup, teamName: newTeam, grm: grmName });
                if (response.data) {
                    alert('New data added successfully');
                    setTeams([...response.data, { cteam: newTeam }]);
                    setGroups([...response.data, { cgroup: newGroup }]);
                }
                setNewTeam('');
                setNewGroup('');
                setGrmName('');
                handleCloseAddModal();
            } catch (error) {
                console.error('Error adding team:', error);
            }
        } else {
            alert('Please provide both group and team names');
        }
    };

    return (
        <>
            <AdminHeader />
            <div className="configure-mcr container-fluid">
                <div className="config-team-group row mb-4 align-items-end">
                    <div className="col-md-2 mb-3">
                        <label className="form-label"><b>Select Group:</b></label>
                        <select className="form-select" style={{ fontSize: '12px' }} value={groupSelected} onChange={(e) => setGroupSelected(e.target.value)} required>
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
                        <select className="form-select" style={{ fontSize: '12px' }} value={teamSelected} onChange={(e) => setTeamSelected(e.target.value)} required>
                            <option value="">Select Team</option>
                            {teams.map((team, index) => (
                                <option key={index} value={team.cteam}>
                                    {team.cteam}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-2 mb-3 d-flex align-items-end">
                        <button type="button" className="btn btn-primary btn-sm me-2" onClick={handleSubmit}>
                            Submit
                        </button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={handleShowAddModal}>
                            Add Group/Team
                        </button>
                    </div>
                </div>

                <div className="mcr-table-grp row mb-3">
                    <div className="col-12 mb-3">
                        <h5>Associate Information</h5>
                    </div>
                    <div className="associate-add row mb-1 align-items-end">
                            <div className="col-md-2 mb-3">
                                <label className="form-label"><b>Associate Name:</b></label>
                                <input type="text" className="form-control" style={{ fontSize: '12px' }} value={associateName} onChange={(e) => setAssociateName(e.target.value)} required />
                            </div>
                            <div className="col-md-2 mb-3">
                                <label className="form-label"><b>Employee ID:</b></label>
                                <input type="text" className="form-control" style={{ fontSize: '12px' }} value={empId} onChange={(e) => setEmpId(e.target.value)} required />
                            </div>
                            <div className="col-md-2 mb-3">
                                <label className="form-label"><b>Status:</b></label>
                                <select className="form-select" style={{ fontSize: '12px' }} value={status} onChange={(e) => setStatus(e.target.value)}>
                                    <option value="Active">Active</option>
                                    <option value="NotAvailable">Not Available</option>
                                </select>
                            </div>
                            <div className="col-md-2 mb-3 d-flex align-items-end">
                                <button type="button" className="btn btn-primary btn-sm" onClick={handleAssociateAdd}>
                                    <i className="bi bi-plus-lg"></i> Add
                                </button>
                            </div>
                    </div>

                    <div className="table-content col-12">
                        <table className="table table-responsive" onPaste={handlePaste}>
                            <thead>
                                <tr className="table-primary">
                                    <th>Associate Name</th>
                                    <th>Employee ID</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pasteData ? associateData.map((associate, index) => (
                                    <tr key={index}>
                                        <td>{associate.employee_name}</td>
                                        <td>{associate.employee_id}</td>
                                        <td>{associate.employee_status}</td>
                                        <td>
                                            <button className="btn btn-success btn-sm" disabled>Edit</button>
                                            <p> </p>
                                            <button className="btn btn-secondary btn-sm" disabled>Delete</button>
                                        </td>
                                    </tr>
                                )) : data.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.employee_name}</td>
                                        <td>{item.employee_id}</td>
                                        <td>{item.employee_status}</td>
                                        <td>
                                            <button className="btn btn-success btn-sm" onClick={() => { setEditForm(item); setEditItem(item);}}>Edit</button>
                                            <span> </span>
                                            <button className="btn btn-secondary btn-sm" onClick={() => handleAssociateDelete(item.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="d-flex">
                            <button className="btn btn-success btn-sm me-2" onClick={handleAdd} disabled={!pasteData}>
                                Add Associates
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={handleDelete} disabled={!pasteData}>
                                Delete pasted data
                            </button>
                        </div>
                    </div>
                </div>

                <div className="config-manager row mb-3">
                    <div className="col-md-2 mb-3">
                        <label className="form-label"><b>GrM Name</b></label>
                        <input type="text" className="form-control" style={{ fontSize: '12px' }} value={grmName} disabled />
                    </div>
                    <div className="col-md-2 mb-3">
                        <label className="form-label"><b>GrM Email</b></label>
                        <input type="text" className="form-control" style={{ fontSize: '12px' }} value={grmEmail} disabled />
                    </div>
                </div>
            </div>

            <Modal show={editItem} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Data</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleEditFormSubmit}>
                        <Form.Group controlId="formEmployeeName">
                            <Form.Label>Associate Name</Form.Label>
                            <Form.Control type="text" name="employee_name" value={editForm.employee_name} onChange={handleEditFormChange} />
                        </Form.Group>
                        <Form.Group controlId="formEmployeeId">
                            <Form.Label>Employee ID</Form.Label>
                            <Form.Control type="text" name="employee_id" value={editForm.employee_id} onChange={handleEditFormChange} />
                        </Form.Group>
                        <Form.Group controlId="formStatus">
                            <Form.Label>Status</Form.Label>
                            <Form.Select name="employee_status" value={editForm.employee_status} onChange={handleEditFormChange}>
                                <option value="Active">Active</option>
                                <option value="NotAvailable">Not Available</option>
                            </Form.Select>
                        </Form.Group>
                        <br />
                        <Button variant="primary" type="submit">Save</Button>
                        <span> </span>
                        <Button variant="secondary" onClick={handleModalClose}>Cancel</Button>
                    </Form>
                </Modal.Body>
            </Modal>
            <Modal show={showAddModal} onHide={handleCloseAddModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Group/Team</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formGroupName">
                            <Form.Label>Group Name</Form.Label>
                            <Form.Control type="text" value={newGroup} onChange={(e) => setNewGroup(e.target.value)} />
                        </Form.Group>
                        <Form.Group controlId="formTeamName">
                            <Form.Label>Team Name</Form.Label>
                            <Form.Control type="text" value={newTeam} onChange={(e) => setNewTeam(e.target.value)} />
                        </Form.Group>
                        <br />
                        <Button variant="primary" onClick={handleAddTeam}>Add Team</Button>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseAddModal}>Close</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default McrGroupSetup;
