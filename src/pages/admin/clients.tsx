import { Column ,Formatters, GridOption, OnEventArgs, SlickgridReact, SlickgridReactInstance, SlickGrid, MenuCommandItem } from 'slickgrid-react';
import { useEffect, useRef, useState } from 'react';
import PageLoader from '@app/utils/loading';
import ConfigSettings from '@app/utils/config';
import { useSelector, useDispatch } from 'react-redux';
import store from '../../store/store';
import IUser from '../../store/Models/User';
import ApiService from '@app/services/Api.service';
import { AxiosResponse } from 'axios';
import ClientService from '@app/services/clientservice';
import { useNavigate } from "react-router-dom";
interface State {
    title: string;
    subTitle: string;
    gridOptions2?: GridOption;
    columnDefinitions1: Column[];
}

//let reactGrid!: SlickgridReactInstance;
let grid1!: SlickGrid;

const ClientsList = () => {
    const user = useSelector((state: IUser) => store.getState().auth);
    const [showloader, setLoader] = useState(true);
    const dispatch = useDispatch();
    const [reactGrid, setGrid] = useState<SlickgridReactInstance>();
    const [dataset, setData] = useState<any[]>([]);
    let data=dataset.map(item=>{
      return {...item,id:item.Id,clientName:item.ClientName,lastName:item.LastName,firstName:item.FirstName,email:item.Email,loginName:item.LoginName,createdDateTime:item.CreatedDateTime,defaultTAT:item.DefaultTAT}
    })
    const navigate = useNavigate();
    const MenuCommandItems: MenuCommandItem[] = Array<MenuCommandItem>();

    const columns: Column[] = [
        { id: 'clientName', name: 'Client Name', field: 'clientName', sortable: true, maxWidth:80 },
        { id: 'lastName', name: 'Last Name', field: 'lastName', sortable: true, maxWidth: 100 },
        { id: 'firstName', name: 'First Name', field: 'firstName', sortable: true, maxWidth: 100 },
        { id: 'email', name: 'Email', field: 'email', sortable: true, maxWidth: 100 },
        { id: 'loginName', name: 'User Name', field: 'loginName', sortable: true, maxWidth: 100 },
        { id: 'createdDateTime', name: 'Date', field: 'createdDateTime', sortable: true, formatter: Formatters.dateIso, maxWidth: 100 },
        { id: 'defaultTAT', name: 'TAT', field: 'defaultTAT', sortable: true, maxWidth: 100 },
        {
          id: 'action',
          name: '',
          field: 'id',
          maxWidth: 100,
          formatter: () => `<div class="btn btn-default btn-xs">Action <i class="fa fa-caret-down"></i></div>`,
          cellMenu: {
            commandItems: [
              {
                command: 'Profile',
                title: 'Edit Profile',
                iconCssClass: 'fa fa-user text-success',
                positionOrder: 66,
                action: (_e, args) => {
                  navigate('/profile', { state: { userId: args.dataContext.userId, tab:'PREFERENCES' } })
                },
              },
              {
                command: 'changePassword',
                title: 'Change Password',
                iconCssClass: 'fa fa-key text-success',
                positionOrder: 66,
                action: (_e, args) => {
                  console.log(args.dataContext);
                  navigate('/profile', { state: { userId: args.dataContext.userId, tab:'CHANGEPASSWORD' } })
                },
              },
            ]
          }
        }
      ];
    
      const gridOptions: GridOption = {
        ...ConfigSettings.gridOptions,
        ...{
          datasetIdPropertyName: 'id',
          enableCellMenu: true,
          cellMenu: {
            onCommand: (_e, args) => function () { },
            onOptionSelected: (_e, args) => {
            },
          }
        }
      };
    
      function reactGridReady(reactGridInstance: SlickgridReactInstance) {
        setGrid(reactGridInstance);
      }
    
      const loadData = (isreload:boolean) => {
        setLoader(true);
        ClientService.getClients().then((response: any) => {
          if (response.isSuccess) {
            let data = response.data;
            console.log(data);
            setData(data);
          }
        }).catch(() => {
          setLoader(false);
        }).finally(() => {
          setLoader(false);
        });
      }

      useEffect(() => {
        loadData(false);
      }, []);

    return (
      <>
        {showloader && <PageLoader></PageLoader>}
        <div>
        <section className="content">
          <div className="container-fluid">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Clients</h3>
              </div>
              <div className="card-body">
              <div className='row pt-4'>
                  <div className='col-md-12' style={{ zIndex: '0' }}>
                    <SlickgridReact gridId="grid1"
                      columnDefinitions={columns}
                      gridOptions={gridOptions!}
                      dataset={data}
                      onReactGridCreated={e => { reactGridReady(e.detail); }}
                    />
                  </div>
                </div>
              </div>
            </div>
            </div>
        </section>
        </div>
      </>   
    );

};

export default ClientsList;