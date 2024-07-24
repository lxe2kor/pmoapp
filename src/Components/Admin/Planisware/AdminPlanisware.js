import React,{ useState } from "react";
//import * as XLSX from 'xlsx';
import axios from "axios";
import AdminHeader from "../../Common/AdminHeader";
import './AdminPlanisware.css';

function AdminPlanisware()
{
    const [excelFile, setExcelFile] = useState(null);
    const [typeError, setTypeError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [upload, setUpload] = useState('');
    const [message, setMessage] = useState('');
    const [imported, setImported] = useState(false);


    const handleFile=(e)=>{
        let fileTypes = ['application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/csv'];
        let selectedFile = e.target.files[0];
        if(selectedFile){
            if(selectedFile&&fileTypes.includes(selectedFile.type)){
                setTypeError(null);
                setExcelFile(e.target.files[0]);
            }
            else{
                setTypeError('Please select only excel file types');
                setExcelFile(null);
            }
        }
        else{
            console.log('Please select your file');
        }
    }
    
    const handleFileSubmit = async(e) => {
        e.preventDefault();
        if(excelFile!==null){
            console.log("Spreadsheet uploaded successfully!")
            setLoading(true);
        }
        const formData = new FormData();
        formData.append('file', excelFile);
        console.log(upload);
        try {
            if(upload === "UploadMCR") {
                const response = await axios.post('http://10.187.61.41:7000/api/mcrupload', formData);
                const { success } = response.data;
                if(success){
                    setMessage('Excel file uploaded and data has been saved!');
                    setImported(true);
                }
            }
            else if(upload === "UploadPlanisware"){
                const response = await axios.post('http://10.187.61.41:7000/api/planiswareupload', formData);
                const { success } = response.data;
                if(success){
                    setMessage('Excel file uploaded and data has been saved!');
                    setImported(true);
                }
            }
        } catch (error) {
            console.error('Error uploading the file', error);
            setMessage('Error uploading the file.');
            setImported(false);
        }

        setLoading(false);
        
    }

    return(
        <>
            <AdminHeader/>
            <div className="upload-planisware">            
                <form className="form-group" onSubmit={handleFileSubmit}>
                    <h4>Select files to upload</h4>
                    <div className="upload-files">
                        <label className="upload-label">Select type of file:</label>
                        <select className="upload-select" aria-label="Select team" value={upload} onChange={(e) => setUpload(e.target.value)} required>
                            <option value="">Select upload type</option>
                            <option value="UploadPlanisware">Upload Planisware</option>
                            <option value="UploadMCR">Upload MCR</option>
                        </select>
                    </div>
                    <input type="file" className="form-control" required onChange={handleFile} />
                    {
                        loading &&
                        <div id="spinner-container" >                   
                            <div id="html-spinner"></div>
                        </div>
                    }
                    <div>
                    { 
                        imported
                        ? <span className="text-success">{ message }</span>
                        : <span className="text-danger">{ message }</span>
                    }
                    </div>
                    <button type="submit" className="btn btn-success btn-md">UPLOAD</button>
                    {typeError&&(
                    <div className="alert alert-danger" role="alert">{typeError}</div>
                    )}
                </form>
            </div>
        </>
    );
};

export default AdminPlanisware;