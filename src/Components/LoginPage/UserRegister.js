import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

function UserRegister() {
    const [username, setUername] = useState('');
    const [department, setDepartment] = useState([]);
    const [selectedDept, setSelectedDept] = useState('');
    const [groups, setGroups] = useState([]);
    const [groupSelected, setGroupSelected] = useState('');

    const navigate = useNavigate();

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

    axios.defaults.withCredentials = true;
    const register = async () => {
        await axios.post("http://10.187.61.41:7000/api/userRegister", {
            username: username,
            pmodepartment: selectedDept,
            pmogroup: groupSelected
        }).then((response) => {
            console.log("Registered Successful");
            navigate('/AdminHome');
        }).catch((err) => {
            console.log(err);
        });
    };

    return(
        <div className="container">
            <div className="form-group">
                <label className="form-label">Username</label>
                <input type="text" className="form-control" placeholder="Enter username" value={username} onChange={(e) => setUername(e.target.value)} />
            </div>
            <div className="form-group">
                <label className="form-label">Department<span className="text-danger">*</span></label>
                <select className="form-select" aria-label="Select department" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} required>
                    <option value="">Select Department</option>
                    {department.map((group, index) => (
                        <option key={index} value={group.cgroup}>
                            {group.cgroup}
                        </option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Group<span className="text-danger">*</span></label>
                <select className="form-select" aria-label="Select group" value={groupSelected} onChange={(e) => setGroupSelected(e.target.value)} required>
                    <option value="">Select Group</option>
                    {groups.map((group, index) => (
                        <option key={index} value={group.cteam}>
                            {group.cteam}
                        </option>
                    ))}
                </select>
            </div>
            <br/>
            <button className="btn btn-primary" onClick={register}>Submit</button>
        </div>
    );
}

export default UserRegister;