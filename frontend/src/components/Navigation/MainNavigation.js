import React, { Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import AuthContext from '../../context/auth-context';

import './MainNavigation.css';

const MainNavigation = props => (
  <AuthContext.Consumer>
    {(context) => {
      return (
        <header className="main-navigation">
          <div className="main-navigation-container">
            <div className="main-navigation__logo">
              <h1>Easy Event</h1>
            </div>
            <nav className="main-navigation__items">
              <ul>
                {!context.token && <li>
                  <NavLink to="/auth">Authenticate</NavLink>
                </li>}
                <li>
                  <NavLink to="/events">Events</NavLink>
                </li>
                {context.token && (
                  <Fragment>
                    <li>
                      <NavLink to="/bookings">Bookings</NavLink>
                    </li>
                    <li>
                      <button onClick={context.logout}>Logout</button>
                    </li>
                  </Fragment>
                )}
              </ul>
            </nav>
          </div>
        </header>
      );
    }}
  </AuthContext.Consumer>
);

export default MainNavigation;