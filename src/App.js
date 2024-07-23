import './App.css';
import React from 'react';
import Login from './Components/LoginPage/Login';
import AdminHomepage from './Components/Admin/Homepage/AdminHomepage';
import { Routes, Route } from 'react-router-dom';
import UserHomepage from './Components/User/UserHomepage/UserHomepage';
import AdminPlanisware from './Components/Admin/Planisware/AdminPlanisware';
import VerifyPlanisware from './Components/Admin/VerifyPlanisware/VerifyPlanisware';
import McrGroupSetup from './Components/Admin/Configure/MCRGrpSetup/McrGrpSetup';
import GrmInfo from './Components/Admin/Configure/GrM Info/GrmInfo';
import McrBilling from './Components/Admin/MCRBilling/McrBilling';
import NonMcrBilling from './Components/Admin/NonMcrBilling/NonMcrBilling';
import McrStatus from './Components/Admin/MCRStatus/McrStatus';
import UserMcrBilling from './Components/User/UserMCRBilling/UserMcrBilling';
import UserNonMcrBilling from './Components/User/UserNonMcrBilling/UserNonMcrBilling';
import UserMcrStatus from './Components/User/UserMcrStatus/UserMcrStatus';
import UserVerifyPlanisware from './Components/User/UserVerifyPlanisware/UserVerifyPlanisware';
import ResourceGroup from './Components/Admin/Configure/ResourceGroupInfo/ResourceGroup';
import Register from './Components/LoginPage/Register';
import ProtectedRoute from './ProtectedRoute';
import Test from './Components/Admin/MCRBilling/Test';
import { AdminProvider } from './AdminContext';
import { UserProvider } from './UserContext';

function App() {
  return (
    <div className="App">
      
      <AdminProvider>
        <UserProvider>
          <Routes>
            <Route exact path='/' element={<Login/>} />
            <Route exact path='/AdminHome' element={<ProtectedRoute adminOnly><AdminHomepage/></ProtectedRoute>} />
            <Route exact path='/AdminPlanisware' element={<ProtectedRoute adminOnly><AdminPlanisware/></ProtectedRoute>} />
            <Route exact path='/VerifyPlanisware' element={<ProtectedRoute adminOnly><VerifyPlanisware/></ProtectedRoute>} />
            <Route exact path='/McrGrpSetup' element={<ProtectedRoute adminOnly><McrGroupSetup/></ProtectedRoute>} />
            <Route exact path='/GrmSetup' element={<ProtectedRoute adminOnly><GrmInfo/></ProtectedRoute>} />
            <Route exact path='/ResourceGroupInfo' element={<ProtectedRoute adminOnly><ResourceGroup/></ProtectedRoute>} />
            <Route exact path='/McrBilling' element={<ProtectedRoute adminOnly><McrBilling/></ProtectedRoute>} />
            <Route exact path='/NonMcrBilling' element={<ProtectedRoute adminOnly><NonMcrBilling/></ProtectedRoute>}/>
            <Route exact path='/McrStatus' element={<ProtectedRoute adminOnly><McrStatus/></ProtectedRoute>}/>
            <Route exact path='/Register' element={<Register/>} />
            <Route exact path='/UserHome' element={<ProtectedRoute userOnly><UserHomepage/></ProtectedRoute>} />
            <Route exact path='/UserMcrBilling' element={<ProtectedRoute userOnly><UserMcrBilling/></ProtectedRoute>}/>
            <Route exact path='/UserNonMcrBilling' element={<ProtectedRoute userOnly><UserNonMcrBilling/></ProtectedRoute>}/>
            <Route exact path='/UserMcrStatus' element={<ProtectedRoute userOnly><UserMcrStatus/></ProtectedRoute>}/>
            <Route exact path='/UserVerifyPlanisware' element={<ProtectedRoute userOnly><UserVerifyPlanisware/></ProtectedRoute>}/>
            <Route exact path='/test' element={<Test/>}/>
          </Routes>
        </UserProvider>
      </AdminProvider>
    </div>
  );
}

export default App;
