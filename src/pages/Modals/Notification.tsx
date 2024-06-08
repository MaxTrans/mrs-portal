import NotificationService, { getNotifications } from "@app/services/notificationService";
import { MouseEventHandler, forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Button, Form, FormControl, Modal } from "react-bootstrap";
import moment from 'moment';
import * as Yup from 'yup';
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import IUser from "@app/store/Models/User";
import store from "@app/store/store";
import { useTheme } from "styled-components";

export interface IDialog {
  title: string;
  okBottonText?: string;
  cancelBottonText?: string;
  details?:Object | any;
  reloadGridData: Function
}

interface INotificationForm {
  comments: string
  jobId: string,
  userId: string
}

const NotificationModal = forwardRef((props: IDialog, ref) => {

  const [submitting, setSubmitting] = useState(false);
  const [jobId, setJObId] = useState('');
  const [loding, setLoading] = useState(false);
  const [show, setNotificationShow] = useState(false);
  const notificationClose = () => setNotificationShow(false);

  const user = useSelector((state: IUser) => store.getState().auth);

  const initialValues: INotificationForm = {
    comments: '',
    jobId: '',
    userId: ''
  }

  const validationSchema = Yup.object({
    comments: Yup.string().required('Comment is required')
  });

  const handleSubmit = async (values: INotificationForm) => {
    setLoading(true);
    try {
      setSubmitting(true);

      let data = {
        jobId: jobId,
        comments: values.comments,
        userId: user.id
      };

      const response: any = await NotificationService.saveNotification(data);
      if (response.isSuccess) {
        getNotificationList(data.jobId);
        saveForm.resetForm();
        //props.reloadGridData();
        console.log(response.data);

      }
      setSubmitting(false);
      setLoading(false);

    }
    catch (error) {
      console.log(error);
      setSubmitting(false);
    }
  }

  const saveForm = useFormik({
    initialValues: initialValues,
    onSubmit: handleSubmit,
    validationSchema: validationSchema,

  });

  function getNotificationList(jobId: string) {
    setNotificationShow(true);
    NotificationService.getNotifications(jobId,user.id).then((response:any) => {
      if (response.isSuccess) {
        setNotificationData(response.data);
      }
      }
    );
  }

  function closeModal(){
    setNotificationData([]);
    notificationClose();
    props.reloadGridData();
  }
  const [notificationList, setNotificationData] = useState([]);
  useImperativeHandle(ref, () => ({
    getNotifications(jobId: string){
      setJObId(jobId);
      getNotificationList(jobId);
      saveForm.resetForm();
    }
    
  }));

  const ModalBodyContent = () => {
    let notifications = notificationList.map((item: any) =>
      <div className="row px-2" key={item.id}>
        <div className={"col-md-11"}>
          <div className={"callout p-2 " + (item.isReadMessage ? 'callout-default' : 'callout-success')}>
            <div>
              <span className={"badge " + (item.createdByName == 'You' ? 'badge-secondary' : 'badge-info')}>{item.createdByName}</span>&nbsp;
              <span className={"badge " + (item.createdByName == 'You' ? 'badge-secondary' : 'badge-warning')}>{moment(item.createdDateTime).format('YYYY-MM-DD hh:mm A')}</span>
            </div>
            <div>
              {item.comments}
            </div>
          </div>
        </div>
      </div>

    );  

    return (
      <>
        {notifications}
      </>
    );
  }

  return (
    <>
      <Modal size="lg" show={show} onHide={closeModal} centered={false} scrollable={true}>
        <Modal.Header placeholder={'Files'} closeButton={true} className="py-2">
          <Modal.Title>Job Notifications</Modal.Title>
        </Modal.Header>
        <Modal.Body className='p-1' style={{ overflowX: 'hidden' }}>
        <div className="row p-2 ">
          <div className="px-2">
          Job Id : {props?.details?.jobId}
          </div>
          <div className="px-2">
          FIle Name : {props?.details?.name}
          </div>
          <div  className="px-2">
          Client Name : {props?.details?.userName}
          </div>
          </div>
          <div className="row p-2">
            <div className="col-md-10">
              <FormControl placeholder="Please enter comments" name="comments" as="textarea" rows={3} value={saveForm.values.comments} onChange={saveForm.handleChange} />
              {saveForm.touched.comments && saveForm.errors.comments && (
                <div className="text-danger">{saveForm.errors.comments}</div>
              )}

            </div>
            <div className="col-md-1">
              <Button disabled={loding} className="btn-sm" onClick={saveForm.handleSubmit as any}>
                Post
              </Button>
            </div>
          </div>

          <ModalBodyContent></ModalBodyContent>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="default" onClick={closeModal} className='btn btn-sm'>
            {props.cancelBottonText}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );

});

export default NotificationModal;