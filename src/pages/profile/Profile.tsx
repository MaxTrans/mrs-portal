import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentHeader } from '@components';
import { Image } from '@profabric/react-components';
import styled from 'styled-components';

import ActivityTab from './ActivityTab';
import TimelineTab from './TimelineTab';
import SettingsTab from './SettingsTab';
import { Button } from '@app/styles/common';
import ChagePasswordTab from './ChangePasswordTab';
import { useLocation } from 'react-router-dom';

const StyledUserImage = styled(Image)`
  --pf-border: 3px solid #adb5bd;
  --pf-padding: 3px;
`;

const Profile = () => {
  const [activeTab, setActiveTab] = useState('PREFERENCES');
  const [userId, setUserId] = useState('');
  const [t] = useTranslation();
  const location = useLocation();
  const toggle = (tab: string) => {
    if (activeTab !== tab) setActiveTab(tab);
  };
  
  useEffect(() => {
    if(location.state){
        setActiveTab(location.state?.tab);
        setUserId(location.state?.userId)
    }
  },[]);

  return (
    <>
      <ContentHeader title="Profile" />
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-3">
              <div className="card card-primary card-outline">
                <div className="card-body box-profile">
                  <div className="text-center">
                    <StyledUserImage
                      width={100}
                      height={100}
                      rounded
                      src="/img/default-profile.png"
                      alt="User profile"
                    />
                  </div>
                  <h3 className="profile-username text-center">
                    Client
                  </h3>
                </div>
              </div>
            </div>
            <div className="col-md-9">
              <div className="card">
                <div className="card-header p-2">
                  <ul className="nav nav-pills">
                    <li className="nav-item">
                      <button
                        type="button"
                        className={`nav-link ${
                          activeTab === 'PREFERENCES' ? 'active' : ''
                        }`}
                        onClick={() => toggle('PREFERENCES')}
                      >
                        {t('main.label.preferences')}
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        type="button"
                        className={`nav-link ${
                          activeTab === 'CHANGEPASSWORD' ? 'active' : ''
                        }`}
                        onClick={() => toggle('CHANGEPASSWORD')}
                      >
                        {t('main.label.changepassword')}
                      </button>
                    </li>
                  </ul>
                </div>
                <div className="card-body">
                  <div className="tab-content">
                    {/* <ActivityTab isActive={activeTab === 'ACTIVITY'} />
                    <TimelineTab isActive={activeTab === 'TIMELINE'} /> */}
                    { activeTab === 'PREFERENCES' && <SettingsTab isActive={activeTab === 'PREFERENCES'} userId={userId}/> }
                    { activeTab === 'CHANGEPASSWORD' && <ChagePasswordTab isActive={activeTab == 'CHANGEPASSWORD'} userId={userId}/> }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Profile;
