import React, { useState } from 'react';
import styled from 'styled-components';
import { FaHome, FaSignOutAlt, FaBars } from 'react-icons/fa';

const NavWrapper = styled.nav`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 200; /* Assurez-vous que le menu est au-dessus du contenu */
`;

const MenuIcon = styled(FaBars)`
  font-size: 1.5rem;
  color: white;
  cursor: pointer;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 40px;
  right: 0;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  padding: 10px;
  display: ${(props) => (props.open ? 'block' : 'none')};
  width: 150px;
  z-index: 100;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const IconWrapper = styled.div`
  margin-right: 8px;
  font-size: 1.2rem;
`;

const Navigation = ({ onRouteChange, signedIn, route }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleRouteChange = (route) => {
    onRouteChange(route);
    setMenuOpen(false); // Ferme le menu après la sélection
  };

  if (signedIn && route !== "signin" && route !== "register") {
    return (
      <NavWrapper>
        <MenuIcon onClick={toggleMenu} />
        <DropdownMenu open={menuOpen}>
          {route !== "home" && (
            <MenuItem onClick={() => handleRouteChange("home")}>
              <IconWrapper>
                <FaHome />
              </IconWrapper>
              Home
            </MenuItem>
          )}
          <MenuItem onClick={() => handleRouteChange("signin")}>
            <IconWrapper>
              <FaSignOutAlt />
            </IconWrapper>
            Sign Out
          </MenuItem>
        </DropdownMenu>
      </NavWrapper>
    );
  }
  return null;
};

export default Navigation;
