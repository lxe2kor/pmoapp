import React, { useEffect, useState } from "react";
import './GrmInfo.css';
import AdminHeader from "../../../Common/AdminHeader";
import axios from "axios";
import { Button, Modal, Form } from "react-bootstrap";

function GrmInfo() {
    const [grmData, setGrmData] = useState([]);
    const [grmName, setGrmName] = useState('');
    const [grmEmail, setGrmEmail] = useState('');
    const [grmDept, setGrmDept] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        axios.get('http://10.164.151.171:7000/api/fetchGrmData')
        .then(response => {
            setGrmData(response.data);
        })
        .catch(error => {
            console.error('Error fetching GrM info:', error);
        })
    }, []);

    const handleClick = async () => {
        const addData = {
            grmname: grmName,
            grmemail: grmEmail,
            grm_dept: grmDept
        }
        await axios.post('http://10.164.151.171:7000/api/saveGrmData', addData)
        .then(response => {
            if(response.data){
                alert("GrM information saved successfully");
                setGrmData([...grmData, { ...addData, grmid: response.data.grmid }]);
                setGrmName('');
                setGrmEmail('');
                setGrmDept('');
            }
        })
        .catch(error => {
            console.error("Error saving data:", error);
        })
    };

    const handleEditClick = (item) => {
        setEditingItem(item);
        setEditForm(item);
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
        await axios.put(`http://10.164.151.171:7000/api/updateGrmInfo/${editForm.grmid}`, editForm)
            .then(response => {
                setGrmData((prevData) => 
                    prevData.map((item) => (item.grmid === editForm.grmid ? editForm : item))
            );
                setEditingItem(null);
            })
            .catch(error => {
                console.error('Error updating data:', error);
            });
    };

    const handleModalClose = () => {
        setEditingItem(null);
    };

    const handleDelete = async (grmid) => {
        if(window.confirm("Are you sure you want to delete data?")) {
            await axios.delete(`http://10.164.151.171:7000/api/deleteGrm/${grmid}`)
            .then(response => {
                setGrmData((prevData) => prevData.filter((item) => item.grmid !== grmid));
                alert("Deleted data successfully!");
            })
            .catch(error => {
                console.error('Error deleting data:', error);
            });
        }
    };

    return(
        <>
        <AdminHeader/>
        <div className="grm-info container-fluid">
            <div className="add-grm mb-4">
                <h5>Add new GrM information</h5>
                <br />
                <div className="row mb-3">
                    <div className="col-md-3">
                        <label className="form-label">GrM Name:</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter GrM Name"
                            style={{ fontSize: '12px' }}
                            required
                            value={grmName}
                            onChange={(e) => setGrmName(e.target.value)}
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Email ID:</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Email"
                            style={{ fontSize: '12px' }}
                            required
                            value={grmEmail}
                            onChange={(e) => setGrmEmail(e.target.value)}
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Department:</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Department"
                            style={{ fontSize: '12px' }}
                            required
                            value={grmDept}
                            onChange={(e) => setGrmDept(e.target.value)}
                        />
                    </div>
                    <div className="col-md-2 d-flex align-items-end">
                        <button className="btn btn-primary btn-sm w-50" onClick={handleClick}>Save</button>
                    </div>
                </div>
                
            </div>
            <div className="grm-table">
                <h5>GrM Information</h5>
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr className="table-warning">
                                <th>GrM Name</th>
                                <th>Email ID</th>
                                <th>Department</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grmData.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.grmname}</td>
                                    <td>{item.grmemail}</td>
                                    <td>{item.grm_dept}</td>
                                    <td>
                                        <button className="btn btn-success me-2 btn-sm" onClick={() => handleEditClick(item)}>Edit</button>
                                        <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(item.grmid)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <Modal show={!!editingItem} onHide={handleModalClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Data</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleEditFormSubmit}>
                    <Form.Group controlId="formGrmName">
                        <Form.Label>GrM Name</Form.Label>
                        <Form.Control type="text" name="grmname" value={editForm.grmname || ''} onChange={handleEditFormChange} />
                    </Form.Group>
                    <Form.Group controlId="formEmailID">
                        <Form.Label>Email ID</Form.Label>
                        <Form.Control type="text" name="grmemail" value={editForm.grmemail || ''} onChange={handleEditFormChange} />
                    </Form.Group>
                    <Form.Group controlId="formDepartment">
                        <Form.Label>Department</Form.Label>
                        <Form.Control type="text" name="grm_dept" value={editForm.grm_dept || ''} onChange={handleEditFormChange} />
                    </Form.Group>
                    <br/>
                    <Button variant="primary" type="submit">Save</Button>
                    <span>  </span>
                    <Button variant="secondary" onClick={handleModalClose}>Cancel</Button>
                </Form>
            </Modal.Body>
            </Modal>
        </>
    );
}

export default GrmInfo;