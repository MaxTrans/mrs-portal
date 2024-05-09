import { ContentHeader } from '@components';
import { Column, Formatters, GridOption, OnEventArgs, SlickgridReact, SlickgridReactInstance } from 'slickgrid-react';
import JobService from '@app/services/jobService';

interface Props { }

interface State {
  title: string;
  subTitle: string;
  gridOptions1?: GridOption;
  gridOptions2?: GridOption;
  columnDefinitions1: Column[];
  columnDefinitions2: Column[];
  dataset1: any[];
  dataset2: any[];
}

const Jobs = () => {
  let reactGrid!: SlickgridReactInstance;
  const dataset1:any[] = [];

  const columns: Column[] = [
    { id: 'job-id', name: 'Job ID', field: 'jobId', sortable: true, minWidth: 60 },
    { id: 'name', name: 'Name', field: 'name', sortable: true, minWidth: 100 },
    { id: 'duration', name: 'Duration (days)', field: 'duration', sortable: true, minWidth: 100 },
    { id: '%', name: '% Complete', field: 'percentComplete', sortable: true, minWidth: 100 },
    { id: 'start', name: 'Start', field: 'start', formatter: Formatters.dateIso },
    { id: 'finish', name: 'Finish', field: 'finish', formatter: Formatters.dateIso },
    { id: 'effort-driven', name: 'Effort Driven', field: 'effortDriven', sortable: true, minWidth: 100 },
    {
      id: 'edit',
      field: 'id',
      excludeFromColumnPicker: true,
      excludeFromGridMenu: true,
      excludeFromHeaderMenu: true,
      formatter: Formatters.icon,
      params: { iconCssClass: 'fa fa-edit pointer' },
      minWidth: 30,
      maxWidth: 30,
      // use onCellClick OR grid.onClick.subscribe which you can see down below
      onCellClick: (_e: any, args: OnEventArgs) => {
        console.log(args);
        reactGrid.gridService.highlightRow(args.row, 1500);
        reactGrid.gridService.setSelectedRow(args.row);
      },
    },
    {
      id: 'delete',
      field: 'id',
      excludeFromColumnPicker: true,
      excludeFromGridMenu: true,
      excludeFromHeaderMenu: true,
      formatter: Formatters.icon,
      params: { iconCssClass: 'fa fa-trash pointer' },
      minWidth: 30,
      maxWidth: 30,
      // use onCellClick OR grid.onClick.subscribe which you can see down below
      /*
      onCellClick: (e: Event, args: OnEventArgs) => {
        console.log(args);
        this.alertWarning = `Deleting: ${args.dataContext.title}`;
      }
      */
    },
  ];
  // this._darkModeGrid1 = this.isBrowserDarkModeEnabled();
  const gridOptions1: GridOption = {
    gridHeight: 1400,
    gridWidth: 900,
    enableAutoResize: false,
    enableSorting: true,
    enablePagination: true,
    pagination: {
      pageSizes: [5, 10, 20, 25, 50],
      pageSize: 100
    },
  };
  // for (let i = 0; i < 1000; i++) {
  //   const randomYear = 2000 + Math.floor(Math.random() * 10);
  //   const randomMonth = Math.floor(Math.random() * 11);
  //   const randomDay = Math.floor((Math.random() * 29));
  //   const randomPercent = Math.round(Math.random() * 100);

  //   dataset1.push({
  //     id: i,
  //     title: 'Task ' + i,
  //     duration: Math.round(Math.random() * 100) + '',
  //     percentComplete: randomPercent,
  //     start: `${randomMonth}/${randomDay}/${randomYear}`,
  //     finish: `${randomMonth}/${randomDay}/${randomYear}`,
  //     effortDriven: (i % 5 === 0)
  //   });
  // }

  function reactGridReady(reactGridInstance: SlickgridReactInstance) {
    reactGrid = reactGridInstance;
  }
  
  let loadData = async () => {
    const response: any = await JobService.getJobs('','','');
    if(response.isSuccess)
    {
      response.data.forEach((item:any) => {
        dataset1.push(item);

      });
      
    }
  }

  loadData();

  return (
    <div>
      <ContentHeader title="SubMenu Page" />
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
              
              <SlickgridReact gridId="grid1"
            columnDefinitions={columns}
            gridOptions={gridOptions1!}
            dataset={dataset1}
            onReactGridCreated={e => { reactGridReady(e.detail); }}
            />
            </div>
            <div className="card-footer">Footer</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Jobs;
