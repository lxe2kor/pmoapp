import React, { useState, useEffect, useContext } from "react";
import Select from "react-select";
import axios from "axios";
import UserHeader from '../../Common/UserHeader';
import '../../Admin/MCRBilling/McrBilling.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { UserContext } from '../../../UserContext';

function UserMcrBilling() {
    const { user } = useContext(UserContext);
    const group = user.group;
    const username = user.username;
    const today = new Date();
    const currentMonth = today.toLocaleString('default', { month: 'short' }).toUpperCase();
    console.log(user.group);

    const [data, setData] = useState([]);
    const [sortOrder, setSortOrder] = useState('asc');
    const [pasteData, setPasteData] = useState('');
    const [associates, setAssociates] = useState([]);

    

    useEffect(() => {
        if (group) {
            axios.get(`http://10.187.61.41:7000/api/deptAssociates?team=${group}`)
              .then(response => {
                setAssociates(response.data);
              })
              .catch(error => {
                console.error('Error fetching associates:', error);
              });
        }
    }, [group]);

    useEffect(() => {
        axios.get("http://10.187.61.41:7000/api/fetchmcrbilling1", {
            params: {
                team: group,
                username
            }
        })
        .then(async (response) => {
            const fetchedData = await Promise.all(response.data.map(async (item) => {
                const rgdResponse = await axios.get('http://10.187.61.41:7000/api/rgdOptions', { params: { bmnumber: item.bmnumber } });
                return { ...item, rgdOptions: rgdResponse.data, isNew: false, isModified: false };
            }));
            setData(fetchedData);
        })
        .catch(err => {
            console.error('Error fetching teams:', err);
        });
    }, [group, username]);

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

        setData([...data, newRow]);
    };

    const handleDeleteRow = async (index) => {
        const newData = [...data];
        const rowToDelete = newData[index];

        if (rowToDelete.id) {
            const confirmDelete = window.confirm("This row exists in the database. Are you sure you want to delete it?");
            if (confirmDelete) {
                try {
                    await axios.delete(`http://10.187.61.41:7000/api/deletemcrbilling2/${rowToDelete.id}?username=${username}`);
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
                const response = await axios.get('http://10.187.61.41:7000/api/detailsByBmNumber', { params: { bmnumber: value } });
                const details = response.data;
                newData[index].wstatus = details.mcr_id_status || '';
                newData[index].pd = details.project_division || '';
                newData[index].pbu = details.project_business_unit || '';

                const rgdResponse = await axios.get('http://10.187.61.41:7000/api/rgdOptions', { params: { bmnumber: value } });
                newData[index].rgdOptions = rgdResponse.data;
                newData[index].rgd = details.resource_group_description || newData[index].rgd;
            } catch (error) {
                console.error('Error fetching details by bmnumber:', error);
            }
        }

        if (field === 'rgd' && value) {
            try {
                const response = await axios.get('http://10.187.61.41:7000/api/rgidByRgd', { params: { rgd: value } });
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
                        const response = await axios.get('http://10.187.61.41:7000/api/remainingHours', { params: { empno: selectedAssociate.value, pmo_month: newData[index].pmo_month } });
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
                        ? axios.post('http://10.187.61.41:7000/api/addmcrbilling2', { rowData, group, username })
                        : axios.put(`http://10.187.61.41:7000/api/updatemcrbilling2/${row.id}`, { rowData, username });
                })
            );
            alert('Changes saved successfully');
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
            const response = await axios.get('http://10.187.61.41:7000/api/detailsByBmNumber', { params: { bmnumber: bm } });
            const details = response.data;
            const rgdResponse = await axios.get('http://10.187.61.41:7000/api/rgdOptions', { params: { bmnumber: bm } });
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
            <UserHeader />
            <div className="mcr-billing container-fluid">
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
                    <div className="billing-table-content table-responsive" style={{ height: '400px', maxHeight: '400px', overflowY: 'auto' }}>
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
                                        <td><input type="text" className="form-control" style={{ width: '100px', fontSize: '12px', height: '30px' }} value={item.pif} onChange={(e) => handleInputChange(e, index, 'pif')} disabled/></td>
                                        <td>
                                            <select className="form-select" style={{ width: '100px', fontSize: '12px', height: '30px' }} value={item.billingstatus} onChange={(e) => handleInputChange(e, index, 'billingstatus')} disabled >
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

export default UserMcrBilling;
