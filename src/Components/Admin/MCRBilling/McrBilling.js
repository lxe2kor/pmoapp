import React, { useState, useEffect } from "react";
import Select from "react-select";
import AdminHeader from "../../Common/AdminHeader";
import axios from "axios";
import './McrBilling.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function McrBilling() {
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
        axios.get('http://localhost:7000/api/group')
          .then(response => {
            setDepartment(response.data);
          })
          .catch(error => {
            console.error('Error fetching groups:', error);
          });

        if (selectedDept) {
            axios.get(`http://localhost:7000/api/team?group=${selectedDept}`)
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
            axios.get(`http://localhost:7000/api/deptAssociates?team=${groupSelected}`)
              .then(response => {
                setAssociates(response.data);
              })
              .catch(error => {
                console.error('Error fetching associates:', error);
              });
        }
    }, [groupSelected]);

    const handleClick = async () => {
        await axios.get("http://localhost:7000/api/fetchmcrbilling", {
            params: {
                team: groupSelected
            }
        })
        .then(async (response) => {
            const fetchedData = await Promise.all(response.data.map(async (item) => {
                const rgdResponse = await axios.get('http://localhost:7000/api/rgdOptions', { params: { bmnumber: item.bmnumber } });
                return { ...item, rgdOptions: rgdResponse.data, isNew: false, isModified: false };
            }));
            setData(fetchedData);
        })
        .catch(err => {
            console.error('Error fetching teams:', err);
        });
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
            bmnumber: '',
            wstatus: '',
            company: '',
            pd: '',
            pbu: '',
            taskid: '',
            rgd: '',
            rgid: '',
            associatename: '',
            empno: '',
            hours: '156',
            pmo: '1',
            pif: '',
            billingstatus: 'Billed',
            remarks: '',
            rgdOptions: [],
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

        if (rowToDelete.id) {  // If the row has an id, it exists in the database
            const confirmDelete = window.confirm("This row exists in the database. Are you sure you want to delete it?");
            if (confirmDelete) {
                try {
                    await axios.delete(`http://localhost:7000/api/deletemcrbilling1/${rowToDelete.id}`);
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

        if (field === 'bmnumber' && value) {
            try {
                const response = await axios.get('http://localhost:7000/api/detailsByBmNumber', { params: { bmnumber: value } });
                const details = response.data;
                newData[index].wstatus = details.mcr_id_status || '';
                newData[index].pd = details.project_division || '';
                newData[index].pbu = details.project_business_unit || '';

                const rgdResponse = await axios.get('http://localhost:7000/api/rgdOptions', { params: { bmnumber: value } });
                newData[index].rgdOptions = rgdResponse.data;
                newData[index].rgd = details.resource_group_description || newData[index].rgd;
            } catch (error) {
                console.error('Error fetching details by bmnumber:', error);
            }
        }

        if (field === 'rgd' && value) {
            try {
                const response = await axios.get('http://localhost:7000/api/rgidByRgd', { params: { rgd: value } });
                newData[index].rgid = response.data.resource_group_id;
            } catch (error) {
                console.error('Error fetching rgid by rgd:', error);
            }
        }

        if (field === 'associatename') {
            try {
                if (selectedOption) {
                    const selectedAssociate = associates.find(assoc => assoc.value === value);
                    if (selectedAssociate) {
                        const response = await axios.get('http://localhost:7000/api/remainingHours', { params: { empno: selectedAssociate.value, pmo_month: newData[index].pmo_month } });
                        const remainingHours = response.data.remainingHours;

                        newData[index].associatename = selectedAssociate.label;
                        newData[index].empno = selectedAssociate.value;
                        newData[index].hours = remainingHours;
                        newData[index].pmo = (remainingHours / 156).toFixed(2);
                    } else {
                        newData[index].associatename = '';
                        newData[index].empno = '';
                    }
                } else {
                    newData[index].associatename = '';
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
                    const { rgdOptions, isNew, isModified, ...rowData } = row;
                    rowData.rgd = rowData.rgd ? rowData.rgd.toString() : '';

                    // Validate the row data
                    if (!rowData.pmo_month || !rowData.bmnumber || !rowData.associatename) {
                        throw new Error('Missing required fields');
                    }

                    return row.isNew
                        ? axios.post('http://localhost:7000/api/addmcrbilling1', { rowData, groupSelected })
                        : axios.put(`http://localhost:7000/api/updatemcrbilling1/${row.id}`, rowData);
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
        const bmNumbers = pasteData.split('\n').map(bm => bm.trim()).filter(bm => bm);

        const newRows = await Promise.all(bmNumbers.map(async (bm) => {
            const response = await axios.get('http://localhost:7000/api/detailsByBmNumber', { params: { bmnumber: bm } });
            const details = response.data;
            const rgdResponse = await axios.get('http://localhost:7000/api/rgdOptions', { params: { bmnumber: bm } });
            const rgdOptions = rgdResponse.data;

            return {
                pmo_month: '',
                bmnumber: bm,
                wstatus: details.mcr_id_status || '',
                company: '',
                pd: details.project_division || '',
                pbu: details.project_business_unit || '',
                taskid: '',
                rgd: details.resource_group_description || '',
                rgid: '',
                associatename: '',
                empno: '',
                hours: '',
                pmo: '',
                pif: '',
                billingstatus: '',
                remarks: '',
                rgdOptions: rgdOptions,
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
                        placeholder="Paste BM numbers here, one per line"
                        className="form-control mb-3"
                    ></textarea>
                    <button className="btn btn-primary btn-sm mb-3" onClick={handlePasteData}>Paste Data</button>
                    <div className="billing-table-content table-responsive" style={{ height: '300px', maxHeight: '300px', overflowY: 'auto' }}>
                        <table className="table table-striped">
                            <thead>
                                <tr className="table-info">
                                    <th onClick={handleSortByMonth} style={{ cursor: 'pointer' }}>
                                        Month {sortOrder === 'asc' ? '▲' : '▼'}
                                    </th>
                                    <th>BM Number</th>
                                    <th>Work Status</th>
                                    <th>Company</th>
                                    <th>PD</th>
                                    <th>PBU</th>
                                    <th>RGD</th>
                                    <th>RG ID</th>
                                    <th>Task ID</th>
                                    <th>Associate Name</th>
                                    <th>Employee Number</th>
                                    <th>Hours</th>
                                    <th>PMO</th>
                                    <th>PIF</th>
                                    <th>Billing Status</th>
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
                                                <option value="JAN">JAN</option>
                                                <option value="FEB">FEB</option>
                                                <option value="MAR">MAR</option>
                                                <option value="APR">APR</option>
                                                <option value="MAY">MAY</option>
                                                <option value="JUN">JUN</option>
                                                <option value="JUL">JUL</option>
                                                <option value="AUG">AUG</option>
                                                <option value="SEP">SEP</option>
                                                <option value="OCT">OCT</option>
                                                <option value="NOV">NOV</option>
                                                <option value="DEC">DEC</option>
                                            </select>
                                        </td>
                                        <td><input type="text" className="form-control" style={{ width: '150px', fontSize: '12px', height: '30px' }} value={item.bmnumber} onChange={(e) => handleInputChange(e, index, 'bmnumber')} /></td>
                                        <td><input type="text" className="form-control" style={{ width: '100px', fontSize: '12px', height: '30px' }} value={item.wstatus} onChange={(e) => handleInputChange(e, index, 'wstatus')} /></td>
                                        <td><input type="text" className="form-control" style={{ width: '100px', fontSize: '12px', height: '30px' }} value={item.company} onChange={(e) => handleInputChange(e, index, 'company')} /></td>
                                        <td><input type="text" className="form-control" style={{ width: '100px', fontSize: '12px', height: '30px' }} value={item.pd} onChange={(e) => handleInputChange(e, index, 'pd')} /></td>
                                        <td><input type="text" className="form-control" style={{ width: '100px', fontSize: '12px', height: '30px' }} value={item.pbu} onChange={(e) => handleInputChange(e, index, 'pbu')} /></td>
                                        <td>
                                            <select
                                                className="form-select"
                                                style={{ width: '300px', fontSize: '12px', height: '30px' }}
                                                value={item.rgd}
                                                onChange={(e) => handleInputChange(e, index, 'rgd')}
                                            >
                                                <option value="">Select RGD</option>
                                                {item.rgdOptions && item.rgdOptions.map((option, optIndex) => (
                                                    <option key={optIndex} value={option.resource_group_description}>{option.resource_group_description}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td><input type="text" className="form-control" style={{ width: '100px', fontSize: '12px', height: '30px' }} value={item.rgid} readOnly /></td>
                                        <td><input type="text" className="form-control" style={{ width: '100px', fontSize: '12px', height: '30px' }} value={item.taskid} onChange={(e) => handleInputChange(e, index, 'taskid')} /></td>
                                        <td>
                                            <Select
                                                className="basic-single"
                                                classNamePrefix="select"
                                                placeholder="Associate"
                                                value={associates.find(assoc => assoc.value === item.empno) || null}
                                                onChange={(selectedOption) => handleInputChange({ target: { value: selectedOption ? selectedOption.value : '' } }, index, 'associatename', selectedOption)}
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
                                        <td><input type="text" className="form-control" style={{ width: '100px', fontSize: '12px', height: '30px' }} value={item.hours} onChange={(e) => handleInputChange(e, index, 'hours')} /></td>
                                        <td><input type="text" className="form-control" style={{ width: '100px', fontSize: '12px', height: '30px' }} value={item.pmo} onChange={(e) => handleInputChange(e, index, 'pmo')} /></td>
                                        <td><input type="text" className="form-control" style={{ width: '100px', fontSize: '12px', height: '30px' }} value={item.pif} onChange={(e) => handleInputChange(e, index, 'pif')} /></td>
                                        <td>
                                            <select className="form-select" style={{ width: '100px', fontSize: '12px', height: '30px' }} value={item.billingstatus} onChange={(e) => handleInputChange(e, index, 'billingstatus')} >
                                                <option value="">Select Billing Status</option>
                                                <option value="Billed">Billed</option>
                                                <option value="Unbilled">Unbilled</option>
                                            </select>
                                        </td>
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

export default McrBilling;
