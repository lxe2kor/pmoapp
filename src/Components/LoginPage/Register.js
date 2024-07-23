import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

function Register() {
    const [usernameReg, setUernameReg] = useState("");
    const [passwordReg, setPasswordReg] = useState ("");

    const navigate = useNavigate();

    axios.defaults.withCredentials = true;
    const register = async () => {
        console.log(usernameReg + passwordReg);
        await axios.post("http://localhost:7000/api/register", {
        username: usernameReg,
        password: passwordReg,
        }).then((response) => {
            console.log("Login Successful");
            navigate('/');
        }).catch((err) => {
            console.log(err);
        });
    };

    return(
        <div className="container">
            <div className="form-group">
                <label className="form-label">Username</label>
                <input type="text" className="form-control" placeholder="Enter username" value={usernameReg} onChange={(e) => setUernameReg(e.target.value)} />
            </div>
            <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" placeholder="Password" value={passwordReg} onChange={(e) => setPasswordReg(e.target.value)} />
            </div>
            <br/>
            <button className="btn btn-primary" onClick={register}>Submit</button>
        </div>
    );
}

export default Register;