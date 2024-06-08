import { useSelector } from 'react-redux';
import store from '../../../store/store';
import User from '../../../store/Models/User';
import { Link } from 'react-router-dom';
import { MenuItem } from '@components';
import { Image } from '@profabric/react-components';
import styled from 'styled-components';
import { SidebarSearch } from '@app/components/sidebar-search/SidebarSearch';
import i18n from '@app/utils/i18n';
import IUser from '../../../store/Models/User';

export interface IMenuItem {
  name: string;
  icon?: string;
  path?: string;
  children?: Array<IMenuItem>;
}




export const ADMIN_MENU: IMenuItem[] = [
  {
    name: i18n.t('menusidebar.label.dashboard'),
    icon: 'fas fa-tachometer-alt nav-icon',
    path: '/',
  },
  {
    name: i18n.t('menusidebar.label.clientlist'),
    icon: 'fas fa-users nav-icon',
    path: '/client-list',
  },
  {
    name: i18n.t('menusidebar.label.adminjobs'),
    icon: 'fas fa-file-alt nav-icon',
    path: '/admin-jobs',
  }
];

export const CLIENT_MENU: IMenuItem[] = [
  {
    name: i18n.t('menusidebar.label.dashboard'),
    icon: 'fas fa-tachometer-alt nav-icon',
    path: '/',
  },
  {
    name: i18n.t('menusidebar.label.clientjobs'),
    icon: 'fas fa-file-alt nav-icon',
    path: '/client-jobs',
  },
  {
    name: i18n.t('menusidebar.label.upload'),
    icon: 'fas fa-upload nav-icon',
    path: '/intake',
  },
];
export const EMPLOYEE_MENU: IMenuItem[] = [];

// export const MENU: IMenuItem[] = [];



// export const MENU: IMenuItem[] = [
//   {
//     name: i18n.t('menusidebar.label.dashboard'),
//     icon: 'fas fa-tachometer-alt nav-icon',
//     path: '/',
//   },
//   // {
//   //   name: i18n.t('menusidebar.label.blank'),
//   //   icon: 'fas fa-wrench nav-icon',
//   //   path: '/blank',
//   // },
  
//   {
//     name: i18n.t('menusidebar.label.adminjobs'),
//     icon: 'fas fa-file-alt nav-icon',
//     path: '/admin-jobs',
//   },
//   {
//     name: i18n.t('menusidebar.label.intake'),
//     icon: 'fas fa-clipboard nav-icon',
//     path: '/intake',
//   },
  
//   // {
//   //   name: i18n.t('menusidebar.label.mainMenu'),
//   //   icon: 'far fa-caret-square-down nav-icon',
//   //   children: [
//   //     {
//   //       name: i18n.t('menusidebar.label.subMenu'),
//   //       icon: 'fas fa-hammer nav-icon',
//   //       path: '/sub-menu-1',
//   //     },

//   //     {
//   //       name: i18n.t('menusidebar.label.blank'),
//   //       icon: 'fas fa-cogs nav-icon',
//   //       path: '/sub-menu-2',
//   //     },
//   //   ],
//   // },
// ];

const StyledBrandImage = styled(Image)`
  float: left;
  line-height: 0.8;
  margin: -1px 8px 0 6px;
  opacity: 0.8;
  --pf-box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19),
    0 6px 6px rgba(0, 0, 0, 0.23) !important;
`;

const StyledUserImage = styled(Image)`
  --pf-box-shadow: 0 3px 6px #00000029, 0 3px 6px #0000003b !important;
`;

const MenuSidebar = () => {

  const user = useSelector((state: IUser) => store.getState().auth);
  const authentication = user.isAuthenticated; //useSelector((state: IUser) => store.getState().auth.isAuthenticated);
  const sidebarSkin = useSelector((state: any) => state.ui.sidebarSkin);
  const menuItemFlat = useSelector((state: any) => state.ui.menuItemFlat);
  const menuChildIndent = useSelector((state: any) => state.ui.menuChildIndent);


  function getMenuItems(){

    if(!user) return [];
    
    let menu: IMenuItem[];
    switch(user.roleName.toUpperCase()){
        case "ADMIN":
          menu = ADMIN_MENU;
          break;
        case "EMPLOYEE":
          menu = EMPLOYEE_MENU;
          break;
        case "CLIENT":
          menu = CLIENT_MENU;
          break;
          default: menu = [];
    };
  
    return menu;
  }

  let MENU:IMenuItem[] = getMenuItems();

  return (
    <aside className={`main-sidebar elevation-4 ${sidebarSkin}`}>
      <Link to="/" className="brand-link">
        <img
          src="/img/logo.png"
          alt="Max Trans"
          
          height={40}
          
        />
        <span className="brand-text font-weight-light pl-3"></span>
      </Link>
      <div className="sidebar">
        <nav className="mt-2" style={{ overflowY: 'hidden' }}>
          <ul
            className={`nav nav-pills nav-sidebar flex-column${
              menuItemFlat ? ' nav-flat' : ''
            }${menuChildIndent ? ' nav-child-indent' : ''}`}
            role="menu"
          >
            {MENU.map((menuItem: IMenuItem) => (
              <MenuItem
                key={menuItem.name + menuItem.path}
                menuItem={menuItem}
              />
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default MenuSidebar;
