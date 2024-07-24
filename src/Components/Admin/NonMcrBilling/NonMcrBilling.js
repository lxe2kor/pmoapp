import React, { useState, useEffect } from "react";
import Select from "react-select";
import AdminHeader from "../../Common/AdminHeader";
import axios from "axios";
import './NonMcrBilling.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function NonMcrBilling() {
    const today = new Date();
    const currentMonth = today.toLocaleString('default', { month: 'short' }).toUpperCase();

    const [department, setDepartment] = useState([]);
    const [selectedDept, setSelectedDept] = useState('');
    const [groups, setGroups] = useState([]);
    const [groupSelected, setGroupSelected] = useState('');
    const [data, setData] = useState([]);
    const [sortOrder, setSortOrder] = useState('asc');
    const [pasteData, setPasteData] = useState('');
    const [associates, setAssociates] = useState([]);


    useEffect(() => {
        axios.get('http://10.187.61.41:7000/api/group')
          .then(response => {
            setDepartment(response.data);
          })
          .catch(error => {
            console.error('Error fetching groups:', error);
          });

        if (selectedDept) {
            axios.get(`http://10.187.61.41:7000/api/team?group=${selectedDept}`)
              .then(response => {
                setGroups(response.data);
              })
              .catch(error => {
                console.error('Error fetching teams:', error);
              });
        }
    }, [selectedDept]);

    useEffect(() => {
        if (groupSelected) {
            axios.get(`http://10.187.61.41:7000/api/deptAssociates?team=${groupSelected}`)
              .then(response => {
                setAssociates(response.data);
              })
              .catch(error => {
                console.error('Error fetching associates:', error);
              });
        }
    }, [groupSelected]);

    const handleClick = async () => {
        try {
            const response = await axios.get("http://10.187.61.41:7000/api/fetchNonMcrData", {
                params: {
                    team: groupSelected
                }
            });
            
            const formattedData = response.data.map(item => ({
                id: item.id,
                pmo_month: item.pmo_month || currentMonth,
                pif: item.pif || '',
                ponumber: item.ponumber || '',
                contractno: item.contractno || '',
                legalcompany: item.legalcompany || '',
                custcoorddetails: item.custcoorddetails || '',
                employeename: item.employeename || '',
                empno: item.empno || '',
                onsite: item.onsite,
                hours: item.hours || '156',
                pmo: item.pmo || '1',
                sonumber: item.sonumber || '',
                sdcstatus: item.sdcstatus || '',
                sostatus: item.sostatus || '',
                sotext: item.sotext || '',
                remarks: item.remarks || '',
                isNew: false,
                isModified: false,
            }));

            setData(formattedData);
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    };

    const handleSortByMonth = () => {
        const sortedData = [...data].sort((a, b) => {
            const monthOrder = {
                Jan: 0,
                Feb: 1,
                Mar: 2,
                Apr: 3,
                May: 4,
                Jun: 5,
                Jul: 6,
                Aug: 7,
                Sep: 8,
                Oct: 9,
                Nov: 10,
                Dec: 11,
            };
            return sortOrder === 'asc'
                ? monthOrder[a.pmo_month] - monthOrder[b.pmo_month]
                : monthOrder[b.pmo_month] - monthOrder[a.pmo_month];
        });
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        setData(sortedData);
    };

    const handleAddRow = () => {
        const newRow = {
            pmo_month: currentMonth,
            pif: '',
            ponumber: '',
            contractno: '',
            legalcompany: '',
            custcoorddetails: '',
            employeename: '',
            empno: '',
            onsite: '',
            hours: '156',
            pmo: '1',
            sonumber: '',
            sdcstatus: '',
            sostatus: '',
            sotext: '',
            remarks: '',
            isNew: true,
            isModified: false,
        };
        if(selectedDept && groupSelected){
            setData([...data, newRow]);
        } else{
            alert("Please select Department and Group");
        }
    };

    const handleDeleteRow = async (index) => {
        const newData = [...data];
        const rowToDelete = newData[index];
        console.log('Row to delete:', rowToDelete.id);
    
        if (rowToDelete.id) {
            const confirmDelete = window.confirm("This row exists in the database. Are you sure you want to delete it?");
            if (confirmDelete) {
                try {
                    await axios.delete(`http://10.187.61.41:7000/api/deletenonmcrbilling1/${rowToDelete.id}`);
                    newData.splice(index, 1);
                    setData(newData);
                    alert('Row deleted successfully');
                } catch (error) {
                    console.error('Error deleting row from database:', error);
                    alert('Error deleting row from database');
                }
            }
        } else {
            newData.splice(index, 1);
            setData(newData);
        }
    };

    const handleInputChange = async (e, index, field, selectedOption = null) => {
        const newData = [...data];
        const value = selectedOption ? selectedOption.value : e.target.value;
        newData[index][field] = value;
        newData[index].isModified = true;

        if (field === 'employeename') {
            try {
                if (selectedOption) {
                    const selectedAssociate = associates.find(assoc => assoc.value === value);
                    if (selectedAssociate) {
                        const response = await axios.get('http://10.187.61.41:7000/api/remainingNonMcrHours', { params: { empno: selectedAssociate.value, pmo_month: newData[index].pmo_month } });
                        const remainingHours = response.data.remainingHours;

                        newData[index].employeename = selectedAssociate.label;
                        newData[index].empno = selectedAssociate.value;
                        newData[index].hours = remainingHours;
                        newData[index].pmo = (remainingHours / 156).toFixed(2);
                    } else {
                        newData[index].employeename = '';
                        newData[index].empno = '';
                    }
                } else {
                    newData[index].employeename = '';
                    newData[index].empno = '';
                }
            } catch (error) {
                console.error('Error setting associate name and employee number:', error);
            }
        }

        if (field === 'hours') {
            newData[index].pmo = (value / 156).toFixed(2);
        }

        setData(newData);
    };

    const handleSaveChanges = async () => {
        try {
            const newOrUpdatedRows = data.filter(row => row.isNew || row.isModified);
            await Promise.all(
                newOrUpdatedRows.map(row => {
                    const { isNew, isModified, ...rowData } = row;

                    // Validate the row data
                    if (!rowData.pmo_month || !rowData.employeename) {
                        throw new Error('Missing required fields');
                    }

                    console.log('Row Data:', rowData);

                    return row.isNew
                        ? axios.post('http://10.187.61.41:7000/api/addnonmcrbilling1', { rowData, groupSelected })
                        : axios.put(`http://10.187.61.41:7000/api/updatenonmcrbilling1/${row.id}`, rowData);
                })
            );
            alert('Changes saved successfully');
            handleClick();
        } catch (error) {
            console.error('Error saving changes:', error);
            alert('Error saving changes');
        }
    };

    const handlePasteChange = (e) => {
        setPasteData(e.target.value);
    };

    const handlePasteData = async () => {
        const pifid = pasteData.split('\n').map(pifn => pifn.trim()).filter(pifn => pifn);

        const newRows = await Promise.all(pifid.map(async (pifn) => {

            return {
                pmo_month: '',
                pif: pifn,
                ponumber: '',
                contractno: '',
                legalcompany: '',
                custcoorddetails: '',
                employeename: '',
                empno: '',
                onsite: '',
                hours: '',
                pmo: '',
                sonumber: '',
                sdcstatus: '',
                sostatus: '',
                sotext: '',
                remarks: '',
                isNew: true,
                isModified: false,
            };
        }));

        setData(prevData => [...prevData, ...newRows]);

        setPasteData('');
    };

    return (
        <>
            <AdminHeader />
            <div className="mcr-billing container-fluid">
                <div className="mcr-billing-group row mb-4 align-items-end">
                    <div className="col-md-3 mb-3">
                        <label className="form-label"><b>Select Department:</b></label>
                        <select className="form-select" aria-label="Select department" style={{ fontSize: '12px' }} value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} required>
                            <option value="">Select Department</option>
                            {department.map((group, index) => (
                                <option key={index} value={group.cgroup}>
                                    {group.cgroup}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-3 mb-3">
                        <label className="form-label"><b>Select Group:</b></label>
                        <select className="form-select" aria-label="Select group" style={{ fontSize: '12px' }} value={groupSelected} onChange={(e) => setGroupSelected(e.target.value)} required>
                            <option value="">Select Group</option>
                            {groups.map((group, index) => (
                                <option key={index} value={group.cteam}>
                                    {group.cteam}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-2 mb-3 d-flex align-items-end">
                        <button type="submit" className="btn btn-primary w-50 btn-sm" onClick={handleClick}>
                            Submit
                        </button>
                    </div>
                </div>
                <div className="mcr-billing-table">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4>Billing Information</h4>
                        <div className="d-flex align-items-end">
                            <button className="btn btn-primary btn-sm" onClick={handleAddRow}>Add Row</button>
                        </div>
                    </div>
                    <textarea
                        value={pasteData}
                        onChange={handlePasteChange}
                        placeholder="Paste PIF here, one per line"
                        className="form-control mb-3"
                    ></textarea>
                    <button className="btn btn-primary btn-sm mb-3" onClick={handlePasteData}>Paste Data</button>
                    <div className="billing-table-content table-responsive" style={{ height: '300px', maxHeight: '300px', overflowY: 'auto' }}>
                        <table className="table table-striped">
                            <thead>
                                <tr className="table-success">
                                    <th onClick={handleSortByMonth} style={{ cursor: 'pointer' }}>
                                        Month {sortOrder === 'asc' ? '▲' : '▼'}
                                    </th>
                                    <th>PIF ID</th>
                                    <th>PO No.</th>
                                    <th>Contract No.</th>
                                    <th>Legal Company</th>
                                    <th>Cust. Coord. Details</th>
                                    <th>Employee Name</th>
                                    <th>Employee No.</th>
                                    <th>Onsite/Offsite</th>
                                    <th>Hours</th>
                                    <th>PMO</th>
                                    <th>SO No.</th>
                                    <th>SDC Status</th>
                                    <th>SO Status</th>
                                    <th>SO Text</th>
                                    <th>Remarks</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <select
                                                className="form-select"
                                                style={{ width: '100px', fontSize: '12px', height: '30px' }}
                                                aria-label="Default select example"
                                                value={item.pmo_month}
                                                onChange={(e) => handleInputChange(e, index, 'pmo_month')}
                                            >
                                                <option value={currentMonth.toLowerCase()}>{currentMonth}</option>
                                                <option value="Jan">JAN</option>
                                                <option value="Feb">FEB</option>
                                                <option value="Mar">MAR</option>
                                                <option value="Apr">APR</option>
                                                <option value="May">MAY</option>
                                                <option value="Jun">JUN</option>
                                                <option value="Jul">JUL</option>
                                                <option value="Aug">AUG</option>
                                                <option value="Sep">SEP</option>
                                                <option value="Oct">OCT</option>
                                                <option value="Nov">NOV</option>
                                                <option value="Dec">DEC</option>
                                            </select>
                                        </td>
                                        <td><input type="text" className="form-control" style={{ width: '150px', fontSize: '12px', height: '30px' }} value={item.pif} onChange={(e) => handleInputChange(e, index, 'pif')} /></td>
                                        <td><input type="text" className="form-control" style={{ width: '100px', fontSize: '12px', height: '30px' }} value={item.ponumber} onChange={(e) => handleInputChange(e, index, 'ponumber')} /></td>
                                        <td><input type="text" className="form-control" style={{ width: '100px', fontSize: '12px', height: '30px' }} value={item.contractno} onChange={(e) => handleInputChange(e, index, 'contractno')} /></td>
                                        <td><input type="text" className="form-control" style={{ width: '100px', fontSize: '12px', height: '30px' }} value={item.legalcompany} onChange={(e) => handleInputChange(e, index, 'legalcompany')} /></td>
                                        <td><input type="text" className="form-control" style={{ width: '100px', fontSize: '12px', height: '30px' }} value={item.custcoorddetails} onChange={(e) => handleInputChange(e, index, 'custcoorddetails')} /></td>
                                        <td>
                                            <Select
                                                className="basic-single"
                                                classNamePrefix="select"
                                                placeholder="Employee Name"
                                                value={associates.find(assoc => assoc.value === item.empno) || null}
                                                onChange={(selectedOption) => handleInputChange({ target: { value: selectedOption ? selectedOption.value : '' } }, index, 'employeename', selectedOption)}
                                                options={associates}
                                                isSearchable
                                                isClearable
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        minHeight: '30px',
                                                        height: '30px',
                                                        fontSize: '12px',
                                                        width: '300px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }),
                                                    valueContainer: (base) => ({
                                                        ...base,
                                                        height: '30px',
                                                        padding: '0 8px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }),
                                                    singleValue: (base) => ({
                                                        ...base,
                                                        fontSize: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        lineHeight: '25px',
                                                    }),
                                                    input: (base) => ({
                                                        ...base,
                                                        margin: '0',
                                                        padding: '0',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }),
                                                    indicatorsContainer: (base) => ({
                                                        ...base,
                                                        height: '30px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }),
                                                    clearIndicator: (base) => ({
                                                        ...base,
                                                        padding: '0',
                                                    }),
                                                    dropdownIndicator: (base) => ({
                                                        ...base,
                                                        padding: '0',
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
                                                        fontSize: '12px',
                                                    }),
                                                }}
                                            />
                                        </td>
                                        <td><input type="text" className="form-control" style={{ width: '150px', fontSize: '12px', height: '30px' }} value={item.empno} readOnly /></td>
                                        <td>
                                            <select className="form-select" style={{ width: '100px', fontSize: '12px', height: '30px' }} value={item.onsite} onChange={(e) => handleInputChange(e, index, 'onsite')} >
                                                <option value="">Select Onsite/Offshore</option>
                                                <option value="Onsite">Onsite</option>
                                                <option value="Offshore">Offshore</option>
                                            </select>
                                        </td>
                                        <td><input type="text" className="form-control" style={{ width: '100px', fontSize: '12px', height: '30px' }} value={item.hours} onChange={(e) => handleInputChange(e, index, 'hours')} /></td>
                                        <td><input type="text" className="form-control" style={{ width: '100px', fontSize: '12px', height: '30px' }} value={item.pmo} onChange={(e) => handleInputChange(e, index, 'pmo')} /></td>
                                        <td><input type="text" className="form-control" style={{ width: '100px', fontSize: '12px', height: '30px' }} value={item.sono} onChange={(e) => handleInputChange(e, index, 'sonumber')} /></td>
                                        <td><input type="text" className="form-control" style={{ width: '100px', fontSize: '12px', height: '30px' }} value={item.sdcstatus} onChange={(e) => handleInputChange(e, index, 'sdcstatus')} /></td>
                                        <td><input type="text" className="form-control" style={{ width: '100px', fontSize: '12px', height: '30px' }} value={item.sostatus} onChange={(e) => handleInputChange(e, index, 'sostatus')} /></td>
                                        <td><input type="text" className="form-control" style={{ width: '100px', fontSize: '12px', height: '30px' }} value={item.sotext} onChange={(e) => handleInputChange(e, index, 'sotext')} /></td>
                                        <td><input type="text" className="form-control" style={{ width: '200px', fontSize: '12px', height: '30px' }} value={item.remarks} onChange={(e) => handleInputChange(e, index, 'remarks')} /></td>
                                        <td>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRow(index)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                    <button className="btn btn-success btn-sm mt-3" onClick={handleSaveChanges}>Save Changes</button>
                </div>
            </div>
        </>
    );
}

export default NonMcrBilling;
