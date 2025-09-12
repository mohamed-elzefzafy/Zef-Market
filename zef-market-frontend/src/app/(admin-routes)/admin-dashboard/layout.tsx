"use client";
import { ReactNode } from 'react';
import {  Category, Dashboard, Group, LocalLibrary, Note, Reviews, School} from '@mui/icons-material';
import { Box } from '@mui/material';
import DrawerComponent from './_components/DrawerComponent';




const InstructorDashboardLayout = ({ children }: { children: ReactNode }) => {


  const InstructorDashboardArrayList = [
  { text:"Dashboard", icon: <Dashboard />, path: "/admin-dashboard" },
  { text: "Products", icon: <School/>, path: "/admin-dashboard/products" },
  { text: "Categories", icon: <Category/>, path: "/admin-dashboard/categories" },
  { text: "Users", icon: <Group />, path: "/admin-dashboard/users" },
  { text: "Reviews", icon: <Reviews />, path: "/admin-dashboard/reviews" },
  { text: "Instructor request", icon: <Note />, path: "/admin-dashboard/instructor-request" },
];


  return (
    <Box sx={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
  <DrawerComponent drawerOptions={InstructorDashboardArrayList} />

  <Box
    component="main"
    sx={{
      flexGrow: 1,            // this makes sure the main content takes remaining space
      overflowX: 'hidden',    // optional: prevents horizontal scroll
      overflowY: 'auto',      // optional: allow vertical scrolling
      maxWidth: '100%',       // prevents growing too wide
    }}
  >
    {children}
  </Box>
</Box>

  );
};

export default InstructorDashboardLayout;