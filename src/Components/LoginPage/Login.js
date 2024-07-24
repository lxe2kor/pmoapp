import React, { useState, useContext, useEffect } from "react";
import './Login.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from '../Common/Header';
import { AdminContext } from "../../AdminContext";
import { UserContext } from "../../UserContext";

function Login() {
    const { setAdmin } = useContext(AdminContext);
    const { setUser } = useContext(UserContext);
    const [logintype, setLogintype] = useState('User');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [department, setDepartment] = useState([]);
    const [selectedDept, setSelectedDept] = useState('');
    const [groups, setGroups] = useState([]);
    const [groupSelected, setGroupSelected] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();
    axios.defaults.withCredentials = true;

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
        const adminToken = localStorage.getItem("adminToken");
        const userToken = localStorage.getItem("userToken");

        if (adminToken) {
            axios.get("http://10.187.61.41:7000/api/protectedRoute", {
                headers: { "x-access-token": adminToken }
            }).then((response) => {
                if (response.data.success) {
                    setAdmin({ token: adminToken });
                    navigate("/AdminHome");
                }
            }).catch((err) => {
                console.error(err);
                localStorage.removeItem("adminToken");
            });
        }

        if (userToken) {
            axios.get("http://10.187.61.41:7000/api/protectedRoute", {
                headers: { "x-access-token": userToken }
            }).then((response) => {
                if (response.data.success) {
                    setUser({ token: userToken });
                    navigate("/UserHome");
                }
            }).catch((err) => {
                console.error(err);
                localStorage.removeItem("userToken");
            });
        }
    }, [navigate, setAdmin, setUser]);

    const login = (event) => {
        event.preventDefault();
        if (logintype === 'Admin') {
            axios.post("http://10.187.61.41:7000/api/adminLogin", {
                username,
                password,
            }).then((response) => {
                if (!response.data.auth) {
                    setErrorMessage('Username or password is incorrect');
                } else {
                    localStorage.setItem("adminToken", response.data.token);
                    setAdmin({ username, token: response.data.token });
                    navigate("/AdminHome");
                }
            }).catch((err) => {
                console.error(err);
                setErrorMessage('An error occurred during login');
            });
        } else if (logintype === 'User') {
            axios.post("http://10.187.61.41:7000/api/userLogin", {
                username,
                pmodepartment: selectedDept,
                pmogroup: groupSelected
            }).then((response) => {
                if (response.data.auth) {
                    localStorage.setItem("userToken", response.data.token);
                    setUser({
                        username,
                        department: selectedDept,
                        group: groupSelected,
                        token: response.data.token
                    });
                    navigate("/UserHome");
                } else {
                    setErrorMessage('An error occurred during login');
                }
            }).catch((err) => {
                console.error(err);
                setErrorMessage('An error occurred during login');
            });
        }
    }

    return (
        <>
            <Header />
            <div className="background-pmo">
                <div className="login-container">
                    <form className="login-form" onSubmit={login}>
                        <h3 className="login-title">PMO</h3>
                        <div className="form-group">
                            <label className="form-label">Login type<span className="text-danger">*</span></label>
                            <select className="form-select" aria-label="select login type" value={logintype} onChange={(e) => setLogintype(e.target.value)} required>
                                <option value="">Select login type</option>
                                <option value="Admin">Admin</option>
                                <option value="User">User</option>
                            </select>
                        </div>

                        {logintype === "Admin" && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="username">Username<span className="text-danger">*</span></label>
                                    <input type="text" id="username" name="username" className="form-control" placeholder="Enter Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="password">Password<span className="text-danger">*</span></label>
                                    <input type="password" id="password" name="password" className="form-control" placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>
                            </>
                        )}

                        {logintype === "User" && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="username">NT ID<span className="text-danger">*</span></label>
                                    <input type="text" id="username" name="username" placeholder="Enter NT ID" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required />
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
                            </>
                        )}
                        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                        <div className="d-grid gap-2 mt-3">
                            <button type="submit" className="btn btn-primary">
                                Login
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Login;
