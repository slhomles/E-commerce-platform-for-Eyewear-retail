import * as ROUTES from '@/constants/routes';
import React from 'react';
import { NavLink } from 'react-router-dom';

const SideNavigation = () => (
  <aside className="sidenavigation">
    <div className="sidenavigation-wrapper">
      <div className="sidenavigation-item">
        <NavLink
          activeClassName="sidenavigation-menu-active"
          className="sidenavigation-menu"
          to={ROUTES.ADMIN_PRODUCTS}
        >
          Products
        </NavLink>
      </div>
      <div className="sidenavigation-item">
        <NavLink
          activeClassName="sidenavigation-menu-active"
          className="sidenavigation-menu"
          to={ROUTES.ADMIN_ORDERS}
        >
          Orders
        </NavLink>
      </div>
      <div className="sidenavigation-item">
        <NavLink
          activeClassName="sidenavigation-menu-active"
          className="sidenavigation-menu"
          to={ROUTES.ADMIN_USERS}
        >
          Users
        </NavLink>
      </div>
    </div>
  </aside>
);

export default SideNavigation;
