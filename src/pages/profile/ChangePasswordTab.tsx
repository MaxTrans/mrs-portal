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
    Password: string
}

const initialValues: IUserPreferences = {
    userId:'',
    website: '',
    defaultTat: '',
    IsPdfAllowed: undefined,
    IsDocAllowed: undefined,
    Password: ''
}


const ChagePasswordTab = ({ isActive, userId }: { isActive: boolean, userId: string }) => {
    const user = useSelector((state: IUser) => store.getState().auth);
   
    
    const validationSchema = Yup.object({
        password: Yup.string().required('Password is required')
      });
    
      const handleSubmit = async (values: IUserPreferences) => {
   
        values.userId = userId;
      
        ApiService.requests.post('User/ChangePassword', values)
                .then((response) => {
                    if(response.isSuccess)
                    {
                        toast.success('Password saved successfully');
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
    });

    return(
        <Form>
        <Form.Group as={Row}>
          <div className="col-sm-2">
              Password: 
          </div>
          <Col sm="6">
              <FormControl name="Password" value={formik.values.Password} onChange={formik.handleChange}/>
          </Col>
      </Form.Group>
      <Button type='button' onClick={() => formik.handleSubmit()}>Save</Button>
      </Form>
    );
}

export default ChagePasswordTab;