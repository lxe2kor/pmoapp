import React, { useEffect, useState } from "react";
import AdminHeader from "../../../Common/AdminHeader";
import axios from "axios";
import { Button, Modal, Form } from "react-bootstrap";

function ResourceGroup() {
    const [data, setData] = useState([]);
    const [bmNumber, setBmNumber] = useState('');
    const [rgId, setRgId] = useState('');
    const [rgd, setRgd] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://10.164.151.171:7000/api/fetchBmResourceGroup');
                setData(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const handleClick = async () => {
        const addData = {
            bmnumber: bmNumber, rgid: rgId, rgd: rgd
        }
        await axios.post('http://10.164.151.171:7000/api/saveResourceGroup', addData)
        .then(response => {
            if(response.data){
                alert("GrM information saved successfully");
                setData([...data, { ...addData, id: response.data.id }])
                setBmNumber('');
                setRgId('');
                setRgd('');
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
        
        await axios.put(`http://10.164.151.171:7000/api/updateResourceGroup/${editForm.id}`, editForm)
            .then(response => {
                setData((prevData) => 
                    prevData.map((item) => (item.id === editForm.id ? editForm : item))
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

    const handleDelete = async (id) => {
        if(window.confirm("Are you sure you want to delete data?")) {
            await axios.delete(`http://10.164.151.171:7000/api/deleteResourceGroup/${id}`)
            .then(response => {
                setData((prevData) => prevData.filter((item) => item.id !== id));
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
            <div className="resource-group container">
            <div className="add-grm mb-4">
                <h5>Add BM Number and Resource Group Information</h5>
                <br />
                <div className="row mb-3">
                    <div className="col-md-3">
                        <label className="form-label">BM Number</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter BM Number"
                            style={{ fontSize: '12px' }}
                            required
                            value={bmNumber}
                            onChange={(e) => setBmNumber(e.target.value)}
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Resource Group ID</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Resource Group ID"
                            style={{ fontSize: '12px' }}
                            required
                            value={rgId}
                            onChange={(e) => setRgId(e.target.value)}
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Resource Group Description</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Resource Group Description"
                            style={{ fontSize: '12px' }}
                            required
                            value={rgd}
                            onChange={(e) => setRgd(e.target.value)}
                        />
                    </div>
                    <div className="col-md-2 d-flex align-items-end">
                        <button className="btn btn-primary btn-sm w-50" onClick={handleClick}>Save</button>
                    </div>
                </div>          
            </div>
            
            <div className="grm-table">
                <h5>Resource Group DB</h5>
                <div className="billing-table-content table-responsive" style={{ maxHeight: '800px', overflowY: 'auto' }}>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr className="table-warning">
                                    <th>BM Number</th>
                                    <th>Resource Group ID</th>
                                    <th>Resource Group</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.bmnumber}</td>
                                        <td>{item.rgid}</td>
                                        <td>{item.rgd}</td>
                                        <td>
                                        <button className="btn btn-success me-2 btn-sm" onClick={() => handleEditClick(item)}>Edit</button>
                                        <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(item.id)}>Delete</button>
                                    </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            </div>
            <Modal show={!!editingItem} onHide={handleModalClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Information</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleEditFormSubmit}>
                    <Form.Group controlId="formBmNumber">
                        <Form.Label>BM Number</Form.Label>
                        <Form.Control type="text" name="bmnumber" value={editForm.bmnumber || ''} onChange={handleEditFormChange} />
                    </Form.Group>
                    <Form.Group controlId="formRgId">
                        <Form.Label>Resource Group ID</Form.Label>
                        <Form.Control type="text" name="rgid" value={editForm.rgid || ''} onChange={handleEditFormChange} />
                    </Form.Group>
                    <Form.Group controlId="formRgd">
                        <Form.Label>Resource Group Description</Form.Label>
                        <Form.Control type="text" name="rgd" value={editForm.rgd || ''} onChange={handleEditFormChange} />
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

export default ResourceGroup;