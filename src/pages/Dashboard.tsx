import React, { useEffect, useState } from 'react';
import { ContentHeader } from '@components';
import axios from 'axios';

// interface DashboardData {
//   pendingJobsCount: number;
//   completedJobsCount: number;
//   totalClientsCount: number;
// }

// Define types for the authentication data
interface Authentication {
  loginName: string;
}
const Dashboard: React.FC = () => {
  console.log(import.meta.env);
  const [dashboardData, setDashboardData] = useState({
    pendingJobsCount: 0,
    completedJobsCount: 0,
    totalClientsCount: 0,
  });
  const authData = localStorage.getItem('authentication');
  const username: Authentication = authData ? JSON.parse(authData) : { loginName: '' };
  console.log(username, "username");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/dashboard?username=${username.loginName}`);
        const { ClientsCount, CompletedJobsCount, PendingJobsCount } = response.data.data;
        console.log(response.data.ata)
        setDashboardData({
          pendingJobsCount: PendingJobsCount,
          completedJobsCount: CompletedJobsCount,
          totalClientsCount: ClientsCount
        });
        
      } catch (error: any) {
        console.error('Error fetching data:', error.response ? error.response.data.message : error.message);
      }
    };
    console.log(dashboardData)
    fetchData();
  }, [username.loginName]);

  return (
    <div>
      <ContentHeader title="Dashboard" />

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-3 col-6">
              <div className="small-box bg-info">
                <div className="inner">
                  <h3>{dashboardData.pendingJobsCount}</h3>
                  <p>Pending Jobs</p>
                </div>
                <div className="icon">
                  <i className="ion ion-document" />
                </div>
                <a href="/" className="small-box-footer">
                  More info <i className="fas fa-arrow-circle-right" />
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-6">
              <div className="small-box bg-success">
                <div className="inner">
                  <h3>{dashboardData.completedJobsCount}</h3>
                  <p>Completed Jobs</p>
                </div>
                <div className="icon">
                  <i className="ion ion-document-text" />
                </div>
                <a href="/" className="small-box-footer">
                  More info <i className="fas fa-arrow-circle-right" />
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-6">
              <div className="small-box bg-warning">
                <div className="inner">
                  <h3>{dashboardData.totalClientsCount}</h3>
                  <p>Clients</p>
                </div>
                <div className="icon">
                  <i className="ion ion-person-stalker" />
                </div>
                <a href="/" className="small-box-footer">
                  More info <i className="fas fa-arrow-circle-right" />
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-6">
              <div className="small-box bg-danger">
                <div className="inner">
                  <h3>1</h3>
                  <p>Employees</p>
                </div>
                <div className="icon">
                  <i className="ion ion-person-stalker" />
                </div>
                <a href="/" className="small-box-footer">
                  More info <i className="fas fa-arrow-circle-right" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
