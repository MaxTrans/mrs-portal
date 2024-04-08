import { useState } from "react";
import { useFormik } from "formik";
import { Form, FormControl, Row, Col, Button, Nav, Image } from "react-bootstrap";
import * as Yup from 'yup';
import UppyUpload from "@app/components/upload/uppyupload";
import { PiFilesThin, PiFileThin } from "react-icons/pi";
import { useSelector, useDispatch } from "react-redux"; 
import store from '../store/store';
import IUploadFiles from "@app/store/Models/UploadFiles";
import { removeUploadedFiles } from '@store/reducers/fileupload';
import ApiService from "@app/services/Api.service";
import { toast } from "react-toastify";
import { AxiosResponse } from "axios";

interface IUploadForm{
    uploadfiles: any[],
    tat:string,
    comment: string,
    uploadtype:boolean
}
export default function Upload(){
    const [submitting, setSubmitting] = useState(false);
    const [ isSingle, setIsSingle ] = useState(true);
    const [showForm, setShowForm ] = useState(false);

    const uploadedFiles = useSelector((state: Array<IUploadFiles>) => store.getState().uploadfile);
    const dispatch = useDispatch();
    const initialValues: IUploadForm = {
        uploadfiles: uploadedFiles,
        tat:'',
        comment:'',
        uploadtype:true
    }

    const validationSchema = Yup.object({
        uploadfiles: Yup.mixed().required('Please select a file'),
        tat: Yup.string().required('TAT is required'),
        comment: Yup.string().required('Comment is required'),
    });

    const handleSubmit = async (values: IUploadForm) => {
        try{
            setSubmitting(true);
            values.uploadfiles = uploadedFiles
            values.uploadtype = isSingle
           
            ApiService.requests.post('Upload/SaveJob', values)
            .then((response) => {
                if(response.isSuccess)
                {
                    toast.success('Job saved successfully');
                }
                else
                {
                    toast.error((response as AxiosResponse).data);
                }
            });

            setSubmitting(false);
        }
        catch(error){
            console.log(error);
            setSubmitting(false);
        }
    }

    const formik = useFormik({
        initialValues: initialValues,
        onSubmit: handleSubmit,
        validationSchema: validationSchema,
        
    })

    return(
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Upload</h3>
                    </div>
                    <div className="card-body">
                    
                    { !showForm && <div className="d-flex justify-content-center mb-3">
                        <div className="shadow upload-button-green mr-5 pointer box" onClick={() => { setIsSingle(false); setShowForm(true) }}>
                        <PiFilesThin size={80} className="transparent-color"/>
                            Merge Upload
                        </div>   
                        <div className="shadow upload-button-blue px-3 pointer box" onClick={() => { setIsSingle(true); setShowForm(true) }}>
                            <PiFileThin size={80} className="transparent-color"/>
                            Single Upload
                        </div>
                    </div> }
                    {showForm && (<Form onSubmit={formik.handleSubmit}>
                       
                        <Form.Group as={Row} className="mb-3">
                            <div className="col-sm-2">
                                TAT: 
                            </div>
                            <Col sm="6">
                            <FormControl as="select" aria-label="Please select TAT" name="tat"
                            value={formik.values.tat}
                             onChange={formik.handleChange}>
                                <option>Select</option>
                                <option value="1">One hour</option>
                                <option value="2">Two hours</option>
                                <option value="3">Three hours</option>
                            </FormControl>
                            </Col>
                            {formik.touched.tat && formik.errors.tat && (
                                <Col sm="4">{formik.errors.tat}</Col>
                            )}
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3">
                            <div className="col-sm-2">
                                Comments: 
                            </div>
                            <Col sm="6">
                                <FormControl placeholder="Please enter comments" name="comment"  as="textarea" rows={3} value={formik.values.comment} onChange={formik.handleChange}/>
                            </Col>
                            {formik.touched.comment && formik.errors.comment && (
                                <Col sm="4">{formik.errors.comment}</Col>
                            )}
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3">
                            <div className="col-sm-2">
                                Upload: 
                            </div>
                            <Col sm="6">
                                <UppyUpload />
                            </Col>
                                {formik.touched.uploadfiles && formik.errors.uploadfiles && (
                                    <Col sm="4">{formik.errors.uploadfiles.toString()}</Col>
                                )}
                        </Form.Group>
                        <Button variant="primary" className="offset-2" type="submit">
                            Submit
                        </Button>
                        <Button variant="secondary" type="button" className="ml-3" onClick={() => { setShowForm(false); dispatch(removeUploadedFiles())  }}>
                            Back
                        </Button>
                    </Form>)}
                    </div>
                </div>
            </div>
        </section>
    )
};