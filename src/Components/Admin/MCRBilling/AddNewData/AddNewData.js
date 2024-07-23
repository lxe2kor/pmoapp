import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import { Form } from 'react-bootstrap';
import axios from 'axios';
import Select from 'react-select';
import AdminHeader from '../../../Common/AdminHeader';
import './AddNewData.css';
import { Col } from 'react-bootstrap';
import { Row } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';

function AddNewData() {
    const today = new Date();
    const currentMonth = today.toLocaleString('default', { month: 'short' }).toUpperCase();
    const navigate = useNavigate();
    const location = useLocation();
    const data = location.state;

    const [bmNumber, setBmNumber] = useState('');
    const [taskId, setTaskId] = useState([]);
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [rgId, setRgId] = useState([]);
    const [rgd, setRgd] = useState([]);
    const [selectedRgd, setSelectedRgd] = useState(null);
    const [selectedAssociate, setSelectedAssociate] = useState(null);
    const [fetchedAssociate, setFetchedAssociate] = useState([]);
    const [hours, setHours] = useState('');
    const [pmo, setPmo] = useState('1');
    const [company, setCompany] = useState('');
    const [pif, setPif] = useState('');
    const [billingStatus, setBillingStatus] = useState('');
    const [remarks, setRemarks] = useState('');
    const [wStatus, setWStatus] = useState('');
    const [pd, setPd] = useState('');
    const [pbu, setPbu] = useState('');
    const [empNumber, setEmpNumber] = useState('');
    const [month, setMonth] = useState(currentMonth);
    
    const handleBmChange = async (e) => {
        setTaskId([]);
        setSelectedTaskId('');
        setRgId('');
        setSelectedRgd(null);
        setWStatus('');
        setPd('');
        setPbu('');
        const bmNum = e.target.value;
        setBmNumber(bmNum);
    
        if (bmNum) {
          try {
            const response = await axios.get(`http://10.164.151.171:7000/api/fetchmcrdata?bmnumber=${bmNum}`);
            const data = response.data;
            const formattedOptions = data.map(item => ({
              value: item.resource_group_description,
              label: item.resource_group_description
            }));
            setRgd(formattedOptions);
          } catch (error) {
            console.error('Error fetching data', error);
          }
        } else {
          setRgd([]);
        }
      };
      
    const handleRgdChange = async (selectedRgd) => {
            
            setSelectedRgd(selectedRgd);
            if (selectedRgd) {
                const myRgd = selectedRgd.value; 
                try {
                const response = await axios.get(`http://10.164.151.171:7000/api/fetchByRgd?bmnumber=${bmNumber}&rgd=${myRgd}`);
                const data = response.data;
                
                const taskIdOptions = data.map(item => ({
                    value: item.task_id,
                    label: item.task_id
                }));
                setTaskId(taskIdOptions);
                
                } catch (error) {
                console.error('Error fetching data', error);
                }
            } else {
                setRgId([]);
                setTaskId([]);
            }
        };

    const handleTaskChange = async(selectedTaskId) => {
        setSelectedTaskId(selectedTaskId);
        if (selectedTaskId) {
            const myTaskId = selectedTaskId.value;
            console.log(myTaskId);
            setRgId('');
            setWStatus('');
            setPd('');
            setPbu('');

            try {
              const response = await axios.get(`http://10.164.151.171:7000/api/fetchmcrtaskid?bmnumber=${bmNumber}&taskId=${myTaskId}&rgd=${selectedRgd.value}`);
              const data = response.data;
              setRgId(data.resource_group_id);
              setWStatus(data.mcr_id_status);
              setPd(data.project_division);
              setPbu(data.project_business_unit);

            } catch (error) {
              console.error('Error fetching data', error);
            }
        } else {
            setTaskId([]);
        }
    };


    useEffect(() => {
        if(data.group) {
            axios.get("http://10.164.151.171:7000/api/deptAssociates", {
                params: {
                    team: data.group,
                }
            })
            .then(response => {
                const fetchedData = response.data;
                const options = fetchedData.map(item => ({
                    value: { name: item.employee_name, empNo: item.employee_id },
                    label: item.employee_name
                  }));
                  setFetchedAssociate(options);
                  setEmpNumber(selectedAssociate ? selectedAssociate.value.empNo : '');
            }) 
            .catch (err => {
                console.error('Error fetching teams:', err);
            });
        }
    }, [data.group, selectedAssociate]);

    const handleAssociateChange = async (selectedOption) => {
        setSelectedAssociate(selectedOption);
        if (selectedOption) {
            const associateName = selectedOption.value.name;
            axios.get("http://10.164.151.171:7000/api/associatehours", {
                params: {
                    associate: associateName,
                    cMonth: month
                }
            })
            .then(response => {
                if (response.data) {
                    const fetchedHrs = response.data.hours;
                    if (fetchedHrs < 156) {
                        setHours(fetchedHrs);
                        setPmo(fetchedHrs / 156);
                    } else if(fetchedHrs === 156) {
                        console.log('No data to send');
                        setHours('0');
                    }
                } else {
                    console.log('No data found for the selected associate and month');
                    setHours('156');
                }
            })
            .catch(err => {
                console.error('Error fetching hours', err);
            });
        } else {
            setHours('');
            setPmo('');
        }
    };

    const handleHoursChange = (e) => {
        const hoursValue = e.target.value;
        if (hoursValue <= 156) {
            setHours(hoursValue);
            setPmo(hoursValue / 156);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const cTeam = data.group;
        const formData = {
            month: month,
            bmNumber,
            taskID: selectedTaskId.value,
            rgId,
            rgd: selectedRgd.value,
            wStatus,
            pd,
            pbu,
            company,
            associateName: selectedAssociate.value.name,
            empNumber,
            hours,
            pmo,
            pif,
            billingStatus,
            remarks,
            cTeam
        };

        try {
            await axios.post('http://10.164.151.171:7000/api/savebillingdata', formData);
            alert('Data saved successfully');
            navigate('/McrBilling');
            setBmNumber('');
            setSelectedTaskId('');
            setRgId('');
            setSelectedRgd(null);
            setWStatus('');
            setPd('');
            setPbu('');
            setCompany('');
            setSelectedAssociate('');
            setEmpNumber('');
            setHours('');
            setPmo('');
            setPif('');
            setBillingStatus('');
            setRemarks('');
        } catch (error) {
            console.error('Error saving data:', error);
            alert('Error saving data');
        }
    };

  return (
    <>
        <AdminHeader/>
        <div className="add-mcr-data">
            <h3>Add New MCR Data</h3>
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col xs={4}>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Month</Form.Label>
                        <Form.Select aria-label="Default select example" value={month} onChange={(e) => setMonth(e.target.value)}>
                            <option value={currentMonth.toLowerCase()}>{currentMonth}</option>
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
                            <option value="dece">DEC</option>
                        </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col xs={4}>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>BM Number</Form.Label>
                            <Form.Control type="text" placeholder="BM Number" value={bmNumber} onChange={handleBmChange}/>
                        </Form.Group>
                    </Col>

                    <Col xs={4}>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>RGD</Form.Label>
                            <Select
                            className="basic-single"
                            classNamePrefix="select"
                            placeholder="RGD"
                            value={selectedRgd}
                            onChange={handleRgdChange}
                            options={rgd}
                            isSearchable
                            isClearable
                            />
                        </Form.Group>
                    </Col>
                    
                    <Col xs={4}>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Task ID</Form.Label>
                            <Select
                            className="basic-single"
                            classNamePrefix="select"
                            placeholder="Task ID"
                            value={selectedTaskId}
                            onChange={handleTaskChange}
                            options={taskId}
                            isSearchable
                            isClearable
                            />
                        </Form.Group>
                    </Col>

                    <Col xs={4}>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>RG ID</Form.Label>
                            <Form.Control type="text" placeholder="Work Status" value={rgId} onChange={(e) => setRgId(e.target.value)}/>
                        </Form.Group>
                    </Col>
                    
                    <Col xs={4}>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Work Status</Form.Label>
                            <Form.Control type="text" placeholder="Work Status" value={wStatus} onChange={(e) => setWStatus(e.target.value)}/>
                        </Form.Group>
                    </Col>

                    <Col xs={4}>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>PD</Form.Label>
                            <Form.Control type="text" placeholder="PD" value={pd} onChange={(e) => setPd(e.target.value)}/>
                        </Form.Group>
                    </Col>

                    <Col xs={4}>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>PBU</Form.Label>
                            <Form.Control type="text" placeholder="PBU" value={pbu} onChange={(e) => setPbu(e.target.value)}/>
                        </Form.Group>
                    </Col>

                    <Col xs={4}>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Company</Form.Label>
                            <Form.Control type="text" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)}/>
                        </Form.Group>
                    </Col>
                    
                    <Col xs={4}>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Associate Name</Form.Label>
                            <Select
                            className="basic-single"
                            classNamePrefix="select"
                            placeholder="Associate Name"
                            value={selectedAssociate}
                            onChange={handleAssociateChange}
                            options={fetchedAssociate}
                            isSearchable
                            isClearable
                            />
                        </Form.Group>
                    </Col>

                    <Col xs={4}>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Employee Number</Form.Label>
                            <Form.Control type="text" placeholder="Emp No." value={empNumber} onChange={(e) => setEmpNumber(e.target.value)} />
                        </Form.Group>
                    </Col>

                    <Col xs={4}>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Hours</Form.Label>
                            <Form.Control type="text" placeholder="Hours" value={hours} onChange={handleHoursChange}/>
                        </Form.Group>
                    </Col>

                    <Col xs={4}>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>PMO</Form.Label>
                            <Form.Control type="text" placeholder="PMO" value={pmo} />
                        </Form.Group>
                    </Col>

                    <Col xs={4}>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>PIF</Form.Label>
                            <Form.Control type="text" placeholder="PIF" value={pif} onChange={(e) => setPif(e.target.value)}/>
                        </Form.Group>
                    </Col>

                    <Col xs={4}>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Billing Status</Form.Label>
                            <Form.Select aria-label="Default select example" value={billingStatus} onChange={(e) => setBillingStatus(e.target.value)} required>
                                <option value="">Select Billing Status</option>
                                <option value="Billed">Billed</option>
                                <option value="Unbilled">Unbilled</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col xs={4}>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Remarks</Form.Label>
                            <Form.Control type="text" placeholder="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)}/>
                        </Form.Group>
                    </Col>

                    <Col xs={9}>
                        <Button variant="primary" type="submit">
                            Save
                        </Button>
                        <span>  </span>
                        <Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
                    </Col>
                </Row>
            </Form>
        </div>
    </>
  );
};

export default AddNewData;