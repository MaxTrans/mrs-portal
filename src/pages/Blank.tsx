import { ContentHeader } from '@components';

import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import Dropdown from 'react-bootstrap/Dropdown';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import { toast } from 'react-toastify';
import ApiService from '@app/services/Api.service';

const Blank = () => {

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const testApi = () => {
    ApiService.httpGet('HelloWorld')
    .then((response) => {
        console.log(response);      
    })

  };

  const createNotification = (type:any) => {
    return () => {
      switch (type) {
        case 'info':
          //NotificationManager.info('Info message');
          toast.info('SucInfo messagecess.')
          break;
        case 'success':
          NotificationManager.success('Success message', 'Title here');
          break;
        case 'warning':
          //NotificationManager.warning('Warning message', 'Close after 3000ms', 3000);
          toast.warning('Warning message.')
          break;
        case 'error':
          NotificationManager.error('Error message', 'Click me!', 5000, () => {
            alert('callback');
          });
          break;
      }
    };
  };

  return (
    
    <div>
      {/* <ContentHeader title="Blank Page" /> */}
      <section className="content">
        <div className="container-fluid">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Title</h3>
              <div className="card-tools">
                <button
                  type="button"
                  className="btn btn-tool"
                  data-widget="collapse"
                  data-toggle="tooltip"
                  title="Collapse"
                >
                  <i className="fa fa-minus" />
                </button>
                <button
                  type="button"
                  className="btn btn-tool"
                  data-widget="remove"
                  data-toggle="tooltip"
                  title="Remove"
                >
                  <i className="fa fa-times" />
                </button>
              </div>
            </div>
            <div className="card-body">
            <Button variant="primary" onClick={testApi}>
        test api call
      </Button>
              Start creating your amazing application!
              <div className='row'>
                <div className='col-md-6'>
                <form>
  <div className="form-group">
    <label htmlFor="exampleInputEmail1">Email address</label>
    <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email"></input>
    <small id="emailHelp" className="form-text text-muted">We'll never share your email with anyone else.</small>
  </div>
  <div className="form-group">
    <label htmlFor="exampleInputPassword1">Password</label>
    <input type="password" className="form-control" id="exampleInputPassword1" placeholder="Password"></input>
  </div>
  <div className="form-check">
    <input type="checkbox" className="form-check-input" id="exampleCheck1"></input>
    <label className="form-check-label" htmlFor="exampleCheck1">Check me out</label>
  </div>
  <button type="submit" className="btn btn-primary">Submit</button>
</form>
<Dropdown>
      <Dropdown.Toggle variant="success" id="dropdown-basic">
        Dropdown Button
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
        <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
        <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
                </div>
                <div className='col-md-6'>
                
                <Button variant="primary" onClick={handleShow}>
        Launch demo modal
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header  placeholder='{ closeButton: true}'>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>Woohoo, you are reading this text in a modal!</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

                </div>

                <div className='row'>
  <div className='col-md-6'>
  <div>
        <button className='btn btn-info'
          onClick={createNotification('info')}>Info
        </button>
        <hr/>
        <button className='btn btn-success'
          onClick={createNotification('success')}>Success
        </button>
        <hr/>
        <button className='btn btn-warning'
          onClick={createNotification('warning')}>Warning
        </button>
        <hr/>
        <button className='btn btn-danger'
          onClick={createNotification('error')}>Error
        </button>

        <NotificationContainer/>
      </div>
  </div>
 </div>
              </div>
            </div>
            <div className="card-footer">Footer</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blank;
