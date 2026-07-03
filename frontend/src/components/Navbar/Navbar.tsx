// src/components/Navbar/Navbar.tsx
import React, { useState } from 'react';
import { NavbarContainer, NavLink } from './Navbar.styles';
import SettingsPanel from '../SettingsPanel/SettingsPanel';

const Navbar: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <NavbarContainer>
      <NavLink href="/">Home</NavLink>
      <NavLink href="/tasks">Tasks</NavLink>
      <NavLink
        as="button"
        onClick={() => setShowSettings(true)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
      >
        ⚙ Settings
      </NavLink>
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </NavbarContainer>
  );
};

export default Navbar;
