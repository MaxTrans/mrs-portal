import ApiService from '@app/services/Api.service';

export const getNotifications = (jobId: string, userId: string) => {
    return new Promise(async (res, rej) => {
      ApiService.requests.get(`Notification/getnotifications?jobId=${jobId}&userId=${userId}`)
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

  export const saveNotification = (data: any) => {
    return new Promise(async (res, rej) => {
      ApiService.requests.post('Notification/savenotification', data)
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

  const NotificationService = {
    getNotifications,
    saveNotification
}

export default NotificationService;