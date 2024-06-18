import DahsboardService from '@app/services/dashboardservice';
import { ContentHeader } from '@components';
import { useEffect, useState } from 'react';
import IDashboard from '@app/store/Models/Dashboard';
import store from '../store/store';
import IUser from "@app/store/Models/User";
import { useSelector, useDispatch } from "react-redux"; 

const Dashboard = () => {
  const [ dashboardList, setDashboardList ] = useState<IDashboard[]>([]);
  const user = useSelector((state: IUser) => store.getState().auth);
  console.log(import.meta.env);

  useEffect(() => {

    DahsboardService.getDashboardList(user.id, user.roleName).then((response: any) => {
        if(response.isSuccess)
        {
            const list = response.data as IDashboard[];
            setDashboardList(list);
            console.log(dashboardList);
        }
    })
    .catch((e: any) => {
      console.log(e);
    });

  },[]);

  return (
    <div>
      <ContentHeader title="Dashboard" />

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            {
              dashboardList.map((obj: IDashboard, index: number) => 

                (
                  <div className="col-lg-3 col-6">
                    <div className="small-box" style={{ backgroundColor: obj.color }}>
                      <div className="inner">
                        <h3>{obj.recordCount}</h3>
                        <p>{obj.title}</p>
                      </div>
                      <div className="icon">
                          <i className={obj.icon} />
                      </div>
                      <a href="/" className="small-box-footer">
                        More info <i className="fas fa-arrow-circle-right" />
                      </a>
                  </div>
                </div>
                ))
            }
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
