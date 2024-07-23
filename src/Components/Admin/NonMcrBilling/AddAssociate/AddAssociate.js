import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import { Col } from 'react-bootstrap';
import { Row } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import AdminHeader from '../../../Common/AdminHeader';
import axios from 'axios';
import Select from 'react-select';

function AddAssociate() {
    const today = new Date();
    const currentMonth = today.toLocaleString('default', { month: 'short' }).toUpperCase();
    const navigate = useNavigate();
    const location = useLocation();
    const data = location.state;

    const [month, setMonth] = useState(currentMonth);
    const [pifId, setPifId] = useState('');
    const [poNo, setPoNo] = useState('');
    const [contractNo, setContractNo] = useState('');
    const [legalCompany, setLegalCompany] = useState('');
    const [custDetails, setCustDetails] = useState('');
    const [selectedAssociate, setSelectedAssociate] = useState(null);
    const [fetchedAssociate, setFetchedAssociate] = useState([]);
    const [empNumber, setEmpNumber] = useState('');
    const [hours, setHours] = useState('');
    const [pmo, setPmo] = useState('1');
    const [onsite, setOnsite] = useState('Onsite');
    const [soNo, setSoNo] = useState('');
    const [sdcstatus, setSdcStatus] = useState('');
    const [soStatus, setSoStatus] = useState('');
    const [soText, setSoText] = useState('');
    const [remarks, setRemarks] = useState('');

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
        const associateName = selectedOption.value.name;
        axios.get("http://10.164.151.171:7000/api/associateNonMcrHours", {
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
            pifId,
            poNo,
            contractNo,
            legalCompany,
            custDetails,
            associateName: selectedAssociate.value.name,
            empNumber,
            onsite,
            hours,
            pmo,
            soNo,
            sdcstatus,
            soStatus,
            soText,
            remarks,
            cTeam
        };

        try {
            await axios.post('http://10.164.151.171:7000/api/saveNonMcrData', formData);
            alert('Data saved successfully');
            navigate('/NonMcrBilling');
            setPifId('');
            setPoNo('');
            setContractNo('');
            setLegalCompany('');
            setCustDetails('');
            setSoNo('');
            setSdcStatus('');
            setSoStatus('');
            setSelectedAssociate('');
            setEmpNumber('');
            setHours('');
            setPmo('');
            setSoText('');
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
                            <Form.Label>PIF ID</Form.Label>
                            <Form.Control type="text" placeholder="Enter PIF ID" value={pifId} onChange={(e) => setPifId(e.target.value)}/>
                        </Form.Group>
                    </Col>
                    
                    <Col xs={4}>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>PO No.</Form.Label>
                            <Form.Control type="text" placeholder="Enter PO No." value={poNo} onChange={(e) => setPoNo(e.target.value)}/>
                        </Form.Group>
                    </Col>

                    <Col xs={4}>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Contract No.</Form.Label>
                            <Form.Control type="text" placeholder="Enter Contract No." value={contractNo} onChange={(e) => setContractNo(e.target.value)}/>
                        </Form.Group>
                    </Col>

                    <Col xs={4}>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Legal Company</Form.Label>
                            <Form.Control type="text" placeholder="Enter Legal Company" value={legalCompany} onChange={(e) => setLegalCompany(e.target.value)}/>
                        </Form.Group>
                    </Col>
                    
                    <Col xs={4}>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Cust. Coord. Details</Form.Label>
                            <Form.Control type="text" placeholder="Enter Cust Coord Details" value={custDetails} onChange={(e) => setCustDetails(e.target.value)}/>
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
                        <Form.Label>Onsite/Offsite</Form.Label>
                            <Form.Select aria-label="Default select example" value={onsite} onChange={(e) => setOnsite(e.target.value)}>
                                <option value="Onsite">Onsite</option>
                                <option value="Offsite">Offsite</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col xs={4}>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Hours</Form.Label>
                            <Form.Control type="text" placeholder="Enter Hours" value={hours} onChange={handleHoursChange}/>
                        </Form.Group>
                    </Col>

                    <Col xs={4}>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>PMO</Form.Label>
                            <Form.Control type="text" placeholder="Enter PMO" value={pmo} />
                        </Form.Group>
                    </Col>

                    <Col xs={4}>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>SO No.</Form.Label>
                            <Form.Control type="text" placeholder="Enter SO No." value={soNo} onChange={(e) => setSoNo(e.target.value)}/>
                        </Form.Group>
                    </Col>

                    <Col xs={4}>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>SDC Status</Form.Label>
                            <Form.Control type="text" placeholder="Enter SDC Status" value={sdcstatus} onChange={(e) => setSdcStatus(e.target.value)}/>
                        </Form.Group>
                    </Col>

                    <Col xs={4}>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>SO Status</Form.Label>
                            <Form.Control type="text" placeholder="Enter SO Status" value={soStatus} onChange={(e) => setSoStatus(e.target.value)}/>
                        </Form.Group>
                    </Col>

                    <Col xs={4}>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>SO Text</Form.Label>
                            <Form.Control type="text" placeholder="Enter SO Text" value={soText} onChange={(e) => setSoText(e.target.value)}/>
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

export default AddAssociate;