import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Form, FormControl, Row, Col, Button, FormCheck } from "react-bootstrap";
import { useState } from 'react';
import ApiService from '@app/services/Api.service';
import { toast } from "react-toastify";
import { AxiosResponse } from 'axios';
import store from '../../store/store';
import IUser from "@app/store/Models/User";
import { useSelector } from 'react-redux';

interface IUserPreferences {
    userId: string,
    website: string,
    defaultTat: string,
    IsPdfAllowed: boolean | undefined,
    IsDocAllowed: boolean | undefined,
}

const initialValues: IUserPreferences = {
    userId:'',
    website: '',
    defaultTat: '',
    IsPdfAllowed: undefined,
    IsDocAllowed: undefined
}

const SettingsTab = ({ isActive, userId }: { isActive: boolean, userId: string }) => {
  const user = useSelector((state: IUser) => store.getState().auth);
  const [ pdfAllowed, setPdfAllowed ] = useState(false);
  const [ docAllowed, setDocAllowed ] = useState(false);

  const validationSchema = Yup.object({
    defaultTat: Yup.string().required('TAT is required'),
    PdfAllowed: Yup.boolean().required('Please select PDF is allowed'),
    DocAllowed: Yup.boolean().required('Please select DOC/DOCX is allowed'),
  });

  const handleSubmit = async (values: IUserPreferences) => {
   
    values.userId = userId;
  
    ApiService.requests.post('User/SavePreferences', values)
            .then((response) => {
                if(response.isSuccess)
                {
                    toast.success('Preferences saved successfully');
                    formik.resetForm();
                }
                else
                {
                    toast.error((response as AxiosResponse).data);
                }
            });
  }

  const formik = useFormik({
    initialValues: initialValues,
    onSubmit: handleSubmit,
    //validationSchema: validationSchema,
})

  return (
    <Form>
        <Form.Group as={Row}>
          <div className="col-sm-2">
              Website: 
          </div>
          <Col sm="6">
              <FormControl placeholder="Please enter website/url" name="website"  value={formik.values.website} onChange={formik.handleChange}/>
          </Col>
      </Form.Group>
      <Form.Group as={Row} className="mb-3">
        <div className="col-sm-2">
            TAT: 
        </div>
        <Col sm="6">
        <FormControl as="select" aria-label="Please select TAT" name="defaultTat"
          value={formik.values.defaultTat}
            onChange={formik.handleChange}>
              <option value="">-- Select --</option>
              <option value="1">24 hours</option>
              <option value="2">Two days</option>
              <option value="3">Three days</option>
          </FormControl>
        </Col>
      </Form.Group>
      <Form.Group as={Row}>
          <div className="col-sm-2">
              PDF Allowed: 
          </div>
          <Col sm="6">
              <FormCheck name="PdfAllowed" type='checkbox' checked={pdfAllowed} onChange={(e) => { setPdfAllowed(e.target.checked); formik.values.IsPdfAllowed = e.target.checked }}/>
          </Col>
      </Form.Group>
      <Form.Group as={Row}>
          <div className="col-sm-2">
              DOC/DOCX Allowed: 
          </div>
          <Col sm="6">
          <FormCheck name="DocAllowed" type='checkbox' checked={docAllowed} onChange={(e) => { setDocAllowed(e.target.checked); formik.values.IsDocAllowed = e.target.checked }}/>
          </Col>
      </Form.Group>
      <Button type='button' onClick={() => formik.handleSubmit()}>Save</Button>
    </Form>
  );
};

export default SettingsTab;
