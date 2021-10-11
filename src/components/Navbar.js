import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
const NavBar = () => {
  return (
    <div>
      <AppBar position="static">
        <Toolbar variant="dense">
          <Typography variant="h6" color="inherit">
            Study Browser
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
};
export default NavBar;
