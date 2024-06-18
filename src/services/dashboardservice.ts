import ApiService from '@app/services/Api.service';

export const getDashboardList = (userId: string, role: string) => {
    return new Promise(async (res, rej) => {
      ApiService.requests.get(`Dashboard/getDashboardList`, {
        params: {
            userId: userId,
            role: role
        }
      })
      .then((response) => {
            if(response.isSuccess)
            {
            return res(response);
            }
            else
            {
            return rej({ message: response.message });
            }
      })
    });
};

const DashboardService = 
{
    getDashboardList: getDashboardList
};

export default DashboardService;